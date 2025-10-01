# PostgreSQL Optimization Recommendations for Resort Website

## Executive Summary

This document provides comprehensive PostgreSQL-specific recommendations for the resort website project, addressing performance optimizations, feature utilization, type safety improvements, logging, security, and scalability considerations. The recommendations are prioritized by impact and implementation effort.

## Current Setup Analysis

### Strengths
- Modern PostgreSQL 15 with appropriate extensions (uuid-ossp, pg_trgm, btree_gin, btree_gist)
- Multi-tenant architecture with proper isolation
- Comprehensive schema with versioning and workflow support
- Docker-based deployment with Redis caching
- Prisma ORM with type-safe operations

### Identified Issues
- 12 `any` types in PrismaAdapter causing type safety gaps
- 8 console statements in DatabaseManager lacking proper logging
- Basic connection pooling configuration
- Missing PostgreSQL-specific optimizations
- No comprehensive monitoring strategy

---

## 1. PostgreSQL Performance Optimizations

### 1.1 Connection Pooling Improvements

**Current State**: Basic pool configuration (min: 2, max: 10)

**Recommendations**:

```typescript
// Enhanced PostgreSQL Adapter Configuration
const optimizedPoolConfig = {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.username,
  password: config.password,
  ssl: config.ssl ? { rejectUnauthorized: false } : false,
  
  // Optimized pool settings
  min: Math.max(2, Math.floor(config.pool?.min || 5)),
  max: Math.min(50, Math.max(10, config.pool?.max || 20)), // Dynamic based on load
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  
  // PostgreSQL-specific optimizations
  statement_timeout: 30000,
  query_timeout: 30000,
  application_name: 'resort-cms',
  
  // Connection reuse settings
  allowExitOnIdle: true,
  maxUses: 7500, // Recreate connections after N uses
};
```

**Implementation Steps**:
1. Update [`PostgreSQLAdapter.ts`](src/lib/database/adapters/PostgreSQLAdapter.ts:26-37) with enhanced pool config
2. Add environment-specific pool settings
3. Implement connection pool monitoring
4. Add connection health checks

### 1.2 Query Optimization Strategies

**Index Improvements**:

```sql
-- Add composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_pages_site_status_published 
ON pages(site_id, status, published_at DESC) 
WHERE status IN ('PUBLISHED', 'SCHEDULED');

CREATE INDEX CONCURRENTLY idx_content_blocks_page_order 
ON content_blocks(page_id, "order", is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_users_brand_status 
ON users(brand_id, status) 
WHERE status = 'ACTIVE';

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_audit_logs_recent 
ON audit_logs(created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- GIN indexes for JSONB columns
CREATE INDEX CONCURRENTLY idx_pages_content_gin 
ON pages USING gin(content) 
WHERE content IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_media_tags_gin 
ON media USING gin(tags);
```

**Query Pattern Optimizations**:

```typescript
// Optimized repository methods for common patterns
export class OptimizedPageRepository extends BaseRepository<Page> {
  // Efficient paginated queries with cursor-based pagination
  async findPublishedPages(
    siteId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<QueryResult<Page>> {
    const sql = cursor
      ? `SELECT * FROM ${this.getTableName()} 
         WHERE site_id = $1 AND status = 'PUBLISHED' AND id < $2
         ORDER BY published_at DESC, id DESC
         LIMIT $3`
      : `SELECT * FROM ${this.getTableName()} 
         WHERE site_id = $1 AND status = 'PUBLISHED'
         ORDER BY published_at DESC, id DESC
         LIMIT $3`;
    
    const params = cursor ? [siteId, cursor, limit] : [siteId, limit];
    return await this.databaseAdapter.queryWithPagination<Page>(sql, params);
  }

  // Efficient search with full-text search
  async searchPages(
    siteId: string,
    query: string,
    limit: number = 10
  ): Promise<QueryResult<Page>> {
    const sql = `
      SELECT *, 
        ts_rank(search_vector, plainto_tsquery($2)) as rank
      FROM ${this.getTableName()} 
      WHERE site_id = $1 
        AND search_vector @@ plainto_tsquery($2)
        AND status = 'PUBLISHED'
      ORDER BY rank DESC, published_at DESC
      LIMIT $3
    `;
    
    return await this.databaseAdapter.query<Page>(sql, [siteId, query, limit]);
  }
}
```

