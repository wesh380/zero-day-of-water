(() => {
  // ===== پیکربندی KPI و سناریو =====
  const CONFIG = {
    version: (window.MODEL_VERSION || "v1.0"),
    kpis: {
      supply_demand_gap: { unit:"%", thresholds:{ red:20, amber:10, better:"lower" } },
      per_capita_use:    { unit:"L/day", thresholds:{ red:250, amber:200, better:"lower" } },
      leakage_rate:      { unit:"%", thresholds:{ red:25, amber:15, better:"lower" } }
    },
    sampleScenario: { title:"کاهش تلفات ۳۰→۲۰٪", changes:{ leakage_rate:0.20 } }
  };

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // ===== ابزارهای کمکی =====
  function fmt(v){ return (v==null || isNaN(v)) ? "—" : Number(v).toFixed(1); }
  function ragClass(v,t){
    if (v==null || isNaN(v) || !t) return "rag-neutral";
    const lowerBetter = (t.better||"lower")==="lower";
    if (lowerBetter){
      if (v >= t.red) return "rag-red";
      if (v >= t.amber) return "rag-amber";
      return "rag-green";
    }else{
      if (v <= t.red) return "rag-red";
      if (v <= t.amber) return "rag-amber";
      return "rag-green";
    }
  }

  // ===== لایه‌ی تطبیق با مدل (بدون دست‌کاری مدل) =====
  function readKPI(id){
    // اگر پلِ مدل موجود است، از آن استفاده کن
    if (window.ModelBridge && typeof ModelBridge.getKPI === "function"){
      try { return ModelBridge.getKPI(id); } catch(e){}
    }
    // --- Fallback موقت: برای نمایش اولیه؛ توسعه‌دهنده باید به مدل وصل کند.
    // TODO: اتصال واقعی KPIها به مدل با استفاده از ModelBridge.getKPI
    const dummy = { supply_demand_gap:12.4, per_capita_use:210, leakage_rate:24.8 };
    return dummy[id];
  }

  function snapshotParams(){
    if (window.ModelBridge && typeof ModelBridge.getAllParams === "function"){
      try { return ModelBridge.getAllParams(); } catch(e){}
    }
    // Fallback: از کنترل‌های دارای data-param بخوان
    const o = {};
    $$('[data-param]').forEach(el => { o[el.dataset.param] = Number(el.value ?? el.getAttribute("value")); });
    return o;
  }

  function applyParams(map){
    let changed = false;
    if (window.ModelBridge && typeof ModelBridge.setParam === "function"){
      for (const [k,v] of Object.entries(map)){
        try { ModelBridge.setParam(k, v); changed = true; } catch(e){}
      }
    }else{
      for (const [k,v] of Object.entries(map)){
        const el = document.querySelector(`[data-param="${k}"]`);
        if (el){ el.value = v; el.dispatchEvent(new Event("input",{bubbles:true})); changed = true; }
      }
    }
    if (changed){
      if (window.ModelBridge && typeof ModelBridge.rerunModel === "function") ModelBridge.rerunModel();
      document.dispatchEvent(new CustomEvent("scenario:applied"));
    }
  }

  // ===== رندر KPI =====
  function refreshKPIs(){
    $$('.kpi').forEach(card => {
      const id = card.dataset.kpi;
      const spec = CONFIG.kpis[id];
      const val = readKPI(id);
      card.querySelector('.val').textContent  = fmt(val);
      card.querySelector('.unit').textContent = spec.unit;
      const rag = card.querySelector('.kpi-rag');
      rag.classList.remove('rag-red','rag-amber','rag-green','rag-neutral');
      CLD_SAFE?.safeAddClass(rag, ragClass(val, spec.thresholds));
    });
    const base = $('#hero-baseline');
    if (base) base.textContent = `Baseline ${CONFIG.version}`;
  }

  // ===== سناریوی نمونه + Reset =====
  let baselineSnapshot = null;
  function runSampleScenario(){
    if (!baselineSnapshot) baselineSnapshot = snapshotParams();
    applyParams(CONFIG.sampleScenario.changes);
  }
  function resetBaseline(){
    if (baselineSnapshot) applyParams(baselineSnapshot);
  }

  // ===== راه‌اندازی =====
  function init(){
    $('#btn-run-sample')?.addEventListener('click', runSampleScenario);
    $('#btn-reset-baseline')?.addEventListener('click', resetBaseline);
    refreshKPIs();
  }

  // با مدل همگام شو
  document.addEventListener('model:updated', refreshKPIs);
  $$('[data-param]').forEach(el => el.addEventListener('input', refreshKPIs));

  if (window.whenModelReady) whenModelReady(init);
  else if (document.readyState === 'complete') init();
  else window.addEventListener('DOMContentLoaded', init);
})();
