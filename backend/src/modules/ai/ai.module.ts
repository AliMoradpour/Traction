import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OpenRouterService } from './openrouter.service';
import { ModelRegistryService } from './model-registry.service';
import { PromptLoaderService } from './prompt-loader.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AIProvidersModule } from '../../providers/ai/ai-providers.module';

@Module({
  imports: [PrismaModule, AIProvidersModule],
  controllers: [AIController],
  providers: [AIService, OpenRouterService, ModelRegistryService, PromptLoaderService],
  exports: [AIService],
})
export class AIModule {}
