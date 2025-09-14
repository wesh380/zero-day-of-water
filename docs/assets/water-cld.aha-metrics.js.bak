(function(){ if(window.__AHA_METRICS__)return; window.__AHA_METRICS__=true;
const LS=window.localStorage; let t0=null, done=false;
function markStart(){ if(t0!=null) return; t0=Date.now(); try{LS.setItem('aha_start_ts',String(t0))}catch(_){}}
function markEvent(name){ try{const arr=JSON.parse(LS.getItem('aha_events')||'[]'); arr.push({name,t:Date.now()}); LS.setItem('aha_events',JSON.stringify(arr))}catch(_){ } }
function markDeltaShown(){ if(done||t0==null) return; done=true; const dt=Date.now()-t0; try{LS.setItem('aha_time_ms',String(dt))}catch(_){ } console.info('[AHA]',dt,'ms') }
function bindFirstInteraction(){
  ['p-eff','p-dem','p-delay','btn-run','btn-run-sample'].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    const ev=el.tagName==='INPUT'?'input':'click';
    el.addEventListener(ev,()=>{ markStart(); markEvent('start') }, {once:true});
  });
}
document.addEventListener('model:updated',()=>{ markEvent('delta-shown'); markDeltaShown() });
document.readyState!=='loading'?bindFirstInteraction():window.addEventListener('DOMContentLoaded',bindFirstInteraction,{once:true});
})();
