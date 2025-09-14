(function(){
  if (window.__CLD_ADDCLASS_PATCH__) return; window.__CLD_ADDCLASS_PATCH__ = true;

  function patch(){
    try{
      var proto = window.cytoscape && window.cytoscape.Collection && window.cytoscape.Collection.prototype;
      if (!proto || proto.__CLD_ADDCLASS_PATCHED__) return;
      var orig = proto.addClass;
      proto.addClass = function(cls){
        try{
          if (window.CLD_SAFE && typeof window.CLD_SAFE.safeAddClass === 'function'){
            window.CLD_SAFE.safeAddClass(this, cls, orig);
          } else {
            orig.call(this, cls);
          }
        }catch(_){ }
        return this;
      };
      proto.__CLD_ADDCLASS_PATCHED__ = true;
    }catch(_){ }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', patch, { once:true });
  } else {
    patch();
  }
  document.addEventListener('cy:ready', patch);
})();