### 1.3 Caching Strategies with Redis

**Multi-Level Caching Implementation**:

```typescript
// Enhanced cache service with PostgreSQL integration
export class PostgreSQLCacheService {
  private redis: Redis;
  private localCache: LRUCache<string, any>;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.localCache = new LRUCache({ max: 1000, ttl: 300000 }); // 5 minutes
  }

  // Cache-aside pattern for database queries
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      useLocalCache?: boolean;
      invalidateOn?: string[];
    } = {}
  ): Promise<T> {
    const { ttl = 3600, useLocalCache = true, invalidateOn = [] } = options;
    
    // Try local cache first
    if (useLocalCache && this.localCache.has(key)) {
      return this.localCache.get(key);
    }
    
    // Try Redis cache
    const cached = await this.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      if (useLocalCache) {
        this.localCache.set(key, data);
      }
      return data;
    }
    
    // Fetch from database
    const data = await fetcher();
    
    // Cache in both layers
    await this.redis.setex(key, ttl, JSON.stringify(data));
    if (useLocalCache) {
      this.localCache.set(key, data);
    }
    
    // Set up cache invalidation
    for (const table of invalidateOn) {
      await this.addToInvalidationSet(table, key);
    }
    
    return data;
  }
  
  // Smart cache invalidation
  async invalidateTable(table: string): Promise<void> {
    const keys = await this.redis.smembers(`invalidation:${table}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
      await this.redis.del(`invalidation:${table}`);
      
      // Clear from local cache
      keys.forEach(key => this.localCache.delete(key));
    }
  }
}
```

---

## 2. PostgreSQL Feature Utilization

### 2.1 Window Functions Optimization

**Advanced Analytics Queries**:

```sql
-- Content performance analytics with window functions
CREATE MATERIALIZED VIEW content_analytics AS
SELECT 
  p.id,
  p.title,
  p.site_id,
  p.published_at,
  COUNT(cv.id) OVER (PARTITION BY p.site_id) as site_total_versions,
  ROW_NUMBER() OVER (PARTITION BY p.site_id ORDER BY p.published_at DESC) as site_rank,
  LAG(p.published_at) OVER (PARTITION BY p.site_id ORDER BY p.published_at) as prev_published,
  DATE_TRUNC('week', p.published_at) as publish_week,
  COUNT(*) OVER (PARTITION BY DATE_TRUNC('week', p.published_at)) as weekly_count
FROM pages p
WHERE p.status = 'PUBLISHED'
WITH DATA;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_content_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY content_analytics;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires pg_cron extension)
SELECT cron.schedule('refresh-analytics', '0 */6 * * *', 'SELECT refresh_content_analytics();');
```

### 2.2 JSON/JSONB Usage Improvements

**Optimized JSONB Operations**:

```sql
-- Add JSONB indexes for specific paths
CREATE INDEX CONCURRENTLY idx_pages_settings_theme 
ON pages USING gin((settings->>'theme'));

CREATE INDEX CONCURRENTLY idx_media_metadata_dimensions 
ON media USING gin((metadata->'dimensions'));

-- JSONB path expressions for efficient queries
CREATE OR REPLACE FUNCTION get_page_meta(page pages)
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'title', page.title,
    'slug', page.slug,
    'template', page.settings->>'template',
    'theme', page.settings->>'theme',
    'lastModified', page.updated_at,
    'versionCount', (SELECT COUNT(*) FROM content_versions WHERE entity_id = page.id)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 2.3 Full-Text Search Enhancements

**Advanced Search Configuration**:

