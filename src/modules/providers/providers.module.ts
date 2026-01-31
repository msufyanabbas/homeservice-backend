import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { Provider } from '@database/entities/provider.entity';
import { User } from '@database/entities/user.entity';
import { ProviderDocument } from '@database/entities/provider-document.entity';
import { ProviderLocation } from '@database/entities/provider-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      User,
      ProviderDocument,
      ProviderLocation,
    ]),
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}