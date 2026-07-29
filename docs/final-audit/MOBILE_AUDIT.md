# MOBILE AUDIT

## Architecture

**Framework:** Expo SDK 57 + React Native 0.86.0
**Navigation:** expo-router (file-based)
**State:** Zustand + React Query
**Styling:** StyleSheet + NativeWind (installed, unused)
**Forms:** react-hook-form + zod

## Screen Inventory

| Category | Screens | Real API | Mock Data |
|----------|---------|----------|-----------|
| Auth | 6 | 6 | 0 |
| Onboarding | 5 | 0 | 1 (feasibility) |
| Today | 7 | 7 | 0 |
| Goals | 9 | 9 | 0 |
| Insights | 3 | 3 | 0 |
| Behavior | 7 | 7 | 0 |
| Execution | 4 | 4 | 0 |
| Profile | 2 | 2 | 0 |
| Focus | 4 | 4 | 0 |
| Modals | 1 | 1 | 0 |
| **Total** | **48** | **43** | **1** |

## Navigation Tree

6 tabs: Today, Goals, Insights, Behavior, Execution, Profile

Deep navigation supported for:
- Goal detail → edit, milestones, projection, analytics, recovery
- Focus session → resistance, simplify, recovery
- Today → daily brief, reflection, add task, task details, planner, smart start, replan

## Hooks Inventory

| Domain | Queries | Mutations | Total |
|--------|---------|-----------|-------|
| Auth | 1 | 5 | 6 |
| User | 2 | 2 | 4 |
| Tasks | 3 | 6 | 9 |
| Goals | 7 | 10 | 17 |
| Focus | 3 | 5 | 8 |
| Behavior | 6 | 1 | 7 |
| Execution | 4 | 0 | 4 |
| Insights | 3 | 4 | 7 |
| Notifications | 3 | 3 | 6 |
| AI | 7 | 6 | 13 |
| **Total** | **39** | **42** | **81** |

## Problems

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | No FlatList usage — all lists use ScrollView + .map() | High | All list screens |
| 2 | Zero memoization (React.memo, useMemo, useCallback) | High | All components |
| 3 | Style objects recreated every render in TaskCard, GoalCard | Medium | TaskCard.tsx, GoalCard.tsx |
| 4 | Animated.timing() called in render body instead of useEffect | Medium | today/index.tsx, welcome.tsx |
| 5 | Hardcoded "Good morning, Alex" greeting | Medium | today/index.tsx:87 |
| 6 | Hardcoded resistance score (50) in focus session | Medium | focus/[taskId].tsx:87 |
| 7 | Duplicate queryKeys definitions (dead code) | Low | queryClient.ts vs queryKeys.ts |
| 8 | Emoji tab icons have no accessibility text | Low | _layout.tsx:50,57 |
| 9 | Minimal accessibility props across screens | Medium | All screens |
| 10 | Hardcoded hex colors in planner.tsx | Low | planner.tsx:96-101 |

## Accessibility

**Present:**
- accessibilityRole="progressbar" on ProgressBar
- accessibilityRole="button" on cards and buttons
- accessibilityLabel on Modal close, Button, BottomTabBar

**Missing:**
- accessibilityLabel on most interactive elements
- accessibilityState={{ disabled }} on disabled buttons
- accessibilityHint usage
- Screen reader announcements for state changes
- Form inputs without accessibilityLabel

## Risk Level: MEDIUM

Solid feature coverage but performance and accessibility need attention.
