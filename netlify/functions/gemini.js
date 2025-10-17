const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const DEFAULT_ORIGINS = ['https://wesh360.ir', 'https://www.wesh360.ir', 'http://localhost:8888', 'http://127.0.0.1:8888'];

const allowedOrigins = (process.env.GEMINI_ALLOWED_ORIGINS || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

function pickOrigin(event) {
  const origin = (event.headers?.origin || event.headers?.Origin || '').trim();
  const allow = [...allowedOrigins, ...DEFAULT_ORIGINS];
  if (!origin) return allow.includes('*') ? '*' : DEFAULT_ORIGINS[0];
  if (allow.includes('*')) return origin;
  return allow.includes(origin) ? origin : DEFAULT_ORIGINS[0];
}

export async function handler(event) {
  const origin = pickOrigin(event);

  if (event.httpMethod === 'OPTIONS') {
    return send(204, {}, origin);
  }

  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return send(500, { error: 'missing_api_key' }, origin);

  let bodyIn = {};
  try { bodyIn = JSON.parse(event.body || '{}'); } catch {}
  const { prompt, json } = bodyIn;
  if (!prompt || String(prompt).trim().length < 3) {
    return send(400, { error: 'empty_prompt' }, origin);
  }

  const body = {
    contents: [{ parts: [{ text: String(prompt) }]}],
    ...(json ? { generationConfig: { response_mime_type: 'application/json' } } : {})
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const r = await fetch(`${API}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return send(r.status, {
        error: 'upstream',
        status: r.status,
        model: MODEL,
        detail: sanitize(data)
      }, origin);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return send(200, { text, model: MODEL }, origin);
  } catch (error) {
    const status = error.name === 'AbortError' ? 504 : 502;
    return send(status, {
      error: 'fetch_failed',
      status,
      model: MODEL,
      detail: sanitize(error)
    }, origin);
  } finally {
    clearTimeout(timeout);
  }
}

function send(status, obj, origin='*') {
  const body = status === 204 ? '' : JSON.stringify(obj);
  return {
    statusCode: status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
      'cache-control': 'no-store'
    },
    body
  }
}

function sanitize(d){
  const message = typeof d?.message === 'string' ? d.message : d?.error?.message || '';
  const code = d?.error?.code || d?.code;
  const status = d?.error?.status || d?.status;
  return { code, status, message: String(message || '').slice(0, 500) };
}
