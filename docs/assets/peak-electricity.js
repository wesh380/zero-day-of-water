// docs/assets/peak-electricity.js
(() => {
  'use strict';

  const dashboardEl = document.getElementById('peak-load-dashboard');
  if (!dashboardEl) return;

  const UPDATE_MS = 3000;
  const MAX_POINTS = Math.floor((2 * 60 * 60 * 1000) / UPDATE_MS); // keep ~2 hours of data

  const currentLoadValEl = document.getElementById('currentLoadVal');
  const todayPeakValEl = document.getElementById('todayPeakVal');
  const todayPeakTimeEl = document.getElementById('todayPeakTime');
  const yesterdayPeakValEl = document.getElementById('yesterdayPeakVal');
  const yesterdayPeakTimeEl = document.getElementById('yesterdayPeakTime');
  const alertCard = document.getElementById('alertCard');
  const alertMessage = document.getElementById('alertMessage');
  const dailyPeakTbody = document.getElementById('daily-peak-tbody');

  const hasChart = () => typeof window !== 'undefined' && !!window.Chart;

  const faTime = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tehran'
  });

  let todayPeak = { value: 0, time: new Date() };
  let intervalId;
  let realtimeChart, hourlyChart, forecastChart;

  function registerPlugins() {
    try {
      const Annotation = window.ChartAnnotation || window['chartjs-plugin-annotation'];
      if (Annotation && hasChart()) {
        Chart.register(Annotation);
      }
    } catch (e) {
      console.warn('Annotation plugin registration failed', e);
    }
  }

  function initCharts() {
    if (!hasChart()) return;
    registerPlugins();

    // Realtime chart
    const rtCtx = document.getElementById('realtime-chart')?.getContext?.('2d');
    realtimeChart = new Chart(rtCtx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'بار لحظه‌ای (مگاوات)',
          data: [],
          borderColor: '#2563eb',
          tension: 0.2,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        animation: false,
        scales: {
          x: {
            type: 'time',
            adapters: { date: { locale: 'fa-IR' } },
            ticks: { rtl: true }
          },
          y: {
            ticks: {
              callback: value => value.toLocaleString('fa-IR')
            }
          }
        },
        plugins: {
          tooltip: { rtl: true },
          legend: { display: false }
        }
      }
    });

    // Hourly peak chart
    const hourlyCtx = document.getElementById('hourly-peak-chart').getContext('2d');
    hourlyChart = new Chart(hourlyCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'پیک ساعتی',
          data: [],
          backgroundColor: '#10b981'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { ticks: { rtl: true } },
          x: {
            ticks: {
              callback: value => value.toLocaleString('fa-IR')
            }
          }
        },
        plugins: {
          tooltip: { rtl: true },
          legend: { display: false }
        }
      }
    });

    // Forecast chart
    const fcCtx = document.getElementById('forecast-chart')?.getContext?.('2d');
    forecastChart = new Chart(fcCtx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'پیش‌بینی پیک (مگاوات)',
          data: [],
          borderColor: '#f97316',
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        scales: {
          x: {
            type: 'time',
            adapters: { date: { locale: 'fa-IR' } },
            ticks: { rtl: true }
          },
          y: {
            ticks: {
              callback: value => value.toLocaleString('fa-IR')
            }
          }
        },
        plugins: {
          tooltip: { rtl: true },
          legend: { display: false }
        }
      }
    });
  }

  function startUpdates() {
    updateData();
    intervalId = setInterval(updateData, UPDATE_MS);
  }

  function stopUpdates() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function updateData() {
    const now = new Date();
    const load = 45000 + Math.round(Math.random() * 5000);

    // Update current load
    currentLoadValEl.textContent = load.toLocaleString('fa-IR');

    // Update realtime chart
    if (realtimeChart && realtimeChart.data && realtimeChart.data.datasets?.[0]) {
      const ds = realtimeChart.data.datasets[0].data;
      ds.push({ x: now, y: load });
      if (ds.length > MAX_POINTS) ds.shift();
      realtimeChart.update();
    }

    // Update today peak
    if (load > todayPeak.value) {
      todayPeak.value = load;
      todayPeak.time = now;
    }
    todayPeakValEl.textContent = todayPeak.value.toLocaleString('fa-IR');
    todayPeakTimeEl.textContent = `در ساعت ${faTime.format(todayPeak.time)}`;

    // Yesterday peak (simulated)
    const yesterdayPeakVal = 48000 + Math.round(Math.random() * 1000);
    const yesterdayTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    yesterdayPeakValEl.textContent = yesterdayPeakVal.toLocaleString('fa-IR');
    yesterdayPeakTimeEl.textContent = faTime.format(yesterdayTime);

    // Hourly data init
    if (hourlyChart && hourlyChart.data && hourlyChart.data.datasets?.[0] && !hourlyChart.data.labels.length) {
      for (let h = 0; h < 24; h++) {
        hourlyChart.data.labels.push(String(h).padStart(2, '0'));
        hourlyChart.data.datasets[0].data.push(40000 + Math.round(Math.random() * 10000));
      }
      hourlyChart.update();
    }

    // Forecast data init
    if (forecastChart && forecastChart.data && forecastChart.data.datasets?.[0] && !forecastChart.data.datasets[0].data.length) {
      for (let i = 1; i <= 24; i++) {
        const t = new Date(now.getTime() + i * 60 * 60 * 1000);
        forecastChart.data.datasets[0].data.push({ x: t, y: 45000 + Math.round(Math.random() * 5000) });
      }
      forecastChart.update();
    }

    // Daily table init
    if (!dailyPeakTbody.childElementCount) {
      const formatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' });
      for (let d = 6; d >= 0; d--) {
        const day = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
        const tr = document.createElement('tr');
        const tdDay = document.createElement('td');
        tdDay.className = 'px-4 py-2';
        tdDay.textContent = formatter.format(day);
        const tdVal = document.createElement('td');
        tdVal.className = 'px-4 py-2';
        tdVal.textContent = (40000 + Math.round(Math.random() * 10000)).toLocaleString('fa-IR');
        tr.appendChild(tdDay);
        tr.appendChild(tdVal);
        dailyPeakTbody.appendChild(tr);
      }
    }

    // Simple alert when load close to peak
    if (load > todayPeak.value * 0.95) {
      alertCard.classList.add('alert-active');
      alertMessage.textContent = 'احتمال هشدار';
    } else {
      alertCard.classList.remove('alert-active');
      alertMessage.textContent = '';
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopUpdates();
    } else {
      startUpdates();
    }
  });

  window.addEventListener('beforeunload', () => {
    stopUpdates();
  });

  // Initial KPI render
  updateData();

  if (!hasChart()) {
    console.warn('Chart.js not loaded; charts will be skipped.');
    document.querySelectorAll('canvas').forEach(c => {
      const wrap = c.parentElement;
      if (wrap) {
        wrap.innerHTML = '<div class="text-center text-slate-400 p-6">نمودار در دسترس نیست (Chart.js بارگذاری نشد)</div>';
      }
    });
    startUpdates();
    return;
  }

  // Lazy init charts
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && hasChart()) {
        initCharts();
        observer.disconnect();
      }
    });
  });
  observer.observe(dashboardEl);

  startUpdates();
})();
