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

    const hour = new Date().getHours();
    let focusWindow: string;
    if (hour < 12) focusWindow = 'Morning (current session)';
    else if (hour < 17) focusWindow = 'Afternoon (current session)';
    else focusWindow = 'Evening (current session)';

    const recentSessions = focusSessions.filter((s) => s.status === 'COMPLETED');
    const avgDuration =
      recentSessions.length > 0
        ? Math.round(
            recentSessions.reduce((sum, s) => {
              const duration =
                s.endedAt && s.startedAt
                  ? (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000
                  : 0;
              return sum + duration;
            }, 0) / recentSessions.length,
          )
        : 0;

    const energyLevel = Math.min(
      100,
      Math.max(0, 50 + recentSessions.length * 5 + (tasks.length > 0 ? 10 : 0)),
    );

    const recommendations: string[] = [];
    if (tasks.length > 0) {
      recommendations.push(`Start with: ${tasks[0].title}`);
    }
    if (recentSessions.length === 0) {
      recommendations.push('Begin your first focus session today');
    } else if (avgDuration < 15) {
      recommendations.push('Try extending your focus sessions gradually');
    }
    if (tasks.length > 3) {
      recommendations.push('Consider breaking large tasks into smaller ones');
    }
    if (recommendations.length === 0) {
      recommendations.push('Keep up your consistent focus routine');
    }

    return {
      focusWindow,
      frictionSummary: `You have ${tasks.length} pending task${tasks.length !== 1 ? 's' : ''} and completed ${recentSessions.length} focus session${recentSessions.length !== 1 ? 's' : ''} recently`,
      prioritizedTasks: tasks.map((t) => t.title),
      energyLevel,
      recommendations,
    };
  }

  async getBehavioralAwareness(userId: string): Promise<any> {
    const events = await this.prisma.behaviorEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const focusEvents = events.filter(
      (e) => e.type === 'FOCUS_COMPLETED' || e.type === 'FOCUS_ABANDONED',
    );
    const completedFocus = focusEvents.filter((e) => e.type === 'FOCUS_COMPLETED');
    const abandonedFocus = focusEvents.filter((e) => e.type === 'FOCUS_ABANDONED');

    const patterns: string[] = [];
    if (completedFocus.length > abandonedFocus.length) {
      patterns.push('You complete more focus sessions than you abandon');
    } else if (abandonedFocus.length > 0) {
      patterns.push('You have abandoned some focus sessions recently');
    }

    const stuckEvents = events.filter((e) => e.type === 'WHY_AM_I_STUCK');
    if (stuckEvents.length > 2) {
      patterns.push('You frequently encounter friction during tasks');
    }

    if (patterns.length === 0) {
      patterns.push('Building your behavioral profile as you use the app');
    }

    const triggers: string[] = [];
    if (stuckEvents.length > 0) {
      const reasons = stuckEvents.map((e) => e.metadata).filter(Boolean);
      if (reasons.length > 0) {
        triggers.push(`Common friction: ${reasons[0]}`);
      }
    }
    if (abandonedFocus.length > 0) {
      triggers.push('Focus abandonment detected in recent sessions');
    }
    if (triggers.length === 0) {
      triggers.push('No significant triggers detected yet');
    }

    const suggestedChanges: string[] = [];
    if (completedFocus.length < 3) {
      suggestedChanges.push('Try to complete at least 3 focus sessions per day');
    }
    if (stuckEvents.length > 2) {
      suggestedChanges.push('Consider breaking tasks into smaller pieces');
    }
    if (suggestedChanges.length === 0) {
      suggestedChanges.push('Continue building consistent focus habits');
    }

    return {
      patterns,
      triggers,
      suggestedChanges,
    };
  }

  async getWeeklyReview(userId: string): Promise<any> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const completedTasks = await this.prisma.task.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: weekAgo },
      },
      orderBy: { completedAt: 'desc' },
    });

    const pendingTasks = await this.prisma.task.findMany({
      where: { userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalTasks = completedTasks.length + pendingTasks.length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    const wins = completedTasks.slice(0, 5).map((t) => t.title);
    if (wins.length === 0) {
      wins.push('No tasks completed this week yet');
    }

    const commitments = pendingTasks.slice(0, 5).map((t) => t.title);
    if (commitments.length === 0) {
      commitments.push('No pending tasks');
    }

    const nextShift =
      completionRate >= 80
        ? 'Excellent completion rate! Maintain this momentum.'
        : completionRate >= 50
          ? 'Good progress. Focus on completing remaining tasks.'
          : 'Try to complete more tasks next week. Consider reducing your task load.';

    return {
      wins,
      commitments,
      missedPatterns: [`You completed ${completionRate}% of your tasks this week`],
      nextShift,
    };
  }
}
