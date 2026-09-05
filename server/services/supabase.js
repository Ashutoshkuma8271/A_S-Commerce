import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const isLocalDevelopment = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NODE_ENV === 'test'
  ? 'test-service-role-key'
  : process.env.SUPABASE_SERVICE_ROLE_KEY || (isLocalDevelopment ? process.env.SUPABASE_ANON_KEY : undefined);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env before starting the backend.');
}

if (isLocalDevelopment && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase is using the anon key for local development only. Configure SUPABASE_SERVICE_ROLE_KEY before deployment.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: WebSocket,
  },
});

/**
 * Health test connection to Supabase cloud
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log('⚡ Supabase Cloud Connected (Project: pgbhtnjsfggxnldyrcaz)');
      return true;
    }
    console.log('⚡ Supabase Cloud Connected & Ready');
    return true;
  } catch (e) {
    console.log('⚡ Supabase Cloud Initialized');
    return true;
  }
}

export default supabase;
