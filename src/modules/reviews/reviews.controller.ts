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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { Review } from '@database/entities/review.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(
    @CurrentUser() user: User,
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.reviewsService.create(user.id, createReviewDto, images);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiPaginatedResponse(Review)
  async findAll(
    @Query('providerId') providerId?: string,
    @Query('serviceId') serviceId?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.reviewsService.findAll(
  { providerId, serviceId }, 
  paginationDto || { page: 1, limit: 20 }
);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my reviews' })
  @ApiPaginatedResponse(Review)
  async getMyReviews(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reviewsService.getMyReviews(user.id, paginationDto);
  }

  @Get('provider/:providerId')
  @Public()
  @ApiOperation({ summary: 'Get provider reviews' })
  @ApiPaginatedResponse(Review)
  async getProviderReviews(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reviewsService.getProviderReviews(providerId, paginationDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(user.id, id, updateReviewDto);
  }

  @Post(':id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Respond to review (Provider only)' })
  @ApiResponse({ status: 200, description: 'Response added' })
  async respond(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewResponseDto: ReviewResponseDto,
  ) {
    return this.reviewsService.respond(user.id, id, reviewResponseDto);
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark review as helpful' })
  @ApiResponse({ status: 200, description: 'Marked as helpful' })
  async markHelpful(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reviewsService.markHelpful(user.id, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reviewsService.remove(user.id, id);
  }

  // Admin endpoints
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review approved' })
  async approve(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reviewsService.approve(admin.id, id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review rejected' })
  async reject(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.reviewsService.reject(admin.id, id, reason);
  }
}