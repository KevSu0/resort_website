# Admin Panel Backend Scope & Architecture

## Project Overview

This document outlines the simplified backend requirements for the resort website admin panel. The system is a basic resort property management platform focused on property display and booking interest submission without internal communication features.

**Business Context:**
- Single-brand resort property management platform
- Basic role-based access control
- Property display and availability management
- Simple booking interest submission system
- Essential security and operational requirements

**Current Project State:**
- **Database:** PostgreSQL 15 with simplified Prisma schema (fully implemented)
- **Backend Architecture:** Modern Node.js + TypeScript with Prisma ORM and database adapters
- **Single-tenant:** Simplified structure with basic site management
- **Content Management:** Basic CMS with simple page and content management
- **Authentication:** JWT-based with secure session management
- **Database Optimization:** Standard connection pooling and basic performance indexes
- **Type Safety:** TypeScript integration with essential type definitions

---

## Simplified Admin Panel Backend Features

### 1. Dashboard/Analytics Module

**Core Purpose:** Provide basic operational insights for resort management.

**API Endpoints:**
```
GET    /api/v1/admin/dashboard/metrics          // Basic operational KPIs
GET    /api/v1/admin/dashboard/recent-activity  // Recent booking activity
GET    /api/v1/admin/dashboard/export           // Export basic data
```

**Key Features:**
- Property availability overview
- Basic booking interest statistics
- Property view counts
- Simple system health indicators

**Database Requirements:**
- Basic metrics aggregation
- Simple activity logging
- Essential performance tables

**Business Logic Services:**
```typescript
interface DashboardMetrics {
  totalProperties: number;
  activeBookingInterests: number;
  propertyViews: number;
  recentActivity: Activity[];
}

class DashboardService {
  async getMetrics(siteId: string): Promise<DashboardMetrics>
  async getRecentActivity(siteId: string): Promise<Activity[]>
  async generateBasicReport(reportType: ReportType): Promise<Report>
}
```

### 2. Properties Management Module

**Core Purpose:** Basic management of resort properties, rooms, amenities, and availability.

**API Endpoints:**
```
GET    /api/v1/admin/properties                 // List properties
POST   /api/v1/admin/properties                 // Create new property
GET    /api/v1/admin/properties/:id             // Get property details
PUT    /api/v1/admin/properties/:id             // Update property
DELETE /api/v1/admin/properties/:id             // Delete property
GET    /api/v1/admin/properties/:id/rooms       // Get property rooms
POST   /api/v1/admin/properties/:id/rooms       // Add room to property
PUT    /api/v1/admin/properties/:id/rooms/:roomId // Update room
DELETE /api/v1/admin/properties/:id/rooms/:roomId // Delete room
GET    /api/v1/admin/properties/:id/availability // Get availability calendar
POST   /api/v1/admin/properties/:id/availability // Update availability
GET    /api/v1/admin/properties/:id/pricing     // Get pricing structure
PUT    /api/v1/admin/properties/:id/pricing     // Update pricing
POST   /api/v1/admin/properties/:id/photos      // Upload photos
DELETE /api/v1/admin/properties/:id/photos/:photoId // Delete photo
```

**Key Features:**
- Basic property management (resorts, hotels, villas)
- Room inventory management with capacity and pricing
- Simple availability management with calendar view
- Amenity management and categorization
- Photo gallery management
- Basic property display features

**Database Schema:**
```prisma
model Property {
  id                String   @id @default(cuid())
  siteId            String
  name              String
  description       String
  type              PropertyType
  category          String
  status            PropertyStatus
  capacity          Int
  basePrice         Decimal
  currency          String   @default("USD")
  address           Json
  coordinates       Json?
  images            String[]
  amenities         String[]
  policies          Json?
  checkInTime       String   @default("15:00")
  checkOutTime      String   @default("11:00")
  minStay           Int      @default(1)
  maxStay           Int?
  isActive          Boolean  @default(true)
  sortOrder         Int?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  site              Site     @relation(fields: [siteId], references: [id])
  rooms             Room[]
  bookingInterests  BookingInterest[]
  availability      Availability[]
  pricing           Pricing[]
  reviews           Review[]

  @@map("properties")
}

model Room {
  id                String   @id @default(cuid())
  propertyId        String
  name              String
  type              String
  capacity          Int
  basePrice         Decimal
  size              Int?
  bedType           String?
  amenities         String[]
  images            String[]
  isActive          Boolean  @default(true)
  sortOrder         Int?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  property          Property @relation(fields: [propertyId], references: [id])
  bookingInterests  BookingInterest[]

  @@map("rooms")
}
```

