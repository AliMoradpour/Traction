# Traction Mobile - Project Structure

## Overview

Production-grade React Native architecture using Expo, TypeScript, Expo Router, NativeWind, Zustand, TanStack Query, React Hook Form, Zod, and Axios.

## Folder Structure

```
apps/mobile/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout (providers + splash)
│   ├── index.tsx                 # Entry redirect logic
│   ├── (auth)/                   # Auth flow screens
│   │   ├── _layout.tsx           # Stack navigator for auth
│   │   ├── welcome.tsx           # Welcome/landing screen
│   │   ├── login.tsx             # Login form
│   │   ├── register.tsx          # Registration form
│   │   └── forgot-password.tsx   # Password reset
│   ├── (app)/                    # Main app tabs
│   │   ├── _layout.tsx           # Tab navigator (4 tabs)
│   │   ├── today/                # Today tab
│   │   │   ├── _layout.tsx       # Stack for today flow
│   │   │   ├── index.tsx         # Today dashboard
│   │   │   ├── daily-brief.tsx   # Expanded daily brief
│   │   │   └── reflection.tsx    # Daily reflection
│   │   ├── goals/                # Goals tab
│   │   │   ├── _layout.tsx       # Stack for goals flow
│   │   │   ├── index.tsx         # Goals list
│   │   │   ├── select.tsx        # Goal selection
│   │   │   ├── [goalId].tsx      # Goal detail
│   │   │   └── [goalId]/
│   │   │       └── projection.tsx
│   │   ├── insights/             # Insights tab
│   │   │   ├── _layout.tsx       # Stack for insights flow
│   │   │   ├── index.tsx         # Insights home
│   │   │   ├── behavioral-awareness.tsx
│   │   │   └── weekly-review.tsx
│   │   └── profile/              # Profile tab
│   │       ├── _layout.tsx       # Stack for profile flow
│   │       └── index.tsx         # Profile overview
│   ├── (modals)/                 # Modal screens
│   │   ├── _layout.tsx           # Modal presentation style
│   │   └── task/[taskId].tsx     # Task detail modal
│   ├── tasks/                    # Task screens (push)
│   │   └── [taskId].tsx
│   └── focus/                    # Focus session screens
│       ├── [taskId].tsx
│       └── [taskId]/
│           ├── resistance.tsx
│           └── simplify.tsx
├── src/
│   ├── api/                      # API layer
│   │   ├── client.ts             # Axios instance
│   │   ├── interceptors.ts       # Auth/token interceptors
│   │   ├── endpoints.ts          # API endpoint constants
│   │   └── index.ts
│   ├── assets/                   # Static assets
│   │   ├── images/
│   │   ├── logos/
│   │   └── fonts/
│   ├── components/               # Reusable components
│   │   ├── ui/                   # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── MetricPill.tsx
│   │   │   └── FrictionBadge.tsx
│   │   ├── cards/                # Card components
│   │   │   ├── TaskCard.tsx
│   │   │   ├── GoalCard.tsx
│   │   │   └── InsightCard.tsx
│   │   ├── layout/               # Layout components
│   │   │   ├── Screen.tsx
│   │   │   ├── Header.tsx
│   │   │   └── BottomTabBar.tsx
│   │   ├── forms/                # Form components
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   └── FormTimePicker.tsx
│   │   ├── feedback/             # Feedback components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Toast.tsx
│   │   ├── common/               # Shared utilities
│   │   └── icons.tsx             # Tab bar icons
│   ├── features/                 # Feature modules
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── tasks/
│   │   ├── focus/
│   │   ├── goals/
│   │   ├── insights/
│   │   ├── profile/
│   │   └── ai/
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities and configuration
│   │   ├── config.ts             # Environment configuration
│   │   ├── queryClient.ts        # React Query client
│   │   └── validations.ts        # Zod validation schemas
│   ├── providers/                # Context providers
│   │   ├── ThemeProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── services/                 # API services
│   │   ├── auth.service.ts
│   │   ├── task.service.ts
│   │   ├── goal.service.ts
│   │   ├── insight.service.ts
│   │   └── ai.service.ts
│   ├── store/                    # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── tasks.store.ts
│   │   ├── goals.store.ts
│   │   ├── ui.store.ts
│   │   └── index.ts
│   ├── theme/                    # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radius.ts
│   │   ├── shadows.ts
│   │   ├── theme.ts
│   │   ├── nativewind.ts
│   │   └── index.ts
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utility functions
│   └── constants/                # App constants
├── app.json                      # Expo configuration
├── app.config.ts                 # Dynamic Expo config
├── babel.config.js               # Babel with NativeWind
├── metro.config.js               # Metro bundler config
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # NativeWind config
├── nativewind-env.d.ts           # NativeWind types
├── global.css                    # Tailwind imports
├── .env.example                  # Environment template
├── .eslintrc.json                # ESLint config
├── .prettierrc                   # Prettier config
├── package.json                  # Dependencies
└── PROJECT_STRUCTURE.md          # This file
```

