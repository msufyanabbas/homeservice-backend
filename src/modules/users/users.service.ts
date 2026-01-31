import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';
import { UserStatus } from '@common/enums/user.enum';
import { createSuccessResponse } from '@/common/interfaces/response.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { phone, email, password, ...rest } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ phone }, ...(email ? [{ email }] : [])],
    });

    if (existingUser) {
      throw new ConflictException('User with this phone or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      phone,
      email,
      password: hashedPassword,
      ...rest,
    });

    await this.userRepository.save(user);

    const { password: _, ...sanitizedUser } = user;
    return createSuccessResponse('User created successfully', sanitizedUser, 201);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(users, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If updating email or phone, check for conflicts
    if (updateUserDto.email || updateUserDto.phone) {
      const existingUser = await this.userRepository.findOne({
        where: [
          ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
          ...(updateUserDto.phone ? [{ phone: updateUserDto.phone }] : []),
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this phone or email already exists');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update profile fields
    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete
    await this.userRepository.softRemove(user);

    return {
      message: 'User deleted successfully',
    };
  }

  async search(query: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      where: [
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) },
        { phone: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
      ],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(users, total, page, limit);
  }

  async suspend(userId: string, reason: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.SUSPENDED;
    user.metadata = {
      ...user.metadata,
      suspensionReason: reason,
      suspendedAt: new Date().toISOString(),
    };

    await this.userRepository.save(user);

    return {
      message: 'User suspended successfully',
    };
  }

  async activate(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.ACTIVE;
    await this.userRepository.save(user);

    return {
      message: 'User activated successfully',
    };
  }

  async getStatistics() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });
    const suspendedUsers = await this.userRepository.count({
      where: { status: UserStatus.SUSPENDED },
    });
    const verifiedUsers = await this.userRepository.count({
      where: { phoneVerified: true },
    });

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      registrationRate: {
        today: await this.getRegistrationCount('today'),
        thisWeek: await this.getRegistrationCount('week'),
        thisMonth: await this.getRegistrationCount('month'),
      },
    };
  }

  private async getRegistrationCount(period: 'today' | 'week' | 'month'): Promise<number> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :startDate', { startDate })
      .getCount();
  }
}