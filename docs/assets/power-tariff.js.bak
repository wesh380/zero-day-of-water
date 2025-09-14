const ETariffConfig = {
  blocks: [
    { from: 0, to: 100, rate: 600 },
    { from: 100, to: 200, rate: 700 },
    { from: 200, to: 300, rate: 1500 },
    { from: 300, to: 400, rate: 2500 },
    { from: 400, to: 500, rate: 3000 },
    { from: 500, to: 600, rate: 3500 },
    { from: 600, to: Infinity, rate: 4000 }
  ],
  fixed_charge: 30000,
  levies_percent: 10,
  vat_percent: 9
};

function formatIRR(n) {
  return new Intl.NumberFormat('fa-IR').format(Math.round(n));
}

function calcBill(totalKwh, cfg) {
  let remaining = totalKwh;
  let energy = 0;
  cfg.blocks.forEach(b => {
    if (remaining <= 0) return;
    const upper = isFinite(b.to) ? b.to : Infinity;
    const use = Math.min(remaining, upper - b.from);
    energy += use * b.rate;
    remaining -= use;
  });
  const fixed = cfg.fixed_charge;
  const levies = energy * cfg.levies_percent / 100;
  const vat = (energy + fixed + levies) * cfg.vat_percent / 100;
  const total = energy + fixed + levies + vat;
  return { energy, fixed, levies, vat, total };
}

function populateTariffTable(cfg) {
  const tbody = document.getElementById('etf-tariff-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  cfg.blocks.forEach((b, i) => {
    const to = isFinite(b.to) ? formatIRR(b.to) : '∞';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="p-4">${formatIRR(i + 1)}</td><td class="p-4">${formatIRR(b.from)} - ${to}</td><td class="p-4">${formatIRR(b.rate)}</td>`;
    tbody.appendChild(tr);
  });
}

function checkUserTier() {
  const val = parseFloat(document.getElementById('etf-consumption-check-input').value);
  const out = document.getElementById('etf-tier-check-result');
  if (isNaN(val)) { out.textContent = ''; return; }
  const blocks = ETariffConfig.blocks;
  let tier = blocks.length;
  for (let i = 0; i < blocks.length; i++) {
    if (val >= blocks[i].from && val < blocks[i].to) { tier = i + 1; break; }
  }
  out.textContent = `پله ${formatIRR(tier)} – ${formatIRR(blocks[tier - 1].rate)} ریال`;
}

let lastBill = null;
let currentKwh = 0;

function handleCalculate() {
  const kwh = parseFloat(document.getElementById('etf-kwh-input').value);
  const prev = parseFloat(document.getElementById('etf-previous-balance').value) || 0;
  if (isNaN(kwh)) return;
  currentKwh = kwh;
  const bill = calcBill(kwh, ETariffConfig);
  bill.prevBalance = prev;
  bill.total += prev;
  lastBill = bill;
  document.getElementById('etf-energy-cost').textContent = `${formatIRR(bill.energy)} ریال`;
  document.getElementById('etf-fixed-cost').textContent = `${formatIRR(bill.fixed)} ریال`;
  document.getElementById('etf-levies-cost').textContent = `${formatIRR(bill.levies)} ریال`;
  document.getElementById('etf-vat-cost').textContent = `${formatIRR(bill.vat)} ریال`;
  document.getElementById('etf-prev-balance-display').textContent = `${formatIRR(prev)} ریال`;
  document.getElementById('etf-total-bill').textContent = `${formatIRR(bill.total)} ریال`;
  document.getElementById('etf-bill-output-container').classList.remove('hidden');
  document.getElementById('etf-what-if-container').classList.remove('hidden');
  updateSavings();
}

function updateSavings() {
  if (!lastBill) return;
  const percent = parseInt(document.getElementById('etf-savings-slider').value, 10);
  const box = document.getElementById('etf-savings-result');
  if (percent === 0) { box.classList.add('hidden'); return; }
  const newKwh = currentKwh * (1 - percent / 100);
  const newBill = calcBill(newKwh, ETariffConfig);
  newBill.total += lastBill.prevBalance;
  const savings = lastBill.total - newBill.total;
  document.getElementById('etf-savings-percent').textContent = formatIRR(percent);
  document.getElementById('etf-new-bill-amount').textContent = formatIRR(newBill.total);
  document.getElementById('etf-savings-amount').textContent = formatIRR(savings);
  box.classList.remove('hidden');
}

function analyzeConsumption() {
  const val = parseFloat(document.getElementById('etf-analysis-kwh-input').value);
  const container = document.getElementById('etf-analysis-result-container');
  if (isNaN(val)) { container.classList.add('hidden'); return; }
  const marker = document.getElementById('etf-user-marker');
  const text = document.getElementById('etf-analysis-text');
  const percent = Math.min(val, 600) / 600 * 100;
  marker.style.right = `${percent}%`;
  let msg = '';
  if (val <= 200) msg = 'شما در محدوده کم‌مصرف هستید.';
  else if (val <= 400) msg = 'شما در محدوده مصرف متوسط قرار دارید.';
  else msg = 'شما پرمصرف هستید.';
  text.textContent = msg;
  container.classList.remove('hidden');
}

async function loadPdfLibs() {
  try {
    const hMod = await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    const jMod = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    if (!hMod?.default || !jMod?.jsPDF) throw new Error('dynamic import failed');
    return { html2canvas: hMod.default, jsPDF: jMod.jsPDF };
  } catch (e) {
    return new Promise(resolve => {
      const h = document.createElement('script');
      h.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      h.onload = () => {
        const j = document.createElement('script');
        j.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        j.onload = () => resolve({ html2canvas: window.html2canvas, jsPDF: window.jspdf.jsPDF });
        document.head.appendChild(j);
      };
      document.head.appendChild(h);
    });
  }
}

async function downloadBillAsPDF() {
  const libs = await loadPdfLibs();
  const element = document.getElementById('etf-bill-to-print');
  const canvas = await libs.html2canvas(element, { useCORS: true, scale: 2 });
  const img = canvas.toDataURL('image/png');
  const pdf = new libs.jsPDF('p', 'mm', 'a4');
  const width = pdf.internal.pageSize.getWidth();
  const height = canvas.height * width / canvas.width;
  pdf.addImage(img, 'PNG', 0, 0, width, height);
  pdf.save('bill.pdf');
}

function initTabs() {
  const tabs = document.querySelectorAll('.etf-tab-btn');
  const contents = document.querySelectorAll('.etf-tab-content');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('etf-active'));
      contents.forEach(c => c.classList.add('hidden'));
      btn.classList.add('etf-active');
      const target = document.getElementById('etf-' + btn.dataset.tab);
      if (target) target.classList.remove('hidden');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.clear();
  populateTariffTable(ETariffConfig);
  initTabs();
  const addListener = (id, evt, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(evt, handler);
    else console.warn(`Element #${id} not found`);
  };
  addListener('etf-check-tier-btn', 'click', checkUserTier);
  addListener('etf-calculate-btn', 'click', handleCalculate);
  addListener('etf-savings-slider', 'input', updateSavings);
  addListener('etf-analyze-btn', 'click', analyzeConsumption);
  addListener('etf-download-pdf-btn', 'click', downloadBillAsPDF);
});
