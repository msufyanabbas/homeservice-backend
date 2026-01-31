import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';
import { TransactionType, Currency } from '@common/enums/payment.enum';

@Entity('transactions')
// @Index(['userId', 'createdAt'])
// @Index(['walletId', 'createdAt'])
// @Index(['type', 'createdAt'])
export class Transaction extends BaseEntity {
  @Column({ name: 'transaction_number', type: 'varchar', length: 50, unique: true })
  @Index()
  transactionNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ name: 'wallet_id', type: 'uuid' })
  @Index()
  walletId: string;

  @Column({ type: 'enum', enum: TransactionType })
  @Index()
  type: TransactionType;

  @Column({ type: 'enum', enum: Currency, default: Currency.SAR })
  currency: Currency;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'balance_before', type: 'decimal', precision: 10, scale: 2 })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 10, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr?: string;

  // Reference to related entities
  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  @Index()
  bookingId?: string;

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  @Index()
  paymentId?: string;

  @Column({ name: 'refund_id', type: 'uuid', nullable: true })
  refundId?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    referenceId?: string;
    notes?: string;
    [key: string]: any;
  };
}