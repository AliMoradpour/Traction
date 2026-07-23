# DATA_LAYER_AUDIT.md

## Current Architecture

```
src/
├── api/
│   ├── client.ts          # Axios instance + interceptors setup
│   ├── endpoints.ts       # All endpoint paths
│   ├── interceptors.ts    # Token storage + 401 refresh interceptor
│   ├── auth.ts            # Auth-specific API calls
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
│   └── index.ts           # Re-exports
├── store/
│   ├── auth.store.ts      # Auth state (Zustand)
│   ├── tasks.store.ts     # Task UI state
│   ├── goals.store.ts     # Goal UI state
│   ├── onboarding.store.ts# Onboarding wizard state
│   └── ui.store.ts        # UI preferences
└── lib/
    ├── queryClient.ts     # React Query config + query keys
    ├── config.ts          # App config
    └── validations.ts     # Zod schemas
```

## Findings

### What's Good
- Services follow consistent pattern (apiClient + endpoints)
- Hooks use React Query with queryKeys
- Cache invalidation on mutations
- Token storage with SecureStore
- 401 interceptor with refresh queue

### Issues
1. **Response extraction inconsistency**: Services read `response.data.data` but auth reads `response.data`
2. **No error model**: Each service handles errors differently (some try/catch, some don't)
3. **Duplicate query keys**: Defined in both `hooks/` and `lib/queryClient.ts`
4. **No offline support**: No connectivity detection
5. **No loading state utilities**: Each screen implements its own
6. **Console.warn in services**: Should use proper error propagation

### Counts
| Directory | Files |
|-----------|-------|
| api/ | 5 |
| services/ | 9 |
| hooks/ | 8 |
| store/ | 6 |
| **Total** | **28** |
