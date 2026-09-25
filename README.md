# 🎯 Traction

A calm-focused task and goal management app, positioned against habit trackers and hustle-culture productivity tools. Traction pairs an Expo/React Native mobile client with a NestJS API and AI-assisted coaching features (task breakdown, daily briefs, stuck analysis, weekly reviews, and goal recovery).

Built as a monorepo with a strict boundary between the mobile experience, backend domain logic, and AI orchestration — business logic and prompts live on the server, never in UI components.

---

## ✨ Features

- 🔐 JWT Authentication — register, login, refresh tokens, password reset
- 🎯 Goals & Milestones — create goals, track feasibility, projections, milestones, and plans
- ✅ Task Management — daily tasks, step breakdown, AI-assisted simplification
- ⏱️ Focus Sessions — start, pause, resume, complete, and cancel focused work sessions
- 🧠 AI Coaching — daily briefs, stuck-task analysis, weekly reviews, goal recovery, and personalized recommendations via OpenRouter
- 📊 Behavior & Execution Insights — burnout, procrastination, momentum, resistance, and readiness metrics
- 🔔 Notifications — read/unread state, preferences, bulk read
- 🧾 Invites — invite codes with validation and acceptance
- 🛠️ Admin Dashboard — user management, role updates, system health, analytics
- 🎨 Design System — NativeWind-based theme with light/dark mode support
- 📄 OpenAPI Docs — Swagger-generated API documentation

---

## 🛠️ Tech Stack

| Layer            | Technology                                  |
| ----------------- | -------------------------------------------- |
| Mobile Framework  | Expo + React Native                          |
| Mobile Language   | TypeScript                                   |
| Mobile Navigation | Expo Router                                  |
| Mobile Styling    | NativeWind (Tailwind for React Native)       |
| Mobile State      | Zustand + React Query                        |
| Backend Framework | NestJS                                       |
| Backend Language  | TypeScript                                   |
| Database          | PostgreSQL                                   |
| ORM               | Prisma                                       |
| Authentication    | JWT + Passport                               |
| AI Provider       | OpenRouter (Claude models)                   |
| Validation        | Zod (mobile), class-validator (backend)      |
| API Docs          | Swagger / OpenAPI                            |
| Testing           | Jest                                         |
| Code Quality      | ESLint + Prettier                            |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL 14+
- npm ≥ 10

### Installation

```
git clone https://github.com/AliMoradpour/Traction.git
cd Traction

# Backend
cd backend
npm install

# Mobile
cd ../apps/mobile
npm install
```

### Database Setup

```
# make sure PostgreSQL is running
pg_isready
psql -U postgres -c "CREATE DATABASE traction;"

cd backend
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed   # optional
```

### Environment Variables

Backend — `backend/.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/traction?schema=public"
JWT_SECRET=
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3001"
OPENROUTER_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

Mobile — `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_ENV=development
```

### Development

Start the backend:

```
cd backend
npm run start:dev
```

Runs at:

```
http://localhost:3000
```

Start the mobile app (web is fastest to preview):

```
cd apps/mobile
npx expo start --web
```

Or target a simulator/device:

```
npx expo start --ios
npx expo start --android
```

### Production

Backend:

```
npm run build
npm run start:prod
```

### Testing

Backend unit tests:

```
npm run test
```

Backend E2E tests:

```
npm run test:e2e
```

Backend test coverage:

```
npm run test:cov
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint                | Description                     |
| ------ | ------------------------ | -------------------------------- |
| `POST` | `/auth/register`        | Register a new user              |
| `POST` | `/auth/login`           | Login and receive JWT tokens     |
| `POST` | `/auth/logout`          | Log out the current session      |
| `POST` | `/auth/refresh`         | Refresh an access token          |
| `POST` | `/auth/forgot-password` | Request a password reset         |
| `POST` | `/auth/reset-password`  | Reset password with a token      |
| `GET`  | `/auth/me`              | Get the authenticated user       |

### Users

| Method  | Endpoint              | Description                  |
| ------- | ---------------------- | ------------------------------ |
| `GET`   | `/users/me`            | Get current user profile      |
| `PATCH` | `/users/me`            | Update current user profile   |
| `GET`   | `/users/me/preferences`| Get user preferences          |
| `PATCH` | `/users/me/preferences`| Update user preferences       |
| `GET`   | `/users/me/stats`      | Get user stats                |

### Goals

