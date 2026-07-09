# Traction Architecture

Date: 2026-07-02
Phase: 2 - Architecture

## Architecture Goals

Traction should be built as a production mobile product with a clean boundary between the app experience, backend domain logic, and AI-assisted recommendations.

Primary goals:

- Keep the mobile app fast, typed, and resilient offline or during slow network calls.
- Keep business logic and AI orchestration on the backend, not inside UI components.
- Keep the design system reusable before screen implementation begins.
- Make the project resumable by using clear folder boundaries, typed contracts, and fixture data.
- Avoid hardcoded prompts, hardcoded mock dates, and one-off screen-specific data shapes.

## System Overview

```text
Expo Mobile App
  React Native + TypeScript
  NativeWind design system
  Expo Router navigation
  Zustand local state
  React Query server state
        |
        | HTTPS JSON API
        v
NestJS API
  Auth, Users, Tasks, Goals, Insights, AI, Notifications
  Prisma data access
  OpenAPI docs
        |
        v
PostgreSQL
        |
        v
OpenAI API
  Prompt registry
  Structured AI outputs
  Recommendation services
```

## Repository Structure

Use a monorepo so mobile, backend, and shared types evolve together.

```text
Traction
  apps
    mobile
      app
      src
        api
        assets
        components
        features
        fixtures
        hooks
        navigation
        state
        theme
        types
        utils
    api
      prisma
      src
        ai
        auth
        common
        goals
        insights
        notifications
        tasks
        users
  packages
    contracts
      src
    config
      eslint
      typescript
  docs
```

Recommended package manager: `pnpm` workspaces.

Reasoning:

- Shared contracts prevent mobile/backend drift.
- Backend and mobile can be developed independently.
- A root workspace keeps scripts, linting, and TypeScript settings consistent.

## Frontend Architecture

### Stack

- Expo
- React Native
- TypeScript
- NativeWind
- Expo Router
- Zustand
- TanStack React Query
- Expo SecureStore
- Expo Notifications

### Frontend Responsibilities

The mobile app owns:

- Presentation and interaction behavior.
- Navigation and route transitions.
- Local session bootstrap.
- Secure storage of refresh token/session metadata.
- React Query cache and optimistic UI where safe.
- Offline-aware loading, error, and empty states.
- Fixture-backed screens during early implementation.

The mobile app must not own:

- Password validation beyond client-side UX hints.
- Access-token signing or refresh-token rotation.
- AI prompt construction.
- Goal forecasting business rules.
- Cross-user data access decisions.

### Mobile Folder Structure

```text
apps/mobile/src
  api
    client.ts
    queryClient.ts
    auth.ts
    tasks.ts
    goals.ts
    insights.ts
    ai.ts
  assets
    images
    logos
  components
    ui
      Button.tsx
      Input.tsx
      Modal.tsx
      EmptyState.tsx
      ProgressBar.tsx
      MetricPill.tsx
    cards
      TaskCard.tsx
      GoalCard.tsx
      InsightCard.tsx
    layout
      Screen.tsx
      Header.tsx
      BottomTabBar.tsx
  features
    auth
    onboarding
    today
    tasks
    focus
    goals
    insights
    profile
  fixtures
  hooks
  navigation
  state
    authStore.ts
    onboardingStore.ts
    preferencesStore.ts
  theme
    colors.ts
    typography.ts
    spacing.ts
    radius.ts
    shadows.ts
    index.ts
  types
  utils
```

### State Boundaries

Use React Query for remote/server state:

- Current user
- Tasks
- Goals
- Daily brief
- AI recommendations
- Insights
- Profile settings loaded from backend
- Notifications fetched from backend

Use Zustand for local client state:

- Auth bootstrap status
- Temporary access token memory
- Onboarding draft before submission
- Local UI preferences, such as color scheme override
- Active focus-session local timer metadata before backend sync

Do not duplicate server collections in Zustand. If a value comes from the API, React Query is the source of truth.

### API Client

The mobile API client should:

- Attach the access token to requests.
- Attempt one token refresh on `401`.
- Normalize backend errors into a typed `ApiError`.
- Support abort/cancel through request signals.
- Avoid direct `fetch` calls from screens.

Recommended shape:

```text
screen -> feature hook -> api function -> api client -> backend
```

Example:

```text
TodayScreen -> useTodayBriefQuery -> getTodayBrief -> apiClient.get('/today/brief')
```

### Navigation Architecture

Use Expo Router for route structure and deep-link-friendly navigation.

