import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger.js';

// Extended Prisma Client with logging
class PrismaClientExtended extends PrismaClient {
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'pretty',
    });
  }
}

// Create singleton instance
let prisma: PrismaClientExtended | undefined;

// Initialize Prisma client
export const initializeDatabase = async (): Promise<PrismaClientExtended> => {
  try {
    if (prisma) {
      logger.info('Database already initialized');
      return prisma;
    }

    prisma = new PrismaClientExtended();

    // Log database events
    prisma.$on('query', (e: any) => {
      logger.debug('Database query', {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
        timestamp: e.timestamp
      });
    });

    prisma.$on('error', (e: any) => {
      logger.error('Database error', {
        message: e.message,
        target: e.target
      });
    });

    prisma.$on('info', (e: any) => {
      logger.info('Database info', {
        message: e.message,
        target: e.target
      });
    });

    prisma.$on('warn', (e: any) => {
      logger.warn('Database warning', {
        message: e.message,
        target: e.target
      });
    });

    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Test basic query
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection verified');

    return prisma;
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
};

// Get database instance
export const getDatabase = (): PrismaClientExtended => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connection', error);
    throw error;
  }
};

// Health check for database
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!prisma) {
      return false;
    }

    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
};

// Database transaction helper
export const withTransaction = async <T>(
  callback: (tx: PrismaClientExtended) => Promise<T>
): Promise<T> => {
  const db = getDatabase();
  return await db.$transaction(callback);
};

// Export default database instance
export default prisma;