/* docs/assets/js/panel-direct-wire.js */
;(function(){
  const A = window.AMA = window.AMA || {};
  A.flags = A.flags || {};
  A.flags.useDomBridge = false;

  function G(){ return (A.G && A.G()) || {} }
  function map(){ return (window.__AMA_MAP && window.__AMA_MAP.map) || null }

  function isOn(key){ const m = map(), g = G()[key]; return !!(m && g && typeof m.hasLayer==='function' && m.hasLayer(g)); }
  function $checkbox(el){ return el && el.matches && el.matches('input[type="checkbox"]') ? el : (el && el.querySelector && el.querySelector('input[type="checkbox"]')); }

  function updateUi(key, on){
    const el = document.querySelector(`[data-layer-toggle="${key}"]`);
    if(!el) return;
    const cb = $checkbox(el);
    if (cb){ cb.checked = !!on; el.setAttribute('aria-checked', on?'true':'false'); }
    el.classList.toggle('muted', !on);
    if (!cb){ el.setAttribute('aria-pressed', on?'true':'false'); }
  }

  function setOn(key, on){
    const m = map(), g = G()[key]; if(!m || !g) return false;
    const cur = isOn(key);
    if (on && !cur) g.addTo(m);
    if (!on && cur) m.removeLayer(g);
    updateUi(key, on);
    return true;
  }

  function bind(){
    document.querySelectorAll('[data-layer-toggle]').forEach(el=>{
      const key = (el.getAttribute('data-layer-toggle')||'').trim();
      if(!key) return;
      const cb = $checkbox(el);
      if (cb){
        cb.checked = isOn(key);
        cb.addEventListener('change', (e)=>{ setOn(key, cb.checked); e.stopPropagation(); });
      } else {
        el.addEventListener('click', (e)=>{ const on = el.getAttribute('aria-pressed')!=='true'; setOn(key, on); e.preventDefault(); });
      }
      updateUi(key, isOn(key));
    });
  }

  function ready(){ return map() && Object.keys(G()).length>0; }

  A.initPanelDirectWire = function(){
    const start = performance.now(), MAX=12000, STEP=150;
    (function wait(){
      if (ready()){ bind(); return; }
      if (performance.now()-start > MAX) { console.warn('[AMA-panel] timeout waiting for panel/map'); return; }
      setTimeout(wait, STEP);
    })();
  };

  document.addEventListener('DOMContentLoaded', ()=>{ if (document.querySelector('[data-layer-toggle]')) A.initPanelDirectWire(); });
})();

