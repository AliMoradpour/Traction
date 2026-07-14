import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OpenRouterService } from './openrouter.service';
import { ModelRegistryService } from './model-registry.service';
import { PromptLoaderService } from './prompt-loader.service';
import { AICacheService } from './ai-cache.service';
import { BehaviorEngineService } from './behavior-engine.service';
import { FrictionEngineService } from './friction-engine.service';
import { DailyBriefService } from './daily-brief.service';
import { TaskBreakdownService } from './task-breakdown.service';
import { StuckAnalysisService } from './stuck-analysis.service';
import { WeeklyReviewService } from './weekly-review.service';
import { GoalRecoveryService } from './goal-recovery.service';
import { AIRateLimitService } from './ai-rate-limit.service';
import { AIObservabilityService } from './ai-observability.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AIProvidersModule } from '../../providers/ai/ai-providers.module';

@Module({
  imports: [PrismaModule, AIProvidersModule],
  controllers: [AIController],
  providers: [
    AIService,
    OpenRouterService,
    ModelRegistryService,
    PromptLoaderService,
    AICacheService,
    BehaviorEngineService,
    FrictionEngineService,
    DailyBriefService,
    TaskBreakdownService,
    StuckAnalysisService,
    WeeklyReviewService,
    GoalRecoveryService,
    AIRateLimitService,
    AIObservabilityService,
  ],
  exports: [
    AIService,
    BehaviorEngineService,
    FrictionEngineService,
    DailyBriefService,
    TaskBreakdownService,
    StuckAnalysisService,
    WeeklyReviewService,
    GoalRecoveryService,
    AIRateLimitService,
    AIObservabilityService,
  ],
})
export class AIModule {}
