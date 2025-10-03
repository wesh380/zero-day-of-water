# Contact & Forms Audit

## Searches Run
- `rg "گزارش مسئولانه" docs`
- `rg "responsible-disclosure" -n docs`
- `rg "t\.me" -n --glob "*.html" docs`
- `rg "تلگرام" -n docs`
- `rg "eitaa" -n docs`
- `rg "ایتا" -n docs`
- `rg "<form" -n --glob "*.html" docs`
- `rg "addEventListener('submit'" -n docs`

## a) Nav Label Locations
- `docs/index.html`: `<a href="/responsible-disclosure">ارتباط با ما</a>` (desktop + mobile buttons)
- `docs/research/index.html`: `<a href="/responsible-disclosure/">ارتباط با ما</a>` (desktop + mobile quick actions)
- `docs/responsible-disclosure/index.html`: `<a href="/responsible-disclosure" aria-current="page">ارتباط با ما</a>` hero CTA
- `docs/responsible-disclosure/thanks.html`: `<a href="/responsible-disclosure">ارتباط با ما</a>` hero CTA

## b) Telegram / Eitaa References
- `docs/responsible-disclosure/index.html`:
  - Telegram -> `https://t.me/w_e_s_h` (`aria-label="ارتباط در تلگرام"`, text `@w_e_s_h`)
  - Eitaa   -> `https://eitaa.com/wesh_ir` (`aria-label="ارتباط در ایتا"`, text `@wesh_ir`)
- `docs/contact/index.html` (aside contact block):
  - Telegram -> `https://t.me/w_e_s_h` (`aria-label="ارتباط در تلگرام"`, text `@w_e_s_h`)
  - Eitaa   -> `https://eitaa.com/wesh_ir` (`aria-label="ارتباط در ایتا"`, text `@wesh_ir`)
  - Email   -> `mailto:info@wesh360.ir`

## c) Forms Inventory
- `docs/responsible-disclosure/index.html`
  - `name="responsible-disclosure"`, `method="POST"`, `action="/responsible-disclosure/thanks.html"`
  - `data-netlify="true"`, `data-netlify-honeypot="bot-field"`, hidden `input[name="form-name" value="responsible-disclosure"]`
  - Honeypot `<p class="hidden">…</p>` present; `<div data-netlify-recaptcha="true">` included
  - No JS interception: `docs/research/index.js` only attaches listeners when `data-netlify` is missing (not the case here)
- `docs/contact/index.html`
  - `name="contact"`, `method="POST"`, `action="/contact/thanks.html"`
  - `data-netlify="true"`, `data-netlify-honeypot="bot-field"`, hidden `input[name="form-name" value="contact"]`
  - Honeypot paragraph present; includes `<div data-netlify-recaptcha="true">`
  - No JavaScript bound to this form
- `docs/research/index.html` — Research Data Request
  - `id="requestForm"`, `name="research-request"`, `method="POST"`, `action="/research/thanks.html"`
  - `data-netlify="true"`, `data-netlify-honeypot="bot-field"`, hidden `input[name="form-name" value="research-request"]`
  - Honeypot `<p class="hidden">…</p>` present; JS listener guarded by `!hasAttribute('data-netlify')`
- `docs/research/index.html` — Research Collaboration Proposal
  - `id="proposalForm"`, `name="research-proposal"`, `method="POST"`, `action="/research/thanks.html"`
  - `data-netlify="true"`, `data-netlify-honeypot="bot-field"`, hidden `input[name="form-name" value="research-proposal"]`
  - Honeypot `<p class="hidden">…</p>` present; same JS guard as above

## Notes
- `/contact/` now provides a dedicated Netlify form plus social links; `/contact/thanks.html` confirms submission and links back to home/responsible pages.
- `docs/responsible-disclosure/index.html` hero now surfaces a secondary CTA that routes general visitors to `/contact/` while keeping disclosure guidance intact.
- Netlify form buckets expected on deploy: `responsible-disclosure`, `contact`, `research-request`, `research-proposal`.

## Post-Check
- View submissions via **Netlify Dashboard -> Site -> Forms -> Submissions**; CSV export is available from the same panel.
- Notifications or webhooks can be configured under **Forms -> Settings & notifications** (left unconfigured in code).
