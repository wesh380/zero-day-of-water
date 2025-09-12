;(function (W){
  var CORE = W.CLD_CORE || {};
  var UI   = W.CLD_UI   || {};
  function bootstrap(opts){
    opts = opts || {};
    var cy = opts.cy, layout = opts.layout || null, model = opts.model;
    if (CORE.initCore && cy){ CORE.initCore({ cy: cy, layout: layout }); }
    if (CORE.setModel && model){ try{ W.__lastSetModelCounts = CORE.setModel(model); }catch(_){ } }
    UI.bindControls && UI.bindControls(document);
    UI.bindSearch   && UI.bindSearch(document);
    UI.renderLegend && UI.renderLegend(document.querySelector('#legend'));
    return W.__lastSetModelCounts || null;
  }
  W.CLD_LOADER = Object.assign({}, W.CLD_LOADER||{}, { bootstrap: bootstrap });
})(typeof window!=='undefined'?window:this);

