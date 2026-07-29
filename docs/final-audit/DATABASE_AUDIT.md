# DATABASE AUDIT

## Prisma Schema Summary

| Model | Fields | Relations | Indexes |
|-------|--------|-----------|---------|
| User | 10 | 10 (1:1 profile, 1:N everything) | email(unique) |
| UserProfile | 15 | 1 (N:1 User) | userId(unique) |
| Task | 16 | 3 (N:1 User, N:1 Goal, 1:N focus/behavior) | [userId,status], [userId,scheduledAt], [goalId] |
| FocusSession | 11 | 3 (N:1 User, N:1 Task, 1:N behavior) | [userId,status], [taskId] |
| Goal | 17 | 5 (N:1 User, 1:N tasks/milestones/plans/insights/behavior) | [userId,status] |
| GoalMilestone | 9 | 1 (N:1 Goal) | [goalId] |
| GoalPlan | 9 | 1 (N:1 Goal) | [goalId] |
| AIRecommendation | 12 | 1 (N:1 User) | [userId], [userId,kind] |
| Insight | 13 | 2 (N:1 User, N:1 Goal) | [userId,type], [userId,read] |
| BehaviorEvent | 10 | 4 (N:1 User/Task/Goal/FocusSession) | [userId,type], [userId,createdAt] |
| Notification | 10 | 1 (N:1 User) | [userId,read] |
| RefreshToken | 7 | 1 (N:1 User) | [userId], [token(unique)] |
| AICache | 8 | 0 | [userId,feature(unique)], [expiresAt] |
| AIUsage | 7 | 0 | [userId,feature,createdAt], [createdAt] |

**Total: 14 models, 14 enums, 12+ compound indexes**

## Cascade Rules

All cascade rules are appropriate:
- User deletion cascades to all child data ✅
- Goal deletion cascades to milestones/plans, sets null on tasks/behaviors ✅
- Task deletion sets null on focus sessions/behaviors ✅

## Missing Indexes

| Model | Missing Index | Impact |
|-------|--------------|--------|
| Goal | [userId, createdAt] | Goal listing ordered by createdAt |
| Task | [userId, dueAt] | Behavior/execution filter by dueAt |
| Notification | [userId, createdAt] | Notification listing ordered by createdAt |
| RefreshToken | [userId, revoked] | Finding non-revoked tokens |
| FocusSession | [userId, startedAt] | Weekly review/execution filter by startedAt |

## Scalability Risks

| Model | Risk | Issue |
|-------|------|-------|
| BehaviorEvent | HIGH | Grows unbounded, no TTL/archival |
| AIUsage | HIGH | Every AI call logged, no cleanup |
| AICache | MEDIUM | Has cleanup but no scheduled job |
| RefreshToken | MEDIUM | Revoked tokens never cleaned |
| Notification | MEDIUM | No TTL or read-notification cleanup |

## Missing Features

1. **No migrations** — Schema has never been version-controlled via `prisma migrate`
2. **No soft deletes** — All deletions are hard deletes
3. **No scheduled cleanup** — No cron jobs for expired data

## Risk Level: MEDIUM

Schema is well-designed but lacks production hardening (migrations, cleanup, soft deletes).
