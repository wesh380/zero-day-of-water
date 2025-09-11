(function(){
  if (window.__GRAPH_STORE__) return; window.__GRAPH_STORE__ = true;
  'use strict';

  // Tiny emitter (no deps)
  function Evt(){ this._ = Object.create(null); }
  Evt.prototype.on  = function(k,fn){ (this._[k]||(this._[k]=[])).push(fn); return fn; };
  Evt.prototype.off = function(k,fn){ var a=this._[k]; if(!a) return; var i=a.indexOf(fn); if(i>-1) a.splice(i,1); };
  Evt.prototype.emit= function(k,p){ var a=this._[k]||[]; for(var i=0;i<a.length;i++){ try{ a[i](p); }catch(_){}} };

  var ev  = new Evt();
  var cy  = null;
  var st  = 'BOOT';        // BOOT → CY_READY → GRAPH_READY
  var q   = [];            // deferred actions until CY_READY
  var rdy = [];            // resolve fns for ready()
  var graph = { nodes: [], edges: [] };

  function setStatus(s){ st=s; ev.emit('status', s); }

  function hasBatch(){ return cy && typeof cy.startBatch === 'function' && typeof cy.endBatch === 'function'; }

  function safeRun(fn, opt){
    if (cy){
      if (opt && opt.batch && hasBatch()){ try{ cy.startBatch(); }catch(_){ } }
      var out; try{ out = fn(cy); }catch(_){ }
      if (opt && opt.batch && hasBatch()){ try{ cy.endBatch(); }catch(_){ } }
      return out;
    }
    q.push({ fn: fn, opt: opt||{} });
  }

  function flush(){
    if (!cy) return;
    // drain queued tasks
    for (var i=0;i<q.length;i++){
      var t=q[i];
      try { safeRun(t.fn,t.opt); } catch(_){ }
    }
    q.length=0;
    while(rdy.length){ try{ rdy.shift()(cy); }catch(_){ } }
  }

  // install hooks for present/future cytoscape instances
  function watchFactory(){
    if (!window.cytoscape || window.cytoscape.__GRAPH_STORE_WRAPPED__) return;
    var factory = window.cytoscape;
    window.cytoscape = function(){
      var inst = factory.apply(this, arguments);
      try{ adopt(inst); }catch(_){ }
      return inst;
    };
    window.cytoscape.__GRAPH_STORE_WRAPPED__ = true;
  }

  function adopt(inst){
    if (!inst || inst === cy) return;
    cy = inst;
    setStatus('CY_READY');
    ev.emit('cy', cy);
    window.CLD_SAFE = window.CLD_SAFE || {};
    window.CLD_SAFE.cy = cy;
    // mirror on window only if no conflicting DOM property
    if (!window._cyDom){
      try{
        Object.defineProperty(window, 'cy', {
          configurable: true,
          get: function(){ return cy; },
          set: function(v){ try{ adopt(v); }catch(_){ } }
        });
      }catch(_){
        // قدیمی‌ترین fallback
        window.cy = cy;
      }
    }
    flush();
  }

  // PUBLIC API
  var api = {
    init: function(opts){
      // if a cy instance already exists and container changed, destroy it
      if (cy && opts && opts.container){
        try{ cy.destroy(); }catch(_){ }
        cy = null;
      }
      // create if factory exists & no cy
      if (!cy && typeof window.cytoscape === 'function' && opts && opts.container){
        try{ adopt(window.cytoscape(opts)); }catch(_){ }
      }
      return this;
    },
    destroy: function(){
      if (!cy) return this;
      try{ cy.destroy(); }catch(_){ }
      cy=null;
      setStatus('BOOT');
      return this;
    },
    restore: function(json){
      if (!json) return this;
      // prefer safe-add/json if guards exist
      return safeRun(function(cy){
        if (json && json.elements){
          // Normalize to array-of-elements
          var arr = (window.CLD_MAP && typeof window.CLD_MAP.coerceElements === 'function')
            ? window.CLD_MAP.coerceElements(json)
            : ([]).concat(json.elements.nodes||[], json.elements.edges||[]);
          try{
            if (hasBatch()) cy.startBatch();
            cy.elements().remove();
          } finally { if (hasBatch()) try{ cy.endBatch(); }catch(_){ } }
          if (window.CLD_CORE && typeof window.CLD_CORE.inject === 'function') {
            window.CLD_CORE.inject(cy, arr);
          } else {
            if (hasBatch()) cy.startBatch();
            try{ cy.add(arr); } finally { if (hasBatch()) try{ cy.endBatch(); }catch(_){ } }
          }
        } else if (Array.isArray(json)){
          if (hasBatch()) cy.startBatch();
          try{ cy.add(json); } finally { if (hasBatch()) try{ cy.endBatch(); }catch(_){ } }
        }
      }, { batch:false }), this;
    },
    run: function(fn, opt){ return safeRun(fn, opt); },
    get: function(){ return cy; },
    on: function(k,fn){ return ev.on(k,fn); },
    off: function(k,fn){ return ev.off(k,fn); },
    status: function(){ return st; },
    ready: function(){
      return new Promise(function(res){
        if (cy) res(cy); else rdy.push(res);
      });
    },
    setGraph: function(g){
      graph = g || { nodes: [], edges: [] };
      this.graph = graph;
      try{ window.kernel = window.kernel || {}; window.kernel.graph = graph; }catch(_){ }
      return graph;
    },
    getGraph: function(){ return graph; },
    graph: graph
  };

  // expose
  window.graphStore = window.graphStore || api;

  // wiring for current/future instances
  var initCy = getCy();
  if (initCy) adopt(initCy);
  document.addEventListener('cy:ready', function(e){ try{ adopt(e && e.detail && e.detail.cy); }catch(_){ } });
  document.addEventListener('cld:ready', function(e){ try{ adopt(e && e.detail && e.detail.cy); }catch(_){ } });
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', watchFactory, { once:true });
  } else { watchFactory(); }
})();
