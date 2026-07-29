# BACKEND AUDIT

## Architecture

**Framework:** NestJS 11 with TypeScript
**ORM:** Prisma 7.8.0
**Database:** PostgreSQL
**Auth:** Passport-JWT with refresh token rotation
**API Docs:** Swagger (auto-generated, /api/docs)

## Module Summary

| Module | Controllers | Services | Endpoints | Status |
|--------|-------------|----------|-----------|--------|
| Auth | 1 | 1 | 7 | ✅ Solid |
| Users | 1 | 1 | 5 | ✅ Solid |
| Tasks | 1 | 1 | 10 | ✅ Solid |
| Goals | 1 | 1 | 16 | ✅ Solid |
| Focus | 1 | 1 | 8 | ✅ Solid |
| Behavior | 1 | 1 | 10 | ✅ Solid |
| Execution | 1 | 1 | 4 | ✅ Solid |
| Insights | 1 | 1 | 9 | ⚠️ Static data |
| Notifications | 1 | 1 | 7 | ✅ Solid |
| AI | 1 | 15 | 15 | ✅ Solid |
| Goal Health | 1 | 1 | 2 | ✅ Solid |
| **Total** | **12** | **25** | **~80** | |

## Strengths

1. **Consistent ownership checks** — Every service validates `resource.userId !== userId`
2. **Thorough DTO validation** — All DTOs use class-validator decorators
3. **Global ValidationPipe** — whitelist, forbidNonWhitelisted, transform
4. **JWT with refresh rotation** — Access tokens (15m) + refresh tokens (7d) with DB-backed revocation
5. **AI infrastructure** — Rate limiting, caching, safety validation, usage tracking, observability
6. **Full Swagger documentation** — All 80+ endpoints documented

## Problems

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | No health check endpoint | Medium | — |
| 2 | No Prisma migrations directory | High | prisma/migrations/ |
| 3 | `OPENROUTER_API_KEY` missing from .env.example | Medium | .env.example |
| 4 | `goal-recovery.service.ts:95` references `goal.deadline` but schema has `targetDate` | High | goal-recovery.service.ts |
| 5 | `InsightsService` returns static/hardcoded data | Low | insights.service.ts:76-131 |
| 6 | `TasksService.simplify()` returns hardcoded mock | Low | tasks.service.ts:192-201 |
| 7 | No global exception filter (custom error format) | Low | — |
| 8 | Per-endpoint rate limiting only on auth | Medium | — |
| 9 | `AIObservabilityService` uses `(this as any)` for counters | Medium | ai-observability.service.ts:61-66 |
| 10 | Only 1 test file exists | High | ai.module.spec.ts |

## Technical Debt

- Authorization boilerplate repeated ~40+ times across services
- Duplicate data fetching in behavior-engine + friction-engine
- `IndicatorsQueryDto.days` lacks `@IsInt`/`@Min` validation
- `forgotPassword`/`resetPassword` are stubs (no email sending)

## Risk Level: MEDIUM

The backend is well-architected but lacks production hardening (migrations, tests, monitoring).
