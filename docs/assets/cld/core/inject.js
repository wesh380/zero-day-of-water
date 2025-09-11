(function(){
  // Unified Cytoscape injection utility (global-safe)
  // Usage: CLD_CORE.inject(cy, elementsArray)
  try{ window.CLD_CORE = window.CLD_CORE || {}; }catch(_){ return; }
  if (window.CLD_CORE.inject) return;
  window.CLD_CORE.inject = function(cy, elements){
    if (!cy || !elements || !Array.isArray(elements)) return;
    if (typeof cy.startBatch === 'function') try{ cy.startBatch(); }catch(_){ }
    try { cy.add(elements); }
    finally { if (typeof cy.endBatch === 'function') try{ cy.endBatch(); }catch(_){ } }
  };
})();

