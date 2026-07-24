import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BehaviorService } from '../behavior/behavior.service';
import { FocusService } from '../focus/focus.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class ExecutionService {
  constructor(
    private prisma: PrismaService,
    private behaviorService: BehaviorService,
    private focusService: FocusService,
    private tasksService: TasksService,
  ) {}

  async getReadinessScore(userId: string): Promise<{ score: number; factors: string[]; explanation: string }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [focusSessions, tasks, events, lastActivity] = await Promise.all([
      this.prisma.focusSession.findMany({
        where: { userId, startedAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.task.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.behaviorEvent.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.behaviorEvent.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const factors: string[] = [];
    let totalScore = 0;

    // Focus session completion rate (25%)
    const completedSessions = focusSessions.filter(s => s.status === 'COMPLETED').length;
    const totalSessions = focusSessions.length;
    const focusRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    const focusContribution = Math.round(focusRate * 0.25);
    totalScore += focusContribution;
    factors.push(`Focus completion: ${focusRate}% (contributes ${focusContribution} points)`);

    // Task completion rate (25%)
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const taskContribution = Math.round(taskRate * 0.25);
    totalScore += taskContribution;
    factors.push(`Task completion: ${taskRate}% (contributes ${taskContribution} points)`);

    // Time since last activity (15%)
    let activityScore = 100;
    if (lastActivity) {
      const hoursSinceLastActivity = Math.floor((now.getTime() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60));
      if (hoursSinceLastActivity <= 1) activityScore = 100;
      else if (hoursSinceLastActivity <= 4) activityScore = 80;
      else if (hoursSinceLastActivity <= 12) activityScore = 60;
      else if (hoursSinceLastActivity <= 24) activityScore = 40;
      else activityScore = 20;
    }
    const activityContribution = Math.round(activityScore * 0.15);
    totalScore += activityContribution;
    factors.push(`Last activity: ${activityScore}% (contributes ${activityContribution} points)`);

    // Procrastination level (15%)
    const snoozeEvents = events.filter(e => e.type === 'TASK_SNOOZED').length;
    const procrastinationScore = Math.max(0, 100 - (snoozeEvents * 20));
    const procrastinationContribution = Math.round(procrastinationScore * 0.15);
    totalScore += procrastinationContribution;
    factors.push(`Low procrastination: ${procrastinationScore}% (contributes ${procrastinationContribution} points)`);

    // Pending tasks (10%)
    const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
    const pendingScore = Math.max(0, 100 - (pendingTasks * 10));
    const pendingContribution = Math.round(pendingScore * 0.10);
    totalScore += pendingContribution;
    factors.push(`Manageable workload: ${pendingScore}% (contributes ${pendingContribution} points)`);

    // Recent momentum (10%)
    const recentCompleted = tasks.filter(t => t.completedAt && new Date(t.completedAt) >= sevenDaysAgo).length;
    const olderCompleted = tasks.filter(t => {
      const completedAt = t.completedAt;
      if (!completedAt) return false;
      const d = new Date(completedAt);
      return d >= thirtyDaysAgo && d < sevenDaysAgo;
    }).length;
    const weeklyAvg = recentCompleted / 7;
    const olderAvg = olderCompleted / 23;
    const momentumRatio = olderAvg > 0 ? weeklyAvg / olderAvg : weeklyAvg > 0 ? 1 : 0;
    const momentumScore = Math.min(100, Math.round(momentumRatio * 50));
    const momentumContribution = Math.round(momentumScore * 0.10);
    totalScore += momentumContribution;
    factors.push(`Recent momentum: ${momentumScore}% (contributes ${momentumContribution} points)`);

    const finalScore = Math.min(100, Math.max(0, totalScore));
    let explanation = '';
    if (finalScore >= 80) explanation = 'You are in a high-readiness state. Great time to tackle challenging tasks.';
    else if (finalScore >= 60) explanation = 'You have moderate readiness. Consider starting with easier tasks to build momentum.';
    else if (finalScore >= 40) explanation = 'Readiness is below average. Focus on small wins to build momentum.';
    else explanation = 'Readiness is low. Consider rest or very small, easy tasks to recover.';

    return { score: finalScore, factors, explanation };
  }

  async detectResistance(userId: string): Promise<{ score: number; patterns: string[]; suggestions: string[] }> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now);
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [events, tasks] = await Promise.all([
      this.prisma.behaviorEvent.findMany({
        where: { userId, createdAt: { gte: twentyFourHoursAgo } },
      }),
      this.prisma.task.findMany({
        where: { userId, status: 'PENDING' },
      }),
    ]);

    const patterns: string[] = [];
    const suggestions: string[] = [];
    let resistanceScore = 0;

    // Count TASK_SNOOZED events in last 24h
    const snoozedCount = events.filter(e => e.type === 'TASK_SNOOZED').length;
    if (snoozedCount > 2) {
      resistanceScore += 30;
      patterns.push(`Snoozed ${snoozedCount} tasks in last 24 hours`);
      suggestions.push('Try breaking tasks into smaller, 5-minute actions');
    }

    // Count FOCUS_ABANDONED events in last 24h
    const abandonedCount = events.filter(e => e.type === 'FOCUS_ABANDONED').length;
    if (abandonedCount > 1) {
      resistanceScore += 25;
      patterns.push(`Abandoned ${abandonedCount} focus sessions in last 24 hours`);
      suggestions.push('Consider shorter focus sessions (15-25 minutes)');
    }

    // Count tasks created but not started
    const unstartedTasks = tasks.filter(t => t.status === 'PENDING').length;
    if (unstartedTasks > 5) {
      resistanceScore += 20;
      patterns.push(`${unstartedTasks} tasks pending without progress`);
      suggestions.push('Review and reprioritize your task list');
    }

    // Calculate average time between task creation and first action
    const tasksWithActions = await this.prisma.task.findMany({
      where: { userId, status: { not: 'PENDING' } },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    if (tasksWithActions.length > 0) {
      const delays = tasksWithActions.map(t => {
        const created = new Date(t.createdAt).getTime();
        const started = t.scheduledAt ? new Date(t.scheduledAt).getTime() : created;
        return (started - created) / (1000 * 60 * 60); // hours
      });
      const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
      if (avgDelay > 24) {
        resistanceScore += 15;
        patterns.push(`Average delay of ${Math.round(avgDelay)} hours between task creation and action`);
        suggestions.push('Schedule tasks immediately when you create them');
      }
    }

    const finalScore = Math.min(100, resistanceScore);
    if (finalScore === 0) suggestions.push('Keep up the great work! No significant resistance detected.');

    return { score: finalScore, patterns, suggestions };
  }

  async getMomentum(userId: string): Promise<{
    currentStreak: number;
    executionStreak: number;
    recoveryStreak: number;
    weeklyMomentum: number;
    monthlyMomentum: number;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    const now = new Date();

    // Calculate current streak (days with at least 1 task completed)
    let currentStreak = 0;
    let checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const completedTasks = await this.prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: dayStart, lte: dayEnd },
        },
      });

      if (completedTasks === 0) break;
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate execution streak (days with at least 1 focus session)
    let executionStreak = 0;
    checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const focusSessions = await this.prisma.focusSession.count({
        where: {
          userId,
          startedAt: { gte: dayStart, lte: dayEnd },
        },
      });

      if (focusSessions === 0) break;
      executionStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate recovery streak (consecutive days of improvement after a decline)
    let recoveryStreak = 0;
    const dailyCompletions: number[] = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await this.prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: dayStart, lte: dayEnd },
        },
      });
      dailyCompletions.push(count);
    }

    // Find recovery streak (improvement after decline)
    for (let i = 1; i < dailyCompletions.length - 1; i++) {
      if (dailyCompletions[i] > dailyCompletions[i + 1]) {
        recoveryStreak++;
      } else {
        break;
      }
    }

    // Weekly momentum (this week vs last week)
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setHours(0, 0, 0, 0);

    const [thisWeekTasks, lastWeekTasks] = await Promise.all([
      this.prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: thisWeekStart },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: lastWeekStart, lte: lastWeekEnd },
        },
      }),
    ]);

    const weeklyMomentum = lastWeekTasks > 0
      ? Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100)
      : thisWeekTasks > 0 ? 100 : 0;

    // Monthly momentum (this month vs last month)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthTasks, lastMonthTasks] = await Promise.all([
      this.prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: thisMonthStart },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
    ]);

    const monthlyMomentum = lastMonthTasks > 0
      ? Math.round(((thisMonthTasks - lastMonthTasks) / lastMonthTasks) * 100)
      : thisMonthTasks > 0 ? 100 : 0;

    // Overall trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (weeklyMomentum > 10 && monthlyMomentum > 10) trend = 'improving';
    else if (weeklyMomentum < -10 && monthlyMomentum < -10) trend = 'declining';

    return {
      currentStreak,
      executionStreak,
      recoveryStreak,
      weeklyMomentum,
      monthlyMomentum,
      trend,
    };
  }

  async getExecutionStats(userId: string): Promise<{
    totalTasksCompleted: number;
    weeklyTasksCompleted: number;
    dailyTasksCompleted: number;
    totalFocusTime: number;
    weeklyFocusTime: number;
    dailyFocusTime: number;
    averageSessionDuration: number;
    completionReliability: number;
    planningAccuracy: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Task counts
    const [totalTasksCompleted, weeklyTasksCompleted, dailyTasksCompleted] = await Promise.all([
      this.prisma.task.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: weekStart },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: todayStart },
        },
      }),
    ]);

    // Focus time calculations
    const [allSessions, weeklySessions, dailySessions] = await Promise.all([
      this.prisma.focusSession.findMany({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.focusSession.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          startedAt: { gte: weekStart },
        },
      }),
      this.prisma.focusSession.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          startedAt: { gte: todayStart },
        },
      }),
    ]);

    const totalFocusTime = Math.round(allSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
    const weeklyFocusTime = Math.round(weeklySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
    const dailyFocusTime = Math.round(dailySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);

    const averageSessionDuration = allSessions.length > 0
      ? Math.round(allSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / allSessions.length)
      : 0;

    // Completion reliability (completed on time / total with due dates)
    const tasksWithDue = await this.prisma.task.findMany({
      where: { userId, dueAt: { not: null } },
    });
    const completedOnTime = tasksWithDue.filter(t =>
      t.status === 'COMPLETED' && t.completedAt && new Date(t.completedAt) <= new Date(t.dueAt!)
    ).length;
    const completionReliability = tasksWithDue.length > 0
      ? Math.round((completedOnTime / tasksWithDue.length) * 100)
      : 100;

    // Planning accuracy (completed as scheduled / total scheduled)
    const scheduledTasks = await this.prisma.task.findMany({
      where: { userId, scheduledAt: { not: null } },
    });
    const completedScheduled = scheduledTasks.filter(t =>
      t.status === 'COMPLETED'
    ).length;
    const planningAccuracy = scheduledTasks.length > 0
      ? Math.round((completedScheduled / scheduledTasks.length) * 100)
      : 100;

    return {
      totalTasksCompleted,
      weeklyTasksCompleted,
      dailyTasksCompleted,
      totalFocusTime,
      weeklyFocusTime,
      dailyFocusTime,
      averageSessionDuration,
      completionReliability,
      planningAccuracy,
    };
  }
}
