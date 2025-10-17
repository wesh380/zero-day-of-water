import { apiFetch, getBaseUrl } from "/assets/js/api.js";
void getBaseUrl();

export async function askAI(prompt, options = {}) {
  const { json = false, model, config } = options || {};

  if (!prompt || String(prompt).trim().length < 3) {
    const err = new Error('EMPTY_PROMPT');
    err.code = 'empty_prompt';
    throw err;
  }

  let res;
  try {
    const payload = { q: prompt, json: !!json };
    if (model) payload.model = model;
    if (config && typeof config === 'object') payload.config = config;

    res = await apiFetch('/api/gemini', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (networkError) {
    const err = new Error('NETWORK_ERROR');
    err.code = 'NETWORK_ERROR';
    err.cause = networkError;
    throw err;
  }

  const raw = await res.text();
  let body = null;
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const detail = normalizeDetail(body, raw);
    const errCode = mapErrorCode(res.status, detail);
    const message = pickErrorMessage(detail, res.status, errCode);
    const err = new Error(message);
    err.status = res.status;
    err.code = errCode;
    err.detail = detail;
    throw err;
  }

  if (!body || typeof body !== 'object') {
    const err = new Error('INVALID_RESPONSE');
    err.code = 'AI_HTTP_500';
    err.detail = { raw };
    throw err;
  }

  const text = typeof body.text === 'string' ? body.text : '';
  const clean = json ? stripJsonFence(text) : text;
  return clean;
}

function normalizeDetail(body, raw) {
  if (body && typeof body === 'object') {
    return body;
  }
  if (!raw) return {};
  return { message: raw.slice(0, 400) };
}

function mapErrorCode(status, detail) {
  const upstream = (detail?.error || detail?.code || detail?.status || '').toString().toLowerCase();
  if (upstream === 'missing_api_key') return 'missing_api_key';
  if (upstream === 'empty_prompt') return 'empty_prompt';
  if (upstream === 'rate_limit' || status === 429) return 'RATE_LIMIT';
  if (upstream === 'permission_denied' || status === 403) return 'PERMISSION_DENIED';
  if (upstream === 'model_not_found' || status === 404) return 'MODEL_NOT_FOUND';
  if (upstream === 'invalid_request' || status === 400) return 'INVALID_REQUEST';
  if (upstream === 'invalid_api_key' || status === 401) return 'INVALID_API_KEY';
  if (upstream === 'upstream_timeout' || status === 504) return 'AI_HTTP_504';
  if (upstream === 'upstream_unavailable' || status === 503) return 'AI_HTTP_503';
  if (status >= 500) return `AI_HTTP_${status}`;
  return upstream ? upstream.toUpperCase() : `HTTP_${status}`;
}

function pickErrorMessage(detail, status, code) {
  const message = detail?.detail?.message || detail?.message || detail?.error_description;
  if (message && typeof message === 'string') return message;
  if (code === 'missing_api_key') return 'کلید سرویس هوش مصنوعی تنظیم نشده است.';
  if (code === 'RATE_LIMIT') return 'سرویس موقتاً در دسترس نیست، لطفاً دوباره تلاش کنید.';
  if (code === 'NETWORK_ERROR') return 'ارتباط با سرویس برقرار نشد.';
  if (code === 'AI_HTTP_504') return 'مهلت پاسخ‌گویی سرویس به پایان رسید.';
  if (String(code || '').startsWith('AI_HTTP_')) return 'خطای داخلی سرویس هوش مصنوعی رخ داد.';
  return `درخواست با خطای ${status} مواجه شد.`;
}

function stripJsonFence(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

if (typeof window !== 'undefined') {
  window.askAI = askAI;
}
