import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Provider } from './provider.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';
import { ReviewRating, ReviewStatus } from '@common/enums/misc.enum';

@Entity('reviews')
// @Index(['providerId', 'status'])
// @Index(['serviceId', 'status'])
// @Index(['bookingId'], { unique: true })
export class Review extends BaseEntity {
  @ManyToOne(() => Booking, { eager: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  @Index()
  bookingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id', type: 'uuid' })
  @Index()
  customerId: string;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id', type: 'uuid' })
  @Index()
  providerId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'service_id', type: 'uuid' })
  @Index()
  serviceId: string;

  @Column({ type: 'integer' })
  @Index()
  rating: ReviewRating;

  @Column({ name: 'quality_rating', type: 'integer', nullable: true })
  qualityRating?: ReviewRating;

  @Column({ name: 'professionalism_rating', type: 'integer', nullable: true })
  professionalismRating?: ReviewRating;

  @Column({ name: 'punctuality_rating', type: 'integer', nullable: true })
  punctualityRating?: ReviewRating;

  @Column({ name: 'value_rating', type: 'integer', nullable: true })
  valueRating?: ReviewRating;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'jsonb', default: [] })
  images?: string[];

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  @Index()
  status: ReviewStatus;

  // Provider Response
  @Column({ name: 'provider_response', type: 'text', nullable: true })
  providerResponse?: string;

  @Column({ name: 'provider_responded_at', type: 'timestamp with time zone', nullable: true })
  providerRespondedAt?: Date;

  // Moderation
  @Column({ name: 'moderated_by', type: 'uuid', nullable: true })
  moderatedBy?: string;

  @Column({ name: 'moderated_at', type: 'timestamp with time zone', nullable: true })
  moderatedAt?: Date;

  @Column({ name: 'moderation_notes', type: 'text', nullable: true })
  moderationNotes?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  // Helpfulness
  @Column({ name: 'helpful_count', type: 'integer', default: 0 })
  helpfulCount: number;

  @Column({ name: 'not_helpful_count', type: 'integer', default: 0 })
  notHelpfulCount: number;

  @Column({ name: 'is_verified_booking', type: 'boolean', default: true })
  isVerifiedBooking: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    tags?: string[];
    sentiment?: string;
    [key: string]: any;
  };

  @Column({ type: 'int' })
overallRating: number;

@Column({ type: 'timestamp', nullable: true })
providerResponseAt?: Date;
}