<div dir="rtl">

# سرور (Backend)

سرور با **NestJS 11** و **TypeScript** نوشته شده و در پوشهٔ `backend/` است. همهٔ مسیرها با پیشوند `/api` هستند. مستند تعاملی Swagger در محیط غیرتولیدی در نشانی `/api/docs` در دسترس است.

## ساختار

```
backend/src/
├── main.ts                 راه‌اندازی: پیشوند /api، Helmet، CORS، ValidationPipe، Swagger
├── app.module.ts           ثبت ماژول‌ها، ThrottlerModule + ThrottlerGuard سراسری
├── health.controller.ts    GET /api/health (بدون احراز هویت و محدودیت نرخ)
├── common/                 گاردها (JWT، نقش)، دکوریتورها (@CurrentUser، @Roles)، ابزار ماه
└── modules/<name>/         هر ماژول: <name>.controller.ts، <name>.service.ts، dto/
```

هر ماژول سه بخش دارد:
- **Controller:** مسیرها و اعتبارسنجی ورودی (DTOها با class-validator).
- **Service:** منطق کار و دسترسی به پایگاه داده با Prisma.
- **DTO:** شکل داده‌های ورودی و خروجی.

## ماژول‌ها

| ماژول | کار |
|---|---|
| `auth` | ثبت‌نام، ورود، خروج، تازه‌سازی توکن، فراموشی و بازنشانی رمز، ارسال ایمیل (SMTP) |
| `users` | پروفایل، ترجیحات (ساعات کاری، لحن مربی، پاسخ‌های آشنایی)، آمار کاربر |
| `tasks` | ساخت، فهرست، ویرایش، انجام‌دادن و حذف کار؛ گام‌ها؛ ساده‌سازی کار؛ جلسات تمرکز کار |
| `focus` | شروع، توقف، ادامه، پایان و لغو جلسهٔ تمرکز |
| `goals` | هدف‌ها، نقاط عطف، برنامه‌ها، شانس موفقیت (feasibility) و پیش‌بینی (projection) |
| `goal-health` | محاسبه و بازمحاسبهٔ وضعیت سلامت هدف |
| `planning` | برنامهٔ ماه (خواندن و ذخیره) |
| `behavior` | ثبت رویدادهای رفتاری و معیارهای روزانه، هفتگی، شاخص‌ها، فرسودگی و اهمال‌کاری |
| `execution` | امتیاز آمادگی، تشخیص مقاومت، شتاب کار و آمار اجرا |
| `insights` | بینش‌ها، خلاصهٔ روزانه، آگاهی رفتاری، مرور هفتگی |
| `ai` | قابلیت‌های هوش مصنوعی (جزئیات در [ai.md](ai.md)) |
| `notifications` | اعلان‌ها و ترجیحات اعلان |
| `feedback` | دریافت بازخورد کاربران (فهرست فقط برای ادمین) |
| `invites` | دعوت‌نامه‌ها (ساخت و فهرست فقط برای ادمین) |
| `admin` | داشبورد، کاربران، تغییر نقش، سلامت سیستم و آمار (فقط ادمین) |

## فهرست کامل APIها

همه به جز موارد علامت‌خورده نیاز به توکن (`Authorization: Bearer <accessToken>`) دارند.
🔓 = عمومی (بدون توکن) · 🛡️ = فقط ادمین

### سلامت
| روش | مسیر | توضیح |
|---|---|---|
| GET | `/api/health` 🔓 | بررسی زنده‌بودن سرور (برای Render) |

### احراز هویت (`auth`)
| روش | مسیر | توضیح |
|---|---|---|
| POST | `/api/auth/register` 🔓 | ثبت‌نام (ایمیل و رمز). اگر `ALLOW_REGISTRATION=false` باشد بسته است |
| POST | `/api/auth/login` 🔓 | ورود؛ توکن دسترسی و تازه‌سازی برمی‌گرداند |
| POST | `/api/auth/logout` | خروج و باطل‌کردن توکن تازه‌سازی |
| POST | `/api/auth/refresh` 🔓 | گرفتن توکن دسترسی جدید |
| POST | `/api/auth/forgot-password` 🔓 | ارسال پیوند بازنشانی رمز |
| POST | `/api/auth/reset-password` 🔓 | تنظیم رمز جدید با توکن یک‌بارمصرف |
| GET | `/api/auth/me` | کاربر فعلی |

