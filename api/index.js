import app from '../server/server.js';
import { initDB } from '../server/db.js';
import { testSupabaseConnection } from '../server/services/supabase.js';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    try {
      await initDB();
      await testSupabaseConnection();
    } catch (e) {
      console.error('[Vercel Serverless] DB initialization note:', e);
    }
    initialized = true;
  }
  return app(req, res);
}
