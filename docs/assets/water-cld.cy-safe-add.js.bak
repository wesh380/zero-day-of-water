(function(){
  if (window.__CY_SAFE_ADD__) return; window.__CY_SAFE_ADD__ = true;

  function install(cy){
    if (!cy || cy.__SAFE_ADD_INSTALLED__) return;

    const orig = {
      add:  cy.add.bind(cy),
      json: cy.json.bind(cy),
      $:    cy.$.bind(cy),
      id:   (id)=> cy.getElementById ? cy.getElementById(id) : cy.$('#'+id)
    };

    const pendingEdges = []; // { data, scratch, classes }

    function existsNode(id){
      if (id === undefined || id === null) return false;
      const col = orig.id(String(id));
      return !!(col && col.length && col.length > 0);
    }

    function isNode(el){ return el && (el.group === 'nodes' || (el.data && el.data.id && !el.data.source && !el.data.target)); }
    function isEdge(el){ return el && (el.group === 'edges' || (el.data && el.data.source && el.data.target)); }

    function normalize(input){
      if (typeof input === 'string') return { passthrough: input };
      if (Array.isArray(input))      return splitArray(input);
      if (input && input.elements)   return splitArray(input.elements);
      if (input && (isNode(input) || isEdge(input))) return splitArray([input]);
      return { passthrough: input };
    }

    function splitArray(arr){
      const nodes = [], edges = [];
      for (const el of (arr||[])){
        if (isEdge(el)) edges.push(clone(el));
        else if (isNode(el)) nodes.push(clone(el));
      }
      return { nodes, edges };
    }

    function clone(el){ try { return JSON.parse(JSON.stringify(el)); } catch(_) { return el; } }

    function dedupe(list){
      const out = [], seen = new Set();
      for (const el of list||[]){
        const id = el && el.data && el.data.id;
        if (id && !seen.has(id)){ seen.add(id); out.push(el); }
      }
      return out;
    }

    function addNodes(nodes){
      if (!nodes || !nodes.length) return cy.collection();
      const fresh = nodes.filter(n => !existsNode(n && n.data && n.data.id));
      if (!fresh.length) return cy.collection();
      try { cy.startBatch && cy.startBatch(); } catch(_){ }
      const out = orig.add(fresh);
      try { cy.endBatch && cy.endBatch(); } catch(_){ }
      return out;
    }

    function tryAddEdges(edges){
      if (!edges || !edges.length) return cy.collection();
      const ready = [], wait = [];
      for (const e of edges){
        const s = e && e.data && e.data.source;
        const t = e && e.data && e.data.target;
        (existsNode(s) && existsNode(t)) ? ready.push(e) : wait.push(e);
      }

      let added = cy.collection();
      if (ready.length){
        try { cy.startBatch && cy.startBatch(); } catch(_){ }
        added = orig.add(ready);
        try { cy.endBatch && cy.endBatch(); } catch(_){ }
      }

      if (wait.length){
        pendingEdges.push.apply(pendingEdges, wait);
        // tick: در اولین فرصت دوباره تلاش کن (حتی اگر event نیاید)
        setTimeout(function(){
          if (!pendingEdges.length) return;
          try { cy.startBatch && cy.startBatch(); } catch(_){ }
          const copy = pendingEdges.splice(0, pendingEdges.length);
          const r2 = [], w2 = [];
          for (const e of copy){
            const s = e && e.data && e.data.source;
            const t = e && e.data && e.data.target;
            (existsNode(s) && existsNode(t)) ? r2.push(e) : w2.push(e);
          }
          if (r2.length) try { orig.add(r2); } catch(_){ }
          if (w2.length) pendingEdges.push.apply(pendingEdges, w2);
          try { cy.endBatch && cy.endBatch(); } catch(_){ }
        }, 0);
      }

      return added;
    }

    function attachReplayOnce(){
      if (cy.__SAFE_ADD_REPLAY__) return;
      cy.on('add', 'node', function(){
        if (!pendingEdges.length) return;
        try { cy.startBatch && cy.startBatch(); } catch(_){ }
        const copy = pendingEdges.splice(0, pendingEdges.length);
        tryAddEdges(copy);
        try { cy.endBatch && cy.endBatch(); } catch(_){ }
      });
      cy.__SAFE_ADD_REPLAY__ = true;
    }

    // wrap cy.add
    cy.add = function(input){
      const pack = normalize(input);
      if (pack.passthrough !== undefined) return orig.add(pack.passthrough);
      const nodes = dedupe(pack.nodes);
      const edges = dedupe(pack.edges);
      const col1  = addNodes(nodes);
      const col2  = tryAddEdges(edges);
      attachReplayOnce();
      return col1.union(col2);
    };

    // wrap cy.json برای restore ایمن
    cy.json = function(obj){
      if (obj && obj.elements){
        const pack = normalize(obj);
        const nodes = dedupe(pack.nodes);
        const edges = dedupe(pack.edges);
        try { cy.startBatch && cy.startBatch(); } catch(_){ }
        cy.elements().remove();
        addNodes(nodes);
        tryAddEdges(edges);
        try { cy.endBatch && cy.endBatch(); } catch(_){ }
        attachReplayOnce();
        // maintain setter semantics (return the instance)
        return cy;
      }
      return orig.json(obj);
    };

    cy.__SAFE_ADD_INSTALLED__ = true;
  }

  function tryInstall(){
    try{
      const c = getCy(); if (c) install(c);
      // wrap factory برای نمونه‌های آینده
      if (window.cytoscape && !window.cytoscape.__SAFE_ADD_WRAP__){
        const factory = window.cytoscape;
        window.cytoscape = function(){
          const inst = factory.apply(this, arguments);
          try { install(inst); } catch(_){ }
          return inst;
        };
        window.cytoscape.__SAFE_ADD_WRAP__ = true;
      }
    }catch(_){ }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', tryInstall, { once:true });
  } else {
    tryInstall();
  }
  document.addEventListener('cy:ready', function(e){
    try { install(e && e.detail && e.detail.cy); } catch(_){ }
  });
  document.addEventListener('cld:ready', function(e){
    try { install(e && e.detail && e.detail.cy); } catch(_){ }
  });
})();
