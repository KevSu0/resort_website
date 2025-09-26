import { z } from 'zod';

// Common schemas
const seoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(60, 'Title must be 60 characters or less'),
  description: z.string().min(1, 'Description is required').max(160, 'Description must be 160 characters or less'),
  keywords: z.string().optional(),
  ogImage: z.string().optional()
});

const imageSchema = z.object({
  id: z.string(),
  kind: z.enum(['image', 'video']),
  filename: z.string(),
  originalName: z.string(),
  mime: z.string(),
  bytes: z.number().positive(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  alt: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  createdAt: z.string(),
  usedBy: z.array(z.object({
    entityType: z.string(),
    entityId: z.string(),
    field: z.string()
  }))
});

// Entity schemas
export const propertySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be 50 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  tagline: z.string().max(100, 'Tagline must be 100 characters or less').optional(),
  shortDescription: z.string()
    .min(10, 'Short description must be at least 10 characters')
    .max(300, 'Short description must be 300 characters or less'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  mapUrl: z.string().url('Invalid map URL').optional(),
  checkIn: z.string().min(1, 'Check-in time is required'),
  checkOut: z.string().min(1, 'Check-out time is required'),
  amenities: z.array(z.string().min(1)).min(1, 'At least one amenity is required'),
  heroImage: z.string().min(1, 'Hero image is required'),
  gallery: z.array(z.string().min(1)).min(1, 'At least one gallery image is required'),
  featured: z.boolean(),
  seo: seoSchema,
  schemaHotel: z.object({
    priceRange: z.string().min(1, 'Price range is required'),
    starRating: z.number().min(1).max(5, 'Star rating must be between 1 and 5'),
    amenities: z.array(z.string().min(1)).min(1, 'At least one amenity is required')
  }),
  createdAt: z.string(),
  updatedAt: z.string()
}).strict();

export const roomTypeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be 50 characters or less'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be 50 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  category: z.enum(['Standard', 'Deluxe', 'Suite', 'Villa', 'Cottage', 'Treehouse']),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(20, 'Capacity must be 20 or less'),
  baseRateBand: z.object({
    base: z.number().positive('Base rate must be positive'),
    seasonMultiplier: z.number().min(0.5, 'Season multiplier must be at least 0.5').max(3, 'Season multiplier must be 3 or less'),
    minOccupancy: z.number().min(1, 'Minimum occupancy must be at least 1'),
    maxOccupancy: z.number().min(1, 'Maximum occupancy must be at least 1')
  }).refine(data => data.maxOccupancy >= data.minOccupancy, {
    message: 'Maximum occupancy must be greater than or equal to minimum occupancy'
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  amenities: z.array(z.string().min(1)).min(1, 'At least one amenity is required'),
  images: z.array(z.string().min(1)).min(1, 'At least one image is required'),
  featured: z.boolean(),
  photos: z.array(z.string().min(1)).optional(),
  badges: z.array(z.string().min(1)).optional(),
  size: z.string().optional(),
  bedType: z.string().optional(),
  type: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
}).strict();

export const placeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  distanceKm: z.number().min(0, 'Distance must be non-negative').optional(),
  travelTime: z.string().optional(),
  photo: z.string().optional(),
  category: z.enum(['attraction', 'restaurant', 'transport', 'shopping']).optional(),
  type: z.string().min(1, 'Type is required'),
  images: z.array(z.string().min(1)).optional(),
  location: z.string().min(1, 'Location is required'),
  hours: z.string().min(1, 'Hours are required'),
  featured: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
}).strict();

export const offerSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().max(100, 'Title must be 100 characters or less').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must be 20 characters or less')
    .regex(/^[A-Z0-9-_]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
  type: z.enum(['Percentage', 'Fixed', 'FreeNight']),
  value: z.number().positive('Value must be positive'),
  validFrom: z.string().datetime('Invalid valid from date'),
  validUntil: z.string().datetime('Invalid valid until date'),
  terms: z.string().max(2000, 'Terms must be 2000 characters or less').optional(),
  status: z.enum(['Active', 'Inactive', 'Expired']),
  minBookingValue: z.number().min(0, 'Minimum booking value must be non-negative').optional(),
  maxDiscountAmount: z.number().positive('Maximum discount amount must be positive').optional(),
  scope: z.enum(['GLOBAL', 'PROPERTY', 'ROOM']).optional(),
  scopeIds: z.array(z.string()).optional(),
  blackoutDates: z.array(z.string().datetime('Invalid blackout date')).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  minNights: z.number().min(1, 'Minimum nights must be at least 1').optional(),
  minAdvanceDays: z.number().min(0, 'Minimum advance days must be non-negative').optional(),
  maxAdvanceDays: z.number().min(0, 'Maximum advance days must be non-negative').optional(),
  longStayNights: z.number().min(1, 'Long stay nights must be at least 1').optional(),
  longStayDiscount: z.number().min(0).max(100, 'Long stay discount must be between 0 and 100').optional(),
  usageLimit: z.number().min(1, 'Usage limit must be at least 1').optional(),
  usageCount: z.number().min(0, 'Usage count must be non-negative').optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
}).refine(data => new Date(data.validUntil) > new Date(data.validFrom), {
  message: 'Valid until date must be after valid from date'
}).strict();

