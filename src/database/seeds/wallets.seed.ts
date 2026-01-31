import { DataSource } from 'typeorm';
import { Wallet } from '../../database/entities/wallet.entity';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../common/enums/user.enum';

export async function seedWallets(dataSource: DataSource): Promise<void> {
  const walletRepository = dataSource.getRepository(Wallet);
  const userRepository = dataSource.getRepository(User);

  console.log('🔧 Seeding wallets...');

  // Get all users to create wallets for them
  const users = await userRepository.find({
    take: 10,
    order: { createdAt: 'ASC' },
  });

  if (users.length === 0) {
    console.log('ℹ️  No users found. Please seed users first.');
    return;
  }

  const walletData = [
    {
      balance: 500.00,
      pendingBalance: 0,
      totalCredited: 1200.00,
      totalDebited: 700.00,
      isActive: true,
      isLocked: false,
      lastTransactionAt: new Date('2025-01-20'),
    },
    {
      balance: 1250.50,
      pendingBalance: 200.00,
      totalCredited: 3500.00,
      totalDebited: 2049.50,
      isActive: true,
      isLocked: false,
      lastTransactionAt: new Date('2025-01-22'),
    },
    {
      balance: 3420.75,
      pendingBalance: 850.00,
      totalCredited: 15680.00,
      totalDebited: 11409.25,
      isActive: true,
      isLocked: false,
      lastTransactionAt: new Date('2025-01-23'),
    },
    {
      balance: 2890.00,
      pendingBalance: 450.00,
      totalCredited: 12340.00,
      totalDebited: 9000.00,
      isActive: true,
      isLocked: false,
      lastTransactionAt: new Date('2025-01-24'),
    },
    {
      balance: 150.00,
      pendingBalance: 0,
      totalCredited: 150.00,
      totalDebited: 0,
      isActive: true,
      isLocked: false,
      lastTransactionAt: new Date('2025-01-15'),
    },
    {
      balance: 0,
      pendingBalance: 0,
      totalCredited: 0,
      totalDebited: 0,
      isActive: true,
      isLocked: false,
    },
    {
      balance: 5670.25,
      pendingBalance: 1200.00,
      totalCredited: 28450.00,
      totalDebited: 21579.75,
      isActive: true,
      isLocked: false,
      lastTransactionAt: new Date('2025-01-24'),
    },
    {
      balance: 750.00,
      pendingBalance: 0,
      totalCredited: 2100.00,
      totalDebited: 1350.00,
      isActive: true,
      isLocked: false,
      lastTransactionAt: new Date('2025-01-21'),
    },
    {
      balance: 120.50,
      pendingBalance: 0,
      totalCredited: 1840.00,
      totalDebited: 1719.50,
      isActive: false,
      isLocked: true,
      lockedReason: 'Account suspended due to policy violations',
      lockedAt: new Date('2025-01-10'),
      lastTransactionAt: new Date('2025-01-08'),
    },
    {
      balance: 980.00,
      pendingBalance: 100.00,
      totalCredited: 4250.00,
      totalDebited: 3270.00,
      isActive: true,
      isLocked: false,
      lastTransactionAt: new Date('2025-01-23'),
    },
  ];

  for (let i = 0; i < users.length && i < walletData.length; i++) {
    const user = users[i];
    
    // Check if wallet already exists for this user
    const existing = await walletRepository.findOne({
      where: { userId: user.id },
    });

    if (!existing) {
      const wallet = walletRepository.create({
        ...walletData[i],
        userId: user.id,
        user: user,
      });
      
      await walletRepository.save(wallet);
      console.log(`✅ Created wallet for user: ${user.firstName} ${user.lastName} (Balance: ${walletData[i].balance} SAR)`);
    } else {
      console.log(`ℹ️  Wallet already exists for user: ${user.firstName} ${user.lastName}`);
    }
  }

  console.log('✅ Wallets seeding completed');
}