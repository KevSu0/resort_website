import { type DraftContent, type PublishedContent, type Snapshot } from '../types/admin';
import { type PublishOptions } from '../types/admin';
import { fileStorageService } from './fileStorage';
import { v4 as uuidv4 } from 'uuid';

export class PublishService {
  async createSnapshot(content: DraftContent, label: string, createdBy: string): Promise<Snapshot> {
    const snapshot: Snapshot = {
      id: uuidv4(),
      label,
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(content)),
      createdBy,
    };

    await fileStorageService.saveSnapshot(snapshot);
    return snapshot;
  }

  async publish(options: PublishOptions, userId: string): Promise<PublishedContent> {
    // Load current draft
    const draft = await fileStorageService.loadDraft();
    if (!draft) {
      throw new Error('No draft content available');
    }

    // Create snapshot if requested
    if (options.createSnapshot) {
      await this.createSnapshot(draft, options.label, userId);
    }

    // Create published content
    const published: PublishedContent = {
      ...draft,
      publishedAt: new Date().toISOString(),
      version: `v${Date.now()}`,
    };

    // Save published content
    await fileStorageService.savePublished(published);

    return published;
  }

  async rollback(snapshotId: string, publishImmediately: boolean = false): Promise<{
    restored: DraftContent;
    published?: PublishedContent;
  }> {
    // Load snapshot
    const snapshot = await fileStorageService.loadSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error('Snapshot not found');
    }

    // Restore to draft
    await fileStorageService.saveDraft(snapshot.data);

    const result: { restored: DraftContent; published?: PublishedContent } = {
      restored: snapshot.data,
    };

    // Publish immediately if requested
    if (publishImmediately) {
      const published: PublishedContent = {
        ...snapshot.data,
        publishedAt: new Date().toISOString(),
        version: `rollback-${Date.now()}`,
      };
      await fileStorageService.savePublished(published);
      result.published = published;
    }

    return result;
  }

  async getPublishHistory(): Promise<Array<{
    id: string;
    label: string;
    timestamp: string;
    type: 'publish' | 'rollback';
    publishedAt?: string;
    version?: string;
  }>> {
    const history: Array<{
      id: string;
      label: string;
      timestamp: string;
      type: 'publish' | 'rollback';
      publishedAt?: string;
      version?: string;
    }> = [];

    // Get published content info
    const published = await fileStorageService.loadPublished();
    if (published) {
      history.push({
        id: published.publishedAt,
        label: 'Current Published',
        timestamp: published.publishedAt,
        type: 'publish',
        publishedAt: published.publishedAt,
        version: published.version,
      });
    }

    // Get snapshots
    const snapshots = await fileStorageService.listSnapshots();
    snapshots.forEach(snapshot => {
      history.push({
        id: snapshot.id,
        label: snapshot.label,
        timestamp: snapshot.timestamp,
        type: 'rollback',
      });
    });

    // Sort by timestamp (newest first)
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async compareWithPublished(draft: DraftContent): Promise<{
    hasChanges: boolean;
    changes: Array<{
      entity: string;
      action: 'added' | 'modified' | 'removed';
      id: string;
      name: string;
      details?: any;
    }>;
  }> {
    const published = await fileStorageService.loadPublished();
    if (!published) {
      return { hasChanges: true, changes: [] };
    }

    const changes: Array<{
      entity: string;
      action: 'added' | 'modified' | 'removed';
      id: string;
      name: string;
      details?: any;
    }> = [];

    // Compare properties
    this.compareEntities(draft.properties, published.properties, 'Property', changes);

    // Compare rooms
    this.compareEntities(draft.rooms, published.rooms, 'Room', changes);

    // Compare places
    this.compareEntities(draft.places, published.places, 'Place', changes);

    // Compare offers
    this.compareEntities(draft.offers, published.offers, 'Offer', changes);

    // Compare promo codes
    this.compareEntities(draft.promoCodes, published.promoCodes, 'PromoCode', changes);

    // Compare referrers
    this.compareEntities(draft.referrers, published.referrers, 'Referrer', changes);

    // Compare landing content
    if (JSON.stringify(draft.landing) !== JSON.stringify(published.landing)) {
      changes.push({
        entity: 'Landing',
        action: 'modified',
        id: 'landing',
        name: 'Landing Page',
      });
    }

    // Compare settings
    if (JSON.stringify(draft.settings) !== JSON.stringify(published.settings)) {
      changes.push({
        entity: 'Settings',
        action: 'modified',
        id: 'settings',
        name: 'Site Settings',
      });
    }

    return {
      hasChanges: changes.length > 0,
      changes,
    };
  }

  private compareEntities<T extends { id: string; name?: string }>(
    draft: T[],
    published: T[],
    entityName: string,
    changes: Array<{
      entity: string;
      action: 'added' | 'modified' | 'removed';
      id: string;
      name: string;
      details?: any;
    }>
  ): void {
    const draftMap = new Map(draft.map(e => [e.id, e]));
    const publishedMap = new Map(published.map(e => [e.id, e]));

    // Find added/modified
    for (const [id, entity] of Array.from(draftMap.entries())) {
      const publishedEntity = publishedMap.get(id);
      if (!publishedEntity) {
        changes.push({
          entity: entityName,
          action: 'added',
          id,
          name: entity.name || id,
        });
      } else if (JSON.stringify(entity) !== JSON.stringify(publishedEntity)) {
        changes.push({
          entity: entityName,
          action: 'modified',
          id,
          name: entity.name || id,
          details: entity,
        });
      }
    }

    // Find removed
    for (const [id, entity] of Array.from(publishedMap.entries())) {
      if (!draftMap.has(id)) {
        changes.push({
          entity: entityName,
          action: 'removed',
          id,
          name: entity.name || id,
        });
      }
    }
  }

  async getDraftStatus(): Promise<{
    hasUnpublishedChanges: boolean;
    lastPublished?: string;
    draftModified?: string;
  }> {
    const [draft, published, _history] = await Promise.all([
      fileStorageService.loadDraft(),
      fileStorageService.loadPublished(),
      this.getPublishHistory(),
    ]);

    const comparison = draft && published ? await this.compareWithPublished(draft) : null;

    return {
      hasUnpublishedChanges: comparison?.hasChanges || !published,
      lastPublished: published?.publishedAt,
      draftModified: draft ? await this.getDraftModifiedTime() : undefined,
    };
  }

  private async getDraftModifiedTime(): Promise<string> {
    // This would track when draft was last modified
    // For now, return current time
    return new Date().toISOString();
  }
}

export const publishService = new PublishService();