import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { logger } from './server/utils/logger.js';
import { connectDB } from './server/config/database.js';
import { initScheduler } from './server/jobs/scheduler.js';
import authRoutes from './server/routes/auth.js';
import meetingRoutes from './server/routes/meetings.js';
import settingsRoutes from './server/routes/settings.js';
import logRoutes from './server/routes/logs.js';
import { errorHandler } from './server/middleware/errorHandler.js';
import { apiLimiter } from './server/middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = __dirname;

dotenv.config({ path: path.join(projectRoot, '.env') });

const isDemoMode = process.env.DEMO_MODE === 'true';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Only trust a proxy when explicitly enabled for deployed environments.
  app.set('trust proxy', process.env.TRUST_PROXY === 'true');

  if (!isDemoMode) {
    await connectDB();
    initScheduler();
  } else {
    logger.info('Demo mode enabled: skipping MongoDB connection and background scheduler.');
  }

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development with Vite
  }));
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true
  }));
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  // API Routes
  app.use('/api/auth', authRoutes);
  if (isDemoMode) {
    app.use('/api/meetings', meetingRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/logs', logRoutes);
  } else {
    app.use('/api/meetings', apiLimiter, meetingRoutes);
    app.use('/api/settings', apiLimiter, settingsRoutes);
    app.use('/api/logs', apiLimiter, logRoutes);
  }

  // Health Check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: projectRoot,
      envDir: projectRoot,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(projectRoot, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 MeetBot Backend running on port ${PORT}`);
  });

  // Graceful Shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated.');
      process.exit(0);
    });
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
