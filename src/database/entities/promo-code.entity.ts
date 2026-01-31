import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import {
  PromoCodeType,
  PromoCodeStatus,
  PromoCodeApplicability,
} from '@common/enums/misc.enum';

@Entity('promo_codes')
export class PromoCode extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string;

  @Column({ type: 'enum', enum: PromoCodeType })
  type: PromoCodeType;

  @Column({ type: 'enum', enum: PromoCodeStatus, default: PromoCodeStatus.ACTIVE })
  @Index()
  status: PromoCodeStatus;

  @Column({ type: 'enum', enum: PromoCodeApplicability })
  applicability: PromoCodeApplicability;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr?: string;

  // Discount Details
  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage?: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount?: number;

  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount?: number;

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minOrderAmount: number;

  // Usage Limits
  @Column({ name: 'max_uses', type: 'integer', nullable: true })
  maxUses?: number;

  @Column({ name: 'max_uses_per_user', type: 'integer', default: 1 })
  maxUsesPerUser: number;

  @Column({ name: 'current_uses', type: 'integer', default: 0 })
  currentUses: number;

  // Validity
  @Column({ name: 'valid_from', type: 'timestamp with time zone' })
  @Index()
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'timestamp with time zone' })
  @Index()
  validUntil: Date;

  // Applicable Services/Categories
  @Column({ name: 'applicable_service_categories', type: 'jsonb', nullable: true })
  applicableServiceCategories?: string[];

  @Column({ name: 'applicable_service_ids', type: 'jsonb', nullable: true })
  applicableServiceIds?: string[];

  // Specific Users (for targeted campaigns)
  @Column({ name: 'applicable_user_ids', type: 'jsonb', nullable: true })
  applicableUserIds?: string[];

  @Column({ name: 'applicable_user_emails', type: 'jsonb', nullable: true })
  applicableUserEmails?: string[];

  @Column({ name: 'applicable_user_phones', type: 'jsonb', nullable: true })
  applicableUserPhones?: string[];

  // Restrictions
  @Column({ name: 'is_first_booking_only', type: 'boolean', default: false })
  isFirstBookingOnly: boolean;

  @Column({ name: 'applicable_days', type: 'jsonb', nullable: true })
  applicableDays?: number[]; // 0-6 (Sunday-Saturday)

  @Column({ name: 'applicable_hours', type: 'jsonb', nullable: true })
  applicableHours?: { start: string; end: string };

  // Marketing
  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'campaign_name', type: 'varchar', length: 200, nullable: true })
  campaignName?: string;

  @Column({ name: 'referrer_reward', type: 'decimal', precision: 10, scale: 2, default: 0 })
  referrerReward: number;

  @Column({ name: 'referee_reward', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refereeReward: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    source?: string;
    partnerId?: string;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: true })
isActive: boolean;

@Column({ type: 'int', default: 0 })
usageCount: number;

@Column({ type: 'int', nullable: true })
maxUsage?: number;  // Rename from maxUses

@Column({ type: 'int', default: 1 })
maxUsagePerUser: number;  // Rename from maxUsesPerUser

@Column({ type: 'varchar' })
discountType: string;

@Column({ type: 'decimal', precision: 10, scale: 2 })
discountValue: number;

  // Relations
  // @OneToMany(() => PromoUsage, (usage) => usage.promoCode)
  // usages: PromoUsage[];
}