// --- MOCK DATA ---
const provinceData = [
  { month: 'فروردین', year: 1403, customers: 1000000, interruptions_count: 1200000, outage_minutes: 45000000, planned_share_pct: 40 },
  { month: 'اردیبهشت', year: 1403, customers: 1005000, interruptions_count: 1100000, outage_minutes: 40000000, planned_share_pct: 50 },
  { month: 'خرداد', year: 1403, customers: 1010000, interruptions_count: 1500000, outage_minutes: 60000000, planned_share_pct: 65 },
  { month: 'تیر', year: 1403, customers: 1015000, interruptions_count: 1800000, outage_minutes: 75000000, planned_share_pct: 70 },
  { month: 'مرداد', year: 1403, customers: 1020000, interruptions_count: 1850000, outage_minutes: 80000000, planned_share_pct: 60 },
  { month: 'شهریور', year: 1403, customers: 1025000, interruptions_count: 1600000, outage_minutes: 65000000, planned_share_pct: 55 },
  { month: 'مهر', year: 1403, customers: 1030000, interruptions_count: 1300000, outage_minutes: 50000000, planned_share_pct: 45 },
  { month: 'آبان', year: 1403, customers: 1035000, interruptions_count: 1400000, outage_minutes: 55000000, planned_share_pct: 35 },
  { month: 'آذر', year: 1403, customers: 1040000, interruptions_count: 1700000, outage_minutes: 70000000, planned_share_pct: 30 },
  { month: 'دی', year: 1402, customers: 995000, interruptions_count: 1900000, outage_minutes: 90000000, planned_share_pct: 20 },
  { month: 'بهمن', year: 1402, customers: 990000, interruptions_count: 1500000, outage_minutes: 60000000, planned_share_pct: 25 },
  { month: 'اسفند', year: 1402, customers: 998000, interruptions_count: 1300000, outage_minutes: 52000000, planned_share_pct: 30 },
].reverse();

const citiesData = {
  'فروردین': [
    { city: 'مشهد', customers: 500000, interruptions_count: 550000, outage_minutes: 20000000, planned_share_pct: 45 },
    { city: 'نیشابور', customers: 80000, interruptions_count: 90000, outage_minutes: 3000000, planned_share_pct: 40 },
    { city: 'سبزوار', customers: 70000, interruptions_count: 85000, outage_minutes: 3500000, planned_share_pct: 35 },
    { city: 'تربت حیدریه', customers: 40000, interruptions_count: 50000, outage_minutes: 2200000, planned_share_pct: 50 },
    { city: 'قوچان', customers: 35000, interruptions_count: 48000, outage_minutes: 2500000, planned_share_pct: 30 },
  ],
  'اردیبهشت': [
    { city: 'مشهد', customers: 502000, interruptions_count: 500000, outage_minutes: 18000000, planned_share_pct: 55 },
    { city: 'نیشابور', customers: 80500, interruptions_count: 80000, outage_minutes: 2500000, planned_share_pct: 50 },
    { city: 'سبزوار', customers: 70200, interruptions_count: 75000, outage_minutes: 3000000, planned_share_pct: 45 },
    { city: 'تربت حیدریه', customers: 40100, interruptions_count: 45000, outage_minutes: 1800000, planned_share_pct: 60 },
    { city: 'قوچان', customers: 35100, interruptions_count: 42000, outage_minutes: 2000000, planned_share_pct: 40 },
  ]
};
const latestMonthName = provinceData[0].month;
if (!citiesData[latestMonthName]) { citiesData[latestMonthName] = citiesData['اردیبهشت']; }

let trendChart, causesDonutChart, commonCausesBarChart;

const calculateMetrics = (data) => {
  const saidi = data.customers > 0 ? data.outage_minutes / data.customers : 0;
  const saifi = data.customers > 0 ? data.interruptions_count / data.customers : 0;
  const caidi = saifi > 0 ? saidi / saifi : 0;
  return { saidi, saifi, caidi };
};

const getStatusColor = (value, thresholds) => {
  if (value <= thresholds.green) return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500' };
  if (value <= thresholds.yellow) return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500' };
  if (value <= thresholds.orange) return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500' };
  return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500' };
};

