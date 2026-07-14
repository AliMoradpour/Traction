import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RateLimitConfig {
  feature: string;
  limit: number;
  windowMinutes: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

@Injectable()
export class AIRateLimitService {
  private readonly logger = new Logger(AIRateLimitService.name);

  private readonly limits: RateLimitConfig[] = [
    { feature: 'daily-brief', limit: 1, windowMinutes: 24 * 60 },
    { feature: 'weekly-review', limit: 1, windowMinutes: 7 * 24 * 60 },
    { feature: 'goal-recovery', limit: 3, windowMinutes: 24 * 60 },
    { feature: 'task-breakdown', limit: 20, windowMinutes: 24 * 60 },
    { feature: 'stuck-analysis', limit: 10, windowMinutes: 24 * 60 },
    { feature: 'recommendations', limit: 5, windowMinutes: 24 * 60 },
  ];

  constructor(private prisma: PrismaService) {}

  async checkRateLimit(userId: string, feature: string): Promise<RateLimitResult> {
    const config = this.limits.find(l => l.feature === feature);
    
    if (!config) {
      return { allowed: true, remaining: 999, resetAt: new Date() };
    }

    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes);

    const usageCount = await this.prisma.aIUsage.count({
      where: {
        userId,
        feature,
        createdAt: { gte: windowStart },
      },
    });

    const resetAt = new Date();
    resetAt.setMinutes(resetAt.getMinutes() + config.windowMinutes);

    return {
      allowed: usageCount < config.limit,
      remaining: Math.max(0, config.limit - usageCount),
      resetAt,
    };
  }

  async recordUsage(
    userId: string,
    feature: string,
    model: string,
    tokensUsed: number = 0,
  ): Promise<void> {
    try {
      await this.prisma.aIUsage.create({
        data: {
          userId,
          feature,
          model,
          tokensUsed,
        },
      });
    } catch (error) {
      this.logger.error('Failed to record AI usage', error);
    }
  }

  async getUsageStats(userId: string): Promise<Record<string, { used: number; limit: number; remaining: number }>> {
    const stats: Record<string, { used: number; limit: number; remaining: number }> = {};

    for (const config of this.limits) {
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes);

      const used = await this.prisma.aIUsage.count({
        where: {
          userId,
          feature: config.feature,
          createdAt: { gte: windowStart },
        },
      });

      stats[config.feature] = {
        used,
        limit: config.limit,
        remaining: Math.max(0, config.limit - used),
      };
    }

    return stats;
  }
}
