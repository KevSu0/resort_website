/**
 * Tenant Context Management
 *
 * Handles multi-tenant context resolution, isolation, and propagation
 * throughout the application lifecycle.
 */

export interface TenantInfo {
  id: string;
  brandId: string;
  siteId: string;
  brandSlug: string;
  siteSlug: string;
  domain?: string;
  subdomain?: string;
  isActive: boolean;
  settings?: Record<string, any>;
}

export interface UserTenantContext {
  userId: string;
  brandId: string;
  siteIds: string[];
  roles: Record<string, string>; // siteId -> role
  permissions: string[];
  isActive: boolean;
}

export interface TenantResolutionStrategy {
  type: 'domain' | 'subdomain' | 'header' | 'query' | 'path';
  config: Record<string, any>;
}

export interface ITenantContext {
  /**
   * Resolve tenant from request context
   */
  resolveTenant(request: any): Promise<TenantInfo | null>;

  /**
   * Get current tenant context
   */
  getCurrentTenant(): TenantInfo | null;

  /**
   * Set current tenant context
   */
  setCurrentTenant(tenant: TenantInfo): void;

  /**
   * Clear current tenant context
   */
  clearCurrentTenant(): void;

  /**
   * Validate user access to tenant
   */
  validateUserAccess(userId: string, tenantId: string): Promise<boolean>;

  /**
   * Get user's tenant contexts
   */
  getUserTenantContexts(userId: string): Promise<UserTenantContext[]>;

  /**
   * Check if user has permission in current tenant
   */
  hasPermission(permission: string): boolean;

  /**
   * Get tenant-specific cache key
   */
  getCacheKey(baseKey: string): string;

  /**
   * Apply tenant isolation to SQL queries
   */
  applyTenantIsolation(sql: string, table: string): string;
}

export class TenantContext implements ITenantContext {
  private currentTenant: TenantInfo | null = null;
  private userContexts: Map<string, UserTenantContext[]> = new Map();

  constructor(
    private databaseAdapter: any,
    private cacheAdapter: any,
    private config: {
      defaultResolutionStrategy: TenantResolutionStrategy;
      fallbackTenant?: string;
      enableTenantCache: boolean;
      cacheTTL: number;
    }
  ) {}

  async resolveTenant(request: any): Promise<TenantInfo | null> {
    // Try different resolution strategies in order
    const strategies = [
      this.config.defaultResolutionStrategy,
      { type: 'header' as const, config: { header: 'X-Tenant-ID' } },
      { type: 'query' as const, config: { param: 'tenant' } },
      { type: 'subdomain' as const, config: {} },
    ];

    for (const strategy of strategies) {
      try {
        const tenant = await this.resolveTenantWithStrategy(request, strategy);
        if (tenant && tenant.isActive) {
          this.setCurrentTenant(tenant);
          return tenant;
        }
      } catch (error) {
        console.warn(`Tenant resolution failed for strategy ${strategy.type}:`, error);
      }
    }

    // Fallback to default tenant if configured
    if (this.config.fallbackTenant) {
      const fallbackTenant = await this.getTenantById(this.config.fallbackTenant);
      if (fallbackTenant) {
        this.setCurrentTenant(fallbackTenant);
        return fallbackTenant;
      }
    }

    return null;
  }

  private async resolveTenantWithStrategy(
    request: any,
    strategy: TenantResolutionStrategy
  ): Promise<TenantInfo | null> {
    let tenantId: string | null = null;

    switch (strategy.type) {
      case 'domain':
        tenantId = await this.resolveByDomain(request.hostname);
        break;

      case 'subdomain':
        tenantId = await this.resolveBySubdomain(request.hostname);
        break;

      case 'header':
        tenantId = request.headers?.[strategy.config.header.toLowerCase()];
        break;

      case 'query':
        tenantId = request.query?.[strategy.config.param];
        break;

      case 'path':
        const pathSegments = request.path?.split('/') || [];
        const tenantIndex = strategy.config.segmentIndex || 1;
        tenantId = pathSegments[tenantIndex];
        break;
    }

    if (!tenantId) {
      return null;
    }

    return await this.getTenantById(tenantId);
  }

  private async resolveByDomain(hostname: string): Promise<string | null> {
    const cacheKey = `tenant:domain:${hostname}`;

    if (this.config.enableTenantCache) {
      const cached = await this.cacheAdapter.get(cacheKey);
      if (cached) return cached;
    }

    const sql = `
      SELECT s.id, s.brand_id, s.slug as site_slug, b.slug as brand_slug
      FROM sites s
      JOIN brands b ON s.brand_id = b.id
      WHERE s.domain = $1 AND s.is_active = true AND b.is_active = true
    `;

    const result = await this.databaseAdapter.queryOne(sql, [hostname]);

    const tenantId = result ? `${result.brand_id}:${result.id}` : null;

    if (this.config.enableTenantCache && tenantId) {
      await this.cacheAdapter.set(cacheKey, tenantId, this.config.cacheTTL);
    }

    return tenantId;
  }

  private async resolveBySubdomain(hostname: string): Promise<string | null> {
    const subdomain = hostname.split('.')[0];
    if (!subdomain || subdomain === 'www') return null;

    const cacheKey = `tenant:subdomain:${subdomain}`;

    if (this.config.enableTenantCache) {
      const cached = await this.cacheAdapter.get(cacheKey);
      if (cached) return cached;
    }

    const sql = `
      SELECT s.id, s.brand_id, s.slug as site_slug, b.slug as brand_slug
      FROM sites s
      JOIN brands b ON s.brand_id = b.id
      WHERE s.subdomain = $1 AND s.is_active = true AND b.is_active = true
    `;

    const result = await this.databaseAdapter.queryOne(sql, [subdomain]);

    const tenantId = result ? `${result.brand_id}:${result.id}` : null;

    if (this.config.enableTenantCache && tenantId) {
      await this.cacheAdapter.set(cacheKey, tenantId, this.config.cacheTTL);
    }

    return tenantId;
  }

