import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  domain?: string;
  subdomain?: string;
  settings?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBrandData {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  domain?: string;
  subdomain?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  domain?: string;
  subdomain?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
}

/**
 * Brand Repository
 *
 * Handles all database operations for the Brand entity
 */
export class BrandRepository extends BaseRepository<Brand> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'brands');
  }

  /**
   * Find a brand by slug
   */
  async findBySlug(slug: string): Promise<Brand | null> {
    return await this.findBy('slug', slug);
  }

  /**
   * Find a brand by domain
   */
  async findByDomain(domain: string): Promise<Brand | null> {
    return await this.findBy('domain', domain);
  }

  /**
   * Find active brands only
   */
  async findActive(
    pagination?: any,
    options?: any
  ): Promise<any> {
    return await this.findMany('is_active = true', [], pagination, options);
  }

  /**
   * Create a new brand with validation
   */
  async createBrand(data: CreateBrandData): Promise<Brand> {
    // Validate slug uniqueness
    const existingBrand = await this.findBySlug(data.slug);
    if (existingBrand) {
      throw new Error(`Brand with slug '${data.slug}' already exists`);
    }

    // Validate domain uniqueness if provided
    if (data.domain) {
      const existingDomain = await this.findByDomain(data.domain);
      if (existingDomain) {
        throw new Error(`Brand with domain '${data.domain}' already exists`);
      }
    }

    const brandData = {
      ...data,
      isActive: data.isActive ?? true,
    };

    return await this.create(brandData);
  }

  /**
   * Update a brand with validation
   */
  async updateBrand(id: string, data: UpdateBrandData): Promise<Brand | null> {
    // Check if brand exists
    const existingBrand = await this.findById(id);
    if (!existingBrand) {
      throw new Error(`Brand with ID '${id}' not found`);
    }

    // Validate slug uniqueness if changing
    if (data.slug && data.slug !== existingBrand.slug) {
      const slugExists = await this.findBySlug(data.slug);
      if (slugExists) {
        throw new Error(`Brand with slug '${data.slug}' already exists`);
      }
    }

    // Validate domain uniqueness if changing
    if (data.domain && data.domain !== existingBrand.domain) {
      const domainExists = await this.findByDomain(data.domain);
      if (domainExists) {
        throw new Error(`Brand with domain '${data.domain}' already exists`);
      }
    }

    return await this.updateById(id, data);
  }

  /**
   * Soft delete a brand (deactivate)
   */
  async deactivateBrand(id: string): Promise<boolean> {
    return await this.updateById(id, { isActive: false }).then(() => true);
  }

  /**
   * Reactivate a brand
   */
  async activateBrand(id: string): Promise<boolean> {
    return await this.updateById(id, { isActive: true }).then(() => true);
  }

  /**
   * Get brand statistics
   */
  async getBrandStatistics(brandId: string): Promise<{
    totalSites: number;
    activeSites: number;
    totalUsers: number;
    activeUsers: number;
    totalPages: number;
    publishedPages: number;
  }> {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM sites WHERE brand_id = $1) as total_sites,
        (SELECT COUNT(*) FROM sites WHERE brand_id = $1 AND is_active = true) as active_sites,
        (SELECT COUNT(*) FROM users WHERE brand_id = $1) as total_users,
        (SELECT COUNT(*) FROM users WHERE brand_id = $1 AND status = 'ACTIVE') as active_users,
        (SELECT COUNT(*) FROM pages p JOIN sites s ON p.site_id = s.id WHERE s.brand_id = $1) as total_pages,
        (SELECT COUNT(*) FROM pages p JOIN sites s ON p.site_id = s.id WHERE s.brand_id = $1 AND p.status = 'PUBLISHED') as published_pages
    `;

    const result = await this.queryOne(sql, [brandId]);

    return {
      totalSites: parseInt(result?.total_sites || '0', 10),
      activeSites: parseInt(result?.active_sites || '0', 10),
      totalUsers: parseInt(result?.total_users || '0', 10),
      activeUsers: parseInt(result?.active_users || '0', 10),
      totalPages: parseInt(result?.total_pages || '0', 10),
      publishedPages: parseInt(result?.published_pages || '0', 10),
    };
  }

  /**
   * Get brands with their site counts
   */
  async findBrandsWithSiteCount(
    pagination?: any,
    options?: any
  ): Promise<any> {
    const sql = `
      SELECT
        b.*,
        COUNT(s.id) as site_count,
        COUNT(CASE WHEN s.is_active = true THEN 1 END) as active_site_count
      FROM brands b
      LEFT JOIN sites s ON b.id = s.brand_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `;

    return await this.queryWithPagination(sql, [], pagination, options);
  }

  /**
   * Search brands by name or description
   */
  async searchBrands(
    query: string,
    pagination?: any,
    options?: any
  ): Promise<any> {
    const sql = `
      SELECT * FROM brands
      WHERE
        LOWER(name) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1) OR
        LOWER(slug) LIKE LOWER($1)
      ORDER BY
        CASE WHEN LOWER(name) LIKE LOWER($1) THEN 1 ELSE 2 END,
        name
    `;

    const searchParam = `%${query}%`;
    return await this.queryWithPagination(sql, [searchParam], pagination, options);
  }

  /**
   * Get brand settings
   */
  async getBrandSettings(brandId: string): Promise<Record<string, any>> {
    const sql = `
      SELECT key, value, description, is_public
      FROM brand_settings
      WHERE brand_id = $1
    `;

    const results = await this.query(sql, [brandId]);
    const settings: Record<string, any> = {};

    results.data.forEach(setting => {
      settings[setting.key] = {
        value: setting.value,
        description: setting.description,
        isPublic: setting.is_public,
      };
    });

    return settings;
  }

  /**
   * Update brand setting
   */
  async updateBrandSetting(
    brandId: string,
    key: string,
    value: any,
    description?: string,
    isPublic?: boolean
  ): Promise<void> {
    const sql = `
      INSERT INTO brand_settings (brand_id, key, value, description, is_public, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (brand_id, key)
      DO UPDATE SET
        value = $3,
        description = $4,
        is_public = $5,
        updated_at = NOW()
    `;

    await this.query(sql, [brandId, key, JSON.stringify(value), description, isPublic ?? false]);
  }

  /**
   * Delete brand setting
   */
  async deleteBrandSetting(brandId: string, key: string): Promise<boolean> {
    const sql = 'DELETE FROM brand_settings WHERE brand_id = $1 AND key = $2';
    const result = await this.query(sql, [brandId, key]);
    return (result.total || 0) > 0;
  }
}