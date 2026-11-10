import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { AdminModule } from './modules/admin/admin.module';
import { InvitesModule } from './modules/invites/invites.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { PlanningModule } from './modules/planning/planning.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
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
    AdminModule,
    InvitesModule,
    FeedbackModule,
    PlanningModule,
  ],
  controllers: [HealthController],
  providers: [
    // Without this guard ThrottlerModule is configured but never enforced, so every
    // @Throttle() limit (login, register, password reset, ...) would be a no-op.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
