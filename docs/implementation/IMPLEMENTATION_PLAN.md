# Traction Implementation Plan

Date: 2026-07-02
Current Phase: 3 - Design System Complete

## Guiding Order

The requested development priority is:

1. Architecture
2. Design System
3. Authentication
4. Navigation
5. Today Screen
6. Task System
7. Focus Session
8. AI Simplification
9. Goals
10. Insights
11. Profile
12. Backend
13. AI Layer
14. Testing
15. Production Preparation

Implementation should follow this order. Some technical scaffolding, such as route configuration, must exist before screens can run, but product work should still be reported according to the priority above.

## Milestones

| Milestone | Phase | Deliverables | Complexity | Dependencies |
| --- | --- | --- | --- | --- |
| M1 | Discovery | `PROJECT_ANALYSIS.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md` | Done | Existing design package |
| M2 | Architecture | `ARCHITECTURE.md`, data model draft, API boundary, navigation architecture | Done | Phase 1 docs |
| M3 | Mobile Foundation | Expo + React Native + TypeScript project, NativeWind, env system, app shell | Medium | Architecture decisions |
| M4 | Design System | `src/theme`, tokens, Button, Input, cards, tab bar, modal, empty state | Done | Canonical tokens, logo asset decision |
| M5 | Authentication | Login, register, forgot password, token storage, auth state | Medium | Mobile foundation, API mock or backend auth contract |
| M6 | Navigation | Root stacks, auth/onboarding/app tab separation, deep link-safe route names | Medium | Auth state model |
| M7 | Today | Today focus, behavioral brief, expanded daily brief | High | Design system, fixture data |
| M8 | Task System | Task details, task list support, create/edit foundations | High | Today task data model |
| M9 | Focus Session | Timer, completion, snooze, resistance flow | High | Task system |
| M10 | AI Simplification | AI task breakdown UI, accept plan flow, prompt/API contract | High | Focus session, backend/AI contract or mock |
| M11 | Goals | Goals home, goal selection, feasibility, health projection | High | Goal data model, chart primitives |
| M12 | Insights | Awareness, behavioral awareness, weekly review | High | Behavioral metrics model |
| M13 | Profile | Profile overview, preferences, AI personality, energy settings | Medium | User preference model |
| M14 | Backend | NestJS, PostgreSQL, Prisma, modules, auth, migrations, seed data | High | Data model and API contract |
| M15 | API Integration | React Query integration, validation, errors, typed request/response contracts | High | Backend running locally |
| M16 | AI Layer | OpenAI abstraction, prompt registry, recommendation engine, AI feature endpoints | High | Backend, OpenAI key, prompt policy |
| M17 | Testing | `TESTING_REPORT.md`, unit/integration/e2e coverage, visual QA | High | Implemented app/backend |
| M18 | Production Prep | README, env docs, build instructions, deployment config | Medium | Passing tests and stable config |

## Phase Details

### Phase 1 - Project Discovery

Status: Complete for the initial discovery pass.

Deliverables:

- Full project structure scan
- Design spec review
- Logo instruction review
- Designed page inventory
- Missing screen/state analysis
- User flow map
- Navigation map
- Risks and suggestions

### Phase 2 - Architecture

Status: Complete.

Created `ARCHITECTURE.md`.

Decisions to document:

- Mobile app architecture with Expo, React Native, TypeScript, NativeWind, Zustand, React Query.
- Navigation approach, preferably Expo Router or React Navigation with typed route params.
- Backend architecture with NestJS, PostgreSQL, Prisma.
- Auth architecture with JWT access tokens and refresh tokens.
- AI architecture with OpenAI integration behind backend services.
- Shared contracts strategy between mobile and backend.
- Environment variable strategy for mobile and backend.
- Local development commands and port conventions.

Expected outputs:

- System diagram
- Folder structure proposal
- Domain model draft
- API module map
- Security/auth flow
- AI prompt/versioning strategy

### Phase 3 - Design System

Status: Complete for the initial code foundation.

Created `DESIGN_SYSTEM.md`, `apps/mobile/src/theme`, and reusable component primitives. Full runtime wiring happens in Phase 4 when the Expo app is initialized.

Token categories:

- Colors
- Typography
- Spacing
- Radius
- Shadows/elevation
- Motion timing
- Component variants
- Dark mode semantic aliases

Reusable components:

- `Button`
- `Input`
- `TaskCard`
- `GoalCard`
- `InsightCard`
- `BottomTab`
- `Modal`
- `EmptyState`
- `Screen`
- `Header`
- `MetricPill`
- `ProgressBar`
- `FrictionBadge`

Implementation notes:

- Normalize `#0F172A`, `#000000`, `#fcf8fa`, and `#F8FAFC` into semantic roles.
- Use a native icon library instead of Material Symbols web fonts.
- Create dark mode tokens even where screenshots are light-only.

### Phase 4 - Mobile Foundation

Initialize the mobile app.

