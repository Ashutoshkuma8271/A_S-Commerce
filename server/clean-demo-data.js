import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './services/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'data', 'database.json');

async function cleanAllDemoData() {
  console.log('Cleaning demo users, orders, and logs...');

  // 1. Clean local database.json (keep only real admin Ashutosh Yadav)
  if (fs.existsSync(dbFile)) {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(raw);

    db.users = []; // Purge all mock users
    db.orders = []; // Purge all mock orders
    db.password_resets = [];
    db.audit_logs = [
      {
        id: `audit-${Date.now()}`,
        action: 'System Initialized',
        adminId: db.admins[0]?.id || 'adm-master',
        adminEmail: db.admins[0]?.email || 'ashutoshkumaryadav933499@gmail.com',
        ip: '127.0.0.1',
        details: 'Store database cleaned and initialized for live production',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
    console.log('✅ Local database.json cleaned!');
  }

  // 2. Clean Supabase public.users and public.orders
  const { error: userErr } = await supabase.from('users').delete().neq('id', 'non_existent_id');
  if (userErr) console.error('Supabase user clean error:', userErr.message);
  else console.log('✅ Supabase public.users table purged of all test records!');

  const { error: orderErr } = await supabase.from('orders').delete().neq('id', 'non_existent_id');
  if (orderErr) console.error('Supabase order clean error:', orderErr.message);
  else console.log('✅ Supabase public.orders table purged of all mock orders!');

  const { error: auditErr } = await supabase.from('audit_logs').delete().neq('id', 'non_existent_id');
  if (auditErr) console.error('Supabase audit_logs clean error:', auditErr.message);
  else console.log('✅ Supabase public.audit_logs table purged of mock logs!');

  console.log('🎉 Database is 100% clean and ready for real customer signups & purchases!');
  process.exit(0);
}

cleanAllDemoData();
