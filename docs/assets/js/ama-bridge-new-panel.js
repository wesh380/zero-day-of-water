;(function(){
  const STEP=250, MAX=8000, NEW_SCOPE='#ama-layer-dock';
  const idMap = { wind:'#chk-wind-sites', solar:'#chk-solar-sites', dams:'#chk-dam-sites' };
  const rxMap = { wind:/باد/i, solar:/خورشیدی/i, dams:/سد/i };
  const missing = new Set(['wind','solar','dams']);
  const bridgedPairs = [];
  const wiredOnce = { info:false };

  function inNewScope(el){ return !!el && !!el.closest(NEW_SCOPE); }
  function setUi(el, on){
    if (el.matches('input[type="checkbox"]')) el.checked = !!on;
    el.classList.toggle('muted', !on);
    if (el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed', on?'true':'false');
  }
  function findNewToggles(){
    const root = document.querySelector(NEW_SCOPE); if(!root) return [];
    return Array.from(root.querySelectorAll('[data-layer-toggle]'))
      .map(el=>({ el, key:(el.dataset.layerToggle||'').trim().toLowerCase() }))
      .filter(x=>x.key);
  }
  function findLegacyByKey(key){
    const byId = document.querySelector(idMap[key]);
    if (byId && !inNewScope(byId)) return byId;
    const rx = rxMap[key]; if(!rx) return null;
    const labels = Array.from(document.querySelectorAll('label')).filter(l=>!inNewScope(l));
    for (const lbl of labels){
      const txt=(lbl.textContent||'').trim();
      if (!rx.test(txt)) continue;
      const forId = lbl.getAttribute('for');
      const input = forId ? document.getElementById(forId) : lbl.querySelector('input[type="checkbox"]');
      if (input && !inNewScope(input)) return input;
    }
    return null;
  }
  function syncPair(newEl, legacy){
    setUi(newEl, !!legacy.checked);
    const fwd = ()=>{ legacy.click(); setUi(newEl, !!legacy.checked); };
    newEl.addEventListener('change', fwd);
    newEl.addEventListener('click',  fwd);
    legacy.addEventListener('change', ()=> setUi(newEl, !!legacy.checked));
  }

  function tryBind(){
    const toggles = findNewToggles(); if (!toggles.length) return 'no-new';
    let bound=0;
    toggles.forEach(({el,key})=>{
      if (el.__bridged) return;
      const legacy = findLegacyByKey(key);
      if (!legacy) { missing.add(key); return; }
      missing.delete(key);
      syncPair(el, legacy);
      el.__bridged = true;
      bridgedPairs.push({key, newSel: describeEl(el), legacySel: describeEl(legacy)});
      bound++;
    });
    if (bound>0 && !wiredOnce.info) { console.info('[AMA-bridge] bridged:', bound); wiredOnce.info=true; }
    return bound>0 ? 'ok' : 'pending';
  }

  function describeEl(el){
    if (!el) return '';
    const id = el.id ? '#'+el.id : '';
    const cls = (el.className && typeof el.className==='string') ? '.'+el.className.trim().split(/\s+/).slice(0,2).join('.') : '';
    return el.tagName.toLowerCase()+id+cls;
  }

  (function wait(t0=performance.now()){
    const res = tryBind();
    if (res==='ok') return;
    if (performance.now()-t0 > MAX) {
      if (missing.size) console.warn('[AMA-bridge] timeout: missing', Array.from(missing));
      return;
    }
    setTimeout(()=>wait(t0), STEP);
  })();

  const mo = new MutationObserver(()=> tryBind());
  mo.observe(document.documentElement, {subtree:true, childList:true, attributes:false});

  window.__amaBridgePairs = function(){ return bridgedPairs.slice(); };
})();
