import { apiFetch, getBaseUrl } from "/assets/js/api.js";
void getBaseUrl();

// Rate limiter: محدود کردن تعداد درخواست‌های همزمان
class RateLimiter {
  constructor(maxConcurrent = 2, minDelay = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.minDelay = minDelay;
    this.queue = [];
    this.running = 0;
    this.lastRequestTime = 0;
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minDelay) {
      setTimeout(() => this.processQueue(), this.minDelay - timeSinceLastRequest);
      return;
    }

    const { fn, resolve, reject } = this.queue.shift();
    this.running++;
    this.lastRequestTime = Date.now();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      setTimeout(() => this.processQueue(), this.minDelay);
    }
  }
}

const rateLimiter = new RateLimiter(2, 1500); // حداکثر 2 درخواست همزمان با حداقل 1.5 ثانیه فاصله

// Helper function برای sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// تابع اصلی برای فراخوانی API با retry logic
async function fetchWithRetry(path, options, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await apiFetch(path, options);
      const text = await res.text();

      // اگر درخواست موفق بود
      if (res.ok) {
        const out = JSON.parse(text);
        return out?.text ?? '';
      }

      // پردازش خطا
      let detail;
      try { detail = JSON.parse(text); } catch { detail = { raw: text }; }

      // اگر خطای 429 (Rate Limit) است
      if (res.status === 429) {
        // استخراج زمان انتظار از پیام خطا
        const retryMatch = text.match(/retry in ([\d.]+)/i);
        const retryAfter = retryMatch ? parseFloat(retryMatch[1]) * 1000 : Math.pow(2, attempt) * 2000;

        console.warn(`⏳ Rate limit reached. Waiting ${(retryAfter/1000).toFixed(1)}s before retry (attempt ${attempt + 1}/${maxRetries})...`);

        if (attempt < maxRetries - 1) {
          await sleep(retryAfter);
          continue;
        }
      }

      // سایر خطاها
      const msg = `AI_HTTP_${res.status}: ${detail?.error || detail?.status || ''} ${detail?.detail?.message || ''}`.trim();
      lastError = new Error(msg);

      // فقط برای خطاهای 429 و 5xx retry می‌کنیم
      if (res.status !== 429 && res.status < 500) {
        throw lastError;
      }

      if (attempt < maxRetries - 1) {
        const backoffDelay = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️ Request failed with status ${res.status}. Retrying in ${backoffDelay/1000}s...`);
        await sleep(backoffDelay);
      }

    } catch (error) {
      lastError = error;

      // اگر خطای شبکه است و این آخرین تلاش نیست
      if (attempt < maxRetries - 1 && (error.message.includes('fetch') || error.message.includes('network'))) {
        const backoffDelay = Math.pow(2, attempt) * 1000;
        console.warn(`🔌 Network error. Retrying in ${backoffDelay/1000}s...`);
        await sleep(backoffDelay);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export async function askAI(prompt, { json = false, model = null, maxRetries = 3 } = {}) {
  if (!prompt || String(prompt).trim().length < 3) {
    throw new Error('EMPTY_PROMPT');
  }

  // استفاده از rate limiter
  return rateLimiter.execute(async () => {
    const requestBody = { prompt, json: !!json };

    if (model) {
      requestBody.model = model;
    }

    return fetchWithRetry('/api/gemini', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody)
    }, maxRetries);
  });
}

if (typeof window !== 'undefined') {
  window.askAI = askAI;
}
