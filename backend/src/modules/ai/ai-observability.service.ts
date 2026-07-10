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

@Injectable()
export class AIObservabilityService {
  private readonly logger = new Logger(AIObservabilityService.name);
  private readonly responseTimes: number[] = [];
  private readonly failures: number = 0;
  private readonly successes: number = 0;

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
}
