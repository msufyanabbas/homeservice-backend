import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PromoCode } from '@database/entities/promo-code.entity';
import { PromoUsage } from '@database/entities/promo-usage.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(PromoUsage)
    private readonly promoUsageRepository: Repository<PromoUsage>,
  ) {}

  async create(createPromoCodeDto: CreatePromoCodeDto) {
    const promoCode = this.promoCodeRepository.create(createPromoCodeDto);
    await this.promoCodeRepository.save(promoCode);
    return promoCode;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [promoCodes, total] = await this.promoCodeRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(promoCodes, total, page, limit);
  }

  async findOne(id: string) {
    const promoCode = await this.promoCodeRepository.findOne({ where: { id } });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return promoCode;
  }

  async update(id: string, updatePromoCodeDto: UpdatePromoCodeDto) {
    const promoCode = await this.findOne(id);

    Object.assign(promoCode, updatePromoCodeDto);
    await this.promoCodeRepository.save(promoCode);

    return promoCode;
  }

  async remove(id: string) {
    const promoCode = await this.findOne(id);
    await this.promoCodeRepository.softRemove(promoCode);

    return { message: 'Promo code deleted' };
  }

  async deactivate(id: string) {
    const promoCode = await this.findOne(id);
    promoCode.isActive = false;
    await this.promoCodeRepository.save(promoCode);

    return { message: 'Promo code deactivated' };
  }

  async validate(userId: string, applyPromoCodeDto: ApplyPromoCodeDto) {
    const { code, bookingAmount } = applyPromoCodeDto;

    const promoCode: any = await this.promoCodeRepository.findOne({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: MoreThan(new Date()),
      },
    });

    if (!promoCode) {
      throw new BadRequestException('Invalid or expired promo code');
    }

    // Check usage limits
    if (promoCode.usageCount >= promoCode.maxUses) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    // Check user usage
    const userUsageCount = await this.promoUsageRepository.count({
      where: { promoCodeId: promoCode.id, userId },
    });

    if (userUsageCount >= promoCode.maxUsagePerUser) {
      throw new BadRequestException('You have reached the usage limit for this promo code');
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = (bookingAmount * promoCode.discountValue) / 100;
      if (promoCode.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, promoCode.maxDiscountAmount);
      }
    } else {
      discountAmount = promoCode.discountValue;
    }

    // Apply minimum amount check
    if (bookingAmount < promoCode.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount is ${promoCode.minOrderAmount}`);
    }

    return {
      valid: true,
      promoCode,
      discountAmount,
      finalAmount: bookingAmount - discountAmount,
    };
  }

  async apply(userId: string, applyPromoCodeDto: ApplyPromoCodeDto) {
    const validation = await this.validate(userId, applyPromoCodeDto);

    return validation;
  }

  async getPublicPromoCodes() {
    return await this.promoCodeRepository.find({
      where: {
        isActive: true,
        isPublic: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getMyUsages(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [usages, total] = await this.promoUsageRepository.findAndCount({
      where: { userId },
      relations: ['promoCode', 'booking'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(usages, total, page, limit);
  }

  async getStatistics(id: string) {
    const promoCode: any = await this.findOne(id);

    const usages = await this.promoUsageRepository.find({
      where: { promoCodeId: id },
    });

    const totalDiscount = usages.reduce((sum, usage) => sum + usage.discountAmount, 0);

    return {
      totalUsages: promoCode.usageCount,
      remainingUsages: promoCode.maxUsage - promoCode.usageCount,
      totalDiscount,
      usageRate: (promoCode.usageCount / promoCode.maxUsage) * 100,
    };
  }
}