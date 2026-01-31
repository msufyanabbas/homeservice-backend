import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Provider } from './provider.entity';
import { Service } from './service.entity';
import {
  BookingStatus,
  BookingPaymentStatus,
  BookingPriority,
  ScheduleType,
} from '@common/enums/booking.enum';
import { Payment } from './payment.entity';

@Entity('bookings')
// @Index(['customerId', 'status'])
// @Index(['providerId', 'status'])
// @Index(['scheduledAt'])
export class Booking extends BaseEntity {
  @Column({ name: 'booking_number', type: 'varchar', length: 20, unique: true })
  @Index()
  bookingNumber: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id', type: 'uuid' })
  @Index()
  customerId: string;

  @ManyToOne(() => Provider, { eager: true, nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider?: Provider;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  @Index()
  providerId?: string;

  @ManyToOne(() => Service, { eager: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'service_id', type: 'uuid' })
  @Index()
  serviceId: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  @Index()
  status: BookingStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: BookingPaymentStatus,
    default: BookingPaymentStatus.PENDING,
  })
  @Index()
  paymentStatus: BookingPaymentStatus;

  @Column({ type: 'enum', enum: BookingPriority, default: BookingPriority.NORMAL })
  priority: BookingPriority;

  @Column({ type: 'enum', enum: ScheduleType, default: ScheduleType.SCHEDULED })
  scheduleType: ScheduleType;

  // Scheduling
  @Column({ name: 'scheduled_at', type: 'timestamp with time zone' })
  @Index()
  scheduledAt: Date;


  @Column({ name: 'started_at', type: 'timestamp with time zone', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp with time zone', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'estimated_duration_minutes', type: 'integer' })
  estimatedDurationMinutes: number;

  @Column({ name: 'actual_duration_minutes', type: 'integer', nullable: true })
  actualDurationMinutes?: number;

  // Location
  @Column({ name: 'service_address', type: 'jsonb' })
  serviceAddress: {
    street: string;
    building?: string;
    floor?: string;
    apartment?: string;
    city: string;
    district: string;
    postalCode?: string;
    additionalInfo?: string;
    latitude: number;
    longitude: number;
  };

  // Pricing
  @Column({ name: 'service_price', type: 'decimal', precision: 10, scale: 2 })
  servicePrice: number;

  @Column({ name: 'additional_charges', type: 'decimal', precision: 10, scale: 2, default: 0 })
  additionalCharges: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'promo_code_id', type: 'uuid', nullable: true })
  promoCodeId?: string;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'platform_commission', type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformCommission: number;

  @Column({ name: 'provider_earnings', type: 'decimal', precision: 10, scale: 2, default: 0 })
  providerEarnings: number;

  // Service Details
  @Column({ name: 'selected_options', type: 'jsonb', default: [] })
  selectedOptions: {
    name: string;
    price: number;
  }[];

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions?: string;

  // Customer Contact
  @Column({ name: 'customer_name', type: 'varchar', length: 200 })
  customerName: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 20 })
  customerPhone: string;

  // Provider Assignment
  @Column({ name: 'provider_assigned_at', type: 'timestamp with time zone', nullable: true })
  providerAssignedAt?: Date;

  @Column({ name: 'provider_accepted_at', type: 'timestamp with time zone', nullable: true })
  providerAcceptedAt?: Date;

  @Column({ name: 'provider_rejected_at', type: 'timestamp with time zone', nullable: true })
  providerRejectedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  // Cancellation
  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy?: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'cancellation_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  cancellationFee: number;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;

  // Rating & Review
  @Column({ name: 'is_reviewed', type: 'boolean', default: false })
  isReviewed: boolean;

  @Column({ name: 'customer_rating', type: 'integer', nullable: true })
  customerRating?: number;

  // Tracking
  @Column({ name: 'provider_en_route_at', type: 'timestamp with time zone', nullable: true })
  providerEnRouteAt?: Date;

  @Column({ name: 'provider_arrived_at', type: 'timestamp with time zone', nullable: true })
  providerArrivedAt?: Date;

  @Column({ name: 'estimated_arrival', type: 'timestamp with time zone', nullable: true })
  estimatedArrival?: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    photos?: string[];
    notes?: string[];
    completionNotes?: string;
    signatureUrl?: string;
    [key: string]: any;
  };

  @Column({ type: 'varchar', nullable: true })
refundStatus?: string;

@Column({ type: 'timestamp', nullable: true })
confirmedAt?: Date;

@Column({ type: 'text', nullable: true })
completionNotes?: string;

@Column({ type: 'timestamp', nullable: true })
arrivedAt?: Date;

// Add relation to payment
@OneToOne(() => Payment, payment => payment.booking, { nullable: true })
@JoinColumn()
payment?: Payment;

@Column({ type: 'uuid', nullable: true })
paymentId?: string;

  // Relations
  // @OneToMany(() => BookingTimeline, (timeline) => timeline.booking)
  // timeline: BookingTimeline[];

  // @OneToOne(() => Payment, (payment) => payment.booking)
  // payment: Payment;

  // @OneToOne(() => Review, (review) => review.booking)
  // review: Review;

  // @OneToOne(() => Dispute, (dispute) => dispute.booking)
  // dispute: Dispute;
}