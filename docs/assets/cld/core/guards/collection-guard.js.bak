/* singleton, idempotent */
(function(){
  if (window.__CY_COLL_GUARD__) return; window.__CY_COLL_GUARD__ = true;

  function install(cy){
    if (!cy || cy.__SAFE_COLL_INSTALLED__) return;
    const pending = []; // { selectorPath: string[], method: string, args: any[] }

    function ensureListeners(){
      if (cy.__SAFE_COLL_LISTENERS__) return;
      cy.on('add', '*', function(){
        try{
          if (!pending.length) return;
          // Try apply pending ops whose selector now matches something
          for (let i = pending.length - 1; i >= 0; i--){
            const p = pending[i];
            const sel = p.selectorPath.join('');
            const coll = cy.$(sel);
            if (coll.length > 0){
              const fn = coll[p.method];
              if (typeof fn === 'function') try{ fn.apply(coll, p.args); }catch(_){ }
              pending.splice(i,1);
            }
          }
        }catch(_){ }
      });
      cy.__SAFE_COLL_LISTENERS__ = true;
    }

    // Build a wrapped collection with index-safe access and queue-on-empty actions
    function wrapCollection(coll, selectorPath){
      if (!coll) coll = cy.collection();
      if (coll.__SAFE_WRAPPED__) return coll;

      selectorPath = selectorPath || ['']; // default to empty selector

      const actions = ['add','remove','addClass','removeClass','toggleClass','style','data','animate','layout','move'];
      const chainers = ['filter']; // extend if needed

      const handler = {
        get(target, prop){
          // numeric index → return a "singular" proxy that delegates to the collection methods
          if (typeof prop === 'string' && /^\d+$/.test(prop)){
            // return an object exposing actions; if empty → queue
            const singular = {};
            actions.forEach(m=>{
              singular[m] = function(){
                if (target.length > 0){
                  const els = target; // first element's collection-like methods exist on collection as well
                  const fn  = els[m];
                  if (typeof fn === 'function') return fn.apply(els, arguments);
                } else {
                  pending.push({ selectorPath, method: m, args: Array.prototype.slice.call(arguments) });
                  ensureListeners();
                }
                return singular;
              };
            });
            return singular;
          }

          if (actions.includes(prop)){
            return function(){
              if (target.length > 0){
                const fn = target[prop];
                if (typeof fn === 'function') return fn.apply(target, arguments);
              } else {
                pending.push({ selectorPath, method: prop, args: Array.prototype.slice.call(arguments) });
                ensureListeners();
              }
              return wrapCollection(target, selectorPath);
            };
          }

          if (chainers.includes(prop)){
            return function(){
              const args = Array.prototype.slice.call(arguments);
              // best-effort: only string selector paths are supported for queuing
              const selToken = (typeof args[0] === 'string') ? args[0] : '';
              const nextPath = selectorPath.concat([ selToken ]);
              const next = target[prop].apply(target, args);
              return wrapCollection(next, nextPath);
            };
          }

          const val = target[prop];
          return (typeof val === 'function') ? val.bind(target) : val;
        }
      };

      const proxy = new Proxy(coll, handler);
      proxy.__SAFE_WRAPPED__ = true;
      return proxy;
    }

    // wrap factory-like selectors on the cy instance
    const orig = {
      elements: cy.elements.bind(cy),
      nodes:    cy.nodes.bind(cy),
      edges:    cy.edges.bind(cy),
      $:        cy.$.bind(cy),
      getElementById: cy.getElementById.bind(cy),
      collection: cy.collection.bind(cy)
    };

    cy.elements = function(sel){
      const s = (typeof sel === 'string') ? sel : undefined;
      return wrapCollection(orig.elements(s), [s || '']);
    };
    cy.nodes = function(sel){
      const s = (typeof sel === 'string') ? sel : undefined;
      return wrapCollection(orig.nodes(s), [s || '']);
    };
    cy.edges = function(sel){
      const s = (typeof sel === 'string') ? sel : undefined;
      return wrapCollection(orig.edges(s), [s || '']);
    };
    cy.$ = function(q){
      const s = (typeof q === 'string') ? q : undefined;
      return wrapCollection(orig.$(s), [s || '']);
    };
    cy.getElementById = function(id){
      // emulate a selector path that resolves to a single id
      return wrapCollection(orig.getElementById(id), ['[#'+id+']']);
    };

    cy.__SAFE_COLL_INSTALLED__ = true;
  }

  function tryInstall(){
    try{
      const c = getCy(); if (c) install(c);
      // also wrap future instances if created later
      if (window.cytoscape && !window.cytoscape.__SAFE_WRAP_COLLECTIONS__){
        const orig = window.cytoscape;
        window.cytoscape = function(){
          const inst = orig.apply(this, arguments);
          try{ install(inst); }catch(_){ }
          return inst;
        };
        window.cytoscape.__SAFE_WRAP_COLLECTIONS__ = true;
      }
    }catch(_){ }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', tryInstall, { once:true });
  } else {
    tryInstall();
  }
  document.addEventListener('cy:ready', function(e){ try{ install(e && e.detail && e.detail.cy); }catch(_){ } });
  document.addEventListener('cld:ready', function(e){ try{ install(e && e.detail && e.detail.cy); }catch(_){ } });
})();
