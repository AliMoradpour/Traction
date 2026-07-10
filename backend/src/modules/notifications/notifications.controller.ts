import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto, NotificationResponseDto } from './dto/notifications.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications', type: [NotificationResponseDto] })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: NotificationQueryDto,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAll(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(
    @CurrentUser('id') userId: string,
  ): Promise<{ count: number }> {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by id' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification details', type: NotificationResponseDto })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.findOne(userId, id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponseDto })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'Count of updated notifications' })
  async markAllAsRead(
    @CurrentUser('id') userId: string,
  ): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.notificationsService.remove(userId, id);
  }
}
