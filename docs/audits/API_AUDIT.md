# Phase 4: API Audit

## Endpoint Summary

| Module | Endpoints | Auth | Public |
|--------|-----------|------|--------|
| Auth | 7 | 2 | 5 |
| Users | 5 | 5 | 0 |
| Tasks | 10 | 10 | 0 |
| Goals | 16 | 16 | 0 |
| Focus | 8 | 8 | 0 |
| Behavior | 5 | 5 | 0 |
| Notifications | 7 | 7 | 0 |
| Goal Health | 2 | 2 | 0 |
| Insights | 9 | 9 | 0 |
| AI | 12 | 11 | 1 |
| **Total** | **81** | **75** | **6** |

## Critical Route Collision Bugs

Static routes are shadowed by `/:id` parameterized routes. NestJS matches top-down, making these routes **unreachable**:

| Module | Unreachable Route | Shadowed By |
|--------|-------------------|-------------|
| Tasks | `GET /tasks/date/:date` | `GET /tasks/:id` |
| Tasks | `GET /tasks/:id/steps` | `GET /tasks/:id` (partial) |
| Tasks | `POST /tasks/:id/simplify` | N/A (POST) |
| Focus | `GET /focus/active` | `GET /focus/:id` |
| Behavior | `GET /behavior/stats` | `GET /behavior/:id` |
| Notifications | `GET /notifications/unread-count` | `GET /notifications/:id` |
| Notifications | `GET /notifications/preferences` | `GET /notifications/:id` |
| Notifications | `PATCH /notifications/read-all` | `PATCH /notifications/:id` |
| Insights | `GET /insights/daily-brief` | `GET /insights/:id` |
| Insights | `GET /insights/behavioral-awareness` | `GET /insights/:id` |
| Insights | `GET /insights/weekly-review` | `GET /insights/:id` |
| Insights | `PATCH /insights/read-all` | `PATCH /insights/:id` |

**Total unreachable routes: 12**

## Other Bugs

1. **Auth controller**: Duplicate route decorators (`@Post('forgot-password')` + `@Post('password/forgot')` stacked)
2. **Tasks simplify**: Returns hardcoded mock data, never calls AI
3. **AI stuck-analysis**: Uses raw `@Body()` without DTO validation
4. **JWT Strategy**: Falls back to empty string if JWT_SECRET unset

## Guard/Strategy/Decorator Inventory

| Item | File | Purpose |
|------|------|---------|
| JwtAuthGuard | `common/guards/jwt-auth.guard.ts` | Wraps Passport JWT guard |
| JwtStrategy | `common/strategies/jwt.strategy.ts` | Extracts/validates Bearer token |
| CurrentUser | `common/decorators/current-user.decorator.ts` | Extracts request.user |
| ValidationPipe | `main.ts` (global) | whitelist + transform + forbidNonWhitelisted |

## Missing

- No rate limiting middleware
- No request logging/interceptor
- No exception filter
- No health check endpoint
- No API versioning (all routes under `/api/`)
