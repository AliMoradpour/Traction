# Traction Database Design

## Overview

The Traction database is built with PostgreSQL and managed through Prisma ORM. The schema supports the full behavioral execution system including users, tasks, goals, focus sessions, behavior tracking, and insights.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER MANAGEMENT                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐         ┌──────────────────┐                                 │
│  │     User     │ 1     1 │   UserProfile    │                                 │
│  │──────────────│─────────│──────────────────│                                 │
│  │ id           │         │ userId           │                                 │
│  │ email        │         │ aiPersonality    │                                 │
│  │ password     │         │ deepWorkMode     │                                 │
│  │ firstName    │         │ notificationDensity│                                │
│  │ lastName     │         │ workStartHour    │                                 │
│  │ avatar       │         │ workEndHour      │                                 │
│  │ role         │         │ energyPeakStart  │                                 │
│  └──────────────┘         │ energyPeakEnd    │                                 │
│         │                 └──────────────────┘                                 │
│         │                                                                      │
├─────────┼──────────────────────────────────────────────────────────────────────┤
│         │                     TASK MANAGEMENT                                  │
│         │                                                                      │
│         ▼                                                                      │
│  ┌──────────────┐                                                              │
│  │     Task     │                                                              │
│  │──────────────│                                                              │
│  │ id           │                                                              │
│  │ userId       │                                                              │
│  │ title        │                                                              │
│  │ description  │                                                              │
│  │ category     │                                                              │
│  │ priority     │                                                              │
│  │ duration     │                                                              │
│  │ friction     │                                                              │
│  │ energy       │                                                              │
│  │ scheduledAt  │                                                              │
│  │ dueAt        │                                                              │
│  │ completedAt  │                                                              │
│  │ status       │                                                              │
│  │ goalId       │──────────┐                                                  │
│  └──────────────┘          │                                                  │
│         │                  │                                                  │
│         │                  │                                                  │
├─────────┼──────────────────┼──────────────────────────────────────────────────┤
│         │                  │         GOAL MANAGEMENT                           │
│         │                  │                                                  │
│         │                  ▼                                                  │
│         │         ┌──────────────┐                                            │
│         │         │     Goal     │                                            │
│         │         │──────────────│                                            │
│         │         │ id           │                                            │
│         │         │ userId       │                                            │
│         │         │ title        │                                            │
│         │         │ description  │                                            │
│         │         │ type         │                                            │
│         │         │ category     │                                            │
│         │         │ startDate    │                                            │
│         │         │ targetDate   │                                            │
│         │         │ progress     │                                            │
│         │         │ status       │                                            │
│         │         │ health       │                                            │
│         │         │ velocity     │                                            │
│         │         └──────────────┘                                            │
│         │              │    │    │                                            │
│         │              │    │    │                                            │
│         │              ▼    │    ▼                                            │
│         │    ┌──────────┐  │  ┌──────────┐                                   │
│         │    │Milestone │  │  │GoalPlan  │                                   │
│         │    │──────────│  │  │──────────│                                   │
│         │    │ id       │  │  │ id       │                                   │
│         │    │ goalId   │  │  │ goalId   │                                   │
│         │    │ title    │  │  │ title    │                                   │
│         │    │ targetDate│ │  │ steps    │                                   │
│         │    │ progress │  │  │ status   │                                   │
│         │    └──────────┘  │  └──────────┘                                   │
│         │                  │                                                  │
├─────────┼──────────────────┼──────────────────────────────────────────────────┤
│         │                  │         FOCUS SESSIONS                            │
│         │                  │                                                  │
│         ▼                  │                                                  │
│  ┌──────────────┐          │                                                  │
│  │FocusSession  │          │                                                  │
│  │──────────────│          │                                                  │
│  │ id           │          │                                                  │
│  │ userId       │          │                                                  │
│  │ taskId       │◀─────────┘                                                  │
│  │ startedAt    │                                                             │
│  │ endedAt      │                                                             │
│  │ duration     │                                                             │
│  │ status       │                                                             │
│  │ completed    │                                                             │
│  └──────────────┘                                                             │
│         │                                                                     │
├─────────┼─────────────────────────────────────────────────────────────────────┤
│         │                     INSIGHTS                                         │
│         │                                                                     │
│         ▼                                                                     │
│  ┌──────────────┐                                                             │
│  │   Insight    │                                                             │
│  │──────────────│                                                             │
│  │ id           │                                                             │
│  │ userId       │                                                             │
│  │ goalId       │◀────────────────────────────────────────────────────────────┘
│  │ type         │                                                             │
│  │ title        │                                                             │
│  │ content      │                                                             │
│  │ data         │                                                             │
│  │ generatedBy  │                                                             │
│  │ confidence   │                                                             │
│  │ read         │                                                             │
│  │ dismissed    │                                                             │
│  └──────────────┘                                                             │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                           BEHAVIOR TRACKING                                   │
│                                                                               │
│  ┌──────────────┐                                                             │
│  │BehaviorEvent │                                                             │
│  │──────────────│                                                             │
│  │ id           │                                                             │
│  │ userId       │                                                             │
│  │ taskId       │                                                             │
│  │ goalId       │                                                             │
│  │ focusSessionId│                                                            │
│  │ type         │                                                             │
│  │ metadata     │                                                             │
│  │ value        │                                                             │
│  │ createdAt    │                                                             │
│  └──────────────┘                                                             │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                           NOTIFICATIONS                                       │
│                                                                               │
│  ┌──────────────┐     ┌──────────────────┐                                   │
│  │Notification  │     │  RefreshToken    │                                   │
│  │──────────────│     │──────────────────│                                   │
│  │ id           │     │ id               │                                   │
│  │ userId       │     │ userId           │                                   │
│  │ type         │     │ token            │                                   │
│  │ title        │     │ expiresAt        │                                   │
│  │ body         │     │ revoked          │                                   │
│  │ data         │     └──────────────────┘                                   │
│  │ read         │                                                             │
│  │ sentAt       │                                                             │
│  └──────────────┘                                                             │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Tables

### Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| email | String | UNIQUE, NOT NULL | User email |
| password | String | NOT NULL | Hashed password |
| firstName | String? | | First name |
| lastName | String? | | Last name |
| avatar | String? | | Avatar URL |
| role | Enum | DEFAULT 'USER' | User role |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO | Last update timestamp |

### User Profiles Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| userId | String | UNIQUE, FK | User reference |
| aiPersonality | Enum | DEFAULT 'BALANCED' | AI personality type |
| deepWorkMode | Enum | DEFAULT 'INTENSE' | Deep work intensity |
| notificationDensity | Enum | DEFAULT 'LOW' | Notification frequency |
| aiAutoScheduling | Boolean | DEFAULT true | Auto-scheduling enabled |
| workStartHour | Int | DEFAULT 9 | Work start hour |
| workEndHour | Int | DEFAULT 18 | Work end hour |
| workDays | String | DEFAULT 'mon,tue,wed,thu,fri' | Work days |
| energyPeakStart | Int | DEFAULT 10 | Energy peak start |
| energyPeakEnd | Int | DEFAULT 13 | Energy peak end |
| sleepSync | Boolean | DEFAULT false | Sleep sync enabled |
| focusBreakInterval | Int | DEFAULT 90 | Focus break interval (minutes) |

### Tasks Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| userId | String | FK, NOT NULL | User reference |
| title | String | NOT NULL | Task title |
| description | String? | | Task description |
| category | String? | | Task category |
| priority | Enum | DEFAULT 'MEDIUM' | Task priority |
| duration | Int? | | Duration in minutes |
| friction | Int? | | Friction score 0-100 |
| energy | Enum | DEFAULT 'MEDIUM' | Energy level required |
| scheduledAt | DateTime? | | Scheduled time |
| dueAt | DateTime? | | Due date |
| completedAt | DateTime? | | Completion timestamp |
| status | Enum | DEFAULT 'PENDING' | Task status |
| goalId | String? | FK | Goal reference |

### Focus Sessions Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| userId | String | FK, NOT NULL | User reference |
| taskId | String? | FK | Task reference |
| startedAt | DateTime | DEFAULT now() | Start timestamp |
| endedAt | DateTime? | | End timestamp |
| duration | Int? | | Duration in seconds |
| status | Enum | DEFAULT 'ACTIVE' | Session status |
| completed | Boolean | DEFAULT false | Completion status |

### Goals Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| userId | String | FK, NOT NULL | User reference |
| title | String | NOT NULL | Goal title |
| description | String? | | Goal description |
| type | Enum | NOT NULL | Goal type |
| category | String? | | Goal category |
| startDate | DateTime | DEFAULT now() | Start date |
| targetDate | DateTime? | | Target completion date |
| completedAt | DateTime? | | Completion timestamp |
| progress | Int | DEFAULT 0 | Progress percentage |
| status | Enum | DEFAULT 'ACTIVE' | Goal status |
| health | Enum | DEFAULT 'ON_TRACK' | Goal health status |
| velocity | String? | | Velocity indicator |

