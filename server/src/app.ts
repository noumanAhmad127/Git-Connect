import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { apiLimiter } from './shared/middleware/rateLimiter.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';

export function createApp(): express.Application {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors(corsOptions));

  // Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rate limiting
  app.use('/api/', apiLimiter);

  // Static files (uploads)
  app.use('/uploads', express.static('public/uploads'));

  // Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  // API routes
  app.use('/api/v1', authRoutes);

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
