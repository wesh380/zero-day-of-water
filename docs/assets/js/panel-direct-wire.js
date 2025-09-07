;(function(){
  const A = window.AMA = window.AMA || {};
  A.flags = A.flags || {};
  A.flags.useDomBridge = false; // پل قدیمی را خاموش کن

  function G(){ return (A.G)||{} }
  function map(){ return window.__AMA_MAP }

  function isOn(key){
    const m = map(), g = G()[key];
    return !!(m && g && m.hasLayer(g));
  }
  function setOn(key, on){
    const m = map(), g = G()[key]; if(!m || !g) return false;
    const cur = isOn(key);
    if (on && !cur) g.addTo(m);
    if (!on && cur) m.removeLayer(g);
    updateUi(key, on);
    return true;
  }
  function updateUi(key, on){
    const el = document.querySelector(`[data-layer-toggle="${key}"]`);
    if(!el) return;
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.classList.toggle('muted', !on);
    const cb = el.matches('input[type="checkbox"]') ? el : el.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = !!on;
  }
  function syncUi(){
    ['wind','solar','dams','counties','province'].forEach(k=> updateUi(k, isOn(k)));
  }
  function bind(){
    document.querySelectorAll('[data-layer-toggle]').forEach(el=>{
      const key = (el.getAttribute('data-layer-toggle')||'').trim();
      if(!key) return;

      // دکمه‌ها
      el.addEventListener('click', (e)=>{
        if (el.type !== 'checkbox'){
          const on = el.getAttribute('aria-pressed') !== 'true';
          setOn(key, on);
          e.preventDefault();
        }
      });

      // چک‌باکس‌ها
      el.addEventListener('change', ()=>{
        const on = el.type === 'checkbox' ? el.checked : (el.getAttribute('aria-pressed') !== 'true');
        setOn(key, on);
      });
    });
    // یک همگام‌سازی ابتدای کار
    syncUi();
    // یک بار دیگر بعد از enforceDefaultVisibility
    setTimeout(syncUi, 0);
  }

  A.initPanelDirectWire = function(){
    if (!document.querySelector('[data-layer-toggle]')) return;
    bind();
  };

  // Auto-init بعد از DOM آماده
  document.addEventListener('DOMContentLoaded', ()=> {
    if (document.querySelector('[data-layer-toggle]')) A.initPanelDirectWire();
  });
})();