### 3. Simplified Booking Interest Management Module

**Core Purpose:** Simple lead generation system for customer booking inquiries and offline follow-up.

**Customer Flow:**
Property browse → Check availability → Submit interest form → Receive reference code → Wait for admin contact

**Admin Flow:**
Review booking interests → Contact customers offline → Confirm bookings offline → Update booking status

**API Endpoints:**
```
// Customer-facing (Public API)
POST   /api/v1/public/booking-interest         // Submit booking interest form
GET    /api/v1/public/availability             // Check property availability
GET    /api/v1/public/properties               // Browse properties with basic info

// Admin Management
GET    /api/v1/admin/booking-interests         // List all booking interests
GET    /api/v1/admin/booking-interests/:id     // Get interest details
PUT    /api/v1/admin/booking-interests/:id     // Update interest status
POST   /api/v1/admin/booking-interests/:id/contact // Mark as contacted
POST   /api/v1/admin/booking-interests/:id/confirm // Mark as confirmed offline
DELETE /api/v1/admin/booking-interests/:id     // Archive/remove interest
GET    /api/v1/admin/booking-interests/stats   // Basic statistics
POST   /api/v1/admin/booking-interests/export  // Export for follow-up
```

**Key Features:**
- Simple customer interest form submission
- Reference code generation for tracking
- Basic availability checking
- Admin dashboard for managing leads
- Status tracking (New, Contacted, Confirmed, Archived)
- Offline follow-up management
- Basic lead statistics and export

**Business Logic Services:**
```typescript
interface BookingInterest {
  id: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  specialRequests?: string;
  status: InterestStatus; // NEW, CONTACTED, CONFIRMED, ARCHIVED
  adminNotes?: string;
  submittedAt: Date;
  lastContactedAt?: Date;
  confirmedAt?: Date;
}

type InterestStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'ARCHIVED';

class BookingInterestService {
  async submitInterest(data: SubmitInterestDto): Promise<BookingInterest>
  async checkAvailability(propertyId: string, dates: DateRange): Promise<AvailabilityResult>
  async generateReferenceCode(): Promise<string>
  async updateInterestStatus(id: string, status: InterestStatus): Promise<BookingInterest>
  async getPendingInterests(): Promise<BookingInterest[]>
  async markAsContacted(id: string, notes: string): Promise<BookingInterest>
  async confirmOfflineBooking(id: string, confirmationDetails: ConfirmationDetails): Promise<BookingInterest>
  async getInterestStats(filters: InterestFilters): Promise<InterestStats>
  async exportForFollowUp(format: 'csv' | 'excel'): Promise<File>
}
```

**Removed Complex Features:**
- ❌ Online payment processing
- ❌ Real-time booking confirmation
- ❌ Automated email communications
- ❌ Cancellation workflows
- ❌ Check-in/check-out processes
- ❌ Refund management
- ❌ Waitlist systems
- ❌ Group booking management
- ❌ Calendar integration
- ❌ Pricing calculations
- ❌ Tax calculations
- ❌ Promotion/discount systems

