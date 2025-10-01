import { Pool } from 'pg';
import {
  IDatabaseAdapter,
  DatabaseConnectionConfig,
  QueryOptions,
  PaginationOptions,
  QueryResult,
  DatabaseTransaction,
  DatabaseCapabilities,
} from '../interfaces/IDatabaseAdapter';

/**
 * PostgreSQL Database Adapter
 *
 * Implements the IDatabaseAdapter interface for PostgreSQL databases.
 * Provides PostgreSQL-specific optimizations and features.
 */

export class PostgreSQLAdapter implements IDatabaseAdapter {
  private pool: Pool | null = null;
  private config: DatabaseConnectionConfig | null = null;

  async connect(config: DatabaseConnectionConfig): Promise<void> {
    this.config = config;

    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      min: config.pool?.min || 2,
      max: config.pool?.max || 10,
      idleTimeoutMillis: config.pool?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test the connection
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch {
      return false;
    }
  }

  async query<T = unknown>(
    sql: string,
    params: unknown[] = [],
     
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return {
        data: result.rows,
        total: result.rowCount || undefined,
      };
    } finally {
      client.release();
    }
  }

  async queryWithPagination<T = unknown>(
    sql: string,
    params: unknown[] = [],
    pagination: PaginationOptions = {},
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const { page = 1, limit = 10, orderBy, orderDirection = 'asc' } = pagination;
    const offset = (page - 1) * limit;

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as count_query`;
    const countResult = await this.query<{ total: string }>(countSql, params, options);
    const total = parseInt(countResult.data[0]?.total || '0', 10);

    // Data query with pagination
    let dataSql = sql;
    if (orderBy) {
      dataSql += ` ORDER BY ${this.escapeIdentifier(orderBy)} ${orderDirection.toUpperCase()}`;
    }
    dataSql += ` LIMIT ${limit} OFFSET ${offset}`;

    const dataResult = await this.query<T>(dataSql, params, options);

    return {
      data: dataResult.data,
      total,
      page,
      limit,
      hasMore: offset + dataResult.data.length < total,
    };
  }

  async queryOne<T = unknown>(
    sql: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<T | null> {
    const result = await this.query<T>(sql, params, options);
    return result.data[0] || null;
  }

  async queryScalar<T = unknown>(
    sql: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<T | null> {
    const result = await this.queryOne<{ value: T }>(sql, params, options);
    return result ? (result as Record<string, unknown>).value || result : null;
  }

  async transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const tx: DatabaseTransaction = {
        async commit(): Promise<void> {
          await client.query('COMMIT');
        },
        async rollback(): Promise<void> {
          await client.query('ROLLBACK');
        },
        async query<U = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<U>> {
          const result = await client.query(sql, params);
          return {
            data: result.rows,
            total: result.rowCount || undefined,
          };
        },
      };

      const result = await callback(tx);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async insert<T = unknown>(table: string, data: Partial<T>, options: QueryOptions = {}): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const sql = `
      INSERT INTO ${this.escapeIdentifier(table)} (${columns.map(col => this.escapeIdentifier(col)).join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query<T>(sql, values, options);
    return result.data[0] as T;
  }

  async insertMany<T = unknown>(
    table: string,
    dataArray: Partial<T>[],
    options: QueryOptions = {}
  ): Promise<T[]> {
    if (dataArray.length === 0) return [];

    const columns = Object.keys(dataArray[0]);
    const values = dataArray.flatMap(data => Object.values(data));
    const placeholders = dataArray.map((_, rowIndex) =>
      columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')
    ).join('), (');

    const sql = `
      INSERT INTO ${this.escapeIdentifier(table)} (${columns.map(col => this.escapeIdentifier(col)).join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query<T>(sql, values, options);
    return result.data;
  }

  async update<T = unknown>(
    table: string,
    data: Partial<T>,
    where: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) =>
      `${this.escapeIdentifier(col)} = $${index + 1}`
    ).join(', ');

    const sql = `
      UPDATE ${this.escapeIdentifier(table)}
      SET ${setClause}
      WHERE ${where}
      RETURNING *
    `;

    const allParams = [...values, ...params];
    const result = await this.query<T>(sql, allParams, options);
    return result.data;
  }

  async delete(
    table: string,
    where: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<number> {
    const sql = `DELETE FROM ${this.escapeIdentifier(table)} WHERE ${where}`;
    const result = await this.query(sql, params, options);
    return result.total || 0;
  }

  async count(
    table: string,
    where: string = '1=1',
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM ${this.escapeIdentifier(table)} WHERE ${where}`;
    const result = await this.queryOne<{ count: string }>(sql, params, options);
    return result ? parseInt(result.count, 10) : 0;
  }

  async exists(
    table: string,
    where: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<boolean> {
    const sql = `SELECT 1 FROM ${this.escapeIdentifier(table)} WHERE ${where} LIMIT 1`;
    const result = await this.queryOne(sql, params, options);
    return result !== null;
  }

  async getLastInsertId(table?: string): Promise<string | number> {
    if (table) {
      const sql = `SELECT lastval() as id`;
      const result = await this.queryOne<{ id: string | number }>(sql);
      return result?.id || 0;
    }
    const sql = 'SELECT lastval() as id';
    const result = await this.queryOne<{ id: string | number }>(sql);
    return result?.id || 0;
  }

  escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  escapeValue<T>(value: T): T {
    // pg library automatically escapes values, so we just return the value
    return value;
  }

  async beginTransaction(): Promise<DatabaseTransaction> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    await client.query('BEGIN');

    return {
      async commit(): Promise<void> {
        await client.query('COMMIT');
        client.release();
      },
      async rollback(): Promise<void> {
        await client.query('ROLLBACK');
        client.release();
      },
      async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
        const result = await client.query(sql, params);
        return {
          data: result.rows,
          total: result.rowCount || undefined,
        };
      },
    };
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
}