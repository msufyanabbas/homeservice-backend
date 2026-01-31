import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from '@database/entities/service.entity';
import { ServiceCategory } from '@database/entities/service-category.entity';
import { Provider } from '@database/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceCategory, Provider]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}