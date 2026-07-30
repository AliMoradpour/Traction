# Changelog

All notable changes to Traction will be documented in this file.

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
