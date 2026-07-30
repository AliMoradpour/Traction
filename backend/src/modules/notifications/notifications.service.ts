import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueryDto, NotificationResponseDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: NotificationQueryDto): Promise<NotificationResponseDto[]> {
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.read !== undefined) where.read = query.read;

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return notifications;
  }

  async findOne(userId: string, notificationId: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');
    return notification;
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { count: result.count };
  }

  async remove(userId: string, notificationId: string): Promise<{ message: string }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { count };
  }

  async getPreferences(userId: string): Promise<any> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    return {
      userId,
      notificationDensity: profile?.notificationDensity || 'LOW',
      focusReminders: true,
      dailyBrief: true,
      weeklyReview: true,
      goalUpdates: true,
    };
  }
}
