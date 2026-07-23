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

  async getDailyMetrics(userId: string, dateStr?: string): Promise<any> {
    const date = dateStr ? new Date(dateStr) : new Date();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        OR: [
          { scheduledAt: { gte: dayStart, lte: dayEnd } },
          { completedAt: { gte: dayStart, lte: dayEnd } },
        ],
      },
    });

    const events = await this.prisma.behaviorEvent.findMany({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
    });

    const focusSessions = await this.prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: dayStart, lte: dayEnd },
      },
    });

    const tasksPlanned = tasks.filter((t) => t.scheduledAt && new Date(t.scheduledAt) >= dayStart && new Date(t.scheduledAt) <= dayEnd).length;
    const tasksCompleted = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= dayStart && new Date(t.completedAt) <= dayEnd).length;
    const completionRate = tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0;

    const completedTasks = tasks.filter((t) => t.completedAt);
    const startDelays = completedTasks
      .filter((t) => t.scheduledAt && t.completedAt)
      .map((t) => (new Date(t.completedAt!).getTime() - new Date(t.scheduledAt!).getTime()) / 60000);
    const averageStartDelay = startDelays.length > 0 ? Math.round(startDelays.reduce((a, b) => a + b, 0) / startDelays.length) : 0;

    const dueTasks = tasks.filter((t) => t.dueAt && t.completedAt);
    const completionDelays = dueTasks.map((t) => (new Date(t.completedAt!).getTime() - new Date(t.dueAt!).getTime()) / 60000);
    const averageCompletionDelay = completionDelays.length > 0 ? Math.round(completionDelays.reduce((a, b) => a + b, 0) / completionDelays.length) : 0;

    const deepWorkMinutes = focusSessions.reduce((sum, s) => sum + (s.duration ? Math.round(s.duration / 60) : 0), 0);

    return {
      date: dayStart.toISOString().split('T')[0],
      tasksPlanned,
      tasksCompleted,
      completionRate,
      averageStartDelay,
      averageCompletionDelay,
      deepWorkMinutes,
      focusSessions: focusSessions.length,
      eventsCount: events.length,
    };
  }

  async getWeeklyMetrics(userId: string, weekStartStr?: string): Promise<any> {
    const weekStart = weekStartStr ? new Date(weekStartStr) : new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        OR: [
          { scheduledAt: { gte: weekStart, lte: weekEnd } },
          { dueAt: { gte: weekStart, lte: weekEnd } },
          { completedAt: { gte: weekStart, lte: weekEnd } },
        ],
      },
    });

    const events = await this.prisma.behaviorEvent.findMany({
      where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
    });

    const activeDays = new Set(events.map((e) => new Date(e.createdAt).toDateString())).size;
    const consistency = Math.round((activeDays / 7) * 100);

    const tasksPlanned = tasks.filter((t) => t.scheduledAt && new Date(t.scheduledAt) >= weekStart && new Date(t.scheduledAt) <= weekEnd).length;
    const weeklyCompletion = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= weekStart && new Date(t.completedAt) <= weekEnd).length;
    const planningAccuracy = tasksPlanned > 0 ? Math.round((weeklyCompletion / tasksPlanned) * 100) : 0;

    const now = new Date();
    const missedTasks = tasks.filter((t) => t.dueAt && new Date(t.dueAt) < now && t.status !== 'COMPLETED').length;
    const delayedTasks = tasks.filter((t) => t.dueAt && t.completedAt && new Date(t.completedAt) > new Date(t.dueAt)).length;

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      consistency,
      weeklyCompletion,
      missedTasks,
      delayedTasks,
      planningAccuracy,
      averageDailyOutput: Math.round((weeklyCompletion / 7) * 10) / 10,
    };
  }

  async getIndicators(userId: string, days = 30): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const tasks = await this.prisma.task.findMany({
      where: { userId, createdAt: { gte: since } },
    });

    const events = await this.prisma.behaviorEvent.findMany({
      where: { userId, createdAt: { gte: since } },
    });

    const activeDays = new Set(events.map((e) => new Date(e.createdAt).toDateString())).size;
    const consistencyScore = Math.round((activeDays / days) * 100);

    const scheduledTasks = tasks.filter((t) => t.scheduledAt);
    const completedScheduled = scheduledTasks.filter((t) => t.status === 'COMPLETED');
    const executionScore = scheduledTasks.length > 0 ? Math.round((completedScheduled.length / scheduledTasks.length) * 100) : 0;

    const withDue = tasks.filter((t) => t.dueAt);
    const completedOnTime = withDue.filter((t) => t.completedAt && new Date(t.completedAt) <= new Date(t.dueAt!));
    const reliabilityScore = withDue.length > 0 ? Math.round((completedOnTime.length / withDue.length) * 100) : 0;

    const planningAccuracy = executionScore;

    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 7);
    const recentCompleted = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= recentCutoff).length;
    const olderCutoff = new Date(recentCutoff);
    olderCutoff.setDate(olderCutoff.getDate() - 7);
    const olderCompleted = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= olderCutoff && new Date(t.completedAt) < recentCutoff).length;
    const momentumScore = olderCompleted > 0 ? Math.min(100, Math.round((recentCompleted / olderCompleted) * 50)) : recentCompleted > 0 ? 50 : 0;

    const snoozedCount = events.filter((e) => e.type === 'TASK_SNOOZED').length;
    const completedCount = events.filter((e) => e.type === 'TASK_COMPLETED').length;
    const recoveryScore = snoozedCount + completedCount > 0 ? Math.round((completedCount / (snoozedCount + completedCount)) * 100) : 50;

    return {
      consistencyScore: Math.min(100, consistencyScore),
      executionScore: Math.min(100, executionScore),
      reliabilityScore: Math.min(100, reliabilityScore),
      planningAccuracy: Math.min(100, planningAccuracy),
      momentumScore: Math.min(100, momentumScore),
      recoveryScore: Math.min(100, recoveryScore),
    };
  }

  async getBurnoutRisk(userId: string): Promise<any> {
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const tasks = await this.prisma.task.findMany({
      where: { userId, createdAt: { gte: fourWeeksAgo } },
    });

    const events = await this.prisma.behaviorEvent.findMany({
      where: { userId, createdAt: { gte: fourWeeksAgo } },
    });

    const focusSessions = await this.prisma.focusSession.findMany({
      where: { userId, startedAt: { gte: fourWeeksAgo } },
    });

    let riskScore = 0;
    const signals: string[] = [];

    const thisWeekTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= twoWeeksAgo);
    const lastWeekTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= fourWeeksAgo && new Date(t.completedAt) < twoWeeksAgo);
    if (lastWeekTasks.length > 0 && thisWeekTasks.length < lastWeekTasks.length * 0.5) {
      riskScore += 20;
      signals.push('Rapidly decreasing completion rate');
    }

    const abandonedSessions = focusSessions.filter((s) => s.status === 'CANCELLED');
    const recentAbandoned = abandonedSessions.filter((s) => new Date(s.startedAt) >= twoWeeksAgo);
    if (recentAbandoned.length > 2) {
      riskScore += 20;
      signals.push('Increasing focus session abandonment');
    }

    const snoozes = events.filter((e) => e.type === 'TASK_SNOOZED');
    const recentSnoozes = snoozes.filter((e) => new Date(e.createdAt) >= twoWeeksAgo);
    if (recentSnoozes.length > 3) {
      riskScore += 20;
      signals.push('Increasing task postponement');
    }

    const recentSessions = focusSessions.filter((s) => new Date(s.startedAt) >= twoWeeksAgo);
    const olderSessions = focusSessions.filter((s) => new Date(s.startedAt) >= fourWeeksAgo && new Date(s.startedAt) < twoWeeksAgo);
    const recentAvgDuration = recentSessions.length > 0 ? recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length : 0;
    const olderAvgDuration = olderSessions.length > 0 ? olderSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / olderSessions.length : 0;
    if (olderAvgDuration > 0 && recentAvgDuration < olderAvgDuration * 0.6) {
      riskScore += 20;
      signals.push('Decreasing focus session duration');
    }

    const activeDaysThisWeek = new Set(
      events.filter((e) => new Date(e.createdAt) >= twoWeeksAgo).map((e) => new Date(e.createdAt).toDateString())
    ).size;
    if (activeDaysThisWeek < 3) {
      riskScore += 20;
      signals.push('Large inactivity gaps');
    }

    const level = riskScore <= 25 ? 'low' : riskScore <= 50 ? 'moderate' : riskScore <= 75 ? 'high' : 'critical';

    const thisWeekScore = riskScore;
    const lastWeekEvents = events.filter((e) => new Date(e.createdAt) >= fourWeeksAgo && new Date(e.createdAt) < twoWeeksAgo);
    const lastWeekScore = lastWeekEvents.length > 0 ? 30 : 10;
    const trend = thisWeekScore < lastWeekScore ? 'improving' : thisWeekScore > lastWeekScore ? 'worsening' : 'stable';

    return { level, score: Math.min(100, riskScore), signals, trend };
  }

  async getProcrastinationProfile(userId: string): Promise<any> {
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const events = await this.prisma.behaviorEvent.findMany({
      where: { userId, createdAt: { gte: twoWeeksAgo } },
    });

    const snoozes = events.filter((e) => e.type === 'TASK_SNOOZED');
    const updates = events.filter((e) => e.type === 'TASK_UPDATED');

    const hourCounts: Record<number, number> = {};
    snoozes.forEach((e) => {
      const hour = new Date(e.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
    const peakTime = peakHour ? `${peakHour[0]}:00` : 'No pattern detected';

    const frequency = Math.round((snoozes.length / 14) * 7 * 10) / 10;
    const score = Math.min(100, snoozes.length * 10 + Math.max(0, updates.length - 5) * 5);

    const patterns: string[] = [];
    if (snoozes.length > 3) patterns.push('Repeatedly postpones tasks');
    if (updates.length > 5) patterns.push('Reschedules tasks multiple times');

    const taskSnoozes = snoozes.filter((e) => e.taskId);
    if (taskSnoozes.length > 2) patterns.push('Delays start on high-priority items');

    return {
      score,
      patterns,
      peakProcrastinationTime: peakTime,
      commonReasons: snoozes.filter((e) => e.value).map((e) => e.value!),
      frequency,
    };
  }
}
