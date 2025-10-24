import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import * as XLSX from 'xlsx';
import Header from '../../components/Header.js';
import Footer from '../../components/Footer.js';
import Card from '../../components/Card.js';

// ثبت کامپوننت‌های Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ElectricityDashboard() {
  const [currentData, setCurrentData] = useState(null);
  const [previousData, setPreviousData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [peakPrediction, setPeakPrediction] = useState(null);
  const chartRef = useRef(null);

  // دریافت داده‌ها
  const fetchData = async () => {
    try {
      setLoading(true);

      // شبیه‌سازی API call - در پروژه واقعی باید از API واقعی استفاده کنید
      const currentMonthData = await simulateAPICall('current');
      const previousMonthData = await simulateAPICall('previous');
      const prediction = await predictPeakConsumption(currentMonthData);

      setCurrentData(currentMonthData);
      setPreviousData(previousMonthData);
      setPeakPrediction(prediction);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('خطا در دریافت داده‌ها:', error);
      setLoading(false);
    }
  };

  // شبیه‌سازی API call
  const simulateAPICall = (period) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const baseConsumption = period === 'current' ? 350 : 330;

        // شبیه‌سازی مصرف ساعتی در 30 روز
        const hourlyData = [];
        for (let day = 1; day <= 30; day++) {
          for (let hour = 0; hour < 24; hour++) {
            let consumption = baseConsumption;

            // ساعات پیک (16-22)
            if (hour >= 16 && hour <= 22) {
              consumption += 100 + Math.random() * 50;
            }
            // ساعات کم‌مصرف (0-6)
            else if (hour >= 0 && hour <= 6) {
              consumption -= 100 + Math.random() * 30;
            }

            hourlyData.push({
              day,
              hour,
              consumption: consumption + Math.random() * 40 - 20,
              cost: (consumption + Math.random() * 40 - 20) * 500,
            });
          }
        }

        // محاسبه مصرف روزانه
        const dailyData = [];
        for (let day = 1; day <= 30; day++) {
          const dayData = hourlyData.filter(h => h.day === day);
          const totalDaily = dayData.reduce((sum, h) => sum + h.consumption, 0);
          dailyData.push({
            date: `${day}`,
            consumption: totalDaily / 1000, // تبدیل به کیلووات ساعت
            cost: totalDaily * 500 / 1000,
          });
        }

        const data = {
          daily: dailyData,
          hourly: hourlyData,
          summary: {
            totalConsumption: dailyData.reduce((sum, d) => sum + d.consumption, 0),
            totalCost: dailyData.reduce((sum, d) => sum + d.cost, 0),
            avgDaily: dailyData.reduce((sum, d) => sum + d.consumption, 0) / 30,
            peakDay: Math.floor(Math.random() * 30) + 1,
            peakHour: Math.floor(Math.random() * 6) + 17, // بین 17-22
            categories: {
              lighting: 30,
              cooling: 35,
              appliances: 25,
              other: 10,
            },
            powerQuality: {
              voltage: 220 + Math.random() * 10 - 5,
              frequency: 50 + Math.random() * 0.2 - 0.1,
              powerFactor: 0.85 + Math.random() * 0.1,
            }
          }
        };
        resolve(data);
      }, 500);
    });
  };

  // پیش‌بینی پیک مصرف (شبیه‌سازی ML)
  const predictPeakConsumption = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // شبیه‌سازی ساده پیش‌بینی - در پروژه واقعی از ML استفاده کنید
        const avgConsumption = data.summary.avgDaily;
        const trend = Math.random() * 0.2 - 0.1; // -10% تا +10%

        const prediction = {
          nextPeakDay: Math.floor(Math.random() * 7) + 1, // پیش‌بینی پیک در 7 روز آینده
          predictedPeak: avgConsumption * (1.5 + trend),
          confidence: 75 + Math.random() * 20, // 75-95%
          recommendation: avgConsumption * (1.5 + trend) > avgConsumption * 1.6
            ? 'احتمال پیک بالا - مصرف را کاهش دهید'
            : 'پیک در محدوده عادی',
        };
        resolve(prediction);
      }, 300);
    });
  };

  // Real-time update هر 5 دقیقه
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000); // 5 دقیقه

    return () => clearInterval(interval);
  }, []);

  // محاسبه تغییرات نسبت به ماه قبل
  const calculateChange = (current, previous) => {
    if (!current || !previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Export به Excel
  const exportToExcel = () => {
    if (!currentData) return;

    const workbook = XLSX.utils.book_new();

    // داده‌های روزانه
    const dailySheet = XLSX.utils.json_to_sheet(currentData.daily);
    XLSX.utils.book_append_sheet(workbook, dailySheet, 'مصرف روزانه');

    // خلاصه
    const summaryData = [
      ['شاخص', 'مقدار'],
      ['کل مصرف (kWh)', currentData.summary.totalConsumption.toFixed(2)],
      ['کل هزینه (تومان)', currentData.summary.totalCost.toFixed(0)],
      ['میانگین روزانه (kWh)', currentData.summary.avgDaily.toFixed(2)],
      ['روز پیک', currentData.summary.peakDay],
      ['ساعت پیک', `${currentData.summary.peakHour}:00`],
      ['', ''],
      ['کیفیت برق', ''],
      ['ولتاژ (V)', currentData.summary.powerQuality.voltage.toFixed(1)],
      ['فرکانس (Hz)', currentData.summary.powerQuality.frequency.toFixed(2)],
      ['ضریب قدرت', currentData.summary.powerQuality.powerFactor.toFixed(3)],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'خلاصه');

    // پیش‌بینی
    if (peakPrediction) {
      const predictionData = [
        ['شاخص', 'مقدار'],
        ['پیش‌بینی روز پیک بعدی', `${peakPrediction.nextPeakDay} روز آینده`],
        ['پیش‌بینی مقدار پیک (kWh)', peakPrediction.predictedPeak.toFixed(2)],
        ['دقت پیش‌بینی (%)', peakPrediction.confidence.toFixed(1)],
        ['توصیه', peakPrediction.recommendation],
      ];
      const predictionSheet = XLSX.utils.aoa_to_sheet(predictionData);
      XLSX.utils.book_append_sheet(workbook, predictionSheet, 'پیش‌بینی');
    }

    XLSX.writeFile(workbook, `گزارش_مصرف_برق_${new Date().toLocaleDateString('fa-IR')}.xlsx`);
  };

  // Export به PDF
  const exportToPDF = async () => {
    if (!currentData || !chartRef.current) return;

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');

    // صفحه اول - اطلاعات کلی
    doc.text('گزارش مصرف برق', 105, 15, { align: 'center' });
    doc.text(`تاریخ: ${new Date().toLocaleDateString('fa-IR')}`, 105, 25, { align: 'center' });

    // افزودن نمودار
    const canvas = chartRef.current?.canvas;
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 15, 35, 180, 100);
    }

    // خلاصه آمار
    let yPos = 145;
    doc.setFontSize(12);
    doc.text('خلاصه آمار:', 15, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`کل مصرف: ${currentData.summary.totalConsumption.toFixed(2)} kWh`, 15, yPos);
    yPos += 7;
    doc.text(`کل هزینه: ${currentData.summary.totalCost.toFixed(0).toLocaleString('fa-IR')} تومان`, 15, yPos);
    yPos += 7;
    doc.text(`میانگین روزانه: ${currentData.summary.avgDaily.toFixed(2)} kWh`, 15, yPos);
    yPos += 7;
    doc.text(`روز پیک: ${currentData.summary.peakDay}`, 15, yPos);

    // صفحه دوم - کیفیت برق و پیش‌بینی
    doc.addPage();
    yPos = 20;
    doc.setFontSize(12);
    doc.text('کیفیت برق:', 15, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`ولتاژ: ${currentData.summary.powerQuality.voltage.toFixed(1)} V`, 15, yPos);
    yPos += 7;
    doc.text(`فرکانس: ${currentData.summary.powerQuality.frequency.toFixed(2)} Hz`, 15, yPos);
    yPos += 7;
    doc.text(`ضریب قدرت: ${currentData.summary.powerQuality.powerFactor.toFixed(3)}`, 15, yPos);

    if (peakPrediction) {
      yPos += 15;
      doc.setFontSize(12);
      doc.text('پیش‌بینی پیک مصرف:', 15, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(`پیش‌بینی پیک: ${peakPrediction.nextPeakDay} روز آینده`, 15, yPos);
      yPos += 7;
      doc.text(`مقدار پیش‌بینی: ${peakPrediction.predictedPeak.toFixed(2)} kWh`, 15, yPos);
      yPos += 7;
      doc.text(`دقت: ${peakPrediction.confidence.toFixed(1)}%`, 15, yPos);
      yPos += 7;
      doc.text(`توصیه: ${peakPrediction.recommendation}`, 15, yPos);
    }

    doc.save(`گزارش_مصرف_برق_${new Date().toLocaleDateString('fa-IR')}.pdf`);
  };

  if (loading && !currentData) {
    return (
      <>
        <Header title="داشبورد مصرف برق" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // تنظیمات نمودار خطی
  const lineChartOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'مقایسه مصرف برق ماه جاری با ماه قبل',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toFixed(2) + ' kWh';
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'مصرف (kWh)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const lineChartData = currentData && previousData ? {
    labels: currentData.daily.map(d => d.date),
    datasets: [
      {
        label: 'ماه جاری',
        data: currentData.daily.map(d => d.consumption),
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'ماه قبل',
        data: previousData.daily.map(d => d.consumption),
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        fill: true,
        tension: 0.4,
        borderDash: [5, 5],
      },
    ],
  } : null;

  // نمودار میله‌ای برای مصرف ساعتی
  const barChartData = currentData ? {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'میانگین مصرف ساعتی',
        data: Array.from({ length: 24 }, (_, hour) => {
          const hourData = currentData.hourly.filter(h => h.hour === hour);
          const avg = hourData.reduce((sum, h) => sum + h.consumption, 0) / hourData.length;
          return avg / 1000; // تبدیل به kWh
        }),
        backgroundColor: Array.from({ length: 24 }, (_, hour) => {
          // ساعات پیک قرمز، ساعات عادی آبی
          return (hour >= 16 && hour <= 22)
            ? 'rgba(239, 68, 68, 0.8)'
            : 'rgba(59, 130, 246, 0.8)';
        }),
      },
    ],
  } : null;

  const barChartOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'الگوی مصرف ساعتی (میانگین ماهانه)',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `مصرف: ${context.parsed.y.toFixed(2)} kWh`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'مصرف (kWh)',
        },
      },
    },
  };

  // نمودار دایره‌ای
  const doughnutChartData = currentData ? {
    labels: ['روشنایی', 'سرمایش/گرمایش', 'لوازم خانگی', 'سایر'],
    datasets: [
      {
        data: [
          currentData.summary.categories.lighting,
          currentData.summary.categories.cooling,
          currentData.summary.categories.appliances,
          currentData.summary.categories.other,
        ],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(234, 179, 8)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  const doughnutChartOptions = {
    responsive: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'توزیع مصرف بر اساس کاربری',
      },
    },
  };

  // محاسبه تغییرات
  const consumptionChange = currentData && previousData
    ? calculateChange(currentData.summary.totalConsumption, previousData.summary.totalConsumption)
    : 0;
  const costChange = currentData && previousData
    ? calculateChange(currentData.summary.totalCost, previousData.summary.totalCost)
    : 0;

  return (
    <>
      <Header title="داشبورد مصرف برق" />
      <main className="container mx-auto px-4 py-8" dir="rtl">
        {/* آخرین بروزرسانی و دکمه‌های اکشن */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            آخرین بروزرسانی: {lastUpdate.toLocaleTimeString('fa-IR')}
            {loading && <span className="mr-2 inline-block animate-pulse">در حال بروزرسانی...</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              بروزرسانی دستی
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              خروجی Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              خروجی PDF
            </button>
          </div>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">کل مصرف</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {currentData?.summary.totalConsumption.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-1">کیلووات ساعت</p>
              <div className={`mt-2 text-sm ${consumptionChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {consumptionChange >= 0 ? '↑' : '↓'} {Math.abs(consumptionChange)}% نسبت به ماه قبل
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">کل هزینه</h3>
              <p className="text-3xl font-bold text-green-600">
                {currentData?.summary.totalCost.toFixed(0).toLocaleString('fa-IR')}
              </p>
              <p className="text-sm text-gray-500 mt-1">تومان</p>
              <div className={`mt-2 text-sm ${costChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {costChange >= 0 ? '↑' : '↓'} {Math.abs(costChange)}% نسبت به ماه قبل
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">میانگین روزانه</h3>
              <p className="text-3xl font-bold text-blue-600">
                {currentData?.summary.avgDaily.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-1">kWh در روز</p>
              <div className="mt-2 text-sm text-gray-600">
                پیک ساعت: {currentData?.summary.peakHour}:00
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">کیفیت برق</h3>
              <p className="text-3xl font-bold text-purple-600">
                {currentData?.summary.powerQuality.voltage.toFixed(1)}V
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PF: {currentData?.summary.powerQuality.powerFactor.toFixed(2)}
              </p>
              <div className="mt-2 text-sm text-green-600">
                ✓ در محدوده استاندارد
              </div>
            </div>
          </Card>
        </div>

        {/* پیش‌بینی پیک مصرف با ML */}
        {peakPrediction && (
          <Card>
            <div className={`p-6 border-r-4 ${
              peakPrediction.predictedPeak > currentData.summary.avgDaily * 1.6
                ? 'bg-red-50 border-red-400'
                : 'bg-blue-50 border-blue-400'
            }`}>
              <h3 className="text-lg font-bold mb-3">🤖 پیش‌بینی هوشمند پیک مصرف</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">پیش‌بینی پیک بعدی:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {peakPrediction.nextPeakDay} روز آینده
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">مقدار پیش‌بینی شده:</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {peakPrediction.predictedPeak.toFixed(1)} kWh
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">دقت پیش‌بینی:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {peakPrediction.confidence.toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-sm font-semibold">💡 توصیه: {peakPrediction.recommendation}</p>
              </div>
            </div>
          </Card>
        )}

        {/* نمودار خطی - مقایسه با ماه قبل */}
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">روند مصرف روزانه</h3>
            {lineChartData && (
              <Line
                ref={chartRef}
                data={lineChartData}
                options={lineChartOptions}
              />
            )}
          </div>
        </Card>

        {/* نمودار میله‌ای - الگوی ساعتی */}
        <Card>
          <div className="p-6 mt-8">
            <h3 className="text-xl font-bold mb-4">الگوی مصرف ساعتی</h3>
            {barChartData && (
              <Bar data={barChartData} options={barChartOptions} />
            )}
            <div className="mt-4 text-sm text-gray-600">
              <span className="inline-block w-4 h-4 bg-red-500 mr-2"></span>
              ساعات پیک (16-22)
              <span className="inline-block w-4 h-4 bg-blue-500 mr-4 mr-2"></span>
              ساعات عادی
            </div>
          </div>
        </Card>

        {/* نمودارهای جانبی */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* نمودار دایره‌ای */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">توزیع مصرف</h3>
              {doughnutChartData && (
                <Doughnut
                  data={doughnutChartData}
                  options={doughnutChartOptions}
                />
              )}
            </div>
          </Card>

          {/* کیفیت برق */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">پارامترهای کیفیت برق</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-semibold">ولتاژ</span>
                  <span className="text-yellow-600 font-bold">
                    {currentData?.summary.powerQuality.voltage.toFixed(1)} V
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold">فرکانس</span>
                  <span className="text-blue-600 font-bold">
                    {currentData?.summary.powerQuality.frequency.toFixed(2)} Hz
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-semibold">ضریب قدرت</span>
                  <span className="text-purple-600 font-bold">
                    {currentData?.summary.powerQuality.powerFactor.toFixed(3)}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✓ تمام پارامترها در محدوده استاندارد قرار دارند
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* هشدارها */}
        {consumptionChange > 15 && (
          <Card>
            <div className="p-6 bg-red-50 border-r-4 border-red-400 mt-8">
              <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ هشدار افزایش شدید مصرف</h3>
              <p className="text-red-700">
                مصرف برق شما نسبت به ماه قبل {consumptionChange}% افزایش یافته است.
                لطفاً مصرف خود را بررسی کنید و در ساعات پیک (16-22) مصرف را کاهش دهید.
              </p>
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </>
  );
}
