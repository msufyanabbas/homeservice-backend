import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCodesService } from './promo-codes.service';
import { PromoCode } from '@database/entities/promo-code.entity';
import { PromoUsage } from '@database/entities/promo-usage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromoCode, PromoUsage]),
  ],
  controllers: [PromoCodesController],
  providers: [PromoCodesService],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}