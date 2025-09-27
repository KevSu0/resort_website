import type {
  DraftContent,
  PublishedContent,
  Snapshot,
  Media as AdminMedia,
  SiteSettings,
  Enquiry
} from '../types/admin';
import type {
  Property,
  RoomType,
  Place,
  Offer,
  PromoCode,
  Referrer,
  Media as EntityMedia
} from '../types/entities';

interface DatabaseConfig {
  name: string;
  version: number;
}

interface ObjectStoreConfig {
  name: string;
  keyPath: string;
  indexes: Array<{
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
  }>;
}

const DATABASE_CONFIG: DatabaseConfig = {
  name: 'wayanadResortsDB',
  version: 1
};

const OBJECT_STORES: ObjectStoreConfig[] = [
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
      { name: 'email', keyPath: 'customer.email' },
      { name: 'assignedTo', keyPath: 'assignedTo' }
    ]
  },
  {
    name: 'properties',
    keyPath: 'id',
    indexes: [
      { name: 'slug', keyPath: 'slug' },
      { name: 'type', keyPath: 'type' },
      { name: 'featured', keyPath: 'featured' },
      { name: 'createdAt', keyPath: 'createdAt' }
    ]
  },
  {
    name: 'rooms',
    keyPath: 'id',
    indexes: [
      { name: 'propertyId', keyPath: 'propertyId' },
      { name: 'slug', keyPath: 'slug' },
      { name: 'type', keyPath: 'type' },
      { name: 'createdAt', keyPath: 'createdAt' }
    ]
  },
  {
    name: 'places',
    keyPath: 'id',
    indexes: [
      { name: 'propertyId', keyPath: 'propertyId' },
      { name: 'category', keyPath: 'category' },
      { name: 'createdAt', keyPath: 'createdAt' }
    ]
  },
  {
    name: 'offers',
    keyPath: 'id',
    indexes: [
      { name: 'type', keyPath: 'type' },
      { name: 'status', keyPath: 'status' },
      { name: 'validFrom', keyPath: 'validFrom' },
      { name: 'validTo', keyPath: 'validTo' },
      { name: 'createdAt', keyPath: 'createdAt' }
    ]
  },
  {
    name: 'promoCodes',
    keyPath: 'id',
    indexes: [
      { name: 'code', keyPath: 'code', options: { unique: true } },
      { name: 'offerId', keyPath: 'offerId' },
      { name: 'status', keyPath: 'status' },
      { name: 'validFrom', keyPath: 'validFrom' },
      { name: 'validTo', keyPath: 'validTo' }
    ]
  },
  {
    name: 'referrers',
    keyPath: 'id',
    indexes: [
      { name: 'code', keyPath: 'code', options: { unique: true } },
      { name: 'status', keyPath: 'status' },
      { name: 'createdAt', keyPath: 'createdAt' }
    ]
  }
];