export const promoCodeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must be 20 characters or less')
    .regex(/^[A-Z0-9-_]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['Percentage', 'Fixed', 'FreeNight', 'Upgrade']),
  value: z.number().positive('Value must be positive'),
  validFrom: z.string().datetime('Invalid valid from date'),
  validUntil: z.string().datetime('Invalid valid until date'),
  usageLimit: z.number().min(1, 'Usage limit must be at least 1'),
  usageCount: z.number().min(0, 'Usage count must be non-negative'),
  customerLimit: z.number().min(1, 'Customer limit must be at least 1'),
  minBookingValue: z.number().min(0, 'Minimum booking value must be non-negative'),
  maxDiscountAmount: z.number().positive('Maximum discount amount must be positive').optional(),
  applicableFor: z.object({
    propertyIds: z.array(z.string()).optional(),
    roomTypeIds: z.array(z.string()).optional()
  }).optional(),
  status: z.enum(['Draft', 'Active', 'Expired', 'Paused']),
  discountType: z.enum(['PERCENT', 'FIXED']).optional(),
  discountValue: z.number().min(0).optional(),
  validTo: z.string().datetime('Invalid valid to date').optional(),
  perPhoneLimit: z.number().min(1, 'Per phone limit must be at least 1').optional(),
  scope: z.enum(['GLOBAL', 'PROPERTY', 'ROOM']).optional(),
  propertyId: z.string().optional(),
  roomTypeId: z.string().optional(),
  minNights: z.number().min(1, 'Minimum nights must be at least 1').optional(),
  minAmount: z.number().min(0, 'Minimum amount must be non-negative').optional(),
  isReferral: z.boolean().optional(),
  referrerId: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
}).refine(data => new Date(data.validUntil) > new Date(data.validFrom), {
  message: 'Valid until date must be after valid from date'
}).strict();

export const referrerSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
  phone: z.string()
    .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must be 20 characters or less')
    .regex(/^[A-Z0-9-_]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
  commissionRate: z.number().min(0).max(100, 'Commission rate must be between 0 and 100').optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
  rewardType: z.enum(['PERCENT', 'FIXED', 'NIGHTS']),
  rewardValue: z.number().positive('Reward value must be positive'),
  maxRewards: z.number().min(1, 'Maximum rewards must be at least 1').optional(),
  totals: z.object({
    attributions: z.number().min(0, 'Attributions must be non-negative'),
    confirmed: z.number().min(0, 'Confirmed must be non-negative'),
    pending: z.number().min(0, 'Pending must be non-negative')
  }),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
}).strict();

const enquiryTimelineSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  timestamp: z.string().datetime('Invalid timestamp'),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().min(1, 'Notes are required'),
  by: z.string().min(1, 'Author is required')
});

export const enquirySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  refCode: z.string().optional(),
  propertyId: z.string().optional(),
  roomTypeId: z.string().optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  checkIn: z.string().datetime('Invalid check-in date').optional(),
  checkOut: z.string().datetime('Invalid check-out date').optional(),
  adults: z.number().min(1, 'Adults must be at least 1').max(20, 'Adults must be 20 or less'),
  children: z.number().min(0, 'Children must be non-negative').max(20, 'Children must be 20 or less'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be 100 characters or less').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less').optional(),
  phone: z.string()
    .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional(),
  location: z.string().max(100, 'Location must be 100 characters or less').optional(),
  propertyName: z.string().max(100, 'Property name must be 100 characters or less').optional(),
  roomType: z.string().max(50, 'Room type must be 50 characters or less').optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
  updatedBy: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'CONFIRMED', 'DECLINED', 'CANCELLED']),
  source: z.enum(['WEBSITE', 'PHONE', 'EMAIL', 'WALKIN', 'REFERRAL']),
  referrerId: z.string().optional(),
  assignedTo: z.string().optional(),
  timeline: z.array(enquiryTimelineSchema),
  createdAt: z.string(),
  updatedAt: z.string()
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after start date'
}).strict();

