# AI_ENGINE_REPORT.md

## Provider Architecture

### Abstraction Layer
- **Interface**: `AIProvider` — `chat(messages, options) → AICompletionResponse`
- **Implementation**: `OpenRouterProvider` — HTTP client with automatic 429 fallback
- **Module**: `AIProvidersModule` — registered in root AI module
- **Swap-ready**: Change provider implementation without touching feature services

### Supported Providers (planned)
| Provider | Status | Model |
|----------|--------|-------|
| OpenRouter | ✅ Active | anthropic/claude-3-haiku |
| OpenAI | 🔲 Ready | — |
| Anthropic | 🔲 Ready | — |
| Gemini | 🔲 Ready | — |
| DeepSeek | 🔲 Ready | — |
| Mistral | 🔲 Ready | — |

### Model Registry
- `ModelRegistryService` maps features to models
- Configurable via `AI_MODEL_PRIMARY` and `AI_MODEL_FALLBACK` env vars
- All 5 feature services now use registry instead of hardcoded model

## Prompt Architecture

### Template System
- Markdown templates in `backend/prompts/`
- `PromptLoaderService` loads `.md` files at startup
- `renderPrompt(name, variables)` does `{{key}}` replacement
- Hot-reload support via `reloadPrompts()`

### Prompt Templates (10 total)
| Template | Variables | Used By |
|----------|-----------|---------|
| `daily-brief` | date, tasks, goals, behaviorProfile, frictionScore | DailyBriefService |
| `weekly-review` | weekStart/End, completedTasks, skippedTasks, focusSessions | WeeklyReviewService |
| `task-breakdown` | taskTitle, taskDescription, energyLevel, availableTime | TaskBreakdownService |
| `stuck-analysis` | feeling, currentTask, recentActivity, timeOfDay | StuckAnalysisService |
| `goal-recovery` | goalTitle, deadline, currentProgress, expectedProgress | GoalRecoveryService |
| `task-breakdown-simple` | task details | OpenRouterService (legacy) |
| `goal-feasibility` | goal data | AIService |
| `insight` | user data | AIService |
| `recommendation` | user data | AIService |
| `simplify-task` | task data | AIService |

## AI Features

### Adaptive Daily Planner
- Collects: tasks, goals, behavior metrics, energy pattern, deadlines
- Generates: ordered daily schedule with reasoning
- Explains: WHY each task is recommended
- Energy-based: morning=high, afternoon=medium, evening=low

### Weekly Review
- Collects: week's tasks, focus sessions, behavior events, goals
- Generates: what went well, delays, planning mistakes, consistency
- Caches: 7-day TTL

### Goal Recovery
- Collects: goal data, tasks, milestones, progress metrics
- Generates: remaining work, required effort, recovery strategies
- Caches: per-goal

### Behavior Coaching
- Collects: behavior indicators, burnout risk, procrastination profile
- Generates: strengths, improvements, patterns, prevention, weekly focus
- Data-driven: every recommendation references actual metrics

### Task Breakdown
- Collects: task title, description, energy level
- Generates: 2-5 actionable steps with subtask durations

### Stuck Analysis
- Collects: feeling, recent activity, time of day
- Generates: understanding, next steps, reframe

## Caching

| Feature | TTL | Storage |
|---------|-----|---------|
| Daily Brief | 24 hours | DB (AICache) |
| Weekly Review | 7 days | DB (AICache) |
| Task Breakdown | Not cached | — |
| Stuck Analysis | Not cached | — |
| Goal Recovery | Not cached | — |

- Cleanup: hourly scheduled job via `setInterval` in `main.ts`
- Unique constraint: `[userId, feature]`

## Usage Management

### Tracking
- Per-request: userId, feature, model, tokensUsed, createdAt
- Daily aggregates: request count, token total
- Monthly aggregates: request count, token total, estimated cost

### Cost Estimation
- Model: Claude 3 Haiku via OpenRouter
- Rate: $0.0002 per 1K tokens
- Displayed in AI Usage Dashboard

### Rate Limits (per 24h)
| Feature | Limit |
|---------|-------|
| Daily Brief | 1 |
| Weekly Review | 1/7d |
| Goal Recovery | 3 |
| Task Breakdown | 20 |
| Stuck Analysis | 10 |
| Recommendations | 5 |

## AI Safety

### Validation Layer
- Empty response detection → feature-specific fallback
- Hallucinated metrics: >3 percentages → replaced with `[data]`
- Response length: truncated at 4000 chars
- Prompt injection: filters "ignore previous instructions", "system prompt"

### Data Integrity
- Never invents metrics, progress, or completed work
- All data sourced from backend (tasks, goals, behavior events, focus sessions)
- Fallback responses when data is insufficient
- Every recommendation references actual data

## Frontend Integration

### Hooks (useAI.ts)
- **Queries**: useDailyBrief, useWeeklyReview, useAIRecommendations, useAIStatus, useUsageSummary, useUsageByFeature, useUsageByDay
- **Mutations**: useGenerateRecommendation, useAcceptRecommendation, useDismissRecommendation, useBreakdownTask, useStuckAnalysis, useGoalRecovery

### Screens
| Screen | AI Feature | Status |
|--------|-----------|--------|
| Today/Planner | Adaptive Daily Planner | ✅ Real API |
| Today/Daily Brief | Daily Brief | ✅ Real API |
| Today/Reflection | Reflection submission | ✅ Real API |
| Insights/Index | Recommendations | ✅ Real API |
| Insights/Weekly Review | Weekly Review | ✅ Real API |
| Behavior/Coaching | Behavior Coaching | ✅ Real API |
| Focus/Resistance | Stuck Analysis | ✅ Real API |
| Profile/Usage | Usage Dashboard | ✅ Real API |

### Behavioral Awareness
- Uses behavior indicators from Behavior Engine
- No separate AI call needed

## Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ai/recommendations` | GET | List recommendations |
| `/ai/recommendations/generate` | POST | Generate recommendation |
| `/ai/recommendations/:id/accept` | POST | Accept |
| `/ai/recommendations/:id/dismiss` | POST | Dismiss |
| `/ai/daily-brief` | GET | Daily brief |
| `/ai/breakdown-task/:taskId` | POST | Task breakdown |
| `/ai/stuck-analysis` | POST | Stuck analysis |
| `/ai/weekly-review` | GET | Weekly review |
| `/ai/goal-recovery/:goalId` | POST | Goal recovery |
| `/ai/usage` | GET | Basic usage stats |
| `/ai/usage/summary` | GET | Usage summary |
| `/ai/usage/by-feature` | GET | Feature breakdown |
| `/ai/usage/by-day` | GET | Daily trend |
| `/ai/metrics` | GET | Observability metrics |
| `/ai/status` | GET | AI configured check |

## Known Limitations
- Only OpenRouter provider implemented (others are interface-ready)
- Prompt versioning is hardcoded ('1.0.0')
- No prompt A/B testing
- Cache cleanup is interval-based, not event-driven
- No real-time streaming responses
- No conversation history (stateless)
- No user feedback loop on recommendations
- Cost estimation is approximate

## Future Improvements
- Add OpenAI/Anthropic/Gemini providers
- Implement prompt versioning with migration support
- Add streaming responses for better UX
- Add conversation memory
- Add user feedback loop (thumbs up/down on recommendations)
- Add A/B testing for prompts
- Add cost alerts and budget limits
- Add prompt performance tracking
- Add semantic caching (similarity-based)

## Build Status
- Backend: BUILD SUCCESS
- Frontend TypeScript: ZERO ERRORS
