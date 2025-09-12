// @ts-check
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var api = factory();
    try {
      // Attach impl under CLD_CORE for the facade to delegate to
      /** @type {any} */ (root).CLD_CORE = (/** @type {any} */ (root).CLD_CORE) || {};
      /** @type {any} */ (root).CLD_CORE._runLayoutImpl = api.runLayout;
    } catch (_) {}
  }
}(typeof self !== 'undefined' ? self : this, function () {
  /**
   * Run a layout with safe fallback.
   * @param {any} cy
   * @param {'elk'|'dagre'|string=} name
   * @param {any=} opts
   * @returns {void}
   */
  function runLayout(cy, name = 'elk', opts = {}) {
    if (!cy || typeof cy.layout !== 'function') return;

    var algo = name || 'elk';
    if (algo === 'elk') {
      var layout = cy.layout(Object.assign({
        name: 'elk',
        elk: { 'elk.algorithm': 'layered' },
        fit: true,
        nodeDimensionsIncludeLabels: true,
        animate: false,
        webWorker: true,
        workerUrl: '/assets/vendor/elk-worker.min.js'
      }, opts || {}));
      try {
        layout.run();
        return;
      } catch (e) {
        try { console.warn('[ELK] falling back to dagre', e); } catch(_){}
        return runLayout(cy, 'dagre', opts);
      }
    } else if (algo === 'dagre') {
      cy.layout(Object.assign({ name: 'dagre', fit: true, nodeDimensionsIncludeLabels: true, animate: false }, opts || {})).run();
      return;
    } else {
      return runLayout(cy, 'elk', opts);
    }
  }

  return { runLayout: runLayout };
}));
