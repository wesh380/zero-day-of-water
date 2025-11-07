const { schedule } = require("@netlify/functions");
const { getSupabase } = require("./lib/supabase");

exports.handler = schedule("0 3 * * 1", async () => {
  try {
    const supabase = getSupabase();

    // TODO: نرخ‌ها را از منبع معتبر بخوان (فعلاً ثابت بگذار)
    const tariffs = {
      ppa: 2500,
      buy: 3000,
      sell: 2200,
    };

    const { error } = await supabase.from("tariffs").insert(tariffs);

    if (error) throw error;

    console.log("Tariffs updated successfully:", tariffs);
    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("Error updating tariffs:", e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
});
