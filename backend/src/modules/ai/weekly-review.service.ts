import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from '@/providers/ai/openrouter.provider';
import { PromptLoaderService } from './prompt-loader.service';
import { AICacheService } from './ai-cache.service';
import { ModelRegistryService } from './model-registry.service';
import { AIRateLimitService } from './ai-rate-limit.service';
import { AISafetyService } from './ai-safety.service';

export interface WeeklyReview {
  wins: string[];
  mistakes: string[];
  patterns: string[];
  recommendations: string[];
  overallRating: 'excellent' | 'good' | 'average' | 'needs-improvement';
  focusArea: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: Date;
}

@Injectable()
export class WeeklyReviewService {
  private readonly logger = new Logger(WeeklyReviewService.name);

  constructor(
    private prisma: PrismaService,
    private provider: OpenRouterProvider,
    private promptLoader: PromptLoaderService,
    private cacheService: AICacheService,
    private modelRegistry: ModelRegistryService,
    private rateLimitService: AIRateLimitService,
    private safetyService: AISafetyService,
  ) {}

  async getWeeklyReview(userId: string): Promise<WeeklyReview | null> {
    const { weekStart, weekEnd } = this.getWeekRange();
    const cacheKey = `weekly-review-${weekStart}`;
    
    const cached = await this.cacheService.get(userId, cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        await this.cacheService.invalidate(userId, cacheKey);
      }
    }

    const review = await this.generateWeeklyReview(userId, weekStart, weekEnd);
    
    if (review) {
      await this.cacheService.set(userId, cacheKey, JSON.stringify(review), 'openrouter', 60 * 24 * 7);
    }

    return review;
  }

  private getWeekRange(): { weekStart: string; weekEnd: string } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const weekStart = new Date(now);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
    };
  }

  private async generateWeeklyReview(
    userId: string,
    weekStart: string,
    weekEnd: string,
  ): Promise<WeeklyReview | null> {
    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);

    const [tasks, focusSessions, behaviorEvents, goals] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.behaviorEvent.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.goal.findMany({
        where: { userId, status: 'ACTIVE' },
      }),
    ]);

    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const skippedTasks = tasks.filter(t => t.status === 'SKIPPED');

    const prompt = this.promptLoader.renderPrompt('weekly-review', {
      weekStart,
      weekEnd,
      completedTasks: JSON.stringify(completedTasks.map(t => ({
        title: t.title,
        priority: t.priority,
      }))),
      skippedTasks: JSON.stringify(skippedTasks.map(t => ({
        title: t.title,
        reason: t.description,
      }))),
      focusSessions: JSON.stringify(focusSessions.map(s => ({
        duration: s.duration,
        status: s.status,
      }))),
      goalsProgress: JSON.stringify(goals.map(g => ({
        title: g.title,
        deadline: g.targetDate,
      }))),
      behaviorEvents: JSON.stringify(behaviorEvents.map(e => ({
        type: e.type,
        timestamp: e.createdAt,
      }))),
    });

    const rateLimitResult = await this.rateLimitService.checkRateLimit(userId, 'weekly-review');
    if (!rateLimitResult.allowed) {
      return this.getFallbackWeeklyReview(completedTasks, skippedTasks, weekStart, weekEnd);
    }

    const model = this.modelRegistry.getModelForFeature('weekly-review');
    const response = await this.provider.chat(
      [{ role: 'user', content: prompt }],
      { model, temperature: 0.7, maxTokens: 1000 },
    );

    if (!response) {
      return this.getFallbackWeeklyReview(completedTasks, skippedTasks, weekStart, weekEnd);
    }

    const validatedContent = this.safetyService.validateResponse(response.content, 'weekly-review');
    await this.rateLimitService.recordUsage(userId, 'weekly-review', response.model, response.usage.totalTokens);

    try {
      const parsed = JSON.parse(validatedContent);
      
      return {
        wins: parsed.wins || [],
        mistakes: parsed.mistakes || [],
        patterns: parsed.patterns || [],
        recommendations: parsed.recommendations || [],
        overallRating: parsed.overallRating || 'average',
        focusArea: parsed.focusArea || 'Continue building consistency',
        weekStart,
        weekEnd,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to parse weekly review response', error);
      return this.getFallbackWeeklyReview(completedTasks, skippedTasks, weekStart, weekEnd);
    }
  }

  private getFallbackWeeklyReview(
    completedTasks: any[],
    skippedTasks: any[],
    weekStart: string,
    weekEnd: string,
  ): WeeklyReview {
    const completionRate = completedTasks.length / (completedTasks.length + skippedTasks.length || 1);
    
    let overallRating: WeeklyReview['overallRating'] = 'average';
    if (completionRate > 0.8) overallRating = 'excellent';
    else if (completionRate > 0.6) overallRating = 'good';
    else if (completionRate < 0.4) overallRating = 'needs-improvement';

    return {
      wins: completedTasks.slice(0, 3).map(t => `Completed: ${t.title}`),
      mistakes: skippedTasks.slice(0, 2).map(t => `Skipped: ${t.title}`),
      patterns: ['Review your task completion patterns'],
      recommendations: ['Focus on completing one task at a time'],
      overallRating,
      focusArea: 'Build consistency',
      weekStart,
      weekEnd,
      generatedAt: new Date(),
    };
  }
}
