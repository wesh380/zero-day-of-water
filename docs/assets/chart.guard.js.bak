(function(){
  if (window.__CHART_GUARD__) return; window.__CHART_GUARD__ = true;

  function getInst(idOrCtx){
    try{
      if (!window.Chart) return null;
      const byApi = (Chart.getChart && Chart.getChart(idOrCtx)) || null;
      if (byApi) return byApi;
      const list = Chart.instances ? Object.values(Chart.instances) : [];
      return list.find(ch => ch && ch.canvas && (ch.canvas === idOrCtx || ch.canvas?.id === idOrCtx)) || null;
    }catch(_){ return null; }
  }
  function safeDestroy(idOrCtx){
    try{ const inst = getInst(idOrCtx); if (inst && inst.destroy) inst.destroy(); }catch(_){}}
  function dedupeCanvas(id){
    try{
      const nodes = document.querySelectorAll('#'+CSS.escape(id));
      for (let i=1;i<nodes.length;i++){ nodes[i].parentNode?.removeChild(nodes[i]); }
    }catch(_){}}

  // Public helper (optional usage by app)
  window.__ensureSimChart = function(config){
    const id = (config && config.canvasId) || 'sim-chart';
    const cv = document.getElementById(id);
    if (!cv) return null;
    dedupeCanvas(id);
    safeDestroy(id);
    const ctx = cv.getContext('2d');
    safeDestroy(ctx);
    return new Chart(ctx, config?.options || config);
  };

  // Patch a global initSimChart if present
  const patch = function(){
    if (typeof window.initSimChart === 'function' && !window.__CHART_INIT_PATCHED__){
      const orig = window.initSimChart;
      window.initSimChart = function(...args){
        safeDestroy('sim-chart');
        const cv = document.getElementById('sim-chart');
        if (cv) try{ safeDestroy(cv.getContext('2d')); }catch(_){ }
        return orig.apply(this, args);
      };
      window.__CHART_INIT_PATCHED__ = true;
    }
  };
  patch();
  document.addEventListener('model:updated', patch, { once:true });
})();
