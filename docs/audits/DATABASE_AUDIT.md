# Phase 3: Database Audit

## Prisma 7 Configuration

- `prisma.config.ts` uses `defineConfig` with `env('DATABASE_URL')`
- Schema: `prisma/schema.prisma`
- Datasource: PostgreSQL
- Generator: `prisma-client-js`

## Models (13 total)

### User (`users`)
- Fields: id, email, password, firstName, lastName, avatar, role, createdAt, updatedAt
- Relations: profile, tasks, focusSessions, goals, insights, behaviors, notifications, refreshTokens, aiRecommendations
- Constraints: `@unique` on email

### UserProfile (`user_profiles`)
- Fields: id, userId, aiPersonality, deepWorkMode, notificationDensity, aiAutoScheduling, workStartHour, workEndHour, workDays, energyPeakStart, energyPeakEnd, sleepSync, focusBreakInterval
- Relations: user (bidirectional)
- Issues: `workDays` stored as CSV string, no constraint that start < end

### Task (`tasks`)
- Fields: id, userId, title, description, category, priority, duration, friction, energy, scheduledAt, dueAt, completedAt, status, goalId
- Relations: user, goal, focusSessions, behaviors
- Indexes: `[userId, status]`, `[userId, scheduledAt]`, `[goalId]`

### FocusSession (`focus_sessions`)
- Fields: id, userId, taskId, startedAt, endedAt, duration, status, completed
- Relations: user, task
- Indexes: `[userId, status]`, `[taskId]`
- Issues: Redundant `completed` boolean + `status` enum

### Goal (`goals`)
- Fields: id, userId, title, description, type, category, startDate, targetDate, completedAt, progress, status, health, velocity
- Relations: user, tasks, milestones, plans, insights, behaviors
- Indexes: `[userId, status]`
- Issues: `velocity` is freeform string, no constraint on progress 0-100

### GoalMilestone (`goal_milestones`)
- Fields: id, goalId, title, description, targetDate, completedAt, progress, status
- Relations: goal
- Indexes: `[goalId]`

### GoalPlan (`goal_plans`)
- Fields: id, goalId, title, description, steps, recommendedAt, appliedAt, status
- Relations: goal
- Indexes: `[goalId]`
- Issues: `steps` stored as JSON string instead of Prisma Json type

### AIRecommendation (`ai_recommendations`)
- Fields: id, userId, sourceType, sourceId, kind, title, body, payload, acceptedAt, dismissedAt, createdAt
- Relations: user
- Indexes: `[userId]`, `[userId, kind]`
- Issues: `sourceType` and `kind` are freeform strings, should be enums

### Insight (`insights`)
- Fields: id, userId, goalId, type, title, content, data, generatedBy, confidence, read, dismissed
- Relations: user, goal
- Indexes: `[userId, type]`, `[userId, read]`

### BehaviorEvent (`behavior_events`)
- Fields: id, userId, taskId, goalId, focusSessionId, type, metadata, value, createdAt
- Relations: user, task, goal, focusSession
- Indexes: `[userId, type]`, `[userId, createdAt]`

### Notification (`notifications`)
- Fields: id, userId, type, title, body, data, read, sentAt, createdAt
- Relations: user
- Indexes: `[userId, read]`

### RefreshToken (`refresh_tokens`)
- Fields: id, userId, token, expiresAt, revoked, createdAt
- Relations: user
- Indexes: `[userId]`, `[token]`
- Missing: No index on `expiresAt` for cleanup queries

### AICache (`ai_cache`)
- Fields: id, userId, feature, content, model, expiresAt
- Constraints: `@@unique([userId, feature])`
- Indexes: `[userId, feature]`, `[expiresAt]`

### AIUsage (`ai_usage`)
- Fields: id, userId, feature, model, tokensUsed, createdAt
- Indexes: `[userId, feature, createdAt]`, `[createdAt]`
- Issues: No `user` relation (by design - analytics data)

## Missing Entities
- UserSession (device tracking)
- AuditLog
- Tag/Label system for tasks
- Recurring tasks
- Task dependencies

## Migration Status
- Prisma 7 config migrated (datasource URL moved to prisma.config.ts)
- No pending migrations reported
