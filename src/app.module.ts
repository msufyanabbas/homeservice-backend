import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import * as redisStore from 'cache-manager-redis-store';

// Configurations
import appConfig from '@config/app.config';
import databaseConfig from '@config/database.config';
import redisConfig from '@config/redis.config';
import jwtConfig from '@config/jwt.config';
import firebaseConfig from '@config/firebase.config';
import moyasarConfig from '@config/moyasar.config';

// Modules
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { ProvidersModule } from '@modules/providers/providers.module';
import { ServicesModule } from '@modules/services/services.module';
import { BookingsModule } from '@modules/bookings/bookings.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { ChatModule } from '@modules/chat/chat.module';
import { ReviewsModule } from '@modules/reviews/reviews.module';
import { DisputesModule } from '@modules/disputes/disputes.module';
import { AdminModule } from '@modules/admin/admin.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { PromoCodesModule } from '@modules/promo-codes/promo-codes.module';
import { LocationsModule } from '@modules/locations/locations.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        jwtConfig,
        firebaseConfig,
        moyasarConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),

    // Cache (Redis)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        ...configService.get('redis'),
        ttl: 300, // 5 minutes default
      }),
      inject: [ConfigService],
    }),

    // Task Scheduling
    ScheduleModule.forRoot(),

    // Queue (Bull)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    ProvidersModule,
    ServicesModule,
    BookingsModule,
    PaymentsModule,
    NotificationsModule,
    ChatModule,
    ReviewsModule,
    DisputesModule,
    AdminModule,
    AnalyticsModule,
    PromoCodesModule,
    LocationsModule,
    HealthModule
  ],
})
export class AppModule {}