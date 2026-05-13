import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { apiLimiter } from './shared/middleware/rateLimiter.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import uploadRoutes from './modules/uploads/upload.routes.js';
import postRoutes from './modules/posts/post.routes.js';
import messagingRoutes from './modules/messaging/messaging.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import searchRoutes from './modules/search/search.routes.js';

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
  app.use('/uploads', express.static(path.resolve('public/uploads')));

  // Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  // API routes
  app.use('/api/v1', authRoutes);
  app.use('/api/v1', userRoutes);
  app.use('/api/v1', uploadRoutes);
  app.use('/api/v1', postRoutes);
  app.use('/api/v1', messagingRoutes);
  app.use('/api/v1', notificationRoutes);
  app.use('/api/v1', searchRoutes);

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
