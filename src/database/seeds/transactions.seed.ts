import { DataSource } from 'typeorm';
import { Transaction } from '../../database/entities/transaction.entity';
import { User } from '../../database/entities/user.entity';
import { Wallet } from '../../database/entities/wallet.entity';
import { Booking } from '../../database/entities/booking.entity';
import { TransactionType, Currency } from '../../common/enums/payment.enum';

export async function seedTransactions(dataSource: DataSource): Promise<void> {
  const transactionRepository = dataSource.getRepository(Transaction);
  const userRepository = dataSource.getRepository(User);
  const walletRepository = dataSource.getRepository(Wallet);
  const bookingRepository = dataSource.getRepository(Booking);

  console.log('🔧 Seeding transactions...');

  const users = await userRepository.find({ take: 5 });
  const wallets = await walletRepository.find({ take: 5 });
  const bookings = await bookingRepository.find({ take: 5 });

  if (users.length === 0 || wallets.length === 0) {
    console.log('ℹ️  Users or wallets not found. Please seed them first.');
    return;
  }

  const transactionsData = [
    {
      transactionNumber: 'TXN2025010001',
      type: TransactionType.CREDIT,
      currency: Currency.SAR,
      amount: 500.00,
      balanceBefore: 0,
      balanceAfter: 500.00,
      description: 'Initial wallet credit',
      descriptionAr: 'رصيد المحفظة الأولي',
    },
    {
      transactionNumber: 'TXN2025010002',
      type: TransactionType.DEBIT,
      currency: Currency.SAR,
      amount: 350.00,
      balanceBefore: 500.00,
      balanceAfter: 150.00,
      description: 'Payment for booking BK2025010001',
      descriptionAr: 'دفع للحجز BK2025010001',
    },
    {
      transactionNumber: 'TXN2025010003',
      type: TransactionType.EARNING,
      currency: Currency.SAR,
      amount: 297.50,
      balanceBefore: 3123.25,
      balanceAfter: 3420.75,
      description: 'Earnings from completed service',
      descriptionAr: 'أرباح من الخدمة المكتملة',
    },
    {
      transactionNumber: 'TXN2025010004',
      type: TransactionType.REFUND,
      currency: Currency.SAR,
      amount: 352.50,
      balanceBefore: 150.00,
      balanceAfter: 502.50,
      description: 'Refund for cancelled booking',
      descriptionAr: 'استرداد للحجز الملغى',
    },
    {
      transactionNumber: 'TXN2025010005',
      type: TransactionType.COMMISSION,
      currency: Currency.SAR,
      amount: 52.50,
      balanceBefore: 3420.75,
      balanceAfter: 3368.25,
      description: 'Platform commission deduction',
      descriptionAr: 'خصم عمولة المنصة',
    },
    {
      transactionNumber: 'TXN2025010006',
      type: TransactionType.BONUS,
      currency: Currency.SAR,
      amount: 100.00,
      balanceBefore: 750.00,
      balanceAfter: 850.00,
      description: 'Referral bonus',
      descriptionAr: 'مكافأة الإحالة',
      metadata: {
        referenceId: 'REF2025001',
        notes: 'Bonus for successful referral',
      },
    },
    {
      transactionNumber: 'TXN2025010007',
      type: TransactionType.WITHDRAWAL,
      currency: Currency.SAR,
      amount: 2000.00,
      balanceBefore: 5670.25,
      balanceAfter: 3670.25,
      description: 'Withdrawal to bank account',
      descriptionAr: 'سحب إلى الحساب البنكي',
      metadata: {
        bankName: 'Al Rajhi Bank',
        iban: 'SA0380000000608010167519',
      },
    },
    {
      transactionNumber: 'TXN2025010008',
      type: TransactionType.PENALTY,
      currency: Currency.SAR,
      amount: 50.00,
      balanceBefore: 120.50,
      balanceAfter: 70.50,
      description: 'Penalty for policy violation',
      descriptionAr: 'غرامة لمخالفة السياسة',
      metadata: {
        reason: 'Late cancellation',
      },
    },
  ];

  for (let i = 0; i < transactionsData.length && i < 10; i++) {
    const user = users[i % users.length];
    const wallet = wallets[i % wallets.length];
    const booking = i < bookings.length ? bookings[i] : null;

    const transaction = transactionRepository.create({
      ...transactionsData[i],
      userId: user.id,
      user: user,
      walletId: wallet.id,
      wallet: wallet,
      bookingId: booking?.id,
      paymentId: booking?.paymentId,
    });

    await transactionRepository.save(transaction);
    console.log(`✅ Created transaction: ${transactionsData[i].transactionNumber}`);
  }

  console.log('✅ Transactions seeding completed');
}