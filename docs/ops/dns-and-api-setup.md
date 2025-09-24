# DNS and API Setup Runbook

This guide covers how to expose the on-premises API for WESH360 over `https://api.wesh360.ir`.

## 1. Choose the right DNS delegation model
- **Name server (NS) delegation** is only needed when you want another provider to manage an entire zone. For a single API host keep `wesh360.ir` with the primary DNS provider and only add records there.
- **Subdomain record**: create individual A/AAAA records under the existing zone. This is the recommended approach for `api.wesh360.ir` so the rest of the domain stays untouched.

## 2. Create DNS records for the API host
1. Provision a public IP on the edge server (static preferred).
2. Add an **A record** for `api.wesh360.ir` pointing to that public IPv4. Add an AAAA record if IPv6 is available.
3. Set a short TTL (e.g., 300 seconds) during initial rollout for faster propagation.

## 3. Open required firewall ports
- Allow inbound TCP **80** and **443** on the perimeter firewall and host firewall.
- Limit management ports (SSH/RDP) to the operations subnet only.

## 4. Configure the reverse proxy
1. Install Nginx, Caddy, or IIS ARR on the edge server.
2. Terminate TLS for `api.wesh360.ir` (Let’s Encrypt or enterprise CA).
3. Proxy traffic to the internal FastAPI service running on `http://127.0.0.1:8010`.
4. Forward the `X-Forwarded-For`, `X-Forwarded-Proto`, and `Host` headers.
5. Enforce HTTPS redirects and optional Basic Auth for staging environments.

## 5. Validate DNS and connectivity
- `nslookup api.wesh360.ir` → verify the public IP address.
- `curl -I https://api.wesh360.ir/api/health` → expect `200 OK`.
- `curl -H "Origin: https://wesh360.ir" https://api.wesh360.ir/api/health` → confirm CORS success headers.
- `curl -H "X-Forwarded-Proto: https" http://127.0.0.1:8010/api/health` from the proxy host → ensures upstream service responds.

## 6. Final application checklist
- `docs/config/api.json` points to `https://api.wesh360.ir`.
- `ALLOWED_ORIGINS` in `backend/.env` includes `https://wesh360.ir`, `https://www.wesh360.ir`, and `https://api.wesh360.ir`.
- Netlify CSP `connect-src` allows `https://api.wesh360.ir` for the CLD page.
- Reverse proxy health badge and offline mode are tested against production endpoints.
- Document the IP, certificate expiry, and responsible team in the ops tracker.
