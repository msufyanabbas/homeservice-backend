import { DataSource } from 'typeorm';
import { Provider } from '../../database/entities/provider.entity';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../common/enums/user.enum';
import {
  ProviderStatus,
  ProviderVerificationStatus,
  ProviderAvailability,
} from '../../common/enums/provider.enum';

export async function seedProviders(dataSource: DataSource): Promise<void> {
  const providerRepository = dataSource.getRepository(Provider);
  const userRepository = dataSource.getRepository(User);

  console.log('🔧 Seeding providers...');

  // Get provider users
  const providerUsers = await userRepository.find({
    where: { role: UserRole.PROVIDER },
    take: 10,
  });

  if (providerUsers.length === 0) {
    console.log('ℹ️  No provider users found. Please seed users first.');
    return;
  }

  const providersData = [
    {
      businessName: 'Quick Clean Services',
      businessNameAr: 'خدمات التنظيف السريع',
      bio: 'Professional cleaning services with 8 years of experience',
      bioAr: 'خدمات تنظيف احترافية مع 8 سنوات من الخبرة',
      status: ProviderStatus.ACTIVE,
      verificationStatus: ProviderVerificationStatus.VERIFIED,
      availability: ProviderAvailability.AVAILABLE,
      iqamaNumber: '2345678901',
      iqamaExpiry: new Date('2026-12-31'),
      commercialRegister: 'CR1234567890',
      vatNumber: '300012345678903',
      serviceCategories: ['cleaning', 'ac-maintenance'],
      serviceAreas: ['Riyadh', 'Al-Khobar'],
      averageRating: 4.8,
      totalReviews: 156,
      totalBookings: 234,
      completedBookings: 220,
      cancelledBookings: 5,
      acceptanceRate: 95.5,
      completionRate: 94.0,
      responseTimeMinutes: 15,
      totalEarnings: 45600.00,
      pendingEarnings: 2300.00,
      commissionRate: 15,
      bankName: 'Al Rajhi Bank',
      iban: 'SA0380000000608010167519',
      accountHolderName: 'Khalid Hassan Mohammed',
      subscriptionActive: true,
      subscriptionExpiresAt: new Date('2025-12-31'),
      currentLatitude: 24.7136,
      currentLongitude: 46.6753,
    },
    {
      businessName: 'Expert Electricians',
      businessNameAr: 'الكهربائيون الخبراء',
      bio: 'Licensed electricians for residential and commercial',
      bioAr: 'كهربائيون مرخصون للمنازل والأعمال التجارية',
      status: ProviderStatus.ACTIVE,
      verificationStatus: ProviderVerificationStatus.VERIFIED,
      availability: ProviderAvailability.BUSY,
      iqamaNumber: '2456789012',
      iqamaExpiry: new Date('2027-06-30'),
      commercialRegister: 'CR2345678901',
      serviceCategories: ['electrical', 'ac-maintenance'],
      serviceAreas: ['Riyadh', 'Jeddah'],
      averageRating: 4.9,
      totalReviews: 203,
      totalBookings: 312,
      completedBookings: 298,
      cancelledBookings: 3,
      acceptanceRate: 98.0,
      completionRate: 95.5,
      responseTimeMinutes: 10,
      totalEarnings: 67800.00,
      pendingEarnings: 3500.00,
      commissionRate: 12,
      bankName: 'Riyad Bank',
      iban: 'SA1420000001234567891234',
      accountHolderName: 'Sarah Abdullah Saleh',
      subscriptionActive: true,
      subscriptionExpiresAt: new Date('2026-03-31'),
      currentLatitude: 24.7248,
      currentLongitude: 46.6977,
    },
    {
      businessName: 'Prime Plumbing',
      businessNameAr: 'السباكة الممتازة',
      bio: '24/7 emergency plumbing services',
      bioAr: 'خدمات سباكة طوارئ على مدار الساعة',
      status: ProviderStatus.ACTIVE,
      verificationStatus: ProviderVerificationStatus.VERIFIED,
      availability: ProviderAvailability.AVAILABLE,
      iqamaNumber: '2567890123',
      iqamaExpiry: new Date('2026-09-15'),
      serviceCategories: ['plumbing'],
      serviceAreas: ['Riyadh'],
      averageRating: 4.7,
      totalReviews: 128,
      totalBookings: 189,
      completedBookings: 175,
      cancelledBookings: 7,
      acceptanceRate: 92.0,
      completionRate: 92.6,
      responseTimeMinutes: 20,
      totalEarnings: 34500.00,
      pendingEarnings: 1800.00,
      commissionRate: 15,
      bankName: 'Saudi National Bank',
      iban: 'SA4550000000123456789012',
      accountHolderName: 'Mohammed Salem Ahmed',
      subscriptionActive: true,
      subscriptionExpiresAt: new Date('2025-09-30'),
      currentLatitude: 24.6877,
      currentLongitude: 46.7219,
    },
    {
      businessName: 'Pro Painters',
      businessNameAr: 'الدهانون المحترفون',
      bio: 'Quality painting for homes and offices',
      bioAr: 'دهانات عالية الجودة للمنازل والمكاتب',
      status: ProviderStatus.PENDING_APPROVAL,
      verificationStatus: ProviderVerificationStatus.PENDING,
      availability: ProviderAvailability.OFFLINE,
      iqamaNumber: '2678901234',
      serviceCategories: ['painting'],
      serviceAreas: ['Riyadh', 'Dammam'],
      averageRating: 0,
      totalReviews: 0,
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      acceptanceRate: 0,
      completionRate: 0,
      responseTimeMinutes: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      commissionRate: 15,
      subscriptionActive: false,
      trialEndsAt: new Date('2025-02-07'),
    },
  ];

  for (let i = 0; i < providerUsers.length && i < providersData.length; i++) {
    const user = providerUsers[i];

    // Check if provider already exists
    const existing = await providerRepository.findOne({
      where: { userId: user.id },
    });

    if (!existing) {
      const provider = providerRepository.create({
        ...providersData[i],
        userId: user.id,
        user: user,
      });

      await providerRepository.save(provider);
      console.log(`✅ Created provider: ${providersData[i].businessName || user.firstName}`);
    } else {
      console.log(`ℹ️  Provider already exists for user: ${user.firstName} ${user.lastName}`);
    }
  }

  console.log('✅ Providers seeding completed');
}