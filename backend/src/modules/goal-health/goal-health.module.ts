import { Module } from '@nestjs/common';
import { GoalHealthController } from './goal-health.controller';
import { GoalHealthService } from './goal-health.service';

@Module({
  controllers: [GoalHealthController],
  providers: [GoalHealthService],
  exports: [GoalHealthService],
})
export class GoalHealthModule {}
