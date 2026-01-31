import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('audit_logs')
// @Index(['userId', 'createdAt'])
// @Index(['action', 'createdAt'])
// @Index(['entityType', 'entityId'])
export class AuditLog extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'user_type', type: 'varchar', length: 50, nullable: true })
  userType?: string; // CUSTOMER, PROVIDER, ADMIN, SYSTEM

  @Column({ type: 'varchar', length: 100 })
  @Index()
  action: string; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.

  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  @Index()
  entityType: string; // User, Booking, Payment, etc.

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  @Index()
  entityId?: string;

  @Column({ name: 'entity_name', type: 'varchar', length: 200, nullable: true })
  entityName?: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues?: any;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues?: any;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method?: string; // GET, POST, PUT, DELETE

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint?: string;

  @Column({ name: 'status_code', type: 'integer', nullable: true })
  statusCode?: number;

  @Column({ name: 'response_time_ms', type: 'integer', nullable: true })
  responseTimeMs?: number;

  @Column({ name: 'is_error', type: 'boolean', default: false })
  @Index()
  isError: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'stack_trace', type: 'text', nullable: true })
  stackTrace?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    sessionId?: string;
    deviceInfo?: any;
    location?: any;
    tags?: string[];
    [key: string]: any;
  };
}