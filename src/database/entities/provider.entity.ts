import { Entity, Column, Index, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import {
  ProviderStatus,
  ProviderVerificationStatus,
  ProviderAvailability,
  ProviderRating,
} from '@common/enums/provider.enum';

@Entity('providers')
export class Provider extends BaseEntity {
  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  @Index()
  userId: string;

  @Column({ name: 'business_name', type: 'varchar', length: 200, nullable: true })
  businessName?: string;

  @Column({ name: 'business_name_ar', type: 'varchar', length: 200, nullable: true })
  businessNameAr?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'bio_ar', type: 'text', nullable: true })
  bioAr?: string;

  @Column({ type: 'enum', enum: ProviderStatus, default: ProviderStatus.PENDING_APPROVAL })
  @Index()
  status: ProviderStatus;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: ProviderVerificationStatus,
    default: ProviderVerificationStatus.PENDING,
  })
  @Index()
  verificationStatus: ProviderVerificationStatus;

  @Column({
    type: 'enum',
    enum: ProviderAvailability,
    default: ProviderAvailability.OFFLINE,
  })
  @Index()
  availability: ProviderAvailability;

  // Iqama/ID Information
  @Column({ name: 'iqama_number', type: 'varchar', length: 20, unique: true })
  @Index()
  iqamaNumber: string;

  @Column({ name: 'iqama_expiry', type: 'date', nullable: true })
  iqamaExpiry?: Date;

  @Column({ name: 'commercial_register', type: 'varchar', length: 50, nullable: true })
  commercialRegister?: string;

  @Column({ name: 'vat_number', type: 'varchar', length: 15, nullable: true })
  vatNumber?: string;

  // Service Categories (JSONB for flexibility)
  @Column({ name: 'service_categories', type: 'jsonb', default: [] })
  serviceCategories: string[];

  // Service Areas (cities/regions)
  @Column({ name: 'service_areas', type: 'jsonb', default: [] })
  serviceAreas: string[];

  // Working Hours
  @Column({ name: 'working_hours', type: 'jsonb', nullable: true })
  workingHours?: {
    [key: string]: { start: string; end: string; active: boolean };
  };

  // Ratings & Performance
  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'total_reviews', type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_bookings', type: 'integer', default: 0 })
  totalBookings: number;

  @Column({ name: 'completed_bookings', type: 'integer', default: 0 })
  completedBookings: number;

  @Column({ name: 'cancelled_bookings', type: 'integer', default: 0 })
  cancelledBookings: number;

  @Column({ name: 'acceptance_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  acceptanceRate: number;

  @Column({ name: 'completion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number;

  @Column({ name: 'response_time_minutes', type: 'integer', default: 0 })
  responseTimeMinutes: number;

  // Financial
  @Column({ name: 'total_earnings', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ name: 'pending_earnings', type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingEarnings: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 15 })
  commissionRate: number;

  // Bank Details
  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
  bankName?: string;

  @Column({ name: 'iban', type: 'varchar', length: 34, nullable: true })
  iban?: string;

  @Column({ name: 'account_holder_name', type: 'varchar', length: 200, nullable: true })
  accountHolderName?: string;

  // Warnings & Penalties
  @Column({ name: 'warning_count', type: 'integer', default: 0 })
  warningCount: number;

  @Column({ name: 'penalty_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  penaltyAmount: number;

  @Column({ name: 'suspension_count', type: 'integer', default: 0 })
  suspensionCount: number;

  @Column({ name: 'last_suspension_date', type: 'timestamp with time zone', nullable: true })
  lastSuspensionDate?: Date;

  // Subscription
  @Column({ name: 'subscription_active', type: 'boolean', default: false })
  subscriptionActive: boolean;

  @Column({ name: 'subscription_expires_at', type: 'timestamp with time zone', nullable: true })
  subscriptionExpiresAt?: Date;

  @Column({ name: 'trial_ends_at', type: 'timestamp with time zone', nullable: true })
  trialEndsAt?: Date;

  // Current Location (for real-time tracking)
  @Column({ name: 'current_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  currentLatitude?: number;

  @Column({ name: 'current_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  currentLongitude?: number;

  @Column({ name: 'location_updated_at', type: 'timestamp with time zone', nullable: true })
  locationUpdatedAt?: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    languages?: string[];
    experience_years?: number;
    certifications?: string[];
    specializations?: string[];
    [key: string]: any;
  };

  @Column({ name: 'approved_at', type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  // Relations will be added
  // @OneToMany(() => ProviderDocument, (document) => document.provider)
  // documents: ProviderDocument[];

  // @OneToMany(() => Service, (service) => service.provider)
  // services: Service[];

  // @OneToMany(() => Booking, (booking) => booking.provider)
  // bookings: Booking[];

  // @OneToMany(() => ProviderSubscription, (subscription) => subscription.provider)
  // subscriptions: ProviderSubscription[];
}