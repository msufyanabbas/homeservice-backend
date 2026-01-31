import { Entity, Column, Index, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole, UserStatus, Gender } from '@common/enums/user.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
// @Index(['phone'], { unique: true })
// @Index(['email'], { unique: true, where: 'email IS NOT NULL' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  @Index()
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'first_name_ar', type: 'varchar', length: 100, nullable: true })
  firstNameAr?: string;

  @Column({ name: 'last_name_ar', type: 'varchar', length: 100, nullable: true })
  lastNameAr?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  @Index()
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  @Index()
  status: UserStatus;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'profile_picture', type: 'varchar', length: 500, nullable: true })
  profilePicture?: string;

  @Column({ type: 'varchar', length: 10, default: 'ar' })
  language: string;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'fcm_tokens', type: 'jsonb', default: [] })
  fcmTokens: string[];

  @Column({ name: 'last_login_at', type: 'timestamp with time zone', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'login_count', type: 'integer', default: 0 })
  loginCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    referredBy?: string;
    deviceInfo?: any;
    preferences?: any;
    [key: string]: any;
  };

  // Relations will be added here
  // @OneToMany(() => Booking, (booking) => booking.customer)
  // bookings: Booking[];

  // @OneToOne(() => Provider, (provider) => provider.user)
  // provider: Provider;

  // @OneToOne(() => Wallet, (wallet) => wallet.user)
  // wallet: Wallet;
}