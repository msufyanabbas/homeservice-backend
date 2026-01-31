import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '@database/entities/user.entity';
import { Provider } from '@database/entities/provider.entity';
import { Booking } from '@database/entities/booking.entity';
import { Payment } from '@database/entities/payment.entity';
import { ProviderDocument } from '@database/entities/provider-document.entity';
import { AuditLog } from '@database/entities/audit-log.entity';
import { SystemSetting } from '@database/entities/system-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Provider,
      Booking,
      Payment,
      ProviderDocument,
      AuditLog,
      SystemSetting,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}