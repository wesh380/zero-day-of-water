export async function resolveBaseUrl(){
  if (window.__API_BASE_URL) return window.__API_BASE_URL;
  try { const r1 = await fetch('/config/api.local.json',{cache:'no-store'}); if (r1.ok){ const j=await r1.json(); if(j.baseUrl) return j.baseUrl; } } catch(_){ }
  try { const r2 = await fetch('/config/api.json',{cache:'no-store'}); if (r2.ok){ const j=await r2.json(); if(j.baseUrl) return j.baseUrl; } } catch(_){ }
  return window.location.origin;
}
export async function apiFetch(path, init={}){
  if (path.startsWith('/api/gemini')) return fetch(path, init);
  const base = await resolveBaseUrl();
  return fetch(new URL(path, base).toString(), init);
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
