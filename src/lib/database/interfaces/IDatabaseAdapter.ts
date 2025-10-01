/**
 * Database Adapter Interface
 *
 * This interface defines the contract for all database adapters,
 * ensuring database-agnostic operations across different database systems.
 */

export interface DatabaseConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
    idleTimeoutMillis?: number;
  };
}

export interface QueryOptions {
  transaction?: DatabaseTransaction;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface QueryResult<T = unknown> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface DatabaseTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface IDatabaseAdapter {
  /**
   * Initialize the database connection
   */
  connect(config: DatabaseConnectionConfig): Promise<void>;

  /**
   * Close the database connection
   */
  disconnect(): Promise<void>;

  /**
   * Check if the database connection is healthy
   */
  healthCheck(): Promise<boolean>;

  /**
   * Execute a raw SQL query
   */
  query<T = unknown>(sql: string, params?: unknown[], options?: QueryOptions): Promise<QueryResult<T>>;

  /**
   * Execute a query with pagination
   */
  queryWithPagination<T = unknown>(
    sql: string,
    params?: unknown[],
    pagination?: PaginationOptions,
    options?: QueryOptions
  ): Promise<QueryResult<T>>;

  /**
   * Execute a query that returns a single record
   */
  queryOne<T = unknown>(sql: string, params?: unknown[], options?: QueryOptions): Promise<T | null>;

  /**
   * Execute a query that returns a scalar value
   */
  queryScalar<T = unknown>(sql: string, params?: unknown[], options?: QueryOptions): Promise<T | null>;

  /**
   * Execute multiple queries in a transaction
   */
  transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;

  /**
   * Insert a record into a table
   */
  insert<T = Record<string, unknown>>(table: string, data: Partial<T>, options?: QueryOptions): Promise<T>;

  /**
   * Insert multiple records into a table
   */
  insertMany<T = Record<string, unknown>>(table: string, data: Partial<T>[], options?: QueryOptions): Promise<T[]>;

  /**
   * Update records in a table
   */
  update<T = Record<string, unknown>>(
    table: string,
    data: Partial<T>,
    where: string,
    params?: unknown[],
    options?: QueryOptions
  ): Promise<T[]>;

  /**
   * Delete records from a table
   */
  delete(table: string, where: string, params?: unknown[], options?: QueryOptions): Promise<number>;

  /**
   * Count records in a table
   */
  count(table: string, where?: string, params?: unknown[], options?: QueryOptions): Promise<number>;

  /**
   * Check if a record exists
   */
  exists(table: string, where: string, params?: unknown[], options?: QueryOptions): Promise<boolean>;

  /**
   * Get the last inserted ID
   */
  getLastInsertId(table?: string): Promise<string | number>;

  /**
   * Escape identifiers (table names, column names)
   */
  escapeIdentifier(identifier: string): string;

  /**
   * Escape values
   */
  escapeValue(value: unknown): unknown;

  /**
   * Begin a transaction
   */
  beginTransaction(): Promise<DatabaseTransaction>;

  /**
   * Get database-specific features and capabilities
   */
  getCapabilities(): DatabaseCapabilities;
}

export interface DatabaseCapabilities {
  supportsTransactions: boolean;
  supportsJSON: boolean;
  supportsFullTextSearch: boolean;
  supportsWindowFunctions: boolean;
  supportsCTE: boolean;
  supportsArrays: boolean;
  supportsUUID: boolean;
  supportsRowLevelSecurity: boolean;
  supportsPartialIndexes: boolean;
  supportsGeneratedColumns: boolean;
  supportsMaterializedViews: boolean;
  supportsTriggers: boolean;
  supportsStoredProcedures: boolean;
  defaultVarCharLength?: number;
  maxVarCharLength?: number;
  maxConnections?: number;
}