```text
apps/mobile/app
  _layout.tsx
  index.tsx
  (auth)
    welcome.tsx
    login.tsx
    register.tsx
    forgot-password.tsx
  (onboarding)
    introduction.tsx
    intent.tsx
    behavior-profile.tsx
    goal-selection.tsx
    goal-feasibility.tsx
  (tabs)
    _layout.tsx
    today
      index.tsx
      daily-brief.tsx
      reflection.tsx
    goals
      index.tsx
      select.tsx
      [goalId].tsx
      [goalId]/projection.tsx
    insights
      index.tsx
      behavioral-awareness.tsx
      weekly-review.tsx
    profile
      index.tsx
  tasks
    [taskId].tsx
  focus
    [taskId].tsx
    [taskId]/resistance.tsx
    [taskId]/simplify.tsx
```

Route guards:

- Unknown session -> show splash/bootstrap screen.
- No authenticated session -> route to `(auth)/welcome`.
- Authenticated but onboarding incomplete -> route to `(onboarding)/introduction` or the next incomplete onboarding step.
- Authenticated and onboarded -> route to `(tabs)/today`.

### Design System Strategy

NativeWind should consume canonical theme tokens from `src/theme`.

Canonical token roles:

```text
brand.primary     #0F172A
brand.accent      #3B82F6
brand.success     #22C55E
brand.warning     #F59E0B
brand.danger      #EF4444
surface.app       #F8FAFC
surface.soft      #fcf8fa
surface.card      #FFFFFF
text.primary      #0F172A
text.secondary    #334155
border.subtle     #E2E8F0
```

Component rules:

- Screens compose reusable components rather than styling every element inline.
- Components expose variants, sizes, and states.
- Feature folders may contain feature-specific composite components.
- `src/theme` is the only source of base colors, spacing, radius, shadows, and typography.
- Dark mode must use semantic token aliases, not separate screen-specific styles.

### Icon Strategy

The HTML references use Material Symbols web fonts. React Native should use a native icon package.

Recommendation: use `lucide-react-native` for line icons.

Reasoning:

- Works naturally in React Native.
- Matches the clean line-art direction.
- Avoids web font loading and glyph-name dependencies.

If a Material-specific glyph is needed, map it to the closest Lucide icon during screen implementation.

## Backend Architecture

### Stack

- NestJS
- PostgreSQL
- Prisma
- JWT access tokens
- Refresh-token rotation
- OpenAPI documentation
- OpenAI integration through backend services

### Backend Responsibilities

The backend owns:

- Authentication and authorization.
- User profile and preferences.
- Task, goal, and insight domain logic.
- Focus-session persistence.
- Behavioral metric aggregation.
- AI prompt construction and output validation.
- Notification scheduling records.
- Database migrations and seed data.

The backend must not own:

- Native UI state.
- Client navigation decisions.
- Device-only data that should remain local.

### Backend Folder Structure

```text
apps/api/src
  main.ts
  app.module.ts
  common
    decorators
    filters
    guards
    interceptors
    pipes
    prisma
    types
  auth
    auth.controller.ts
    auth.service.ts
    jwt.strategy.ts
    refresh-token.service.ts
    dto
  users
  tasks
  goals
  insights
  ai
    prompts
    parsers
    ai.controller.ts
    ai.service.ts
    recommendation.service.ts
  notifications
```

### Backend Modules

| Module | Responsibility |
| --- | --- |
| Auth | Register, login, refresh, logout, password reset, social auth entry points. |
| Users | Profile, preferences, onboarding status, work-style metadata. |
| Tasks | Task CRUD, task steps, scheduling, completion, snooze, friction metadata. |
| Goals | Goal CRUD, milestones, progress, health projection, feasibility setup. |
| Insights | Daily brief, behavioral summaries, weekly review, metric aggregation. |
| AI | Prompt registry, OpenAI calls, structured output validation, recommendations. |
| Notifications | Notification preferences and scheduled notification records. |

## Database Architecture

Use PostgreSQL with Prisma migrations.

### Core Entities

```text
User
  id
  email
  passwordHash
  name
  role
  onboardingStatus
  createdAt
  updatedAt

UserPreference
  id
  userId
  aiPersonality
  deepWorkMode
  notificationDensity
  wakeWindow
  energyPeakStart
  energyPeakEnd
  preferredWorkStyle

RefreshToken
  id
  userId
  tokenHash
  familyId
  revokedAt
  expiresAt
  createdAt

Goal
  id
  userId
  title
  category
  status
  targetDate
  progressPercent
  riskLevel
  velocity
  createdAt
  updatedAt

GoalMilestone
  id
  goalId
  title
  status
  dueDate
  order

Task
  id
  userId
  goalId
  title
  description
  status
  priority
  frictionScore
  durationMinutes
  scheduledFor
  completedAt
  createdAt
  updatedAt

TaskStep
  id
  taskId
  title
  description
  durationMinutes
  status
  order

FocusSession
  id
  taskId
  userId
  startedAt
  endedAt
  durationSeconds
  outcome
  resistanceReason

DailyReflection
  id
  userId
  date
  completedTaskIds
  pendingTaskIds
  delayReason
  note

BehaviorMetric
  id
  userId
  metricType
  value
  context
  capturedAt

AIRecommendation
  id
  userId
  sourceType
  sourceId
  kind
  title
  body
  payload
  acceptedAt
  dismissedAt
  createdAt

AIPromptVersion
  id
  key
  version
  provider
  model
  template
  outputSchema
  active
  createdAt

AIRequestLog
  id
  userId
  promptVersionId
  feature
  inputHash
  output
  latencyMs
  status
  createdAt
```

