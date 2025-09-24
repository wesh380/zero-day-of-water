(function(){
  window.waitForVisible = function(sel, timeout=5000){
    return new Promise((res,rej)=>{
      const t0=performance.now();
      (function tick(){
        const el=document.querySelector(sel);
        if(el && el.offsetParent!==null) return res(el);
        if(performance.now()-t0>timeout) return rej(new Error('waitForVisible timeout: '+sel));
        requestAnimationFrame(tick);
      })();
    });
  };
})();
