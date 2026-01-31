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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { AdminService } from './admin.service';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { Provider } from '@database/entities/provider.entity';
import { ProviderDocument } from '@database/entities/provider-document.entity';
import { AuditLog } from '@database/entities/audit-log.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(@Query('period') period?: string) {
    return this.adminService.getDashboard(period);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get platform statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getStatistics(startDate, endDate);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Revenue data retrieved' })
  async getRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.adminService.getRevenue(startDate, endDate, groupBy);
  }

  @Get('providers/pending')
  @ApiOperation({ summary: 'Get pending provider approvals' })
  @ApiPaginatedResponse(Provider)
  async getPendingProviders(@Query() paginationDto: PaginationDto) {
    return this.adminService.getPendingProviders(paginationDto);
  }

  @Post('providers/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve provider' })
  @ApiResponse({ status: 200, description: 'Provider approved' })
  async approveProvider(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) providerId: string,
  ) {
    return this.adminService.approveProvider(admin.id, providerId);
  }

  @Post('providers/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject provider' })
  @ApiResponse({ status: 200, description: 'Provider rejected' })
  async rejectProvider(
    @Param('id', ParseUUIDPipe) providerId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectProvider(providerId, reason);
  }

  @Get('documents/pending')
  @ApiOperation({ summary: 'Get pending document verifications' })
  @ApiPaginatedResponse(ProviderDocument)
  async getPendingDocuments(@Query() paginationDto: PaginationDto) {
    return this.adminService.getPendingDocuments(paginationDto);
  }

  @Post('documents/:id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify document' })
  @ApiResponse({ status: 200, description: 'Document verified' })
  async verifyDocument(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) documentId: string,
  ) {
    return this.adminService.verifyDocument(admin.id, documentId);
  }

  @Post('documents/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject document' })
  @ApiResponse({ status: 200, description: 'Document rejected' })
  async rejectDocument(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectDocument(documentId, reason);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved' })
  async getSettings(@Query('category') category?: string) {
    return this.adminService.getSettings(category);
  }

  @Patch('settings/:key')
  @ApiOperation({ summary: 'Update system setting' })
  @ApiResponse({ status: 200, description: 'Setting updated' })
  async updateSetting(
    @Param('key') key: string,
    @Body() updateSystemSettingDto: UpdateSystemSettingDto,
  ) {
    return this.adminService.updateSetting(key, updateSystemSettingDto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiPaginatedResponse(AuditLog)
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.adminService.getAuditLogs({ action, entityType, userId }, paginationDto);
  }

  @Get('reports/bookings')
  @ApiOperation({ summary: 'Get bookings report' })
  @ApiResponse({ status: 200, description: 'Report generated' })
  async getBookingsReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format?: string,
  ) {
    return this.adminService.getBookingsReport(startDate, endDate, format);
  }

  @Get('reports/revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiResponse({ status: 200, description: 'Report generated' })
  async getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format?: string,
  ) {
    return this.adminService.getRevenueReport(startDate, endDate, format);
  }

  @Get('reports/providers')
  @ApiOperation({ summary: 'Get providers report' })
  @ApiResponse({ status: 200, description: 'Report generated' })
  async getProvidersReport(@Query('format') format?: string) {
    return this.adminService.getProvidersReport(format);
  }

  @Post('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ban user' })
  @ApiResponse({ status: 200, description: 'User banned' })
  async banUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.banUser(userId, reason);
  }

  @Post('users/:id/unban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unban user' })
  @ApiResponse({ status: 200, description: 'User unbanned' })
  async unbanUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.adminService.unbanUser(userId);
  }

  @Get('analytics/trends')
  @ApiOperation({ summary: 'Get platform trends' })
  @ApiResponse({ status: 200, description: 'Trends retrieved' })
  async getTrends(@Query('metric') metric: string, @Query('period') period?: string) {
    return this.adminService.getTrends(metric, period);
  }
}