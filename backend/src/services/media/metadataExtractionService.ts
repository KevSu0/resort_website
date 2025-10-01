import { fileTypeFromBuffer } from 'file-type';
import { createHash } from 'crypto';
import { fileTypeFromTokenizer } from 'file-type/core';
import { readFileSync } from 'fs';
import pdf from 'pdf-parse';
import { ImageProcessingService } from './imageProcessingService.js';
import { FileMetadata } from '@/types/media.js';
import { logger } from '@/utils/logger.js';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
  codec: string;
  format: string;
  aspectRatio: string;
}

export interface AudioMetadata {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  codec: string;
  format: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
}

export interface DocumentMetadata {
  pageCount?: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  keywords?: string[];
  isEncrypted: boolean;
  isSigned: boolean;
}

export interface ArchiveMetadata {
  totalFiles: number;
  totalSize: number;
  compressionRatio: number;
  fileList: Array<{
    name: string;
    size: number;
    compressedSize: number;
    isDirectory: boolean;
    modified: Date;
  }>;
  isEncrypted: boolean;
  format: string;
}

/**
 * Comprehensive metadata extraction service for various file types
 */
export class MetadataExtractionService {
  /**
   * Extract comprehensive metadata from file buffer
   */
  static async extractMetadata(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<Partial<FileMetadata>> {
    const metadata: Partial<FileMetadata> = {
      originalName: filename,
      mimeType,
      size: buffer.length,
      checksum: this.calculateChecksum(buffer),
      uploadedAt: new Date()
    };

    try {
      // Extract file type information
      const fileType = await fileTypeFromBuffer(buffer);
      if (fileType) {
        metadata.mimeType = fileType.mime;
      }

      // Extract metadata based on MIME type
      if (mimeType.startsWith('image/')) {
        await this.extractImageMetadata(buffer, metadata);
      } else if (mimeType.startsWith('video/')) {
        await this.extractVideoMetadata(buffer, metadata);
      } else if (mimeType.startsWith('audio/')) {
        await this.extractAudioMetadata(buffer, metadata);
      } else if (mimeType === 'application/pdf') {
        await this.extractPdfMetadata(buffer, metadata);
      } else if (this.isArchiveType(mimeType)) {
        await this.extractArchiveMetadata(buffer, metadata);
      } else if (this.isDocumentType(mimeType)) {
        await this.extractDocumentMetadata(buffer, metadata);
      }

      // Extract general metadata
      await this.extractGeneralMetadata(buffer, metadata);

      logger.info('Metadata extraction completed', {
        filename,
        mimeType,
        extractedKeys: Object.keys(metadata)
      });

    } catch (error) {
      logger.error('Metadata extraction failed', { filename, error });
    }

    return metadata;
  }

  /**
   * Extract image metadata
   */
  private static async extractImageMetadata(
    buffer: Buffer,
    metadata: Partial<FileMetadata>
  ): Promise<void> {
    try {
      // Get basic image info
      const imageInfo = await ImageProcessingService.getImageInfo(buffer);
      metadata.width = imageInfo.width;
      metadata.height = imageInfo.height;

      // Extract detailed image metadata
      const detailedMetadata = await ImageProcessingService.extractImageMetadata(buffer);

      // Add EXIF data to metadata
      if (detailedMetadata.exif) {
        metadata.exif = detailedMetadata.exif;
      }

      // Add GPS data
      if (detailedMetadata.gps) {
        metadata.metadata = {
          ...metadata.metadata,
          gps: detailedMetadata.gps
        };
      }

      // Add camera information
      if (detailedMetadata.camera) {
        metadata.metadata = {
          ...metadata.metadata,
          camera: detailedMetadata.camera
        };
      }

      // Add technical details
      if (detailedMetadata.technical) {
        metadata.metadata = {
          ...metadata.metadata,
          technical: detailedMetadata.technical
        };
      }

      // Calculate image hash for duplicate detection
      const imageHash = await ImageProcessingService.calculateImageHash(buffer);
      metadata.metadata = {
        ...metadata.metadata,
        imageHash
      };

    } catch (error) {
      logger.warn('Failed to extract image metadata', { error });
    }
  }

  /**
   * Extract video metadata
   */
  private static async extractVideoMetadata(
    buffer: Buffer,
    metadata: Partial<FileMetadata>
  ): Promise<void> {
    try {
      // TODO: Implement video metadata extraction using ffprobe or similar
      // For now, add placeholder data

      metadata.metadata = {
        ...metadata.metadata,
        videoInfo: {
          note: 'Video metadata extraction not yet implemented',
          recommendedLibrary: 'ffprobe or node-ffmpeg'
        }
      };

      logger.warn('Video metadata extraction not yet implemented');

    } catch (error) {
      logger.warn('Failed to extract video metadata', { error });
    }
  }

  /**
   * Extract audio metadata
   */
  private static async extractAudioMetadata(
    buffer: Buffer,
    metadata: Partial<FileMetadata>
  ): Promise<void> {
    try {
      // TODO: Implement audio metadata extraction using music-metadata or similar
      // For now, add placeholder data

      metadata.metadata = {
        ...metadata.metadata,
        audioInfo: {
          note: 'Audio metadata extraction not yet implemented',
          recommendedLibrary: 'music-metadata'
        }
      };

      logger.warn('Audio metadata extraction not yet implemented');

    } catch (error) {
      logger.warn('Failed to extract audio metadata', { error });
    }
  }

  /**
   * Extract PDF metadata
   */
  private static async extractPdfMetadata(
    buffer: Buffer,
    metadata: Partial<FileMetadata>
  ): Promise<void> {
    try {
      const pdfData = await pdf(buffer);

      metadata.metadata = {
        ...metadata.metadata,
        pdf: {
          pageCount: pdfData.numpages,
          title: pdfData.info?.Title,
          author: pdfData.info?.Author,
          subject: pdfData.info?.Subject,
          creator: pdfData.info?.Creator,
          producer: pdfData.info?.Producer,
          creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined,
          modificationDate: pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : undefined,
          keywords: pdfData.info?.Keywords ? pdfData.info.Keywords.split(',').map(k => k.trim()) : [],
          isEncrypted: !!pdfData.info?.Encrypted,
          isSigned: false // TODO: Implement signature detection
        }
      };

      // Extract text content for search indexing
      if (pdfData.text) {
        metadata.metadata = {
          ...metadata.metadata,
          searchableText: pdfData.text.substring(0, 1000) // First 1000 characters for search
        };
      }

    } catch (error) {
      logger.warn('Failed to extract PDF metadata', { error });
    }
  }

  /**
   * Extract archive metadata
   */
  private static async extractArchiveMetadata(
    buffer: Buffer,
    metadata: Partial<FileMetadata>
  ): Promise<void> {
    try {
      // TODO: Implement archive metadata extraction using yauzl or similar
      // For now, add placeholder data

      metadata.metadata = {
        ...metadata.metadata,
        archive: {
          note: 'Archive metadata extraction not yet implemented',
          recommendedLibrary: 'yauzl or node-stream-zip'
        }
      };

      logger.warn('Archive metadata extraction not yet implemented');

    } catch (error) {
      logger.warn('Failed to extract archive metadata', { error });
    }
  }

  /**
   * Extract document metadata
   */
  private static async extractDocumentMetadata(
    buffer: Buffer,
    metadata: Partial<FileMetadata>
  ): Promise<void> {
    try {
      // TODO: Implement document metadata extraction for Office documents
      // For now, add placeholder data

      metadata.metadata = {
        ...metadata.metadata,
        document: {
          note: 'Document metadata extraction not yet implemented',
          recommendedLibrary: 'mammoth.js for Word, xlsx for Excel, etc.'
        }
      };

      logger.warn('Document metadata extraction not yet implemented');

    } catch (error) {
      logger.warn('Failed to extract document metadata', { error });
    }
  }

  /**
   * Extract general metadata applicable to all file types
   */
  private static async extractGeneralMetadata(
    buffer: Buffer,
    metadata: Partial<FileMetadata>
  ): Promise<void> {
    try {
      // File hash for integrity verification
      const md5Hash = createHash('md5').update(buffer).digest('hex');
      const sha256Hash = createHash('sha256').update(buffer).digest('hex');

      metadata.metadata = {
        ...metadata.metadata,
        hashes: {
          md5: md5Hash,
          sha256: sha256Hash
        },
        sizeHuman: this.formatFileSize(buffer.length),
        extension: metadata.originalName?.split('.').pop()?.toLowerCase(),
        encoding: this.detectEncoding(buffer)
      };

      // Detect file category
      metadata.metadata = {
        ...metadata.metadata,
        category: this.detectFileCategory(metadata.mimeType || '')
      };

    } catch (error) {
      logger.warn('Failed to extract general metadata', { error });
    }
  }

  /**
   * Calculate file checksum
   */
  private static calculateChecksum(buffer: Buffer): string {
    return createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Format file size in human readable format
   */
  private static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Detect file encoding
   */
  private static detectEncoding(buffer: Buffer): string {
    // Simple encoding detection
    const sample = buffer.slice(0, 1000);
    const str = sample.toString();

    // Check for UTF-8 BOM
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      return 'utf-8-bom';
    }

    // Check for UTF-16 BOM
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
      return 'utf-16le';
    }
    if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
      return 'utf-16be';
    }

