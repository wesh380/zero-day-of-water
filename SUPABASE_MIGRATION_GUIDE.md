# 🚀 راهنمای کامل Migration به Supabase

این راهنما گام‌به‌گام نحوه انتقال backend از FastAPI + File-based به Supabase + Netlify Functions رو توضیح میده.

---

## 📋 فهرست

1. [پیش‌نیازها](#پیش‌نیازها)
2. [مرحله 1: ساخت پروژه Supabase](#مرحله-1-ساخت-پروژه-supabase)
3. [مرحله 2: اجرای Migration SQL](#مرحله-2-اجرای-migration-sql)
4. [مرحله 3: تنظیم Environment Variables](#مرحله-3-تنظیم-environment-variables)
5. [مرحله 4: Deploy و Test](#مرحله-4-deploy-و-test)
6. [مرحله 5: Migration داده‌های موجود (اختیاری)](#مرحله-5-migration-داده‌های-موجود)
7. [خاموش کردن سرور FastAPI](#خاموش-کردن-سرور-fastapi)
8. [Rollback Plan](#rollback-plan)
9. [FAQ](#faq)

---

## پیش‌نیازها

- ✅ حساب کاربری Supabase (رایگان): https://supabase.com
- ✅ دسترسی به Netlify Dashboard
- ✅ دسترسی به repository و توانایی deploy

---

## مرحله 1: ساخت پروژه Supabase

### 1.1. ساخت حساب Supabase
1. برو به https://supabase.com
2. روی **"Start your project"** کلیک کن
3. با GitHub یا email ثبت‌نام کن

### 1.2. ساخت پروژه جدید
1. روی **"New Project"** کلیک کن
2. اطلاعات زیر رو وارد کن:
   - **Name**: `wesh360` (یا هر اسم دیگه‌ای)
   - **Database Password**: یه رمز قوی بساز و **ذخیرش کن**
   - **Region**: **Southeast Asia (Singapore)** یا نزدیک‌ترین region به ایران
   - **Pricing Plan**: **Free** (رایگان)
3. روی **"Create new project"** کلیک کن
4. صبر کن تا پروژه آماده بشه (~2 دقیقه)

### 1.3. دریافت API Keys
وقتی پروژه آماده شد:
1. برو به **Settings** (منوی چپ) → **API**
2. اطلاعات زیر رو کپی کن و **جایی امن ذخیرشون کن**:
   - **Project URL**: مثلاً `https://abc123xyz.supabase.co`
   - **anon/public key**: یه key طولانی که با `eyJ` شروع میشه
   - **service_role key**: یه key دیگه (فقط برای backend!)

⚠️ **مهم**: هیچ‌وقت `service_role` key رو در frontend expose نکن!

---

## مرحله 2: اجرای Migration SQL

### 2.1. باز کردن SQL Editor
1. در Supabase Dashboard، برو به **SQL Editor** (منوی چپ)
2. روی **"New query"** کلیک کن

### 2.2. اجرای Migration Script
1. محتویات فایل `supabase-migration.sql` رو کپی کن
2. در SQL Editor paste کن
3. روی **"Run"** یا `Ctrl+Enter` کلیک کن
4. اگه همه چیز درست باشه، باید پیام موفقیت ببینی

### 2.3. بررسی جداول
1. برو به **Table Editor** (منوی چپ)
2. باید این جداول رو ببینی:
   - ✅ `scenarios`
   - ✅ `tariffs`
   - ✅ `cld_jobs`
   - ✅ `cld_results`

اگه جداول رو دیدی، یعنی migration موفق بوده! ✅

---

## مرحله 3: تنظیم Environment Variables

### 3.1. تنظیم در Netlify

1. برو به Netlify Dashboard
2. پروژه `wesh360` رو انتخاب کن
3. برو به **Site settings** → **Environment variables**
4. این متغیرها رو اضافه کن:

```bash
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **مهم**:
- مقادیر رو از قسمت **API Settings** در Supabase کپی کن
- حتماً `SUPABASE_ANON_KEY` استفاده کن، **نه** `service_role`!

### 3.2. تنظیم برای Local Development (اختیاری)

اگه می‌خوای local test کنی:

```bash
# در root پروژه
cp .env.example .env
```

بعد فایل `.env` رو باز کن و اضافه کن:

```bash
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## مرحله 4: Deploy و Test

### 4.1. Deploy به Netlify

کدها رو commit و push کن:

```bash
git add .
git commit -m "feat: migrate to Supabase backend"
git push origin YOUR-BRANCH
```

Netlify به‌طور خودکار deploy رو شروع می‌کنه.

### 4.2. بررسی Deploy

1. برو به Netlify Dashboard → **Deploys**
2. منتظر بمون تا deploy تموم بشه (معمولاً 2-3 دقیقه)
3. اگه موفق بود، رنگ سبز میشه ✅

### 4.3. تست API Endpoints

#### تست 1: ذخیره Scenario
```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/save-scenario \
  -H "Content-Type: application/json" \
  -d '{"state": {"test": "data"}}'
```

انتظار داری یه response مثل این ببینی:
```json
{"ok": true, "id": "uuid-here"}
```

#### تست 2: دریافت Scenario
```bash
curl https://YOUR-SITE.netlify.app/.netlify/functions/get-scenario?id=UUID-FROM-STEP-1
```

انتظار داری:
```json
{"test": "data"}
```

#### تست 3: Submit یک CLD Job
```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/cld-submit \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [{"id": "n1", "label": "Node 1"}],
    "edges": [{"source": "n1", "target": "n1", "sign": "plus"}],
    "meta": {"model_id": "test"}
  }'
```

انتظار داری:
```json
{"job_id": "uuid-here", "status": "queued"}
```

#### تست 4: دریافت نتیجه Job

صبر کن 1-2 دقیقه (تا worker اجرا بشه)، بعد:

```bash
curl https://YOUR-SITE.netlify.app/.netlify/functions/cld-result?job_id=JOB-ID-FROM-STEP-3
```

انتظار داری:
```json
{
  "job_id": "uuid-here",
  "status": "done",
  "result": {
    "job_id": "...",
    "generated_at": "2025-11-07T...",
    "summary": {
      "nodes": 1,
      "edges": 1,
      "has_meta": true,
      "model_id": "test"
    }
  }
}
```

اگه همه تست‌ها موفق بودن، Migration کامل شده! 🎉

---

## مرحله 5: Migration داده‌های موجود

اگه داده‌های موجود داری (scenarios یا tariffs در Netlify Blobs):

### 5.1. Export از Netlify Blobs

متأسفانه Netlify Blobs ابزار export مستقیم نداره. باید یه script بنویسی:

```javascript
// scripts/export-blobs.js
const { getStore } = require("@netlify/blobs");

async function exportScenarios() {
  const store = getStore("agrivoltaics");

  // لیست همه scenarios
  const { blobs } = await store.list();

  for (const blob of blobs) {
    if (blob.key.startsWith("scenario:")) {
      const data = await store.get(blob.key, { type: "json" });
      console.log(JSON.stringify({ key: blob.key, data }));
    }
  }
}

exportScenarios();
```

اجرا:
```bash
node scripts/export-blobs.js > exported-scenarios.jsonl
```

### 5.2. Import به Supabase

بعد از export، می‌تونی از Supabase Dashboard یا یه script استفاده کنی:

```javascript
// scripts/import-to-supabase.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function importScenarios() {
  const lines = fs.readFileSync('exported-scenarios.jsonl', 'utf-8').split('\n');

  for (const line of lines) {
    if (!line) continue;
    const { key, data } = JSON.parse(line);
    const id = key.replace('scenario:', '');

    await supabase.from('scenarios').insert({ id, state: data });
    console.log(`Imported scenario: ${id}`);
  }
}

importScenarios();
```

---

## خاموش کردن سرور FastAPI

بعد از اینکه مطمئن شدی همه چیز کار می‌کنه:

1. ✅ همه تست‌ها موفق بودن
2. ✅ Production traffic رو monitor کردی (حداقل 1 هفته)
3. ✅ هیچ error گزارش نشده

می‌تونی سرور FastAPI (`api.wesh360.ir`) رو خاموش کنی:

```bash
# روی سرور FastAPI
systemctl stop wesh360-api
systemctl disable wesh360-api
```

**💰 صرفه‌جویی**: الان دیگه نیازی به پرداخت هزینه سرور نداری!

---

## Rollback Plan

اگه مشکلی پیش اومد و خواستی برگردی به FastAPI:

### سناریو 1: مشکل کوچک (یه endpoint کار نمی‌کنه)

فایل‌های backup رو restore کن:

```bash
# مثلاً برای save-scenario
cp netlify/functions/save-scenario.js.backup netlify/functions/save-scenario.js
git commit -am "rollback: restore save-scenario to Netlify Blobs"
git push
```

### سناریو 2: مشکل بزرگ (کل سیستم کار نمی‌کنه)

1. سرور FastAPI رو دوباره روشن کن:
   ```bash
   systemctl start wesh360-api
   ```

2. Redirect API رو به سرور قدیم برگردون در `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://api.wesh360.ir/:splat"
     status = 200
   ```

3. Environment variables Supabase رو حذف کن از Netlify

---

## FAQ

### سوال: چرا worker هر 1 دقیقه اجرا میشه؟ آیا نمی‌شه سریع‌تر؟

**جواب**: Netlify Scheduled Functions محدودیت داره و نمی‌تونی هر ثانیه اجرا کنی. اگه نیاز به real-time processing داری، باید از:
- Supabase Edge Functions با Database Triggers
- یا Upstash QStash استفاده کنی

### سوال: محدودیت 125k function calls/ماه چطور؟

**جواب**: با این معماری:
- هر job submit: 1 call
- هر result check: 1 call
- Worker: 43,200 calls/ماه (هر دقیقه × 30 روز)

Total: ~50k calls/ماه + traffic شما

اگه بیشتر شد، باید upgrade کنی به Netlify Pro ($19/ماه).

### سوال: Supabase Free Tier چقدر storage داره؟

**جواب**: 500MB database + 1GB file storage. برای شروع کافیه.

### سوال: آیا می‌تونم Supabase رو فقط برای database استفاده کنم ولی FastAPI رو نگه دارم؟

**جواب**: بله! می‌تونی یه hybrid architecture داشته باشی:
- Scenarios/Tariffs → Supabase
- CLD Processing → FastAPI (روی Fly.io رایگان)

### سوال: اگه بخوام real-time updates داشته باشم چی؟

**جواب**: Supabase Realtime subscriptions داره:

```javascript
const subscription = supabase
  .from('cld_jobs')
  .on('UPDATE', payload => {
    console.log('Job updated:', payload.new)
  })
  .subscribe()
```

---

## 🎯 خلاصه

✅ **چیزایی که انجام دادیم:**
1. ✅ Database PostgreSQL با Supabase
2. ✅ Migration از file-based به database
3. ✅ همه Functions به Supabase connect شدن
4. ✅ Worker برای پردازش jobs
5. ✅ Backup از کدهای قدیمی

✅ **مزایا:**
- 💰 صرفه‌جویی هزینه (سرور FastAPI دیگه لازم نیست)
- 🚀 Auto-scaling
- 📊 Query و Analytics راحت‌تر
- 🔒 Backup خودکار
- 🎨 Dashboard برای مدیریت

⚠️ **محدودیت‌ها:**
- Worker latency: 1 دقیقه (بجای 1 ثانیه)
- Function calls limit: 125k/ماه
- Database size: 500MB (free tier)

---

## 📞 پشتیبانی

اگه مشکلی داشتی:
1. چک کن Netlify Function Logs
2. چک کن Supabase Logs (در Dashboard)
3. بررسی کن Environment Variables درست setشده باشن

موفق باشی! 🚀
