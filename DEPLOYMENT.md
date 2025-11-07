# 🚀 راهنمای Deployment

راهنمای کامل برای deploy کردن wesh360.ir با Supabase + Netlify

---

## 📋 پیش‌نیازها

- ✅ حساب کاربری GitHub
- ✅ حساب کاربری Netlify (رایگان)
- ✅ حساب کاربری Supabase (رایگان)
- ✅ Node.js 18+ نصب شده (برای development)

---

## 🗄️ بخش 1: راه‌اندازی Supabase

### گام 1: ساخت پروژه Supabase

1. برو به: https://supabase.com
2. کلیک کن روی **"Start your project"**
3. Login کن با GitHub
4. کلیک کن روی **"New Project"**
5. پر کن:
   - **Name**: `wesh360` (یا هر اسم دیگه‌ای)
   - **Database Password**: یه رمز قوی بساز و **ذخیرش کن**
   - **Region**: **Southeast Asia (Singapore)** (نزدیک‌ترین به ایران)
   - **Pricing Plan**: **Free**
6. کلیک کن روی **"Create new project"**
7. صبر کن ~2 دقیقه تا پروژه آماده بشه

### گام 2: اجرای Migration SQL

1. وقتی پروژه آماده شد، برو به **SQL Editor** (منوی چپ)
2. کلیک کن روی **"New query"**
3. کپی کن محتویات فایل `supabase-migration.sql` از repository
4. Paste کن در SQL Editor
5. کلیک کن روی **"Run"** (یا `Ctrl+Enter`)
6. باید پیام موفقیت ببینی

### گام 3: بررسی جداول

1. برو به **Table Editor** (منوی چپ)
2. باید این 4 جدول رو ببینی:
   - ✅ `scenarios`
   - ✅ `tariffs`
   - ✅ `cld_jobs`
   - ✅ `cld_results`

### گام 4: دریافت API Keys

1. برو به **Settings** → **API**
2. کپی کن و **ذخیره کن**:
   - **Project URL**: مثلاً `https://abc123.supabase.co`
   - **anon public key**: یه key طولانی که با `eyJ` شروع میشه

⚠️ **مهم**: `service_role` key رو **در frontend استفاده نکن**!

---

## 🌐 بخش 2: راه‌اندازی Netlify

### گام 1: Fork/Clone Repository

1. Fork کن repository رو به حساب GitHub خودت
2. یا Clone کن:
```bash
git clone https://github.com/YOUR-USERNAME/zero-day-of-water2.git
cd zero-day-of-water2
```

### گام 2: اتصال به Netlify

1. برو به: https://app.netlify.com
2. Login کن با GitHub
3. کلیک کن روی **"Add new site"** → **"Import an existing project"**
4. انتخاب کن **GitHub**
5. انتخاب کن repository: `zero-day-of-water2`
6. تنظیمات build:
   - **Build command**: `npm run build` (اگه داری)
   - **Publish directory**: `dist` یا `public` (اگه داری)
7. کلیک کن روی **"Deploy site"**

### گام 3: تنظیم Environment Variables

1. بعد از اولین deploy، برو به **Site configuration** → **Environment variables**
2. کلیک کن روی **"Add a variable"**
3. اضافه کن:

```
Key: SUPABASE_URL
Value: https://YOUR-PROJECT.supabase.co
Scopes: All scopes
Deploy contexts: All deploy contexts
```

```
Key: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Scopes: All scopes
Deploy contexts: All deploy contexts
```

4. کلیک کن روی **"Save"**

### گام 4: Trigger Deploy جدید

بعد از تنظیم env variables:

1. برو به **Deploys**
2. کلیک کن روی **"Trigger deploy"** → **"Deploy site"**
3. صبر کن تا deploy تموم بشه (~2-3 دقیقه)

---

## 🧪 بخش 3: تست Deployment

بعد از تموم شدن deploy، URL سایت رو پیدا کن (مثلاً `https://your-site.netlify.app`)

### تست 1: Save Scenario

```bash
curl -X POST "https://your-site.netlify.app/.netlify/functions/save-scenario" \
  -H "Content-Type: application/json" \
  -d '{"state": {"test": "deployment"}}'
```

انتظار: `{"ok":true,"id":"uuid-here"}`

