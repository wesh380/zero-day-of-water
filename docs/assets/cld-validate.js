// Lightweight validation and diagnostics for CLD graphs/elements
(function(){
  if (window.CLD_VALIDATE && window.CLD_VALIDATE.__READY__) return;

  function warn(){ try{ console.warn.apply(console, arguments); }catch(_){} }
  function info(){ try{ console.info.apply(console, arguments); }catch(_){} }
  function trim(x){ return (x==null?'':String(x)).trim(); }

  function validateElements(payload){
    var els = Array.isArray(payload) ? payload : (payload && payload.elements ? (payload.elements.nodes||[]).concat(payload.elements.edges||[]) : []);
    var nodes = els.filter(e => (e && (e.group==='nodes' || e.group==='node' || (!e.group && e.data && e.data.source==null))));
    var edges = els.filter(e => (e && (e.group==='edges' || e.group==='edge' || (!e.group && e.data && e.data.source!=null))));
    var errors = [], warnings = [];
    var seen = new Set();
    for (var i=0;i<nodes.length;i++){
      var id = trim(nodes[i]?.data?.id);
      if (!id){ warnings.push('node['+i+']: missing id'); continue; }
      if (seen.has(id)) warnings.push('duplicate node id: '+id); else seen.add(id);
      var lbl = trim(nodes[i]?.data?.label);
      if (!lbl) warnings.push('node['+id+']: empty label');
    }
    for (var j=0;j<edges.length;j++){
      var e = edges[j]||{}; var d=e.data||{};
      var s = trim(d.source), t = trim(d.target);
      if (!s || !t) errors.push('edge['+j+']: missing source/target');
      var sg = trim(d.sign);
      if (sg && sg !== '+' && sg !== '-') warnings.push('edge['+s+'->'+t+']: invalid sign '+sg);
      if (Number.isNaN(Number(d.weight))) warnings.push('edge['+s+'->'+t+']: non-numeric weight');
      if (Number.isNaN(Number(d.delayYears))) warnings.push('edge['+s+'->'+t+']: non-numeric delayYears');
    }
    if (warnings.length) info('[CLD validate] warnings:', warnings);
    if (errors.length) warn('[CLD validate] errors:', errors);
    return { ok: errors.length===0, errors, warnings };
  }

  window.CLD_VALIDATE = { validateElements, __READY__: true };
})();

