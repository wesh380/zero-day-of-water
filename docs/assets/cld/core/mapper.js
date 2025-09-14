// @ts-check
/** @typedef {import('./types').CLDNode} CLDNode */
/** @typedef {import('./types').CLDEdge} CLDEdge */

/** @param {any} root @param {any} factory */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var api = factory();
    try {
      // @ts-ignore augmenting global root in UMD context
      root.CLD_CORE = root.CLD_CORE || {};
      // @ts-ignore augmenting global root in UMD context
      root.CLD_CORE.mapModelToElements = api.mapModelToElements;
      // also expose as global function for legacy callers
      // @ts-ignore augmenting global root in UMD context
      root.mapModelToElements = api.mapModelToElements;
    } catch (_) {}
  }
}(typeof self !== 'undefined' ? self : this, function () {
  // Normalizes a raw model to Cytoscape elements (nodes/edges).
  // Contract (min):
  //  Node: { id, label, group? }
  //  Edge: { id?, source, target, sign:(+|-)?, weight?:number, delay?:number }
  /**
   * @param {{nodes?: CLDNode[]; edges?: CLDEdge[]; [k:string]: any}} model
   * @returns {Array<{group:string; data: any}>}
   */
  function mapModelToElements(model) {
    var nodes = (model && (model.nodes || model.Vertices || model.NODES)) || [];
    var edges = (model && (model.edges || model.Links || model.EDGES)) || [];

    var nodeIds = Object.create(null);
    var cyNodes = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i] || {};
      if (n.id == null) {
        console.warn('Node missing id', n);
        continue;
      }
      var id = String(n.id);
      if (nodeIds[id]) {
        console.warn('Duplicate node id', id);
        continue;
      }
      var label = (n.label != null ? n.label : (n.name != null ? n.name : (n.title != null ? n.title : id)));
      var group = n.group != null ? n.group : (n.type != null ? n.type : 'var');
      var lbl = String(label);
      if (lbl.length > 80) {
        console.warn('Node label too long', id);
        lbl = lbl.slice(0, 80) + '\u2026';
      }
      nodeIds[id] = true;
      cyNodes.push({ group: 'nodes', data: { id: id, label: lbl, _label: lbl, group: String(group) } });
    }

    var edgeIdSeq = 0;
    var edgeIds = Object.create(null);
    var cyEdges = [];
    for (var j = 0; j < edges.length; j++) {
      var e = edges[j] || {};
      var sid = e.id != null ? String(e.id) : ('e_' + (edgeIdSeq++));
      if (edgeIds[sid] || nodeIds[sid]) {
        console.warn('Duplicate edge id', sid);
        continue;
      }
      var s = e.source != null ? String(e.source) : '';
      var t = e.target != null ? String(e.target) : '';
      if (!s || !t || !nodeIds[s] || !nodeIds[t]) {
        console.warn('Edge missing source/target', sid);
        continue;
      }
      var sign = (e.sign != null ? e.sign : (e.polarity != null ? e.polarity : null));
      var signLabel = (sign === '+' ? 'positive' : (sign === '-' ? 'negative' : null));
      var weight = (e.weight != null ? Number(e.weight) : (e.w != null ? Number(e.w) : null));
      var delay = (e.delay != null ? Number(e.delay) : (e.lag != null ? Number(e.lag) : null));
      edgeIds[sid] = true;
      cyEdges.push({ group: 'edges', data: { id: sid, source: s, target: t, sign: sign, _signLabel: signLabel, weight: weight, delay: delay } });
    }
    return /** @type {Array<{group:string; data:any}>} */ ([]).concat(
      /** @type {any[]} */ (cyNodes),
      /** @type {any[]} */ (cyEdges)
    );
  }

  return { mapModelToElements: mapModelToElements };
}));
