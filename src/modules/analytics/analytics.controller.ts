import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('provider/dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Get provider analytics dashboard' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved' })
  async getProviderDashboard(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getProviderDashboard(user.id, startDate, endDate);
  }

  @Get('provider/performance')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Get provider performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  async getProviderPerformance(
    @CurrentUser() user: User,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getProviderPerformance(user.id, period);
  }

  @Get('provider/earnings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Get provider earnings analytics' })
  @ApiResponse({ status: 200, description: 'Earnings analytics retrieved' })
  async getProviderEarnings(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.analyticsService.getProviderEarnings(user.id, startDate, endDate, groupBy);
  }

  @Get('customer/summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get customer analytics summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved' })
  async getCustomerSummary(@CurrentUser() user: User) {
    return this.analyticsService.getCustomerSummary(user.id);
  }

  @Get('customer/spending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get customer spending analytics' })
  @ApiResponse({ status: 200, description: 'Spending analytics retrieved' })
  async getCustomerSpending(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getCustomerSpending(user.id, startDate, endDate);
  }
}