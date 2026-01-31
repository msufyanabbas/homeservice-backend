import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Booking } from './booking.entity';
import { User } from './user.entity';

@Entity('chat_conversations')
// @Index(['bookingId'])
// @Index(['customerId', 'providerId'])
export class ChatConversation extends BaseEntity {
  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id', type: 'uuid' })
  @Index()
  bookingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id', type: 'uuid' })
  @Index()
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column({ name: 'provider_id', type: 'uuid' })
  @Index()
  providerId: string;

  @Column({ name: 'last_message', type: 'text', nullable: true })
  lastMessage?: string;

  @Column({ name: 'last_message_at', type: 'timestamp with time zone', nullable: true })
  @Index()
  lastMessageAt?: Date;

  @Column({ name: 'last_message_by', type: 'uuid', nullable: true })
  lastMessageBy?: string;

  @Column({ name: 'customer_unread_count', type: 'integer', default: 0 })
  customerUnreadCount: number;

  @Column({ name: 'provider_unread_count', type: 'integer', default: 0 })
  providerUnreadCount: number;

  @Column({ name: 'total_messages', type: 'integer', default: 0 })
  totalMessages: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ name: 'archived_by', type: 'uuid', nullable: true })
  archivedBy?: string;

  @Column({ name: 'archived_at', type: 'timestamp with time zone', nullable: true })
  archivedAt?: Date;

  @Column({ name: 'customer_typing', type: 'boolean', default: false })
  customerTyping: boolean;

  @Column({ name: 'provider_typing', type: 'boolean', default: false })
  providerTyping: boolean;

  @Column({ name: 'customer_last_seen', type: 'timestamp with time zone', nullable: true })
  customerLastSeen?: Date;

  @Column({ name: 'provider_last_seen', type: 'timestamp with time zone', nullable: true })
  providerLastSeen?: Date;

  @Column({ name: 'customer_blocked', type: 'boolean', default: false })
  customerBlocked: boolean;

  @Column({ name: 'provider_blocked', type: 'boolean', default: false })
  providerBlocked: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    tags?: string[];
    flags?: string[];
    [key: string]: any;
  };

  // Relations
  // @OneToMany(() => ChatMessage, (message) => message.conversation)
  // messages: ChatMessage[];
}