const formatChange = (current, previous) => {
  if (!previous) return '';
  const change = ((current - previous) / previous) * 100;
  const isImprovement = change < 0;
  const color = isImprovement ? 'text-green-400' : 'text-red-400';
  const icon = isImprovement
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>`;
  return `<div class="flex items-center gap-1 ${color}">${icon} ${Math.abs(change).toFixed(1)}% نسبت به ماه قبل</div>`;
};

function updateOverviewCards() {
  const currentMonth = provinceData[0];
  const previousMonth = provinceData[1];
  const currentMetrics = calculateMetrics(currentMonth);
  const previousMetrics = calculateMetrics(previousMonth);

  const saifiColor = getStatusColor(currentMetrics.saifi, { green: 1, yellow: 2, orange: 3 }).text;
  document.getElementById('saifi-value').textContent = currentMetrics.saifi.toFixed(2);
  document.getElementById('saifi-value').className = `text-3xl font-bold my-2 ${saifiColor}`;
  document.getElementById('saifi-change').innerHTML = formatChange(currentMetrics.saifi, previousMetrics.saifi);

  const saidiColor = getStatusColor(currentMetrics.saidi, { green: 30, yellow: 60, orange: 90 }).text;
  document.getElementById('saidi-value').textContent = currentMetrics.saidi.toFixed(1);
  document.getElementById('saidi-value').className = `text-3xl font-bold my-2 ${saidiColor}`;
  document.getElementById('saidi-change').innerHTML = formatChange(currentMetrics.saidi, previousMetrics.saidi);

  const caidiColor = getStatusColor(currentMetrics.caidi, { green: 30, yellow: 45, orange: 90 }).text;
  document.getElementById('caidi-value').textContent = currentMetrics.caidi.toFixed(1);
  document.getElementById('caidi-value').className = `text-3xl font-bold my-2 ${caidiColor}`;

  document.getElementById('planned-share-value').textContent = `${currentMonth.planned_share_pct}%`;
}

function updateTrendChart() {
  const ctx = document.getElementById('trendChart').getContext('2d');
  const labels = provinceData.map(d => d.month).reverse();
  const saidiData = provinceData.map(d => calculateMetrics(d).saidi).reverse();
  const saifiData = provinceData.map(d => calculateMetrics(d).saifi).reverse();

  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'SAIDI (دقیقه)', data: saidiData, borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)', yAxisID: 'y', fill: true, tension: 0.4 },
        { label: 'SAIFI (بار)', data: saifiData, borderColor: '#22d3ee', backgroundColor: 'rgba(34, 211, 238, 0.1)', yAxisID: 'y1', fill: true, tension: 0.4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } },
        y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'SAIDI (دقیقه)', color: '#4ade80' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } },
        y1:{ type: 'linear', display: true, position: 'right', title: { display: true, text: 'SAIFI (بار)', color: '#22d3ee' }, grid: { drawOnChartArea: false }, ticks: { color: '#9ca3af' } }
      },
      plugins: { legend: { labels: { color: '#d1d5db' } }, tooltip: { bodyFont: { family: 'Vazirmatn' }, titleFont: { family: 'Vazirmatn' } } }
    }
  });
}

function updateCitiesTable() {
  const tableBody = document.getElementById('cities-table-body');
  tableBody.innerHTML = '';
  const currentCities = citiesData[latestMonthName];
  if (!currentCities) return;
  const citiesWithMetrics = currentCities.map(city => ({ ...city, ...calculateMetrics(city) }));
  citiesWithMetrics.sort((a, b) => a.saidi - b.saidi);
  citiesWithMetrics.forEach((city, index) => {
    const saidiStatus = getStatusColor(city.saidi, { green: 30, yellow: 60, orange: 90 });
    const row = `<tr class="border-b border-gray-700 hover:bg-gray-800/50">
      <td class="p-3 font-semibold">${index + 1}</td>
      <td class="p-3">${city.city}</td>
      <td class="p-3 font-mono ${saidiStatus.text}">${city.saidi.toFixed(1)}</td>
      <td class="p-3 font-mono">${city.saifi.toFixed(2)}</td>
      <td class="p-3"><span class="px-3 py-1 text-xs rounded-full ${saidiStatus.bg} ${saidiStatus.text}">${saidiStatus.text.includes('green') ? 'خوب' : saidiStatus.text.includes('yellow') ? 'متوسط' : saidiStatus.text.includes('orange') ? 'ضعیف' : 'بحرانی'}</span></td>
      <td class="p-3"><button class="text-xs text-cyan-400 hover:underline">توضیح وضعیت</button></td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}

