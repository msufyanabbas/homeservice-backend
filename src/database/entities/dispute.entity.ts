import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Booking } from './booking.entity';
import {
  DisputeCategory,
  DisputeStatus,
  DisputeResolution,
  DisputeReportedBy,
  DisputePriority,
} from '@common/enums/dispute.enum';

@Entity('disputes')
// @Index(['bookingId'])
// @Index(['reportedBy', 'status'])
export class Dispute extends BaseEntity {
  @Column({ name: 'dispute_number', type: 'varchar', length: 20, unique: true })
  @Index()
  disputeNumber: string;

  @ManyToOne(() => Booking, { eager: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id', type: 'uuid' })
  @Index()
  bookingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_user_id' })
  reportedByUser: User;

  @Column({ name: 'reported_by_user_id', type: 'uuid' })
  reportedByUserId: string;

  // @Column({ name: 'reported_by', type: 'enum', enum: DisputeReportedBy })
  // @Index()
  // reportedBy: DisputeReportedBy;

  @Column({ type: 'enum', enum: DisputeCategory })
  @Index()
  category: DisputeCategory;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  @Index()
  status: DisputeStatus;

  @Column({ type: 'enum', enum: DisputePriority, default: DisputePriority.MEDIUM })
  priority: DisputePriority;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'resolution_type', type: 'enum', enum: DisputeResolution, nullable: true })
  resolutionType?: DisputeResolution;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;

  @Column({ name: 'credit_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  creditAmount: number;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ name: 'resolved_by_user_id', type: 'uuid', nullable: true })
  resolvedByUserId?: string;

  @Column({ name: 'resolved_at', type: 'timestamp with time zone', nullable: true })
  resolvedAt?: Date;

  @Column({ name: 'closed_at', type: 'timestamp with time zone', nullable: true })
  closedAt?: Date;

  @Column({ name: 'escalated_at', type: 'timestamp with time zone', nullable: true })
  escalatedAt?: Date;

  @Column({ name: 'evidence_submission_deadline', type: 'timestamp with time zone', nullable: true })
  evidenceSubmissionDeadline?: Date;

  @Column({ name: 'auto_resolve_at', type: 'timestamp with time zone', nullable: true })
  autoResolveAt?: Date;

  // Customer Response
  @Column({ name: 'provider_responded', type: 'boolean', default: false })
  providerResponded: boolean;

  @Column({ name: 'provider_response', type: 'text', nullable: true })
  providerResponse?: string;

  @Column({ name: 'provider_responded_at', type: 'timestamp with time zone', nullable: true })
  providerRespondedAt?: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    evidenceUrls?: string[];
    chatTranscript?: any;
    gpsProof?: any;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
evidenceDeadline?: Date;

@Column({ type: 'varchar', nullable: true })
resolution?: string;

@Column({ type: 'uuid', nullable: true })
resolvedBy?: string;

@Column({ type: 'uuid', nullable: true })
assignedTo?: string;

// @ManyToOne(() => User)
// @JoinColumn({ name: 'reported_by_user_id' })
// reportedBy: User;  // <-- THIS fixes your queries


@Column({ type: 'uuid' })
reportedById: string;  // Add this if using userId pattern

  // Relations
  // @OneToMany(() => DisputeMessage, (message) => message.dispute)
  // messages: DisputeMessage[];

  // @OneToMany(() => DisputeEvidence, (evidence) => evidence.dispute)
  // evidence: DisputeEvidence[];
}