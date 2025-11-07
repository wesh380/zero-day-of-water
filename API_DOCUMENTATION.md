# 📚 API Documentation - wesh360.ir

مستندات کامل API endpoints پروژه wesh360 (Agrivoltaics Platform)

**Base URL Production**: `https://polite-zuccutto-cdf931.netlify.app/.netlify/functions/`

---

## 🔗 Endpoints

### 1. Save Scenario

ذخیره یک scenario در database.

**Endpoint**: `POST /save-scenario`

**Request Body**:
```json
{
  "state": {
    "key": "value",
    "nested": {
      "data": "example"
    }
  }
}
```

**Response** (Success - 200):
```json
{
  "ok": true,
  "id": "uuid-v4-here"
}
```

**Response** (Error - 400):
```json
{
  "error": "invalid_json"
}
```

**مثال با curl**:
```bash
curl -X POST "https://your-site.netlify.app/.netlify/functions/save-scenario" \
  -H "Content-Type: application/json" \
  -d '{"state": {"irrigation": "drip", "panels": 100}}'
```

---

### 2. Get Scenario

دریافت یک scenario با ID.

**Endpoint**: `GET /get-scenario?id={uuid}`

**Query Parameters**:
- `id` (required): UUID scenario

**Response** (Success - 200):
```json
{
  "key": "value",
  "nested": {
    "data": "example"
  }
}
```

**Response** (Error - 404):
```json
{
  "error": "not_found"
}
```

**مثال با curl**:
```bash
curl "https://your-site.netlify.app/.netlify/functions/get-scenario?id=abc-123-def"
```

---

### 3. Get Tariff

دریافت آخرین نرخ‌های برق.

**Endpoint**: `GET /get-tariff`

**Response** (Success - 200):
```json
{
  "ppa": 2500,
  "buy": 3000,
  "sell": 2200
}
```

**توضیحات فیلدها**:
- `ppa`: نرخ خرید برق از کشاورز (ریال/کیلووات‌ساعت)
- `buy`: نرخ خرید برق از شبکه (ریال/کیلووات‌ساعت)
- `sell`: نرخ فروش برق به شبکه (ریال/کیلووات‌ساعت)

**مثال با curl**:
```bash
curl "https://your-site.netlify.app/.netlify/functions/get-tariff"
```

---

### 4. CLD Submit

ارسال یک Causal Loop Diagram برای پردازش.

**Endpoint**: `POST /cld-submit`

**Request Body**:
```json
{
  "nodes": [
    {
      "id": "n1",
      "label": "Variable 1"
    },
    {
      "id": "n2",
      "label": "Variable 2"
    }
  ],
  "edges": [
    {
      "source": "n1",
      "target": "n2",
      "sign": "plus"
    }
  ],
  "meta": {
    "model_id": "agrivoltaics_v1",
    "version": "1.0"
  }
}
```

**Validation Rules**:
- `nodes`: باید حداقل 1 node داشته باشه
- `edges`: باید حداقل 1 edge داشته باشه
- `sign`: فقط `"plus"` یا `"minus"`
- `meta.model_id`: الزامیه

**Response** (Success - 200):
```json
{
  "job_id": "uuid-v4-here",
  "status": "queued"
}
```

**Response** (Error - 400):
```json
{
  "error": "validation_failed",
  "details": [
    {
      "message": "must have required property 'meta'",
      "instancePath": ""
    }
  ]
}
```

**مثال با curl**:
```bash
curl -X POST "https://your-site.netlify.app/.netlify/functions/cld-submit" \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [{"id": "irrigation", "label": "Irrigation"}],
    "edges": [{"source": "irrigation", "target": "irrigation", "sign": "plus"}],
    "meta": {"model_id": "test"}
  }'
```

---

### 5. CLD Result

دریافت وضعیت و نتیجه یک job.

**Endpoint**: `GET /cld-result?job_id={uuid}`

**Query Parameters**:
- `job_id` (required): UUID job که از `/cld-submit` دریافت شده

**Response** (Success - 200, Job در حال انتظار):
```json
{
  "job_id": "uuid-here",
  "status": "queued"
}
```

**Response** (Success - 200, Job در حال پردازش):
```json
{
  "job_id": "uuid-here",
  "status": "processing"
}
```

