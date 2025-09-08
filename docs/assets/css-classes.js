export function setClass(el, add = [], remove = []) {
  if (!el) return;
  add.forEach(c => el.classList.add(c));
  remove.forEach(c => el.classList.remove(c));
}

export function swapPercentBucket(el, axis, pct) {
  if (!el) return;
  const clPrefix = axis + '-';
  [...el.classList].forEach(c => { if (c.startsWith(clPrefix)) el.classList.remove(c); });
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  el.classList.add(`${axis}-${p}p`);
}

export function swapPxBucket(el, prefix, value, step = 2, max = 100) {
  if (!el) return;
  [...el.classList].forEach(c => { if (c.startsWith(prefix + '-')) el.classList.remove(c); });
  const v = Math.max(0, Math.min(max, Math.round(value / step) * step));
  el.classList.add(`${prefix}-${v}`);
}

if (typeof window !== 'undefined') {
  window.setClass = setClass;
  window.swapPercentBucket = swapPercentBucket;
  window.swapPxBucket = swapPxBucket;
}