## Routing Architecture

### Route Groups

- **(auth)**: Authentication flow screens (welcome, login, register, forgot-password)
- **(app)**: Main application tabs (today, goals, insights, profile)
- **(modals)**: Modal presentation screens (task detail)

### Navigation Hierarchy

```
Root Stack
├── (auth) - Stack Navigator
│   ├── welcome
│   ├── login
│   ├── register
│   └── forgot-password
├── (app) - Tab Navigator
│   ├── today - Stack Navigator
│   ├── goals - Stack Navigator
│   ├── insights - Stack Navigator
│   └── profile - Stack Navigator
├── (modals) - Modal Presentation
│   └── task/[taskId]
├── tasks - Stack Navigator
└── focus - Stack Navigator
```

### Route Guards

- **Unauthenticated**: Redirect to `(auth)/welcome`
- **Authenticated but not onboarded**: Redirect to onboarding flow
- **Authenticated and onboarded**: Redirect to `(app)/today`

## State Management Architecture

### Zustand (Local State)

- `auth.store.ts`: Authentication state, user data, tokens
- `tasks.store.ts`: Selected task, focus session state
- `goals.store.ts`: Selected goal
- `ui.store.ts`: Color scheme, onboarding status

### React Query (Server State)

- Tasks, goals, insights, and user data
- Automatic caching, refetching, and mutation handling
- Error and loading state management

### Rules

- Server state goes in React Query
- UI/local state goes in Zustand
- Never duplicate server collections in Zustand

## Theme Architecture

### Token Categories

- **Colors**: Light/dark mode semantic tokens
- **Typography**: Inter font family with size/weight tokens
- **Spacing**: 4px rhythm scale
- **Radius**: Border radius tokens
- **Shadows**: Shadow and glass tokens

### Dark Mode

- System preference detection
- Manual toggle via `ui.store`
- Semantic color aliases for automatic theming

### NativeWind Integration

- Tailwind config extends theme tokens
- Classes use semantic color names
- Responsive and accessible by default

## API Architecture

### Request Flow

```
Screen → Feature Hook → Service → API Client → Backend
```

### Components

- **API Client**: Axios instance with base config
- **Interceptors**: Auth token attachment, error handling
- **Endpoints**: Centralized API path constants
- **Services**: Domain-specific API functions
- **React Query Hooks**: Cache and state management

### Error Handling

- Normalized `ApiError` type
- Automatic token refresh on 401
- Network error detection and retry

## Development

### Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run typecheck

# Formatting
npm run format
```

### Environment Variables

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_ENV=development
```

## Conventions

### File Naming

- **Components**: PascalCase (`Button.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Services**: camelCase with `.service.ts` suffix
- **Stores**: camelCase with `.store.ts` suffix
- **Types**: PascalCase (`User.ts`)
- **Constants**: SCREAMING_SNAKE_CASE

### Import Order

1. External packages
2. Internal aliases (`@/`)
3. Relative imports

### Component Structure

```typescript
// 1. Imports
// 2. Types/interfaces
// 3. Component function
// 4. Styles
// 5. Export
```
