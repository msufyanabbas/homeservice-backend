import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { CacheInterceptor, CacheKey, CacheTTL } from '@/common/interceptors/cache.interceptor';
import { ParseUuidPipe } from '@/common/pipes/parse-uuid.pipe';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiPaginatedResponse(CreateUserDto)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Search users (Admin only)' })
  @ApiPaginatedResponse(CreateUserDto)
  async search(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.search(query, paginationDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics() {
    return this.usersService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(CacheInterceptor)
  @CacheKey('user-details')
  @CacheTTL(600) // Cache for 10 minutes
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUuidPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/suspend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Suspend user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  async suspend(
    @Param('id', ParseUuidPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.usersService.suspend(id, reason);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activate(@Param('id', ParseUuidPipe) id: string) {
    return this.usersService.activate(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseUuidPipe) id: string) {
    return this.usersService.remove(id);
  }
}