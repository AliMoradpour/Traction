import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterService } from './openrouter.service';
import { PromptLoaderService } from './prompt-loader.service';
import { ModelRegistryService } from './model-registry.service';

export interface GoalRecovery {
  realityCheck: string;
  recoveryStrategy: string[];
  consequences: string;
  shouldModifyGoal: boolean;
  modifiedGoalSuggestion: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class GoalRecoveryService {
  private readonly logger = new Logger(GoalRecoveryService.name);

  constructor(
    private prisma: PrismaService,
    private openRouter: OpenRouterService,
    private promptLoader: PromptLoaderService,
    private modelRegistry: ModelRegistryService,
  ) {}

  async analyzeGoalRecovery(
    userId: string,
    goalId: string,
  ): Promise<GoalRecovery | null> {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        tasks: true,
        milestones: true,
      },
    });

    if (!goal || goal.userId !== userId) {
      return null;
    }

    const { currentProgress, expectedProgress, daysRemaining, daysSinceLastProgress } =
      this.calculateGoalMetrics(goal);

    const prompt = this.promptLoader.renderPrompt('goal-recovery', {
      goalTitle: goal.title,
      deadline: goal.targetDate?.toISOString() || 'No deadline',
      currentProgress: currentProgress.toString(),
      expectedProgress: expectedProgress.toString(),
      daysRemaining: daysRemaining.toString(),
      daysSinceLastProgress: daysSinceLastProgress.toString(),
    });

    const response = await this.openRouter.chat(
      [{ role: 'user', content: prompt }],
      'anthropic/claude-3-haiku',
      { temperature: 0.6, maxTokens: 500 },
    );

    if (!response) {
      return this.getFallbackGoalRecovery(currentProgress, expectedProgress, daysRemaining);
    }

    try {
      const parsed = JSON.parse(response);
      return {
        realityCheck: parsed.realityCheck,
        recoveryStrategy: parsed.recoveryStrategy || [],
        consequences: parsed.consequences,
        shouldModifyGoal: parsed.shouldModifyGoal || false,
        modifiedGoalSuggestion: parsed.modifiedGoalSuggestion || '',
        urgencyLevel: parsed.urgencyLevel || 'medium',
      };
    } catch (error) {
      this.logger.error('Failed to parse goal recovery response', error);
      return this.getFallbackGoalRecovery(currentProgress, expectedProgress, daysRemaining);
    }
  }

  private calculateGoalMetrics(goal: any) {
    const now = new Date();
    const deadline = goal.deadline || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const totalDays = Math.max(1, Math.ceil((deadline.getTime() - goal.createdAt.getTime()) / (24 * 60 * 60 * 1000)));
    const daysPassed = Math.max(0, Math.ceil((now.getTime() - goal.createdAt.getTime()) / (24 * 60 * 60 * 1000)));
    const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    
    const completedTasks = goal.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
    const totalTasks = goal.tasks?.length || 1;
    const currentProgress = (completedTasks / totalTasks) * 100;
    
    const expectedProgress = Math.min(100, (daysPassed / totalDays) * 100);
    
    const lastTaskUpdate = goal.tasks?.length > 0
      ? new Date(Math.max(...goal.tasks.map((t: any) => new Date(t.updatedAt).getTime())))
      : goal.createdAt;
    const daysSinceLastProgress = Math.ceil((now.getTime() - lastTaskUpdate.getTime()) / (24 * 60 * 60 * 1000));

    return {
      currentProgress,
      expectedProgress,
      daysRemaining,
      daysSinceLastProgress,
    };
  }

  private getFallbackGoalRecovery(
    currentProgress: number,
    expectedProgress: number,
    daysRemaining: number,
  ): GoalRecovery {
    const gap = expectedProgress - currentProgress;
    
    let urgencyLevel: GoalRecovery['urgencyLevel'] = 'low';
    if (gap > 50) urgencyLevel = 'critical';
    else if (gap > 30) urgencyLevel = 'high';
    else if (gap > 15) urgencyLevel = 'medium';

    const shouldModifyGoal = gap > 40 && daysRemaining < 7;

    return {
      realityCheck: `You're at ${Math.round(currentProgress)}% progress, but expected to be at ${Math.round(expectedProgress)}%.`,
      recoveryStrategy: [
        'Focus on the most impactful tasks first',
        'Break remaining work into daily chunks',
        'Consider extending the deadline if possible',
      ],
      consequences: gap > 30
        ? 'Without action, this goal is at risk of failure.'
        : 'You can recover with consistent effort.',
      shouldModifyGoal,
      modifiedGoalSuggestion: shouldModifyGoal
        ? 'Consider reducing scope or extending the deadline'
        : '',
      urgencyLevel,
    };
  }
}