function updateCauseCharts() {
  const currentMonth = provinceData[0];
  const planned = currentMonth.planned_share_pct;
  const unplanned = 100 - planned;

  const donutCtx = document.getElementById('causesDonutChart').getContext('2d');
  if (causesDonutChart) causesDonutChart.destroy();
  causesDonutChart = new Chart(donutCtx, {
    type: 'doughnut',
    data: { labels: ['برنامه‌ریزی‌شده (تعمیرات)', 'غیربرنامه‌ای (اتفاقات)'],
      datasets: [{ data: [planned, unplanned], backgroundColor: ['#4f46e5', '#f59e0b'], borderColor: '#1f2937', borderWidth: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#d1d5db' } } } }
  });

  const barCtx = document.getElementById('commonCausesBarChart').getContext('2d');
  if (commonCausesBarChart) commonCausesBarChart.destroy();
  commonCausesBarChart = new Chart(barCtx, {
    type: 'bar',
    data: { labels: ['آب و هوا', 'تجهیزات', 'شاخه درخت', 'حوادث'],
      datasets: [{ label: 'سهم از قطعی غیربرنامه‌ای', data: [45, 30, 15, 10], backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'], borderRadius: 5 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } },
               y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } } } }
  });
}

function updateStoryBox() {
  const currentMonth = provinceData[0];
  const metrics = calculateMetrics(currentMonth);
  const cityMetrics = (citiesData[currentMonth.month] || []).map(c => ({...c, ...calculateMetrics(c)})).sort((a, b) => a.saidi - b.saidi);
  const bestCities = cityMetrics.slice(0, 2).map(c => c.city).join(' و ');
  const storyHTML = `<p>در ${currentMonth.month}، شاخص SAIFI استان <strong class="text-cyan-400">${metrics.saifi.toFixed(2)} بار</strong> و شاخص SAIDI <strong class="text-green-400">${metrics.saidi.toFixed(1)} دقیقه</strong> به ازای هر مشترک بود.</p>
    <p>${currentMonth.planned_share_pct}% از قطعی‌ها به‌صورت برنامه‌ریزی‌شده و برای بهینه‌سازی شبکه در آستانه تابستان انجام شد.</p>
    <p>در این ماه، شهرهای <strong class="text-yellow-300">${bestCities}</strong> عملکردی بهتر از میانگین استان داشتند و در صدر جدول بهبود کیفیت قرار گرفتند.</p>`;
  const box = document.getElementById('story-box');
  if (box) box.innerHTML = storyHTML;
}

// ماشین‌حساب ردپای آب
function setupWaterCalculator() {
  const calculateBtn = document.getElementById('calculate-water-btn');
  const kwhInput = document.getElementById('kwh-input');
  const resultDiv = document.getElementById('water-result');
  const waterAmountSpan = document.getElementById('water-amount');

  const LITERS_PER_KWH = 2.0; // قابل تنظیم با داده محلی

  if (calculateBtn) {
    calculateBtn.addEventListener('click', () => {
      const kwh = parseFloat(kwhInput?.value);
      if (isNaN(kwh) || kwh <= 0) {
        alert('لطفاً یک عدد معتبر برای کیلووات‌ساعت وارد کنید.');
        return;
      }
      const waterFootprint = kwh * LITERS_PER_KWH;
      if (waterAmountSpan) waterAmountSpan.textContent = waterFootprint.toLocaleString('fa-IR');
      if (resultDiv) resultDiv.classList.remove('hidden');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateOverviewCards();
  updateTrendChart();
  updateCitiesTable();
  updateCauseCharts();
  updateStoryBox();
  setupWaterCalculator();
});

