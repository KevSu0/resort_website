import { databaseService as globalDatabaseService, DatabaseService } from './databaseService';
import { type DraftContent, type PublishedContent, type Snapshot } from '../types/admin';
import { type Media, type SiteSettings } from '../types/entities';

const DATA_DIR = 'data';
const MEDIA_DIR = 'media';
const THUMBS_DIR = `${MEDIA_DIR}/.thumbs`;
const UPLOADS_DIR = `${MEDIA_DIR}/uploads`;

interface FileStorageConfig {
  dataDir: string;
  mediaDir: string;
  thumbsDir: string;
  uploadsDir: string;
}

export class FileStorageService {
  private config: FileStorageConfig;
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService = globalDatabaseService) {
    this.config = {
      dataDir: DATA_DIR,
      mediaDir: MEDIA_DIR,
      thumbsDir: THUMBS_DIR,
      uploadsDir: UPLOADS_DIR,
    };
    this.dbService = dbService;
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    // This is a placeholder. In a real browser environment, IndexedDB is managed by DatabaseService.
    console.log('Ensuring directories exist (placeholder):', this.config);
  }

  // All localStorage-based methods remain unchanged.
  async loadDraft(): Promise<DraftContent | null> {
    const key = `${this.config.dataDir}/draft.json`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async saveDraft(content: DraftContent): Promise<void> {
    const key = `${this.config.dataDir}/draft.json`;
    localStorage.setItem(key, JSON.stringify(content, null, 2));
  }

  async loadPublished(): Promise<PublishedContent | null> {
    const key = `${this.config.dataDir}/published.json`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async savePublished(content: PublishedContent): Promise<void> {
    const key = `${this.config.dataDir}/published.json`;
    localStorage.setItem(key, JSON.stringify(content, null, 2));
  }

  async loadSettings(): Promise<SiteSettings | null> {
    const key = `${this.config.dataDir}/settings.json`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    const key = `${this.config.dataDir}/settings.json`;
    localStorage.setItem(key, JSON.stringify(settings, null, 2));
  }

  async listSnapshots(): Promise<Snapshot[]> {
    const snapshots: Snapshot[] = [];
    const prefix = `${this.config.dataDir}/snapshots/`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          snapshots.push(JSON.parse(localStorage.getItem(key)!));
        } catch (error) {
          console.error('Failed to parse snapshot:', key, error);
        }
      }
    }
    return snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    const key = `${this.config.dataDir}/snapshots/${snapshot.id}.json`;
    localStorage.setItem(key, JSON.stringify(snapshot, null, 2));
    const snapshots = await this.listSnapshots();
    if (snapshots.length > 20) {
      localStorage.removeItem(`${this.config.dataDir}/snapshots/${snapshots[snapshots.length - 1].id}.json`);
    }
  }

  async saveMedia(media: Media, file: File): Promise<void> {
    const key = `${this.config.dataDir}/media-manifest.json`;
    const manifest = await this.loadMediaManifest();
    manifest[media.id] = media;
    localStorage.setItem(key, JSON.stringify(manifest, null, 2));
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const fileKey = `${this.config.mediaDir}/${media.id}.${media.filename.split('.').pop()}`;
        localStorage.setItem(fileKey, reader.result as string);
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async loadMediaManifest(): Promise<Record<string, Media>> {
    const key = `${this.config.dataDir}/media-manifest.json`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  }

  async getMediaFile(id: string): Promise<string | null> {
    const media = (await this.loadMediaManifest())[id];
    if (!media) return null;
    const fileKey = `${this.config.mediaDir}/${media.id}.${media.filename.split('.').pop()}`;
    return localStorage.getItem(fileKey);
  }

  /**
   * Get storage usage statistics using the centralized DatabaseService.
   */
  async getStorageUsage(): Promise<{ used: number; limit: number; breakdown: any }> {
    try {
      await this.dbService.initialize();
      const db = this.dbService.getDb();
      if (!db) {
        throw new Error('Database connection not available.');
      }

      let totalSize = 0;
      const breakdown = { media: 0, content: 0, settings: 0, other: 0 };
      const storeNames = Array.from(db.objectStoreNames);

      for (const storeName of storeNames) {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        const results = await new Promise<any[]>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        const storeData = JSON.stringify(results);
        const storeSize = new Blob([storeData]).size / (1024 * 1024); // in MB
        totalSize += storeSize;

        if (storeName === 'media') breakdown.media += storeSize;
        else if (storeName === 'draftContent' || storeName === 'publishedContent') breakdown.content += storeSize;
        else if (storeName === 'settings') breakdown.settings += storeSize;
        else breakdown.other += storeSize;
      }

      return {
        used: parseFloat(totalSize.toFixed(2)),
        limit: 100, // Default limit in MB
        breakdown: {
          media: parseFloat(breakdown.media.toFixed(2)),
          content: parseFloat(breakdown.content.toFixed(2)),
          settings: parseFloat(breakdown.settings.toFixed(2)),
          other: parseFloat(breakdown.other.toFixed(2)),
        },
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, limit: 100, breakdown: { media: 0, content: 0, settings: 0, other: 0 } };
    }
  }
}

export const fileStorageService = new FileStorageService();