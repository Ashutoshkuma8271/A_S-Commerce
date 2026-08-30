import app from '../server/server.js';
import { initDB } from '../server/db.js';

// Pre-initialize database on cold start
initDB().catch(e => console.warn('[Vercel Serverless] DB init note:', e.message));

export default app;

