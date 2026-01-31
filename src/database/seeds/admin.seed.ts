import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums/user.enum';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  console.log('🔧 Seeding admin user...');

  // Check if admin already exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@homeservices.sa';
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, skipping...');
    return;
  }

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = userRepository.create({
    phone: '+966500000000',
    email: adminEmail,
    password: hashedPassword,
    firstName: 'System',
    lastName: 'Administrator',
    firstNameAr: 'مدير',
    lastNameAr: 'النظام',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    phoneVerified: true,
    emailVerified: true,
    language: 'ar',
  });

  await userRepository.save(admin);
  console.log('✅ Admin user created successfully');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('   ⚠️  PLEASE CHANGE THE DEFAULT PASSWORD IN PRODUCTION!');
}