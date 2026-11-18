# Notes for Claude

Working notes carried over from earlier sessions (they used to live only in the
local Claude memory folder on the old Windows laptop).

## About the owner

- New to mobile development; Claude writes the code. Explain jargon in one line,
  go one step at a time, and keep the owner's part to clicks (creating accounts,
  paying, pasting secrets into dashboards, never into chat).
- Tests on an **iPhone** (Expo Go during development, the home-screen web app
  in daily use). Prefers Persian for documentation (`docs/fa/`).
- Moving from a Windows laptop to a **MacBook** (November 2026).

## Git

- Commit each logical part separately and push to **`dev`**, not `main`.
  Merge to `main` only when asked.
- The repository holds `backend/.env.backup` and `apps/mobile/.env.backup`
  (local development values only). Copy them to `.env` on a new machine. Real
  production secrets live in the Render and Neon dashboards, never in git.

## Direction (as of 2026-11-11)

- Native Swift/SwiftUI iPhone app for the App Store, in a separate repo:
  `git@github.com:AliMoradpour/traction-ios-app.git` (work on `dev`).
  Phased plan: `docs/IOS_SWIFT_PLAN.md`. It was written for Windows + WSL +
  xtool because there was no Mac; with a MacBook, Xcode can replace xtool and
  the cloud macOS build step.
- `backend/` (NestJS + Postgres) stays and serves every client.
- `apps/mobile/` (Expo) stays for Android and as the installable web app.
- Product website planned under `apps/website/`.
- Hosting: Render (API + web app, `render.yaml`) and Neon (Postgres). See
  `docs/DEPLOY.md` and the Persian docs in `docs/fa/`.

## Design

Calm and warm: paper tones / warm night, Traction blue only for actions, sage
for done, clay for nudges, Nunito headings, sentence case, outline icons, no
emoji or glow. Shared kit in `apps/mobile/src/components/calm`. See `DESIGN.md`.
