(function(){
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

    cy.fit();

    var edge = cy.getElementById('in');
    var valve = document.createElement('div');
    valve.className = 'valve';
    cy.container().appendChild(valve);

    function placeValve(){
      var mid = edge.renderedMidpoint();
      var rect = cy.container().getBoundingClientRect();
      var leftPct = (mid.x - 7) / rect.width * 100;
      var topPct  = (mid.y - 7) / rect.height * 100;
      swapPercentBucket(valve, 'left', leftPct);
      swapPercentBucket(valve, 'top', topPct);
    }

    cy.on('render', placeValve);
    placeValve();
  });
})();
