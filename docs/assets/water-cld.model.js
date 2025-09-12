// External model definition for CLD bootstrap (avoids inline script)
(function(){
  try{
    // Minimal model to guarantee visible graph; replace with real data as needed
    window.DATA_MODEL = {
      nodes: [ { id: 'A', label: 'Alpha' }, { id: 'B', label: 'Beta' } ],
      edges: [ { source: 'A', target: 'B', sign: '+' } ]
    };
  }catch(_){ /* no-op */ }
})();

