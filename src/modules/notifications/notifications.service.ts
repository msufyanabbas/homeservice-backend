import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@database/entities/notification.entity';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findAll(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(notifications, total, page, limit);
  }

  async findOne(userId: string, id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);

    return { message: 'Marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return { message: 'All marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return { count };
  }

  async remove(userId: string, id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.softRemove(notification);

    return { message: 'Notification deleted' };
  }

  async clearAll(userId: string) {
    await this.notificationRepository.softDelete({ userId });

    return { message: 'All notifications cleared' };
  }

  async sendNotification(userId: string, type: string, title: string, body: string, data?: any) {
    const notification = this.notificationRepository.create({
  userId,  
  type: type as any,  
  channel: 'IN_APP' as any,  
  priority: 'MEDIUM' as any,    
  status: 'PENDING' as any,  
  title,
  titleAr: title,
  message: body,
  messageAr: body,
  metadata: data,
});

    await this.notificationRepository.save(notification);

    // TODO: Send FCM push notification
    // TODO: Send SMS if critical
    // TODO: Send email if applicable

    return notification;
  }
}