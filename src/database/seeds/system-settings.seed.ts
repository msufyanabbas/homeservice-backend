import { DataSource } from 'typeorm';
import { SystemSetting } from '../../database/entities/system-setting.entity';

export async function seedSystemSettings(dataSource: DataSource): Promise<void> {
  const settingRepository = dataSource.getRepository(SystemSetting);

  console.log('🔧 Seeding system settings...');

  const settings = [
    {
      key: 'app.name',
      value: 'Home Services',
      valueType: 'STRING',
      category: 'GENERAL',
      description: 'Application name',
      descriptionAr: 'اسم التطبيق',
      isPublic: true,
      isEncrypted: false,
      isEditable: true,
      displayOrder: 1,
    },
    {
      key: 'app.vat_rate',
      value: '15',
      valueType: 'NUMBER',
      category: 'GENERAL',
      description: 'VAT percentage rate',
      descriptionAr: 'نسبة ضريبة القيمة المضافة',
      isPublic: true,
      isEncrypted: false,
      isEditable: true,
      validationRules: {
        min: 0,
        max: 100,
      },
      defaultValue: '15',
      displayOrder: 2,
    },
    {
      key: 'booking.min_advance_hours',
      value: '2',
      valueType: 'NUMBER',
      category: 'BOOKING',
      description: 'Minimum hours required to book in advance',
      descriptionAr: 'الحد الأدنى من الساعات المطلوبة للحجز المسبق',
      isPublic: true,
      isEncrypted: false,
      isEditable: true,
      validationRules: {
        min: 1,
        max: 72,
      },
      defaultValue: '2',
      displayOrder: 1,
    },
    {
      key: 'booking.cancellation_fee_percentage',
      value: '10',
      valueType: 'NUMBER',
      category: 'BOOKING',
      description: 'Cancellation fee as percentage of booking amount',
      descriptionAr: 'رسوم الإلغاء كنسبة مئوية من مبلغ الحجز',
      isPublic: false,
      isEncrypted: false,
      isEditable: true,
      validationRules: {
        min: 0,
        max: 50,
      },
      defaultValue: '10',
      displayOrder: 2,
    },
    {
      key: 'payment.moyasar_api_key',
      value: 'pk_test_xxxxxxxxxxxxx',
      valueType: 'STRING',
      category: 'PAYMENT',
      description: 'Moyasar payment gateway API key',
      descriptionAr: 'مفتاح API لبوابة الدفع Moyasar',
      isPublic: false,
      isEncrypted: true,
      isEditable: true,
      requiresRestart: true,
      displayOrder: 1,
    },
    {
      key: 'payment.commission_rate',
      value: '15',
      valueType: 'NUMBER',
      category: 'PAYMENT',
      description: 'Platform commission rate percentage',
      descriptionAr: 'نسبة عمولة المنصة',
      isPublic: false,
      isEncrypted: false,
      isEditable: true,
      validationRules: {
        min: 5,
        max: 30,
      },
      defaultValue: '15',
      displayOrder: 2,
    },
    {
      key: 'notification.fcm_enabled',
      value: 'true',
      valueType: 'BOOLEAN',
      category: 'NOTIFICATION',
      description: 'Enable Firebase Cloud Messaging notifications',
      descriptionAr: 'تفعيل إشعارات Firebase',
      isPublic: false,
      isEncrypted: false,
      isEditable: true,
      defaultValue: 'true',
      displayOrder: 1,
    },
    {
      key: 'notification.sms_enabled',
      value: 'true',
      valueType: 'BOOLEAN',
      category: 'NOTIFICATION',
      description: 'Enable SMS notifications',
      descriptionAr: 'تفعيل إشعارات الرسائل النصية',
      isPublic: false,
      isEncrypted: false,
      isEditable: true,
      defaultValue: 'true',
      displayOrder: 2,
    },
    {
      key: 'provider.trial_period_days',
      value: '7',
      valueType: 'NUMBER',
      category: 'PROVIDER',
      description: 'Provider trial period in days',
      descriptionAr: 'فترة التجربة لمقدم الخدمة بالأيام',
      isPublic: false,
      isEncrypted: false,
      isEditable: true,
      validationRules: {
        min: 0,
        max: 30,
      },
      defaultValue: '7',
      displayOrder: 1,
    },
    {
      key: 'support.contact_email',
      value: 'support@homeservices.sa',
      valueType: 'STRING',
      category: 'GENERAL',
      description: 'Customer support contact email',
      descriptionAr: 'البريد الإلكتروني لدعم العملاء',
      isPublic: true,
      isEncrypted: false,
      isEditable: true,
      validationRules: {
        regex: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
      },
      displayOrder: 3,
    },
  ];

  for (const settingData of settings) {
    // Check if setting already exists
    const existing = await settingRepository.findOne({
      where: { key: settingData.key },
    });

    if (!existing) {
      const setting = settingRepository.create(settingData);
      await settingRepository.save(setting);
      console.log(`✅ Created system setting: ${settingData.key}`);
    } else {
      console.log(`ℹ️  System setting already exists: ${settingData.key}`);
    }
  }

  console.log('✅ System settings seeding completed');
}