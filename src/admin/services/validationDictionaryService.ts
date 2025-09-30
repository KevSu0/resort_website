/**
 * Validation Dictionary Service
 *
 * Single source of truth for all entity validations in the admin system.
 * Provides centralized validation rules and error messages.
 */

import { normalizeAmenityKey, findAmenityByKey, AMENITY_CATALOG } from '../reference/amenities';

export interface ValidationError {
  code: string;
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationDictionaryService {
  private static instance: ValidationDictionaryService;

  static getInstance(): ValidationDictionaryService {
    if (!ValidationDictionaryService.instance) {
      ValidationDictionaryService.instance = new ValidationDictionaryService();
    }
    return ValidationDictionaryService.instance;
  }

  // ===== Common Validators =====

  /**
   * Validate UUID v4 format
   */
  validateUUID(value: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(value);
  }

  /**
   * Validate slug format (kebab-case)
   */
  validateSlug(value: string): boolean {
    const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return regex.test(value) && value.length >= 2 && value.length <= 100;
  }

  /**
   * Validate email address (RFC-style)
   */
  validateEmail(email: string): boolean {
    if (!email) return true; // Optional field
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validate phone number (E.164 format, IN default)
   */
  validatePhone(phone: string): boolean {
    if (!phone) return false; // Required field
    // Basic E.164 validation (supports + followed by digits)
    const regex = /^\+?[1-9]\d{6,14}$/;
    return regex.test(phone);
  }

  /**
   * Validate URL
   */
  validateURL(url: string): boolean {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ===== Entity Validators =====

  /**
   * Validate Property entity
   */
  validateProperty(property: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!property.name || property.name.trim().length < 2) {
      errors.push({
        code: 'VAL-001',
        field: 'name',
        message: 'Property name is required and must be at least 2 characters'
      });
    }

    if (!property.slug) {
      errors.push({
        code: 'VAL-001',
        field: 'slug',
        message: 'Slug is required'
      });
    } else if (!this.validateSlug(property.slug)) {
      errors.push({
        code: 'VAL-001',
        field: 'slug',
        message: 'Slug must be in kebab-case (e.g., "wayanad-resort")'
      });
    }

    if (!property.heroMediaId || !this.validateUUID(property.heroMediaId)) {
      errors.push({
        code: 'VAL-001',
        field: 'heroMediaId',
        message: 'Valid hero media ID is required'
      });
    }

    if (!property.shortDescription || property.shortDescription.length < 10) {
      errors.push({
        code: 'VAL-001',
        field: 'shortDescription',
        message: 'Short description is required (minimum 10 characters)'
      });
    }

    if (!property.fullDescription || property.fullDescription.length < 50) {
      errors.push({
        code: 'VAL-001',
        field: 'fullDescription',
        message: 'Full description is required (minimum 50 characters)'
      });
    }

    // Location validation
    if (!property.address || property.address.trim().length < 5) {
      errors.push({
        code: 'VAL-001',
        field: 'address',
        message: 'Address is required'
      });
    }

    if (typeof property.lat !== 'number' || property.lat < -90 || property.lat > 90) {
      errors.push({
        code: 'VAL-001',
        field: 'lat',
        message: 'Latitude must be a number between -90 and 90'
      });
    }

    if (typeof property.lng !== 'number' || property.lng < -180 || property.lng > 180) {
      errors.push({
        code: 'VAL-001',
        field: 'lng',
        message: 'Longitude must be a number between -180 and 180'
      });
    }

    // Amenities validation
    if (!property.amenities || !Array.isArray(property.amenities) || property.amenities.length === 0) {
      errors.push({
        code: 'VAL-001',
        field: 'amenities',
        message: 'At least one amenity is required'
      });
    } else {
      // Validate each amenity exists in catalog
      const invalidAmenities = property.amenities.filter((a: string) => !AMENITY_CATALOG[a]);
      if (invalidAmenities.length > 0) {
        errors.push({
          code: 'VAL-001',
          field: 'amenities',
          message: `Invalid amenities: ${invalidAmenities.join(', ')}`
        });
      }
    }

    // Check-in/Check-out times
    if (!property.checkInTime || !/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(property.checkInTime)) {
      errors.push({
        code: 'VAL-001',
        field: 'checkInTime',
        message: 'Valid check-in time is required (HH:MM format, 24-hour)'
      });
    }

    if (!property.checkOutTime || !/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(property.checkOutTime)) {
      errors.push({
        code: 'VAL-001',
        field: 'checkOutTime',
        message: 'Valid check-out time is required (HH:MM format, 24-hour)'
      });
    }

    // SEO validation
    if (!property.seoTitle || property.seoTitle.length < 10) {
      errors.push({
        code: 'VAL-001',
        field: 'seoTitle',
        message: 'SEO title is required (minimum 10 characters)'
      });
    }

    if (!property.seoMetaDescription || property.seoMetaDescription.length < 50) {
      errors.push({
        code: 'VAL-001',
        field: 'seoMetaDescription',
        message: 'SEO meta description is required (minimum 50 characters)'
      });
    }

    // Schema validation
    if (!property.schemaHotel) {
      errors.push({
        code: 'VAL-001',
        field: 'schemaHotel',
        message: 'Hotel schema is required'
      });
    } else {
      if (!property.schemaHotel.priceRange || property.schemaHotel.priceRange.length < 3) {
        errors.push({
          code: 'VAL-001',
          field: 'schemaHotel.priceRange',
          message: 'Price range is required'
        });
      }
      if (typeof property.schemaHotel.starRating !== 'number' || property.schemaHotel.starRating < 1 || property.schemaHotel.starRating > 5) {
        errors.push({
          code: 'VAL-001',
          field: 'schemaHotel.starRating',
          message: 'Star rating must be between 1 and 5'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate RoomType entity
   */
  validateRoomType(roomType: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!roomType.propertyId || !this.validateUUID(roomType.propertyId)) {
      errors.push({
        code: 'VAL-001',
        field: 'propertyId',
        message: 'Valid property ID is required'
      });
    }

    if (!roomType.name || roomType.name.trim().length < 2) {
      errors.push({
        code: 'VAL-001',
        field: 'name',
        message: 'Room type name is required'
      });
    }

    if (!roomType.slug) {
      errors.push({
        code: 'VAL-001',
        field: 'slug',
        message: 'Slug is required'
      });
    } else if (!this.validateSlug(roomType.slug)) {
      errors.push({
        code: 'VAL-001',
        field: 'slug',
        message: 'Slug must be in kebab-case'
      });
    }

    // Capacity validation
    if (!roomType.capacity || typeof roomType.capacity !== 'object') {
      errors.push({
        code: 'VAL-001',
        field: 'capacity',
        message: 'Capacity information is required'
      });
    } else {
      if (typeof roomType.capacity.adults !== 'number' || roomType.capacity.adults < 1) {
        errors.push({
          code: 'VAL-001',
          field: 'capacity.adults',
          message: 'Adult capacity must be at least 1'
        });
      }
      if (typeof roomType.capacity.children !== 'number' || roomType.capacity.children < 0) {
        errors.push({
          code: 'VAL-001',
          field: 'capacity.children',
          message: 'Children capacity cannot be negative'
        });
      }
    }

    // Rate bands validation
    if (!roomType.rateBands || !Array.isArray(roomType.rateBands) || roomType.rateBands.length === 0) {
      errors.push({
        code: 'VAL-001',
        field: 'rateBands',
        message: 'At least one rate band is required'
      });
    } else {
      roomType.rateBands.forEach((band: any, index: number) => {
        if (!band.label) {
          errors.push({
            code: 'VAL-001',
            field: `rateBands[${index}].label`,
            message: 'Rate band label is required'
          });
        }
        if (typeof band.min !== 'number' || band.min < 0) {
          errors.push({
            code: 'VAL-001',
            field: `rateBands[${index}].min`,
            message: 'Minimum rate must be a positive number'
          });
        }
        if (typeof band.max !== 'number' || band.max < band.min) {
          errors.push({
            code: 'VAL-001',
            field: `rateBands[${index}].max`,
            message: 'Maximum rate must be greater than minimum rate'
          });
        }
        if (!band.currency || band.currency.length !== 3) {
          errors.push({
            code: 'VAL-001',
            field: `rateBands[${index}].currency`,
            message: 'Currency code is required (3 letters)'
          });
        }
      });
    }

    // Amenities validation
    if (!roomType.amenities || !Array.isArray(roomType.amenities)) {
      errors.push({
        code: 'VAL-001',
        field: 'amenities',
        message: 'Amenities array is required'
      });
    } else {
      const invalidAmenities = roomType.amenities.filter((a: string) => !AMENITY_CATALOG[a]);
      if (invalidAmenities.length > 0) {
        errors.push({
          code: 'VAL-001',
          field: 'amenities',
          message: `Invalid amenities: ${invalidAmenities.join(', ')}`
        });
      }
    }

    // Gallery validation
    if (!roomType.gallery || !Array.isArray(roomType.gallery)) {
      errors.push({
        code: 'VAL-001',
        field: 'gallery',
        message: 'Gallery array is required'
      });
    } else {
      roomType.gallery.forEach((mediaId: string, index: number) => {
        if (!this.validateUUID(mediaId)) {
          errors.push({
            code: 'VAL-001',
            field: `gallery[${index}]`,
            message: 'Invalid media ID in gallery'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Media entity
   */
  validateMedia(media: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Basic validation
    if (!media.id || !this.validateUUID(media.id)) {
      errors.push({
        code: 'VAL-001',
        field: 'id',
        message: 'Valid ID is required'
      });
    }

    if (!media.type || !['image', 'video'].includes(media.type)) {
      errors.push({
        code: 'VAL-001',
        field: 'type',
        message: 'Type must be either "image" or "video"'
      });
    }

    if (!media.filename || media.filename.trim().length === 0) {
      errors.push({
        code: 'VAL-001',
        field: 'filename',
        message: 'Filename is required'
      });
    }

    if (!media.mimeType) {
      errors.push({
        code: 'VAL-001',
        field: 'mimeType',
        message: 'MIME type is required'
      });
    }

    // Size validation
    if (typeof media.size !== 'number' || media.size <= 0) {
      errors.push({
        code: 'VAL-001',
        field: 'size',
        message: 'Size must be a positive number'
      });
    }

    // Type-specific validation
    if (media.type === 'image') {
      if (!media.width || !media.height) {
        errors.push({
          code: 'VAL-001',
          field: 'dimensions',
          message: 'Image dimensions are required'
        });
      }

      // Hero image validation
      if (media.isHero) {
        if (media.size > 1.5 * 1024 * 1024) { // 1.5MB
          errors.push({
            code: 'VAL-001',
            field: 'size',
            message: 'Hero image must be less than 1.5MB'
          });
        }
        if (media.width < 1600 || media.height < 1066) {
          errors.push({
            code: 'VAL-001',
            field: 'dimensions',
            message: 'Hero image must be at least 1600x1066 pixels'
          });
        }
        // Aspect ratio validation (3:2 ± 3%)
        const aspectRatio = media.width / media.height;
        const targetRatio = 3 / 2;
        const tolerance = 0.03;
        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          errors.push({
            code: 'VAL-001',
            field: 'dimensions',
            message: 'Hero image aspect ratio should be approximately 3:2'
          });
        }
      } else {
        // Gallery image validation
        if (media.size > 1.0 * 1024 * 1024) { // 1MB
          errors.push({
            code: 'VAL-001',
            field: 'size',
            message: 'Gallery image must be less than 1MB'
          });
        }
        if (media.width < 1200 || media.height < 800) {
          errors.push({
            code: 'VAL-001',
            field: 'dimensions',
            message: 'Gallery image must be at least 1200x800 pixels'
          });
        }
      }
    }

    if (media.type === 'video') {
      if (!media.mimeType.startsWith('video/')) {
        errors.push({
          code: 'VAL-001',
          field: 'mimeType',
          message: 'Video MIME type must start with "video/"'
        });
      }
      if (media.size > 20 * 1024 * 1024) { // 20MB
        errors.push({
          code: 'VAL-001',
          field: 'size',
          message: 'Video must be less than 20MB'
        });
      }
      // Duration is optional - don't validate if missing
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Offer entity
   */
  validateOffer(offer: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!offer.title || offer.title.trim().length < 3) {
      errors.push({
        code: 'VAL-001',
        field: 'title',
        message: 'Title is required (minimum 3 characters)'
      });
    }

    if (!offer.type || !['percentage', 'flat', 'freeNight', 'package'].includes(offer.type)) {
      errors.push({
        code: 'VAL-001',
        field: 'type',
        message: 'Type must be one of: percentage, flat, freeNight, package'
      });
    }

    if (!offer.scope || !['global', 'propertyId', 'roomTypeId'].includes(offer.scope)) {
      errors.push({
        code: 'VAL-001',
        field: 'scope',
        message: 'Scope must be one of: global, propertyId, roomTypeId'
      });
    }

    if (typeof offer.value !== 'number' || offer.value <= 0) {
      errors.push({
        code: 'VAL-001',
        field: 'value',
        message: 'Value must be a positive number'
      });
    }

    // Date validation
    if (!offer.validFrom || !offer.validTo) {
      errors.push({
        code: 'VAL-001',
        field: 'dates',
        message: 'Valid from and to dates are required'
      });
    } else if (new Date(offer.validFrom) >= new Date(offer.validTo)) {
      errors.push({
        code: 'VAL-001',
        field: 'dates',
        message: 'Valid from date must be before valid to date'
      });
    }

    // Blackout dates validation
    if (offer.blackoutDates && !Array.isArray(offer.blackoutDates)) {
      errors.push({
        code: 'VAL-001',
        field: 'blackoutDates',
        message: 'Blackout dates must be an array'
      });
    }

    // Usage cap validation
    if (offer.usageCap && (typeof offer.usageCap !== 'number' || offer.usageCap <= 0)) {
      errors.push({
        code: 'VAL-001',
        field: 'usageCap',
        message: 'Usage cap must be a positive number'
      });
    }

    // Status validation
    if (!offer.status || !['draft', 'scheduled', 'active', 'expired', 'archived'].includes(offer.status)) {
      errors.push({
        code: 'VAL-001',
        field: 'status',
        message: 'Status must be one of: draft, scheduled, active, expired, archived'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Enquiry entity
   */
  validateEnquiry(enquiry: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!enquiry.ref || !/^ENQ-\d{4}-\d{4}$/.test(enquiry.ref)) {
      errors.push({
        code: 'VAL-001',
        field: 'ref',
        message: 'Reference must be in format ENQ-YYYY-NNNN'
      });
    }

    if (!enquiry.fullName || enquiry.fullName.trim().length < 2) {
      errors.push({
        code: 'VAL-001',
        field: 'fullName',
        message: 'Full name is required'
      });
    }

    if (!this.validatePhone(enquiry.phone)) {
      errors.push({
        code: 'VAL-001',
        field: 'phone',
        message: 'Valid phone number is required (E.164 format)'
      });
    }

    if (!enquiry.checkIn || !enquiry.checkOut) {
      errors.push({
        code: 'VAL-001',
        field: 'dates',
        message: 'Check-in and check-out dates are required'
      });
    } else if (new Date(enquiry.checkIn) >= new Date(enquiry.checkOut)) {
      errors.push({
        code: 'VAL-001',
        field: 'dates',
        message: 'Check-in date must be before check-out date'
      });
    }

    if (typeof enquiry.adults !== 'number' || enquiry.adults < 1) {
      errors.push({
        code: 'VAL-001',
        field: 'adults',
        message: 'Number of adults must be at least 1'
      });
    }

    if (!enquiry.source || enquiry.source.trim().length === 0) {
      errors.push({
        code: 'VAL-001',
        field: 'source',
        message: 'Source is required'
      });
    }

    // Optional fields validation
    if (enquiry.email && !this.validateEmail(enquiry.email)) {
      errors.push({
        code: 'VAL-001',
        field: 'email',
        message: 'Invalid email address'
      });
    }

    if (enquiry.children && (typeof enquiry.children !== 'number' || enquiry.children < 0)) {
      errors.push({
        code: 'VAL-001',
        field: 'children',
        message: 'Number of children cannot be negative'
      });
    }

    // Status validation
    if (!enquiry.status || !['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONFIRMED', 'DECLINED', 'CANCELLED'].includes(enquiry.status)) {
      errors.push({
        code: 'VAL-001',
        field: 'status',
        message: 'Invalid status'
      });
    }

    // SLA validation - cannot be CONFIRMED without timeline entry
    if (enquiry.status === 'CONFIRMED' && (!enquiry.timeline || enquiry.timeline.length === 0)) {
      errors.push({
        code: 'VAL-001',
        field: 'status',
        message: 'Enquiry cannot be marked as CONFIRMED without timeline entries'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate uniqueness constraint for slug
   */
  async validateSlugUniqueness(slug: string, entityType: string, excludeId?: string): Promise<boolean> {
    // This would need to check against the database
    // Implementation depends on the database service
    return true; // Placeholder
  }

  /**
   * Validate offer conflicts (same scope and time overlap)
   */
  async validateOfferConflicts(offer: any, excludeId?: string): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // This would check for overlapping offers in the database
    // Implementation depends on the offers service

    return errors;
  }

  /**
   * Format validation error for display
   */
  formatError(error: ValidationError): string {
    return `${error.field}: ${error.message}`;
  }

  /**
   * Format multiple validation errors
   */
  formatErrors(errors: ValidationError[]): string[] {
    return errors.map(error => this.formatError(error));
  }
}