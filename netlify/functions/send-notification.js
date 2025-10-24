/**
 * Netlify Function برای ارسال Notification (SMS/Email)
 */

const fetch = require('node-fetch');

// تنظیمات SMS (Kavenegar)
const KAVENEGAR_API_KEY = process.env.KAVENEGAR_API_KEY;
const KAVENEGAR_SENDER = process.env.KAVENEGAR_SENDER || '10008663';

// تنظیمات Email (می‌توانید از Resend، SendGrid یا سرویس ایرانی استفاده کنید)
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@wesh360.ir';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * ارسال SMS با Kavenegar
 */
async function sendSMS(phoneNumber, message) {
  if (!KAVENEGAR_API_KEY) {
    console.warn('KAVENEGAR_API_KEY not configured');
    return {
      success: false,
      error: 'SMS service not configured',
    };
  }

  try {
    // API Kavenegar
    const url = `https://api.kavenegar.com/v1/${KAVENEGAR_API_KEY}/sms/send.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        sender: KAVENEGAR_SENDER,
        receptor: phoneNumber,
        message: message,
      }),
    });

    const data = await response.json();

    if (data.return && data.return.status === 200) {
      return {
        success: true,
        messageId: data.entries[0].messageid,
      };
    }

    return {
      success: false,
      error: data.return?.message || 'SMS send failed',
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * ارسال Email
 */
async function sendEmail(to, subject, body) {
  if (!EMAIL_API_KEY) {
    console.warn('EMAIL_API_KEY not configured');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    // مثال با Resend API
    const url = 'https://api.resend.com/emails';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: body,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        emailId: data.id,
      };
    }

    return {
      success: false,
      error: data.message || 'Email send failed',
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * تولید محتوای پیام بر اساس نوع
 */
function generateNotificationContent(type, data) {
  const templates = {
    'peak-warning': {
      sms: `⚠️ هشدار پیک مصرف
مصرف ${data.utility} شما در حال افزایش است.
مقدار فعلی: ${data.current}
پیش‌بینی پیک: ${data.predicted}
لطفاً مصرف را کاهش دهید.`,
      email: {
        subject: '⚠️ هشدار پیک مصرف - Wesh360',
        body: `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Tahoma, Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .warning { background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .stats { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ هشدار پیک مصرف</h1>
    </div>
    <div class="content">
      <div class="warning">
        <h3>مصرف ${data.utility} شما در حال افزایش است!</h3>
      </div>

      <div class="stats">
        <h4>آمار فعلی:</h4>
        <ul>
          <li><strong>مقدار فعلی:</strong> ${data.current}</li>
          <li><strong>پیش‌بینی پیک:</strong> ${data.predicted}</li>
          <li><strong>افزایش:</strong> ${data.increase}%</li>
        </ul>
      </div>

      <h3>توصیه‌های کاهش مصرف:</h3>
      <ul>
        <li>در ساعات پیک (16-22) از مصرف بالا خودداری کنید</li>
        <li>دستگاه‌های پرمصرف را خاموش کنید</li>
        <li>از برنامه‌های زمان‌بندی شده استفاده کنید</li>
      </ul>

      <a href="https://wesh360.ir/dashboard" class="button">مشاهده داشبورد</a>
    </div>
    <div class="footer">
      <p>Wesh360 - سیستم مدیریت هوشمند آب و برق</p>
      <p>این ایمیل به صورت خودکار ارسال شده است</p>
    </div>
  </div>
</body>
</html>
        `,
      },
    },
    'monthly-report': {
      sms: `📊 گزارش ماهانه شما آماده است
مصرف آب: ${data.waterConsumption}
مصرف برق: ${data.electricityConsumption}
هزینه کل: ${data.totalCost} تومان
برای مشاهده جزئیات وارد سایت شوید.`,
      email: {
        subject: '📊 گزارش ماهانه مصرف - Wesh360',
        body: `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Tahoma, Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e5e7eb; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
    .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 گزارش ماهانه مصرف</h1>
      <p>${data.month}</p>
    </div>
    <div class="content">
      <h3>خلاصه مصرف شما:</h3>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${data.waterConsumption}</div>
          <div class="stat-label">مصرف آب (متر مکعب)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.electricityConsumption}</div>
          <div class="stat-label">مصرف برق (kWh)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.waterCost.toLocaleString('fa-IR')}</div>
          <div class="stat-label">هزینه آب (تومان)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.electricityCost.toLocaleString('fa-IR')}</div>
          <div class="stat-label">هزینه برق (تومان)</div>
        </div>
      </div>

      <h3>مقایسه با ماه قبل:</h3>
      <ul>
        <li>مصرف آب: ${data.waterChange > 0 ? '↑' : '↓'} ${Math.abs(data.waterChange)}%</li>
        <li>مصرف برق: ${data.electricityChange > 0 ? '↑' : '↓'} ${Math.abs(data.electricityChange)}%</li>
        <li>هزینه کل: ${data.costChange > 0 ? '↑' : '↓'} ${Math.abs(data.costChange)}%</li>
      </ul>

      <a href="https://wesh360.ir/reports" class="button">مشاهده گزارش کامل</a>
    </div>
    <div class="footer">
      <p>Wesh360 - سیستم مدیریت هوشمند آب و برق</p>
      <p>این ایمیل به صورت خودکار ارسال شده است</p>
    </div>
  </div>
</body>
</html>
        `,
      },
    },
    'system-alert': {
      sms: `🚨 هشدار سیستم
${data.message}
زمان: ${data.time}
وضعیت: ${data.status}`,
      email: {
        subject: '🚨 هشدار سیستم - Wesh360',
        body: `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Tahoma, Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .alert { background: #fee2e2; border-right: 4px solid #ef4444; padding: 15px; margin: 15px 0; }
    .button { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 هشدار سیستم</h1>
    </div>
    <div class="content">
      <div class="alert">
        <h3>${data.message}</h3>
        <p><strong>زمان:</strong> ${data.time}</p>
        <p><strong>وضعیت:</strong> ${data.status}</p>
      </div>

      <p>${data.description}</p>

      <a href="https://wesh360.ir/alerts" class="button">مشاهده جزئیات</a>
    </div>
    <div class="footer">
      <p>Wesh360 - سیستم مدیریت هوشمند آب و برق</p>
    </div>
  </div>
</body>
</html>
        `,
      },
    },
  };

  return templates[type] || templates['system-alert'];
}

/**
 * Handler اصلی
 */
exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { type, channel, recipient, data } = JSON.parse(event.body);

    // اعتبارسنجی ورودی
    if (!type || !channel || !recipient) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: type, channel, recipient',
        }),
      };
    }

    // تولید محتوا
    const content = generateNotificationContent(type, data || {});
    let result;

    // ارسال بر اساس کانال
    if (channel === 'sms') {
      result = await sendSMS(recipient, content.sms);
    } else if (channel === 'email') {
      result = await sendEmail(recipient, content.email.subject, content.email.body);
    } else if (channel === 'both') {
      const smsResult = await sendSMS(recipient.phone, content.sms);
      const emailResult = await sendEmail(recipient.email, content.email.subject, content.email.body);
      result = {
        success: smsResult.success || emailResult.success,
        sms: smsResult,
        email: emailResult,
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid channel. Use: sms, email, or both',
        }),
      };
    }

    // لاگ برای تحلیل
    console.log('Notification sent:', {
      type,
      channel,
      recipient,
      success: result.success,
    });

    return {
      statusCode: result.success ? 200 : 500,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Notification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
