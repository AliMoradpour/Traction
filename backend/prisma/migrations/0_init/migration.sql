-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'BETA_TESTER', 'PREMIUM_USER', 'USER');

-- CreateEnum
CREATE TYPE "AIPersonality" AS ENUM ('DIRECT', 'BALANCED', 'GENTLE');

-- CreateEnum
CREATE TYPE "DeepWorkMode" AS ENUM ('INTENSE', 'MODERATE', 'RELAXED');

-- CreateEnum
CREATE TYPE "NotificationDensity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnergyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FocusStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('IELTS', 'PROGRAMMING', 'FITNESS', 'SAVINGS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "GoalHealth" AS ENUM ('ON_TRACK', 'SLIGHTLY_BEHIND', 'BEHIND_SCHEDULE', 'RECOVERY_NEEDED', 'AT_RISK');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('PENDING', 'APPLIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('FOCUS_PATTERN', 'PRODUCTIVITY_PATTERN', 'FRICTION_TREND', 'WEEKLY_SUMMARY', 'BEHAVIORAL_AWARENESS', 'AI_RECOMMENDATION');

-- CreateEnum
CREATE TYPE "BehaviorEventType" AS ENUM ('TASK_COMPLETED', 'TASK_SNOOZED', 'TASK_SKIPPED', 'TASK_CREATED', 'TASK_UPDATED', 'FOCUS_STARTED', 'FOCUS_PAUSED', 'FOCUS_COMPLETED', 'FOCUS_ABANDONED', 'WHY_AM_I_STUCK', 'GOAL_CREATED', 'GOAL_COMPLETED', 'GOAL_UPDATED', 'REFLECTION_COMPLETED', 'WEEKLY_REVIEW_VIEWED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REMINDER', 'FOCUS_PROMPT', 'WEEKLY_REVIEW', 'GOAL_UPDATE', 'INSIGHT_GENERATED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiPersonality" "AIPersonality" NOT NULL DEFAULT 'BALANCED',
    "deepWorkMode" "DeepWorkMode" NOT NULL DEFAULT 'INTENSE',
    "notificationDensity" "NotificationDensity" NOT NULL DEFAULT 'LOW',
    "aiAutoScheduling" BOOLEAN NOT NULL DEFAULT true,
    "workStartHour" INTEGER NOT NULL DEFAULT 9,
    "workEndHour" INTEGER NOT NULL DEFAULT 18,
    "workDays" TEXT NOT NULL DEFAULT 'mon,tue,wed,thu,fri',
    "energyPeakStart" INTEGER NOT NULL DEFAULT 10,
    "energyPeakEnd" INTEGER NOT NULL DEFAULT 13,
    "sleepSync" BOOLEAN NOT NULL DEFAULT false,
    "focusBreakInterval" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "duration" INTEGER,
    "friction" INTEGER,
    "energy" "EnergyLevel" NOT NULL DEFAULT 'MEDIUM',
    "scheduledAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "goalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "focus_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "FocusStatus" NOT NULL DEFAULT 'ACTIVE',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "GoalType" NOT NULL,
    "category" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "health" "GoalHealth" NOT NULL DEFAULT 'ON_TRACK',
    "velocity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_milestones" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_plans" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT,
    "recommendedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "status" "PlanStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "type" "InsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" TEXT,
    "generatedBy" TEXT,
    "confidence" DOUBLE PRECISION,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavior_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "goalId" TEXT,
    "focusSessionId" TEXT,
    "type" "BehaviorEventType" NOT NULL,
    "metadata" TEXT,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "behavior_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_cache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'BETA_TESTER',
    "invitedById" TEXT NOT NULL,
    "usedById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "tasks_userId_status_idx" ON "tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "tasks_userId_scheduledAt_idx" ON "tasks"("userId", "scheduledAt");

-- CreateIndex
CREATE INDEX "tasks_goalId_idx" ON "tasks"("goalId");

-- CreateIndex
CREATE INDEX "focus_sessions_userId_status_idx" ON "focus_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "focus_sessions_taskId_idx" ON "focus_sessions"("taskId");

-- CreateIndex
CREATE INDEX "goals_userId_status_idx" ON "goals"("userId", "status");

-- CreateIndex
CREATE INDEX "goal_milestones_goalId_idx" ON "goal_milestones"("goalId");

-- CreateIndex
CREATE INDEX "goal_plans_goalId_idx" ON "goal_plans"("goalId");

-- CreateIndex
CREATE INDEX "ai_recommendations_userId_idx" ON "ai_recommendations"("userId");

-- CreateIndex
CREATE INDEX "ai_recommendations_userId_kind_idx" ON "ai_recommendations"("userId", "kind");

-- CreateIndex
CREATE INDEX "insights_userId_type_idx" ON "insights"("userId", "type");

-- CreateIndex
CREATE INDEX "insights_userId_read_idx" ON "insights"("userId", "read");

-- CreateIndex
CREATE INDEX "behavior_events_userId_type_idx" ON "behavior_events"("userId", "type");

-- CreateIndex
CREATE INDEX "behavior_events_userId_createdAt_idx" ON "behavior_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "ai_cache_userId_feature_idx" ON "ai_cache"("userId", "feature");

-- CreateIndex
CREATE INDEX "ai_cache_expiresAt_idx" ON "ai_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_cache_userId_feature_key" ON "ai_cache"("userId", "feature");

-- CreateIndex
CREATE INDEX "ai_usage_userId_feature_createdAt_idx" ON "ai_usage"("userId", "feature", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_createdAt_idx" ON "ai_usage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "invites_code_key" ON "invites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invites_usedById_key" ON "invites"("usedById");

-- CreateIndex
CREATE INDEX "invites_code_idx" ON "invites"("code");

-- CreateIndex
CREATE INDEX "invites_email_idx" ON "invites"("email");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_plans" ADD CONSTRAINT "goal_plans_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_events" ADD CONSTRAINT "behavior_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_events" ADD CONSTRAINT "behavior_events_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_events" ADD CONSTRAINT "behavior_events_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_events" ADD CONSTRAINT "behavior_events_focusSessionId_fkey" FOREIGN KEY ("focusSessionId") REFERENCES "focus_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

