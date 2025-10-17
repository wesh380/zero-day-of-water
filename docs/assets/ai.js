const GEMINI_ENDPOINTS = ["/api/gemini", "/.netlify/functions/gemini"];

function toError(code, extras = {}) {
  const err = new Error(code);
  err.code = code;
  Object.assign(err, extras);
  return err;
}

export async function askAI(message, { json = false } = {}) {
  const prompt = typeof message === "string" ? message : "";
  if (!prompt || prompt.trim().length < 3) {
    throw toError("EMPTY_PROMPT");
  }

  let lastError;

  for (const endpoint of GEMINI_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q: prompt, json: !!json }),
        cache: "no-store",
        redirect: "follow",
        mode: "same-origin",
      });

      const text = await response.text();

      if (!response.ok) {
        let detail;
        try {
          detail = JSON.parse(text);
        } catch (_) {
          detail = { raw: text };
        }
        const code = detail?.code || detail?.error || `AI_HTTP_${response.status}`;
        throw toError(code, { status: response.status, detail, body: text });
      }

      return text;
    } catch (error) {
      if (error?.code === "EMPTY_PROMPT") throw error;
      if (error instanceof TypeError || error?.name === "TypeError") {
        lastError = toError("NETWORK_ERROR", { cause: error });
      } else {
        lastError = error;
      }
    }
  }

  throw lastError || toError("NETWORK_ERROR");
}

if (typeof window !== "undefined") {
  window.askAI = askAI;
}
