<div dir="rtl">

# راه‌اندازی محیط توسعه روی مک‌بوک

این راهنما برای مک‌بوک جدید نوشته شده و فرض می‌کند هیچ‌چیز نصب نیست. دستورها را در برنامهٔ **Terminal** اجرا کنید (Spotlight: `⌘ + Space`، بنویسید Terminal).

## ۱. ابزارهای پایه

```bash
# Homebrew (مدیر بسته‌های مک)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js (نسخهٔ 22 یا جدیدتر؛ CI از 24 استفاده می‌کند)، Git
brew install node git

# Docker Desktop (برای پایگاه دادهٔ محلی)
brew install --cask docker
open -a Docker        # یک بار باز کنید تا راه بیفتد
```

برای اپ Swift: **Xcode** را از App Store نصب کنید و یک بار باز کنید تا اجزای اضافه‌اش نصب شود.

## ۲. اتصال به گیت‌هاب

```bash
ssh-keygen -t ed25519 -C "your-email"      # Enter بزنید تا مسیر پیش‌فرض بماند
pbcopy < ~/.ssh/id_ed25519.pub              # کلید عمومی در کلیپ‌بورد کپی شد
```

در گیت‌هاب: **Settings → SSH and GPG keys → New SSH key**، کلید را بچسبانید و ذخیره کنید. سپس:

```bash
git config --global user.name "Ali Moradpoor"
git config --global user.email "your-email"
mkdir -p ~/Projects && cd ~/Projects
git clone git@github.com:AliMoradpour/Traction.git
git clone git@github.com:AliMoradpour/traction-ios-app.git
cd Traction && git checkout dev
```

## ۳. فایل‌های تنظیمات (`.env`)

```bash
cp backend/.env.backup backend/.env
cp apps/mobile/.env.backup apps/mobile/.env
```

سپس دو مقدار را عوض کنید:

1. **IP مک روی Wi-Fi:** `ipconfig getifaddr en0` را اجرا کنید و نتیجه را در `apps/mobile/.env` جای `192.168.1.6` بگذارید.
2. **پورت سرور:** اگر در `backend/.env` پورت ۳۱۰۰ است و آزاد است، همان بماند. پورت `EXPO_PUBLIC_API_URL` باید با `PORT` سرور یکی باشد.

## ۴. پایگاه دادهٔ محلی

```bash
docker run -d --name traction-pg --restart unless-stopped \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=traction \
  -v traction-pg-data:/var/lib/postgresql/data -p 5544:5432 postgres:17
```

(پورت ۵۵۴۴ با `DATABASE_URL` داخل `backend/.env` هماهنگ است.)

## ۵. اجرای سرور

```bash
cd ~/Projects/Traction/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

بررسی: `curl http://localhost:3100/api/health` باید `{"status":"ok",...}` برگرداند.

## ۶. اجرای اپ روی آیفون

```bash
cd ~/Projects/Traction/apps/mobile
npm install
npx expo login           # با حساب Expo (alimoradpour)
npx expo start --lan --clear
```

روی آیفون: Expo Go را باز کنید، با همان حساب وارد شوید و QR را با دوربین اسکن کنید. آیفون و مک باید روی یک Wi-Fi باشند. اگر مک دربارهٔ اجازهٔ اتصال‌های ورودی برای Node پرسید، **Allow** بزنید.

## ۷. Claude Code

برنامهٔ Claude (دسکتاپ) را نصب کنید و پوشهٔ `~/Projects/Traction` را باز کنید. یادداشت‌های کاری قبلی در فایل `CLAUDE.md` داخل مخزن هستند و خودکار خوانده می‌شوند.

## مشکلات رایج

| مشکل | راه‌حل |
|---|---|
| `Project is incompatible with this version of Expo Go` | Expo Go فقط آخرین SDK را اجرا می‌کند؛ `npx expo install expo@latest --fix` |
| آیفون به سرور وصل نمی‌شود | IP در `apps/mobile/.env` را با `ipconfig getifaddr en0` چک کنید؛ Expo را با `--clear` دوباره اجرا کنید |
| `EADDRINUSE` (پورت اشغال است) | پورت دیگری در `backend/.env` و `apps/mobile/.env` بگذارید |
| خطای اتصال به پایگاه داده | Docker Desktop باز باشد؛ `docker ps` باید `traction-pg` را نشان دهد |
| صفحه‌های هوشمند خالی‌اند | `OPENROUTER_API_KEY` در `backend/.env` خالی است (عادی است) |

</div>
