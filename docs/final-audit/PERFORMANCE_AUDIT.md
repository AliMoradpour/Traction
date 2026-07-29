# PERFORMANCE AUDIT

## React Query Configuration

| Setting | Value | Assessment |
|---------|-------|------------|
| staleTime (global) | 5 min | ✅ Reasonable |
| gcTime (global) | 10 min | ✅ Reasonable |
| retry | 2 | ✅ Good |
| refetchOnWindowFocus | false | ✅ Good for mobile |
| refetchOnReconnect | true | ✅ Good |

## Cache Settings by Domain

| Domain | staleTime | gcTime | refetchInterval | Assessment |
|--------|-----------|--------|----------------|------------|
| tasks | 2 min | 10 min | — | ✅ Good |
| goals | 2 min | 10 min | — | ✅ Good |
| focus | 30 sec | 5 min | 30 sec | ✅ Good for real-time |
| insights | 10 min | 30 min | — | ✅ Good for expensive AI |
| notifications | 30 sec | 5 min | 30 sec | ✅ Good for real-time |
| behavior | 5 min | 15 min | — | ✅ Good |
| ai | 10 min | 30 min | — | ✅ Good |
| execution | 2 min | 10 min | — | ✅ Good |

## Critical Performance Issues

### 1. No FlatList Usage (HIGH)

**All list screens use ScrollView + .map():**
- today/index.tsx — task list
- goals/index.tsx — goals list
- behavior/index.tsx — behavior metrics
- execution/index.tsx — execution stats
- insights/index.tsx — insights list
- notifications — notification list

**Impact:** When lists grow beyond ~20 items, all items render at once. For a productivity app that accumulates tasks/goals over time, this causes significant jank and memory pressure.

**Recommendation:** Replace ScrollView with FlatList for all list screens. Consider flash-list for optimal performance.

### 2. Zero Memoization (HIGH)

**No React.memo, useMemo, or useCallback usage in components.**

- TaskCard recreates styles on every render via `createStyles(theme, status)`
- GoalCard recreates styles on every render via `createStyles(theme, riskLevel)`
- All child components re-render when parent state changes

**Recommendation:** Wrap TaskCard, GoalCard, and other pure components with React.memo. Memoize style objects with useMemo.

### 3. N+1 Query in Momentum Calculation (HIGH)

**execution.service.ts:getMomentum()** makes up to 744 sequential DB queries:
```typescript
while (true) {
  const completedTasks = await this.prisma.task.count({...})
  if (completedTasks === 0) break;
  currentStreak++;
  checkDate.setDate(checkDate.getDate() - 1);
}
```

Same pattern for executionStreak and recoveryStreak.

**Recommendation:** Use raw SQL with window functions or batch queries.

### 4. Heavy Data Loading (MEDIUM)

- `behavior.service.ts:getIndicators()` loads ALL tasks and events for N days into memory
- `behavior.service.ts:getBurnoutRisk()` loads ALL tasks, events, and focus sessions for 4 weeks
- `execution.service.ts:getExecutionStats()` loads ALL focus sessions without limit

**Recommendation:** Use Prisma `aggregate()` and `groupBy()` instead of loading into memory.

### 5. Duplicate Data Fetching (MEDIUM)

`behavior-engine.service.ts` and `friction-engine.service.ts` both independently fetch:
- Last 100 tasks
- Last 50 focus sessions
- Last 200 behavior events

When daily-brief.service.ts calls both engines, the same data is fetched twice.

**Recommendation:** Share fetched data between engines.

### 6. Animations in Render Path (MEDIUM)

Multiple screens call `Animated.timing().start()` during render:
- today/index.tsx:46-50
- welcome.tsx:12-16
- introduction.tsx:15-19

**Impact:** Animation re-fires on every render, causing unnecessary work.

**Recommendation:** Move animation start to useEffect with proper dependencies.

## Backend Performance

| Issue | Impact | Location |
|-------|--------|----------|
| Sequential streak calculation | 744 queries max | execution.service.ts |
| In-memory metric computation | Loads all data | behavior.service.ts |
| Duplicate engine data fetching | 2x data load | daily-brief.service.ts |
| No query result caching | Repeated expensive queries | All services |

## Bundle Size

| Dependency | Size | Assessment |
|------------|------|------------|
| expo | Heavy | Expected for Expo |
| react-native | Heavy | Core |
| nativewind | Medium | Installed but unused |
| react-native-reanimated | Medium | Good for animations |
| zustand | Light | ✅ Good choice |
| @tanstack/react-query | Medium | ✅ Good choice |
| react-hook-form | Medium | ✅ Good choice |

## Risk Level: HIGH

Performance issues will become critical as user data grows. FlatList and memoization are immediate needs.
