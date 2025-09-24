const CONFIG_PATHS = [
  'docs/config/api.local.json',
  '/docs/config/api.local.json',
  '/config/api.local.json',
  'docs/config/api.json',
  '/docs/config/api.json',
  '/config/api.json'
];
const CONFIG_TIMEOUT_MS = 2500;
let cachedApiBase = null;
let apiBasePromise = null;

async function readBaseUrlFrom(path) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), CONFIG_TIMEOUT_MS) : null;
  try {
    const response = await fetch(path, { cache: 'no-store', signal: controller ? controller.signal : undefined });
    if (!response || !response.ok) return null;
    const data = await response.json();
    if (data && typeof data.baseUrl === 'string' && data.baseUrl) {
      return data.baseUrl;
    }
  } catch (_) {
    // ignore config fetch errors and fall back
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
  return null;
}

async function resolveApiBaseInternal() {
  if (window.__API_BASE_URL) return window.__API_BASE_URL;
  for (const path of CONFIG_PATHS) {
    const base = await readBaseUrlFrom(path);
    if (base) return base;
  }
  return window.location.origin;
}

async function getApiBase() {
  if (window.__API_BASE_URL) return window.__API_BASE_URL;
  if (cachedApiBase) return cachedApiBase;
  if (!apiBasePromise) {
    apiBasePromise = resolveApiBaseInternal().catch(() => window.location.origin);
  }
  cachedApiBase = await apiBasePromise;
  return cachedApiBase;
}

function isCldActionPath(path = '') {
  return path.indexOf('/api/submit') !== -1 || path.indexOf('/api/result') !== -1;
}

function dispatchApiEvent(type, detail) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  } catch (_) {
    // swallow dispatch failures
  }
}

function isServerFailure(response) {
  if (!response) return true;
  if (typeof response.status === 'number' && response.status >= 500) return true;
  if (typeof response.ok === 'boolean') return !response.ok && response.status === 0;
  return false;
}

async function apiFetch(path, init = {}) {
  const base = path.startsWith('/api/gemini') ? window.location.origin : await getApiBase();
  const url = new URL(path, base).toString();
  const cldAction = isCldActionPath(path);
  try {
    const response = await fetch(url, init);
    if (cldAction) {
      if (isServerFailure(response)) {
        dispatchApiEvent('api:offline', { path: url, status: response.status });
      } else {
        dispatchApiEvent('api:online', { path: url, status: response.status });
      }
    }
    return response;
  } catch (error) {
    if (cldAction) {
      dispatchApiEvent('api:offline', { path: url, error });
    }
    throw error;
  }
}

// dev-only badge
async function devPingHealth() {
  try {
    const r = await apiFetch('/api/health');
    const ok = r.ok;
    console.log('[API health]', ok, r.status);
    if (/(localhost|netlify\.app)/.test(location.host)) {
      let b = document.getElementById('api-health-badge');
      if (!b) {
        b = document.createElement('div');
        b.id = 'api-health-badge';
        Object.assign(b.style, {
          position: 'fixed',
          right: '8px',
          bottom: '8px',
          padding: '6px 8px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 99999,
          background: ok ? '#2e7d32' : '#c62828',
          color: '#fff'
        });
        document.body.appendChild(b);
      }
      b.textContent = ok ? 'API: OK' : 'API: DOWN';
    }
  } catch (e) {
    console.warn('health failed', e);
  }
}
if (/(localhost|netlify\.app)/.test(location.host)) setTimeout(devPingHealth, 800);

export { getApiBase, apiFetch, devPingHealth };
