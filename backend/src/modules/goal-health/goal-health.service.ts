import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalHealthResponseDto } from './dto/goal-health.dto';
import { GoalHealth } from '@prisma/client';

@Injectable()
export class GoalHealthService {
  constructor(private prisma: PrismaService) {}

  async getHealth(userId: string, goalId: string): Promise<GoalHealthResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const daysRemaining = goal.targetDate
      ? Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const daysSinceStart = Math.ceil(
      (Date.now() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const expectedProgress =
      daysRemaining !== null && daysSinceStart > 0
        ? Math.min(100, (daysSinceStart / (daysSinceStart + daysRemaining)) * 100)
        : goal.progress;

    let recommendation = '';
    if (goal.health === GoalHealth.AT_RISK) {
      recommendation =
        'Consider breaking this goal into smaller milestones or adjusting the timeline.';
    } else if (goal.health === GoalHealth.BEHIND_SCHEDULE) {
      recommendation = 'You are behind schedule. Focus on completing the next milestone first.';
    } else if (goal.health === GoalHealth.SLIGHTLY_BEHIND) {
      recommendation = 'You are slightly behind. Try to increase your daily progress.';
    } else {
      recommendation = 'You are on track. Keep up the good work!';
    }

    return {
      goalId: goal.id,
      health: goal.health,
      progress: goal.progress,
      velocity: goal.velocity,
      targetDate: goal.targetDate,
      daysRemaining,
      estimatedCompletion: this.estimateCompletion(goal.progress, daysSinceStart, daysRemaining),
      recommendation,
    };
  }

  async recalculateHealth(userId: string, goalId: string): Promise<GoalHealthResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const daysRemaining = goal.targetDate
      ? Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    let health: GoalHealth = GoalHealth.ON_TRACK;

    if (daysRemaining !== null) {
      if (goal.progress >= 100) {
        health = GoalHealth.ON_TRACK;
      } else if (daysRemaining < 0) {
        health = GoalHealth.AT_RISK;
      } else if (goal.progress < 25 && daysRemaining < 30) {
        health = GoalHealth.AT_RISK;
      } else if (goal.progress < 50 && daysRemaining < 14) {
        health = GoalHealth.BEHIND_SCHEDULE;
      } else if (goal.progress < 75 && daysRemaining < 7) {
        health = GoalHealth.RECOVERY_NEEDED;
      } else if (goal.progress < 40) {
        health = GoalHealth.SLIGHTLY_BEHIND;
      }
    }

    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: { health },
    });

    return this.getHealth(userId, goalId);
  }

  private estimateCompletion(
    progress: number,
    daysSinceStart: number,
    daysRemaining: number | null,
  ): string {
    if (progress === 0) return 'Not started';
    if (progress >= 100) return 'Completed';

    const velocity = progress / daysSinceStart;
    const daysToComplete = Math.ceil((100 - progress) / velocity);

    return `Estimated ${daysToComplete} days to complete`;
  }
}