**Simplified Database Schema:**
```prisma
model BookingInterest {
  id                String   @id @default(cuid())
  referenceCode     String   @unique
  siteId            String

  // Customer Information
  customerName      String
  customerEmail     String
  customerPhone     String

  // Booking Details
  propertyId        String
  checkInDate       DateTime
  checkOutDate      DateTime
  numberOfGuests   Int
  specialRequests   String?

  // Status Management
  status            InterestStatus @default(NEW)
  adminNotes        String?
  lastContactedAt   DateTime?
  confirmedAt       DateTime?

  // Metadata
  submittedAt       DateTime @default(now())
  updatedAt         DateTime @updatedAt

  site              Site     @relation(fields: [siteId], references: [id])
  property          Property @relation(fields: [propertyId], references: [id])

  @@map("booking_interests")
}

enum InterestStatus {
  NEW
  CONTACTED
  CONFIRMED
  ARCHIVED
}
```

### 4. Users & Roles Management Module

**Core Purpose:** Basic user management with simple role-based access control.

**API Endpoints:**
```
GET    /api/v1/admin/users                    // List users
POST   /api/v1/admin/users                    // Create user
GET    /api/v1/admin/users/:id                // Get user details
PUT    /api/v1/admin/users/:id                // Update user
DELETE /api/v1/admin/users/:id                // Delete user
POST   /api/v1/admin/users/:id/activate       // Activate user
POST   /api/v1/admin/users/:id/deactivate     // Deactivate user
GET    /api/v1/admin/roles                    // List roles
POST   /api/v1/admin/roles                    // Create role
PUT    /api/v1/admin/roles/:id                // Update role
DELETE /api/v1/admin/roles/:id                // Delete role
```

**Key Features:**
- Basic user management
- Simple role-based access control (ADMIN, EDITOR, VIEWER)
- User activation/deactivation
- Basic activity logging
- Simple session management

**Basic RBAC Implementation:**
```typescript
class AuthorizationService {
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean>
  async getUserPermissions(userId: string): Promise<Permission[]>
  async assignRole(userId: string, roleId: string): Promise<void>
  async revokeRole(userId: string, roleId: string): Promise<void>
}

class BasicSecurityMiddleware {
  async requirePermission(resource: string, action: string) => Promise<Middleware>
  async requireRole(role: string) => Promise<Middleware>
}
```

### 5. Content Management (CMS) Module

**Core Purpose:** Basic content management system for simple page and content management.

**API Endpoints:**
```
// Page Management
GET    /api/v1/cms/pages                      // List pages
POST   /api/v1/cms/pages                      // Create page
GET    /api/v1/cms/pages/:id                  // Get page details
PUT    /api/v1/cms/pages/:id                  // Update page
DELETE /api/v1/cms/pages/:id                  // Delete page
POST   /api/v1/cms/pages/:id/publish          // Publish page

// Content Blocks
GET    /api/v1/cms/blocks                     // List content blocks
POST   /api/v1/cms/blocks                     // Create content block
GET    /api/v1/cms/blocks/:id                 // Get block details
PUT    /api/v1/cms/blocks/:id                 // Update content block
DELETE /api/v1/cms/blocks/:id                 // Delete content block

// Basic SEO
PUT    /api/v1/cms/seo/metadata/:pageId       // Update SEO metadata
```

**Key Features:**
- Basic rich text editor for content creation
- Simple page publishing and management
- Basic content block system
- Simple SEO metadata management

**Advanced Features:**
```typescript
class ContentWorkflowService {
  async submitForReview(pageId: string, reviewerId: string): Promise<WorkflowItem>
  async approveContent(workflowItemId: string, approverId: string): Promise<void>
  async rejectContent(workflowItemId: string, reason: string): Promise<void>
  async getScheduledContent(siteId: string): Promise<Page[]>
  async schedulePublication(pageId: string, publishDate: Date): Promise<void>
}

class VersionControlService {
  async createVersion(entityId: string, entityType: VersionEntityType, data: any, authorId: string): Promise<ContentVersion>
  async compareVersions(version1: number, version2: number): Promise<VersionDiff>
  async mergeChanges(fromVersion: number, toVersion: number): Promise<ContentVersion>
  async getVersionHistory(entityId: string): Promise<ContentVersion[]>
}

class SEOService {
  async analyzePageContent(pageId: string): Promise<SEOAnalysis>
  async generateMetaTags(pageId: string): Promise<MetaTags>
  async trackKeywordPerformance(keywords: string[]): Promise<KeywordAnalytics>
  async generateSitemap(siteId: string): Promise<Sitemap>
  async optimizeContent(pageId: string): Promise<SEOOptimizations>
}
```

