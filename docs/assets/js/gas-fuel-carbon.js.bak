(() => {
  'use strict';

  const _e = document.getElementById('fc-js-status'); if (_e) _e.textContent = 'OK';

  // --- MOCK DATA ---
  const lastMonthData = { province: { gas: 75, diesel: 13, mazut: 12, other: 0 }, national: { gas: 85, diesel: 8, mazut: 7, other: 0 } };
  const carbonIntensityHistory = [
    { month: '2023-08', province: 0.46, national: 0.42 },
    { month: '2023-09', province: 0.45, national: 0.41 },
    { month: '2023-10', province: 0.47, national: 0.43 },
    { month: '2023-11', province: 0.49, national: 0.45 },
    { month: '2023-12', province: 0.52, national: 0.48 },
    { month: '2024-01', province: 0.55, national: 0.50 },
    { month: '2024-02', province: 0.53, national: 0.49 },
    { month: '2024-03', province: 0.48, national: 0.44 },
    { month: '2024-04', province: 0.46, national: 0.42 },
    { month: '2024-05', province: 0.44, national: 0.40 },
    { month: '2024-06', province: 0.45, national: 0.41 },
    { month: '2024-07', province: 0.47, national: 0.43 },
    { month: '2024-08', province: 0.48, national: 0.44 },
    { month: '2024-09', province: 0.47, national: 0.43 },
    { month: '2024-10', province: 0.49, national: 0.45 },
    { month: '2024-11', province: 0.51, national: 0.47 },
    { month: '2024-12', province: 0.54, national: 0.49 },
    { month: '2025-01', province: 0.56, national: 0.51 },
    { month: '2025-02', province: 0.54, national: 0.50 },
    { month: '2025-03', province: 0.50, national: 0.46 },
    { month: '2025-04', province: 0.47, national: 0.43 },
    { month: '2025-05', province: 0.45, national: 0.41 },
    { month: '2025-06', province: 0.46, national: 0.42 },
    { month: '2025-07', province: 0.48, national: 0.44 }
  ];
  const kpiData = { gasShare: 75, mazutShare: 12, carbonIntensity: 0.48, yoyChange: 5.1, mazutFreeDays: 8 };
  const emissionFactors = { gas: 0.35, diesel: 0.65, mazut: 0.75, other: 0.5 };

  // --- DOM Elements ---
  const applianceSelector = document.getElementById('appliance-selector');
  const impactResultDiv = document.getElementById('impact-result');
  const co2GramsSpan = document.getElementById('co2-grams');

  // --- Functions ---
  function updateKpiCards() {
    document.querySelector('#gas-share-card p:nth-of-type(1)').textContent = `${kpiData.gasShare}٪`;

    const mazutShareCard = document.getElementById('mazut-share-card');
    mazutShareCard.querySelector('p:nth-of-type(1)').textContent = `${kpiData.mazutShare}٪`;
    mazutShareCard.classList.remove('mazut-warning', 'mazut-danger');

    if (kpiData.mazutShare > 20) {
      mazutShareCard.classList.add('mazut-danger');
      mazutShareCard.querySelector('p:nth-of-type(2)').textContent = 'خطر: بالاتر از آستانه ۲۰٪';
    } else if (kpiData.mazutShare > 10) {
      mazutShareCard.classList.add('mazut-warning');
      mazutShareCard.querySelector('p:nth-of-type(2)').textContent = 'هشدار: بالاتر از آستانه ۱۰٪';
    } else {
      mazutShareCard.querySelector('p:nth-of-type(2)').textContent = 'وضعیت مطلوب';
    }

    document.querySelector('#carbon-intensity-card p:nth-of-type(1)').textContent = kpiData.carbonIntensity.toFixed(2);

    const yoyP = document.querySelector('#yoy-change-card p:nth-of-type(1)');
    yoyP.textContent = `${kpiData.yoyChange > 0 ? '+' : ''}${kpiData.yoyChange.toFixed(0)}٪`;
    yoyP.className = `text-4xl font-bold mt-2 ${kpiData.yoyChange > 0 ? 'text-red-500' : 'text-green-500'}`;

    document.querySelector('#mazut-free-days-card p:nth-of-type(1)').textContent = kpiData.mazutFreeDays;
  }

  function createDoughnutChart(canvasId, data, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['گاز', 'گازوئیل', 'مازوت'],
        datasets: [{
          label: label,
          data: [data.gas, data.diesel, data.mazut],
          backgroundColor: ['rgba(13, 148, 136, 0.8)', 'rgba(249, 115, 22, 0.8)', 'rgba(220, 38, 38, 0.8)'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: "'Vazirmatn', sans-serif" } } },
          tooltip: {
            callbacks: { label: (c) => `${c.label}: ${c.parsed}٪` },
            bodyFont: { family: "'Vazirmatn', sans-serif" },
            titleFont: { family: "'Vazirmatn', sans-serif" }
          }
        }
      }
    });
  }

  function createLineChart() {
    const ctx = document.getElementById('carbonIntensityTrendChart').getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: carbonIntensityHistory.map(d => new Date(d.month)),
        datasets: [
          {
            label: 'شدت کربن استان',
            data: carbonIntensityHistory.map(d => d.province),
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 2
          },
          {
            label: 'میانگین ملی',
            data: carbonIntensityHistory.map(d => d.national),
            borderColor: 'rgba(107, 114, 128, 1)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'month', tooltipFormat: 'yyyy-MM' },
            ticks: { font: { family: "'Vazirmatn', sans-serif" } }
          },
          y: {
            beginAtZero: false,
            title: { display: true, text: 'kgCO₂e/kWh', font: { family: "'Vazirmatn', sans-serif" } },
            ticks: { font: { family: "'Vazirmatn', sans-serif" } }
          }
        },
        plugins: {
          legend: { position: 'top', labels: { font: { family: "'Vazirmatn', sans-serif" } } },
          tooltip: { bodyFont: { family: "'Vazirmatn', sans-serif" }, titleFont: { family: "'Vazirmatn', sans-serif" } }
        }
      }
    });
  }

  function calculateIntensity(fuelMix) {
    return (
      (fuelMix.gas / 100 * emissionFactors.gas) +
      (fuelMix.diesel / 100 * emissionFactors.diesel) +
      (fuelMix.mazut / 100 * emissionFactors.mazut) +
      (fuelMix.other / 100 * emissionFactors.other)
    );
  }

  // --- Event Listeners ---
  const gasSlider = document.getElementById('gas-slider');
  if (gasSlider) {
    gasSlider.addEventListener('input', (event) => {
      const addedGas = parseInt(event.target.value, 10);
      document.getElementById('slider-value').textContent = addedGas;

      let newMix = { ...lastMonthData.province };
      let reductionAmount = addedGas;

      const mazutReduction = Math.min(newMix.mazut, reductionAmount);
      newMix.mazut -= mazutReduction;
      reductionAmount -= mazutReduction;

      if (reductionAmount > 0) {
        newMix.diesel -= Math.min(newMix.diesel, reductionAmount);
      }

      newMix.gas = lastMonthData.province.gas + addedGas;

      const originalIntensity = calculateIntensity(lastMonthData.province);
      const newIntensity = calculateIntensity(newMix);
      const reductionPercent = ((originalIntensity - newIntensity) / originalIntensity) * 100;

      document.getElementById('simulated-intensity').textContent = newIntensity.toFixed(2);
      document.getElementById('simulated-reduction').textContent = reductionPercent.toFixed(1);
    });
  }

  if (applianceSelector) {
    applianceSelector.addEventListener('change', (event) => {
      const appliancePowerKW = parseFloat(event.target.value);
      if (appliancePowerKW > 0) {
        const co2GramsPerHour = appliancePowerKW * kpiData.carbonIntensity * 1000;
        co2GramsSpan.textContent = co2GramsPerHour.toFixed(0);
        impactResultDiv.classList.remove('hidden');
      } else {
        impactResultDiv.classList.add('hidden');
      }
    });
  }

  // --- Initial Load ---
  document.addEventListener('DOMContentLoaded', () => {
    updateKpiCards();
    createDoughnutChart('provinceFuelMixChart', lastMonthData.province, 'استان');
    createDoughnutChart('nationalFuelMixChart', lastMonthData.national, 'ملی');
    createLineChart();
  });
})();
