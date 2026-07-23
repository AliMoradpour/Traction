# AI_ENGINE_AUDIT.md

## Backend Assessment

### Module Structure
- 18 files in `src/modules/ai/`
- 6 feature services: AIService, DailyBriefService, WeeklyReviewService, TaskBreakdownService, StuckAnalysisService, GoalRecoveryService
- 2 analysis engines: BehaviorEngineService, FrictionEngineService (no AI calls)
- 3 infrastructure: ai-cache, ai-rate-limit, ai-observability
- 2 legacy: openrouter.service.ts, model-registry.service.ts

### API Endpoints (12)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ai/recommendations` | GET | List recommendations |
| `/ai/recommendations/generate` | POST | Generate recommendation |
| `/ai/recommendations/:id/accept` | POST | Accept recommendation |
| `/ai/recommendations/:id/dismiss` | POST | Dismiss recommendation |
| `/ai/daily-brief` | GET | Daily brief |
| `/ai/breakdown-task/:taskId` | POST | Task breakdown |
| `/ai/stuck-analysis` | POST | Stuck analysis |
| `/ai/weekly-review` | GET | Weekly review |
| `/ai/goal-recovery/:goalId` | POST | Goal recovery |
| `/ai/usage` | GET | Usage stats |
| `/ai/metrics` | GET | Observability metrics |
| `/ai/status` | GET | AI configured check |

### Provider Abstraction
- `AIProvider` interface exists in `src/providers/ai/provider.interface.ts`
- `OpenRouterProvider` implements it
- **NOT WIRED** — feature services use legacy `OpenRouterService` instead

### Prompt System
- 5 markdown templates in `backend/prompts/`
- `PromptLoaderService` loads `.md` files, renders `{{variables}}`
- No real versioning (hardcoded '1.0.0')
- Some services use inline prompts instead of templates

### Cache
- DB-backed via Prisma `AICache` model
- daily-brief: 24h TTL, weekly-review: 7d TTL
- Other features NOT cached
- Cleanup method exists but no scheduled job

### Rate Limiting
- Defined per feature (1-20 requests per 24h window)
- **NEVER ENFORCED** — `checkRateLimit()` not called anywhere
- Usage recording defined but never called

### Known Issues
1. Provider abstraction not wired into services
2. Rate limiting defined but never enforced
3. Usage recording never called
4. Model registry injected but never used (hardcoded model)
5. Cache cleanup has no scheduled job
6. Duplicate prompt system (inline + templates)
7. All services hardcode `anthropic/claude-3-haiku`

## Frontend Assessment

### Services
- `ai.service.ts`: 9 API functions (recommendations, daily-brief, breakdown, stuck, weekly-review, goal-recovery, status)
- `insight.service.ts`: 8 functions (overlapping with ai.service)

### Hooks
- `useInsights.ts`: 8 hooks for insight CRUD + daily brief + weekly review
- **NO hooks for aiService** — zero hooks for recommendations, breakdown, stuck, goal-recovery

### Screens (ALL MOCK except resistance.tsx)
| Screen | Status |
|--------|--------|
| `insights/index.tsx` | MOCK_INSIGHTS hardcoded |
| `insights/weekly-review.tsx` | MOCK_WINS, MOCK_PATTERNS hardcoded |
| `insights/behavioral-awareness.tsx` | Placeholder |
| `today/daily-brief.tsx` | MOCK_TASKS, ENERGY_INSIGHT hardcoded |
| `today/reflection.tsx` | MOCK_TASKS, DELAY_REASONS hardcoded |
| `focus/[taskId]/resistance.tsx` | REAL API (only one) |

### Missing
- No React Query hooks for aiService
- No AI status indicator in UI
- GoalCard.aiSuggestion prop exists but never used
- Reflection screen never submits data

## Gap Analysis
- **Backend**: Provider abstraction exists but not wired; rate limiting not enforced; cache incomplete
- **Frontend**: Zero AI hooks; screens all mock; only resistance.tsx calls real API
- **Priority**: Wire provider abstraction, create AI hooks, replace mock screens
