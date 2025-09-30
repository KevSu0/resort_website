/**
 * Schema Registry Service
 *
 * Manages IndexedDB schema validation, creation, and repair.
 * Ensures database integrity and provides idempotent migration capabilities.
 */

export interface SchemaVersion {
  version: number;
  timestamp: number;
  description: string;
  stores: ObjectStoreDefinition[];
}

export interface ObjectStoreDefinition {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indexes: IndexDefinition[];
}

export interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

export interface SchemaHealth {
  isHealthy: boolean;
  version: number;
  stores: {
    name: string;
    exists: boolean;
    indexes: {
      name: string;
      exists: boolean;
    }[];
  }[];
  errors: string[];
}

export class SchemaRegistryService {
  private static instance: SchemaRegistryService;
  private dbName: string;
  private expectedVersion: number;
  private readonly SCHEMA_VERSION_KEY = 'schema_version';

  private constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.expectedVersion = version;
  }

  static getInstance(dbName: string = 'wayanadResortsDB', version: number = 1): SchemaRegistryService {
    if (!SchemaRegistryService.instance) {
      SchemaRegistryService.instance = new SchemaRegistryService(dbName, version);
    }
    return SchemaRegistryService.instance;
  }

  /**
   * Get the expected schema definition
   */
  getExpectedSchema(): SchemaVersion {
    return {
      version: this.expectedVersion,
      timestamp: Date.now(),
      description: 'Wayanad Resorts Admin v1 Schema',
      stores: [
        {
          name: 'draftContent',
          keyPath: 'id',
          indexes: [
            { name: 'updatedAt', keyPath: 'updatedAt' }
          ]
        },
        {
          name: 'publishedContent',
          keyPath: 'id',
          indexes: [
            { name: 'publishedAt', keyPath: 'publishedAt' }
          ]
        },
        {
          name: 'snapshots',
          keyPath: 'id',
          indexes: [
            { name: 'timestamp', keyPath: 'timestamp' }
          ]
        },
        {
          name: 'media',
          keyPath: 'id',
          indexes: [
            { name: 'type', keyPath: 'type' },
            { name: 'uploadedAt', keyPath: 'uploadedAt' },
            { name: 'filename', keyPath: 'filename' }
          ]
        },
        {
          name: 'settings',
          keyPath: 'id',
          indexes: [
            { name: 'updatedAt', keyPath: 'updatedAt' }
          ]
        },
        {
          name: 'enquiries',
          keyPath: 'id',
          indexes: [
            { name: 'status', keyPath: 'status' },
            { name: 'createdAt', keyPath: 'createdAt' },
            { name: 'ref', keyPath: 'ref' },
            { name: 'propertyId', keyPath: 'propertyId' }
          ]
        },
        {
          name: 'properties',
          keyPath: 'id',
          indexes: [
            { name: 'slug', keyPath: 'slug', unique: true },
            { name: 'featured', keyPath: 'featured' },
            { name: 'createdAt', keyPath: 'createdAt' },
            { name: 'updatedAt', keyPath: 'updatedAt' }
          ]
        },
        {
          name: 'roomTypes',
          keyPath: 'id',
          indexes: [
            { name: 'propertyId', keyPath: 'propertyId' },
            { name: 'slug', keyPath: 'slug' },
            { name: 'createdAt', keyPath: 'createdAt' },
            { name: 'updatedAt', keyPath: 'updatedAt' }
          ]
        },
        {
          name: 'places',
          keyPath: 'id',
          indexes: [
            { name: 'propertyId', keyPath: 'propertyId' },
            { name: 'featured', keyPath: 'featured' },
            { name: 'category', keyPath: 'category' },
            { name: 'createdAt', keyPath: 'createdAt' },
            { name: 'updatedAt', keyPath: 'updatedAt' }
          ]
        },
        {
          name: 'offers',
          keyPath: 'id',
          indexes: [
            { name: 'type', keyPath: 'type' },
            { name: 'status', keyPath: 'status' },
            { name: 'scope', keyPath: 'scope' },
            { name: 'validFrom', keyPath: 'validFrom' },
            { name: 'validTo', keyPath: 'validTo' },
            { name: 'createdAt', keyPath: 'createdAt' },
            { name: 'updatedAt', keyPath: 'updatedAt' }
          ]
        },
        {
          name: 'promoCodes',
          keyPath: 'id',
          indexes: [
            { name: 'code', keyPath: 'code', unique: true },
            { name: 'offerId', keyPath: 'offerId' },
            { name: 'status', keyPath: 'status' },
            { name: 'createdAt', keyPath: 'createdAt' }
          ]
        },
        {
          name: 'activityLog',
          keyPath: 'id',
          indexes: [
            { name: 'timestamp', keyPath: 'timestamp' },
            { name: 'entityType', keyPath: 'entityType' },
            { name: 'action', keyPath: 'action' }
          ]
        },
        {
          name: 'auditLog',
          keyPath: 'id',
          indexes: [
            { name: 'timestamp', keyPath: 'timestamp' },
            { name: 'entityType', keyPath: 'entityType' },
            { name: 'userId', keyPath: 'userId' }
          ]
        }
      ]
    };
  }

  /**
   * Check database schema health
   */
  async checkSchemaHealth(): Promise<SchemaHealth> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.expectedVersion);

      request.onerror = () => {
        resolve({
          isHealthy: false,
          version: 0,
          stores: [],
          errors: ['Failed to open database']
        });
      };

      request.onsuccess = () => {
        const db = request.result;
        const health: SchemaHealth = {
          isHealthy: true,
          version: db.version,
          stores: [],
          errors: []
        };

        const expectedSchema = this.getExpectedSchema();

        // Check if version matches
        if (db.version !== expectedSchema.version) {
          health.isHealthy = false;
          health.errors.push(`Version mismatch: expected ${expectedSchema.version}, got ${db.version}`);
        }

        // Check stores and indexes
        for (const expectedStore of expectedSchema.stores) {
          const storeExists = db.objectStoreNames.contains(expectedStore.name);
          const storeHealth = {
            name: expectedStore.name,
            exists: storeExists,
            indexes: [] as { name: string; exists: boolean }[]
          };

          if (storeExists) {
            const transaction = db.transaction(expectedStore.name, 'readonly');
            const store = transaction.objectStore(expectedStore.name);

            // Check indexes
            for (const expectedIndex of expectedStore.indexes) {
              const indexExists = store.indexNames.contains(expectedIndex.name);
              storeHealth.indexes.push({
                name: expectedIndex.name,
                exists: indexExists
              });

              if (!indexExists) {
                health.isHealthy = false;
                health.errors.push(`Missing index: ${expectedStore.name}.${expectedIndex.name}`);
              }
            }
          } else {
            health.isHealthy = false;
            health.errors.push(`Missing store: ${expectedStore.name}`);
          }

          health.stores.push(storeHealth);
        }

        db.close();
        resolve(health);
      };

      request.onupgradeneeded = (event) => {
        // This should not happen during health check
        const db = (event.target as IDBOpenDBRequest).result;
        db.close();
      };
    });
  }

  /**
   * Repair database schema (idempotent)
   */
  async repairSchema(): Promise<boolean> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.expectedVersion);

      let upgraded = false;

      request.onerror = () => {
        resolve(false);
      };

      request.onsuccess = () => {
        const db = request.result;
        db.close();
        resolve(upgraded);
      };

      request.onupgradeneeded = (event) => {
        upgraded = true;
        const db = (event.target as IDBOpenDBRequest).result;
        const expectedSchema = this.getExpectedSchema();

        // Create or upgrade stores
        for (const expectedStore of expectedSchema.stores) {
          let store: IDBObjectStore;

          if (!db.objectStoreNames.contains(expectedStore.name)) {
            // Create new store
            store = db.createObjectStore(expectedStore.name, {
              keyPath: expectedStore.keyPath,
              autoIncrement: expectedStore.autoIncrement
            });
          } else {
            // Use existing store
            store = request.transaction!.objectStore(expectedStore.name);
          }

          // Create missing indexes
          for (const expectedIndex of expectedStore.indexes) {
            if (!store.indexNames.contains(expectedIndex.name)) {
              store.createIndex(expectedIndex.name, expectedIndex.keyPath, {
                unique: expectedIndex.unique,
                multiEntry: expectedIndex.multiEntry
              });
            }
          }
        }

        // Clean up deprecated stores (if any)
        const currentStores = Array.from(db.objectStoreNames);
        const expectedStoreNames = expectedSchema.stores.map(s => s.name);

        for (const storeName of currentStores) {
          if (!expectedStoreNames.includes(storeName)) {
            // Don't delete stores - just log for safety
            console.warn(`Deprecated store found: ${storeName}`);
          }
        }

        // Store schema version
        if (db.objectStoreNames.contains('settings')) {
          try {
            const settingsStore = request.transaction!.objectStore('settings');
            settingsStore.put({
              id: 'schema_version',
              value: expectedSchema.version,
              updatedAt: Date.now()
            });
          } catch (e) {
            console.warn('Could not store schema version', e);
          }
        }
      };
    });
  }

  /**
   * Initialize database with schema if it doesn't exist
   */
  async initialize(): Promise<boolean> {
    try {
      // First check health
      const health = await this.checkSchemaHealth();

      if (health.isHealthy) {
        return true;
      }

      // Attempt repair
      const repaired = await this.repairSchema();

      if (repaired) {
        // Verify repair was successful
        const newHealth = await this.checkSchemaHealth();
        return newHealth.isHealthy;
      }

      return false;
    } catch (error) {
      console.error('Schema initialization failed:', error);
      return false;
    }
  }

  /**
   * Get current schema version from database
   */
  async getCurrentVersion(): Promise<number> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.expectedVersion);

      request.onerror = () => resolve(0);

      request.onsuccess = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains('settings')) {
          db.close();
          resolve(0);
          return;
        }

        const transaction = db.transaction('settings', 'readonly');
        const store = transaction.objectStore('settings');
        const getRequest = store.get('schema_version');

        getRequest.onsuccess = () => {
          const result = getRequest.result;
          db.close();
          resolve(result?.value || 0);
        };

        getRequest.onerror = () => {
          db.close();
          resolve(0);
        };
      };
    });
  }

  /**
   * Check if database needs migration
   */
  async needsMigration(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return currentVersion < this.expectedVersion;
  }

  /**
   * Get schema information for export
   */
  async getSchemaInfo(): Promise<{
    version: number;
    stores: string[];
    lastUpdated: number;
  }> {
    const health = await this.checkSchemaHealth();
    return {
      version: health.version,
      stores: health.stores.filter(s => s.exists).map(s => s.name),
      lastUpdated: Date.now()
    };
  }
}