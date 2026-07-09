# Traction Project Analysis

Date: 2026-07-02
Phase: 1 - Project Discovery

## Executive Summary

Traction is a mobile-first behavioral execution product. The core promise is to reduce cognitive overhead, identify friction, and help users turn daily intent into consistent progress toward meaningful goals.

The current repository is a design/spec package, not an implementation codebase. It contains:

- A root product/design specification: `DESIGN.md`
- A brand/logo instruction image: `Logo - Instruction.png`
- Static design references under `Designed Pages/`
- No Expo app, React Native source, backend source, package manifests, database schema, or Git metadata

The implementation should therefore start with architecture and design-system foundations before screens are built. The HTML files are useful for copy, spacing, visual hierarchy, and interaction states, but they should not be copied directly into the app.

## Source Inventory

| Source | Status | Notes |
| --- | --- | --- |
| `DESIGN.md` | Reviewed | Defines product philosophy, color tokens, typography, spacing, shapes, elevation, and core components. |
| `Logo - Instruction.png` | Reviewed | Defines logo meaning, constraints, usage examples, color palette, and incorrect usage rules. |
| `Designed Pages/` | Reviewed | 28 folders total. 27 contain `code.html`; 23 contain valid screenshots. |
| `Designed Pages/traction/DESIGN.md` | Duplicate | Exact duplicate of root `DESIGN.md`; not a screen. |

Asset quality summary:

- 27 HTML reference screens
- 23 valid `screen.png` files
- 2 missing screenshots: `goals_trajectory_2`, `splash_screen_2`
- 2 invalid screenshots containing `<FIFE Image failed to fetch>`: `onboarding_welcome`, `task_execution_resistance_flow`
- 2 near-duplicate HTML references: `goals_trajectory_1`/`goals_trajectory_2`, `splash_screen_1`/`splash_screen_2`

## Product Vision

Traction is positioned as a calm execution system for high-performing users who need help choosing, starting, and sustaining important work. It is not a generic to-do list. Its product edge is behavioral awareness plus AI-assisted simplification.

Primary product jobs:

- Identify the user's current friction level.
- Pick the highest-leverage next action.
- Reduce resistance through task breakdown and contextual AI guidance.
- Maintain momentum toward long-term goals.
- Turn behavior data into practical insights.

UX philosophy from the design system:

- Calm Execution: quiet, intentional, low-clutter screens.
- Aggressive Simplification: each screen should have one dominant action.
- iOS-native premium: rounded surfaces, restrained contrast, subtle depth, glass navigation.
- Trustworthy professionalism: data and AI recommendations should feel useful, not gimmicky.

## Brand And Logo Requirements

The logo instruction image defines Traction as a premium mobile app logo built around motion, momentum, and overcoming friction.

The mark must communicate:

- Forward movement
- Momentum
- Direction
- Progress
- Focus
- Confidence
- Intelligence

The mark must not communicate:

- Artificial intelligence cliches
- Robots, brains, or AI symbols
- Checkmarks, targets, or rockets
- Productivity cliches
- Generic startup aesthetics

Visual requirements:

- Minimalist, modern, premium, timeless
- Geometric and clean
- App Store ready and highly scalable
- Works on light, dark, monochrome, and small-size usage
- Must not be rotated, recolored, stretched, or given extra effects

Brand palette from the logo instruction:

| Token | Value | Usage |
| --- | --- | --- |
| Primary | `#0F172A` | Logo dark/navy, premium base |
| Accent | `#3B82F6` | Motion/accent blue |
| Success | `#22C55E` | Positive status |
| Warning | `#F59E0B` | Risk/caution |
| Danger | `#EF4444` | Critical status |
| Background | `#F8FAFC` | Light surface |

Logo implementation risk: only a PNG instruction board is present. Production work needs exportable vector assets for the app icon, splash icon, horizontal logo, monochrome mark, and dark/light variants.

## Design System Findings

The design package is consistent in broad direction but has token inconsistencies that should be normalized before implementation.

Primary visual language:

