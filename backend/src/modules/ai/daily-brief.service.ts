import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterService } from './openrouter.service';
import { BehaviorEngineService } from './behavior-engine.service';
import { FrictionEngineService } from './friction-engine.service';
import { PromptLoaderService } from './prompt-loader.service';
import { AICacheService } from './ai-cache.service';
import { ModelRegistryService } from './model-registry.service';

export interface DailyBrief {
  date: string;
  focusRecommendation: string;
  executionAdvice: string[];
  riskWarnings: string;
  momentumTip: string;
  priorityTasks: string[];
  generatedAt: Date;
}

@Injectable()
export class DailyBriefService {
  private readonly logger = new Logger(DailyBriefService.name);

  constructor(
    private prisma: PrismaService,
    private openRouter: OpenRouterService,
    private behaviorEngine: BehaviorEngineService,
    private frictionEngine: FrictionEngineService,
    private promptLoader: PromptLoaderService,
    private cacheService: AICacheService,
    private modelRegistry: ModelRegistryService,
  ) {}

  async getDailyBrief(userId: string): Promise<DailyBrief | null> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `daily-brief-${today}`;
    
    const cached = await this.cacheService.get(userId, cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        await this.cacheService.invalidate(userId, cacheKey);
      }
    }

    const brief = await this.generateDailyBrief(userId);
    
    if (brief) {
      await this.cacheService.set(userId, cacheKey, JSON.stringify(brief), 'openrouter', 60 * 24);
    }

    return brief;
  }

  private async generateDailyBrief(userId: string): Promise<DailyBrief | null> {
    const today = new Date().toISOString().split('T')[0];

    const [tasks, goals, behaviorProfile, frictionScore] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.goal.findMany({
        where: { userId, status: 'ACTIVE' },
      }),
      this.behaviorEngine.analyzeBehavior(userId),
      this.frictionEngine.calculateFriction(userId),
    ]);

    const prompt = this.promptLoader.renderPrompt('daily-brief', {
      date: today,
      tasks: JSON.stringify(tasks.map(t => ({
        title: t.title,
        priority: t.priority,
        friction: t.friction,
        scheduledAt: t.scheduledAt,
      }))),
      goals: JSON.stringify(goals.map(g => ({
        title: g.title,
        deadline: g.deadline,
      }))),
      behaviorProfile: JSON.stringify(behaviorProfile),
      frictionScore: JSON.stringify(frictionScore),
    });

    const response = await this.openRouter.chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 1000 },
    );

    if (!response) {
      return this.getFallbackDailyBrief(tasks, goals);
    }

    try {
      const parsed = JSON.parse(response.content);
      
      return {
        date: today,
        focusRecommendation: parsed.focusRecommendation,
        executionAdvice: parsed.executionAdvice,
        riskWarnings: parsed.riskWarnings,
        momentumTip: parsed.momentumTip,
        priorityTasks: parsed.priorityTasks,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to parse daily brief response', error);
      return this.getFallbackDailyBrief(tasks, goals);
    }
  }

  private getFallbackDailyBrief(tasks: any[], goals: any[]): DailyBrief {
    const today = new Date().toISOString().split('T')[0];
    
    const highPriorityTasks = tasks
      .filter(t => t.priority === 'HIGH' || t.priority === 'URGENT')
      .slice(0, 3)
      .map(t => t.title);

    return {
      date: today,
      focusRecommendation: highPriorityTasks.length > 0
        ? `Focus on: ${highPriorityTasks[0]}`
        : 'Start with your most important task',
      executionAdvice: [
        'Break tasks into smaller steps',
        'Take regular breaks',
        'Minimize distractions',
      ],
      riskWarnings: 'Stay focused and avoid multitasking',
      momentumTip: 'Complete one task before moving to the next',
      priorityTasks: highPriorityTasks,
      generatedAt: new Date(),
    };
  }
}
