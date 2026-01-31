import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '@common/enums/notification.enum';

@Entity('notifications')
// @Index(['userId', 'status'])
// @Index(['type', 'status'])
// @Index(['createdAt'])
export class Notification extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  @Index()
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  @Index()
  status: NotificationStatus;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'title_ar', type: 'varchar', length: 200 })
  titleAr: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'message_ar', type: 'text' })
  messageAr: string;

  @Column({ name: 'action_url', type: 'varchar', length: 500, nullable: true })
  actionUrl?: string;

  @Column({ name: 'action_label', type: 'varchar', length: 100, nullable: true })
  actionLabel?: string;

  @Column({ name: 'action_label_ar', type: 'varchar', length: 100, nullable: true })
  actionLabelAr?: string;

  // Reference to related entities
  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  @Index()
  bookingId?: string;

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId?: string;

  @Column({ name: 'dispute_id', type: 'uuid', nullable: true })
  disputeId?: string;

  @Column({ name: 'review_id', type: 'uuid', nullable: true })
  reviewId?: string;

  // Delivery tracking
  @Column({ name: 'sent_at', type: 'timestamp with time zone', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp with time zone', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'read_at', type: 'timestamp with time zone', nullable: true })
  readAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp with time zone', nullable: true })
  failedAt?: Date;

  // Failure information
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  // FCM specific
  @Column({ name: 'fcm_message_id', type: 'varchar', length: 255, nullable: true })
  fcmMessageId?: string;

  @Column({ name: 'fcm_response', type: 'jsonb', nullable: true })
  fcmResponse?: any;

  // SMS specific
  @Column({ name: 'sms_sid', type: 'varchar', length: 100, nullable: true })
  smsSid?: string;

  @Column({ name: 'sms_status', type: 'varchar', length: 50, nullable: true })
  smsStatus?: string;

  // Email specific
  @Column({ name: 'email_message_id', type: 'varchar', length: 255, nullable: true })
  emailMessageId?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    imageUrl?: string;
    iconUrl?: string;
    sound?: string;
    badge?: number;
    data?: any;
    [key: string]: any;
  };

  @Column({ name: 'expires_at', type: 'timestamp with time zone', nullable: true })
  expiresAt?: Date;

@Column({ type: 'boolean', default: false })
isRead: boolean;
}