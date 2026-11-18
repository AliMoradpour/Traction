<div dir="rtl">

# هوش مصنوعی

قابلیت‌های هوشمند تِرَکشن از طریق **OpenRouter** به مدل‌های **Claude** (شرکت Anthropic) وصل می‌شوند. همهٔ منطق و متن درخواست‌ها در سرور است: `backend/src/modules/ai/` و `backend/prompts/`.

## قابلیت‌ها

| قابلیت | مسیر API | محدودیت مصرف برای هر کاربر | فایل prompt |
|---|---|---|---|
| خلاصهٔ روز | `GET /api/ai/daily-brief` | ۱ بار در روز | `daily-brief.md` |
| مرور هفتگی | `GET /api/ai/weekly-review` | ۱ بار در هفته | `weekly-review.md` |
| مرور ماهانه | `GET /api/ai/monthly-review` | ۶ بار در روز | `monthly-review.md` |
| شکستن کار به گام‌ها | `POST /api/ai/breakdown-task/:taskId` | ۲۰ بار در روز | `task-breakdown.md`، `task-breakdown-simple.md`، `simplify-task.md` |
| «گیر کرده‌ام» | `POST /api/ai/stuck-analysis` | ۱۰ بار در روز | `stuck-analysis.md` |
| برنامهٔ بازیابی هدف | `POST /api/ai/goal-recovery/:goalId` | ۳ بار در روز | `goal-recovery.md` |
| پیشنهادها | `/api/ai/recommendations/*` | ۵ بار در روز | `recommendation.md` |
| شانس موفقیت هدف و بینش‌ها | بخش‌های `goals` و `insights` | — | `goal-feasibility.md`، `insight.md` |

## اجزای ماژول

| فایل | کار |
|---|---|
| `openrouter.service.ts` و `providers/ai/openrouter.provider.ts` | ارسال درخواست به OpenRouter (لایهٔ provider قابل تعویض است) |
| `model-registry.service.ts` | انتخاب مدل برای هر قابلیت؛ پیش‌فرض اصلی و پشتیبان: `anthropic/claude-3-haiku` (قابل تغییر با `AI_MODEL_PRIMARY` و `AI_MODEL_FALLBACK`) |
| `prompt-loader.service.ts` | بارگذاری prompt از پوشهٔ `prompts/` |
| `ai-rate-limit.service.ts` | محدودیت مصرف هر قابلیت (جدول بالا) |
| `ai-cache.service.ts` | کش پاسخ‌ها در جدول `ai_cache` (پیش‌فرض ۶۰ دقیقه) |
| `ai-safety.service.ts` | پاک‌سازی ورودی کاربر در برابر تزریق prompt و اعتبارسنجی خروجی |
| `ai-observability.service.ts` | ثبت مصرف در `ai_usage` (قابلیت، مدل، توکن) |
| `daily-brief`، `weekly-review`، `task-breakdown`، `stuck-analysis`، `goal-recovery` و… | سرویس هر قابلیت |
| `behavior-engine.service.ts`، `friction-engine.service.ts` | محاسبهٔ پروفایل رفتاری و اصطکاک کار (بدون هوش مصنوعی، با قواعد) |

## تنظیم

1. در https://openrouter.ai حساب بسازید و کلید بگیرید.
2. کلید را در Render (`traction-api` → Environment → `OPENROUTER_API_KEY`) یا در `backend/.env` محلی بگذارید. **هرگز آن را در چت یا گیت قرار ندهید.**
3. مسیر `GET /api/ai/status` نشان می‌دهد کلید تنظیم شده است یا نه (`{"configured": true}`).

بدون کلید، صفحه‌های هوشمند خطای ملایم یا محتوای خالی نشان می‌دهند و بقیهٔ اپ عادی کار می‌کند.

## هزینه

مصرف در `GET /api/ai/usage/summary` و صفحهٔ «شما → AI usage» دیده می‌شود. محدودیت‌های جدول بالا هزینهٔ هر کاربر را کنترل می‌کنند. برای انتشار عمومی، نظارت بر هزینه در داشبورد OpenRouter و تعیین سقف ماهانه توصیه می‌شود.

## افزودن قابلیت هوشمند جدید

1. فایل prompt جدید در `backend/prompts/` بسازید.
2. سرویس قابلیت را در `modules/ai/` بنویسید (با استفاده از prompt-loader، rate-limit، cache و safety).
3. مسیر را در `ai.controller.ts` اضافه کنید.
4. محدودیت آن را در `ai-rate-limit.service.ts` و مدلش را در `model-registry.service.ts` ثبت کنید.
5. در اپ: مسیر در `src/api/endpoints.ts`، تابع در `src/services/ai.service.ts`، هوک در `src/hooks/useAI.ts`.

</div>
