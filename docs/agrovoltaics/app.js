import { apiFetch } from "/assets/js/api.js";

const POLL_INTERVAL_MS = 1000;
const MAX_ATTEMPTS = 30;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runJob(payload) {
  const submitResponse = await apiFetch("/api/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });

  if (!submitResponse.ok) {
    const text = await submitResponse.text();
    throw new Error(`Submit failed (${submitResponse.status}): ${text}`);
  }

  const submitBody = await submitResponse.json();
  const jobId = submitBody?.job_id;
  if (!jobId) {
    throw new Error("Submit response missing job_id");
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const resultResponse = await apiFetch(`/api/result/${encodeURIComponent(jobId)}`);
    if (!resultResponse.ok) {
      const text = await resultResponse.text();
      throw new Error(`Result fetch failed (${resultResponse.status}): ${text}`);
    }

    const resultBody = await resultResponse.json();
    const status = typeof resultBody?.status === "string" ? resultBody.status.toLowerCase() : null;

    if (!status) {
      return resultBody;
    }

    if (status === "failed") {
      throw new Error("Job failed");
    }

    if (status === "done") {
      return resultBody;
    }

    if (attempt === MAX_ATTEMPTS - 1) {
      break;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Job polling timed out");
}
