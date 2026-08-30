import app from '../server/server.js';
import { initDB } from '../server/db.js';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    try {
      await initDB();
    } catch (e) {
      console.warn('[Vercel Serverless] DB init note:', e.message);
    }
    initialized = true;
  }
  return app(req, res);
}