### 6. Media Management Module

**Core Purpose:** Media library with file management and basic optimization features.

**API Endpoints:**
```
// File Upload & Processing
POST   /api/v1/media/upload                   // Upload file
POST   /api/v1/media/upload/batch             // Batch upload
GET    /api/v1/media                          // List media files
GET    /api/v1/media/:id                      // Get media details
PUT    /api/v1/media/:id                      // Update media metadata
DELETE /api/v1/media/:id                      // Delete media file
POST   /api/v1/media/:id/optimize             // Optimize media
GET    /api/v1/media/:id/thumbnails           // Get thumbnails
POST   /api/v1/media/:id/transform            // Transform image/video

// Media Organization
GET    /api/v1/media/folders                  // List folders
POST   /api/v1/media/folders                  // Create folder
PUT    /api/v1/media/folders/:id              // Update folder
DELETE /api/v1/media/folders/:id              // Delete folder
POST   /api/v1/media/move                     // Move media to folder
POST   /api/v1/media/copy                     // Copy media file

// Search & Management
GET    /api/v1/media/search                   // Search media files
POST   /api/v1/media/bulk-tag                 // Bulk tag media
GET    /api/v1/media/stats                    // Media usage statistics
POST   /api/v1/media/cleanup                  // Cleanup unused media
```

**Key Features:**
- File upload with progress tracking
- Basic image optimization and format conversion
- Manual tagging and categorization
- Text-based search functionality
- Media organization with folders and tags
- Basic thumbnail generation
- Bulk operations and batch processing
- Media usage analytics
- Storage management and cleanup

**Media Processing Services:**
```typescript
class MediaProcessingService {
  async processUpload(file: File, options: UploadOptions): Promise<Media>
  async generateThumbnails(mediaId: string, sizes: ImageSize[]): Promise<Thumbnail[]>
  async optimizeImage(mediaId: string, options: OptimizationOptions): Promise<Media>
  async transcodeVideo(mediaId: string, formats: VideoFormat[]): Promise<Media>
  async extractMetadata(mediaId: string): Promise<MediaMetadata>
  async applyFilters(mediaId: string, filters: Filter[]): Promise<Media>
}

class MediaLibraryService {
  async searchMedia(query: SearchQuery): Promise<MediaSearchResult>
  async organizeMedia(mediaIds: string[], folderId: string): Promise<void>
  async bulkTagMedia(mediaIds: string[], tags: string[]): Promise<void>
  async getMediaStats(siteId: string): Promise<MediaStats>
}
```

### 7. Reports & Analytics Module

**Core Purpose:** Basic analytics and reporting for operational insights.

**API Endpoints:**
```
// Analytics Data
GET    /api/v1/analytics/dashboard             // Dashboard metrics
GET    /api/v1/analytics/metrics              // Custom metrics
POST   /api/v1/analytics/events               // Track analytics events
GET    /api/v1/analytics/real-time            // Real-time analytics
GET    /api/v1/analytics/trends               // Trend analysis
GET    /api/v1/analytics/comparisons          // Comparative analytics

// Custom Reports
GET    /api/v1/analytics/reports              // List reports
POST   /api/v1/analytics/reports              // Create custom report
GET    /api/v1/analytics/reports/:id          // Get report details
PUT    /api/v1/analytics/reports/:id          // Update report
DELETE /api/v1/analytics/reports/:id          // Delete report
POST   /api/v1/analytics/reports/:id/run      // Execute report
GET    /api/v1/analytics/reports/:id/schedule // Report scheduling

// Data Visualization
GET    /api/v1/analytics/charts               // Get chart data
POST   /api/v1/analytics/visualizations       // Create visualization
GET    /api/v1/analytics/visualizations/:id   // Get visualization
PUT    /api/v1/analytics/visualizations/:id   // Update visualization
POST   /api/v1/analytics/visualizations/:id/export // Export visualization

// Export/Import
POST   /api/v1/analytics/export               // Export data
POST   /api/v1/analytics/import               // Import data
GET    /api/v1/analytics/schemas              // Get data schemas
POST   /api/v1/analytics/data-quality         // Data quality check
```