```sql
-- Custom text search configuration
CREATE TEXT SEARCH CONFIGURATION resort_search (COPY = english);

-- Add custom dictionaries for resort-specific terms
CREATE TEXT SEARCH DICTIONARY resort_terms (
  TEMPLATE = simple,
  STOPWORDS = english
);

ALTER TEXT SEARCH CONFIGURATION resort_search
  ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
  WITH resort_terms;

-- Enhanced search function
CREATE OR REPLACE FUNCTION search_content(
  search_query text,
  site_id_param uuid,
  content_types text[] DEFAULT ARRAY['page', 'content_block'],
  limit_param integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  type text,
  title text,
  content text,
  rank real,
  highlights jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    'page'::text,
    p.title,
    ts_headline('resort_search', p.content::text, plainto_tsquery(search_query)) as content,
    ts_rank(search_vector, plainto_tsquery(search_query)) as rank,
    jsonb_build_object(
      'title', ts_headline('resort_search', p.title, plainto_tsquery(search_query)),
      'content', ts_headline('resort_search', p.content::text, plainto_tsquery(search_query))
    ) as highlights
  FROM pages p
  WHERE p.site_id = site_id_param
    AND p.search_vector @@ plainto_tsquery(search_query)
    AND p.status = 'PUBLISHED'
  ORDER BY rank DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Type Safety Improvements

### 3.1 Enhanced TypeScript Interfaces

**Database-Specific Type Definitions**:

```typescript
// Enhanced database types
export interface PostgreSQLConfig extends DatabaseConnectionConfig {
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
    statement_timeout: number;
    query_timeout: number;
    application_name: string;
    allowExitOnIdle: boolean;
    maxUses: number;
  };
}

// Strongly typed query builders
export class PostgreSQLQueryBuilder<T = any> {
  private selectFields: string[] = [];
  private whereConditions: string[] = [];
  private joinClauses: string[] = [];
  private orderByFields: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  
  select<K extends keyof T>(...fields: K[]): this {
    this.selectFields = fields.map(field => String(field));
    return this;
  }
  
  where<K extends keyof T>(
    field: K, 
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'IS NULL',
    value?: T[K] | T[K][]
  ): this {
    if (operator === 'IS NULL') {
      this.whereConditions.push(`${field} IS NULL`);
    } else if (operator === 'IN') {
      const placeholders = (value as T[K][]).map((_, i) => `$${this.whereConditions.length + i + 1}`).join(', ');
      this.whereConditions.push(`${field} IN (${placeholders})`);
    } else {
      this.whereConditions.push(`${field} ${operator} $${this.whereConditions.length + 1}`);
    }
    return this;
  }
  
  build(): { sql: string; params: any[] } {
    const sql = [
      `SELECT ${this.selectFields.length ? this.selectFields.join(', ') : '*'}`,
      `FROM ${this.getTableName()}`,
      this.joinClauses.length ? this.joinClauses.join(' ') : '',
      this.whereConditions.length ? `WHERE ${this.whereConditions.join(' AND ')}` : '',
      this.orderByFields.length ? `ORDER BY ${this.orderByFields.join(', ')}` : '',
      this.limitValue ? `LIMIT ${this.limitValue}` : '',
      this.offsetValue ? `OFFSET ${this.offsetValue}` : ''
    ].filter(Boolean).join(' ');
    
    return { sql, params: this.extractParams() };
  }
}
```

### 3.2 Prisma Type Generation Optimizations

**Enhanced Prisma Configuration**:

```typescript
// prisma-generator configuration
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
  binaryTargets = ["native", "linux-musl", "darwin"]
  engineType = "library"
}

// Custom type generation script
import { PrismaClient } from '@prisma/client';
import { generateEnhancedTypes } from './scripts/generate-enhanced-types';

// Generate enhanced types with PostgreSQL-specific features
export function generatePostgresTypes() {
  const prisma = new PrismaClient();
  
  // Extract PostgreSQL-specific types
  const postgresTypes = {
    jsonb: 'Record<string, any> | null',
    uuid: 'string',
    timestamp: 'Date',
    text: 'string',
    integer: 'number',
    boolean: 'boolean',
    array: 'any[]'
  };
  
  // Generate repository interfaces
  const repositoryInterfaces = `
    export interface IPostgreSQLRepository<T> {
      findById(id: string): Promise<T | null>;
      findMany(options: QueryOptions<T>): Promise<QueryResult<T>>;
      create(data: CreateData<T>): Promise<T>;
      update(id: string, data: UpdateData<T>): Promise<T>;
      delete(id: string): Promise<boolean>;
      
      // PostgreSQL-specific methods
      search(query: SearchQuery): Promise<SearchResult<T>>;
      analytics(options: AnalyticsOptions): Promise<AnalyticsResult<T>>;
      bulkOperations(operations: BulkOperation<T>[]): Promise<BulkResult<T>>;
    }
  `;
  
  return generateEnhancedTypes(postgresTypes, repositoryInterfaces);
}
```

### 3.3 Generic Type Improvements in Adapters

**Type-Safe Adapter Implementation**:

```typescript
// Enhanced PrismaAdapter with better type safety
export class TypedPrismaAdapter implements IDatabaseAdapter {
  private prisma: PrismaClient | null = null;
  