export class DatabaseService {
  private db: IDBDatabase | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_CONFIG.name, DATABASE_CONFIG.version);

      request.onerror = () => {
        console.error('Database error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        OBJECT_STORES.forEach(storeConfig => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath
            });

            // Create indexes
            storeConfig.indexes.forEach(index => {
              store.createIndex(index.name, index.keyPath, index.options);
            });
          }
        });
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }

    await this.initializationPromise;

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Generic CRUD operations
  async create<T>(storeName: string, data: T): Promise<string> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject(request.error);
    });
  }

  async read<T>(storeName: string, key: string): Promise<T | undefined> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, key: string, data: Partial<T>): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const existing = request.result;
        const updated = { ...existing, ...data };
        const updateRequest = store.put(updated);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string, query?: IDBKeyRange | IDBValidKey, indexName?: string): Promise<T[]> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      let source: IDBRequest<IDBCursorWithValue> | IDBObjectStore;

      if (indexName && query) {
        const index = store.index(indexName);
        source = index.openCursor(query);
      } else if (query) {
        source = store.openCursor(query);
      } else {
        source = store.openCursor();
      }

      const results: T[] = [];

      source.onsuccess = () => {
        const cursor = source.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      source.onerror = () => reject(source.error);
    });
  }

  async count(storeName: string, query?: IDBKeyRange | IDBValidKey, indexName?: string): Promise<number> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      let source: IDBRequest;

      if (indexName && query) {
        const index = store.index(indexName);
        source = index.count(query);
      } else if (query) {
        source = store.count(query);
      } else {
        source = store.count();
      }

      source.onsuccess = () => resolve(source.result);
      source.onerror = () => reject(source.error);
    });
  }

  // Specific methods for content management
  async saveDraft(draft: DraftContent): Promise<void> {
    const draftWithId = { ...draft, id: 'current' };
    await this.update('draftContent', 'current', draftWithId);
  }

  async loadDraft(): Promise<DraftContent | null> {
    const result = await this.read<DraftContent>('draftContent', 'current');
    return result || null;
  }

  async savePublished(content: PublishedContent): Promise<void> {
    const publishedWithId = { ...content, id: 'current', publishedAt: new Date().toISOString() };
    await this.update('publishedContent', 'current', publishedWithId);
  }

  async loadPublished(): Promise<PublishedContent | null> {
    const result = await this.read<PublishedContent>('publishedContent', 'current');
    return result || null;
  }

  // Media operations
  async saveMedia(media: AdminMedia): Promise<void> {
    await this.update('media', media.id, media);
  }

  async getMedia(id: string): Promise<AdminMedia | null> {
    return await this.read<AdminMedia>('media', id) || null;
  }

  async getAllMedia(): Promise<AdminMedia[]> {
    return await this.getAll<AdminMedia>('media');
  }

  async deleteMedia(id: string): Promise<void> {
    await this.delete('media', id);
  }

  // Settings operations
  async saveSettings(settings: SiteSettings): Promise<void> {
    const settingsWithId = { ...settings, id: 'current' };
    await this.update('settings', 'current', settingsWithId);
  }

  async loadSettings(): Promise<SiteSettings | null> {
    return await this.read<SiteSettings>('settings', 'current') || null;
  }

  // Enquiry operations
  async saveEnquiry(enquiry: Enquiry): Promise<string> {
    return await this.create('enquiries', enquiry);
  }

  async getEnquiries(filter?: { status?: string; assignedTo?: string }): Promise<Enquiry[]> {
    if (filter?.status) {
      const range = IDBKeyRange.only(filter.status);
      return await this.getAll<Enquiry>('enquiries', range, 'status');
    }
    if (filter?.assignedTo) {
      const range = IDBKeyRange.only(filter.assignedTo);
      return await this.getAll<Enquiry>('enquiries', range, 'assignedTo');
    }
    return await this.getAll<Enquiry>('enquiries');
  }

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<void> {
    await this.update('enquiries', id, updates);
  }

  // Entity operations (Properties, Rooms, Places, etc.)
  async saveProperty(property: Property): Promise<string> {
    return await this.create('properties', property);
  }

  async getProperties(filter?: { type?: string; featured?: boolean }): Promise<Property[]> {
    if (filter?.type) {
      const range = IDBKeyRange.only(filter.type);
      return await this.getAll<Property>('properties', range, 'type');
    }
    if (filter?.featured !== undefined) {
      const range = IDBKeyRange.only(filter.featured);
      return await this.getAll<Property>('properties', range, 'featured');
    }
    return await this.getAll<Property>('properties');
  }

  async getPropertyBySlug(slug: string): Promise<Property | null> {
    const all = await this.getAll<Property>('properties');
    return all.find(p => p.slug === slug) || null;
  }

  async saveRoom(room: RoomType): Promise<string> {
    return await this.create('rooms', room);
  }

  async getRoomsByProperty(propertyId: string): Promise<RoomType[]> {
    const range = IDBKeyRange.only(propertyId);
    return await this.getAll<RoomType>('rooms', range, 'propertyId');
  }

  async savePlace(place: Place): Promise<string> {
    return await this.create('places', place);
  }

  async getPlacesByProperty(propertyId: string): Promise<Place[]> {
    const range = IDBKeyRange.only(propertyId);
    return await this.getAll<Place>('places', range, 'propertyId');
  }

  // Snapshot operations
  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    await this.create('snapshots', snapshot);

    // Keep only last 20 snapshots
    const all = await this.getAll<Snapshot>('snapshots');
    if (all.length > 20) {
      const toDelete = all.slice(20);
      for (const snap of toDelete) {
        await this.delete('snapshots', snap.id);
      }
    }
  }

  async getSnapshots(): Promise<Snapshot[]> {
    return await this.getAll<Snapshot>('snapshots');
  }

  async getSnapshot(id: string): Promise<Snapshot | null> {
    return await this.read<Snapshot>('snapshots', id) || null;
  }

  async deleteSnapshot(id: string): Promise<void> {
    await this.delete('snapshots', id);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    const storeNames = this.db?.objectStoreNames || [];
    for (let i = 0; i < storeNames.length; i++) {
      const storeName = storeNames[i];
      const store = await this.getStore(storeName, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async exportData(): Promise<string> {
    const exportData: any = {
      version: DATABASE_CONFIG.version,
      exportedAt: new Date().toISOString(),
      data: {}
    };

    const storeNames = this.db?.objectStoreNames || [];
    for (let i = 0; i < storeNames.length; i++) {
      const storeName = storeNames[i];
      exportData.data[storeName] = await this.getAll(storeName);
    }

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    for (const [storeName, items] of Object.entries(data.data || {})) {
      if (Array.isArray(items)) {
        for (const item of items) {
          await this.create(storeName, item);
        }
      }
    }
  }

  /**
   * Run database integrity check
   */
  async runIntegrityCheck(): Promise<{
    passed: boolean;
    issues: string[];
    storeCounts: Record<string, number>;
    checkResults: any;
  }> {
    const issues: string[] = [];
    const storeCounts: Record<string, number> = {};
    const checkResults: any = {};

    try {
      const db = await this.initialize();

      // Check all object stores exist
      const expectedStores = OBJECT_STORES.map(s => s.name);
      const actualStores = Array.from(db.objectStoreNames);

      for (const storeName of expectedStores) {
        if (!actualStores.includes(storeName)) {
          issues.push(`Missing object store: ${storeName}`);
        }
      }

      // Check each store
      for (const storeName of actualStores) {
        try {
          const count = await this.count(storeName);
          storeCounts[storeName] = count;

          // Basic validation for each store type
          switch (storeName) {
            case 'enquiries':
              await this.validateEnquiries(storeName, issues);
              break;
            case 'media':
              await this.validateMedia(storeName, issues);
              break;
            case 'properties':
              await this.validateProperties(storeName, issues);
              break;
            case 'rooms':
              await this.validateRooms(storeName, issues);
              break;
          }

          checkResults[storeName] = { count, status: 'ok' };
        } catch (error) {
          issues.push(`Error checking store ${storeName}: ${error}`);
          checkResults[storeName] = { count: 0, status: 'error', error: String(error) };
        }
      }

      // Check indexes
      await this.validateIndexes(issues);

      return {
        passed: issues.length === 0,
        issues,
        storeCounts,
        checkResults
      };
    } catch (error) {
      issues.push(`Database integrity check failed: ${error}`);
      return {
        passed: false,
        issues,
        storeCounts: {},
        checkResults: { error: String(error) }
      };
    }
  }

  /**
   * Validate enquiries store
   */
  private async validateEnquiries(storeName: string, issues: string[]): Promise<void> {
    const enquiries = await this.getAll(storeName);

    for (const enquiry of enquiries) {
      // Check required fields
      if (!enquiry.id) issues.push('Enquiry missing ID');
      if (!enquiry.customer?.email) issues.push('Enquiry missing customer email');
      if (!enquiry.status) issues.push('Enquiry missing status');
      if (!enquiry.createdAt) issues.push('Enquiry missing createdAt');

      // Check dates are valid
      if (enquiry.createdAt && isNaN(new Date(enquiry.createdAt).getTime())) {
        issues.push(`Enquiry ${enquiry.id} has invalid createdAt`);
      }
    }
  }

  /**
   * Validate media store
   */
  private async validateMedia(storeName: string, issues: string[]): Promise<void> {
    const media = await this.getAll(storeName);

    for (const item of media) {
      if (!item.id) issues.push('Media item missing ID');
      if (!item.type) issues.push('Media item missing type');
      if (!item.filename) issues.push('Media item missing filename');
    }
  }

  /**
   * Validate properties store
   */
  private async validateProperties(storeName: string, issues: string[]): Promise<void> {
    const properties = await this.getAll(storeName);

    for (const property of properties) {
      if (!property.id) issues.push('Property missing ID');
      if (!property.name) issues.push('Property missing name');
      if (!property.slug) issues.push('Property missing slug');
    }
  }

  /**
   * Validate rooms store
   */
  private async validateRooms(storeName: string, issues: string[]): Promise<void> {
    const rooms = await this.getAll(storeName);

    for (const room of rooms) {
      if (!room.id) issues.push('Room missing ID');
      if (!room.name) issues.push('Room missing name');
      if (!room.type) issues.push('Room missing type');
      if (typeof room.price !== 'number') issues.push('Room missing or invalid price');
    }
  }

  /**
   * Validate all indexes exist
   */
  private async validateIndexes(issues: string[]): Promise<void> {
    const db = await this.initialize();

    for (const storeConfig of OBJECT_STORES) {
      const store = db.transaction(storeConfig.name, 'readonly').objectStore(storeConfig.name);
      const indexNames = Array.from(store.indexNames);

      for (const indexConfig of storeConfig.indexes) {
        if (!indexNames.includes(indexConfig.name)) {
          issues.push(`Missing index ${indexConfig.name} in store ${storeConfig.name}`);
        }
      }
    }
  }

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initializationPromise = null;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();