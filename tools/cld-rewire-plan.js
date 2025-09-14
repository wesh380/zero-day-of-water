#!/usr/bin/env node
const fs = require('fs'); const path = require('path');
const inv = JSON.parse(fs.readFileSync(path.join('reports','cld-inventory.json'),'utf8'));
const run = fs.existsSync(path.join('reports','cld-runtime-usage.json'))
  ? JSON.parse(fs.readFileSync(path.join('reports','cld-runtime-usage.json'),'utf8')) : [];

const md = [];
md.push('# CLD Rewire Plan (Core/UI/Loader/Data)\n');

function usedInRuntime(p){
  const urlPart = p.replace(/^docs[\\\/]/,'/').replace(/\\/g,'/');
  return run.some(page =>
    (page.scripts||[]).some(s=>s.includes(urlPart)) ||
    (page.requests||[]).some(u=>u.includes(urlPart)) );
}

for (const r of inv) {
  const role = r.role;
  const file = r.file;
  const used = usedInRuntime(file);
  let target = 'Unmapped';
  if (role==='Data') target = 'Data';
  else if (role==='Core-candidate') target = 'Core';
  else if (role==='UI-candidate') target = 'UI';
  else if (role==='Loader-candidate') target = 'Loader';
  else if (role==='HTML-host') target = 'Host';

  md.push(`## ${file}\n- Current role: **${role}**\n- Used now: ${used?'✅ yes':'❌ no'}\n- Proposed layer: **${target}**\n`);
  if (role==='Data' && !used) md.push(`  - 👉 پیشنهاد: این مدل را در Loader به‌صورت \`fetch('/${file.replace(/\\/g,'/')}')\` یا از طریق manifest متصل کن.\n`);
  if (role==='HTML-host' && r.scripts?.length) md.push(`  - Scripts in page:\n    - ${r.scripts.join('\n    - ')}\n`);
}

fs.writeFileSync(path.join('reports','cld-rewire-plan.md'), md.join('\n'), 'utf8');
console.log('Rewire plan written to reports/cld-rewire-plan.md');
