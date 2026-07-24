import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  cacheHitRate: number;
  failureRate: number;
}

export interface AIFeatureMetrics {
  feature: string;
  requests: number;
  tokens: number;
  averageResponseTime: number;
  failureRate: number;
}

export interface AIUsageSummary {
  dailyRequests: number;
  monthlyRequests: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface AIUsageByFeature {
  feature: string;
  requests: number;
  tokens: number;
  percentage: number;
}

export interface AIUsageByDay {
  date: string;
  requests: number;
  tokens: number;
}

@Injectable()
export class AIObservabilityService {
  private readonly logger = new Logger(AIObservabilityService.name);
  private readonly responseTimes: number[] = [];
  private readonly failures: number = 0;
  private readonly successes: number = 0;

  private readonly COST_PER_1K_TOKENS = 0.0002;

  constructor(private prisma: PrismaService) {}

  recordResponseTime(ms: number): void {
    this.responseTimes.push(ms);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
  }

  recordSuccess(): void {
    (this as any).successes++;
  }

  recordFailure(): void {
    (this as any).failures++;
  }

  async getMetrics(): Promise<AIMetrics> {
    const totalRequests = await this.prisma.aIUsage.count();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsage = await this.prisma.aIUsage.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const totalTokens = recentUsage.reduce((sum, u) => sum + u.tokensUsed, 0);
    
    const averageResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    const cacheTotal = await this.prisma.aICache.count();
    const cacheExpired = await this.prisma.aICache.count({
      where: { expiresAt: { lt: new Date() } },
    });
    
    const cacheHitRate = cacheTotal > 0 ? (cacheTotal - cacheExpired) / cacheTotal : 0;
    
    const totalAttempts = this.successes + this.failures;
    const failureRate = totalAttempts > 0 ? this.failures / totalAttempts : 0;

    return {
      totalRequests,
      successfulRequests: this.successes,
      failedRequests: this.failures,
      averageResponseTime,
      totalTokensUsed: totalTokens,
      cacheHitRate,
      failureRate,
    };
  }

  async getFeatureMetrics(): Promise<AIFeatureMetrics[]> {
    const features = ['daily-brief', 'weekly-review', 'task-breakdown', 'goal-recovery', 'stuck-analysis', 'recommendations'];
    
    const metrics: AIFeatureMetrics[] = [];
    
    for (const feature of features) {
      const usage = await this.prisma.aIUsage.findMany({
        where: { feature },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      metrics.push({
        feature,
        requests: usage.length,
        tokens: usage.reduce((sum, u) => sum + u.tokensUsed, 0),
        averageResponseTime: 0,
        failureRate: 0,
      });
    }

    return metrics;
  }

  async getUsageSummary(userId: string): Promise<AIUsageSummary> {
    const now = new Date();
    
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyCount, monthlyCount, monthlyUsage] = await Promise.all([
      this.prisma.aIUsage.count({
        where: {
          userId,
          createdAt: { gte: startOfDay },
        },
      }),
      this.prisma.aIUsage.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.aIUsage.findMany({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
        select: { tokensUsed: true },
      }),
    ]);

    const totalTokens = monthlyUsage.reduce((sum, u) => sum + u.tokensUsed, 0);
    const estimatedCost = (totalTokens / 1000) * this.COST_PER_1K_TOKENS;

    return {
      dailyRequests: dailyCount,
      monthlyRequests: monthlyCount,
      totalTokens,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
    };
  }

  async getUsageByFeature(userId: string): Promise<AIUsageByFeature[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usage = await this.prisma.aIUsage.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        feature: true,
        tokensUsed: true,
      },
    });

    const featureMap = new Map<string, { requests: number; tokens: number }>();
    
    for (const record of usage) {
      const existing = featureMap.get(record.feature) || { requests: 0, tokens: 0 };
      featureMap.set(record.feature, {
        requests: existing.requests + 1,
        tokens: existing.tokens + record.tokensUsed,
      });
    }

    const totalRequests = usage.length;

    return Array.from(featureMap.entries()).map(([feature, data]) => ({
      feature,
      requests: data.requests,
      tokens: data.tokens,
      percentage: totalRequests > 0 ? Math.round((data.requests / totalRequests) * 100) : 0,
    }));
  }

  async getUsageByDay(userId: string, days: number = 7): Promise<AIUsageByDay[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const usage = await this.prisma.aIUsage.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        tokensUsed: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const dayMap = new Map<string, { requests: number; tokens: number }>();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dayMap.set(dateStr, { requests: 0, tokens: 0 });
    }

    for (const record of usage) {
      const dateStr = record.createdAt.toISOString().split('T')[0];
      const existing = dayMap.get(dateStr) || { requests: 0, tokens: 0 };
      dayMap.set(dateStr, {
        requests: existing.requests + 1,
        tokens: existing.tokens + record.tokensUsed,
      });
    }

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      requests: data.requests,
      tokens: data.tokens,
    }));
  }
}
