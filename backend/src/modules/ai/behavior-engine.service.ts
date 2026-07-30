import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type BehaviorProfile =
  | 'consistent'
  | 'avoider'
  | 'night-worker'
  | 'deadline-driven'
  | 'momentum-driven'
  | 'sporadic'
  | 'new-user';

export interface BehaviorAnalysis {
  profile: BehaviorProfile;
  confidence: number;
  traits: string[];
  patterns: {
    averageTasksPerDay: number;
    completionRate: number;
    skipRate: number;
    averageFocusDuration: number;
    peakProductivityHour: number;
    consistencyScore: number;
  };
}

@Injectable()
export class BehaviorEngineService {
  private readonly logger = new Logger(BehaviorEngineService.name);

  constructor(private prisma: PrismaService) {}

  async analyzeBehavior(userId: string): Promise<BehaviorAnalysis> {
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

    const patterns = this.calculatePatterns(tasks, focusSessions, behaviorEvents);
    const profile = this.determineProfile(patterns, behaviorEvents);
    const traits = this.extractTraits(profile, patterns);

    return {
      profile,
      confidence: this.calculateConfidence(tasks.length, focusSessions.length),
      traits,
      patterns,
    };
  }

  private calculatePatterns(tasks: any[], focusSessions: any[], behaviorEvents: any[]) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentTasks = tasks.filter((t) => new Date(t.createdAt) > thirtyDaysAgo);
    const completedTasks = recentTasks.filter((t) => t.status === 'COMPLETED');
    const skippedTasks = recentTasks.filter((t) => t.status === 'SKIPPED');

    const averageTasksPerDay = recentTasks.length / 30;
    const completionRate = recentTasks.length > 0 ? completedTasks.length / recentTasks.length : 0;
    const skipRate = recentTasks.length > 0 ? skippedTasks.length / recentTasks.length : 0;

    const completedSessions = focusSessions.filter((s) => s.status === 'COMPLETED');
    const averageFocusDuration =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) /
          completedSessions.length
        : 0;

    const peakHour = this.findPeakHour(behaviorEvents);
    const consistencyScore = this.calculateConsistency(recentTasks);

    return {
      averageTasksPerDay,
      completionRate,
      skipRate,
      averageFocusDuration,
      peakProductivityHour: peakHour,
      consistencyScore,
    };
  }

  private findPeakHour(events: any[]): number {
    const hourCounts: Record<number, number> = {};

    events.forEach((event) => {
      const hour = new Date(event.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let maxHour = 9;
    let maxCount = 0;

    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = parseInt(hour);
      }
    });

    return maxHour;
  }

  private calculateConsistency(tasks: any[]): number {
    if (tasks.length < 7) return 0;

    const dayCounts: Record<string, number> = {};
    tasks.forEach((task) => {
      const day = new Date(task.createdAt).toISOString().split('T')[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const days = Object.keys(dayCounts).length;
    const variance = this.calculateVariance(Object.values(dayCounts));

    const consistency = Math.max(0, 1 - variance / (days + 1));
    return Math.min(1, consistency);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private determineProfile(patterns: any, events: any[]): BehaviorProfile {
    const { completionRate, skipRate, consistencyScore, peakProductivityHour, averageTasksPerDay } =
      patterns;

    if (averageTasksPerDay < 1) return 'new-user';
    if (skipRate > 0.4) return 'avoider';
    if (consistencyScore > 0.7) return 'consistent';
    if (peakProductivityHour >= 20 || peakProductivityHour <= 5) return 'night-worker';
    if (completionRate > 0.7 && consistencyScore < 0.4) return 'deadline-driven';
    if (consistencyScore > 0.5 && completionRate > 0.5) return 'momentum-driven';

    return 'sporadic';
  }

  private extractTraits(profile: BehaviorProfile, patterns: any): string[] {
    const traits: string[] = [];

    switch (profile) {
      case 'consistent':
        traits.push('Regular work schedule', 'Steady progress', 'Reliable');
        break;
      case 'avoider':
        traits.push('Avoids difficult tasks', 'May procrastinate', 'Needs accountability');
        break;
      case 'night-worker':
        traits.push(
          'Most productive at night',
          'May need adjusted schedules',
          'Creative peak late',
        );
        break;
      case 'deadline-driven':
        traits.push('Works best under pressure', 'Needs deadlines', 'Bursts of energy');
        break;
      case 'momentum-driven':
        traits.push('Builds on wins', 'Needs early success', 'Chain motivation');
        break;
      case 'sporadic':
        traits.push('Inconsistent patterns', 'May need structure', 'Opportunity for growth');
        break;
      case 'new-user':
        traits.push('Building habits', 'Learning patterns', 'Needs guidance');
        break;
    }

    if (patterns.averageFocusDuration > 45) {
      traits.push('Deep focus capability');
    }

    if (patterns.completionRate > 0.7) {
      traits.push('High follow-through');
    }

    return traits;
  }

  private calculateConfidence(taskCount: number, sessionCount: number): number {
    const dataPoints = taskCount + sessionCount;

    if (dataPoints < 10) return 0.3;
    if (dataPoints < 30) return 0.5;
    if (dataPoints < 100) return 0.7;
    return 0.9;
  }
}
