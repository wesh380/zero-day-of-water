# Water Insights Gemini Debugging Report

## Summary
- **Issue**: All three AI-backed cards on `/water/insights` failed because requests to `/api/gemini` were redirected away from the Netlify Function, reaching `https://api.wesh360.ir/gemini` (which does not proxy Gemini) and returning 404s.
- **Root cause**: `netlify.toml` forced every `/api/*` request to `https://api.wesh360.ir/:splat` with no exemption for Gemini. The frontend correctly targeted `/api/gemini`, so the function was never invoked.
- **Fix**: Added an explicit rewrite that maps `/api/gemini` to `/.netlify/functions/gemini` before the catch-all redirect and hardened the function + client helper for reliability (timeout, retry, JSON clean-up, CORS allow-list).

## Observations
- Netlify Function `netlify/functions/gemini.js` now enforces:
  - Origin allow-list (`https://wesh360.ir`, `https://www.wesh360.ir`, `http://localhost:8888`, plus optional `GEMINI_ALLOWED_ORIGINS`).
  - Prompt validation and 60s upstream timeout (AbortController).
  - Proper handling for `OPTIONS` preflight and upstream error sanitisation.
- Frontend helper `docs/assets/ai.js` now:
  - Applies a 60s timeout + one retry with exponential backoff.
  - Returns JSON payloads with ```json fences removed when `json:true`.
  - Throws structured errors with `code`, `status`, and `details`.

## Environment Variables
Set these in Netlify (Site settings → Build & deploy → Environment):

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Required – Google Generative Language API key. |
| `GEMINI_MODEL` | Optional – overrides default `gemini-1.5-flash-latest`. |
| `GEMINI_ALLOWED_ORIGINS` | Optional comma-separated allow-list (defaults already include `https://wesh360.ir`, `https://www.wesh360.ir`, `http://localhost:8888`). |

## Testing Notes
- `curl -i -X POST http://localhost:8888/api/gemini ...` now reaches the Netlify function once `netlify dev` is running with env vars set.
- `npm test` currently fails in this container because Chromium dependencies for Puppeteer are unavailable (`libatk-1.0.so.0`).
