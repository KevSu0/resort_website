import { z } from 'zod';

// System configuration schema
export const systemConfigSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteDescription: z.string().max(500).optional(),
  timezone: z.string().min(1),
  currency: z.string().length(3),
  dateFormat: z.string().min(1),
  timeFormat: z.enum(['12h', '24h']),
  language: z.string().length(2),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  enableRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(true),
  sessionTimeout: z.number().min(5).max(1440).default(30), // minutes
  maxLoginAttempts: z.number().min(3).max(10).default(5),
  lockoutDuration: z.number().min(1).max(60).default(15), // minutes
  enableTwoFactorAuth: z.boolean().default(false),
  backupRetention: z.number().min(1).max(365).default(30), // days
  enableAuditLog: z.boolean().default(true),
  auditRetention: z.number().min(1).max(365).default(90), // days
});

// Property configuration schema
export const propertyConfigSchema = z.object({
  propertyId: z.string().cuid(),
  checkInTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  checkOutTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  minStay: z.number().min(1).max(30).default(1),
  maxStay: z.number().min(1).max(365).default(30),
  advanceBookingDays: z.number().min(1).max(365).default(365),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT', 'SUPER_STRICT', 'CUSTOM']),
  cancellationHours: z.number().min(0).max(168).default(24),
  paymentPolicy: z.enum(['FULL_PAYMENT', 'PARTIAL_PAYMENT', 'DEPOSIT']),
  depositPercentage: z.number().min(0).max(100).default(20),
  depositDays: z.number().min(0).max(30).default(7),
  taxRates: z.array(z.object({
    name: z.string().min(1),
    rate: z.number().min(0).max(100),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    applicable: z.enum(['ALL', 'ACCOMMODATION', 'SERVICES']),
  })).default([]),
  amenities: z.array(z.string()).default([]),
  policies: z.array(z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(['GENERAL', 'PAYMENT', 'CANCELLATION', 'HOUSE_RULES']),
  })).default([]),
  customFields: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
  })).default([]),
});

// Booking configuration schema
export const bookingConfigSchema = z.object({
  enableInstantBooking: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  autoConfirmMinutes: z.number().min(0).max(1440).default(0),
  enableWaitlist: z.boolean().default(true),
  waitlistLimit: z.number().min(1).max(1000).default(50),
  enableGroupBookings: z.boolean().default(true),
  maxGroupSize: z.number().min(2).max(100).default(10),
  enableModifications: z.boolean().default(true),
  modificationPolicy: z.enum(['FREE', 'CHARGEABLE', 'RESTRICTED']).default('FREE'),
  modificationHours: z.number().min(0).max(168).default(24),
  enableExtensions: z.boolean().default(true),
  extensionPolicy: z.enum(['FREE', 'CHARGEABLE', 'SUBJECT_TO_AVAILABILITY']).default('SUBJECT_TO_AVAILABILITY'),
  paymentMethods: z.array(z.enum([
    'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH',
    'CHECK', 'CRYPTO', 'MOBILE_PAYMENT', 'VOUCHER', 'POINTS'
  ])).default(['CREDIT_CARD', 'BANK_TRANSFER']),
  paymentGateways: z.array(z.object({
    name: z.string().min(1),
    enabled: z.boolean().default(true),
    config: z.record(z.any()),
  })).default([]),
  autoPayments: z.boolean().default(false),
  paymentReminders: z.array(z.object({
    days: z.number().min(1).max(90),
    type: z.enum(['EMAIL', 'SMS', 'BOTH']),
  })).default([]),
});

// Notification configuration schema
export const notificationConfigSchema = z.object({
  email: z.object({
    enabled: z.boolean().default(true),
    provider: z.enum(['SMTP', 'SENDGRID', 'AWS_SES', 'MAILGUN']).default('SMTP'),
    config: z.record(z.any()),
    templates: z.record(z.string()).optional(),
  }),
  sms: z.object({
    enabled: z.boolean().default(false),
    provider: z.enum(['TWILIO', 'AWS_SNS', 'PLIVO', 'MESSAGEBIRD']).default('TWILIO'),
    config: z.record(z.any()),
    templates: z.record(z.string()).optional(),
  }),
  push: z.object({
    enabled: z.boolean().default(false),
    provider: z.enum(['FCM', 'APNS', 'ONESIGNAL']).default('FCM'),
    config: z.record(z.any()),
  }),
  notifications: z.array(z.object({
    type: z.enum([
      'BOOKING_CONFIRMATION', 'BOOKING_REMINDER', 'PAYMENT_CONFIRMATION',
      'PAYMENT_FAILED', 'CANCELLATION_CONFIRMATION', 'CHECKIN_REMINDER',
      'CHECKOUT_REMINDER', 'POST_STAY_REVIEW', 'WAITLIST_AVAILABLE', 'MARKETING'
    ]),
    enabled: z.boolean().default(true),
    channels: z.array(z.enum(['EMAIL', 'SMS', 'PUSH', 'WHATSAPP'])),
    timing: z.object({
      before: z.number().optional(), // hours before event
      after: z.number().optional(),  // hours after event
      immediate: z.boolean().default(false),
    }).optional(),
  })).default([]),
  rateLimiting: z.object({
    enabled: z.boolean().default(true),
    emailsPerHour: z.number().min(1).max(1000).default(100),
    smsPerHour: z.number().min(1).max(500).default(50),
    pushPerHour: z.number().min(1).max(1000).default(200),
  }).default({}),
});

