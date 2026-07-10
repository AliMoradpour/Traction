import { Test, TestingModule } from '@nestjs/testing';
import { AIModule } from './ai.module';
import { AIService } from './ai.service';
import { OpenRouterService } from './openrouter.service';
import { BehaviorEngineService } from './behavior-engine.service';
import { FrictionEngineService } from './friction-engine.service';
import { DailyBriefService } from './daily-brief.service';
import { TaskBreakdownService } from './task-breakdown.service';
import { StuckAnalysisService } from './stuck-analysis.service';
import { WeeklyReviewService } from './weekly-review.service';
import { GoalRecoveryService } from './goal-recovery.service';
import { AIRateLimitService } from './ai-rate-limit.service';
import { AIObservabilityService } from './ai-observability.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AI Module', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AIModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should export all services', () => {
    expect(module.get(AIService)).toBeDefined();
    expect(module.get(OpenRouterService)).toBeDefined();
    expect(module.get(BehaviorEngineService)).toBeDefined();
    expect(module.get(FrictionEngineService)).toBeDefined();
    expect(module.get(DailyBriefService)).toBeDefined();
    expect(module.get(TaskBreakdownService)).toBeDefined();
    expect(module.get(StuckAnalysisService)).toBeDefined();
    expect(module.get(WeeklyReviewService)).toBeDefined();
    expect(module.get(GoalRecoveryService)).toBeDefined();
    expect(module.get(AIRateLimitService)).toBeDefined();
    expect(module.get(AIObservabilityService)).toBeDefined();
  });
});
