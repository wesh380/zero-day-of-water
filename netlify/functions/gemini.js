const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';
const RETRYABLE = new Set([500, 503, 504]);
const RETRY_DELAYS = [500, 1000, 2000];

export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return send(event.httpMethod === 'OPTIONS' ? 204 : 405, {
      error: 'method_not_allowed'
    });
  }

  const key = process.env.GEMINI_API_KEY || '';
  if (!key) {
    return send(500, { error: 'missing_api_key' });
  }

  let bodyIn = {};
  try {
    bodyIn = JSON.parse(event.body || '{}');
  } catch (err) {
    return send(400, { error: 'invalid_json', detail: { message: err.message } });
  }

  const prompt = pickPrompt(bodyIn);
  if (!prompt || prompt.trim().length < 3) {
    return send(400, { error: 'empty_prompt' });
  }

  const wantsJson = !!bodyIn.json;
  const model = pickModel(bodyIn);
  const url = `${API_ROOT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  const payload = buildPayload(prompt, wantsJson, bodyIn.config);

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const text = await response.text();
    if (!response.ok) {
      const detail = parseErrorBody(text);
      const code = mapErrorCode(response.status, detail);
      return send(response.status, {
        error: code,
        status: response.status,
        model,
        detail
      });
    }

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      return send(502, {
        error: 'invalid_upstream_payload',
        detail: { message: err.message }
      });
    }

    const result = extractText(data);
    return send(200, {
      text: result,
      model,
      finishReason: data?.candidates?.[0]?.finishReason || null,
      promptFeedback: sanitizePromptFeedback(data?.promptFeedback)
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return send(504, { error: 'upstream_timeout', detail: { message: 'request aborted after 30s' } });
    }
    return send(500, {
      error: 'upstream',
      detail: { message: err.message }
    });
  }
}

function pickPrompt(body) {
  const { q, prompt } = body || {};
  if (typeof q === 'string') return q;
  if (typeof prompt === 'string') return prompt;
  return '';
}

function pickModel(body) {
  const candidate = body && typeof body.model === 'string' ? body.model.trim() : '';
  return candidate || DEFAULT_MODEL;
}

function buildPayload(prompt, wantsJson, config = {}) {
  const generationConfig = { temperature: 0.3 };
  if (wantsJson) {
    generationConfig.responseMimeType = 'application/json';
  }
  if (config && typeof config === 'object') {
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) generationConfig[key] = value;
    }
  }
  return {
    contents: [{ parts: [{ text: String(prompt) }]}],
    generationConfig
  };
}

async function fetchWithRetry(url, init) {
  let attempt = 0;
  let lastError;
  while (attempt < RETRY_DELAYS.length + 1) {
    attempt += 1;
    try {
      const response = await fetch(url, init);
      if (response.ok || !RETRYABLE.has(response.status) || attempt > RETRY_DELAYS.length) {
        return response;
      }
      await wait(RETRY_DELAYS[attempt - 1]);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      if (attempt > RETRY_DELAYS.length) throw err;
      await wait(RETRY_DELAYS[attempt - 1]);
    }
  }
  throw lastError || new Error('Unknown fetch error');
}

function parseErrorBody(text) {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return sanitizeError(parsed);
  } catch {
    return { message: text.slice(0, 1000) };
  }
}

function mapErrorCode(status, detail) {
  const upstreamStatus = (detail?.status || detail?.error?.status || '').toString().toUpperCase();
  const code = (detail?.code || detail?.error?.code || '').toString().toLowerCase();
  if (status === 429 || code === 'resource_exhausted' || upstreamStatus === 'RESOURCE_EXHAUSTED') {
    return 'rate_limit';
  }
  if (status === 404 || upstreamStatus === 'NOT_FOUND') {
    return 'model_not_found';
  }
  if (status === 403 || upstreamStatus === 'PERMISSION_DENIED') {
    return 'permission_denied';
  }
  if (status === 401 || upstreamStatus === 'UNAUTHENTICATED') {
    return 'invalid_api_key';
  }
  if (status === 400 || upstreamStatus === 'INVALID_ARGUMENT') {
    return 'invalid_request';
  }
  if (status === 504 || upstreamStatus === 'DEADLINE_EXCEEDED') {
    return 'upstream_timeout';
  }
  if (status === 500 || status === 503) {
    return 'upstream_unavailable';
  }
  return 'upstream';
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('\n')
      .trim();
  }
  return '';
}

function sanitizePromptFeedback(feedback) {
  if (!feedback || typeof feedback !== 'object') return null;
  const safety = Array.isArray(feedback.safetyRatings)
    ? feedback.safetyRatings.map((item) => ({
        category: item?.category || null,
        probability: item?.probability || null
      }))
    : undefined;
  return {
    safetyRatings: safety
  };
}

function sanitizeError(detail) {
  const message = detail?.error?.message || detail?.message || '';
  const status = detail?.error?.status || detail?.status;
  const code = detail?.error?.code || detail?.code;
  return {
    message: typeof message === 'string' ? message.slice(0, 1000) : undefined,
    status,
    code
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  };
}
