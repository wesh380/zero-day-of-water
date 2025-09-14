(function(){
  if (window.__CY_BATCH_GUARD__) return; window.__CY_BATCH_GUARD__ = true;

  function ensureBatchOnProto(){
    if (!window.cytoscape || !window.cytoscape.Core) return false;
    const P = window.cytoscape.Core.prototype;
    if (typeof P.startBatch !== 'function') P.startBatch = function(){ this.___batched = true; };
    if (typeof P.endBatch   !== 'function') P.endBatch   = function(){ this.___batched = false; };
    return true;
  }
  function ensureBatchOnInstance(cy){
    if (!cy) return;
    if (typeof cy.startBatch !== 'function') cy.startBatch = function(){ this.___batched = true; };
    if (typeof cy.endBatch   !== 'function') cy.endBatch   = function(){ this.___batched = false; };
  }
  function wrapFactory(){
    if (!window.cytoscape || window.cytoscape.__BATCH_WRAPPED__) return;
    const orig = window.cytoscape;
    window.cytoscape = function(...args){
      const inst = orig.apply(this, args);
      try{ ensureBatchOnProto(); ensureBatchOnInstance(inst); }catch(_){ }
      try{ document.dispatchEvent(new CustomEvent('cy:ready', { detail:{ cy: inst } })); }catch(_){ }
      return inst;
    };
    window.cytoscape.__BATCH_WRAPPED__ = true;
  }
  function patchAll(){
    ensureBatchOnProto();
    var c = getCy();
    if (c) ensureBatchOnInstance(c);
    wrapFactory();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', patchAll, { once:true });
  } else {
    patchAll();
  }
  document.addEventListener('cy:ready', function(e){
    ensureBatchOnProto();
    ensureBatchOnInstance(e && e.detail && e.detail.cy);
  });
  document.addEventListener('cld:ready', function(e){
    ensureBatchOnProto();
    ensureBatchOnInstance(e && e.detail && e.detail.cy);
  });
})();

