import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Booking } from './booking.entity';
import { Payment } from './payment.entity';
import { User } from './user.entity';
import { RefundStatus, RefundReason, Currency } from '@common/enums/payment.enum';

@Entity('refunds')
// @Index(['bookingId'])
// @Index(['paymentId'])
// @Index(['status'])
export class Refund extends BaseEntity {
  @Column({ name: 'refund_reference', type: 'varchar', length: 100, unique: true })
  @Index()
  refundReference: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id', type: 'uuid' })
  @Index()
  bookingId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ name: 'payment_id', type: 'uuid' })
  @Index()
  paymentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.PENDING })
  @Index()
  status: RefundStatus;

  @Column({ type: 'enum', enum: RefundReason })
  reason: RefundReason;

  @Column({ type: 'enum', enum: Currency, default: Currency.SAR })
  currency: Currency;

  @Column({ name: 'original_amount', type: 'decimal', precision: 10, scale: 2 })
  originalAmount: number;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2 })
  refundAmount: number;

  @Column({ name: 'refund_percentage', type: 'decimal', precision: 5, scale: 2, default: 100 })
  refundPercentage: number;

  @Column({ name: 'processing_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  processingFee: number;

  @Column({ name: 'net_refund_amount', type: 'decimal', precision: 10, scale: 2 })
  netRefundAmount: number;

  @Column({ name: 'refund_method', type: 'varchar', length: 50 })
  refundMethod: string; // ORIGINAL_PAYMENT, WALLET, BANK_TRANSFER

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy: string; // User ID who requested

  @Column({ name: 'requested_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejected_by', type: 'uuid', nullable: true })
  rejectedBy?: string;

  @Column({ name: 'rejected_at', type: 'timestamp with time zone', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'processed_at', type: 'timestamp with time zone', nullable: true })
  processedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp with time zone', nullable: true })
  failedAt?: Date;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  // Gateway information
  @Column({ name: 'gateway_refund_id', type: 'varchar', length: 255, nullable: true })
  gatewayRefundId?: string;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse?: any;

  // Bank details for bank transfer refunds
  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
  bankName?: string;

  @Column({ type: 'varchar', length: 34, nullable: true })
  iban?: string;

  @Column({ name: 'account_holder_name', type: 'varchar', length: 200, nullable: true })
  accountHolderName?: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes?: string;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ name: 'is_partial', type: 'boolean', default: false })
  isPartial: boolean;

  @Column({ name: 'is_automatic', type: 'boolean', default: false })
  isAutomatic: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    cancellationPolicy?: string;
    hoursCancelled?: number;
    evidence?: string[];
    [key: string]: any;
  };


@Column({ type: 'decimal', precision: 10, scale: 2 })
amount: number;
}