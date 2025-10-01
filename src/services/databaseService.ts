import { logger } from '../lib/logger';

export interface ObjectStoreIndexDefinition {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

export interface ObjectStoreDefinition {
  name: string;
  options?: IDBObjectStoreParameters;
  indexes?: ObjectStoreIndexDefinition[];
}

export const OBJECT_STORES: ObjectStoreDefinition[] = [
  { name: 'properties', options: { keyPath: 'id' } },
  { name: 'rooms', options: { keyPath: 'id' } },
  { name: 'places', options: { keyPath: 'id' } },
  { name: 'enquiries', options: { keyPath: 'id' } },
  { name: 'media', options: { keyPath: 'id' } },
  { name: 'draftContent', options: { keyPath: 'id' } },
  { name: 'settings', options: { keyPath: 'id' } },
];

export interface IntegrityCheckResult {
  passed: boolean;
  issues: string[];
}

export class DatabaseService {
  private db: IDBDatabase | null = null;
  private lastError: Error | null = null;

  constructor(private readonly dbName: string, private readonly version = 1) {}

  async initialize(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = event => {
        const target = event.target as IDBOpenDBRequest;
        const database = target.result;
        const transaction = target.transaction;

        OBJECT_STORES.forEach(storeDefinition => {
          let store: IDBObjectStore;

          if (!database.objectStoreNames.contains(storeDefinition.name)) {
            store = database.createObjectStore(storeDefinition.name, storeDefinition.options);
          } else if (transaction) {
            store = transaction.objectStore(storeDefinition.name);
          } else {
            return;
          }

          storeDefinition.indexes?.forEach(indexDefinition => {
            if (!store.indexNames.contains(indexDefinition.name)) {
              store.createIndex(indexDefinition.name, indexDefinition.keyPath, indexDefinition.options);
            }
          });
        });
      };

      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => {
          database.close();
          this.db = null;
        };

        this.db = database;
        this.lastError = null;
        resolve(database);
      };

      request.onerror = () => {
        const error = request.error ?? new Error('Failed to open IndexedDB database');
        this.lastError = error instanceof Error ? error : new Error(String(error));
        reject(this.lastError);
      };

      request.onblocked = () => {
        logger.warn('Database upgrade blocked. Close other tabs using this application', {
          module: 'DatabaseService',
          function: 'initialize',
          dbName: this.dbName,
          version: this.version,
          category: 'database'
        });
      };
    });
  }

  getDb(): IDBDatabase | null {
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async runIntegrityCheck(): Promise<IntegrityCheckResult> {
    const issues: string[] = [];

    if (!this.db) {
      if (this.lastError) {
        issues.push(`Database integrity check failed: ${this.lastError}`);
      } else {
        issues.push('Database not initialized');
      }
      return { passed: issues.length === 0, issues };
    }

    const database = this.db;
    const existingStores = new Set(Array.from(database.objectStoreNames));

    OBJECT_STORES.forEach(storeDefinition => {
      if (!existingStores.has(storeDefinition.name)) {
        issues.push(`Missing object store: ${storeDefinition.name}`);
      }
    });

    if (existingStores.has('enquiries')) {
      try {
        const enquiries = await this.getAllRecords<Record<string, unknown>>('enquiries');
        enquiries.forEach(enquiry => {
          if (!enquiry || typeof enquiry !== 'object') {
            return;
          }

          const email = enquiry.customer?.email ?? '';
          if (typeof email !== 'string' || email.trim().length === 0) {
            issues.push('Enquiry missing customer email');
          }

          const createdAt = enquiry.createdAt;
          if (typeof createdAt !== 'string' || Number.isNaN(Date.parse(createdAt))) {
            const id = enquiry.id ?? 'unknown';
            issues.push(`Enquiry ${id} has invalid createdAt`);
          }
        });
      } catch (error) {
        issues.push(`Failed to validate enquiries: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return { passed: issues.length === 0, issues };
  }

  private getAllRecords<T>(storeName: string): Promise<T[]> {
    if (!this.db) {
      return Promise.resolve([]);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve((request.result ?? []) as T[]);
      };

      request.onerror = () => {
        reject(request.error ?? new Error(`Failed to read object store: ${storeName}`));
      };
    });
  }
}
