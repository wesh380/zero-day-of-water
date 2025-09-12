/** @typedef {import('./types').CLDNode} CLDNode */
/** @typedef {import('./types').CLDEdge} CLDEdge */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var api = factory();
    try {
      root.CLD_CORE = root.CLD_CORE || {};
      root.CLD_CORE.validateModel = api.validateModel;
      // also expose as global function for legacy callers
      root.validateModel = api.validateModel;
    } catch (_) {}
  }
}(typeof self !== 'undefined' ? self : this, function () {
  /**
   * @param {{nodes?: CLDNode[]; edges?: CLDEdge[]; [k:string]: any}} model
   * @returns {{ ok: boolean; errs: string[]; nodes: CLDNode[]; edges: CLDEdge[] }}
   */
  function validateModel(model) {
    var errs = [];
    if (!model) errs.push('model is null/undefined');
    var nodes = (model && (model.nodes || model.Vertices || model.NODES)) || [];
    var edges = (model && (model.edges || model.Links || model.EDGES)) || [];
    var nid = new Set();
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i] || {};
      if (!n.id) errs.push('node without id');
      else if (nid.has(n.id)) errs.push('duplicate node id: ' + n.id);
      else nid.add(n.id);
      if (!n.label && !n.name && !n.title) errs.push('node ' + (n.id || '?') + ' without label');
    }
    for (var j = 0; j < edges.length; j++) {
      var e = edges[j] || {};
      if (!e.source || !e.target) errs.push('edge missing source/target: ' + (e.id || '?'));
    }
    if (errs.length) try { console.warn('[CLD][validate] issues:', errs); } catch (_) { }
    return { ok: errs.length === 0, errs: errs, nodes: nodes, edges: edges };
  }

  return { validateModel: validateModel };
}));
