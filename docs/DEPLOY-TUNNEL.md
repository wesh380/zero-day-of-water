# راهنمای استقرار تونل موقت

## تنظیم آدرس API
- اگر دامنه‌ی اختصاصی در دسترس نیست، مقدار `baseUrl` در `docs/config/api.json` را روی آدرس تونل (مانند `https://filing-mere-plays-jobs.trycloudflare.com`) ست کنید و سایت را مجدد منتشر کنید.

## ری‌استارت سرویس‌ها روی ویندوز
```
"C:\ProgramData\chocolatey\bin\nssm.exe" restart wesh-api
"C:\ProgramData\chocolatey\bin\nssm.exe" restart wesh-worker
```

## تست‌های پس از تغییر
```
powershell -ExecutionPolicy Bypass -File repo/backend/scripts/check-site-config.ps1
powershell -ExecutionPolicy Bypass -File repo/backend/scripts/check-api.ps1 -BaseUrl "https://filing-mere-plays-jobs.trycloudflare.com"
```

## مهاجرت به https://api.wesh360.ir
- پس از آماده شدن DNS، مقدار `baseUrl` در `docs/config/api.json` را به `https://api.wesh360.ir` تغییر دهید.
- در فایل `.env` بک‌اند مقدار `ALLOWED_ORIGINS` را به‌روزرسانی کنید و اوریجین جدید را اضافه کنید؛ سپس سرویس‌ها را ری‌استارت کنید.
