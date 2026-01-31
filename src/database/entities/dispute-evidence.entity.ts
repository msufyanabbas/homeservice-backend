import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Dispute } from './dispute.entity';
import { User } from './user.entity';
import { DisputeEvidenceType, EvidenceType } from '@common/enums/dispute.enum';

@Entity('dispute_evidence')
// @Index(['disputeId', 'createdAt'])
export class DisputeEvidence extends BaseEntity {
  @ManyToOne(() => Dispute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;

  @Column({ name: 'dispute_id', type: 'uuid' })
  @Index()
  disputeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedByUser: User;

  @Column({ name: 'uploaded_by_user_id', type: 'uuid' })
  uploadedByUserId: string;

  @Column({ name: 'uploaded_by_type', type: 'varchar', length: 20 })
  uploadedByType: string; // CUSTOMER, PROVIDER, ADMIN

  @Column({ type: 'enum', enum: EvidenceType })
  type: DisputeEvidenceType;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize: number; // In bytes

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'verified_at', type: 'timestamp with time zone', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'is_rejected', type: 'boolean', default: false })
  isRejected: boolean;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  // For location evidence
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ name: 'location_timestamp', type: 'timestamp with time zone', nullable: true })
  locationTimestamp?: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    exifData?: any;
    recordingDuration?: number;
    transcription?: string;
    [key: string]: any;
  };
}