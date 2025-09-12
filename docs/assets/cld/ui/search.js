;(function (W){
  function bindSearch(root){ 
    root = root || document;
    var box = root.querySelector('[data-search="node"]');
    if (!box) return;
    // TODO: در فاز بعدی به API انتخاب/فیلتر Facade وصل شود؛ فعلاً no-op.
  }
  W.CLD_UI = Object.assign({}, W.CLD_UI||{}, { bindSearch: bindSearch });
})(typeof window!=='undefined'?window:this);

