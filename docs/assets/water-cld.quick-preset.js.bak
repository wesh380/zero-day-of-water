(function(){ if(window.__QUICK_PRESET__)return; window.__QUICK_PRESET__=true;
const LS=window.localStorage;
function setParam(id,val){ const el=document.getElementById(id); if(!el) return false; el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return true }
async function runModel(){ document.dispatchEvent(new CustomEvent('model:updated',{detail:{source:'quick-preset'}})) }
function applyPresetLeakage20(){
  // \u062a\u0644\u0627\u0634 \u0628\u0627 ModelBridge \u0627\u06af\u0631 \u0647\u0633\u062a
  if(window.ModelBridge?.setParam){ try{ window.ModelBridge.setParam('leakage_rate',0.20) }catch(_){} }
  // fallback \u0631\u0648\u06cc \u0627\u0633\u0644\u0627\u06cc\u062f\u0631\u0647\u0627\n  setParam('p-eff',0.35); // \u0646\u0645\u0648\u0646\u0647\u200c\u0627\u06cc \u0628\u0631\u0627\u06cc \u0627\u062b\u0631\u06af\u0630\u0627\u0631\u06cc
  runModel();
}
function boot(){
  try{ if(LS.getItem('seenAha')==='1') return }catch(_){ }
  const bar=document.createElement('div'); bar.className='quick-cta'; bar.id='quick-cta';
  bar.innerHTML=`<button id="cta-see-effect" class="btn">\u0627\u062b\u0631 \u0633\u06cc\u0627\u0633\u062a \u0646\u0645\u0648\u0646\u0647 \u0631\u0627 \u0628\u0628\u06cc\u0646</button><span class="hint">\u06f2 \u06a9\u0644\u06cc\u06a9 \u062a\u0627 \u062f\u06cc\u062f\u0646 \u0627\u062b\u0631 \u0631\u0648\u06cc KPI\u0647\u0627</span>`;
  const anchor=document.getElementById('hero-kpi')||document.body; anchor.parentElement.insertBefore(bar,anchor);
  const btn = bar.querySelector('#cta-see-effect');
  if (btn) btn.addEventListener('click',()=>{ applyPresetLeakage20(); try{LS.setItem('seenAha','1')}catch(_){} });
  else console.warn('Element #cta-see-effect not found');
}
document.readyState!=='loading'?boot():window.addEventListener('DOMContentLoaded',boot,{once:true});
})();
