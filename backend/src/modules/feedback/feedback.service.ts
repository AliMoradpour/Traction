import { Injectable } from '@nestjs/common';
import { FeedbackType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto, FeedbackTypeDto } from './dto/feedback.dto';

const TYPE_MAP: Record<FeedbackTypeDto, FeedbackType> = {
  [FeedbackTypeDto.BUG]: FeedbackType.BUG,
  [FeedbackTypeDto.FEATURE]: FeedbackType.FEATURE,
  [FeedbackTypeDto.GENERAL]: FeedbackType.GENERAL,
};

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  /** Idempotent on clientId so the app can safely retry the same submission. */
  async create(userId: string, dto: CreateFeedbackDto) {
    const feedback = await this.prisma.feedback.upsert({
      where: { clientId: dto.clientId },
      update: {},
      create: {
        clientId: dto.clientId,
        userId,
        type: TYPE_MAP[dto.type],
        message: dto.message.trim(),
        screen: dto.screen,
      },
      select: { id: true, createdAt: true },
    });
    return feedback;
  }

  async list(limit = 100) {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 500),
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
  }
}
