import { databaseService } from './databaseService';
import { fileStorageService } from './fileStorage';
import { DraftContent, PublishedContent, Snapshot, Media, SiteSettings } from '../types/admin';

interface MigrationProgress {
  total: number;
  completed: number;
  currentStep: string;
  error?: string;
  warnings: string[];
}

interface MigrationResult {
  success: boolean;
  message: string;
  details: {
    draftMigrated: boolean;
    publishedMigrated: boolean;
    mediaCount: number;
    settingsMigrated: boolean;
    snapshotsCount: number;
    enquiriesCount: number;
    warnings: string[];
  };
}

export class MigrationService {
  private progressCallback?: (progress: MigrationProgress) => void;

  constructor() {
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
      console.warn('IndexedDB is not supported in this browser');
    }
  }

  async migrateFromLocalStorage(): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      message: '',
      details: {
        draftMigrated: false,
        publishedMigrated: false,
        mediaCount: 0,
        settingsMigrated: false,
        snapshotsCount: 0,
        enquiriesCount: 0,
        warnings: []
      }
    };

    try {
      // Step 1: Check if migration is needed
      this.updateProgress('Checking existing data...', 0, 5);
      const hasLocalStorageData = await this.checkLocalStorageData();

      if (!hasLocalStorageData) {
        result.success = true;
        result.message = 'No data to migrate - starting fresh';
        return result;
      }

      // Step 2: Create backup before migration
      this.updateProgress('Creating backup...', 1, 5);
      const backup = await this.createBackup();
      localStorage.setItem('migrationBackup', JSON.stringify(backup));

      // Step 3: Migrate draft content
      this.updateProgress('Migrating draft content...', 2, 5);
      const draft = await fileStorageService.loadDraft();
      if (draft) {
        await databaseService.saveDraft(draft);
        result.details.draftMigrated = true;
      }

      // Step 4: Migrate published content
      this.updateProgress('Migrating published content...', 2, 5);
      const published = await fileStorageService.loadPublished();
      if (published) {
        await databaseService.savePublished(published);
        result.details.publishedMigrated = true;
      }

      // Step 5: Migrate settings
      this.updateProgress('Migrating settings...', 3, 5);
      const settings = await fileStorageService.loadSettings();
      if (settings) {
        await databaseService.saveSettings(settings);
        result.details.settingsMigrated = true;
      }

      // Step 6: Migrate media
      this.updateProgress('Migrating media files...', 3, 5);
      const mediaManifest = await fileStorageService.loadMediaManifest();
      let mediaCount = 0;
      for (const [id, media] of Object.entries(mediaManifest)) {
        await databaseService.saveMedia(media);
        mediaCount++;
      }
      result.details.mediaCount = mediaCount;

      // Step 7: Migrate snapshots
      this.updateProgress('Migrating snapshots...', 4, 5);
      const snapshots = await fileStorageService.listSnapshots();
      for (const snapshot of snapshots) {
        await databaseService.saveSnapshot(snapshot);
      }
      result.details.snapshotsCount = snapshots.length;

      // Step 8: Migrate enquiries
      this.updateProgress('Migrating enquiries...', 4, 5);
      const enquiries = await fileStorageService.loadEnquiries();
      for (const enquiry of enquiries) {
        await databaseService.saveEnquiry(enquiry);
      }
      result.details.enquiriesCount = enquiries.length;

      // Step 9: Verify migration
      this.updateProgress('Verifying migration...', 5, 5);
      const verification = await this.verifyMigration();

      if (!verification.success) {
        result.details.warnings.push(...verification.warnings);
        if (verification.warnings.length > 0) {
          result.details.warnings.push('Some data may not have migrated correctly. Check the console for details.');
        }
      }

      // Step 10: Cleanup (optional - keep localStorage as backup)
      // await this.cleanupLocalStorage();

      result.success = true;
      result.message = `Migration completed successfully in ${Date.now() - startTime}ms`;

    } catch (error) {
      console.error('Migration failed:', error);
      result.success = false;
      result.message = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;

      // Attempt rollback
      try {
        await this.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
        result.message += ' (Rollback also failed)';
      }
    }

    return result;
  }

  private async checkLocalStorageData(): Promise<boolean> {
    const checks = [
      localStorage.getItem('data/draft.json'),
      localStorage.getItem('data/published.json'),
      localStorage.getItem('data/settings.json'),
      localStorage.getItem('data/media-manifest.json'),
      localStorage.getItem('data/enquiries.json')
    ];

    return checks.some(item => item !== null);
  }

  private async createBackup(): Promise<any> {
    const backup: any = {
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Backup all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('data/')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            backup.data[key] = JSON.parse(value);
          }
        } catch (error) {
          console.warn(`Failed to backup ${key}:`, error);
        }
      }
    }

    return backup;
  }

  private async verifyMigration(): Promise<{ success: boolean; warnings: string[] }> {
    const warnings: string[] = [];
    let success = true;

    try {
      // Verify draft
      const draft = await databaseService.loadDraft();
      const lsDraft = await fileStorageService.loadDraft();
      if (draft && lsDraft) {
        if (JSON.stringify(draft) !== JSON.stringify(lsDraft)) {
          warnings.push('Draft content mismatch after migration');
          success = false;
        }
      }

      // Verify media count
      const media = await databaseService.getAllMedia();
      const mediaManifest = await fileStorageService.loadMediaManifest();
      if (media.length !== Object.keys(mediaManifest).length) {
        warnings.push(`Media count mismatch: ${media.length} vs ${Object.keys(mediaManifest).length}`);
      }

      // Verify settings
      const settings = await databaseService.loadSettings();
      const lsSettings = await fileStorageService.loadSettings();
      if (settings && lsSettings) {
        if (JSON.stringify(settings) !== JSON.stringify(lsSettings)) {
          warnings.push('Settings mismatch after migration');
          success = false;
        }
      }

    } catch (error) {
      warnings.push(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      success = false;
    }

    return { success, warnings };
  }

  private async rollback(): Promise<void> {
    const backupData = localStorage.getItem('migrationBackup');
    if (!backupData) {
      throw new Error('No backup found for rollback');
    }

    const backup = JSON.parse(backupData);

    // Clear IndexedDB
    await databaseService.clearAllData();

    // Restore localStorage from backup
    for (const [key, value] of Object.entries(backup.data)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  private async cleanupLocalStorage(): Promise<void> {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('data/')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private updateProgress(step: string, completed: number, total: number): void {
    if (this.progressCallback) {
      this.progressCallback({
        total,
        completed,
        currentStep: step,
        warnings: []
      });
    }
  }

  onProgress(callback: (progress: MigrationProgress) => void): void {
    this.progressCallback = callback;
  }

  // Additional utility methods
  async getMigrationStatus(): Promise<{ hasMigrated: boolean; localStorageSize: number; indexedDBSize: number }> {
    const hasLocalStorageData = await this.checkLocalStorageData();

    // Estimate localStorage size
    let localStorageSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('data/')) {
        localStorageSize += localStorage.getItem(key)?.length || 0;
      }
    }

    // Estimate IndexedDB size (approximate)
    let indexedDBSize = 0;
    try {
      const draft = await databaseService.loadDraft();
      const published = await databaseService.loadPublished();
      const media = await databaseService.getAllMedia();

      if (draft) indexedDBSize += JSON.stringify(draft).length;
      if (published) indexedDBSize += JSON.stringify(published).length;
      indexedDBSize += JSON.stringify(media).length;
    } catch (error) {
      console.warn('Could not estimate IndexedDB size:', error);
    }

    return {
      hasMigrated: !hasLocalStorageData && indexedDBSize > 0,
      localStorageSize,
      indexedDBSize
    };
  }

  async forceMigration(): Promise<MigrationResult> {
    // Reset migration flag and run migration again
    localStorage.removeItem('migrationCompleted');
    return await this.migrateFromLocalStorage();
  }
}

// Export singleton instance
export const migrationService = new MigrationService();