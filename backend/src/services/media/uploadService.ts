import { promises as fs } from 'fs';
import path from 'path';
import { sanitize } from 'sanitize-filename';
import { createHash } from 'crypto';
import { FileValidationService, ValidationResult } from './fileValidationService.js';
import { ImageProcessingService } from './imageProcessingService.js';
import { MetadataExtractionService } from './metadataExtractionService.js';
import { StorageProviderFactory } from '../storage/StorageProvider.js';
import {
  StorageConfig,
  UploadResult,
  FileMetadata,
  UploadProgress,
  MediaTransformOptions,
  ThumbnailOptions
} from '@/types/media.js';
import { logger } from '@/utils/logger.js';

export interface UploadOptions {
  siteId: string;
  uploadedBy: string;
  folder?: string;
  tags?: string[];
  alt?: string;
  caption?: string;
  description?: string;
  generateThumbnails?: boolean;
  transformOptions?: MediaTransformOptions;
  thumbnailOptions?: ThumbnailOptions[];
  validationOptions?: {
    maxFileSize?: number;
    allowedMimeTypes?: string[];
    requireMagicNumberValidation?: boolean;
  };
  overwrite?: boolean;
  preserveOriginal?: boolean;
}

export interface BulkUploadItem {
  id: string;
  file: Buffer;
  filename: string;
  options: UploadOptions;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: UploadResult;
  error?: string;
  progress: number;
}

export interface UploadStats {
  total: number;
  completed: number;
  failed: number;
  totalSize: number;
  processedSize: number;
  startTime: Date;
  endTime?: Date;
  averageSpeed?: number; // bytes per second
}

/**
 * Comprehensive file upload service with validation, processing, and storage
 */
export class UploadService {
  private storageConfig: StorageConfig;
  private uploadProgress: Map<string, UploadProgress> = new Map();
  private bulkUploads: Map<string, BulkUploadItem[]> = new Map();

  constructor(storageConfig: StorageConfig) {
    this.storageConfig = storageConfig;
  }

