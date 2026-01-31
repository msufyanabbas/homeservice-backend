import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Booking } from '@database/entities/booking.entity';
import { Payment } from '@database/entities/payment.entity';
import { Provider } from '@database/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Payment, Provider]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}