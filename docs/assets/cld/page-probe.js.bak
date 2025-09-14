(function(){
  function pickCy(){
    var fromFacade = (window.CLD_CORE && typeof window.CLD_CORE.getCy==='function') ? window.CLD_CORE.getCy() : null;
    var fromHidden = window.__cy || null;
    var fromGlobal = (window.cy && typeof window.cy.nodes==='function') ? window.cy : null;
    return { fromFacade: fromFacade, fromHidden: fromHidden, fromGlobal: fromGlobal };
  }
  setTimeout(function(){
    try {
      var C = pickCy();
      function cnt(x){ try { return x ? { n:x.nodes().length, e:x.edges().length } : null; } catch(_){ return null; } }
      console.log('[DEBUG page] counts facade/hidden/global', cnt(C.fromFacade), cnt(C.fromHidden), cnt(C.fromGlobal));
    } catch(e){ console.error('[DEBUG page] count error', e); }
  }, 500);
})();
