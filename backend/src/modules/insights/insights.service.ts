import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InsightQueryDto, InsightResponseDto } from './dto/insights.dto';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: InsightQueryDto): Promise<InsightResponseDto[]> {
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.goalId) where.goalId = query.goalId;
    if (query.read !== undefined) where.read = query.read;
    if (query.dismissed !== undefined) where.dismissed = query.dismissed;

    const insights = await this.prisma.insight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return insights;
  }

  async findOne(userId: string, insightId: string): Promise<InsightResponseDto> {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');
    return insight;
  }

  async markAsRead(userId: string, insightId: string): Promise<InsightResponseDto> {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.insight.update({
      where: { id: insightId },
      data: { read: true },
    });

    return updated;
  }

  async dismiss(userId: string, insightId: string): Promise<InsightResponseDto> {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.insight.update({
      where: { id: insightId },
      data: { dismissed: true },
    });

    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.insight.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { count: result.count };
  }

  async remove(userId: string, insightId: string): Promise<{ message: string }> {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.insight.delete({ where: { id: insightId } });
    return { message: 'Insight deleted successfully' };
  }

  async getDailyBrief(userId: string): Promise<any> {
    const tasks = await this.prisma.task.findMany({
      where: { userId, status: 'PENDING' },
      orderBy: { priority: 'desc' },
      take: 5,
    });

    const focusSessions = await this.prisma.focusSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 7,
    });

    return {
      focusWindow: '9:00 AM - 12:00 PM',
      frictionSummary: `You have ${tasks.length} pending tasks`,
      prioritizedTasks: tasks.map(t => t.title),
      energyLevel: 75,
      recommendations: ['Start with your highest priority task', 'Take breaks between focus sessions'],
    };
  }

  async getBehavioralAwareness(userId: string): Promise<any> {
    const events = await this.prisma.behaviorEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      patterns: ['You are most productive in the morning', 'You tend to skip tasks after lunch'],
      triggers: ['Long tasks cause procrastination', ' interruptions break your flow'],
      suggestedChanges: ['Break long tasks into smaller pieces', 'Schedule deep work in the morning'],
    };
  }

  async getWeeklyReview(userId: string): Promise<any> {
    const completedTasks = await this.prisma.task.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    const pendingTasks = await this.prisma.task.findMany({
      where: { userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      wins: completedTasks.slice(0, 3).map(t => t.title),
      commitments: pendingTasks.slice(0, 3).map(t => t.title),
      missedPatterns: ['You completed 70% of your tasks this week'],
      nextShift: 'Focus on completing your top 3 priorities next week',
    };
  }
}
