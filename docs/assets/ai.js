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

const CACHE_TTL_MS = 10 * 60 * 1000;

function toHash(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() > parsed.exp) return null;
    return parsed.value;
  } catch (_) {
    return null;
  }
}

function writeCache(key, value) {
  try {
    const payload = { value, exp: Date.now() + CACHE_TTL_MS };
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch (_) {
    // ignore cache write failures
  }
}

// تابع اصلی برای فراخوانی API بدون retry برای 429/quota
async function fetchWithSingleAttempt(path, options = {}, { signal } = {}) {
  const mergedOptions = { ...options, signal };
  const res = await apiFetch(path, mergedOptions);
  const text = await res.text();

  if (res.ok) {
    const out = JSON.parse(text);
    return out?.text ?? '';
  }

  let detail;
  try { detail = JSON.parse(text); } catch { detail = { raw: text }; }

  if (res.status === 429 || detail?.error === 'quota_exhausted') {
    throw new Error('AI_QUOTA');
  }

  const msg = `AI_HTTP_${res.status}: ${detail?.error || detail?.status || ''} ${detail?.detail?.message || ''}`.trim();
  throw new Error(msg);
}

export async function askAI(prompt, { json = false, model = null, signal } = {}) {
  if (!prompt || String(prompt).trim().length < 3) {
    throw new Error('EMPTY_PROMPT');
  }

  const cacheKey = `ai_cache_${toHash(`${prompt}|${json ? '1' : '0'}|${model || ''}`)}`;
  const cached = typeof sessionStorage !== 'undefined' ? readCache(cacheKey) : null;
  if (cached) return cached;

  // استفاده از rate limiter
  return rateLimiter.execute(async () => {
    const requestBody = { prompt, json: !!json };

    if (model) {
      requestBody.model = model;
    }

    const result = await fetchWithSingleAttempt('/api/gemini', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal
    }, { signal });

    if (typeof sessionStorage !== 'undefined') {
      writeCache(cacheKey, result);
    }

    return result;
  });
}

if (typeof window !== 'undefined') {
  window.askAI = askAI;
}
