# Phase 2: Feature Audit

## Authentication

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Register | ✅ POST `/api/auth/register` | ⚠️ UI only, mock auth | PARTIAL |
| Login | ✅ POST `/api/auth/login` | ⚠️ UI only, mock auth | PARTIAL |
| Logout | ✅ POST `/api/auth/logout` | ⚠️ Button exists, no API call | PARTIAL |
| Refresh Token | ✅ POST `/api/auth/refresh` | ⚠️ Interceptor exists, untested | PARTIAL |
| Forgot Password | ⚠️ Stub (no email sent) | ✅ UI implemented | PARTIAL |
| Reset Password | 🔴 Broken (accepts any token) | ✅ UI implemented | BROKEN |
| Auth Guard | ✅ JWT + Passport | 🔴 No route protection | BROKEN |

## Tasks

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Create | ✅ POST `/api/tasks` | ⚠️ UI exists, no API call | PARTIAL |
| Update | ✅ PATCH `/api/tasks/:id` | ⚠️ UI exists, no API call | PARTIAL |
| Delete | ✅ DELETE `/api/tasks/:id` | ❌ No UI | PARTIAL |
| Complete | ✅ POST `/api/tasks/:id/complete` | ⚠️ Button exists, no API call | PARTIAL |
| Priorities | ✅ Enum (LOW/MEDIUM/HIGH/URGENT) | ✅ Chips in UI | IMPLEMENTED |
| Scheduling | ✅ scheduledAt field | ⚠️ Date picker exists, no API | PARTIAL |
| Task List | ✅ GET `/api/tasks` | ⚠️ Hardcoded mock data | PARTIAL |
| Task Details | ✅ GET `/api/tasks/:id` | ✅ Screen exists | PARTIAL |
| Route Bug | 🔴 `/tasks/date/:date` unreachable | — | BROKEN |

## Goals

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Create Goal | ✅ POST `/api/goals` | ⚠️ UI exists, no API call | PARTIAL |
| Goal List | ✅ GET `/api/goals` | ⚠️ Mock data | PARTIAL |
| Goal Progress | ✅ progress field (0-100) | ⚠️ ProgressBar component exists | PARTIAL |
| Goal Milestones | ✅ Full CRUD | 🔴 Screen placeholder | PARTIAL |
| Goal Analytics | ✅ feasibility, projection endpoints | ⚠️ feasibility UI exists, mock | PARTIAL |
| Goal Detail | ✅ GET `/api/goals/:id` | 🔴 Placeholder "Coming soon" | MISSING |
| Goal Projection | ✅ GET `/api/goals/:id/projection` | 🔴 Placeholder | MISSING |
| Goal Archive | ✅ PATCH `/api/goals/:id/archive` | ❌ No UI | PARTIAL |
| Goal Plans | ✅ Full CRUD | ❌ No UI | PARTIAL |

## Focus Sessions

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Start | ✅ POST `/api/focus/start` | ⚠️ Button exists, no API call | PARTIAL |
| Pause | ✅ POST `/api/focus/:id/pause` | ✅ UI implemented | PARTIAL |
| Resume | ✅ POST `/api/focus/:id/resume` | ✅ UI implemented | PARTIAL |
| Complete | ✅ POST `/api/focus/:id/complete` | ✅ UI implemented | PARTIAL |
| Cancel | ✅ POST `/api/focus/:id/cancel` | ❌ No UI | PARTIAL |
| Active Session | ✅ GET `/api/focus/active` | 🔴 Route unreachable (bug) | BROKEN |
| Timer | — | ✅ Countdown with pulse animation | IMPLEMENTED |

## Behavior Tracking

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Track Events | ✅ POST `/api/behavior` | ⚠️ Service exists, no UI trigger | PARTIAL |
| Behavior Stats | ✅ GET `/api/behavior/stats` | 🔴 Route unreachable (bug) | BROKEN |
| Behavior Engine | ✅ 7-profile algorithm | — | IMPLEMENTED |
| Friction Engine | ✅ 0-100 scoring | ⚠️ Score shown in UI, mock data | PARTIAL |

## AI Features

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Daily Brief | ✅ OpenRouter + cache + fallback | ⚠️ UI exists, mock data | PARTIAL |
| Weekly Review | ✅ OpenRouter + cache + fallback | ⚠️ UI exists, mock data | PARTIAL |
| Task Breakdown | ✅ OpenRouter + fallback | ⚠️ UI exists, mock data | PARTIAL |
| Goal Recovery | ✅ OpenRouter + fallback | 🔴 No UI | PARTIAL |
| Stuck Analysis | ✅ 5 feeling types + fallback | ✅ Resistance flow UI | PARTIAL |
| Recommendations | ✅ CRUD + accept/dismiss | ⚠️ Card exists, mock data | PARTIAL |
| Rate Limiting | ⚠️ Service exists, NOT enforced | — | PARTIAL |
| Observability | ⚠️ In-memory only, not persisted | — | PARTIAL |

## Notifications

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| CRUD | ✅ 7 endpoints | 🔴 No notification UI | PARTIAL |
| Push Notifications | ❌ No push setup | ❌ No expo-notifications | MISSING |
| Reminder System | ❌ Not implemented | ❌ Not implemented | MISSING |

## Settings

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| User Profile | ✅ GET/PATCH `/api/users/me` | ✅ Profile screen | PARTIAL |
| Preferences | ✅ GET/PATCH `/api/users/me/preferences` | ✅ UI with selectors | PARTIAL |
| Theme | — | ✅ Light/dark mode | IMPLEMENTED |
| Account Management | ❌ No delete account | ❌ No UI | MISSING |

## Summary

| Status | Count |
|--------|-------|
| ✅ Implemented | 14 |
| ⚠️ Partial | 31 |
| 🔴 Broken | 5 |
| ❌ Missing | 5 |
