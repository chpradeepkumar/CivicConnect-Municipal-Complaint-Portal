import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';

import env from './config/env.js';
import { getDatabaseState } from './config/db.js';
import apiRoutes from './routes/index.js';
import { authenticate } from './middleware/auth.js';
import { csrfProtection } from './middleware/csrf.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { sendSuccess } from './utils/apiResponse.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.isProduction ? undefined : false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

if (!env.isTest) {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// Establish CSRF token cookie for every request, then evaluate mutating requests.
app.use(csrfProtection);
app.use(authenticate);
app.use(env.API_PREFIX, apiLimiter, apiRoutes);

app.get('/health', (_req, res) =>
  sendSuccess(res, {
    data: {
      status: 'ok',
      database: getDatabaseState(),
      environment: env.NODE_ENV,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  })
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
