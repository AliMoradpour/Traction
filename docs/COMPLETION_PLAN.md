# Traction — Completion Plan

Branch: `dev` (each part is committed and pushed separately). `main` gets updated only after review.
Status legend: ✅ done · 🔄 in progress · ⏳ planned · 🙋 needs owner input

## Already done (on `main`)
- ✅ Feedback endpoint, persisted retry queue, real screen names
- ✅ Admin analytics: real focus minutes, activity-based "active users", true retention
- ✅ Backend boots on Prisma 7 (driver adapter); migrations committed
- ✅ Rate limiting enforced; refresh tokens can't be used as access tokens
- ✅ Mobile: token-refresh deadlock fixed, API errors normalized, Expo SDK 57 deps aligned

## Plan

Also fixed along the way: the app read every API response as `response.data.data` (always undefined), and new users were redirected past onboarding.


| # | Part | What "done" means | Status |
|---|------|-------------------|--------|
| 1 | Mobile lint | `npm run lint` runs with 0 errors | ✅ |
| 2 | Onboarding answers saved | Onboarding answers persist on the server, survive reinstall; app knows if onboarding is complete | ✅ |
| 3 | Profile preferences saved | Profile screen reads/writes `/users/me/preferences` (AI personality, deep work, notifications) | ✅ |
| 4 | Password reset (real) | Single-use, expiring, hashed reset tokens; reset changes the password and signs out other sessions; email sent via SMTP when configured, link logged in development | ✅ 🙋 SMTP credentials for production |
| 5 | Goal feasibility from data | Probability/timeline computed from progress velocity vs. time left, not hardcoded | ✅ |
| 6 | Unreachable screens | Resistance / simplify screens reachable from the task & focus flows | ✅ |
| 7 | UI polish | Admin analytics follows the app theme; restored session loads the user profile | ✅ |
| 8 | CI | GitHub Actions: backend (migrate on Postgres, typecheck, lint, test, build) + mobile (typecheck, lint, test) on every push/PR | ⏳ |
| 9 | Docs | Known-issues table, RUN.md, CHANGELOG reflect reality | ⏳ |
| 10 | Final verification | Full end-to-end API run against real Postgres; open PR `dev → main` | ⏳ 🙋 approve merge |

## Needs the owner
- **SMTP credentials** (host/port/user/pass, from-address) to send real reset emails in production. Until then the reset link is printed in the server log in development.
- **Hosting details** — if the API runs behind a proxy/load balancer, rate limiting needs `trust proxy` configured.
- **Email verification** — product decision: require it before login, or allow unverified accounts? (Not started until decided.)
- **Merge `dev` → `main`** after review.
