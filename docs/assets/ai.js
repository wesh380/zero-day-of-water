import { apiFetch, getBaseUrl } from "/assets/js/api.js";
void getBaseUrl();
export async function askAI(prompt, { json = false } = {}) {
  if (!prompt || String(prompt).trim().length < 3) {
    const err = new Error('EMPTY_PROMPT');
    err.code = 'empty_prompt';
    throw err;
  }

  let res;
  try {
    res = await apiFetch('/api/gemini', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, json: !!json })
    });
  } catch (networkError) {
    const err = new Error('NETWORK_ERROR');
    err.code = 'network';
    err.cause = networkError;
    throw err;
  }

  const text = await res.text();
  if (!res.ok) {
    let detail;
    try { detail = JSON.parse(text); } catch { detail = { raw: text }; }
    const code = (detail?.error || detail?.error_code || detail?.status || '').toString().toLowerCase();
    const message = (detail?.detail?.message || detail?.message || detail?.error_description || '').trim();
    const err = new Error(message || `AI_HTTP_${res.status}`);
    err.status = res.status;
    err.code = code || `http_${res.status}`;
    err.detail = detail;
    throw err;
  }

  let out;
  try {
    out = JSON.parse(text);
  } catch {
    const err = new Error('INVALID_JSON');
    err.code = 'invalid_json';
    err.detail = { raw: text };
    throw err;
  }

  return out?.text ?? '';
}
if (typeof window !== 'undefined') {
  window.askAI = askAI;
}
