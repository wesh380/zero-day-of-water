# Gemini Preview Fix Notes

## Root Cause
- Deploy previews rewrote `/api/gemini` to `https://api.wesh360.ir/:splat` via `netlify.toml`, so the browser attempted a cross-origin request to an endpoint without a valid TLS configuration for the preview host, triggering `ERR_SSL_PROTOCOL_ERROR`.
- The serverless function used the legacy prompt shape (`prompt`) and lacked retry/timeout handling, so even local calls could hang or return incomplete JSON when Gemini emitted structured output fences.
- Front-end fetches were treated as absolute through `apiFetch`, defaulting to `mode: cors`; combined with the redirect, the preview requests never reached the Netlify function and surfaced as `NETWORK_ERROR` in three AI widgets.

## Changes
- Repointed `/api/*` to `/.netlify/functions/:splat` and hardened the Gemini function with JSON mode support, retries, and a 30s abort guard.
- Standardised the browser client to call relative endpoints with `same-origin`, added fallback routing, sanitised JSON fences, and mapped API errors to human-readable Persian messages.
- Disabled the external health ping on preview hosts to avoid noisy timeouts during Gemini tests.

## Network Screenshots
> _Screenshots of before/after network traces are not available from the headless CI environment. Capture instructions are documented in the task for on-device verification._
