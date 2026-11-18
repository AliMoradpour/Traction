<div dir="rtl">

# اپلیکیشن موبایل و وب (Expo)

اپ در پوشهٔ `apps/mobile/` با **Expo SDK 58**، **React Native 0.88** و **React 19.3** نوشته شده و با یک کد سه خروجی دارد:

| خروجی | استفاده |
|---|---|
| **وب‌اپ نصب‌شدنی (PWA)** | نسخهٔ روزمره روی آیفون: سایت را در Safari باز کنید و Share → Add to Home Screen. روی Render به نشانی `traction-app` میزبانی می‌شود |
| **Expo Go** | هنگام توسعه روی گوشی، از طریق Wi-Fi و QR کد |
| **اندروید** | ساخت APK با EAS (پروفایل `preview` در `eas.json`) |

## ساختار کد

```
apps/mobile/
├── app/                 صفحه‌ها (Expo Router: هر فایل = یک مسیر)
│   ├── _layout.tsx      لایهٔ ریشه: Providerها، هدایت بین ورود/آشنایی/اپ
│   ├── index.tsx        صفحهٔ آغازین (splash)
│   ├── (auth)/          خوشامد، ورود، ثبت‌نام، فراموشی/بازنشانی رمز، آشنایی، معرفی
│   ├── (app)/           پنج زبانهٔ اصلی و زیرصفحه‌ها
│   ├── (admin)/         پنل مدیریت
│   └── focus/[taskId]/  جلسهٔ تمرکز و کمک‌ها
├── src/
│   ├── api/             کلاینت Axios، مسیرها (endpoints.ts)، رهگیر توکن، خطاها
│   ├── services/        یک سرویس برای هر بخش API
│   ├── hooks/           هوک‌های React Query (useTasks، useGoals، …)
│   ├── store/           Zustand (احراز هویت، رابط کاربری، …)
│   ├── components/      calm/ (کیت طراحی)، ui/، cards/، forms/، feedback/، layout/
│   ├── theme/           رنگ‌ها، تایپوگرافی، فاصله‌ها، گوشه‌ها، سایه‌ها
│   ├── lib/             تاریخ‌ها (dates.ts)، برچسب هدف‌ها، اعتبارسنجی (Zod)، لاگ
│   └── assets/          فونت Inter، لوگوها
└── public/              manifest.json، sw.js (service worker)، آیکن‌های وب‌اپ
```

## ناوبری

### زبانه‌های اصلی (پایین صفحه)

| زبانه | مسیر | کار |
|---|---|---|
| امروز | `/today` | خوشامد، کارت آمادگی، کارهای امروز، میان‌برها (شروع هوشمند، برنامهٔ روز، بازبینی) |
| هدف‌ها | `/goals` | فهرست هدف‌ها و ساخت هدف |
| تمرکز | `/focus-start` | انتخاب یک کار از امروز و شروع جلسهٔ تمرکز |
| پیشرفت | `/progress` | آمار هفته و دسترسی به پیشنهادها، عادت‌ها، شتاب و مرور هفتگی |
| شما | `/profile` | تنظیمات، بازخورد، خروج |

### همهٔ صفحه‌ها

