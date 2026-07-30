import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type FrictionLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FrictionAnalysis {
  score: number;
  level: FrictionLevel;
  factors: {
    skippedTasks: number;
    procrastination: number;
    unfinishedSessions: number;
    inactivity: number;
    reschedules: number;
  };
  recommendations: string[];
}

@Injectable()
export class FrictionEngineService {
  private readonly logger = new Logger(FrictionEngineService.name);

  constructor(private prisma: PrismaService) {}

  async calculateFriction(userId: string): Promise<FrictionAnalysis> {
    const [tasks, focusSessions, behaviorEvents] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.focusSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 50,
      }),
      this.prisma.behaviorEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ]);

    const factors = this.calculateFactors(tasks, focusSessions, behaviorEvents);
    const score = this.calculateScore(factors);
    const level = this.determineLevel(score);
    const recommendations = this.generateRecommendations(level, factors);

    return {
      score,
      level,
      factors,
      recommendations,
    };
  }

  private calculateFactors(tasks: any[], focusSessions: any[], behaviorEvents: any[]) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentTasks = tasks.filter((t) => new Date(t.createdAt) > sevenDaysAgo);
    const skippedTasks = recentTasks.filter((t) => t.status === 'SKIPPED').length;

    const procrastination = this.calculateProcrastination(behaviorEvents, sevenDaysAgo);
    const unfinishedSessions = focusSessions.filter((s) => s.status === 'ABANDONED').length;
    const inactivity = this.calculateInactivity(tasks, focusSessions, fourteenDaysAgo);
    const reschedules = behaviorEvents.filter((e) => e.type === 'TASK_SNOOZED').length;

    return {
      skippedTasks,
      procrastination,
      unfinishedSessions,
      inactivity,
      reschedules,
    };
  }

  private calculateProcrastination(events: any[], since: Date): number {
    const recentEvents = events.filter((e) => new Date(e.createdAt) > since);
    const snoozeCount = recentEvents.filter((e) => e.type === 'TASK_SNOOZED').length;
    const skipCount = recentEvents.filter((e) => e.type === 'TASK_SKIPPED').length;

    return Math.min(10, snoozeCount + skipCount);
  }

  private calculateInactivity(tasks: any[], sessions: any[], since: Date): number {
    const recentTasks = tasks.filter((t) => new Date(t.createdAt) > since);
    const recentSessions = sessions.filter((s) => new Date(s.startedAt) > since);

    if (recentTasks.length === 0 && recentSessions.length === 0) {
      return 10;
    }

    const lastActivity = Math.max(
      recentTasks.length > 0 ? new Date(recentTasks[0].createdAt).getTime() : 0,
      recentSessions.length > 0 ? new Date(recentSessions[0].startedAt).getTime() : 0,
    );

    const daysSinceActivity = (Date.now() - lastActivity) / (24 * 60 * 60 * 1000);

    if (daysSinceActivity > 7) return 10;
    if (daysSinceActivity > 3) return 7;
    if (daysSinceActivity > 1) return 3;
    return 0;
  }

  private calculateScore(factors: any): number {
    let score = 0;

    score += Math.min(30, factors.skippedTasks * 5);
    score += Math.min(25, factors.procrastination * 2.5);
    score += Math.min(20, factors.unfinishedSessions * 4);
    score += Math.min(15, factors.inactivity * 1.5);
    score += Math.min(10, factors.reschedules * 2);

    return Math.min(100, Math.round(score));
  }

  private determineLevel(score: number): FrictionLevel {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }

  private generateRecommendations(level: FrictionLevel, factors: any): string[] {
    const recommendations: string[] = [];

    if (level === 'critical') {
      recommendations.push('Consider taking a break to reset');
      recommendations.push('Focus on just one small task today');
    }

    if (factors.skippedTasks > 3) {
      recommendations.push('Review skipped tasks - are they important?');
      recommendations.push('Consider delegating or removing low-priority tasks');
    }

    if (factors.procrastination > 5) {
      recommendations.push('Try the 2-minute rule: if it takes less than 2 minutes, do it now');
      recommendations.push('Break large tasks into smaller steps');
    }

    if (factors.unfinishedSessions > 2) {
      recommendations.push('Try shorter focus sessions (15-20 minutes)');
      recommendations.push('Remove distractions before starting');
    }

    if (factors.inactivity > 5) {
      recommendations.push('Start with just 5 minutes of work');
      recommendations.push('Set a daily reminder to check in');
    }

    if (factors.reschedules > 3) {
      recommendations.push('Be more realistic about task duration');
      recommendations.push('Schedule fewer tasks per day');
    }

    return recommendations;
  }
}
