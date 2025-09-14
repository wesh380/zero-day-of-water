(function(){
  if (window.__CY_ALIAS__) return; window.__CY_ALIAS__ = true;

  function define(){
    try{
      Object.defineProperty(window, 'c', {
        configurable: true,
        get: function(){ return getCy(); },
        // به‌جای set روی window.cy (که قبلاً باعث TypeError می‌شد)،
        // فقط نمونه را در متغیرهای داخلی نگه می‌داریم و سیگنال cy:ready می‌فرستیم.
        set: function(v){
          try{
            window.CLD_SAFE = window.CLD_SAFE || {};
            window.CLD_SAFE.cy = v;
            window.__cy = v;
            window.lastCy = v;
            if (!window._cyDom) window.cy = v;
            document.dispatchEvent(new CustomEvent('cy:ready', { detail:{ cy: v } }));
            document.dispatchEvent(new CustomEvent('cld:ready', { detail:{ cy: v } }));
          }catch(_){}}
      });
    }catch(_){ window.c = getCy(); }
  }

  define();
  document.addEventListener('cy:ready', define);
  document.addEventListener('cld:ready', define);

  // microtask/tick: اگر cy آماده است، رویداد را یک‌بار دیگر پخش کن
  setTimeout(function(){
    try{
      const c = getCy();
      if (c && typeof c.add === 'function') {
        document.dispatchEvent(new CustomEvent('cy:ready', { detail:{ cy: c } }));
        document.dispatchEvent(new CustomEvent('cld:ready', { detail:{ cy: c } }));
      }
    }catch(_){}
  }, 0);
})();
