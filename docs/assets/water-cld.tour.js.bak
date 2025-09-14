// ===== CLD Coachmarks (singleton, CSP-safe, no interference) =====
(function(){
  if (window.__CLD_TOUR_BOUND__) return;   // گارد عدم‌تداخل
  window.__CLD_TOUR_BOUND__ = true;

  // کمک‌ها
  const qs  = (s, r=document)=> r.querySelector(s);
  const qsa = (s, r=document)=> Array.from(r.querySelectorAll(s));
  const once = (el,ev,fn)=> el.addEventListener(ev,fn,{once:true});
  const LS  = window.localStorage;
  const KEY_DONE = 'cld_tour_done';

  // اگر کاربر نخواسته یا بار دوم است، فقط با ?tour=1 فعال شود
  const url = new URL(location.href);
  const force = url.searchParams.get('tour') === '1';
  const reset = url.searchParams.get('tour') === 'reset';
  if (reset) LS.removeItem(KEY_DONE);
  if (!force && LS.getItem(KEY_DONE) === '1') return;

  // عناصر تور
  let backdrop, focus, pop, stepIndex = 0, steps = [];

  // جستجوی انعطاف‌پذیر هدف‌ها (بدون شکنندگی)
  function findRunSampleBtn(){
    // 1) ID متداول
    let el = qs('#btn-run-sample');
    if (el) return el;
    // 2) دکمه‌ای که متنش شامل «اجرای سناریو» یا «Run sample» است
    el = qsa('button').find(b => /اجرای.*سناریو|Run.*sample/i.test(b.textContent||''));
    if (el) return el;
    // 3) هر دکمه داخل hero
    const hero = qs('#hero-kpi'); if (hero) {
      el = qsa('button', hero).find(x => /سناریو|Scenario/i.test(x.textContent||''));
      if (el) return el;
    }
    return null;
  }
  function findKPIBar(){
    return qs('#hero-kpi .hero-kpis') || qs('.hero-kpis') || qs('#hero-kpi') || null;
  }
  function findLoopsPanel(){
    // نیاز به cy یا legend
    const legend = qsa('.legend, .loops, [aria-label="Loops"]')
      .find(x => /Loop|حلقه|Loops/i.test(x.textContent||''));
    if (legend) return legend;
    // اگر داخل سمت راست پنل loops دارید:
    const pane = qsa('*').find(x => /Loops/i.test(x?.textContent||'') && x.clientWidth>120 && x.clientHeight>40);
    if (pane) return pane;
    // در نهایت، اگر cy حاضر است، کل بوم را هدف می‌گیریم
    const c = getCy();
    if (c && c.container) return c.container();
    return null;
  }

  // ساخت DOM تور
  function ensureScaffold(){
    if (!qs('#cld-tour-backdrop')){
      backdrop = document.createElement('div'); backdrop.id='cld-tour-backdrop';
      focus    = document.createElement('div'); focus.id='cld-tour-focus';
      pop      = document.createElement('div'); pop.className='cld-tour-pop'; pop.dir='rtl';
      document.body.append(backdrop, focus, pop);
    }else{
      backdrop = qs('#cld-tour-backdrop'); focus = qs('#cld-tour-focus'); pop = qs('.cld-tour-pop');
    }
  }

  // جایگذاری رینگ تمرکز و پاپ‌اور
  function placeAround(target, side='bottom'){
    if (!target) return;
    const r = target.getBoundingClientRect();
    const pad = 8;
    focus.style.display='block';
    focus.style.left = `${Math.max(8, r.left - pad)}px`;
    focus.style.top  = `${Math.max(8, r.top  - pad)}px`;
    focus.style.width  = `${r.width + pad*2}px`;
    focus.style.height = `${r.height + pad*2}px`;

    // جای پاپ‌اور: ترجیح پایین/راست؛ اگر جا نبود، تطبیق بده
    let x = r.left, y = r.bottom + 10;
    if (side==='right'){ x = r.right + 12; y = r.top; }
    const vw = window.innerWidth, vh = window.innerHeight, pw = Math.min(360, pop.offsetWidth||320), ph = pop.offsetHeight||120;
    if (x + pw + 8 > vw) x = Math.max(8, vw - pw - 8);
    if (y + ph + 8 > vh) y = Math.max(8, r.top - ph - 12);
    pop.style.left = `${x}px`; pop.style.top = `${y}px`;
  }

  // محتوای هر مرحله
  function renderStep(s){
    backdrop.style.display='block';
    const { title, html, target, side } = s;
    pop.innerHTML = `
      <h4>${title}</h4>
      <p>${html}</p>
      <div class="cld-tour-actions" dir="rtl">
        <button class="cld-tour-btn" data-act="skip">عدم نمایش مجدد</button>
        ${stepIndex>0 ? '<button class="cld-tour-btn" data-act="prev">قبلی</button>' : ''}
        <button class="cld-tour-btn primary" data-act="${stepIndex<steps.length-1 ? 'next' : 'done'}">
          ${stepIndex<steps.length-1 ? 'بعدی' : 'شروع کنید'}
        </button>
      </div>`;
    placeAround(target(), side || 'bottom');
  }

  function teardown(done=false){
    window.removeEventListener('resize', onRelayout);
    window.removeEventListener('scroll', onRelayout, true);
    if (backdrop) backdrop.style.display='none';
    if (focus) focus.style.display='none';
    if (done) LS.setItem(KEY_DONE, '1');
  }

  function onRelayout(){ // با هر تغییر اندازه/اسکرول، جای پاپ‌اور را دوباره حساب کن
    const s = steps[stepIndex]; if (!s) return;
    placeAround(s.target(), s.side || 'bottom');
  }

  // تعریف مراحل (با fallback امن)
  steps = [
    {
      key:'run',
      title:'۱) اجرای سناریوی نمونه',
      html:'برای دیدن اثر سیاست، یک سناریوی نمونه را اجرا کنید.',
      target: findRunSampleBtn,
      side:'bottom'
    },
    {
      key:'kpi',
      title:'۲) اثر را در KPI ببینید',
      html:'این‌جا تغییرات KPI (Δ نسبت به Baseline) نمایش داده می‌شود.',
      target: findKPIBar,
      side:'bottom'
    },
    {
      key:'loops',
      title:'۳) حلقه‌های کلیدی',
      html:'از این بخش، حلقه‌های تقویتی/تعادلی را انتخاب و مسیرشان را های‌لایت کنید.',
      target: findLoopsPanel,
      side:'right'
    }
  ];

  // اگر هدف مرحله‌ای پیدا نشد، خودکار به مرحلهٔ بعد برو
  function advanceIfMissing(){
    const t = steps[stepIndex]?.target();
    if (!t){ stepIndex++; if (stepIndex < steps.length) renderStep(steps[stepIndex]); else teardown(true); }
  }

  // راه‌اندازی تور
  function startTour(){
    ensureScaffold();
    stepIndex = 0;
    renderStep(steps[0]);
    window.addEventListener('resize', onRelayout);
    window.addEventListener('scroll', onRelayout, true);

    pop.addEventListener('click', (e)=>{
      const act = e.target?.dataset?.act;
      if (!act) return;
      if (act==='skip'){ teardown(true); }
      else if (act==='prev'){ stepIndex = Math.max(0, stepIndex-1); renderStep(steps[stepIndex]); }
      else if (act==='next'){ stepIndex = Math.min(steps.length-1, stepIndex+1); renderStep(steps[stepIndex]); }
      else if (act==='done'){ teardown(true); }
    });
    // اگر هدف در دسترس نبود (بارگذاری پویا)، چک تأخیری
    setTimeout(advanceIfMissing, 400);
  }

  // مرحلهٔ Loops نیازمند cy/legend است؛ وقتی آماده شد هم‌تراز کن
  function startWhenReady(){
    // اگر کاربر خودش خواسته (tour=1) یا بار اول است
    const eligible = force || LS.getItem(KEY_DONE) !== '1';
    if (!eligible) return;

    // شروع پس از DOM
    const domReady = () => startTour();
    if (document.readyState === 'complete' || document.readyState === 'interactive') domReady();
    else once(document, 'DOMContentLoaded', domReady);

    // اگر cy بعداً آماده شد، فقط جای مرحله ۳ را دقیق‌تر کن
    document.addEventListener('cy:ready', ()=> {
      if (steps[2] && typeof steps[2].target === 'function') onRelayout();
    });
  }

  startWhenReady();
})();
