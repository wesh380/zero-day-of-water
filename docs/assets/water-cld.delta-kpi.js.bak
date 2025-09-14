(function(){ if(window.__DELTA_KPI__)return; window.__DELTA_KPI__=true;
const LS=window.localStorage; const THRESH=1.0; // % \u0645\u0639\u0646\u06cc\u200c\u062f\u0627\u0631
function $$(s,r=document){return Array.from(r.querySelectorAll(s))}
function readKPIs(){ const map={}; $$('.kpi').forEach(k=>{ const key=k.dataset.kpi||k.querySelector('.kpi-title')?.textContent?.trim(); const v=parseFloat(k.querySelector('.kpi-value .val')?.textContent||'0'); if(key) map[key]=v }); return map }
function ensureChips(){ $$('.kpi').forEach(k=>{ if(!k.querySelector('.delta-chip')){ const s=document.createElement('span'); s.className='delta-chip delta-zero'; s.textContent='0%'; k.appendChild(s) } }) }
function showToast(msg){ let t=document.getElementById('kpi-toast'); if(!t){ t=document.createElement('div'); t.id='kpi-toast'; t.className='toast'; document.body.appendChild(t) } t.textContent=msg; CLD_SAFE?.safeAddClass(t,'show'); setTimeout(()=>t.classList.remove('show'),3000) }
function loadBase(){ try{ const s=LS.getItem('kpi_base_v1'); if(s) return JSON.parse(s) }catch(_){} const b=readKPIs(); try{LS.setItem('kpi_base_v1',JSON.stringify(b))}catch(_){} return b }
function applyDelta(base){
  let biggest={k:null,d:0,val:0};
  $$('.kpi').forEach(k=>{ const key=k.dataset.kpi||k.querySelector('.kpi-title')?.textContent?.trim(); const v=parseFloat(k.querySelector('.kpi-value .val')?.textContent||'0'); const b=base[key]; if(typeof b!=='number') return;
    const d = ((v-b)/Math.max(Math.abs(b),1e-9))*100;
    const chip=k.querySelector('.delta-chip'); if(!chip) return;
    let cls='delta-zero', txt='0%'; if(Math.abs(d)>=0.1){ cls=d>=0?'delta-up':'delta-down'; txt=(d>=0?'+':'')+d.toFixed(1)+'%' }
    chip.className='delta-chip '+cls; chip.textContent=txt;
    if(Math.abs(d)>Math.abs(biggest.d)){ biggest={k:key,d,val:v} }
  });
  if(Math.abs(biggest.d)>=THRESH){ showToast(`\u0627\u062b\u0631 \u0633\u0646\u0627\u0631\u06cc\u0648 \u0631\u0648\u06cc \u00ab${biggest.k}\u00bb: ${(biggest.d>=0?'+':'')}${biggest.d.toFixed(1)}% (\u0646\u0633\u0628\u062a \u0628\u0647 Baseline)`) }
}
function init(){ ensureChips(); const base=loadBase(); applyDelta(base) }
document.readyState!=='loading'?init():window.addEventListener('DOMContentLoaded',init,{once:true});
document.addEventListener('model:updated',()=>{ const base=loadBase(); ensureChips(); applyDelta(base) });
})();