  // Type-safe query execution
  async queryTyped<T extends PrismaModel>(
    model: T,
    operation: 'findMany' | 'findFirst' | 'findUnique' | 'create' | 'update' | 'delete',
    args?: PrismaArgs<T>
  ): Promise<PrismaResult<T>> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }
    
    const modelClient = (this.prisma as any)[model];
    if (!modelClient || typeof modelClient[operation] !== 'function') {
      throw new Error(`Model ${model} or operation ${operation} not found`);
    }
    
    return await modelClient[operation](args);
  }
  
  // Type-safe transaction with rollback
  async transactionTyped<T>(
    operations: TransactionOperation[]
  ): Promise<T[]> {
    return await this.prisma!.$transaction(async (tx) => {
      const results: T[] = [];
      
      for (const operation of operations) {
        const result = await this.executeOperation(tx, operation);
        results.push(result);
      }
      
      return results;
    });
  }
}

// Type definitions
type PrismaModel = keyof PrismaClient;
type PrismaArgs<T extends PrismaModel> = Parameters<
  PrismaClient[T][keyof PrismaClient[T]]
>[0];

type TransactionOperation = {
  model: PrismaModel;
  operation: string;
  args: any;
};
```

---

## 4. Logging and Monitoring

### 4.1 PostgreSQL-Specific Logging Configuration

**Structured Logging Implementation**:

```typescript
// Enhanced logging service for PostgreSQL
export class PostgreSQLLogger {
  private logger: Logger;
  private queryStats: Map<string, QueryStats> = new Map();
  
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/postgres.log' })
      ]
    });
  }
  
  // Query logging with performance metrics
  logQuery(sql: string, params: any[], duration: number, error?: Error): void {
    const queryHash = this.generateQueryHash(sql);
    const stats = this.queryStats.get(queryHash) || { count: 0, totalDuration: 0, avgDuration: 0 };
    
    stats.count++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.count;
    this.queryStats.set(queryHash, stats);
    
    const logData = {
      type: 'query',
      sql: this.sanitizeSql(sql),
      params: this.sanitizeParams(params),
      duration,
      error: error?.message,
      timestamp: new Date().toISOString(),
      queryHash,
      stats
    };
    
    if (error) {
      this.logger.error('Query failed', logData);
    } else if (duration > 1000) {
      this.logger.warn('Slow query detected', logData);
    } else {
      this.logger.debug('Query executed', logData);
    }
  }
  
  // Connection pool monitoring
  logPoolStats(pool: Pool): void {
    const stats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      timestamp: new Date().toISOString()
    };
    
    this.logger.info('Connection pool stats', stats);
    
    // Alert if pool is under pressure
    if (pool.waitingCount > 5) {
      this.logger.warn('Connection pool under pressure', stats);
    }
  }
}
```

### 4.2 Performance Monitoring Setup

**Query Performance Analysis**:

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create performance monitoring view
CREATE OR REPLACE VIEW query_performance AS
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent,
  stddev_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 100;

-- Create function to identify slow queries
CREATE OR REPLACE FUNCTION identify_slow_queries(
  threshold_ms integer DEFAULT 1000
)
RETURNS TABLE(
  query text,
  calls bigint,
  avg_time_ms numeric,
  total_time_ms numeric,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qs.query,
    qs.calls,
    ROUND(qs.mean_exec_time * 1000, 2) as avg_time_ms,
    ROUND(qs.total_exec_time * 1000, 2) as total_time_ms,
    CASE 
      WHEN qs.mean_exec_time * 1000 > threshold_ms THEN 'Consider adding index or optimizing query'
      WHEN qs.calls > 1000 THEN 'Frequently executed - consider caching'
      ELSE 'Acceptable performance'
    END as recommendation
  FROM pg_stat_statements qs
  WHERE qs.mean_exec_time * 1000 > threshold_ms
     OR qs.calls > 1000
  ORDER BY qs.total_exec_time DESC;
END;
$$ LANGUAGE plpgsql;
```

