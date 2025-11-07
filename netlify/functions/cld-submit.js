const { getSupabase } = require("./lib/supabase");
const Ajv = require("ajv");
const cldSchema = require("../../backend/schema/cld.schema.json");

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

// JSON Schema validator
const ajv = new Ajv({ strict: false });
const validate = ajv.compile(cldSchema);

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": corsOrigin(event),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Ts, X-Sign",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "POST only" }),
    };
  }

  try {
    // Parse payload
    const payload = JSON.parse(event.body || "{}");

    // Validate against JSON Schema
    const valid = validate(payload);
    if (!valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "validation_failed",
          details: validate.errors,
        }),
      };
    }

    // Insert job to database
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("cld_jobs")
      .insert({
        payload,
        status: "queued",
      })
      .select("id")
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        job_id: data.id,
        status: "queued",
      }),
    };
  } catch (e) {
    console.error("Error in cld-submit:", e);

    // Check for JSON parse errors
    if (e instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "invalid_json" }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "internal",
        message: e.message,
      }),
    };
  }
};
