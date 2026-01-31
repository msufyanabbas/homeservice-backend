import { DataSource } from 'typeorm';
import { Booking } from '../../database/entities/booking.entity';
import { User } from '../../database/entities/user.entity';
import { Provider } from '../../database/entities/provider.entity';
import { Service } from '../../database/entities/service.entity';
import { UserRole } from '../../common/enums/user.enum';
import {
  BookingStatus,
  BookingPaymentStatus,
  BookingPriority,
  ScheduleType,
} from '../../common/enums/booking.enum';

export async function seedBookings(dataSource: DataSource): Promise<void> {
  const bookingRepository = dataSource.getRepository(Booking);
  const userRepository = dataSource.getRepository(User);
  const providerRepository = dataSource.getRepository(Provider);
  const serviceRepository = dataSource.getRepository(Service);

  console.log('🔧 Seeding bookings...');

  const customers = await userRepository.find({
    where: { role: UserRole.CUSTOMER },
    take: 5,
  });

  const providers = await providerRepository.find({ take: 3 });
  const services = await serviceRepository.find({ take: 5 });

  if (customers.length === 0 || services.length === 0) {
    console.log('ℹ️  Customers or services not found. Please seed them first.');
    return;
  }

  const bookingsData = [
    {
      bookingNumber: 'BK2025010001',
      status: BookingStatus.COMPLETED,
      paymentStatus: BookingPaymentStatus.PAID,
      priority: BookingPriority.NORMAL,
      scheduleType: ScheduleType.SCHEDULED,
      scheduledAt: new Date('2025-01-15T10:00:00Z'),
      startedAt: new Date('2025-01-15T10:05:00Z'),
      completedAt: new Date('2025-01-15T13:00:00Z'),
      estimatedDurationMinutes: 180,
      actualDurationMinutes: 175,
      serviceAddress: {
        street: 'King Fahd Road',
        building: 'Building 123',
        floor: '3',
        apartment: '301',
        city: 'Riyadh',
        district: 'Al-Olaya',
        postalCode: '12211',
        latitude: 24.7136,
        longitude: 46.6753,
      },
      servicePrice: 350.00,
      additionalCharges: 0,
      discountAmount: 0,
      vatAmount: 52.50,
      totalAmount: 402.50,
      platformCommission: 52.50,
      providerEarnings: 297.50,
      customerName: 'Ahmed Ali',
      customerPhone: '+966501234567',
      isReviewed: true,
      customerRating: 5,
    },
    {
      bookingNumber: 'BK2025010002',
      status: BookingStatus.IN_PROGRESS,
      paymentStatus: BookingPaymentStatus.PAID,
      priority: BookingPriority.HIGH,
      scheduleType: ScheduleType.SCHEDULED,
      scheduledAt: new Date('2025-01-24T14:00:00Z'),
      startedAt: new Date('2025-01-24T14:10:00Z'),
      estimatedDurationMinutes: 90,
      serviceAddress: {
        street: 'Prince Mohammed Bin Abdulaziz Road',
        building: 'Tower 45',
        floor: '12',
        city: 'Riyadh',
        district: 'Al-Sahafa',
        latitude: 24.7748,
        longitude: 46.6977,
      },
      servicePrice: 150.00,
      additionalCharges: 50.00,
      discountAmount: 0,
      vatAmount: 30.00,
      totalAmount: 230.00,
      platformCommission: 30.00,
      providerEarnings: 170.00,
      customerName: 'Fatima Mohammed',
      customerPhone: '+966502345678',
      providerAssignedAt: new Date('2025-01-23T10:00:00Z'),
      providerAcceptedAt: new Date('2025-01-23T10:15:00Z'),
      providerEnRouteAt: new Date('2025-01-24T13:45:00Z'),
      providerArrivedAt: new Date('2025-01-24T14:10:00Z'),
      isReviewed: false,
    },
    {
      bookingNumber: 'BK2025010003',
      status: BookingStatus.CONFIRMED,
      paymentStatus: BookingPaymentStatus.PAID,
      priority: BookingPriority.NORMAL,
      scheduleType: ScheduleType.SCHEDULED,
      scheduledAt: new Date('2025-01-26T09:00:00Z'),
      estimatedDurationMinutes: 120,
      serviceAddress: {
        street: 'Makkah Road',
        city: 'Riyadh',
        district: 'Al-Naseem',
        latitude: 24.6877,
        longitude: 46.7219,
      },
      servicePrice: 200.00,
      additionalCharges: 0,
      discountAmount: 20.00,
      vatAmount: 27.00,
      totalAmount: 207.00,
      platformCommission: 27.00,
      providerEarnings: 153.00,
      customerName: 'Omar Khalid',
      customerPhone: '+966505678901',
      confirmedAt: new Date('2025-01-23T15:00:00Z'),
      providerAssignedAt: new Date('2025-01-23T14:30:00Z'),
      providerAcceptedAt: new Date('2025-01-23T14:45:00Z'),
      isReviewed: false,
    },
    {
      bookingNumber: 'BK2025010004',
      status: BookingStatus.CANCELLED,
      paymentStatus: BookingPaymentStatus.REFUNDED,
      priority: BookingPriority.NORMAL,
      scheduleType: ScheduleType.SCHEDULED,
      scheduledAt: new Date('2025-01-20T16:00:00Z'),
      cancelledAt: new Date('2025-01-19T10:00:00Z'),
      estimatedDurationMinutes: 180,
      serviceAddress: {
        street: 'King Abdullah Road',
        city: 'Riyadh',
        district: 'Al-Malqa',
        latitude: 24.8247,
        longitude: 46.6458,
      },
      servicePrice: 350.00,
      additionalCharges: 0,
      discountAmount: 0,
      vatAmount: 52.50,
      totalAmount: 402.50,
      cancellationFee: 50.00,
      refundAmount: 352.50,
      platformCommission: 0,
      providerEarnings: 0,
      customerName: 'Layla Omar',
      customerPhone: '+966506789012',
      cancelledBy: '',
      cancellationReason: 'Customer changed plans',
      refundStatus: 'COMPLETED',
      isReviewed: false,
    },
    {
      bookingNumber: 'BK2025010005',
      status: BookingStatus.PENDING,
      paymentStatus: BookingPaymentStatus.PENDING,
      priority: BookingPriority.URGENT,
      scheduleType: ScheduleType.IMMEDIATE,
      scheduledAt: new Date('2025-01-24T18:00:00Z'),
      estimatedDurationMinutes: 90,
      serviceAddress: {
        street: 'Northern Ring Road',
        city: 'Riyadh',
        district: 'Al-Nakheel',
        latitude: 24.8055,
        longitude: 46.7180,
      },
      servicePrice: 180.00,
      additionalCharges: 30.00,
      discountAmount: 0,
      vatAmount: 31.50,
      totalAmount: 241.50,
      platformCommission: 0,
      providerEarnings: 0,
      customerName: 'Mohammed Salem',
      customerPhone: '+966507890123',
      isReviewed: false,
    },
  ];

  for (let i = 0; i < bookingsData.length; i++) {
    const customer = customers[i % customers.length];
    const service = services[i % services.length];
    const provider = providers.length > 0 ? providers[i % providers.length] : null;

    const booking = bookingRepository.create({
      ...bookingsData[i],
      customerId: customer.id,
      customer: customer,
      serviceId: service.id,
      service: service,
      providerId: provider?.id,
      cancelledBy: bookingsData[i].cancelledBy ? customer.id : undefined,
    });

    await bookingRepository.save(booking);
    console.log(`✅ Created booking: ${bookingsData[i].bookingNumber}`);
  }

  console.log('✅ Bookings seeding completed');
}