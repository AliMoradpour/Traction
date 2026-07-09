---
name: Traction
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 13px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

The design system is anchored in the philosophy of **Calm Execution**. It targets high-performers seeking to reduce cognitive overhead through AI-assisted prioritization. The emotional response is one of clarity, reliability, and quiet confidence.

The aesthetic follows an **iOS-Native Premium** style. It leverages high-quality typography, intentional negative space, and subtle depth to create a sense of focus. Drawing inspiration from Apple's Human Interface Guidelines and the precision of tools like Linear and Things 3, the interface avoids decorative clutter in favor of functional elegance. 

Key attributes include:
- **Aggressive Simplification:** Every screen prioritizes a single primary action to prevent choice paralysis.
- **Precision:** Fine lines, systematic spacing, and subtle micro-interactions that feel "mechanical" yet fluid.
- **Trustworthy Professionalism:** A balance of a neutral foundational palette with high-contrast accents to guide the eye toward progress.

## Colors

The color strategy is designed for long-term focus and high legibility. The background utilizes a cool-toned off-white to reduce eye strain compared to pure white.

- **Primary (#0F172A):** Reserved for high-level headlines, brand-critical elements, and primary icons to establish a strong hierarchy.
- **Secondary (#334155):** Used for supporting text, descriptions, and secondary UI components like borders or inactive icons.
- **Accent (#3B82F6):** Applied sparingly for Call-to-Action (CTA) buttons, progress bars, and "AI-active" states.
- **Semantic Palette:** Success, Warning, and Danger colors are used strictly for status indicators on Goal and Task cards to signal behavioral risks immediately.

## Typography

The typography uses **Inter** (as a web-accessible proxy for SF Pro) to maintain a systematic, neutral, and highly legible tone. 

- **Hierarchy:** Large titles utilize tight letter spacing and heavy weights to create a "locked-in" feel.
- **Readability:** Body text is optimized for iOS standards, using 17px for primary information to ensure ease of reading during active tasks.
- **Functional Labels:** Captions and labels use slightly increased letter spacing and uppercase styling to differentiate metadata from actionable content.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. On mobile, content is contained within a 20px margin, while on desktop, a max-width container of 1200px is centered with fluid margins.

- **The 4px Rhythm:** All spacing is derived from a 4px baseline grid. 
- **White Space as a Tool:** This design system uses "aggressive" white space (32px+) between distinct functional groups (e.g., separating Today's Task from the Goal progress overview) to lower visual noise.
- **Safe Areas:** Ensure all critical actions are within the thumb-zone for mobile, especially the floating "Quick Add" button if applicable.

## Elevation & Depth

Elevation is communicated through **Tonal Layers** and **Soft Ambient Shadows**. The design system avoids heavy drop shadows, opting for subtle depth that mimics the physical layering of paper.

- **Level 0 (Background):** #F8FAFC. The base canvas.
- **Level 1 (Cards):** Pure white (#FFFFFF) with a 1px border (#E2E8F0) and a very soft, high-diffusion shadow (0px 4px 12px rgba(15, 23, 42, 0.03)).
- **Level 2 (Modals/Popovers):** Pure white with a more pronounced shadow (0px 12px 24px rgba(15, 23, 42, 0.08)) to indicate temporary focus.
- **Glassmorphism:** Used exclusively for the Bottom Navigation bar and Top Header to maintain context of the content scrolling beneath them (Backdrop blur: 20px, 80% opacity background).

## Shapes

The shape language is **Rounded**, following the Apple squircloid aesthetic. 

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px) radius.
- **Large Elements (Task/Goal Cards):** 1rem (16px) radius to feel approachable and "hand-held."
- **Outer Containers:** 1.5rem (24px) for parent containers or modal sheets.
- **Indicators:** Status pips and progress bar caps are fully rounded (Pill-shaped) to represent movement and fluidity.

## Components

### Buttons & Controls
- **Primary Button:** Solid Accent (#3B82F6) with white text. High-radius (8px). 
- **Secondary Button:** Light Slate background (#F1F5F9) with Primary (#0F172A) text.
- **Checkboxes:** Circular (pill-style) rather than square. When checked, they fill with the Accent color and trigger a subtle haptic-style animation.

### Task Cards
- **States:** 
  - *Pending:* Neutral border, clear typography.
  - *In Progress:* Subtle Accent-colored left border (2px).
  - *Completed:* 50% opacity for text, strikethrough optional, Success-colored check icon.
  - *Delayed:* Soft Warning background tint with a small clock icon.

### Goal Cards
- **Risk Indicators:** A small "Risk Meter" (3-segment bar) in the top right corner using Success, Warning, or Danger colors based on AI assessment.
- **Progress:** A thin 4px linear progress bar at the bottom of the card.

### Insight Cards
- Use a very light Primary tint (#F8FAFC) to differentiate from active Tasks. Focus on typography and "AI-generated" iconography (e.g., a sparkle glyph).

### Navigation
- **Bottom Bar:** 4 tabs (Today, Goals, Insights, Profile). Icons use 24px line-art. Active state uses the Accent color; inactive uses Secondary. The background is a frosted glass (Glassmorphism) effect.