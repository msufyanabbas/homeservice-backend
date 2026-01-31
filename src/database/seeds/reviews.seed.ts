import { DataSource } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { Booking } from '../../database/entities/booking.entity';
import { User } from '../../database/entities/user.entity';
import { Provider } from '../../database/entities/provider.entity';
import { Service } from '../../database/entities/service.entity';
import { ReviewStatus } from '../../common/enums/misc.enum';
import { BookingStatus } from '../../common/enums/booking.enum';

export async function seedReviews(dataSource: DataSource): Promise<void> {
  const reviewRepository = dataSource.getRepository(Review);
  const bookingRepository = dataSource.getRepository(Booking);
  const userRepository = dataSource.getRepository(User);
  const providerRepository = dataSource.getRepository(Provider);
  const serviceRepository = dataSource.getRepository(Service);

  console.log('🔧 Seeding reviews...');

  // Get completed bookings only
  const bookings = await bookingRepository.find({
    where: { status: BookingStatus.COMPLETED },
    relations: ['customer', 'provider', 'service'],
    take: 5,
  });

  if (bookings.length === 0) {
    console.log('ℹ️  No completed bookings found. Please seed bookings first.');
    return;
  }

  const reviewsData = [
    {
      rating: 5,
      overallRating: 5,
      qualityRating: 5,
      professionalismRating: 5,
      punctualityRating: 5,
      valueRating: 5,
      comment: 'Excellent service! Very professional and thorough cleaning. Highly recommend!',
      status: ReviewStatus.APPROVED,
      helpfulCount: 12,
      notHelpfulCount: 0,
      isVerifiedBooking: true,
      isFeatured: true,
      metadata: {
        tags: ['professional', 'thorough', 'punctual'],
        sentiment: 'positive',
      },
    },
    {
      rating: 4,
      overallRating: 4,
      qualityRating: 4,
      professionalismRating: 5,
      punctualityRating: 4,
      valueRating: 4,
      comment: 'Good service overall. Arrived on time and did a good job. Would use again.',
      status: ReviewStatus.APPROVED,
      providerResponse: 'Thank you for your feedback! We appreciate your business.',
      providerRespondedAt: new Date('2025-01-16T10:00:00Z'),
      providerResponseAt: new Date('2025-01-16T10:00:00Z'),
      helpfulCount: 8,
      notHelpfulCount: 1,
      isVerifiedBooking: true,
      isFeatured: false,
    },
    {
      rating: 5,
      overallRating: 5,
      qualityRating: 5,
      professionalismRating: 5,
      punctualityRating: 5,
      valueRating: 5,
      comment: 'Outstanding work! Fixed the electrical issue quickly and professionally. Very satisfied!',
      images: ['review_photo1.jpg'],
      status: ReviewStatus.APPROVED,
      helpfulCount: 15,
      notHelpfulCount: 0,
      isVerifiedBooking: true,
      isFeatured: true,
      metadata: {
        tags: ['quick', 'professional', 'expert'],
        sentiment: 'very positive',
      },
    },
    {
      rating: 3,
      overallRating: 3,
      qualityRating: 3,
      professionalismRating: 4,
      punctualityRating: 2,
      valueRating: 3,
      comment: 'Service was okay but arrived 30 minutes late. Work quality was acceptable.',
      status: ReviewStatus.PENDING,
      helpfulCount: 3,
      notHelpfulCount: 2,
      isVerifiedBooking: true,
      isFeatured: false,
    },
    {
      rating: 5,
      overallRating: 5,
      qualityRating: 5,
      professionalismRating: 5,
      punctualityRating: 5,
      valueRating: 5,
      comment: 'Perfect service from start to finish! Very happy with the results. Will definitely book again.',
      status: ReviewStatus.APPROVED,
      providerResponse: 'We are thrilled to hear about your positive experience! Thank you!',
      providerRespondedAt: new Date('2025-01-17T14:30:00Z'),
      providerResponseAt: new Date('2025-01-17T14:30:00Z'),
      helpfulCount: 20,
      notHelpfulCount: 0,
      isVerifiedBooking: true,
      isFeatured: true,
      metadata: {
        tags: ['perfect', 'professional', 'reliable'],
        sentiment: 'very positive',
      },
    },
  ];

  for (let i = 0; i < bookings.length && i < reviewsData.length; i++) {
    const booking = bookings[i];

    // Check if review already exists for this booking
    const existing = await reviewRepository.findOne({
      where: { bookingId: booking.id },
    });

    if (!existing) {
      const review = reviewRepository.create({
        ...reviewsData[i],
        bookingId: booking.id,
        booking: booking,
        customerId: booking.customerId,
        customer: booking.customer,
        providerId: booking.providerId,
        provider: booking.provider,
        serviceId: booking.serviceId,
        service: booking.service,
      });

      await reviewRepository.save(review);
      console.log(`✅ Created review for booking: ${booking.bookingNumber}`);
    } else {
      console.log(`ℹ️  Review already exists for booking: ${booking.bookingNumber}`);
    }
  }

  console.log('✅ Reviews seeding completed');
}