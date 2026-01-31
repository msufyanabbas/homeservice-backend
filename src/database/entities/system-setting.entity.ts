import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('system_settings')
export class SystemSetting extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ name: 'value_type', type: 'varchar', length: 20, default: 'STRING' })
  valueType: string; // STRING, NUMBER, BOOLEAN, JSON, ARRAY

  @Column({ type: 'varchar', length: 100 })
  category: string; // GENERAL, PAYMENT, NOTIFICATION, BOOKING, etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr?: string;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean; // Can be accessed by frontend

  @Column({ name: 'is_encrypted', type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ name: 'is_editable', type: 'boolean', default: true })
  isEditable: boolean;

  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules?: {
    min?: number;
    max?: number;
    regex?: string;
    options?: string[];
    [key: string]: any;
  };

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue?: string;

  @Column({ name: 'last_modified_by', type: 'uuid', nullable: true })
  lastModifiedBy?: string;

  @Column({ name: 'requires_restart', type: 'boolean', default: false })
  requiresRestart: boolean;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    version?: string;
    environment?: string;
    tags?: string[];
    [key: string]: any;
  };
}