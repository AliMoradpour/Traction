# BEHAVIOR_ENGINE_REPORT.md

## Implemented Features

### Behavior Timeline
- Record events: task created, completed, snoozed, skipped, updated, focus started/completed/abandoned, goal events, reflection, stuck analysis
- Query events by type, task, goal, date range
- Event storage via BehaviorEvent model with metadata and value fields

### Daily Metrics
- Tasks planned vs completed
- Completion rate (%)
- Average start delay (minutes from scheduled to completed)
- Average completion delay (minutes from due to completed)
- Deep work time (total focus session minutes)
- Focus session count
- Event count

### Weekly Metrics
- Consistency (% of days with activity)
- Weekly task completion count
- Missed tasks (due but not completed)
- Delayed tasks (completed after due date)
- Planning accuracy (% of planned tasks completed)
- Average daily output

### Behavior Indicators (6 scores, 0-100)
1. **Consistency Score** — % of days with at least one behavior event
2. **Execution Score** — % of scheduled tasks that were completed
3. **Reliability Score** — % of tasks with due dates completed on time
4. **Planning Accuracy** — % of planned tasks completed on schedule
5. **Momentum Score** — weighted recent completion rate (recent days weighted higher)
6. **Recovery Score** — ratio of completed tasks vs snoozed tasks

### Burnout Detection
- 5 risk signals scored 0-20 each (total 0-100):
  1. Rapidly decreasing completion rate
  2. Increasing focus session abandonment
  3. Increasing task postponement
  4. Decreasing focus session duration
  5. Large inactivity gaps
- Risk levels: low (0-25), moderate (26-50), high (51-75), critical (76-100)
- Trend: improving/stable/worsening (this week vs last week)

### Procrastination Detection
- Snooze frequency (times per week)
- Peak procrastination time (hour of day)
- Patterns detected: repeated postponement, rescheduling, late starts
- Common reasons from WHY_AM_I_STUCK events
- Score: snoozeCount * 10 + rescheduleCount * 5, capped at 100

### Dashboard Screens
- **Main Dashboard**: Today's summary, indicator grid, burnout/procrastination cards
- **Daily Breakdown**: Date picker, task completion, delays, focus stats
- **Weekly Trends**: Consistency, completion, missed/delayed, 7-day grid
- **Indicators**: 6 scores with animated progress bars
- **Burnout**: Risk gauge, 5-signal breakdown, trend, recommendations
- **Procrastination**: Score, frequency, patterns, recommendations

### Focus Integration
- Focus screens wired to real API (start/pause/resume/cancel/complete)
- Behavior events tracked on focus start/complete/abandon
- WHY_AM_I_STUCK events recorded with user-selected reasons
- AI stuck-analysis integration for real recommendations

## Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/behavior` | POST | Track event |
| `/behavior` | GET | List events |
| `/behavior/stats` | GET | Event statistics |
| `/behavior/metrics/daily` | GET | Daily metrics |
| `/behavior/metrics/weekly` | GET | Weekly metrics |
| `/behavior/metrics/indicators` | GET | 6 behavior scores |
| `/behavior/metrics/burnout` | GET | Burnout risk |
| `/behavior/metrics/procrastination` | GET | Procrastination profile |
| `/behavior/:id` | GET | Get event |
| `/behavior/:id` | DELETE | Delete event |
| `/focus/start` | POST | Start session |
| `/focus/active` | GET | Active session |
| `/focus` | GET | List sessions |
| `/focus/:id/pause` | POST | Pause |
| `/focus/:id/resume` | POST | Resume |
| `/focus/:id/complete` | POST | Complete |
| `/focus/:id/cancel` | POST | Cancel |

## Database Changes
- No new models — uses existing BehaviorEvent and FocusSession
- New index suggestion: `[userId, createdAt]` on BehaviorEvent (already exists)

## Calculation Formulas

**Consistency Score**: `(activeDays / totalDays) * 100`

**Execution Rate**: `(completedScheduledTasks / scheduledTasks) * 100`

**Momentum Score**: `(recentWeekCompletions / olderWeekCompletions) * 50`, capped at 100

**Burnout Score**: Sum of 5 signals (each 0-20), capped at 100

**Procrastination Score**: `snoozeCount * 10 + rescheduleCount * 5`, capped at 100

## Files Changed

### Backend
- `behavior.controller.ts` — 5 new metrics endpoints
- `behavior.service.ts` — 5 new computation methods
- `dto/behavior.dto.ts` — New DTOs for metrics

### Frontend
- `src/lib/behaviorEngine.ts` — Pure calculation engine (available for offline use)
- `src/hooks/useBehavior.ts` — React Query hooks using backend API
- `src/services/behavior.service.ts` — API functions for metrics
- `src/api/endpoints.ts` — New metrics endpoint paths
- `app/(app)/behavior/` — 7 dashboard screens
- `app/focus/[taskId].tsx` — Wired to real API
- `app/focus/[taskId]/simplify.tsx` — Wired to real AI
- `app/focus/[taskId]/resistance.tsx` — Wired to real AI + behavior tracking
- `app/(app)/today/index.tsx` — Dynamic focus navigation

## Known Limitations
- No BehaviorMetric caching table — metrics computed on-the-fly
- Focus sessions don't auto-create BehaviorEvent records (client must track)
- GoalHealth doesn't incorporate behavior signals
- No real-time updates (relies on polling/refresh)

## Future AI Integration Points
- BehaviorEngineService provides profile classification (7 types)
- FrictionEngineService calculates friction scores from behavior
- StuckAnalysisService provides AI-powered "why am I stuck" analysis
- DailyBriefService includes behavior profile in daily briefs
- WeeklyReviewService includes behavior data in weekly reviews
- All 5 new metrics endpoints available for AI consumption

## Build Status
- Backend: BUILD SUCCESS
- Frontend TypeScript: ZERO ERRORS
