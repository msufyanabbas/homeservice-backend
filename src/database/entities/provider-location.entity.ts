import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Provider } from './provider.entity';
import { Booking } from './booking.entity';

@Entity('provider_locations')
// @Index(['providerId', 'createdAt'])
// @Index(['bookingId', 'createdAt'])
export class ProviderLocation extends BaseEntity {
  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id', type: 'uuid' })
  @Index()
  providerId: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking?: Booking;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  @Index()
  bookingId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  // PostGIS geography point for efficient spatial queries
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  accuracy?: number; // In meters

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  altitude?: number; // In meters

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  speed?: number; // In km/h

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  heading?: number; // In degrees (0-360)

  @Column({ name: 'is_moving', type: 'boolean', default: false })
  isMoving: boolean;

  @Column({ name: 'is_online', type: 'boolean', default: true })
  @Index()
  isOnline: boolean;

  @Column({ name: 'battery_level', type: 'integer', nullable: true })
  batteryLevel?: number; // Percentage 0-100

  @Column({ name: 'network_type', type: 'varchar', length: 20, nullable: true })
  networkType?: string; // WiFi, 4G, 5G

  // Recorded from device
  @Column({ name: 'recorded_at', type: 'timestamp with time zone' })
  @Index()
  recordedAt: Date;

  @Column({ name: 'device_id', type: 'varchar', length: 255, nullable: true })
  deviceId?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    city?: string;
    district?: string;
    address?: string;
    nearbyLandmark?: string;
    [key: string]: any;
  };
}