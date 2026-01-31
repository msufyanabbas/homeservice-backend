import { DataSource } from 'typeorm';
import { ServiceCategory } from '../../database/entities/service-category.entity';

export async function seedServiceCategories(
  dataSource: DataSource,
): Promise<void> {
  const categoryRepository = dataSource.getRepository(ServiceCategory);

  console.log('🔧 Seeding service categories...');

  const categories = [
    {
      name: 'Cleaning Services',
      nameAr: 'خدمات التنظيف',
      slug: 'cleaning',
      description: 'Professional cleaning services for homes and offices',
      descriptionAr: 'خدمات تنظيف احترافية للمنازل والمكاتب',
      icon: 'cleaning-icon.svg',
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Plumbing Services',
      nameAr: 'خدمات السباكة',
      slug: 'plumbing',
      description: 'Expert plumbing repairs and installations',
      descriptionAr: 'إصلاحات وتركيبات السباكة المتخصصة',
      icon: 'plumbing-icon.svg',
      displayOrder: 2,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Electrical Services',
      nameAr: 'الخدمات الكهربائية',
      slug: 'electrical',
      description: 'Licensed electricians for all your electrical needs',
      descriptionAr: 'كهربائيون مرخصون لجميع احتياجاتك الكهربائية',
      icon: 'electrical-icon.svg',
      displayOrder: 3,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'AC Maintenance',
      nameAr: 'صيانة المكيفات',
      slug: 'ac-maintenance',
      description: 'Air conditioning repair and maintenance services',
      descriptionAr: 'خدمات إصلاح وصيانة أجهزة تكييف الهواء',
      icon: 'ac-icon.svg',
      displayOrder: 4,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Carpentry',
      nameAr: 'النجارة',
      slug: 'carpentry',
      description: 'Skilled carpenters for furniture and woodwork',
      descriptionAr: 'نجارون ماهرون للأثاث والأعمال الخشبية',
      icon: 'carpentry-icon.svg',
      displayOrder: 5,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Painting',
      nameAr: 'الدهانات',
      slug: 'painting',
      description: 'Professional painting services for homes and offices',
      descriptionAr: 'خدمات دهان احترافية للمنازل والمكاتب',
      icon: 'painting-icon.svg',
      displayOrder: 6,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Appliance Repair',
      nameAr: 'إصلاح الأجهزة',
      slug: 'appliance-repair',
      description: 'Repair services for home appliances',
      descriptionAr: 'خدمات إصلاح الأجهزة المنزلية',
      icon: 'appliance-icon.svg',
      displayOrder: 7,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Pest Control',
      nameAr: 'مكافحة الحشرات',
      slug: 'pest-control',
      description: 'Professional pest control and prevention',
      descriptionAr: 'مكافحة ومنع الآفات المهنية',
      icon: 'pest-icon.svg',
      displayOrder: 8,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Moving Services',
      nameAr: 'خدمات النقل',
      slug: 'moving',
      description: 'Reliable moving and packing services',
      descriptionAr: 'خدمات نقل وتعبئة موثوقة',
      icon: 'moving-icon.svg',
      displayOrder: 9,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Gardening',
      nameAr: 'البستنة',
      slug: 'gardening',
      description: 'Garden maintenance and landscaping',
      descriptionAr: 'صيانة الحدائق وتنسيق المناظر الطبيعية',
      icon: 'garden-icon.svg',
      displayOrder: 10,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Car Wash',
      nameAr: 'غسيل السيارات',
      slug: 'car-wash',
      description: 'Professional car washing and detailing',
      descriptionAr: 'غسيل وتفصيل السيارات الاحترافي',
      icon: 'car-wash-icon.svg',
      displayOrder: 11,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Laundry',
      nameAr: 'المغسلة',
      slug: 'laundry',
      description: 'Laundry and dry cleaning services',
      descriptionAr: 'خدمات الغسيل والتنظيف الجاف',
      icon: 'laundry-icon.svg',
      displayOrder: 12,
      isActive: true,
      isFeatured: false,
    },
  ];

  for (const categoryData of categories) {
    // Check if category already exists
    const existing = await categoryRepository.findOne({
      where: { slug: categoryData.slug },
    });

    if (!existing) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`✅ Created category: ${categoryData.name}`);
    } else {
      console.log(`ℹ️  Category already exists: ${categoryData.name}`);
    }
  }

  console.log('✅ Service categories seeding completed');
}