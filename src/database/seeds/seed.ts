import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { connectionSource } from '../../config/database.config';
import { seedAdmin } from './admin.seed';
import { seedServiceCategories } from './service-categories.seed';
import { seedUsers } from './users.seed';
import { seedWallets } from './wallets.seed';
import { seedProviders } from './providers.seed';
import { seedServices } from './services.seed';
import { seedBookings } from './bookings.seed';
import { seedPayments } from './payments.seed';
import { seedPromoCodes } from './promo-codes.seed';
import { seedTransactions } from './transactions.seed';
import { seedReviews } from './reviews.seed';
import { seedNotifications } from './notifications.seed';
import { seedSystemSettings } from './system-settings.seed';

config();

async function runSeeds() {
  let dataSource: DataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as any,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_DATABASE || "home_services",
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  });
  await dataSource.initialize();

  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize data source
    dataSource = await connectionSource.initialize();
    console.log('✅ Database connection established');

    // Run seeds in proper order (respecting dependencies)
    console.log('\n📋 Phase 1: Core Configuration & Users');
    await seedAdmin(dataSource);
    await seedSystemSettings(dataSource);
    await seedServiceCategories(dataSource);
    await seedUsers(dataSource);
    
    console.log('\n💰 Phase 2: Financial & Provider Setup');
    await seedWallets(dataSource);
    await seedProviders(dataSource);
    await seedPromoCodes(dataSource);
    
    console.log('\n🛎️  Phase 3: Services & Bookings');
    await seedServices(dataSource);
    await seedBookings(dataSource);
    
    console.log('\n💳 Phase 4: Payments & Transactions');
    await seedPayments(dataSource);
    await seedTransactions(dataSource);
    
    console.log('\n⭐ Phase 5: Reviews & Notifications');
    await seedReviews(dataSource);
    await seedNotifications(dataSource);

    console.log('\n🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

runSeeds();