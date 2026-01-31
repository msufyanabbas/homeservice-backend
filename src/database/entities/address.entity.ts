import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('addresses')
@Index(['userId', 'isDefault'])
export class Address extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100, default: 'Home' })
  label: string; // Home, Work, Other

  @Column({ name: 'label_ar', type: 'varchar', length: 100, default: 'المنزل' })
  labelAr: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 200 })
  contactName: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20 })
  contactPhone: string;

  @Column({ type: 'varchar', length: 300 })
  street: string;

  @Column({ name: 'building_number', type: 'varchar', length: 50, nullable: true })
  buildingNumber?: string;

  @Column({ name: 'floor_number', type: 'varchar', length: 20, nullable: true })
  floorNumber?: string;

  @Column({ name: 'apartment_number', type: 'varchar', length: 20, nullable: true })
  apartmentNumber?: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  city: string;

  @Column({ name: 'city_ar', type: 'varchar', length: 100 })
  cityAr: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ name: 'district_ar', type: 'varchar', length: 100 })
  districtAr: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 100, default: 'Saudi Arabia' })
  country: string;

  @Column({ name: 'country_ar', type: 'varchar', length: 100, default: 'المملكة العربية السعودية' })
  countryAr: string;

  @Column({ name: 'additional_directions', type: 'text', nullable: true })
  additionalDirections?: string;

  @Column({ name: 'additional_directions_ar', type: 'text', nullable: true })
  additionalDirectionsAr?: string;

  // Location coordinates
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  @Index()
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  @Index()
  longitude: number;

  // PostGIS geography point for spatial queries
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  location?: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'usage_count', type: 'integer', default: 0 })
  usageCount: number;

  @Column({ name: 'last_used_at', type: 'timestamp with time zone', nullable: true })
  lastUsedAt?: Date;

  // Address type
  @Column({ name: 'address_type', type: 'varchar', length: 50, default: 'RESIDENTIAL' })
  addressType: string; // RESIDENTIAL, COMMERCIAL, OFFICE

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    landmarks?: string[];
    accessInstructions?: string;
    parkingInfo?: string;
    gateCode?: string;
    [key: string]: any;
  };
}