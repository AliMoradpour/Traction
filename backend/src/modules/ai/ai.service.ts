import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIRecommendationResponseDto } from './dto/ai.dto';

@Injectable()
export class AIService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: string): Promise<AIRecommendationResponseDto[]> {
    const recommendations = await this.prisma.aIRecommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return recommendations;
  }

  async acceptRecommendation(userId: string, recommendationId: string): Promise<AIRecommendationResponseDto> {
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

  async dismissRecommendation(userId: string, recommendationId: string): Promise<AIRecommendationResponseDto> {
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
}
