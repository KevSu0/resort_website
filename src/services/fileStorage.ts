import { DatabaseService } from './databaseService';

export interface StorageUsageBreakdown {
  media: number;
  content: number;
  other: number;
}

export interface StorageUsage {
  used: number;
  quota?: number;
  breakdown: StorageUsageBreakdown;
}

const EMPTY_BREAKDOWN: StorageUsageBreakdown = {
  media: 0,
  content: 0,
  other: 0,
};

export class FileStorageService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStorageUsage(): Promise<StorageUsage> {
    const breakdown: StorageUsageBreakdown = { ...EMPTY_BREAKDOWN };

    try {
      await this.databaseService.initialize();
      const db = this.databaseService.getDb();

      if (!db) {
        return { used: 0, breakdown };
      }

      const storeNames = Array.from(db.objectStoreNames);
      let used = 0;

      const storeSizes = await Promise.all(
        storeNames.map(async storeName => {
          try {
            return { storeName, size: await this.getStoreSize(db, storeName) };
          } catch (error) {
            console.error(`Failed to measure store ${storeName}:`, error);
            return { storeName, size: 0 };
          }
        }),
      );

      storeSizes.forEach(({ storeName, size }) => {
        used += size;
        if (storeName === 'media') {
          breakdown.media = size;
        } else if (storeName === 'draftContent') {
          breakdown.content = size;
        } else {
          breakdown.other += size;
        }
      });

      const quota = await this.estimateQuota();

      return { used, quota, breakdown };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, breakdown };
    }
  }

  private getStoreSize(db: IDBDatabase, storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = (request.result ?? []) as unknown[];
        const size = records.reduce((total, record) => total + this.estimateRecordSize(record), 0);
        resolve(size);
      };

      request.onerror = () => {
        reject(request.error ?? new Error(`Failed to read store ${storeName}`));
      };
    });
  }

  private estimateRecordSize(record: unknown): number {
    try {
      const json = JSON.stringify(record);
      if (!json) {
        return 0;
      }
      return json.length * 2;
    } catch (error) {
      console.warn('Could not estimate record size', error);
      return 0;
    }
  }

  private async estimateQuota(): Promise<number | undefined> {
    const navigatorRef = typeof navigator === 'undefined' ? undefined : navigator;
    const storage = navigatorRef?.storage;

    if (!storage?.estimate) {
      return undefined;
    }

    try {
      const estimate = await storage.estimate();
      return estimate.quota ?? undefined;
    } catch (error) {
      console.warn('Failed to estimate storage quota', error);
      return undefined;
    }
  }
}
