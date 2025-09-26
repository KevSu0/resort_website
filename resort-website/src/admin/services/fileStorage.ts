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

  constructor() {
    this.config = {
      dataDir: DATA_DIR,
      mediaDir: MEDIA_DIR,
      thumbsDir: THUMBS_DIR,
      uploadsDir: UPLOADS_DIR,
    };
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    // This would normally create directories on the filesystem
    // For browser-based storage, we'll use IndexedDB or similar
    console.log('Ensuring directories exist:', this.config);
  }

  // Content operations
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

  // Settings operations
  async loadSettings(): Promise<SiteSettings | null> {
    const key = `${this.config.dataDir}/settings.json`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    const key = `${this.config.dataDir}/settings.json`;
    localStorage.setItem(key, JSON.stringify(settings, null, 2));
  }

  // Snapshot operations
  async listSnapshots(): Promise<Snapshot[]> {
    const snapshots: Snapshot[] = [];
    const prefix = `${this.config.dataDir}/snapshots/`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          snapshots.push(data);
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

    // Keep only last 20 snapshots
    const snapshots = await this.listSnapshots();
    if (snapshots.length > 20) {
      const toDelete = snapshots.slice(20);
      toDelete.forEach(s => {
        localStorage.removeItem(`${this.config.dataDir}/snapshots/${s.id}.json`);
      });
    }
  }

  async loadSnapshot(id: string): Promise<Snapshot | null> {
    const key = `${this.config.dataDir}/snapshots/${id}.json`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSnapshot(id: string): Promise<void> {
    const key = `${this.config.dataDir}/snapshots/${id}.json`;
    localStorage.removeItem(key);
  }

  // Media operations
  async saveMedia(media: Media, file: File): Promise<void> {
    // Save media metadata
    const key = `${this.config.dataDir}/media-manifest.json`;
    const manifest = await this.loadMediaManifest();
    manifest[media.id] = media;
    localStorage.setItem(key, JSON.stringify(manifest, null, 2));

    // Save file as base64 (for demo purposes)
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

  async loadMedia(id: string): Promise<Media | null> {
    const manifest = await this.loadMediaManifest();
    return manifest[id] || null;
  }

  async loadMediaManifest(): Promise<Record<string, Media>> {
    const key = `${this.config.dataDir}/media-manifest.json`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  }

  async getMediaFile(id: string): Promise<string | null> {
    const media = await this.loadMedia(id);
    if (!media) return null;

    const fileKey = `${this.config.mediaDir}/${media.id}.${media.filename.split('.').pop()}`;
    return localStorage.getItem(fileKey);
  }

  async deleteMedia(id: string): Promise<void> {
    const manifest = await this.loadMediaManifest();
    const media = manifest[id];
    if (!media) return;

    // Delete metadata
    delete manifest[id];
    const key = `${this.config.dataDir}/media-manifest.json`;
    localStorage.setItem(key, JSON.stringify(manifest, null, 2));

    // Delete file
    const fileKey = `${this.config.mediaDir}/${media.id}.${media.filename.split('.').pop()}`;
    localStorage.removeItem(fileKey);

    // Delete thumbnail
    const thumbKey = `${this.config.thumbsDir}/${id}.jpg`;
    localStorage.removeItem(thumbKey);
  }

  // Enquiries operations
  async loadEnquiries(): Promise<any[]> {
    const key = `${this.config.dataDir}/enquiries.json`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  async saveEnquiries(enquiries: any[]): Promise<void> {
    const key = `${this.config.dataDir}/enquiries.json`;
    localStorage.setItem(key, JSON.stringify(enquiries, null, 2));
  }

  // Export/Import operations
  async exportData(options: { includeMedia: boolean; includeSnapshots: boolean }): Promise<string> {
    const exportData: any = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      draft: await this.loadDraft(),
      published: await this.loadPublished(),
      settings: await this.loadSettings(),
      enquiries: await this.loadEnquiries(),
    };

    if (options.includeSnapshots) {
      exportData.snapshots = await this.listSnapshots();
    }

    if (options.includeMedia) {
      exportData.mediaManifest = await this.loadMediaManifest();
      exportData.media = {};
      const manifest = await this.loadMediaManifest();
      for (const [id, _media] of Object.entries(manifest)) {
        const fileData = await this.getMediaFile(id);
        if (fileData) {
          exportData.media[id] = fileData;
        }
      }
    }

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonData);

      if (data.draft) await this.saveDraft(data.draft);
      if (data.published) await this.savePublished(data.published);
      if (data.settings) await this.saveSettings(data.settings);
      if (data.enquiries) await this.saveEnquiries(data.enquiries);

      if (data.snapshots) {
        for (const snapshot of data.snapshots) {
          await this.saveSnapshot(snapshot);
        }
      }

      if (data.mediaManifest && data.media) {
        for (const [id, media] of Object.entries(data.mediaManifest as Record<string, Media>)) {
          const fileData = data.media[id];
          if (fileData) {
            await this.saveMedia(media, this.dataURLtoFile(fileData, media.filename));
          }
        }
      }

      return { success: true, message: 'Import successful' };
    } catch (error) {
      return { success: false, message: `Import failed: ${error}` };
    }
  }

  private dataURLtoFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Initialize with default data
  async initializeWithDefaults(): Promise<void> {
    const hasData = await this.loadDraft();
    if (hasData) return;

    // Create default settings
    const defaultSettings: SiteSettings = {
      phones: ['+91 98765 43210', '+91 87654 32109'],
      whatsapp: '+919876543210',
      email: 'info@wayanadresorts.com',
      address: 'Wayanad, Kerala, India',
      legal: {
        privacy: '/privacy',
        terms: '/terms',
        cancellation: '/cancellation',
      },
      booking: {
        sla: 'We respond within 24 hours',
        paymentMethods: ['Credit Card', 'Debit Card', 'UPI', 'Bank Transfer'],
        cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
      },
      featureFlags: {
        enableReferrals: false,
        enablePromos: false,
        enableI18n: false,
        enableAnalytics: false,
        enableVideo: false,
      },
      maxDiscountCapPercent: 25,
      currency: {
        code: 'INR',
        symbol: '₹',
        locale: 'en-IN',
      },
      updatedAt: new Date().toISOString(),
    };

    await this.saveSettings(defaultSettings);
  }
}

export const fileStorageService = new FileStorageService();