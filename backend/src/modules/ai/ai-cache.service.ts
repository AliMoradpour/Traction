import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CacheEntry {
  id: string;
  userId: string;
  feature: string;
  content: string;
  model: string;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class AICacheService {
  private readonly logger = new Logger(AICacheService.name);

  constructor(private prisma: PrismaService) {}

  async get(userId: string, feature: string): Promise<string | null> {
    try {
      const cache = await this.prisma.aICache.findUnique({
        where: {
          userId_feature: { userId, feature },
        },
      });

      if (!cache) {
        return null;
      }

      if (new Date() > cache.expiresAt) {
        await this.prisma.aICache.delete({
          where: { id: cache.id },
        });
        return null;
      }

      return cache.content;
    } catch (error) {
      this.logger.error('Failed to get AI cache', error);
      return null;
    }
  }

  async set(
    userId: string,
    feature: string,
    content: string,
    model: string,
    ttlMinutes: number = 60,
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

      await this.prisma.aICache.upsert({
        where: {
          userId_feature: { userId, feature },
        },
        update: {
          content,
          model,
          expiresAt,
        },
        create: {
          userId,
          feature,
          content,
          model,
          expiresAt,
        },
      });
    } catch (error) {
      this.logger.error('Failed to set AI cache', error);
    }
  }

  async invalidate(userId: string, feature: string): Promise<void> {
    try {
      await this.prisma.aICache.deleteMany({
        where: {
          userId,
          feature,
        },
      });
    } catch (error) {
      this.logger.error('Failed to invalidate AI cache', error);
    }
  }

  async invalidateAll(userId: string): Promise<void> {
    try {
      await this.prisma.aICache.deleteMany({
        where: { userId },
      });
    } catch (error) {
      this.logger.error('Failed to invalidate all AI cache', error);
    }
  }

  async cleanupExpired(): Promise<number> {
    try {
      const result = await this.prisma.aICache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return result.count;
    } catch (error) {
      this.logger.error('Failed to cleanup expired AI cache', error);
      return 0;
    }
  }
}