**Key Features:**
- Real-time analytics dashboard
- Basic custom report builder
- Simple data visualization tools
- Basic trend analysis
- Data export in multiple formats
- Scheduled report generation
- Data quality assessment
- Comparative analytics

**Analytics Engine:**
```typescript
class AnalyticsEngineService {
  async collectEvent(event: AnalyticsEvent): Promise<void>
  async processBatch(events: AnalyticsEvent[]): Promise<void>
  async generateMetrics(timeRange: TimeRange, filters: Filter[]): Promise<AnalyticsMetrics>
  async getRealTimeMetrics(siteId: string): Promise<RealTimeMetrics>
  async trackUserBehavior(userId: string, events: UserEvent[]): Promise<UserBehaviorAnalytics>
}

class ReportBuilderService {
  async createReport(definition: ReportDefinition): Promise<Report>
  async executeReport(reportId: string, parameters: ReportParameters): Promise<ReportResult>
  async scheduleReport(reportId: string, schedule: ReportSchedule): Promise<void>
  async shareReport(reportId: string, sharingOptions: SharingOptions): Promise<string>
}
```

### 8. Settings & Configuration Module

**Core Purpose:** Centralized configuration management for all system settings and integrations.

**API Endpoints:**
```
// Site Settings
GET    /api/v1/settings/site                  // Get site settings
PUT    /api/v1/settings/site                  // Update site settings
POST   /api/v1/settings/site/reset            // Reset to defaults
GET    /api/v1/settings/site/backup           // Backup settings
POST   /api/v1/settings/site/restore          // Restore settings
GET    /api/v1/settings/site/preview          // Preview changes

// Brand Configuration
GET    /api/v1/settings/brand                 // Get brand settings
PUT    /api/v1/settings/brand                 // Update brand settings
POST   /api/v1/settings/brand/logo            // Upload brand logo
DELETE /api/v1/settings/brand/logo            // Remove brand logo
GET    /api/v1/settings/brand/colors          // Get brand colors
PUT    /api/v1/settings/brand/colors          // Update brand colors

// Integration Settings
GET    /api/v1/settings/integrations          // Get integrations
POST   /api/v1/settings/integrations          // Add integration
GET    /api/v1/settings/integrations/:id      // Get integration details
PUT    /api/v1/settings/integrations/:id      // Update integration
DELETE /api/v1/settings/integrations/:id      // Remove integration
POST   /api/v1/settings/integrations/:id/test // Test integration
GET    /api/v1/settings/integrations/catalog   // Integration catalog



// Security Settings
GET    /api/v1/settings/security              // Get security settings
PUT    /api/v1/settings/security              // Update security settings
POST   /api/v1/settings/security/2fa          // Configure 2FA
GET    /api/v1/settings/security/sessions     // Active sessions
DELETE /api/v1/settings/security/sessions/:id // Revoke session
```

**Key Features:**
- Basic site and brand configuration
- Simple integration management
- Basic security settings and session management
- Configuration validation and testing
- Essential backup functionality

**Configuration Services:**
```typescript
class SettingsService {
  async getSettings(siteId: string, category?: string): Promise<Settings>
  async updateSettings(siteId: string, updates: SettingsUpdates): Promise<Settings>
  async resetToDefaults(siteId: string, category?: string): Promise<Settings>
  async validateSettings(settings: Settings): Promise<ValidationResult>
}

class BasicIntegrationService {
  async addIntegration(integration: IntegrationConfig): Promise<Integration>
  async testIntegration(integrationId: string): Promise<TestResult>
  async getIntegrationStatus(integrationId: string): Promise<IntegrationStatus>
}
```

