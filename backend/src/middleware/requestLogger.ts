import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { logger } from '@/utils/logger.js';

// Custom Morgan token for request ID
morgan.token('id', (req: Request) => req.headers['x-request-id'] as string || '-');

// Custom format for development
const developmentFormat = ':id :method :url :status :res[content-length] - :response-time ms';

// Custom format for production (JSON)
const productionFormat = JSON.stringify({
  id: ':id',
  method: ':method',
  url: ':url',
  status: ':status',
  contentLength: ':res[content-length]',
  responseTime: ':response-time',
  userAgent: ':user-agent',
  ip: ':remote-addr'
});

// Morgan stream configuration
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Development middleware
export const developmentLogger = morgan(developmentFormat, {
  stream: morganStream,
  skip: (req: Request) => req.url === '/health'
});

// Production middleware
export const productionLogger = morgan(productionFormat, {
  stream: morganStream,
  skip: (req: Request) => req.url === '/health'
});

// HTTP request logger middleware
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id']
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any): Response {
    const duration = Date.now() - start;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.headers['x-request-id']
    });

    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

// Select appropriate logger based on environment
export const requestLogger = process.env.NODE_ENV === 'production'
  ? productionLogger
  : developmentLogger;