- Backgrounds: cool off-white, mostly `#F8FAFC` and `#fcf8fa`
- Main text: slate/black range, primarily `#0F172A`, `#1b1b1d`, `#000000`
- Accent: blue `#3B82F6`, used for CTA and AI-active states
- Cards: white or near-white surfaces with 1px soft borders
- Shadows: very soft iOS-style ambient shadows
- Radius: 8px controls, 12-16px cards, 24px sheets/large containers
- Typography: Inter, approximating SF Pro
- Navigation: 4-tab bottom bar: Today, Goals, Insights, Profile
- Icons: Material Symbols in HTML references; React Native should use a production icon library instead of web font icons

Token inconsistency to resolve:

- Root YAML lists `primary: #000000`, while the narrative and logo instruction use `#0F172A` as primary.
- Screens frequently use Material-style semantic tokens plus direct Tailwind colors.
- Some HTML uses `#F8FAFC`; root YAML uses `#fcf8fa` for background/surface.

Recommendation: create a canonical `src/theme` token set with semantic aliases. Keep both values where useful, but assign clear roles:

- `brand.primary`: `#0F172A`
- `brand.accent`: `#3B82F6`
- `surface.app`: `#F8FAFC`
- `surface.soft`: `#fcf8fa`
- `text.primary`: `#0F172A`
- `text.secondary`: `#334155` or normalized slate equivalent

## Screen Inventory

| Folder | Product Area | Asset Status | Purpose | Implementation Notes |
| --- | --- | --- | --- | --- |
| `splash_screen_1` | Launch | Valid screenshot + HTML | Branded splash/loading state. | Use native Expo splash plus matching in-app loading fallback. |
| `splash_screen_2` | Launch | Missing screenshot + HTML | Same text as splash variant. | Treat as duplicate/variant of `splash_screen_1` unless a new screenshot is provided. |
| `welcome_screen` | Acquisition | Valid screenshot + HTML | First public entry screen with Get Started and Sign In. | Routes to onboarding or auth. Includes feature highlights. |
| `onboarding_introduction` | Onboarding | Valid screenshot + HTML | Introduces Traction assistant and product promise. | Step copy says `STEP 1 OF 4`; conflicts with other onboarding step counts. |
| `onboarding_intent` | Onboarding | Valid screenshot + HTML | Captures user's primary intent: productivity, goals, or both. | Copy says `2/6`; step count needs product decision. |
| `onboarding_welcome` | Onboarding | Invalid screenshot + HTML | Multi-step behavior profile: wake time, trigger, work style, profile generation. | HTML is usable for flow/copy, but screenshot must be regenerated. |
| `goal_selection` | Goal Setup | Valid screenshot + HTML | Lets users choose optional goal templates or custom goal. | Should support skipping and adding later. |
| `goal_analysis_feasibility` | Goal Setup | Valid screenshot + HTML | AI forecast for a selected goal, including probability, timeline, readiness visualizer. | Needs backend/AI contract for forecast inputs and outputs. |
| `login_screen` | Auth | Valid screenshot + HTML | Email/password login with Apple/Google options. | Needs secure token storage and validation states. |
| `register_screen` | Auth | Valid screenshot + HTML | Account creation with Apple/Google/email. | Terms/privacy links need targets. |
| `forgot_password` | Auth | Valid screenshot + HTML | Reset request and success state. | Needs API and email delivery integration. |
| `today_focus` | Today | Valid screenshot + HTML | Default Today dashboard with current focus and next tasks. | Likely first main app screen after onboarding/auth. |
| `today_behavioral_brief` | Today | Valid screenshot + HTML | Today dashboard variant with AI Daily Brief and daily conditions. | Could be the same screen with expanded top module. |
| `expanded_daily_brief` | Today | Valid screenshot + HTML | Detailed AI daily brief with cognitive optimization, strategic stack, and weekly trajectory. | Should be separate detail screen or expanded sheet from Today. |
| `task_details` | Task System | Valid screenshot + HTML | Task detail view with metadata, image, focus CTA, edit/schedule/delete. | Needs reusable task metadata and action components. |
| `task_execution` | Focus Session | Valid screenshot + HTML | Timer/focus session with Complete, Snooze, Too Difficult, and success state. | Needs timer lifecycle, app background handling, and haptics. |
| `task_execution_resistance_flow` | Focus Session | Invalid screenshot + HTML | Resistance diagnosis when a task is too difficult or blocked. | Key flow for product differentiation; regenerate screenshot. |
| `ai_simplification` | AI Assistance | Valid screenshot + HTML | AI breaks a difficult task into smaller steps and offers Accept Plan. | Needs prompt abstraction and task rewrite API. |
| `daily_reflection` | Reflection | Valid screenshot + HTML | End-of-day reflection flow: completed tasks, pending tasks, delay reason, rest state. | Could be modal/stack flow triggered after day-end or manual review. |
| `weekly_review_pattern_recognition` | Review | Valid screenshot + HTML | Weekly review with wins, commitments, behavior patterns, and AI synthesis. | Needs aggregate behavior data and calendar/task history. |
| `goals_trajectory_1` | Goals | Valid screenshot + HTML | Goals tab listing goals, progress, AI suggestions, and bottom tab nav. | Best primary reference for Goals home. |
| `goals_trajectory_2` | Goals | Missing screenshot + HTML | Text-equivalent variant of Goals list. | Treat as duplicate unless a distinct screenshot is provided. |
| `goals_behavioral_trajectory` | Goals | Valid screenshot + HTML | Goals list variant with velocity/risk language and New Milestone prompt. | Merge useful behavioral copy into Goals home. |
| `goal_health_future_trajectory` | Goals | Valid screenshot + HTML | Goal detail/projection screen with forecast and alternative scenario. | Requires progress forecast model and chart component. |
| `insights_awareness` | Insights | Valid screenshot + HTML | System insights: working hours, procrastination trigger, future projection. | Needs analytics aggregation and low-data fallback. |
| `insights_behavioral_awareness` | Insights | Valid screenshot + HTML | Pattern recognition and suggested behavior changes. | Could be detail screen from Insights tab. |
| `profile_overview` | Profile | Valid screenshot + HTML | Profile/settings overview: AI personality, preferences, working hours, energy. | Needs editable preference model. |
| `traction` | Design Reference | Duplicate spec only | Contains duplicate `DESIGN.md`. | Exclude from screen implementation count. |