### 6. System & Maintenance Module

**Core Purpose:** Essential system administration and basic maintenance tools.

**API Endpoints:**
```
// System Health
GET    /api/v1/system/health                  // System health check
GET    /api/v1/system/logs                    // System logs
POST   /api/v1/system/logs/clear              // Clear logs

// Basic Backup
POST   /api/v1/system/backup                  // Create backup
GET    /api/v1/system/backups                 // List backups
POST   /api/v1/system/restore/:id             // Restore from backup

// Database Maintenance
POST   /api/v1/system/database/optimize        // Optimize database
GET    /api/v1/system/database/stats           // Database statistics
POST   /api/v1/system/database/migrate         // Run migrations
```

**Key Features:**
- Basic system health monitoring
- Simple backup and recovery
- Essential database maintenance
- Basic log management

**System Services:**
```typescript
class HealthMonitoringService {
  async performHealthCheck(): Promise<HealthCheckResult>
  async getSystemMetrics(): Promise<SystemMetrics>
}

class BackupService {
  async createBackup(type: BackupType): Promise<Backup>
  async restoreFromBackup(backupId: string): Promise<RestoreResult>
  async getBackupHistory(): Promise<Backup[]>
}

class DatabaseMaintenanceService {
  async optimizeDatabase(): Promise<OptimizationResult>
  async getDatabaseStatistics(): Promise<DatabaseStats>
}
```

---

## Technical Architecture Overview

### **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Admin Panel   │   Public Site   │   Public API             │
│   (React SPA)   │   (React)       │   (Booking Interest)    │
└─────────────────┴─────────────────┴─────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │   API Gateway  │
                    │   (Express.js) │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│   Basic Auth   │  │Business Logic│  │Basic Email    │
│   (Simple)     │  │   Services    │  │Service        │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                   │
        └───────────┬──────┴───────────────────┘
                    │
            ┌───────▼───────┐
            │  Data Layer    │
            │               │
    ┌───────▼───────┐ ┌─────▼─────┐
    │  PostgreSQL    │ │ File      │
    │   (Primary)    │ │ Storage  │
    └───────────────┘ └───────────┘
```

### **Technology Stack**

**Backend Framework:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for API server
- **ORM**: Prisma for type-safe database operations
- **Database**: PostgreSQL with essential features
- **File Storage**: Local file system

**Basic Security:**
- **Authentication**: JWT-based authentication
- **Authorization**: Basic role-based access control (RBAC)
- **Security**: Helmet.js, CORS, rate limiting
- **Validation**: Zod for request/response validation

**Infrastructure:**
- **Containerization**: Docker and Docker Compose
- **Process Management**: PM2 for production
- **Logging**: Winston with structured logging

**Basic Integration:**
- **Email**: Basic email notifications for new booking interests

### **Database Schema Highlights**

**Current Implementation:**
- **Database Provider:** PostgreSQL with essential features
- **ORM:** Prisma with type-safe database operations
- **Connection Pooling:** Standard pool configuration
- **Single-tenant:** Simplified structure for single site management

**Core Tables (Essential):**
- `users` - User accounts with basic authentication and role management
- `sessions` - Basic session management
- `properties` - Property management with basic amenities and pricing
- `rooms` - Room inventory management
- `booking_interests` - Simple booking interest submission and tracking
- `pages` - Basic CMS page management
- `content_blocks` - Simple content block system
- `media` - Basic media library with metadata
- `site_settings` - Essential configuration management

**Database Connection & Configuration:**
- **Environment-based configuration** with secure connection handling
- **Standard connection pooling**: Basic connection management
- **Security features**: SSL/TLS support and secure authentication
- **Performance optimization**: Basic query timeouts and connection reuse

**Key Relationships (Simplified):**
- **User management**: `users` with basic role assignment
- **Property system**: `properties → rooms` with availability tracking
- **Booking interests**: `booking_interests` linked to properties and users
- **Content management**: `pages → content_blocks` for basic content
- **Media organization**: `media` with basic categorization
- **Basic audit system**: Essential operations tracking

**Essential Database Features:**
- **Basic JSONB columns** for flexible content storage
- **Simple role system** (ADMIN, EDITOR, VIEWER)
- **Basic session management** with JWT tokens
- **Essential database indexes** for common query patterns
- **Basic backup and recovery** procedures

### **API Documentation Structure**

**Authentication:**
- Bearer token authentication required for all endpoints
- Role-based access control enforced per endpoint
- API rate limiting and request validation

**Response Format:**
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}
```

