// ===== CLD Readability (singleton, CSP-safe, no interference) =====
/* global graphStore */
(function(){
  // --- گارد عدم‌تداخل
  if (window.__READABILITY_BOUND__ || window.__CLD_READABILITY_BOUND__) return;
  window.__READABILITY_BOUND__ = window.__CLD_READABILITY_BOUND__ = true;

  // --- onCyReady: اگر از قبل تعریف نشده، نسخه‌ی مینیمال بساز
  if (!window.onCyReady){
    window.onCyReady = function(run){
      const c0 = getCy();
      if (c0 && typeof c0.on==='function'){ try{run(c0);}catch(_){ } return; }
      document.addEventListener('cy:ready', e=>{ const c=e.detail?.cy||getCy(); if(c) try{run(c);}catch(_){ } }, {once:true});
      if (document.readyState!=='loading') setTimeout(()=>{ const c=getCy(); if(c) try{run(c);}catch(_){ } },0);
      else document.addEventListener('DOMContentLoaded', ()=>{ const c=getCy(); if(c) try{run(c);}catch(_){ } }, {once:true});
    };
  }
  // دی‌بونس عمومی
  const debounce = window.__cldDebounce || ((fn,ms=70)=>{ let t=0; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; });

  // --- شروع پس از آماده‌شدن Cytoscape
  function run(cy){

    // 1) یک‌بار استایل‌های پایه (بدون تغییر پالت موجود)
    if (!cy.scratch('_readability_style_applied')){
      cy.batch(()=> {
        cy.style()
          // برچسب نودها
          .selector('node')
          .style({
            'label':'data(_label)',
            'text-wrap':'wrap',
            'text-max-width':'180px',
            'text-valign':'center',
            'text-halign':'center',
            'min-zoomed-font-size': 10,      // کمینه زوم‌شده؛ فونت واقعی را پایین‌تر تنظیم می‌کنیم
            'shape':'round-rectangle'
          })
          // برچسب قطبیت روی «label مبدأ» تا label اصلی یال‌ها دست‌نخورده بماند
          .selector('edge')
          .style({
            'source-label':'data(_signLabel)',
            'source-text-margin-y':'-6px',
            'font-size': 12,
            'min-zoomed-font-size': 8
          })
          // یال‌های دارای تاخیر
          .selector('edge.delayed')
          .style({'line-style':'dotted'})
          .update();
      });
      cy.scratch('_readability_style_applied', true);
    }

    // 2) برچسب نودها (از داده یا id) + Auto-resize
    function updateNodeLabels(){
      cy.nodes().forEach(n=>{
        const lbl = n.data('label') ?? n.data('name') ?? n.data('title') ?? n.id();
        if (n.data('_label') !== lbl) n.data('_label', String(lbl));
      });
    }

    const hasCoreAutosize = typeof window.measureAndResizeNodes === 'function';
    const ctx = hasCoreAutosize ? null : document.createElement('canvas').getContext('2d');

    function autosizeNodesFallback(){
      if (!ctx) return;
      cy.batch(()=>{
        cy.nodes().forEach(n=>{
          const label = (n.data('_label')||'').toString();
          const fs = Math.max(12, parseFloat(n.style('font-size')) || 12); // ≥12px
          const ff = n.style('font-family') || 'IRANSans, Tahoma, sans-serif';
          ctx.font = `${fs}px ${ff}`;
          const padX=16, padY=8, minW=64, minH=28;
          const lines = label.split(/\n|\\n/);
          const widths = lines.map(t=>ctx.measureText(t).width);
          const w = Math.max(minW, Math.max(...widths,0) + padX*2);
          const h = Math.max(minH, lines.length*(fs+6) + padY*2);
          n.style({ width:w, height:h, 'font-size': fs });
        });
      });
    }

    // 3) قطبیت و تاخیر و ضخامت یال‌ها
    function widthForEdge(e){
      // |weight| را به بازه 1..4 نگاشت می‌کنیم (clamp)
      const w = Math.abs(Number(e.data('weight') ?? e.data('w') ?? 0));
      const norm = Math.max(0, Math.min(1, isFinite(w) ? w : 0));
      return 1 + 3*norm; // 1 تا 4 پیکسل
    }
    function updateEdges(){
      cy.batch(()=>{
        cy.edges().forEach(e=>{
          // قطبیت
          const s = (e.data('sign') ?? e.data('polarity') ?? (Number(e.data('weight'))>=0 ? +1 : -1));
          e.data('_signLabel', s>=0 ? '+' : '–');
          // تاخیر
          const delayed = !!(e.data('delay') || e.data('lag') || Number(e.data('tau'))>0 || Number(e.data('delayYears'))>0);
          e.toggleClass('delayed', delayed);
          // ضخامت
          e.style('width', widthForEdge(e));
        });
      });
    }

    // 4) رفرش دی‌بونس (بدون گوش‌دادن به style → عدم لوپ)
    const refresh = ()=>{ updateNodeLabels(); hasCoreAutosize ? window.measureAndResizeNodes(cy) : autosizeNodesFallback(); updateEdges(); };
    const schedule = debounce(refresh, 70);
    refresh();
    cy.on('data add remove position pan zoom layoutstop', schedule);

    // 5) دکمه High-contrast (فقط هنگام کلیک style() را به‌روزرسانی می‌کند)
    if (!document.getElementById('toggle-high-contrast')){
      const btn = document.createElement('button');
      btn.id='toggle-high-contrast'; btn.type='button'; btn.className='btn-soft'; btn.textContent='کنتراست بالا';
      (document.querySelector('#cld-toolbar') ||
       document.querySelector('#hero-kpi') ||
       document.querySelector('header') || document.body).appendChild(btn);
      let on=false;
      btn.addEventListener('click', ()=>{
        on=!on;
        cy.batch(()=>{
          cy.style()
            .selector('node').style({'text-outline-width': on?3:1, 'text-outline-color': on?'#000':'transparent'})
            .selector('edge').style({'text-outline-width': on?3:0, 'text-outline-color': on?'#000':'transparent'})
            .update();
        });
      });
    }

    // 6) Legend بیرون بوم (sticky) – کلون امن از Legend موجود یا ساخت نسخهٔ پیش‌فرض
    (function mountStickyLegend(){
      // ظرفِ بوم را بگیر
      const container = cy.container && cy.container();
      if (!container || container.__legend_mounted) return;
      container.__legend_mounted = true;

      // محتوا را از Legend موجود (اگر هست) برمی‌داریم
      const floatLegend = document.querySelector('.legend, .cy-legend, [data-legend]');
      const sticky = document.createElement('aside');
      sticky.className = 'legend-sticky';
      sticky.dir = 'rtl';
      sticky.innerHTML = `
        <h4>راهنما</h4>
        <div class="row"><span class="swatch pos"></span><span>رابطه مثبت (+)</span></div>
        <div class="row"><span class="swatch neg"></span><span>رابطه منفی (−)</span></div>
        <div class="row"><span class="swatch delay"></span><span>تأخیر (dotted)</span></div>
        <div class="row"><span class="swatch"></span><span>ضخامت ∝ |وزن رابطه|</span></div>
      `;
      // جایگذاری: sticky را به عنوان «خواهر» بوم اضافه می‌کنیم تا خارج از بوم باشد
      const host = container.parentElement || container;
      host.insertBefore(sticky, container); // قبل از بوم تا بیرون آن قرار گیرد

      // Legend شناور قبلی را پنهان کن تا دوبل نشود
      if (floatLegend) setClass(floatLegend, ['hidden'], ['show']);
    })();
  }

  if (window.graphStore && typeof window.graphStore.run === 'function') {
    graphStore.run(run);
  } else {
    onCyReady(run);
  }
})();
