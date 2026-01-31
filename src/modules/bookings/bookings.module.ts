import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from '@database/entities/booking.entity';
import { BookingTimeline } from '@database/entities/booking-timeline.entity';
import { Provider } from '@database/entities/provider.entity';
import { Service } from '@database/entities/service.entity';
import { User } from '@database/entities/user.entity';
import { ProviderLocation } from '@database/entities/provider-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingTimeline,
      Provider,
      Service,
      User,
      ProviderLocation,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}