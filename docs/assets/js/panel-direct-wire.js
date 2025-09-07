;(function () {
  const A = (window.AMA = window.AMA || {}); A.flags = A.flags || {}; A.flags.useDomBridge = false;
  const G   = () => (typeof A.G === 'function' ? A.G() : (A.G || {}));
  const map = () => (window.__AMA_MAP && window.__AMA_MAP.map) || null;

  const $cb = el => el?.matches?.('input[type="checkbox"]') ? el : (el?.querySelector?.('input[type="checkbox"]') || null);
  const isOn = k => { const m=map(), g=G()[k]; return !!(m && g && m.hasLayer && m.hasLayer(g)); };
  const setOn = (k,on)=>{ const m=map(), g=G()[k]; if(!m||!g) return false; const cur=isOn(k); if(on&&!cur) g.addTo(m); if(!on&&cur) m.removeLayer(g); updateUi(k,on); return true; };

  function updateUi(k,on){
    const el = document.querySelector(`[data-layer-toggle="${k}"]`); if(!el) return;
    const cb = $cb(el);
    if (cb){ cb.checked=!!on; el.setAttribute('aria-checked', on?'true':'false'); }
    else    { el.setAttribute('aria-pressed', on?'true':'false'); }
    el.classList.toggle('muted', !on);
  }

  function bind(){
    document.querySelectorAll('[data-layer-toggle]').forEach(el=>{
      const k=(el.getAttribute('data-layer-toggle')||'').trim(); if(!k) return;
      const cb=$cb(el);
      if (cb){
        cb.checked = isOn(k);
        cb.addEventListener('change', e => { setOn(k, cb.checked); e.stopPropagation(); });
      } else {
        el.addEventListener('click', e => { const on = el.getAttribute('aria-pressed')!=='true'; setOn(k,on); e.preventDefault(); });
      }
      updateUi(k, isOn(k));
    });
  }

  function syncUi(){
    document.querySelectorAll('[data-layer-toggle]').forEach(el=>{
      const k=(el.getAttribute('data-layer-toggle')||'').trim(); updateUi(k, isOn(k));
    });
  }

  function ready(){
    const g = (window.__AMA_MAP && window.__AMA_MAP.groups)||{};
    return g.counties || g.province || g.wind || g.solar || g.dams;
  }

  document.addEventListener('ama:groups-ready', ()=>{ bind(); syncUi(); });
  if(ready()) bind();
})();
