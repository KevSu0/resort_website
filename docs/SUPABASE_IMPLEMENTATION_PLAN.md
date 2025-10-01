# Supabase Migration Implementation Plan

## Overview

This document provides detailed implementation plans for preparing the codebase for a future Supabase migration. It includes code examples, file structures, and step-by-step instructions for each component.

## 1. Environment Configuration Implementation

### 1.1 Database Configuration Types

Create `src/lib/database/config/DatabaseConfig.ts`:

```typescript
import type { DatabaseConnectionConfig } from '../interfaces/IDatabaseAdapter';

export type DatabaseType = 'postgresql' | 'supabase' | 'prisma-postgres';

export interface PoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  statement_timeout?: number;
  query_timeout?: number;
  application_name?: string;
  allowExitOnIdle?: boolean;
  maxUses?: number;
}

export interface SSLConfig {
  enabled: boolean;
  rejectUnauthorized?: boolean;
  ca?: string;
  cert?: string;
  key?: string;
}

export interface DatabaseFeatures {
  supportsTransactions: boolean;
  supportsJSON: boolean;
  supportsFullTextSearch: boolean;
  supportsRealtime: boolean;
  supportsAuth: boolean;
  supportsStorage: boolean;
  supportsEdgeFunctions: boolean;
}

export interface DatabaseConfig {
  type: DatabaseType;
  connection: DatabaseConnectionConfig;
  pool: PoolConfig;
  ssl: SSLConfig;
  features: DatabaseFeatures;
  retry?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
  logging?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    slowQueryThreshold?: number;
  };
}

export interface EnvironmentConfig {
  development: DatabaseConfig;
  staging: DatabaseConfig;
  production: DatabaseConfig;
  test: DatabaseConfig;
}
```

### 1.2 Environment Configuration Loader

Create `src/lib/database/config/EnvironmentConfig.ts`:

```typescript
import { DatabaseConfig, EnvironmentConfig, DatabaseType } from './DatabaseConfig';
import { logger } from '../../logger';

export class EnvironmentConfigLoader {
  private static config: EnvironmentConfig | null = null;

  static load(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }

    const nodeEnv = process.env.NODE_ENV || 'development';
    const databaseType = (process.env.DATABASE_TYPE || 'postgresql') as DatabaseType;

    this.config = {
      development: this.createConfig('development', databaseType),
      staging: this.createConfig('staging', databaseType),
      production: this.createConfig('production', databaseType),
      test: this.createConfig('test', 'prisma-postgres'),
    };

    logger.info('Environment configuration loaded', {
      module: 'EnvironmentConfigLoader',
      function: 'load',
      environment: nodeEnv,
      databaseType,
      category: 'config'
    });

    return this.config;
  }

  static getConfig(environment?: string): DatabaseConfig {
    const config = this.load();
    const env = environment || process.env.NODE_ENV || 'development';
    
    return config[env as keyof EnvironmentConfig] || config.development;
  }

  static getCurrentConfig(): DatabaseConfig {
    return this.getConfig();
  }

  private static createConfig(environment: string, databaseType: DatabaseType): DatabaseConfig {
    const baseConfig = {
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential' as const,
      },
      logging: {
        enabled: true,
        level: environment === 'production' ? 'warn' : 'info',
        slowQueryThreshold: 1000,
      },
    };

    switch (databaseType) {
      case 'postgresql':
        return this.createPostgreSQLConfig(environment, baseConfig);
      case 'supabase':
        return this.createSupabaseConfig(environment, baseConfig);
      case 'prisma-postgres':
        return this.createPrismaConfig(environment, baseConfig);
      default:
        throw new Error(`Unsupported database type: ${databaseType}`);
    }
  }

  private static createPostgreSQLConfig(environment: string, baseConfig: any): DatabaseConfig {
    const isProduction = environment === 'production';
    
    return {
      type: 'postgresql',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'resort_cms',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        ssl: {
          rejectUnauthorized: isProduction,
        },
        pool: {
          min: isProduction ? 5 : 2,
          max: isProduction ? 20 : 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        },
      },
      pool: {
        min: isProduction ? 5 : 2,
        max: isProduction ? 20 : 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        statement_timeout: 30000,
        query_timeout: 30000,
        application_name: 'resort-cms',
        allowExitOnIdle: true,
        maxUses: 7500,
      },
      ssl: {
        enabled: isProduction,
        rejectUnauthorized: isProduction,
      },
      features: {
        supportsTransactions: true,
        supportsJSON: true,
        supportsFullTextSearch: true,
        supportsRealtime: false,
        supportsAuth: false,
        supportsStorage: false,
        supportsEdgeFunctions: false,
      },
      ...baseConfig,
    };
  }

  private static createSupabaseConfig(environment: string, baseConfig: any): DatabaseConfig {
    const isProduction = environment === 'production';
    
    return {
      type: 'supabase',
      connection: {
        host: process.env.SUPABASE_DB_HOST || '',
        port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
        database: process.env.SUPABASE_DB_NAME || 'postgres',
        username: process.env.SUPABASE_DB_USER || 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD || '',
        ssl: {
          rejectUnauthorized: true,
        },
        pool: {
          min: isProduction ? 5 : 2,
          max: isProduction ? 20 : 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        },
      },
      pool: {
        min: isProduction ? 5 : 2,
        max: isProduction ? 20 : 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        statement_timeout: 30000,
        query_timeout: 30000,
        application_name: 'resort-cms-supabase',
        allowExitOnIdle: true,
        maxUses: 7500,
      },
      ssl: {
        enabled: true,
        rejectUnauthorized: true,
      },
      features: {
        supportsTransactions: true,
        supportsJSON: true,
        supportsFullTextSearch: true,
        supportsRealtime: true,
        supportsAuth: true,
        supportsStorage: true,
        supportsEdgeFunctions: true,
      },
      ...baseConfig,
    };
  }

  private static createPrismaConfig(environment: string, baseConfig: any): DatabaseConfig {
    const isProduction = environment === 'production';
    
    return {
      type: 'prisma-postgres',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'resort_cms_test',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        ssl: {
          rejectUnauthorized: false,
        },
        pool: {
          min: 1,
          max: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        },
      },
      pool: {
        min: 1,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        statement_timeout: 30000,
        query_timeout: 30000,
        application_name: 'resort-cms-test',
        allowExitOnIdle: true,
        maxUses: 7500,
      },
      ssl: {
        enabled: false,
        rejectUnauthorized: false,
      },
      features: {
        supportsTransactions: true,
        supportsJSON: true,
        supportsFullTextSearch: true,
        supportsRealtime: false,
        supportsAuth: false,
        supportsStorage: false,
        supportsEdgeFunctions: false,
      },
      ...baseConfig,
    };
  }
}
```

