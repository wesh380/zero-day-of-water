// ===== Scenario Suite: Presets + Compare + Share + Recent =====
// singleton, CSP-safe, RTL-aware, no interference
(function(){
  if (window.__SCENARIO_SUITE_BOUND__) return;
  window.__SCENARIO_SUITE_BOUND__ = true;

  // ---------- Helpers ----------
  const $  = (s, r=document)=> r.querySelector(s);
  const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));
  const LS = window.localStorage;

  const KPI_SPEC = {
    supply_demand_gap: {label:'شکاف عرضه–تقاضا', unit:'%', better:'lower'},
    per_capita_use:    {label:'مصرف سرانه',       unit:'L/day', better:'lower'},
    leakage_rate:      {label:'نرخ تلفات شبکه',   unit:'%', better:'lower'}
  };
  const RECENTS_KEY = 'cld_recent_scenarios';
  const PIN_KEY = 'cld_pinned_baseline';

  // ModelBridge-first
  function pickInput(key){
    return document.querySelector(`[data-param="${key}"]`)
        || document.getElementById(key)
        || document.querySelector(`input[name="${key}"], select[name="${key}"]`);
  }
  function getAllParams(){
    try { if (window.ModelBridge?.getAllParams) return window.ModelBridge.getAllParams(); } catch(_){ }
    const out={};
    $$('[data-param]').forEach(el=>{
      const k=el.dataset.param; if (!k) return;
      const v=(el.type==='checkbox')?(el.checked?1:0):Number(el.value ?? el.getAttribute('value'));
      if(!Number.isNaN(v)) out[k]=v;
    }); return out;
  }
  function setParam(key, value){
    if (window.ModelBridge?.setParam){ try{ return window.ModelBridge.setParam(key,value); }catch(_){ } }
    const el = pickInput(key); if(!el) return false;
    if (el.type==='checkbox'){ el.checked=!!value; el.dispatchEvent(new Event('change',{bubbles:true})); return true; }
    el.value=String(value); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return true;
  }
  async function rerun(){
    if (window.ModelBridge?.rerunModel){ try{ await window.ModelBridge.rerunModel(); return; }catch(_){ } }
    document.dispatchEvent(new CustomEvent('model:updated',{detail:{source:'scenario-suite'}}));
  }
  function readKPI(id){
    try{ if (window.ModelBridge?.getKPI){ const v = window.ModelBridge.getKPI(id); if(v!=null) return Number(v); } }catch(_){ }
    // Fallback proxy from params (safe placeholder)
    const p = getAllParams();
    if (id==='per_capita_use' && p.dem!=null) return +(350*Number(p.dem)).toFixed(1);
    if (id==='leakage_rate'){
      if (p.leakage_rate!=null) return +Number(p.leakage_rate).toFixed(1);
      if (p.eff!=null){ const base=24.8; return +Math.max(0, base*(1-0.2*(Number(p.eff)-0.3))).toFixed(1); }
    }
    if (id==='supply_demand_gap' && p.dem!=null && p.eff!=null){
      const demand=Math.max(0.01,Number(p.dem)); const supply=Math.max(0.01,0.7*Number(p.eff)+0.3);
      return +Math.max(0,(demand-supply)/Math.max(demand,1)*100).toFixed(1);
    }
    return null;
  }

  function clampToRange(key, val){
    const el = pickInput(key); if (!el) return val;
    const min = el.min!=='' ? Number(el.min):null, max = el.max!=='' ? Number(el.max):null;
    let v = Number(val); if (min!=null && v<min) v=min; if (max!=null && v>max) v=max; return v;
  }
  function isPercentScale(key){
    const el = pickInput(key); if (!el) return false;
    const max = el.max!=='' ? Number(el.max):null; return (max!=null && max>1.5);
  }
  function findParamKey(cands){
    const p = getAllParams();
    for (const k of cands){ if (p[k]!=null || pickInput(k)) return k; }
    return null;
  }

  // ---------- Presets ----------
  const PRESETS = [
    {
      id:'leakage20', title:'کاهش تلفات ۳۰→۲۰٪', note:'تنظیم تلفات شبکه به ۲۰٪ (یا 0.20).',
      apply:()=> {
        const key = findParamKey(['leakage_rate','leakage','loss_rate','nrw','non_revenue_water']);
        if (!key) return {ok:false,msg:'پارامتر تلفات یافت نشد'};
        const perc=isPercentScale(key); const v=clampToRange(key, perc?20:0.20);
        setParam(key, v); return {ok:true,msg:`${key}←${v}`};
      }
    },
    {
      id:'drought25', title:'شوک خشکسالی (–۲۵٪ منابع)', note:'کاهش ۲۵٪ پارامترهای مرتبط با منابع/ورودی آب.',
      apply:()=> {
        const keys=['renewable_supply','available_water','supply','supply_factor','surface_inflow','inflow','groundwater_recharge','recharge'];
        const p=getAllParams(); const touched=[];
        keys.forEach(k=>{ if(p[k]!=null){ const nv=clampToRange(k, Number(p[k])*0.75); if(setParam(k,nv)) touched.push(`${k}←${nv}`); } });
        if(!touched.length){ const shock=findParamKey(['drought_shock','supply_shock']); if(shock){ setParam(shock,-0.25); touched.push(`${shock}←-0.25`);} }
        return touched.length?{ok:true,msg:touched.join(' , ')}:{ok:false,msg:'پارامتر منبع یافت نشد'};
      }
    },
    {
      id:'demand-10', title:'مدیریت تقاضا (–۱۰٪ سرانه)', note:'کاهش ۱۰٪ در مصرف سرانه/فاکتور تقاضا.',
      apply:()=> {
        const keys=['per_capita_use','per_capita_demand','dem','demand_factor','consumption_factor'];
        const p=getAllParams(); const touched=[];
        keys.forEach(k=>{ if(p[k]!=null){ const nv=clampToRange(k, Number(p[k])*0.90); if(setParam(k,nv)) touched.push(`${k}←${nv}`); } });
        return touched.length?{ok:true,msg:touched.join(' , ')}:{ok:false,msg:'پارامتر تقاضا/سرانه یافت نشد'};
      }
    }
  ];

  // ---------- Share Link ----------
  function encodeState(obj){
    const s = JSON.stringify(obj); const b64 = btoa(unescape(encodeURIComponent(s)));
    return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); // base64url
  }
  function decodeState(s){
    try{
      const b64 = s.replace(/-/g,'+').replace(/_/g,'/'); const pad = b64.length%4 ? '===='.slice(b64.length%4) : '';
      const str = decodeURIComponent(escape(atob(b64+pad))); return JSON.parse(str);
    }catch(_){ return null; }
  }
  function stateFromUI(name='Scenario'){
    return { name, t: Date.now(), params: getAllParams() };
  }
  async function applyState(st){
    if (!st?.params) return false;
    Object.entries(st.params).forEach(([k,v])=> setParam(k,v));
    await rerun(); return true;
  }
  function updateURLWithState(st){
    const hash = `#s=${encodeState(st)}`; history.replaceState(null,'', `${location.pathname}${location.search}${hash}`);
    return location.href;
  }

  // ---------- Recents ----------
  function loadRecents(){
    try{ return JSON.parse(LS.getItem(RECENTS_KEY)||'[]') }catch(_){ return []; }
  }
  function saveRecent(st){
    let arr = loadRecents();
    arr.unshift(st); arr = arr.slice(0,5);
    try{ LS.setItem(RECENTS_KEY, JSON.stringify(arr)); }catch(_){ }
  }

  // ---------- Pin/Compare ----------
  function loadPin(){ try{ return JSON.parse(LS.getItem(PIN_KEY)||'null'); }catch(_){ return null; } }
  function savePin(pin){ try{ LS.setItem(PIN_KEY, JSON.stringify(pin)); }catch(_){ } }
  function clearPin(){ try{ LS.removeItem(PIN_KEY); }catch(_){ }}

  function computeDelta(a,b,k){
    if (a==null || b==null) return {delta:0,dir:'neutral'};
    const spec = KPI_SPEC[k]; const betterLower = (spec?.better||'lower')==='lower';
    const eps = (Math.abs(a)<1e-9) ? 1 : a;
    const d = ((b-a)/eps)*100;  // Δ%
    let dir='neutral';
    if (Math.abs(d) < 0.05) dir='neutral';
    else if ((d<0 && betterLower) || (d>0 && !betterLower)) dir='pos';
    else dir='neg';
    return {delta:d, dir};
  }

  // ---------- UI ----------
  function anchor(){
    const hero = $('#hero-kpi'); if (!hero) return null;
    return hero.querySelector('.baseline-row') || hero;
  }

  function buildBar(){
    const host = anchor(); if (!host) return;
    if ($('#scn-bar')) return;

    // Bar
    const bar = document.createElement('div'); bar.id='scn-bar'; bar.className='scn-bar'; bar.dir='rtl';

    // Presets
    PRESETS.forEach((p,i)=>{
      const btn=document.createElement('button'); btn.className='scn-btn'; btn.type='button'; btn.textContent=p.title;
      btn.setAttribute('data-preset', p.id);
      btn.addEventListener('click', async ()=>{
        const res = p.apply(); await rerun();
        const note = $('#scn-note'); if (note) note.innerHTML = `✓ ${p.note} — <span style="opacity:.8">${res.msg||''}</span>`;
        document.dispatchEvent(new CustomEvent('scenario:applied',{detail:{id:p.id,title:p.title}}));
        const st = stateFromUI(p.title); saveRecent(st);
      });
      bar.appendChild(btn);
      if (i < PRESETS.length-1){ const sep=document.createElement('div'); sep.className='scn-sep'; bar.appendChild(sep); }
    });

    // Pin, Compare, Share, Recent
    const btnPin=document.createElement('button'); btnPin.id='scn-pin'; btnPin.className='scn-btn'; btnPin.textContent='Pin Baseline';
    btnPin.addEventListener('click', ()=>{
      const pin = { t: Date.now(), name:'Baseline (Pinned)', kpis: mapKPI(readKPI) };
      savePin(pin);
      const note = $('#scn-note'); if (note) note.textContent = '✓ Baseline پین شد.';
    });

    const btnCmp=document.createElement('button'); btnCmp.id='scn-compare-toggle'; btnCmp.className='scn-btn'; btnCmp.textContent='Compare';
    btnCmp.addEventListener('click', ()=> { $('#scn-panel')?.classList.toggle('open'); renderPanel(); });

    const btnShare=document.createElement('button'); btnShare.id='scn-share'; btnShare.className='scn-btn'; btnShare.textContent='Copy Link';
    btnShare.addEventListener('click', ()=>{
      const st = stateFromUI('Shared Scenario'); const href = updateURLWithState(st); saveRecent(st);
      try{ navigator.clipboard.writeText(href); }catch(_){ }
      const n=$('#scn-note'); if(n) n.innerHTML='✓ لینک سناریو کپی شد.';
    });

    const btnRecent=document.createElement('button'); btnRecent.id='scn-recent'; btnRecent.className='scn-btn'; btnRecent.textContent='Recent';
    const pop=document.createElement('div'); pop.id='scn-recent-pop'; pop.className='scn-pop'; pop.dir='rtl';
    const ul=document.createElement('ul'); pop.appendChild(ul);
    btnRecent.addEventListener('click',(e)=>{
      e.stopPropagation();
      const r = loadRecents(); ul.innerHTML='';
      if (!r.length){ const li=document.createElement('li'); li.textContent='(خالی)'; ul.appendChild(li); }
      r.forEach((st,i)=>{
        const li=document.createElement('li'); const dt=new Date(st.t).toLocaleString();
        li.innerHTML = `<a href="#" data-idx="${i}">${st.name||'Scenario'} • ${dt}</a>`;
        ul.appendChild(li);
      });
      const rect = btnRecent.getBoundingClientRect();
      pop.style.display='block'; pop.style.top=`${rect.bottom+6}px`; pop.style.left=`${rect.left}px`;
    });
    document.addEventListener('click',()=> pop.style.display='none');
    pop.addEventListener('click', async (e)=>{
      const idx = e.target?.dataset?.idx; if (idx==null) return;
      e.preventDefault(); const r = loadRecents()[Number(idx)]; if (!r) return;
      await applyState(r); const n=$('#scn-note'); if(n) n.textContent='✓ سناریوی اخیر اعمال شد.'; pop.style.display='none';
    });

    bar.append(btnPin, btnCmp, btnShare, btnRecent);
    host.appendChild(bar);
    host.appendChild(pop);

    // Note
    const note = document.createElement('div'); note.id='scn-note'; note.className='scn-note';
    note.textContent = 'سناریوهای آماده + Pin/Compare + اشتراک لینک + Recent.';
    host.appendChild(note);
  }

  function mapKPI(reader){
    const out={}; Object.keys(KPI_SPEC).forEach(k=> out[k]=reader(k)); return out;
  }

  function renderPanel(){
    const mountHost = $('#hero-kpi') || document.body;
    let panel = $('#scn-panel'); if (!panel){ panel=document.createElement('div'); panel.id='scn-panel'; panel.className='scn-panel'; mountHost.appendChild(panel); }
    panel.innerHTML = ''; // باز-رندر ایمن

    const pin = loadPin();
    const cur = mapKPI(readKPI);

    // اگر pin نداریم، پیام
    if (!pin){
      const card=document.createElement('div'); card.className='scn-card'; card.dir='rtl';
      card.textContent='ابتدا Baseline را Pin کنید.';
      panel.appendChild(card); return;
    }

    // جدول KPI
    const card=document.createElement('div'); card.className='scn-card'; card.dir='rtl';
    const grid=document.createElement('div'); grid.className='scn-grid';

    Object.keys(KPI_SPEC).forEach(k=>{
      const spec=KPI_SPEC[k]; const a=Number(pin.kpis[k]); const b=Number(cur[k]);
      const d=computeDelta(a,b,k);
      const box=document.createElement('div'); box.className='scn-kpi';
      box.innerHTML = `
        <h5>${spec.label}</h5>
        <div class="row">
          <span class="val">${isNum(a)?a.toFixed(1):'—'}</span><span class="unit">${spec.unit}</span>
          <span style="opacity:.6">↔</span>
          <span class="val">${isNum(b)?b.toFixed(1):'—'}</span><span class="unit">${spec.unit}</span>
          <span class="delta ${d.dir}">${isNum(d.delta)?Math.abs(d.delta).toFixed(1)+'%':''}</span>
        </div>`;
      grid.appendChild(box);
    });

    const meta=document.createElement('div'); meta.className='scn-meta';
    meta.textContent = `Pinned at: ${new Date(pin.t).toLocaleString()}`;
    const btnClear=document.createElement('button'); btnClear.className='scn-btn'; btnClear.textContent='Clear Pin';
    btnClear.addEventListener('click', ()=>{ clearPin(); renderPanel(); });

    card.appendChild(grid); card.appendChild(meta); card.appendChild(btnClear);
    panel.appendChild(card);
  }

  function isNum(x){ return typeof x==='number' && isFinite(x); }

  // ---------- Apply from URL (hash) ----------
  async function maybeApplyFromURL(){
    const m = location.hash.match(/[#&]s=([^&]+)/); if (!m) return;
    const st = decodeState(m[1]); if (!st) return;
    await applyState(st);
    const n=$('#scn-note'); if(n) n.textContent='✓ سناریو از لینک اعمال شد.';
  }

  // ---------- Init ----------
  function init(){
    const host = anchor(); if (!host) return;
    buildBar(); renderPanel(); maybeApplyFromURL();
  }
  if (document.readyState==='complete' || document.readyState==='interactive') init();
  else window.addEventListener('DOMContentLoaded', init, { once:true });

  // تازه‌سازی Compare هنگام تغییر مدل
  document.addEventListener('model:updated', ()=>{ if ($('#scn-panel')?.classList.contains('open')) renderPanel(); });

})();
