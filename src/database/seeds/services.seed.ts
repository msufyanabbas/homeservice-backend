import { DataSource } from 'typeorm';
import { Service } from '../../database/entities/service.entity';
import { Provider } from '../../database/entities/provider.entity';
import { ServiceCategory } from '../../database/entities/service-category.entity';
import { ServicePricing } from '../../common/enums/misc.enum';

export async function seedServices(dataSource: DataSource): Promise<void> {
  const serviceRepository = dataSource.getRepository(Service);
  const providerRepository = dataSource.getRepository(Provider);
  const categoryRepository = dataSource.getRepository(ServiceCategory);

  console.log('🔧 Seeding services...');

  // Get providers and categories
  const providers = await providerRepository.find({ take: 5 });
  const categories = await categoryRepository.find({ take: 10 });

  if (providers.length === 0) {
    console.log('ℹ️  No providers found. Please seed providers first.');
    return;
  }

  if (categories.length === 0) {
    console.log('ℹ️  No service categories found. Please seed categories first.');
    return;
  }

  const servicesData = [
    {
      name: 'Deep Home Cleaning',
      nameAr: 'تنظيف عميق للمنزل',
      description: 'Comprehensive deep cleaning service for entire home including kitchen, bathrooms, and bedrooms',
      descriptionAr: 'خدمة تنظيف عميق شاملة للمنزل بالكامل بما في ذلك المطبخ والحمامات وغرف النوم',
      pricingType: ServicePricing.FIXED,
      basePrice: 350.00,
      estimatedDurationMinutes: 180,
      images: ['cleaning1.jpg', 'cleaning2.jpg'],
      isActive: true,
      isFeatured: true,
      minAdvanceBookingHours: 4,
      maxAdvanceBookingDays: 30,
      includedItems: [
        { item: 'All rooms cleaning', itemAr: 'تنظيف جميع الغرف' },
        { item: 'Kitchen deep clean', itemAr: 'تنظيف عميق للمطبخ' },
        { item: 'Bathroom sanitization', itemAr: 'تعقيم الحمام' },
      ],
      serviceAreas: ['Riyadh', 'Al-Khobar'],
      totalBookings: 45,
      averageRating: 4.8,
      totalReviews: 38,
    },
    {
      name: 'AC Repair & Maintenance',
      nameAr: 'إصلاح وصيانة المكيفات',
      description: 'Professional AC repair and maintenance service',
      descriptionAr: 'خدمة إصلاح وصيانة المكيفات المحترفة',
      pricingType: ServicePricing.HOURLY,
      basePrice: 150.00,
      hourlyRate: 150.00,
      estimatedDurationMinutes: 90,
      images: ['ac1.jpg'],
      isActive: true,
      isFeatured: true,
      minAdvanceBookingHours: 2,
      maxAdvanceBookingDays: 15,
      includedItems: [
        { item: 'Full AC inspection', itemAr: 'فحص كامل للمكيف' },
        { item: 'Filter cleaning', itemAr: 'تنظيف الفلاتر' },
      ],
      additionalOptions: [
        { name: 'Gas refill', nameAr: 'تعبئة الغاز', price: 200.00, required: false },
        { name: 'Filter replacement', nameAr: 'استبدال الفلتر', price: 80.00, required: false },
      ],
      serviceAreas: ['Riyadh'],
      totalBookings: 67,
      averageRating: 4.9,
      totalReviews: 54,
    },
    {
      name: 'Electrical Wiring & Fixtures',
      nameAr: 'توصيلات كهربائية وتركيبات',
      description: 'Complete electrical installation and repair services',
      descriptionAr: 'خدمات التركيب والإصلاح الكهربائي الكاملة',
      pricingType: ServicePricing.CUSTOM,
      basePrice: 200.00,
      minPrice: 150.00,
      maxPrice: 1500.00,
      estimatedDurationMinutes: 120,
      images: ['electrical1.jpg'],
      isActive: true,
      isFeatured: false,
      minAdvanceBookingHours: 3,
      maxAdvanceBookingDays: 20,
      requirements: [
        { requirement: 'Access to main electrical panel', requirementAr: 'الوصول إلى اللوحة الكهربائية الرئيسية' },
      ],
      serviceAreas: ['Riyadh', 'Jeddah'],
      totalBookings: 28,
      averageRating: 4.7,
      totalReviews: 22,
    },
    {
      name: 'Plumbing Repair',
      nameAr: 'إصلاح السباكة',
      description: 'Emergency and scheduled plumbing repairs',
      descriptionAr: 'إصلاحات السباكة الطارئة والمجدولة',
      pricingType: ServicePricing.FIXED,
      basePrice: 180.00,
      estimatedDurationMinutes: 90,
      images: ['plumbing1.jpg'],
      isActive: true,
      isFeatured: true,
      minAdvanceBookingHours: 1,
      maxAdvanceBookingDays: 10,
      includedItems: [
        { item: 'Problem diagnosis', itemAr: 'تشخيص المشكلة' },
        { item: 'Basic repairs', itemAr: 'الإصلاحات الأساسية' },
      ],
      serviceAreas: ['Riyadh'],
      totalBookings: 52,
      averageRating: 4.6,
      totalReviews: 41,
    },
    {
      name: 'House Painting - Interior',
      nameAr: 'دهان المنزل - داخلي',
      description: 'Professional interior house painting',
      descriptionAr: 'دهان داخلي احترافي للمنزل',
      pricingType: ServicePricing.CUSTOM,
      basePrice: 800.00,
      minPrice: 500.00,
      maxPrice: 5000.00,
      estimatedDurationMinutes: 480,
      images: ['painting1.jpg'],
      isActive: false,
      isFeatured: false,
      minAdvanceBookingHours: 24,
      maxAdvanceBookingDays: 60,
      serviceAreas: ['Riyadh', 'Dammam'],
      totalBookings: 0,
      averageRating: 0,
      totalReviews: 0,
    },
  ];

  for (let i = 0; i < servicesData.length && i < 10; i++) {
    const provider = providers[i % providers.length];
    const category = categories[i % categories.length];

    const service = serviceRepository.create({
      ...servicesData[i],
      providerId: provider.id,
      provider: provider,
      categoryId: category.id,
      category: category,
    });

    await serviceRepository.save(service);
    console.log(`✅ Created service: ${servicesData[i].name}`);
  }

  console.log('✅ Services seeding completed');
}