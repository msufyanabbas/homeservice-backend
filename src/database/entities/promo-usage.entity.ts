import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PromoCode } from './promo-code.entity';
import { User } from './user.entity';
import { Booking } from './booking.entity';

@Entity('promo_usages')
// @Index(['promoCodeId', 'userId'])
// @Index(['bookingId'], { unique: true })
export class PromoUsage extends BaseEntity {
  @ManyToOne(() => PromoCode)
  @JoinColumn({ name: 'promo_code_id' })
  promoCode: PromoCode;

  @Column({ name: 'promo_code_id', type: 'uuid' })
  @Index()
  promoCodeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  bookingId: string;

  @Column({ name: 'promo_code_text', type: 'varchar', length: 50 })
  promoCodeText: string; // Store the actual code used

  @Column({ name: 'discount_type', type: 'varchar', length: 50 })
  discountType: string; // PERCENTAGE, FIXED_AMOUNT

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ name: 'original_amount', type: 'decimal', precision: 10, scale: 2 })
  originalAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 })
  discountAmount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ name: 'revoked_at', type: 'timestamp with time zone', nullable: true })
  revokedAt?: Date;

  @Column({ name: 'revoked_reason', type: 'text', nullable: true })
  revokedReason?: string;

  @Column({ name: 'revoked_by', type: 'uuid', nullable: true })
  revokedBy?: string;

  // Referral tracking
  @Column({ name: 'referred_by', type: 'uuid', nullable: true })
  referredBy?: string;

  @Column({ name: 'referrer_reward', type: 'decimal', precision: 10, scale: 2, default: 0 })
  referrerReward: number;

  @Column({ name: 'referrer_reward_paid', type: 'boolean', default: false })
  referrerRewardPaid: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    campaignName?: string;
    source?: string;
    deviceInfo?: any;
    [key: string]: any;
  };
}