// ===== Aha-first (singleton, CSP-safe, no interference) =====
(function(){
  if (window.__AHA_BOUND__) return; window.__AHA_BOUND__ = true;

  // ---------- پیکربندی ----------
  const CFG = {
    version: window.MODEL_VERSION || 'v1.0',
    target: { kpi: 'supply_demand_gap', value: 10, year: '۱۴۰۵' }, // قابل تغییر
    highlightMs: 1500,
    sample: { // اگر از قبل دکمه موجود نیست
      text: 'اجرای سناریوی نمونه: کاهش تلفات ۳۰→۲۰٪',
      apply: async function(){
        // اولویت با ModelBridge
        if (window.ModelBridge?.setParam){
          try {
            const key = findParamKey(['leakage_rate','leakage','loss_rate','nrw']);
            if (key){
              const perc = isPercentScale(key);
              const v = perc ? 20 : 0.20;
              window.ModelBridge.setParam(key, clampToInputRange(key, v));
              await window.ModelBridge.rerunModel?.();
              document.dispatchEvent(new CustomEvent('scenario:applied', {detail:{id:'leakage20'}}));
              return;
            }
          } catch(_){}
        }
        // fallback: ورودی UI
        const key2 = findParamKey(['leakage_rate','leakage','loss_rate','nrw']);
        if (key2){
          const el = pickInput(key2);
          if (el){
            const perc = isPercentScale(key2);
            el.value = String(clamp(el, perc ? 20 : 0.20));
            el.dispatchEvent(new Event('input', {bubbles:true}));
            el.dispatchEvent(new Event('change', {bubbles:true}));
            document.dispatchEvent(new CustomEvent('model:updated', {detail:{source:'aha-sample'}}));
          }
        }
      }
    },
    // تعریف نحوه‌ی بهتر شدن هر KPI
    kpiSpec: {
      // 'better': 'lower' | 'higher'
      supply_demand_gap: {unit:'%', better:'lower'},
      per_capita_use:    {unit:'L/day', better:'lower'},
      leakage_rate:      {unit:'%', better:'lower'}
    }
  };

  // ---------- میان‌برها ----------
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // ورودی/رِنج
  function pickInput(key){
    return document.querySelector(`[data-param="${key}"]`)
        || document.getElementById(key)
        || document.querySelector(`input[name="${key}"], select[name="${key}"]`);
  }
  function clampToInputRange(key, val){ const el = pickInput(key); return clamp(el, val); }
  function clamp(el, val){
    if (!el) return val;
    const min = el.min!=='' ? Number(el.min) : null;
    const max = el.max!=='' ? Number(el.max) : null;
    let v = Number(val);
    if (min!=null && v<min) v=min;
    if (max!=null && v>max) v=max;
    return v;
  }
  function isPercentScale(key){
    const el = pickInput(key); if (!el) return false;
    const max = el.max!=='' ? Number(el.max) : null;
    return (max!=null && max>1.5); // اگر max بزرگتر از 1.5 باشد، احتمالاً 0..100
  }
  function findParamKey(cands){
    for (const k of cands){ if (pickInput(k)) return k; }
    return null;
  }

  // ---------- خواندن KPIها ----------
  function readKPI(id){
    try{
      if (window.ModelBridge?.getKPI) { const v = window.ModelBridge.getKPI(id); if (v!=null) return Number(v); }
    }catch(_){}
    // fallback: اگر KPI را نمی‌دانیم، از UI/پارامترها proxy بسازیم
    const p = getAllParams();
    if (id==='per_capita_use' && p.dem!=null) return +(350 * Number(p.dem)).toFixed(1);
    if (id==='leakage_rate'){
      if (p.leakage_rate!=null) return +Number(p.leakage_rate).toFixed(1);
      if (p.eff!=null){ const base=24.8; return +Math.max(0, base*(1-0.2*(Number(p.eff)-0.3))).toFixed(1); }
    }
    if (id==='supply_demand_gap' && p.dem!=null && p.eff!=null){
      const demand = Math.max(0.01, Number(p.dem));
      const supply = Math.max(0.01, 0.7*Number(p.eff)+0.3);
      return +Math.max(0,(demand-supply)/Math.max(demand,1)*100).toFixed(1);
    }
    return null;
  }
  function getAllParams(){
    const out={};
    $$('[data-param]').forEach(el=>{
      const k=el.dataset.param; if (!k) return;
      const v = (el.type==='checkbox') ? (el.checked?1:0) : Number(el.value ?? el.getAttribute('value'));
      if (!Number.isNaN(v)) out[k]=v;
    });
    return out;
  }

  // ---------- Baseline ----------
  const BL_KEY = `aha_baseline_${CFG.version}`;
  function baselineGet(){
    try{ const v = sessionStorage.getItem(BL_KEY); return v? JSON.parse(v): null; }catch(_){ return null; }
  }
  function baselineSet(kpis){
    try{ sessionStorage.setItem(BL_KEY, JSON.stringify({t:Date.now(), kpis})); }catch(_){}
  }

  // ---------- UI: هدف یک‌خطی و دکمه سناریو ----------
  function ensureObjectiveLine(){
    const host = $('#hero-kpi .problem-text') || $('#hero-kpi') || document.body;
    if (!host || $('#hero-objective')) return;
    const el = document.createElement('div');
    el.id='hero-objective';
    el.className='hero-objective';
    el.textContent = `هدف: کاهش «${labelOf(CFG.target.kpi)}» به ${CFG.target.value}% تا ${CFG.target.year}.`;
    host.appendChild(el);
  }
  function labelOf(k){ const map={supply_demand_gap:'شکاف عرضه–تقاضا', per_capita_use:'مصرف سرانه', leakage_rate:'نرخ تلفات شبکه'}; return map[k]||k; }

  function ensureSampleButton(){
    const row = $('#hero-kpi .baseline-row') || $('#hero-kpi') || null;
    if (!row) return;
    // اگر دکمه موجود است (مثلا #btn-run-sample) از همان استفاده کن
    const existing = $('#btn-run-sample') || $$('button').find(b=>/اجرای.*سناریو|Run.*sample/i.test(b.textContent||''));
    if (existing) { CLD_SAFE?.safeAddClass(existing,'btn-primary-aha'); return; }
    // در غیر اینصورت بساز
    const btn = document.createElement('button');
    btn.type='button'; btn.id='btn-run-sample'; btn.className='btn-primary-aha';
    btn.textContent = CFG.sample.text;
    btn.addEventListener('click', CFG.sample.apply);
    row.appendChild(btn);
  }

  // ---------- UI: ΔKPI ----------
  function ensureDeltaBadges(){
    // برای هر کارت KPI (data-kpi لازم است)
    $$('#hero-kpi .kpi').forEach(card=>{
      if (card.querySelector('.kpi-delta')) return;
      const badge = document.createElement('div');
      badge.className='kpi-delta';
      badge.innerHTML = `<span class="arrow">±</span><span class="val">—</span>`;
      card.appendChild(badge);
    });
  }

  function refreshKPI(){
    const base = baselineGet();
    const cards = $$('#hero-kpi .kpi');
    cards.forEach(card=>{
      const id = card.dataset.kpi || guessKpiId(card);
      const spec = CFG.kpiSpec[id]; if (!id || !spec) return;
      const now = readKPI(id);
      // اگر baseline نداریم، یکی بسازیم
      if (!base || !base.kpis || base.kpis[id]==null) {
        // جمع Baseline برای همه KPIها
        const all={}; Object.keys(CFG.kpiSpec).forEach(k=>{ all[k]=readKPI(k); });
        baselineSet(all);
        return;
      }
      const b = Number(base.kpis[id]);
      const v = Number(now);
      const eps = Math.abs(b) < 1e-9 ? 1 : b;
      const delta = ((v - b) / eps) * 100; // Δ%
      const betterLower = (spec.better || 'lower') === 'lower';
      let cls = 'neutral', arrow='↔';
      if (Math.abs(delta) < 0.05) { cls='neutral'; arrow='↔'; }
      else if ((delta < 0 && betterLower) || (delta > 0 && !betterLower)) { cls='pos'; arrow='↓'; } // بهبود
      else { cls='neg'; arrow='↑'; } // بدتر

      const badge = card.querySelector('.kpi-delta');
      if (!badge) return;
      badge.classList.remove('pos','neg','neutral'); CLD_SAFE?.safeAddClass(badge,'show'); CLD_SAFE?.safeAddClass(badge,cls); CLD_SAFE?.safeAddClass(badge,'kpi-ping');
      badge.querySelector('.arrow').textContent = arrow;
      badge.querySelector('.val').textContent = `${Math.abs(delta).toFixed(1)}%`;
      setTimeout(()=>badge.classList.remove('kpi-ping'), CFG.highlightMs);
    });
  }

  function guessKpiId(card){
    const t = (card.querySelector('.kpi-title')?.textContent || '').trim();
    if (/عرضه.?تقاضا|gap/i.test(t)) return 'supply_demand_gap';
    if (/سرانه|per.?capita/i.test(t)) return 'per_capita_use';
    if (/تلفات|leak/i.test(t)) return 'leakage_rate';
    return null;
  }

  // ---------- اطلاع‌رسانی برای تور (بدون ساخت تور جدید) ----------
  function maybeSuggestTour(){
    if (window.__CLD_TOUR_BOUND__) return; // اگر تور موجود است، دخالت نکن
    if (sessionStorage.getItem('aha_tour_hint')==='1') return;
    const host = $('#hero-kpi') || document.body;
    const hint = document.createElement('div');
    hint.className='hero-objective';
    hint.style.marginTop = '6px';
    hint.innerHTML = 'راهنمای سه‌مرحله‌ای در دسترس است؛ برای مشاهده، به انتهای آدرس <code>?tour=1</code> اضافه کنید.';
    host.appendChild(hint);
    sessionStorage.setItem('aha_tour_hint','1');
  }

  // ---------- راه‌اندازی ----------
  function init(){
    ensureObjectiveLine();
    ensureSampleButton();
    ensureDeltaBadges();

    // اولین baseline را اگر نبود، ذخیره کن
    if (!baselineGet()){
      const all={}; Object.keys(CFG.kpiSpec).forEach(k=>{ all[k]=readKPI(k); });
      baselineSet(all);
    }
    refreshKPI();
    maybeSuggestTour();
  }

  // رویدادهای تازه‌سازی (بدون حذف لیسنرهای موجود)
  document.addEventListener('model:updated', refreshKPI);
  document.addEventListener('scenario:applied', refreshKPI);

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else window.addEventListener('DOMContentLoaded', init, { once:true });
})();
