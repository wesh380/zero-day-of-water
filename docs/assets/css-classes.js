export function setClass(el, add = [], remove = []) {
  if (!el) return;
  add.forEach(c => el.classList.add(c));
  remove.forEach(c => el.classList.remove(c));
}

export function swapPercentBucket(el, axis /* 'left'|'top'|'right'|'w'|'h' */, pct) {
  if (!el) return;
  const prefix = axis + '-';
  [...el.classList].forEach(c => { if (c.startsWith(prefix)) el.classList.remove(c); });
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  el.classList.add(`${axis}-${p}p`);
}

export function swapPxBucket(el, prefix /* e.g. 'ty' */, value, step = 2, max = 100) {
  if (!el) return;
  [...el.classList].forEach(c => { if (c.startsWith(prefix + '-')) el.classList.remove(c); });
  const v = Math.max(-max, Math.min(max, Math.round(value / step) * step));
  const name = v < 0 ? `${prefix}--${Math.abs(v)}` : `${prefix}-${v}`;
  el.classList.add(name);
}

/* optional ergonomic helper for overlay buckets on <html> */
export function setOverlay(htmlEl, x) {
  const root = htmlEl || document.documentElement;
  [...root.classList].forEach(c => { if (c.startsWith('overlay-')) root.classList.remove(c); });
  const k = Math.max(0, Math.min(10, Math.round(x * 10)));
  root.classList.add(`overlay-${k}`);
}
