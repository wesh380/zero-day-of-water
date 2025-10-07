(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const isNewTabEvent = (e) => e.metaKey || e.ctrlKey || e.button === 1 || e.shiftKey || (e.currentTarget && e.currentTarget.target === "_blank");

  const qs = new URLSearchParams(location.search);
  const state = {
    utility: qs.get('utility') || 'water',
    form: null,
    results: null,
    chart: null,
    chartLib: null,
    chartObserver: null,
    chartObserverTarget: null,
    storageKey: 'wesh.household.v1'
  };

  // Targets & EF (provisional constants; do not modify global data)
  // Units: water(L/day/person), electricity(kWh/day/person), gas(kWh/day/person)
  /*
   * TODO(wesh360): Replace provisional TARGETS with sourced global benchmarks.
   * Current placeholders (water=110 L/d/p, electricity=3.2 kWh/d/p, gas=18 kWh/d/p)
   * are used for prototyping and must be updated once validated references are available.
   */
  const TARGETS = { water: 110, electricity: 3.2, gas: 18 }; // provisional=true
  const EF = { electricity: 0.45, gas: 0.20, water: 0.0003 }; // kgCO2e per unit (provisional)

  const LABEL_THRESHOLDS = { low: 0.90, high: 1.10 }; // 90% and 110%
  function classify(perCapita, target){
    if (!target || !Number.isFinite(perCapita)) return { key:'na', text:'—', level:'na' };
    const ratio = perCapita / target;
    if (ratio > LABEL_THRESHOLDS.high) return { key:'high', text:'پرمصرف', level:'high' };
    if (ratio < LABEL_THRESHOLDS.low)  return { key:'low',  text:'کم‌مصرف', level:'low'  };
    return { key:'mid', text:'نزدیکِ میانگین جهانی', level:'mid' };
  }

  const unitFor = (u) => u==='water' ? 'L' : (u==='electricity' ? 'kWh' : 'm3');

  function selectTab(utility){
    state.utility = utility;
    $$('.wiz-tabs .tab').forEach(btn => {
      const isActive = btn.dataset.utility === utility;
      btn.setAttribute('aria-selected', isActive ? 'true':'false');
    });
    // set unit dropdown
    const unit = unitFor(utility);
    const sel = $('[name="unit"]');
    if (sel && sel.value !== unit){
      // if user changed it manually, keep; otherwise default to utility's main unit
      if (!qs.get('unit')) sel.value = unit;
    }
    // reflect in URL without reload
    const url = new URL(location.href);
    url.searchParams.set('utility', utility);
    history.replaceState(null, '', url.toString());
  }

  function loadFromStorage(){
    try{
      const saved = JSON.parse(localStorage.getItem(state.storageKey) || '{}');
      if (!saved || typeof saved !== 'object') return;
      for (const [k,v] of Object.entries(saved)){
        const el = $(`[name="${k}"]`);
        if (el && v != null) el.value = v;
      }
      if (saved.utility) selectTab(saved.utility);
      if (['amount','usage','members','billingDays'].every(k => saved[k])){
        // optional: pre-enable compute hint
      }
    }catch(_) {}
  }

  function saveToStorage(payload){
    try{
      localStorage.setItem(state.storageKey, JSON.stringify(payload));
    }catch(_) {}
  }

  function resetStorage(){
    localStorage.removeItem(state.storageKey);
    state.form.reset();
    $('#wiz-results').hidden = true;
    $('#wiz-hint').textContent = 'برای دیدن نتایج، فرم را کامل کنید.';
  }

  function toNumber(v){ const n = Number(String(v).replace(/[^\d.]/g,'')); return Number.isFinite(n) ? n : NaN; }

  function normalize({utility, usage, unit, members, billingDays}){
    let u = usage;
    // gas m3 → kWh (≈ 10.55 kWh/m3 typical); provisional
    if (utility==='gas' && unit==='m3'){ u = u * 10.55; unit = 'kWh'; }
    // target by utility
    const target = TARGETS[utility];
    const perCapita = u / (members * billingDays);
    const delta = perCapita - target;
    const percent = target ? (delta/target)*100 : 0;
    const score = Math.max(0, Math.min(100, Math.round(100 - Math.abs(percent)))); // simple 0..100
    const co2e = utility==='water' ? perCapita * EF.water : perCapita * (utility==='electricity' ? EF.electricity : EF.gas);
    return { perCapita, target, delta, percent, score, co2e, provisional:true };
  }

  async function ensureChart(){
    if (state.chartLib) return true;
    try{
      // lazy-load Chart.js if present in /vendor
      state.chartLib = await import('/vendor/chart.umd.min.js');
      return true;
    }catch(_){
      return false;
    }
  }

  function renderNumbers(m){
    $('#k-percapita').textContent = m.perCapita.toFixed(2);
    $('#k-target').textContent = m.target.toFixed(2);
    $('#k-delta').textContent = `${m.delta.toFixed(2)} (${m.percent.toFixed(1)}٪)`;
    $('#k-score').textContent = String(m.score);
    $('#k-co2e').textContent = m.co2e.toFixed(3) + ' kg';
    const chip = document.getElementById('k-label');
    if (chip){
      const label = classify(m.perCapita, m.target);
      chip.textContent = label.text;
      chip.dataset.level = label.level;
    }
    const note = m.provisional ? 'مقادیر هدف و ضرایب انتشار به‌صورت موقت و پارامتریک هستند.' : '';
    $('#wiz-note').textContent = note;
  }

  function renderTips(utility, percent){
    const box = $('#wiz-tips'); box.innerHTML = '';
    const tips = [];
    if (utility==='water'){
      tips.push('آب‌خورها را اصلاح و نشت‌ها را رفع کنید.');
      tips.push('سرشیر کاهنده دبی نصب کنید.');
    }else if (utility==='electricity'){
      tips.push('تعویض لامپ‌ها با LED پر‌بازده.');
      tips.push('وسایل پرمصرف را در ساعات کم‌بار مصرف کنید.');
    }else{
      tips.push('تنظیم شعله و سرویس سالانه پکیج/بخاری.');
      tips.push('عایق‌کاری پنجره‌ها و درزها.');
    }
    tips.slice(0,5).forEach(t => { const li=document.createElement('li'); li.textContent=t; box.appendChild(li); });
  }

  async function renderChart(m){
    if (!(await ensureChart())) return;
    const canvas = $('#wiz-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }
    const unit = state.utility==='water' ? 'L' : 'kWh';
    state.chart = new state.chartLib.Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['مصرف شما', 'هدف جهانی'],
        datasets: [{ label: unit, data: [m.perCapita, m.target] }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
    const wrap = canvas.closest('.chart-wrap');
    if (wrap && typeof ResizeObserver !== 'undefined') {
      if (!state.chartObserver) {
        state.chartObserver = new ResizeObserver(() => {
          if (state.chart) {
            state.chart.resize();
          }
        });
      }
      if (state.chartObserverTarget && state.chartObserverTarget !== wrap) {
        state.chartObserver.unobserve(state.chartObserverTarget);
      }
      if (state.chartObserverTarget !== wrap) {
        state.chartObserver.observe(wrap);
        state.chartObserverTarget = wrap;
      }
    }
  }

  function bindCardClicks(){
    const wiz = document.getElementById('household-wizard');
    if (!wiz) return;
    document.querySelectorAll('.cards-section a[data-utility]').forEach(a => {
      a.addEventListener('click', (e) => {
        if (isNewTabEvent(e)) return;

        // If this card already has a real href, let the browser navigate.
        const href = a.getAttribute('href') || '';
        const hasRealHref = href && href !== '#';
        if (hasRealHref) return;

        const done = document.body.dataset.wizDone === "1" || sessionStorage.getItem("wizDone") === "1";
        const resultsLocked = !done && !!document.querySelector('#wiz-results[hidden]');

        if (resultsLocked){
          e.preventDefault();
          const u = a.getAttribute('data-utility');
          if (u) selectTab(u);
          wiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const invalid = document.querySelector('#wiz-form :invalid');
          if (invalid) invalid.focus({ preventScroll: true });
        } else {
          // Fallback route only when there is no real href
          if (a.dataset.utility){
            a.href = `/household-dashboard?utility=${a.dataset.utility}`;
          }
        }
      }, {passive:false});
    });
  }

  function init(){
    // tabs
    $$('.wiz-tabs .tab').forEach(btn => btn.addEventListener('click', () => selectTab(btn.dataset.utility)));
    // form
    state.form = $('#wiz-form');
    state.results = $('#wiz-results');
    $('#wiz-reset').addEventListener('click', resetStorage);

    state.form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(state.form);
      const payload = {
        utility: state.utility,
        amount: toNumber(fd.get('amount')),
        usage: toNumber(fd.get('usage')),
        unit: String(fd.get('unit') || ''),
        members: toNumber(fd.get('members')),
        billingDays: toNumber(fd.get('billingDays'))
      };
      // basic validation
      const ok = ['amount','usage','members','billingDays'].every(k => Number.isFinite(payload[k]) && payload[k] > 0);
      if (!ok) { $('#wiz-hint').textContent = 'لطفاً تمام فیلدها را با مقادیر معتبر تکمیل کنید.'; return; }

      saveToStorage({...payload});
      const m = normalize(payload);
      renderNumbers(m);
      renderTips(payload.utility, m.percent);
      state.results.hidden = false;
      await renderChart(m);
      document.body.dataset.wizDone = "1";
      sessionStorage.setItem("wizDone", "1");
    });

    // default tab from URL
    selectTab(state.utility);
    // restore previous values
    loadFromStorage();
    // bind landing cards
    bindCardClicks();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
