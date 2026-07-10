import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InsightQueryDto, InsightResponseDto } from './dto/insights.dto';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: InsightQueryDto): Promise<InsightResponseDto[]> {
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.goalId) where.goalId = query.goalId;
    if (query.read !== undefined) where.read = query.read;
    if (query.dismissed !== undefined) where.dismissed = query.dismissed;

    const insights = await this.prisma.insight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return insights;
  }

  async findOne(userId: string, insightId: string): Promise<InsightResponseDto> {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');
    return insight;
  }

  async markAsRead(userId: string, insightId: string): Promise<InsightResponseDto> {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.insight.update({
      where: { id: insightId },
      data: { read: true },
    });

    return updated;
  }

  async dismiss(userId: string, insightId: string): Promise<InsightResponseDto> {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.insight.update({
      where: { id: insightId },
      data: { dismissed: true },
    });

    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.insight.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { count: result.count };
  }

  async remove(userId: string, insightId: string): Promise<{ message: string }> {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.insight.delete({ where: { id: insightId } });
    return { message: 'Insight deleted successfully' };
  }
}