### کاربر (`users`)
| روش | مسیر | توضیح |
|---|---|---|
| GET / PATCH | `/api/users/me` | خواندن و ویرایش نام و پروفایل |
| GET / PATCH | `/api/users/me/preferences` | ترجیحات (ساعات کاری، انرژی، لحن مربی، پاسخ‌های آشنایی، پایان آشنایی) |
| GET | `/api/users/me/stats` | تعداد کارها، هدف‌ها و جلسات تمرکز |

### کارها (`tasks`)
| روش | مسیر | توضیح |
|---|---|---|
| POST | `/api/tasks` | ساخت کار |
| GET | `/api/tasks` | فهرست با فیلتر `status`، `category`، `goalId`، `scheduledDate` (شروع روز محلی) و بازهٔ تاریخ |
| GET | `/api/tasks/date/:date` | کارهای یک روز |
| GET / PATCH / DELETE | `/api/tasks/:id` | جزئیات، ویرایش، حذف |
| POST | `/api/tasks/:id/complete` | علامت انجام‌شده |
| GET | `/api/tasks/:id/steps` | گام‌های کار |
| POST | `/api/tasks/:id/simplify` | ساده‌سازی کار |
| GET | `/api/tasks/:id/focus-sessions` | جلسات تمرکز این کار |

### تمرکز (`focus`)
| روش | مسیر | توضیح |
|---|---|---|
| POST | `/api/focus/start` | شروع جلسه (با یا بدون کار) |
| GET | `/api/focus/active` | جلسهٔ فعال |
| GET | `/api/focus` و `/api/focus/:id` | فهرست و جزئیات |
| POST | `/api/focus/:id/pause` · `resume` · `complete` · `cancel` | کنترل جلسه |

### هدف‌ها (`goals`، `goal-health`)
| روش | مسیر | توضیح |
|---|---|---|
| POST / GET | `/api/goals` | ساخت و فهرست هدف‌ها |
| GET / PATCH / DELETE | `/api/goals/:id` | جزئیات، ویرایش، حذف |
| PATCH | `/api/goals/:id/archive` | بایگانی |
| GET | `/api/goals/:id/feasibility` | شانس موفقیت بر اساس سرعت پیشرفت و زمان باقی‌مانده |
| GET | `/api/goals/:id/projection` | پیش‌بینی تاریخ پایان |
| POST / GET | `/api/goals/:id/milestones` | نقاط عطف |
| PATCH / DELETE | `/api/goals/:id/milestones/:milestoneId` | ویرایش و حذف نقطهٔ عطف |
| POST / GET | `/api/goals/:id/plans` | برنامه‌های هدف |
| PATCH / DELETE | `/api/goals/:id/plans/:planId` | ویرایش و حذف برنامه |
| GET | `/api/goal-health/:goalId` | وضعیت سلامت هدف |
| POST | `/api/goal-health/:goalId/recalculate` | بازمحاسبه |

### برنامه‌ریزی (`planning`)
| روش | مسیر | توضیح |
|---|---|---|
| GET / PUT | `/api/planning/month/:month` | برنامهٔ ماه (`:month` به شکل `YYYY-MM`) |

### رفتار و اجرا (`behavior`، `execution`)
| روش | مسیر | توضیح |
|---|---|---|
| POST / GET | `/api/behavior` | ثبت و فهرست رویدادهای رفتاری |
| GET | `/api/behavior/stats` | آمار رویدادها |
| GET | `/api/behavior/metrics/daily` · `weekly` · `indicators` · `burnout` · `procrastination` | معیارهای رفتاری |
| GET / DELETE | `/api/behavior/:id` | جزئیات و حذف رویداد |
| GET | `/api/execution/readiness` | امتیاز آمادگی (۰ تا ۱۰۰) |
| GET | `/api/execution/resistance` | تشخیص مقاومت در برابر کارها |
| GET | `/api/execution/momentum` | شتاب کار و پیوستگی روزها |
| GET | `/api/execution/stats` | آمار کلی (پاسخ به شکل مقادیر تخت؛ اپ آن را به ساختار تودرتو تبدیل می‌کند) |

### بینش‌ها (`insights`)
| روش | مسیر | توضیح |
|---|---|---|
| GET | `/api/insights` و `/api/insights/:id` | فهرست و جزئیات |
| GET | `/api/insights/daily-brief` · `behavioral-awareness` · `weekly-review` | خلاصهٔ روز، آگاهی رفتاری، مرور هفته |
| PATCH | `/api/insights/read-all` · `/:id/read` · `/:id/dismiss` | خوانده‌شده و رد کردن |
| DELETE | `/api/insights/:id` | حذف |

