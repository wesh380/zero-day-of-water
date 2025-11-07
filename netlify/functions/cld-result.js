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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    const jobId = event.queryStringParameters?.job_id || "";

    if (!jobId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "job_id is required" }),
      };
    }

    const supabase = getSupabase();

    // Get job status
    const { data: job, error: jobError } = await supabase
      .from("cld_jobs")
      .select("id, status, error_message, created_at, completed_at")
      .eq("id", jobId)
      .single();

    if (jobError) {
      if (jobError.code === "PGRST116") {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "job not found" }),
        };
      }
      throw jobError;
    }

    // اگه job هنوز done نشده، فقط status برگردون
    if (job.status !== "done") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          job_id: job.id,
          status: job.status,
          error: job.error_message || undefined,
        }),
      };
    }

    // اگه done شده، result رو هم برگردون
    const { data: result, error: resultError } = await supabase
      .from("cld_results")
      .select("output")
      .eq("job_id", jobId)
      .single();

    if (resultError) {
      // اگه result پیدا نشد ولی job done هست، یه مشکلی پیش اومده
      console.error("Result not found for completed job:", jobId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          job_id: job.id,
          status: "failed",
          error: "Result not found",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        job_id: job.id,
        status: job.status,
        result: result.output,
      }),
    };
  } catch (e) {
    console.error("Error in cld-result:", e);
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
