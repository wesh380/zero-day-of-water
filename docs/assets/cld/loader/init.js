;(function (W){
  var CORE = W.CLD_CORE || {};
  var UI   = W.CLD_UI   || {};
  function bootstrap(opts){
    opts = opts || {};
    var cy = opts.cy, layout = opts.layout || null, model = opts.model;
    // Try to find the container for visibility/height guards
    var container = null;
    try { container = (typeof document!=='undefined') ? (document.querySelector('#cy, #graph, .cy-root, .cy-container') || null) : null; }
    catch(_){ container = null; }
    if (!container) { try { console.error('[CLD][container] not found; expected #cy or #graph or .cy-root/.cy-container'); } catch(_){ } }
    if (CORE.initCore && cy){ CORE.initCore({ cy: cy, layout: layout }); }
    // Mirror the core's cy instance to global/safe accessors to avoid duplicates
    try {
      var coreCy = (CORE && typeof CORE.getCy === 'function') ? CORE.getCy() : (cy || null);
      if (coreCy) {
        W.CLD_SAFE = W.CLD_SAFE || {};
        W.CLD_SAFE.cy = coreCy;
        if (!W.__cy) W.__cy = coreCy;
        W.lastCy = coreCy;
        if (!W._cyDom && (!W.cy || W.cy !== coreCy)) W.cy = coreCy;
      }
    } catch (_) {}
    if (CORE.setModel && model){ try{ W.__lastSetModelCounts = CORE.setModel(model); }catch(_){ } }
    // ensure visible height
    try {
      if (container) {
        var rect = container.getBoundingClientRect ? container.getBoundingClientRect() : { width:0, height:0 };
        var styles = (typeof getComputedStyle==='function') ? getComputedStyle(container) : null;
        var hidden = (rect && (rect.height === 0)) || (styles && (styles.display === 'none' || styles.visibility === 'hidden'));
        if (hidden) {
          try { container.classList && container.classList.add('cld-force-visible'); } catch(_){ }
        }
      }
    } catch(_){ }
    UI.bindControls && UI.bindControls(document);
    UI.bindSearch   && UI.bindSearch(document);
    UI.renderLegend && UI.renderLegend(document.querySelector('#legend'));
    return W.__lastSetModelCounts || null;
  }
  W.CLD_LOADER = Object.assign({}, W.CLD_LOADER||{}, { bootstrap: bootstrap });
  // Debug: دسترسی به Loader در پنجره
  try { W.LOADER = Object.assign({}, W.LOADER || {}, { bootstrap: bootstrap }); } catch(_){ }
})(typeof window!=='undefined'?window:this);