### Goal Milestones Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| goalId | String | FK, NOT NULL | Goal reference |
| title | String | NOT NULL | Milestone title |
| description | String? | | Milestone description |
| targetDate | DateTime? | | Target date |
| completedAt | DateTime? | | Completion timestamp |
| progress | Int | DEFAULT 0 | Progress percentage |
| status | Enum | DEFAULT 'PENDING' | Milestone status |

### Goal Plans Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| goalId | String | FK, NOT NULL | Goal reference |
| title | String | NOT NULL | Plan title |
| description | String? | | Plan description |
| steps | String? | | JSON array of steps |
| recommendedAt | DateTime? | | Recommendation timestamp |
| appliedAt | DateTime? | | Application timestamp |
| status | Enum | DEFAULT 'PENDING' | Plan status |

### Insights Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| userId | String | FK, NOT NULL | User reference |
| goalId | String? | FK | Goal reference |
| type | Enum | NOT NULL | Insight type |
| title | String | NOT NULL | Insight title |
| content | String | NOT NULL | Insight content |
| data | String? | | JSON data |
| generatedBy | String? | | Generator identifier |
| confidence | Float? | | AI confidence score |
| read | Boolean | DEFAULT false | Read status |
| dismissed | Boolean | DEFAULT false | Dismissed status |

### Behavior Events Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| userId | String | FK, NOT NULL | User reference |
| taskId | String? | FK | Task reference |
| goalId | String? | FK | Goal reference |
| focusSessionId | String? | FK | Focus session reference |
| type | Enum | NOT NULL | Event type |
| metadata | String? | | JSON metadata |
| value | String? | | Event value |
| createdAt | DateTime | DEFAULT now() | Event timestamp |

### Notifications Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| userId | String | FK, NOT NULL | User reference |
| type | Enum | NOT NULL | Notification type |
| title | String | NOT NULL | Notification title |
| body | String | NOT NULL | Notification body |
| data | String? | | JSON data |
| read | Boolean | DEFAULT false | Read status |
| sentAt | DateTime? | | Send timestamp |

### Refresh Tokens Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| userId | String | FK, NOT NULL | User reference |
| token | String | UNIQUE, NOT NULL | Refresh token |
| expiresAt | DateTime | NOT NULL | Expiration timestamp |
| revoked | Boolean | DEFAULT false | Revocation status |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |

## Indexes Strategy

### Primary Indexes
- All tables have primary key indexes on `id`

### Foreign Key Indexes
- `tasks.userId`
- `tasks.goalId`
- `focus_sessions.userId`
- `focus_sessions.taskId`
- `goals.userId`
- `goal_milestones.goalId`
- `goal_plans.goalId`
- `insights.userId`
- `insights.goalId`
- `behavior_events.userId`
- `behavior_events.taskId`
- `behavior_events.goalId`
- `behavior_events.focusSessionId`
- `notifications.userId`
- `refresh_tokens.userId`

### Composite Indexes
- `tasks [userId, status]` - Filter tasks by user and status
- `tasks [userId, scheduledAt]` - Filter tasks by user and schedule
- `focus_sessions [userId, status]` - Filter sessions by user and status
- `goals [userId, status]` - Filter goals by user and status
- `insights [userId, type]` - Filter insights by user and type
- `insights [userId, read]` - Filter unread insights
- `behavior_events [userId, type]` - Filter events by user and type
- `behavior_events [userId, createdAt]` - Filter events by user and time
- `notifications [userId, read]` - Filter unread notifications

### Unique Indexes
- `users.email` - Unique email constraint
- `refresh_tokens.token` - Unique token constraint

## Relationships

### One-to-One
- User ↔ UserProfile
- User ↔ RefreshToken (multiple, but token is unique)

### One-to-Many
- User → Tasks
- User → FocusSessions
- User → Goals
- User → Insights
- User → BehaviorEvents
- User → Notifications
- Goal → Tasks
- Goal → GoalMilestones
- Goal → GoalPlans
- Goal → Insights
- Task → FocusSessions
- Task → BehaviorEvents
- FocusSession → BehaviorEvents

## Cascade Rules

- **User deletion**: Cascades to all related records
- **Goal deletion**: Sets null on related tasks, cascades to milestones and plans
- **Task deletion**: Sets null on related focus sessions
- **FocusSession deletion**: Cascades to behavior events

## Migration Strategy

### Development
```bash
# Create migration
npx prisma migrate dev --name <migration_name>

# Reset database
npx prisma migrate reset
```

### Production
```bash
# Deploy migrations
npx prisma migrate deploy
```

## Seeding

Development seed data includes:
- Demo user with profile
- Sample goals with milestones
- Sample tasks
- Sample insights

Run with: `npm run prisma:seed`
