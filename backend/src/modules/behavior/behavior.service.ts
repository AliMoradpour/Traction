import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto, BehaviorEventResponseDto, BehaviorQueryDto } from './dto/behavior.dto';

@Injectable()
export class BehaviorService {
  constructor(private prisma: PrismaService) {}

  async track(userId: string, dto: TrackEventDto): Promise<BehaviorEventResponseDto> {
    const event = await this.prisma.behaviorEvent.create({
      data: {
        userId,
        ...dto,
      },
    });

    return event;
  }

  async findAll(userId: string, query: BehaviorQueryDto): Promise<BehaviorEventResponseDto[]> {
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.taskId) where.taskId = query.taskId;
    if (query.goalId) where.goalId = query.goalId;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const events = await this.prisma.behaviorEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return events;
  }

  async findOne(userId: string, eventId: string): Promise<BehaviorEventResponseDto> {
    const event = await this.prisma.behaviorEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Behavior event not found');
    if (event.userId !== userId) throw new ForbiddenException('Access denied');
    return event;
  }

  async getStats(userId: string): Promise<any> {
    const totalEvents = await this.prisma.behaviorEvent.count({ where: { userId } });

    const eventsByType = await this.prisma.behaviorEvent.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true },
    });

    const recentEvents = await this.prisma.behaviorEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      totalEvents,
      eventsByType: eventsByType.map((e) => ({ type: e.type, count: e._count.type })),
      recentEvents,
    };
  }

  async remove(userId: string, eventId: string): Promise<{ message: string }> {
    const event = await this.prisma.behaviorEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Behavior event not found');
    if (event.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.behaviorEvent.delete({ where: { id: eventId } });
    return { message: 'Behavior event deleted successfully' };
  }
}
