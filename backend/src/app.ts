import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { serverConfig, corsConfig } from '@/config/environment.js';
import { logger } from '@/utils/logger.js';
import { errorHandler, notFound } from '@/middleware/errorHandler.js';
import { requestLogger, httpLogger } from '@/middleware/requestLogger.js';
import { securityHeaders, rateLimiter, addRequestId, validateContentType } from '@/middleware/security.js';
import {
  generalApiRateLimit,
  sanitizeInput,
  ipSecurity,
  corsSecurity,
  requestSizeLimit,
  suspiciousActivityCheck
} from '@/middleware/securityEnhancements.js';
import { initializeDatabase } from '@/services/database-simple.js';
import healthRoutes from '@/routes/health.js';
import authRoutes from '@/routes/auth.js';

// Express application setup
export const createApp = async (): Promise<Application> => {
  const app: Application = express();

  // Initialize database
  await initializeDatabase();

  // Trust proxy for rate limiting and IP detection
  app.set('trust proxy', 1);

  // Security middleware
  app.use(securityHeaders);
  app.use(addRequestId);

  // Enhanced security middleware
  app.use(ipSecurity);
  app.use(sanitizeInput);
  app.use(suspiciousActivityCheck);

  // CORS configuration
  app.use(cors({
    origin: corsConfig.origin,
    credentials: corsConfig.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-ID',
      'X-API-Key'
    ]
  }));

  // Request size limiting
  app.use(requestSizeLimit('10mb'));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Content type validation
  app.use(validateContentType);

  // Rate limiting
  app.use(rateLimiter);
  app.use(generalApiRateLimit);

  // Request logging
  app.use(requestLogger);
  app.use(httpLogger);

  // API routes
  app.use('/health', healthRoutes);
  app.use('/auth', authRoutes);

  // API documentation endpoint
  app.get('/api', (req: Request, res: Response) => {
    res.json({
      name: 'Resort Admin Panel API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/health',
        readiness: '/health/ready',
        liveness: '/health/live',
        auth: {
          login: 'POST /auth/login',
          refresh: 'POST /auth/refresh',
          logout: 'POST /auth/logout',
          me: 'GET /auth/me',
          check: 'GET /auth/check'
        },
        api: '/api/v1 (coming soon)'
      },
      documentation: '/api/docs (coming soon)',
      timestamp: new Date().toISOString()
    });
  });

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'Resort Admin Panel Backend API',
      status: 'running',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // 404 handler
  app.use(notFound);

  // Global error handler
  app.use(errorHandler);

  return app;
};

// Graceful shutdown handler
export const setupGracefulShutdown = (server: any): void => {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close database connection
        const { closeDatabase } = await import('@/services/database-simple.js');
        await closeDatabase();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 30000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    gracefulShutdown('unhandledRejection');
  });
};