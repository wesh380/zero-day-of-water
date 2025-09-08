import { setClass } from './css-classes.js';

document.addEventListener('DOMContentLoaded', () => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('cld-svg');
  if (svg) {
    const width = 600;
    const height = 420;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    setClass(svg, ['select-none']);

    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('viewBox', '0 -5 10 10');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '0');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M0,-5L10,0L0,5');
    path.setAttribute('fill', '#555');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const nodes = [
      { id: 'منابع آب زیرزمینی', x: 100, y: 210 },
      { id: 'بهره‌وری آبیاری', x: 300, y: 60 },
      { id: 'محصول کشاورزی', x: 300, y: 360 },
      { id: 'مصرف آب', x: 500, y: 210 }
    ];

    const linksData = [
      { source: 'منابع آب زیرزمینی', target: 'محصول کشاورزی', sign: '+' },
      { source: 'محصول کشاورزی', target: 'مصرف آب', sign: '+' },
      { source: 'مصرف آب', target: 'منابع آب زیرزمینی', sign: '−' },
      { source: 'بهره‌وری آبیاری', target: 'مصرف آب', sign: '−' }
    ];

    const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
    const links = linksData.map(l => {
      const s = nodeById[l.source];
      const t = nodeById[l.target];
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('stroke', '#999');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end', 'url(#arrow)');
      setClass(line, ['pe-none']);
      svg.appendChild(line);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('font-size', '12');
      label.setAttribute('fill', '#000');
      label.setAttribute('text-anchor', 'middle');
      setClass(label, ['pe-none']);
      label.textContent = l.sign;
      svg.appendChild(label);

      const linkObj = { source: s, target: t, line, label };
      updateLink(linkObj);
      return linkObj;
    });

    nodes.forEach(n => {
      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('transform', `translate(${n.x},${n.y})`);
      setClass(g, ['cursor-move']);

      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('r', '30');
      circle.setAttribute('fill', '#69b3a2');
      g.appendChild(circle);

      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '4');
      text.textContent = n.id;
      g.appendChild(text);

      svg.appendChild(g);
      makeDraggable(g, n);
    });

    function updateLink(l) {
      l.line.setAttribute('x1', l.source.x);
      l.line.setAttribute('y1', l.source.y);
      l.line.setAttribute('x2', l.target.x);
      l.line.setAttribute('y2', l.target.y);
      l.label.setAttribute('x', (l.source.x + l.target.x) / 2);
      l.label.setAttribute('y', (l.source.y + l.target.y) / 2 - 10);
    }

    function makeDraggable(g, node) {
      g.addEventListener('pointerdown', e => {
        const rect = svg.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - node.x;
        const offsetY = e.clientY - rect.top - node.y;
        g.setPointerCapture(e.pointerId);

        function onMove(ev) {
          node.x = ev.clientX - rect.left - offsetX;
          node.y = ev.clientY - rect.top - offsetY;
          g.setAttribute('transform', `translate(${node.x},${node.y})`);
          links.forEach(link => {
            if (link.source === node || link.target === node) {
              updateLink(link);
            }
          });
        }
        function onUp(ev) {
          g.removeEventListener('pointermove', onMove);
          g.removeEventListener('pointerup', onUp);
          g.releasePointerCapture(ev.pointerId);
        }
        g.addEventListener('pointermove', onMove);
        g.addEventListener('pointerup', onUp);
      });
    }
  }

  function simulate() {
    const steps = 30;
    const years = [];
    const stockSeries = [];
    let stock = 100;

    for (let year = 0; year <= steps; year++) {
      years.push(year);
      stockSeries.push(stock);
      const inflow = 2;
      const product = Math.min(100, Math.max(0, 0.8 * stock));
      const outflow = 1.5 * product;
      stock = Math.max(0, stock + inflow - outflow);
    }

    return { years, stockSeries };
  }

  const { years, stockSeries } = simulate();
  const canvas = document.getElementById('sd-simulation');
  if (canvas && window.Chart) {
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            data: stockSeries,
            borderColor: '#007bff',
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: '#eee' } },
          y: { grid: { color: '#eee' } }
        }
      }
    });
  }
});

