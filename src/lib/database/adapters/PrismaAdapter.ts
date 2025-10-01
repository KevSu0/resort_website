import { PrismaClient } from '@prisma/client';
import type {
  IDatabaseAdapter,
  DatabaseConnectionConfig,
  QueryOptions,
  PaginationOptions,
  QueryResult,
  DatabaseTransaction,
  DatabaseCapabilities,
} from '../interfaces/IDatabaseAdapter';

/**
 * Strongly typed parameter replacement
 */
type TypedParameterArray = Array<string | number | boolean | Date | null | undefined>;



/**
 * Strongly typed where clause result
 */
interface ParsedWhereClause {
  [field: string]: 
    | string 
    | number 
    | boolean 
    | Date
    | { equals?: unknown; contains?: unknown; startsWith?: unknown; endsWith?: unknown; gt?: unknown; gte?: unknown; lt?: unknown; lte?: unknown; in?: unknown[] }
    | undefined;
}

/**
 * Prisma Database Adapter
 *
 * Implements the IDatabaseAdapter interface using Prisma ORM.
 * Provides type-safe database operations with Prisma's optimized query engine.
 */

export class PrismaAdapter implements IDatabaseAdapter {
  private prisma: PrismaClient | null = null;
  private config: DatabaseConnectionConfig | null = null;

