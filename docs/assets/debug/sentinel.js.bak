(function(g){
  g = g || (typeof window !== 'undefined' ? window : globalThis);
  g.CLD_SAFE = g.CLD_SAFE || {};
  g.getCy = g.getCy || function(){ return g.CLD_SAFE && g.CLD_SAFE.cy; };
  // Ensure there is a global variable/property named CLD_SAFE so that
  // optional chaining like `CLD_SAFE?.safeAddClass` does not throw a ReferenceError.
  // Use globalThis (or window) to define the property once.
  try {
    const root = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : g);
    if (!('CLD_SAFE' in root)) {
      root.CLD_SAFE = g.CLD_SAFE;
    }
  } catch (_) { /* ignore */ }
  let warnCount = 0;
  g.CLD_SAFE.safeAddClass = function(target, cls, direct){
    try{
      if (!target) throw new Error('null target');
      if (typeof direct === 'function') return direct.call(target, cls);
      if (typeof target.addClass === 'function') return target.addClass(cls);
      if (target.classList && typeof target.classList.add === 'function') return target.classList.add(cls);
      if (Array.isArray(target) || (target.length >= 0 && typeof target !== 'string')){
        for (let i=0;i<target.length;i++){ g.CLD_SAFE.safeAddClass(target[i], cls); }
        return;
      }
      throw new Error('unsupported target');
    }catch(e){
      if (++warnCount % 10 === 1) console.debug('[CLD_SAFE] safeAddClass fallback:', e.message);
    }
  };
  function mark(cls){
    var el = (document && (document.documentElement || document.body));
    if (el) g.CLD_SAFE.safeAddClass(el, cls);
  }
  function detect(){
    if (!document || !document.createElement){ return; }
    var ok = !!(window.cytoscape && window.elk && window.dagre && window.Chart && window.exprEval && window.tippy && window.Popper);
    mark(ok ? 'vendor-ok' : 'vendor-missing');
  }
  function logState(){
    try{
      var cyEl = document.getElementById('cy');
      var info = {
        kernel: !!g.kernel,
        nodes: g.kernel?.graph?.nodes?.length || 0,
        storeGraph: !!(g.graphStore && g.graphStore.graph),
        cy: !!cyEl,
        width: cyEl?.offsetWidth || 0,
        height: cyEl?.offsetHeight || 0
      };
      console.table(info);
      if (cyEl && (info.width === 0 || info.height === 0)) {
        g.CLD_SAFE.safeAddClass(cyEl, 'cy-force-size');
      }
    }catch(e){ console.warn('[sentinel] logState', e); }
  }
  if (g.kernelReady && typeof g.kernelReady.then === 'function'){
    g.kernelReady.then(logState);
  }
  if (typeof document === 'undefined'){ return; }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', detect, { once:true });
  } else {
    detect();
  }
})(typeof window !== 'undefined' ? window : globalThis);
