# Water Dashboard

This repository hosts a simple dashboard served from the `/docs` directory and a proxy for Gemini API requests.

## Dash application

The interactive dashboards live in `/dash` and are organized by resource type:

```
/dash
  /components       # shared UI pieces
  /pages
    /water
      /water-crisis/water-crisis.js
      /dam-monitoring/dam-monitoring.js
      /bills-tariffs/bills-tariffs.js
      /future-prediction/future-prediction.js
    /electricity/electricity.js
    /gas/gas.js
    /oil/oil.js
```

`/dash/components` contains reusable pieces such as `Card`, `Header`, and `Footer` to avoid code duplication.  Routing is file based; paths mirror their folder names (e.g. `/water/water-crisis`).  New dashboards can be added by creating a folder and descriptive file under `/dash/pages`.

## GitHub Pages

GitHub Pages is configured to deploy the `docs` directory. To use a custom subdomain:

1. Create a `CNAME` DNS record for `dashboard.YOURDOMAIN.ir` pointing to `USERNAME.github.io.`
2. Ensure `/docs/CNAME` contains `dashboard.YOURDOMAIN.ir`.
3. Push to `main`; the GitHub Action will publish the site.

## Serverless proxy

Gemini API calls are routed through a serverless function so the API key is kept server side.

### Netlify (Serverless Function)
- The frontend calls the relative endpoint `/api/gemini`.
- Set `GEMINI_API_KEY` (and optional `PREVIEW_ORIGIN`) in Netlify Environment Variables.
- CSP headers are configured in `netlify.toml`; `connect-src 'self'` is sufficient.

### Content Security Policy

Netlify applies the policy via [`docs/_headers`](docs/_headers). To mirror those headers on a traditional server:

```nginx
add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' https://cdn.tailwindcss.com; connect-src 'self';" always;
add_header Referrer-Policy "no-referrer" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
```

```apache
<IfModule mod_headers.c>
  Header set Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' https://cdn.tailwindcss.com; connect-src 'self';"
  Header set Referrer-Policy "no-referrer"
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
</IfModule>
```

**Post-deploy tests**
```bash
curl -i -X OPTIONS https://wesh360.ir/api/gemini \
  -H "Origin: https://wesh360.ir" \
  -H "Access-Control-Request-Method: POST"

curl -i -X POST https://wesh360.ir/api/gemini \
  -H "Origin: https://wesh360.ir" \
  -H "Content-Type: application/json" \
  --data '{"q":"ping"}'
Expected: 204 for OPTIONS, 200 for POST, and no query ?key= in downstream calls.
```

**Local check (netlify dev)**
```bash
curl -i -X OPTIONS http://localhost:8888/api/gemini \
  -H "Origin: https://wesh360.ir" \
  -H "Access-Control-Request-Method: POST"

curl -i -X POST http://localhost:8888/api/gemini \
  -H "Origin: https://wesh360.ir" \
  -H "Content-Type: application/json" \
  --data '{"q":"ping"}'
```

## Backlog

- Migrate from `cdn.tailwindcss.com` to CSS compiled with Tailwind CLI at build time.

## Local Setup, Test, and Deploy

1. **Install dependencies**
   ```bash
   npm i
   ```
2. **Build dashboard and vendor files**
   ```bash
   npm run build:agri && npm run prepare:agri
   ```
3. **Build CLD bundle**
   ```bash
   node scripts/build-cld.js
   ```
   This concatenates CLD scripts and styles into `docs/assets/dist/water-cld.bundle.*`.
3. **Serve locally**
   ```bash
   npx http-server docs -p 8080
   ```
   Visit [http://localhost:8080/agrivoltaics/](http://localhost:8080/agrivoltaics/) and ensure it loads without CSP errors.
4. **Test Netlify functions**
   ```bash
   npx netlify dev
   curl -X POST http://localhost:8888/api/save-scenario -H "Content-Type: application/json" -d '{"state":{"hello":"world"}}'
   curl "http://localhost:8888/api/get-scenario?id=<ID>"
   ```
5. **Deploy**
   Push to `main` to trigger a Deploy Preview and then production.
6. **Troubleshoot CORS**
   If the preview throws a CORS error, verify that the origin uses `process.env.URL` or `DEPLOY_PRIME_URL`.

