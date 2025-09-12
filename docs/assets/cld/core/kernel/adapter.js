(function(){
  if (!window.waterKernel) return;

  function safeLayout(cy){
    if (!cy) return;
    if (safeLayout._inflight) return;
    safeLayout._inflight = true;
    requestAnimationFrame(() => {
      try {
        cy.resize();
        cy.fit();
        cy.layout({ name:'dagre', nodeSep:40, edgeSep:20, rankSep:60, animate:false }).run();
      } finally {
        safeLayout._inflight = false;
      }
    });
  }

  window.waterKernel.onceReady('cy', (cy) => {
    const el = document.getElementById('cy');
    if (el && 'ResizeObserver' in window){
      const ro = new ResizeObserver(() => safeLayout(cy));
      ro.observe(el);
    }
    window.waterKernel.onReady('MODEL_LOADED', () => safeLayout(cy));
    window.waterKernel.onReady('GRAPH_READY', () => safeLayout(cy));
  });
})();