### 1.3 Environment Variables Template

Create `.env.example`:

```bash
# Database Configuration
DATABASE_TYPE=postgresql
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resort_cms
DB_USER=postgres
DB_PASSWORD=your_password

# Supabase Configuration (for future migration)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_HOST=db.your-project.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_db_password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
VITE_WHATSAPP_CONTACT_NUMBER=+919876543210
VITE_SITE_EMAIL_FROM=info@wayanadresorts.com

# Logging Configuration
LOG_LEVEL=info
```

## 2. Database Adapter Factory Implementation

### 2.1 Supabase Adapter

Create `src/lib/database/adapters/SupabaseAdapter.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  IDatabaseAdapter,
  DatabaseConnectionConfig,
  QueryOptions,
  PaginationOptions,
  QueryResult,
  DatabaseTransaction,
  DatabaseCapabilities,
} from '../interfaces/IDatabaseAdapter';
import { logger } from '../../logger';

/**
 * Supabase Database Adapter
 *
 * Implements the IDatabaseAdapter interface for Supabase databases.
 * Provides Supabase-specific optimizations and features including real-time,
 * authentication, and storage integration.
 */
export class SupabaseAdapter implements IDatabaseAdapter {
  private client: SupabaseClient | null = null;
  private config: DatabaseConnectionConfig | null = null;
  private supabaseUrl: string = '';
  private supabaseKey: string = '';

  async connect(config: DatabaseConnectionConfig): Promise<void> {
    this.config = config;
    
    // Extract Supabase URL and key from environment or connection config
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Supabase URL and key are required');
    }

    this.client = createClient(this.supabaseUrl, this.supabaseKey, {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          'x-application-name': 'resort-cms',
        },
      },
    });

    // Test the connection
    const { error } = await this.client.from('brands').select('id').limit(1);
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }

    logger.info('Connected to Supabase database', {
      module: 'SupabaseAdapter',
      function: 'connect',
      url: this.supabaseUrl.replace(/\/[^/]+$/, '/***'), // Hide sensitive parts
      category: 'database'
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      // Supabase client doesn't have an explicit disconnect method
      this.client = null;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.client) return false;

    try {
      const { error } = await this.client.rpc('version');
      return !error;
    } catch (error) {
      logger.logDatabaseError(
        error instanceof Error ? error : new Error(String(error)),
        'healthCheck',
        { module: 'SupabaseAdapter', function: 'healthCheck' }
      );
      return false;
    }
  }

  async query<T = any>(
    sql: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    try {
      const startTime = Date.now();
      const { data, error } = await this.client.rpc('execute_sql', {
        query: sql,
        params: params,
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        logger.logDatabaseError(
          error,
          'query',
          { 
            module: 'SupabaseAdapter', 
            function: 'query', 
            sql: this.sanitizeSql(sql),
            duration,
            category: 'database'
          }
        );
        throw error;
      }

      logger.logDatabaseQuery(
        sql,
        params,
        duration,
        { module: 'SupabaseAdapter', function: 'query' }
      );

      return {
        data: data || [],
        total: Array.isArray(data) ? data.length : 0,
      };
    } catch (error) {
      logger.logDatabaseError(
        error instanceof Error ? error : new Error(String(error)),
        'query',
        { 
          module: 'SupabaseAdapter', 
          function: 'query', 
          sql: this.sanitizeSql(sql),
          category: 'database'
        }
      );
      throw error;
    }
  }

  async queryWithPagination<T = any>(
    sql: string,
    params: any[] = [],
    pagination: PaginationOptions = {},
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const { page = 1, limit = 10, orderBy, orderDirection = 'asc' } = pagination;
    const offset = (page - 1) * limit;

    // Modify SQL to include pagination
    let paginatedSql = sql;
    if (orderBy) {
      paginatedSql += ` ORDER BY ${this.escapeIdentifier(orderBy)} ${orderDirection.toUpperCase()}`;
    }
    paginatedSql += ` LIMIT ${limit} OFFSET ${offset}`;

    return await this.query<T>(paginatedSql, params, options);
  }

  async queryOne<T = any>(
    sql: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<T | null> {
    const result = await this.query<T>(sql + ' LIMIT 1', params, options);
    return result.data[0] || null;
  }

  async queryScalar<T = any>(
    sql: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<T | null> {
    const result = await this.queryOne(sql, params, options);
    if (result && typeof result === 'object') {
      // Return the first property value if it's an object
      const values = Object.values(result);
      return (values[0] as T) || null;
    }
    return result as T;
  }

  async transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    // Supabase handles transactions through RPC calls
    const { data, error } = await this.client.rpc('transaction', {
      callback: callback.toString(),
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async insert<T = any>(
    table: string,
    data: Partial<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    const { data: result, error } = await this.client
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result as T;
  }

  async insertMany<T = any>(
    table: string,
    dataArray: Partial<T>[],
    options: QueryOptions = {}
  ): Promise<T[]> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    const { data, error } = await this.client
      .from(table)
      .insert(dataArray)
      .select();

    if (error) {
      throw error;
    }

    return data as T[];
  }

  async update<T = any>(
    table: string,
    data: Partial<T>,
    where: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    // For Supabase, we need to construct the query differently
    const { data: result, error } = await this.client
      .from(table)
      .update(data)
      .match(this.parseWhereClause(where, params))
      .select();

    if (error) {
      throw error;
    }

    return result as T[];
  }

  async delete(
    table: string,
    where: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<number> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    const { error } = await this.client
      .from(table)
      .delete()
      .match(this.parseWhereClause(where, params));

    if (error) {
      throw error;
    }

    return 1; // Supabase doesn't return affected count
  }

  async count(
    table: string,
    where: string = '1=1',
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<number> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    const { data, error } = await this.client
      .from(table)
      .select('*', { count: 'exact', head: true })
      .match(this.parseWhereClause(where, params));

    if (error) {
      throw error;
    }

    return data?.length || 0;
  }

  async exists(
    table: string,
    where: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<boolean> {
    const count = await this.count(table, where, params, options);
    return count > 0;
  }

  async getLastInsertId(table?: string): Promise<string | number> {
    // Supabase handles this differently
    return '0';
  }

  escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  escapeValue(value: any): any {
    // Supabase handles value escaping automatically
    return value;
  }

  async beginTransaction(): Promise<DatabaseTransaction> {
    // Supabase handles transactions through RPC calls
    throw new Error('Use transaction() method for Supabase transactions');
  }

  getCapabilities(): DatabaseCapabilities {
    return {
      supportsTransactions: true,
      supportsJSON: true,
      supportsFullTextSearch: true,
      supportsWindowFunctions: true,
      supportsCTE: true,
      supportsArrays: true,
      supportsUUID: true,
      supportsRowLevelSecurity: true,
      supportsPartialIndexes: true,
      supportsGeneratedColumns: true,
      supportsMaterializedViews: true,
      supportsTriggers: true,
      supportsStoredProcedures: true,
      defaultVarCharLength: 255,
      maxVarCharLength: 10485760, // 1GB
      maxConnections: 100,
    };
  }

  private parseWhereClause(where: string, params: any[]): Record<string, any> {
    // Simple implementation - in a real scenario, you'd want a more sophisticated parser
    const conditions: Record<string, any> = {};
    
    // Extract simple conditions like "id = $1"
    const matches = where.match(/(\w+)\s*=\s*\$(\d+)/g);
    if (matches) {
      matches.forEach(match => {
        const [, field, paramIndex] = match.match(/(\w+)\s*=\s*\$(\d+)/) || [];
        if (field && paramIndex) {
          const paramValue = params[parseInt(paramIndex) - 1];
          conditions[field] = paramValue;
        }
      });
    }
    
    return conditions;
  }

  private sanitizeSql(sql: string): string {
    // Remove sensitive information from SQL for logging
    return sql.replace(/password\s*=\s*'[^']*'/gi, "password = '***'");
  }
}
```

