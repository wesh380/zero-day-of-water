// استفاده از مدل جدید Gemini 2.5 Flash - پایدار و سریع
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ALLOWED_ORIGIN_HOST = 'wesh360.ir';
const DEFAULT_ALLOWED_ORIGIN = `https://${ALLOWED_ORIGIN_HOST}`;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimiter = new Map();

export async function handler(event) {
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 8)}`;
  const headers = event.headers || {};
  const ip = extractIp(headers);
  const path = event.path || event.rawUrl || '';
  const originHeader = pickAllowedOrigin(headers);

  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return send(500, { error: 'missing_api_key' }, { ip, path, requestId, origin: originHeader });

  if (!isAllowedOrigin(headers)) {
    return send(429, { error: 'blocked_origin', requestId }, { ip, path, requestId, origin: originHeader });
  }

  if (!consumeRateLimit(ip)) {
    return send(429, { error: 'rate_limited', requestId }, { ip, path, requestId, origin: originHeader });
  }

  let bodyIn = {};
  try { bodyIn = JSON.parse(event.body || '{}'); } catch {}
  const { prompt, json } = bodyIn;
  if (!prompt || String(prompt).trim().length < 3) {
    return send(400, { error: 'empty_prompt', requestId }, { ip, path, requestId, origin: originHeader });
  }

  // فقط از مدل سمت سرور استفاده می‌کنیم
  const selectedModel = DEFAULT_MODEL;
  const API = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;

  const body = {
    contents: [{ parts: [{ text: String(prompt) }]}],
    generationConfig: {
      candidateCount: 1,
      maxOutputTokens: 400,
      temperature: 0.2,
      ...(json ? { response_mime_type: 'application/json' } : {})
    }
  };

  const r = await fetch(`${API}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await r.json().catch(()=> ({}));
  if (!r.ok) {
    return send(r.status, {
      error: 'upstream',
      status: r.status,
      model: selectedModel,
      detail: sanitize(data),
      requestId
    }, { ip, path, requestId, origin: originHeader });
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return send(200, { text, model: selectedModel, requestId }, { ip, path, requestId, origin: originHeader });
}

function send(status, obj, meta = {}) {
  const { ip, path, requestId, origin } = meta;
  console.log(JSON.stringify({
    ip: ip || 'unknown',
    path: path || '',
    requestId: requestId || 'none',
    status
  }));

  return {
    statusCode: status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin || DEFAULT_ALLOWED_ORIGIN,
      'cache-control': 'no-store'
    },
    body: JSON.stringify(obj)
  }
}
function sanitize(d){ const m=d?.error?.message||d?.message||''; const code=d?.error?.code||d?.code; const st=d?.error?.status||d?.status; return {code,status:st,message:(m||'').slice(0,500)} }
function extractIp(headers) {
  const xf = headers['x-forwarded-for'] || headers['client-ip'] || headers['x-real-ip'] || '';
  return String(xf).split(',')[0].trim() || 'unknown';
}
function consumeRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimiter.get(ip) || { start: now, count: 0 };
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.start = now;
    entry.count = 0;
  }

  entry.count += 1;
  rateLimiter.set(ip, entry);
  return entry.count <= RATE_LIMIT_MAX_REQUESTS;
}
function isAllowedOrigin(headers) {
  const origin = headers.origin || '';
  const referer = headers.referer || '';
  return origin.includes(ALLOWED_ORIGIN_HOST) || referer.includes(ALLOWED_ORIGIN_HOST);
}
function pickAllowedOrigin(headers) {
  const origin = headers.origin || '';
  if (origin && origin.includes(ALLOWED_ORIGIN_HOST)) return origin;
  const referer = headers.referer || '';
  if (referer && referer.includes(ALLOWED_ORIGIN_HOST)) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch (err) {
      return DEFAULT_ALLOWED_ORIGIN;
    }
  }
  return DEFAULT_ALLOWED_ORIGIN;
}
