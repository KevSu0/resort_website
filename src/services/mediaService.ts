import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../config/firebase';
import { imageOptimizer } from '../utils/imageOptimization';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  metadata?: {
    width?: number;
    height?: number;
    optimized?: boolean;
    cdnUrl?: string;
  };
}

export interface UploadOptions {
  optimize?: boolean;
  generateThumbnails?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
}

class MediaService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm'
  ];

  async uploadFile(
    file: File,
    path: string,
    options: UploadOptions = {}
  ): Promise<MediaFile> {
    const {
      optimize = true,
      generateThumbnails = true,
      maxSize = this.MAX_FILE_SIZE,
      allowedTypes = this.ALLOWED_TYPES
    } = options;

    // Validation
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomId}.${extension}`;
      const fullPath = `${path}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, fullPath);

      // Optimize image if applicable
      let optimizedFile = file;
      let metadata: any = {};

      if (optimize && file.type.startsWith('image/')) {
        const optimized = await imageOptimizer.optimize(file);
        optimizedFile = optimized.file;
        metadata = optimized.metadata;
      }

      // Upload file
      const snapshot = await uploadBytes(storageRef, optimizedFile, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      });

      // Get download URL
      const url = await getDownloadURL(snapshot.ref);

      // Generate CDN URL (placeholder for actual CDN implementation)
      const cdnUrl = this.generateCdnUrl(fullPath);

      // Generate thumbnails if needed
      if (generateThumbnails && file.type.startsWith('image/')) {
        await this.generateThumbnails(fullPath, optimizedFile);
      }

      const mediaFile: MediaFile = {
        id: snapshot.ref.name,
        name: file.name,
        url,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        metadata: {
          ...metadata,
          optimized: optimize,
          cdnUrl
        }
      };

      return mediaFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      // Also delete thumbnails
      await this.deleteThumbnails(path);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listFiles(path: string): Promise<MediaFile[]> {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);

      const mediaFiles: MediaFile[] = [];

      for (const itemRef of result.items) {
        const url = await getDownloadURL(itemRef);
        const metadata = await this.getFileMetadata(itemRef.fullPath);

        mediaFiles.push({
          id: itemRef.name,
          name: metadata.originalName || itemRef.name,
          url,
          type: metadata.contentType || 'application/octet-stream',
          size: parseInt(metadata.size || '0'),
          uploadedAt: new Date(metadata.uploadedAt || Date.now()),
          metadata: {
            width: metadata.width ? parseInt(metadata.width) : undefined,
            height: metadata.height ? parseInt(metadata.height) : undefined,
            optimized: metadata.optimized === 'true',
            cdnUrl: this.generateCdnUrl(itemRef.fullPath)
          }
        });
      }

      return mediaFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFileUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw new Error(`Failed to get file URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateThumbnails(originalPath: string, file: File): Promise<void> {
    // Implementation for generating thumbnails
    // This would typically use a server-side function or Cloud Function
    // For now, we'll create a placeholder implementation
    try {
      const thumbnailPath = originalPath.replace(/(\.[^.]+)$/, '_thumb$1');
      // In a real implementation, you would:
      // 1. Send the file to an image processing service
      // 2. Generate thumbnail(s) at different sizes
      // 3. Upload the thumbnails to Firebase Storage
      console.log('Generating thumbnails for:', originalPath);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    }
  }

  private async deleteThumbnails(originalPath: string): Promise<void> {
    try {
      const thumbnailPath = originalPath.replace(/(\.[^.]+)$/, '_thumb$1');
      const storageRef = ref(storage, thumbnailPath);
      await deleteObject(storageRef);
    } catch (error) {
      // Thumbnail might not exist, which is okay
      console.log('Thumbnail not found or already deleted:', originalPath);
    }
  }

  private async getFileMetadata(path: string): Promise<any> {
    // In a real implementation, you would fetch metadata from Firebase Storage
    // For now, return basic metadata
    return {
      originalName: path.split('/').pop(),
      uploadedAt: new Date().toISOString(),
      contentType: 'image/jpeg',
      size: '0'
    };
  }

  private generateCdnUrl(path: string): string {
    // Placeholder for CDN URL generation
    // In a real implementation, this would generate a CDN URL
    const cdnBaseUrl = process.env.REACT_APP_CDN_BASE_URL || 'https://cdn.example.com';
    return `${cdnBaseUrl}/${path}`;
  }

  // Advanced media operations

  async optimizeExistingFile(path: string): Promise<MediaFile> {
    try {
      const url = await this.getFileUrl(path);
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], path.split('/').pop() || 'file', {
        type: blob.type
      });

      const optimized = await imageOptimizer.optimize(file);
      const newPath = path.replace(/(\.[^.]+)$/, '_optimized$1');

      return await this.uploadFile(optimized.file, newPath, {
        optimize: false, // Already optimized
        generateThumbnails: true
      });
    } catch (error) {
      console.error('Error optimizing existing file:', error);
      throw error;
    }
  }

  async duplicateFile(sourcePath: string, targetPath: string): Promise<MediaFile> {
    try {
      const url = await this.getFileUrl(sourcePath);
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], sourcePath.split('/').pop() || 'file', {
        type: blob.type
      });

      return await this.uploadFile(file, targetPath);
    } catch (error) {
      console.error('Error duplicating file:', error);
      throw error;
    }
  }

  async getMediaStats(path: string): Promise<{
    totalFiles: number;
    totalSize: number;
    fileTypeBreakdown: Record<string, number>;
    latestUpload: Date | null;
  }> {
    try {
      const files = await this.listFiles(path);

      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        fileTypeBreakdown: files.reduce((acc, file) => {
          const type = file.type.split('/')[0] || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        latestUpload: files.length > 0 ? files[0].uploadedAt : null
      };

      return stats;
    } catch (error) {
      console.error('Error getting media stats:', error);
      throw error;
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;