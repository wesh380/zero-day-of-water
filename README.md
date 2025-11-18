# 💧 wesh360.ir - Agrivoltaics Platform

پلتفرم تحلیل و شبیه‌سازی سیستم‌های Agrivoltaics (کشاورزی + انرژی خورشیدی)

**🌐 Live Demo**: [wesh360.ir](https://wesh360.ir)
**📚 API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**🚀 Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🏗️ Architecture

این پروژه شامل:
- **Frontend**: Static dashboard served from `/docs` (GitHub Pages)
- **Backend**: Serverless functions on Netlify
- **Database**: PostgreSQL on Supabase (Free tier)
- **AI Integration**: Gemini API proxy

---

## Dash application

The interactive dashboards live in `/dash` and are organized by resource type:

```
/dash
  /components       # shared UI pieces
  /pages
    /water
      /water-crisis/water-crisis.js
      /dam-monitoring/dam-monitoring.js
      /bills-tariffs/bills-tariffs.js
      /future-prediction/future-prediction.js
    /electricity/electricity.js
    /gas/gas.js
    /oil/oil.js
```

`/dash/components` contains reusable pieces such as `Card`, `Header`, and `Footer` to avoid code duplication.  Routing is file based; paths mirror their folder names (e.g. `/water/water-crisis`).  New dashboards can be added by creating a folder and descriptive file under `/dash/pages`.

## GitHub Pages

GitHub Pages is configured to deploy the `docs` directory. To use a custom subdomain:

1. Create a `CNAME` DNS record for `dashboard.YOURDOMAIN.ir` pointing to `USERNAME.github.io.`
2. Ensure `/docs/CNAME` contains `dashboard.YOURDOMAIN.ir`.
3. Push to `main`; the GitHub Action will publish the site.

## Serverless proxy

Gemini API calls are routed through a serverless function so the API key is kept server side.

### Netlify (Serverless Function)
- The frontend calls the relative endpoint `/api/gemini`.
- Set `GEMINI_API_KEY` (and optional `PREVIEW_ORIGIN`) in Netlify Environment Variables.
**Post-deploy tests**
```bash
curl -i -X OPTIONS https://wesh360.ir/api/gemini \
  -H "Origin: https://wesh360.ir" \
  -H "Access-Control-Request-Method: POST"

curl -i -X POST https://wesh360.ir/api/gemini \
  -H "Origin: https://wesh360.ir" \
  -H "Content-Type: application/json" \
  --data '{"q":"ping"}'
Expected: 204 for OPTIONS, 200 for POST, and no query ?key= in downstream calls.
```

**Local check (netlify dev)**
```bash
curl -i -X OPTIONS http://localhost:8888/api/gemini \
  -H "Origin: https://wesh360.ir" \
  -H "Access-Control-Request-Method: POST"

curl -i -X POST http://localhost:8888/api/gemini \
  -H "Origin: https://wesh360.ir" \
  -H "Content-Type: application/json" \
  --data '{"q":"ping"}'
```

## 🔗 API Endpoints

Backend serverless functions روی Netlify:

- `POST /save-scenario` - ذخیره scenario در Supabase
- `GET /get-scenario?id={uuid}` - دریافت scenario
- `GET /get-tariff` - دریافت آخرین نرخ‌های برق
- `POST /cld-submit` - ارسال Causal Loop Diagram برای پردازش
- `GET /cld-result?job_id={uuid}` - دریافت نتیجه job
- `POST /api/gemini` - Proxy برای Gemini AI

📖 **مستندات کامل**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 💾 Database Schema (Supabase)

| Table | Description |
|-------|-------------|
| `scenarios` | ذخیره scenario های کاربران (JSONB) |
| `tariffs` | نرخ‌های برق (ppa, buy, sell) |
| `cld_jobs` | Job queue برای Causal Loop Diagrams |
| `cld_results` | نتایج پردازش شده jobs |

---

## 🚀 Quick Start

### پیش‌نیازها
- Node.js 18+
- حساب Netlify (رایگان)
- حساب Supabase (رایگان)

### نصب و راه‌اندازی

```bash
# Clone repository
git clone https://github.com/sajjadzea/zero-day-of-water2.git
cd zero-day-of-water2

# نصب dependencies
npm install

# ساخت فایل‌های dashboard
npm run build:agri && npm run prepare:agri

# ساخت CLD bundle
node scripts/build-cld.js

# اجرا در local (با Netlify Dev)
netlify dev
```

🔧 **Setup کامل**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🧪 Testing

### تست Local Functions

```bash
# Save scenario
curl -X POST http://localhost:8888/.netlify/functions/save-scenario \
  -H "Content-Type: application/json" \
  -d '{"state":{"test":"data"}}'

# Get tariff
curl http://localhost:8888/.netlify/functions/get-tariff
```

### تست Production

```bash
# Replace با URL واقعی
curl https://your-site.netlify.app/.netlify/functions/get-tariff
```

---

## 📊 Tech Stack

- **Frontend**: Vanilla JS, Tailwind CSS
- **Backend**: Netlify Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Hosting**:
  - Frontend: GitHub Pages
  - Functions: Netlify
- **Validation**: Ajv (JSON Schema)

---

## 🌟 Features

- ✅ Scenario management (save/load)
- ✅ Tariff calculations (electricity pricing)
- ✅ Causal Loop Diagram processing
- ✅ AI-powered analysis (Gemini)
- ✅ Real-time job queue system
- ✅ Serverless architecture (zero maintenance)
- ✅ Free tier ready (Netlify + Supabase)

---

## Backlog

- Migrate from `cdn.tailwindcss.com` to CSS compiled with Tailwind CLI at build time
- Add authentication (Supabase Auth)
- Implement rate limiting
- Add monitoring/analytics

## Local Setup, Test, and Deploy

1. **Install dependencies**
   ```bash
   npm i
   ```
2. **Build dashboard and vendor files**
   ```bash
   npm run build:agri && npm run prepare:agri
   ```
3. **Build CLD bundle**
   ```bash
   node scripts/build-cld.js
   ```
   This concatenates CLD scripts and styles into `docs/assets/dist/water-cld.bundle.*`.
3. **Serve locally**
   ```bash
   npx http-server docs -p 8080
   ```
   Visit [http://localhost:8080/solar/agrivoltaics/](http://localhost:8080/solar/agrivoltaics/) and ensure it loads without CSP errors.
4. **Test Netlify functions**
   ```bash
   npx netlify dev
   curl -X POST http://localhost:8888/api/save-scenario -H "Content-Type: application/json" -d '{"state":{"hello":"world"}}'
   curl "http://localhost:8888/api/get-scenario?id=<ID>"
   ```
5. **Deploy**
   Push to `main` to trigger a Deploy Preview and then production.
6. **Troubleshoot CORS**
If the preview throws a CORS error, verify that the origin uses `process.env.URL` or `DEPLOY_PRIME_URL`.

## Netlify Node policy
- Production: Node 18
- Deploy Preview: Node 22 (canary)
- هدف: اطمینان از سازگاری با Node 22 قبل از مهاجرت Production.

## Playwright production smoke tests

برای آزمایش خودکار صفحه‌های اصلی دیپلوی‌شده می‌توانید به [TESTING.md](./TESTING.md) مراجعه کنید. این فایل نحوه نصب Playwright، نحوه اجرای `npx playwright test` و پوشش هر یک از سه spec (smoke، buttons، calculators) را توضیح می‌دهد.

## تنظیمات ویندوز

پس از هر بار به‌روزرسانی فایل `backend/.env` (مثلا تغییر مقادیر ALLOWED_ORIGINS یا مسیرهای دایرکتوری)? سرویس‌های اجرا شده روی ویندوز مانند API و worker را ری‌استارت کنید تا تنظیمات جدید اعمال شود.
