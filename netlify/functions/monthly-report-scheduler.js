/**
 * Netlify Scheduled Function برای گزارش‌های خودکار ماهانه
 * این function هر ماه روز اول ساعت 9 صبح اجرا می‌شود
 */

const { schedule } = require('@netlify/functions');
const fetch = require('node-fetch');

/**
 * دریافت لیست کاربران
 */
async function getActiveUsers() {
  // در پروژه واقعی از دیتابیس استفاده کنید
  // این فقط یک شبیه‌سازی است
  return [
    {
      id: 'u001',
      name: 'علی احمدی',
      email: 'ali@example.com',
      phone: '09123456789',
      preferences: {
        notifications: {
          email: true,
          sms: true,
        },
      },
    },
    // سایر کاربران...
  ];
}

/**
 * دریافت داده‌های مصرف کاربر
 */
async function getUserConsumptionData(userId) {
  // شبیه‌سازی داده‌ها - در پروژه واقعی از API استفاده کنید
  return {
    userId,
    month: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' }),
    waterConsumption: 150 + Math.random() * 50,
    electricityConsumption: 350 + Math.random() * 100,
    waterCost: 225000 + Math.random() * 50000,
    electricityCost: 525000 + Math.random() * 100000,
    waterChange: (Math.random() - 0.5) * 20, // -10% to +10%
    electricityChange: (Math.random() - 0.5) * 20,
    costChange: (Math.random() - 0.5) * 20,
  };
}

/**
 * ارسال گزارش به کاربر
 */
async function sendReportToUser(user, consumptionData) {
  // ارسال از طریق notification function
  const notificationUrl = `${process.env.URL || 'http://localhost:8888'}/.netlify/functions/send-notification`;

  const payload = {
    type: 'monthly-report',
    channel: 'both', // ارسال هم SMS هم Email
    recipient: {
      email: user.email,
      phone: user.phone,
    },
    data: {
      ...consumptionData,
      userName: user.name,
    },
  };

  try {
    const response = await fetch(notificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Failed to send report to user ${user.id}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * تولید و ذخیره گزارش PDF
 */
async function generateMonthlyPDFReport(consumptionData) {
  // در پروژه واقعی از jsPDF یا Puppeteer استفاده کنید
  // این فقط یک placeholder است
  console.log('Generating PDF report for:', consumptionData.userId);

  return {
    success: true,
    fileName: `report_${consumptionData.userId}_${Date.now()}.pdf`,
    url: `/reports/monthly/${consumptionData.userId}`,
  };
}

/**
 * ارسال گزارش مدیریتی
 */
async function sendExecutiveSummary(allUsersData) {
  const summary = {
    totalUsers: allUsersData.length,
    totalWaterConsumption: allUsersData.reduce((sum, d) => sum + d.waterConsumption, 0),
    totalElectricityConsumption: allUsersData.reduce((sum, d) => sum + d.electricityConsumption, 0),
    totalRevenue: allUsersData.reduce((sum, d) => sum + d.waterCost + d.electricityCost, 0),
    avgWaterConsumption: allUsersData.reduce((sum, d) => sum + d.waterConsumption, 0) / allUsersData.length,
    avgElectricityConsumption: allUsersData.reduce((sum, d) => sum + d.electricityConsumption, 0) / allUsersData.length,
  };

  // ارسال به مدیران
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

  if (adminEmails.length === 0) {
    console.log('No admin emails configured');
    return;
  }

  const executiveEmailBody = `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Tahoma, Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e5e7eb; }
    .stat-value { font-size: 36px; font-weight: bold; color: #667eea; margin: 10px 0; }
    .stat-label { font-size: 14px; color: #6b7280; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 گزارش مدیریتی ماهانه</h1>
      <p>${new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })}</p>
    </div>
    <div class="content">
      <h2>خلاصه عملکرد سیستم</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">تعداد کاربران</div>
          <div class="stat-value">${summary.totalUsers.toLocaleString('fa-IR')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">کل مصرف آب (m³)</div>
          <div class="stat-value">${summary.totalWaterConsumption.toFixed(0).toLocaleString('fa-IR')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">کل مصرف برق (kWh)</div>
          <div class="stat-value">${summary.totalElectricityConsumption.toFixed(0).toLocaleString('fa-IR')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">کل درآمد (تومان)</div>
          <div class="stat-value">${(summary.totalRevenue / 1000000).toFixed(1)}M</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">میانگین مصرف آب</div>
          <div class="stat-value">${summary.avgWaterConsumption.toFixed(1)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">میانگین مصرف برق</div>
          <div class="stat-value">${summary.avgElectricityConsumption.toFixed(1)}</div>
        </div>
      </div>

      <h3>اقدامات پیشنهادی:</h3>
      <ul>
        <li>بررسی کاربران با مصرف بالا</li>
        <li>ارسال پیام‌های آموزشی برای کاهش مصرف</li>
        <li>بهینه‌سازی تعرفه‌ها</li>
        <li>نگهداری پیشگیرانه تجهیزات</li>
      </ul>

      <p>برای مشاهده گزارش کامل وارد پنل مدیریت شوید.</p>
    </div>
    <div class="footer">
      <p>Wesh360 - سیستم مدیریت هوشمند آب و برق</p>
      <p>این ایمیل به صورت خودکار در پایان هر ماه ارسال می‌شود</p>
    </div>
  </div>
</body>
</html>
  `;

  // ارسال به تمام مدیران
  const notificationUrl = `${process.env.URL || 'http://localhost:8888'}/.netlify/functions/send-notification`;

  const promises = adminEmails.map(async (email) => {
    try {
      const response = await fetch(notificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'system-alert',
          channel: 'email',
          recipient: email.trim(),
          data: {
            message: 'گزارش مدیریتی ماهانه',
            time: new Date().toLocaleString('fa-IR'),
            status: 'آماده',
            description: 'گزارش جامع ماهانه سیستم آماده مشاهده است.',
          },
        }),
      });

      return await response.json();
    } catch (error) {
      console.error(`Failed to send executive summary to ${email}:`, error);
      return { success: false, error: error.message };
    }
  });

  const results = await Promise.all(promises);
  return results;
}