// Integration configuration schema
export const integrationConfigSchema = z.object({
  crm: z.object({
    enabled: z.boolean().default(false),
    provider: z.enum(['SALESFORCE', 'HUBSPOT', 'PIPEDRIVE', 'ZENDESK']),
    config: z.record(z.any()),
    syncFields: z.array(z.string()).default([]),
    autoSync: z.boolean().default(false),
    syncInterval: z.number().min(1).max(1440).default(60), // minutes
  }),
  accounting: z.object({
    enabled: z.boolean().default(false),
    provider: z.enum(['QUICKBOOKS', 'XERO', 'WAVE', 'FRESHBOOKS']),
    config: z.record(z.any()),
    exportFormat: z.enum(['CSV', 'JSON', 'XML']).default('CSV'),
    autoExport: z.boolean().default(false),
    exportInterval: z.number().min(1).max(1440).default(1440), // minutes
  }),
  channelManager: z.object({
    enabled: z.boolean().default(false),
    provider: z.enum(['STRAIGHT', 'SITEWIZARD', 'RATETIGER', 'YIELDPlanet']),
    config: z.record(z.any()),
    autoSyncRates: z.boolean().default(true),
    autoSyncAvailability: z.boolean().default(true),
    syncInterval: z.number().min(1).max(60).default(15), // minutes
  }),
  reviewPlatforms: z.array(z.object({
    enabled: z.boolean().default(false),
    provider: z.enum(['TRIPADVISOR', 'GOOGLE', 'BOOKING_DOT_COM', 'EXPEDIA']),
    config: z.record(z.any()),
    autoRespond: z.boolean().default(false),
    responseTemplate: z.string().optional(),
  })).default([]),
  analytics: z.object({
    enabled: z.boolean().default(true),
    providers: z.array(z.object({
      name: z.string().min(1),
      provider: z.enum(['GOOGLE_ANALYTICS', 'MIXPANEL', 'AMPLITUTE', 'SEGMENT']),
      config: z.record(z.any()),
      trackingEvents: z.array(z.string()).default([]),
    })).default([]),
  }),
});

// Feature flag schema
export const featureFlagSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  enabled: z.boolean().default(false),
  type: z.enum(['BOOLEAN', 'PERCENTAGE', 'CONDITIONAL']).default('BOOLEAN'),
  percentage: z.number().min(0).max(100).optional(),
  conditions: z.array(z.object({
    field: z.string().min(1),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in']),
    value: z.any(),
  })).optional(),
  rolloutStrategy: z.enum(['ALL_USERS', 'PERCENTAGE', 'USER_LIST', 'CONDITION_BASED']).default('ALL_USERS'),
  targetUsers: z.array(z.string()).optional(),
  environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'ALL']).default('ALL'),
  expiresAt: z.date().optional(),
});

// Configuration template schema
export const configTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  type: z.enum(['SYSTEM', 'PROPERTY', 'BOOKING', 'NOTIFICATION', 'INTEGRATION']),
  config: z.record(z.any()),
  version: z.string().default('1.0.0'),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
});

// Configuration history/rollback schema
export const configHistorySchema = z.object({
  configType: z.enum(['SYSTEM', 'PROPERTY', 'BOOKING', 'NOTIFICATION', 'INTEGRATION']),
  configId: z.string().optional(),
  oldValue: z.record(z.any()),
  newValue: z.record(z.any()),
  changedBy: z.string().optional(),
  changeReason: z.string().optional(),
  rollbackAllowed: z.boolean().default(true),
});

// Export types
export type SystemConfig = z.infer<typeof systemConfigSchema>;
export type PropertyConfig = z.infer<typeof propertyConfigSchema>;
export type BookingConfig = z.infer<typeof bookingConfigSchema>;
export type NotificationConfig = z.infer<typeof notificationConfigSchema>;
export type IntegrationConfig = z.infer<typeof integrationConfigSchema>;
export type FeatureFlag = z.infer<typeof featureFlagSchema>;
export type ConfigTemplate = z.infer<typeof configTemplateSchema>;
export type ConfigHistory = z.infer<typeof configHistorySchema>;

// Configuration validation schemas for API endpoints
export const updateSystemConfigSchema = systemConfigSchema.partial();
export const updatePropertyConfigSchema = propertyConfigSchema.partial();
export const updateBookingConfigSchema = bookingConfigSchema.partial();
export const updateNotificationConfigSchema = notificationConfigSchema.partial();
export const updateIntegrationConfigSchema = integrationConfigSchema.partial();
export const updateFeatureFlagSchema = featureFlagSchema.partial();
export const createConfigTemplateSchema = configTemplateSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateConfigTemplateSchema = configTemplateSchema.partial();
export const rollbackConfigSchema = z.object({
  historyId: z.string().cuid(),
  reason: z.string().optional(),
});