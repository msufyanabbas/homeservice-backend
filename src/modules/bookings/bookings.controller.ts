import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { AcceptBookingDto } from './dto/accept-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { CompleteBookingDto } from './dto/complete-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { Booking } from '@database/entities/booking.entity';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @CurrentUser() user: User,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(user.id, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiPaginatedResponse(Booking)
  async findAll(
    @CurrentUser() user: User,
    @Query() filterDto: BookingFilterDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bookingsService.findAll(user, filterDto, paginationDto);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming bookings' })
  @ApiPaginatedResponse(Booking)
  async getUpcoming(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bookingsService.getUpcoming(user, paginationDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get booking history' })
  @ApiPaginatedResponse(Booking)
  async getHistory(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bookingsService.getHistory(user, paginationDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active bookings' })
  @ApiResponse({ status: 200, description: 'Active bookings retrieved' })
  async getActive(@CurrentUser() user: User) {
    return this.bookingsService.getActive(user);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get booking statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.bookingsService.getStatistics(user, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.findOne(user, id);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get booking timeline' })
  @ApiResponse({ status: 200, description: 'Timeline retrieved' })
  async getTimeline(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.getTimeline(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(user.id, id, updateBookingDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel booking' })
  async cancel(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelBookingDto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(user, id, cancelBookingDto);
  }

  // Provider-specific endpoints
  @Post(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept booking (Provider only)' })
  @ApiResponse({ status: 200, description: 'Booking accepted' })
  async accept(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() acceptBookingDto: AcceptBookingDto,
  ) {
    return this.bookingsService.accept(user.id, id, acceptBookingDto);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject booking (Provider only)' })
  @ApiResponse({ status: 200, description: 'Booking rejected' })
  async reject(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectBookingDto: RejectBookingDto,
  ) {
    return this.bookingsService.reject(user.id, id, rejectBookingDto);
  }

  @Post(':id/start')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start service (Provider only)' })
  @ApiResponse({ status: 200, description: 'Service started' })
  async start(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.start(user.id, id);
  }

  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete service (Provider only)' })
  @ApiResponse({ status: 200, description: 'Service completed' })
  async complete(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeBookingDto: CompleteBookingDto,
  ) {
    return this.bookingsService.complete(user.id, id, completeBookingDto);
  }

  @Post(':id/en-route')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark provider en route (Provider only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async markEnRoute(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.markEnRoute(user.id, id);
  }

  @Post(':id/arrived')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark provider arrived (Provider only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async markArrived(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.markArrived(user.id, id);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get real-time provider tracking' })
  @ApiResponse({ status: 200, description: 'Tracking data retrieved' })
  async getTracking(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.getTracking(id);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiPaginatedResponse(Booking)
  async getAllBookings(
    @Query() filterDto: BookingFilterDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bookingsService.getAllBookings(filterDto, paginationDto);
  }
}