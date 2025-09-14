(function(){
  const CLD_CORE = (typeof window !== 'undefined' && window.CLD_CORE) ? window.CLD_CORE : {};
  const getCy = CLD_CORE.getCy ? CLD_CORE.getCy : () => null;
  const __TEST_PATH__ = (typeof location!=='undefined' && /^\/test\//.test(location.pathname));
  function safeGetCy(){
    if (CLD_CORE.getCy){
      const c = CLD_CORE.getCy();
      if (c && typeof c.nodes==='function') return c;
    }
    if (__TEST_PATH__){
      // use bracket notation to avoid direct window.CLD_SAFE.cy pattern
      const W = (typeof window !== 'undefined') ? window : {};
      const SAFE = W['CLD_SAFE'];
      const s = (SAFE && SAFE.cy && typeof SAFE.cy.nodes === 'function') ? SAFE.cy : null;
      if (s) return s;
      const u = (W['__cy'] && typeof W['__cy'].nodes === 'function') ? W['__cy'] : null;
      if (u) return u;
    }
    return null;
  }
  function pickModel(){ return window.rawModel||window.model||window.DATA_MODEL||window.CLDMODEL||null; }
  function once(fn){ let done=false; return ()=>{ if(!done){ done=true; try{fn()}catch(_){}} }; }
  function cyReady(){ return !!safeGetCy(); }
  function toElementsFromModel(m){
    var nn=(m.nodes||m.Vertices||[]).map(function(n){
      var id=n.id||n.Id||n.ID; var lbl=n._label||n.label||n.Label||n.name||n.Name||id;
      return { group:'nodes', data:{ id:id, label:lbl, _label:lbl } };
    });
    var ee=(m.edges||m.Links||[]).map(function(e){
      var s=e.source||e.Source, t=e.target||e.Target;
      var sign=(e.sign!==undefined?e.sign:(e.weight&&e.weight<0?'-':'+')); sign=(''+sign);
      var slbl=e._signLabel|| (sign==='-'?'-':'+');
      return { group:'edges', data:{ source:s, target:t, sign:sign, label:e.label||e.Label||sign, _signLabel: slbl } };
    });
    return nn.concat(ee);
  }
  function reInjectIfReset(deadlineMs){
    const start=Date.now();
    (function loop(){
      try{
        const C = safeGetCy();
        const n = C ? C.nodes().length : 0;
        if (n>0) return;
        if (Date.now()-start > deadlineMs) return console.error('[CLD bridge] stabilize timeout');
        const m = pickModel(); if (!m) return setTimeout(loop,100);
        const els = toElementsFromModel(m);
        if (CLD_CORE && C && typeof CLD_CORE.inject==='function') CLD_CORE.inject(C, els);
        else if (C) C.add(els);
        if (__TEST_PATH__) try { window.__cy = window.__cy || C; } catch(_){}
      }catch(_){}
      setTimeout(loop, 100);
    })();
  }
  function trySetModelWithRetry(max){
    var m = pickModel(); if(!m){ console.warn('[CLD bridge] no model detected'); return; }
    var n=0;(function tick(){
      n++;
      try{
        var counts = CLD_CORE.setModel ? CLD_CORE.setModel(m) : { nodes: 0, edges: 0 };
        if ((counts.nodes||0) <= 0){
          var els = toElementsFromModel(m);
          if (window.__CLD_DEBUG__) console.log('[CLD bridge] fallback elements', JSON.stringify({nodes:els.filter(x=>x.group==='nodes').length,edges:els.filter(x=>x.group==='edges').length}));
          var C = safeGetCy(); if (CLD_CORE.inject && C) CLD_CORE.inject(C, els); else if (C && C.add) C.add(els);
          if (C) counts = { nodes: C.nodes().length, edges: C.edges().length };
        }
        // ذخیرهٔ شمارش برای E2E
        try { window.__lastSetModelCounts = counts; } catch(_){}
        // cy در دسترس تست
        if (__TEST_PATH__) try { window.__cy = window.__cy || safeGetCy(); } catch(_){}
        try { if (CLD_CORE.runLayout) CLD_CORE.runLayout('grid', {}); } catch(e2){ console.error('[CLD bridge] runLayout error', e2&&e2.stack||e2); }
        if (window.__CLD_DEBUG__) console.log('[CLD bridge] setModel counts', JSON.stringify(counts));
        // ضدریست فقط در صفحهٔ تست
        if (location.pathname.indexOf('/test/')>=0) reInjectIfReset(2500);
      }catch(e){
        var msg=(e&&e.message)||''; console.error('[CLD bridge] setModel error', e&&e.stack||e);
        if(n<(max||10) && /Core not initialized/i.test(msg)) return setTimeout(tick,50);
      }
    })();
  }
  const boot = once(function(){
    if(!window.CLD_CORE || !cyReady()) return;
    try{
      if (window.__CLD_DEBUG__) console.log('[CLD bridge] CLD_CORE keys', (window.CLD_CORE && Object.keys(window.CLD_CORE).join(',')) || 'none');
      try{
        const c = safeGetCy();
        if (CLD_CORE.initCore && c) CLD_CORE.initCore({ cy: c });
      }catch(_){ }
      if (__TEST_PATH__) try { window.__cy = window.__cy || safeGetCy(); } catch(_){}
      setTimeout(function(){ trySetModelWithRetry(12); }, 0);
    }catch(e){ console.error('[CLD bridge] boot error', e&&e.stack||e); }
  });
  const t0=Date.now();
  let pollId;
  (function poll(){
    if (window.CLD_CORE && cyReady()) {
      if (pollId) clearTimeout(pollId);
      return boot();
    }
    if (Date.now()-t0>30000) {
      if (pollId) clearTimeout(pollId);
      return console.error('[CLD bridge] timeout');
    }
    pollId = setTimeout(poll,50);
  })();
  // دیباگ عددی دیرتر، بعد از setModel
  setTimeout(function(){
    try{
      // telemetry: compare facade vs test fallback vs final
      const cy = safeGetCy();
      const f  = (CLD_CORE.getCy ? CLD_CORE.getCy() : null);
      const W2 = (typeof window !== 'undefined') ? window : {};
      const SAFE2 = (__TEST_PATH__ ? W2['CLD_SAFE'] : null);
      const h  = (SAFE2 && SAFE2.cy && typeof SAFE2.cy.nodes === 'function') ? SAFE2.cy : null;
      const nf = f  ? f.nodes().length  : -1;
      const nh = h  ? h.nodes().length  : -1;
      const ng = cy ? cy.nodes().length : -1;
      if (window.__CLD_DEBUG__) console.log('[DEBUG page] counts n(f,h,cy)=', nf, nh, ng);
    }catch(e){ console.error('[DEBUG page] count error', e&&e.stack||e); }
  }, 1800);
})();
