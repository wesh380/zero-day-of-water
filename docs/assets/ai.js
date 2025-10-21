import { apiFetch, getBaseUrl } from "/assets/js/api.js";
void getBaseUrl();
export async function askAI(prompt, { json = false, model = null } = {}) {
  if (!prompt || String(prompt).trim().length < 3) {
    // Prevent sending empty prompts
    throw new Error('EMPTY_PROMPT');
  }
  const requestBody = { prompt, json: !!json };
  // اضافه کردن model به request در صورت وجود
  if (model) {
    requestBody.model = model;
  }
  const res = await apiFetch('/api/gemini', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  const text = await res.text();
  if (!res.ok) {
    let detail;
    try { detail = JSON.parse(text); } catch { detail = { raw: text }; }
    const msg = `AI_HTTP_${res.status}: ${detail?.error || detail?.status || ''} ${detail?.detail?.message || ''}`.trim();
    throw new Error(msg);
  }
  const out = JSON.parse(text);
  return out?.text ?? '';
}
if (typeof window !== 'undefined') {
  window.askAI = askAI;
}
