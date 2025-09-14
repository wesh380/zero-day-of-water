// ===== A11Y & Mobile bootstrap (singleton, CSP-safe, no interference) =====
/* global graphStore */
(function(){
  const CLD_CORE = (typeof window !== 'undefined' && window.CLD_CORE) ? window.CLD_CORE : {};
  const getCy = CLD_CORE.getCy ? CLD_CORE.getCy : () => null;
  if (window.__A11Y_BOUND__) return; window.__A11Y_BOUND__ = true;

  // ------- Helpers -------
  const $  = (s, r=document)=> r.querySelector(s);
  const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));
  const hasText = (el)=> !!(el && (el.textContent||'').trim().length);
  const setOnce = (el, attr, val)=> { if (el && !el.hasAttribute(attr)) el.setAttribute(attr, val); };

  // 1) Skip to main content
  function ensureSkipLink(){
    if ($('#a11y-skip')) return;
    const a = document.createElement('a');
    a.id='a11y-skip'; a.className='a11y-skiplink'; a.href='#main-content';
    a.textContent = 'پرش به محتوای اصلی';
    document.body.appendChild(a);

    // اگر هدف پرش وجود ندارد، یکی بسازیم (بی‌تداخل)
    let target = $('#main-content') || $('main') || $('#hero-kpi');
    if (!target){
      target = document.createElement('div'); target.id='main-content';
      // تلاش برای جای‌گذاری قبل از بوم/هیرو
      const host = $('#hero-kpi') || $('header') || document.body;
      host.parentElement?.insertBefore(target, host);
    }
  }

  // 2) Accessible Name برای عناصر تعاملی بدون نام
  function ensureAccessibleNames(){
    const interactive = $$('button, [role="button"], a[href], input, select, textarea');
    interactive.forEach(el=>{
      const hasName = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') || hasText(el) || !!el.getAttribute('title');
      if (!hasName){
        // سعی کن از dataset یا placeholder یا name استفاده کنی
        const guess = el.dataset?.label || el.placeholder || el.name || el.id || 'دکمه بدون برچسب';
        setOnce(el, 'aria-label', guess);
      }
      // نقش دکمه‌های غیر‌native
      if (el.getAttribute('role')==='button'){ el.setAttribute('tabindex', el.getAttribute('tabindex')||'0'); }
    });
  }

  // 3) Keyboard activation برای role="button"
  function wireKeyboardActivation(){
    $$('[role="button"]').forEach(el=>{
      if (el.__a11y_keybound) return;
      el.__a11y_keybound = true;
      el.addEventListener('keydown', (e)=>{
        if (e.key==='Enter' || e.key===' '){
          e.preventDefault();
          // «کلیک» غیرمزاحم
          el.click?.();
        }
      });
    });
  }

  // 4) Touch target ≥ 44px برای عناصر کوچک
  function ensureTouchTargets(){
    const candidates = $$('button, .btn, .btn-soft, [role="button"], .icon-btn');
    candidates.forEach(el=>{
      const r = el.getBoundingClientRect();
      if (r.width < 44 || r.height < 44){
        CLD_SAFE?.safeAddClass(el,'a11y-touch');
        if (/icon/i.test(el.className)) CLD_SAFE?.safeAddClass(el,'round'); // برای آیکن‌های دایره‌ای
      }
    });
  }

  // 5) آرایش دسترس‌پذیر Cytoscape (بی‌تداخل)
  function a11yForCytoscape(){
    var run = function(cy){
      // ظرف‌های رایج
      const cyEl = $('#cy') || $('.cytoscape-container') || $('.cy-container') || $('#cld-canvas') || (cy && cy.container && cy.container());
      const container = (cyEl && cyEl.nodeType ? cyEl : null) || (cy && cy.container && cy.container());
      if (!container || container.__a11y_done) return;

      container.__a11y_done = true;
      CLD_SAFE?.safeAddClass(container,'cy-a11y-focus');
      setOnce(container, 'tabindex', '0');                 // فوکوس‌پذیر
      setOnce(container, 'role', 'application');           // محتوای تعاملی پیچیده
      const descId = 'cy-a11y-desc';
      if (!$('#'+descId)){
        const sr = document.createElement('div');
        sr.id = descId; sr.className = 'sr-only';
        sr.textContent = 'بوم تعامل‌پذیر نمودار علّی. برای جابه‌جایی از ماوس/لمس استفاده کنید؛ برای بزرگ‌نمایی از Ctrl+اسکرول. برای خروج از بوم، کلید Tab را فشار دهید.';
        document.body.appendChild(sr);
      }
      setOnce(container, 'aria-describedby', descId);
      setOnce(container, 'aria-label', 'نمودار علّی-حلقه‌ای (CLD)');
    };

    if (window.graphStore && typeof window.graphStore.run === 'function') {
      graphStore.run(run);
    } else if (getCy() && typeof getCy().container === 'function') {
      try{ run(getCy()); }catch(_){ }
    }
  }

  // 6) کم‌کردن نویز TabOrder: حذف از Tab برای عناصر تزئینی/پنهان
  function pruneDecorativesFromTab(){
    // Legend یا عناصر راهنما که نیازی به فوکوس ندارند
    $$('.legend-sticky, .legend, [aria-hidden="true"]').forEach(el=>{
      if (getComputedStyle(el).display==='none') return;
      if (!el.matches('a,button,input,select,textarea,[role="button"]')){
        setOnce(el, 'tabindex', '-1');
      }
    });
  }

  // 7) اجرای مرحله‌ای و امن
  function init(){
    ensureSkipLink();
    ensureAccessibleNames();
    wireKeyboardActivation();
    ensureTouchTargets();
    a11yForCytoscape();
    pruneDecorativesFromTab();
  }

  if (document.readyState==='complete' || document.readyState==='interactive') init();
  else window.addEventListener('DOMContentLoaded', init, { once:true });

  // اگر بعداً بوم/پنل‌ها لود/تغییر کردند، یک رفرش سبک
  document.addEventListener('model:updated', ()=>{ ensureAccessibleNames(); ensureTouchTargets(); a11yForCytoscape(); });

})();