**Endpoint Groups:**
1. `/api/v1/admin/dashboard/*` - Dashboard and basic analytics
2. `/api/v1/admin/properties/*` - Property management
3. `/api/v1/admin/booking-interests/*` - Booking interest management
4. `/api/v1/admin/users/*` - User and role management
5. `/api/v1/cms/*` - Basic content management
6. `/api/v1/media/*` - Media management
7. `/api/v1/settings/*` - Basic configuration
8. `/api/v1/system/*` - System administration
9. `/api/v1/public/*` - Public booking interest submission

---

## Implementation Roadmap (Updated for Current State - October 2025)

### **Phase 1: Core Backend API Implementation (Weeks 1-3)**
**Priority: Critical | Status: Ready to Start**

1. **Express.js API Server Foundation**
   - Set up Express server with TypeScript configuration
   - Integrate existing Prisma schema with PostgreSQL
   - Configure middleware (CORS, security, logging, validation)
   - Implement standardized error handling and response formats

2. **Authentication & Authorization Service**
   - Implement JWT authentication with refresh tokens
   - Multi-tenant authentication context (brand/site isolation)
   - Role-based access control (SUPER_ADMIN to VIEWER)
   - Session management and security middleware

3. **User Management Endpoints**
   - Complete user CRUD operations with brand isolation
   - Site-user relationship management
   - User invitation and activation workflows
   - Permission validation middleware

### **Phase 2: Content Management APIs (Weeks 4-6)**
**Priority: High | Status: Foundation Ready**

1. **CMS Core Functionality**
   - Page management endpoints (CRUD, publishing, scheduling)
   - Content block system with version control APIs
   - Navigation management endpoints
   - Content workflow and approval process APIs

2. **Media Management System**
   - File upload and processing service
   - Media library organization and search
   - Image optimization and thumbnail generation
   - Folder management and bulk operations

3. **Settings & Configuration**
   - Brand and site settings management endpoints
   - Template system integration
   - Configuration validation and updates
   - Multi-language support structure

### **Phase 3: Property & Booking System (Weeks 7-9)**
**Priority: High | Status: Schema Ready**

1. **Property Management APIs**
   - Property CRUD operations with amenities
   - Room management and availability tracking
   - Dynamic pricing and rate management
   - Property analytics and reporting endpoints

2. **Booking Interest System**
   - Interest submission and reference code generation
   - Basic availability checking
   - Lead status management (New, Contacted, Confirmed, Archived)
   - Admin lead management and export tools

3. **Dashboard & Analytics**
   - Operational metrics collection
   - Real-time dashboard data endpoints
   - Basic reporting and analytics
   - Performance tracking integration

### **Phase 4: Advanced Features & Integration (Weeks 10-12)**
**Priority: Medium | Status: Planning Phase**

1. **Advanced CMS Features**
   - SEO optimization tools and analytics
   - Content scheduling and automation
   - Advanced search and filtering
   - Content performance analytics

2. **System Administration**
   - Health monitoring and diagnostics
   - Backup and recovery systems
   - Audit trail enhancement
   - System maintenance utilities

3. **Integration Services**
   - Email service integration (notifications)
   - Third-party service webhook handling
   - External API integration framework

### **Phase 5: Testing, Optimization & Deployment (Weeks 13-15)**
**Priority: High | Status: Planning**

1. **Comprehensive Testing Suite**
   - Unit test coverage (>90%) for all services
   - Integration testing for API endpoints
   - End-to-end workflow testing
   - Performance and load testing

