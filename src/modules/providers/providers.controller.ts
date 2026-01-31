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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ProviderFilterDto } from './dto/provider-filter.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { Provider } from '@database/entities/provider.entity';
import { Review } from '@database/entities/review.entity';
import { ProviderSearchDto } from './dto/provider-search.dto';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register as service provider' })
  @ApiResponse({ status: 201, description: 'Provider registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.register(createProviderDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all providers (public)' })
  @ApiPaginatedResponse(Provider)
  async findAll(
    @Query() filterDto: ProviderFilterDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.providersService.findAll(filterDto, paginationDto);
  }

  @Get('nearby')
  @Public()
  @ApiOperation({ summary: 'Find providers nearby' })
  @ApiResponse({ status: 200, description: 'Nearby providers retrieved' })
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 20,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.providersService.findNearby(latitude, longitude, radius, categoryId);
  }

  @Get('top-rated')
  @Public()
  @ApiOperation({ summary: 'Get top rated providers' })
  @ApiPaginatedResponse(Provider)
  async getTopRated(@Query() paginationDto: PaginationDto) {
    return this.providersService.getTopRated(paginationDto);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search providers' })
  @ApiPaginatedResponse(Provider)
  async search(
    @Query() searchDto: ProviderSearchDto,
    // @Query('q') query: string,
    // @Query() paginationDto: PaginationDto,
  ) {
    const {q, page, limit} = searchDto;
    return this.providersService.search(q, {page, limit});
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current provider profile' })
  @ApiResponse({ status: 200, description: 'Provider profile retrieved' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.providersService.getProviderProfile(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update provider profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providersService.updateProfile(user.id, updateProviderDto);
  }

  @Patch('me/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update availability status' })
  @ApiResponse({ status: 200, description: 'Availability updated' })
  async updateAvailability(
    @CurrentUser() user: User,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.providersService.updateAvailability(user.id, updateAvailabilityDto);
  }

  @Post('me/location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current location' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  async updateLocation(
    @CurrentUser() user: User,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.providersService.updateLocation(user.id, updateLocationDto);
  }

  @Get('me/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get provider statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getMyStatistics(@CurrentUser() user: User) {
    return this.providersService.getStatistics(user.id);
  }

  @Get('me/earnings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get earnings summary' })
  @ApiResponse({ status: 200, description: 'Earnings retrieved' })
  async getEarnings(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.providersService.getEarnings(user.id, startDate, endDate);
  }

  @Post('me/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload provider document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async uploadDocument(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: string,
  ) {
    return this.providersService.uploadDocument(user.id, file, documentType);
  }

  @Get('me/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get provider documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved' })
  async getDocuments(@CurrentUser() user: User) {
    return this.providersService.getDocuments(user.id);
  }

  @Delete('me/documents/:documentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete provider document' })
  @ApiResponse({ status: 204, description: 'Document deleted' })
  async deleteDocument(
    @CurrentUser() user: User,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.providersService.deleteDocument(user.id, documentId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiResponse({ status: 200, description: 'Provider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.providersService.findOne(id);
  }

  @Get(':id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get provider reviews' })
  @ApiPaginatedResponse(Review)
  async getReviews(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.providersService.getReviews(id, paginationDto);
  }

  @Get(':id/services')
  @Public()
  @ApiOperation({ summary: 'Get provider services' })
  @ApiResponse({ status: 200, description: 'Services retrieved' })
  async getServices(@Param('id', ParseUUIDPipe) id: string) {
    return this.providersService.getServices(id);
  }

  // Admin endpoints
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve provider (Admin only)' })
  @ApiResponse({ status: 200, description: 'Provider approved' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: User,
  ) {
    return this.providersService.approve(id, admin.id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject provider (Admin only)' })
  @ApiResponse({ status: 200, description: 'Provider rejected' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.providersService.reject(id, reason);
  }

  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Suspend provider (Admin only)' })
  @ApiResponse({ status: 200, description: 'Provider suspended' })
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.providersService.suspend(id, reason);
  }
}