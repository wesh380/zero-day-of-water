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

export default function WaterDashboard() {
  const [currentData, setCurrentData] = useState(null);
  const [previousData, setPreviousData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const chartRef = useRef(null);

  // دریافت داده‌ها
  const fetchData = async () => {
    try {
      setLoading(true);

      // شبیه‌سازی API call - در پروژه واقعی باید از API واقعی استفاده کنید
      const currentMonthData = await simulateAPICall('current');
      const previousMonthData = await simulateAPICall('previous');

      setCurrentData(currentMonthData);
      setPreviousData(previousMonthData);
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
        const baseConsumption = period === 'current' ? 100 : 95;
        const data = {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: `${i + 1}`,
            consumption: baseConsumption + Math.random() * 20 - 10,
            cost: (baseConsumption + Math.random() * 20 - 10) * 1500,
          })),
          summary: {
            totalConsumption: baseConsumption * 30,
            totalCost: baseConsumption * 30 * 1500,
            avgDaily: baseConsumption,
            peakDay: Math.floor(Math.random() * 30) + 1,
            categories: {
              domestic: 60,
              agriculture: 25,
              industry: 15,
            }
          }
        };
        resolve(data);
      }, 500);
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

    const worksheet = XLSX.utils.json_to_sheet(currentData.daily);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'مصرف آب');

    // اضافه کردن خلاصه
    const summaryData = [
      ['شاخص', 'مقدار'],
      ['کل مصرف (متر مکعب)', currentData.summary.totalConsumption],
      ['کل هزینه (تومان)', currentData.summary.totalCost],
      ['میانگین روزانه', currentData.summary.avgDaily],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'خلاصه');

    XLSX.writeFile(workbook, `گزارش_مصرف_آب_${new Date().toLocaleDateString('fa-IR')}.xlsx`);
  };

  // Export به PDF
  const exportToPDF = async () => {
    if (!currentData || !chartRef.current) return;

    // استفاده از jsPDF که قبلاً نصب شده
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');

    // افزودن متن (نیاز به فونت فارسی دارد)
    doc.text('گزارش مصرف آب', 105, 15, { align: 'center' });
    doc.text(`تاریخ: ${new Date().toLocaleDateString('fa-IR')}`, 105, 25, { align: 'center' });

    // افزودن نمودار به PDF
    const canvas = chartRef.current?.canvas;
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 15, 35, 180, 100);
    }

    // افزودن خلاصه
    let yPos = 145;
    doc.setFontSize(12);
    doc.text('خلاصه آمار:', 15, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`کل مصرف: ${currentData.summary.totalConsumption.toFixed(1)} متر مکعب`, 15, yPos);
    yPos += 7;
    doc.text(`کل هزینه: ${currentData.summary.totalCost.toLocaleString('fa-IR')} تومان`, 15, yPos);
    yPos += 7;
    doc.text(`میانگین روزانه: ${currentData.summary.avgDaily.toFixed(1)} متر مکعب`, 15, yPos);

    doc.save(`گزارش_مصرف_آب_${new Date().toLocaleDateString('fa-IR')}.pdf`);
  };

  if (loading && !currentData) {
    return (
      <>
        <Header title="داشبورد مصرف آب" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // تنظیمات نمودار خطی با انیمیشن
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
        text: 'مقایسه مصرف ماه جاری با ماه قبل',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'مصرف (متر مکعب)',
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
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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

  // نمودار دایره‌ای برای دسته‌بندی مصرف
  const doughnutChartData = currentData ? {
    labels: ['خانگی', 'کشاورزی', 'صنعتی'],
    datasets: [
      {
        data: [
          currentData.summary.categories.domestic,
          currentData.summary.categories.agriculture,
          currentData.summary.categories.industry,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 146, 60)',
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
        text: 'توزیع مصرف بر اساس بخش',
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
      <Header title="داشبورد مصرف آب" />
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">کل مصرف</h3>
              <p className="text-3xl font-bold text-blue-600">
                {currentData?.summary.totalConsumption.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-1">متر مکعب</p>
              <div className={`mt-2 text-sm ${consumptionChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {consumptionChange >= 0 ? '↑' : '↓'} {Math.abs(consumptionChange)}% نسبت به ماه قبل
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">کل هزینه</h3>
              <p className="text-3xl font-bold text-green-600">
                {currentData?.summary.totalCost.toLocaleString('fa-IR')}
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
              <p className="text-3xl font-bold text-purple-600">
                {currentData?.summary.avgDaily.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-1">متر مکعب در روز</p>
              <div className="mt-2 text-sm text-gray-600">
                پیک مصرف: روز {currentData?.summary.peakDay}
              </div>
            </div>
          </Card>
        </div>

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

          {/* جدول آمار */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">آمار تفصیلی</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold">مصرف خانگی</span>
                  <span className="text-blue-600 font-bold">
                    {currentData?.summary.categories.domestic}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-semibold">مصرف کشاورزی</span>
                  <span className="text-green-600 font-bold">
                    {currentData?.summary.categories.agriculture}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-semibold">مصرف صنعتی</span>
                  <span className="text-orange-600 font-bold">
                    {currentData?.summary.categories.industry}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* هشدارها و توصیه‌ها */}
        {consumptionChange > 10 && (
          <Card>
            <div className="p-6 bg-yellow-50 border-r-4 border-yellow-400">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ هشدار افزایش مصرف</h3>
              <p className="text-yellow-700">
                مصرف آب شما نسبت به ماه قبل {consumptionChange}% افزایش یافته است.
                لطفاً مصرف خود را بررسی و در صورت امکان کاهش دهید.
              </p>
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </>
  );
}
