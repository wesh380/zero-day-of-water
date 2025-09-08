import { setClass } from './css-classes.js';

// ===== Provenance & Model/Policy Card (singleton, CSP-safe, no interference) =====
(function(){
  if (window.__PROVENANCE_BOUND__) return; window.__PROVENANCE_BOUND__ = true;

  // ---------- Helpers ----------
  const $  = (s, r=document)=> r.querySelector(s);
  const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));
  const safe = (v, d='—') => (v==null || v==='') ? d : v;
  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content || null;

  // Read versions/commit from globals or meta
  function readVersions(){
    const MODEL = window.MODEL_VERSION || meta('model-version') || 'v?';
    const DATA  = window.DATA_VERSION  || meta('data-version')  || 'v?';
    const UI    = window.UI_VERSION    || meta('ui-version')    || 'v?';
    const GIT   = window.GIT_COMMIT    || meta('git-commit')    || '—';
    const UPDATED = window.DATA_UPDATED || meta('data-updated') || null;
    return { MODEL, DATA, UI, GIT, UPDATED };
  }

  // Read metrics
  function readMetrics(){
    const m = window.Model?.metrics || window.Sim?.metrics || window.__state?.metrics || {};
    return {
      MAPE: m.MAPE ?? null,
      RMSE: m.RMSE ?? null,
      R2:   m.R2   ?? null,
      extreme: m.ExtremeConditions ?? m.extreme ?? null,
      note: m.note || null
    };
  }

  // Gather assumptions/limits if available
  function readAssumptions(){
    const A = window.Model?.assumptions || window.DATA_ASSUMPTIONS || [];
    const L = window.Model?.limitations || window.DATA_LIMITATIONS || [];
    return { A, L };
  }

  // Detect charts & their provenance (by data-* attributes or reasonable fallbacks)
  function scanCharts(){
    // اولویت با المنت‌هایی که data-provenance دارند
    const items = $$('[data-provenance], figure[data-provenance], .chart-card, canvas[data-chart]');
    return items.map(el=>{
      const rect = el.getBoundingClientRect();
      const prov = {
        el,
        title: el.dataset.title || el.getAttribute('aria-label') || el.querySelector('h4,h5,.title')?.textContent || 'Chart',
        unit:  el.dataset.unit || meta('default-unit') || '',
        source: el.dataset.source || meta('data-source') || '—',
        updated: el.dataset.updated || meta('data-updated') || readVersions().UPDATED || '—',
        version: el.dataset.version || readVersions().DATA,
        csv: el.dataset.csv || '',   // اگر داده CSV دارید
        img: null                    // بعداً اگر canvas بود، PNG می‌سازیم
      };
      return prov;
    });
  }

  // Try to export chart data from Chart.js if available
  function chartToCSV(el){
    try{
      const canvas = (el.tagName==='CANVAS') ? el : el.querySelector('canvas');
      const inst = canvas && canvas.__chartist || canvas?.__chartjs || canvas?.chart || null;
      const chart = inst?.config || inst; // Chart.js v3/4 اغلب روی canvas.__chartjs نیست؛ این fallback ساده است
      if (!chart?.data) return null;
      const { labels = [], datasets = [] } = chart.data;
      const rows = [];
      const header = ['label', ...datasets.map(d=>d.label||'series')];
      rows.push(header.join(','));
      const N = Math.max(labels.length, ...datasets.map(d=>d.data?.length||0));
      for (let i=0;i<N;i++){
        const row = [JSON.stringify(labels[i] ?? '')];
        datasets.forEach(d=> row.push(d.data?.[i] ?? ''));
        rows.push(row.join(','));
      }
      return rows.join('\n');
    }catch(_){ return null; }
  }

  function canvasToPNG(el){
    const canvas = (el.tagName==='CANVAS') ? el : el.querySelector('canvas');
    if (!canvas) return null;
    try { return canvas.toDataURL('image/png'); } catch(_){ return null; }
  }

  // ---------- UI Builders ----------
  function ensureProvButton(){
    const host = $('#hero-kpi') || document.body;
    if (!host || $('#prov-open-btn')) return;
    const btn = document.createElement('button');
    btn.id='prov-open-btn'; btn.type='button'; btn.className='prov-btn'; btn.dir='rtl';
    btn.innerHTML = '<span class="dot"></span><span>اطلاعات مدل/سیاست</span>';
    // جایگذاری: کنار سطر Baseline/عنوان
    (host.querySelector('.baseline-row') || host).appendChild(btn);
    btn.addEventListener('click', openModal);
  }

  function buildModal(){
    if ($('#prov-modal')) return;
    const wrap = document.createElement('div'); wrap.id='prov-modal'; wrap.dir='rtl';
    wrap.innerHTML = `
      <div id="prov-backdrop"></div>
      <div id="prov-card">
        <div class="prov-head">
          <h3>Model / Policy Card</h3>
          <button id="prov-copy" class="prov-btn-sm">کپی JSON</button>
          <button id="prov-close" class="prov-close">بستن</button>
        </div>
        <div class="prov-grid">
          <section class="prov-sec" id="prov-goal">
            <h4>هدف و محدوده</h4>
            <div class="prov-note" id="prov-goal-text">هدف: کاهش شکاف عرضه–تقاضا؛ محدوده: شهری/منطقه‌ای (قابل ویرایش در کد).</div>
          </section>
          <section class="prov-sec" id="prov-versions">
            <h4>نسخه‌ها</h4>
            <div class="prov-kv">
              <div class="k">Model</div><div id="prov-model">—</div>
              <div class="k">Data</div><div id="prov-data">—</div>
              <div class="k">UI</div><div id="prov-ui">—</div>
              <div class="k">Commit</div><div id="prov-git">—</div>
              <div class="k">Updated</div><div id="prov-updated">—</div>
            </div>
          </section>
          <section class="prov-sec" id="prov-calib">
            <h4>کالیبراسیون/اعتبارسنجی</h4>
            <div class="prov-kv">
              <div class="k">MAPE</div><div id="prov-mape">—</div>
              <div class="k">RMSE</div><div id="prov-rmse">—</div>
              <div class="k">R²</div><div id="prov-r2">—</div>
              <div class="k">Extreme cond.</div><div id="prov-xt">—</div>
            </div>
            <div class="prov-note" id="prov-calib-note">—</div>
          </section>
          <section class="prov-sec" id="prov-assump">
            <h4>فرض‌ها و محدودیت‌ها</h4>
            <div class="prov-kv">
              <div class="k">فرض‌ها</div><div id="prov-A">—</div>
              <div class="k">محدودیت‌ها</div><div id="prov-L">—</div>
            </div>
          </section>
        </div>
        <div class="prov-actions">
          <button id="prov-export" class="prov-btn-sm">دانلود کارت (JSON)</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    $('#prov-backdrop').addEventListener('click', closeModal);
    $('#prov-close').addEventListener('click', closeModal);
    $('#prov-copy').addEventListener('click', copyJSON);
    $('#prov-export').addEventListener('click', exportJSON);
  }

  function openModal(){
    buildModal();
    const v = readVersions(); const m = readMetrics(); const {A,L} = readAssumptions();
    $('#prov-model').textContent = v.MODEL;
    $('#prov-data').textContent  = v.DATA;
    $('#prov-ui').textContent    = v.UI;
    $('#prov-git').textContent   = v.GIT;
    $('#prov-updated').textContent = safe(v.UPDATED, '—');

    $('#prov-mape').textContent  = m.MAPE ?? '—';
    $('#prov-rmse').textContent  = m.RMSE ?? '—';
    $('#prov-r2').textContent    = m.R2   ?? '—';
    $('#prov-xt').textContent    = (m.extreme==null ? '—' : String(!!m.extreme));
    $('#prov-calib-note').textContent = m.note || '—';

    $('#prov-A').textContent = (Array.isArray(A) && A.length) ? A.join('؛ ') : '—';
    $('#prov-L').textContent = (Array.isArray(L) && L.length) ? L.join('؛ ') : '—';

    setClass($('#prov-modal'), [], ['hidden']);
  }
  function closeModal(){ const m=$('#prov-modal'); if (m) setClass(m, ['hidden']); }
  function copyJSON(){ navigator.clipboard?.writeText(JSON.stringify(currentCard(), null, 2)); }
  function exportJSON(){
    const blob = new Blob([JSON.stringify(currentCard(), null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download = `model-policy-card-${new Date().toISOString().slice(0,10)}.json`; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 500);
  }
  function currentCard(){
    const v = readVersions(); const m = readMetrics(); const {A,L} = readAssumptions();
    return {
      app: { path: location.pathname, tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
      versions: v, metrics: m, assumptions: A, limitations: L
    };
  }

  // ---------- Chart Provenance (badge + tooltip + downloads) ----------
  function mountProvenance(){
    const list = scanCharts();
    list.forEach(p=>{
      const host = p.el; if (!host || host.__provMounted) return; host.__provMounted = true;
      // Badge
      const badge = document.createElement('div');
      badge.className = 'prov-badge';
      badge.dir='rtl';
      badge.innerHTML = `<span>ⓘ منشأ</span><span style="opacity:.7">نسخه ${p.version}</span>`;
      setClass(host, ['relative']);
      host.appendChild(badge);

      // Tooltip
      const tip = document.createElement('div');
      tip.className = 'prov-tip';
      tip.innerHTML = `
        <h5>${p.title}</h5>
        <div class="row"><strong>منبع:</strong> <span>${safe(p.source)}</span></div>
        <div class="row"><strong>به‌روزرسانی:</strong> <span>${safe(p.updated)}</span></div>
        <div class="row"><strong>واحد:</strong> <span>${safe(p.unit,'—')}</span></div>
        <div class="row"><strong>نسخه داده:</strong> <span>${safe(p.version)}</span></div>
        <div class="act">
          <a class="prov-link" data-act="csv">دانلود CSV</a>
          <a class="prov-link" data-act="png">دانلود PNG</a>
        </div>
      `;
      document.body.appendChild(tip);
      setClass(tip, ['hidden']);

      // Positioning
      function place(){
        const r = badge.getBoundingClientRect();
        const tw = tip.offsetWidth || 260, th = tip.offsetHeight || 140;
        let left = Math.max(8, r.left - (tw - r.width));
        let top  = r.top - th - 8;
        if (top < 8) { top = r.bottom + 8; }
        tip.style.left = `${left}px`; tip.style.top = `${top}px`;
      }

      let open=false;
      function toggle(){
        open = !open;
        tip.classList.toggle('hidden', !open);
        if (open) place();
      }
      badge.addEventListener('click', (e)=>{ e.stopPropagation(); toggle(); });
      document.addEventListener('click', ()=>{ if (open){ open=false; setClass(tip, ['hidden']); } });

      // Downloads
      tip.addEventListener('click', (e)=>{
        const act = e.target?.dataset?.act; if (!act) return;
        e.preventDefault();
        if (act==='csv'){
          if (p.csv){ window.open(p.csv, '_blank'); return; }
          const csv = chartToCSV(host);
          if (!csv){ alert('CSV در دسترس نیست. data-csv را تنظیم کنید.'); return; }
          const blob = new Blob([csv], {type:'text/csv'}); const a=document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = `${p.title.replace(/\s+/g,'_')}.csv`; a.click();
          setTimeout(()=>URL.revokeObjectURL(a.href), 500);
        }
        if (act==='png'){
          const dataURL = canvasToPNG(host);
          if (!dataURL){ alert('PNG در دسترس نیست (canvas یافت نشد).'); return; }
          const a=document.createElement('a'); a.href=dataURL; a.download = `${p.title.replace(/\s+/g,'_')}.png`; a.click();
        }
      });
      window.addEventListener('resize', ()=>{ if (open) place(); });
      window.addEventListener('scroll', ()=>{ if (open) place(); }, true);
    });
  }

  // ---------- Init ----------
  function init(){
    ensureProvButton();
    mountProvenance();
  }
  if (document.readyState==='complete' || document.readyState==='interactive') init();
  else window.addEventListener('DOMContentLoaded', init, { once:true });

  // اگر بعداً چارت‌ها لود شدند، دوباره تلاش کن (بدون لوپ)
  document.addEventListener('model:updated', ()=>{ mountProvenance(); });
})();
