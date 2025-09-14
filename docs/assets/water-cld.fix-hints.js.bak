// ===== Fix Hints Placement (singleton, CSP-safe, no interference) =====
(function(){
  if (window.__FIX_HINTS_BOUND__) return; window.__FIX_HINTS_BOUND__ = true;

  const SCOPE_SEL = '.toolbar.filters';
  const CTRL_TAGS = /^(INPUT|SELECT|BUTTON|OUTPUT|LABEL)$/;

  const $  = (s, r=document)=> r.querySelector(s);
  const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));

  function closestCtrlFor(hint){
    // 1) data-for → دقیق‌ترین
    const forId = hint.dataset.for;
    if (forId){
      const el = document.getElementById(forId);
      if (el) return el;
    }
    // 2) اگر داخل label.ctrl باشد، برگردان همان label
    const label = hint.closest('label.ctrl');
    if (label) return label;

    // 3) نزدیک‌ترین کنترل قبلی در همان ردیف/والد
    let p = hint.previousElementSibling;
    while (p && !CTRL_TAGS.test(p.tagName)) p = p.previousElementSibling;
    if (p) return p;

    // 4) fallback: در والد به عقب نگاه کن
    const parent = hint.parentElement;
    if (parent){
      const ctrls = Array.from(parent.children).filter(el=> CTRL_TAGS.test(el.tagName));
      if (ctrls.length) return ctrls[ctrls.length-1];
    }
    return null;
  }

  function attach(hint){
    if (hint.__fixed_hint__) return; // جلوگیری از تکرار
    const scope = hint.closest(SCOPE_SEL);
    if (!scope) return;

    const target = closestCtrlFor(hint);
    if (!target) { hint.__fixed_hint__ = true; return; }

    // اگر target خودش label.ctrl است، کافی است hint را درونش قرار دهیم
    if (target.tagName === 'LABEL' && target.classList.contains('ctrl')){
      target.appendChild(hint);
      hint.__fixed_hint__ = true;
      return;
    }

    // برای سایر کنترل‌ها، یک ظرف کوچک inline بسازیم و هر دو را در آن قرار دهیم
    let wrap = document.createElement('span');
    wrap.className = 'hint-wrap';
    // اگر target قبلاً wrap نشده، آن را درون wrap بگذاریم
    if (!target.parentElement.classList.contains('hint-wrap')){
      target.replaceWith(wrap);
      wrap.appendChild(target);
    } else {
      // اگر خودش wrap داشت، از همان استفاده کنیم
      wrap = target.parentElement;
    }
    wrap.appendChild(hint);
    hint.__fixed_hint__ = true;
  }

  function fixAll(){
    const scope = $(SCOPE_SEL);
    if (!scope) return;
    $$('.hint', scope).forEach(attach);
  }

  // اجرای اولیه
  if (document.readyState === 'complete' || document.readyState === 'interactive') fixAll();
  else window.addEventListener('DOMContentLoaded', fixAll, { once:true });

  // تغییرات بعدی UI
  const mo = new MutationObserver((muts)=>{
    let need=false;
    for (const m of muts){
      if (m.addedNodes && m.addedNodes.length) { need=true; break; }
      if (m.type === 'attributes' && m.target.classList?.contains('hint')) { need=true; break; }
    }
    if (need) fixAll();
  });
  window.addEventListener('load', ()=>{
    const scope = $(SCOPE_SEL);
    if (scope) mo.observe(scope, { childList:true, subtree:true, attributes:true, attributeFilter:['data-for','class'] });
  });

  // اگر پروژه رویداد سفارشی دارد، روی آن هم رفرش کن
  document.addEventListener('model:updated', fixAll);
})();
