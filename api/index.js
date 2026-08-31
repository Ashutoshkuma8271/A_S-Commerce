import app from '../server/server.js';
import { initDB } from '../server/db.js';

let dbInitialized = false;

export default async function handler(req, res) {
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (e) {
      console.warn('[Vercel Serverless] DB init note:', e.message);
    }
  }
  return app(req, res);
}


