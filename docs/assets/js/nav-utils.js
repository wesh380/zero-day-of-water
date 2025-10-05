(function(){
  const el = document.querySelector('[data-back-button]');
  if(!el) return;
  try{
    const ref = document.referrer;
    const sameOrigin = ref && new URL(ref).origin === location.origin;
    const canGoBack = history.length > 1;
    if (sameOrigin && canGoBack){
      el.addEventListener('click', (e)=>{
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        history.back();
      });
      el.setAttribute('href', ref);
      el.dataset.mode = 'history';
    } else {
      el.setAttribute('href','/');
      el.dataset.mode = 'home';
    }
  }catch(_){
    el.setAttribute('href','/');
    el.dataset.mode = 'home';
  }
})();
