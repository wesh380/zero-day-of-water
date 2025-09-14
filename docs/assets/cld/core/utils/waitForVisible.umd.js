(function ensureVisibleUtils(){
  if (!window.hasSize) window.hasSize = function(el, minW=80, minH=80){
    return !!el && el.offsetParent !== null && el.offsetWidth>=minW && el.offsetHeight>=minH;
  };
  if (!window.waitForVisible) window.waitForVisible = function(el,{minW=80,minH=80,timeout=10000}={}){
    return new Promise((resolve,reject)=>{
      const ok=()=>window.hasSize(el,minW,minH);
      if (ok()) return resolve();
      let ro,mo,io,raf,to=setTimeout(()=>{cleanup();reject(new Error('waitForVisible timeout'))},timeout);
      const cleanup=()=>{clearTimeout(to); ro&&ro.disconnect(); mo&&mo.disconnect(); io&&io.disconnect(); raf&&cancelAnimationFrame(raf);}
      try{ ro=new ResizeObserver(()=>ok()&&(cleanup(),resolve())); ro.observe(el);}catch{}
      try{ mo=new MutationObserver(()=>ok()&&(cleanup(),resolve())); mo.observe(document.documentElement,{attributes:true,subtree:true});}catch{}
      try{ if('IntersectionObserver'in window){ io=new IntersectionObserver(e=>e.some(x=>x.isIntersecting)&&ok()&&(cleanup(),resolve())); io.observe(el);} }catch{}
      (function tick(){ ok()? (cleanup(),resolve()) : (raf=requestAnimationFrame(tick)); }());
    });
  };
}());
