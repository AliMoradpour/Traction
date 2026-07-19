# Phase 5: Mobile App Audit

## SDK Versions

| Package | Version |
|---------|---------|
| expo | 57.0.4 |
| react-native | 0.86.0 |
| react | 19.2.3 |
| typescript | 6.0.3 |
| expo-router | 57.0.4 |
| zustand | 5.0.2 |
| @tanstack/react-query | 5.62.16 |
| nativewind | 4.1.23 |

## Screen Inventory (29 screens, 8 layouts)

### Auth Screens (5)
| Screen | Status | Notes |
|--------|--------|-------|
| welcome.tsx | Implemented | Landing page with CTA |
| login.tsx | Implemented | Mock auth, no API call |
| register.tsx | Implemented | Mock auth, no API call |
| forgot-password.tsx | Implemented | Mock flow |
| reset-password.tsx | Implemented | Mock flow |

### App Screens (15)
| Screen | Status | Notes |
|--------|--------|-------|
| today/index.tsx | Implemented | Mock data, hardcoded tasks |
| today/daily-brief.tsx | Implemented | Mock data |
| today/add-task.tsx | Implemented | Local state only |
| today/task-details.tsx | Implemented | Local state only |
| today/reflection.tsx | Implemented | Local state wizard |
| goals/index.tsx | Implemented | Mock data |
| goals/select.tsx | Implemented | Mock submit |
| goals/feasibility.tsx | Implemented | Mock analysis |
| goals/[goalId]/index.tsx | **PLACEHOLDER** | "Coming soon in Phase 5" |
| goals/[goalId]/projection.tsx | **PLACEHOLDER** | "Coming soon" |
| insights/index.tsx | Implemented | Mock data |
| insights/weekly-review.tsx | Implemented | Mock data |
| insights/behavioral-awareness.tsx | **PLACEHOLDER** | "Coming soon" |
| profile/index.tsx | Implemented | Local state |

### Focus Screens (3)
| Screen | Status | Notes |
|--------|--------|-------|
| focus/[taskId].tsx | Implemented | Timer + resistance modal |
| focus/[taskId]/simplify.tsx | Implemented | Mock AI breakdown |
| focus/[taskId]/resistance.tsx | Implemented | Mock AI recommendations |

### Onboarding Screens (5)
| Screen | Status | Notes |
|--------|--------|-------|
| introduction.tsx | Implemented | Step 1/4 |
| intent.tsx | Implemented | Step 2/6 |
| behavior-profile.tsx | Implemented | Step 3/6 |
| goal-selection.tsx | Implemented | Step 4/6 |
| goal-feasibility.tsx | Implemented | Step 5/6 |

### Placeholder Screens (3)
| Screen | Status |
|--------|--------|
| (modals)/task/[taskId].tsx | PLACEHOLDER |
| tasks/[taskId].tsx | PLACEHOLDER |

## Critical Findings

### 1. Zero API Integration
The API client defines 83 endpoints. **None are called by any screen.** Every screen uses hardcoded mock data.

### 2. No Auth Guard
`AuthProvider` loads tokens from SecureStore but no `Redirect` or `useProtectedRoute` exists. Users can access all `(app)` routes without logging in.

### 3. NativeWind Installed but Unused
NativeWind is configured (babel, metro, global.css) but **zero screens use `className`**. All styling is `StyleSheet.create`.

### 4. Unused Component Library
`TaskCard`, `GoalCard`, `InsightCard`, `Screen`, `Header`, `BottomTabBar`, `ErrorBoundary`, `Skeleton`, `Toast` all exist but screens use inline styles.

### 5. Mock Auth
Login/register use `setTimeout` to simulate API calls. No real auth integration.

### 6. Onboarding Step Mismatch
Introduction shows `TOTAL_STEPS = 4`, intent shows `TOTAL_STEPS = 6`. Progress bars inconsistent.

### 7. Hardcoded Colors
Despite full theme system, screens hardcode colors like `#FFFFFF`, `#0F172A`.

## Zustand Stores

| Store | Purpose | Server Data? |
|-------|---------|-------------|
| auth.store | Auth state + token persistence | Partial (tokens only) |
| tasks.store | Selected task UI state | No |
| goals.store | Selected goal UI state | No |
| onboarding.store | Wizard progress | No |
| ui.store | Color scheme, onboarding flag | No |

## State Management Assessment
- Zustand is used for thin UI state wrappers only
- React Query is configured but **never used** (no `useQuery`/`useMutation` calls in any screen)
- No server state caching
