(function(){
  const lsKey = 'water-cost-calculator-v1';
  const defaults = { cost_production:2000, cost_energy:2000, cost_om:1500, loss_pct:25, blackout_pct:15, subsidy_pct:85 };
  const nf = new Intl.NumberFormat('fa-IR');
  let shareChart;

  function load(){
    try{ return JSON.parse(localStorage.getItem(lsKey)) || {}; }
    catch{ return {}; }
  }

  function save(data){
    localStorage.setItem(lsKey, JSON.stringify(data));
  }

  function formatCurrency(n){ return nf.format(Math.round(n)) + ' تومان'; }
  function formatNumber(n){ return nf.format(Math.round(n)); }

  function compute(data){
    const base = data.cost_production + data.cost_energy + data.cost_om;
    const loss_cost = base * (data.loss_pct/100);
    const blackout_cost = base * (data.blackout_pct/100);
    const true_cost = base + loss_cost + blackout_cost;
    const subsidy_cost = true_cost * (data.subsidy_pct/100);
    const consumer_price = Math.max(0, true_cost - subsidy_cost);
    return { base, loss_cost, blackout_cost, true_cost, subsidy_cost, consumer_price };
  }

  function buildDonut(labels, data){
    const ctx = document.getElementById('share-donut').getContext('2d');
    if (shareChart) shareChart.destroy();
    shareChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, borderWidth:0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { position: 'bottom', labels:{ boxWidth:12, usePointStyle:true } } },
        layout: { padding: 8 }
      }
    });
  }

  function render(data, calc){
    document.querySelector('[data-out="consumer_price"]').textContent = formatNumber(calc.consumer_price);
    document.querySelector('[data-out="true_cost"]').textContent = formatNumber(calc.true_cost);

    const rows = [
      { label:'هزینه تولید', value:data.cost_production },
      { label:'هزینه انرژی', value:data.cost_energy },
      { label:'هزینه نگهداری', value:data.cost_om },
      { label:'تلفات شبکه', value:calc.loss_cost },
      { label:'قطعی برق', value:calc.blackout_cost },
      { label:'یارانه', value:-calc.subsidy_cost }
    ];
    const tbody = document.getElementById('share-table');
    tbody.innerHTML = '';
    rows.forEach(r => {
      const pct = calc.true_cost ? (r.value / calc.true_cost) * 100 : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="text-right py-1">${r.label}</td><td class="text-right py-1">${formatCurrency(r.value)}</td><td class="text-left py-1">${nf.format(pct.toFixed(1))}%</td>`;
      tbody.appendChild(tr);
    });

    buildDonut(['تولید','انرژی','نگهداری','تلفات شبکه','قطعی برق','یارانه'], [
      data.cost_production,
      data.cost_energy,
      data.cost_om,
      calc.loss_cost,
      calc.blackout_cost,
      calc.subsidy_cost
    ]);

    const scenarios = [
      { label:'افزایش ۱۰٪ هزینه تولید', change:{ cost_production: data.cost_production * 1.1 } },
      { label:'افزایش ۱۰٪ هزینه انرژی', change:{ cost_energy: data.cost_energy * 1.1 } },
      { label:'افزایش ۱۰٪ هزینه نگهداری', change:{ cost_om: data.cost_om * 1.1 } },
      { label:'افزایش ۱۰٪ تلفات شبکه', change:{ loss_pct: Math.min(100, data.loss_pct + 10) } },
      { label:'افزایش ۱۰٪ تأثیر قطعی برق', change:{ blackout_pct: Math.min(100, data.blackout_pct + 10) } },
      { label:'کاهش ۱۰٪ یارانه پنهان', change:{ subsidy_pct: Math.max(0, data.subsidy_pct - 10) } }
    ];
    const ul = document.getElementById('sensitivity');
    ul.innerHTML = '';
    scenarios.forEach(sc => {
      const newData = Object.assign({}, data, sc.change);
      const res = compute(newData);
      const diff = res.consumer_price - calc.consumer_price;
      const li = document.createElement('li');
      li.textContent = `${sc.label}: ${formatCurrency(res.consumer_price)} (${diff >= 0 ? '+' : ''}${nf.format(Math.round(diff))})`;
      ul.appendChild(li);
    });

    const parts = [
      { name:'هزینه تولید', value:data.cost_production },
      { name:'هزینه انرژی', value:data.cost_energy },
      { name:'هزینه نگهداری', value:data.cost_om },
      { name:'تلفات شبکه', value:calc.loss_cost },
      { name:'قطعی برق', value:calc.blackout_cost }
    ].sort((a,b) => b.value - a.value);
    const top1 = parts[0];
    const top2 = parts[1];
    document.getElementById('summary').textContent = `بیشترین سهم هزینه مربوط به ${top1.name}` + (top2 ? ` و سپس ${top2.name}` : '') + ` است. پس از اعمال یارانه ${nf.format(data.subsidy_pct)}٪، قیمت نهایی برای مصرف‌کننده ${formatCurrency(calc.consumer_price)} است.`;
  }

  function init(){
    const inputs = Array.from(document.querySelectorAll('[data-input]'));
    const saved = load();
    inputs.forEach(el => {
      const k = el.dataset.input;
      el.value = saved[k] ?? defaults[k];
    });

    function computeAndRender(){
      const data = {};
      inputs.forEach(el => {
        const v = parseFloat(el.value);
        data[el.dataset.input] = isNaN(v) ? 0 : v;
      });
      save(data);
      const calc = compute(data);
      render(data, calc);
    }

    inputs.forEach(el => {
      ['input','change'].forEach(ev => el.addEventListener(ev, computeAndRender));
    });

    const wrap = document.getElementById('chart-wrap');
    new ResizeObserver(() => { if (shareChart) shareChart.resize(); }).observe(wrap);

    computeAndRender();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

