-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESORT', 'HOTEL', 'VILLA', 'APARTMENT', 'COTTAGE', 'SUITE', 'STUDIO', 'PENTHOUSE', 'CABIN', 'LODGE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'LIMITED', 'BLOCKED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('STANDARD', 'SEASONAL', 'PROMOTIONAL', 'WEEKEND', 'HOLIDAY', 'CORPORATE');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'ARCHIVED', 'LOST', 'HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('DIRECT', 'WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'SOCIAL_MEDIA', 'SEARCH_ENGINE', 'PAID_ADVERTISING', 'PARTNER', 'EVENT', 'WALK_IN');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NOTE', 'PHONE_CALL', 'EMAIL', 'SMS', 'MEETING', 'QUOTE_SENT', 'FOLLOW_UP', 'REMINDER', 'STATUS_CHANGE', 'ASSIGNMENT');

-- CreateEnum
CREATE TYPE "ActivityOutcome" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'NO_ANSWER', 'LEFT_MESSAGE', 'CALLBACK_REQUESTED', 'NOT_INTERESTED', 'QUOTE_REQUESTED', 'BOOKING_CONFIRMED');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'DOWN');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'BRAND_ADMIN', 'SITE_ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PageVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED');

-- CreateEnum
CREATE TYPE "VersionEntityType" AS ENUM ('PAGE', 'CONTENT_BLOCK', 'NAVIGATION', 'MEDIA');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WorkflowEntityType" AS ENUM ('PAGE', 'CONTENT_BLOCK');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ConfigCategory" AS ENUM ('PROPERTY_SETUP', 'PRICING_RULES', 'AVAILABILITY_RULES', 'AMENITIES', 'POLICIES', 'RESTRICTIONS', 'CHECKIN_CHECKOUT', 'HOUSEKEEPING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "BookingConfigCategory" AS ENUM ('BOOKING_RULES', 'PAYMENT_SETTINGS', 'CANCELLATION_POLICIES', 'MODIFICATION_RULES', 'CONFIRMATION_SETTINGS', 'NOTIFICATION_CONFIGS', 'CHANNEL_MANAGEMENT', 'RATE_MANAGEMENT', 'DISCOUNT_RULES', 'TAX_CONFIGURATIONS');

-- CreateEnum
CREATE TYPE "OperationalCategory" AS ENUM ('HOUSEKEEPING', 'MAINTENANCE', 'FRONT_DESK', 'SECURITY', 'FOOD_BEVERAGE', 'RECREATION', 'TRANSPORTATION', 'HOUSEKEEPING_SCHEDULES', 'MAINTENANCE_SCHEDULES', 'STAFF_MANAGEMENT', 'INVENTORY_MANAGEMENT');

-- CreateEnum
CREATE TYPE "GuestExperienceCategory" AS ENUM ('CHECKIN_EXPERIENCE', 'ROOM_FEATURES', 'SERVICE_OFFERINGS', 'ENTERTAINMENT', 'DINING_OPTIONS', 'WELLNESS_SERVICES', 'CONCIERGE_SERVICES', 'LOYALTY_PROGRAM', 'PERSONALIZATION', 'ACCESSIBILITY', 'LANGUAGE_PREFERENCES');

-- CreateEnum
CREATE TYPE "SnapshotType" AS ENUM ('MANUAL', 'SCHEDULED', 'PRE_DEPLOYMENT', 'POST_DEPLOYMENT', 'EMERGENCY', 'MIGRATION');

-- CreateEnum
CREATE TYPE "SnapshotStatus" AS ENUM ('CREATING', 'COMPLETED', 'FAILED', 'EXPIRED', 'DELETING', 'CORRUPTED');

-- CreateEnum
CREATE TYPE "RestoreType" AS ENUM ('FULL', 'PARTIAL', 'PROPERTY_SPECIFIC', 'CATEGORY_SPECIFIC');

-- CreateEnum
CREATE TYPE "ConflictStrategy" AS ENUM ('SNAPSHOT_WINS', 'CURRENT_WINS', 'MANUAL_RESOLVE', 'MERGE');

-- CreateEnum
CREATE TYPE "RestoreStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'PARTIAL_SUCCESS', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "ConfigAuditType" AS ENUM ('BRAND_SETTING', 'SITE_SETTING', 'PROPERTY_CONFIG', 'BOOKING_CONFIG', 'OPERATIONAL_CONFIG', 'GUEST_EXPERIENCE_CONFIG', 'CONFIG_SNAPSHOT', 'CONFIG_TEMPLATE');

-- CreateEnum
CREATE TYPE "ConfigAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'BULK_CREATE', 'BULK_UPDATE', 'BULK_DELETE', 'IMPORT', 'EXPORT');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('APPLICATION', 'DATABASE', 'CACHE', 'QUEUE', 'SEARCH', 'STORAGE', 'NETWORK', 'SECURITY', 'MONITORING', 'BACKUP', 'EXTERNAL_API', 'INFRASTRUCTURE');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- CreateEnum
CREATE TYPE "LogCategory" AS ENUM ('APPLICATION', 'DATABASE', 'AUTHENTICATION', 'AUTHORIZATION', 'API', 'BACKGROUND_JOBS', 'CACHE', 'EMAIL', 'SMS', 'PAYMENT', 'BOOKING', 'MAINTENANCE', 'MONITORING', 'SECURITY', 'PERFORMANCE', 'ERROR', 'AUDIT', 'SYSTEM', 'NETWORK', 'STORAGE', 'BACKUP', 'MIGRATION');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('HEALTH_CHECK_FAILED', 'HIGH_CPU_USAGE', 'HIGH_MEMORY_USAGE', 'HIGH_DISK_USAGE', 'NETWORK_LATENCY_HIGH', 'DATABASE_CONNECTIONS_HIGH', 'ERROR_RATE_HIGH', 'RESPONSE_TIME_HIGH', 'SERVICE_UNAVAILABLE', 'CACHE_HIT_RATE_LOW', 'QUEUE_SIZE_HIGH', 'BACKUP_FAILED', 'MAINTENANCE_REQUIRED', 'SECURITY_BREACH', 'ANOMALY_DETECTED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('GENERAL', 'DATABASE', 'BACKUP', 'SECURITY', 'PERFORMANCE', 'CLEANUP', 'MONITORING', 'INFRASTRUCTURE', 'APPLICATION', 'API', 'CACHE', 'QUEUE', 'STORAGE', 'NETWORK', 'SECURITY_PATCH', 'SYSTEM_UPDATE', 'LOG_ROTATION', 'DATA_ARCHIVAL', 'INDEX_REBUILD');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('SCHEDULED', 'MANUAL', 'EMERGENCY', 'REACTIVE', 'PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'AUTOMATED');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED', 'SKIPPED', 'RETRYING', 'APPROVAL_REQUIRED', 'APPROVED', 'REJECTED', 'EXPIRED', 'DISABLED');

-- CreateEnum
CREATE TYPE "MaintenanceExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT', 'SKIPPED', 'ROLLBACK_SUCCESSFUL', 'ROLLBACK_FAILED');

-- CreateEnum
CREATE TYPE "ExecutionTriggerType" AS ENUM ('SCHEDULED', 'MANUAL', 'API', 'WEBHOOK', 'DEPENDENCY', 'ALERT', 'SYSTEM_EVENT', 'RETRY');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MaintenanceImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "OperationalMetricCategory" AS ENUM ('GENERAL', 'BOOKING', 'REVENUE', 'GUEST_SERVICE', 'PROPERTY', 'STAFF', 'SERVICE', 'SYSTEM', 'FACILITY', 'EQUIPMENT', 'MAINTENANCE', 'SECURITY', 'COMPLIANCE', 'QUALITY', 'EFFICIENCY');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('REALTIME', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "GuestServiceType" AS ENUM ('GENERAL', 'CHECKIN', 'CHECKOUT', 'HOUSEKEEPING', 'ROOM_SERVICE', 'CONCIERGE', 'RESTAURANT', 'SPA', 'TRANSPORTATION', 'ENTERTAINMENT', 'MAINTENANCE_REQUEST', 'COMPLAINT', 'INFORMATION', 'RESERVATION', 'PAYMENT', 'SUPPORT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "AnomalyMetricType" AS ENUM ('PERFORMANCE', 'AVAILABILITY', 'SECURITY', 'BUSINESS', 'OPERATIONAL', 'SYSTEM', 'NETWORK', 'DATABASE', 'APPLICATION', 'USER_BEHAVIOR', 'REVENUE', 'BOOKING', 'GUEST_SATISFACTION', 'STAFF_PERFORMANCE');

-- CreateEnum
CREATE TYPE "AnomalyType" AS ENUM ('SPIKE', 'DROP', 'TREND', 'OUTLIER', 'PATTERN', 'CORRELATION', 'THRESHOLD', 'MISSING_DATA', 'STAGNATION', 'VOLATILITY', 'SEASONAL', 'DRIFT', 'BURST');

-- CreateEnum
CREATE TYPE "AnomalySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AnomalyStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_POSITIVE', 'INVESTIGATING', 'SUPPRESSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MaintenanceNotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT', 'REMINDER', 'SCHEDULED', 'COMPLETED', 'FAILED', 'APPROVAL_REQUIRED', 'APPROVED', 'REJECTED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "MaintenanceNotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'SLACK', 'TEAMS', 'DISCORD', 'IN_APP');

-- CreateEnum
CREATE TYPE "MaintenanceNotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED', 'RETRYING');

-- CreateEnum
CREATE TYPE "MaintenanceNotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT DEFAULT '#000000',
    "secondaryColor" TEXT DEFAULT '#ffffff',
    "accentColor" TEXT,
    "domain" TEXT,
    "subdomain" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "subdomain" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" JSONB,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordHash" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "preferences" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT NOT NULL,
    "siteIds" TEXT[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "template" TEXT,
    "layout" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "PageVisibility" NOT NULL DEFAULT 'PUBLIC',
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "pageId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "configuration" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "container" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT,
    "structure" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "navigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_items" (
    "id" TEXT NOT NULL,
    "navigationId" TEXT NOT NULL,
    "pageId" TEXT,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "target" TEXT NOT NULL DEFAULT '_self',
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "folder" TEXT,
    "url" TEXT NOT NULL,
    "thumbnails" JSONB,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "VersionEntityType" NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "changes" JSONB,
    "authorId" TEXT NOT NULL,
    "message" TEXT,
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[],
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT NOT NULL DEFAULT 'website',
    "twitterCard" TEXT NOT NULL DEFAULT 'summary_large_image',
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,
    "canonicalUrl" TEXT,
    "robots" TEXT DEFAULT 'index, follow',
    "structuredData" JSONB,
    "customMeta" JSONB,
    "lastReviewed" TIMESTAMP(3),
    "reviewScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_items" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "WorkflowEntityType" NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'PENDING',
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "workflowItemId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "assignedToId" TEXT,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "comments" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_settings" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT,
    "validation" JSONB,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT,
    "validation" JSONB,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "inheritsFrom" TEXT,
    "isOverridden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_configs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "propertyId" TEXT,
    "category" "ConfigCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validation" JSONB,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "appliesTo" TEXT[],
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_configs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "category" "BookingConfigCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validation" JSONB,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "channel" TEXT,
    "propertyType" TEXT,
    "minStay" INTEGER,
    "maxStay" INTEGER,
    "guestSegment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_configs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "category" "OperationalCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validation" JSONB,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "schedule" JSONB,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_experience_configs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "category" "GuestExperienceCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validation" JSONB,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "guestSegment" TEXT,
    "propertyType" TEXT,
    "season" TEXT,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_experience_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "siteId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_snapshots" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SnapshotType" NOT NULL DEFAULT 'MANUAL',
    "status" "SnapshotStatus" NOT NULL DEFAULT 'CREATING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "brandSettings" JSONB,
    "siteSettings" JSONB,
    "propertyConfigs" JSONB,
    "bookingConfigs" JSONB,
    "operationalConfigs" JSONB,
    "guestExperienceConfigs" JSONB,
    "createdBy" TEXT,
    "backupReason" TEXT,
    "tags" TEXT[],
    "checksum" TEXT,
    "compressedSize" INTEGER,
    "uncompressedSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "config_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshot_restores" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "restoredBy" TEXT,
    "restoreType" "RestoreType" NOT NULL DEFAULT 'FULL',
    "selectedConfigs" JSONB,
    "conflictStrategy" "ConflictStrategy" NOT NULL DEFAULT 'SNAPSHOT_WINS',
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "status" "RestoreStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "itemsRestored" INTEGER NOT NULL DEFAULT 0,
    "itemsSkipped" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "snapshot_restores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_templates" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configData" JSONB NOT NULL,
    "variables" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_template_usage" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "appliedBy" TEXT,
    "variables" JSONB,
    "configType" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "config_template_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_audit_logs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "configType" "ConfigAuditType" NOT NULL,
    "configId" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "action" "ConfigAction" NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedFields" JSONB,
    "version" INTEGER,
    "newVersion" INTEGER,
    "userId" TEXT,
    "sessionId" TEXT,
    "reason" TEXT,
    "source" TEXT,
    "batchId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "snapshotId" TEXT,
    "templateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "config_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "category" TEXT NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "capacity" INTEGER NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "address" JSONB NOT NULL,
    "coordinates" JSONB,
    "images" TEXT[],
    "amenities" TEXT[],
    "policies" JSONB,
    "checkInTime" TEXT NOT NULL DEFAULT '15:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '11:00',
    "minStay" INTEGER NOT NULL DEFAULT 1,
    "maxStay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "size" INTEGER,
    "bedType" TEXT,
    "amenities" TEXT[],
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "priceOverride" DECIMAL(65,30),
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT,
    "name" TEXT NOT NULL,
    "type" "PricingType" NOT NULL DEFAULT 'STANDARD',
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "season" TEXT,
    "minStay" INTEGER,
    "maxStay" INTEGER,
    "dayOfWeek" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_interests" (
    "id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerNationality" TEXT,
    "customerCountry" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 0,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "totalGuests" INTEGER NOT NULL,
    "budget" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "specialRequests" TEXT,
    "status" "InterestStatus" NOT NULL DEFAULT 'NEW',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "source" "LeadSource" NOT NULL DEFAULT 'DIRECT',
    "campaign" TEXT,
    "assignedTo" TEXT,
    "adminNotes" TEXT,
    "lastContactedAt" TIMESTAMP(3),
    "followUpScheduled" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "estimatedValue" DECIMAL(10,2),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,

    CONSTRAINT "booking_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_interest_activities" (
    "id" TEXT NOT NULL,
    "bookingInterestId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL DEFAULT 'NOTE',
    "action" TEXT NOT NULL,
    "description" TEXT,
    "performedBy" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "outcome" "ActivityOutcome",
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "booking_interest_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "response" TEXT,
    "respondedBy" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_views" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "service" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL DEFAULT 'APPLICATION',
    "instance" TEXT,
    "environment" TEXT,
    "region" TEXT,
    "status" "HealthStatus" NOT NULL DEFAULT 'HEALTHY',
    "responseTime" INTEGER,
    "cpuUsage" DOUBLE PRECISION,
    "memoryUsage" DOUBLE PRECISION,
    "diskUsage" DOUBLE PRECISION,
    "networkLatency" INTEGER,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextCheckAt" TIMESTAMP(3),
    "checkInterval" INTEGER NOT NULL DEFAULT 300,
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "errorMessage" TEXT,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "lastFailureAt" TIMESTAMP(3),
    "dependencies" TEXT[],
    "dependents" TEXT[],
    "alertThresholds" JSONB,
    "notificationChannels" TEXT[],
    "metadata" JSONB,
    "tags" TEXT[],
    "version" TEXT,
    "buildInfo" JSONB,

    CONSTRAINT "system_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "category" "LogCategory" NOT NULL DEFAULT 'APPLICATION',
    "subcategory" TEXT,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "context" JSONB,
    "correlationId" TEXT,
    "traceId" TEXT,
    "spanId" TEXT,
    "sessionId" TEXT,
    "requestId" TEXT,
    "service" TEXT,
    "component" TEXT,
    "function" TEXT,
    "file" TEXT,
    "line" INTEGER,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "duration" INTEGER,
    "memoryUsage" INTEGER,
    "cpuUsage" DOUBLE PRECISION,
    "errorCode" TEXT,
    "errorType" TEXT,
    "stackTrace" TEXT,
    "cause" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "archivedAt" TIMESTAMP(3),
    "tags" TEXT[],

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_history" (
    "id" TEXT NOT NULL,
    "systemHealthId" TEXT NOT NULL,
    "status" "HealthStatus" NOT NULL,
    "responseTime" INTEGER,
    "cpuUsage" DOUBLE PRECISION,
    "memoryUsage" DOUBLE PRECISION,
    "diskUsage" DOUBLE PRECISION,
    "networkLatency" INTEGER,
    "errorMessage" TEXT,
    "errorCount" INTEGER NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkDuration" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "system_health_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_alerts" (
    "id" TEXT NOT NULL,
    "systemHealthId" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL DEFAULT 'HEALTH_CHECK_FAILED',
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "threshold" JSONB,
    "condition" TEXT,
    "notificationChannels" TEXT[],
    "notificationStatus" JSONB,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastNotifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "escalationLevel" INTEGER NOT NULL DEFAULT 1,
    "escalatedAt" TIMESTAMP(3),

    CONSTRAINT "health_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_jobs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "MaintenanceCategory" NOT NULL DEFAULT 'GENERAL',
    "type" "MaintenanceType" NOT NULL DEFAULT 'SCHEDULED',
    "priority" "MaintenancePriority" NOT NULL DEFAULT 'NORMAL',
    "schedule" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" JSONB,
    "configuration" JSONB NOT NULL,
    "serviceIds" TEXT[],
    "systemHealthId" TEXT,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "averageDuration" INTEGER,
    "dependencies" TEXT[],
    "conditions" JSONB,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryDelay" INTEGER NOT NULL DEFAULT 300,
    "timeout" INTEGER,
    "resourceLimits" JSONB,
    "notificationChannels" TEXT[],
    "notifyOnSuccess" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnTimeout" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceWindow" JSONB,
    "businessHoursOnly" BOOLEAN NOT NULL DEFAULT false,
    "requiresBackup" BOOLEAN NOT NULL DEFAULT false,
    "backupLocation" TEXT,
    "rollbackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rollbackScript" TEXT,
    "metadata" JSONB,
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "maintenance_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_executions" (
    "id" TEXT NOT NULL,
    "maintenanceJobId" TEXT NOT NULL,
    "executionNumber" INTEGER NOT NULL,
    "status" "MaintenanceExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "triggeredBy" TEXT,
    "triggerType" "ExecutionTriggerType" NOT NULL DEFAULT 'SCHEDULED',
    "triggerDetails" JSONB,
    "configuration" JSONB NOT NULL,
    "environment" JSONB,
    "cpuUsage" DOUBLE PRECISION,
    "memoryUsage" INTEGER,
    "diskUsage" INTEGER,
    "networkUsage" INTEGER,
    "result" JSONB,
    "output" TEXT,
    "errorOutput" TEXT,
    "exitCode" INTEGER,
    "exitMessage" TEXT,
    "performance" JSONB,
    "backupCreated" BOOLEAN NOT NULL DEFAULT false,
    "backupLocation" TEXT,
    "rollbackAvailable" BOOLEAN NOT NULL DEFAULT false,
    "rollbackExecuted" BOOLEAN NOT NULL DEFAULT false,
    "rollbackAt" TIMESTAMP(3),
    "retryAttempt" INTEGER NOT NULL DEFAULT 0,
    "retryReason" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "notificationsSent" JSONB,
    "metadata" JSONB,
    "logs" TEXT[],

    CONSTRAINT "maintenance_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_approvals" (
    "id" TEXT NOT NULL,
    "maintenanceJobId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "requiredApprovers" INTEGER NOT NULL DEFAULT 1,
    "currentApprovers" INTEGER NOT NULL DEFAULT 0,
    "approvers" TEXT[],
    "approvalChain" JSONB,
    "criteria" JSONB,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "impact" "MaintenanceImpact" NOT NULL DEFAULT 'LOW',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "comments" TEXT[],

    CONSTRAINT "maintenance_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_notifications" (
    "id" TEXT NOT NULL,
    "maintenanceJobId" TEXT,
    "type" "MaintenanceNotificationType" NOT NULL DEFAULT 'INFO',
    "channel" "MaintenanceNotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "template" TEXT,
    "status" "MaintenanceNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "content" JSONB,
    "attachments" JSONB,
    "context" JSONB,
    "correlationId" TEXT,
    "metadata" JSONB,
    "priority" "MaintenanceNotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_performance" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "service" TEXT,
    "instance" TEXT,
    "environment" TEXT,
    "cpuUsage" DOUBLE PRECISION NOT NULL,
    "cpuCores" INTEGER,
    "cpuLoad" DOUBLE PRECISION,
    "cpuTemp" DOUBLE PRECISION,
    "memoryUsed" INTEGER NOT NULL,
    "memoryTotal" INTEGER NOT NULL,
    "memoryUsage" DOUBLE PRECISION NOT NULL,
    "swapUsed" INTEGER,
    "swapTotal" INTEGER,
    "diskUsed" INTEGER NOT NULL,
    "diskTotal" INTEGER NOT NULL,
    "diskUsage" DOUBLE PRECISION NOT NULL,
    "diskReadOps" INTEGER,
    "diskWriteOps" INTEGER,
    "diskReadBytes" INTEGER,
    "diskWriteBytes" INTEGER,
    "networkRxBytes" INTEGER,
    "networkTxBytes" INTEGER,
    "networkRxPackets" INTEGER,
    "networkTxPackets" INTEGER,
    "networkLatency" INTEGER,
    "activeConnections" INTEGER,
    "requestRate" DOUBLE PRECISION,
    "responseTime" DOUBLE PRECISION,
    "errorRate" DOUBLE PRECISION,
    "dbConnections" INTEGER,
    "dbQueriesPerSecond" DOUBLE PRECISION,
    "dbSlowQueries" INTEGER,
    "dbCacheHitRate" DOUBLE PRECISION,
    "cacheHitRate" DOUBLE PRECISION,
    "cacheSize" INTEGER,
    "cacheEvictions" INTEGER,
    "queueSize" INTEGER,
    "queueProcessingRate" DOUBLE PRECISION,
    "queueErrors" INTEGER,
    "customMetrics" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "system_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resort_operational_metrics" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "propertyId" TEXT,
    "category" "OperationalMetricCategory" NOT NULL DEFAULT 'GENERAL',
    "subcategory" TEXT,
    "totalBookings" INTEGER,
    "activeBookings" INTEGER,
    "pendingBookings" INTEGER,
    "cancelledBookings" INTEGER,
    "bookingRate" DOUBLE PRECISION,
    "occupancyRate" DOUBLE PRECISION,
    "averageStay" DOUBLE PRECISION,
    "totalRevenue" DECIMAL(15,2),
    "dailyRevenue" DECIMAL(15,2),
    "averageBookingValue" DECIMAL(10,2),
    "revenuePerRoom" DECIMAL(10,2),
    "checkInCount" INTEGER,
    "checkOutCount" INTEGER,
    "averageCheckInTime" INTEGER,
    "averageCheckOutTime" INTEGER,
    "guestSatisfactionScore" DOUBLE PRECISION,
    "guestComplaints" INTEGER,
    "guestRequests" INTEGER,
    "responseTime" INTEGER,
    "availableRooms" INTEGER,
    "occupiedRooms" INTEGER,
    "maintenanceRooms" INTEGER,
    "cleaningRooms" INTEGER,
    "roomTurnoverTime" INTEGER,
    "propertyUtilization" DOUBLE PRECISION,
    "staffOnDuty" INTEGER,
    "staffProductivity" DOUBLE PRECISION,
    "staffSatisfaction" DOUBLE PRECISION,
    "restaurantOccupancy" DOUBLE PRECISION,
    "spaUtilization" DOUBLE PRECISION,
    "facilityUsage" JSONB,
    "equipmentStatus" JSONB,
    "systemUptime" DOUBLE PRECISION,
    "systemResponseTime" INTEGER,
    "errorRate" DOUBLE PRECISION,
    "dataProcessingRate" DOUBLE PRECISION,
    "customMetrics" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" "PeriodType" NOT NULL DEFAULT 'HOURLY',
    "tags" TEXT[],
    "metadata" JSONB,
    "dataSource" TEXT,
    "qualityScore" DOUBLE PRECISION,

    CONSTRAINT "resort_operational_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_service_metrics" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "serviceType" "GuestServiceType" NOT NULL DEFAULT 'GENERAL',
    "bookingId" TEXT,
    "guestId" TEXT,
    "serviceStartTime" TIMESTAMP(3) NOT NULL,
    "serviceEndTime" TIMESTAMP(3),
    "responseTime" INTEGER,
    "resolutionTime" INTEGER,
    "waitTime" INTEGER,
    "satisfactionScore" DOUBLE PRECISION,
    "qualityRating" TEXT,
    "complaintsCount" INTEGER NOT NULL DEFAULT 0,
    "complimentsCount" INTEGER NOT NULL DEFAULT 0,
    "serviceCategory" TEXT,
    "serviceLevel" TEXT,
    "staffAssigned" TEXT,
    "department" TEXT,
    "contactsCount" INTEGER NOT NULL DEFAULT 0,
    "responseAccuracy" DOUBLE PRECISION,
    "firstContactResolution" BOOLEAN NOT NULL DEFAULT false,
    "serviceCost" DECIMAL(10,2),
    "laborCost" DECIMAL(10,2),
    "resourceCost" DECIMAL(10,2),
    "feedback" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "tags" TEXT[],

    CONSTRAINT "guest_service_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_anomalies" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "service" TEXT,
    "metricType" "AnomalyMetricType" NOT NULL,
    "metricName" TEXT NOT NULL,
    "anomalyType" "AnomalyType" NOT NULL,
    "severity" "AnomalySeverity" NOT NULL DEFAULT 'MEDIUM',
    "currentValue" DOUBLE PRECISION,
    "expectedValue" DOUBLE PRECISION,
    "threshold" DOUBLE PRECISION,
    "deviation" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "context" JSONB,
    "patterns" JSONB,
    "correlations" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "AnomalyStatus" NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "impactLevel" "ImpactLevel" NOT NULL DEFAULT 'LOW',
    "affectedServices" TEXT[],
    "affectedUsers" INTEGER,
    "autoResponse" BOOLEAN NOT NULL DEFAULT false,
    "responseActions" JSONB,
    "escalationTriggered" BOOLEAN NOT NULL DEFAULT false,
    "falsePositive" BOOLEAN NOT NULL DEFAULT false,
    "feedbackScore" DOUBLE PRECISION,
    "improvementSuggestions" JSONB,
    "metadata" JSONB,
    "tags" TEXT[],

    CONSTRAINT "system_anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "properties" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "brands_domain_key" ON "brands"("domain");

-- CreateIndex
CREATE INDEX "brands_slug_idx" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_domain_idx" ON "brands"("domain");

-- CreateIndex
CREATE INDEX "brands_isActive_idx" ON "brands"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "sites_domain_key" ON "sites"("domain");

-- CreateIndex
CREATE INDEX "sites_brandId_idx" ON "sites"("brandId");

-- CreateIndex
CREATE INDEX "sites_slug_idx" ON "sites"("slug");

-- CreateIndex
CREATE INDEX "sites_isActive_idx" ON "sites"("isActive");

-- CreateIndex
CREATE INDEX "sites_isDefault_idx" ON "sites"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "sites_brandId_slug_key" ON "sites"("brandId", "slug");

-- CreateIndex
CREATE INDEX "site_users_userId_idx" ON "site_users"("userId");

-- CreateIndex
CREATE INDEX "site_users_siteId_idx" ON "site_users"("siteId");

-- CreateIndex
CREATE INDEX "site_users_role_idx" ON "site_users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "site_users_userId_siteId_key" ON "site_users"("userId", "siteId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_brandId_idx" ON "users"("brandId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "sessions_isActive_idx" ON "sessions"("isActive");

-- CreateIndex
CREATE INDEX "pages_siteId_idx" ON "pages"("siteId");

-- CreateIndex
CREATE INDEX "pages_status_idx" ON "pages"("status");

-- CreateIndex
CREATE INDEX "pages_publishedAt_idx" ON "pages"("publishedAt");

-- CreateIndex
CREATE INDEX "pages_parentId_idx" ON "pages"("parentId");

-- CreateIndex
CREATE INDEX "pages_sortOrder_idx" ON "pages"("sortOrder");

-- CreateIndex
CREATE INDEX "pages_siteId_status_slug_idx" ON "pages"("siteId", "status", "slug");

-- CreateIndex
CREATE INDEX "pages_siteId_status_publishedAt_idx" ON "pages"("siteId", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "pages_siteId_visibility_publishedAt_idx" ON "pages"("siteId", "visibility", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "pages_siteId_scheduledFor_status_idx" ON "pages"("siteId", "scheduledFor", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pages_siteId_slug_key" ON "pages"("siteId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_siteId_path_key" ON "pages"("siteId", "path");

-- CreateIndex
CREATE INDEX "content_blocks_siteId_idx" ON "content_blocks"("siteId");

-- CreateIndex
CREATE INDEX "content_blocks_pageId_idx" ON "content_blocks"("pageId");

-- CreateIndex
CREATE INDEX "content_blocks_type_idx" ON "content_blocks"("type");

-- CreateIndex
CREATE INDEX "content_blocks_order_idx" ON "content_blocks"("order");

-- CreateIndex
CREATE INDEX "content_blocks_isActive_idx" ON "content_blocks"("isActive");

-- CreateIndex
CREATE INDEX "content_blocks_siteId_pageId_order_idx" ON "content_blocks"("siteId", "pageId", "order" ASC);

-- CreateIndex
CREATE INDEX "content_blocks_siteId_type_isActive_idx" ON "content_blocks"("siteId", "type", "isActive");

-- CreateIndex
CREATE INDEX "content_blocks_pageId_order_idx" ON "content_blocks"("pageId", "order" ASC);

-- CreateIndex
CREATE INDEX "navigation_siteId_idx" ON "navigation"("siteId");

-- CreateIndex
CREATE INDEX "navigation_isActive_idx" ON "navigation"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "navigation_siteId_handle_key" ON "navigation"("siteId", "handle");

-- CreateIndex
CREATE INDEX "navigation_items_navigationId_idx" ON "navigation_items"("navigationId");

-- CreateIndex
CREATE INDEX "navigation_items_pageId_idx" ON "navigation_items"("pageId");

-- CreateIndex
CREATE INDEX "navigation_items_order_idx" ON "navigation_items"("order");

-- CreateIndex
CREATE INDEX "navigation_items_parentId_idx" ON "navigation_items"("parentId");

-- CreateIndex
CREATE INDEX "navigation_items_isActive_idx" ON "navigation_items"("isActive");

-- CreateIndex
CREATE INDEX "media_siteId_idx" ON "media"("siteId");

-- CreateIndex
CREATE INDEX "media_mimeType_idx" ON "media"("mimeType");

-- CreateIndex
CREATE INDEX "media_folder_idx" ON "media"("folder");

-- CreateIndex
CREATE INDEX "media_isActive_idx" ON "media"("isActive");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- CreateIndex
CREATE INDEX "content_versions_entityId_idx" ON "content_versions"("entityId");

-- CreateIndex
CREATE INDEX "content_versions_entityType_idx" ON "content_versions"("entityType");

-- CreateIndex
CREATE INDEX "content_versions_authorId_idx" ON "content_versions"("authorId");

-- CreateIndex
CREATE INDEX "content_versions_status_idx" ON "content_versions"("status");

-- CreateIndex
CREATE INDEX "content_versions_createdAt_idx" ON "content_versions"("createdAt");

-- CreateIndex
CREATE INDEX "content_versions_entityId_entityType_version_idx" ON "content_versions"("entityId", "entityType", "version" DESC);

-- CreateIndex
CREATE INDEX "content_versions_authorId_createdAt_idx" ON "content_versions"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "content_versions_entityType_status_createdAt_idx" ON "content_versions"("entityType", "status", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "content_versions_entityId_entityType_version_key" ON "content_versions"("entityId", "entityType", "version");

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_pageId_key" ON "seo_metadata"("pageId");

-- CreateIndex
CREATE INDEX "seo_metadata_pageId_idx" ON "seo_metadata"("pageId");

-- CreateIndex
CREATE INDEX "idx_seo_metadata_review_score" ON "seo_metadata"("reviewScore");

-- CreateIndex
CREATE INDEX "idx_seo_metadata_last_reviewed" ON "seo_metadata"("lastReviewed");

-- CreateIndex
CREATE INDEX "idx_seo_metadata_review_score_desc" ON "seo_metadata"("reviewScore" DESC);

-- CreateIndex
CREATE INDEX "idx_seo_metadata_last_reviewed_desc" ON "seo_metadata"("lastReviewed" DESC);

-- CreateIndex
CREATE INDEX "workflows_siteId_idx" ON "workflows"("siteId");

-- CreateIndex
CREATE INDEX "workflows_isActive_idx" ON "workflows"("isActive");

-- CreateIndex
CREATE INDEX "workflow_items_workflowId_idx" ON "workflow_items"("workflowId");

-- CreateIndex
CREATE INDEX "workflow_items_entityId_idx" ON "workflow_items"("entityId");

-- CreateIndex
CREATE INDEX "workflow_items_status_idx" ON "workflow_items"("status");

-- CreateIndex
CREATE INDEX "workflow_items_createdAt_idx" ON "workflow_items"("createdAt");

-- CreateIndex
CREATE INDEX "workflow_steps_workflowItemId_idx" ON "workflow_steps"("workflowItemId");

-- CreateIndex
CREATE INDEX "workflow_steps_assignedToId_idx" ON "workflow_steps"("assignedToId");

-- CreateIndex
CREATE INDEX "workflow_steps_status_idx" ON "workflow_steps"("status");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_steps_workflowItemId_stepNumber_key" ON "workflow_steps"("workflowItemId", "stepNumber");

-- CreateIndex
CREATE INDEX "brand_settings_brandId_idx" ON "brand_settings"("brandId");

-- CreateIndex
CREATE INDEX "brand_settings_key_idx" ON "brand_settings"("key");

-- CreateIndex
CREATE INDEX "brand_settings_isPublic_idx" ON "brand_settings"("isPublic");

-- CreateIndex
CREATE INDEX "brand_settings_category_idx" ON "brand_settings"("category");

-- CreateIndex
CREATE INDEX "brand_settings_version_idx" ON "brand_settings"("version");

-- CreateIndex
CREATE UNIQUE INDEX "brand_settings_brandId_key_key" ON "brand_settings"("brandId", "key");

-- CreateIndex
CREATE INDEX "site_settings_siteId_idx" ON "site_settings"("siteId");

-- CreateIndex
CREATE INDEX "site_settings_key_idx" ON "site_settings"("key");

-- CreateIndex
CREATE INDEX "site_settings_isPublic_idx" ON "site_settings"("isPublic");

-- CreateIndex
CREATE INDEX "site_settings_category_idx" ON "site_settings"("category");

-- CreateIndex
CREATE INDEX "site_settings_version_idx" ON "site_settings"("version");

-- CreateIndex
CREATE INDEX "site_settings_inheritsFrom_idx" ON "site_settings"("inheritsFrom");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_siteId_key_key" ON "site_settings"("siteId", "key");

-- CreateIndex
CREATE INDEX "property_configs_siteId_idx" ON "property_configs"("siteId");

-- CreateIndex
CREATE INDEX "property_configs_propertyId_idx" ON "property_configs"("propertyId");

-- CreateIndex
CREATE INDEX "property_configs_category_idx" ON "property_configs"("category");

-- CreateIndex
CREATE INDEX "property_configs_key_idx" ON "property_configs"("key");

-- CreateIndex
CREATE INDEX "property_configs_version_idx" ON "property_configs"("version");

-- CreateIndex
CREATE INDEX "property_configs_isActive_idx" ON "property_configs"("isActive");

-- CreateIndex
CREATE INDEX "property_configs_priority_idx" ON "property_configs"("priority");

-- CreateIndex
CREATE INDEX "property_configs_effectiveFrom_effectiveTo_idx" ON "property_configs"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "property_configs_siteId_category_isActive_idx" ON "property_configs"("siteId", "category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "property_configs_siteId_propertyId_category_key_key" ON "property_configs"("siteId", "propertyId", "category", "key");

-- CreateIndex
CREATE INDEX "booking_configs_siteId_idx" ON "booking_configs"("siteId");

-- CreateIndex
CREATE INDEX "booking_configs_category_idx" ON "booking_configs"("category");

-- CreateIndex
CREATE INDEX "booking_configs_key_idx" ON "booking_configs"("key");

-- CreateIndex
CREATE INDEX "booking_configs_version_idx" ON "booking_configs"("version");

-- CreateIndex
CREATE INDEX "booking_configs_isActive_idx" ON "booking_configs"("isActive");

-- CreateIndex
CREATE INDEX "booking_configs_channel_idx" ON "booking_configs"("channel");

-- CreateIndex
CREATE INDEX "booking_configs_propertyType_idx" ON "booking_configs"("propertyType");

-- CreateIndex
CREATE INDEX "booking_configs_guestSegment_idx" ON "booking_configs"("guestSegment");

-- CreateIndex
CREATE INDEX "booking_configs_siteId_category_isActive_idx" ON "booking_configs"("siteId", "category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "booking_configs_siteId_category_key_key" ON "booking_configs"("siteId", "category", "key");

-- CreateIndex
CREATE INDEX "operational_configs_siteId_idx" ON "operational_configs"("siteId");

-- CreateIndex
CREATE INDEX "operational_configs_department_idx" ON "operational_configs"("department");

-- CreateIndex
CREATE INDEX "operational_configs_category_idx" ON "operational_configs"("category");

-- CreateIndex
CREATE INDEX "operational_configs_key_idx" ON "operational_configs"("key");

-- CreateIndex
CREATE INDEX "operational_configs_version_idx" ON "operational_configs"("version");

-- CreateIndex
CREATE INDEX "operational_configs_isActive_idx" ON "operational_configs"("isActive");

-- CreateIndex
CREATE INDEX "operational_configs_priority_idx" ON "operational_configs"("priority");

-- CreateIndex
CREATE INDEX "operational_configs_location_idx" ON "operational_configs"("location");

-- CreateIndex
CREATE INDEX "operational_configs_siteId_department_isActive_idx" ON "operational_configs"("siteId", "department", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "operational_configs_siteId_department_category_key_key" ON "operational_configs"("siteId", "department", "category", "key");

-- CreateIndex
CREATE INDEX "guest_experience_configs_siteId_idx" ON "guest_experience_configs"("siteId");

-- CreateIndex
CREATE INDEX "guest_experience_configs_category_idx" ON "guest_experience_configs"("category");

-- CreateIndex
CREATE INDEX "guest_experience_configs_key_idx" ON "guest_experience_configs"("key");

-- CreateIndex
CREATE INDEX "guest_experience_configs_version_idx" ON "guest_experience_configs"("version");

-- CreateIndex
CREATE INDEX "guest_experience_configs_isActive_idx" ON "guest_experience_configs"("isActive");

-- CreateIndex
CREATE INDEX "guest_experience_configs_guestSegment_idx" ON "guest_experience_configs"("guestSegment");

-- CreateIndex
CREATE INDEX "guest_experience_configs_propertyType_idx" ON "guest_experience_configs"("propertyType");

-- CreateIndex
CREATE INDEX "guest_experience_configs_season_idx" ON "guest_experience_configs"("season");

-- CreateIndex
CREATE INDEX "guest_experience_configs_language_idx" ON "guest_experience_configs"("language");

-- CreateIndex
CREATE INDEX "guest_experience_configs_siteId_category_isActive_idx" ON "guest_experience_configs"("siteId", "category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "guest_experience_configs_siteId_category_key_key" ON "guest_experience_configs"("siteId", "category", "key");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_siteId_idx" ON "audit_logs"("siteId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_idx" ON "audit_logs"("resourceType");

-- CreateIndex
CREATE INDEX "audit_logs_resourceId_idx" ON "audit_logs"("resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "config_snapshots_siteId_idx" ON "config_snapshots"("siteId");

-- CreateIndex
CREATE INDEX "config_snapshots_type_idx" ON "config_snapshots"("type");

-- CreateIndex
CREATE INDEX "config_snapshots_status_idx" ON "config_snapshots"("status");

-- CreateIndex
CREATE INDEX "config_snapshots_createdBy_idx" ON "config_snapshots"("createdBy");

-- CreateIndex
CREATE INDEX "config_snapshots_createdAt_idx" ON "config_snapshots"("createdAt");

-- CreateIndex
CREATE INDEX "config_snapshots_expiresAt_idx" ON "config_snapshots"("expiresAt");

-- CreateIndex
CREATE INDEX "config_snapshots_siteId_createdAt_idx" ON "config_snapshots"("siteId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "config_snapshots_siteId_type_status_idx" ON "config_snapshots"("siteId", "type", "status");

-- CreateIndex
CREATE INDEX "config_snapshots_checksum_idx" ON "config_snapshots"("checksum");

-- CreateIndex
CREATE UNIQUE INDEX "config_snapshots_siteId_name_version_key" ON "config_snapshots"("siteId", "name", "version");

-- CreateIndex
CREATE INDEX "snapshot_restores_snapshotId_idx" ON "snapshot_restores"("snapshotId");

-- CreateIndex
CREATE INDEX "snapshot_restores_siteId_idx" ON "snapshot_restores"("siteId");

-- CreateIndex
CREATE INDEX "snapshot_restores_restoredBy_idx" ON "snapshot_restores"("restoredBy");

-- CreateIndex
CREATE INDEX "snapshot_restores_status_idx" ON "snapshot_restores"("status");

-- CreateIndex
CREATE INDEX "snapshot_restores_startedAt_idx" ON "snapshot_restores"("startedAt");

-- CreateIndex
CREATE INDEX "snapshot_restores_completedAt_idx" ON "snapshot_restores"("completedAt");

-- CreateIndex
CREATE INDEX "config_templates_siteId_idx" ON "config_templates"("siteId");

-- CreateIndex
CREATE INDEX "config_templates_category_idx" ON "config_templates"("category");

-- CreateIndex
CREATE INDEX "config_templates_isPublic_idx" ON "config_templates"("isPublic");

-- CreateIndex
CREATE INDEX "config_templates_isActive_idx" ON "config_templates"("isActive");

-- CreateIndex
CREATE INDEX "config_templates_usageCount_idx" ON "config_templates"("usageCount");

-- CreateIndex
CREATE INDEX "config_templates_createdAt_idx" ON "config_templates"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "config_templates_siteId_name_version_key" ON "config_templates"("siteId", "name", "version");

-- CreateIndex
CREATE INDEX "config_template_usage_templateId_idx" ON "config_template_usage"("templateId");

-- CreateIndex
CREATE INDEX "config_template_usage_siteId_idx" ON "config_template_usage"("siteId");

-- CreateIndex
CREATE INDEX "config_template_usage_appliedBy_idx" ON "config_template_usage"("appliedBy");

-- CreateIndex
CREATE INDEX "config_template_usage_appliedAt_idx" ON "config_template_usage"("appliedAt");

-- CreateIndex
CREATE INDEX "config_audit_logs_siteId_idx" ON "config_audit_logs"("siteId");

-- CreateIndex
CREATE INDEX "config_audit_logs_configType_idx" ON "config_audit_logs"("configType");

-- CreateIndex
CREATE INDEX "config_audit_logs_configId_idx" ON "config_audit_logs"("configId");

-- CreateIndex
CREATE INDEX "config_audit_logs_configKey_idx" ON "config_audit_logs"("configKey");

-- CreateIndex
CREATE INDEX "config_audit_logs_action_idx" ON "config_audit_logs"("action");

-- CreateIndex
CREATE INDEX "config_audit_logs_userId_idx" ON "config_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "config_audit_logs_createdAt_idx" ON "config_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "config_audit_logs_batchId_idx" ON "config_audit_logs"("batchId");

-- CreateIndex
CREATE INDEX "config_audit_logs_snapshotId_idx" ON "config_audit_logs"("snapshotId");

-- CreateIndex
CREATE INDEX "config_audit_logs_templateId_idx" ON "config_audit_logs"("templateId");

-- CreateIndex
CREATE INDEX "config_audit_logs_siteId_configType_createdAt_idx" ON "config_audit_logs"("siteId", "configType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "config_audit_logs_configId_createdAt_idx" ON "config_audit_logs"("configId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "config_audit_logs_userId_createdAt_idx" ON "config_audit_logs"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "config_audit_logs_action_createdAt_idx" ON "config_audit_logs"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "properties_siteId_idx" ON "properties"("siteId");

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "properties"("type");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_isActive_idx" ON "properties"("isActive");

-- CreateIndex
CREATE INDEX "properties_capacity_idx" ON "properties"("capacity");

-- CreateIndex
CREATE INDEX "properties_basePrice_idx" ON "properties"("basePrice");

-- CreateIndex
CREATE INDEX "rooms_propertyId_idx" ON "rooms"("propertyId");

-- CreateIndex
CREATE INDEX "rooms_type_idx" ON "rooms"("type");

-- CreateIndex
CREATE INDEX "rooms_capacity_idx" ON "rooms"("capacity");

-- CreateIndex
CREATE INDEX "rooms_isActive_idx" ON "rooms"("isActive");

-- CreateIndex
CREATE INDEX "rooms_sortOrder_idx" ON "rooms"("sortOrder");

-- CreateIndex
CREATE INDEX "availability_propertyId_idx" ON "availability"("propertyId");

-- CreateIndex
CREATE INDEX "availability_roomId_idx" ON "availability"("roomId");

-- CreateIndex
CREATE INDEX "availability_date_idx" ON "availability"("date");

-- CreateIndex
CREATE INDEX "availability_status_idx" ON "availability"("status");

-- CreateIndex
CREATE UNIQUE INDEX "availability_propertyId_roomId_date_key" ON "availability"("propertyId", "roomId", "date");

-- CreateIndex
CREATE INDEX "pricing_propertyId_idx" ON "pricing"("propertyId");

-- CreateIndex
CREATE INDEX "pricing_roomId_idx" ON "pricing"("roomId");

-- CreateIndex
CREATE INDEX "pricing_type_idx" ON "pricing"("type");

-- CreateIndex
CREATE INDEX "pricing_effectiveFrom_idx" ON "pricing"("effectiveFrom");

-- CreateIndex
CREATE INDEX "pricing_effectiveTo_idx" ON "pricing"("effectiveTo");

-- CreateIndex
CREATE INDEX "pricing_isActive_idx" ON "pricing"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "booking_interests_referenceCode_key" ON "booking_interests"("referenceCode");

-- CreateIndex
CREATE INDEX "booking_interests_siteId_idx" ON "booking_interests"("siteId");

-- CreateIndex
CREATE INDEX "booking_interests_referenceCode_idx" ON "booking_interests"("referenceCode");

-- CreateIndex
CREATE INDEX "booking_interests_propertyId_idx" ON "booking_interests"("propertyId");

-- CreateIndex
CREATE INDEX "booking_interests_roomId_idx" ON "booking_interests"("roomId");

-- CreateIndex
CREATE INDEX "booking_interests_status_idx" ON "booking_interests"("status");

-- CreateIndex
CREATE INDEX "booking_interests_priority_idx" ON "booking_interests"("priority");

-- CreateIndex
CREATE INDEX "booking_interests_source_idx" ON "booking_interests"("source");

-- CreateIndex
CREATE INDEX "booking_interests_assignedTo_idx" ON "booking_interests"("assignedTo");

-- CreateIndex
CREATE INDEX "booking_interests_submittedAt_idx" ON "booking_interests"("submittedAt");

-- CreateIndex
CREATE INDEX "booking_interests_checkInDate_idx" ON "booking_interests"("checkInDate");

-- CreateIndex
CREATE INDEX "booking_interests_checkOutDate_idx" ON "booking_interests"("checkOutDate");

-- CreateIndex
CREATE INDEX "booking_interests_lastContactedAt_idx" ON "booking_interests"("lastContactedAt");

-- CreateIndex
CREATE INDEX "booking_interests_followUpScheduled_idx" ON "booking_interests"("followUpScheduled");

-- CreateIndex
CREATE INDEX "booking_interests_expiresAt_idx" ON "booking_interests"("expiresAt");

-- CreateIndex
CREATE INDEX "booking_interests_customerEmail_idx" ON "booking_interests"("customerEmail");

-- CreateIndex
CREATE INDEX "booking_interests_customerPhone_idx" ON "booking_interests"("customerPhone");

-- CreateIndex
CREATE INDEX "booking_interests_siteId_status_submittedAt_idx" ON "booking_interests"("siteId", "status", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "booking_interests_siteId_priority_status_submittedAt_idx" ON "booking_interests"("siteId", "priority", "status", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "booking_interests_assignedTo_status_followUpScheduled_idx" ON "booking_interests"("assignedTo", "status", "followUpScheduled" ASC);

-- CreateIndex
CREATE INDEX "booking_interests_status_expiresAt_idx" ON "booking_interests"("status", "expiresAt" ASC);

-- CreateIndex
CREATE INDEX "idx_booking_interests_property_status_date" ON "booking_interests"("propertyId", "status", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "idx_booking_interests_checkin_status_date" ON "booking_interests"("checkInDate", "status", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "idx_booking_interests_site_date" ON "booking_interests"("siteId", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "idx_booking_interests_property_status_date_v2" ON "booking_interests"("propertyId", "status", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "booking_interests_siteId_referenceCode_idx" ON "booking_interests"("siteId", "referenceCode");

-- CreateIndex
CREATE INDEX "booking_interest_activities_bookingInterestId_idx" ON "booking_interest_activities"("bookingInterestId");

-- CreateIndex
CREATE INDEX "booking_interest_activities_type_idx" ON "booking_interest_activities"("type");

-- CreateIndex
CREATE INDEX "booking_interest_activities_action_idx" ON "booking_interest_activities"("action");

-- CreateIndex
CREATE INDEX "booking_interest_activities_performedBy_idx" ON "booking_interest_activities"("performedBy");

-- CreateIndex
CREATE INDEX "booking_interest_activities_performedAt_idx" ON "booking_interest_activities"("performedAt");

-- CreateIndex
CREATE INDEX "booking_interest_activities_outcome_idx" ON "booking_interest_activities"("outcome");

-- CreateIndex
CREATE INDEX "booking_interest_activities_nextActionAt_idx" ON "booking_interest_activities"("nextActionAt");

-- CreateIndex
CREATE INDEX "booking_interest_activities_bookingInterestId_performedAt_idx" ON "booking_interest_activities"("bookingInterestId", "performedAt" DESC);

-- CreateIndex
CREATE INDEX "booking_interest_activities_performedBy_performedAt_idx" ON "booking_interest_activities"("performedBy", "performedAt" DESC);

-- CreateIndex
CREATE INDEX "booking_interest_activities_type_performedAt_idx" ON "booking_interest_activities"("type", "performedAt" DESC);

-- CreateIndex
CREATE INDEX "booking_interest_activities_outcome_performedAt_idx" ON "booking_interest_activities"("outcome", "performedAt" DESC);

-- CreateIndex
CREATE INDEX "reviews_propertyId_idx" ON "reviews"("propertyId");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_isApproved_idx" ON "reviews"("isApproved");

-- CreateIndex
CREATE INDEX "reviews_isPublic_idx" ON "reviews"("isPublic");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

-- CreateIndex
CREATE INDEX "property_views_propertyId_idx" ON "property_views"("propertyId");

-- CreateIndex
CREATE INDEX "property_views_siteId_idx" ON "property_views"("siteId");

-- CreateIndex
CREATE INDEX "property_views_viewedAt_idx" ON "property_views"("viewedAt");

-- CreateIndex
CREATE INDEX "property_views_sessionId_idx" ON "property_views"("sessionId");

-- CreateIndex
CREATE INDEX "property_views_siteId_viewedAt_idx" ON "property_views"("siteId", "viewedAt" DESC);

-- CreateIndex
CREATE INDEX "property_views_propertyId_viewedAt_idx" ON "property_views"("propertyId", "viewedAt" DESC);

-- CreateIndex
CREATE INDEX "property_views_siteId_propertyId_viewedAt_idx" ON "property_views"("siteId", "propertyId", "viewedAt" DESC);

-- CreateIndex
CREATE INDEX "system_health_siteId_idx" ON "system_health"("siteId");

-- CreateIndex
CREATE INDEX "system_health_service_idx" ON "system_health"("service");

-- CreateIndex
CREATE INDEX "system_health_serviceType_idx" ON "system_health"("serviceType");

-- CreateIndex
CREATE INDEX "system_health_status_idx" ON "system_health"("status");

-- CreateIndex
CREATE INDEX "system_health_environment_idx" ON "system_health"("environment");

-- CreateIndex
CREATE INDEX "system_health_region_idx" ON "system_health"("region");

-- CreateIndex
CREATE INDEX "system_health_lastChecked_idx" ON "system_health"("lastChecked");

-- CreateIndex
CREATE INDEX "system_health_nextCheckAt_idx" ON "system_health"("nextCheckAt");

-- CreateIndex
CREATE INDEX "system_health_siteId_service_status_lastChecked_idx" ON "system_health"("siteId", "service", "status", "lastChecked" DESC);

-- CreateIndex
CREATE INDEX "system_health_serviceType_status_lastChecked_idx" ON "system_health"("serviceType", "status", "lastChecked" DESC);

-- CreateIndex
CREATE INDEX "system_health_environment_status_lastChecked_idx" ON "system_health"("environment", "status", "lastChecked" DESC);

-- CreateIndex
CREATE INDEX "system_health_consecutiveFailures_idx" ON "system_health"("consecutiveFailures" DESC);

-- CreateIndex
CREATE INDEX "idx_system_health_tags" ON "system_health"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "system_health_service_site_instance_key" ON "system_health"("service", "siteId", "instance");

-- CreateIndex
CREATE INDEX "system_logs_siteId_idx" ON "system_logs"("siteId");

-- CreateIndex
CREATE INDEX "system_logs_level_idx" ON "system_logs"("level");

-- CreateIndex
CREATE INDEX "system_logs_category_idx" ON "system_logs"("category");

-- CreateIndex
CREATE INDEX "system_logs_service_idx" ON "system_logs"("service");

-- CreateIndex
CREATE INDEX "idx_system_logs_timestamp" ON "system_logs"("timestamp");

-- CreateIndex
CREATE INDEX "system_logs_correlationId_idx" ON "system_logs"("correlationId");

-- CreateIndex
CREATE INDEX "system_logs_traceId_idx" ON "system_logs"("traceId");

-- CreateIndex
CREATE INDEX "system_logs_userId_idx" ON "system_logs"("userId");

-- CreateIndex
CREATE INDEX "system_logs_errorCode_idx" ON "system_logs"("errorCode");

-- CreateIndex
CREATE INDEX "system_logs_retentionDays_idx" ON "system_logs"("retentionDays");

-- CreateIndex
CREATE INDEX "system_logs_archivedAt_idx" ON "system_logs"("archivedAt");

-- CreateIndex
CREATE INDEX "system_logs_siteId_level_timestamp_idx" ON "system_logs"("siteId", "level", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_logs_service_level_timestamp_idx" ON "system_logs"("service", "level", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_logs_category_subcategory_timestamp_idx" ON "system_logs"("category", "subcategory", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_logs_correlationId_timestamp_idx" ON "system_logs"("correlationId", "timestamp" ASC);

-- CreateIndex
CREATE INDEX "idx_system_logs_timestamp_desc" ON "system_logs"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_logs_archivedAt_retentionDays_idx" ON "system_logs"("archivedAt", "retentionDays");

-- CreateIndex
CREATE INDEX "idx_system_log_tags" ON "system_logs"("tags");

-- CreateIndex
CREATE INDEX "system_health_history_systemHealthId_idx" ON "system_health_history"("systemHealthId");

-- CreateIndex
CREATE INDEX "system_health_history_status_idx" ON "system_health_history"("status");

-- CreateIndex
CREATE INDEX "system_health_history_checkedAt_idx" ON "system_health_history"("checkedAt");

-- CreateIndex
CREATE INDEX "system_health_history_systemHealthId_checkedAt_idx" ON "system_health_history"("systemHealthId", "checkedAt" DESC);

-- CreateIndex
CREATE INDEX "health_alerts_systemHealthId_idx" ON "health_alerts"("systemHealthId");

-- CreateIndex
CREATE INDEX "health_alerts_alertType_idx" ON "health_alerts"("alertType");

-- CreateIndex
CREATE INDEX "health_alerts_severity_idx" ON "health_alerts"("severity");

-- CreateIndex
CREATE INDEX "health_alerts_status_idx" ON "health_alerts"("status");

-- CreateIndex
CREATE INDEX "health_alerts_triggeredAt_idx" ON "health_alerts"("triggeredAt");

-- CreateIndex
CREATE INDEX "health_alerts_acknowledgedAt_idx" ON "health_alerts"("acknowledgedAt");

-- CreateIndex
CREATE INDEX "health_alerts_resolvedAt_idx" ON "health_alerts"("resolvedAt");

-- CreateIndex
CREATE INDEX "health_alerts_expiresAt_idx" ON "health_alerts"("expiresAt");

-- CreateIndex
CREATE INDEX "health_alerts_severity_status_triggeredAt_idx" ON "health_alerts"("severity", "status", "triggeredAt" DESC);

-- CreateIndex
CREATE INDEX "health_alerts_systemHealthId_status_triggeredAt_idx" ON "health_alerts"("systemHealthId", "status", "triggeredAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_jobs_siteId_idx" ON "maintenance_jobs"("siteId");

-- CreateIndex
CREATE INDEX "maintenance_jobs_category_idx" ON "maintenance_jobs"("category");

-- CreateIndex
CREATE INDEX "maintenance_jobs_type_idx" ON "maintenance_jobs"("type");

-- CreateIndex
CREATE INDEX "maintenance_jobs_priority_idx" ON "maintenance_jobs"("priority");

-- CreateIndex
CREATE INDEX "maintenance_jobs_status_idx" ON "maintenance_jobs"("status");

-- CreateIndex
CREATE INDEX "maintenance_jobs_nextRunAt_idx" ON "maintenance_jobs"("nextRunAt");

-- CreateIndex
CREATE INDEX "maintenance_jobs_lastRunAt_idx" ON "maintenance_jobs"("lastRunAt");

-- CreateIndex
CREATE INDEX "maintenance_jobs_isRecurring_idx" ON "maintenance_jobs"("isRecurring");

-- CreateIndex
CREATE INDEX "maintenance_jobs_requiresApproval_idx" ON "maintenance_jobs"("requiresApproval");

-- CreateIndex
CREATE INDEX "maintenance_jobs_expiresAt_idx" ON "maintenance_jobs"("expiresAt");

-- CreateIndex
CREATE INDEX "maintenance_jobs_deactivatedAt_idx" ON "maintenance_jobs"("deactivatedAt");

-- CreateIndex
CREATE INDEX "maintenance_jobs_siteId_status_nextRunAt_idx" ON "maintenance_jobs"("siteId", "status", "nextRunAt" ASC);

-- CreateIndex
CREATE INDEX "maintenance_jobs_category_status_priority_idx" ON "maintenance_jobs"("category", "status", "priority" DESC);

-- CreateIndex
CREATE INDEX "maintenance_jobs_type_status_nextRunAt_idx" ON "maintenance_jobs"("type", "status", "nextRunAt" ASC);

-- CreateIndex
CREATE INDEX "maintenance_jobs_systemHealthId_idx" ON "maintenance_jobs"("systemHealthId");

-- CreateIndex
CREATE INDEX "idx_maintenance_jobs_tags" ON "maintenance_jobs"("tags");

-- CreateIndex
CREATE INDEX "maintenance_executions_maintenanceJobId_idx" ON "maintenance_executions"("maintenanceJobId");

-- CreateIndex
CREATE INDEX "maintenance_executions_status_idx" ON "maintenance_executions"("status");

-- CreateIndex
CREATE INDEX "maintenance_executions_startedAt_idx" ON "maintenance_executions"("startedAt");

-- CreateIndex
CREATE INDEX "maintenance_executions_completedAt_idx" ON "maintenance_executions"("completedAt");

-- CreateIndex
CREATE INDEX "maintenance_executions_triggerType_idx" ON "maintenance_executions"("triggerType");

-- CreateIndex
CREATE INDEX "maintenance_executions_triggeredBy_idx" ON "maintenance_executions"("triggeredBy");

-- CreateIndex
CREATE INDEX "maintenance_executions_exitCode_idx" ON "maintenance_executions"("exitCode");

-- CreateIndex
CREATE INDEX "maintenance_executions_retryAttempt_idx" ON "maintenance_executions"("retryAttempt");

-- CreateIndex
CREATE INDEX "maintenance_executions_rollbackExecuted_idx" ON "maintenance_executions"("rollbackExecuted");

-- CreateIndex
CREATE INDEX "maintenance_executions_maintenanceJobId_startedAt_idx" ON "maintenance_executions"("maintenanceJobId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_executions_status_startedAt_idx" ON "maintenance_executions"("status", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_executions_triggerType_startedAt_idx" ON "maintenance_executions"("triggerType", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_approvals_maintenanceJobId_idx" ON "maintenance_approvals"("maintenanceJobId");

-- CreateIndex
CREATE INDEX "maintenance_approvals_requestedBy_idx" ON "maintenance_approvals"("requestedBy");

-- CreateIndex
CREATE INDEX "maintenance_approvals_approvedBy_idx" ON "maintenance_approvals"("approvedBy");

-- CreateIndex
CREATE INDEX "maintenance_approvals_status_idx" ON "maintenance_approvals"("status");

-- CreateIndex
CREATE INDEX "maintenance_approvals_riskLevel_idx" ON "maintenance_approvals"("riskLevel");

-- CreateIndex
CREATE INDEX "maintenance_approvals_impact_idx" ON "maintenance_approvals"("impact");

-- CreateIndex
CREATE INDEX "maintenance_approvals_requestedAt_idx" ON "maintenance_approvals"("requestedAt");

-- CreateIndex
CREATE INDEX "maintenance_approvals_reviewedAt_idx" ON "maintenance_approvals"("reviewedAt");

-- CreateIndex
CREATE INDEX "maintenance_approvals_expiresAt_idx" ON "maintenance_approvals"("expiresAt");

-- CreateIndex
CREATE INDEX "maintenance_approvals_status_requestedAt_idx" ON "maintenance_approvals"("status", "requestedAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_approvals_requestedBy_status_requestedAt_idx" ON "maintenance_approvals"("requestedBy", "status", "requestedAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_notifications_maintenanceJobId_idx" ON "maintenance_notifications"("maintenanceJobId");

-- CreateIndex
CREATE INDEX "maintenance_notifications_type_idx" ON "maintenance_notifications"("type");

-- CreateIndex
CREATE INDEX "maintenance_notifications_channel_idx" ON "maintenance_notifications"("channel");

-- CreateIndex
CREATE INDEX "maintenance_notifications_recipient_idx" ON "maintenance_notifications"("recipient");

-- CreateIndex
CREATE INDEX "maintenance_notifications_status_idx" ON "maintenance_notifications"("status");

-- CreateIndex
CREATE INDEX "maintenance_notifications_sentAt_idx" ON "maintenance_notifications"("sentAt");

-- CreateIndex
CREATE INDEX "maintenance_notifications_deliveredAt_idx" ON "maintenance_notifications"("deliveredAt");

-- CreateIndex
CREATE INDEX "maintenance_notifications_failedAt_idx" ON "maintenance_notifications"("failedAt");

-- CreateIndex
CREATE INDEX "maintenance_notifications_nextRetryAt_idx" ON "maintenance_notifications"("nextRetryAt");

-- CreateIndex
CREATE INDEX "maintenance_notifications_correlationId_idx" ON "maintenance_notifications"("correlationId");

-- CreateIndex
CREATE INDEX "maintenance_notifications_priority_idx" ON "maintenance_notifications"("priority");

-- CreateIndex
CREATE INDEX "maintenance_notifications_status_createdAt_idx" ON "maintenance_notifications"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_notifications_channel_status_nextRetryAt_idx" ON "maintenance_notifications"("channel", "status", "nextRetryAt" ASC);

-- CreateIndex
CREATE INDEX "system_performance_siteId_idx" ON "system_performance"("siteId");

-- CreateIndex
CREATE INDEX "system_performance_service_idx" ON "system_performance"("service");

-- CreateIndex
CREATE INDEX "system_performance_instance_idx" ON "system_performance"("instance");

-- CreateIndex
CREATE INDEX "system_performance_environment_idx" ON "system_performance"("environment");

-- CreateIndex
CREATE INDEX "idx_system_performance_timestamp" ON "system_performance"("timestamp");

-- CreateIndex
CREATE INDEX "system_performance_cpuUsage_idx" ON "system_performance"("cpuUsage");

-- CreateIndex
CREATE INDEX "system_performance_memoryUsage_idx" ON "system_performance"("memoryUsage");

-- CreateIndex
CREATE INDEX "system_performance_diskUsage_idx" ON "system_performance"("diskUsage");

-- CreateIndex
CREATE INDEX "system_performance_siteId_service_timestamp_idx" ON "system_performance"("siteId", "service", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_performance_service_timestamp_idx" ON "system_performance"("service", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_performance_environment_timestamp_idx" ON "system_performance"("environment", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_system_performance_timestamp_desc" ON "system_performance"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_system_performance_tags" ON "system_performance"("tags");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_siteId_idx" ON "resort_operational_metrics"("siteId");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_propertyId_idx" ON "resort_operational_metrics"("propertyId");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_category_idx" ON "resort_operational_metrics"("category");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_timestamp_idx" ON "resort_operational_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_periodStart_periodEnd_idx" ON "resort_operational_metrics"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_periodType_idx" ON "resort_operational_metrics"("periodType");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_occupancyRate_idx" ON "resort_operational_metrics"("occupancyRate");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_guestSatisfactionScore_idx" ON "resort_operational_metrics"("guestSatisfactionScore");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_systemUptime_idx" ON "resort_operational_metrics"("systemUptime");

-- CreateIndex
CREATE INDEX "resort_operational_metrics_siteId_category_timestamp_idx" ON "resort_operational_metrics"("siteId", "category", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "resort_operational_metrics_siteId_propertyId_timestamp_idx" ON "resort_operational_metrics"("siteId", "propertyId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "resort_operational_metrics_category_timestamp_idx" ON "resort_operational_metrics"("category", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "resort_operational_metrics_periodType_timestamp_idx" ON "resort_operational_metrics"("periodType", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "resort_operational_metrics_siteId_periodStart_periodEnd_idx" ON "resort_operational_metrics"("siteId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "idx_resort_operational_metrics_tags" ON "resort_operational_metrics"("tags");

-- CreateIndex
CREATE INDEX "guest_service_metrics_siteId_idx" ON "guest_service_metrics"("siteId");

-- CreateIndex
CREATE INDEX "guest_service_metrics_serviceType_idx" ON "guest_service_metrics"("serviceType");

-- CreateIndex
CREATE INDEX "guest_service_metrics_bookingId_idx" ON "guest_service_metrics"("bookingId");

-- CreateIndex
CREATE INDEX "guest_service_metrics_guestId_idx" ON "guest_service_metrics"("guestId");

-- CreateIndex
CREATE INDEX "guest_service_metrics_serviceStartTime_idx" ON "guest_service_metrics"("serviceStartTime");

-- CreateIndex
CREATE INDEX "guest_service_metrics_satisfactionScore_idx" ON "guest_service_metrics"("satisfactionScore");

-- CreateIndex
CREATE INDEX "guest_service_metrics_responseTime_idx" ON "guest_service_metrics"("responseTime");

-- CreateIndex
CREATE INDEX "guest_service_metrics_qualityRating_idx" ON "guest_service_metrics"("qualityRating");

-- CreateIndex
CREATE INDEX "guest_service_metrics_department_idx" ON "guest_service_metrics"("department");

-- CreateIndex
CREATE INDEX "guest_service_metrics_followUpRequired_idx" ON "guest_service_metrics"("followUpRequired");

-- CreateIndex
CREATE INDEX "guest_service_metrics_siteId_serviceType_serviceStartTime_idx" ON "guest_service_metrics"("siteId", "serviceType", "serviceStartTime" DESC);

-- CreateIndex
CREATE INDEX "guest_service_metrics_serviceType_satisfactionScore_idx" ON "guest_service_metrics"("serviceType", "satisfactionScore" DESC);

-- CreateIndex
CREATE INDEX "guest_service_metrics_department_responseTime_idx" ON "guest_service_metrics"("department", "responseTime" ASC);

-- CreateIndex
CREATE INDEX "guest_service_metrics_followUpRequired_followUpCompleted_idx" ON "guest_service_metrics"("followUpRequired", "followUpCompleted");

-- CreateIndex
CREATE INDEX "idx_guest_service_metrics_tags" ON "guest_service_metrics"("tags");

-- CreateIndex
CREATE INDEX "system_anomalies_siteId_idx" ON "system_anomalies"("siteId");

-- CreateIndex
CREATE INDEX "system_anomalies_service_idx" ON "system_anomalies"("service");

-- CreateIndex
CREATE INDEX "system_anomalies_metricType_idx" ON "system_anomalies"("metricType");

-- CreateIndex
CREATE INDEX "system_anomalies_anomalyType_idx" ON "system_anomalies"("anomalyType");

-- CreateIndex
CREATE INDEX "system_anomalies_severity_idx" ON "system_anomalies"("severity");

-- CreateIndex
CREATE INDEX "system_anomalies_status_idx" ON "system_anomalies"("status");

-- CreateIndex
CREATE INDEX "system_anomalies_detectedAt_idx" ON "system_anomalies"("detectedAt");

-- CreateIndex
CREATE INDEX "system_anomalies_acknowledgedAt_idx" ON "system_anomalies"("acknowledgedAt");

-- CreateIndex
CREATE INDEX "system_anomalies_resolvedAt_idx" ON "system_anomalies"("resolvedAt");

-- CreateIndex
CREATE INDEX "system_anomalies_impactLevel_idx" ON "system_anomalies"("impactLevel");

-- CreateIndex
CREATE INDEX "system_anomalies_falsePositive_idx" ON "system_anomalies"("falsePositive");

-- CreateIndex
CREATE INDEX "system_anomalies_siteId_severity_status_detectedAt_idx" ON "system_anomalies"("siteId", "severity", "status", "detectedAt" DESC);

-- CreateIndex
CREATE INDEX "system_anomalies_service_anomalyType_detectedAt_idx" ON "system_anomalies"("service", "anomalyType", "detectedAt" DESC);

-- CreateIndex
CREATE INDEX "system_anomalies_metricType_metricName_detectedAt_idx" ON "system_anomalies"("metricType", "metricName", "detectedAt" DESC);

-- CreateIndex
CREATE INDEX "system_anomalies_status_detectedAt_idx" ON "system_anomalies"("status", "detectedAt" DESC);

-- CreateIndex
CREATE INDEX "idx_system_anomaly_tags" ON "system_anomalies"("tags");

-- CreateIndex
CREATE INDEX "analytics_events_siteId_idx" ON "analytics_events"("siteId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_eventName_idx" ON "analytics_events"("eventName");

-- CreateIndex
CREATE INDEX "analytics_events_entityId_idx" ON "analytics_events"("entityId");

-- CreateIndex
CREATE INDEX "analytics_events_entityType_idx" ON "analytics_events"("entityType");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_users" ADD CONSTRAINT "site_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_users" ADD CONSTRAINT "site_users_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation" ADD CONSTRAINT "navigation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "navigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "navigation_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_page_id_fkey" FOREIGN KEY ("entityId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_content_block_id_fkey" FOREIGN KEY ("entityId") REFERENCES "content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_items" ADD CONSTRAINT "workflow_items_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflowItemId_fkey" FOREIGN KEY ("workflowItemId") REFERENCES "workflow_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_settings" ADD CONSTRAINT "brand_settings_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_configs" ADD CONSTRAINT "property_configs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_configs" ADD CONSTRAINT "property_configs_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_configs" ADD CONSTRAINT "booking_configs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_configs" ADD CONSTRAINT "operational_configs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_experience_configs" ADD CONSTRAINT "guest_experience_configs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_snapshots" ADD CONSTRAINT "config_snapshots_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_snapshots" ADD CONSTRAINT "config_snapshots_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_restores" ADD CONSTRAINT "snapshot_restores_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "config_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_restores" ADD CONSTRAINT "snapshot_restores_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_restores" ADD CONSTRAINT "snapshot_restores_restoredBy_fkey" FOREIGN KEY ("restoredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_templates" ADD CONSTRAINT "config_templates_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_templates" ADD CONSTRAINT "config_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_template_usage" ADD CONSTRAINT "config_template_usage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "config_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_template_usage" ADD CONSTRAINT "config_template_usage_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_template_usage" ADD CONSTRAINT "config_template_usage_appliedBy_fkey" FOREIGN KEY ("appliedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_audit_logs" ADD CONSTRAINT "config_audit_logs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_audit_logs" ADD CONSTRAINT "config_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_audit_logs" ADD CONSTRAINT "config_audit_logs_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "config_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_audit_logs" ADD CONSTRAINT "config_audit_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "config_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing" ADD CONSTRAINT "pricing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_interests" ADD CONSTRAINT "booking_interests_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_interests" ADD CONSTRAINT "booking_interests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_interests" ADD CONSTRAINT "booking_interests_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_interests" ADD CONSTRAINT "booking_interests_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_interest_activities" ADD CONSTRAINT "booking_interest_activities_bookingInterestId_fkey" FOREIGN KEY ("bookingInterestId") REFERENCES "booking_interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_interest_activities" ADD CONSTRAINT "booking_interest_activities_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_health_history" ADD CONSTRAINT "system_health_history_systemHealthId_fkey" FOREIGN KEY ("systemHealthId") REFERENCES "system_health"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_alerts" ADD CONSTRAINT "health_alerts_systemHealthId_fkey" FOREIGN KEY ("systemHealthId") REFERENCES "system_health"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_systemHealthId_fkey" FOREIGN KEY ("systemHealthId") REFERENCES "system_health"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_executions" ADD CONSTRAINT "maintenance_executions_maintenanceJobId_fkey" FOREIGN KEY ("maintenanceJobId") REFERENCES "maintenance_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_approvals" ADD CONSTRAINT "maintenance_approvals_maintenanceJobId_fkey" FOREIGN KEY ("maintenanceJobId") REFERENCES "maintenance_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_notifications" ADD CONSTRAINT "maintenance_notifications_maintenanceJobId_fkey" FOREIGN KEY ("maintenanceJobId") REFERENCES "maintenance_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

