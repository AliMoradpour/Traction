# Traction Design System

Date: 2026-07-02
Phase: 3 - Design System

## Source Inputs

Design-system extraction used:

- `DESIGN.md`
- `Logo - Instruction.png`
- `Designed Pages/*/screen.png`
- `Designed Pages/*/code.html`
- Figma file: `Traction`

Figma inspection results:

- 1 page: `Page 1`
- 25 top-level mobile frames
- 0 local variables
- 0 local text styles
- 0 local paint styles
- 0 local effect styles
- 0 reusable Figma components/component sets

Conclusion: the code design system is the source of truth for implementation. Figma is a high-fidelity visual reference, but it does not currently expose reusable variables, styles, or components.

## Token Decisions

The design references use overlapping Material-style semantic tokens and direct colors. The code system normalizes them into semantic roles.

### Brand

| Token | Value | Usage |
| --- | --- | --- |
| `brand.primary` | `#0F172A` | Premium dark brand base, splash, high-emphasis text |
| `brand.ink` | `#000000` | Highest contrast text/icons where designs use pure black |
| `brand.accent` | `#3B82F6` | CTA, progress, AI-active states |

### Core Surfaces

| Token | Value | Usage |
| --- | --- | --- |
| `surface.app` | `#F8FAFC` | App canvas |
| `surface.soft` | `#FCF8FA` | Warm off-white design surface |
| `surface.card` | `#FFFFFF` | Cards, modals, inputs |
| `surface.muted` | `#F0EDEF` | Subtle grouped surfaces |
| `border.subtle` | `#E2E8F0` | Default 1px card/input border |
| `border.design` | `#C6C6CD` | Figma-heavy outline token |

### Status

| Token | Value | Usage |
| --- | --- | --- |
| `success` | `#22C55E` | On-track state, low friction, completed work |
| `warning` | `#F59E0B` | Medium risk, caution, delayed state |
| `danger` | `#EF4444` | High risk, destructive actions |
| `error` | `#BA1A1A` | Form validation and backend errors |

## Typography

Font family: `Inter`

The Figma frames use Inter across the product. The code token names match the original design spec, with one implementation normalization: letter spacing is set to `0` to keep native text predictable and avoid cramped rendering across devices.

| Token | Size | Line Height | Weight | Usage |
| --- | ---: | ---: | --- | --- |
| `displayLg` | 34 | 41 | 700 | Large branded moments |
| `displayLgMobile` | 28 | 34 | 700 | Mobile page titles |
| `headlineMd` | 22 | 28 | 600 | Section and screen headings |
| `titleMd` | 18 | 24 | 600 | Card titles |
| `bodyLg` | 17 | 24 | 400 | Primary body copy |
| `bodyMd` | 15 | 20 | 400 | Default app copy |
| `bodySm` | 14 | 20 | 400 | Compact descriptions |
| `labelSm` | 13 | 18 | 500 | Controls and metadata |
| `labelXs` | 11 | 13 | 600 | Uppercase captions |
| `timer` | 64 | 64 | 700 | Focus timer |

## Spacing

The system uses a 4px rhythm.

| Token | Value |
| --- | ---: |
| `xxs` | 2 |
| `xs` | 4 |
| `sm` | 8 |
| `md` | 16 |
| `gutter` | 16 |
| `marginMobile` | 20 |
| `lg` | 24 |
| `xl` | 32 |
| `xxl` | 48 |
| `xxxl` | 64 |

## Radius

| Token | Value | Usage |
| --- | ---: | --- |
| `sm` | 4 | Tiny indicators |
| `md` | 8 | Buttons, inputs |
| `lg` | 12 | Compact cards |
| `xl` | 16 | Task, goal, insight cards |
| `xxl` | 24 | Sheets and grouped containers |
| `sheet` | 32 | Large bottom sheets |
| `full` | 9999 | Pills, avatars, dots |

## Shadows And Glass

Figma extraction found these repeated effects:

- Card: `0 4 12 rgba(15, 23, 42, 0.03)`
- Hairline: `0 1 2 rgba(0, 0, 0, 0.05)`
- Raised: larger iOS-style drop shadows
- Background blur: 20-24px for bottom nav/header glass

React Native tokens approximate those through `shadow*` and `elevation` values. Actual blur should be implemented with Expo BlurView during Phase 4 foundation.

## Components Created

Theme:

- `apps/mobile/src/theme/colors.ts`
- `apps/mobile/src/theme/spacing.ts`
- `apps/mobile/src/theme/radius.ts`
- `apps/mobile/src/theme/typography.ts`
- `apps/mobile/src/theme/shadows.ts`
- `apps/mobile/src/theme/theme.ts`
- `apps/mobile/src/theme/nativewind.ts`

UI primitives:

- `Button`
- `Input`
- `ProgressBar`
- `MetricPill`
- `FrictionBadge`
- `EmptyState`
- `Modal`

Cards:

- `TaskCard`
- `GoalCard`
- `InsightCard`

Layout:

- `Screen`
- `Header`
- `BottomTabBar`

## Component Rules

- Feature screens should compose these components before introducing new screen-local UI.
- Server-backed data should be passed through typed props, not read directly inside components.
- Components use semantic theme tokens, not raw colors.
- Dark mode is token-driven through `useTractionTheme`.
- Icons are injected as React nodes or render props so Phase 4 can choose the final icon package cleanly.
- `Button` supports `primary`, `secondary`, `ghost`, and `danger`.
- `TaskCard` supports `pending`, `inProgress`, `completed`, and `delayed`.
- `GoalCard` supports `low`, `medium`, and `high` risk meters.
- `InsightCard` supports neutral and semantic tones.

## NativeWind Integration

`apps/mobile/src/theme/nativewind.ts` exports a NativeWind-compatible token object. In Phase 4, when the Expo app is initialized, wire this into `tailwind.config` rather than duplicating values.

Expected Phase 4 step:

```text
tailwind.config -> import or mirror nativeWindTheme -> content globs -> NativeWind babel setup
```

## Dependencies Required In Phase 4

The current component code assumes these runtime packages will be installed when the Expo app is initialized:

- `react`
- `react-native`
- `react-native-safe-area-context`
- `nativewind`
- `lucide-react-native` or another final icon package

Optional but expected:

- `expo-blur` for true glass navigation/header effects
- `expo-font` for Inter loading

## Remaining Design-System Work

- Install Expo/React Native dependencies in Phase 4.
- Add `tailwind.config` and NativeWind Babel integration.
- Add Expo font loading for Inter.
- Replace fallback icon slots with final Lucide icon mappings.
- Add Storybook or a component gallery once the app shell exists.
- Validate components on iOS and Android after app initialization.
- Revisit Figma if the design file gains reusable variables/components.

