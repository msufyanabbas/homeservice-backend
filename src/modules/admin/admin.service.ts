import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@database/entities/user.entity';
import { Provider } from '@database/entities/provider.entity';
import { Booking } from '@database/entities/booking.entity';
import { Payment } from '@database/entities/payment.entity';
import { ProviderDocument } from '@database/entities/provider-document.entity';
import { AuditLog } from '@database/entities/audit-log.entity';
import { SystemSetting } from '@database/entities/system-setting.entity';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';
import { ProviderStatus, ProviderVerificationStatus } from '@/common/enums/provider.enum';
import { BookingStatus } from '@/common/enums/booking.enum';
import { UserStatus } from '@/common/enums/user.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Provider) private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(ProviderDocument) private readonly providerDocumentRepository: Repository<ProviderDocument>,
    @InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(SystemSetting) private readonly systemSettingRepository: Repository<SystemSetting>,
  ) {}

  async getDashboard(period?: string) {
    const totalUsers = await this.userRepository.count();
    const totalProviders = await this.providerRepository.count();
    const totalBookings = await this.bookingRepository.count();
    const completedBookings = await this.bookingRepository.count({ where: { status: BookingStatus.COMPLETED } });

    const revenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: BookingStatus.COMPLETED})
      .getRawOne();

    return {
      totalUsers,
      totalProviders,
      totalBookings,
      completedBookings,
      totalRevenue: revenue?.total || 0,
    };
  }

  async getStatistics(startDate?: string, endDate?: string) {
    return {
      users: await this.userRepository.count(),
      providers: await this.providerRepository.count(),
      bookings: await this.bookingRepository.count(),
      revenue: 0,
    };
  }

  async getRevenue(startDate?: string, endDate?: string, groupBy?: string) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: 'COMPLETED' });

    if (startDate && endDate) {
      query.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const result = await query.getRawOne();
    return { total: result?.total || 0 };
  }

  async getPendingProviders(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const [providers, total] = await this.providerRepository.findAndCount({
      where: { status: ProviderStatus.PENDING_APPROVAL },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginatedResponse(providers, total, page, limit);
  }

  async approveProvider(adminId: string, providerId: string) {
    const provider: any = await this.providerRepository.findOne({ where: { id: providerId } });
    provider.status = ProviderStatus.ACTIVE;
    provider.approvedAt = new Date();
    provider.approvedBy = adminId;
    await this.providerRepository.save(provider);
    return { message: 'Provider approved' };
  }

  async rejectProvider(providerId: string, reason: string) {
    const provider: any = await this.providerRepository.findOne({ where: { id: providerId } });
    provider.status = ProviderStatus.REJECTED;
    provider.rejectionReason = reason;
    await this.providerRepository.save(provider);
    return { message: 'Provider rejected' };
  }

  async getPendingDocuments(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const [documents, total] = await this.providerDocumentRepository.findAndCount({
      where: { verificationStatus: ProviderVerificationStatus.PENDING},
      relations: ['provider'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginatedResponse(documents, total, page, limit);
  }

  async verifyDocument(adminId: string, documentId: string) {
    const document: any = await this.providerDocumentRepository.findOne({ where: { id: documentId } });
    document.verificationStatus = ProviderVerificationStatus.VERIFIED;
    document.verifiedBy = adminId;
    document.verifiedAt = new Date();
    await this.providerDocumentRepository.save(document);
    return { message: 'Document verified' };
  }

  async rejectDocument(documentId: string, reason: string) {
    const document: any = await this.providerDocumentRepository.findOne({ where: { id: documentId } });
    document.verificationStatus = 'REJECTED';
    document.rejectionReason = reason;
    await this.providerDocumentRepository.save(document);
    return { message: 'Document rejected' };
  }

  async getSettings(category?: string) {
    const query: any = {};
    if (category) query.category = category;
    
    return await this.systemSettingRepository.find({
      where: query,
      order: { displayOrder: 'ASC' },
    });
  }

  async updateSetting(key: string, updateSystemSettingDto: UpdateSystemSettingDto) {
    let setting = await this.systemSettingRepository.findOne({ where: { key } });
    
    if (!setting) {
      setting = this.systemSettingRepository.create({ key, ...updateSystemSettingDto });
    } else {
      Object.assign(setting, updateSystemSettingDto);
    }

    await this.systemSettingRepository.save(setting);
    return setting;
  }

  async getAuditLogs(filter: any, paginationDto?: PaginationDto) {
    const { page = 1, limit = 50 } = paginationDto || {};
    const query = this.auditLogRepository.createQueryBuilder('log');

    if (filter.action) query.where('log.action = :action', { action: filter.action });
    if (filter.entityType) query.andWhere('log.entityType = :entityType', { entityType: filter.entityType });
    if (filter.userId) query.andWhere('log.userId = :userId', { userId: filter.userId });

    const [logs, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('log.createdAt', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(logs, total, page, limit);
  }

  async getBookingsReport(startDate: string, endDate: string, format?: string) {
    // TODO: Generate report
    return { message: 'Report generation not implemented yet' };
  }

  async getRevenueReport(startDate: string, endDate: string, format?: string) {
    // TODO: Generate report
    return { message: 'Report generation not implemented yet' };
  }

  async getProvidersReport(format?: string) {
    // TODO: Generate report
    return { message: 'Report generation not implemented yet' };
  }

  async banUser(userId: string, reason: string) {
    const user: any = await this.userRepository.findOne({ where: { id: userId } });
    user.status = UserStatus.BANNED;
    await this.userRepository.save(user);
    return { message: 'User banned' };
  }

  async unbanUser(userId: string) {
    const user: any = await this.userRepository.findOne({ where: { id: userId } });
    user.status = UserStatus.ACTIVE;
    await this.userRepository.save(user);
    return { message: 'User unbanned' };
  }

  async getTrends(metric: string, period?: string) {
    // TODO: Implement trends analysis
    return { metric, data: [] };
  }
}