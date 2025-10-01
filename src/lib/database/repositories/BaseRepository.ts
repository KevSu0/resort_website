import { IDatabaseAdapter, QueryOptions, PaginationOptions, QueryResult } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

/**
 * Base Repository Class
 *
 * Provides common CRUD operations and database access patterns
 * for all repositories in the system.
 */

export abstract class BaseRepository<T> {
  protected constructor(
    protected databaseAdapter: IDatabaseAdapter,
    protected tenantContext: ITenantContext,
    protected tableName: string
  ) {}

  /**
   * Find a single record by ID
   */
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    const sql = `SELECT * FROM ${this.getTableName()} WHERE id = $1`;
    return await this.databaseAdapter.queryOne<T>(sql, [id], options);
  }

  /**
   * Find a single record by a field
   */
  async findBy(
    field: string,
    value: any,
    options?: QueryOptions
  ): Promise<T | null> {
    const sql = `SELECT * FROM ${this.getTableName()} WHERE ${this.escapeIdentifier(field)} = $1`;
    return await this.databaseAdapter.queryOne<T>(sql, [value], options);
  }

  /**
   * Find multiple records by a field
   */
  async findManyBy(
    field: string,
    value: any,
    options?: QueryOptions
  ): Promise<T[]> {
    const sql = `SELECT * FROM ${this.getTableName()} WHERE ${this.escapeIdentifier(field)} = $1`;
    const result = await this.databaseAdapter.query<T>(sql, [value], options);
    return result.data;
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findMany(
    where?: string,
    params?: any[],
    pagination?: PaginationOptions,
    options?: QueryOptions
  ): Promise<QueryResult<T>> {
    let sql = `SELECT * FROM ${this.getTableName()}`;

    if (where) {
      sql += ` WHERE ${where}`;
    }

    return await this.databaseAdapter.queryWithPagination<T>(
      sql,
      params || [],
      pagination,
      options
    );
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>, options?: QueryOptions): Promise<T> {
    return await this.databaseAdapter.insert<T>(this.getTableName(), data, options);
  }

  /**
   * Create multiple records
   */
  async createMany(dataArray: Partial<T>[], options?: QueryOptions): Promise<T[]> {
    return await this.databaseAdapter.insertMany<T>(this.getTableName(), dataArray, options);
  }

  /**
   * Update a record by ID
   */
  async updateById(
    id: string,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    const where = 'id = $1';
    const params = [id];
    const result = await this.databaseAdapter.update<T>(
      this.getTableName(),
      data,
      where,
      params,
      options
    );
    return result[0] || null;
  }

  /**
   * Update records matching a condition
   */
  async updateMany(
    where: string,
    params: any[],
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<T[]> {
    return await this.databaseAdapter.update<T>(
      this.getTableName(),
      data,
      where,
      params,
      options
    );
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id: string, options?: QueryOptions): Promise<boolean> {
    const where = 'id = $1';
    const params = [id];
    const deletedCount = await this.databaseAdapter.delete(this.getTableName(), where, params, options);
    return deletedCount > 0;
  }

  /**
   * Delete records matching a condition
   */
  async deleteMany(
    where: string,
    params: any[],
    options?: QueryOptions
  ): Promise<number> {
    return await this.databaseAdapter.delete(this.getTableName(), where, params, options);
  }

  /**
   * Count records
   */
  async count(
    where?: string,
    params?: any[],
    options?: QueryOptions
  ): Promise<number> {
    return await this.databaseAdapter.count(this.getTableName(), where, params, options);
  }

  /**
   * Check if a record exists
   */
  async exists(
    where: string,
    params: any[],
    options?: QueryOptions
  ): Promise<boolean> {
    return await this.databaseAdapter.exists(this.getTableName(), where, params, options);
  }

  /**
   * Find or create a record
   */
  async findOrCreate(
    findWhere: string,
    findParams: any[],
    createData: Partial<T>,
    options?: QueryOptions
  ): Promise<T> {
    const existing = await this.databaseAdapter.queryOne<T>(
      `SELECT * FROM ${this.getTableName()} WHERE ${findWhere}`,
      findParams,
      options
    );

    if (existing) return existing;

    return await this.create(createData, options);
  }

  /**
   * Update or create a record
   */
  async updateOrCreate(
    where: string,
    params: any[],
    updateData: Partial<T>,
    createData: Partial<T>,
    options?: QueryOptions
  ): Promise<T> {
    const existing = await this.databaseAdapter.queryOne<T>(
      `SELECT * FROM ${this.getTableName()} WHERE ${where}`,
      params,
      options
    );

    if (existing) {
      const updated = await this.updateMany(where, params, updateData, options);
      return updated[0];
    }

    return await this.create(createData, options);
  }

  /**
   * Execute a custom query
   */
  async query<R = T>(
    sql: string,
    params?: any[],
    options?: QueryOptions
  ): Promise<QueryResult<R>> {
    return await this.databaseAdapter.query<R>(sql, params, options);
  }

  /**
   * Execute a custom query that returns a single record
   */
  async queryOne<R = T>(
    sql: string,
    params?: any[],
    options?: QueryOptions
  ): Promise<R | null> {
    return await this.databaseAdapter.queryOne<R>(sql, params, options);
  }

  /**
   * Execute a custom query with pagination
   */
  async queryWithPagination<R = T>(
    sql: string,
    params?: any[],
    pagination?: PaginationOptions,
    options?: QueryOptions
  ): Promise<QueryResult<R>> {
    return await this.databaseAdapter.queryWithPagination<R>(sql, params, pagination, options);
  }

  /**
   * Execute operations in a transaction
   */
  async transaction<R>(
    callback: (tx: any) => Promise<R>
  ): Promise<R> {
    return await this.databaseAdapter.transaction(callback);
  }

  /**
   * Get the table name with tenant isolation applied
   */
  protected getTableName(): string {
    return this.tableName;
  }

  /**
   * Escape a column/field identifier
   */
  protected escapeIdentifier(identifier: string): string {
    return this.databaseAdapter.escapeIdentifier(identifier);
  }

  /**
   * Apply tenant isolation to a SQL query
   */
  protected applyTenantIsolation(sql: string): string {
    return this.tenantContext.applyTenantIsolation(sql, this.tableName);
  }

  /**
   * Get tenant-aware cache key
   */
  protected getCacheKey(baseKey: string): string {
    return this.tenantContext.getCacheKey(baseKey);
  }

  /**
   * Get current tenant ID
   */
  protected getCurrentTenantId(): string | null {
    const tenant = this.tenantContext.getCurrentTenant();
    return tenant ? tenant.id : null;
  }

  /**
   * Get current site ID
   */
  protected getCurrentSiteId(): string | null {
    const tenant = this.tenantContext.getCurrentTenant();
    return tenant ? tenant.siteId : null;
  }

  /**
   * Get current brand ID
   */
  protected getCurrentBrandId(): string | null {
    const tenant = this.tenantContext.getCurrentTenant();
    return tenant ? tenant.brandId : null;
  }
}