### هوش مصنوعی (`ai`)
| روش | مسیر | توضیح |
|---|---|---|
| GET | `/api/ai/daily-brief` · `weekly-review` · `monthly-review` | خلاصهٔ روز، مرور هفته، مرور ماه |
| POST | `/api/ai/breakdown-task/:taskId` | شکستن کار به گام‌ها |
| POST | `/api/ai/stuck-analysis` | تحلیل «گیر کرده‌ام» |
| POST | `/api/ai/goal-recovery/:goalId` | برنامهٔ بازیابی هدف |
| GET / POST | `/api/ai/recommendations` · `/generate` · `/:id/accept` · `/:id/dismiss` | پیشنهادها |
| GET | `/api/ai/usage` · `usage/summary` · `usage/by-feature` · `usage/by-day` · `metrics` · `status` | مصرف، معیارها و وضعیت پیکربندی |
| DELETE | `/api/ai/cache` | پاک‌کردن کش هوش مصنوعی کاربر |

### اعلان‌ها، بازخورد، دعوت‌نامه
| روش | مسیر | توضیح |
|---|---|---|
| GET | `/api/notifications` · `unread-count` · `preferences` · `:id` | اعلان‌ها |
| PATCH / DELETE | `/api/notifications/read-all` · `:id/read` · `:id` | مدیریت اعلان‌ها |
| POST | `/api/feedback` | ارسال بازخورد (۲۰ بار در دقیقه) |
| GET | `/api/feedback` 🛡️ | فهرست بازخوردها |
| POST / GET | `/api/invites` 🛡️ · `/api/invites/stats` 🛡️ | ساخت، فهرست و آمار دعوت‌نامه |
| GET | `/api/invites/validate/:code` | بررسی کد دعوت |
| POST | `/api/invites/:code/accept` | پذیرش دعوت |

### مدیریت (`admin`) 🛡️
| روش | مسیر | توضیح |
|---|---|---|
| GET | `/api/admin/dashboard` · `users` · `health` · `analytics` | داشبورد، کاربران، سلامت، آمار (دقایق تمرکز واقعی، کاربران فعال، ماندگاری) |
| PATCH | `/api/admin/users/:id/role` | تغییر نقش کاربر |

## متغیرهای محیطی سرور

| متغیر | توضیح |
|---|---|
| `DATABASE_URL` | نشانی اتصال PostgreSQL (در تولید: Neon) |
| `JWT_SECRET` | کلید امضای توکن‌ها (در Render خودکار ساخته می‌شود) |
| `JWT_EXPIRATION` / `JWT_REFRESH_EXPIRATION` | عمر توکن دسترسی (۱۵ دقیقه) و تازه‌سازی (۳۰ روز در تولید) |
| `PORT` | پورت سرور (Render خودش تعیین می‌کند) |
| `NODE_ENV` | `development` یا `production` |
| `TZ` | منطقهٔ زمانی سرور؛ در تولید `Asia/Tehran` (برای محاسبهٔ ماه‌ها) |
| `CORS_ORIGIN` | نشانی وب‌اپ مجاز (با کاما جدا می‌شود) |
| `OPENROUTER_API_KEY` | کلید OpenRouter برای هوش مصنوعی |
| `AI_MODEL_PRIMARY` / `AI_MODEL_FALLBACK` | مدل اصلی و پشتیبان (پیش‌فرض `anthropic/claude-3-haiku`) |
| `ALLOW_REGISTRATION` | `false` = بستن ثبت‌نام عمومی |
| `SMTP_HOST`، `SMTP_PORT`، `SMTP_USER`، `SMTP_PASS`، `SMTP_FROM` | ارسال ایمیل بازنشانی رمز (بدون آن، پیوند در لاگ توسعه چاپ می‌شود) |
| `PASSWORD_RESET_URL` | نشانی صفحهٔ بازنشانی رمز در اپ |
| `REMINDER_CRON_KEY`، `VAPID_*` | برای یادآورهای آینده (در `render.yaml` تعریف شده ولی هنوز کدی از آن استفاده نمی‌کند) |

نمونهٔ مقادیر محلی در `backend/.env.backup` است؛ روی سیستم جدید آن را به `backend/.env` کپی کنید.

## دستورهای پرکاربرد

```bash
cd backend
npm install                    # نصب وابستگی‌ها
npx prisma generate            # ساخت کلاینت Prisma
npx prisma migrate deploy      # اعمال مهاجرت‌ها روی پایگاه داده
npm run start:dev              # اجرای سرور با بارگذاری خودکار
npm run build && npm run start:prod   # ساخت و اجرای نسخهٔ تولیدی
npm test                       # تست‌ها
npx tsc --noEmit               # بررسی تایپ‌ها
```

</div>
