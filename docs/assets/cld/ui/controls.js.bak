;(function (W){
  var CORE = W.CLD_CORE || {};
  function bindControls(root){ 
    root = root || document;
    var dagreBtn = root.querySelector('[data-layout="dagre"]');
    var elkBtn   = root.querySelector('[data-layout="elk"]');
    var hideDisc = root.querySelector('[data-filter="hideDisconnected"]');
    dagreBtn && dagreBtn.addEventListener('click', function(){ CORE.runLayout && CORE.runLayout('dagre', {}); });
    elkBtn   && elkBtn.addEventListener('click',   function(){ CORE.runLayout && CORE.runLayout('elk',   {}); });
    hideDisc && hideDisc.addEventListener('change',function(e){ CORE.applyFilters && CORE.applyFilters({ hideDisconnected: !!e.target.checked }); });
  }
  W.CLD_UI = Object.assign({}, W.CLD_UI||{}, { bindControls: bindControls });
})(typeof window!=='undefined'?window:this);

