// ===== Causal Path Search & Loops Chips (singleton, CSP-safe, no interference) =====
/* global graphStore */
(function(){
  if (window.__CLD_PATHS_BOUND__) return; window.__CLD_PATHS_BOUND__ = true;

  // -------- Helpers --------
  const $  = (s,r=document)=> r.querySelector(s);
  const $$ = (s,r=document)=> Array.from(r.querySelectorAll(s));
  const debounce = (fn,ms=80)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

  // onCyReady مینیمال (اگر پروژه دارد از همان استفاده می‌شود)
  if (!window.onCyReady){
    window.onCyReady = function(run){
      const c0 = getCy();
      if (c0 && typeof c0.on==='function'){ try{run(c0);}catch(_){ } return; }
      document.addEventListener('cy:ready', e=>{ const c=e.detail?.cy||getCy(); if(c) try{run(c);}catch(_){ } }, {once:true});
      if (document.readyState!=='loading') setTimeout(()=>{ const c=getCy(); if(c) try{run(c);}catch(_){ } },0);
      else document.addEventListener('DOMContentLoaded', ()=>{ const c=getCy(); if(c) try{run(c);}catch(_){ } }, {once:true});
    };
  }

  // -------- Mount UI (non-invasive) --------
  function anchor(){
    // اولویت: پنل‌های موجود سمت راست/کنار
    return $('#cld-control-hub .mode .ac-body')
        || $('#cld-control-hub .ac-body')
        || $('#right-panel')
        || $('#hero-kpi')
        || document.body;
  }

  function buildUI(){
    if ($('#paths-card')) return;
    const host = anchor(); if (!host) return;

    const wrap = document.createElement('section');
    wrap.id = 'paths-card'; wrap.className = 'paths-card'; wrap.dir = 'rtl';
    wrap.innerHTML = `
      <h4>مسیر علّی و حلقه‌ها</h4>
      <div class="find-controls">
        <div class="row">
          <input id="node-search" list="node-list" placeholder="جست‌وجوی نود…">
          <datalist id="node-list"></datalist>
          <button id="btn-zoom">Zoom</button>
        </div>
        <div class="row">
          <select id="target-select"><option value="">هدف (KPI)…</option></select>
          <button id="btn-find-paths">یافتن مسیر</button>
          <button id="btn-clear">پاک‌کردن</button>
        </div>
      </div>
      <div class="paths-list" id="paths-list"></div>
      <div class="loops-bar" id="loops-bar"></div>
      <div class="note">نکته: حداکثر ۳ مسیر کوتاه نمایش داده می‌شود؛ روی هر مسیر/حلقه کلیک کنید تا در بوم های‌لایت شود.</div>
    `;
    host.appendChild(wrap);
  }

  // -------- Cytoscape logic --------
  function run(cy){
    buildUI();

    // Label helper
    const nodeLabel = (n)=> (n.data('label') ?? n.data('name') ?? n.data('title') ?? n.id()).toString();
    const edgeSign  = (e)=> {
      const s = e.data('sign') ?? e.data('polarity') ?? (Number(e.data('weight'))>=0 ? +1 : -1);
      return s>=0 ? '+' : '–';
    };

    // Populate search list and target options
    function refreshNodeIndex(){
      const dl = $('#node-list'); if (!dl) return;
      dl.innerHTML = '';
      cy.nodes().forEach(n=>{
        const opt = document.createElement('option');
        opt.value = nodeLabel(n);
        opt.setAttribute('data-id', n.id());
        dl.appendChild(opt);
      });
      const sel = $('#target-select'); if (!sel) return;
      const keep = sel.value;
      sel.innerHTML = '<option value="">هدف (KPI)…</option>';
      cy.nodes().forEach(n=>{
        const opt = document.createElement('option'); opt.value=n.id(); opt.textContent=nodeLabel(n);
        sel.appendChild(opt);
      });
      if (keep) sel.value = keep;
    }
    refreshNodeIndex();
    cy.one('layoutstop', refreshNodeIndex);

    // Node resolvers
    function findNodeByLabel(str){
      if (!str) return null;
      // 1) exact label
      let hit = cy.nodes().filter(n=> nodeLabel(n) === str);
      if (hit.length) return hit[0];
      // 2) partial (case-insensitive)
      hit = cy.nodes().filter(n=> nodeLabel(n).toLowerCase().includes(str.toLowerCase()));
      return hit.length ? hit[0] : null;
    }

    // Zoom to node
    $('#btn-zoom')?.addEventListener('click', ()=>{
      const q = $('#node-search')?.value?.trim(); const n = findNodeByLabel(q);
      if (!n) return;
      cy.animate({ fit: { eles: n, padding: 60 }, duration: 240 });
      n.flashClass = (cls, ms=700)=>{ 
        if (CLD_SAFE?.safeAddClass) {
          CLD_SAFE.safeAddClass(n, cls);
        } else {
          console.warn('CLD_SAFE.safeAddClass missing');
          n?.classList?.add(cls);
        }
        setTimeout(()=> n.removeClass(cls), ms); 
      };
      n.flashClass('cy-path-active', 800);
    });

    // Highlight helpers (non-destructive)
    function clearHighlight(){
      cy.batch(()=>{
        cy.elements().removeClass('cy-dim cy-path-active cy-loop-active');
      });
      $('#paths-list') && ($('#paths-list').innerHTML='');
    }
    $('#btn-clear')?.addEventListener('click', clearHighlight);

    function highlightSet(eles, cls='cy-path-active'){
      const set = eles.union ? eles : cy.collection(eles);
      cy.batch(()=>{
        const others = cy.elements().not(set);
        if (CLD_SAFE?.safeAddClass) {
          CLD_SAFE.safeAddClass(others, 'cy-dim');
        } else {
          console.warn('CLD_SAFE.safeAddClass missing');
          if (others?.forEach) {
            others.forEach(el => el.classList?.add('cy-dim'));
          } else {
            others?.classList?.add('cy-dim');
          }
        }
        set.removeClass('cy-dim');
        if (CLD_SAFE?.safeAddClass) {
          CLD_SAFE.safeAddClass(set, cls);
        } else {
          console.warn('CLD_SAFE.safeAddClass missing');
          if (set?.forEach) {
            set.forEach(el => el.classList?.add(cls));
          } else {
            set?.classList?.add(cls);
          }
        }
      });
    }

    // BFS shortest simple paths (edge-count) with depth limit
    function kShortestPaths(src, dst, k=3, maxDepth=6){
      if (!src || !dst || src.id()===dst.id()) return [];
      const res = [];
      const visitedPath = new Set();
      const q = [{ node: src, pathNodes:[src], pathEdges:[], depth:0 }];
      while (q.length && res.length < k){
        const cur = q.shift();
        if (cur.depth > maxDepth) continue;
        if (cur.node.id() === dst.id()){
          const key = cur.pathNodes.map(n=>n.id()).join('>');
          if (!visitedPath.has(key)){ visitedPath.add(key); res.push(cur); }
          continue;
        }
        cur.node.outgoers('edge').forEach(e=>{
          const next = e.target();
          if (cur.pathNodes.includes(next)) return; // simple path
          q.push({
            node: next,
            pathNodes: cur.pathNodes.concat(next),
            pathEdges: cur.pathEdges.concat(e),
            depth: cur.depth+1
          });
        });
      }
      return res.map(p=> ({ nodes: cy.collection(p.pathNodes), edges: cy.collection(p.pathEdges) }));
    }

    // Render paths list
    function renderPaths(paths){
      const list = $('#paths-list'); if (!list) return;
      list.innerHTML = '';
      paths.forEach((p, i)=>{
        const text = p.nodes.map(n=> nodeLabel(n)).join(' → ');
        const signs = p.edges.map(e=> edgeSign(e)).join(' ');
        const item = document.createElement('div');
        item.className = 'path-item';
        item.innerHTML = `<div class="label">مسیر ${i+1}: ${text} <span style="opacity:.7">(${signs})</span></div>
                          <div class="acts">
                            <button data-act="hl" data-idx="${i}">های‌لایت</button>
                          </div>`;
        list.appendChild(item);
      });
      list.addEventListener('click', (e)=>{
        if (e.target?.dataset?.act === 'hl'){
          const idx = Number(e.target.dataset.idx);
          const p = paths[idx]; if (!p) return;
          highlightSet(p.nodes.union(p.edges), 'cy-path-active');
          document.dispatchEvent(new CustomEvent('path:highlighted', { detail: { length: p.edges.length }}));
        }
      }, { once: true });
    }

    // Find paths button
    $('#btn-find-paths')?.addEventListener('click', ()=>{
      const q = $('#node-search')?.value?.trim(); const src = findNodeByLabel(q);
      const targetId = $('#target-select')?.value; const dst = targetId ? cy.getElementById(targetId) : null;
      if (!src || !dst || !dst.isNode()) return;
      const paths = kShortestPaths(src, dst, 3, 6);
      renderPaths(paths);
      if (paths[0]) highlightSet(paths[0].nodes.union(paths[0].edges), 'cy-path-active');
    });

    // Keep last tapped node as source
    cy.on('tap', 'node', debounce((evt)=>{
      const n = evt.target; const inp = $('#node-search'); if (!inp) return;
      inp.value = nodeLabel(n);
    }, 60));

    // -------- Loops (R/B) chips --------
    // 1) سعی می‌کنیم از متادیتای آماده استفاده کنیم (اگر در داده‌ها وجود دارد)
    //    edge.data('loopId') یا node.data('loops') یا groupها؛ در غیر این‌صورت، کشف حلقه‌های کوتاه.
    function detectLoops(maxLen=6, maxCount=12){
      const loops = [];
      const addLoop = (nodes, edges)=>{
        // محاسبه تقویتی/تعادلی: حاصل‌ضرب علامت‌ها
        const prod = edges.reduce((acc,e)=> acc * (edgeSign(e)==='+' ? +1 : -1), 1);
        const type = prod>=0 ? 'R' : 'B';
        const label = nodes.map(n=> nodeLabel(n)).join(' → ');
        loops.push({ type, nodes: cy.collection(nodes), edges: cy.collection(edges), label });
      };

      // 1) از متادیتا
      const edgeGroups = {};
      cy.edges().forEach(e=>{
        const gid = e.data('loopId') || e.data('group') || null;
        if (gid){ (edgeGroups[gid] = edgeGroups[gid] || []).push(e); }
      });
      Object.entries(edgeGroups).forEach(([gid, es])=>{
        const ns = [];
        es.forEach(e=>{ ns.push(e.source()); ns.push(e.target()); });
        if (es.length>=2) addLoop(ns, es);
      });
      if (loops.length >= maxCount) return loops.slice(0, maxCount);

      // 2) کشف حلقه‌های کوتاه (DFS محدود)
      const seen = new Set();
      cy.edges().forEach(startE=>{
        if (loops.length>=maxCount) return;
        const s = startE.source(); const t = startE.target();
        const stack = [{ node: t, pathN: [s, t], pathE: [startE], depth:1 }];
        while (stack.length && loops.length<maxCount){
          const cur = stack.pop();
          if (cur.depth > maxLen) continue;
          if (cur.node.id() === s.id() && cur.pathE.length>=2){
            const key = cur.pathN.map(n=>n.id()).join('>');
            if (!seen.has(key)){ seen.add(key); addLoop(cur.pathN.slice(), cur.pathE.slice()); }
            continue;
          }
          cur.node.outgoers('edge').forEach(e=>{
            const nx = e.target();
            if (cur.pathN.includes(nx)) return; // simple
            stack.push({ node: nx, pathN: cur.pathN.concat(nx), pathE: cur.pathE.concat(e), depth: cur.depth+1 });
          });
        }
      });
      return loops.slice(0, maxCount);
    }

    function renderLoops(){
      const bar = $('#loops-bar'); if (!bar) return;
      bar.innerHTML = '';
      const loops = detectLoops(6, 12);

      let rIdx=0, bIdx=0;
      loops.forEach(lp=>{
        const idx = (lp.type==='R') ? (++rIdx) : (++bIdx);
        const chip = document.createElement('button');
        chip.className = 'loop-chip ' + (lp.type==='R' ? 'r' : 'b');
        chip.type='button';
        chip.innerHTML = `${lp.type}${idx} <span class="hint">— ${lp.label}</span>`;
        chip.addEventListener('click', ()=>{
          highlightSet(lp.nodes.union(lp.edges), 'cy-loop-active');
          document.dispatchEvent(new CustomEvent('loop:highlighted', { detail: { type: lp.type, size: lp.edges.length }}));
        });
        bar.appendChild(chip);
      });

      if (!loops.length){
        const none = document.createElement('div');
        none.className='note'; none.textContent='حلقهٔ معناداری یافت نشد (یا دادهٔ loopId/group موجود نیست).';
        bar.appendChild(none);
      }
    }

    renderLoops();
    cy.one('layoutstop', renderLoops); // بعد از چیدمان، یک‌بار باز-ارزیابی
  }

  if (window.graphStore && typeof window.graphStore.run === 'function') {
    graphStore.run(run);
  } else {
    onCyReady(run);
  }
})();
