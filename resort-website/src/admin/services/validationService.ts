import {
  propertySchema,
  roomTypeSchema,
  placeSchema,
  offerSchema,
  promoCodeSchema,
  referrerSchema,
  enquirySchema,
  mediaSchema,
  landingContentSchema,
  siteSettingsSchema,
  adminUserSchema,
  validateEntity,
  type PropertyInput,
  type RoomTypeInput,
  type PlaceInput,
  type OfferInput,
  type PromoCodeInput,
  type ReferrerInput,
  type EnquiryInput,
  type MediaInput,
  type LandingContentInput,
  type SiteSettingsInput,
  type AdminUserInput
} from '../validation/schemas';
import { sanitizeInput, sanitizeHtml } from '../utils/security';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  sanitized?: any;
}

class ValidationService {
  // Property validation
  validateProperty(data: unknown): ValidationResult {
    // Sanitize inputs
    const sanitized = this.sanitizePropertyData(data);

    const result = validateEntity(propertySchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    // Additional business rules
    const warnings: string[] = [];

    if (sanitized.amenities.length < 3) {
      warnings.push('Consider adding more amenities for better appeal');
    }

    if (!sanitized.tagline) {
      warnings.push('Adding a tagline can improve marketing appeal');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      sanitized: result.data
    };
  }

  // Room type validation
  validateRoomType(data: unknown): ValidationResult {
    const sanitized = this.sanitizeRoomTypeData(data);

    const result = validateEntity(roomTypeSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    const warnings: string[] = [];

    if (sanitized.capacity > 10 && !sanitized.size) {
      warnings.push('Consider adding room size for larger capacity rooms');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      sanitized: result.data
    };
  }

  // Place validation
  validatePlace(data: unknown): ValidationResult {
    const sanitized = this.sanitizePlaceData(data);

    const result = validateEntity(placeSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: result.data
    };
  }

  // Offer validation
  validateOffer(data: unknown): ValidationResult {
    const sanitized = this.sanitizeOfferData(data);

    const result = validateEntity(offerSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    const warnings: string[] = [];
    const now = new Date();
    const validFrom = new Date(sanitized.validFrom);
    const validUntil = new Date(sanitized.validUntil);

    if (validFrom < now && sanitized.status === 'Inactive') {
      warnings.push('Offer start date is in the past but status is Inactive');
    }

    if (validUntil < now && sanitized.status === 'Active') {
      warnings.push('Offer has expired but status is still Active');
    }

    if (sanitized.type === 'Percentage' && sanitized.value > 50) {
      warnings.push('High percentage discount may impact profitability');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      sanitized: result.data
    };
  }

  // Promo code validation
  validatePromoCode(data: unknown): ValidationResult {
    const sanitized = this.sanitizePromoCodeData(data);

    const result = validateEntity(promoCodeSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    const warnings: string[] = [];

    if (sanitized.usageLimit > 1000) {
      warnings.push('High usage limit may lead to abuse');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      sanitized: result.data
    };
  }

  // Referrer validation
  validateReferrer(data: unknown): ValidationResult {
    const sanitized = this.sanitizeReferrerData(data);

    const result = validateEntity(referrerSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: result.data
    };
  }

  // Enquiry validation
  validateEnquiry(data: unknown): ValidationResult {
    const sanitized = this.sanitizeEnquiryData(data);

    const result = validateEntity(enquirySchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    const warnings: string[] = [];

    if (sanitized.adults > 10) {
      warnings.push('Large group booking - consider special handling');
    }

    if (!sanitized.email && !sanitized.phone) {
      warnings.push('Enquiry has no contact method - may be difficult to follow up');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      sanitized: result.data
    };
  }

  // Media validation
  validateMedia(data: unknown): ValidationResult {
    const sanitized = this.sanitizeMediaData(data);

    const result = validateEntity(mediaSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: result.data
    };
  }

  // Landing content validation
  validateLandingContent(data: unknown): ValidationResult {
    const sanitized = this.sanitizeLandingContentData(data);

    const result = validateEntity(landingContentSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: result.data
    };
  }

  // Site settings validation
  validateSiteSettings(data: unknown): ValidationResult {
    const sanitized = this.sanitizeSiteSettingsData(data);

    const result = validateEntity(siteSettingsSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: result.data
    };
  }

  // Admin user validation
  validateAdminUser(data: unknown): ValidationResult {
    const sanitized = this.sanitizeAdminUserData(data);

    const result = validateEntity(adminUserSchema, sanitized);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        sanitized
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: result.data
    };
  }

  // Sanitization helpers
  private sanitizePropertyData(data: any): any {
    return {
      ...data,
      name: sanitizeInput(data.name),
      slug: data.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      tagline: sanitizeInput(data.tagline),
      shortDescription: sanitizeHtml(data.shortDescription),
      description: sanitizeHtml(data.description),
      address: sanitizeInput(data.address),
      amenities: data.amenities?.map((a: string) => sanitizeInput(a)),
      seo: {
        title: sanitizeInput(data.seo?.title),
        description: sanitizeInput(data.seo?.description),
        keywords: sanitizeInput(data.seo?.keywords)
      }
    };
  }

  private sanitizeRoomTypeData(data: any): any {
    return {
      ...data,
      name: sanitizeInput(data.name),
      slug: data.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: sanitizeHtml(data.description),
      amenities: data.amenities?.map((a: string) => sanitizeInput(a)),
      size: sanitizeInput(data.size),
      bedType: sanitizeInput(data.bedType),
      type: sanitizeInput(data.type)
    };
  }

  private sanitizePlaceData(data: any): any {
    return {
      ...data,
      name: sanitizeInput(data.name),
      description: sanitizeHtml(data.description),
      type: sanitizeInput(data.type),
      location: sanitizeInput(data.location),
      hours: sanitizeInput(data.hours)
    };
  }

  private sanitizeOfferData(data: any): any {
    return {
      ...data,
      title: sanitizeInput(data.title),
      description: sanitizeHtml(data.description),
      terms: sanitizeHtml(data.terms),
      code: data.code?.toUpperCase().replace(/[^A-Z0-9-_]/g, '-')
    };
  }

  private sanitizePromoCodeData(data: any): any {
    return {
      ...data,
      description: sanitizeHtml(data.description),
      code: data.code?.toUpperCase().replace(/[^A-Z0-9-_]/g, '-')
    };
  }

  private sanitizeReferrerData(data: any): any {
    return {
      ...data,
      name: sanitizeInput(data.name),
      email: data.email?.toLowerCase().trim(),
      code: data.code?.toUpperCase().replace(/[^A-Z0-9-_]/g, '-'),
      notes: sanitizeHtml(data.notes)
    };
  }

  private sanitizeEnquiryData(data: any): any {
    return {
      ...data,
      fullName: sanitizeInput(data.fullName),
      name: sanitizeInput(data.name),
      email: data.email?.toLowerCase().trim(),
      location: sanitizeInput(data.location),
      propertyName: sanitizeInput(data.propertyName),
      roomType: sanitizeInput(data.roomType),
      notes: sanitizeHtml(data.notes)
    };
  }

  private sanitizeMediaData(data: any): any {
    return {
      ...data,
      alt: sanitizeInput(data.alt),
      caption: sanitizeInput(data.caption)
    };
  }

  private sanitizeLandingContentData(data: any): any {
    return {
      ...data,
      hero: {
        title: sanitizeInput(data.hero?.title),
        subtitle: sanitizeInput(data.hero?.subtitle),
        ctaText: sanitizeInput(data.hero?.ctaText)
      },
      usps: data.usps?.map((usp: any) => ({
        title: sanitizeInput(usp.title),
        description: sanitizeInput(usp.description)
      })),
      testimonials: data.testimonials?.map((t: any) => ({
        name: sanitizeInput(t.name),
        role: sanitizeInput(t.role),
        content: sanitizeHtml(t.content)
      })),
      faqs: data.faqs?.map((faq: any) => ({
        question: sanitizeInput(faq.question),
        answer: sanitizeHtml(faq.answer),
        category: sanitizeInput(faq.category)
      })),
      seo: {
        title: sanitizeInput(data.seo?.title),
        description: sanitizeInput(data.seo?.description),
        keywords: sanitizeInput(data.seo?.keywords)
      }
    };
  }

  private sanitizeSiteSettingsData(data: any): any {
    return {
      ...data,
      email: data.email?.toLowerCase().trim(),
      whatsapp: sanitizeInput(data.whatsapp),
      address: sanitizeInput(data.address),
      legal: {
        privacy: sanitizeHtml(data.legal?.privacy),
        terms: sanitizeHtml(data.legal?.terms),
        cancellation: sanitizeHtml(data.legal?.cancellation)
      },
      booking: {
        sla: sanitizeInput(data.booking?.sla),
        cancellationPolicy: sanitizeHtml(data.booking?.cancellationPolicy)
      }
    };
  }

  private sanitizeAdminUserData(data: any): any {
    return {
      ...data,
      username: sanitizeInput(data.username),
      email: data.email?.toLowerCase().trim(),
      name: sanitizeInput(data.name)
    };
  }

  // Bulk validation
  validateBulk(entities: { type: string; data: unknown }[]): ValidationResult[] {
    return entities.map(entity => {
      switch (entity.type) {
        case 'property':
          return this.validateProperty(entity.data);
        case 'roomType':
          return this.validateRoomType(entity.data);
        case 'place':
          return this.validatePlace(entity.data);
        case 'offer':
          return this.validateOffer(entity.data);
        case 'promoCode':
          return this.validatePromoCode(entity.data);
        case 'referrer':
          return this.validateReferrer(entity.data);
        case 'enquiry':
          return this.validateEnquiry(entity.data);
        case 'media':
          return this.validateMedia(entity.data);
        case 'landingContent':
          return this.validateLandingContent(entity.data);
        case 'siteSettings':
          return this.validateSiteSettings(entity.data);
        case 'adminUser':
          return this.validateAdminUser(entity.data);
        default:
          return {
            isValid: false,
            errors: [`Unknown entity type: ${entity.type}`]
          };
      }
    });
  }
}

export const validationService = new ValidationService();