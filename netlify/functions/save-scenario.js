const { getSupabase } = require("./lib/supabase");

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
    const body = JSON.parse(event.body || "{}");
    const state = body.state || {};

    // اگه ID داده شده، update کن، وگرنه insert کن
    const id = body.id;

    const supabase = getSupabase();

    let result;
    if (id) {
      // Update existing scenario
      const { data, error } = await supabase
        .from("scenarios")
        .update({ state })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new scenario
      const { data, error } = await supabase
        .from("scenarios")
        .insert({ state })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, id: result.id }),
    };
  } catch (e) {
    console.error("Error in save-scenario:", e);
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
