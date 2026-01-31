import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import { Booking } from '@database/entities/booking.entity';
import { BookingTimeline } from '@database/entities/booking-timeline.entity';
import { Provider } from '@database/entities/provider.entity';
import { Service } from '@database/entities/service.entity';
import { User } from '@database/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { AcceptBookingDto } from './dto/accept-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { CompleteBookingDto } from './dto/complete-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';
import { BookingStatus } from '@common/enums/booking.enum';
import { UserRole } from '@common/enums/user.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingTimeline)
    private readonly timelineRepository: Repository<BookingTimeline>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { serviceId, scheduledDate, scheduledTime, ...rest } = createBookingDto;

    // Validate service
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
      relations: ['provider'],
    });

    if (!service || !service.isActive) {
      throw new NotFoundException('Service not found or not available');
    }

    // Generate booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Calculate pricing
    const basePrice = service.basePrice;
    const tax = basePrice * 0.15; // 15% VAT
    const totalAmount = basePrice + tax;

    // Create booking
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

const booking = this.bookingRepository.create({
  bookingNumber,
  customerId: userId,
  providerId: service.providerId,
  serviceId,

  scheduledAt, // ✅ ONLY this — not scheduledDate/time

  status: BookingStatus.PENDING,

  // Pricing (use correct entity field names)
  servicePrice: basePrice,      // instead of basePrice
  vatAmount: tax,               // instead of tax
  totalAmount,

  ...rest, // ⚠️ make sure rest does NOT contain unknown fields
});


    await this.bookingRepository.save(booking);

    // Create timeline entry
    await this.createTimelineEntry(booking.id, BookingStatus.PENDING, userId, 'Booking created');

    // TODO: Notify provider about new booking
    // TODO: Start provider matching if auto-assign enabled

    return booking;
  }

  async findAll(user: User, filterDto: BookingFilterDto, paginationDto: PaginationDto) {
    const { status, startDate, endDate } = filterDto;
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.provider', 'provider');

    // Filter by user role
    if (user.role === UserRole.CUSTOMER) {
      query.where('booking.customerId = :userId', { userId: user.id });
    } else if (user.role === UserRole.PROVIDER) {
      const provider = await this.providerRepository.findOne({ where: { userId: user.id } });
      if (provider) {
        query.where('booking.providerId = :providerId', { providerId: provider.id });
      }
    }

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('booking.scheduledDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const [bookings, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('booking.createdAt', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(bookings, total, page, limit);
  }

  async findOne(user: User, id: string) {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.provider', 'provider')
      .where('booking.id = :id', { id });

    // Filter by user role
    if (user.role === UserRole.CUSTOMER) {
      query.andWhere('booking.customerId = :userId', { userId: user.id });
    } else if (user.role === UserRole.PROVIDER) {
      const provider = await this.providerRepository.findOne({ where: { userId: user.id } });
      if (provider) {
        query.andWhere('booking.providerId = :providerId', { providerId: provider.id });
      }
    }

    const booking = await query.getOne();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async update(userId: string, id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.bookingRepository.findOne({
      where: { id, customerId: userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only allow updates for pending bookings
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Cannot update booking in current status');
    }

    Object.assign(booking, updateBookingDto);
    await this.bookingRepository.save(booking);

    return booking;
  }

  async cancel(user: User, id: string, cancelBookingDto: CancelBookingDto) {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify authorization
    if (user.role === UserRole.CUSTOMER && booking.customerId !== user.id) {
      throw new ForbiddenException('Unauthorized to cancel this booking');
    }

    // Check if booking can be cancelled
    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel booking in current status');
    }

    // Calculate refund based on cancellation policy
    const refundPercentage = this.calculateRefundPercentage(booking.scheduledAt);
    const refundAmount = (booking.totalAmount * refundPercentage) / 100;

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = cancelBookingDto.reason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = user.id;
    booking.refundAmount = refundAmount;
    booking.refundStatus = refundPercentage > 0 ? 'PENDING' : 'NOT_APPLICABLE';

    await this.bookingRepository.save(booking);

    await this.createTimelineEntry(
      booking.id,
      BookingStatus.CANCELLED,
      user.id,
      `Cancelled: ${cancelBookingDto.reason}`,
    );

    // TODO: Process refund if applicable
    // TODO: Notify provider

    return {
      message: 'Booking cancelled successfully',
      refundAmount,
      refundPercentage,
    };
  }

  // Provider methods
  async accept(userId: string, id: string, acceptBookingDto: AcceptBookingDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id, providerId: provider.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking cannot be accepted in current status');
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.confirmedAt = new Date();
    await this.bookingRepository.save(booking);

    await this.createTimelineEntry(
      booking.id,
      BookingStatus.CONFIRMED,
      userId,
      'Booking accepted by provider',
    );

    // TODO: Notify customer

    return { message: 'Booking accepted successfully' };
  }

  async reject(userId: string, id: string, rejectBookingDto: RejectBookingDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id, providerId: provider.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking cannot be rejected in current status');
    }

    booking.status = BookingStatus.REJECTED;
    booking.rejectionReason = rejectBookingDto.reason;
    await this.bookingRepository.save(booking);

    await this.createTimelineEntry(
      booking.id,
      BookingStatus.REJECTED,
      userId,
      `Rejected: ${rejectBookingDto.reason}`,
    );

    // TODO: Find alternative provider or refund customer

    return { message: 'Booking rejected' };
  }

  async start(userId: string, id: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id, providerId: provider.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PROVIDER_ARRIVED) {
      throw new BadRequestException('Provider must arrive before starting service');
    }

    booking.status = BookingStatus.IN_PROGRESS;
    booking.startedAt = new Date();
    await this.bookingRepository.save(booking);

    await this.createTimelineEntry(
      booking.id,
      BookingStatus.IN_PROGRESS,
      userId,
      'Service started',
    );

    return { message: 'Service started successfully' };
  }

  async complete(userId: string, id: string, completeBookingDto: CompleteBookingDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id, providerId: provider.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Service must be in progress to complete');
    }

    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();
    booking.completionNotes = completeBookingDto.notes;
    await this.bookingRepository.save(booking);

    await this.createTimelineEntry(
      booking.id,
      BookingStatus.COMPLETED,
      userId,
      'Service completed',
    );

    // Update provider earnings
    const commission = booking.totalAmount * (provider.commissionRate / 100);
    provider.pendingEarnings += booking.totalAmount - commission;
    provider.totalBookings += 1;
    provider.completedBookings += 1;
    await this.providerRepository.save(provider);

    // TODO: Process payment to provider
    // TODO: Notify customer to leave review

    return { message: 'Service completed successfully' };
  }

  async markEnRoute(userId: string, id: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id, providerId: provider.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.status = BookingStatus.PROVIDER_EN_ROUTE;
    await this.bookingRepository.save(booking);

    await this.createTimelineEntry(
      booking.id,
      BookingStatus.PROVIDER_EN_ROUTE,
      userId,
      'Provider is on the way',
    );

    return { message: 'Status updated' };
  }

  async markArrived(userId: string, id: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id, providerId: provider.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.status = BookingStatus.PROVIDER_ARRIVED;
    booking.arrivedAt = new Date();
    await this.bookingRepository.save(booking);

    await this.createTimelineEntry(
      booking.id,
      BookingStatus.PROVIDER_ARRIVED,
      userId,
      'Provider arrived at location',
    );

    return { message: 'Arrival confirmed' };
  }

  async getUpcoming(user: User, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.provider', 'provider')
      .where('booking.scheduledDate >= :today', { today: new Date() })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.PROVIDER_EN_ROUTE],
      });

    if (user.role === UserRole.CUSTOMER) {
      query.andWhere('booking.customerId = :userId', { userId: user.id });
    } else if (user.role === UserRole.PROVIDER) {
      const provider = await this.providerRepository.findOne({ where: { userId: user.id } });
      if (provider) {
        query.andWhere('booking.providerId = :providerId', { providerId: provider.id });
      }
    }

    const [bookings, total] = await query.skip(skip).take(limit).getManyAndCount();

    return createPaginatedResponse(bookings, total, page, limit);
  }

  async getHistory(user: User, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.provider', 'provider')
      .where('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      });

    if (user.role === UserRole.CUSTOMER) {
      query.andWhere('booking.customerId = :userId', { userId: user.id });
    } else if (user.role === UserRole.PROVIDER) {
      const provider = await this.providerRepository.findOne({ where: { userId: user.id } });
      if (provider) {
        query.andWhere('booking.providerId = :providerId', { providerId: provider.id });
      }
    }

    const [bookings, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('booking.completedAt', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(bookings, total, page, limit);
  }

  async getActive(user: User) {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.provider', 'provider')
      .where('booking.status IN (:...statuses)', {
        statuses: [
          BookingStatus.CONFIRMED,
          BookingStatus.PROVIDER_EN_ROUTE,
          BookingStatus.PROVIDER_ARRIVED,
          BookingStatus.IN_PROGRESS,
        ],
      });

    if (user.role === UserRole.CUSTOMER) {
      query.andWhere('booking.customerId = :userId', { userId: user.id });
    } else if (user.role === UserRole.PROVIDER) {
      const provider = await this.providerRepository.findOne({ where: { userId: user.id } });
      if (provider) {
        query.andWhere('booking.providerId = :providerId', { providerId: provider.id });
      }
    }

    return await query.getMany();
  }

  async getTimeline(id: string) {
    const timeline = await this.timelineRepository.find({
      where: { bookingId: id },
      relations: ['changedByUser'],
      order: { createdAt: 'ASC' },
    });

    return timeline;
  }

  async getTracking(id: string) {
    // TODO: Implement real-time provider location tracking
    return {
      providerLocation: null,
      estimatedArrival: null,
    };
  }

  async getStatistics(user: User, startDate?: string, endDate?: string) {
    const query = this.bookingRepository.createQueryBuilder('booking');

    if (user.role === UserRole.CUSTOMER) {
      query.where('booking.customerId = :userId', { userId: user.id });
    } else if (user.role === UserRole.PROVIDER) {
      const provider = await this.providerRepository.findOne({ where: { userId: user.id } });
      if (provider) {
        query.where('booking.providerId = :providerId', { providerId: provider.id });
      }
    }

    if (startDate && endDate) {
      query.andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalBookings = await query.getCount();
    const completedBookings = await query
      .andWhere('booking.status = :status', { status: BookingStatus.COMPLETED })
      .getCount();
    const cancelledBookings = await query
      .andWhere('booking.status = :status', { status: BookingStatus.CANCELLED })
      .getCount();

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
    };
  }

  async getAllBookings(filterDto: BookingFilterDto, paginationDto: PaginationDto) {
    const { status, startDate, endDate } = filterDto;
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.provider', 'provider');

    if (status) {
      query.where('booking.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('booking.scheduledDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const [bookings, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('booking.createdAt', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(bookings, total, page, limit);
  }

  // Helper methods
  private async createTimelineEntry(
    bookingId: string,
    status: BookingStatus,
    userId: string,
    notes?: string,
  ) {
    const timeline = this.timelineRepository.create({
      bookingId,
      status,
      changedByUserId: userId,
      notes,
    });

    await this.timelineRepository.save(timeline);
  }

  private calculateRefundPercentage(scheduledDate: Date): number {
    const now = new Date();
    const hoursUntilBooking = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking >= 4) {
      return 100; // Full refund
    } else if (hoursUntilBooking >= 2) {
      return 50; // 50% refund
    } else {
      return 0; // No refund
    }
  }
}