# Traction — Run the Project

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥ 20 | `node -v` |
| PostgreSQL | 14+ | `psql --version` |
| npm | ≥ 10 | `npm -v` |

---

## 1. Clone & Install

```bash
git clone <repo-url> && cd Traction

# Backend
cd backend
npm install

# Frontend
cd ../apps/mobile
npm install
```

---

## 2. Database Setup

```bash
# Make sure PostgreSQL is running
pg_isready

# Create the database (skip if it already exists)
psql -U postgres -c "CREATE DATABASE traction;"

# Set up Prisma
cd backend
npx prisma generate
npx prisma migrate deploy

# (Optional) Seed the database
npm run prisma:seed
```

### Troubleshooting DB

If `P1000: Authentication failed`:
```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'your_password';
\q
```
Then update `backend/.env` with the correct `DATABASE_URL`.

---

## 3. Environment Variables

### Backend — `backend/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/traction?schema=public"
JWT_SECRET="any-random-string-here"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3001"
OPENROUTER_API_KEY="sk-or-v1-..."
AI_MODEL_PRIMARY="anthropic/claude-3-haiku"
AI_MODEL_FALLBACK="anthropic/claude-3-haiku"
```

### Frontend — `apps/mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_ENV=development
```

---

## 4. Start the Backend

```bash
cd backend
npm run start:dev
```

Runs at `http://localhost:3000` (hot-reloads on save).

**Verify it's up:**
```bash
curl http://localhost:3000/health
```

---

## 5. Start the Frontend

### Option A — Web (fastest)

```bash
cd apps/mobile
npx expo start --web
```

Opens at `http://localhost:8081`.

### Option B — iOS Simulator (Mac only)

```bash
cd apps/mobile
npx expo start --ios
```

### Option C — Physical iPhone via EAS Dev Build

```bash
cd apps/mobile

# 1. Login to Expo
npx eas login

# 2. Build dev client (one-time, ~10-15 min)
npx eas build --profile development --platform ios

# 3. Install the .ipa on your iPhone from the Expo dashboard

# 4. Update .env with your machine's IP (not localhost)
#    EXPO_PUBLIC_API_URL=http://192.168.x.x:3000

# 5. Start dev server
npx expo start --dev-client
```

### Option D — Android Device / Emulator

```bash
cd apps/mobile
npx expo start --android
```

Or via EAS:
```bash
npx eas build --profile development --platform android
```

---

## 6. Full Dev Flow (Both Together)

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run start:dev

# Terminal 2 — Frontend
cd apps/mobile
npx expo start --web
```

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `npm run start:dev` | Start backend with hot-reload |
| `npm run build` | Build backend for production |
| `npx prisma migrate dev` | Create a new migration |
| `npx prisma studio` | Open Prisma DB browser |
| `npx expo start` | Start Expo dev server |
| `npx expo start --web` | Start in browser |
| `npx expo start --clear` | Clear cache and restart |
| `npx tsc --noEmit` | Check TypeScript in frontend |
| `npx eas build` | Build native app |

---

## Project Structure

```
Traction/
├── backend/                # NestJS API
│   ├── prisma/             # Schema & migrations
│   ├── prisma.config.ts    # Prisma 7 config
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, goals, tasks, ai, etc.)
│   │   ├── common/         # Guards, strategies, decorators
│   │   └── main.ts
│   ├── .env
│   └── package.json
│
├── apps/mobile/            # Expo SDK 57 React Native app
│   ├── app/                # File-based routing (expo-router)
│   │   ├── (auth)/         # Login, register, forgot-password
│   │   ├── (app)/          # Main app screens (today, goals, insights)
│   │   ├── (onboarding)/   # Onboarding flow
│   │   └── focus/          # Focus mode screens
│   ├── src/
│   │   ├── api/            # API client (axios)
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── providers/      # Auth, Query, Theme providers
│   │   ├── store/          # Zustand stores
│   │   ├── theme/          # Colors, typography
│   │   └── types/          # TypeScript types
│   ├── .env
│   ├── app.config.ts       # Expo config (single source of truth)
│   ├── eas.json            # EAS build profiles
│   └── package.json
│
└── docs/                   # Documentation
    ├── audits/             # Security, performance, accessibility
    ├── features/           # Design system, logging, crash recovery
    ├── implementation/     # Plans, DB performance
    ├── migration/          # SDK migration docs
    └── phases/             # Phase reports
```
