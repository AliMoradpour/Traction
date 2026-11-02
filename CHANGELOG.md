# Changelog

All notable changes to Traction will be documented in this file.

## [Unreleased]

### Added
- Password reset with emailed, single-use, expiring tokens; resetting signs out other sessions. Uses SMTP when configured, otherwise logs the link in development.
- Onboarding answers and profile preferences are saved on the server.
- Goal feasibility and projection computed from progress pace and the deadline (on-time chance, required pace, projected finish).
- Focus sessions and task details link to the AI task breakdown and the "I'm stuck" plan.
- GitHub Actions CI for backend (migrations on Postgres, typecheck, lint, test, build) and mobile (typecheck, lint, test).

### Fixed
- Tasks, goals, milestones and plans could be created or renamed with an empty title.
- The app read API responses from a nonexistent `data` envelope, and requests missed the backend's `/api` prefix.
- New users were sent past onboarding.
- Pausing or resuming a focus session older than five minutes jumped to the recovery screen.
- After an app restart the user profile wasn't loaded (no name, no admin entry).
- Admin analytics ignored the app theme.
- Token refresh deadlock; refresh tokens could be used as access tokens; rate limiting is now enforced.
- Admin analytics reports real focus minutes, activity-based active users and true retention.

## [1.0.0-beta.1] - 2026-07-30

### Added
- Complete task management system (CRUD, scheduling, completion)
- Goal system with milestones and progress tracking
- Focus mode with timer and distraction tracking
- Behavioral metrics engine (energy, focus, stress, motivation, mood)
- AI-powered features (daily brief, goal recovery, friction analysis, task breakdown, weekly review)
- User authentication with JWT and refresh tokens
- Profile management and preferences
- Notification system
- Insights dashboard with real-time metrics
- Execution engine with readiness scoring and momentum tracking
- Role-Based Access Control (RBAC) with 5 roles
- Admin dashboard with user management and analytics
- Beta invite system with code validation
- In-app feedback widget
- Onboarding flow for new users
- Welcome carousel introducing features
- Developer settings (hidden panel)
- Structured logging with 7 categories
- Issue reporter for bug reports
- Offline detection and banner
- Performance measurement utilities
- Error boundary for crash handling

### Security
- Helmet security headers
- CORS configuration
- Rate limiting (100 req/min)
- JWT token refresh mechanism
- Secure token storage (Expo SecureStore)

### Performance
- FlatList for large lists
- React.memo for expensive components
- N+1 query optimization (744→2 queries)
- API response caching with TTL
- AI response caching
