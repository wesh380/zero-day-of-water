#!/usr/bin/env node
/**
 * Test Supabase Connection
 *
 * این script اتصال به Supabase رو تست می‌کنه
 */

const { createClient } = require('@supabase/supabase-js');

// خواندن environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('🔍 بررسی اتصال به Supabase...\n');

// 1. چک کردن environment variables
console.log('1️⃣ بررسی Environment Variables:');
if (!SUPABASE_URL) {
  console.error('   ❌ SUPABASE_URL تنظیم نشده!');
  process.exit(1);
} else {
  console.log(`   ✅ SUPABASE_URL: ${SUPABASE_URL}`);
}

if (!SUPABASE_ANON_KEY) {
  console.error('   ❌ SUPABASE_ANON_KEY تنظیم نشده!');
  process.exit(1);
} else {
  const maskedKey = SUPABASE_ANON_KEY.substring(0, 20) + '...' + SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 10);
  console.log(`   ✅ SUPABASE_ANON_KEY: ${maskedKey}`);
}

// 2. تست اتصال
console.log('\n2️⃣ تست اتصال به Supabase:');
const supabase = createClient('https://fviewmsgmqdjsekuazdn.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2aWV3bXNnbXFkanNla3VhemRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzgxNjksImV4cCI6MjA3ODA1NDE2OX0.i9bkVYThgdeCC4pVU_6XNU08T_8vh7e-RBok7neLD28');

// 3. تست query ساده
(async () => {
  try {
    console.log('   🔄 در حال query به جدول scenarios...');
    const { data, error } = await supabase
      .from('scenarios')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('   ❌ خطا در query:', error.message);
      console.error('\n🔴 مشکل احتمالی:');
      console.error('   - آیا migration SQL رو اجرا کردی؟ (مرحله 2)');
      console.error('   - آیا جدول scenarios در Supabase Table Editor وجود داره؟');
      process.exit(1);
    }

    console.log('   ✅ اتصال موفق! جدول scenarios در دسترس است.');

    // 4. تست جداول دیگر
    console.log('\n3️⃣ بررسی جداول مورد نیاز:');
    const tables = ['scenarios', 'tariffs', 'cld_jobs', 'cld_results'];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error(`   ❌ جدول "${table}" یافت نشد!`);
        console.error(`      خطا: ${error.message}`);
      } else {
        console.log(`   ✅ جدول "${table}" موجود است`);
      }
    }

    console.log('\n✅ همه چیز آماده است! می‌تونی به مرحله بعد بری.');
    console.log('\n📋 مرحله بعدی: Deploy و Test (مرحله 4 در SUPABASE_MIGRATION_GUIDE.md)');

  } catch (err) {
    console.error('   ❌ خطای غیرمنتظره:', err.message);
    process.exit(1);
  }
})();
