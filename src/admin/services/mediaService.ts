import { type Media } from '../types/entities';
import { type MediaValidationResult } from '../types/admin';
import { fileStorageService } from './fileStorage';
import { ValidationDictionaryService } from './validationDictionaryService';
import { v4 as uuidv4 } from 'uuid';

interface MediaValidationConfig {
  maxFileSize: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: { width: number; height: number };
  allowedTypes: string[];
}

const HERO_CONFIG: MediaValidationConfig = {
  maxFileSize: 1.5 * 1024 * 1024, // 1.5 MB
  maxWidth: 2000,
  maxHeight: 1333,
  aspectRatio: { width: 3, height: 2 },
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
};

const GALLERY_CONFIG: MediaValidationConfig = {
  maxFileSize: 1 * 1024 * 1024, // 1 MB
  maxWidth: 1600,
  maxHeight: 1066,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
};

const VIDEO_CONFIG: MediaValidationConfig = {
  maxFileSize: 20 * 1024 * 1024, // 20 MB
  allowedTypes: ['video/mp4'],
};

export class MediaService {
  async validateMedia(file: File, type: 'hero' | 'gallery' | 'video' = 'gallery'): Promise<MediaValidationResult> {
    const config = type === 'hero' ? HERO_CONFIG : type === 'video' ? VIDEO_CONFIG : GALLERY_CONFIG;
    const warnings: string[] = [];

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`,
      };
    }

    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${this.formatBytes(config.maxFileSize)}`,
      };
    }

    // For images, check dimensions and aspect ratio
    if (file.type.startsWith('image/')) {
      try {
        const dimensions = await this.getImageDimensions(file);

        if (config.maxWidth && dimensions.width > config.maxWidth) {
          return {
            isValid: false,
            error: `Image too wide. Maximum width: ${config.maxWidth}px`,
          };
        }

        if (config.maxHeight && dimensions.height > config.maxHeight) {
          return {
            isValid: false,
            error: `Image too tall. Maximum height: ${config.maxHeight}px`,
          };
        }

        if (config.aspectRatio) {
          const expectedRatio = config.aspectRatio.width / config.aspectRatio.height;
          const actualRatio = dimensions.width / dimensions.height;
          const tolerance = 0.05; // 5% tolerance

          if (Math.abs(actualRatio - expectedRatio) > tolerance) {
            warnings.push(`Recommended aspect ratio is ${config.aspectRatio.width}:${config.aspectRatio.height}`);
          }
        }

        // Check display size for hero images
        if (type === 'hero' && file.size > 200 * 1024) {
          warnings.push('For optimal LCP performance, hero images should be under 200KB');
        }
      } catch (error) {
        return {
          isValid: false,
          error: 'Failed to read image dimensions',
        };
      }
    }

    // For videos, check duration (if possible)
    if (file.type.startsWith('video/')) {
      try {
        const duration = await this.getVideoDuration(file);
        if (duration > 300) { // 5 minutes
          warnings.push('Video duration exceeds 5 minutes');
        }
      } catch (error) {
        // Duration check is optional
      }
    }

    return {
      isValid: true,
      warnings,
    };
  }

  async uploadMedia(file: File, alt: string, type: 'hero' | 'gallery' | 'video' = 'gallery'): Promise<Media> {
    // Validate first
    const validation = await this.validateMedia(file, type);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check for duplicates by hash
    const hash = await this.computeFileHash(file);
    const manifest = await fileStorageService.loadMediaManifest();

    for (const [id, existingMedia] of Object.entries(manifest)) {
      if (existingMedia.filename === file.name && existingMedia.bytes === file.size) {
        // Potential duplicate
        const existingHash = await this.computeFileHash(await this.getFileFromStorage(id));
        if (existingHash === hash) {
          throw new Error('File already exists. Use the existing media item.');
        }
      }
    }

    // Create media object
    const media: Media = {
      id: uuidv4(),
      kind: file.type.startsWith('image/') ? 'image' : 'video',
      filename: file.name,
      originalName: file.name,
      mime: file.type,
      bytes: file.size,
      alt,
      createdAt: new Date().toISOString(),
      usedBy: [],
    };

    // Get dimensions for images
    if (file.type.startsWith('image/')) {
      const dimensions = await this.getImageDimensions(file);
      media.width = dimensions.width;
      media.height = dimensions.height;
    }

    // Get duration for videos
    if (file.type.startsWith('video/')) {
      try {
        media.duration = await this.getVideoDuration(file);
      } catch (error) {
        // Duration is optional
      }
    }

    // Save to storage
    await fileStorageService.saveMedia(media, file);

    return media;
  }

  async replaceMedia(mediaId: string, newFile: File): Promise<Media> {
    const existingMedia = await fileStorageService.loadMedia(mediaId);
    if (!existingMedia) {
      throw new Error('Media not found');
    }

    // Validate new file
    const validation = await this.validateMedia(newFile, 'gallery');
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Update media object (preserve ID and usage)
    const updatedMedia: Media = {
      ...existingMedia,
      filename: newFile.name,
      originalName: newFile.name,
      mime: newFile.type,
      bytes: newFile.size,
    };

    // Update dimensions for images
    if (newFile.type.startsWith('image/')) {
      const dimensions = await this.getImageDimensions(newFile);
      updatedMedia.width = dimensions.width;
      updatedMedia.height = dimensions.height;
    }

    // Save new file
    await fileStorageService.saveMedia(updatedMedia, newFile);

    return updatedMedia;
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const media = await fileStorageService.loadMedia(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    // Check if media is in use
    if (media.usedBy && media.usedBy.length > 0) {
      const usageList = media.usedBy.map(u => `${u.entityType} (${u.entityId})`).join(', ');
      throw new Error(`Cannot delete: Media is used by ${usageList}`);
    }

    await fileStorageService.deleteMedia(mediaId);
  }

  async updateMediaUsage(mediaId: string, entityType: string, entityId: string, field: string, action: 'add' | 'remove'): Promise<void> {
    const media = await fileStorageService.loadMedia(mediaId);
    if (!media) return;

    if (!media.usedBy) {
      media.usedBy = [];
    }

    const usageIndex = media.usedBy.findIndex(
      u => u.entityType === entityType && u.entityId === entityId && u.field === field
    );

    if (action === 'add' && usageIndex === -1) {
      media.usedBy.push({ entityType, entityId, field });
    } else if (action === 'remove' && usageIndex !== -1) {
      media.usedBy.splice(usageIndex, 1);
    }

    // Update in manifest
    const manifest = await fileStorageService.loadMediaManifest();
    manifest[mediaId] = media;
    const key = 'data/media-manifest.json';
    localStorage.setItem(key, JSON.stringify(manifest, null, 2));
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  private async computeFileHash(file: File): Promise<string> {
    // Simple hash implementation for demo
    // In production, use a proper hash function
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async getFileFromStorage(_mediaId: string): Promise<File> {
    // This would retrieve the file from storage
    // For demo purposes, we'll throw an error
    throw new Error('Not implemented');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate media using the validation dictionary (comprehensive validation)
   */
  async validateMediaWithDictionary(media: Partial<Media>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const validationService = ValidationDictionaryService.getInstance();
    const result = validationService.validateMedia(media);

    return {
      isValid: result.isValid,
      errors: validationService.formatErrors(result.errors),
      warnings: [] // Could add additional warnings here
    };
  }

  async getAllMedia(): Promise<Media[]> {
    try {
      const manifest = await fileStorageService.loadMediaManifest();
      return Object.values(manifest).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to load media:', error);
      return [];
    }
  }

  /**
   * Check if media can be safely deleted (not referenced by any entities)
   */
  async checkMediaUsage(mediaId: string): Promise<{
    canDelete: boolean;
    references: {
      entityType: string;
      entityId: string;
      entityName: string;
    }[];
  }> {
    // This would need to check all entity stores for references
    // Implementation depends on database service
    return {
      canDelete: true,
      references: []
    };
  }
}

export const mediaService = new MediaService();