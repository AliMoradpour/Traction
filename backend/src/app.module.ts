import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { FocusModule } from './modules/focus/focus.module';
import { GoalsModule } from './modules/goals/goals.module';
import { GoalHealthModule } from './modules/goal-health/goal-health.module';
import { InsightsModule } from './modules/insights/insights.module';
import { BehaviorModule } from './modules/behavior/behavior.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AIModule } from './modules/ai/ai.module';
import { ExecutionModule } from './modules/execution/execution.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    TasksModule,
    FocusModule,
    GoalsModule,
    GoalHealthModule,
    InsightsModule,
    BehaviorModule,
    NotificationsModule,
    AIModule,
    ExecutionModule,
  ],
})
export class AppModule {}
