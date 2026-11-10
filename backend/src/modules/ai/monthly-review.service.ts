import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from '@/providers/ai/openrouter.provider';
import { PromptLoaderService } from './prompt-loader.service';
import { AICacheService } from './ai-cache.service';
import { ModelRegistryService } from './model-registry.service';
import { AIRateLimitService } from './ai-rate-limit.service';
import { AISafetyService } from './ai-safety.service';
import { isMonthKey, monthKey, monthRange, previousMonthKey } from '../../common/utils/month';

export interface MonthlyStats {
  planned: number;
  completed: number;
  completionRate: number; // 0-100
  focusMinutes: number;
  activeDays: number;
}

export interface MonthlyReview {
  month: string;
  stats: MonthlyStats;
  focuses: string[];
  summary: string;
  wins: string[];
  struggles: string[];
  patterns: string[];
  nextMonth: string[];
  suggestedFocuses: string[];
  /** False when the AI was unavailable and the review was built from the numbers only. */
  aiGenerated: boolean;
  generatedAt: Date;
}

/** Pull the JSON object out of a model reply that may be wrapped in prose or ``` fences. */
export function extractJsonObject(content: string): any {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('No JSON object in response');
  return JSON.parse(content.slice(start, end + 1));
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

@Injectable()
export class MonthlyReviewService {
  private readonly logger = new Logger(MonthlyReviewService.name);

  constructor(
    private prisma: PrismaService,
    private provider: OpenRouterProvider,
    private promptLoader: PromptLoaderService,
    private cacheService: AICacheService,
    private modelRegistry: ModelRegistryService,
    private rateLimitService: AIRateLimitService,
    private safetyService: AISafetyService,
  ) {}

  /** Review of `month` ("YYYY-MM"); defaults to the last finished month. */
  async getMonthlyReview(userId: string, month?: string): Promise<MonthlyReview> {
    const target = month ?? previousMonthKey();
    if (!isMonthKey(target)) {
      throw new BadRequestException('Month must look like 2026-11');
    }
    const current = monthKey(new Date());
    if (target > current) {
      throw new BadRequestException("That month hasn't started yet");
    }

    const cacheKey = `monthly-review-${target}`;
    const cached = await this.cacheService.get(userId, cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        await this.cacheService.invalidate(userId, cacheKey);
      }
    }

    const review = await this.generate(userId, target);

    // A finished month won't change, so keep its review; a month still in
    // progress is refreshed a few times a day.
    if (review.aiGenerated) {
      const ttlMinutes = target === current ? 6 * 60 : 60 * 24 * 60;
      await this.cacheService.set(userId, cacheKey, JSON.stringify(review), 'openrouter', ttlMinutes);
    }
    return review;
  }

  private async generate(userId: string, month: string): Promise<MonthlyReview> {
    const { start, end } = monthRange(month);

    const [tasks, focusSessions, plan, goals] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          OR: [
            { scheduledAt: { gte: start, lt: end } },
            { completedAt: { gte: start, lt: end } },
          ],
        },
      }),
      this.prisma.focusSession.findMany({
        where: { userId, startedAt: { gte: start, lt: end } },
      }),
      this.prisma.monthPlan.findUnique({ where: { userId_month: { userId, month } } }),
      this.prisma.goal.findMany({ where: { userId, status: 'ACTIVE' } }),
    ]);

    const completed = tasks.filter(
      (t) => t.status === 'COMPLETED' && t.completedAt && t.completedAt >= start && t.completedAt < end,
    );
    const planned = tasks.filter((t) => t.scheduledAt && t.scheduledAt >= start && t.scheduledAt < end);
    const unfinished = planned.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    const activeDays = new Set(completed.map((t) => (t.completedAt as Date).toDateString())).size;
    const focusMinutes = Math.round(
      focusSessions.reduce((sum, s) => sum + (s.duration ?? 0), 0) / 60,
    );

    const stats: MonthlyStats = {
      planned: planned.length,
      completed: completed.length,
      completionRate: planned.length
        ? Math.round((planned.filter((t) => t.status === 'COMPLETED').length / planned.length) * 100)
        : 0,
      focusMinutes,
      activeDays,
    };
    const focuses = plan?.focuses ?? [];

    const fallback = (): MonthlyReview => ({
      month,
      stats,
      focuses,
      summary:
        completed.length === 0
          ? 'Not much was recorded this month. That is fine; next month is a fresh start.'
          : `You finished ${completed.length} task${completed.length === 1 ? '' : 's'} on ${activeDays} day${activeDays === 1 ? '' : 's'} this month.`,
      wins: completed.slice(0, 5).map((t) => t.title),
      struggles: unfinished.slice(0, 3).map((t) => `Not finished: ${t.title}`),
      patterns: [],
      nextMonth: ['Pick one to three focus areas for next month.'],
      suggestedFocuses: [],
      aiGenerated: false,
      generatedAt: new Date(),
    });

    if (tasks.length === 0 && focusSessions.length === 0) {
      return fallback();
    }

    const rate = await this.rateLimitService.checkRateLimit(userId, 'monthly-review');
    if (!rate.allowed) return fallback();

    const prompt = this.promptLoader.renderPrompt('monthly-review', {
      month,
      focuses: focuses.length ? JSON.stringify(focuses) : 'none set',
      note: plan?.note ?? 'none',
      stats: JSON.stringify(stats),
      completedTasks: JSON.stringify(completed.slice(0, 60).map((t) => ({ title: t.title, priority: t.priority }))),
      unfinishedTasks: JSON.stringify(unfinished.slice(0, 30).map((t) => ({ title: t.title }))),
      goals: JSON.stringify(goals.map((g) => ({ title: g.title, progress: g.progress, deadline: g.targetDate }))),
    });

    const response = await this.provider.chat([{ role: 'user', content: prompt }], {
      model: this.modelRegistry.getModelForFeature('monthly-review'),
      temperature: 0.6,
      maxTokens: 1200,
    });
    if (!response) return fallback();

    await this.rateLimitService.recordUsage(
      userId,
      'monthly-review',
      response.model,
      response.usage.totalTokens,
    );

    try {
      const parsed = extractJsonObject(this.safetyService.validateResponse(response.content, 'monthly-review'));
      return {
        month,
        stats,
        focuses,
        summary: typeof parsed.summary === 'string' ? parsed.summary : fallback().summary,
        wins: strings(parsed.wins),
        struggles: strings(parsed.struggles),
        patterns: strings(parsed.patterns),
        nextMonth: strings(parsed.nextMonth),
        suggestedFocuses: strings(parsed.suggestedFocuses).slice(0, 3),
        aiGenerated: true,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to parse monthly review response', error as Error);
      return fallback();
    }
  }
}
