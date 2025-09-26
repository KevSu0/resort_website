import { type ExportOptions, type ImportResult, type ImportDiff } from '../types/admin';
import { fileStorageService } from './fileStorage';
import JSZip from 'jszip';

const SCHEMA_VERSION = '1.0.0';

export interface ExportManifest {
  version: string;
  exportedAt: string;
  description?: string;
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
    try {
      // Read ZIP file
      const zip = await JSZip.loadAsync(file);

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

      // Apply changes
      await fileStorageService.saveDraft(draft);
      if (published) {
        await fileStorageService.savePublished(published);
      }
      await fileStorageService.saveSettings(settings);
      await fileStorageService.saveEnquiries(enquiries);

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

      return {
        success: true,
        message: 'Import completed successfully',
        diff,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
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

    return diff;
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
}

export const exportImportService = new ExportImportService();