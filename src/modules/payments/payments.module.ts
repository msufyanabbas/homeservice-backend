import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '@database/entities/payment.entity';
import { Wallet } from '@database/entities/wallet.entity';
import { Transaction } from '@database/entities/transaction.entity';
import { Refund } from '@database/entities/refund.entity';
import { Booking } from '@database/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Wallet,
      Transaction,
      Refund,
      Booking,
    ]),
    ConfigModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}