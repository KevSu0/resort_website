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
  transaction?: any;
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

export interface QueryResult<T = any> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface DatabaseTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
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
  query<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<QueryResult<T>>;

  /**
   * Execute a query with pagination
   */
  queryWithPagination<T = any>(
    sql: string,
    params?: any[],
    pagination?: PaginationOptions,
    options?: QueryOptions
  ): Promise<QueryResult<T>>;

  /**
   * Execute a query that returns a single record
   */
  queryOne<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<T | null>;

  /**
   * Execute a query that returns a scalar value
   */
  queryScalar<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<T | null>;

  /**
   * Execute multiple queries in a transaction
   */
  transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;

  /**
   * Insert a record into a table
   */
  insert<T = any>(table: string, data: Partial<T>, options?: QueryOptions): Promise<T>;

  /**
   * Insert multiple records into a table
   */
  insertMany<T = any>(table: string, data: Partial<T>[], options?: QueryOptions): Promise<T[]>;

  /**
   * Update records in a table
   */
  update<T = any>(
    table: string,
    data: Partial<T>,
    where: string,
    params?: any[],
    options?: QueryOptions
  ): Promise<T[]>;

  /**
   * Delete records from a table
   */
  delete(table: string, where: string, params?: any[], options?: QueryOptions): Promise<number>;

  /**
   * Count records in a table
   */
  count(table: string, where?: string, params?: any[], options?: QueryOptions): Promise<number>;

  /**
   * Check if a record exists
   */
  exists(table: string, where: string, params?: any[], options?: QueryOptions): Promise<boolean>;

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
  escapeValue(value: any): any;

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