# API Gap Analysis

Date: 2026-07-10
Phase: 7 - API Contract Validation

## Frontend Endpoints (apps/mobile/src/api/endpoints.ts)

```typescript
auth: {
  login: '/auth/login'
  register: '/auth/register'
  refresh: '/auth/refresh'
  logout: '/auth/logout'
  forgotPassword: '/auth/password/forgot'
  resetPassword: '/auth/password/reset'
  me: '/auth/me'
}
users: {
  me: '/users/me'
  preferences: '/users/me/preferences'
}
tasks: {
  list: '/tasks'
  detail: (id) => `/tasks/${id}`
  steps: (id) => `/tasks/${id}/steps`
  focusSessions: (id) => `/tasks/${id}/focus-sessions`
  simplify: (id) => `/tasks/${id}/simplify`
}
goals: {
  list: '/goals'
  detail: (id) => `/goals/${id}`
  feasibility: (id) => `/goals/${id}/feasibility`
  projection: (id) => `/goals/${id}/projection`
}
insights: {
  dailyBrief: '/insights/daily-brief'
  behavioralAwareness: '/insights/behavioral-awareness'
  weeklyReview: '/insights/weekly-review'
}
ai: {
  recommendations: '/ai/recommendations'
}
notifications: {
  preferences: '/notifications/preferences'
}
```

## Backend Endpoints (apps/api/src)

```typescript
auth: {
  POST /auth/register
  POST /auth/login
  POST /auth/logout
  POST /auth/refresh
  POST /auth/forgot-password
  POST /auth/reset-password
}
users: {
  GET /users/me
  PATCH /users/me
  GET /users/me/preferences
  PATCH /users/me/preferences
}
tasks: {
  POST /tasks
  GET /tasks
  GET /tasks/:id
  PATCH /tasks/:id
  DELETE /tasks/:id
  POST /tasks/:id/complete
  GET /tasks/date/:date
}
focus: {
  POST /focus/start
  POST /focus/:id/pause
  POST /focus/:id/resume
  POST /focus/:id/complete
  POST /focus/:id/cancel
  GET /focus/active
  GET /focus
  GET /focus/:id
}
goals: {
  POST /goals
  GET /goals
  GET /goals/:id
  PATCH /goals/:id
  DELETE /goals/:id
  PATCH /goals/:id/archive
  POST /goals/:id/milestones
  GET /goals/:id/milestones
  PATCH /goals/:id/milestones/:milestoneId
  DELETE /goals/:id/milestones/:milestoneId
  POST /goals/:id/plans
  GET /goals/:id/plans
  PATCH /goals/:id/plans/:planId
  DELETE /goals/:id/plans/:planId
}
goal-health: {
  GET /goal-health/:goalId
  POST /goal-health/:goalId/recalculate
}
insights: {
  GET /insights
  GET /insights/:id
  PATCH /insights/:id/read
  PATCH /insights/:id/dismiss
  PATCH /insights/read-all
  DELETE /insights/:id
}
notifications: {
  GET /notifications
  GET /notifications/unread-count
  GET /notifications/:id
  PATCH /notifications/:id/read
  PATCH /notifications/read-all
  DELETE /notifications/:id
}
behavior: {
  POST /behavior
  GET /behavior
  GET /behavior/stats
  GET /behavior/:id
  DELETE /behavior/:id
}
```

## Gap Analysis

### Auth Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| POST /auth/login | POST /auth/login | ✅ Match | |
| POST /auth/register | POST /auth/register | ✅ Match | |
| POST /auth/refresh | POST /auth/refresh | ✅ Match | |
| POST /auth/logout | POST /auth/logout | ✅ Match | |
| POST /auth/password/forgot | POST /auth/forgot-password | ⚠️ Path mismatch | Frontend: /password/forgot, Backend: /forgot-password |
| POST /auth/password/reset | POST /auth/reset-password | ⚠️ Path mismatch | Frontend: /password/reset, Backend: /reset-password |
| GET /auth/me | GET /auth/me | ✅ Match | |

### User Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| GET /users/me | GET /users/me | ✅ Match | |
| PATCH /users/me | PATCH /users/me | ✅ Match | |
| GET /users/me/preferences | GET /users/me/preferences | ✅ Match | |
| PATCH /users/me/preferences | PATCH /users/me/preferences | ✅ Match | |

### Task Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| GET /tasks | GET /tasks | ✅ Match | |
| GET /tasks/:id | GET /tasks/:id | ✅ Match | |
| POST /tasks | POST /tasks | ✅ Match | |
| PATCH /tasks/:id | PATCH /tasks/:id | ✅ Match | |
| DELETE /tasks/:id | DELETE /tasks/:id | ✅ Match | |
| POST /tasks/:id/complete | POST /tasks/:id/complete | ✅ Match | |
| GET /tasks/date/:date | GET /tasks/date/:date | ✅ Match | |
| GET /tasks/:id/steps | ❌ Missing | Backend needs implementation |
| POST /tasks/:id/simplify | ❌ Missing | Backend needs implementation |
| GET /tasks/:id/focus-sessions | ❌ Missing | Backend needs implementation |

### Focus Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| POST /focus/start | POST /focus/start | ✅ Match | |
| POST /focus/:id/pause | POST /focus/:id/pause | ✅ Match | |
| POST /focus/:id/resume | POST /focus/:id/resume | ✅ Match | |
| POST /focus/:id/complete | POST /focus/:id/complete | ✅ Match | |
| POST /focus/:id/cancel | POST /focus/:id/cancel | ✅ Match | |
| GET /focus/active | GET /focus/active | ✅ Match | |
| GET /focus | GET /focus | ✅ Match | |
| GET /focus/:id | GET /focus/:id | ✅ Match | |