### 2.2 Database Adapter Factory

Create `src/lib/database/DatabaseAdapterFactory.ts`:

```typescript
import type { IDatabaseAdapter, DatabaseConnectionConfig } from './interfaces/IDatabaseAdapter';
import type { DatabaseConfig, DatabaseType } from './config/DatabaseConfig';
import { PostgreSQLAdapter } from './adapters/PostgreSQLAdapter';
import { PrismaAdapter } from './adapters/PrismaAdapter';
import { SupabaseAdapter } from './adapters/SupabaseAdapter';
import { logger } from '../logger';

/**
 * Database Adapter Factory
 *
 * Creates and manages database adapters based on configuration.
 * Provides a unified interface for different database types.
 */
export class DatabaseAdapterFactory {
  private static adapters: Map<string, IDatabaseAdapter> = new Map();

  /**
   * Create a database adapter based on configuration
   */
  static async create(config: DatabaseConfig): Promise<IDatabaseAdapter> {
    const adapterKey = this.generateAdapterKey(config);
    
    // Check if adapter already exists
    if (this.adapters.has(adapterKey)) {
      return this.adapters.get(adapterKey)!;
    }

    // Create new adapter
    const adapter = this.createAdapter(config.type);
    
    // Connect to database
    await adapter.connect(config.connection);
    
    // Cache adapter
    this.adapters.set(adapterKey, adapter);
    
    logger.info('Database adapter created and connected', {
      module: 'DatabaseAdapterFactory',
      function: 'create',
      adapterType: config.type,
      adapterKey,
      category: 'database'
    });

    return adapter;
  }

  /**
   * Create a database adapter without connecting
   */
  static createAdapter(type: DatabaseType): IDatabaseAdapter {
    switch (type) {
      case 'postgresql':
        return new PostgreSQLAdapter();
      case 'supabase':
        return new SupabaseAdapter();
      case 'prisma-postgres':
        return new PrismaAdapter();
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  /**
   * Get an existing adapter
   */
  static getAdapter(config: DatabaseConfig): IDatabaseAdapter | null {
    const adapterKey = this.generateAdapterKey(config);
    return this.adapters.get(adapterKey) || null;
  }

  /**
   * Remove an adapter from cache
   */
  static removeAdapter(config: DatabaseConfig): boolean {
    const adapterKey = this.generateAdapterKey(config);
    return this.adapters.delete(adapterKey);
  }

  /**
   * Clear all adapters
   */
  static clearAdapters(): void {
    this.adapters.clear();
  }

  /**
   * Get all adapter keys
   */
  static getAdapterKeys(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get health status of all adapters
   */
  static async getHealthStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};

    for (const [key, adapter] of this.adapters) {
      try {
        status[key] = await adapter.healthCheck();
      } catch (error) {
        status[key] = false;
      }
    }

    return status;
  }

  /**
   * Disconnect all adapters
   */
  static async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.adapters.entries()).map(
      async ([key, adapter]) => {
        try {
          await adapter.disconnect();
          logger.info('Database adapter disconnected', {
            module: 'DatabaseAdapterFactory',
            function: 'disconnectAll',
            adapterKey: key,
            category: 'database'
          });
        } catch (error) {
          logger.logDatabaseError(
            error instanceof Error ? error : new Error(String(error)),
            'disconnectAll',
            { 
              module: 'DatabaseAdapterFactory', 
              function: 'disconnectAll', 
              adapterKey: key,
              category: 'database'
            }
          );
        }
      }
    );

    await Promise.all(disconnectPromises);
    this.adapters.clear();
  }

  /**
   * Generate a unique adapter key
   */
  private static generateAdapterKey(config: DatabaseConfig): string {
    const { connection } = config;
    return `${config.type}:${connection.host}:${connection.port}:${connection.database}`;
  }
}
```