| Method   | Endpoint                              | Description                  |
| -------- | -------------------------------------- | ------------------------------ |
| `POST`   | `/goals`                              | Create a goal                 |
| `GET`    | `/goals`                              | List goals                    |
| `GET`    | `/goals/:id`                          | Get a goal by ID              |
| `PATCH`  | `/goals/:id`                          | Update a goal                 |
| `DELETE` | `/goals/:id`                          | Delete a goal                 |
| `PATCH`  | `/goals/:id/archive`                  | Archive a goal                |
| `GET`    | `/goals/:id/feasibility`              | Get feasibility analysis      |
| `GET`    | `/goals/:id/projection`               | Get goal projection           |
| `POST`   | `/goals/:id/milestones`               | Add a milestone               |
| `GET`    | `/goals/:id/milestones`               | List milestones               |
| `PATCH`  | `/goals/:id/milestones/:milestoneId`  | Update a milestone            |
| `DELETE` | `/goals/:id/milestones/:milestoneId`  | Delete a milestone            |
| `POST`   | `/goals/:id/plans`                    | Add a plan                    |
| `GET`    | `/goals/:id/plans`                    | List plans                    |
| `PATCH`  | `/goals/:id/plans/:planId`            | Update a plan                 |
| `DELETE` | `/goals/:id/plans/:planId`            | Delete a plan                 |

### Tasks

| Method   | Endpoint                    | Description                    |
| -------- | ----------------------------- | --------------------------------- |
| `POST`   | `/tasks`                     | Create a task                   |
| `GET`    | `/tasks`                     | List tasks                      |
| `GET`    | `/tasks/date/:date`          | List tasks for a date           |
| `GET`    | `/tasks/:id`                 | Get a task by ID                |
| `PATCH`  | `/tasks/:id`                 | Update a task                    |
| `POST`   | `/tasks/:id/complete`        | Mark a task complete             |
| `DELETE` | `/tasks/:id`                 | Delete a task                    |
| `GET`    | `/tasks/:id/steps`           | Get task steps                   |
| `POST`   | `/tasks/:id/simplify`        | AI-simplify a task               |
| `GET`    | `/tasks/:id/focus-sessions`  | List focus sessions for a task  |

### Focus Sessions

| Method | Endpoint              | Description                |
| ------ | ---------------------- | ----------------------------- |
| `POST` | `/focus/start`         | Start a focus session        |
| `GET`  | `/focus/active`        | Get the active session       |
| `GET`  | `/focus`               | List focus sessions           |
| `GET`  | `/focus/:id`           | Get a focus session by ID    |
| `POST` | `/focus/:id/pause`     | Pause a session               |
| `POST` | `/focus/:id/resume`    | Resume a session              |
| `POST` | `/focus/:id/complete`  | Complete a session            |
| `POST` | `/focus/:id/cancel`    | Cancel a session              |

### AI Coaching

| Method | Endpoint                             | Description                    |
| ------ | -------------------------------------- | --------------------------------- |
| `GET`  | `/ai/recommendations`                 | Get recommendations              |
| `POST` | `/ai/recommendations/generate`        | Generate new recommendations     |
| `POST` | `/ai/recommendations/:id/accept`      | Accept a recommendation          |
| `POST` | `/ai/recommendations/:id/dismiss`     | Dismiss a recommendation         |
| `GET`  | `/ai/daily-brief`                     | Get the daily brief              |
| `POST` | `/ai/breakdown-task/:taskId`          | Break a task into steps          |
| `POST` | `/ai/stuck-analysis`                  | Analyze a stuck task/goal        |
| `GET`  | `/ai/weekly-review`                   | Get the weekly review            |
| `POST` | `/ai/goal-recovery/:goalId`           | Get a goal recovery plan         |
| `GET`  | `/ai/usage`, `/usage/summary`, `/usage/by-feature`, `/usage/by-day` | AI usage metrics |
| `GET`  | `/ai/metrics`, `/ai/status`           | AI provider metrics and status   |

### Behavior & Execution

| Method | Endpoint                          | Description                   |
| ------ | ------------------------------------ | -------------------------------- |
| `POST` | `/behavior`                         | Log a behavior entry             |
| `GET`  | `/behavior`, `/behavior/:id`        | List / get behavior entries      |
| `GET`  | `/behavior/stats`                   | Behavior stats                   |
| `GET`  | `/behavior/metrics/daily`           | Daily metrics                    |
| `GET`  | `/behavior/metrics/weekly`          | Weekly metrics                   |
| `GET`  | `/behavior/metrics/indicators`      | Behavior indicators              |
| `GET`  | `/behavior/metrics/burnout`         | Burnout metric                   |
| `GET`  | `/behavior/metrics/procrastination` | Procrastination metric           |
| `DELETE` | `/behavior/:id`                   | Delete a behavior entry          |
| `GET`  | `/execution/readiness`              | Readiness score                  |
| `GET`  | `/execution/resistance`             | Resistance score                 |
| `GET`  | `/execution/momentum`               | Momentum score                   |
| `GET`  | `/execution/stats`                  | Execution stats                  |

### Insights & Notifications

