;(function (W){
  function renderLegend(container){ 
    container = container || document.querySelector('#legend');
    if (!container) return;
    // رفتار فعلی را تغییر نده؛ فقط جای خالی نگه‌دار.
    // محتوای لگند موجود را در فاز بعدی منتقل کن.
  }
  W.CLD_UI = Object.assign({}, W.CLD_UI||{}, { renderLegend: renderLegend });
})(typeof window!=='undefined'?window:this);

