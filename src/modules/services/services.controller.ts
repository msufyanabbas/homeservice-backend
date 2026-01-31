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
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { Service } from '@database/entities/service.entity';
import { Review } from '@database/entities/review.entity';
import { ProviderStatusGuard } from '@/common/guards/provider-status.guard';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ProviderStatusGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new service (Provider only)' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Provider only' })
  async create(
    @CurrentUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.servicesService.create(user.id, createServiceDto, images);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all services' })
  @ApiPaginatedResponse(Service)
  async findAll(
    @Query() filterDto: ServiceFilterDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.servicesService.findAll(filterDto, paginationDto);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getCategories() {
    return this.servicesService.getCategories();
  }

  @Get('categories/:id/services')
  @Public()
  @ApiOperation({ summary: 'Get services by category' })
  @ApiPaginatedResponse(Service)
  async getServicesByCategory(
    @Param('id', ParseUUIDPipe) categoryId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.servicesService.getServicesByCategory(categoryId, paginationDto);
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Get popular services' })
  @ApiPaginatedResponse(Service)
  async getPopular(@Query() paginationDto: PaginationDto) {
    return this.servicesService.getPopular(paginationDto);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured services' })
  @ApiPaginatedResponse(Service)
  async getFeatured(@Query() paginationDto: PaginationDto) {
    return this.servicesService.getFeatured(paginationDto);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search services' })
  @ApiPaginatedResponse(Service)
  async search(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.servicesService.search(query, paginationDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my services (Provider only)' })
  @ApiPaginatedResponse(Service)
  async getMyServices(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.servicesService.getProviderServices(user.id, paginationDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update service (Provider only)' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(user.id, id, updateServiceDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle service active status (Provider only)' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully' })
  async toggleActive(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.servicesService.toggleActive(user.id, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete service (Provider only)' })
  @ApiResponse({ status: 204, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.servicesService.remove(user.id, id);
  }

  @Get(':id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get service reviews' })
  @ApiPaginatedResponse(Review)
  async getReviews(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.servicesService.getReviews(id, paginationDto);
  }

  @Get(':id/statistics')
  @Public()
  @ApiOperation({ summary: 'Get service statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.getStatistics(id);
  }
}