const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function handler(event) {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return send(500, { error: 'missing_api_key' });

  let bodyIn = {};
  try { bodyIn = JSON.parse(event.body || '{}'); } catch {}
  const { prompt, json } = bodyIn;
  if (!prompt || String(prompt).trim().length < 3) {
    return send(400, { error: 'empty_prompt' });
  }

  const body = {
    contents: [{ parts: [{ text: String(prompt) }]}],
    ...(json ? { generationConfig: { response_mime_type: 'application/json' } } : {})
  };

  try {
    const r = await fetch(`${API}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return send(r.status, {
        error: 'upstream',
        status: r.status,
        model: MODEL,
        detail: sanitize(data)
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return send(200, { text, model: MODEL });
  } catch (e) {
    return send(500, {
      error: 'network_error',
      detail: {
        message: e.message,
        stack: e.stack,
      }
    });
  }
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