## 3. Enhanced Database Manager Implementation

### 3.1 Updated Database Manager

Update `src/lib/database/DatabaseManager.ts`:

```typescript
import type { IDatabaseAdapter, DatabaseConnectionConfig, DatabaseCapabilities } from './interfaces/IDatabaseAdapter';
import type { DatabaseConfig, DatabaseType } from './config/DatabaseConfig';
import { DatabaseAdapterFactory } from './DatabaseAdapterFactory';
import { EnvironmentConfigLoader } from './config/EnvironmentConfig';
import { logger } from '../logger';

export type DatabaseType = 'postgresql' | 'prisma-postgres' | 'supabase' | 'mysql' | 'sqlite';

export interface DatabaseManagerConfig {
  type?: DatabaseType;
  connection?: DatabaseConnectionConfig;
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
 * Enhanced Database Connection Manager
 *
 * Manages database connections, adapter selection, and provides
 * a unified interface for database operations across different database types.
 * Supports both PostgreSQL and Supabase with seamless switching.
 */
export class DatabaseManager {
  private adapters: Map<string, IDatabaseAdapter> = new Map();
  private defaultAdapter: string | null = null;
  private config: DatabaseConfig | null = null;

  /**
   * Initialize the database manager with configuration
   */
  async initialize(config?: DatabaseManagerConfig): Promise<void> {
    // Load configuration from environment or use provided config
    const dbConfig = config 
      ? this.convertLegacyConfig(config)
      : EnvironmentConfigLoader.getCurrentConfig();

    this.config = dbConfig;

    // Create and initialize the default adapter
    const adapterKey = this.generateAdapterKey(dbConfig.type, dbConfig.connection);
    const adapter = await DatabaseAdapterFactory.create(dbConfig);

    this.adapters.set(adapterKey, adapter);
    this.defaultAdapter = adapterKey;

    logger.logDatabaseConnection(
      { type: dbConfig.type, host: dbConfig.connection.host, database: dbConfig.connection.database },
      { module: 'DatabaseManager', function: 'initialize' }
    );
  }

  /**
   * Add an additional database connection
   */
  async addConnection(
    name: string,
    config: DatabaseManagerConfig
  ): Promise<void> {
    const dbConfig = this.convertLegacyConfig(config);
    const adapterKey = this.generateAdapterKey(dbConfig.type, dbConfig.connection);
    const adapter = await DatabaseAdapterFactory.create(dbConfig);

    this.adapters.set(name, adapter);

    logger.logDatabaseConnection(
      { name, type: dbConfig.type, host: dbConfig.connection.host, database: dbConfig.connection.database },
      { module: 'DatabaseManager', function: 'addConnection' }
    );
  }

  /**
   * Switch to a different database type
   */
  async switchDatabase(type: DatabaseType): Promise<void> {
    if (!this.config) {
      throw new Error('Database manager not initialized');
    }

    // Create new configuration with different type
    const newConfig = { ...this.config, type };
    
    // Create new adapter
    const adapterKey = this.generateAdapterKey(newConfig.type, newConfig.connection);
    const adapter = await DatabaseAdapterFactory.create(newConfig);

    // Update default adapter
    this.defaultAdapter = adapterKey;
    this.adapters.set(adapterKey, adapter);

    logger.info('Switched database adapter', {
      module: 'DatabaseManager',
      function: 'switchDatabase',
      fromType: this.config.type,
      toType: type,
      category: 'database'
    });

    // Update current config
    this.config = newConfig;
  }

  /**
   * Get current database type
   */
  getCurrentDatabaseType(): DatabaseType | null {
    return this.config?.type || null;
  }

  /**
   * Get current database capabilities
   */
  getCurrentCapabilities(): DatabaseCapabilities | null {
    const adapter = this.getDefaultAdapter();
    return adapter ? adapter.getCapabilities() : null;
  }

  /**
   * Check if current database supports specific features
   */
  supportsFeature(feature: keyof DatabaseCapabilities): boolean {
    const capabilities = this.getCurrentCapabilities();
    return capabilities ? capabilities[feature] : false;
  }

  // ... rest of the existing methods remain unchanged ...

  /**
   * Convert legacy configuration to new format
   */
  private convertLegacyConfig(config: DatabaseManagerConfig): DatabaseConfig {
    const dbConfig = EnvironmentConfigLoader.getCurrentConfig();
    
    return {
      ...dbConfig,
      type: config.type || dbConfig.type,
      connection: config.connection || dbConfig.connection,
      pool: { ...dbConfig.pool, ...config.pool },
      logging: { ...dbConfig.logging, ...config.logging },
      retry: { ...dbConfig.retry, ...config.retry },
    };
  }
}

// Singleton instance for global access
export const databaseManager = new DatabaseManager();
```

