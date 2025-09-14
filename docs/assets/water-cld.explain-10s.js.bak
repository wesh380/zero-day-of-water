(function(){ if(window.__EXPLAIN10__) return; window.__EXPLAIN10__=true;

  function bestDelta(){
    const cards = Array.from(document.querySelectorAll('.kpi')).map(k=>{
      const key = k.dataset.kpi || k.querySelector('.kpi-title')?.textContent?.trim();
      const chip = k.querySelector('.delta-chip')?.textContent || '0%';
      const m = chip.match(/([+-]?\d+(\.\d+)?)%/);
      const d = m ? parseFloat(m[1]) : 0;
      return { key, d };
    });
    return cards.sort((a,b)=>Math.abs(b.d)-Math.abs(a.d))[0] || {key:null,d:0};
  }

  function sentence(){
    const eff = parseFloat(document.getElementById('p-eff')?.value || '0.3');
    const dem = parseFloat(document.getElementById('p-dem')?.value || '0.6');
    const {key,d} = bestDelta(); if(!key) return '—';
    const dir = d>=0 ? 'افزایش' : 'کاهش';
    const keyFa = (key==='leakage_rate') ? 'نرخ تلفات شبکه' :
                  (key==='per_capita_use') ? 'مصرف سرانه' :
                  (key==='supply_demand_gap') ? 'شکاف عرضه-تقاضا' : key;
    return `با تنظیم eff=${eff.toFixed(2)} و dem=${dem.toFixed(2)}، ${keyFa} ${dir} ${Math.abs(d).toFixed(1)}٪ داشت.`;
  }

  function render(){
    let el = document.getElementById('explain-10s');
    if(!el){
      el = document.createElement('div');
      el.id = 'explain-10s';
      el.className = 'explain-10s';
      (document.querySelector('#hero-kpi .hero-left') || document.getElementById('hero-kpi') || document.body).appendChild(el);
    }
    el.textContent = sentence();
  }

  document.addEventListener('model:updated', render);
  (document.readyState!=='loading') ? render() : window.addEventListener('DOMContentLoaded', render, {once:true});
})();
