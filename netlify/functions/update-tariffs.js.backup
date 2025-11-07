const { schedule } = require("@netlify/functions");
const { getStore } = require("@netlify/blobs");

exports.handler = schedule("0 3 * * 1", async () => {
  const store = getStore("agrivoltaics");
  // TODO: نرخ‌ها را از منبع معتبر بخوان (فعلاً ثابت بگذار)
  const tariffs = { ppa: 2500, buy: 3000, sell: 2200, updatedAt: Date.now() };
  await store.setJSON("tariffs:latest", tariffs);
  return { statusCode: 200, body: "ok" };
});