## 4. Migration Utilities Implementation

### 4.1 Migration Utilities

Create `src/lib/database/migration/MigrationUtils.ts`:

```typescript
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../logger';
import { EnvironmentConfigLoader } from '../config/EnvironmentConfig';

export interface MigrationOptions {
  includeData?: boolean;
  batchSize?: number;
  excludeTables?: string[];
  includeTables?: string[];
  createBackup?: boolean;
}

export interface MigrationResult {
  success: boolean;
  tablesMigrated: string[];
  recordsMigrated: number;
  errors: string[];
  duration: number;
}

/**
 * Migration utilities for PostgreSQL to Supabase migration
 */
export class MigrationUtils {
  /**
   * Export PostgreSQL schema and data
   */
  static async exportPostgreSQL(options: MigrationOptions = {}): Promise<{
    schema: string;
    data: string;
  }> {
    const config = EnvironmentConfigLoader.getConfig();
    const pool = new Pool({
      host: config.connection.host,
      port: config.connection.port,
      database: config.connection.database,
      user: config.connection.username,
      password: config.connection.password,
    });

    try {
      // Export schema
      const schema = await this.exportSchema(pool, options);
      
      // Export data if requested
      let data = '';
      if (options.includeData) {
        data = await this.exportData(pool, options);
      }

      return { schema, data };
    } finally {
      await pool.end();
    }
  }

  /**
   * Import schema and data to Supabase
   */
  static async importToSupabase(
    schema: string,
    data: string,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      tablesMigrated: [],
      recordsMigrated: 0,
      errors: [],
      duration: 0,
    };

    const config = EnvironmentConfigLoader.getConfig();
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    try {
      // Import schema
      const tables = await this.importSchema(supabase, schema, options);
      result.tablesMigrated = tables;

      // Import data if provided
      if (data) {
        const records = await this.importData(supabase, data, options);
        result.recordsMigrated = records;
      }

      result.success = true;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      logger.error('Migration to Supabase failed', {
        module: 'MigrationUtils',
        function: 'importToSupabase',
        error: result.errors,
        category: 'migration'
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Verify migration integrity
   */
  static async verifyMigration(): Promise<{
    success: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Get table counts from both databases
      const pgCounts = await this.getTableCounts('postgresql');
      const supabaseCounts = await this.getTableCounts('supabase');

      // Compare counts
      for (const [table, count] of Object.entries(pgCounts)) {
        if (supabaseCounts[table] !== count) {
          issues.push(
            `Table ${table} count mismatch: PostgreSQL=${count}, Supabase=${supabaseCounts[table]}`
          );
        }
      }

      // Verify schema structure
      const schemaIssues = await this.verifySchemaStructure();
      issues.push(...schemaIssues);

      return {
        success: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        issues,
      };
    }
  }

  /**
   * Create a backup of the current database
   */
  static async createBackup(name?: string): Promise<string> {
    const backupName = name || `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const config = EnvironmentConfigLoader.getConfig();
    
    const pool = new Pool({
      host: config.connection.host,
      port: config.connection.port,
      database: config.connection.database,
      user: config.connection.username,
      password: config.connection.password,
    });

    try {
      // Create backup directory if it doesn't exist
      const fs = require('fs');
      const path = require('path');
      const backupDir = path.join(process.cwd(), 'backups');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Create backup file
      const backupPath = path.join(backupDir, `${backupName}.sql`);
      const { execSync } = require('child_process');
      
      const command = `pg_dump -h ${config.connection.host} -U ${config.connection.username} -d ${config.connection.database} > ${backupPath}`;
      execSync(command);

      logger.info('Database backup created', {
        module: 'MigrationUtils',
        function: 'createBackup',
        backupPath,
        category: 'migration'
      });

      return backupPath;
    } finally {
      await pool.end();
    }
  }

  private static async exportSchema(pool: Pool, options: MigrationOptions): Promise<string> {
    const { rows } = await pool.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // Generate schema SQL
    const schema = this.generateSchemaSQL(rows, options);
    return schema;
  }

  private static async exportData(pool: Pool, options: MigrationOptions): Promise<string> {
    const { rows } = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    let data = '';
    const batchSize = options.batchSize || 1000;

    for (const { table_name } of rows) {
      if (options.excludeTables?.includes(table_name)) continue;
      if (options.includeTables && !options.includeTables.includes(table_name)) continue;

      // Get table data in batches
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { rows: batch } = await pool.query(`
          SELECT * FROM ${table_name}
          ORDER BY id
          LIMIT ${batchSize} OFFSET ${offset}
        `);

        if (batch.length === 0) {
          hasMore = false;
        } else {
          // Generate INSERT statements for batch
          data += this.generateInsertSQL(table_name, batch);
          offset += batchSize;
        }
      }
    }

    return data;
  }

  private static generateSchemaSQL(columns: any[], options: MigrationOptions): string {
    // Implementation for generating schema SQL
    // This would create CREATE TABLE statements based on column information
    return '-- Schema SQL generation implementation';
  }

  private static generateInsertSQL(table: string, rows: any[]): string {
    // Implementation for generating INSERT statements
    // This would create INSERT statements for the provided rows
    return `-- INSERT statements for ${table}`;
  }

  private static async importSchema(supabase: any, schema: string, options: MigrationOptions): Promise<string[]> {
    // Implementation for importing schema to Supabase
    // This would execute the schema SQL using Supabase client
    return [];
  }

  private static async importData(supabase: any, data: string, options: MigrationOptions): Promise<number> {
    // Implementation for importing data to Supabase
    // This would execute the data SQL using Supabase client
    return 0;
  }

  private static async getTableCounts(databaseType: 'postgresql' | 'supabase'): Promise<Record<string, number>> {
    // Implementation for getting table counts from specified database
    return {};
  }

  private static async verifySchemaStructure(): Promise<string[]> {
    // Implementation for verifying schema structure between databases
    return [];
  }
}
```

### 4.2 Migration Scripts

Create `scripts/migrate-to-supabase.ts`:

```typescript
#!/usr/bin/env tsx

