// @ts-check
/** @typedef {import('./types').CLDNode} CLDNode */
/** @typedef {import('./types').CLDEdge} CLDEdge */
/* UMD-safe CLD Core Facade (no ES exports) */
/** @param {any} global */
(function(global){
  // deps expected: validate.js, mapper.js, inject.js already loaded
  /** @type {any} */
  var _cy = null;

  /** @param {any} el @returns {any[]} */
  function _coerce(el){
    try {
      if (global.CLD_CORE && typeof global.CLD_CORE._coerceElements==='function')
        return global.CLD_CORE._coerceElements(el);
    } catch(_){}
    if (!el) return [];
    if (Array.isArray(el)) return el;
    if (el.elements && (el.elements.nodes || el.elements.edges)){
      var en = el.elements.nodes||[], ee = el.elements.edges||[];
      return en.concat(ee);
    }
    if (el.nodes || el.edges){
      var n = el.nodes||[], e = el.edges||[];
      return n.concat(e);
    }
    return [];
  }

  /**
   * @param {{ cy?: any, layout?: any }} opts
   * @returns {void}
   */
  function initCore(opts){
    var cy = opts && opts.cy;
    var layout = opts && opts.layout;
    _cy = cy || null;
    if (layout && typeof layout === 'function' && _cy) layout(_cy);
  }

  /** @param {any} rawModel */
  function setModel(rawModel){
    if (!_cy) throw new Error('Core not initialized');
    if (typeof global.validateModel === 'function') try{ global.validateModel(rawModel); }catch(_){}
    var mapped = (typeof global.mapModelToElements === 'function')
      ? global.mapModelToElements(rawModel)
      : (rawModel && rawModel.elements) || rawModel || [];
    var arr = _coerce(mapped);
    try {
      var n=arr.filter(function(/** @type {any} */ e){return e.group==='nodes'}).length;
      var e=arr.filter(function(/** @type {any} */ e){return e.group==='edges'}).length;
      console.log('[CLD core] before inject counts', JSON.stringify({nodes:n,edges:e}));
    } catch(_){}
    if (global.CLD_CORE && typeof global.CLD_CORE.inject==='function')
      global.CLD_CORE.inject(_cy, arr);
    else
      _cy.add(arr);
    return { nodes: _cy.nodes().length, edges: _cy.edges().length };
  }

  /**
   * @param {string=} name
   * @param {any=} opts
   */
  function runLayout(name = 'dagre', opts = {}){
    if (!_cy) throw new Error('Core not initialized');
    var algo = name || 'dagre';
    var defaults = { name: algo, fit: true, animate: false };
    return _cy.layout(Object.assign({}, defaults, opts||{})).run();
  }

  /**
   * @param {{ hideDisconnected?: boolean }=} param0
   * @returns {void}
   */
  function applyFilters({ hideDisconnected = false } = {}){
    if (!_cy) return;
    _cy.batch(function(){
      _cy.elements().show();
      if (hideDisconnected){
        var connected = _cy.nodes().filter(function(/** @type {any} */ n){ return n.connectedEdges().length>0; });
        var unconnected = _cy.nodes().difference(connected);
        unconnected.hide();
      }
    });
  }

  /** @returns {any} */
  function getCy(){ return _cy; }

  // expose
  try {
    global.CLD_CORE = Object.assign(global.CLD_CORE||{}, {
      initCore: initCore, setModel: setModel, runLayout: runLayout,
      applyFilters: applyFilters, getCy: getCy,
      validateModel: global.validateModel, mapModelToElements: global.mapModelToElements
    });
  } catch(_){}
  try {
    if (typeof module!=='undefined' && module.exports){
      Object.assign(module.exports, { initCore, setModel, runLayout, applyFilters, getCy });
    }
  } catch(_){}
})(typeof window!=='undefined'?window:globalThis);
