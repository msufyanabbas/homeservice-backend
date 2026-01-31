import { Entity, Column, Index, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Booking } from './booking.entity';
import { PaymentMethod, PaymentStatus, Currency } from '@common/enums/payment.enum';

@Entity('payments')
// @Index(['userId', 'status'])
// @Index(['bookingId'])
export class Payment extends BaseEntity {
  @Column({ name: 'payment_reference', type: 'varchar', length: 100, unique: true })
  @Index()
  paymentReference: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking?: Booking;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId?: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  @Index()
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Index()
  status: PaymentStatus;

  @Column({ type: 'enum', enum: Currency, default: Currency.SAR })
  currency: Currency;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 })
  netAmount: number;

  // Gateway Information
  @Column({ name: 'gateway_transaction_id', type: 'varchar', length: 255, nullable: true })
  @Index()
  gatewayTransactionId?: string;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse?: any;

  // Moyasar Specific
  @Column({ name: 'moyasar_payment_id', type: 'varchar', length: 100, nullable: true })
  moyasarPaymentId?: string;

  @Column({ name: 'moyasar_source', type: 'jsonb', nullable: true })
  moyasarSource?: {
    type: string;
    company?: string;
    name?: string;
    number?: string;
    message?: string;
  };

  // STC Pay Specific
  @Column({ name: 'stc_pay_reference', type: 'varchar', length: 100, nullable: true })
  stcPayReference?: string;

  // Card Information (masked)
  @Column({ name: 'card_brand', type: 'varchar', length: 50, nullable: true })
  cardBrand?: string;

  @Column({ name: 'card_last_four', type: 'varchar', length: 4, nullable: true })
  cardLastFour?: string;

  @Column({ name: 'card_exp_month', type: 'varchar', length: 2, nullable: true })
  cardExpMonth?: string;

  @Column({ name: 'card_exp_year', type: 'varchar', length: 4, nullable: true })
  cardExpYear?: string;

  // Timestamps
  @Column({ name: 'authorized_at', type: 'timestamp with time zone', nullable: true })
  authorizedAt?: Date;

  @Column({ name: 'captured_at', type: 'timestamp with time zone', nullable: true })
  capturedAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp with time zone', nullable: true })
  failedAt?: Date;

  @Column({ name: 'refunded_at', type: 'timestamp with time zone', nullable: true })
  refundedAt?: Date;

  // Failure Information
  @Column({ name: 'failure_code', type: 'varchar', length: 50, nullable: true })
  failureCode?: string;

  @Column({ name: 'failure_message', type: 'text', nullable: true })
  failureMessage?: string;

  // Refund Information
  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;

  @Column({ name: 'is_refundable', type: 'boolean', default: true })
  isRefundable: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: any;
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Webhook verification
  @Column({ name: 'webhook_received', type: 'boolean', default: false })
  webhookReceived: boolean;

  @Column({ name: 'webhook_verified', type: 'boolean', default: false })
  webhookVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
gateway?: string;


@Column({ type: 'varchar', nullable: true })
gatewayPaymentId?: string;

@Column({ type: 'timestamp', nullable: true })
paidAt?: Date;

@Column({ type: 'varchar', nullable: true })
paymentType?: string;

}