/* Robust inject: accepts array OR {nodes,edges} OR {elements:{nodes,edges}} */
function _coerceElements(el){
  if (!el) return [];
  if (Array.isArray(el)) return el;
  if (el.elements && (el.elements.nodes || el.elements.edges)) {
    const en = el.elements.nodes || [], ee = el.elements.edges || [];
    return en.concat(ee);
  }
  if (el.nodes || el.edges) {
    const en = el.nodes || [], ee = el.edges || [];
    return en.concat(ee);
  }
  // single element object?
  if (el.data && (el.group === 'nodes' || el.group === 'edges')) return [el];
  return [];
}
function inject(cy, elements){
  const arr = _coerceElements(elements);
  try {
    const n = arr.filter(e=>e.group==='nodes').length;
    const e = arr.filter(e=>e.group==='edges').length;
    if (window.__CLD_DEBUG__) console.log('[CLD inject] coerced counts', JSON.stringify({nodes:n,edges:e}));
  } catch(_){}
  cy.batch(()=> cy.add(arr));
}
try {
  if (typeof window !== 'undefined') {
    window.CLD_CORE = window.CLD_CORE || {};
    window.CLD_CORE.inject = inject;
    window.CLD_CORE._coerceElements = _coerceElements;
  }
} catch(_){}
try { if (typeof module!=='undefined' && module.exports) module.exports = Object.assign(module.exports||{}, { inject }); } catch(_){}
