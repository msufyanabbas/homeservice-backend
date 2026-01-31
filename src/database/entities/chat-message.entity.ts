import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ChatConversation } from './chat-conversation.entity';
import { User } from './user.entity';

@Entity('chat_messages')
// @Index(['conversationId', 'createdAt'])
// @Index(['senderId', 'createdAt'])
export class ChatMessage extends BaseEntity {
  @ManyToOne(() => ChatConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ChatConversation;

  @Column({ name: 'conversation_id', type: 'uuid' })
  @Index()
  conversationId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id', type: 'uuid' })
  @Index()
  senderId: string;

  @Column({ name: 'message_type', type: 'varchar', length: 20, default: 'TEXT' })
  messageType: string; // TEXT, IMAGE, FILE, LOCATION, SYSTEM

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'message_ar', type: 'text', nullable: true })
  messageAr?: string;

  // For media messages
  @Column({ name: 'media_url', type: 'varchar', length: 500, nullable: true })
  mediaUrl?: string;

  @Column({ name: 'media_type', type: 'varchar', length: 50, nullable: true })
  mediaType?: string; // image/jpeg, application/pdf, etc.

  @Column({ name: 'media_size', type: 'integer', nullable: true })
  mediaSize?: number; // In bytes

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string;

  // For location messages
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ name: 'location_name', type: 'varchar', length: 200, nullable: true })
  locationName?: string;

  // Reply/Quote
  @Column({ name: 'reply_to_message_id', type: 'uuid', nullable: true })
  replyToMessageId?: string;

  @Column({ name: 'quoted_message', type: 'text', nullable: true })
  quotedMessage?: string;

  // Message status
  @Column({ name: 'is_read', type: 'boolean', default: false })
  @Index()
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp with time zone', nullable: true })
  readAt?: Date;

  @Column({ name: 'is_delivered', type: 'boolean', default: false })
  isDelivered: boolean;

  @Column({ name: 'delivered_at', type: 'timestamp with time zone', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'is_edited', type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ name: 'edited_at', type: 'timestamp with time zone', nullable: true })
  editedAt?: Date;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'deleted_for_everyone', type: 'boolean', default: false })
  deletedForEveryone: boolean;

  // System message
  @Column({ name: 'is_system_message', type: 'boolean', default: false })
  isSystemMessage: boolean;

  @Column({ name: 'system_message_type', type: 'varchar', length: 50, nullable: true })
  systemMessageType?: string; // BOOKING_CREATED, PAYMENT_COMPLETED, etc.

  // Flagging/Reporting
  @Column({ name: 'is_flagged', type: 'boolean', default: false })
  isFlagged: boolean;

  @Column({ name: 'flagged_reason', type: 'text', nullable: true })
  flaggedReason?: string;

  @Column({ name: 'flagged_by', type: 'uuid', nullable: true })
  flaggedBy?: string;

  @Column({ name: 'flagged_at', type: 'timestamp with time zone', nullable: true })
  flaggedAt?: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    mentions?: string[]; // User IDs mentioned in message
    hashtags?: string[];
    reactions?: {
      userId: string;
      emoji: string;
      timestamp: string;
    }[];
    deviceInfo?: any;
    [key: string]: any;
  };
}