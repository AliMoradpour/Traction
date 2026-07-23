# DATA_LAYER_REPORT.md

## Architecture

```
src/
├── api/
│   ├── client.ts          # Axios instance + interceptors
│   ├── endpoints.ts       # All endpoint paths (centralized)
│   ├── interceptors.ts    # Token storage + 401 refresh
│   ├── auth.ts            # Auth API service
│   ├── errors.ts          # NEW: Normalized error model
│   └── index.ts           # Re-exports
├── services/
│   ├── task.service.ts    # Task CRUD + types
│   ├── goal.service.ts    # Goal CRUD + milestones + plans + health
│   ├── focus.service.ts   # Focus session lifecycle
│   ├── insight.service.ts # Insights + daily brief + weekly review
│   ├── behavior.service.ts# Behavior tracking + stats
│   ├── notification.service.ts # Notifications + preferences
│   ├── user.service.ts    # User profile + preferences
│   ├── ai.service.ts      # AI features
│   └── index.ts           # Re-exports
├── hooks/
│   ├── useAuth.ts         # Login/register/logout mutations
│   ├── useTasks.ts        # Task queries + mutations
│   ├── useGoals.ts        # Goal queries + mutations
│   ├── useFocus.ts        # Focus session queries + mutations
│   ├── useInsights.ts     # Insight queries + mutations
│   ├── useNotifications.ts# Notification queries + mutations
│   ├── useUser.ts         # User profile queries + mutations
│   ├── useConnectivity.ts # NEW: Offline detection
│   └── index.ts           # Re-exports
├── lib/
│   ├── queryClient.ts     # React Query config
│   ├── queryKeys.ts       # NEW: Centralized query keys
│   ├── cacheConfig.ts     # NEW: Centralized cache strategy
│   ├── config.ts          # App config
│   ├── validations.ts     # Zod schemas
│   └── index.ts           # Re-exports
├── components/feedback/
│   └── LoadingStates.tsx  # NEW: Shared loading components
└── store/
    ├── auth.store.ts      # Auth state (Zustand)
    ├── tasks.store.ts     # Task UI state
    ├── goals.store.ts     # Goal UI state
    ├── onboarding.store.ts# Onboarding wizard state
    └── ui.store.ts        # UI preferences
```

## Query Keys (Centralized)

| Feature | Keys |
|---------|------|
| auth | `auth.all`, `auth.me()` |
| users | `users.all`, `users.profile()`, `users.preferences()` |
| tasks | `tasks.all`, `tasks.list(params)`, `tasks.detail(id)`, `tasks.steps(id)` |
| goals | `goals.all`, `goals.list(params)`, `goals.detail(id)`, `goals.milestones(id)`, `goals.plans(id)` |
| focus | `focus.all`, `focus.active()`, `focus.list(params)`, `focus.detail(id)` |
| insights | `insights.all`, `insights.list(params)`, `insights.dailyBrief()`, `insights.weeklyReview()` |
| notifications | `notifications.all`, `notifications.list(params)`, `notifications.unreadCount()` |
| behavior | `behavior.all`, `behavior.list(params)`, `behavior.stats()` |
| ai | `ai.all`, `ai.recommendations()`, `ai.dailyBrief()`, `ai.weeklyReview()` |

## Cache Strategy

| Feature | StaleTime | GC Time | Refetch Interval |
|---------|-----------|---------|-----------------|
| tasks | 2 min | 10 min | - |
| goals | 2 min | 10 min | - |
| focus | 30 sec | 5 min | 30 sec |
| insights | 10 min | 30 min | - |
| notifications | 30 sec | 5 min | 30 sec |
| behavior | 5 min | 15 min | - |
| users | 5 min | 15 min | - |
| ai | 10 min | 30 min | - |
| auth | 5 min | 15 min | - |

## Error Model

| Error Type | Code | Usage |
|------------|------|-------|
| NetworkError | NETWORK_ERROR | No connectivity |
| TimeoutError | TIMEOUT | Request timeout |
| UnauthorizedError | UNAUTHORIZED | Session expired |
| ValidationError | VALIDATION_ERROR | Invalid input |
| ServerError | SERVER_ERROR | 5xx errors |

## Loading Components

- `LoadingSpinner` - Centered spinner with optional message
- `LoadingOverlay` - Full-screen overlay with spinner
- `EmptyState` - Empty state with icon, title, message

## Hooks (All Features)

| Feature | Queries | Mutations |
|---------|---------|-----------|
| Auth | useUser | useLogin, useRegister, useLogout |
| Tasks | useTasks, useTask, useTaskSteps | useCreateTask, useUpdateTask, useDeleteTask, useCompleteTask, useSimplifyTask |
| Goals | useGoals, useGoal, useGoalFeasibility, useGoalProjection, useGoalMilestones, useGoalPlans, useGoalHealth | useCreateGoal, useUpdateGoal, useDeleteGoal, useArchiveGoal, useCreateMilestone, useUpdateMilestone, useDeleteMilestone, useCreatePlan, useRecalculateHealth |
| Focus | useActiveFocusSession, useFocusSessions, useFocusSession | useStartFocusSession, usePauseFocusSession, useResumeFocusSession, useCompleteFocusSession, useCancelFocusSession |
| Insights | useInsights, useInsight, useDailyBrief, useBehavioralAwareness, useWeeklyReview | useMarkInsightAsRead, useDismissInsight, useMarkAllInsightsAsRead, useDeleteInsight |
| Notifications | useNotifications, useNotification, useUnreadNotificationCount, useNotificationPreferences | useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification |
| User | useUserProfile, useUserPreferences | useUpdateProfile, useUpdatePreferences |
| Connectivity | useConnectivity, useOnlineStatus | - |

## What's Complete
- Shared API client with interceptors
- Centralized endpoint definitions
- Centralized query keys
- Centralized cache configuration
- Normalized error model
- Reusable hooks for all features
- Shared loading components
- Offline detection foundation
- TypeScript clean
- Build passes

## Remaining Work
- Wire screens to use hooks instead of mock data (Sprint 5-9)
- Add request/response mappers for complex transformations
- Add retry logic configuration per feature
- Add optimistic updates for mutations
- Add pagination support for lists
- Add search/filter hooks
- Add offline caching with AsyncStorage/SQLite
