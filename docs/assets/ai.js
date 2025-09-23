import { apiFetch } from "/assets/js/api.js";
export async function askAI(prompt, { json = false } = {}) {
  if (!prompt || String(prompt).trim().length < 3) {
    // Prevent sending empty prompts
    throw new Error('EMPTY_PROMPT');
  }
  const res = await apiFetch('/api/gemini', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, json: !!json })
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