| گروه | صفحه‌ها |
|---|---|
| ورود و آشنایی `(auth)` | `welcome` خوشامد · `login` ورود · `register` ثبت‌نام (فقط ایمیل و رمز) · `forgot-password` · `reset-password` · `onboarding` آشنایی ۴ مرحله‌ای (نام و نام خانوادگی، هدف استفاده، تجربه، زمان متمرکز روزانه) · `welcome-intro` معرفی زبانه‌ها |
| امروز `(app)/today` | `index` · `add-task` کار جدید · `task-details` جزئیات کار · `smart-start` شروع هوشمند · `planner` برنامهٔ روز · `replan` برنامه‌ریزی دوباره · `reflection` بازبینی پایان روز · `daily-brief` خلاصهٔ روز · `week` برنامهٔ هفته · `month` برنامهٔ ماه · `monthly-review` مرور ماه |
| هدف‌ها `(app)/goals` | `index` · `create` · `feasibility` شانس موفقیت · `[goalId]/index` جزئیات · `edit` · `milestones` · `projection` پیش‌بینی · `analytics` فعالیت · `recovery` بازیابی |
| پیشرفت `(app)/progress` | `index` · `insights/` پیشنهادها، `behavioral-awareness`، `weekly-review` · `behavior/` عادت‌ها: `daily`، `weekly`، `indicators`، `burnout`، `procrastination`، `coaching` · `execution/` شتاب: `momentum`، `resistance`، `coaching` |
| شما `(app)/profile` | `index` · `usage` مصرف هوش مصنوعی · `invites` دعوت‌نامه (ادمین) · `developer` ابزار توسعه‌دهنده (پنج بار ضربه روی شمارهٔ نسخه) |
| تمرکز `focus/[taskId]` | `index` جلسهٔ تمرکز · `simplify` شکستن به گام‌ها · `resistance` «گیر کرده‌ام» · `recovery` بازگشت به جلسه |
| مدیریت `(admin)` | `index` داشبورد و کاربران · `analytics` آمار |

### قواعد هدایت (در `app/_layout.tsx`)

- کاربر واردنشده که به صفحهٔ داخلی برود، به ورود هدایت می‌شود.
- کاربر واردشده در صفحه‌های `(auth)` به امروز هدایت می‌شود؛ به جز `onboarding`، `welcome-intro`، `register` و `login` (این دو خودشان پس از موفقیت هدایت می‌کنند؛ ثبت‌نام → آشنایی، ورود → امروز).

## داده و وضعیت

- **React Query** همهٔ داده‌های سرور را می‌گیرد و کش می‌کند (`src/hooks/*`). کلیدها در `src/lib/queryKeys.ts` و زمان‌های کش در `src/lib/cacheConfig.ts` هستند.
- **Zustand** برای وضعیت محلی: `auth.store.ts` (کاربر و وضعیت ورود)، `ui.store.ts` و…
- **فرم‌ها:** React Hook Form + Zod (`src/lib/validations.ts`). کامپوننت `Input` با `control` و `name` به فرم وصل می‌شود.
- **توکن‌ها:** در گوشی با `expo-secure-store` و در وب با `localStorage` ذخیره می‌شوند (`src/api/interceptors.ts`).
- **تاریخ‌ها:** فقط از توابع `src/lib/dates.ts` استفاده کنید (`localDayStartISO`، `localNoonISO`، `monthRangeISO` و…). هرگز از `toISOString().split('T')[0]` برای «امروز» استفاده نکنید؛ تاریخ UTC می‌دهد نه تاریخ محلی.

## متغیرهای محیطی اپ

| متغیر | توضیح |
|---|---|
| `EXPO_PUBLIC_API_URL` | نشانی سرور، مثلاً `http://192.168.1.6:3100` در توسعه (IP کامپیوتر روی Wi-Fi) یا نشانی Render در تولید. پیشوند `/api` خودکار اضافه می‌شود |
| `EXPO_PUBLIC_APP_ENV` | `development` یا `production` |

نمونه در `apps/mobile/.env.backup`؛ روی سیستم جدید آن را به `.env` کپی و IP را عوض کنید.

## دستورهای پرکاربرد

```bash
cd apps/mobile
npm install                         # نصب (legacy-peer-deps در .npmrc فعال است)
npx expo start --lan --clear        # اجرای توسعه؛ QR را با دوربین آیفون اسکن کنید
npx expo start --web                # نسخهٔ وب در مرورگر
npx expo export --platform web      # ساخت وب‌اپ برای انتشار (پوشهٔ dist)
npx tsc --noEmit && npm run lint && npm test   # بررسی‌ها
```

> Expo Go روی آیفون فقط آخرین نسخهٔ SDK را اجرا می‌کند و باید با همان حساب Expo که در ترمینال وارد شده‌اید (`npx expo login`) وارد Expo Go شوید.

</div>
