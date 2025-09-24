(function(){
  window.waitForVisible = function(sel, timeout=5000){
    return new Promise((resolve,reject)=>{
      const t0 = performance.now();
      (function tick(){
        const el = document.querySelector(sel);
        if (el && el.offsetParent !== null) return resolve(el);
        if (performance.now()-t0 > timeout) return reject(new Error('waitForVisible timeout: '+sel));
        requestAnimationFrame(tick);
      })();
    });
  };
})();