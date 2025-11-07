const { getStore } = require("@netlify/blobs");

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
  try {
    const id = (event.queryStringParameters && event.queryStringParameters.id) || "";
    if (!id)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "id is required" }) };

    const store = getStore("agrivoltaics");
    const json = await store.get(`scenario:${id}`);
    return { statusCode: 200, headers, body: json || "null" };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "internal", message: e.message }),
    };
  }
};