Suggested implementation screen count after collapsing duplicate/non-screen folders:

- 25 unique implementation screens/states
- 23 with valid screenshots
- 2 unique screens requiring regenerated screenshots: `onboarding_welcome`, `task_execution_resistance_flow`

## Missing Screens And States

The design package covers the core pitch and major product surfaces, but production work needs additional screens/states:

- Auth loading, error, validation, email verification, password reset confirmation, social auth failure.
- Terms of Service and Privacy Policy web/link targets.
- Full task list screen beyond Today snippets.
- Task create/edit form, scheduling picker, recurring task settings, and delete confirmation.
- Empty states for Today, Goals, Insights, and Profile sections.
- Loading and error states for every React Query-backed screen.
- Offline state and retry surfaces.
- Notification permission prompt and notification preferences.
- Calendar/deep work scheduling confirmation if AI auto-scheduling is shipped.
- Custom goal creation wizard beyond the template selection card.
- Goal edit, archive/delete, completed goal, and stalled goal recovery screens.
- AI prompt failure, rate limit, and "not enough data" states.
- Profile edit/account security screens.
- Dark-mode references for all primary surfaces.
- Accessibility states: larger text, reduced motion, screen reader labels.

## User Flows

### First-Time User Flow

Proposed flow:

1. Native splash
2. Welcome screen
3. Register/Login
4. Onboarding introduction
5. Intent selection
6. Behavior profile questionnaire
7. Optional goal selection
8. Goal feasibility analysis if a goal is selected
9. Today screen

Open product decision: some designs imply onboarding may happen before account creation. If that is desired, capture onboarding answers locally and submit them after registration.

### Returning User Flow

1. Native splash
2. Refresh token check
3. Today screen if authenticated
4. Login screen if token refresh fails

### Daily Execution Flow

1. Today screen shows friction score, current focus, and next tasks.
2. User starts the current focus or opens task details.
3. Focus session starts with timer and AI assistant note.
4. User completes, snoozes, or marks the task too difficult.
5. Too Difficult routes to resistance diagnosis.
6. Resistance diagnosis routes to AI simplification.
7. Accepted AI plan updates the task into smaller steps.
8. Completed work contributes to daily reflection and weekly review.

