(function(){
  const CLD_CORE = (typeof window !== 'undefined' && window.CLD_CORE) ? window.CLD_CORE : {};
  const getCy = CLD_CORE.getCy ? CLD_CORE.getCy : () => null;

  document.addEventListener('DOMContentLoaded', function(){
    var cy = cytoscape({
      container: document.getElementById('cy-sfd'),
      layout: { name: 'preset' },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#e6f1ef',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-family': 'Vazirmatn,Tahoma,sans-serif'
          }
        },
        {
          selector: '.stock',
          style: {
            'shape': 'rectangle',
            'width': 120,
            'height': 60,
            'background-color': '#122825',
            'border-width': 2,
            'border-color': '#58a79a',
            'border-radius': 6
          }
        },
        {
          selector: '.cloud',
          style: {
            'shape': 'ellipse',
            'width': 80,
            'height': 50,
            'background-opacity': 0,
            'border-style': 'dashed',
            'border-width': 2,
            'border-color': '#58a79a'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#58a79a',
            'target-arrow-color': '#58a79a',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      elements: {
        nodes: [
          { data: { id: 'cloudIn' }, position: { x: 100, y: 100 }, classes: 'cloud' },
          { data: { id: 'stock', label: 'Stock' }, position: { x: 250, y: 100 }, classes: 'stock' },
          { data: { id: 'cloudOut' }, position: { x: 400, y: 100 }, classes: 'cloud' }
        ],
        edges: [
          { data: { id: 'in', source: 'cloudIn', target: 'stock' } },
          { data: { id: 'out', source: 'stock', target: 'cloudOut' } }
        ]
      }
    });

    try { if (CLD_CORE && CLD_CORE.initCore) CLD_CORE.initCore({ cy, layout: null }); } catch(_){}
    const C = getCy() || cy;
    C.fit();

    var edge = C.getElementById('in');
    var valve = document.createElement('div');
    valve.style.cssText = 'position:absolute;width:14px;height:14px;border:2px solid #58a79a;border-radius:50%;background:#0b1d1a;';
    C.container().appendChild(valve);

    function placeValve(){
      var mid = edge.renderedMidpoint();
      valve.style.left = (mid.x - 7) + 'px';
      valve.style.top = (mid.y - 7) + 'px';
    }

    C.on('render', placeValve);
    placeValve();
  });
})();
