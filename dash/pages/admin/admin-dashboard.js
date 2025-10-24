import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
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
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // day, week, month, year

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000); // 5 دقیقه
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);

    // شبیه‌سازی داده‌ها - در پروژه واقعی از API استفاده کنید
    const data = await simulateAdminData(timeRange);
    setKpis(data.kpis);
    setTrends(data.trends);
    setAlerts(data.alerts);

    setLoading(false);
  };

  const simulateAdminData = (range) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const baseMultiplier = range === 'year' ? 12 : range === 'month' ? 30 : range === 'week' ? 7 : 1;

        resolve({
          kpis: {
            totalUsers: 15420,
            activeUsers: 12834,
            waterConsumption: {
              total: 1250000 * baseMultiplier,
              change: -3.2,
              target: 1300000 * baseMultiplier,
            },
            electricityConsumption: {
              total: 3450000 * baseMultiplier,
              change: 2.5,
              target: 3200000 * baseMultiplier,
            },
            revenue: {
              total: 45000000000 * baseMultiplier,
              change: 5.8,
            },
            efficiency: {
              water: 87.5,
              electricity: 82.3,
              overall: 84.9,
            },
            customerSatisfaction: 4.2,
            systemUptime: 99.7,
          },
          trends: {
            labels: Array.from({ length: baseMultiplier }, (_, i) => `Day ${i + 1}`),
            waterConsumption: Array.from({ length: baseMultiplier }, () => 40000 + Math.random() * 10000),
            electricityConsumption: Array.from({ length: baseMultiplier }, () => 115000 + Math.random() * 20000),
            revenue: Array.from({ length: baseMultiplier }, () => 1500000000 + Math.random() * 300000000),
            newUsers: Array.from({ length: baseMultiplier }, () => Math.floor(50 + Math.random() * 100)),
          },
          alerts: [
            {
              id: 1,
              type: 'warning',
              title: 'افزایش مصرف برق در منطقه شمال',
              message: 'مصرف برق در منطقه شمال 15% افزایش یافته است',
              time: new Date(Date.now() - 30 * 60 * 1000),
              priority: 'high',
            },
            {
              id: 2,
              type: 'info',
              title: 'گزارش ماهانه آماده است',
              message: 'گزارش جامع ماهانه برای تاییدتان آماده شده است',
              time: new Date(Date.now() - 2 * 60 * 60 * 1000),
              priority: 'medium',
            },
            {
              id: 3,
              type: 'success',
              title: 'هدف کاهش مصرف آب محقق شد',
              message: 'هدف کاهش 5% مصرف آب در این ماه با موفقیت محقق شد',
              time: new Date(Date.now() - 5 * 60 * 60 * 1000),
              priority: 'low',
            },
          ],
        });
      }, 500);
    });
  };

  const exportExecutiveReport = () => {
    if (!kpis || !trends) return;

    const workbook = XLSX.utils.book_new();

    // صفحه KPI
    const kpiData = [
      ['شاخص کلیدی عملکرد (KPI)', 'مقدار', 'تغییر (%)', 'هدف'],
      ['تعداد کاربران', kpis.totalUsers, '-', '-'],
      ['کاربران فعال', kpis.activeUsers, '-', '-'],
      ['مصرف آب (متر مکعب)', kpis.waterConsumption.total.toFixed(0), kpis.waterConsumption.change, kpis.waterConsumption.target],
      ['مصرف برق (kWh)', kpis.electricityConsumption.total.toFixed(0), kpis.electricityConsumption.change, kpis.electricityConsumption.target],
      ['درآمد (تومان)', kpis.revenue.total.toLocaleString('fa-IR'), kpis.revenue.change, '-'],
      ['راندمان آب (%)', kpis.efficiency.water, '-', '90'],
      ['راندمان برق (%)', kpis.efficiency.electricity, '-', '85'],
      ['راندمان کلی (%)', kpis.efficiency.overall, '-', '88'],
      ['رضایت مشتری', kpis.customerSatisfaction, '-', '4.5'],
      ['آپتایم سیستم (%)', kpis.systemUptime, '-', '99.9'],
    ];

    const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs');

    // صفحه روند
    const trendData = [
      ['روز', 'مصرف آب', 'مصرف برق', 'درآمد', 'کاربران جدید'],
      ...trends.labels.map((label, i) => [
        label,
        trends.waterConsumption[i].toFixed(0),
        trends.electricityConsumption[i].toFixed(0),
        trends.revenue[i].toFixed(0),
        trends.newUsers[i],
      ]),
    ];

    const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
    XLSX.utils.book_append_sheet(workbook, trendSheet, 'روند');

    // صفحه هشدارها
    const alertData = [
      ['نوع', 'عنوان', 'پیام', 'اولویت', 'زمان'],
      ...alerts.map(alert => [
        alert.type,
        alert.title,
        alert.message,
        alert.priority,
        alert.time.toLocaleString('fa-IR'),
      ]),
    ];

    const alertSheet = XLSX.utils.aoa_to_sheet(alertData);
    XLSX.utils.book_append_sheet(workbook, alertSheet, 'هشدارها');

    XLSX.writeFile(workbook, `گزارش_مدیریتی_${new Date().toLocaleDateString('fa-IR')}.xlsx`);
  };

  if (loading && !kpis) {
    return (
      <>
        <Header title="داشبورد مدیریتی" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // نمودارها
  const consumptionChartData = {
    labels: trends?.labels || [],
    datasets: [
      {
        label: 'مصرف آب (متر مکعب)',
        data: trends?.waterConsumption || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'مصرف برق (kWh)',
        data: trends?.electricityConsumption || [],
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        yAxisID: 'y1',
      },
    ],
  };

  const consumptionChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'آب (متر مکعب)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'برق (kWh)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const efficiencyRadarData = {
    labels: ['راندمان آب', 'راندمان برق', 'راندمان کلی', 'رضایت مشتری', 'آپتایم سیستم'],
    datasets: [
      {
        label: 'عملکرد فعلی',
        data: [
          kpis?.efficiency.water || 0,
          kpis?.efficiency.electricity || 0,
          kpis?.efficiency.overall || 0,
          (kpis?.customerSatisfaction || 0) * 20, // تبدیل به 100
          kpis?.systemUptime || 0,
        ],
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgb(102, 126, 234)',
        pointBackgroundColor: 'rgb(102, 126, 234)',
      },
      {
        label: 'هدف',
        data: [90, 85, 88, 90, 99.9],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        pointBackgroundColor: 'rgb(34, 197, 94)',
      },
    ],
  };

  const revenueBarData = {
    labels: trends?.labels?.slice(-7) || [],
    datasets: [
      {
        label: 'درآمد (میلیون تومان)',
        data: trends?.revenue?.slice(-7).map(v => v / 1000000) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  return (
    <>
      <Header title="داشبورد مدیریتی" />
      <main className="container mx-auto px-4 py-8" dir="rtl">
        {/* هدر با فیلتر زمانی */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">داشبورد مدیریتی</h1>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="day">امروز</option>
              <option value="week">این هفته</option>
              <option value="month">این ماه</option>
              <option value="year">امسال</option>
            </select>
            <button
              onClick={exportExecutiveReport}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              خروجی گزارش مدیریتی
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* کاربران */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">کاربران فعال</h3>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {kpis?.activeUsers.toLocaleString('fa-IR')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                از {kpis?.totalUsers.toLocaleString('fa-IR')} کل کاربر
              </p>
              <div className="mt-2 text-sm text-gray-600">
                نرخ فعالیت: {((kpis?.activeUsers / kpis?.totalUsers) * 100).toFixed(1)}%
              </div>
            </div>
          </Card>

          {/* مصرف آب */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">مصرف آب</h3>
                <span className="text-2xl">💧</span>
              </div>
              <p className="text-3xl font-bold text-blue-500">
                {(kpis?.waterConsumption.total / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-500 mt-1">متر مکعب</p>
              <div className={`mt-2 text-sm flex items-center gap-1 ${
                kpis?.waterConsumption.change < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpis?.waterConsumption.change < 0 ? '↓' : '↑'}
                {Math.abs(kpis?.waterConsumption.change)}% نسبت به دوره قبل
              </div>
            </div>
          </Card>

          {/* مصرف برق */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">مصرف برق</h3>
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-3xl font-bold text-yellow-500">
                {(kpis?.electricityConsumption.total / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-500 mt-1">کیلووات ساعت</p>
              <div className={`mt-2 text-sm flex items-center gap-1 ${
                kpis?.electricityConsumption.change > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {kpis?.electricityConsumption.change > 0 ? '↑' : '↓'}
                {Math.abs(kpis?.electricityConsumption.change)}% نسبت به دوره قبل
              </div>
            </div>
          </Card>

          {/* درآمد */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">درآمد</h3>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-green-500">
                {(kpis?.revenue.total / 1000000000).toFixed(1)}B
              </p>
              <p className="text-sm text-gray-500 mt-1">میلیارد تومان</p>
              <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                ↑ {kpis?.revenue.change}% نسبت به دوره قبل
              </div>
            </div>
          </Card>
        </div>

        {/* هشدارها و اعلان‌ها */}
        <Card>
          <div className="p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">🔔 هشدارها و اعلان‌های مهم</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-400'
                      : alert.type === 'info'
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-green-50 border-green-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {alert.time.toLocaleTimeString('fa-IR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* نمودارها */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* نمودار مصرف */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">روند مصرف</h3>
              <Line data={consumptionChartData} options={consumptionChartOptions} />
            </div>
          </Card>

          {/* نمودار راداری عملکرد */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">شاخص‌های عملکرد</h3>
              <Radar data={efficiencyRadarData} />
            </div>
          </Card>
        </div>

        {/* نمودار درآمد */}
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">روند درآمد (7 روز اخیر)</h3>
            <Bar data={revenueBarData} />
          </div>
        </Card>

        {/* آمار تفصیلی */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <div className="p-6">
              <h4 className="font-semibold text-gray-700 mb-3">راندمان سیستم</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>آب:</span>
                  <span className="font-bold text-blue-600">{kpis?.efficiency.water}%</span>
                </div>
                <div className="flex justify-between">
                  <span>برق:</span>
                  <span className="font-bold text-yellow-600">{kpis?.efficiency.electricity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>کلی:</span>
                  <span className="font-bold text-purple-600">{kpis?.efficiency.overall}%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h4 className="font-semibold text-gray-700 mb-3">رضایت مشتری</h4>
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600">{kpis?.customerSatisfaction}</p>
                <p className="text-sm text-gray-500 mt-2">از 5</p>
                <div className="mt-3 flex justify-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < Math.floor(kpis?.customerSatisfaction) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h4 className="font-semibold text-gray-700 mb-3">آپتایم سیستم</h4>
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600">{kpis?.systemUptime}%</p>
                <p className="text-sm text-gray-500 mt-2">قابلیت اطمینان</p>
                <div className="mt-3 text-xs text-green-700">
                  ✓ سیستم عملیاتی و پایدار
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
