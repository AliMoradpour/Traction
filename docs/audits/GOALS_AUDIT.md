# GOALS_AUDIT.md

## Backend Assessment

### Prisma Schema
- **Goal** model: 14 fields (id, userId, title, description, type, category, startDate, targetDate, completedAt, progress, status, health, velocity, timestamps)
- **GoalMilestone** model: 10 fields (id, goalId, title, description, targetDate, completedAt, progress, status, timestamps)
- **GoalPlan** model: 10 fields (id, goalId, title, description, steps, recommendedAt, appliedAt, status, timestamps)
- **Relations**: Goal → Tasks (1:N, SetNull), Goal → Milestones (1:N, Cascade), Goal → Plans (1:N, Cascade)
- **Enums**: GoalType (5), GoalStatus (4), GoalHealth (5), MilestoneStatus (4), PlanStatus (3)

### API Endpoints (16 total)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/goals` | POST | Create goal |
| `/goals` | GET | List goals (filter by status/type/category) |
| `/goals/:id` | GET | Get goal detail |
| `/goals/:id` | PATCH | Update goal |
| `/goals/:id` | DELETE | Delete goal |
| `/goals/:id/archive` | PATCH | Archive goal |
| `/goals/:id/feasibility` | GET | Feasibility analysis (stub) |
| `/goals/:id/projection` | GET | Health projection (stub) |
| `/goals/:id/milestones` | POST | Create milestone |
| `/goals/:id/milestones` | GET | List milestones |
| `/goals/:id/milestones/:mid` | PATCH | Update milestone |
| `/goals/:id/milestones/:mid` | DELETE | Delete milestone |
| `/goals/:id/plans` | POST | Create plan |
| `/goals/:id/plans` | GET | List plans |
| `/goals/:id/plans/:pid` | PATCH | Update plan |
| `/goals/:id/plans/:pid` | DELETE | Delete plan |

### AI Integration
- **GoalRecoveryService**: POST `/ai/goal-recovery/:goalId` — AI-powered recovery analysis
- **DailyBriefService**: Includes active goals in daily brief
- **WeeklyReviewService**: Includes active goals in weekly review

### Known Backend Issues
- `getFeasibility()` and `getProjection()` are stubs (hardcoded values)
- Goal `progress` is never auto-calculated from milestones/tasks
- Goal queries don't include nested tasks/milestones
- Milestone `completedAt` not auto-set on completion
- No pagination on goal listing

## Frontend Assessment

### Service Layer — COMPLETE
- `goal.service.ts`: 18 API functions covering all endpoints
- `useGoals.ts`: 15 hooks (7 query + 8 mutation)
- `queryKeys.ts`: 10 goal-related keys
- `cacheConfig.ts`: goals (2min stale) + ai (10min stale)
- `endpoints.ts`: Full goal endpoint mapping

### Screen Status
| Screen | Status | Data |
|--------|--------|------|
| `goals/index.tsx` | MOCK DATA | 4 hardcoded goals |
| `goals/select.tsx` | STUB | setTimeout placeholder |
| `goals/feasibility.tsx` | HARDCODED | Static IELTS data |
| `goals/[goalId]/index.tsx` | PLACEHOLDER | "Coming soon" |
| `goals/[goalId]/projection.tsx` | PLACEHOLDER | "Coming soon" |

### Missing Screens
- Goal creation wizard (multi-step)
- Goal edit screen
- Milestones list/management
- Plans list/management
- Goal analytics
- Recovery planning UI

### Components
- `GoalCard.tsx`: Exists but unused by goals list
- `EmptyGoalsState.tsx`: Exists
- `GoalCardSkeleton.tsx`: Exists
- `useGoalsStore.ts`: Exists but unused

### Missing Hooks
- `useUpdatePlan`
- `useDeletePlan`
- `useGoalRecovery` (AI endpoint exists, no hook)

## Gap Analysis
- **Backend**: 16 endpoints ready, needs progress auto-calculation and real projection
- **Frontend**: Service/hook layer 100% complete, screens 0% functional
- **Priority**: Wire screens to real API, build wizard, implement projection engine
