const fs = require('fs');
const path = require('path');
const { mapModelToElements } = require('../../docs/assets/cld/core/mapper.js');

(async () => {
  try{
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/model.json'),'utf8'));
    const els = mapModelToElements(raw) || [];
    const nodes = els.filter(e=>e.group==='nodes');
    const edges = els.filter(e=>e.group==='edges');
    if (nodes.length!==2 || edges.length!==1) {
      console.error('Unit FAIL: unexpected element counts', {nodes:nodes.length, edges:edges.length});
      process.exit(1);
    }
    // Check aliases
    const n0 = nodes[0] && nodes[0].data || {};
    const e0 = edges[0] && edges[0].data || {};
    if (!('_label' in n0) || n0._label !== n0.label) {
      console.error('Unit FAIL: node _label missing or not equal to label', n0);
      process.exit(1);
    }
    if (!('_signLabel' in e0) || e0._signLabel !== 'positive') {
      console.error('Unit FAIL: edge _signLabel missing or unexpected', e0);
      process.exit(1);
    }
    console.log('Unit OK:', {nodes:nodes.length, edges:edges.length, aliasNode:n0._label, aliasEdge:e0._signLabel});
    process.exit(0);
  }catch(e){
    console.error('Unit EXC:', e);
    process.exit(1);
  }
})();

