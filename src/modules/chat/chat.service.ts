import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatConversation } from '@database/entities/chat-conversation.entity';
import { ChatMessage } from '@database/entities/chat-message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatConversation)
    private readonly conversationRepository: Repository<ChatConversation>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
  ) {}

  async getConversations(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [conversations, total] = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.customerId = :userId OR conversation.providerId = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(conversations, total, page, limit);
  }

  async getConversation(userId: string, id: string) {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.id = :id', { id })
      .andWhere('(conversation.customerId = :userId OR conversation.providerId = :userId)', { userId })
      .getOne();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async getMessages(userId: string, conversationId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 50 } = paginationDto;
    const skip = (page - 1) * limit;

    const conversation = await this.getConversation(userId, conversationId);

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(messages, total, page, limit);
  }

  async sendMessage(userId: string, conversationId: string, sendMessageDto: SendMessageDto, file?: Express.Multer.File) {
    const conversation = await this.getConversation(userId, conversationId);

    const messageData: any = {
      conversationId,
      senderId: userId,
      message: sendMessageDto.message,
      messageType: sendMessageDto.messageType || 'TEXT',
    };

    if (file) {
      messageData.mediaUrl = `/uploads/${file.filename}`;
      messageData.mediaType = file.mimetype;
      messageData.mediaSize = file.size;
    }

    const message = this.messageRepository.create(messageData);
    await this.messageRepository.save(message);

    // Update conversation
    conversation.lastMessage = sendMessageDto.message;
    conversation.lastMessageAt = new Date();
    conversation.lastMessageBy = userId;
    conversation.totalMessages += 1;

    if (userId === conversation.customerId) {
      conversation.providerUnreadCount += 1;
    } else {
      conversation.customerUnreadCount += 1;
    }

    await this.conversationRepository.save(conversation);

    // TODO: Send WebSocket event
    // TODO: Send push notification

    return message;
  }

  async markAsRead(userId: string, messageId: string) {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isRead = true;
    message.readAt = new Date();
    await this.messageRepository.save(message);

    return { message: 'Marked as read' };
  }

  async sendTypingIndicator(userId: string, conversationId: string, isTyping: boolean) {
    const conversation = await this.getConversation(userId, conversationId);

    if (userId === conversation.customerId) {
      conversation.customerTyping = isTyping;
    } else {
      conversation.providerTyping = isTyping;
    }

    await this.conversationRepository.save(conversation);

    // TODO: Send WebSocket event

    return { message: 'Typing indicator sent' };
  }
}