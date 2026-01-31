import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'home_services',
  entities: [__dirname + '/../database/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
  // synchronize: process.env.DB_SYNCHRONIZE === 'true',
  synchronize: true,
  logging: process.env.DB_LOGGING === 'true',
  ssl: false,
  extra: {
    max: 20, // Maximum pool size
    connectionTimeoutMillis: 5000,
  },
};

export default registerAs('database', () => config);

// DataSource for migrations
export const connectionSource = new DataSource(config as DataSourceOptions);