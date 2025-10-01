import type { IDatabaseAdapter } from './interfaces/IDatabaseAdapter';
import type { ITenantContext } from '../tenant/TenantContext';
import { BrandRepository } from './repositories/BrandRepository';
import { SiteRepository } from './repositories/SiteRepository';
import { UserRepository } from './repositories/UserRepository';
import { PageRepository } from './repositories/PageRepository';
import { ContentBlockRepository } from './repositories/ContentBlockRepository';
import { NavigationRepository } from './repositories/NavigationRepository';
import { MediaRepository } from './repositories/MediaRepository';
import { WorkflowRepository } from './repositories/WorkflowRepository';
import { ContentVersionRepository } from './repositories/ContentVersionRepository';
import { AuditLogRepository } from './repositories/AuditLogRepository';
import { logger } from '../logger';

/**
 * Repository Factory
 *
 * Centralized factory for creating and managing repository instances.
 * Ensures consistent dependency injection and configuration across all repositories.
 */

export class RepositoryFactory {
  private static instances: Map<string, unknown> = new Map();

  constructor(
    private databaseAdapter: IDatabaseAdapter,
    private tenantContext: ITenantContext
  ) {}

  /**
   * Get or create a BrandRepository instance
   */
  getBrandRepository(): BrandRepository {
    const key = 'BrandRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new BrandRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create a SiteRepository instance
   */
  getSiteRepository(): SiteRepository {
    const key = 'SiteRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new SiteRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create a UserRepository instance
   */
  getUserRepository(): UserRepository {
    const key = 'UserRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new UserRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create a PageRepository instance
   */
  getPageRepository(): PageRepository {
    const key = 'PageRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new PageRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create a ContentBlockRepository instance
   */
  getContentBlockRepository(): ContentBlockRepository {
    const key = 'ContentBlockRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new ContentBlockRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create a NavigationRepository instance
   */
  getNavigationRepository(): NavigationRepository {
    const key = 'NavigationRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new NavigationRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create a MediaRepository instance
   */
  getMediaRepository(): MediaRepository {
    const key = 'MediaRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new MediaRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create a WorkflowRepository instance
   */
  getWorkflowRepository(): WorkflowRepository {
    const key = 'WorkflowRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new WorkflowRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create a ContentVersionRepository instance
   */
  getContentVersionRepository(): ContentVersionRepository {
    const key = 'ContentVersionRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new ContentVersionRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Get or create an AuditLogRepository instance
   */
  getAuditLogRepository(): AuditLogRepository {
    const key = 'AuditLogRepository';
    if (!RepositoryFactory.instances.has(key)) {
      RepositoryFactory.instances.set(
        key,
        new AuditLogRepository(this.databaseAdapter, this.tenantContext)
      );
    }
    return RepositoryFactory.instances.get(key);
  }

  /**
   * Clear all repository instances (useful for testing or reconnection)
   */
  clearInstances(): void {
    RepositoryFactory.instances.clear();
  }

  /**
   * Get all repository instances (useful for testing)
   */
  getAllRepositories(): Record<string, unknown> {
    return {
      brand: this.getBrandRepository(),
      site: this.getSiteRepository(),
      user: this.getUserRepository(),
      page: this.getPageRepository(),
      contentBlock: this.getContentBlockRepository(),
      navigation: this.getNavigationRepository(),
      media: this.getMediaRepository(),
      workflow: this.getWorkflowRepository(),
      contentVersion: this.getContentVersionRepository(),
      auditLog: this.getAuditLogRepository(),
    };
  }

  /**
   * Initialize repositories with data if needed
   */
  async initialize(): Promise<void> {
    // Perform any necessary initialization
    // For example, validate database connections, create indexes, etc.

    try {
      // Test database connectivity
      const isHealthy = await this.databaseAdapter.healthCheck();
      if (!isHealthy) {
        throw new Error('Database connection is not healthy');
      }

      logger.info('Repository factory initialized successfully', {
        module: 'RepositoryFactory',
        function: 'initialize',
        category: 'database'
      });
    } catch (error) {
      logger.error('Failed to initialize repository factory', {
        module: 'RepositoryFactory',
        function: 'initialize',
        error: error instanceof Error ? error.message : String(error),
        category: 'database'
      });
      throw error;
    }
  }
}

/**
 * Repository Registry
 *
 * Global registry for managing repository factory instances
 * across different database connections or tenant contexts.
 */

export class RepositoryRegistry {
  private static factories: Map<string, RepositoryFactory> = new Map();

  /**
   * Register a repository factory
   */
  static register(
    name: string,
    databaseAdapter: IDatabaseAdapter,
    tenantContext: ITenantContext
  ): RepositoryFactory {
    const factory = new RepositoryFactory(databaseAdapter, tenantContext);
    this.factories.set(name, factory);
    return factory;
  }

  /**
   * Get a repository factory by name
   */
  static get(name: string): RepositoryFactory | undefined {
    return this.factories.get(name);
  }

  /**
   * Get the default repository factory
   */
  static getDefault(): RepositoryFactory | undefined {
    return this.factories.get('default');
  }

  /**
   * Set the default repository factory
   */
  static setDefault(
    databaseAdapter: IDatabaseAdapter,
    tenantContext: ITenantContext
  ): RepositoryFactory {
    return this.register('default', databaseAdapter, tenantContext);
  }

  /**
   * Remove a repository factory
   */
  static remove(name: string): boolean {
    return this.factories.delete(name);
  }

  /**
   * Clear all repository factories
   */
  static clear(): void {
    this.factories.clear();
  }

  /**
   * List all registered factory names
   */
  static list(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Get health status of all registered factories
   */
  async getHealthStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};

    for (const [name, factory] of RepositoryRegistry.factories) {
      try {
        // Access the database adapter through one of the repositories
        const repository = factory.getBrandRepository();
        const isHealthy = await repository['databaseAdapter'].healthCheck();
        status[name] = isHealthy;
      } catch {
        status[name] = false;
      }
    }

    return status;
  }
}