### Goal Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| GET /goals | GET /goals | ✅ Match | |
| GET /goals/:id | GET /goals/:id | ✅ Match | |
| POST /goals | POST /goals | ✅ Match | |
| PATCH /goals/:id | PATCH /goals/:id | ✅ Match | |
| DELETE /goals/:id | DELETE /goals/:id | ✅ Match | |
| PATCH /goals/:id/archive | PATCH /goals/:id/archive | ✅ Match | |
| GET /goals/:id/milestones | GET /goals/:id/milestones | ✅ Match | |
| POST /goals/:id/milestones | POST /goals/:id/milestones | ✅ Match | |
| PATCH /goals/:id/milestones/:milestoneId | PATCH /goals/:id/milestones/:milestoneId | ✅ Match | |
| DELETE /goals/:id/milestones/:milestoneId | DELETE /goals/:id/milestones/:milestoneId | ✅ Match | |
| GET /goals/:id/plans | GET /goals/:id/plans | ✅ Match | |
| POST /goals/:id/plans | POST /goals/:id/plans | ✅ Match | |
| PATCH /goals/:id/plans/:planId | PATCH /goals/:id/plans/:planId | ✅ Match | |
| DELETE /goals/:id/plans/:planId | DELETE /goals/:id/plans/:planId | ✅ Match | |
| GET /goals/:id/feasibility | ❌ Missing | Frontend expects, backend missing |
| GET /goals/:id/projection | ❌ Missing | Frontend expects, backend missing |

### Goal Health Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| GET /goal-health/:goalId | GET /goal-health/:goalId | ✅ Match | |
| POST /goal-health/:goalId/recalculate | POST /goal-health/:goalId/recalculate | ✅ Match | |

### Insight Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| GET /insights | GET /insights | ✅ Match | |
| GET /insights/:id | GET /insights/:id | ✅ Match | |
| PATCH /insights/:id/read | PATCH /insights/:id/read | ✅ Match | |
| PATCH /insights/:id/dismiss | PATCH /insights/:id/dismiss | ✅ Match | |
| PATCH /insights/read-all | PATCH /insights/read-all | ✅ Match | |
| DELETE /insights/:id | DELETE /insights/:id | ✅ Match | |
| GET /insights/daily-brief | ❌ Missing | Frontend expects, backend missing |
| GET /insights/behavioral-awareness | ❌ Missing | Frontend expects, backend missing |
| GET /insights/weekly-review | ❌ Missing | Frontend expects, backend missing |

### Notification Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| GET /notifications | GET /notifications | ✅ Match | |
| GET /notifications/unread-count | GET /notifications/unread-count | ✅ Match | |
| GET /notifications/:id | GET /notifications/:id | ✅ Match | |
| PATCH /notifications/:id/read | PATCH /notifications/:id/read | ✅ Match | |
| PATCH /notifications/read-all | PATCH /notifications/read-all | ✅ Match | |
| DELETE /notifications/:id | DELETE /notifications/:id | ✅ Match | |
| GET /notifications/preferences | ❌ Missing | Frontend expects, backend missing |

### Behavior Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| POST /behavior | POST /behavior | ✅ Match | |
| GET /behavior | GET /behavior | ✅ Match | |
| GET /behavior/stats | GET /behavior/stats | ✅ Match | |
| GET /behavior/:id | GET /behavior/:id | ✅ Match | |
| DELETE /behavior/:id | DELETE /behavior/:id | ✅ Match | |

### AI Endpoints

| Frontend | Backend | Status | Notes |
|----------|---------|--------|-------|
| GET /ai/recommendations | ❌ Missing | Frontend expects, backend missing |

## Summary

| Category | Matched | Gaps | Notes |
|----------|---------|------|-------|
| Auth | 5/7 | 2 | Path mismatches need fixing |
| Users | 4/4 | 0 | |
| Tasks | 7/10 | 3 | Steps, simplify, focus-sessions missing |
| Focus | 8/8 | 0 | |
| Goals | 14/16 | 2 | feasibility, projection missing |
| Goal Health | 2/2 | 0 | |
| Insights | 6/9 | 3 | daily-brief, behavioral-awareness, weekly-review missing |
| Notifications | 6/7 | 1 | preferences missing |
| Behavior | 5/5 | 0 | |
| AI | 0/1 | 1 | recommendations missing |
| **Total** | **57/69** | **12** | |

## Required Backend Changes

### Path Fixes
1. `/auth/forgot-password` → `/auth/password/forgot`
2. `/auth/reset-password` → `/auth/password/reset`

### Missing Endpoints to Implement
1. `GET /tasks/:id/steps` - Get task steps
2. `POST /tasks/:id/simplify` - AI task simplification
3. `GET /tasks/:id/focus-sessions` - Get task focus sessions
4. `GET /goals/:id/feasibility` - Goal feasibility analysis
5. `GET /goals/:id/projection` - Goal health projection
6. `GET /insights/daily-brief` - Daily brief generation
7. `GET /insights/behavioral-awareness` - Behavioral awareness
8. `GET /insights/weekly-review` - Weekly review
9. `GET /notifications/preferences` - Notification preferences
10. `GET /ai/recommendations` - AI recommendations
