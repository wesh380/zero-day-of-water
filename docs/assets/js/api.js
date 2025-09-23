const CONFIG_PATH = '/config/api.json';
const STORAGE_KEY = 'wesh360.api.baseUrl';
const FETCH_TIMEOUT_MS = 3000;

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

let cachedBaseUrl = storage?.getItem(STORAGE_KEY) ?? undefined;
let baseResolved = false;
let baseUrlPromise;

function persistBaseUrl(value) {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY, typeof value === 'string' ? value : '');
  } catch {
    // ignore storage errors
  }
}

async function requestBaseUrl() {
  if (typeof fetch !== 'function') {
    return '';
  }

  const url = `${CONFIG_PATH}?v=${Date.now()}`;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : null;

  try {
    const response = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (!response.ok) {
      return '';
    }

    const data = await response.json().catch(() => ({}));
    const base = typeof data?.baseUrl === 'string' ? data.baseUrl : '';
    persistBaseUrl(base);
    return base;
  } catch {
    return '';
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function getBaseUrl() {
  if (baseResolved) {
    return typeof cachedBaseUrl === 'string' ? cachedBaseUrl : '';
  }

  if (!baseUrlPromise) {
    baseUrlPromise = requestBaseUrl()
      .catch(() => '')
      .then((base) => {
        cachedBaseUrl = typeof base === 'string' ? base : '';
        baseResolved = true;
        return cachedBaseUrl;
      });
  }

  return baseUrlPromise;
}

export async function apiFetch(path, init) {
  const base = await getBaseUrl();
  const origin =
    base ||
    (hasWindow && window.location ? window.location.origin : undefined) ||
    'http://localhost';
  const target = new URL(path, origin).toString();
  return fetch(target, init);
}

if (hasWindow) {
  (async () => {
    try {
      console.info('[API]', 'baseUrl=', await getBaseUrl());
    } catch (error) {
      console.warn('[API]', 'baseUrl fetch failed', error);
    }
  })();
}
