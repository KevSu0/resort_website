import sharp from 'sharp';
import { createHash } from 'crypto';
import { MediaTransformOptions, ThumbnailOptions } from '@/types/media.js';
import { logger } from '@/utils/logger.js';

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  orientation?: number;
  density?: number;
  channels: number;
  colorSpace: string;
}

export interface ProcessedImageResult {
  buffer: Buffer;
  info: ImageInfo;
  format: string;
  size: number;
  metadata: Record<string, any>;
}

export interface ImageMetadata {
  exif?: any;
  iptc?: any;
  xmp?: any;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  camera?: {
    make?: string;
    model?: string;
    software?: string;
    dateTime?: Date;
  };
  technical?: {
    iso?: number;
    aperture?: string;
    exposureTime?: string;
    focalLength?: string;
    flash?: boolean;
  };
}

/**
 * Image processing service using Sharp for high-performance image manipulation
 */
export class ImageProcessingService {
  private static readonly SUPPORTED_FORMATS = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif'];
  private static readonly DEFAULT_QUALITY = 80;
  private static readonly MAX_DIMENSION = 8192;
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  /**
   * Get comprehensive image information
   */
  static async getImageInfo(buffer: Buffer): Promise<ImageInfo> {
    try {
      const metadata = await sharp(buffer).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
        hasAlpha: metadata.hasAlpha || false,
        orientation: metadata.orientation,
        density: metadata.density,
        channels: metadata.channels || 0,
        colorSpace: metadata.space || 'unknown'
      };
    } catch (error) {
      logger.error('Failed to get image info', { error });
      throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract comprehensive metadata from image
   */
  static async extractImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      const result: ImageMetadata = {};

      // Extract EXIF data
      if (metadata.exif) {
        try {
          const exifData = await image.exif();
          result.exif = exifData;

          // Extract camera information
          if (exifData) {
            result.camera = {
              make: exifData.ImageMake,
              model: exifData.ImageModel,
              software: exifData.ImageSoftware,
              dateTime: exifData.DateTime ? new Date(exifData.DateTime) : undefined
            };

            // Extract technical details
            result.technical = {
              iso: exifData.ISOSpeedRatings,
              aperture: exifData.FNumber ? `f/${exifData.FNumber}` : undefined,
              exposureTime: exifData.ExposureTime ? `1/${Math.round(1 / parseFloat(exifData.ExposureTime))}s` : undefined,
              focalLength: exifData.FocalLength ? `${exifData.FocalLength}mm` : undefined,
              flash: exifData.Flash !== undefined
            };

            // Extract GPS coordinates
            if (exifData.GPSLatitude && exifData.GPSLongitude) {
              result.gps = {
                latitude: this.convertDMSToDD(exifData.GPSLatitude, exifData.GPSLatitudeRef),
                longitude: this.convertDMSToDD(exifData.GPSLongitude, exifData.GPSLongitudeRef),
                altitude: exifData.GPSAltitude
              };
            }
          }
        } catch (error) {
          logger.warn('Failed to extract EXIF data', { error });
        }
      }

      // Extract IPTC data
      if (metadata.iptc) {
        try {
          result.iptc = await image.iptc();
        } catch (error) {
          logger.warn('Failed to extract IPTC data', { error });
        }
      }

      // Extract XMP data
      try {
        result.xmp = await image.metadata({ resolveWithObject: true }).then(m => m.xmp);
      } catch (error) {
        logger.warn('Failed to extract XMP data', { error });
      }

      return result;

    } catch (error) {
      logger.error('Failed to extract image metadata', { error });
      return {};
    }
  }

  /**
   * Resize image with various options
   */
  static async resizeImage(
    buffer: Buffer,
    options: MediaTransformOptions
  ): Promise<ProcessedImageResult> {
    try {
      const {
        width,
        height,
        quality = this.DEFAULT_QUALITY,
        format = 'jpeg',
        fit = 'cover',
        position = 'center',
        background = { r: 255, g: 255, b: 255, alpha: 1 },
        progressive = true,
        optimize = true
      } = options;

      let processor = sharp(buffer);

      // Apply resizing
      if (width || height) {
        processor = processor.resize(width, height, {
          fit: sharp.fit[fit as keyof typeof sharp.fit] || sharp.fit.cover,
          position: this.parsePosition(position),
          background,
          withoutEnlargement: true,
          fastShrinkOnLoad: true
        });
      }

      // Apply format-specific options
      switch (format) {
        case 'jpeg':
          processor = processor.jpeg({
            quality,
            progressive,
            optimizeScans: optimize,
            mozjpeg: optimize
          });
          break;

        case 'png':
          processor = processor.png({
            quality,
            progressive,
            compressionLevel: optimize ? 9 : 6,
            adaptiveFiltering: optimize
          });
          break;

        case 'webp':
          processor = processor.webp({
            quality,
            effort: optimize ? 6 : 4,
            smartSubsample: optimize
          });
          break;

        case 'avif':
          processor = processor.avif({
            quality,
            effort: optimize ? 6 : 4
          });
          break;

        default:
          processor = processor.jpeg({ quality, progressive });
      }

      // Apply watermark if specified
      if (options.watermark) {
        processor = await this.applyWatermark(processor, options.watermark);
      }

      const resultBuffer = await processor.toBuffer();
      const info = await this.getImageInfo(resultBuffer);

      return {
        buffer: resultBuffer,
        info,
        format,
        size: resultBuffer.length,
        metadata: {
          originalSize: buffer.length,
          compressionRatio: Math.round((1 - resultBuffer.length / buffer.length) * 100),
          processingOptions: options,
          processedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Failed to resize image', { error, options });
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate thumbnails
   */
  static async generateThumbnails(
    buffer: Buffer,
    thumbnailOptions: ThumbnailOptions[] = [
      { width: 150, height: 150, quality: 70, format: 'jpeg' },
      { width: 300, height: 300, quality: 80, format: 'jpeg' },
      { width: 800, height: 600, quality: 85, format: 'jpeg' }
    ]
  ): Promise<Record<string, ProcessedImageResult>> {
    const thumbnails: Record<string, ProcessedImageResult> = {};

    try {
      for (const options of thumbnailOptions) {
        const sizeKey = `${options.width || 'auto'}x${options.height || 'auto'}`;

        thumbnails[sizeKey] = await this.resizeImage(buffer, {
          ...options,
          fit: 'cover',
          position: 'center',
          progressive: true,
          optimize: true
        });
      }

      return thumbnails;

    } catch (error) {
      logger.error('Failed to generate thumbnails', { error });
      throw new Error(`Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Optimize image without resizing
   */
  static async optimizeImage(
    buffer: Buffer,
    options: {
      format?: string;
      quality?: number;
      progressive?: boolean;
      optimize?: boolean;
    } = {}
  ): Promise<ProcessedImageResult> {
    const info = await this.getImageInfo(buffer);

    return this.resizeImage(buffer, {
      width: info.width,
      height: info.height,
      format: (options.format || info.format) as any,
      quality: options.quality || this.DEFAULT_QUALITY,
      progressive: options.progressive ?? true,
      optimize: options.optimize ?? true,
      fit: 'cover'
    });
  }

  /**
   * Convert image to different format
   */
  static async convertFormat(
    buffer: Buffer,
    targetFormat: string,
    quality: number = this.DEFAULT_QUALITY
  ): Promise<ProcessedImageResult> {
    return this.resizeImage(buffer, {
      format: targetFormat as any,
      quality,
      progressive: true,
      optimize: true
    });
  }

  /**
   * Auto-orient image based on EXIF orientation
   */
  static async autoOrient(buffer: Buffer): Promise<ProcessedImageResult> {
    try {
      const processor = sharp(buffer).rotate();

      const resultBuffer = await processor.toBuffer();
      const info = await this.getImageInfo(resultBuffer);

      return {
        buffer: resultBuffer,
        info,
        format: info.format,
        size: resultBuffer.length,
        metadata: {
          originalSize: buffer.length,
          autoOriented: true,
          processedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Failed to auto-orient image', { error });
      throw new Error(`Auto-orientation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply watermark to image
   */
  private static async applyWatermark(
    processor: sharp.Sharp,
    watermark: {
      text?: string;
      image?: string;
      position?: string;
      opacity?: number;
    }
  ): Promise<sharp.Sharp> {
    const { text, image, position = 'center', opacity = 0.5 } = watermark;

    try {
      if (text) {
        // Create text watermark
        const textSvg = `
          <svg width="200" height="50">
            <text x="50%" y="50%" text-anchor="middle" dy=".3em"
                  font-family="Arial, sans-serif" font-size="20" fill="white"
                  opacity="${opacity}">
              ${text}
            </text>
          </svg>
        `;

        const textBuffer = Buffer.from(textSvg);
        return processor.composite([{
          input: textBuffer,
          gravity: this.parsePosition(position),
          blend: 'over'
        }]);

      } else if (image) {
        // TODO: Load watermark image and apply
        // This would require loading the watermark image from storage
        logger.warn('Image watermarks not yet implemented');
        return processor;
      }

      return processor;

    } catch (error) {
      logger.error('Failed to apply watermark', { error });
      return processor;
    }
  }

  /**
   * Parse position string to sharp gravity
   */
  private static parsePosition(position: string): sharp.Gravity {
    const positionMap: Record<string, sharp.Gravity> = {
      'center': sharp.gravity.center,
      'top': sharp.gravity.top,
      'bottom': sharp.gravity.bottom,
      'left': sharp.gravity.left,
      'right': sharp.gravity.right,
      'top-left': sharp.gravity.northwest,
      'top-right': sharp.gravity.northeast,
      'bottom-left': sharp.gravity.southwest,
      'bottom-right': sharp.gravity.southeast
    };

    return positionMap[position] || sharp.gravity.center;
  }

  /**
   * Convert DMS (degrees, minutes, seconds) to decimal degrees
   */
  private static convertDMSToDD(dms: any, ref?: string): number {
    if (!dms || typeof dms !== 'object') return 0;

    let dd = dms;
    if (Array.isArray(dms)) {
      dd = dms[0] + (dms[1] / 60) + (dms[2] / 3600);
    }

    if (ref === 'S' || ref === 'W') {
      dd = dd * -1;
    }

    return dd;
  }

  /**
   * Validate image buffer
   */
  static async validateImage(buffer: Buffer): Promise<{
    isValid: boolean;
    error?: string;
    info?: ImageInfo;
  }> {
    try {
      if (buffer.length > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `Image size exceeds maximum allowed size of ${Math.round(this.MAX_FILE_SIZE / (1024 * 1024))}MB`
        };
      }

      const info = await this.getImageInfo(buffer);

      if (!this.SUPPORTED_FORMATS.includes(info.format)) {
        return {
          isValid: false,
          error: `Unsupported image format: ${info.format}`
        };
      }

      if (info.width > this.MAX_DIMENSION || info.height > this.MAX_DIMENSION) {
        return {
          isValid: false,
          error: `Image dimensions exceed maximum allowed size of ${this.MAX_DIMENSION}px`
        };
      }

      return { isValid: true, info };

    } catch (error) {
      return {
        isValid: false,
        error: `Invalid image file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Calculate image hash for duplicate detection
   */
  static async calculateImageHash(buffer: Buffer): Promise<string> {
    try {
      // Generate perceptual hash using sharp
      const { data } = await sharp(buffer)
        .resize(8, 8, { fit: 'fill' })
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Calculate average color
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }
      const average = sum / data.length;

      // Generate hash
      let hash = '';
      for (let i = 0; i < data.length; i++) {
        hash += data[i] > average ? '1' : '0';
      }

      return createHash('md5').update(hash).digest('hex');

    } catch (error) {
      logger.error('Failed to calculate image hash', { error });
      // Fallback to simple MD5 hash
      return createHash('md5').update(buffer).digest('hex');
    }
  }
}