/**
 * تابع اصلی
 */
const handler = async (event) => {
  console.log('Starting monthly report generation...');
  console.log('Scheduled event:', event);

  try {
    // دریافت کاربران فعال
    const users = await getActiveUsers();
    console.log(`Processing ${users.length} users`);

    const results = {
      success: [],
      failed: [],
      allData: [],
    };

    // پردازش هر کاربر
    for (const user of users) {
      try {
        // دریافت داده‌های مصرف
        const consumptionData = await getUserConsumptionData(user.id);
        results.allData.push(consumptionData);

        // تولید PDF
        const pdfReport = await generateMonthlyPDFReport(consumptionData);

        // ارسال نوتیفیکیشن
        if (user.preferences.notifications.email || user.preferences.notifications.sms) {
          const notificationResult = await sendReportToUser(user, consumptionData);

          if (notificationResult.success) {
            results.success.push({
              userId: user.id,
              name: user.name,
              pdfReport,
            });
          } else {
            results.failed.push({
              userId: user.id,
              name: user.name,
              error: notificationResult.error,
            });
          }
        }

        // تاخیر کوچک برای جلوگیری از rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        results.failed.push({
          userId: user.id,
          name: user.name,
          error: error.message,
        });
      }
    }

    // ارسال گزارش مدیریتی
    await sendExecutiveSummary(results.allData);

    console.log('Monthly report generation completed');
    console.log(`Success: ${results.success.length}, Failed: ${results.failed.length}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Monthly reports generated successfully',
        stats: {
          total: users.length,
          success: results.success.length,
          failed: results.failed.length,
        },
        results,
      }),
    };
  } catch (error) {
    console.error('Monthly report generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate monthly reports',
        message: error.message,
      }),
    };
  }
};

// Schedule: اول هر ماه ساعت 9 صبح (UTC+3:30 = 05:30 UTC)
// Cron format: minute hour day month dayOfWeek
// 30 5 1 * * = اول هر ماه ساعت 5:30 صبح UTC (9 صبح ایران)
exports.handler = schedule('30 5 1 * *', handler);

// Export handler برای تست دستی
exports.manualHandler = handler;