    // Check if valid UTF-8
    try {
      decodeURIComponent(escape(str));
      return 'utf-8';
    } catch {
      return 'binary';
    }
  }

  /**
   * Detect file category based on MIME type
   */
  private static detectFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive';
    return 'other';
  }

  /**
   * Check if file is an archive type
   */
  private static isArchiveType(mimeType: string): boolean {
    return [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-gzip'
    ].includes(mimeType);
  }

  /**
   * Check if file is a document type
   */
  private static isDocumentType(mimeType: string): boolean {
    return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf'
    ].includes(mimeType);
  }

  /**
   * Extract text content for search indexing
   */
  static async extractSearchableText(
    buffer: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        const pdfData = await pdf(buffer);
        return pdfData.text || '';
      }

      if (mimeType.startsWith('text/')) {
        return buffer.toString('utf-8');
      }

      // TODO: Implement text extraction for other document types
      return '';

    } catch (error) {
      logger.warn('Failed to extract searchable text', { mimeType, error });
      return '';
    }
  }

  /**
   * Generate file preview data
   */
  static async generatePreviewData(
    buffer: Buffer,
    mimeType: string
  ): Promise<{
    hasPreview: boolean;
    previewType?: string;
    previewData?: any;
  }> {
    try {
      if (mimeType.startsWith('image/')) {
        // Generate image preview
        const preview = await ImageProcessingService.resizeImage(buffer, {
          width: 800,
          height: 600,
          quality: 70,
          format: 'jpeg',
          fit: 'inside'
        });

        return {
          hasPreview: true,
          previewType: 'image/jpeg',
          previewData: preview.buffer.toString('base64')
        };
      }

      if (mimeType === 'application/pdf') {
        // TODO: Generate PDF preview (first page as image)
        return {
          hasPreview: true,
          previewType: 'pdf',
          previewData: 'PDF preview not yet implemented'
        };
      }

      if (mimeType.startsWith('text/')) {
        // Generate text preview
        const text = buffer.toString('utf-8');
        const preview = text.substring(0, 500);

        return {
          hasPreview: true,
          previewType: 'text',
          previewData: preview
        };
      }

      return { hasPreview: false };

    } catch (error) {
      logger.warn('Failed to generate preview', { mimeType, error });
      return { hasPreview: false };
    }
  }
}