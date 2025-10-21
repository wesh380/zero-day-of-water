// استفاده از مدل جدید Gemini - مدل‌های 1.5 از آوریل 2025 منسوخ شده‌اند
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

export async function handler(event) {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return send(500, { error: 'missing_api_key' });

  let bodyIn = {};
  try { bodyIn = JSON.parse(event.body || '{}'); } catch {}
  const { prompt, json, model } = bodyIn;
  if (!prompt || String(prompt).trim().length < 3) {
    return send(400, { error: 'empty_prompt' });
  }

  // استفاده از model ارسال شده یا مدل پیش‌فرض
  const selectedModel = model || DEFAULT_MODEL;
  const API = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;

  const body = {
    contents: [{ parts: [{ text: String(prompt) }]}],
    ...(json ? { generationConfig: { response_mime_type: 'application/json' } } : {})
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
      model: MODEL,
      detail: sanitize(data)
    });
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return send(200, { text, model: selectedModel });
}

function send(status, obj) {
  return {
    statusCode: status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'cache-control': 'no-store'
    },
    body: JSON.stringify(obj)
  }
}
function sanitize(d){ const m=d?.error?.message||d?.message||''; const code=d?.error?.code||d?.code; const st=d?.error?.status||d?.status; return {code,status:st,message:(m||'').slice(0,500)} }
