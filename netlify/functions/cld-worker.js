/**
 * CLD Worker - Scheduled Function
 *
 * این function هر 1 دقیقه یکبار اجرا میشه و pending jobs رو process می‌کنه
 *
 * Schedule: هر 1 دقیقه (cron: */1 * * * *)
 */

const { schedule } = require("@netlify/functions");
const { getSupabase } = require("./lib/supabase");

/**
 * پردازش یک CLD job
 * فعلاً فقط یه summary ساده از nodes و edges میسازه
 */
async function processJob(supabase, job) {
  const { id, payload } = job;

  try {
    // Mark job as processing
    await supabase
      .from("cld_jobs")
      .update({
        status: "processing",
        started_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Process the job (فعلاً فقط یه summary ساده)
    const summary = {
      nodes: payload.nodes?.length || 0,
      edges: payload.edges?.length || 0,
      has_meta: !!payload.meta,
      model_id: payload.meta?.model_id || null,
    };

    const result = {
      job_id: id,
      generated_at: new Date().toISOString(),
      summary,
      // TODO: اینجا باید پردازش واقعی CLD انجام بشه
      // مثلاً تشخیص loops، محاسبه polarity، etc.
    };

    // Save result
    await supabase.from("cld_results").insert({
      job_id: id,
      output: result,
    });

    // Mark job as done
    await supabase
      .from("cld_jobs")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    console.log(`Job ${id} completed successfully`);
    return { success: true, jobId: id };
  } catch (error) {
    console.error(`Job ${id} failed:`, error);

    // Mark job as failed
    await supabase
      .from("cld_jobs")
      .update({
        status: "failed",
        error_message: error.message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    return { success: false, jobId: id, error: error.message };
  }
}

/**
 * Worker function - اجرا میشه هر 1 دقیقه
 */
async function worker() {
  const supabase = getSupabase();

  try {
    // Get pending jobs (max 10 per run)
    const { data: jobs, error } = await supabase
      .from("cld_jobs")
      .select("id, payload, created_at")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) throw error;

    if (!jobs || jobs.length === 0) {
      console.log("No pending jobs");
      return { statusCode: 200, body: JSON.stringify({ processed: 0 }) };
    }

    console.log(`Found ${jobs.length} pending jobs`);

    // Process all jobs
    const results = [];
    for (const job of jobs) {
      const result = await processJob(supabase, job);
      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    console.log(
      `Worker completed: ${successCount} succeeded, ${failedCount} failed`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: jobs.length,
        succeeded: successCount,
        failed: failedCount,
      }),
    };
  } catch (error) {
    console.error("Worker error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Schedule: هر 1 دقیقه
exports.handler = schedule("*/1 * * * *", worker);
