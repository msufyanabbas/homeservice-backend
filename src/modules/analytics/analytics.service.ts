import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '@database/entities/booking.entity';
import { Payment } from '@database/entities/payment.entity';
import { Provider } from '@database/entities/provider.entity';
import { BookingStatus } from '@/common/enums/booking.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Provider) private readonly providerRepository: Repository<Provider>,
  ) {}

  async getProviderDashboard(userId: string, startDate?: string, endDate?: string) {
    const provider: any = await this.providerRepository.findOne({ where: { userId } });
    
    const query = this.bookingRepository.createQueryBuilder('booking')
      .where('booking.providerId = :providerId', { providerId: provider.id });

    if (startDate && endDate) {
      query.andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const totalBookings = await query.getCount();
    const completedBookings = await query.clone().andWhere('booking.status = :status', { status: 'COMPLETED' }).getCount();

    return {
      totalBookings,
      completedBookings,
      averageRating: provider.averageRating,
      totalEarnings: provider.totalEarnings,
    };
  }

  async getProviderPerformance(userId: string, period?: string) {
    const provider: any = await this.providerRepository.findOne({ where: { userId } });
    
    return {
      completionRate: provider.completionRate,
      acceptanceRate: provider.acceptanceRate,
      averageRating: provider.averageRating,
      responseTime: 0, // TODO: Calculate
    };
  }

  async getProviderEarnings(userId: string, startDate?: string, endDate?: string, groupBy?: string) {
    const provider: any = await this.providerRepository.findOne({ where: { userId } });
    
    return {
      totalEarnings: provider.totalEarnings,
      pendingEarnings: provider.pendingEarnings,
    };
  }

  async getCustomerSummary(userId: string) {
    const totalBookings = await this.bookingRepository.count({
      where: { customerId: userId },
    });

    const completedBookings = await this.bookingRepository.count({
      where: { customerId: userId, status: BookingStatus.COMPLETED },
    });

    return {
      totalBookings,
      completedBookings,
    };
  }

  async getCustomerSpending(userId: string, startDate?: string, endDate?: string) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.userId = :userId', { userId })
      .andWhere('payment.status = :status', { status: 'COMPLETED' });

    if (startDate && endDate) {
      query.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const result = await query.getRawOne();
    return { totalSpending: result?.total || 0 };
  }
}