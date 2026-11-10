# Put Traction online (Neon + Render)

After this, Traction works on your iPhone (as a home-screen app) and Android
from anywhere, without your PC. Everything here is free.

## 1. Database on Neon (5 min)

1. Sign in at https://neon.tech and create a project (region: **Frankfurt**).
2. On the project dashboard, click **Connect**, turn **off** "Connection pooling",
   and copy the connection string (starts with `postgresql://`). This is your
   `DATABASE_URL`. Keep it private.

## 2. Server and web app on Render (10 min)

1. Sign in at https://render.com with GitHub.
2. **New → Blueprint**, pick the `Traction` repo. Render reads `render.yaml`
   and shows two services: `traction-api` and `traction-app`. Branch: `dev`.
3. It asks for the secret values:
   - `DATABASE_URL`: the Neon string from step 1.
   - `OPENROUTER_API_KEY`: your key from https://openrouter.ai/keys (AI features).
   - `CORS_ORIGIN`: leave as `x` for now.
   - `EXPO_PUBLIC_API_URL`: leave as `x` for now.
   - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`: leave as `x` (reminders, later).
4. Click **Apply** and wait for both to finish (first build takes ~5–10 min).
5. Copy the two web addresses Render gives you, e.g.
   `https://traction-api-xxxx.onrender.com` and `https://traction-app-xxxx.onrender.com`.
6. Fill in the two placeholders, then redeploy each service
   (**Manual Deploy → Deploy latest commit**):
   - `traction-api` → Environment → `CORS_ORIGIN` = the **app** address.
   - `traction-app` → Environment → `EXPO_PUBLIC_API_URL` = the **api** address.

Check: opening `<api address>/api/health` shows `{"status":"ok"...}`.

## 3. Install on your iPhone

1. Open the **app** address in **Safari**. Create your account.
2. Tap **Share → Add to Home Screen**. Open Traction from the home screen.
3. Back in Render, set `traction-api` → `ALLOW_REGISTRATION` = `false` and
   redeploy, so nobody else can sign up on your server.

## 4. Android APK pointing at the server

EAS cloud builds don't see your local `.env` (it isn't uploaded), so put the
address in `apps/mobile/eas.json` under the `preview` profile:

```json
"preview": {
  "distribution": "internal",
  "env": { "EXPO_PUBLIC_API_URL": "https://traction-api-xxxx.onrender.com" }
}
```

Then build the APK as before (`eas build -p android --profile preview`).

## Good to know

- The free server sleeps after 15 minutes idle. The first open after a break
  can take up to a minute; after that it is fast.
- Neon's free database keeps your data; Render's free server holds no data.