  private async getTenantById(tenantId: string): Promise<TenantInfo | null> {
    const cacheKey = `tenant:id:${tenantId}`;

    if (this.config.enableTenantCache) {
      const cached = await this.cacheAdapter.get(cacheKey);
      if (cached) return cached;
    }

    const [brandId, siteId] = tenantId.split(':');

    const sql = `
      SELECT
        b.id as brand_id,
        b.slug as brand_slug,
        b.name as brand_name,
        b.domain as brand_domain,
        b.settings as brand_settings,
        s.id as site_id,
        s.slug as site_slug,
        s.name as site_name,
        s.domain as site_domain,
        s.subdomain,
        s.settings as site_settings,
        s.is_active
      FROM brands b
      JOIN sites s ON b.id = s.brand_id
      WHERE b.id = $1 AND s.id = $2 AND b.is_active = true
    `;

    const result = await this.databaseAdapter.queryOne(sql, [brandId, siteId]);

    if (!result) return null;

    const tenant: TenantInfo = {
      id: tenantId,
      brandId: result.brand_id,
      siteId: result.site_id,
      brandSlug: result.brand_slug,
      siteSlug: result.site_slug,
      domain: result.site_domain || result.brand_domain,
      subdomain: result.subdomain,
      isActive: result.is_active,
      settings: {
        brand: result.brand_settings,
        site: result.site_settings,
      },
    };

    if (this.config.enableTenantCache) {
      await this.cacheAdapter.set(cacheKey, tenant, this.config.cacheTTL);
    }

    return tenant;
  }

  getCurrentTenant(): TenantInfo | null {
    return this.currentTenant;
  }

  setCurrentTenant(tenant: TenantInfo): void {
    this.currentTenant = tenant;
  }

  clearCurrentTenant(): void {
    this.currentTenant = null;
  }

  async validateUserAccess(userId: string, tenantId: string): Promise<boolean> {
    const [brandId, siteId] = tenantId.split(':');

    const sql = `
      SELECT 1
      FROM site_users su
      JOIN users u ON su.user_id = u.id
      WHERE su.user_id = $1 AND su.brand_id = $2 AND su.site_id = $3
        AND su.is_active = true AND u.status = 'ACTIVE'
    `;

    const result = await this.databaseAdapter.queryOne(sql, [userId, brandId, siteId]);
    return result !== null;
  }

  async getUserTenantContexts(userId: string): Promise<UserTenantContext[]> {
    const cacheKey = `user:tenants:${userId}`;

    if (this.config.enableTenantCache) {
      const cached = await this.cacheAdapter.get(cacheKey);
      if (cached) return cached;
    }

    const sql = `
      SELECT
        u.id as user_id,
        u.brand_id,
        array_agg(su.site_id) as site_ids,
        jsonb_object_agg(su.site_id, su.role) as roles,
        su.is_active
      FROM users u
      JOIN site_users su ON u.id = su.user_id
      WHERE u.id = $1 AND u.status = 'ACTIVE'
      GROUP BY u.id, u.brand_id, su.is_active
    `;

    const result = await this.databaseAdapter.queryOne(sql, [userId]);

    if (!result) return [];

    const contexts: UserTenantContext[] = [{
      userId: result.user_id,
      brandId: result.brand_id,
      siteIds: result.site_ids,
      roles: result.roles,
      permissions: [], // Would be populated based on roles
      isActive: result.is_active,
    }];

    if (this.config.enableTenantCache) {
      await this.cacheAdapter.set(cacheKey, contexts, this.config.cacheTTL);
    }

    return contexts;
  }

  hasPermission(permission: string): boolean {
    // This would integrate with a permission system
    // For now, return true if tenant is set
    return this.currentTenant !== null;
  }

  getCacheKey(baseKey: string): string {
    if (!this.currentTenant) return baseKey;
    return `${this.currentTenant.id}:${baseKey}`;
  }

  applyTenantIsolation(sql: string, table: string): string {
    if (!this.currentTenant) return sql;

    // Skip certain system tables
    const systemTables = ['brands', 'users', 'migrations'];
    if (systemTables.includes(table)) return sql;

    // Apply tenant isolation based on table
    const tenantClause = this.getTenantClause(table);
    if (!tenantClause) return sql;

    // Add WHERE clause for tenant isolation
    if (sql.toUpperCase().includes('WHERE')) {
      return sql.replace(/WHERE/i, `WHERE ${tenantClause} AND`);
    } else {
      return sql.replace(/(FROM\s+\w+|FROM\s+"\w+")/i, `$1 WHERE ${tenantClause}`);
    }
  }

  private getTenantClause(table: string): string | null {
    if (!this.currentTenant) return null;

    switch (table) {
      case 'sites':
        return `id = '${this.currentTenant.siteId}' AND brand_id = '${this.currentTenant.brandId}'`;

      case 'pages':
      case 'content_blocks':
      case 'navigation':
      case 'media':
      case 'site_settings':
      case 'navigation_items':
        return `site_id = '${this.currentTenant.siteId}'`;

      case 'brand_settings':
        return `brand_id = '${this.currentTenant.brandId}'`;

      case 'site_users':
        return `site_id = '${this.currentTenant.siteId}' AND brand_id = '${this.currentTenant.brandId}'`;

      case 'workflows':
      case 'workflow_items':
      case 'workflow_steps':
        return `site_id = '${this.currentTenant.siteId}'`;

      default:
        return null;
    }
  }
}