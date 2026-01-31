import { DataSource } from 'typeorm';
import { Payment } from '../../database/entities/payment.entity';
import { User } from '../../database/entities/user.entity';
import { Booking } from '../../database/entities/booking.entity';
import { PaymentMethod, PaymentStatus, Currency } from '../../common/enums/payment.enum';

export async function seedPayments(dataSource: DataSource): Promise<void> {
  const paymentRepository = dataSource.getRepository(Payment);
  const userRepository = dataSource.getRepository(User);
  const bookingRepository = dataSource.getRepository(Booking);

  console.log('🔧 Seeding payments...');

  const users = await userRepository.find({ take: 5 });
  const bookings = await bookingRepository.find({ take: 5 });

  if (users.length === 0) {
    console.log('ℹ️  No users found. Please seed users first.');
    return;
  }

  const paymentsData = [
    {
      paymentReference: 'PAY2025010001',
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PAID,
      currency: Currency.SAR,
      amount: 350.00,
      vatAmount: 52.50,
      totalAmount: 402.50,
      fee: 12.08,
      netAmount: 390.42,
      gatewayTransactionId: 'txn_1234567890',
      moyasarPaymentId: 'moy_abc123xyz',
      moyasarSource: {
        type: 'creditcard',
        company: 'visa',
        name: 'Ahmed Ali',
        number: '4111',
      },
      cardBrand: 'Visa',
      cardLastFour: '4111',
      cardExpMonth: '12',
      cardExpYear: '2026',
      authorizedAt: new Date('2025-01-15T09:45:00Z'),
      capturedAt: new Date('2025-01-15T09:45:30Z'),
      isRefundable: true,
      webhookReceived: true,
      webhookVerified: true,
      gateway: 'moyasar',
      paidAt: new Date('2025-01-15T09:45:30Z'),
    },
    {
      paymentReference: 'PAY2025010002',
      method: PaymentMethod.APPLE_PAY,
      status: PaymentStatus.PAID,
      currency: Currency.SAR,
      amount: 200.00,
      vatAmount: 30.00,
      totalAmount: 230.00,
      fee: 6.90,
      netAmount: 223.10,
      gatewayTransactionId: 'txn_2345678901',
      moyasarPaymentId: 'moy_def456uvw',
      authorizedAt: new Date('2025-01-24T13:50:00Z'),
      capturedAt: new Date('2025-01-24T13:50:15Z'),
      isRefundable: true,
      webhookReceived: true,
      webhookVerified: true,
      gateway: 'moyasar',
      paidAt: new Date('2025-01-24T13:50:15Z'),
    },
    {
      paymentReference: 'PAY2025010003',
      method: PaymentMethod.MADA,
      status: PaymentStatus.PAID,
      currency: Currency.SAR,
      amount: 180.00,
      vatAmount: 27.00,
      totalAmount: 207.00,
      fee: 6.21,
      netAmount: 200.79,
      gatewayTransactionId: 'txn_3456789012',
      moyasarPaymentId: 'moy_ghi789rst',
      moyasarSource: {
        type: 'creditcard',
        company: 'mada',
        number: '5123',
      },
      cardBrand: 'Mada',
      cardLastFour: '5123',
      cardExpMonth: '08',
      cardExpYear: '2027',
      authorizedAt: new Date('2025-01-23T14:55:00Z'),
      capturedAt: new Date('2025-01-23T14:55:20Z'),
      isRefundable: true,
      webhookReceived: true,
      webhookVerified: true,
      gateway: 'moyasar',
      paidAt: new Date('2025-01-23T14:55:20Z'),
    },
    {
      paymentReference: 'PAY2025010004',
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.REFUNDED,
      currency: Currency.SAR,
      amount: 350.00,
      vatAmount: 52.50,
      totalAmount: 402.50,
      fee: 12.08,
      netAmount: 390.42,
      refundAmount: 352.50,
      gatewayTransactionId: 'txn_4567890123',
      moyasarPaymentId: 'moy_jkl012mno',
      cardBrand: 'Mastercard',
      cardLastFour: '5454',
      cardExpMonth: '03',
      cardExpYear: '2026',
      authorizedAt: new Date('2025-01-18T11:00:00Z'),
      capturedAt: new Date('2025-01-18T11:00:25Z'),
      refundedAt: new Date('2025-01-19T10:30:00Z'),
      isRefundable: false,
      webhookReceived: true,
      webhookVerified: true,
      gateway: 'moyasar',
      paidAt: new Date('2025-01-18T11:00:25Z'),
    },
    {
      paymentReference: 'PAY2025010005',
      method: PaymentMethod.STC_PAY,
      status: PaymentStatus.PENDING,
      currency: Currency.SAR,
      amount: 180.00,
      vatAmount: 27.00,
      totalAmount: 207.00,
      fee: 6.21,
      netAmount: 200.79,
      stcPayReference: 'stc_xyz789abc',
      isRefundable: true,
      webhookReceived: false,
      webhookVerified: false,
      gateway: 'stc_pay',
    },
    {
      paymentReference: 'PAY2025010006',
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.FAILED,
      currency: Currency.SAR,
      amount: 250.00,
      vatAmount: 37.50,
      totalAmount: 287.50,
      fee: 8.63,
      netAmount: 278.87,
      gatewayTransactionId: 'txn_5678901234',
      failedAt: new Date('2025-01-22T16:30:00Z'),
      failureCode: 'insufficient_funds',
      failureMessage: 'Insufficient funds in account',
      isRefundable: false,
      webhookReceived: true,
      webhookVerified: true,
      gateway: 'moyasar',
    },
  ];

  for (let i = 0; i < paymentsData.length && i < 10; i++) {
    const user = users[i % users.length];
    const booking = i < bookings.length ? bookings[i] : null;

    const payment = paymentRepository.create({
  ...paymentsData[i],

  userId: user.id,
  bookingId: booking?.id
});



    // const payment = paymentRepository.create({
    //   ...paymentsData[i],
    //   userId: user.id,
    //   user: user,
    //   bookingId: booking?.id,
    //   booking: booking,
    // });

    await paymentRepository.save(payment);
    console.log(`✅ Created payment: ${paymentsData[i].paymentReference}`);
  }

  console.log('✅ Payments seeding completed');
}