/**
 * Storage abstraction interface for media files
 * Supports multiple storage providers (local, S3, Google Cloud, Azure)
 */

export interface StorageConfig {
  provider: 'local' | 's3' | 'gcs' | 'azure';
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  localPath?: string;
  baseUrl?: string;
  [key: string]: any;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
  etag?: string;
  metadata?: Record<string, any>;
}

export interface StorageProvider {
  upload(file: Buffer | NodeJS.ReadableStream, key: string, contentType: string, metadata?: Record<string, any>): Promise<UploadResult>;
  download(key: string): Promise<NodeJS.ReadableStream>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<Record<string, any>>;
  list(prefix?: string, limit?: number): Promise<Array<{ key: string; size: number; lastModified: Date }>>;
  getSignedUrl?(key: string, expiresIn?: number): Promise<string>;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  exif?: any;
  checksum: string;
  uploadedAt: Date;
  uploadedBy: string;
  siteId: string;
  folder?: string;
  tags?: string[];
  alt?: string;
  caption?: string;
  description?: string;
}

export interface MediaTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;
  background?: string;
  progressive?: boolean;
  optimize?: boolean;
  watermark?: {
    text?: string;
    image?: string;
    position?: string;
    opacity?: number;
  };
}

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  storageUsed: number;
  storageQuota?: number;
  fileTypes: Record<string, number>;
  uploadsToday: number;
  uploadsThisMonth: number;
  lastUpload?: Date;
}

export interface MediaSearchOptions {
  query?: string;
  type?: string;
  mimeType?: string;
  folder?: string;
  tags?: string[];
  uploadedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sizeMin?: number;
  sizeMax?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'filename' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface MediaLibraryItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  url: string;
  thumbnails?: Record<string, string>;
  folder?: string;
  tags: string[];
  alt?: string;
  caption?: string;
  description?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UploadProgress {
  id: string;
  filename: string;
  size: number;
  uploaded: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}