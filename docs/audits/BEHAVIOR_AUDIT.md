# BEHAVIOR_AUDIT.md

## Backend Assessment

### Prisma Models
- **BehaviorEvent**: 9 fields (id, userId, taskId, goalId, focusSessionId, type, metadata, value, createdAt)
- **FocusSession**: 9 fields (id, userId, taskId, startedAt, endedAt, duration, status, completed, timestamps)
- **BehaviorEventType** enum: 15 event types (TASK_COMPLETED, TASK_SNOOZED, TASK_SKIPPED, TASK_CREATED, TASK_UPDATED, FOCUS_STARTED, FOCUS_PAUSED, FOCUS_COMPLETED, FOCUS_ABANDONED, WHY_AM_I_STUCK, GOAL_CREATED, GOAL_COMPLETED, GOAL_UPDATED, REFLECTION_COMPLETED, WEEKLY_REVIEW_VIEWED)
- **FocusStatus** enum: ACTIVE, PAUSED, COMPLETED, CANCELLED

### API Endpoints
| Module | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| Behavior | `/behavior` | POST | Track event |
| Behavior | `/behavior` | GET | List events (filter by type/task/goal/date) |
| Behavior | `/behavior/stats` | GET | Count, groupBy type, recent 10 |
| Behavior | `/behavior/:id` | GET | Get event |
| Behavior | `/behavior/:id` | DELETE | Delete event |
| Focus | `/focus/start` | POST | Start session |
| Focus | `/focus/active` | GET | Get active session |
| Focus | `/focus` | GET | List sessions |
| Focus | `/focus/:id` | GET | Get session |
| Focus | `/focus/:id/pause` | POST | Pause |
| Focus | `/focus/:id/resume` | POST | Resume |
| Focus | `/focus/:id/complete` | POST | Complete |
| Focus | `/focus/:id/cancel` | POST | Cancel |

### AI Services (existing)
- **BehaviorEngineService**: analyzeBehavior(), calculatePatterns(), findPeakHour(), calculateConsistency(), determineProfile()
- **FrictionEngineService**: calculateFriction(), calculateFactors(), calculateProcrastination()
- **StuckAnalysisService**: analyzeStuck() with AI fallbacks

### Known Issues
- BehaviorEngineService:86 references `durationMinutes` but schema has `duration` in seconds
- Focus service doesn't create BehaviorEvent records (decoupled)
- No BehaviorMetric table — all computed on-the-fly
- GoalHealth doesn't incorporate behavior signals

## Frontend Assessment

### Services — COMPLETE
- `behavior.service.ts`: 5 functions (track, list, detail, stats, delete)
- `focus.service.ts`: 8 functions (start, pause, resume, complete, cancel, getActive, list, detail)
- `insight.service.ts`: includes getBehavioralAwareness(), getWeeklyReview()

### Hooks — COMPLETE
- `useFocus.ts`: 8 hooks (all mutations + queries)
- `useInsights.ts`: useBehavioralAwareness() defined
- No `useBehavior.ts` hook

### Screens — ALL MOCK/PLACEHOLDER
| Screen | Status |
|--------|--------|
| `insights/behavioral-awareness.tsx` | Placeholder ("Coming soon") |
| `insights/index.tsx` | MOCK_INSIGHTS hardcoded |
| `insights/weekly-review.tsx` | MOCK_WINS, MOCK_PATTERNS hardcoded |
| `focus/[taskId].tsx` | Timer works, AI insights hardcoded |
| `focus/[taskId]/simplify.tsx` | MOCK_STEPS hardcoded |
| `focus/[taskId]/resistance.tsx` | Hardcoded resistance reasons |

### Mock Data Locations
- `insights/index.tsx:6` — MOCK_INSIGHTS
- `insights/weekly-review.tsx:7-17` — MOCK_WINS, MOCK_PATTERNS, MOCK_CHART_DATA
- `focus/[taskId].tsx:24-28` — AI_INSIGHTS
- `focus/[taskId]/simplify.tsx:8-14` — MOCK_STEPS
- `focus/[taskId]/resistance.tsx:8-57` — RESISTANCE_REASONS, AI_RECOMMENDATIONS

## Gap Analysis
- **Backend**: Event tracking works, AI analysis exists, but no dedicated metrics/indicators endpoints
- **Frontend**: Services/hooks complete but zero screen consumption
- **Priority**: Build behavior calculation engine, wire focus screens, create dashboard
