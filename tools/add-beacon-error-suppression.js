#!/usr/bin/env node
/**
 * Add Beacon Error Suppression to HTML files
 *
 * این اسکریپت به فایل‌های HTML که اسکریپت Cloudflare دارند اما global-footer.js ندارند،
 * یک inline script برای suppress کردن خطاهای beacon اضافه می‌کند.
 */

const fs = require('fs');
const path = require('path');

// اسکریپت inline که باید اضافه شود
const SUPPRESSION_SCRIPT = `  <script>
    /* Suppress Cloudflare Beacon Errors */
    window.addEventListener('error',function(e){if(e.target&&e.target.src&&(e.target.src.includes('cloudflareinsights.com')||e.target.src.includes('beacon.min.js'))){e.preventDefault();e.stopPropagation();return false;}},true);
  </script>`;

// فایل‌هایی که باید بررسی شوند (بدون global-footer.js اما با cloudflareinsights)
const FILES_TO_UPDATE = [
  'docs/amaayesh/index.html',
  'docs/contact/thanks.html',
  'docs/legal/wesh-telegram-gpt-privacy.html',
  'docs/research/thanks.html',
  'docs/responsible-disclosure/index.html',
  'docs/responsible-disclosure/thanks.html',
  'docs/solar/plant/index.html',
  'docs/water/cld/index.html'
];

function addSuppressionScript(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // بررسی اینکه آیا اسکریپت Cloudflare در فایل هست
  if (!content.includes('cloudflareinsights.com')) {
    console.log(`ℹ️  Skipping ${filePath} - no Cloudflare script found`);
    return false;
  }

  // بررسی اینکه آیا global-footer.js در فایل هست
  if (content.includes('global-footer.js')) {
    console.log(`ℹ️  Skipping ${filePath} - already has global-footer.js`);
    return false;
  }

  // بررسی اینکه آیا قبلاً اسکریپت suppression اضافه شده
  if (content.includes('Suppress Cloudflare Beacon Errors')) {
    console.log(`ℹ️  Skipping ${filePath} - already has suppression script`);
    return false;
  }

  // پیدا کردن </head> و اضافه کردن اسکریپت قبل از آن
  const headEndRegex = /([ \t]*)<\/head>/;
  const match = content.match(headEndRegex);

  if (!match) {
    console.log(`⚠️  Could not find </head> tag in ${filePath}`);
    return false;
  }

  // اضافه کردن اسکریپت قبل از </head>
  content = content.replace(headEndRegex, `${SUPPRESSION_SCRIPT}\n$1</head>`);

  // نوشتن فایل
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Updated ${filePath}`);
  return true;
}

// اجرای اصلی
function main() {
  console.log('🔧 Adding Beacon Error Suppression to HTML files...\n');

  let updatedCount = 0;

  FILES_TO_UPDATE.forEach(filePath => {
    if (addSuppressionScript(filePath)) {
      updatedCount++;
    }
  });

  console.log(`\n✨ Done! Updated ${updatedCount} file(s).`);
}

main();