| Method  | Endpoint                             | Description                 |
| ------- | --------------------------------------- | ------------------------------ |
| `GET`   | `/insights`                            | List insights                 |
| `GET`   | `/insights/daily-brief`                | Daily-brief insight            |
| `GET`   | `/insights/behavioral-awareness`       | Behavioral-awareness insight   |
| `GET`   | `/insights/weekly-review`              | Weekly-review insight          |
| `GET`   | `/insights/:id`                        | Get an insight                 |
| `PATCH` | `/insights/read-all`, `/insights/:id/read`, `/insights/:id/dismiss` | Mark read / dismiss |
| `DELETE`| `/insights/:id`                        | Delete an insight              |
| `GET`   | `/notifications`, `/notifications/:id` | List / get notifications       |
| `GET`   | `/notifications/unread-count`          | Unread count                   |
| `GET`   | `/notifications/preferences`           | Notification preferences       |
| `PATCH` | `/notifications/read-all`, `/notifications/:id/read` | Mark read      |
| `DELETE`| `/notifications/:id`                   | Delete a notification          |

### Invites & Admin

| Method | Endpoint                     | Description                  |
| ------ | ------------------------------- | -------------------------------- |
| `POST` | `/invites`                     | Create an invite                 |
| `GET`  | `/invites`, `/invites/stats`    | List invites / invite stats      |
| `GET`  | `/invites/validate/:code`      | Validate an invite code          |
| `POST` | `/invites/:code/accept`        | Accept an invite                 |
| `GET`  | `/admin/dashboard`             | Admin dashboard data              |
| `GET`  | `/admin/users`                 | List users                        |
| `PATCH`| `/admin/users/:id/role`        | Update a user's role               |
| `GET`  | `/admin/health`                | System health                      |
| `GET`  | `/admin/analytics`             | Admin analytics                    |

---

## 📁 Project Structure

```
Traction/
├── apps/
│   └── mobile/
│       ├── app/                  # Expo Router routes
│       │   ├── (auth)/
│       │   ├── (app)/
│       │   ├── (admin)/
│       │   ├── (onboarding)/
│       │   ├── (modals)/
│       │   ├── focus/
│       │   └── tasks/
│       └── src/
│           ├── api/
│           ├── components/
│           ├── hooks/
│           ├── providers/
│           ├── services/
│           ├── state/ (store)
│           ├── theme/
│           └── types/
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── goals/
│   │   │   ├── tasks/
│   │   │   ├── focus/
│   │   │   ├── ai/
│   │   │   ├── behavior/
│   │   │   ├── execution/
│   │   │   ├── insights/
│   │   │   ├── goal-health/
│   │   │   ├── notifications/
│   │   │   ├── invites/
│   │   │   ├── admin/
│   │   │   └── prisma/
│   │   ├── providers/
│   │   │   └── ai/            # OpenRouter provider
│   │   ├── common/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── prompts/               # AI prompt templates
│
└── docs/
```

---

## 🏗️ Architecture

Traction is built as a monorepo with a clean boundary between three layers:

- **Mobile (Expo + React Native)** — the app experience, using Expo Router for navigation, NativeWind for styling, Zustand for local state, and React Query for server state
- **Backend (NestJS + Prisma)** — all business logic and AI orchestration, exposed as a versioned JSON API with Swagger docs, backed by PostgreSQL
- **AI Layer** — prompt templates live under `backend/prompts/` and are never hardcoded inside services; an `AIProvider` interface abstracts the underlying model provider (OpenRouter)

The mobile app never talks to the AI provider or database directly — every request goes through the NestJS API.

---

## 🔐 Authentication Flow

1. Registration/login through `/auth/register` and `/auth/login`
2. Passwords hashed with bcrypt
3. Short-lived JWT access tokens plus longer-lived refresh tokens
4. `/auth/refresh` rotates the access token
5. Password reset via `/auth/forgot-password` and `/auth/reset-password`

Required environment variables:

```
JWT_SECRET=
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
```

---

## 🗄️ Database

The backend uses PostgreSQL through Prisma.

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/traction?schema=public"
```

Run `npx prisma migrate deploy` to apply migrations and `npm run prisma:seed` to load sample data.

---

## 🧠 AI Integration

AI-assisted features (task breakdown, daily briefs, stuck-task analysis, weekly reviews, goal recovery, and recommendations) are powered through OpenRouter. Prompt templates are stored as versioned Markdown files under `backend/prompts/` rather than inline strings, and usage/cost metrics are exposed under `/ai/usage`.

```
OPENROUTER_API_KEY=
AI_MODEL_PRIMARY="anthropic/claude-3-haiku"
AI_MODEL_FALLBACK="anthropic/claude-3-haiku"
```

---

## 👨‍💻 Author

Ali Moradpour — [GitHub](https://github.com/AliMoradpour) · [Portfolio](https://alimoradpour.ir)

---

## 📄 License

MIT
