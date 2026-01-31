import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { ServiceCategory } from './service-category.entity';

@Entity('service_requests')
// @Index(['customerId', 'status'])
// @Index(['categoryId', 'status'])
export class ServiceRequest extends BaseEntity {
  @Column({ name: 'request_number', type: 'varchar', length: 20, unique: true })
  @Index()
  requestNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id', type: 'uuid' })
  @Index()
  customerId: string;

  @ManyToOne(() => ServiceCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: ServiceCategory;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId?: string;

  @Column({ name: 'service_title', type: 'varchar', length: 200 })
  serviceTitle: string;

  @Column({ name: 'service_description', type: 'text' })
  serviceDescription: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  @Index()
  status: string; // PENDING, REVIEWING, APPROVED, REJECTED, CONVERTED_TO_BOOKING

  @Column({ name: 'urgency_level', type: 'varchar', length: 20, default: 'NORMAL' })
  urgencyLevel: string; // LOW, NORMAL, HIGH, URGENT

  @Column({ name: 'preferred_date', type: 'date', nullable: true })
  preferredDate?: Date;

  @Column({ name: 'preferred_time', type: 'time', nullable: true })
  preferredTime?: string;

  @Column({ name: 'budget_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMin?: number;

  @Column({ name: 'budget_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMax?: number;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ name: 'service_location', type: 'jsonb', nullable: true })
  serviceLocation?: {
    address: string;
    city: string;
    district: string;
    latitude: number;
    longitude: number;
  };

  @Column({ name: 'assigned_to_admin', type: 'uuid', nullable: true })
  assignedToAdmin?: string;

  @Column({ name: 'assigned_at', type: 'timestamp with time zone', nullable: true })
  assignedAt?: Date;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamp with time zone', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'converted_to_booking_id', type: 'uuid', nullable: true })
  convertedToBookingId?: string;

  @Column({ name: 'converted_at', type: 'timestamp with time zone', nullable: true })
  convertedAt?: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    matchedProviders?: string[];
    notificationsSent?: number;
    viewCount?: number;
    [key: string]: any;
  };
}