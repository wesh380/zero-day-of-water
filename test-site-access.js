#!/usr/bin/env node

// Test accessing wesh360.ir with User-Agent
const https = require('https');

const options = {
  hostname: 'wesh360.ir',
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fa,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
};

const req = https.request(options, (res) => {
  console.log('✅ درخواست موفقیت‌آمیز!');
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('\nHeaders:');
  console.log(JSON.stringify(res.headers, null, 2));

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📄 اندازه محتوا:', data.length, 'bytes');

    // Extract title
    const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      console.log('📌 عنوان صفحه:', titleMatch[1]);
    }

    // Count some elements
    const linkCount = (data.match(/<a[^>]*>/gi) || []).length;
    const scriptCount = (data.match(/<script[^>]*>/gi) || []).length;
    const imgCount = (data.match(/<img[^>]*>/gi) || []).length;

    console.log('\n📊 آمار صفحه:');
    console.log('  - تعداد لینک‌ها:', linkCount);
    console.log('  - تعداد اسکریپت‌ها:', scriptCount);
    console.log('  - تعداد تصاویر:', imgCount);

    // Look for main sections
    const h1Match = data.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      console.log('\n🎯 عنوان اصلی:', h1Match[1]);
    }

    // Show first 500 chars of body
    const bodyMatch = data.match(/<body[^>]*>([\s\S]{0,500})/i);
    if (bodyMatch) {
      console.log('\n📝 نمونه محتوای بدنه (500 کاراکتر اول):');
      console.log(bodyMatch[1].substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ خطا:', error.message);
  process.exit(1);
});

req.setTimeout(10000, () => {
  console.error('❌ Timeout');
  req.destroy();
  process.exit(1);
});

req.end();
