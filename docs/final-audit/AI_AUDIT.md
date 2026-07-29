# AI AUDIT

## Provider Architecture

| Component | Status | Notes |
|-----------|--------|-------|
| AIProvider interface | ✅ Complete | chat(), isConfigured(), typed messages |
| OpenRouterProvider | ✅ Working | HTTP client, 429 fallback, token tracking |
| Other providers | 🔲 Missing | OpenAI, Anthropic, Gemini not implemented |
| Provider selection | ⚠️ Partial | Module only exports OpenRouterProvider |

**Critical Issue:** All 5 feature services inject `OpenRouterProvider` directly instead of using the `AIProvider` interface. The abstraction exists but isn't used.

## Feature Services

| Service | Provider | Rate Limit | Usage | Safety | Fallbacks | Status |
|---------|----------|------------|-------|--------|-----------|--------|
| DailyBriefService | Direct inject | ✅ | ✅ | ✅ | ✅ | Working |
| WeeklyReviewService | Direct inject | ✅ | ✅ | ✅ | ✅ | Working |
| TaskBreakdownService | Direct inject | ✅ | ✅ | ✅ | ✅ | Working |
| StuckAnalysisService | Direct inject | ✅ | ✅ | ✅ | ✅ | Working |
| GoalRecoveryService | Direct inject | ✅ | ✅ | ✅ | ✅ | Working |

## Prompt System

| Template | Variables | Used By |
|----------|-----------|---------|
| daily-brief.md | date, tasks, goals, behaviorProfile, frictionScore | DailyBriefService |
| weekly-review.md | weekStart/End, completedTasks, skippedTasks, focusSessions | WeeklyReviewService |
| task-breakdown.md | taskTitle, taskDescription, energyLevel, availableTime | TaskBreakdownService |
| stuck-analysis.md | feeling, currentTask, recentActivity, timeOfDay | StuckAnalysisService |
| goal-recovery.md | goalTitle, deadline, currentProgress, expectedProgress | GoalRecoveryService |
| task-breakdown-simple.md | task details | OpenRouterService (legacy) |
| goal-feasibility.md | goal data | AIService |
| insight.md | user data | AIService |
| recommendation.md | user data | AIService |
| simplify-task.md | task data | AIService |

**Issues:**
- No prompt versioning (hardcoded '1.0.0')
- No input sanitization on template variables
- Some services still use inline prompts

## AI Safety

| Check | Implementation | Gap |
|-------|---------------|-----|
| Empty responses | ✅ Feature-specific fallbacks | — |
| Hallucinated metrics | ✅ >3 percentages → [data] | — |
| Token limits | ✅ Truncated at 4000 chars | — |
| Prompt injection | ⚠️ Basic regex filter | Trivially bypassable |
| PII leakage | 🔲 Not implemented | — |
| Toxicity filtering | 🔲 Not implemented | — |
| JSON schema validation | 🔲 Not implemented | — |

## Caching

| Feature | TTL | Storage |
|---------|-----|---------|
| Daily Brief | 24 hours | DB (AICache) |
| Weekly Review | 7 days | DB (AICache) |
| Other features | Not cached | — |

## Usage Tracking

| Metric | Tracked | Displayed |
|--------|---------|-----------|
| Daily requests | ✅ | ✅ (usage dashboard) |
| Monthly requests | ✅ | ✅ |
| Token usage | ✅ | ✅ |
| Estimated cost | ✅ | ✅ |
| Per-feature breakdown | ✅ | ✅ |
| Daily trend | ✅ | ✅ |

## Frontend AI

| Hook | Type | Used By Screen |
|------|------|----------------|
| useAIRecommendations | Query | insights/index |
| useDailyBrief | Query | today/planner, today/daily-brief |
| useWeeklyReview | Query | insights/weekly-review |
| useAIStatus | Query | — (not used) |
| useGenerateRecommendation | Mutation | insights/index |
| useAcceptRecommendation | Mutation | insights/index |
| useDismissRecommendation | Mutation | insights/index |
| useBreakdownTask | Mutation | focus/simplify |
| useStuckAnalysis | Mutation | focus/resistance |
| useGoalRecovery | Mutation | goals/recovery |
| useUsageSummary | Query | profile/usage |
| useUsageByFeature | Query | profile/usage |
| useUsageByDay | Query | profile/usage |

## Risk Level: MEDIUM

AI infrastructure is production-grade but provider abstraction isn't fully wired, safety is basic, and no prompt versioning exists.
