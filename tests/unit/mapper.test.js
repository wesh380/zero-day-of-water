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
    console.log('Unit OK:', {nodes:nodes.length, edges:edges.length});
    process.exit(0);
  }catch(e){
    console.error('Unit EXC:', e);
    process.exit(1);
  }
})();

