let cachedBaseUrl;
let baseUrlPromise;

async function resolveBaseUrl() {
  try {
    const res = await fetch('/config/api.json');
    if (!res.ok) {
      return '';
    }
    const data = await res.json().catch(() => ({}));
    const base = typeof data?.baseUrl === 'string' ? data.baseUrl : '';
    return base;
  } catch (error) {
    return '';
  }
}

export async function getApiBase() {
  if (typeof cachedBaseUrl === 'string') {
    return cachedBaseUrl;
  }
  if (!baseUrlPromise) {
    baseUrlPromise = resolveBaseUrl().then((base) => {
      cachedBaseUrl = base || '';
      return cachedBaseUrl;
    }).catch(() => {
      cachedBaseUrl = '';
      return cachedBaseUrl;
    });
  }
  return baseUrlPromise;
}

export async function apiFetch(path, opts) {
  const base = await getApiBase();
  return fetch(`${base}${path}`, opts);
}
