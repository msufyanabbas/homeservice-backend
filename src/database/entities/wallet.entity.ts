import { Entity, Column, Index, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('wallets')
export class Wallet extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  @Index()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ name: 'pending_balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingBalance: number;

  @Column({ name: 'total_credited', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCredited: number;

  @Column({ name: 'total_debited', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDebited: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ name: 'locked_reason', type: 'text', nullable: true })
  lockedReason?: string;

  @Column({ name: 'locked_at', type: 'timestamp with time zone', nullable: true })
  lockedAt?: Date;

  @Column({ name: 'last_transaction_at', type: 'timestamp with time zone', nullable: true })
  lastTransactionAt?: Date;

  // Relations
  // @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  // transactions: Transaction[];
}