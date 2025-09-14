(function(){ if(window.__GHOST_DELTA__)return; window.__GHOST_DELTA__=true;
const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function predictDelta(){ // \u062a\u062e\u0645\u06cc\u0646 \u0633\u0628\u06a9: \u0641\u0642\u0637 \u062c\u0647\u062a\u200c\u0646\u0645\u0627
  const eff=parseFloat($('#p-eff')?.value||'0.3'); const dem=parseFloat($('#p-dem')?.value||'0.6');
  const ghosts={}; // \u0627\u062b\u0631\u0627\u062a \u062a\u0642\u0631\u06cc\u0628\u06cc
  ghosts.per_capita_use = (dem-0.6)*100;         // \u2191dem \u2192 \u2191 \u0645\u0635\u0631\u0641
  ghosts.leakage_rate   = (0.3-eff)*60;          // \u2191eff \u2192 \u2193 \u062a\u0644\u0641\u0627\u062a
  ghosts.supply_demand_gap = (dem - eff)*40;     // gap ~ dem - eff
  return ghosts;
}
function renderGhost(g){
  $$('.kpi').forEach(k=>{
    const key=k.dataset.kpi; if(!key||g[key]==null) return;
    let tag=k.querySelector('.ghost'); if(!tag){ tag=document.createElement('span'); tag.className='ghost'; tag.style.cssText='position:absolute;bottom:6px;inset-inline-end:6px;font-size:11px;opacity:.7'; k.appendChild(tag) }
    const d=g[key]; const s=(d>=0?'+':'')+d.toFixed(1)+'%~'; tag.textContent=s;
  });
}
function bind(){
  ['p-eff','p-dem'].forEach(id=>{ const el=document.getElementById(id); if(!el) return;
    ['input','change'].forEach(ev=> el.addEventListener(ev,()=>renderGhost(predictDelta())) );
  });
}
document.readyState!=='loading'?(()=>{bind();renderGhost(predictDelta())})():window.addEventListener('DOMContentLoaded',()=>{bind();renderGhost(predictDelta())},{once:true});
document.addEventListener('model:updated',()=>{ $$('.kpi .ghost').forEach(e=>e.remove()) }); // \u067e\u0633 \u0627\u0632 Run\u060c \u0645\u0642\u062f\u0627\u0631 \u0648\u0627\u0642\u0639\u06cc \u062c\u0627\u06cc\u06af\u0632\u06cc\u0646 \u0634\u0648\u062f
})();
