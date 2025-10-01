import { Request, Response } from 'express';
import { checkDatabaseHealth } from '@/services/database-simple.js';
import { logger } from '@/utils/logger.js';

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      responseTime?: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    // Check database health
    const dbStartTime = Date.now();
    const isDbHealthy = await checkDatabaseHealth();
    const dbResponseTime = Date.now() - dbStartTime;

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

    // Get system uptime
    const uptime = process.uptime();

    // Determine overall health
    const isHealthy = isDbHealthy;

    const healthResponse: HealthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: isDbHealthy ? 'connected' : 'disconnected',
          ...(isDbHealthy && { responseTime: dbResponseTime })
        },
        memory: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: memoryPercentage
        }
      }
    };

    // Log health check (only in development or if unhealthy)
    if (process.env.NODE_ENV === 'development' || !isHealthy) {
      logger.info('Health check performed', {
        status: healthResponse.status,
        databaseStatus: healthResponse.services.database.status,
        responseTime: Date.now() - startTime,
        memoryUsage: healthResponse.services.memory
      });
    }

    // Set appropriate status code
    const statusCode = isHealthy ? 200 : 503;

    // Add health check headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(statusCode).json(healthResponse);
  } catch (error) {
    logger.error('Health check failed', error);

    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: 'disconnected'
        },
        memory: {
          used: 0,
          total: 0,
          percentage: 0
        }
      }
    };

    res.status(503).json(errorResponse);
  }
};

export const readinessCheck = async (req: Request, res: Response): Promise<void> => {
  // Readiness check - service is ready if it can accept requests
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    message: 'Service is ready to accept requests'
  });
};

export const livenessCheck = async (req: Request, res: Response): Promise<void> => {
  // Liveness check - service is alive if the process is running
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    message: 'Service is alive'
  });
};