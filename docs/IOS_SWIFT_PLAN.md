# Traction for iPhone — Swift rewrite plan

Goal: a native iPhone app written in Swift/SwiftUI, good enough to publish for everyone on the App Store, plus a website for the product.

Written 2026-11-11. Tick the boxes as we go: this file is the map.

---

## The big picture

| Part | What it is | What happens to it |
|---|---|---|
| `backend/` | NestJS API + Postgres (Render + Neon) | **Kept.** The Swift app talks to the same API. A few additions for public release (Phase 11). |
| `apps/mobile/` | Expo / React Native app | **Kept** for Android and as the web app. Not deleted. |
| `apps/ios/` | **New.** Native Swift app, built with [xtool](https://github.com/xtool-org/xtool) | Built phase by phase below. |
| Website | **New.** Landing page, privacy policy, support page | Phase 12. App Store review requires the privacy and support pages. |

### How the tools fit together

- **xtool** lets us build and install the iPhone app from **Windows (through WSL)** without a Mac. It is used for everyday development on your own iPhone over USB.
- **xtool cannot upload to the App Store.** It has no "archive / upload" command (checked against its README, 2026-11-11). For the public release we build on a **Mac in the cloud** (GitHub Actions macOS runner) from the same Swift code. That is Phase 13. No Mac purchase is needed.
- **No iPhone simulator on Windows.** You will check each screen on your real iPhone. To keep that safe, all logic that isn't UI goes in a separate part (`TractionCore`) that I can test automatically in WSL (`swift test`).

### The two Apple accounts

| | Free Apple ID | Paid Apple Developer Program ($99 / year) |
|---|---|---|
| Install on **your** iPhone with xtool | ✅ (re-install every 7 days) | ✅ (lasts a year) |
| TestFlight beta / App Store for everyone | ❌ | ✅ |
| Push notifications from the server | ❌ | ✅ |

**Phases 0–10 need only a free Apple ID.** The paid account is needed from Phase 13 on.

> ⚠️ **Check this early.** Apple requires a payment card and address in a country where it sells the Developer Program. If that's a problem for you, we need to know before Phase 13 (options: an organization/partner who enrolls and publishes for you, or staying on the web app for iPhone users).

---

## Project layout (what Phase 1 creates)

```
apps/ios/
  Package.swift          # SwiftPM package, iOS 17+
  xtool.yml              # bundle ID, Info.plist path
  Support/Info.plist     # extra Info.plist keys (app name, notifications text, …)
  Sources/
    TractionCore/        # no UI: API client, models, auth + token refresh, dates. Tested in WSL.
    Traction/            # SwiftUI screens, design kit, app entry point
  Tests/
    TractionCoreTests/
```

- **Minimum iOS version: 17.** Covers nearly every iPhone in use and gives us modern SwiftUI (`@Observable`, `NavigationStack`).
- **No third-party libraries** to start. Apple's own `URLSession`, `Keychain`, `UserNotifications` and `Charts` cover everything.
- **Spec:** screens follow `DESIGN.md` (colors, spacing, radii) and the current Expo screens. API calls follow `apps/mobile/src/api/endpoints.ts`.

---

## How each phase works

Every phase has:
- **You do:** the clicks and installs only you can do.
- **I do:** the code, tests, commits (pushed to `dev`).
- **Done when:** what you should see on your iPhone before we move on.

Each phase ends with an app you can install and use. We never leave it half-broken.

---

## Phase 0 — Tools working (no app code yet)

**You do**
1. Open **Ubuntu** (WSL) once so it starts. I'll check that it can reach the internet; there is a proxy warning on this PC that may need fixing first.
2. Install **usbipd-win** on Windows (Microsoft guide: "Connect USB devices" to WSL), so WSL can see your iPhone over USB.
3. Download **Xcode 27.1** (`Xcode_27.1.xip`) from developer.apple.com/download/all in your browser (free Apple ID login). It's large, ~10 GB. Keep the file in Downloads.
4. Run `xtool setup` when I ask, choose **Password** login (free Apple ID), and give it the `Xcode.xip` path.

**I do**
- Install inside WSL: Swift 6.4 toolchain, `usbmuxd`, `libimobiledevice-utils`, xtool (AppImage).
- Create a throwaway "Hello" app with `xtool new` and run `xtool dev`.

**Done when:** a "Hello" app opens on your iPhone. (First launch: iPhone Settings → General → VPN & Device Management → trust your Apple ID.)

If USB passthrough fails with `AFCClient.Error.muxError`, xtool's docs have a workaround that relays the connection through iTunes on Windows.

---

## Phase 1 — Skeleton app

**I do**
- Create `apps/ios/` (layout above), bundle ID `app.traction.ios` (changeable later).
- Design kit in SwiftUI from `DESIGN.md`: colors (light + dark), type scale, 4-pt spacing, card, button, text field, empty and error states.
- Tab bar: **Today · Goals · Progress · You**, with placeholder screens.
- `TractionCore`: API client that adds `/api` the same way the Expo app does, a JSON date decoder, error mapping, a "server is waking up" message for Render's ~50 s cold start. First tests.
- Settings value for the API address (your Render URL).

**Done when:** the app opens on your phone with the four tabs and the Traction look, in light and dark mode.

---

## Phase 2 — Sign in and accounts

Screens: Welcome, Sign in, Create account (with invite code), Forgot password, Reset password, Onboarding.

**I do**
- Tokens stored in the **iOS Keychain**; automatic refresh when the 15-minute access token expires (`/auth/refresh`); sign out (`/auth/logout`).
- Tests for the refresh logic, including two requests failing at once (only one refresh happens).

**Done when:** you can create an account, close the app, reopen it, still be signed in, and sign out.

---

## Phase 3 — Today and tasks (the core)

Screens: Today, Add task, Task details / edit.

**I do**
- Today's list uses the same "start of my local day" rule as the Expo app (`scheduledDate`), so both apps show the same tasks.
- Complete with a tap (haptic + animation), swipe to delete, pull to refresh, add task sheet (title, duration, priority, energy, goal, day).
- Readiness / progress header.

**Done when:** you can run a normal day from the iPhone app: add, finish, edit and delete tasks, and they match what the web app shows.

---

## Phase 4 — Focus sessions

Screens: Start focus, Focus timer, Simplify, Resistance, Recovery.

**I do**
- Timer that keeps correct time when the phone locks or the app is in the background (computed from start time, not a ticking counter).
- Start / pause / resume / complete / cancel through `/focus/*`.
- Local notification when the session ends.
- Optional later: Live Activity on the Lock Screen.

**Done when:** you can run a 25-minute focus session, lock the phone, and come back to the right time.

---

## Phase 5 — Goals

Screens: Goals list, Create goal, Goal detail, Edit, Milestones, Plans, Feasibility, Projection, Recovery, Goal analytics.

**I do**
- Goal list with health status colors, create and edit flows, milestones checklist.
- AI screens (feasibility, projection, recovery) with clear loading states, because AI calls can be slow.

**Done when:** you can create a goal, add milestones, link tasks to it, and see its health.

---

## Phase 6 — Planning: tomorrow, week, month

Screens: Planner, Replan, Week, Month (1–3 focus goals + calendar).

**I do**
- Week view with tasks per day; move a task to another day.
- Month plan (`/planning/month/:month`) and month calendar using the `from` / `to` task filter.

**Done when:** you can plan next week and set this month's focus from the iPhone.

---

## Phase 7 — AI coaching and reviews

Screens: Daily brief, Smart start, Reflection, Weekly review, Monthly review, Insights, Behavioral awareness.

**Done when:** the daily brief and the weekly and monthly reviews load on the phone, and their daily limits show a friendly message instead of an error.

---

## Phase 8 — Progress

The Expo app has 15 progress screens. On iPhone we combine them into **3**:
1. **Momentum:** streaks, momentum and readiness.
2. **Patterns:** daily and weekly metrics, procrastination, burnout signals, built with Swift Charts.
3. **Coaching:** execution and behavior coaching tips.

**Done when:** the Progress tab shows real charts from your data.

---

## Phase 9 — You (profile and settings)

Screens: Profile, Preferences, Notification settings, Invites, Feedback, About.

**I do**
- **Daily reminder** with iOS local notifications (works without a server, no paid account needed). You pick the time.
- Feedback form (`/feedback`).
- **Delete account** button (the backend part is in Phase 11). The App Store requires it.

**Left out of the iPhone app:** admin, analytics-admin, developer and AI-usage screens. Those stay in the web app.

**Done when:** you get your daily reminder at the time you chose.

---

## Phase 10 — "Great app" polish

- Dynamic Type (large text), VoiceOver labels, dark mode check on every screen.
- Remembers the last loaded data, so the app opens instantly and works read-only offline.
- App icon, launch screen, haptics, smooth transitions.
- **Home-screen widget:** today's next task and progress (xtool supports app extensions).
- Quick actions: long-press the app icon → "Add task", "Start focus".
- A full-day test on your phone; fix everything that annoys you.

**Done when:** you prefer it to the web app for daily use.

---

## Phase 11 — Backend ready for the public

Things checked in the code on 2026-11-11 that must change before strangers use it:

- [ ] **Account deletion endpoint.** None exists today. Add `DELETE /users/me` (deletes all user data), used by the app's Delete account button.
- [ ] **Email actually sends.** Password reset only works if `SMTP_HOST` etc. are set on Render (for example Brevo or Resend free tier).
- [ ] **Time zones.** The server runs with `TZ=Asia/Tehran`. Every "today", "this week" and "this month" computed on the server must use the user's time zone, not the server's. I'll audit and fix this.
- [ ] **AI cost limits.** Per-feature daily limits exist. Confirm every AI feature is covered, and set a monthly spending cap in OpenRouter.
- [ ] **No cold starts.** Render's free plan sleeps (~50 s first load). Move the API to a paid instance (~$7/month) before launch.
- [ ] **Sign-ups.** Decide: open sign-up, or invite-only beta (`ALLOW_REGISTRATION`, invite codes already exist).
- [ ] **Abuse protection.** Rate limits on sign-in and sign-up.
- [ ] Sign in with Apple is **not required**, because we only use email and password. We can add it later as a convenience.

---

## Phase 12 — Website

**Pages:** Home (what Traction does, screenshots, App Store badge), Privacy policy, Terms, Support / contact, and a link to the web app (the existing Expo web build).

**Decisions for then:**
- Domain name (e.g. `traction.app`-style; you buy it, ~$10–15/year).
- Where it's hosted. A static site on Render or Cloudflare Pages is free.
- Privacy policy must say which data is collected, and that task text is sent to an AI provider (OpenRouter) for AI features.

**Done when:** the privacy and support URLs are live; App Store Connect asks for both.

---

## Phase 13 — App Store release (needs the paid account)

**You do**
1. Enroll in the **Apple Developer Program** ($99/year).
2. In App Store Connect: create the app record, and create an **App Store Connect API key** (I'll give click-by-click steps).
3. Add the key to GitHub as repository secrets (never paste it in chat).
4. Fill in the App Privacy questionnaire (I'll prepare the answers) and the age rating.

**I do**
- A small Xcode project description (XcodeGen) that wraps the same `apps/ios` code, used only by the cloud Mac.
- GitHub Actions workflow on a macOS runner: build, sign, upload to **TestFlight**.
- Screenshots (6.9" and 6.5" iPhone sizes), App Store description, keywords.

**Steps**
1. **TestFlight beta**: you plus a few testers, 1–2 weeks.
2. Fix what testers report.
3. **Submit for review.** Typical review takes 1–3 days. Common rejection reasons we're already covering: account deletion, privacy policy, a demo account for the reviewer, nothing broken on first launch.

**Done when:** Traction is downloadable on the App Store.

---

## Later (after launch)

- Push notifications from the server (APNs key, paid account), e.g. "your weekly review is ready".
- iPad layout, Apple Watch focus timer, Siri / Shortcuts ("Add a task in Traction").
- Subscriptions if AI costs grow (StoreKit).

---

## Progress

- [ ] Phase 0 — Tools working
- [ ] Phase 1 — Skeleton app
- [ ] Phase 2 — Sign in and accounts
- [ ] Phase 3 — Today and tasks
- [ ] Phase 4 — Focus sessions
- [ ] Phase 5 — Goals
- [ ] Phase 6 — Planning
- [ ] Phase 7 — AI coaching and reviews
- [ ] Phase 8 — Progress
- [ ] Phase 9 — You
- [ ] Phase 10 — Polish
- [ ] Phase 11 — Backend ready for the public
- [ ] Phase 12 — Website
- [ ] Phase 13 — App Store release