### 4.3 Query Analysis Tools

**Automated Query Analysis**:

```typescript
// Query analysis service
export class QueryAnalyzer {
  private prisma: PrismaClient;
  private logger: PostgreSQLLogger;
  
  constructor(prisma: PrismaClient, logger: PostgreSQLLogger) {
    this.prisma = prisma;
    this.logger = logger;
  }
  
  // Analyze query execution plan
  async analyzeQuery(sql: string, params: any[] = []): Promise<QueryAnalysis> {
    const explainSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`;
    
    try {
      const result = await this.prisma.$queryRawUnsafe(explainSql, ...params);
      const plan = result[0]['QUERY PLAN'][0];
      
      return {
        sql,
        params,
        executionTime: plan['Execution Time'],
        planningTime: plan['Planning Time'],
        totalCost: plan.Plan['Total Cost'],
        actualRows: plan.Plan['Actual Rows'],
        recommendations: this.generateRecommendations(plan),
        indexes: this.extractIndexesUsed(plan)
      };
    } catch (error) {
      this.logger.logQuery(sql, params, 0, error as Error);
      throw error;
    }
  }
  
  // Generate optimization recommendations
  private generateRecommendations(plan: any): string[] {
    const recommendations: string[] = [];
    
    if (plan['Execution Time'] > 1000) {
      recommendations.push('Query is slow - consider optimization');
    }
    
    if (plan.Plan['Actual Rows'] > plan.Plan['Plan Rows'] * 10) {
      recommendations.push('Row estimate is inaccurate - consider ANALYZE');
    }
    
    if (plan.Plan['Node Type'] === 'Seq Scan' && plan.Plan['Actual Rows'] > 1000) {
      recommendations.push('Sequential scan on large table - missing index?');
    }
    
    return recommendations;
  }
}
```

---

## 5. Security Enhancements

### 5.1 PostgreSQL Security Best Practices

**Row-Level Security Implementation**:

```sql
-- Enable row-level security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policies for multi-tenant isolation
CREATE POLICY page_isolation_policy ON pages
FOR ALL TO application_user
USING (site_id IN (
  SELECT id FROM sites WHERE brand_id = current_setting('app.current_brand_id')::uuid
));

