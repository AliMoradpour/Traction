import { Module } from '@nestjs/common';
import { ExecutionController } from './execution.controller';
import { ExecutionService } from './execution.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BehaviorModule } from '../behavior/behavior.module';
import { FocusModule } from '../focus/focus.module';
import { TasksModule } from '../tasks/tasks.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, BehaviorModule, FocusModule, TasksModule, AIModule],
  controllers: [ExecutionController],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