  /**
   * Upload a single file with comprehensive processing
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const uploadId = this.generateUploadId();
    const startTime = Date.now();

    try {
      // Initialize progress tracking
      this.updateProgress(uploadId, {
        id: uploadId,
        filename,
        size: file.length,
        uploaded: 0,
        percentage: 0,
        status: 'pending',
        startedAt: new Date()
      });

      // 1. Validate file
      this.updateProgress(uploadId, { status: 'uploading', percentage: 10 });
      const validationResult = await this.validateFile(file, filename, options);

      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      // 2. Extract metadata
      this.updateProgress(uploadId, { percentage: 20 });
      const metadata = await this.extractMetadata(file, filename, options);

      // 3. Process file (resize, optimize, etc.)
      let processedFile = file;
      let processedMetadata = { ...metadata };

      if (this.shouldProcessImage(metadata.mimeType)) {
        this.updateProgress(uploadId, { status: 'processing', percentage: 30 });

        if (options.transformOptions) {
          const transformResult = await ImageProcessingService.resizeImage(file, options.transformOptions);
          processedFile = transformResult.buffer;
          processedMetadata = {
            ...processedMetadata,
            ...transformResult.info,
            size: transformResult.size,
            metadata: {
              ...processedMetadata.metadata,
              ...transformResult.metadata
            }
          };
        }

        // Generate thumbnails if requested
        if (options.generateThumbnails) {
          this.updateProgress(uploadId, { percentage: 50 });
          const thumbnails = await ImageProcessingService.generateThumbnails(
            processedFile,
            options.thumbnailOptions
          );

          processedMetadata.metadata = {
            ...processedMetadata.metadata,
            thumbnails: thumbnails
          };
        }
      }

      // 4. Store file
      this.updateProgress(uploadId, { percentage: 70 });
      const storageKey = this.generateStorageKey(processedFile, filename, options);
      const storageProvider = StorageProviderFactory.create(this.storageConfig);

      const storageResult = await storageProvider.upload(
        processedFile,
        storageKey,
        processedMetadata.mimeType || 'application/octet-stream',
        processedMetadata
      );

      // 5. Update final metadata
      const finalMetadata = {
        ...processedMetadata,
        ...options,
        url: storageResult.url,
        storageKey,
        uploadId,
        processingTime: Date.now() - startTime,
        validationWarnings: validationResult.warnings,
        securityIssues: validationResult.securityIssues
      };

      // 6. Complete upload
      this.updateProgress(uploadId, {
        status: 'completed',
        percentage: 100,
        completedAt: new Date()
      });

      const result: UploadResult = {
        ...storageResult,
        metadata: finalMetadata,
        uploadId,
        processingTime: Date.now() - startTime,
        validationResult
      };

      logger.info('File upload completed successfully', {
        uploadId,
        filename,
        size: processedFile.length,
        url: storageResult.url,
        processingTime: result.processingTime
      });

      return result;

    } catch (error) {
      this.updateProgress(uploadId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });

      logger.error('File upload failed', {
        uploadId,
        filename,
        error: error instanceof Error ? error.message : error
      });

      throw error;
    }
  }

  /**
   * Upload multiple files (bulk upload)
   */
  async uploadFiles(files: Array<{
    file: Buffer;
    filename: string;
    options: UploadOptions;
  }>, options: {
    concurrent?: number;
    onProgress?: (stats: UploadStats) => void;
  } = {}): Promise<UploadResult[]> {
    const bulkUploadId = this.generateBulkUploadId();
    const concurrent = options.concurrent || 3;
    const results: UploadResult[] = [];
    const stats: UploadStats = {
      total: files.length,
      completed: 0,
      failed: 0,
      totalSize: files.reduce((sum, f) => sum + f.file.length, 0),
      processedSize: 0,
      startTime: new Date()
    };

    // Initialize bulk upload tracking
    const bulkItems: BulkUploadItem[] = files.map((item, index) => ({
      id: `${bulkUploadId}-${index}`,
      file: item.file,
      filename: item.filename,
      options: item.options,
      status: 'pending',
      progress: 0
    }));

    this.bulkUploads.set(bulkUploadId, bulkItems);

    // Process files concurrently
    const chunks = this.chunkArray(bulkItems, concurrent);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (item) => {
        try {
          item.status = 'processing';
          item.progress = 0;

          const result = await this.uploadFile(item.file, item.filename, item.options);

          item.status = 'completed';
          item.progress = 100;
          item.result = result;

          stats.completed++;
          stats.processedSize += item.file.length;

          return result;

        } catch (error) {
          item.status = 'error';
          item.error = error instanceof Error ? error.message : 'Unknown error';

          stats.failed++;
          stats.processedSize += item.file.length;

          throw error;
        }
      });

