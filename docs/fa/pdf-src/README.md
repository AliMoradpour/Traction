<div dir="rtl">

# منبع PDFهای فارسی

هر فایل `.html` این پوشه یک PDF در `../pdf/` می‌سازد. ظاهر مشترک در `style.css` است و فونت Vazirmatn (مجوز آزاد OFL) در `fonts/`.

## ساخت دوباره

نیاز: Node.js و Google Chrome یا Microsoft Edge.

```bash
node docs/fa/pdf-src/build.mjs                 # همهٔ PDFها
node docs/fa/pdf-src/build.mjs deploy-guide    # فقط یکی
```

## ویرایش

متن را در فایل HTML مربوط تغییر دهید و دوباره بسازید. کد و نشانی‌های لاتین را داخل `<code>` یا `<span class="ltr">` بگذارید تا برعکس نشوند.

</div>