2. **Production Deployment Setup**
   - CI/CD pipeline configuration
   - Docker containerization
   - Environment and configuration management
   - Monitoring, logging, and alerting

3. **Documentation & Launch Preparation**
   - OpenAPI/Swagger documentation
   - Admin panel integration guides
   - Deployment and maintenance documentation
   - API usage examples and tutorials

### **Current Implementation Status (October 2025)**

**✅ Completed Foundation:**
- PostgreSQL database schema with full multi-tenancy
- Prisma ORM configuration and relationships
- TypeScript project setup and configuration
- Content management system architecture
- Authentication system design and security framework
- Multi-level user roles and permissions structure
- Audit logging and session management
- Media management foundation
- Version control for content
- Workflow and approval system design

**🔄 In Progress:**
- Frontend component architecture (React + TypeScript)
- Rich text editor components
- Error handling and loading states
- Type safety improvements
- Component testing setup

**📋 Next Immediate Priorities:**
1. Set up Express.js API server with existing database
2. Implement authentication middleware and services
3. Create core API endpoints for users and content
4. Integrate frontend with backend APIs
5. Implement basic admin panel functionality

**Updated Timeline Notes:**
- 15-week total implementation (reduced from 20 weeks)
- Earlier focus on API implementation due to completed foundation
- Parallel frontend/backend development where possible
- Emphasis on core functionality over advanced features initially
- Production-ready deployment by week 15

**Key Implementation Notes:**
- **Database schema is fully implemented** with comprehensive Prisma configuration
- **Multi-tenancy architecture is production-ready** with complete brand/site isolation
- **Content management system foundation is established** with version control and workflows
- **Authentication system is integrated** with JWT-based session management
- **PostgreSQL 15 is configured** with optimized connection pooling and performance settings
- **Comprehensive PostgreSQL optimization recommendations** available in `POSTGRESQL_RECOMMENDATIONS.md`
- **All database adapters and services are implemented** with type-safe operations

---

## Security & Performance Considerations

### **Security Requirements (Current Implementation)**

**Authentication & Authorization:**
- JWT-based authentication with refresh tokens
- Multi-level role-based access control (SUPER_ADMIN to VIEWER)
- Multi-tenant authentication context with brand/site isolation
- Session management with secure token handling
- API rate limiting and request validation

**Data Protection:**
- PostgreSQL encryption at rest and in transit
- Comprehensive audit logging for all operations
- Input validation using Zod schemas
- SQL injection prevention with Prisma ORM
- Row-level security for multi-tenant data isolation
- CORS and security headers implementation

**Current Security Features:**
- Password hashing with bcryptjs
- Session token management
- User activity tracking
- Brand/site data isolation
- Secure file upload handling
- Environment-based configuration

### **Performance Requirements**

**Response Times:**
- API responses: < 300ms (95th percentile)
- Database queries: < 150ms average
- File uploads: Progress tracking
- Search results: < 800ms
- Dashboard loading: < 3s

**Scalability:**
- Support for 500+ concurrent users
- Basic caching with Redis
- Database connection pooling
- File storage optimization

**Reliability:**
- 99% uptime target
- Basic backup systems
- Health monitoring
- Error logging and alerting

---

## Summary

This updated backend scope provides a practical admin panel system with essential features:

**Total API Endpoints:** 100+ endpoints across 9 modules
**Database Tables:** 20+ core tables with relationships
**Key Features:** Multi-tenancy, basic RBAC, operational analytics, content management
**Security:** Basic security with audit trails
**Performance:** Optimized for moderate concurrency and basic scalability
**Integrations:** Ready for basic third-party service integration

The system is designed to handle resort management operations while maintaining security, performance, and reliability. The modular architecture allows for incremental development and deployment, with essential features prioritized in early phases.

**Next Steps:**
1. Begin Phase 1 implementation with basic authentication
2. Set up development environment with database
3. Implement basic API structure
4. Create initial admin interface components
5. Test and validate core functionality

This streamlined backend scope provides the foundation for a functional resort management system that can scale from small properties to medium-sized resort operations.