### تست 2: Get Tariff

```bash
curl "https://your-site.netlify.app/.netlify/functions/get-tariff"
```

انتظار: `{"ppa":2500,"buy":3000,"sell":2200}`

### تست 3: CLD Submit

```bash
curl -X POST "https://your-site.netlify.app/.netlify/functions/cld-submit" \
  -H "Content-Type: application/json" \
  -d '{"nodes":[{"id":"n1","label":"Test"}],"edges":[{"source":"n1","target":"n1","sign":"plus"}],"meta":{"model_id":"test"}}'
```

انتظار: `{"job_id":"uuid-here","status":"queued"}`

✅ اگه همه تست‌ها موفق بودن، deployment کامل شده!

---

## 🔄 بخش 4: CI/CD Workflow

Netlify به صورت خودکار deploy می‌کنه:

### Auto-Deploy Triggers:

- ✅ هر push به branch `main` → Production deploy
- ✅ هر push به branch دیگه → Preview deploy
- ✅ هر Pull Request → Preview deploy

### Manual Deploy:

```bash
# نصب Netlify CLI (اختیاری)
npm install -g netlify-cli

# Login
netlify login

# Deploy manual
netlify deploy --prod
```

---

## 📊 بخش 5: Monitoring

### Netlify Functions Logs

1. برو به Netlify Dashboard
2. **Functions** → انتخاب کن function
3. ببین **Recent invocations** و **Logs**

### Supabase Logs

1. برو به Supabase Dashboard
2. **Logs** → انتخاب کن **Postgres Logs** یا **API Logs**
3. فیلتر کن based on severity

### Alerts

در Netlify:
- **Deploy Notifications**: Settings → Deploy notifications
- **Build hooks**: Settings → Build & deploy → Build hooks

---

## 🐛 Troubleshooting

### مشکل: "Function not found"

**علت**: Function deploy نشده

**راه‌حل**:
1. چک کن که فایل در `netlify/functions/` هست
2. Trigger کن deploy جدید
3. چک کن Netlify build logs

### مشکل: "Access denied" از Supabase

**علت**: RLS فعاله یا env variables اشتباه

**راه‌حل**:
1. چک کن env variables در Netlify
2. اجرا کن:
```sql
ALTER TABLE scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE tariffs DISABLE ROW LEVEL SECURITY;
ALTER TABLE cld_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE cld_results DISABLE ROW LEVEL SECURITY;
```

### مشکل: "Invalid JSON Schema"

**علت**: Schema version incompatibility

**راه‌حل**: مطمئن شو که schema از `draft-07` استفاده می‌کنه:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

---

## 🔐 Security Best Practices

### ❌ هیچوقت commit نکن:
- `.env` files
- `service_role` key
- Database passwords
- API secrets

### ✅ همیشه استفاده کن:
- Environment variables در Netlify
- `anon` key برای public API
- HTTPS برای تمام requests
- CORS policy برای محدود کردن origins

---

## 💰 Cost Estimation

### Netlify Free Tier:
- ✅ 125,000 function invocations/month
- ✅ 100 GB bandwidth
- ✅ Automatic HTTPS
- 💡 بعد از محدودیت: $19/month (Pro plan)

### Supabase Free Tier:
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ Unlimited API requests
- 💡 بعد از محدودیت: $25/month (Pro plan)

### Total Monthly Cost:
- **شروع**: $0/month (Free tiers)
- **با traffic بالا**: $19-44/month

---

## 🚀 Next Steps

بعد از deployment موفق:

1. ✅ **تست کامل**: تمام features رو تست کن
2. ✅ **Custom Domain**: اضافه کن domain خودت در Netlify
3. ✅ **Analytics**: فعال کن Netlify Analytics
4. ✅ **Backup**: تنظیم کن Supabase automated backups
5. ✅ **Monitoring**: راه‌اندازی کن error tracking (مثلاً Sentry)

---

## 📞 Support

اگه مشکلی داشتی:
- 📚 مستندات: `API_DOCUMENTATION.md`
- 🐛 Issues: GitHub Issues
- 📧 Email: support@wesh360.ir

---

**تاریخ به‌روزرسانی**: 2025-11-07
**نسخه**: 1.0
