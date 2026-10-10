import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/db.js';

async function start() {
  try {
    await connectDatabase();
    // eslint-disable-next-line no-console
    console.log('[db] MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] MongoDB connection failed:', err.message);
    console.error('[db] Server will start but database-backed routes will fail. Check MONGODB_URI.');
  }

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] CivicConnect API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });

  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
