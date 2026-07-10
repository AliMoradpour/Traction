import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OpenRouterService } from './openrouter.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AIProvidersModule } from '../../providers/ai/ai-providers.module';

@Module({
  imports: [PrismaModule, AIProvidersModule],
  controllers: [AIController],
  providers: [AIService, OpenRouterService],
  exports: [AIService],
})
export class AIModule {}
