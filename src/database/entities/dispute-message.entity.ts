import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Dispute } from './dispute.entity';
import { User } from './user.entity';

@Entity('dispute_messages')
// @Index(['disputeId', 'createdAt'])
export class DisputeMessage extends BaseEntity {
  @ManyToOne(() => Dispute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;

  @Column({ name: 'dispute_id', type: 'uuid' })
  @Index()
  disputeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id', type: 'uuid' })
  @Index()
  senderId: string;

  @Column({ name: 'sender_type', type: 'varchar', length: 20 })
  senderType: string; // CUSTOMER, PROVIDER, ADMIN, SYSTEM

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_internal', type: 'boolean', default: false })
  isInternal: boolean; // Only visible to admins

  @Column({ name: 'is_system_message', type: 'boolean', default: false })
  isSystemMessage: boolean;

  @Column({ name: 'is_read_by_customer', type: 'boolean', default: false })
  isReadByCustomer: boolean;

  @Column({ name: 'is_read_by_provider', type: 'boolean', default: false })
  isReadByProvider: boolean;

  @Column({ name: 'is_read_by_admin', type: 'boolean', default: false })
  isReadByAdmin: boolean;

  @Column({ name: 'attachments', type: 'jsonb', default: [] })
  attachments: string[];

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    notificationSent?: boolean;
    emailSent?: boolean;
    [key: string]: any;
  };
}