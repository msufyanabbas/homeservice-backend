import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Booking } from './booking.entity';
import { User } from './user.entity';
import { BookingStatus } from '@common/enums/booking.enum';

@Entity('booking_timeline')
// @Index(['bookingId', 'createdAt'])
export class BookingTimeline extends BaseEntity {
  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id', type: 'uuid' })
  @Index()
  bookingId: string;

  @Column({ type: 'enum', enum: BookingStatus })
  @Index()
  status: BookingStatus;

  @Column({ name: 'previous_status', type: 'enum', enum: BookingStatus, nullable: true })
  previousStatus?: BookingStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by_user_id' })
  changedByUser?: User;

  @Column({ name: 'changed_by_user_id', type: 'uuid', nullable: true })
  changedByUserId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'notes_ar', type: 'text', nullable: true })
  notesAr?: string;

  @Column({ name: 'is_automatic', type: 'boolean', default: false })
  isAutomatic: boolean;

  @Column({ name: 'triggered_by', type: 'varchar', length: 100, nullable: true })
  triggeredBy?: string; // 'system', 'customer', 'provider', 'admin'

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    reason?: string;
    additionalInfo?: any;
    [key: string]: any;
  };

  @Column({ name: 'notification_sent', type: 'boolean', default: false })
  notificationSent: boolean;

  @Column({ name: 'notification_sent_at', type: 'timestamp with time zone', nullable: true })
  notificationSentAt?: Date;
}