import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '@database/entities/provider.entity';
import { User } from '@database/entities/user.entity';
import { ProviderDocument } from '@database/entities/provider-document.entity';
import { ProviderLocation } from '@database/entities/provider-location.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ProviderFilterDto } from './dto/provider-filter.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';
import { ProviderStatus, ProviderVerificationStatus, ProviderAvailability } from '@common/enums/provider.enum';
import { UserRole } from '@common/enums/user.enum';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProviderDocument)
    private readonly providerDocumentRepository: Repository<ProviderDocument>,
    @InjectRepository(ProviderLocation)
    private readonly providerLocationRepository: Repository<ProviderLocation>,
  ) {}

  async register(createProviderDto: CreateProviderDto) {
    const { userId, iqamaNumber, serviceCategories, ...rest } = createProviderDto;

    // Check if user exists and is not already a provider
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProvider = await this.providerRepository.findOne({ where: { userId } });
    if (existingProvider) {
      throw new BadRequestException('User is already registered as a provider');
    }

    // Check if Iqama number is unique
    const existingIqama = await this.providerRepository.findOne({ where: { iqamaNumber } });
    if (existingIqama) {
      throw new BadRequestException('This Iqama number is already registered');
    }

    // Create provider
    const provider = this.providerRepository.create({
      userId,
      iqamaNumber,
      serviceCategories,
      status: ProviderStatus.PENDING_APPROVAL,
      verificationStatus: ProviderVerificationStatus.PENDING,
      availability: ProviderAvailability.OFFLINE,
      commissionRate: 15, // Default 15%
      ...rest,
    });

    // Calculate trial end date (7 days)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    provider.trialEndsAt = trialEndsAt;

    await this.providerRepository.save(provider);

    // Update user role to provider
    user.role = UserRole.PROVIDER;
    await this.userRepository.save(user);

    return {
      message: 'Provider registration submitted. Awaiting approval.',
      provider,
    };
  }

  async findAll(filterDto: ProviderFilterDto, paginationDto: PaginationDto) {
    const { status, categoryId, city, availability, minRating } = filterDto;
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.providerRepository.createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user')
      .where('provider.status = :activeStatus', { activeStatus: ProviderStatus.ACTIVE });

    if (status) {
      query.andWhere('provider.status = :status', { status });
    }

    if (categoryId) {
      query.andWhere(':categoryId = ANY(provider.serviceCategories)', { categoryId });
    }

    if (city) {
      query.andWhere(':city = ANY(provider.serviceAreas)', { city });
    }

    if (availability) {
      query.andWhere('provider.availability = :availability', { availability });
    }

    if (minRating) {
      query.andWhere('provider.averageRating >= :minRating', { minRating });
    }

    const [providers, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('provider.averageRating', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(providers, total, page, limit);
  }

  async findNearby(latitude: number, longitude: number, radius: number, categoryId?: string) {
    let query = this.providerLocationRepository.createQueryBuilder('location')
      .leftJoinAndSelect('location.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'user')
      .where('provider.status = :status', { status: ProviderStatus.ACTIVE })
      .andWhere('provider.availability IN (:...availabilities)', {
        availabilities: [ProviderAvailability.AVAILABLE, ProviderAvailability.BUSY],
      })
      .andWhere(
        `ST_DWithin(
          location.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius
        )`,
        { latitude, longitude, radius: radius * 1000 }, // Convert km to meters
      );

    if (categoryId) {
      query = query.andWhere(':categoryId = ANY(provider.serviceCategories)', { categoryId });
    }

    const locations = await query
      .orderBy(
        `ST_Distance(
          location.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        )`,
      )
      .limit(50)
      .getMany();

    return locations.map(location => ({
      ...location.provider,
      distance: this.calculateDistance(latitude, longitude, location.latitude, location.longitude),
      lastLocationUpdate: location.recordedAt,
    }));
  }

  async getTopRated(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [providers, total] = await this.providerRepository.findAndCount({
      where: { status: ProviderStatus.ACTIVE },
      relations: ['user'],
      order: { averageRating: 'DESC', totalReviews: 'DESC' },
      skip,
      take: limit,
    });

    return createPaginatedResponse(providers, total, page, limit);
  }

  async search(query: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [providers, total] = await this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user')
      .where('provider.status = :status', { status: ProviderStatus.ACTIVE })
      .andWhere(
        '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR provider.businessName ILIKE :query)',
        { query: `%${query}%` },
      )
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return createPaginatedResponse(providers, total, page, limit);
  }

  async findOne(id: string) {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async getProviderProfile(userId: string) {
    const provider = await this.providerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }

    return provider;
  }

  async updateProfile(userId: string, updateProviderDto: UpdateProviderDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    Object.assign(provider, updateProviderDto);
    await this.providerRepository.save(provider);

    return provider;
  }

  async updateAvailability(userId: string, updateAvailabilityDto: UpdateAvailabilityDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.availability = updateAvailabilityDto.availability;
    await this.providerRepository.save(provider);

    return {
      message: 'Availability updated successfully',
      availability: provider.availability,
    };
  }

  async updateLocation(userId: string, updateLocationDto: UpdateLocationDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const { latitude, longitude, accuracy, speed, heading } = updateLocationDto;

    // Update provider's current location
    provider.currentLatitude = latitude;
    provider.currentLongitude = longitude;
    provider.locationUpdatedAt = new Date();
    await this.providerRepository.save(provider);

    // Save location history
    const location = this.providerLocationRepository.create({
      providerId: provider.id,
      latitude,
      longitude,
      location: `SRID=4326;POINT(${longitude} ${latitude})`,
      accuracy,
      speed,
      heading,
      isOnline: provider.availability !== ProviderAvailability.OFFLINE,
      recordedAt: new Date(),
    });

    await this.providerLocationRepository.save(location);

    return {
      message: 'Location updated successfully',
    };
  }

  async getStatistics(userId: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return {
      totalBookings: provider.totalBookings,
      completedBookings: provider.completedBookings,
      cancelledBookings: provider.cancelledBookings,
      acceptanceRate: provider.acceptanceRate,
      completionRate: provider.completionRate,
      averageRating: provider.averageRating,
      totalReviews: provider.totalReviews,
      totalEarnings: provider.totalEarnings,
      pendingEarnings: provider.pendingEarnings,
      warningCount: provider.warningCount,
    };
  }

  async getEarnings(userId: string, startDate?: string, endDate?: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // TODO: Implement detailed earnings query with date filters
    return {
      totalEarnings: provider.totalEarnings,
      pendingEarnings: provider.pendingEarnings,
      availableForWithdrawal: provider.totalEarnings - provider.pendingEarnings,
      commissionRate: provider.commissionRate,
    };
  }

  async uploadDocument(userId: string, file: Express.Multer.File, documentType: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // TODO: Upload file to S3 and get URL
    const documentUrl = `/uploads/${file.filename}`;

    const document = this.providerDocumentRepository.create({
  providerId: provider.id,  // ✅ Now exists in entity
  documentType: documentType as any,  // Cast to bypass type check
  documentUrl,
  verificationStatus: ProviderVerificationStatus.PENDING,
  metadata: {
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  },
});

    await this.providerDocumentRepository.save(document);

    return {
      message: 'Document uploaded successfully',
      document,
    };
  }

  async getDocuments(userId: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const documents = await this.providerDocumentRepository.find({
      where: { providerId: provider.id },
      order: { createdAt: 'DESC' },
    });

    return documents;
  }

  async deleteDocument(userId: string, documentId: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const document = await this.providerDocumentRepository.findOne({
      where: { id: documentId, providerId: provider.id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.providerDocumentRepository.softRemove(document);

    return {
      message: 'Document deleted successfully',
    };
  }

  async getReviews(providerId: string, paginationDto: PaginationDto) {
    // TODO: Implement with Review entity
    return {
      reviews: [],
      meta: { total: 0, page: 1, limit: 20 },
    };
  }

  async getServices(providerId: string) {
    // TODO: Implement with Service entity
    return [];
  }

  // Admin methods
  async approve(providerId: string, adminId: string) {
    const provider = await this.providerRepository.findOne({ where: { id: providerId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.status = ProviderStatus.ACTIVE;
    provider.verificationStatus = ProviderVerificationStatus.VERIFIED;
    provider.approvedAt = new Date();
    provider.approvedBy = adminId;

    await this.providerRepository.save(provider);

    return {
      message: 'Provider approved successfully',
    };
  }

  async reject(providerId: string, reason: string) {
    const provider = await this.providerRepository.findOne({ where: { id: providerId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.status = ProviderStatus.REJECTED;
    provider.verificationStatus = ProviderVerificationStatus.REJECTED;
    provider.rejectionReason = reason;

    await this.providerRepository.save(provider);

    return {
      message: 'Provider rejected',
    };
  }

  async suspend(providerId: string, reason: string) {
    const provider = await this.providerRepository.findOne({ where: { id: providerId } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.status = ProviderStatus.SUSPENDED;
    provider.suspensionCount += 1;
    provider.lastSuspensionDate = new Date();
    provider.metadata = {
      ...provider.metadata,
      suspensionReason: reason,
    };

    await this.providerRepository.save(provider);

    return {
      message: 'Provider suspended',
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}