# Forms Audit

## docs/responsible-disclosure/index.html
- `form[name="responsible-disclosure"]`
  - `method="POST"`: ✅
  - `data-netlify="true"`: ✅
  - `data-netlify-honeypot="bot-field"`: ✅
  - Hidden `input[name="form-name" value="responsible-disclosure"]`: ✅
  - Honeypot field `<p class="hidden">…<input name="bot-field" /></p>`: ✅
  - `action="/responsible-disclosure/thanks.html"`: ✅
  - `<div data-netlify-recaptcha="true">`: ✅

## docs/research/index.html
- `form#requestForm[name="research-request"]`
  - `method="POST"`: ✅
  - `data-netlify="true"`: ✅
  - `data-netlify-honeypot="bot-field"`: ✅
  - Hidden `input[name="form-name" value="research-request"]`: ✅
  - Honeypot field `<p class="hidden">…<input name="bot-field" /></p>`: ✅
  - `action="/research/thanks.html"`: ✅
  - Netlify reCAPTCHA: ❌ (not required)

- `form#proposalForm[name="research-proposal"]`
  - `method="POST"`: ✅
  - `data-netlify="true"`: ✅
  - `data-netlify-honeypot="bot-field"`: ✅
  - Hidden `input[name="form-name" value="research-proposal"]`: ✅
  - Honeypot field `<p class="hidden">…<input name="bot-field" /></p>`: ✅
  - `action="/research/thanks.html"`: ✅
  - Netlify reCAPTCHA: ❌ (not required)

## Viewing Submissions
1. Sign in to Netlify and open the **wesh360** site dashboard.
2. Navigate to **Forms → Submissions**. Netlify will surface three forms: `responsible-disclosure`, `research-request`, and `research-proposal`.
3. Filter by form name to review entries or export CSVs as needed.
