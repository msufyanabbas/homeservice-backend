import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { Address } from '@database/entities/address.entity';
import { ProviderLocation } from '@database/entities/provider-location.entity';
import { Provider } from '@database/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Address, ProviderLocation, Provider]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}