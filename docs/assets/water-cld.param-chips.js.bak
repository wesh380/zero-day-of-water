(function(){ if(window.__PARAM_CHIPS__)return; window.__PARAM_CHIPS__=true;
const IDS=['p-eff','p-dem','p-delay']; const $=(s,r=document)=>r.querySelector(s);
function getParams(){ const o={}; IDS.forEach(id=>{ const el=document.getElementById(id); if(el){ o[id]=el.type==='range'?+el.value:el.value } }); return o }
let last=null;
function render(diff){ let bar=document.getElementById('param-chips'); if(!bar){ bar=document.createElement('div'); bar.id='param-chips'; const host=document.querySelector('#panel-param .actions')||document.querySelector('#panel-param'); host?.after(bar) }
  bar.innerHTML=''; Object.entries(diff).forEach(([k,v])=>{ const s=document.createElement('span'); s.className='param-chip'; s.textContent=`${k.replace('p-','')} ${v.from} → ${v.to}`; bar.appendChild(s) }) }
function compute(){ const cur=getParams(); if(!last){ last=cur; return } const diff={}; Object.keys(cur).forEach(k=>{ if(cur[k]!==last[k]) diff[k]={from:last[k],to:cur[k]} }); if(Object.keys(diff).length) render(diff); last=cur }
document.addEventListener('model:updated',compute);
document.readyState!=='loading'?(()=>{last=getParams()})():window.addEventListener('DOMContentLoaded',()=>{last=getParams()},{once:true});
})();
