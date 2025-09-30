import { type ExportOptions, type ImportResult, type ImportDiff } from '../types/admin';
import { fileStorageService } from './fileStorage';
import JSZip from 'jszip';

const SCHEMA_VERSION = '1.0.0';

export interface ExportManifest {
  version: string;
  exportedAt: string;
  description?: string;
  backupId?: string;
}

export class ExportImportService {
  async exportData(options: ExportOptions): Promise<Blob> {
    const zip = new JSZip();

    // Create manifest
    const manifest: ExportManifest = {
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      description: options.snapshotId ? `Snapshot: ${options.snapshotId}` : 'Full export',
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Export content
    const draft = await fileStorageService.loadDraft();
    const published = await fileStorageService.loadPublished();
    const settings = await fileStorageService.loadSettings();
    const enquiries = await fileStorageService.loadEnquiries();

    zip.file('content/draft.json', JSON.stringify(draft, null, 2));
    zip.file('content/published.json', JSON.stringify(published, null, 2));
    zip.file('content/settings.json', JSON.stringify(settings, null, 2));
    zip.file('content/enquiries.json', JSON.stringify(enquiries, null, 2));

    // Export snapshots if requested
    if (options.includeSnapshots) {
      const snapshots = await fileStorageService.listSnapshots();
      const snapshotsFolder = zip.folder('snapshots');
      if (snapshotsFolder) {
        snapshots.forEach(snapshot => {
          snapshotsFolder.file(`${snapshot.id}.json`, JSON.stringify(snapshot, null, 2));
        });
      }
    }

    // Export media if requested
    if (options.includeMedia) {
      const mediaManifest = await fileStorageService.loadMediaManifest();
      zip.file('media/manifest.json', JSON.stringify(mediaManifest, null, 2));

      const mediaFolder = zip.folder('media/files');
      if (mediaFolder) {
        for (const [mediaId, media] of Object.entries(mediaManifest)) {
          const fileData = await fileStorageService.getMediaFile(mediaId);
          if (fileData) {
            // Convert base64 to blob
            const response = await fetch(fileData);
            const blob = await response.blob();
            mediaFolder.file(`${mediaId}.${media.filename.split('.').pop()}`, blob);
          }
        }
      }
    }

    // Generate ZIP
    return zip.generateAsync({ type: 'blob' });
  }

  async importData(file: File, dryRun: boolean = true): Promise<ImportResult> {
    const startTime = Date.now();
    const errorLog: string[] = [];

    try {
      // Validate file
      if (!file.name.endsWith('.zip')) {
        throw new Error('Invalid file format. Please select a .zip file.');
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error('File too large. Maximum size is 100MB.');
      }

      // Read ZIP file with error handling
      let zip;
      try {
        zip = await JSZip.loadAsync(file);
      } catch (error) {
        throw new Error('Invalid or corrupted ZIP file. Please ensure the file was exported from this system.');
      }

      // Read manifest
      const manifestData = await zip.file('manifest.json')?.async('text');
      if (!manifestData) {
        throw new Error('Invalid export file: missing manifest');
      }

      const manifest = JSON.parse(manifestData);

      // Validate version
      if (manifest.version !== SCHEMA_VERSION) {
        throw new Error(`Incompatible schema version: ${manifest.version}. Expected: ${SCHEMA_VERSION}`);
      }

      // Read content files
      const draftData = await zip.file('content/draft.json')?.async('text');
      const publishedData = await zip.file('content/published.json')?.async('text');
      const settingsData = await zip.file('content/settings.json')?.async('text');
      const enquiriesData = await zip.file('content/enquiries.json')?.async('text');

      if (!draftData || !settingsData) {
        throw new Error('Invalid export file: missing required content files');
      }

      const draft = JSON.parse(draftData);
      const published = publishedData ? JSON.parse(publishedData) : null;
      const settings = JSON.parse(settingsData);
      const enquiries = enquiriesData ? JSON.parse(enquiriesData) : [];

      // Generate diff
      const diff = await this.generateDiff(draft, published, settings, enquiries);

      if (dryRun) {
        return {
          success: true,
          message: 'Dry run completed. Review changes below.',
          diff,
        };
      }

      // Apply changes with backup and error recovery
      const backupId = `backup-${Date.now()}`;
      try {
        await this.createBackup(backupId);
        console.log(`Backup created: ${backupId}`);
      } catch (backupError) {
        errorLog.push(`Failed to create backup: ${backupError instanceof Error ? backupError.message : 'Unknown error'}`);
        // Continue with import but log the error
      }

      // Apply changes with amenity de-duplication and error handling
      try {
        const processedDraft = this.processAmenities(draft);
        await fileStorageService.saveDraft(processedDraft);

        if (published) {
          const processedPublished = this.processAmenities(published);
          await fileStorageService.savePublished(processedPublished);
        }

        await fileStorageService.saveSettings(settings);
        await fileStorageService.saveEnquiries(enquiries);
      } catch (saveError) {
        // Attempt rollback if save fails
        console.error('Save failed, attempting rollback:', saveError);
        try {
          await this.rollback(backupId);
          errorLog.push('Changes were rolled back due to save error');
        } catch (rollbackError) {
          errorLog.push(`Rollback failed: ${rollbackError instanceof Error ? rollbackError.message : 'Unknown error'}`);
        }
        throw new Error(`Failed to save data: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
      }

      // Import snapshots if present
      const snapshotsFolder = zip.folder('snapshots');
      if (snapshotsFolder) {
        const snapshotFiles = Object.keys(snapshotsFolder.files);
        for (const fileName of snapshotFiles) {
          if (fileName.endsWith('.json')) {
            const snapshotData = await snapshotsFolder.file(fileName)?.async('text');
            if (snapshotData) {
              const snapshot = JSON.parse(snapshotData);
              await fileStorageService.saveSnapshot(snapshot);
            }
          }
        }
      }

      // Import media if present
      const mediaFolder = zip.folder('media/files');
      const mediaManifestData = await zip.file('media/manifest.json')?.async('text');
      if (mediaFolder && mediaManifestData) {
        const mediaManifest = JSON.parse(mediaManifestData);

        for (const [mediaId, media] of Object.entries(mediaManifest as any)) {
          const mediaItem = media as any;
          const fileExtension = mediaItem.filename.split('.').pop();
          const fileData = await mediaFolder.file(`${mediaId}.${fileExtension}`)?.async('base64');
          if (fileData) {
            // Convert base64 to File
            const byteCharacters = atob(fileData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mediaItem.mime });
            const file = new File([blob], mediaItem.filename, { type: mediaItem.mime });

            await fileStorageService.saveMedia(mediaItem, file);
          }
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`Import completed in ${totalTime}ms`);

      return {
        success: true,
        message: errorLog.length > 0
          ? `Import completed with ${errorLog.length} warning(s). Check logs for details.`
          : 'Import completed successfully',
        diff,
        backupId,
        errors: errorLog.length > 0 ? errorLog : undefined,
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`Import failed after ${totalTime}ms:`, error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
        errors: errorLog.length > 0 ? [...errorLog, error instanceof Error ? error.message : 'Unknown error'] : undefined,
      };
    }
  }

  private async generateDiff(
    draft: any,
    _published: any,
    settings: any,
    _enquiries: any[]
  ): Promise<ImportDiff> {
    const currentDraft = await fileStorageService.loadDraft() || {
      properties: [],
      rooms: [],
      places: [],
      offers: [],
      promoCodes: [],
      referrers: []
    };
    const currentSettings = await fileStorageService.loadSettings();

    const diff: ImportDiff = {
      added: 0,
      modified: 0,
      removed: 0,
      details: [],
      amenityDuplicates: 0,
      amenityNormalized: 0,
    };

    // Compare properties
    this.compareEntities(
      draft.properties || [],
      currentDraft.properties || [],
      'Property',
      diff
    );

    // Compare rooms
    this.compareEntities(
      draft.rooms || [],
      currentDraft.rooms || [],
      'Room',
      diff
    );

    // Compare places
    this.compareEntities(
      draft.places || [],
      currentDraft.places || [],
      'Place',
      diff
    );

    // Compare offers
    this.compareEntities(
      draft.offers || [],
      currentDraft.offers || [],
      'Offer',
      diff
    );

    // Compare promo codes
    this.compareEntities(
      draft.promoCodes || [],
      currentDraft.promoCodes || [],
      'PromoCode',
      diff
    );

    // Compare referrers
    this.compareEntities(
      draft.referrers || [],
      currentDraft.referrers || [],
      'Referrer',
      diff
    );

    // Compare settings
    if (JSON.stringify(settings) !== JSON.stringify(currentSettings)) {
      diff.modified++;
      diff.details.push({
        type: 'modified',
        entity: 'Settings',
        id: 'settings',
        name: 'Site Settings',
      });
    }

    // Detect amenity duplicates
    const amenityAnalysis = this.analyzeAmenities(draft.properties || [], currentDraft.properties || []);
    diff.amenityDuplicates = amenityAnalysis.duplicates;
    diff.amenityNormalized = amenityAnalysis.normalized;

    return diff;
  }

  private analyzeAmenities(newProperties: any[], currentProperties: any[]) {
    const allAmenities = new Set<string>();
    const duplicates: string[] = [];
    let normalizedCount = 0;

    // Collect all amenities from new properties
    newProperties.forEach(property => {
      if (property.amenities && Array.isArray(property.amenities)) {
        property.amenities.forEach((amenity: string) => {
          const normalized = this.normalizeAmenity(amenity);
          if (allAmenities.has(normalized)) {
            duplicates.push(amenity);
          } else {
            allAmenities.add(normalized);
          }
        });
      }
    });

    return {
      duplicates: duplicates.length,
      normalized: allAmenities.size
    };
  }

  private normalizeAmenity(amenity: string): string {
    return amenity
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }

  private compareEntities(
    newItems: any[],
    currentItems: any[],
    entityName: string,
    diff: ImportDiff
  ): void {
    const newMap = new Map(newItems.map(item => [item.id, item]));
    const currentMap = new Map(currentItems.map(item => [item.id, item]));

    // Find added/modified
    for (const [id, newItem] of newMap) {
      const currentItem = currentMap.get(id);
      if (!currentItem) {
        diff.added++;
        diff.details.push({
          type: 'added',
          entity: entityName,
          id,
          name: newItem.name || id,
        });
      } else if (JSON.stringify(newItem) !== JSON.stringify(currentItem)) {
        diff.modified++;
        diff.details.push({
          type: 'modified',
          entity: entityName,
          id,
          name: newItem.name || id,
        });
      }
    }

    // Find removed
    for (const [id, currentItem] of currentMap) {
      if (!newMap.has(id)) {
        diff.removed++;
        diff.details.push({
          type: 'removed',
          entity: entityName,
          id,
          name: currentItem.name || id,
        });
      }
    }
  }

  private async createBackup(backupId: string): Promise<void> {
    const draft = await fileStorageService.loadDraft();
    const published = await fileStorageService.loadPublished();
    const settings = await fileStorageService.loadSettings();
    const enquiries = await fileStorageService.loadEnquiries();

    const backup = {
      id: backupId,
      createdAt: new Date().toISOString(),
      data: {
        draft,
        published,
        settings,
        enquiries
      }
    };

    await fileStorageService.saveBackup(backup);
  }

  private processAmenities(data: any): any {
    if (!data.properties || !Array.isArray(data.properties)) {
      return data;
    }

    const processedData = { ...data };
    processedData.properties = data.properties.map((property: any) => {
      if (!property.amenities || !Array.isArray(property.amenities)) {
        return property;
      }

      // De-duplicate amenities
      const uniqueAmenities = new Map<string, string>();
      property.amenities.forEach((amenity: string) => {
        const normalized = this.normalizeAmenity(amenity);
        if (!uniqueAmenities.has(normalized)) {
          uniqueAmenities.set(normalized, amenity);
        }
      });

      return {
        ...property,
        amenities: Array.from(uniqueAmenities.values())
      };
    });

    return processedData;
  }

  async rollback(backupId: string): Promise<boolean> {
    try {
      const backup = await fileStorageService.loadBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Restore data from backup
      await fileStorageService.saveDraft(backup.data.draft);
      if (backup.data.published) {
        await fileStorageService.savePublished(backup.data.published);
      }
      await fileStorageService.saveSettings(backup.data.settings);
      await fileStorageService.saveEnquiries(backup.data.enquiries);

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }
}

export const exportImportService = new ExportImportService();