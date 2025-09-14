(function(){
  setTimeout(function(){
    try {
      var keys = window.CLD_CORE ? Object.keys(window.CLD_CORE) : [];
      if (window.__CLD_DEBUG__) console.log('[DEBUG page] CLD_CORE keys', keys);
    } catch(e){ console.error('[DEBUG page] CLD_CORE keys error', e); }
  }, 0);
})();
