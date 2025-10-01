import { createApp, setupGracefulShutdown } from './app.js';
import { serverConfig } from '@/config/environment.js';
import { logger } from '@/utils/logger.js';

/**
 * Server startup function
 */
const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting Resort Admin Panel Backend...');

    // Create Express application
    const app = await createApp();

    // Start HTTP server
    const server = app.listen(serverConfig.port, serverConfig.host, () => {
      logger.info(`Server started successfully`, {
        host: serverConfig.host,
        port: serverConfig.port,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        pid: process.pid
      });

      // Log available endpoints
      logger.info('Available endpoints:', {
        health: `http://${serverConfig.host}:${serverConfig.port}/health`,
        api: `http://${serverConfig.host}:${serverConfig.port}/api`,
        root: `http://${serverConfig.host}:${serverConfig.port}/`
      });
    });

    // Setup graceful shutdown handlers
    setupGracefulShutdown(server);

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof serverConfig.port === 'string'
        ? 'Pipe ' + serverConfig.port
        : 'Port ' + serverConfig.port;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

/**
 * Handle process termination
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error during server startup', error);
  process.exit(1);
});

// Export for testing purposes
export { startServer };