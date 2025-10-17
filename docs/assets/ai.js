import { apiFetch, getBaseUrl } from "/assets/js/api.js";

const DEFAULT_TIMEOUT = 60_000;
const RETRY_DELAY = 1_000;
const MAX_RETRIES = 1;

void getBaseUrl();

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

function stripJsonFence(payload = '') {
  return String(payload).replace(/^```json\s*|\s*```$/g, '').trim();
}

function buildError(status, detail) {
  const message = `AI_HTTP_${status}`;
  const err = new Error(message);
  err.code = message;
  err.status = status;
  err.details = detail;
  return err;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function askAI(prompt, { json = false, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES } = {}) {
  if (!prompt || String(prompt).trim().length < 3) {
    const err = new Error('EMPTY_PROMPT');
    err.code = 'EMPTY_PROMPT';
    throw err;
  }

  let attempt = 0;
  let lastError;
  while (attempt <= retries) {
    const { controller, timer } = withTimeout(timeout);
    try {
      const res = await apiFetch('/api/gemini', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, json: !!json }),
        signal: controller.signal
      });
      const raw = await res.text();
      if (!res.ok) {
        let detail = raw;
        try { detail = JSON.parse(raw); } catch {}
        throw buildError(res.status, detail);
      }

      let text = '';
      try {
        const parsed = JSON.parse(raw);
        text = parsed?.text ?? '';
      } catch (_) {
        text = '';
      }

      if (json) {
        return stripJsonFence(text || raw);
      }
      return String(text || raw).trim();
    } catch (error) {
      lastError = error;
      if (error?.name === 'AbortError') {
        const timeoutError = new Error('AI_TIMEOUT');
        timeoutError.code = 'AI_TIMEOUT';
        timeoutError.details = { timeout };
        throw timeoutError;
      }
      if (attempt === retries) {
        throw error;
      }
      await sleep(RETRY_DELAY * (attempt + 1));
    } finally {
      clearTimeout(timer);
      attempt += 1;
    }
  }
  throw lastError || new Error('AI_UNKNOWN_ERROR');
}

if (typeof window !== 'undefined') {
  window.askAI = askAI;
}