  async connect(config: DatabaseConnectionConfig): Promise<void> {
    this.config = config;

    // Construct database URL from config
    const databaseUrl = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;

    if (config.ssl) {
      process.env.DATABASE_URL = `${databaseUrl}?sslmode=require`;
    } else {
      process.env.DATABASE_URL = `${databaseUrl}?sslmode=disable`;
    }

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    // Test the connection
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.prisma) return false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async query<T = unknown>(
    sql: string,
    params: TypedParameterArray = [],
     
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    try {
      // Use parameterized query to prevent SQL injection
      let query = sql;
      params.forEach((param, index) => {
        query = query.replace(/\$\d+/, `$${index + 1}`);
      });

      const result = await this.prisma.$queryRawUnsafe(query, ...params);

      // Convert result to array if it's not already
      const data = Array.isArray(result) ? result : [result];

      return {
        data: data as T[],
        total: data.length,
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async queryWithPagination<T = unknown>(
    sql: string,
    params: TypedParameterArray = [],
    pagination: PaginationOptions = {},
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const { page = 1, limit = 10, orderBy, orderDirection = 'asc' } = pagination;
    const offset = (page - 1) * limit;

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as count_query`;
    const countResult = await this.query<{ total: bigint }>(countSql, params, options);
    const total = Number(countResult.data[0]?.total || 0);

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
    params: TypedParameterArray = [],
    options: QueryOptions = {}
  ): Promise<T | null> {
    const result = await this.query<T>(sql + ' LIMIT 1', params, options);
    return result.data[0] || null;
  }

  async queryScalar<T = unknown>(
    sql: string,
    params: TypedParameterArray = [],
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
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    return await this.prisma.$transaction(async (tx: import('@prisma/client').PrismaClient) => {
      const txAdapter: DatabaseTransaction = {
        async commit(): Promise<void> {
          // Prisma handles commit automatically
        },
        async rollback(): Promise<void> {
          // Prisma handles rollback automatically on error
          throw new Error('Transaction rollback initiated');
        },
        async query<U = unknown>(sql: string, params: TypedParameterArray = []): Promise<QueryResult<U>> {
          const result = await tx.$queryRawUnsafe(sql, ...params);
          const data = Array.isArray(result) ? result : [result];
          return {
            data: data as U[],
            total: data.length,
          };
        },
      };

      return await callback(txAdapter);
    });
  }

  async insert<T = unknown>(
    table: string,
    data: Partial<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    // Use Prisma's dynamic model access if available, otherwise fall back to raw query
    try {
      // Try to use Prisma model first with proper typing
      const prismaClient = this.prisma as unknown as Record<string, unknown>;
      const model = prismaClient[table];
      if (model && typeof model === 'object' && model !== null && 'create' in model && typeof model.create === 'function') {
        return await (model.create as { (args: { data: Partial<T> }): Promise<T> })({ data });
      }
    } catch {
      // Fall back to raw query if Prisma model doesn't exist
    }

    // Raw query fallback
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const sql = `
      INSERT INTO ${this.escapeIdentifier(table)} (${columns.map(col => this.escapeIdentifier(col)).join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query<T>(sql, values as TypedParameterArray, options);
    return result.data[0] as T;
  }

  async insertMany<T = unknown>(
    table: string,
    dataArray: Partial<T>[],
    options: QueryOptions = {}
  ): Promise<T[]> {
    if (dataArray.length === 0) return [];

    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    // Try to use Prisma's createMany if available
    try {
      const prismaClient = this.prisma as unknown as Record<string, unknown>;
      const model = prismaClient[table];
      if (model && typeof model === 'object' && model !== null && 'createMany' in model && typeof model.createMany === 'function') {
        await (model.createMany as { (args: { data: Partial<T>[] }): Promise<{ count: number }> })({ data: dataArray });
        // Return the inserted data (Prisma doesn't return it in createMany)
        return dataArray as T[];
      }
    } catch {
      // Fall back to raw query
    }

    // Raw query fallback
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

    const result = await this.query<T>(sql, values as TypedParameterArray, options);
    return result.data;
  }

  async update<T = unknown>(
    table: string,
    data: Partial<T>,
    where: string,
    params: TypedParameterArray = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    // Try to use Prisma model first
    try {
      const prismaClient = this.prisma as unknown as Record<string, unknown>;
      const model = prismaClient[table];
      if (model && typeof model === 'object' && model !== null && 'updateMany' in model && typeof model.updateMany === 'function') {
        // Parse where clause for Prisma (this is simplified)
        const whereClause = this.parseWhereClause(where, params);
        await (model.updateMany as { (args: { data: Partial<T>; where: ParsedWhereClause }): Promise<{ count: number }> })({ data, where: whereClause });
        // Return updated data (simplified)
        const result = await this.query<T>(`SELECT * FROM ${this.escapeIdentifier(table)} WHERE ${where}`, params);
        return result.data;
      }
    } catch {
      // Fall back to raw query
    }

    // Raw query fallback
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
    const result = await this.query<T>(sql, allParams as TypedParameterArray, options);
    return result.data;
  }

  async delete(
    table: string,
    where: string,
    params: TypedParameterArray = [],
    options: QueryOptions = {}
  ): Promise<number> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    // Try to use Prisma model first
    try {
      const prismaClient = this.prisma as unknown as Record<string, unknown>;
      const model = prismaClient[table];
      if (model && typeof model === 'object' && model !== null && 'deleteMany' in model && typeof model.deleteMany === 'function') {
        const whereClause = this.parseWhereClause(where, params);
        const result = await (model.deleteMany as { (args: { where: ParsedWhereClause }): Promise<{ count: number }> })({ where: whereClause });
        return result.count;
      }
    } catch {
      // Fall back to raw query
    }

    // Raw query fallback
    const sql = `DELETE FROM ${this.escapeIdentifier(table)} WHERE ${where}`;
    const result = await this.query(sql, params, options);
    return result.total || 0;
  }

  async count(
    table: string,
    where: string = '1=1',
    params: TypedParameterArray = [],
    options: QueryOptions = {}
  ): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM ${this.escapeIdentifier(table)} WHERE ${where}`;
    const result = await this.queryOne<{ count: bigint }>(sql, params, options);
    return result ? Number(result.count) : 0;
  }

  async exists(
    table: string,
    where: string,
    params: TypedParameterArray = [],
    options: QueryOptions = {}
  ): Promise<boolean> {
    const sql = `SELECT 1 FROM ${this.escapeIdentifier(table)} WHERE ${where} LIMIT 1`;
    const result = await this.queryOne(sql, params, options);
    return result !== null;
  }

  async getLastInsertId(): Promise<string | number> {
    const sql = 'SELECT lastval() as id';
    const result = await this.queryOne<{ id: string | number }>(sql);
    return result?.id || 0;
  }

  escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  escapeValue<T>(value: T): T {
    // Prisma handles value escaping automatically
    return value;
  }

  async beginTransaction(): Promise<DatabaseTransaction> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    return await this.prisma.$transaction(async (tx: import('@prisma/client').PrismaClient) => {
      return {
        async commit(): Promise<void> {
          // Prisma handles commit automatically
        },
        async rollback(): Promise<void> {
          // Prisma handles rollback automatically on error
          throw new Error('Transaction rollback initiated');
        },
        async query<T = unknown>(sql: string, params: TypedParameterArray = []): Promise<QueryResult<T>> {
          const result = await tx.$queryRawUnsafe(sql, ...params);
          const data = Array.isArray(result) ? result : [result];
          return {
            data: data as T[],
            total: data.length,
          };
        },
      } as DatabaseTransaction;
    });
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

  /**
   * Parse a SQL WHERE clause into a Prisma where object (simplified implementation)
   */
  private parseWhereClause(where: string, params: TypedParameterArray): ParsedWhereClause {
    // This is a simplified parser - in a real implementation,
    // you'd want a more sophisticated WHERE clause parser
    const conditions: ParsedWhereClause = {};

    // Simple handling for basic conditions like "id = $1"
    const matches = where.match(/(\w+)\s*=\s*\$(\d+)/g);
    if (matches) {
      matches.forEach(match => {
        const [, field, paramIndex] = match.match(/(\w+)\s*=\s*\$(\d+)/) || [];
        if (field && paramIndex) {
          const paramValue = params[parseInt(paramIndex) - 1];
          // Only add non-null values to the where clause
          if (paramValue !== null && paramValue !== undefined) {
            conditions[field] = paramValue;
          }
        }
      });
    }

    return conditions;
  }
}