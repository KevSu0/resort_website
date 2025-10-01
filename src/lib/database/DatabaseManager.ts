import { IDatabaseAdapter, DatabaseConnectionConfig, DatabaseCapabilities } from './interfaces/IDatabaseAdapter';
import { PostgreSQLAdapter } from './adapters/PostgreSQLAdapter';
import { PrismaAdapter } from './adapters/PrismaAdapter';

export type DatabaseType = 'postgresql' | 'prisma-postgres' | 'mysql' | 'sqlite';

export interface DatabaseManagerConfig {
  type: DatabaseType;
  connection: DatabaseConnectionConfig;
  pool?: {
    min: number;
    max: number;
    idleTimeoutMillis?: number;
  };
  logging?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
  cache?: {
    enabled: boolean;
    provider: 'memory' | 'redis';
    ttl: number;
  };
  retry?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
}

/**
 * Database Connection Manager
 *
 * Manages database connections, adapter selection, and provides
 * a unified interface for database operations across different database types.
 */

export class DatabaseManager {
  private adapters: Map<string, IDatabaseAdapter> = new Map();
  private defaultAdapter: string | null = null;
  private config: DatabaseManagerConfig | null = null;

  /**
   * Initialize the database manager with configuration
   */
  async initialize(config: DatabaseManagerConfig): Promise<void> {
    this.config = config;

    // Create and initialize the default adapter
    const adapterKey = this.generateAdapterKey(config.type, config.connection);
    const adapter = this.createAdapter(config.type);

    try {
      await adapter.connect(config.connection);
      this.adapters.set(adapterKey, adapter);
      this.defaultAdapter = adapterKey;

      console.log(`Database manager initialized with ${config.type} adapter`);
    } catch (error) {
      console.error(`Failed to initialize database adapter:`, error);
      throw error;
    }
  }

  /**
   * Add an additional database connection
   */
  async addConnection(
    name: string,
    config: DatabaseManagerConfig
  ): Promise<void> {
    const adapterKey = this.generateAdapterKey(config.type, config.connection);
    const adapter = this.createAdapter(config.type);

    await adapter.connect(config.connection);
    this.adapters.set(name, adapter);

    console.log(`Added database connection '${name}' with ${config.type} adapter`);
  }

  /**
   * Get a database adapter by name
   */
  getAdapter(name?: string): IDatabaseAdapter {
    const adapterKey = name || this.defaultAdapter;
    if (!adapterKey) {
      throw new Error('No database adapter available. Call initialize() first.');
    }

    const adapter = this.adapters.get(adapterKey);
    if (!adapter) {
      throw new Error(`Database adapter '${adapterKey}' not found`);
    }

    return adapter;
  }

  /**
   * Get the default database adapter
   */
  getDefaultAdapter(): IDatabaseAdapter {
    return this.getAdapter();
  }

  /**
   * Check if a specific database connection is healthy
   */
  async healthCheck(name?: string): Promise<boolean> {
    try {
      const adapter = this.getAdapter(name);
      return await adapter.healthCheck();
    } catch (error) {
      console.error(`Health check failed for database '${name || 'default'}':`, error);
      return false;
    }
  }

  /**
   * Check health of all database connections
   */
  async healthCheckAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name] of this.adapters) {
      results[name] = await this.healthCheck(name);
    }

    return results;
  }

  /**
   * Close a specific database connection
   */
  async closeConnection(name?: string): Promise<void> {
    const adapterKey = name || this.defaultAdapter;
    if (!adapterKey) return;

    const adapter = this.adapters.get(adapterKey);
    if (adapter) {
      await adapter.disconnect();
      this.adapters.delete(adapterKey);

      if (this.defaultAdapter === adapterKey) {
        this.defaultAdapter = null;
      }

      console.log(`Closed database connection '${adapterKey}'`);
    }
  }

  /**
   * Close all database connections
   */
  async closeAllConnections(): Promise<void> {
    const closePromises = Array.from(this.adapters.entries()).map(
      async ([name, adapter]) => {
        try {
          await adapter.disconnect();
          console.log(`Closed database connection '${name}'`);
        } catch (error) {
          console.error(`Error closing database connection '${name}':`, error);
        }
      }
    );

    await Promise.all(closePromises);
    this.adapters.clear();
    this.defaultAdapter = null;

    console.log('All database connections closed');
  }

  /**
   * Get capabilities of a specific database adapter
   */
  getCapabilities(name?: string): DatabaseCapabilities {
    const adapter = this.getAdapter(name);
    return adapter.getCapabilities();
  }

  /**
   * Test a database connection without adding it to the manager
   */
  async testConnection(config: DatabaseManagerConfig): Promise<boolean> {
    const adapter = this.createAdapter(config.type);
    try {
      await adapter.connect(config.connection);
      const isHealthy = await adapter.healthCheck();
      await adapter.disconnect();
      return isHealthy;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    defaultConnection: string | null;
    connections: Array<{
      name: string;
      type: DatabaseType;
      healthy: boolean;
    }>;
  } {
    const connections = Array.from(this.adapters.entries()).map(([name, adapter]) => ({
      name,
      type: this.getAdapterType(name) as DatabaseType,
      healthy: false, // Would need to implement health check caching
    }));

    return {
      totalConnections: this.adapters.size,
      defaultConnection: this.defaultAdapter,
      connections,
    };
  }

  /**
   * Execute a query on a specific connection
   */
  async query<T = any>(
    sql: string,
    params?: any[],
    options?: { connection?: string } & any
  ): Promise<any> {
    const adapter = this.getAdapter(options?.connection);
    return await adapter.query<T>(sql, params, options);
  }

  /**
   * Execute a transaction across multiple operations
   */
  async transaction<T>(
    callback: (tx: any) => Promise<T>,
    options?: { connection?: string }
  ): Promise<T> {
    const adapter = this.getAdapter(options?.connection);
    return await adapter.transaction(callback);
  }

  /**
   * Create a database adapter based on type
   */
  private createAdapter(type: DatabaseType): IDatabaseAdapter {
    switch (type) {
      case 'postgresql':
        return new PostgreSQLAdapter();
      case 'prisma-postgres':
        return new PrismaAdapter();
      // Add other adapters as needed
      // case 'mysql':
      //   return new MySQLAdapter();
      // case 'sqlite':
      //   return new SQLiteAdapter();
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  /**
   * Generate a unique adapter key
   */
  private generateAdapterKey(type: DatabaseType, connection: DatabaseConnectionConfig): string {
    return `${type}:${connection.host}:${connection.port}:${connection.database}`;
  }

  /**
   * Get adapter type for a connection name
   */
  private getAdapterType(name?: string): string {
    const adapterKey = name || this.defaultAdapter;
    if (!adapterKey) return 'unknown';

    return adapterKey.split(':')[0] || 'unknown';
  }

  /**
   * Execute operation with retry logic
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    options?: {
      attempts?: number;
      delay?: number;
      backoff?: 'linear' | 'exponential';
    }
  ): Promise<T> {
    const attempts = options?.attempts || this.config?.retry?.attempts || 3;
    const delay = options?.delay || this.config?.retry?.delay || 1000;
    const backoff = options?.backoff || this.config?.retry?.backoff || 'exponential';

    let lastError: Error;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === attempts) {
          break;
        }

        const waitTime = backoff === 'exponential' ? delay * Math.pow(2, attempt - 1) : delay * attempt;
        console.warn(`Database operation failed (attempt ${attempt}/${attempts}), retrying in ${waitTime}ms:`, lastError.message);
        await this.sleep(waitTime);
      }
    }

    throw lastError!;
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for global access
export const databaseManager = new DatabaseManager();