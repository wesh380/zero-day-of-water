// Normalized model loader with graceful fallback
// - Accepts absolute (http/https or root-absolute) and relative URLs
// - Normalizes common mistakes (/water/data/... -> /data/...)
// - Falls back to /data/<filename> when primary 404s

function norm(candidate) {
  try {
    if (!candidate) return null;
    if (/^https?:\/\//i.test(candidate)) return candidate; // absolute http(s)
    if (candidate.startsWith('/')) return candidate; // root-absolute
    const u = new URL(candidate, location.href); // resolve relative to page
    if (u.pathname.startsWith('/water/data/')) {
      return '/data/' + u.pathname.slice('/water/data/'.length);
    }
    return u.pathname; // e.g., /data/...
  } catch {
    return candidate;
  }
}

async function fetchJson(u) {
  const res = await fetch(u, { cache: 'no-cache' }).catch(err => {
    console.error('[CLD][model] fetch error', err);
    throw err;
  });
  if (!res.ok) {
    console.error('[CLD][model] HTTP', res.status, u);
    throw new Error('MODEL_HTTP_' + res.status);
  }
  const json = await res.json().catch(err => {
    console.error('[CLD][model] invalid JSON', err);
    throw err;
  });
  console.debug('[CLD][model] ok, keys:', Object.keys(json || {}));
  return json;
}

export async function loadModel(candidate) {
  const primary = norm(candidate);
  console.debug('[CLD][model] try', primary, 'from', candidate);
  try {
    return await fetchJson(primary);
  } catch (e) {
    if (String(e.message || '').includes('MODEL_HTTP_404')) {
      const fname = ((primary || '').split('/').pop() || '').split('?')[0];
      if (fname) {
        const fb = '/data/' + fname;
        console.warn('[CLD][model] 404; fallback', fb);
        return await fetchJson(fb);
      }
    }
    throw e;
  }
}

