import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface Site {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  domain?: string;
  subdomain?: string;
  language: string;
  timezone: string;
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Site Repository
 * Handles all database operations for the Site entity
 */
export class SiteRepository extends BaseRepository<Site> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'sites');
  }

  // Site-specific methods will be implemented here
  async findBySlug(slug: string): Promise<Site | null> {
    return await this.findBy('slug', slug);
  }

  async findByDomain(domain: string): Promise<Site | null> {
    return await this.findBy('domain', domain);
  }

  async findByBrand(brandId: string): Promise<Site[]> {
    return await this.findManyBy('brand_id', brandId);
  }
}