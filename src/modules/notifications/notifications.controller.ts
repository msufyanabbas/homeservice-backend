import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { NotificationsService } from './notifications.service';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@database/entities/user.entity';
import { Notification } from '@database/entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiPaginatedResponse(Notification)
  async findAll(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.notificationsService.findAll(user.id, paginationDto);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.findOne(user.id, id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All marked as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.remove(user.id, id);
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all notifications' })
  @ApiResponse({ status: 204, description: 'All notifications cleared' })
  async clearAll(@CurrentUser() user: User) {
    return this.notificationsService.clearAll(user.id);
  }
}