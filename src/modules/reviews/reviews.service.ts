import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '@database/entities/review.entity';
import { Booking } from '@database/entities/booking.entity';
import { Provider } from '@database/entities/provider.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';
import { ReviewStatus } from '@common/enums/review.enum';
import { BookingStatus } from '@common/enums/booking.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto, images?: Express.Multer.File[]) {
    const { bookingId, ...reviewData } = createReviewDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, customerId: userId },
      relations: ['provider', 'service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed bookings');
    }

    const existingReview = await this.reviewRepository.findOne({ where: { bookingId } });
    if (existingReview) {
      throw new BadRequestException('Review already exists for this booking');
    }

    const imageUrls = images ? images.map(img => `/uploads/${img.filename}`) : [];

    const review = this.reviewRepository.create({
      ...reviewData,
      bookingId,
      customerId: userId,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      images: imageUrls,
      status: ReviewStatus.PUBLISHED,
    });

    await this.reviewRepository.save(review);

    await this.updateProviderRating(booking.providerId!);

    return review;
  }

  async findAll(filters: any, paginationDto: PaginationDto) {
    const { providerId, serviceId } = filters;
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.customer', 'customer')
      .leftJoinAndSelect('review.service', 'service')
      .where('review.status = :status', { status: ReviewStatus.PUBLISHED });

    if (providerId) query.andWhere('review.providerId = :providerId', { providerId });
    if (serviceId) query.andWhere('review.serviceId = :serviceId', { serviceId });

    const [reviews, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('review.createdAt', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(reviews, total, page, limit);
  }

  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['customer', 'provider', 'service'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(userId: string, id: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id, customerId: userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    Object.assign(review, updateReviewDto);
    await this.reviewRepository.save(review);

    return review;
  }

  async remove(userId: string, id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id, customerId: userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.softRemove(review);

    return { message: 'Review deleted successfully' };
  }

  async respond(userId: string, id: string, reviewResponseDto: ReviewResponseDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const review = await this.reviewRepository.findOne({
      where: { id, providerId: provider.id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.providerResponse = reviewResponseDto.response;
    review.providerResponseAt = new Date();
    await this.reviewRepository.save(review);

    return { message: 'Response added successfully' };
  }

  async markHelpful(userId: string, id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.helpfulCount += 1;
    await this.reviewRepository.save(review);

    return { message: 'Marked as helpful' };
  }

  async getMyReviews(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { customerId: userId },
      relations: ['service', 'provider'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(reviews, total, page, limit);
  }

  async getProviderReviews(providerId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { providerId, status: ReviewStatus.PUBLISHED },
      relations: ['customer', 'service'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(reviews, total, page, limit);
  }

  async approve(adminId: string, id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = ReviewStatus.PUBLISHED;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    await this.reviewRepository.save(review);

    return { message: 'Review approved' };
  }

  async reject(adminId: string, id: string, reason: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = ReviewStatus.REJECTED;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    review.rejectionReason = reason;
    await this.reviewRepository.save(review);

    return { message: 'Review rejected' };
  }

  private async updateProviderRating(providerId: string) {
    const reviews = await this.reviewRepository.find({
      where: { providerId, status: ReviewStatus.PUBLISHED },
    });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    const averageRating = totalRating / reviews.length;

    await this.providerRepository.update(providerId, {
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews: reviews.length,
    });
  }
}