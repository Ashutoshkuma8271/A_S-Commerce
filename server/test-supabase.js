import { supabase } from './services/supabase.js';

async function testAll() {
  console.log('Testing Supabase connection and tables...');
  
  const tables = ['admins', 'users', 'products', 'orders', 'coupons', 'audit_logs', 'site_settings'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`❌ Table "${table}" error:`, error.message, error.code, error.details);
    } else {
      console.log(`✅ Table "${table}" exists! Rows:`, data.length);
    }
  }
}

testAll();
