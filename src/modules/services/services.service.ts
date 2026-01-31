import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '@database/entities/service.entity';
import { ServiceCategory } from '@database/entities/service-category.entity';
import { Provider } from '@database/entities/provider.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(userId: string, createServiceDto: CreateServiceDto, images?: Express.Multer.File[]) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const imageUrls = images ? images.map(img => `/uploads/${img.filename}`) : [];

    const service = this.serviceRepository.create({
      ...createServiceDto,
      providerId: provider.id,
      images: imageUrls,
    });

    await this.serviceRepository.save(service);
    return service;
  }

  async findAll(filterDto: ServiceFilterDto, paginationDto: PaginationDto) {
    const { categoryId, providerId, isActive, minPrice, maxPrice } = filterDto;
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.serviceRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('service.category', 'category');

    if (categoryId) query.andWhere('service.categoryId = :categoryId', { categoryId });
    if (providerId) query.andWhere('service.providerId = :providerId', { providerId });
    if (isActive !== undefined) query.andWhere('service.isActive = :isActive', { isActive });
    if (minPrice) query.andWhere('service.basePrice >= :minPrice', { minPrice });
    if (maxPrice) query.andWhere('service.basePrice <= :maxPrice', { maxPrice });

    const [services, total] = await query.skip(skip).take(limit).getManyAndCount();
    return createPaginatedResponse(services, total, page, limit);
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider', 'category'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.viewCount += 1;
    await this.serviceRepository.save(service);

    return service;
  }

  async update(userId: string, id: string, updateServiceDto: UpdateServiceDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const service = await this.serviceRepository.findOne({ where: { id, providerId: provider.id } });
    if (!service) {
      throw new NotFoundException('Service not found or unauthorized');
    }

    Object.assign(service, updateServiceDto);
    await this.serviceRepository.save(service);
    return service;
  }

  async remove(userId: string, id: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const service = await this.serviceRepository.findOne({ where: { id, providerId: provider.id } });
    if (!service) {
      throw new NotFoundException('Service not found or unauthorized');
    }

    await this.serviceRepository.softRemove(service);
    return { message: 'Service deleted successfully' };
  }

  async toggleActive(userId: string, id: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const service = await this.serviceRepository.findOne({ where: { id, providerId: provider.id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.isActive = !service.isActive;
    await this.serviceRepository.save(service);
    return service;
  }

  async getCategories() {
    return await this.serviceCategoryRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async getServicesByCategory(categoryId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [services, total] = await this.serviceRepository.findAndCount({
      where: { categoryId, isActive: true },
      relations: ['provider'],
      skip,
      take: limit,
    });

    return createPaginatedResponse(services, total, page, limit);
  }

  async getPopular(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [services, total] = await this.serviceRepository.findAndCount({
      where: { isActive: true },
      order: { totalBookings: 'DESC' },
      relations: ['provider', 'category'],
      skip,
      take: limit,
    });

    return createPaginatedResponse(services, total, page, limit);
  }

  async getFeatured(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [services, total] = await this.serviceRepository.findAndCount({
      where: { isActive: true, isFeatured: true },
      relations: ['provider', 'category'],
      skip,
      take: limit,
    });

    return createPaginatedResponse(services, total, page, limit);
  }

  async search(query: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [services, total] = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.isActive = :isActive', { isActive: true })
      .andWhere('(service.name ILIKE :query OR service.nameAr ILIKE :query OR service.description ILIKE :query)', 
        { query: `%${query}%` })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return createPaginatedResponse(services, total, page, limit);
  }

  async getProviderServices(userId: string, paginationDto: PaginationDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [services, total] = await this.serviceRepository.findAndCount({
      where: { providerId: provider.id },
      relations: ['category'],
      skip,
      take: limit,
    });

    return createPaginatedResponse(services, total, page, limit);
  }

  async getReviews(serviceId: string, paginationDto: PaginationDto) {
    // TODO: Implement with Review entity
    return createPaginatedResponse([], 0, 1, 20);
  }

  async getStatistics(serviceId: string) {
    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return {
      totalBookings: service.totalBookings,
      averageRating: service.averageRating,
      totalReviews: service.totalReviews,
      viewCount: service.viewCount,
    };
  }
}