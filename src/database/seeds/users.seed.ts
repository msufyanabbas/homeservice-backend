import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { UserRole, UserStatus, Gender } from '../../common/enums/user.enum';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  console.log('🔧 Seeding users...');

  const users = [
    {
      phone: '+966501234567',
      email: 'ahmed.ali@gmail.com',
      password: 'Password@123',
      firstName: 'Ahmed',
      lastName: 'Ali',
      firstNameAr: 'أحمد',
      lastNameAr: 'علي',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      gender: Gender.MALE,
      dateOfBirth: new Date('1990-05-15'),
      language: 'ar',
      phoneVerified: true,
      emailVerified: true,
      loginCount: 15,
      lastLoginAt: new Date('2025-01-20'),
    },
    {
      phone: '+966502345678',
      email: 'fatima.mohammed@gmail.com',
      password: 'Password@123',
      firstName: 'Fatima',
      lastName: 'Mohammed',
      firstNameAr: 'فاطمة',
      lastNameAr: 'محمد',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1995-08-22'),
      language: 'ar',
      phoneVerified: true,
      emailVerified: true,
      loginCount: 8,
      lastLoginAt: new Date('2025-01-22'),
    },
    {
      phone: '+966503456789',
      email: 'khalid.hassan@gmail.com',
      password: 'Password@123',
      firstName: 'Khalid',
      lastName: 'Hassan',
      firstNameAr: 'خالد',
      lastNameAr: 'حسن',
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
      gender: Gender.MALE,
      dateOfBirth: new Date('1988-03-10'),
      language: 'ar',
      phoneVerified: true,
      emailVerified: true,
      loginCount: 45,
      lastLoginAt: new Date('2025-01-23'),
    },
    {
      phone: '+966504567890',
      email: 'sarah.abdullah@gmail.com',
      password: 'Password@123',
      firstName: 'Sarah',
      lastName: 'Abdullah',
      firstNameAr: 'سارة',
      lastNameAr: 'عبدالله',
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1992-11-30'),
      language: 'ar',
      phoneVerified: true,
      emailVerified: true,
      loginCount: 32,
      lastLoginAt: new Date('2025-01-24'),
    },
    {
      phone: '+966505678901',
      email: 'omar.khalid@gmail.com',
      password: 'Password@123',
      firstName: 'Omar',
      lastName: 'Khalid',
      firstNameAr: 'عمر',
      lastNameAr: 'خالد',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      gender: Gender.MALE,
      language: 'ar',
      phoneVerified: true,
      emailVerified: false,
      loginCount: 3,
      lastLoginAt: new Date('2025-01-15'),
    },
    {
      phone: '+966506789012',
      email: 'layla.omar@gmail.com',
      password: 'Password@123',
      firstName: 'Layla',
      lastName: 'Omar',
      firstNameAr: 'ليلى',
      lastNameAr: 'عمر',
      role: UserRole.CUSTOMER,
      status: UserStatus.PENDING_VERIFICATION,
      gender: Gender.FEMALE,
      language: 'ar',
      phoneVerified: false,
      emailVerified: false,
      loginCount: 1,
    },
    {
      phone: '+966507890123',
      email: 'mohammed.salem@gmail.com',
      password: 'Password@123',
      firstName: 'Mohammed',
      lastName: 'Salem',
      firstNameAr: 'محمد',
      lastNameAr: 'سالم',
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
      gender: Gender.MALE,
      dateOfBirth: new Date('1985-07-18'),
      language: 'ar',
      phoneVerified: true,
      emailVerified: true,
      loginCount: 67,
      lastLoginAt: new Date('2025-01-24'),
    },
    {
      phone: '+966508901234',
      email: 'noura.fahad@gmail.com',
      password: 'Password@123',
      firstName: 'Noura',
      lastName: 'Fahad',
      firstNameAr: 'نورة',
      lastNameAr: 'فهد',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1998-02-14'),
      language: 'ar',
      phoneVerified: true,
      emailVerified: true,
      loginCount: 12,
      lastLoginAt: new Date('2025-01-21'),
    },
    {
      phone: '+966509012345',
      email: 'youssef.ahmad@gmail.com',
      password: 'Password@123',
      firstName: 'Youssef',
      lastName: 'Ahmad',
      firstNameAr: 'يوسف',
      lastNameAr: 'أحمد',
      role: UserRole.PROVIDER,
      status: UserStatus.SUSPENDED,
      gender: Gender.MALE,
      language: 'ar',
      phoneVerified: true,
      emailVerified: true,
      loginCount: 21,
      lastLoginAt: new Date('2025-01-10'),
      metadata: {
        suspensionReason: 'Multiple customer complaints',
      },
    },
    {
      phone: '+966500123456',
      email: 'mariam.saleh@gmail.com',
      password: 'Password@123',
      firstName: 'Mariam',
      lastName: 'Saleh',
      firstNameAr: 'مريم',
      lastNameAr: 'صالح',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1993-09-25'),
      language: 'en',
      phoneVerified: true,
      emailVerified: true,
      loginCount: 25,
      lastLoginAt: new Date('2025-01-23'),
    },
  ];

  for (const userData of users) {
    // Check if user already exists
    const existing = await userRepository.findOne({
      where: { phone: userData.phone },
    });

    if (!existing) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      
      await userRepository.save(user);
      console.log(`✅ Created user: ${userData.firstName} ${userData.lastName}`);
    } else {
      console.log(`ℹ️  User already exists: ${userData.firstName} ${userData.lastName}`);
    }
  }

  console.log('✅ Users seeding completed');
}