### Goal Flow

1. Goals tab lists active goals, progress, risk, and AI suggestions.
2. User adds a goal from templates or a custom path.
3. AI feasibility analysis estimates probability, constraints, and timeline.
4. Accepted plan creates milestones/tasks.
5. Goal health projection shows current trajectory and alternative scenarios.

### Insights Flow

1. Insights tab summarizes behavior patterns.
2. User opens deeper behavioral awareness.
3. AI proposes tactical changes, such as changing work windows or task size.
4. User applies changes to daily capacity, calendar, or goal settings.

### Reflection And Review Flow

1. Daily reflection captures completed tasks, pending tasks, and delay reasons.
2. Weekly review aggregates wins, commitments, missed patterns, and suggested shifts.
3. Applied review changes update scheduling and task prioritization rules.

## Navigation Map

Recommended navigation structure:

```text
Root
  Splash
  AuthStack
    Welcome
    Login
    Register
    ForgotPassword
  OnboardingStack
    OnboardingIntroduction
    OnboardingIntent
    BehaviorProfile
    GoalSelection
    GoalFeasibility
  AppTabs
    TodayStack
      Today
      ExpandedDailyBrief
      TaskDetails
      FocusSession
      ResistanceFlow
      AISimplification
      DailyReflection
    GoalsStack
      GoalsHome
      GoalSelection
      GoalFeasibility
      GoalHealthProjection
    InsightsStack
      InsightsHome
      BehavioralAwareness
      WeeklyReview
    ProfileStack
      ProfileOverview
      ProfileEdit
      Preferences
```

Modal/sheet candidates:

- Task action menu
- Delete confirmation
- Success/completion state
- AI suggestion details
- Notification permission explanation
- Daily reflection quick entry

## Domain Model Discovery

Likely core entities:

- User
- Auth session / refresh token
- User preference profile
- Task
- Task step/subtask
- Goal
- Goal milestone
- Focus session
- Daily brief
- Daily reflection
- Weekly review
- Behavioral metric
- AI recommendation
- AI prompt/template
- Notification

Behavioral signals visible in the designs:

- Friction score
- Energy level
- Focus level/window
- Completion velocity
- Avoidance trigger
- Task complexity
- Goal risk
- Forecast probability
- Work timing patterns

## Technical Risks

| Risk | Severity | Notes |
| --- | --- | --- |
| No implementation code exists | High | Expo and NestJS projects must be initialized from scratch. |
| Missing/invalid screenshots | Medium | `onboarding_welcome` and `task_execution_resistance_flow` are key flows but have invalid image assets. |
| Duplicate/near-duplicate designs | Medium | Goals and splash variants need consolidation before implementation. |
| Token inconsistency | Medium | Root design, logo instruction, and screen HTML use overlapping but not identical colors. |
| HTML is web/Tailwind-specific | Medium | Must translate to React Native/NativeWind patterns, not copy DOM/CSS directly. |
| Material Symbols dependency | Medium | Web font icons do not translate directly to native. |
| Remote image URLs in HTML | Medium | Production app needs local assets, user-uploaded media, or stable CDN assets. |
| Auth/onboarding order ambiguity | Medium | A product decision is required before auth implementation. |
| Broad AI scope | High | AI features need prompt governance, telemetry, error handling, privacy rules, and backend abstractions. |
| Dark mode requirement lacks full screen references | Medium | Token system must define dark mode from principles, then QA visually. |
| Date/mock data is stale | Low | Designs contain 2024 sample dates; app should use dynamic dates and seed fixtures. |

## Recommendations

1. Treat Phase 2 architecture as a required gate before coding.
2. Normalize the design tokens before creating components.
3. Use screenshots and HTML as reference only; rebuild as typed React Native screens.
4. Collapse duplicate references into a canonical screen list.
5. Regenerate or replace the two invalid screenshots before pixel-matching those flows.
6. Build mobile with fixture data first, then connect API contracts once stable.
7. Define AI prompts as versioned backend resources, not inline strings in screens.
8. Use one shared TypeScript contract package or generated OpenAPI types between mobile and backend.
9. Add visual regression screenshots early for the main mobile viewports.
10. Keep `PROGRESS.md` updated after every milestone and every implemented screen.

