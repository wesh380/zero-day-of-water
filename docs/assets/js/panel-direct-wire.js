;(function(){
  const A = window.AMA = window.AMA || {};
  A.flags = A.flags || {};
  A.flags.useDomBridge = false;

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

  function ensureOn(key, retries = 20){
    if (setOn(key, true)) return;
    if (retries > 0) setTimeout(() => ensureOn(key, retries - 1), 250);
  }

  function $checkbox(el){
    return el && (el.matches && el.matches('input[type="checkbox"]'))
      ? el
      : el && el.querySelector && el.querySelector('input[type="checkbox"]');
  }

  function updateUi(key, on){
    const el = document.querySelector(`[data-layer-toggle="${key}"]`);
    if(!el) return;
    const cb = $checkbox(el);
    if (cb){
      cb.checked = !!on;
      el.setAttribute('aria-checked', on ? 'true':'false');
      el.classList.toggle('muted', !on);
    } else {
      el.setAttribute('aria-pressed', on ? 'true':'false');
      el.classList.toggle('muted', !on);
    }
  }

  function syncUi(){
    document.querySelectorAll('[data-layer-toggle]').forEach(el=>{
      const key = (el.getAttribute('data-layer-toggle')||'').trim();
      if(key) updateUi(key, isOn(key));
    });
  }

  function bind(){
    document.querySelectorAll('[data-layer-toggle]').forEach(el=>{
      const key = (el.getAttribute('data-layer-toggle')||'').trim();
      if(!key) return;

      const cb = $checkbox(el);

      if (cb){
        cb.checked = isOn(key);
        cb.addEventListener('change', (e)=>{
          setOn(key, cb.checked);
          e.stopPropagation();
        });
        cb.__bridged = true;
        el.__bridged = true;  // علامت‌گذاری label هم به عنوان bridged
      } else {
        el.addEventListener('click', (e)=>{
          const on = el.getAttribute('aria-pressed') !== 'true';
          setOn(key, on);
          e.preventDefault();
        });
        el.__bridged = true;
      }
    });
    syncUi();
    setTimeout(syncUi, 0);
  }

  A.initPanelDirectWire = function(){
    if (!document.querySelector('[data-layer-toggle]')) return;
    bind();
  };

  window.__amaBridgePairs = function(){
    const pairs = [];
    document.querySelectorAll('[data-layer-toggle]').forEach(el=>{
      const key = (el.getAttribute('data-layer-toggle')||'').trim();
      const grp = G()[key];
      const m = map();
      pairs.push({
        key,
        element: el.tagName.toLowerCase()+'#'+(el.id||''),
        bridged: !!el.__bridged,
        hasGroup: !!grp,
        onMap: !!(m && grp && m.hasLayer(grp))
      });
    });
    return pairs;
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    if (document.querySelector('[data-layer-toggle]')) {
      A.initPanelDirectWire();
    }
  });
})();
