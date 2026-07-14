# Traction Backend Architecture

## Overview

The Traction backend is built with NestJS, a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

## Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Authentication**: JWT (Access + Refresh Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator + class-transformer
- **Password Hashing**: bcryptjs

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── modules/
│   │   ├── prisma/                # Database service
│   │   ├── auth/                  # Authentication
│   │   ├── users/                 # User management
│   │   ├── tasks/                 # Task CRUD
│   │   ├── focus/                 # Focus sessions
│   │   ├── goals/                 # Goal management
│   │   ├── goal-health/           # Goal health calculations
│   │   ├── insights/              # Insights generation
│   │   ├── behavior/              # Behavior tracking
│   │   └── notifications/         # Notifications
│   ├── common/
│   │   ├── guards/                # Auth guards
│   │   ├── decorators/            # Custom decorators
│   │   ├── pipes/                 # Validation pipes
│   │   └── interceptors/          # Response interceptors
│   └── config/                    # Configuration
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed data
├── test/                          # Tests
└── docker-compose.yml             # Docker setup
```

## Modules

### 1. Auth Module
- **Purpose**: Handle authentication and authorization
- **Endpoints**:
  - `POST /auth/register` - Register new user
  - `POST /auth/login` - Login
  - `POST /auth/logout` - Logout
  - `POST /auth/refresh` - Refresh access token
  - `POST /auth/forgot-password` - Request password reset
  - `POST /auth/reset-password` - Reset password

### 2. Users Module
- **Purpose**: User profile and preferences management
- **Endpoints**:
  - `GET /users/me` - Get current user profile
  - `PATCH /users/me` - Update profile
  - `GET /users/me/preferences` - Get preferences
  - `PATCH /users/me/preferences` - Update preferences

### 3. Tasks Module
- **Purpose**: Task CRUD operations
- **Endpoints**:
  - `POST /tasks` - Create task
  - `GET /tasks` - List tasks
  - `GET /tasks/:id` - Get task
  - `PATCH /tasks/:id` - Update task
  - `DELETE /tasks/:id` - Delete task
  - `POST /tasks/:id/complete` - Complete task

### 4. Focus Module
- **Purpose**: Focus session management
- **Endpoints**:
  - `POST /focus/start` - Start focus session
  - `POST /focus/:id/pause` - Pause session
  - `POST /focus/:id/resume` - Resume session
  - `POST /focus/:id/complete` - Complete session
  - `POST /focus/:id/cancel` - Cancel session

### 5. Goals Module
- **Purpose**: Goal management
- **Endpoints**:
  - `POST /goals` - Create goal
  - `GET /goals` - List goals
  - `GET /goals/:id` - Get goal
  - `PATCH /goals/:id` - Update goal
  - `DELETE /goals/:id` - Archive goal
  - `GET /goals/:id/milestones` - Get milestones
  - `POST /goals/:id/milestones` - Add milestone

### 6. Goal Health Module
- **Purpose**: Calculate goal health scores
- **Endpoints**:
  - `GET /goal-health/:goalId` - Get goal health
  - `POST /goal-health/:goalId/recalculate` - Recalculate health

### 7. Insights Module
- **Purpose**: Generate and manage insights
- **Endpoints**:
  - `GET /insights` - List insights
  - `GET /insights/:id` - Get insight
  - `PATCH /insights/:id/read` - Mark as read
  - `PATCH /insights/:id/dismiss` - Dismiss insight

### 8. Behavior Module
- **Purpose**: Track user behavior
- **Endpoints**:
  - `POST /behavior` - Track event
  - `GET /behavior` - Get behavior history

### 9. Notifications Module
- **Purpose**: Manage notifications
- **Endpoints**:
  - `GET /notifications` - List notifications
  - `PATCH /notifications/:id/read` - Mark as read
  - `POST /notifications/read-all` - Mark all as read

## Database Design

### Entity Relationship

```
User (1) ──> (1) UserProfile
User (1) ──> (N) Task
User (1) ──> (N) FocusSession
User (1) ──> (N) Goal
User (1) ──> (N) Insight
User (1) ──> (N) BehaviorEvent
User (1) ──> (N) Notification
User (1) ──> (N) RefreshToken

Goal (1) ──> (N) Task
Goal (1) ──> (N) GoalMilestone
Goal (1) ──> (N) GoalPlan
Goal (1) ──> (N) Insight

Task (1) ──> (N) FocusSession
Task (1) ──> (N) BehaviorEvent

FocusSession (1) ──> (N) BehaviorEvent
```

### Indexes

- Users: `email` (unique)
- Tasks: `[userId, status]`, `[userId, scheduledAt]`, `goalId`
- Focus Sessions: `[userId, status]`, `taskId`
- Goals: `[userId, status]`
- Goal Milestones: `goalId`
- Insights: `[userId, type]`, `[userId, read]`
- Behavior Events: `[userId, type]`, `[userId, createdAt]`
- Notifications: `[userId, read]`
- Refresh Tokens: `userId`, `token` (unique)

## Security

### Authentication
- JWT Access Tokens (15 minutes)
- Refresh Token Rotation (7 days)
- Password hashing with bcrypt (12 rounds)

### Authorization
- JWT Guard for protected routes
- User-scoped data access
- Role-based access control (USER, ADMIN)

### Data Protection
- Input validation with class-validator
- SQL injection prevention via Prisma
- CORS configuration
- Environment variable management

## Error Handling

- Global exception filter
- Consistent error response format
- Validation error formatting
- Prisma error handling

## API Documentation

Swagger documentation available at `/api/docs`

## Development

### Commands
```bash
# Install dependencies
npm install

# Run development server
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Database migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

### Environment Variables
See `.env.example` for required configuration.

## Production Considerations

- Rate limiting
- Request logging
- Health checks
- Graceful shutdown
- Database connection pooling
- Caching strategy (Redis)
- Message queue for async tasks
