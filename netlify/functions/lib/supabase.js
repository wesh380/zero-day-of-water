/**
 * Supabase Client Helper
 *
 * این فایل یک instance از Supabase client برمی‌گردونه
 *
 * Environment Variables مورد نیاز:
 * - SUPABASE_URL: URL پروژه Supabase
 * - SUPABASE_ANON_KEY: Public anon key
 *
 * تاریخ: 2025-11-07
 */

const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;

/**
 * دریافت Supabase client instance (singleton pattern)
 */
function getSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

module.exports = { getSupabase };