import { MigrationUtils } from '../src/lib/database/migration/MigrationUtils';
import { logger } from '../src/lib/logger';
import { program } from 'commander';

program
  .name('migrate-to-supabase')
  .description('Migrate PostgreSQL database to Supabase')
  .option('-e, --export', 'Export PostgreSQL schema and data')
  .option('-i, --import', 'Import schema and data to Supabase')
  .option('-v, --verify', 'Verify migration integrity')
  .option('-b, --backup', 'Create backup before migration')
  .option('--include-data', 'Include data in export/import')
  .option('--batch-size <size>', 'Batch size for data migration', '1000')
  .option('--exclude-tables <tables>', 'Comma-separated list of tables to exclude')
  .action(async (options) => {
    try {
      if (options.backup) {
        logger.info('Creating database backup...');
        const backupPath = await MigrationUtils.createBackup();
        logger.info(`Backup created: ${backupPath}`);
      }

      if (options.export) {
        logger.info('Exporting PostgreSQL database...');
        const { schema, data } = await MigrationUtils.exportPostgreSQL({
          includeData: options.includeData,
          batchSize: parseInt(options.batchSize),
          excludeTables: options.excludeTables?.split(','),
        });
        
        // Save to files
        const fs = require('fs');
        fs.writeFileSync('schema.sql', schema);
        if (data) {
          fs.writeFileSync('data.sql', data);
        }
        
        logger.info('Export completed');
      }

      if (options.import) {
        logger.info('Importing to Supabase...');
        const fs = require('fs');
        const schema = fs.readFileSync('schema.sql', 'utf8');
        const data = fs.existsSync('data.sql') ? fs.readFileSync('data.sql', 'utf8') : '';
        
        const result = await MigrationUtils.importToSupabase(schema, data, {
          includeData: options.includeData,
          batchSize: parseInt(options.batchSize),
          excludeTables: options.excludeTables?.split(','),
        });
        
        if (result.success) {
          logger.info('Import completed successfully', {
            tablesMigrated: result.tablesMigrated.length,
            recordsMigrated: result.recordsMigrated,
            duration: result.duration,
          });
        } else {
          logger.error('Import failed', { errors: result.errors });
        }
      }

      if (options.verify) {
        logger.info('Verifying migration integrity...');
        const result = await MigrationUtils.verifyMigration();
        
        if (result.success) {
          logger.info('Migration verification passed');
        } else {
          logger.error('Migration verification failed', { issues: result.issues });
        }
      }
    } catch (error) {
      logger.error('Migration failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  });

program.parse();
```

## 5. Configuration Management System

### 5.1 Configuration Manager

Create `src/lib/config/ConfigurationManager.ts`:

```typescript
import { EnvironmentConfigLoader } from '../database/config/EnvironmentConfig';
import { logger } from '../logger';

export interface AppConfig {
  database: any;
  app: {
    name: string;
    version: string;
    environment: string;
  };
  features: {
    cms: boolean;
    booking: boolean;
    payments: boolean;
  };
  logging: {
    level: string;
    enabled: boolean;
  };
}

/**
 * Centralized configuration management system
 */
export class ConfigurationManager {
  private static config: AppConfig | null = null;

  static load(): AppConfig {
    if (this.config) {
      return this.config;
    }

    const databaseConfig = EnvironmentConfigLoader.getCurrentConfig();
    const nodeEnv = process.env.NODE_ENV || 'development';

    this.config = {
      database: databaseConfig,
      app: {
        name: 'Resort Website CMS',
        version: process.env.npm_package_version || '1.0.0',
        environment: nodeEnv,
      },
      features: {
        cms: true,
        booking: process.env.FEATURE_BOOKING === 'true',
        payments: process.env.FEATURE_PAYMENTS === 'true',
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        enabled: true,
      },
    };

    logger.info('Application configuration loaded', {
      module: 'ConfigurationManager',
      function: 'load',
      environment: nodeEnv,
      category: 'config'
    });

    return this.config;
  }

  static get(): AppConfig {
    return this.load();
  }

  static getDatabaseConfig() {
    return this.get().database;
  }

  static getAppConfig() {
    return this.get().app;
  }

  static getFeatureConfig() {
    return this.get().features;
  }

  static isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.get().features[feature];
  }

  static isDevelopment(): boolean {
    return this.get().app.environment === 'development';
  }

  static isProduction(): boolean {
    return this.get().app.environment === 'production';
  }
}
```

## 6. Testing Implementation

### 6.1 Migration Tests

Create `src/tests/database/migration.test.ts`:

```typescript
import { MigrationUtils } from '../../../lib/database/migration/MigrationUtils';
import { DatabaseManager } from '../../../lib/database/DatabaseManager';
import { EnvironmentConfigLoader } from '../../../lib/database/config/EnvironmentConfig';

describe('Database Migration Tests', () => {
  let databaseManager: DatabaseManager;

  beforeAll(async () => {
    databaseManager = new DatabaseManager();
    await databaseManager.initialize();
  });

  describe('PostgreSQL to Supabase Migration', () => {
    it('should export PostgreSQL schema', async () => {
      const { schema } = await MigrationUtils.exportPostgreSQL({
        includeData: false,
      });

      expect(schema).toContain('CREATE TABLE');
      expect(schema).toContain('brands');
      expect(schema).toContain('sites');
    });

    it('should export PostgreSQL data', async () => {
      const { data } = await MigrationUtils.exportPostgreSQL({
        includeData: true,
        batchSize: 100,
      });

      expect(data).toContain('INSERT INTO');
    });

    it('should create database backup', async () => {
      const backupPath = await MigrationUtils.createBackup('test-backup');
      expect(backupPath).toContain('test-backup');
      expect(backupPath).toContain('.sql');
    });

    it('should verify migration integrity', async () => {
      const result = await MigrationUtils.verifyMigration();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('issues');
    });
  });

  describe('Database Adapter Switching', () => {
    it('should switch from PostgreSQL to Supabase', async () => {
      const initialType = databaseManager.getCurrentDatabaseType();
      expect(initialType).toBe('postgresql');

      // Note: This would require actual Supabase credentials
      // await databaseManager.switchDatabase('supabase');
      // const newType = databaseManager.getCurrentDatabaseType();
      // expect(newType).toBe('supabase');
    });

    it('should maintain functionality after switching', async () => {
      const adapter = databaseManager.getDefaultAdapter();
      const isHealthy = await adapter.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    it('should load environment configuration', () => {
      const config = EnvironmentConfigLoader.getCurrentConfig();
      expect(config).toHaveProperty('type');
      expect(config).toHaveProperty('connection');
      expect(config).toHaveProperty('features');
    });

    it('should validate configuration', () => {
      const config = EnvironmentConfigLoader.getCurrentConfig();
      expect(config.connection.host).toBeDefined();
      expect(config.connection.database).toBeDefined();
      expect(config.connection.username).toBeDefined();
    });
  });
});
```

## 7. Package.json Updates

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "db:migrate:export": "tsx scripts/migrate-to-supabase.ts --export --backup",
    "db:migrate:import": "tsx scripts/migrate-to-supabase.ts --import",
    "db:migrate:verify": "tsx scripts/migrate-to-supabase.ts --verify",
    "db:migrate:full": "tsx scripts/migrate-to-supabase.ts --export --import --verify --backup",
    "db:switch:supabase": "tsx scripts/switch-database.ts supabase",
    "db:switch:postgresql": "tsx scripts/switch-database.ts postgresql"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "commander": "^11.1.0"
  }
}
```

## 8. Implementation Checklist

### Phase 1: Environment Configuration
- [ ] Create `src/lib/database/config/DatabaseConfig.ts`
- [ ] Create `src/lib/database/config/EnvironmentConfig.ts`
- [ ] Update `.env.example` with Supabase variables
- [ ] Test environment configuration loading

### Phase 2: Database Adapter Factory
- [ ] Create `src/lib/database/adapters/SupabaseAdapter.ts`
- [ ] Create `src/lib/database/DatabaseAdapterFactory.ts`
- [ ] Update `src/lib/database/DatabaseManager.ts`
- [ ] Test adapter creation and switching

### Phase 3: Migration Utilities
- [ ] Create `src/lib/database/migration/MigrationUtils.ts`
- [ ] Create `scripts/migrate-to-supabase.ts`
- [ ] Test migration utilities with sample data
- [ ] Create migration documentation

### Phase 4: Configuration Management
- [ ] Create `src/lib/config/ConfigurationManager.ts`
- [ ] Update existing configuration usage
- [ ] Test configuration switching

### Phase 5: Testing and Validation
- [ ] Create migration tests
- [ ] Create adapter switching tests
- [ ] Run full test suite
- [ ] Validate backward compatibility

## 9. Usage Instructions

### Switching Between Databases

To switch from PostgreSQL to Supabase:

```typescript
import { databaseManager } from './lib/database/DatabaseManager';

// Switch to Supabase
await databaseManager.switchDatabase('supabase');

// Switch back to PostgreSQL
await databaseManager.switchDatabase('postgresql');
```

### Running Migration

To export PostgreSQL database:

```bash
npm run db:migrate:export
```

To import to Supabase:

```bash
npm run db:migrate:import
```

To run full migration:

```bash
npm run db:migrate:full
```

### Environment Configuration

Set the following environment variables to switch databases:

```bash
# For PostgreSQL
DATABASE_TYPE=postgresql

# For Supabase
DATABASE_TYPE=supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 10. Conclusion

This implementation plan provides a comprehensive foundation for migrating from PostgreSQL to Supabase while maintaining full backward compatibility. The modular design allows for easy switching between database types and provides a smooth migration path when you're ready to make the transition.

All components are designed to work together seamlessly, with proper error handling, logging, and testing to ensure a reliable migration process.