import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Provider } from './provider.entity';
import { User } from './user.entity';

@Entity('provider_reviews')
// @Index(['providerId', 'createdAt'])
export class ProviderReview extends BaseEntity {
  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id', type: 'uuid' })
  @Index()
  providerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ name: 'reviewer_id', type: 'uuid' })
  @Index()
  reviewerId: string;

  @Column({ name: 'review_period_start', type: 'date' })
  reviewPeriodStart: Date;

  @Column({ name: 'review_period_end', type: 'date' })
  reviewPeriodEnd: Date;

  @Column({ name: 'overall_rating', type: 'decimal', precision: 3, scale: 2 })
  overallRating: number;

  @Column({ name: 'punctuality_score', type: 'decimal', precision: 3, scale: 2 })
  punctualityScore: number;

  @Column({ name: 'quality_score', type: 'decimal', precision: 3, scale: 2 })
  qualityScore: number;

  @Column({ name: 'professionalism_score', type: 'decimal', precision: 3, scale: 2 })
  professionalismScore: number;

  @Column({ name: 'customer_satisfaction_score', type: 'decimal', precision: 3, scale: 2 })
  customerSatisfactionScore: number;

  @Column({ name: 'total_bookings', type: 'integer' })
  totalBookings: number;

  @Column({ name: 'completed_bookings', type: 'integer' })
  completedBookings: number;

  @Column({ name: 'cancelled_bookings', type: 'integer' })
  cancelledBookings: number;

  @Column({ name: 'disputes_count', type: 'integer', default: 0 })
  disputesCount: number;

  @Column({ name: 'warnings_count', type: 'integer', default: 0 })
  warningsCount: number;

  @Column({ type: 'text', nullable: true })
  strengths?: string;

  @Column({ name: 'areas_for_improvement', type: 'text', nullable: true })
  areasForImprovement?: string;

  @Column({ type: 'text', nullable: true })
  recommendations?: string;

  @Column({ name: 'bonus_awarded', type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonusAwarded: number;

  @Column({ name: 'penalty_applied', type: 'decimal', precision: 10, scale: 2, default: 0 })
  penaltyApplied: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', type: 'timestamp with time zone', nullable: true })
  publishedAt?: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    topServices?: string[];
    customerFeedbackHighlights?: string[];
    [key: string]: any;
  };
}