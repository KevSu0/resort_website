import { promises as fs } from 'fs';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { StorageConfig, StorageProvider, UploadResult } from '@/types/media.js';
import { logger } from '@/utils/logger.js';

/**
 * Local storage provider for media files
 * Stores files in the local filesystem with organized directory structure
 */
export class LocalStorageProvider implements StorageProvider {
  private config: StorageConfig & { localPath: string; baseUrl: string };
  private basePath: string;

  constructor(config: StorageConfig) {
    if (!config.localPath) {
      throw new Error('Local storage requires localPath configuration');
    }

    this.config = {
      ...config,
      localPath: path.resolve(config.localPath),
      baseUrl: config.baseUrl || '/uploads'
    };

    this.basePath = this.config.localPath;

    // Ensure upload directory exists
    this.ensureDirectoryExists(this.basePath);
  }

  /**
   * Upload a file to local storage
   */
  async upload(
    file: Buffer | NodeJS.ReadableStream,
    key: string,
    contentType: string,
    metadata?: Record<string, any>
  ): Promise<UploadResult> {
    try {
      const filePath = path.join(this.basePath, key);
      const directory = path.dirname(filePath);

      // Ensure directory exists
      await this.ensureDirectoryExists(directory);

      // Calculate file size
      let size = 0;
      const checksum = this.generateChecksum(key);

      if (Buffer.isBuffer(file)) {
        size = file.length;
        await fs.writeFile(filePath, file);
      } else {
        const writeStream = createWriteStream(filePath);
        await pipeline(file, writeStream);

        // Get file size
        const stats = await fs.stat(filePath);
        size = stats.size;
      }

      const url = this.buildUrl(key);

      logger.info('File uploaded to local storage', {
        key,
        filePath,
        size,
        contentType,
        url
      });

      return {
        key,
        url,
        size,
        contentType,
        etag: checksum,
        metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          filePath
        }
      };

    } catch (error) {
      logger.error('Failed to upload file to local storage', { key, error });
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download a file from local storage
   */
  async download(key: string): Promise<NodeJS.ReadableStream> {
    try {
      const filePath = path.join(this.basePath, key);

      // Check if file exists
      await fs.access(filePath);

      return createReadStream(filePath);

    } catch (error) {
      logger.error('Failed to download file from local storage', { key, error });
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'File not found'}`);
    }
  }

  /**
   * Delete a file from local storage
   */
  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(this.basePath, key);

      await fs.unlink(filePath);

      logger.info('File deleted from local storage', { key, filePath });

    } catch (error) {
      logger.error('Failed to delete file from local storage', { key, error });
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'File not found'}`);
    }
  }

  /**
   * Check if a file exists in local storage
   */
  async exists(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.basePath, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get metadata for a file
   */
  async getMetadata(key: string): Promise<Record<string, any>> {
    try {
      const filePath = path.join(this.basePath, key);
      const stats = await fs.stat(filePath);

      return {
        key,
        size: stats.size,
        lastModified: stats.mtime,
        created: stats.birthtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        url: this.buildUrl(key)
      };

    } catch (error) {
      logger.error('Failed to get metadata from local storage', { key, error });
      throw new Error(`Metadata retrieval failed: ${error instanceof Error ? error.message : 'File not found'}`);
    }
  }

  /**
   * List files in local storage
   */
  async list(prefix?: string, limit?: number): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
    try {
      const searchPath = prefix ? path.join(this.basePath, prefix) : this.basePath;
      const files: Array<{ key: string; size: number; lastModified: Date }> = [];

      const walk = async (dir: string, currentPrefix: string = ''): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = currentPrefix ? path.join(currentPrefix, entry.name) : entry.name;

          if (entry.isDirectory()) {
            await walk(fullPath, relativePath);
          } else if (entry.isFile()) {
            if (!prefix || relativePath.startsWith(prefix)) {
              const stats = await fs.stat(fullPath);
              files.push({
                key: relativePath.replace(/\\/g, '/'), // Normalize path separators
                size: stats.size,
                lastModified: stats.mtime
              });

              if (limit && files.length >= limit) {
                return;
              }
            }
          }
        }
      };

      await walk(searchPath);

      // Sort by last modified date
      files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

      // Apply limit
      if (limit) {
        files.splice(limit);
      }

      return files;

    } catch (error) {
      logger.error('Failed to list files from local storage', { prefix, error });
      throw new Error(`List failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a signed URL (not applicable to local storage, returns public URL)
   */
  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    return this.buildUrl(key);
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Build public URL for a file
   */
  private buildUrl(key: string): string {
    const normalizedKey = key.replace(/\\/g, '/');
    return `${this.config.baseUrl}/${normalizedKey}`;
  }

  /**
   * Generate a simple checksum (for etag)
   */
  private generateChecksum(key: string): string {
    // Simple hash function for demo purposes
    // In production, use crypto.createHash
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Storage provider factory
 */
export class StorageProviderFactory {
  /**
   * Create a storage provider instance based on configuration
   */
  static create(config: StorageConfig): StorageProvider {
    switch (config.provider) {
      case 'local':
        return new LocalStorageProvider(config);

      case 's3':
        // TODO: Implement S3 storage provider
        throw new Error('S3 storage provider not yet implemented');

      case 'gcs':
        // TODO: Implement Google Cloud Storage provider
        throw new Error('Google Cloud Storage provider not yet implemented');

      case 'azure':
        // TODO: Implement Azure Blob Storage provider
        throw new Error('Azure Blob Storage provider not yet implemented');

      default:
        throw new Error(`Unsupported storage provider: ${config.provider}`);
    }
  }
}