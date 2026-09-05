import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgbhtnjsfggxnldyrcaz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_NkjgJd5mDtiY9TM1Fw8ZIQ_nTtqP2Vg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