### Prisma Rules

- Use enums for finite states: task status, goal status, risk level, focus outcome.
- Store AI payloads as JSON only after validating their shape.
- Store refresh tokens hashed, never in plaintext.
- Use `userId` scoping on all user-owned records.
- Add indexes on common query paths: `userId`, `scheduledFor`, `status`, `goalId`, `createdAt`.

## Authentication Architecture

### Token Model

- Access token: short-lived JWT, stored in memory on the mobile app.
- Refresh token: longer-lived opaque token, stored in Expo SecureStore.
- Refresh tokens are rotated on every refresh.
- Refresh token reuse should revoke the token family.

### Auth Flow

```text
Register/Login
  -> backend verifies credentials
  -> backend returns accessToken + refreshToken + user
  -> mobile stores refreshToken in SecureStore
  -> mobile keeps accessToken in memory
  -> mobile fetches current user

API request
  -> attach accessToken
  -> if 401, call refresh endpoint once
  -> retry original request after refresh
  -> if refresh fails, clear session and route to auth

Logout
  -> backend revokes current refresh token
  -> mobile clears SecureStore and React Query cache
```

### Auth Endpoints

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/password/forgot
POST /auth/password/reset
GET  /auth/me
```

### Security Requirements

- Hash passwords with a modern password hashing algorithm.
- Hash refresh tokens before persistence.
- Validate every request DTO.
- Scope all resource reads/writes by authenticated `userId`.
- Never expose AI logs or prompts across users.
- Keep OpenAI keys only in backend environment variables.
- Do not ship OpenAI keys in the mobile bundle.

## API Boundary

Use REST endpoints first. They are simpler for the current product surface and easy to document with OpenAPI.

Recommended endpoint groups:

```text
/auth
/users/me
/users/me/preferences
/onboarding
/tasks
/tasks/:taskId
/tasks/:taskId/steps
/tasks/:taskId/focus-sessions
/tasks/:taskId/simplify
/goals
/goals/:goalId
/goals/:goalId/feasibility
/goals/:goalId/projection
/insights/daily-brief
/insights/behavioral-awareness
/insights/weekly-review
/ai/recommendations
/notifications/preferences
```

Response shape:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Error shape:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found.",
    "details": {}
  }
}
```

## Shared Contracts

Create `packages/contracts` for shared TypeScript types and validation schemas.

Recommended approach:

- Define request/response schemas with Zod or generate types from OpenAPI.
- Export DTO types for mobile API functions.
- Keep Prisma models private to the backend.
- Do not import backend services from the mobile app.

Contract examples:

```text
TaskDto
GoalDto
DailyBriefDto
AIRecommendationDto
LoginRequest
LoginResponse
ApiErrorResponse
```

## AI Architecture

### AI Principles

- All AI calls happen on the backend.
- Prompts are versioned and stored outside UI components.
- AI output must be structured and validated before use.
- AI recommendations should be explainable enough for users to trust them.
- AI failure must degrade gracefully into deterministic fallback behavior.

### OpenAI Integration Boundary

Create a provider adapter behind the `AIService`.

```text
Feature service
  -> RecommendationService
  -> PromptRegistry
  -> OpenAIProvider
  -> OutputParser
  -> Domain service persists result
```

This keeps screens and domain services independent from provider-specific API code.

### AI Features

| Feature | Backend Service | Output |
| --- | --- | --- |
| Task Breakdown | `TaskSimplificationService` | Smaller task steps, duration estimates, rationale |
| Daily Brief | `DailyBriefService` | Focus window, friction summary, prioritized work |
| Behavior Analysis | `BehaviorInsightService` | Patterns, triggers, suggested changes |
| Goal Health | `GoalProjectionService` | Risk level, forecast, alternative scenario |
| Weekly Review | `WeeklyReviewService` | Wins, commitments, missed patterns, next shift |
| Recommendation Engine | `RecommendationService` | Ranked actionable recommendations |

### Prompt Storage

Store prompts as versioned records or files loaded by the backend.

```text
apps/api/src/ai/prompts
  task-breakdown.v1.ts
  daily-brief.v1.ts
  behavior-analysis.v1.ts
  goal-health.v1.ts
  weekly-review.v1.ts
```

Each prompt definition should include:

- Key
- Version
- Input schema
- Output schema
- Template/messages
- Allowed tools, if any
- Fallback behavior

