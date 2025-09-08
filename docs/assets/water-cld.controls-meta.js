import { setClass } from './css-classes.js';

// ===== Controls Meta & Grouping (singleton, CSP-safe, no interference) =====
(function(){
  if (window.__CTL_META_BOUND__) return;
  window.__CTL_META_BOUND__ = true;

  // ---------- ابزارهای کمکی ----------
  const qs  = (s, r=document)=> r.querySelector(s);
  const qsa = (s, r=document)=> Array.from(r.querySelectorAll(s));
  const norm = s => (s||'').replace(/\s+/g,' ').trim();
  const txt  = el => norm(el?.textContent||'');
  const isIn = (t, arr) => arr.some(p=>p.test(t));

  // کارت‌ها را با عناوین (Mode/Filter/Layout) پیدا کن – RTL-aware و انعطاف‌پذیر
  function findCards(){
    const candidates = qsa('section, div, .ac-card, .card, details');
    const roles = {mode:null, filter:null, layout:null};
    candidates.forEach(el=>{
      const h = txt(el.querySelector('summary, .title, .header, h3, h4, [role="heading"]'));
      if (!h) return;
      const H = h.toLowerCase();
      if (!roles.mode   && isIn(H,[/mode|حالت/i]))   roles.mode   = el;
      if (!roles.filter && isIn(H,[/filter|فیلتر/i])) roles.filter = el;
      if (!roles.layout && isIn(H,[/layout|چیدمان/i]))roles.layout = el;
    });
    return roles;
  }

  // عنوان کارت را با دکمه Help و شمارنده n فعال ارتقا بده (بدون تغییر متن اصلی)
  function enhanceHeader(card){
    if (!card || card.__hdr_done) return;
    card.__hdr_done = true;
    const header = card.querySelector('summary, .title, .header, h3, h4, [role="heading"]');
    if (!header) return;
    CLD_SAFE?.safeAddClass(header,'controls-meta-header');
    CLD_SAFE?.safeAddClass(card,'controls-meta-card');

    // شمارنده
    let count = document.createElement('span');
    count.className = 'controls-meta-count';
    count.textContent = ''; // بعداً پر می‌شود
    header.appendChild(count);

    // Help
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'controls-help-btn';
    btn.textContent = 'راهنما';
    header.appendChild(btn);

    let pop = document.createElement('div');
    pop.className = 'controls-help-pop';
    pop.innerHTML = '<ul></ul>';
    card.appendChild(pop);
    setClass(pop, ['hidden']);

    // جمع‌آوری همه «؟»های پراکنده داخل کارت → به لیست راهنما
    const helpItems = [];
    qsa('*', card).forEach(el=>{
      const t = txt(el);
      if (t === '?' || el.dataset?.help){
        const item = el.dataset?.help || el.getAttribute('title') || 'راهنمای این کنترل';
        helpItems.push(item);
        // پنهان کن تا مزاحم نباشد (دست نزدن به کنترل‌های واقعی)
        setClass(el, ['hidden']);
      }
    });
    if (helpItems.length){
      const ul = pop.querySelector('ul');
      helpItems.forEach(s => { const li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
    }else{
      setClass(btn, ['hidden']);
    }

    // باز/بسته کردن پاپ‌اور
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      pop.classList.toggle('hidden');
    });
    document.addEventListener('click', ()=> setClass(pop, ['hidden']));
  }

  // خواندن متادیتای کنترل
  function metaFor(el){
    // متن عنوان نزدیک کنترل
    const label = el.closest('label')?.innerText
               || el.getAttribute('aria-label')
               || el.name || el.id || el.dataset?.param || el.placeholder || 'کنترل';
    // واحد از متن نزدیک یا data-unit
    let unit = el.dataset?.unit || '';
    const near = (el.closest('label')?.innerText || el.parentElement?.innerText || '').toLowerCase();
    if (!unit){
      if (/%|درصد|percent|rate/i.test(near)) unit = '%';
      else if (/سال|year/i.test(near)) unit = 'سال';
      else if (/روز|day/i.test(near)) unit = 'روز';
    }
    // رنج
    let rng = null, def = null;
    if (el.tagName==='INPUT' || el.tagName==='SELECT'){
      const t = (el.type||'').toLowerCase();
      if (['range','number'].includes(t) || el.tagName==='SELECT'){
        rng = { min: el.min ?? '', max: el.max ?? '', step: el.step ?? '' };
        def = el.getAttribute('value') ?? el.defaultValue ?? el.value ?? '';
      }
    }
    return {label: norm(label), unit, rng, def};
  }

  // ساخت «چیپ» اطراف کنترل (بدون تغییر رفتار کنتر‌ل)
  function wrap(el){
    // اگر قبلاً wrap شده، خروج
    if (el.closest('.ctl-chip')) return el.closest('.ctl-chip');

    const m = metaFor(el);
    const chip = document.createElement('div');
    chip.className = 'ctl-chip';

    const title = document.createElement('span');
    title.className = 'ctl-title';
    title.textContent = m.label;

    chip.appendChild(title);
    chip.appendChild(document.createElement('span')).className = 'sep';
    chip.appendChild(el); // خود کنترل را جابه‌جا می‌کنیم؛ لیسنرها حفظ می‌شوند

    const meta = document.createElement('span');
    // واحد
    if (m.unit){
      const u = document.createElement('span'); u.className='unit'; u.textContent=m.unit;
      meta.appendChild(u);
    }
    // رنج و پیش‌فرض
    if (m.rng){
      const r = document.createElement('span'); r.className='rng';
      r.textContent = `min:${m.rng.min||'—'} • max:${m.rng.max||'—'} • step:${m.rng.step||'—'}`;
      meta.appendChild(document.createTextNode(' '));
      meta.appendChild(r);
      const d = document.createElement('span'); d.className='def';
      d.textContent = ` • default:${m.def||'—'}`;
      meta.appendChild(d);
    }
    if (meta.childNodes.length) chip.appendChild(meta);
    return chip;
  }

  // محاسبه «n فعال» = تعداد کنترل‌هایی که از مقدار پیش‌فرض خارج شده‌اند
  function computeActiveCount(card){
    let n = 0;
    qsa('input, select', card).forEach(el=>{
      const def = el.getAttribute('value') ?? el.defaultValue;
      if (el.type==='checkbox'){
        const base = el.hasAttribute('checked') ? true : (def ? def==='1' : false);
        if (el.checked !== base) n++;
      }else if (def != null){
        if (String(el.value) !== String(def)) n++;
      }
    });
    return n;
  }

  // پردازش یک کارت: wrap controls + header + counter + collapse
  function processCard(card){
    if (!card || card.__processed) return;
    card.__processed = true;

    enhanceHeader(card);
    const body = card.querySelector('.ac-body, .controls, .body, .content') || card; // fallback امن

    // فقط input/select را wrap کن تا با دکمه‌های عملیاتی تداخل نشود
    const controls = qsa('input, select', body)
      .filter(el => !el.closest('.ctl-chip')); // از wrap مجدد جلوگیری

    if (!controls.length){
      // کارت خالی → collapse
      CLD_SAFE?.safeAddClass(card,'card-collapsed');
    }else{
      card.classList.remove('card-collapsed');
    }

    controls.forEach(el=>{
      const chip = wrap(el);
      // اگر chip هنوز در body نیست، اضافه‌اش کن (نزدیک همان کنترل)
      if (chip && !chip.parentElement) body.appendChild(chip);
    });

    // شمارنده فعال
    const setCount = ()=>{
      const n = computeActiveCount(card);
      const countEl = card.querySelector('.controls-meta-count');
      if (countEl){
        const title = txt(card.querySelector('summary, .title, .header, h3, h4, [role="heading"]')) || '';
        // نمایش مثل: "Filter (۳ فعال)"
        if (/filter|فیلتر/i.test(title)) countEl.textContent = n ? `(${n} فعال)` : '(۰ فعال)';
        else countEl.textContent = n ? `(${n} تغییر)` : '';
      }
    };
    setCount();

    // به تغییرات گوش بده (بدون حذف لیسنرهای موجود)
    card.__meta_oninput && card.removeEventListener('input', card.__meta_oninput);
    card.__meta_onchange && card.removeEventListener('change', card.__meta_onchange);
    card.__meta_oninput = ()=> setCount();
    card.__meta_onchange = ()=> setCount();
    card.addEventListener('input', card.__meta_oninput);
    card.addEventListener('change', card.__meta_onchange);
  }

  // اجرای کل فرآیند
  function init(){
    const {mode, filter, layout} = findCards();
    [mode, filter, layout].forEach(processCard);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else window.addEventListener('DOMContentLoaded', init, { once:true });
})();