Required setup:

- Expo
- React Native
- TypeScript
- NativeWind
- Navigation
- Zustand
- React Query
- Environment config
- Auth state shell
- API client shell
- Fixture data
- `PROJECT_STRUCTURE.md`

Suggested mobile structure:

```text
apps/mobile
  app
  src
    api
    assets
    components
    features
    navigation
    state
    theme
    types
    utils
```

### Phase 5 - Screen Implementation

Implement screens one by one, using this sequence:

1. Splash
2. Welcome
3. Register
4. Login
5. Forgot Password
6. Onboarding Introduction
7. Onboarding Intent
8. Behavior Profile
9. Goal Selection
10. Goal Feasibility
11. Today Focus
12. Today Behavioral Brief
13. Expanded Daily Brief
14. Task Details
15. Focus Session
16. Resistance Flow
17. AI Simplification
18. Daily Reflection
19. Goals Home
20. Goal Health Projection
21. Insights Awareness
22. Behavioral Awareness
23. Weekly Review
24. Profile Overview
25. Missing/empty/error states

For every screen:

- Analyze `screen.png`.
- Analyze `code.html`.
- Build typed React Native screen.
- Extract reusable components when repeated patterns appear.
- Match the design closely without copying HTML.
- Support safe areas, small devices, large devices, and dark mode.
- Update `PROGRESS.md` immediately.

### Phase 6 - Backend

Create the backend workspace.

Required modules:

- Auth
- Users
- Tasks
- Goals
- Insights
- AI
- Notifications

Backend stack:

- NestJS
- PostgreSQL
- Prisma
- JWT access token
- Refresh token rotation
- Zod or class-validator request validation
- OpenAPI documentation
- Seed data matching design references

Suggested backend structure:

```text
apps/api
  src
    auth
    users
    tasks
    goals
    insights
    ai
    notifications
    prisma
```

### Phase 7 - API Integration

Connect mobile to backend through a typed API layer.

Required work:

- React Query hooks
- Request/response types
- Error normalization
- Loading states
- Empty states
- Refresh token handling
- Offline retry behavior where appropriate
- API documentation

### Phase 8 - AI System

Implement AI features behind backend services.

AI capabilities:

- Task Breakdown
- Daily Brief
- Behavior Analysis
- Goal Health
- Weekly Review
- Recommendation Engine

Rules:

- No hardcoded prompts inside UI screens.
- Store prompts separately and version them.
- Log prompt version and output metadata.
- Validate AI output before saving or returning it.
- Provide graceful fallback when AI fails or lacks enough data.

Suggested structure:

```text
apps/api/src/ai
  prompts
  services
  dto
  parsers
  evaluators
```

### Phase 9 - Testing

Create `TESTING_REPORT.md`.

Coverage areas:

- Navigation
- Authentication
- Tasks
- Goals
- AI features
- Edge cases
- Offline/error states
- Dark mode
- Accessibility basics

Recommended test layers:

- Unit tests for reducers, utilities, and data transforms.
- Component tests for reusable UI.
- API integration tests for NestJS modules.
- E2E smoke tests for core app flows.
- Visual screenshot checks for high-value screens.

### Phase 10 - Deployment Preparation

Prepare production configuration.

Deliverables:

- Root `README.md`
- Mobile build instructions
- Backend run/deploy instructions
- Environment variable reference
- Database migration instructions
- Seed instructions
- EAS/build notes if used
- Production checklist

## Dependencies

Required local/runtime dependencies:

- Node.js LTS
- npm, pnpm, or yarn decision
- Expo toolchain
- iOS/Android simulator or physical device
- PostgreSQL
- OpenAI API key
- Apple/Google OAuth app credentials if social auth is implemented
- Email provider for password reset
- Push notification credentials if notifications ship

Core libraries:

- Expo
- React Native
- TypeScript
- NativeWind
- Zustand
- TanStack React Query
- Expo SecureStore
- Expo Notifications
- React Hook Form
- Zod
- NestJS
- Prisma
- PostgreSQL driver
- OpenAI SDK

Design dependencies:

- Exportable logo assets
- App icon source
- Splash icon source
- Local replacements for remote HTML image URLs
- Final decision on icon library

## Complexity Estimate

Relative complexity:

- Architecture: Medium
- Design system: High
- Mobile foundation: Medium
- Auth: Medium
- Today/tasks/focus: High
- AI simplification: High
- Goals/insights: High
- Profile: Medium
- Backend: High
- AI layer: High
- Testing/deployment: High

Primary drivers of complexity:

- AI recommendation quality and validation
- Behavioral analytics model
- Goal forecasting logic
- Timer/focus session lifecycle
- Auth token security
- Dark mode and responsive polish
- Missing/invalid design assets

## Immediate Next Step

Create `ARCHITECTURE.md` for Phase 2 before coding. It should lock the technical structure, route map, data model, API boundaries, auth flow, AI abstraction, and folder conventions.
