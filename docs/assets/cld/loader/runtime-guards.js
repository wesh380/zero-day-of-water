(function(){
  if (window.__CLD_RT_GUARD__) return; window.__CLD_RT_GUARD__=true;

  // Run callback once Cytoscape instance is ready
  if (!window.onCyReady) {
    window.__CLD_READY__ = false;
    window.onCyReady = function(run){
      const tryRun = (cy) => { if (cy && typeof run==='function') { try{ run(cy); }catch(_){}} };
      const c0 = getCy();
      if (c0 && typeof c0.on==='function') { tryRun(c0); return; }
      if (!window.__CLD_READY__){
        window.__CLD_READY__ = true;
        document.addEventListener('cy:ready', (e)=> tryRun((e && e.detail && e.detail.cy) || getCy()), { once:true });
        if (window.whenModelReady) window.whenModelReady(()=> tryRun(getCy()));
        if (document.readyState !== 'loading') setTimeout(()=> tryRun(getCy()), 0);
        else document.addEventListener('DOMContentLoaded', ()=> tryRun(getCy()), { once:true });
      }
    };
  }

  // lightweight debounce
  if (!window.__cldDebounce) {
    window.__cldDebounce = function(fn, ms=60){ let t=0; return function(){ const a=arguments; clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), ms); }; };
  }

  // safe fit
  if (!window.__cldSafeFit) {
    window.__cldSafeFit = function(cy){ try{ const els = cy?.elements(); if (!els || els.length===0) return; cy.fit(els, 40);}catch(_){} };
  }
})();
