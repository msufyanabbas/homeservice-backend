import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Provider } from './provider.entity';
import {
  ProviderDocumentType,
  ProviderVerificationStatus,
} from '@common/enums/provider.enum';

@Entity('provider_documents')
// @Index(['providerId', 'documentType'])
// @Index(['verificationStatus'])
export class ProviderDocument extends BaseEntity {
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id', type: 'uuid' })
  @Index()
  providerId: string;


  @Column({ name: 'document_type', type: 'enum', enum: ProviderDocumentType })
  @Index()
  documentType: ProviderDocumentType;

  @Column({ name: 'document_number', type: 'varchar', length: 100, nullable: true })
  documentNumber?: string;

  @Column({ name: 'document_url', type: 'varchar', length: 500 })
  documentUrl: string;

  @Column({ name: 'document_back_url', type: 'varchar', length: 500, nullable: true })
  documentBackUrl?: string; // For documents with back side

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'issuing_authority', type: 'varchar', length: 200, nullable: true })
  issuingAuthority?: string;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: ProviderVerificationStatus,
    default: ProviderVerificationStatus.PENDING,
  })
  @Index()
  verificationStatus: ProviderVerificationStatus;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'verified_at', type: 'timestamp with time zone', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'is_expired', type: 'boolean', default: false })
  @Index()
  isExpired: boolean;

  @Column({ name: 'expiry_notification_sent', type: 'boolean', default: false })
  expiryNotificationSent: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // OCR/AI extracted data
  @Column({ name: 'extracted_data', type: 'jsonb', nullable: true })
  extractedData?: {
    name?: string;
    dateOfBirth?: string;
    nationality?: string;
    gender?: string;
    address?: string;
    [key: string]: any;
  };

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    uploadedFrom?: string;
    [key: string]: any;
  };

}