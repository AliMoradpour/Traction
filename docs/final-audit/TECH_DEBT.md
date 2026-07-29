# TECH DEBT INVENTORY

## Critical (Fix Before Production)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | No database migrations | prisma/migrations/ | Schema drift, no rollback |
| 2 | Backend stubs for forgotPassword/resetPassword | auth.service.ts | No email sending |
| 3 | No tests (0% coverage) | backend/test/ | No regression safety |
| 4 | Backend resetPassword accepts any token | auth.service.ts:260-270 | Security hole |
| 5 | Goal recovery uses wrong field name | goal-recovery.service.ts:95 | Runtime error |

## High (Fix Before Scale)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 6 | All lists use ScrollView instead of FlatList | All list screens | Memory/performance |
| 7 | Zero React.memo/useMemo/useCallback | All components | Unnecessary re-renders |
| 8 | N+1 query in momentum calculation | execution.service.ts | 744 sequential DB queries |
| 9 | In-memory metric computation | behavior.service.ts | O(N) memory usage |
| 10 | Duplicate data fetching in engines | daily-brief.service.ts | 2x data load |
| 11 | Animations in render path | today/index.tsx, welcome.tsx | Animation re-fires every render |
| 12 | Provider abstraction not used | All 5 AI services | Direct inject of OpenRouterProvider |
| 13 | Authorization boilerplate repeated ~40+ times | All services | Maintenance burden |

## Medium (Fix Before V1)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 14 | Hardcoded "Good morning, Alex" | today/index.tsx:87 | Personalization broken |
| 15 | Hardcoded resistance score (50) | focus/[taskId].tsx:87 | Dynamic scoring broken |
| 16 | Hardcoded colors in planner.tsx | planner.tsx:96-101 | Theme inconsistency |
| 17 | Onboarding hardcoded feasibility data | goal-feasibility.tsx | Not connected to API |
| 18 | IndicatorsQueryDto.days lacks validation | indicators-query.dto.ts | Invalid input possible |
| 19 | AI Observability uses `(this as any)` | ai-observability.service.ts:61-66 | Type safety lost |
| 20 | Insights returns static data | insights.service.ts:76-131 | Feature not dynamic |
| 21 | Task simplify returns hardcoded mock | tasks.service.ts:192-201 | Feature broken |
| 22 | Duplicate queryKeys definitions | queryClient.ts vs queryKeys.ts | Dead code |
| 23 | Inconsistent step counts in onboarding | step-counts | Confusing UX |
| 24 | Missing accessibility props | All screens | Accessibility compliance |
| 25 | No health check endpoint | — | Monitoring gap |
| 26 | No global exception filter | — | Error format inconsistency |
| 27 | No rate limiting on non-auth endpoints | — | Abuse potential |
| 28 | Emoji icons without accessibility text | _layout.tsx:50,57 | Screen reader issue |
| 29 | No CORS array support | main.ts | Single origin only |
| 30 | No request size limits | main.ts | DoS potential |

## Low (Fix When Convenient)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 31 | Missing indexes on 5 models | schema.prisma | Query performance |
| 32 | NativeWind installed but unused | package.json | Dead dependency |
| 33 | No soft deletes | All models | Data loss risk |
| 34 | No scheduled cleanup for expired data | — | Storage bloat |
| 35 | No API key rotation mechanism | — | Operational burden |
| 36 | No prompt versioning | Prompt templates | Version mismatch risk |
| 37 | Basic prompt injection defense | ai-safety.service.ts | Security weakness |
| 38 | No haptic feedback | All screens | UX polish |
| 39 | No dark mode validation | Theme system | Visual bugs |
| 40 | No HTTPS enforcement | main.ts | Security gap |

## Summary

| Severity | Count | Percentage |
|----------|-------|------------|
| Critical | 5 | 12.5% |
| High | 8 | 20% |
| Medium | 17 | 42.5% |
| Low | 10 | 25% |
| **Total** | **40** | **100%** |

## Estimated Effort

| Category | Estimated Hours |
|----------|----------------|
| Critical fixes | 16-20 hours |
| High priority fixes | 40-50 hours |
| Medium priority fixes | 30-40 hours |
| Low priority fixes | 10-15 hours |
| **Total** | **96-125 hours** |
