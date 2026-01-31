import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('otps')
// @Index(['phone', 'expiresAt'])
export class Otp extends BaseEntity {
  @Column({ type: 'varchar', length: 20 })
  @Index()
  phone: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  purpose: string; // REGISTRATION, LOGIN, FORGOT_PASSWORD, PHONE_VERIFICATION

  @Column({ name: 'is_used', type: 'boolean', default: false })
  @Index()
  isUsed: boolean;

  @Column({ name: 'used_at', type: 'timestamp with time zone', nullable: true })
  usedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  @Index()
  expiresAt: Date;

  @Column({ name: 'attempt_count', type: 'integer', default: 0 })
  attemptCount: number;

  @Column({ name: 'max_attempts', type: 'integer', default: 3 })
  maxAttempts: number;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ name: 'blocked_until', type: 'timestamp with time zone', nullable: true })
  blockedUntil?: Date;

  @Column({ name: 'sent_via', type: 'varchar', length: 20, default: 'SMS' })
  sentVia: string; // SMS, WHATSAPP, CALL

  @Column({ name: 'sms_sid', type: 'varchar', length: 100, nullable: true })
  smsSid?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    deviceInfo?: any;
    location?: any;
    [key: string]: any;
  };
}