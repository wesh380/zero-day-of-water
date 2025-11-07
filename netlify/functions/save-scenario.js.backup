const { getStore } = require("@netlify/blobs");
const { randomUUID } = require("crypto");

const ALLOW = new Set([
  "https://wesh360.ir",
  process.env.URL,
  process.env.DEPLOY_PRIME_URL,
  "http://localhost:8888",
]);

function corsOrigin(event) {
  const o = event?.headers?.origin || "";
  return ALLOW.has(o) ? o : "https://wesh360.ir";
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": corsOrigin(event),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "POST only" }) };

  try {
    const body = JSON.parse(event.body || "{}");
    const id = (body.id && String(body.id)) || randomUUID();
    const store = getStore("agrivoltaics");
    await store.setJSON(`scenario:${id}`, body.state || {});
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id }) };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "internal", message: e.message }),
    };
  }
};
