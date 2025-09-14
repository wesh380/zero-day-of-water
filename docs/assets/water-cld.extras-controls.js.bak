window.addEventListener('DOMContentLoaded', function(){
  (function(){
    // پیدا کردن نوار ابزار فعلی (fallback هوشمند)
    const toolbar =
      document.querySelector('#cld-toolbar') ||
      document.querySelector('.toolbar, .topbar, [data-toolbar="cld"]') ||
      // نزدیک‌ترین ظرفی که کنترل‌هایی با متن شناخته‌شده دارد:
      ([...document.querySelectorAll('header, .controls, .panel, .row')].find(
        el => /ELK|Poster|تاخیر|تأخیر|Layout|روابط|Loops|weak|strong/i.test(el.textContent||'')
      ) || null);

    // اگر پیدا نشد، بی‌خطر خارج شو
    if(!toolbar) return;

    // گروه‌ها
    const gMode = document.getElementById('group-mode');
    const gFilter = document.getElementById('group-filter');
    const gAdv = document.getElementById('group-advanced');
    const gLayout = document.getElementById('group-layout');

    // عکسِ وضعیت برای Reset
    const baselineState = new Map();

    // تشخیص گروهِ هر کنترل بر اساس متن/ویژگی‌ها
    function detectGroup(el){
      const t = (el.innerText || el.value || el.getAttribute('aria-label') || '').trim();
      if (/ELK|Poster|Layout|Auto[-\s]?layout|Grid|Dagre|Cola|Rank/i.test(t)) return 'layout';
      if (/تاخیر|تأخیر|delay|وزن|weight|loops|حلقه|weak|strong|پنهان|نمایش|highlight|threshold/i.test(t)) return 'filter';
      return 'mode';
    }

    // تشخیص «کم‌کاربرد» برای جابجایی به Advanced
    function isAdvanced(el){
      const t = (el.innerText || el.value || el.getAttribute('aria-label') || '').trim();
      return /سه.?گره|only|debug|hidden|internal|poster test|alpha|beta|cluster.+edges?/i.test(t);
    }

    // واحد و برد از متن مجاور یا attributes
    function extractUnit(el){
      const nearText = (el.closest('label')?.innerText || el.parentElement?.innerText || '').trim();
      if (/سال|year/i.test(nearText)) return 'سال';
      if (/درصد|%|leak|weight|rate/i.test(nearText)) return '%';
      return el.dataset?.unit || '';
    }
    function rangeMeta(el){
      if (el.tagName === 'INPUT' && el.type === 'range'){
        return {
          min: el.min ?? '', max: el.max ?? '', step: el.step ?? '',
          def: (el.getAttribute('value') ?? el.value ?? '')
        };
      }
      return null;
    }

    // یک «چیپ» بساز که کنترل + متادیتایش را کنار هم نشان دهد
    function wrapControl(el){
      const chip = document.createElement('div'); chip.className = 'ctl-chip';
      // سعی کن آیکن/دکمه راهنما کنار کنترل را هم جابجا کنی
      const neighbors = [];
      if (el.previousElementSibling && /\?/.test(el.previousElementSibling.textContent||'')) neighbors.push(el.previousElementSibling);
      if (el.nextElementSibling && /\?/.test(el.nextElementSibling.textContent||'')) neighbors.push(el.nextElementSibling);

      // متادیتا
      const unit = extractUnit(el);
      const rng = rangeMeta(el);

      // ذخیره مقدار پیش‌فرض برای Reset
      baselineState.set(el, (el.tagName==='INPUT' ? el.value : el.value || el.textContent));

      // مونتاژ
      chip.appendChild(el);
      neighbors.forEach(h => { h.classList?.add('ctl-help'); chip.appendChild(h); });

      const meta = document.createElement('div'); meta.className = 'meta';
      if (unit) {
        const u = document.createElement('span'); u.className='unit'; u.textContent = unit; meta.appendChild(u);
      }
      if (rng){
        const r = document.createElement('span'); r.className='rng';
        r.textContent = `min:${rng.min} • max:${rng.max} • step:${rng.step}`;
        meta.appendChild(document.createTextNode(' '));
        meta.appendChild(r);
        const d = document.createElement('span'); d.className='def';
        d.textContent = ` • default:${rng.def}`;
        meta.appendChild(d);
      }
      if (unit || rng) chip.appendChild(meta);
      return chip;
    }

    // همه کنترل‌های تعاملی در نوار فعلی
    const controls = [...toolbar.querySelectorAll('button, select, input[type="range"], input[type="checkbox"], .toggle, .switch')]
      // کنترل‌های ذخیره/بارگذاری/ساخت سناریو و… مربوط به سناریو را دستنزن
      .filter(el => !/Save|Load|New|Export/i.test(el.innerText||el.value||''));

    // جابجایی به گروه‌ها
    controls.forEach(el => {
      const chip = wrapControl(el);
      const group = detectGroup(el);
      if (group === 'layout'){ gLayout.appendChild(chip); }
      else if (group === 'filter'){ (isAdvanced(el) ? gAdv : gFilter).appendChild(chip); }
      else { gMode.appendChild(chip); }
    });

    // دکمه‌های Reset هر گروه
    function addResetButton(container){
      const btn = document.createElement('button');
      btn.type='button'; btn.className='btn-reset'; btn.textContent='بازنشانی';
      btn.addEventListener('click', () => {
        container.querySelectorAll('input, select').forEach(el => {
          const base = baselineState.get(el);
          if (base != null){
            if (el.tagName==='INPUT' && el.type==='checkbox'){
              el.checked = !!base;
              el.dispatchEvent(new Event('change', {bubbles:true}));
            }else{
              el.value = base;
              el.dispatchEvent(new Event('input', {bubbles:true}));
              el.dispatchEvent(new Event('change', {bubbles:true}));
            }
          }
        });
      });
      const wrap = document.createElement('div'); wrap.className='ac-body'; wrap.appendChild(btn);
      container.parentElement.appendChild(wrap);
    }
    addResetButton(gMode);
    addResetButton(gFilter);
    addResetButton(gLayout);
  })();
});
