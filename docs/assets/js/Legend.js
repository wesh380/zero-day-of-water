export default function Legend({ swClass, bubbleSizeClass } = {}) {
  const div = L.DomUtil.create('div', 'legend-dock map-panel');
  div.dir = 'rtl';
  div.innerHTML = `<div class="legend-tabs"></div><div class="legend-body"></div>`;
  if (localStorage.getItem('ama-legend-collapsed') === '1') div.classList.add('collapsed');
  let groups = [], onFilter = null;

  function renderTabs() {
    const tabs = div.querySelector('.legend-tabs');
    tabs.innerHTML = groups
      .map(g => `<button class="chip" data-k="${g.key}">${g.icon || ''} ${g.title}</button>`)
      .join('');
    tabs.querySelectorAll('.chip').forEach(t => (t.onclick = () => activate(t.dataset.k)));

    const toggle = document.createElement('button');
    toggle.className = 'chip';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', String(!div.classList.contains('collapsed')));
    toggle.textContent = div.classList.contains('collapsed') ? 'باز کردن' : 'جمع کردن';
    toggle.onclick = () => {
      div.classList.toggle('collapsed');
      const isCol = div.classList.contains('collapsed');
      toggle.textContent = isCol ? 'باز کردن' : 'جمع کردن';
      toggle.setAttribute('aria-expanded', String(!isCol));
      try { localStorage.setItem('ama-legend-collapsed', isCol ? '1' : '0'); } catch (_) {}
    };
    tabs.appendChild(toggle);
  }

  function activate(key) {
    const tabs = div.querySelectorAll('.legend-tabs .chip[data-k]');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.k === key));
    const g = groups.find(x => x.key === key), body = div.querySelector('.legend-body');
    if (!g) { body.innerHTML = ''; return; }
    if (g.type === 'choropleth') {
      const fmt = n => (window.__AMA_fmtNumberFa ? __AMA_fmtNumberFa(n, { digits: 0 }) : n);
      const k = Array.isArray(g.classes) ? g.classes.length : 0;
      const periodChip = g.period ? `<span class="chip muted">${g.period}</span>` : '';
      const methodChip = g.method ? `<span class="chip muted">${g.method}<span class="info" title="روش طبقه‌بندی: ${g.method} (k=${k})">ⓘ</span></span>` : '';
      const classChip = `<span class="chip">کلاس‌ها: ${fmt(k)}</span>`;
      body.innerHTML = `
        <div class="legend-head"><b>${g.title}</b>${g.unit ? `<span class="unit">${g.unit}</span>` : ''}${periodChip}${methodChip}${classChip}</div>
        ${g.sub ? `<div class="subhead text-[10px] opacity-70">${g.sub}</div>` : ''}
        <ul class="swatches">${g.classes
          .map(c => `
          <li data-min="${c.min}" data-max="${c.max}" aria-label="از ${fmt(c.min)} تا ${fmt(c.max)}">
            <span class="sw ${swClass ? swClass(c.color) : ''}"></span>
            <span class="lbl">${c.label || `${fmt(c.min)}–${fmt(c.max)}`}</span>
          </li>`)
          .join('')}
        </ul>`;
    }
    if (g.type === 'dams') {
      body.innerHTML = `
        <div class="legend-head"><b>${g.title}</b></div>
        ${g.sub ? `<div class="subhead text-[10px] opacity-70">${g.sub}</div>` : ''}
        <div class="subhead">رنگ = درصد پرشدگی</div>
        <ul class="swatches">${g.classes
          .map(c => `
          <li data-min="${c.min}" data-max="${c.max}">
            <span class="sw ${swClass ? swClass(c.color) : ''}"></span><span class="lbl">${c.label}</span>
          </li>`)
          .join('')}
        </ul>
        <div class="subhead" style="margin-top:8px">اندازه = ظرفیت مخزن (میلیون m³)</div>
        <div class="bubbles">${g.samples
          .map(s => `<span class="bubble ${bubbleSizeClass ? bubbleSizeClass(s.r) : ''}"></span><span class="lbl">${s.v}</span>`)
          .join('')}</div>`;
    }
    const meta = `<div class="legend-meta"><span>منبع: ${g.source || '—'}</span><span>اعتماد داده: ${g.confidence || '—'}</span></div>`;
    body.insertAdjacentHTML('beforeend', meta);
    div.querySelectorAll('.swatches li').forEach(li => {
      li.onclick = () => {
        div.querySelectorAll('.swatches li').forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        onFilter?.(g.key, { min: +li.dataset.min, max: +li.dataset.max });
      };
      li.ondblclick = () => {
        div.querySelectorAll('.swatches li').forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        onFilter?.(g.key, { min: +li.dataset.min, max: +li.dataset.max, isolate: true });
      };
    });
  }

  return {
    el: div,
    set(newGroups, filterCb) {
      groups = newGroups;
      onFilter = filterCb;
      renderTabs();
      activate(groups[0]?.key);
    },
    reset() {
      div.querySelectorAll('.swatches li').forEach(li => li.classList.remove('active'));
      groups.forEach(g => onFilter?.(g.key, null));
    }
  };
}
