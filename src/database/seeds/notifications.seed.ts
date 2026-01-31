import { DataSource } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { User } from '../../database/entities/user.entity';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '../../common/enums/notification.enum';

export async function seedNotifications(dataSource: DataSource): Promise<void> {
  const notificationRepository = dataSource.getRepository(Notification);
  const userRepository = dataSource.getRepository(User);

  console.log('🔧 Seeding notifications...');

  const users = await userRepository.find({ take: 5 });

  if (users.length === 0) {
    console.log('ℹ️  No users found. Please seed users first.');
    return;
  }

  const notificationsData = [
    {
      type: NotificationType.BOOKING_CONFIRMED,
      channel: NotificationChannel.PUSH,
      priority: NotificationPriority.HIGH,
      status: NotificationStatus.DELIVERED,
      title: 'Booking Confirmed',
      titleAr: 'تم تأكيد الحجز',
      message: 'Your booking #BK2025010003 has been confirmed for January 26 at 9:00 AM',
      messageAr: 'تم تأكيد حجزك #BK2025010003 ليوم 26 يناير الساعة 9:00 صباحاً',
      actionUrl: '/bookings/BK2025010003',
      actionLabel: 'View Booking',
      actionLabelAr: 'عرض الحجز',
      sentAt: new Date('2025-01-23T15:00:00Z'),
      deliveredAt: new Date('2025-01-23T15:00:05Z'),
      readAt: new Date('2025-01-23T15:10:00Z'),
      isRead: true,
      fcmMessageId: 'fcm_msg_001',
    },
    {
      type: NotificationType.PAYMENT_SUCCESS,
      channel: NotificationChannel.PUSH,
      priority: NotificationPriority.HIGH,
      status: NotificationStatus.DELIVERED,
      title: 'Payment Successful',
      titleAr: 'تم الدفع بنجاح',
      message: 'Your payment of 402.50 SAR has been processed successfully',
      messageAr: 'تم معالجة دفعتك بقيمة 402.50 ريال بنجاح',
      actionUrl: '/payments/PAY2025010001',
      actionLabel: 'View Receipt',
      actionLabelAr: 'عرض الإيصال',
      sentAt: new Date('2025-01-15T09:45:35Z'),
      deliveredAt: new Date('2025-01-15T09:45:40Z'),
      readAt: new Date('2025-01-15T10:00:00Z'),
      isRead: true,
      fcmMessageId: 'fcm_msg_002',
    },
    {
      type: NotificationType.PROVIDER_ASSIGNED,
      channel: NotificationChannel.PUSH,
      priority: NotificationPriority.MEDIUM,
      status: NotificationStatus.DELIVERED,
      title: 'Provider Assigned',
      titleAr: 'تم تعيين مقدم الخدمة',
      message: 'Mohammed Salem has been assigned to your booking',
      messageAr: 'تم تعيين محمد سالم لحجزك',
      actionUrl: '/bookings/BK2025010002',
      actionLabel: 'Track Provider',
      actionLabelAr: 'تتبع مقدم الخدمة',
      sentAt: new Date('2025-01-23T10:15:00Z'),
      deliveredAt: new Date('2025-01-23T10:15:03Z'),
      isRead: false,
      fcmMessageId: 'fcm_msg_003',
    },
    {
      type: NotificationType.BOOKING_COMPLETED,
      channel: NotificationChannel.PUSH,
      priority: NotificationPriority.MEDIUM,
      status: NotificationStatus.DELIVERED,
      title: 'Service Completed',
      titleAr: 'تم إكمال الخدمة',
      message: 'Your service has been completed. Please rate your experience!',
      messageAr: 'تم إكمال خدمتك. يرجى تقييم تجربتك!',
      actionUrl: '/bookings/BK2025010001/review',
      actionLabel: 'Rate Service',
      actionLabelAr: 'تقييم الخدمة',
      sentAt: new Date('2025-01-15T13:05:00Z'),
      deliveredAt: new Date('2025-01-15T13:05:02Z'),
      readAt: new Date('2025-01-15T13:30:00Z'),
      isRead: true,
      fcmMessageId: 'fcm_msg_004',
    },
    {
      type: NotificationType.PROMO_CODE_AVAILABLE,
      channel: NotificationChannel.PUSH,
      priority: NotificationPriority.LOW,
      status: NotificationStatus.DELIVERED,
      title: 'Special Offer!',
      titleAr: 'عرض خاص!',
      message: 'Get 20% off your next booking with code WELCOME2025',
      messageAr: 'احصل على خصم 20٪ على حجزك التالي باستخدام الرمز WELCOME2025',
      actionUrl: '/promotions',
      actionLabel: 'View Offers',
      actionLabelAr: 'عرض العروض',
      sentAt: new Date('2025-01-20T10:00:00Z'),
      deliveredAt: new Date('2025-01-20T10:00:05Z'),
      isRead: false,
      fcmMessageId: 'fcm_msg_005',
    },
    {
      type: NotificationType.BOOKING_REMINDER,
      channel: NotificationChannel.SMS,
      priority: NotificationPriority.HIGH,
      status: NotificationStatus.SENT,
      title: 'Booking Reminder',
      titleAr: 'تذكير بالحجز',
      message: 'Reminder: Your service is scheduled for tomorrow at 9:00 AM',
      messageAr: 'تذكير: خدمتك مجدولة لغداً الساعة 9:00 صباحاً',
      sentAt: new Date('2025-01-25T18:00:00Z'),
      isRead: false,
      smsStatus: 'delivered',
    },
    {
      type: NotificationType.REFUND_PROCESSED,
      channel: NotificationChannel.PUSH,
      priority: NotificationPriority.HIGH,
      status: NotificationStatus.DELIVERED,
      title: 'Refund Processed',
      titleAr: 'تمت معالجة الاسترداد',
      message: 'Your refund of 352.50 SAR has been processed to your wallet',
      messageAr: 'تمت معالجة استرداد مبلغ 352.50 ريال إلى محفظتك',
      actionUrl: '/wallet',
      actionLabel: 'View Wallet',
      actionLabelAr: 'عرض المحفظة',
      sentAt: new Date('2025-01-19T10:30:05Z'),
      deliveredAt: new Date('2025-01-19T10:30:08Z'),
      readAt: new Date('2025-01-19T11:00:00Z'),
      isRead: true,
      fcmMessageId: 'fcm_msg_006',
    },
    {
      type: NotificationType.NEW_MESSAGE,
      channel: NotificationChannel.PUSH,
      priority: NotificationPriority.MEDIUM,
      status: NotificationStatus.PENDING,
      title: 'New Message',
      titleAr: 'رسالة جديدة',
      message: 'You have a new message from your service provider',
      messageAr: 'لديك رسالة جديدة من مقدم الخدمة',
      actionUrl: '/messages',
      actionLabel: 'View Message',
      actionLabelAr: 'عرض الرسالة',
      isRead: false,
    },
  ];

  for (let i = 0; i < notificationsData.length && i < 10; i++) {
    const user = users[i % users.length];

    const notification = notificationRepository.create({
      ...notificationsData[i],
      userId: user.id,
      user: user,
    });

    await notificationRepository.save(notification);
    console.log(`✅ Created notification: ${notificationsData[i].type}`);
  }

  console.log('✅ Notifications seeding completed');
}