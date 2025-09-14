// docs/assets/model-bridge.js
// پل سبک و بدون‌تداخل برای اتصال UI (Hero KPI و سناریوها) به مدل/شبیه‌ساز
(function(){
  // اگر قبلاً وجود دارد، دست نزن
  if (window.ModelBridge) return;

  // کمکی‌ها
  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const toNum = (v) => (v==null ? null : Number(v));

  // منابع ورودی پارامترها: ترجیح با [data-param]، سپس name/id های رایج
  function allParamInputs(){
    const a = $$('[data-param]');
    if (a.length) return a;
    return $$('input[name], select[name], input[id], select[id]')
      .filter(el => /^(eff|dem|delay|leakage_rate|.*rate.*)$/i.test(el.name || el.id || ''));
  }

  function readParamFromInput(el){
    if (!el) return null;
    if (el.type === 'checkbox') return el.checked ? 1 : 0;
    const v = toNum(el.value ?? el.getAttribute('value'));
    return Number.isNaN(v) ? null : v;
  }

  function setInputValue(el, val){
    if (!el) return false;
    if (el.type === 'checkbox'){
      el.checked = !!val;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    el.value = String(val);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  // گردآوری همه پارامترها از UI (بدون دخالت در منطق مدل)
  function getAllParams(){
    const out = {};
    allParamInputs().forEach(el=>{
      const key = el.dataset?.param || el.name || el.id;
      if (!key) return;
      const val = readParamFromInput(el);
      if (val!=null) out[key] = val;
    });
    return out;
  }

  // تلاش برای اجرا/بازاجرا بدون دخالت: هر چه موجود است همان را ترجیح بده
  async function tryRerun(){
    try{
      if (typeof window.runSimulation === 'function') { await window.runSimulation(); }
      else if (typeof window.simulate === 'function')  { await window.simulate(); }
      else if (window.Model && typeof window.Model.run === 'function') { await window.Model.run(); }
      // در غیر اینصورت، فقط رویداد به‌روزرسانی را منتشر می‌کنیم
    }catch(_e){ /* خطا را قورت بده تا تداخلی پیش نیاید */ }
  }

  // گردآوری خروجی‌ها/KPIها از منابع موجود؛ اگر نبود، تخمین امن (proxy) بساز
  function collectOutputs(){
    const out = { kpis: {}, series: {} };

    // 1) مسیرهای رایج اگر پروژه فراهم کرده باشد
    if (window.Model?.kpi) Object.assign(out.kpis, window.Model.kpi);
    if (window.Sim?.kpi)   Object.assign(out.kpis, window.Sim.kpi);
    if (window.__state?.kpi) Object.assign(out.kpis, window.__state.kpi);

    // 2) اگر KPIها نبودند، از پارامترها تخمین بدون ریسک برای نمایش UI بساز (TODO: جایگزین با منطق مدل)
    const p = getAllParams();

    // per_capita_use: اگر Dem فاکتور شدت تقاضاست
    if (out.kpis.per_capita_use == null && p.dem != null){
      const BASE_PC = 350; // برآورد پایه؛ بعداً از مدل جایگزین شود
      out.kpis.per_capita_use = +(BASE_PC * Number(p.dem)).toFixed(1);
    }

    // leakage_rate: اگر پارامتر مشخص موجود است، همان؛ وگرنه پروکسی نرم از eff
    if (out.kpis.leakage_rate == null){
      if (p.leakage_rate != null){
        out.kpis.leakage_rate = +Number(p.leakage_rate).toFixed(1);
      }else if (p.eff != null){
        const BASE_LEAK = 24.8;
        out.kpis.leakage_rate = +Math.max(0, BASE_LEAK * (1 - 0.2 * (Number(p.eff) - 0.3))).toFixed(1);
      }
    }

    // supply_demand_gap: تخمین محافظه‌کارانه از نسبت dem/eff (فقط برای نمایش اولیه)
    if (out.kpis.supply_demand_gap == null){
      if (p.dem != null && p.eff != null){
        const demand = Math.max(0.01, Number(p.dem));
        const supply = Math.max(0.01, 0.7*Number(p.eff) + 0.3); // پروکسی نرم
        const gap = Math.max(0, (demand - supply) / Math.max(demand,1)) * 100;
        out.kpis.supply_demand_gap = +gap.toFixed(1);
      }else{
        out.kpis.supply_demand_gap = 12.4; // مقدار پایه؛ بعداً از مدل جایگزین شود
      }
    }

    return out;
  }

  // API پل
  const MB = {
    getAllParams,
    setParam: (key, value) => {
      const el = document.querySelector(`[data-param="${key}"]`)
              || document.getElementById(key)
              || document.querySelector(`input[name="${key}"], select[name="${key}"]`);
      return setInputValue(el, value);
    },
    rerunModel: async () => {
      await tryRerun();
      const outputs = collectOutputs();
      window.__MB_STATE = { t: Date.now(), params: getAllParams(), ...outputs };
      document.dispatchEvent(new CustomEvent('model:updated', { detail: { source: 'ModelBridge', kpis: outputs.kpis }}));
    },
    getKPI: (id) => {
      const st = window.__MB_STATE?.kpis;
      if (st && id in st) return st[id];
      const outputs = collectOutputs();
      return outputs.kpis[id];
    }
  };

  // ثبت singleton
  window.ModelBridge = MB;
})();
