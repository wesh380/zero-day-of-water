/**
 * Get Latest Tariff
 *
 * دریافت آخرین نرخ‌های برق از Supabase
 */

const { getSupabase } = require("./lib/supabase");

exports.handler = async (event) => {
  // فقط GET method
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const supabase = getSupabase();

    // دریافت آخرین tariff
    const { data, error } = await supabase
      .from("tariffs")
      .select("ppa, buy, sell")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (!data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No tariff found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (e) {
    console.error("Error getting tariff:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