export const mediaSchema = imageSchema;

export const landingContentSchema = z.object({
  hero: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
    subtitle: z.string().min(1, 'Subtitle is required').max(200, 'Subtitle must be 200 characters or less'),
    backgroundImage: z.string().min(1, 'Background image is required'),
    ctaText: z.string().min(1, 'CTA text is required').max(50, 'CTA text must be 50 characters or less'),
    ctaLink: z.string().min(1, 'CTA link is required')
  }),
  usps: z.array(z.object({
    icon: z.string().min(1, 'Icon is required'),
    title: z.string().min(1, 'Title is required').max(50, 'Title must be 50 characters or less'),
    description: z.string().min(1, 'Description is required').max(200, 'Description must be 200 characters or less')
  })).min(3, 'At least 3 USPs are required').max(6, 'Maximum 6 USPs allowed'),
  testimonials: z.array(z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
    role: z.string().min(1, 'Role is required').max(50, 'Role must be 50 characters or less'),
    content: z.string().min(10, 'Content must be at least 10 characters').max(500, 'Content must be 500 characters or less'),
    photo: z.string().optional(),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5')
  })).optional(),
  faqs: z.array(z.object({
    question: z.string().min(1, 'Question is required').max(200, 'Question must be 200 characters or less'),
    answer: z.string().min(1, 'Answer is required').max(1000, 'Answer must be 1000 characters or less'),
    category: z.string().min(1, 'Category is required')
  })).optional(),
  seo: seoSchema
}).strict();

export const siteSettingsSchema = z.object({
  phones: z.array(z.string().regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')).min(1, 'At least one phone number is required'),
  whatsapp: z.string().regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid WhatsApp number'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  legal: z.object({
    privacy: z.string().min(10, 'Privacy policy must be at least 10 characters'),
    terms: z.string().min(10, 'Terms must be at least 10 characters'),
    cancellation: z.string().min(10, 'Cancellation policy must be at least 10 characters')
  }),
  booking: z.object({
    sla: z.string().min(1, 'SLA is required'),
    paymentMethods: z.array(z.string().min(1)).min(1, 'At least one payment method is required'),
    cancellationPolicy: z.string().min(10, 'Cancellation policy must be at least 10 characters')
  }),
  featureFlags: z.object({
    enableReferrals: z.boolean(),
    enablePromos: z.boolean(),
    enableI18n: z.boolean(),
    enableAnalytics: z.boolean(),
    enableVideo: z.boolean()
  }),
  maxDiscountCapPercent: z.number().min(0).max(100, 'Max discount cap must be between 0 and 100'),
  currency: z.object({
    code: z.string().min(3, 'Currency code must be 3 characters').max(3, 'Currency code must be 3 characters'),
    symbol: z.string().min(1, 'Currency symbol is required').max(5, 'Currency symbol must be 5 characters or less'),
    locale: z.string().min(2, 'Locale must be at least 2 characters')
  }),
  updatedAt: z.string()
}).strict();

// Admin user schema
export const adminUserSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be 50 characters or less'),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less').optional(),
  passwordHash: z.string().min(1, 'Password hash is required'),
  role: z.enum(['ADMIN', 'EDITOR']),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  lastLogin: z.string().optional()
}).strict();

// Type exports
export type PropertyInput = z.infer<typeof propertySchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
export type PlaceInput = z.infer<typeof placeSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type PromoCodeInput = z.infer<typeof promoCodeSchema>;
export type ReferrerInput = z.infer<typeof referrerSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type LandingContentInput = z.infer<typeof landingContentSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type AdminUserInput = z.infer<typeof adminUserSchema>;

// Validation utilities
export interface ValidationResult<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  errors: string[];
}

export type ValidateResult<T> = ValidationResult<T> | ValidationError;

export function validateEntity<T>(schema: z.ZodSchema<T>, data: unknown): ValidateResult<T> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error']
    };
  }
}

export function safeValidateEntity<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = validateEntity(schema, data);
  return result.success ? result.data : null;
}