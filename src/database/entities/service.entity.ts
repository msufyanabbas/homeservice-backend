import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Provider } from './provider.entity';
import { ServiceCategory } from './service-category.entity';
import { ServicePricing } from '@common/enums/misc.enum';

@Entity('services')
export class Service extends BaseEntity {
  @ManyToOne(() => Provider, { eager: false })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id', type: 'uuid' })
  @Index()
  providerId: string;

  @ManyToOne(() => ServiceCategory, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column({ name: 'category_id', type: 'uuid' })
  @Index()
  categoryId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 200 })
  nameAr: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'description_ar', type: 'text' })
  descriptionAr: string;

  @Column({ type: 'enum', enum: ServicePricing, default: ServicePricing.FIXED })
  pricingType: ServicePricing;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ name: 'min_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPrice?: number;

  @Column({ name: 'max_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxPrice?: number;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ name: 'estimated_duration_minutes', type: 'integer', default: 60 })
  estimatedDurationMinutes: number;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  // Availability
  @Column({ name: 'min_advance_booking_hours', type: 'integer', default: 2 })
  minAdvanceBookingHours: number;

  @Column({ name: 'max_advance_booking_days', type: 'integer', default: 30 })
  maxAdvanceBookingDays: number;

  // Service Details (JSONB for flexibility)
  @Column({ name: 'included_items', type: 'jsonb', default: [] })
  includedItems: { item: string; itemAr: string }[];

  @Column({ name: 'excluded_items', type: 'jsonb', default: [] })
  excludedItems: { item: string; itemAr: string }[];

  @Column({ type: 'jsonb', default: [] })
  requirements: { requirement: string; requirementAr: string }[];

  @Column({ name: 'additional_options', type: 'jsonb', default: [] })
  additionalOptions: {
    name: string;
    nameAr: string;
    price: number;
    required: boolean;
  }[];

  // Service Areas
  @Column({ name: 'service_areas', type: 'jsonb', default: [] })
  serviceAreas: string[];

  // Stats
  @Column({ name: 'total_bookings', type: 'integer', default: 0 })
  totalBookings: number;

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'total_reviews', type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ name: 'view_count', type: 'integer', default: 0 })
  viewCount: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    tags?: string[];
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
    [key: string]: any;
  };

  // Relations
  // @OneToMany(() => Booking, (booking) => booking.service)
  // bookings: Booking[];

  // @OneToMany(() => Review, (review) => review.service)
  // reviews: Review[];
}