### AI Output Validation

Every AI response must be validated before it is returned to mobile or stored.

Validation steps:

1. Parse provider response.
2. Validate against feature output schema.
3. Reject or repair invalid fields where safe.
4. Save request metadata and prompt version.
5. Return typed result to the caller.

### AI Privacy

- Do not send passwords, refresh tokens, or hidden auth metadata to OpenAI.
- Minimize personally identifiable data in prompts.
- Prefer derived behavioral metrics over raw event history when possible.
- Log input hashes and metadata instead of full sensitive inputs where possible.
- Make AI logs user-scoped and admin-protected.

## Notification Architecture

Use Expo Notifications on mobile and store notification preferences/schedules in the backend.

Initial notification categories:

- Focus window reminder
- Task start reminder
- Daily reflection reminder
- Weekly review reminder
- Goal risk alert

Implementation rule:

- Local notifications can be scheduled on device for MVP.
- Backend records should remain the source of truth for user preferences.

## Environment Configuration

Root `.env` files should not be committed.

Mobile environment:

```text
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_APP_ENV=
```

Backend environment:

```text
NODE_ENV=
PORT=
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
OPENAI_API_KEY=
EMAIL_PROVIDER_API_KEY=
```

Rules:

- Only `EXPO_PUBLIC_*` values are available to the mobile bundle.
- Secrets live only in the backend environment.
- Add `.env.example` files when the projects are initialized.

## Local Development Ports

Suggested defaults:

- Mobile dev server: Expo default
- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Prisma Studio: `http://localhost:5555`

## Testing Architecture

Frontend:

- Unit tests for utility functions and state stores.
- Component tests for reusable UI primitives.
- Screen smoke tests for route rendering.
- Visual QA through screenshots during screen implementation.

Backend:

- Unit tests for services.
- Integration tests for controllers and Prisma-backed flows.
- Auth tests for token refresh/reuse behavior.
- AI parser tests using fixed sample outputs.

End-to-end:

- Register/login.
- Complete onboarding.
- Start and complete a focus session.
- Mark a task too difficult and accept an AI simplification.
- Create a goal and view projection.
- View insights and profile.

## Observability

Minimum logging:

- Request id
- User id where authenticated
- Endpoint and latency
- Error codes
- AI feature name, prompt version, latency, and validation status

Avoid logging:

- Passwords
- Refresh tokens
- Full auth headers
- Raw sensitive prompt inputs

## Build Order From This Architecture

1. Initialize monorepo and package manager.
2. Create Expo app.
3. Add TypeScript, NativeWind, routing, React Query, Zustand.
4. Create `src/theme`.
5. Build UI primitives.
6. Implement auth screens with fixture/API shell.
7. Implement navigation guards.
8. Implement Today and task/focus flows with fixture data.
9. Initialize NestJS API.
10. Add Prisma schema and auth.
11. Connect mobile to API.
12. Add AI provider adapter and prompt registry.
13. Replace fixtures screen by screen.

## Architecture Decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| Repo shape | Monorepo | Keeps mobile, backend, and contracts in sync. |
| Mobile routing | Expo Router | Fits Expo, file-based route organization, and nested auth/onboarding/tab flows. |
| Server state | React Query | Handles cache, loading, retries, invalidation, and mutations. |
| Local state | Zustand | Lightweight state for auth bootstrap, onboarding draft, and UI preferences. |
| Styling | NativeWind + theme tokens | Converts design token language into native components efficiently. |
| Backend framework | NestJS | Module boundaries match product domains. |
| Database | PostgreSQL | Reliable relational model for users, tasks, goals, sessions, and metrics. |
| ORM | Prisma | Type-safe schema, migrations, and developer velocity. |
| Auth | JWT access + rotating refresh token | Standard mobile session model with secure refresh storage. |
| AI integration | Backend provider adapter | Keeps keys, prompts, validation, and logs off-device. |
| API style | REST + OpenAPI | Practical, easy to test, and sufficient for current product needs. |

## Open Questions

- Should onboarding happen before account creation, or only after authentication?
- Should social auth ship in MVP or remain a visual placeholder until later?
- Which exact logo exports will be available for app icon and splash?
- Should notifications be local-only for MVP or backed by a server scheduler immediately?
- Should AI request logs retain full outputs for debugging, or only validated recommendation records?
- Should the first backend milestone happen before all mobile screens, or after fixture-driven mobile completion?

## Phase 2 Completion Criteria

Phase 2 is complete when:

- `ARCHITECTURE.md` exists.
- Frontend stack and responsibilities are defined.
- Backend stack and modules are defined.
- Auth flow is defined.
- AI integration boundary is defined.
- Navigation map is concrete enough to initialize routes.
- Data model draft is concrete enough to create Prisma schema in a later phase.

