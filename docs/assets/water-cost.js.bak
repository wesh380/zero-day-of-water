(() => {
  // ===== Helpers
  const $ = sel => document.querySelector(sel);
  const num = v => Number(String(v).replace(/[^\d.-]/g,'') || 0);
  const fmt = n => new Intl.NumberFormat('fa-IR').format(Math.round(n));

  function sendInput(id) {
    const targetInput = document.getElementById(id);
    const val = targetInput?.value;
    if (typeof val === 'string') {
      return val.toLowerCase();
    } else {
      console.error('input element not found or has no value');
      return '';
    }
  }

  // Bind inputs (number <-> range sync)
  function bindPair(numId, rangeId){
    const n = $('#'+numId), r = $('#'+rangeId);
    const sync = (from, to) => () => { to.value = from.value; recalc(); };
    n.addEventListener('input', sync(n, r));
    r.addEventListener('input', sync(r, n));
  }

  // ===== Calculation (KEEP YOUR CURRENT FORMULAS!)
  function compute(model){
    const { cost_production, cost_energy, loss_network, maintenance, hidden_subsidy, power_change } = model;
    const base = cost_production + cost_energy + maintenance;
    const powerCostChange = base * (power_change/100);
    const lossCost = base * (loss_network/100);
    const truePrice = base + lossCost + powerCostChange;
    const subsidyCut = truePrice * (hidden_subsidy/100);
    const finalPrice = Math.max(truePrice - subsidyCut, 0);

    const breakdown = [
      { key:'هزینه تولید', share: cost_production, color:'#3B82F6' },
      { key:'هزینه انرژی', share: cost_energy, color:'#0EA5E9' },
      { key:'نگهداری', share: maintenance, color:'#10B981' },
      { key:'هدررفت شبکه', share: lossCost, color:'#F59E0B' },
      { key:'تغییر قیمتی برق', share: powerCostChange, color:'#6366F1' },
      { key:'یارانه پنهان (کاهنده)', share: -subsidyCut, color:'#EF4444' },
    ];
    return { truePrice, finalPrice, breakdown };
  }

  // ===== UI update
  let chart; // Chart.js instance
  function updateUI(res){
    // کادرهای آماری
    $('#true-price').textContent = fmt(res.truePrice);
    $('#final-price').textContent = fmt(res.finalPrice);

    // جدول
    const totalPos = res.breakdown.filter(b=>b.share>0).reduce((s,b)=>s+b.share,0) || 1;
    $('#breakdown-body').innerHTML = res.breakdown.map(b => {
      const pct = (Math.abs(b.share)/totalPos)*100;
      return `
        <tr>
          <td>${b.key}</td>
          <td>${pct.toFixed(1)}٪</td>
          <td><div class="progress"><span style="width:${Math.min(pct,100)}%"></span></div></td>
          <td>${fmt(b.share)} <span class="badge">تومان</span></td>
        </tr>`;
    }).join('');

    // چارت دونات
    const labels = res.breakdown.map(b=>b.key);
    const values = res.breakdown.map(b=>Math.max(b.share,0)); // منفی‌ها در دونات نمایش داده نشوند
    const colors = ['#3B82F6','#60A5FA','#22D3EE','#F59E0B','#10B981','#A78BFA','#F43F5E'].slice(0,values.length);

    const ctx = document.getElementById('shareChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type:'doughnut',
      data:{ labels, datasets:[{ data:values, backgroundColor:colors, borderWidth:0 }]},
      options:{
        responsive:true, maintainAspectRatio:false, cutout:'60%',
        plugins:{
          legend:{ position:'bottom', labels:{ boxWidth:12, usePointStyle:true } },
          tooltip:{ callbacks:{ label:(ctx)=> `${ctx.label}: ${fmt(ctx.parsed)} تومان` } }
        }
      }
    });

    // حساسیت (نمونه)
    const deltas = [10,-10];
    const items = [];
    deltas.forEach(d=>{
      const m = getModel();
      m.cost_energy = m.cost_energy*(1+d/100);
      const r = compute(m);
      items.push(`<li>تغییر ${d>0?'+':'−'}۱۰٪ در هزینه انرژی → قیمت واقعی: ${fmt(r.truePrice)} تومان</li>`);
    });
    $('#sensitivity-list').innerHTML = items.join('');

    // جمع‌بندی
    $('#analysis-summary').textContent = `بیشترین سهم مربوط به ${
      res.breakdown.sort((a,b)=>b.share-a.share)[0].key
    } است. با اعمال یارانه پنهان، قیمت نهایی حدود ${fmt(res.finalPrice)} تومان برآورد می‌شود.`;
  }

  function getModel(){
    return {
      cost_production: num($('#cost_production').value),
      cost_energy: num($('#cost_energy').value),
      loss_network: num($('#loss_network').value),
      maintenance: num($('#maintenance').value),
      hidden_subsidy: num($('#hidden_subsidy').value),
      power_change: num($('#power_change').value),
    };
  }

  function recalc(){
    const res = compute(getModel()); // اینجا از فرمول‌های واقعی پروژه استفاده کنید
    updateUI(res);
  }

  // ===== Boot
  document.addEventListener('DOMContentLoaded', () => {
    // همگام‌سازی عدد و رِنج
    bindPair('cost_production','cost_production_r');
    bindPair('cost_energy','cost_energy_r');
    bindPair('loss_network','loss_network_r');
    bindPair('maintenance','maintenance_r');
    bindPair('hidden_subsidy','hidden_subsidy_r');
    bindPair('power_change','power_change_r');

    $('#recalc').addEventListener('click', recalc);
    recalc();
  });
  window.sendInput = sendInput;
})();
