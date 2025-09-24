const PRIMARY_CONFIG_PATH = '/config/api.json';
const LOCAL_CONFIG_PATH = '/config/api.local.json';
const STORAGE_KEY = 'wesh360.api.baseUrl';
const FETCH_TIMEOUT_MS = 3000;
const HEALTH_ENDPOINT = '/api/health';

const hasWindow = typeof window !== 'undefined';

const storage = (() => {
  if (!hasWindow) {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();

const configCache = new Map();

let cachedBaseUrl = storage?.getItem(STORAGE_KEY) || '';
let baseUrlPromise;

function persistBaseUrl(value) {
  if (!storage) {
    return;
  }
  const toStore = typeof value === 'string' && value ? value : '';
  try {
    storage.setItem(STORAGE_KEY, toStore);
  } catch {
    // ignore storage errors
  }
}

function readWindowOverride() {
  if (!hasWindow) {
    return '';
  }
  const override = window.__API_BASE_URL;
  if (typeof override === 'string' && override.trim()) {
    return override.trim();
  }
  return '';
}

function withTimeout(controller) {
  if (!controller) {
    return null;
  }
  return setTimeout(() => {
    try {
      controller.abort();
    } catch {
      // ignore
    }
  }, FETCH_TIMEOUT_MS);
}

async function fetchConfig(path) {
  if (!path) {
    return '';
  }
  if (configCache.has(path)) {
    return configCache.get(path);
  }
  if (typeof fetch !== 'function') {
    configCache.set(path, '');
    return '';
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = withTimeout(controller);

  try {
    const response = await fetch(`${path}?v=${Date.now()}`, controller ? { signal: controller.signal } : undefined);
    if (!response.ok) {
      configCache.set(path, '');
      return '';
    }

    const data = await response.json().catch(() => ({}));
    const base = typeof data?.baseUrl === 'string' ? data.baseUrl : '';
    if (base) {
      persistBaseUrl(base);
    }
    configCache.set(path, base);
    return base;
  } catch {
    configCache.set(path, '');
    return '';
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function resolveBaseUrl() {
  const override = readWindowOverride();
  if (override) {
    persistBaseUrl(override);
    return override;
  }

  const localConfig = await fetchConfig(LOCAL_CONFIG_PATH);
  if (localConfig) {
    return localConfig;
  }

  const primaryConfig = await fetchConfig(PRIMARY_CONFIG_PATH);
  if (primaryConfig) {
    return primaryConfig;
  }

  return cachedBaseUrl || '';
}

export async function getBaseUrl() {
  if (!baseUrlPromise) {
    baseUrlPromise = resolveBaseUrl()
      .catch(() => '')
      .then((base) => {
        cachedBaseUrl = typeof base === 'string' ? base : '';
        if (cachedBaseUrl) {
          persistBaseUrl(cachedBaseUrl);
        }
        return cachedBaseUrl;
      });
  }

  return baseUrlPromise;
}

function getWindowOrigin() {
  if (!hasWindow || !window.location) {
    return '';
  }
  return window.location.origin || '';
}

function isAbsoluteUrl(target) {
  return typeof target === 'string' && /^https?:\/\//i.test(target);
}

function normalizePath(path) {
  if (typeof path !== 'string') {
    return '';
  }
  if (path.startsWith('/')) {
    return path;
  }
  return `/${path}`;
}

function isGeminiRequest(path) {
  if (typeof path !== 'string' || !path) {
    return false;
  }
  if (isAbsoluteUrl(path)) {
    try {
      return new URL(path).pathname.startsWith('/api/gemini');
    } catch {
      return false;
    }
  }
  return normalizePath(path).startsWith('/api/gemini');
}

export async function apiFetch(path, init) {
  if (isAbsoluteUrl(path)) {
    return fetch(path, init);
  }

  const fallbackOrigin = getWindowOrigin() || 'http://localhost';
  const origin = isGeminiRequest(path)
    ? fallbackOrigin
    : (await getBaseUrl()) || fallbackOrigin;

  const target = new URL(path, origin).toString();
  return fetch(target, init);
}

function shouldShowHealthBadge() {
  if (!hasWindow) {
    return false;
  }
  if (window.__DISABLE_API_BADGE__) {
    return false;
  }
  const host = window.location?.hostname || '';
  if (!host) {
    return false;
  }
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(host)) {
    return true;
  }
  return host.endsWith('.local');
}

function createHealthBadge() {
  const badge = document.createElement('button');
  badge.type = 'button';
  badge.textContent = 'API: ...';
  badge.style.cssText = [
    'position:fixed',
    'bottom:12px',
    'right:12px',
    'padding:4px 10px',
    'border-radius:9999px',
    'font-family:system-ui,-apple-system,Segoe UI,sans-serif',
    'font-size:11px',
    'font-weight:500',
    'letter-spacing:0.02em',
    'border:none',
    'cursor:pointer',
    'z-index:2147483647',
    'color:#ffffff',
    'background-color:#1f2937',
    'box-shadow:0 4px 12px rgba(15, 23, 42, 0.2)',
    'opacity:0.85',
    'transition:opacity 120ms ease'
  ].join(';');
  badge.addEventListener('mouseenter', () => {
    badge.style.opacity = '1';
  });
  badge.addEventListener('mouseleave', () => {
    badge.style.opacity = '0.85';
  });
  return badge;
}

function setBadgeState(badge, state) {
  if (!badge) {
    return;
  }
  if (state === 'ok') {
    badge.style.backgroundColor = '#15803d';
    badge.textContent = 'API: OK';
  } else if (state === 'down') {
    badge.style.backgroundColor = '#b91c1c';
    badge.textContent = 'API: DOWN';
  } else {
    badge.style.backgroundColor = '#1f2937';
    badge.textContent = 'API: ...';
  }
}

function initDevHealthBadge() {
  if (!shouldShowHealthBadge()) {
    return;
  }
  const badge = createHealthBadge();
  let timer = null;

  const schedule = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(check, 15000);
  };

  const check = async () => {
    setBadgeState(badge, 'pending');
    try {
      const response = await apiFetch(HEALTH_ENDPOINT, { cache: 'no-store' });
      if (response.ok) {
        setBadgeState(badge, 'ok');
      } else {
        setBadgeState(badge, 'down');
      }
    } catch {
      setBadgeState(badge, 'down');
    } finally {
      schedule();
    }
  };

  badge.addEventListener('click', () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    check();
  });

  document.body.appendChild(badge);
  check();
}

if (hasWindow) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initDevHealthBadge();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initDevHealthBadge();
    }, { once: true });
  }

  (async () => {
    try {
      console.info('[API]', 'baseUrl=', await getBaseUrl());
    } catch (error) {
      console.warn('[API]', 'baseUrl fetch failed', error);
    }
  })();
}
