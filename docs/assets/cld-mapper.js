// CLD Mapper: source of truth to map raw model -> Cytoscape elements
// and to coerce incoming elements into a consistent, typed shape.
(function(){
  if (window.CLD_MAP && window.CLD_MAP.__READY__) return;

  function str(x){ return (x == null) ? '' : String(x); }
  function num(x, d){ var v = Number(x); return Number.isFinite(v) ? v : (d ?? 0); }
  function trim(x){ return str(x).trim(); }

  function normSign(s){
    var v = trim(s);
    if (v === '+' || v === '-') return v;
    // some models use p, sign, polarity
    if (/^pos|positive|plus$/i.test(v)) return '+';
    if (/^neg|negative|minus$/i.test(v)) return '-';
    return '';
  }

  function mapRawToElements(raw){
    raw = raw || {};
    var nodesSrc = Array.isArray(raw) ? raw : (raw.nodes || raw.vertices || []);
    var edgesSrc = Array.isArray(raw) ? [] : (raw.edges || raw.links || raw.connections || []);

    var seen = new Set();
    var nodeSet = new Set();
    var nodes = [];
    for (var i=0;i<nodesSrc.length;i++){
      var n = nodesSrc[i] || {};
      var id = trim(n.id || (n.data && n.data.id));
      if (!id) id = 'n_' + i;
      if (seen.has(id)) continue; seen.add(id); nodeSet.add(id);
      var label = trim(n.label || (n.data && n.data.label) || id);
      nodes.push({ group:'nodes', data:{ id:id, label:label, _label:label, group:trim(n.group||'') }, classes:trim(n.classes||'') });
    }

    var edgeSeen = new Set();
    var edges = [];
    for (var j=0;j<edgesSrc.length;j++){
      var e = edgesSrc[j] || {};
      var src = trim(e.source || (e.data && e.data.source));
      var tgt = trim(e.target || (e.data && e.data.target));
      if (!src || !tgt || !nodeSet.has(src) || !nodeSet.has(tgt)) continue;
      var sign = normSign(e.sign || e.polarity || e.p || (e.data && (e.data.sign || e.data.polarity || e.data.p)));
      var key = (e.id || (src + '->' + tgt + ':' + sign));
      if (edgeSeen.has(key)) continue; edgeSeen.add(key);
      var weight = num(e.weight != null ? e.weight : (e.data && e.data.weight), 0);
      var delay = num(e.delayYears != null ? e.delayYears : (e.data && e.data.delayYears), 0);
      var lbl = trim(e.label || (e.data && e.data.label) || (sign || ''));
      var classes = trim((e.classes || '') + (sign==='+'?' pos':sign==='-'?' neg':''));
      edges.push({ group:'edges', data:{ id:key, source:src, target:tgt, sign:sign, _signLabel:(sign||''), label:lbl, weight:weight, delayYears:delay }, classes:classes });
    }
    return { nodes:nodes, edges:edges };
  }

  function coerceElements(payload){
    // Accept shapes: array, {elements:{nodes,edges}}, {nodes,edges}
    if (Array.isArray(payload)) return payload;
    var nodes = [], edges = [];
    if (payload && payload.elements && Array.isArray(payload.elements.nodes) && Array.isArray(payload.elements.edges)){
      nodes = payload.elements.nodes.slice();
      edges = payload.elements.edges.slice();
    } else if (payload && Array.isArray(payload.nodes) && Array.isArray(payload.edges)){
      nodes = payload.nodes.slice();
      edges = payload.edges.slice();
    } else {
      return [];
    }
    // Coerce element fields and classes
    for (var i=0;i<nodes.length;i++){
      var en = nodes[i] || (nodes[i] = {});
      en.group = 'nodes';
      en.data = en.data || {};
      en.data.id = trim(en.data.id || en.id || ('n_'+i));
      var lbl = trim(en.data.label || en.label || en.data._label || en._label || en.data.id);
      en.data.label = lbl; en.data._label = lbl;
      en.classes = trim(en.classes||'');
    }
    for (var j=0;j<edges.length;j++){
      var ee = edges[j] || (edges[j]={});
      ee.group = 'edges';
      ee.data = ee.data || {};
      var s = normSign(ee.data.sign || ee.sign || ee.data.polarity || ee.polarity || ee.data.p || ee.p);
      ee.data.sign = s; ee.data._signLabel = (s||'');
      ee.data.source = trim(ee.data.source || ee.source||'');
      ee.data.target = trim(ee.data.target || ee.target||'');
      ee.data.weight = num(ee.data.weight != null ? ee.data.weight : ee.weight, 0);
      ee.data.delayYears = num(ee.data.delayYears != null ? ee.data.delayYears : ee.delayYears, 0);
      var elbl = trim(ee.data.label || ee.label || (s||''));
      ee.data.label = elbl;
      ee.data.id = trim(ee.data.id || ee.id || (ee.data.source+'->'+ee.data.target+':'+s));
      var cls = trim(ee.classes||'');
      if (s === '+') cls = (cls+' pos').trim(); else if (s==='-') cls = (cls+' neg').trim();
      ee.classes = cls;
    }
    return nodes.concat(edges);
  }

  window.CLD_MAP = {
    toElements: mapRawToElements,
    coerceElements: coerceElements,
    __READY__: true
  };
})();

