import { fileTypeFromBuffer } from 'file-type';
import { magicBytes } from 'magic-bytes.js';
import { logger } from '@/utils/logger.js';

export interface FileValidationOptions {
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  blockedExtensions?: string[];
  requireMagicNumberValidation?: boolean;
  scanForMalware?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedType?: {
    mimeType: string;
    extension: string;
    description: string;
  };
  securityIssues: SecurityIssue[];
}

export interface SecurityIssue {
  type: 'malware' | 'suspicious_content' | 'invalid_magic_number' | 'oversized_file' | 'blocked_extension';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation?: string;
}

/**
 * File validation service for comprehensive file security checks
 */
export class FileValidationService {
  private static readonly DEFAULT_OPTIONS: FileValidationOptions = {
    maxFileSize: 50 * 1024 * 1024, // 50MB default
    allowedMimeTypes: [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/avif',

      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Video
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',

      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/aac',

      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ],
    blockedExtensions: [
      'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
      'app', 'deb', 'pkg', 'dmg', 'rpm', 'run', 'bin', 'sh', 'ps1'
    ],
    requireMagicNumberValidation: true,
    scanForMalware: false // Will be implemented with ClamAV or similar
  };

  /**
   * Validate a file buffer comprehensively
   */
  static async validateFile(
    buffer: Buffer,
    filename: string,
    options?: Partial<FileValidationOptions>
  ): Promise<ValidationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityIssues: []
    };

    try {
      // 1. Basic file size validation
      await this.validateFileSize(buffer, filename, opts, result);

      // 2. Extension validation
      this.validateExtension(filename, opts, result);

      // 3. Magic number validation
      if (opts.requireMagicNumberValidation) {
        await this.validateMagicNumbers(buffer, filename, opts, result);
      }

      // 4. MIME type validation
      await this.validateMimeType(buffer, filename, opts, result);

      // 5. Content validation for malicious patterns
      await this.validateContent(buffer, filename, opts, result);

      // 6. Malware scanning (if enabled)
      if (opts.scanForMalware) {
        await this.scanForMalware(buffer, filename, result);
      }

      // 7. File structure validation
      await this.validateFileStructure(buffer, filename, result);

      // Determine overall validity
      result.isValid = result.errors.length === 0 &&
                      !result.securityIssues.some(issue => issue.severity === 'critical' || issue.severity === 'high');

      logger.info('File validation completed', {
        filename,
        isValid: result.isValid,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length,
        securityIssuesCount: result.securityIssues.length,
        detectedType: result.detectedType?.mimeType
      });

      return result;

    } catch (error) {
      logger.error('File validation failed', { filename, error });

      return {
        isValid: false,
        errors: [`Validation process failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        securityIssues: [{
          type: 'malware',
          severity: 'critical',
          description: 'File validation process failed',
          recommendation: 'Please try uploading the file again or contact support'
        }]
      };
    }
  }

  /**
   * Validate file size
   */
  private static async validateFileSize(
    buffer: Buffer,
    filename: string,
    options: FileValidationOptions,
    result: ValidationResult
  ): Promise<void> {
    const fileSize = buffer.length;

    if (options.maxFileSize && fileSize > options.maxFileSize) {
      const maxSizeMB = Math.round(options.maxFileSize / (1024 * 1024));
      result.errors.push(`File size (${Math.round(fileSize / (1024 * 1024))}MB) exceeds maximum allowed size (${maxSizeMB}MB)`);

      result.securityIssues.push({
        type: 'oversized_file',
        severity: 'medium',
        description: `File ${filename} is larger than allowed limit`,
        recommendation: `Compress the file or upload a smaller version under ${maxSizeMB}MB`
      });
    }

    // Check for empty files
    if (fileSize === 0) {
      result.errors.push('File is empty');
    }

    // Check for suspiciously small files that might be malicious
    if (fileSize > 0 && fileSize < 100) {
      result.warnings.push('File is unusually small and may be suspicious');
      result.securityIssues.push({
        type: 'suspicious_content',
        severity: 'low',
        description: 'File is unusually small',
        recommendation: 'Verify this file is legitimate'
      });
    }
  }

  /**
   * Validate file extension
   */
  private static validateExtension(
    filename: string,
    options: FileValidationOptions,
    result: ValidationResult
  ): void {
    const extension = filename.split('.').pop()?.toLowerCase();

    if (!extension) {
      result.errors.push('File has no extension');
      return;
    }

    // Check blocked extensions
    if (options.blockedExtensions?.includes(extension)) {
      result.errors.push(`File extension .${extension} is not allowed`);
      result.securityIssues.push({
        type: 'blocked_extension',
        severity: 'critical',
        description: `File has blocked extension .${extension}`,
        recommendation: 'Upload a file with an allowed extension'
      });
    }

    // Check allowed extensions (if specified)
    if (options.allowedExtensions && !options.allowedExtensions.includes(extension)) {
      result.errors.push(`File extension .${extension} is not in the allowed list`);
    }
  }

  /**
   * Validate magic numbers (file signatures)
   */
  private static async validateMagicNumbers(
    buffer: Buffer,
    filename: string,
    options: FileValidationOptions,
    result: ValidationResult
  ): Promise<void> {
    try {
      const magicInfo = magicBytes(buffer);

      if (magicInfo.length === 0) {
        result.warnings.push('Could not determine file type from magic bytes');
        result.securityIssues.push({
          type: 'invalid_magic_number',
          severity: 'medium',
          description: 'File has invalid or unknown magic numbers',
          recommendation: 'Verify the file is not corrupted'
        });
        return;
      }

      const detectedType = magicInfo[0];
      result.detectedType = {
        mimeType: detectedType.mime || 'unknown',
        extension: detectedType.extension || 'unknown',
        description: detectedType.type || 'unknown'
      };

      // Check for suspicious file types
      const suspiciousTypes = [
        'application/x-executable',
        'application/x-msdownload',
        'application/x-msdos-program',
        'application/x-sh',
        'text/x-python',
        'application/x-bat'
      ];

      if (suspiciousTypes.includes(detectedType.mime)) {
        result.errors.push(`File type ${detectedType.mime} is not allowed`);
        result.securityIssues.push({
          type: 'suspicious_content',
          severity: 'critical',
          description: `File appears to be an executable or script`,
          recommendation: 'Upload only document, image, video, or archive files'
        });
      }

    } catch (error) {
      result.warnings.push('Could not validate magic numbers');
      logger.warn('Magic number validation failed', { filename, error });
    }
  }

  /**
   * Validate MIME type
   */
  private static async validateMimeType(
    buffer: Buffer,
    filename: string,
    options: FileValidationOptions,
    result: ValidationResult
  ): Promise<void> {
    try {
      const fileType = await fileTypeFromBuffer(buffer);

      if (!fileType) {
        result.warnings.push('Could not determine MIME type');
        return;
      }

      // Update detected type with more accurate information
      if (result.detectedType) {
        result.detectedType.mimeType = fileType.mime;
        result.detectedType.extension = fileType.ext;
      }

      // Check if MIME type is allowed
      if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(fileType.mime)) {
        result.errors.push(`MIME type ${fileType.mime} is not allowed`);
      }

      // Check for MIME type mismatch with extension
      const extension = filename.split('.').pop()?.toLowerCase();
      if (extension && fileType.ext && extension !== fileType.ext) {
        result.warnings.push(`File extension .${extension} does not match detected type .${fileType.ext}`);
        result.securityIssues.push({
          type: 'suspicious_content',
          severity: 'medium',
          description: 'File extension does not match actual file type',
          recommendation: 'Verify the file has the correct extension'
        });
      }

    } catch (error) {
      result.warnings.push('Could not validate MIME type');
      logger.warn('MIME type validation failed', { filename, error });
    }
  }

  /**
   * Validate file content for malicious patterns
   */
  private static async validateContent(
    buffer: Buffer,
    filename: string,
    options: FileValidationOptions,
    result: ValidationResult
  ): Promise<void> {
    const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\.cookie/i,
      /window\.location/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        result.errors.push('File contains potentially malicious content');
        result.securityIssues.push({
          type: 'suspicious_content',
          severity: 'high',
          description: `File contains suspicious pattern: ${pattern.source}`,
          recommendation: 'Do not upload files with embedded scripts or malicious content'
        });
        break;
      }
    }

    // Check for null bytes and other suspicious characters
    if (buffer.includes(0x00)) {
      result.warnings.push('File contains null bytes which may indicate malicious content');
      result.securityIssues.push({
        type: 'suspicious_content',
        severity: 'medium',
        description: 'File contains null bytes',
        recommendation: 'Verify the file is not corrupted or malicious'
      });
    }
  }

  /**
   * Scan for malware (placeholder for integration with antivirus)
   */
  private static async scanForMalware(
    buffer: Buffer,
    filename: string,
    result: ValidationResult
  ): Promise<void> {
    // TODO: Integrate with ClamAV or other antivirus solution
    // For now, just add a warning
    result.warnings.push('Malware scanning is not yet implemented');

    logger.info('Malware scanning skipped (not implemented)', { filename });
  }

  /**
   * Validate file structure
   */
  private static async validateFileStructure(
    buffer: Buffer,
    filename: string,
    result: ValidationResult
  ): Promise<void> {
    const extension = filename.split('.').pop()?.toLowerCase();

    try {
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          await this.validateJpegStructure(buffer, result);
          break;
        case 'png':
          await this.validatePngStructure(buffer, result);
          break;
        case 'pdf':
          await this.validatePdfStructure(buffer, result);
          break;
        case 'zip':
          await this.validateZipStructure(buffer, result);
          break;
        default:
          // No specific structure validation for this file type
          break;
      }
    } catch (error) {
      result.warnings.push(`File structure validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.warn('File structure validation failed', { filename, error });
    }
  }

  /**
   * Validate JPEG file structure
   */
  private static async validateJpegStructure(buffer: Buffer, result: ValidationResult): Promise<void> {
    // Check for JPEG signatures (FF D8)
    if (buffer.length < 2 || buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
      result.errors.push('File is not a valid JPEG image');
      return;
    }

    // Check for JPEG end marker (FF D9)
    if (buffer[buffer.length - 2] !== 0xFF || buffer[buffer.length - 1] !== 0xD9) {
      result.warnings.push('JPEG file may be incomplete or corrupted');
    }
  }

  /**
   * Validate PNG file structure
   */
  private static async validatePngStructure(buffer: Buffer, result: ValidationResult): Promise<void> {
    // Check for PNG signature
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    if (buffer.length < 8 || !buffer.slice(0, 8).equals(pngSignature)) {
      result.errors.push('File is not a valid PNG image');
      return;
    }

    // Check for IEND chunk
    if (buffer.length < 12 || !buffer.slice(buffer.length - 12, buffer.length - 8).equals(Buffer.from([0x00, 0x00, 0x00, 0x00]))) {
      result.warnings.push('PNG file may be incomplete or corrupted');
    }
  }

  /**
   * Validate PDF file structure
   */
  private static async validatePdfStructure(buffer: Buffer, result: ValidationResult): Promise<void> {
    const content = buffer.toString('ascii', 0, Math.min(1024, buffer.length));

    if (!content.startsWith('%PDF-')) {
      result.errors.push('File is not a valid PDF document');
      return;
    }

    // Check for %%EOF marker
    if (!buffer.includes(Buffer.from('%%EOF'))) {
      result.warnings.push('PDF file may be incomplete or corrupted');
    }
  }

  /**
   * Validate ZIP file structure
   */
  private static async validateZipStructure(buffer: Buffer, result: ValidationResult): Promise<void> {
    // Check for ZIP signature
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      result.errors.push('File is not a valid ZIP archive');
      return;
    }

    // Check for end of central directory signature
    const endSignature = Buffer.from([0x50, 0x4B, 0x05, 0x06]);
    const hasEndSignature = buffer.includes(endSignature);

    if (!hasEndSignature) {
      result.warnings.push('ZIP archive may be incomplete or corrupted');
    }

    // Check for ZIP bomb (high compression ratio)
    if (buffer.length > 0) {
      // This is a simplified check - in production, you'd want to parse the ZIP structure
      const maxReasonableCompression = 100; // 100:1 compression ratio
      // More sophisticated ZIP bomb detection would require parsing the ZIP structure
    }
  }
}