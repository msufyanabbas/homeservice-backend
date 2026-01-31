import { Entity, Column, Index, Tree, TreeParent, TreeChildren, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ServiceCategory as ServiceCategoryEnum } from '@common/enums/misc.enum';

@Entity('service_categories')
@Tree('closure-table')
export class ServiceCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 100 })
  nameAr: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  icon?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'service_count', type: 'integer', default: 0 })
  serviceCount: number;

  @Column({ name: 'booking_count', type: 'integer', default: 0 })
  bookingCount: number;

  // Tree Relations
  @TreeParent()
  parent?: ServiceCategory;

  @TreeChildren()
  children: ServiceCategory[];

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string;

  // Metadata for flexible attributes
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    searchKeywords?: string[];
    popularTimes?: string[];
    averagePrice?: number;
    estimatedDuration?: number;
    [key: string]: any;
  };

  // Relations
  // @OneToMany(() => Service, (service) => service.category)
  // services: Service[];
}