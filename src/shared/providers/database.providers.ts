import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/../../database/entities/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations instead
        logging: configService.get('NODE_ENV') === 'development',
        ssl: false,
        extra: {
          max: 20, // Maximum pool size
          min: 5,  // Minimum pool size
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];