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

  try {
    const id = event.queryStringParameters?.id || "";

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "id is required" }),
      };
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("scenarios")
      .select("state")
      .eq("id", id)
      .single();

    if (error) {
      // اگه scenario پیدا نشد
      if (error.code === 'PGRST116') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "scenario not found" }),
        };
      }
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data.state),
    };
  } catch (e) {
    console.error("Error in get-scenario:", e);
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
