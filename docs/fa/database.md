<div dir="rtl">

# پایگاه داده

- **موتور:** PostgreSQL (در تولید روی **Neon**، در توسعه در **Docker**).
- **ORM:** Prisma 7 با driver adapter مخصوص PostgreSQL.
- **تعریف جدول‌ها:** `backend/prisma/schema.prisma`
- **مهاجرت‌ها (migrations):** `backend/prisma/migrations/`
- **دادهٔ اولیه (seed):** `backend/prisma/seed.ts`؛ یک کاربر SUPER_ADMIN می‌سازد (ایمیل و رمز از `SEED_ADMIN_EMAIL` و `SEED_ADMIN_PASSWORD`)

## جدول‌ها

| مدل Prisma | جدول | کاربرد | فیلدهای مهم |
|---|---|---|---|
| `User` | `users` | حساب کاربری | ایمیل، رمز (هش bcrypt)، نام، نام خانوادگی، نقش |
| `UserProfile` | `user_profiles` | ترجیحات و پاسخ‌های آشنایی | لحن مربی، حالت کار عمیق، تراکم اعلان، ساعات و روزهای کاری، اوج انرژی، فاصلهٔ استراحت، هدف اصلی، سطح تجربه، زمان روزانه، `onboardingCompletedAt` |
| `Task` | `tasks` | کارها | عنوان، توضیح، دسته، اولویت، مدت (دقیقه)، اصطکاک، انرژی، `scheduledAt`، `dueAt`، `completedAt`، وضعیت، هدف |
| `FocusSession` | `focus_sessions` | جلسات تمرکز | کار، شروع، پایان، مدت (ثانیه)، وضعیت، کامل‌شده |
| `Goal` | `goals` | هدف‌ها | عنوان، نوع، دسته، شروع، تاریخ هدف، پیشرفت (۰ تا ۱۰۰)، وضعیت، سلامت، سرعت |
| `GoalMilestone` | `goal_milestones` | نقاط عطف هدف | عنوان، تاریخ، پیشرفت، وضعیت |
| `GoalPlan` | `goal_plans` | برنامه‌های هدف | عنوان، گام‌ها، زمان پیشنهاد و اعمال، وضعیت |
| `MonthPlan` | `month_plans` | برنامهٔ ماه | ماه (`YYYY-MM`)، تمرکزها، یادداشت |
| `BehaviorEvent` | `behavior_events` | رویدادهای رفتاری | نوع (انجام کار، شروع و پایان تمرکز، «گیر کرده‌ام» و…)، کار، هدف، جلسه، متادیتا |
| `Insight` | `insights` | بینش‌های تولیدشده | نوع، عنوان، محتوا، اطمینان، خوانده‌شده، ردشده |
| `AIRecommendation` | `ai_recommendations` | پیشنهادهای هوش مصنوعی | نوع، عنوان، متن، پذیرفته‌شده، ردشده |
| `AICache` | `ai_cache` | کش پاسخ‌های هوش مصنوعی | قابلیت، محتوا، مدل، انقضا |
| `AIUsage` | `ai_usage` | مصرف هوش مصنوعی | قابلیت، مدل، تعداد توکن |
| `Notification` | `notifications` | اعلان‌ها | نوع، عنوان، متن، خوانده‌شده |
| `RefreshToken` | `refresh_tokens` | توکن‌های تازه‌سازی | توکن، انقضا، باطل‌شده |
| `PasswordResetToken` | `password_reset_tokens` | بازنشانی رمز | هش توکن، انقضا، استفاده‌شده (یک‌بارمصرف) |
| `Invite` | `invites` | دعوت‌نامه‌ها | ایمیل، کد، نقش، دعوت‌کننده، استفاده‌کننده، انقضا |
| `Feedback` | `feedback` | بازخورد کاربران | `clientId` (برای جلوگیری از ارسال تکراری)، نوع، پیام، صفحه |

## مقادیر شمارشی (Enum) مهم

| Enum | مقادیر |
|---|---|
| `UserRole` | `SUPER_ADMIN`، `ADMIN`، `BETA_TESTER`، `PREMIUM_USER`، `USER` |
| `TaskPriority` | `LOW` (می‌تواند صبر کند)، `MEDIUM` (عادی)، `HIGH` (مهم)، `URGENT` (فوری) |
| `TaskStatus` | `PENDING`، `IN_PROGRESS`، `COMPLETED`، `SKIPPED`، `CANCELLED` |
| `GoalType` | `IELTS` (زبان)، `PROGRAMMING`، `FITNESS`، `SAVINGS`، `CUSTOM` (شخصی) |
| `GoalHealth` | `ON_TRACK`، `SLIGHTLY_BEHIND`، `BEHIND_SCHEDULE`، `RECOVERY_NEEDED`، `AT_RISK` |
| `AIPersonality` | `GENTLE` (ملایم)، `BALANCED` (متعادل)، `DIRECT` (صریح) |

برای فهرست دقیق همهٔ مقادیر به `schema.prisma` مراجعه کنید.

## مهاجرت‌ها

| مهاجرت | تغییر |
|---|---|
| `0_init` | ساختار اولیه |
| `20261101000000_add_feedback` | جدول بازخورد |
| `20261101010000_onboarding_answers` | پاسخ‌های آشنایی در پروفایل |
| `20261101020000_password_reset_tokens` | توکن‌های بازنشانی رمز |
| `20261110202842_month_plans` | برنامهٔ ماه |

### افزودن مهاجرت جدید

```bash
cd backend
# 1. schema.prisma را ویرایش کنید
npx prisma migrate dev --name توضیح_کوتاه_انگلیسی
# 2. فایل مهاجرت ساخته‌شده را همراه schema کامیت کنید
```

در تولید، Render هنگام شروع سرور `npx prisma migrate deploy` را اجرا می‌کند. CI هم بررسی می‌کند که مهاجرت‌ها با schema یکی باشند.

## پشتیبان‌گیری

- **تولید (Neon):** Neon به طور خودکار امکان بازگشت به نقطه‌ای در گذشته (point-in-time restore) را دارد. از داشبورد Neon استفاده کنید.
- **توسعه (Docker):** دادهٔ محلی فقط شامل حساب‌های آزمایشی است. برای گرفتن خروجی:

```bash
docker exec traction-pg pg_dump -U postgres traction > traction-local.sql
```

</div>
