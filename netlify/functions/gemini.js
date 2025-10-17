const DEFAULT_HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "no-store",
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...DEFAULT_HEADERS,
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  };
}

function sanitizePrompt(input) {
  if (typeof input === "string") return input;
  return "";
}

exports.handler = async function handler(event) {
  if (event.httpMethod && event.httpMethod.toUpperCase() === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        ...DEFAULT_HEADERS,
        "access-control-allow-methods": "POST,OPTIONS",
        "access-control-allow-headers": "content-type",
      },
      body: "",
    };
  }

  try {
    const KEY = process.env.GEMINI_API_KEY;
    const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

    if (!KEY) {
      return jsonResponse(500, { code: "missing_api_key" });
    }

    let payloadIn = {};
    try {
      payloadIn = JSON.parse(event.body || "{}");
    } catch (_) {
      payloadIn = {};
    }

    const prompt = sanitizePrompt(payloadIn.q ?? payloadIn.prompt ?? "");
    const wantsJson = Boolean(payloadIn.json);

    if (!prompt || prompt.trim().length < 3) {
      return jsonResponse(400, { code: "empty_prompt" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.3,
        ...(wantsJson ? { responseMimeType: "application/json" } : {}),
      },
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    let response;
    let lastError;

    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });

          if (response.ok || ![500, 503, 504].includes(response.status)) {
            break;
          }
        } catch (error) {
          if (error && error.name === "AbortError") {
            throw error;
          }
          lastError = error;
        }

        if (attempt < 2) {
          const delay = 250 * Math.pow(2, attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } finally {
      clearTimeout(timer);
    }

    if (!response) {
      throw lastError || new Error("no_response_from_gemini");
    }

    const raw = await response.text();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          ...DEFAULT_HEADERS,
          "content-type": "application/json; charset=utf-8",
        },
        body: raw || JSON.stringify({ code: "upstream", status: response.status }),
      };
    }

    let output = raw;
    try {
      const parsed = JSON.parse(raw);
      const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text.length > 0) {
        output = text;
      }
    } catch (_) {
      // If parsing fails, fall back to the raw upstream text.
    }

    return {
      statusCode: 200,
      headers: {
        ...DEFAULT_HEADERS,
        "content-type": wantsJson ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
      },
      body: output,
    };
  } catch (error) {
    const statusCode = error && error.name === "AbortError" ? 504 : 500;
    return jsonResponse(statusCode, {
      code: "upstream",
      detail: error && typeof error.message === "string" ? error.message : "unexpected_error",
    });
  }
};
