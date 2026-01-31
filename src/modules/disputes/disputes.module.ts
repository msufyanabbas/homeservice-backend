import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { Dispute } from '@database/entities/dispute.entity';
import { DisputeMessage } from '@database/entities/dispute-message.entity';
import { DisputeEvidence } from '@database/entities/dispute-evidence.entity';
import { Booking } from '@database/entities/booking.entity';
import { FileUploadService } from '@/shared/services/file-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dispute,
      DisputeMessage,
      DisputeEvidence,
      Booking,
    ]),
  ],
  controllers: [DisputesController],
  providers: [DisputesService, FileUploadService],
  exports: [DisputesService, FileUploadService],
})
export class DisputesModule {}