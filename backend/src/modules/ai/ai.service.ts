import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterService } from './openrouter.service';
import { AIRecommendationResponseDto } from './dto/ai.dto';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private prisma: PrismaService,
    private openRouter: OpenRouterService,
  ) {}

  async getRecommendations(userId: string): Promise<AIRecommendationResponseDto[]> {
    try {
      const recommendations = await this.prisma.aIRecommendation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return recommendations;
    } catch (error) {
      this.logger.warn('Failed to fetch recommendations, returning empty array');
      return [];
    }
  }

  async generateRecommendation(userId: string): Promise<AIRecommendationResponseDto | null> {
    if (!this.openRouter.isConfigured()) {
      this.logger.warn('OpenRouter not configured, skipping recommendation generation');
      return null;
    }

    try {
      const [tasks, goals, sessions] = await Promise.all([
        this.prisma.task.findMany({
          where: { userId },
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.goal.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.focusSession.findMany({
          where: { userId },
          take: 5,
          orderBy: { startedAt: 'desc' },
        }),
      ]);

      const context = {
        tasks: tasks.map((t) => t.title),
        goals: goals.map((g) => g.title),
        focusSessions: sessions.length,
        recentActivity: `Last ${sessions.length} focus sessions completed`,
      };

      const response = await this.openRouter.getRecommendation(context);
      if (!response) return null;

      const parsed = JSON.parse(response);

      const recommendation = await this.prisma.aIRecommendation.create({
        data: {
          userId,
          sourceType: 'ai',
          sourceId: 'system',
          kind: parsed.kind || 'suggestion',
          title: parsed.title,
          body: parsed.body,
          payload: JSON.stringify(parsed),
        },
      });

      return recommendation;
    } catch (error) {
      this.logger.error('Failed to generate recommendation', error);
      return null;
    }
  }

  async acceptRecommendation(
    userId: string,
    recommendationId: string,
  ): Promise<AIRecommendationResponseDto> {
    const recommendation = await this.prisma.aIRecommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) throw new NotFoundException('Recommendation not found');
    if (recommendation.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.aIRecommendation.update({
      where: { id: recommendationId },
      data: { acceptedAt: new Date() },
    });

    return updated;
  }

  async dismissRecommendation(
    userId: string,
    recommendationId: string,
  ): Promise<AIRecommendationResponseDto> {
    const recommendation = await this.prisma.aIRecommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) throw new NotFoundException('Recommendation not found');
    if (recommendation.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.aIRecommendation.update({
      where: { id: recommendationId },
      data: { dismissedAt: new Date() },
    });

    return updated;
  }

  async analyzeGoalFeasibility(
    goalTitle: string,
    deadline?: string,
  ): Promise<{
    feasible: boolean;
    reason: string;
    suggestions: string[];
  } | null> {
    if (!this.openRouter.isConfigured()) return null;

    try {
      const response = await this.openRouter.analyzeGoalFeasibility(goalTitle, deadline);
      if (!response) return null;
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to analyze goal feasibility', error);
      return null;
    }
  }

  async generateTaskBreakdown(
    taskTitle: string,
    description?: string,
  ): Promise<Array<{ title: string }> | null> {
    if (!this.openRouter.isConfigured()) return null;

    try {
      const response = await this.openRouter.generateTaskBreakdown(taskTitle, description);
      if (!response) return null;
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to generate task breakdown', error);
      return null;
    }
  }

  async simplifyTask(
    taskTitle: string,
    resistanceLevel: number,
  ): Promise<{
    simplifiedTitle: string;
    firstStep: string;
    motivation: string;
  } | null> {
    if (!this.openRouter.isConfigured()) return null;

    try {
      const response = await this.openRouter.simplifyTask(taskTitle, resistanceLevel);
      if (!response) return null;
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to simplify task', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return this.openRouter.isConfigured();
  }
}
