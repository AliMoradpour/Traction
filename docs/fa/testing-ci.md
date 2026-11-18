<div dir="rtl">

# تست‌ها و CI

## تست‌ها

| بخش | تعداد | فایل‌ها |
|---|---|---|
| سرور | ۱۹ تست | `common/utils/month.spec.ts` (محاسبهٔ ماه)، `admin/admin.service.spec.ts` (آمار ادمین)، `ai/ai.module.spec.ts`، `ai/monthly-review.spec.ts`، `goals/goal-forecast.spec.ts` (پیش‌بینی هدف) |
| اپ | ۱۶ تست | `src/lib/__tests__/dates.test.ts` (تاریخ‌های محلی)، `src/lib/__tests__/apiUrl.test.ts`، `src/api/__tests__/errors.test.ts` |

اجرا:

```bash
cd backend && npm test
cd apps/mobile && npm test
```

### آزمون سرتاسری API

پیش از ادغام شاخهٔ `dev` در `main`، یک اسکریپت سرتاسری ۱۰۲ مسیر API را روی پایگاه دادهٔ واقعی تست کرد (ثبت‌نام، ورود، کارها، هدف‌ها، تمرکز، رفتار، بینش‌ها، اعلان‌ها، بازخورد، دسترسی کاربر دیگر، ادمین و بازنشانی رمز). همه موفق بودند. این اسکریپت هنوز در مخزن نیست؛ افزودنش به `backend/test/` و CI در فهرست کارهای پیشنهادی است.

## CI (GitHub Actions)

فایل: `.github/workflows/ci.yml`. روی هر push به `main` و `dev` و هر Pull Request اجرا می‌شود.

**کار Backend** (با یک PostgreSQL 17 موقت):
1. `npm ci`
2. `npx prisma generate`
3. اعمال مهاجرت‌ها روی پایگاه دادهٔ خالی
4. بررسی یکی بودن مهاجرت‌ها و schema
5. بررسی تایپ (`tsc --noEmit`)
6. Lint
7. تست‌ها
8. ساخت (build)

**کار Mobile:**
1. `npm ci`
2. بررسی تایپ
3. Lint
4. تست‌ها

نتیجه را در تب **Actions** مخزن گیت‌هاب ببینید. اگر تیک سبز نبود، پیش از ادغام درستش کنید.

## بررسی‌های پیش از کامیت

```bash
cd backend && npx tsc --noEmit && npx eslint "src/**/*.ts" && npm test
cd apps/mobile && npx tsc --noEmit && npm run lint && npm test
```

Lint اپ هنوز حدود ۱۴۶ هشدار دارد (خطا صفر)؛ بیشتر متغیرهای بلااستفاده و `any` در صفحه‌های قدیمی.

</div>
