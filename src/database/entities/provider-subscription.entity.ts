import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Provider } from './provider.entity';
import { Payment } from './payment.entity';
import { ProviderSubscriptionStatus } from '@common/enums/provider.enum';
import { Currency } from '@common/enums/payment.enum';

@Entity('provider_subscriptions')
// @Index(['providerId', 'status'])
// @Index(['startDate', 'endDate'])
export class ProviderSubscription extends BaseEntity {
  @Column({ name: 'subscription_number', type: 'varchar', length: 50, unique: true })
  @Index()
  subscriptionNumber: string;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id', type: 'uuid' })
  @Index()
  providerId: string;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId?: string;

  @Column({
    type: 'enum',
    enum: ProviderSubscriptionStatus,
    default: ProviderSubscriptionStatus.TRIAL,
  })
  @Index()
  status: ProviderSubscriptionStatus;

  @Column({ name: 'subscription_type', type: 'varchar', length: 50, default: 'BASIC' })
  subscriptionType: string; // BASIC, PREMIUM, ENTERPRISE

  @Column({ type: 'enum', enum: Currency, default: Currency.SAR })
  currency: Currency;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'is_trial', type: 'boolean', default: false })
  isTrial: boolean;

  @Column({ name: 'trial_days', type: 'integer', default: 7 })
  trialDays: number;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  @Index()
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  @Index()
  endDate: Date;

  @Column({ name: 'billing_cycle', type: 'varchar', length: 20, default: 'MONTHLY' })
  billingCycle: string; // MONTHLY, QUARTERLY, YEARLY

  @Column({ name: 'auto_renew', type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ name: 'renewal_date', type: 'timestamp with time zone', nullable: true })
  renewalDate?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp with time zone', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy?: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'next_billing_date', type: 'timestamp with time zone', nullable: true })
  nextBillingDate?: Date;

  @Column({ name: 'last_billing_date', type: 'timestamp with time zone', nullable: true })
  lastBillingDate?: Date;

  // Features included in subscription
  @Column({ name: 'max_active_bookings', type: 'integer', default: 50 })
  maxActiveBookings: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 15 })
  commissionRate: number;

  @Column({ name: 'featured_listing', type: 'boolean', default: false })
  featuredListing: boolean;

  @Column({ name: 'priority_support', type: 'boolean', default: false })
  prioritySupport: boolean;

  @Column({ name: 'analytics_access', type: 'boolean', default: false })
  analyticsAccess: boolean;

  // Notifications
  @Column({ name: 'expiry_notification_sent', type: 'boolean', default: false })
  expiryNotificationSent: boolean;

  @Column({ name: 'renewal_notification_sent', type: 'boolean', default: false })
  renewalNotificationSent: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    promocode?: string;
    discount?: number;
    referralCode?: string;
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  notes?: string;
}