**Response** (Success - 200, Job تکمیل شده):
```json
{
  "job_id": "uuid-here",
  "status": "done",
  "result": {
    "job_id": "uuid-here",
    "generated_at": "2025-11-07T10:30:00Z",
    "summary": {
      "nodes": 2,
      "edges": 1,
      "has_meta": true,
      "model_id": "agrivoltaics_v1"
    }
  }
}
```

**Response** (Error - 404):
```json
{
  "error": "not_found"
}
```

**مثال با curl**:
```bash
curl "https://your-site.netlify.app/.netlify/functions/cld-result?job_id=abc-123-def"
```

---

## 🔄 CLD Job Lifecycle

```
1. Submit Job → status: "queued"
   ↓
2. Worker picks up job → status: "processing"
   ↓
3. Processing complete → status: "done" + result
```

**توجه**: Worker هر 1 دقیقه یکبار اجرا می‌شه، پس ممکنه تا 60 ثانیه طول بکشه تا job پردازش بشه.

---

## 🔒 CORS Policy

همه endpoints از CORS پشتیبانی می‌کنن:

**Allowed Origins**:
- `https://wesh360.ir`
- `https://www.wesh360.ir`
- Netlify preview URLs

**Allowed Methods**: `GET`, `POST`, `OPTIONS`

---

## 📊 Rate Limits

**Netlify Free Tier**:
- 125,000 function invocations/month
- بعد از این محدودیت، باید upgrade کنی به Netlify Pro

**Supabase Free Tier**:
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth/month

---

## ⚠️ Error Codes

| Status Code | معنی |
|-------------|------|
| 200 | موفقیت‌آمیز |
| 400 | خطای validation یا JSON نامعتبر |
| 404 | Resource پیدا نشد |
| 405 | Method غیرمجاز (فقط GET یا POST) |
| 500 | خطای سرور |

---

## 🧪 نمونه کد JavaScript

### Save و Get Scenario

```javascript
// Save scenario
const saveScenario = async (state) => {
  const response = await fetch('/.netlify/functions/save-scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state })
  });
  const { id } = await response.json();
  return id;
};

// Get scenario
const getScenario = async (id) => {
  const response = await fetch(`/.netlify/functions/get-scenario?id=${id}`);
  return await response.json();
};

// استفاده
const state = { irrigation: 'drip', panels: 100 };
const id = await saveScenario(state);
console.log('Saved with ID:', id);

const loadedState = await getScenario(id);
console.log('Loaded state:', loadedState);
```

### Submit CLD Job

```javascript
const submitCLD = async (diagram) => {
  const response = await fetch('/.netlify/functions/cld-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diagram)
  });
  const { job_id } = await response.json();
  return job_id;
};

// Poll برای نتیجه
const waitForResult = async (jobId, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/.netlify/functions/cld-result?job_id=${jobId}`);
    const data = await response.json();

    if (data.status === 'done') {
      return data.result;
    }

    if (data.status === 'failed') {
      throw new Error('Job failed');
    }

    // صبر 5 ثانیه
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('Timeout waiting for result');
};

// استفاده
const diagram = {
  nodes: [{ id: 'n1', label: 'Water' }],
  edges: [{ source: 'n1', target: 'n1', sign: 'plus' }],
  meta: { model_id: 'test' }
};

const jobId = await submitCLD(diagram);
const result = await waitForResult(jobId);
console.log('Result:', result);
```

---

## 🛠️ Troubleshooting

### خطا: "Access denied"

**علت**: RLS (Row Level Security) در Supabase فعاله.

**راه‌حل**:
```sql
ALTER TABLE scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE tariffs DISABLE ROW LEVEL SECURITY;
ALTER TABLE cld_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE cld_results DISABLE ROW LEVEL SECURITY;
```

### خطا: "Missing Supabase credentials"

**علت**: Environment variables تنظیم نشدن.

**راه‌حل**: در Netlify Dashboard → Environment Variables اضافه کن:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### خطا: "validation_failed"

**علت**: Request body schema رو رعایت نکرده.

**راه‌حل**: مطابق با JSON Schema در بالا request بفرست.

---

## 📞 Support

اگه مشکلی داشتی:
1. چک کن Netlify Function Logs
2. چک کن Supabase Logs در Dashboard
3. بررسی کن Environment Variables درست set شده باشن

---

**تاریخ به‌روزرسانی**: 2025-11-07
**نسخه API**: 1.0
