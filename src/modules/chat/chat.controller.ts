import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@database/entities/user.entity';
import { ChatConversation } from '@database/entities/chat-conversation.entity';
import { ChatMessage } from '@database/entities/chat-message.entity';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiPaginatedResponse(ChatConversation)
  async getConversations(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.chatService.getConversations(user.id, paginationDto);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved' })
  async getConversation(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatService.getConversation(user.id, id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  @ApiPaginatedResponse(ChatMessage)
  async getMessages(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.chatService.getMessages(user.id, conversationId, paginationDto);
  }

  @Post('conversations/:id/messages')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.chatService.sendMessage(user.id, conversationId, sendMessageDto, file);
  }

  @Patch('messages/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) messageId: string,
  ) {
    return this.chatService.markAsRead(user.id, messageId);
  }

  @Post('conversations/:id/typing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send typing indicator' })
  @ApiResponse({ status: 200, description: 'Typing indicator sent' })
  async sendTypingIndicator(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body('isTyping') isTyping: boolean,
  ) {
    return this.chatService.sendTypingIndicator(user.id, conversationId, isTyping);
  }
}