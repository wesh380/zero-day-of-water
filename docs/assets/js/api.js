export async function resolveBaseUrl(){
  if (window.__API_BASE_URL) return window.__API_BASE_URL;
  try { const r1 = await fetch('/config/api.local.json',{cache:'no-store'}); if (r1.ok){ const j=await r1.json(); if(j.baseUrl) return j.baseUrl; } } catch(_){ }
  try { const r2 = await fetch('/config/api.json',{cache:'no-store'}); if (r2.ok){ const j=await r2.json(); if(j.baseUrl) return j.baseUrl; } } catch(_){ }
  return window.location.origin;
}
export const getBaseUrl = resolveBaseUrl;
function isCldActionPath(path=''){
  return path.indexOf('/api/submit') !== -1 || path.indexOf('/api/result') !== -1;
}

function dispatchApiEvent(type, detail){
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  } catch (_) {
    // swallow dispatch failures
  }
}

function isServerFailure(response){
  if (!response) return true;
  if (typeof response.status === 'number' && response.status >= 500) return true;
  if (typeof response.ok === 'boolean') return !response.ok && response.status === 0;
  return false;
}

export async function apiFetch(path, init={}){
  // Netlify Functions باید از مسیر /.netlify/functions/ استفاده کنند
  // چون /api/* به سرور خارجی redirect می‌شود
  if (path.startsWith('/api/gemini')) {
    const functionPath = path.replace('/api/gemini', '/.netlify/functions/gemini');
    return fetch(functionPath, init);
  }
  const base = await resolveBaseUrl();
  const url = new URL(path, base).toString();
  const cldAction = isCldActionPath(path);

  // Add User-Agent for cross-origin requests if not in browser context
  if (!init.headers) init.headers = {};
  if (typeof window === 'undefined' && !init.headers['User-Agent']) {
    init.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

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
export async function devPingHealth(){
  try{
    const r = await apiFetch('/api/health'); const ok=r.ok;
    console.log('[API health]', ok, r.status);
    if (/(localhost|netlify\.app)/.test(location.host)) {
      let b=document.getElementById('api-health-badge');
      if(!b){ b=document.createElement('div'); b.id='api-health-badge';
        Object.assign(b.style,{position:'fixed',right:'8px',bottom:'8px',padding:'6px 8px',borderRadius:'8px',fontSize:'12px',zIndex:99999,background:ok?'#2e7d32':'#c62828',color:'#fff'});
        document.body.appendChild(b);
      }
      b.textContent = ok? 'API: OK' : 'API: DOWN';
    }
  }catch(e){ console.warn('health failed',e); }
}
if (/(localhost|netlify\.app)/.test(location.host)) setTimeout(devPingHealth, 800);