CREATE POLICY content_block_isolation_policy ON content_blocks
FOR ALL TO application_user
USING (site_id IN (
  SELECT id FROM sites WHERE brand_id = current_setting('app.current_brand_id')::uuid
));

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(brand_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_brand_id', brand_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    site_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  ) VALUES (
    current_setting('app.current_user_id', true)::uuid,
    COALESCE(NEW.site_id, OLD.site_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', OLD,
      'new', NEW,
      'operation', TG_OP
    ),
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Connection Security Improvements

**Secure Connection Configuration**:

```typescript
// Enhanced security configuration
export const securePostgresConfig: PostgreSQLConfig = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_CA_CERT,
    cert: process.env.DB_CLIENT_CERT,
    key: process.env.DB_CLIENT_KEY
  },
  pool: {
    min: 5,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
    query_timeout: 30000,
    application_name: 'resort-cms',
    allowExitOnIdle: true,
    maxUses: 7500
  }
};

// Connection with security context
export class SecurePostgreSQLAdapter extends PostgreSQLAdapter {
  async connectWithSecurity(
    config: DatabaseConnectionConfig,
    userContext: UserContext
  ): Promise<void> {
    await this.connect(config);
    
    // Set security context
    await this.query(`
      SELECT set_tenant_context($1), 
             set_config('app.current_user_id', $2, true)
    `, [userContext.brandId, userContext.userId]);
  }
  
  // Secure query execution with validation
  async secureQuery<T = any>(
    sql: string,
    params: any[] = [],
    options: SecureQueryOptions = {}
  ): Promise<QueryResult<T>> {
    // Validate SQL injection attempts
    if (this.detectSqlInjection(sql)) {
      throw new Error('Potential SQL injection detected');
    }
    
    // Add row-level security context
    const securedSql = this.addSecurityContext(sql, options);
    
    return await this.query<T>(securedSql, params, options);
  }
  
  private detectSqlInjection(sql: string): boolean {
    const suspiciousPatterns = [
      /drop\s+table/i,
      /delete\s+from\s+\w+\s+where\s+1\s*=\s*1/i,
      /union\s+select/i,
      /exec\s*\(/i,
      /script\s*>/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(sql));
  }
}
```

---

## 6. Scalability Considerations

### 6.1 Partitioning Strategies for Large Tables

**Table Partitioning Implementation**:

```sql
-- Partition audit logs by date
CREATE TABLE audit_logs_partitioned (
  LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Automated partition management
CREATE OR REPLACE FUNCTION create_monthly_partition(
  table_name text,
  start_date date
)
RETURNS void AS $$
DECLARE
  partition_name text;
  end_date date;
BEGIN
  partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
  end_date := start_date + interval '1 month';
  
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
                  FOR VALUES FROM (%L) TO (%L)',
                 partition_name, table_name, start_date, end_date);
  
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I_created_at_idx 
                  ON %I (created_at)',
                 partition_name, partition_name);
END;
$$ LANGUAGE plpgsql;

-- Content versions partitioned by entity type
CREATE TABLE content_versions_partitioned (
  LIKE content_versions INCLUDING ALL
) PARTITION BY LIST (entity_type);

CREATE TABLE content_versions_pages PARTITION OF content_versions_partitioned
FOR VALUES IN ('PAGE');

CREATE TABLE content_versions_blocks PARTITION OF content_versions_partitioned
FOR VALUES IN ('CONTENT_BLOCK');
```

### 6.2 Read Replica Implementation

**Read-Write Split Configuration**:

```typescript
// Read replica manager
export class ReadReplicaManager {
  private primaryAdapter: PostgreSQLAdapter;
  private replicaAdapters: PostgreSQLAdapter[] = [];
  private roundRobinIndex = 0;
  
  constructor(
    primaryConfig: DatabaseConnectionConfig,
    replicaConfigs: DatabaseConnectionConfig[]
  ) {
    this.primaryAdapter = new PostgreSQLAdapter();
    this.initializeAdapters(primaryConfig, replicaConfigs);
  }
  
  private async initializeAdapters(
    primaryConfig: DatabaseConnectionConfig,
    replicaConfigs: DatabaseConnectionConfig[]
  ): Promise<void> {
    await this.primaryAdapter.connect(primaryConfig);
    
    for (const config of replicaConfigs) {
      const adapter = new PostgreSQLAdapter();
      await adapter.connect(config);
      this.replicaAdapters.push(adapter);
    }
  }
  
  // Route read queries to replicas
  async readQuery<T = any>(
    sql: string,
    params: any[] = [],
    options?: QueryOptions
  ): Promise<QueryResult<T>> {
    const adapter = this.getReadAdapter();
    return await adapter.query<T>(sql, params, options);
  }
  
  // Route write queries to primary
  async writeQuery<T = any>(
    sql: string,
    params: any[] = [],
    options?: QueryOptions
  ): Promise<QueryResult<T>> {
    return await this.primaryAdapter.query<T>(sql, params, options);
  }
  
  // Transaction support (always on primary)
  async transaction<T>(
    callback: (tx: DatabaseTransaction) => Promise<T>
  ): Promise<T> {
    return await this.primaryAdapter.transaction(callback);
  }
  
  // Health check for all adapters
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    results.primary = await this.primaryAdapter.healthCheck();
    
    for (let i = 0; i < this.replicaAdapters.length; i++) {
      results[`replica_${i}`] = await this.replicaAdapters[i].healthCheck();
    }
    
    return results;
  }
  
  private getReadAdapter(): PostgreSQLAdapter {
    if (this.replicaAdapters.length === 0) {
      return this.primaryAdapter;
    }
    
    // Round-robin selection
    const adapter = this.replicaAdapters[this.roundRobinIndex];
    this.roundRobinIndex = (this.roundRobinIndex + 1) % this.replicaAdapters.length;
    
    return adapter;
  }
}
```

### 6.3 Backup and Recovery Procedures

**Automated Backup Strategy**:

```sql
-- Backup function with compression
CREATE OR REPLACE FUNCTION create_backup(
  backup_name text DEFAULT NULL,
  compress boolean DEFAULT true
)
RETURNS text AS $$
DECLARE
  backup_file text;
  command text;
BEGIN
  backup_name := COALESCE(backup_name, 'backup_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS'));
  backup_file := '/backups/' || backup_name || '.sql';
  
  IF compress THEN
    backup_file := backup_file || '.gz';
    command := format('pg_dump %I | gzip > %s', current_database(), backup_file);
  ELSE
    command := format('pg_dump %I > %s', current_database(), backup_file);
  END IF;
  
  EXECUTE format('COPY (%s) TO PROGRAM %L', 
    'SELECT current_database(), current_user, NOW()',
    command
  );
  
  RETURN backup_file;
END;
$$ LANGUAGE plpgsql;

-- Point-in-time recovery setup
CREATE OR REPLACE FUNCTION setup_wal_archiving()
RETURNS void AS $$
BEGIN
  -- Enable WAL archiving
  EXECUTE 'ALTER SYSTEM SET wal_level = replica';
  EXECUTE 'ALTER SYSTEM SET archive_mode = on';
  EXECUTE 'ALTER SYSTEM SET archive_command = ''cp %p /wal_archive/%f''';
  
  -- Reload configuration
  EXECUTE 'SELECT pg_reload_conf()';
  
  -- Create archive directory if it doesn't exist
  EXECUTE 'CREATE TABLE IF NOT EXISTS backup_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_type text,
    backup_file text,
    backup_size bigint,
    created_at timestamptz DEFAULT NOW(),
    completed_at timestamptz
  )';
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Implementation Roadmap

### 7.1 Priority Matrix

| Recommendation | Impact | Effort | Priority |
|----------------|--------|--------|----------|
| Connection Pool Optimization | High | Low | 1 |
| Structured Logging | High | Medium | 2 |
| Query Indexing | High | Medium | 2 |
| Type Safety Improvements | Medium | High | 3 |
| Row-Level Security | High | High | 3 |
| Read Replicas | High | High | 4 |
| Table Partitioning | Medium | High | 4 |
| Advanced Caching | High | Medium | 2 |

### 7.2 Implementation Phases

**Phase 1 (Weeks 1-2): Foundation**
- Implement structured logging
- Optimize connection pooling
- Add essential indexes
- Set up monitoring

**Phase 2 (Weeks 3-4): Performance**
- Implement advanced caching
- Optimize slow queries
- Add query analysis tools
- Enhance type safety

**Phase 3 (Weeks 5-6): Security & Scalability**
- Implement row-level security
- Set up read replicas
- Add backup procedures
- Implement partitioning

**Phase 4 (Weeks 7-8): Advanced Features**
- Materialized views
- Advanced analytics
- Automated maintenance
- Performance tuning

### 7.3 Success Metrics

**Performance Metrics**:
- Query response time < 100ms (95th percentile)
- Connection pool utilization < 80%
- Cache hit rate > 85%
- Database CPU usage < 70%

**Security Metrics**:
- Zero SQL injection incidents
- All tenant data properly isolated
- Audit trail completeness > 99%
- Security scan compliance

**Scalability Metrics**:
- Handle 10x current load
- Backup/restore time < 30 minutes
- Zero downtime deployments
- Automated failover < 5 seconds

---

## 8. Conclusion

These PostgreSQL-specific recommendations provide a comprehensive roadmap for optimizing your resort website's database layer. The implementation focuses on:

1. **Immediate Performance Gains**: Connection pooling, indexing, and caching
2. **Enhanced Type Safety**: Better TypeScript integration and query builders
3. **Robust Monitoring**: Comprehensive logging and performance analysis
4. **Security Hardening**: Row-level security and connection encryption
5. **Scalability Preparation**: Partitioning, read replicas, and backup strategies

The phased approach allows for incremental improvements while maintaining system stability. Regular monitoring and adjustment of these configurations will ensure optimal performance as your application grows.