      try {
        const chunkResults = await Promise.allSettled(chunkPromises);

        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            logger.error('Bulk upload item failed', {
              bulkUploadId,
              filename: chunk[index].filename,
              error: result.reason
            });
          }
        });

      } catch (error) {
        logger.error('Bulk upload chunk failed', { bulkUploadId, error });
      }

      // Update progress callback
      if (options.onProgress) {
        stats.endTime = new Date();
        stats.averageSpeed = stats.processedSize / ((stats.endTime.getTime() - stats.startTime.getTime()) / 1000);
        options.onProgress(stats);
      }
    }

    // Clean up bulk upload tracking
    this.bulkUploads.delete(bulkUploadId);

    logger.info('Bulk upload completed', {
      bulkUploadId,
      total: stats.total,
      completed: stats.completed,
      failed: stats.failed,
      totalTime: stats.endTime?.getTime() ? stats.endTime.getTime() - stats.startTime.getTime() : 0
    });

    return results;
  }

  /**
   * Get upload progress
   */
  getUploadProgress(uploadId: string): UploadProgress | undefined {
    return this.uploadProgress.get(uploadId);
  }

  /**
   * Get bulk upload status
   */
  getBulkUploadStatus(bulkUploadId: string): BulkUploadItem[] | undefined {
    return this.bulkUploads.get(bulkUploadId);
  }

  /**
   * Validate file before upload
   */
  private async validateFile(
    file: Buffer,
    filename: string,
    options: UploadOptions
  ): Promise<ValidationResult> {
    const validationOptions = {
      maxFileSize: options.validationOptions?.maxFileSize,
      allowedMimeTypes: options.validationOptions?.allowedMimeTypes,
      requireMagicNumberValidation: options.validationOptions?.requireMagicNumberValidation ?? true
    };

    return FileValidationService.validateFile(file, filename, validationOptions);
  }

  /**
   * Extract metadata from file
   */
  private async extractMetadata(
    file: Buffer,
    filename: string,
    options: UploadOptions
  ): Promise<FileMetadata> {
    // Basic file type detection
    const basicMetadata: Partial<FileMetadata> = {
      originalName: filename,
      size: file.length,
      siteId: options.siteId,
      uploadedBy: options.uploadedBy,
      folder: options.folder,
      tags: options.tags || [],
      alt: options.alt,
      caption: options.caption,
      description: options.description
    };

    // Extract detailed metadata
    const detailedMetadata = await MetadataExtractionService.extractMetadata(
      file,
      filename,
      'application/octet-stream' // Will be updated by extraction service
    );

    return {
      ...basicMetadata,
      ...detailedMetadata
    } as FileMetadata;
  }

  /**
   * Check if file should be processed (image resize, etc.)
   */
  private shouldProcessImage(mimeType?: string): boolean {
    return !!(mimeType && mimeType.startsWith('image/'));
  }

  /**
   * Generate storage key for file
   */
  private generateStorageKey(
    file: Buffer,
    filename: string,
    options: UploadOptions
  ): string {
    const sanitizedFilename = sanitize(filename);
    const hash = createHash('md5').update(file).digest('hex').substring(0, 8);
    const timestamp = Date.now();
    const extension = path.extname(sanitizedFilename);
    const name = path.basename(sanitizedFilename, extension);

    // Organize files by site and date
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const folderPath = options.folder
      ? `${options.siteId}/${year}/${month}/${day}/${options.folder}`
      : `${options.siteId}/${year}/${month}/${day}`;

    return `${folderPath}/${name}_${hash}_${timestamp}${extension}`;
  }

  /**
   * Update upload progress
   */
  private updateProgress(uploadId: string, updates: Partial<UploadProgress>): void {
    const current = this.uploadProgress.get(uploadId) || {
      id: uploadId,
      filename: '',
      size: 0,
      uploaded: 0,
      percentage: 0,
      status: 'pending',
      startedAt: new Date()
    };

    this.uploadProgress.set(uploadId, { ...current, ...updates });
  }

  /**
   * Generate unique upload ID
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique bulk upload ID
   */
  private generateBulkUploadId(): string {
    return `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Clean up old upload progress records
   */
  cleanupOldRecords(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAge;

    for (const [uploadId, progress] of this.uploadProgress.entries()) {
      if (progress.startedAt.getTime() < cutoffTime) {
        this.uploadProgress.delete(uploadId);
      }
    }

    for (const [bulkUploadId, items] of this.bulkUploads.entries()) {
      const isOld = items.every(item =>
        item.status === 'completed' || item.status === 'error'
      );

      if (isOld) {
        this.bulkUploads.delete(bulkUploadId);
      }
    }

    logger.info('Upload records cleanup completed', {
      activeUploads: this.uploadProgress.size,
      activeBulkUploads: this.bulkUploads.size
    });
  }

  /**
   * Get upload statistics
   */
  getUploadStats(): {
    activeUploads: number;
    activeBulkUploads: number;
    totalFilesUploaded: number;
    totalStorageUsed: number;
  } {
    const activeUploads = this.uploadProgress.size;
    const activeBulkUploads = this.bulkUploads.size;

    // TODO: Implement tracking of total uploads and storage usage
    // This would require database integration

    return {
      activeUploads,
      activeBulkUploads,
      totalFilesUploaded: 0, // Placeholder
      totalStorageUsed: 0 // Placeholder
    };
  }
}