// ===== Preset Scenarios (singleton, CSP-safe, no interference) =====
(function(){
  if (window.__CLD_PRESETS_BOUND__) return;
  window.__CLD_PRESETS_BOUND__ = true;

  const $  = (s, r=document)=> r.querySelector(s);
  const qsa= (s, r=document)=> Array.from(r.querySelectorAll(s));

  // ---- پیدا کردن جای مناسب برای قراردادن دکمه‌ها (بدون وابستگی شکننده) ----
  function anchorContainer(){
    const hero = $('#hero-kpi');
    if (!hero) return null;
    // سعی کن کنار ردیف Baseline/Run Sample قرار بگیری
    return hero.querySelector('.baseline-row') || hero;
  }

  // ---- کمک‌تابع‌های ModelBridge-safe ----
  function getAllParams(){
    try{
      if (window.ModelBridge?.getAllParams) return window.ModelBridge.getAllParams();
    }catch(_){ }
    // fallback: از ورودی‌های data-param بخوان
    const out={};
    qsa('[data-param]').forEach(el=>{
      const k = el.dataset.param;
      if (!k) return;
      const v = (el.type==='checkbox') ? (el.checked?1:0) : Number(el.value ?? el.getAttribute('value'));
      if (!Number.isNaN(v)) out[k]=v;
    });
    return out;
  }

  function setParam(key, value){
    // اولویت با ModelBridge
    if (window.ModelBridge?.setParam){
      try { return window.ModelBridge.setParam(key, value); } catch(_){ }
    }
    // fallback: ورودی سمت UI را پیدا و مقداردهی کن
    const el = document.querySelector(`[data-param="${key}"]`)
            || document.getElementById(key)
            || document.querySelector(`input[name="${key}"], select[name="${key}"]`);
    if (!el) return false;
    if (el.type==='checkbox'){ el.checked=!!value; el.dispatchEvent(new Event('change',{bubbles:true})); return true; }
    el.value = String(value);
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  }

  async function rerun(){
    if (window.ModelBridge?.rerunModel){
      try { await window.ModelBridge.rerunModel(); return; } catch(_){ }
    }
    // fallback: فقط رویداد به‌روزرسانی را منتشر کن تا UI تازه شود
    document.dispatchEvent(new CustomEvent('model:updated',{detail:{source:'presets'}}));
  }

  // کمک: اگر ورودی رنج min/max/step دارد، مقدار را به همان محدوده clamp کن
  function clampToInputRange(key, val){
    const el = document.querySelector(`[data-param="${key}"]`)
            || document.getElementById(key)
            || document.querySelector(`input[name="${key}"], select[name="${key}"]`);
    if (!el) return val;
    const min = (el.min!=='' ? Number(el.min) : null);
    const max = (el.max!=='' ? Number(el.max) : null);
    let v = Number(val);
    if (min!=null && v<min) v=min;
    if (max!=null && v>max) v=max;
    return v;
  }

  // پیدا کردن کلید موجود بین چند نام متداول
  function findParamKey(candidates){
    const p = getAllParams();
    for (const k of candidates){ if (p[k] != null) return k; }
    // اگر در پارامترها نبود، شاید ورودی UI وجود داشته باشد
    for (const k of candidates){
      if (document.querySelector(`[data-param="${k}"]`)
       || document.getElementById(k)
       || document.querySelector(`input[name="${k}"], select[name="${k}"]`)) return k;
    }
    return null;
  }

  // تشخیص واحد درصد (0..1 یا 0..100)
  function isPercentScale(key){
    const el = document.querySelector(`[data-param="${key}"]`)
            || document.getElementById(key)
            || document.querySelector(`input[name="${key}"], select[name="${key}"]`);
    if (!el) return false;
    const max = (el.max!=='' ? Number(el.max) : null);
    return (max!=null && max>1.5); // اگر max بزرگتر از 1.5 باشد، احتمالاً درصدی (0..100)
  }

  // ---- تعریف Presetها (منعطف به نام پارامترهای پروژه) ----
  const PRESETS = [
    {
      id: 'leakage20',
      title: 'کاهش تلفات ۳۰→۲۰٪',
      note: 'تنظیم مستقیم پارامتر تلفات شبکه به ۲۰٪ (یا 0.20).',
      apply: () => {
        const key = findParamKey(['leakage_rate','leakage','loss_rate','nrw','non_revenue_water']);
        if (!key) return {ok:false, msg:'پارامتر تلفات پیدا نشد'};
        const perc = isPercentScale(key);
        const target = perc ? 20 : 0.20;
        const v = clampToInputRange(key, target);
        setParam(key, v);
        return {ok:true, msg:`${key} ← ${v}`};
      }
    },
    {
      id: 'drought25',
      title: 'شوک خشکسالی (–۲۵٪ منابع)',
      note: 'کاهش ۲۵٪ در پارامترهای مرتبط با منابع/ورودی آب.',
      apply: () => {
        const supplyKeys = [
          'renewable_supply','available_water','supply','supply_factor',
          'surface_inflow','inflow','groundwater_recharge','recharge'
        ];
        const touched = [];
        const params = getAllParams();
        supplyKeys.forEach(k=>{
          if (params[k]!=null){
            const nv = clampToInputRange(k, Number(params[k])*0.75);
            if (setParam(k, nv)) touched.push(`${k}←${nv}`);
          }
        });
        if (!touched.length){
          // fallback: اگر پارامتری نبود، یک شوک عمومی اگر موجود است
          const shock = findParamKey(['drought_shock','supply_shock']);
          if (shock){ setParam(shock, -0.25); touched.push(`${shock}←-0.25`); }
        }
        return touched.length ? {ok:true, msg:touched.join(' , ')} : {ok:false, msg:'پارامتر منبع پیدا نشد'};
      }
    },
    {
      id: 'demand-10',
      title: 'مدیریت تقاضا (–۱۰٪ سرانه)',
      note: 'کاهش ۱۰٪ در مصرف سرانه یا فاکتور تقاضا.',
      apply: () => {
        const demandKeys = ['per_capita_use','per_capita_demand','dem','demand_factor','consumption_factor'];
        const params = getAllParams();
        const touched = [];
        demandKeys.forEach(k=>{
          if (params[k]!=null){
            const nv = clampToInputRange(k, Number(params[k])*0.90);
            if (setParam(k, nv)) touched.push(`${k}←${nv}`);
          }
        });
        return touched.length ? {ok:true, msg:touched.join(' , ')} : {ok:false, msg:'پارامتر تقاضا/سرانه پیدا نشد'};
      }
    }
  ];

  // ---- ساخت UI بدون تداخل ----
  function buildUI(){
    const host = anchorContainer();
    if (!host) return;

    // اگر قبلاً ساخته شده، دوباره نساز
    if ($('#preset-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'preset-bar';
    bar.className = 'preset-bar';
    bar.dir = 'rtl';

    PRESETS.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.type = 'button';
      btn.setAttribute('data-preset', p.id);
      btn.textContent = p.title;
      btn.addEventListener('click', async () => {
        const res = p.apply();
        await rerun();
        // اعلان سبکِ غیر مزاحم
        note.innerHTML = `✓ ${p.note} — <span style="opacity:.8">${res.msg||''}</span> \
          <a href="#" data-more="${p.id}">جزئیات فرض</a>`;
        document.dispatchEvent(new CustomEvent('scenario:applied', { detail: { id: p.id, title: p.title }}));
      });
      bar.appendChild(btn);
      if (i < PRESETS.length-1){
        const sep = document.createElement('div'); sep.className='preset-sep'; bar.appendChild(sep);
      }
    });

    const note = document.createElement('div');
    note.className = 'preset-note';
    note.textContent = 'سناریوهای آماده برای شروع سریع تحلیل.';

    // رویداد «جزئیات فرض»
    note.addEventListener('click', (e)=>{
      const id = e.target?.dataset?.more;
      if (!id) return;
      e.preventDefault();
      const p = PRESETS.find(x=>x.id===id);
      if (p) alert(`جزئیات سناریو «${p.title}»:\n\n${p.note}\n\n(برای توضیحات کامل، به کارت Model/Policy مراجعه کنید.)`);
    });

    host.appendChild(bar);
    host.appendChild(note);
  }

  // ---- راه‌اندازی امن (بدون تداخل) ----
  function start(){
    buildUI();
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') start();
  else window.addEventListener('DOMContentLoaded', start, { once:true });

})();
