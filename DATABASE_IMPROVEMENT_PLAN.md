# Resort Website Complete CMS Database Improvement Plan

## Executive Summary

This document outlines a comprehensive database and Content Management System (CMS) improvement strategy for the resort website application. The current system uses IndexedDB, localStorage, and hardcoded content throughout the application, which severely limits content management capabilities. We propose a complete PostgreSQL-based CMS solution that will enable administrators to modify **ALL website content** without touching any code - including page names, navigation, categories, UI text, media, and every aspect of the user experience.

## Key Goal: No Hardcoded Content

**Primary Objective**: Transform the application from a static hardcoded website into a fully dynamic CMS where administrators can modify:
- ✅ All page content and structure
- ✅ Navigation menus and footer links
- ✅ Button labels, messages, and UI text
- ✅ Categories, tags, and content organization
- ✅ Media files and assets
- ✅ SEO meta information
- ✅ Forms and validation messages
- ✅ Email templates and communications
- ✅ Theme colors, fonts, and styling
- ✅ Business information and contact details
- ✅ Error messages and loading states
- ✅ **Literally everything that is currently hardcoded**

## Current State Analysis

### Existing Architecture
- **IndexedDB**: Browser-based storage for structured data (properties, rooms, enquiries, media, etc.)
- **LocalStorage**: Simple key-value storage for public data
- **Storage Limitations**: IndexedDB (~50MB) and LocalStorage (~5MB) quota constraints

### Current Data Entities
- Properties (resorts) with basic information
- Room types with pricing and amenities
- Places (nearby attractions)
- Enquiries (booking requests)
- Media files and assets
- Offers and promotions
- Promo codes and referrers
- Basic application settings

### ⚠️ **CRITICAL ISSUE: Massive Hardcoded Content Problem**

#### Hardcoded Content Analysis Results:
Our comprehensive analysis revealed **extensive hardcoded content** throughout the application that makes it impossible for admins to manage the website without developer involvement:

#### 1. **Navigation & Structure** (Currently Hardcoded)
- **Main Navigation**: "Home", "Properties", "About", "Contact"
- **Footer Links**: All quick links, legal pages, social media
- **Brand Name**: "Wayanad Nature Resorts" and "WNR"
- **Page Routes**: All URL slugs and page structure
- **Breadcrumbs**: Navigation path labels

#### 2. **UI Text & Labels** (Currently Hardcoded)
- **Button Labels**: "Book Now", "View Details", "Explore Properties", "Contact Us"
- **Form Labels**: Input labels, placeholders, validation messages
- **Status Messages**: "Loading...", "No featured properties available"
- **Error Messages**: "Something went wrong", "Property Not Found"
- **Success Messages**: Booking confirmations, form submissions

#### 3. **Page Content** (Currently Hardcoded)
- **Hero Sections**: Headlines like "Discover Wayanad's Natural Paradise"
- **About Content**: Brand descriptions, taglines
- **Feature Sections**: "Why Choose Our Resorts", statistics, highlights
- **Contact Information**: Phone numbers, email addresses, location text
- **SEO Content**: Meta titles, descriptions, keywords

#### 4. **Property Management** (Currently Hardcoded)
- **Categories**: Property types, room categories, amenity categories
- **Labels**: "Featured", "Starting from", "per night", "Guests"
- **Pricing Labels**: Currency symbols, tax notices, fee descriptions
- **Status Labels**: "Available", "Booked", "Under Maintenance"

#### 5. **Business Logic** (Currently Hardcoded)
- **Check-in/out Times**: "2:00 PM", "11:00 AM"
- **Policies**: Cancellation policies, booking rules
- **Contact Methods**: Phone formats, email templates
- **Default Values**: Guest limits, pricing defaults

### Identified Limitations
1. **🚫 No Content Management**: Admins cannot modify any content without code changes
2. **🚫 Scalability Issues**: Storage quota limitations with IndexedDB
3. **🚫 Data Integrity**: No relational constraints or validation
4. **🚫 Missing Features**: No user management, booking confirmations, payments, reviews
5. **🚫 Performance**: No indexing strategies or query optimization
6. **🚫 Security**: Limited access control and no audit trails
7. **🚫 Maintenance**: Every content change requires developer intervention
8. **🚫 Flexibility**: Cannot add new pages, sections, or content types
9. **🚫 Multi-language**: No support for translations
10. **🚫 SEO Control**: Limited SEO optimization capabilities

## Recommended Database Approach: PostgreSQL with Supabase Migration Path

### ✅ **Primary Recommendation: PostgreSQL → Supabase Strategy**

**Development Phase**: Local PostgreSQL with full schema implementation
**Production Phase**: Supabase (managed PostgreSQL) with pg_dump/restore migration

#### **Why This Approach is Optimal:**

1. **🔄 Lowest Migration Friction**: Same database engine (PostgreSQL) ensures seamless transition
2. **🛡️ Preserves Rich Relational Model**: All complex relationships, constraints, and workflows maintained
3. **🚀 Best of Both Worlds**: Local development control + managed production benefits
4. **💰 Cost-Effective Scaling**: Start local, migrate to managed when ready
5. **🔧 DB-Agnostic Code**: Data-access layer ensures smooth transition
6. **⚡ Supabase Advantages**: Built-in auth, real-time, CDN, and API generation

#### **Migration Path:**
```bash
# Development: Local PostgreSQL
docker run --name resort-postgres \
  -e POSTGRES_DB=resort_cms \
  -e POSTGRES_USER=cms_user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

# Production Migration to Supabase
pg_dump -h localhost -U cms_user -d resort_cms > resort_cms_backup.sql
psql 'postgresql://user:pass@host.supabase.co:5432/postgres' -f resort_cms_backup.sql
```

#### **Supabase-Ready Schema Features:**
- **UUID Primary Keys**: Native UUID generation with `gen_random_uuid()`
- **Trigram FTS**: `pg_trgm` extension for advanced search
- **JSONB**: Rich content storage with GIN indexing
- **RLS Ready**: Future Row Level Security implementation
- **Real-time Enabled**: All tables ready for real-time subscriptions

---

## 🎯 **COMPLETE CMS DATABASE SCHEMA (Supabase-Ready)**

This comprehensive PostgreSQL schema enables **complete content management** where **nothing is hardcoded** and admins can control every aspect of the website.

### Core CMS Tables

#### 0. **Multi-Tenancy Foundation**
```sql
-- Brands/Sites - Multi-tenancy support from day one
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE, -- Custom domain for the brand
    subdomain VARCHAR(100) UNIQUE, -- Subdomain if using shared domain
    description TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    accent_color VARCHAR(7),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(10) DEFAULT '24h',
    language_code VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB, -- Brand-specific settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    INDEX idx_brands_slug (slug),
    INDEX idx_brands_domain (domain),
    INDEX idx_brands_active (is_active)
);

-- Sites - Multi-site support per brand
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    site_type VARCHAR(50) DEFAULT 'resort', -- resort, hotel, property
    is_primary BOOLEAN DEFAULT FALSE, -- Primary site for the brand
    settings JSONB, -- Site-specific settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(brand_id, slug),
    INDEX idx_sites_brand (brand_id),
    INDEX idx_sites_primary (brand_id, is_primary)
);
```

#### 1. **Pages & Dynamic Routing**
```sql
-- Pages Management - Complete control over all pages with multi-tenancy
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL, -- Rich content structure
    template_name VARCHAR(100) DEFAULT 'default', -- Page template
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords JSONB, -- Array of keywords
    og_image_url TEXT,

    -- Enhanced Content Lifecycle Management
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    -- DRAFT, IN_REVIEW, SCHEDULED, PUBLISHED, ARCHIVED

    -- Approval Workflow
    approval_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    -- Publishing Controls
    is_homepage BOOLEAN DEFAULT FALSE,
    parent_page_id UUID REFERENCES pages(id),
    sort_order INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    scheduled_publish_at TIMESTAMP,
    scheduled_unpublish_at TIMESTAMP,

    -- Content Governance
    content_lock UUID, -- UUID for lock management
    locked_by UUID REFERENCES users(id),
    locked_at TIMESTAMP,
    expires_at TIMESTAMP,

    -- Version Control
    current_version_id UUID,
    published_version_id UUID,

    -- Audit Fields
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete

    -- Multi-tenancy Constraints
    UNIQUE(brand_id, site_id, slug),
    INDEX idx_pages_brand_site (brand_id, site_id),
    INDEX idx_pages_slug (slug),
    INDEX idx_pages_status (status),
    INDEX idx_pages_parent (parent_page_id),
    INDEX idx_pages_published (status, published_at),
    INDEX idx_pages_scheduled (scheduled_publish_at),
    INDEX idx_pages_approval (approval_status, approved_at)
);

-- Page Content Blocks - Reusable content components with multi-tenancy
CREATE TABLE page_content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    block_type VARCHAR(100) NOT NULL, -- hero, features, testimonials, gallery, etc.
    block_name VARCHAR(255),
    content JSONB NOT NULL, -- Block-specific content
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_blocks_brand_site (brand_id, site_id),
    INDEX idx_blocks_page (page_id, sort_order),
    INDEX idx_blocks_type (block_type)
);

-- Content Block Templates - Reusable block definitions with multi-tenancy
CREATE TABLE content_block_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    block_type VARCHAR(100) NOT NULL,
    template_schema JSONB NOT NULL, -- Schema definition for the block
    default_content JSONB,
    is_system BOOLEAN DEFAULT FALSE, -- System vs user-created templates
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_block_templates_brand (brand_id)
);
```

#### 2. **Navigation & Menu Management**
```sql
-- Navigation Menus - Complete control over site navigation
CREATE TABLE navigation_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 'main_menu', 'footer_menu', 'mobile_menu'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Navigation Items - Individual menu items
CREATE TABLE navigation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES navigation_menus(id) ON DELETE CASCADE,
    parent_item_id UUID REFERENCES navigation_items(id),
    label VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    page_id UUID REFERENCES pages(id), -- Link to CMS page
    external_url TEXT,
    icon VARCHAR(100),
    target VARCHAR(20) DEFAULT '_self', -- _self, _blank
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    css_classes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nav_menu (menu_id, sort_order),
    INDEX idx_nav_parent (parent_item_id)
);
```

#### 3. **UI Text & Content Management**
```sql
-- UI Text Management - All button labels, messages, etc.
CREATE TABLE ui_text_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_key VARCHAR(255) UNIQUE NOT NULL, -- 'button.book_now', 'error.not_found'
    category VARCHAR(100) NOT NULL, -- 'buttons', 'errors', 'messages', 'labels'
    context TEXT, -- Description of where this text is used
    default_value TEXT NOT NULL,
    current_value TEXT NOT NULL,
    language_code VARCHAR(10) DEFAULT 'en',
    is_rich_text BOOLEAN DEFAULT FALSE,
    max_length INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ui_text_key (text_key),
    INDEX idx_ui_text_category (category),
    INDEX idx_ui_text_language (language_code)
);

-- Form Management - Dynamic form builder
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    success_message TEXT,
    redirect_url TEXT,
    submit_button_text VARCHAR(100) DEFAULT 'Submit',
    submit_button_style JSONB, -- CSS styles for button
    notification_emails JSONB, -- Array of email addresses
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form Fields - Individual form fields
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(100) NOT NULL, -- text, email, select, checkbox, etc.
    placeholder TEXT,
    help_text TEXT,
    default_value TEXT,
    validation_rules JSONB, -- Validation rules and messages
    is_required BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    options JSONB, -- For select, radio, checkbox fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_form_fields (form_id, sort_order)
);
```

#### 4. **Enhanced Property Management**
```sql
-- Property Categories - Dynamic categorization
CREATE TABLE property_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    parent_category_id UUID REFERENCES property_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Amenity Categories - Categorized amenities
CREATE TABLE amenity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Properties with full CMS integration
ALTER TABLE properties ADD COLUMN category_id UUID REFERENCES property_categories(id);
ALTER TABLE properties ADD COLUMN meta_title VARCHAR(255);
ALTER TABLE properties ADD COLUMN meta_description TEXT;
ALTER TABLE properties ADD COLUMN meta_keywords JSONB;
ALTER TABLE properties ADD COLUMN custom_fields JSONB; -- Flexible custom fields
ALTER TABLE properties ADD COLUMN created_by UUID NOT NULL REFERENCES users(id);
ALTER TABLE properties ADD COLUMN updated_by UUID REFERENCES users(id);

-- Enhanced Room Types
ALTER TABLE room_types ADD COLUMN category_id UUID REFERENCES property_categories(id);
ALTER TABLE room_types ADD COLUMN meta_title VARCHAR(255);
ALTER TABLE room_types ADD COLUMN meta_description TEXT;
ALTER TABLE room_types ADD COLUMN custom_fields JSONB;
ALTER TABLE room_types ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE room_types ADD COLUMN updated_by UUID REFERENCES users(id);
```

#### 5. **Advanced Media Management System**
```sql
-- Media Files - Complete media management with CDN and derivative support
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,

    -- Basic File Information
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- Image/Video Dimensions
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- For videos in seconds
    aspect_ratio VARCHAR(20),

    -- Content Metadata
    alt_text TEXT,
    caption TEXT,
    description TEXT,
    title VARCHAR(255),

    -- SEO and Accessibility
    seo_title VARCHAR(255),
    seo_description TEXT,
    focus_point JSONB, -- {x: 0.5, y: 0.5} for smart cropping
    is_public BOOLEAN DEFAULT TRUE,

    -- Organization
    folder_path VARCHAR(500) DEFAULT 'root',
    tags JSONB, -- Array of tags
    category VARCHAR(100),

    -- EXIF and Technical Data
    exif_data JSONB, -- Extracted EXIF data (camera, settings, etc.)
    color_profile VARCHAR(50),
    has_transparency BOOLEAN DEFAULT FALSE,
    dominant_colors JSONB, -- Array of dominant hex colors

    -- Processing Information
    processing_status VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING, PROCESSING, COMPLETED, FAILED
    processing_error TEXT,
    auto_generated_alt_text TEXT, -- AI-generated alt text
    content_rating VARCHAR(20), -- G, PG, PG-13, R for content filtering

    -- CDN and Storage
    cdn_url TEXT,
    storage_provider VARCHAR(50) DEFAULT 'local', -- local, s3, cloudinary, etc.
    storage_path TEXT,
    backup_path TEXT,
    is_optimized BOOLEAN DEFAULT FALSE,

    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    referrer_entities JSONB, -- Array of entities using this media

    -- Content Governance
    copyright_holder VARCHAR(255),
    license_type VARCHAR(50), -- creative_commons, royalty_free, etc.
    license_url TEXT,
    attribution_required BOOLEAN DEFAULT FALSE,

    -- Version Control
    original_file_id UUID REFERENCES media_files(id),
    is_derivative BOOLEAN DEFAULT FALSE,

    -- Audit Fields
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Multi-tenancy Constraints
    UNIQUE(brand_id, site_id, file_name),
    INDEX idx_media_brand_site (brand_id, site_id),
    INDEX idx_media_folder (folder_path),
    INDEX idx_media_type (mime_type),
    INDEX idx_media_tags USING GIN (tags),
    INDEX idx_media_category (category),
    INDEX idx_media_processing (processing_status),
    INDEX idx_media_cdn (cdn_url),
    INDEX idx_media_usage (usage_count, last_used_at),
    INDEX idx_media_public (is_public),
    FULLTEXT idx_media_search (file_name, alt_text, caption, description)
);

-- Media Derivatives - Different sizes and formats of media files
CREATE TABLE media_derivatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,

    -- Derivative Information
    derivative_type VARCHAR(50) NOT NULL, -- thumbnail, small, medium, large, hero, etc.
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,

    -- Storage Information
    file_path TEXT NOT NULL,
    cdn_url TEXT,
    storage_path TEXT,
    is_optimized BOOLEAN DEFAULT FALSE,

    -- Quality Information
    quality INTEGER, -- 1-100 for images
    compression_ratio DECIMAL(5, 2),

    -- Technical Details
    format VARCHAR(20), -- webp, avif, jpg, png, etc.
    color_space VARCHAR(20), -- srgb, p3, etc.
    has_transparency BOOLEAN DEFAULT FALSE,

    -- Performance Metrics
    load_time_ms INTEGER,
    file_size_reduction_percentage DECIMAL(5, 2),

    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(media_file_id, derivative_type),
    INDEX idx_derivatives_media (media_file_id),
    INDEX idx_derivatives_type (derivative_type),
    INDEX idx_derivatives_size (width, height)
);

-- Media Processing Jobs - Async processing queue for media optimization
CREATE TABLE media_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,

    -- Job Information
    job_type VARCHAR(50) NOT NULL, -- resize, optimize, extract_metadata, generate_derivatives
    status VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED

    -- Processing Parameters
    parameters JSONB, -- Size, quality, format specifications
    priority INTEGER DEFAULT 5, -- 1-10, 1 being highest

    -- Processing Details
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    processing_time_ms INTEGER,
    worker_id VARCHAR(100),

    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Results
    result_data JSONB, -- Processing results and metadata

    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    INDEX idx_media_jobs_media (media_file_id),
    INDEX idx_media_jobs_status (status, priority),
    INDEX idx_media_jobs_type (job_type),
    INDEX idx_media_jobs_created (created_at)
);

-- Media Folders - Organize media in folders with multi-tenancy
CREATE TABLE media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_folder_id UUID REFERENCES media_folders(id),
    folder_path VARCHAR(500) NOT NULL,
    description TEXT,
    permissions JSONB, -- Access permissions for this folder
    storage_quota_gb INTEGER,
    current_usage_gb INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(brand_id, site_id, folder_path),
    INDEX idx_media_folders_brand (brand_id, site_id),
    INDEX idx_media_folders_parent (parent_folder_id)
);

-- Media Usage Tracking - Where media is used across the system
CREATE TABLE media_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL, -- page, property, user, etc.
    entity_id UUID NOT NULL,
    field_name VARCHAR(255), -- hero_image, gallery, avatar, etc.
    context JSONB, -- Additional context about usage
    first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    INDEX idx_media_usage_media (media_file_id),
    INDEX idx_media_usage_entity (entity_type, entity_id),
    INDEX idx_media_usage_access (last_accessed_at)
);

-- CDN Configuration - CDN settings and endpoints
CREATE TABLE cdn_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL, -- cloudflare, aws, cloudinary, etc.
    base_url TEXT NOT NULL,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    configuration JSONB, -- Provider-specific configuration
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cdn_brand (brand_id),
    INDEX idx_cdn_active (is_active)
);
```

#### 6. **Theme & Styling Management**
```sql
-- Theme Settings - Complete visual customization
CREATE TABLE theme_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, color, number, boolean, json
    category VARCHAR(100), -- colors, typography, layout, custom
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Whether this affects frontend
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_theme_category (category),
    INDEX idx_theme_public (is_public)
);

-- Color Schemes - Predefined color palettes
CREATE TABLE color_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) NOT NULL, -- Hex color
    secondary_color VARCHAR(7) NOT NULL,
    accent_color VARCHAR(7) NOT NULL,
    background_color VARCHAR(7) NOT NULL,
    text_color VARCHAR(7) NOT NULL,
    custom_colors JSONB, -- Additional colors
    is_active BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Typography Settings
CREATE TABLE typography_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element VARCHAR(100) NOT NULL, -- h1, h2, h3, body, button
    font_family VARCHAR(255) NOT NULL,
    font_size VARCHAR(50) NOT NULL,
    font_weight VARCHAR(50) NOT NULL,
    line_height VARCHAR(50),
    letter_spacing VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. **Email Template Management**
```sql
-- Email Templates - Complete email customization
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    template_key VARCHAR(255) UNIQUE NOT NULL, -- 'booking_confirmation', 'contact_reply'
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB, -- Available template variables
    is_system BOOLEAN DEFAULT FALSE, -- System vs user templates
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Logs - Track sent emails
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES email_templates(id),
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT,
    variables JSONB,
    status VARCHAR(20) NOT NULL, -- SENT, FAILED, PENDING
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_to (to_email),
    INDEX idx_email_status (status),
    INDEX idx_email_date (sent_at)
);
```

#### 8. **Settings & Configuration**
```sql
-- Site Settings - Complete configuration management
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    category VARCHAR(100) NOT NULL, -- general, contact, booking, seo
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    validation_rules JSONB,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_settings_category (category),
    INDEX idx_settings_public (is_public)
);

-- Business Information - Dynamic business details
CREATE TABLE business_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    tagline TEXT,
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(100),
    business_license VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    working_hours JSONB, -- Operating hours
    social_links JSONB, -- Social media URLs
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. **Enhanced Content Version & Workflow**
```sql
-- Content Versions - Enhanced version control with diff tracking
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL, -- page, property, ui_text, etc.
    entity_id UUID NOT NULL,
    version_number INTEGER NOT NULL,

    -- Version Content
    content JSONB NOT NULL,
    previous_version_id UUID REFERENCES content_versions(id),

    -- Change Tracking
    change_summary TEXT,
    change_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH
    changed_fields JSONB, -- Array of changed field names
    content_diff JSONB, -- Structured diff of changes

    -- Publishing Context
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    scheduled_publish_at TIMESTAMP,

    -- Rollback Support
    rollback_from_version_id UUID REFERENCES content_versions(id),
    rollback_reason TEXT,

    -- Metadata
    content_size INTEGER, -- Size in characters/bytes
    checksum VARCHAR(64), -- SHA-256 hash for integrity

    -- Audit Fields
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Multi-tenancy Constraints
    INDEX idx_content_version_entity (entity_type, entity_id, version_number),
    INDEX idx_content_version_brand (brand_id, site_id),
    INDEX idx_content_version_published (is_published, published_at),
    INDEX idx_content_version_previous (previous_version_id),
    INDEX idx_content_version_checksum (checksum),
    INDEX idx_content_version_date (created_at)
);

-- Content Workflows - Enhanced approval processes
CREATE TABLE content_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    version_id UUID REFERENCES content_versions(id),

    -- Workflow Configuration
    workflow_type VARCHAR(50) NOT NULL, -- PUBLISH, UPDATE, DELETE, ARCHIVE
    workflow_definition JSONB, -- Workflow steps and approvers

    -- Status Management
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    -- PENDING, IN_REVIEW, APPROVED, REJECTED, CANCELLED, COMPLETED

    -- Approval Process
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 1,
    required_approvers JSONB, -- Array of required approver roles/IDs

    -- Request Information
    requested_by UUID NOT NULL REFERENCES users(id),
    request_reason TEXT,
    priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT

    -- Approval Chain
    approvals JSONB, -- Array of approval objects
    current_approver UUID REFERENCES users(id),

    -- Publishing Window
    requested_publish_at TIMESTAMP,
    approved_publish_at TIMESTAMP,
    expires_at TIMESTAMP,

    -- Review Process
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    rejection_reason TEXT,

    -- Notification
    notification_sent BOOLEAN DEFAULT FALSE,
    last_notification_at TIMESTAMP,

    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    -- Multi-tenancy Constraints
    INDEX idx_workflow_entity (entity_type, entity_id),
    INDEX idx_workflow_brand (brand_id, site_id),
    INDEX idx_workflow_status (status, current_step),
    INDEX idx_workflow_requester (requested_by),
    INDEX idx_workflow_approver (current_approver),
    INDEX idx_workflow_publish (approved_publish_at),
    INDEX idx_workflow_priority (priority, status)
);

-- Content Publishing Windows - Scheduled publishing with time windows
CREATE TABLE content_publishing_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,

    -- Window Definition
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week JSONB, -- Array of days (1-7)
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Window Rules
    max_content_per_window INTEGER,
    required_approval_level VARCHAR(50), -- ROLE level required
    auto_publish BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Multi-tenancy Constraints
    INDEX idx_publishing_window_brand (brand_id, site_id),
    INDEX idx_publishing_window_active (is_active, timezone),
    INDEX idx_publishing_window_schedule (days_of_week, start_time)
);

#### 10. **Multi-language Support**
```sql
-- Languages - Supported languages
CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, -- en, es, fr, etc.
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Translations - All content translations
CREATE TABLE content_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    language_code VARCHAR(10) NOT NULL REFERENCES languages(code),
    field_name VARCHAR(255) NOT NULL,
    translated_value TEXT,
    is_translated BOOLEAN DEFAULT FALSE,
    translated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id, language_code, field_name),
    INDEX idx_translation_entity (entity_type, entity_id),
    INDEX idx_translation_language (language_code)
);
```

### Schema Design
```sql
-- Core Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    check_in TIME DEFAULT '15:00',
    check_out TIME DEFAULT '11:00',
    hero_image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room Types
CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    base_rate DECIMAL(10, 2),
    size_sqm INTEGER,
    bed_configuration TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, slug)
);

-- Room Amenities
CREATE TABLE room_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    amenity_category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_type_id, amenity_name)
);

-- Property Amenities
CREATE TABLE property_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    amenity_category VARCHAR(50),
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, amenity_name)
);

-- Media Management
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'property', 'room', 'place'
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_media_entity (entity_type, entity_id),
    INDEX idx_media_primary (entity_type, entity_id, is_primary)
);

-- Nearby Places
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    distance_km DECIMAL(5, 2),
    travel_time TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Permissions
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permission_name, resource_type)
);

-- Enquiries
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code VARCHAR(20) UNIQUE NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id),
    room_type_id UUID REFERENCES room_types(id),
    start_date DATE NOT NULL,
    end_date DATE,
    adults INTEGER NOT NULL CHECK (adults > 0),
    children INTEGER DEFAULT 0 CHECK (children >= 0),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'NEW',
    source VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES enquiries(id),
    confirmation_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    check_in_actual TIMESTAMP,
    check_out_actual TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    gateway_response TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews and Ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    room_type_id UUID REFERENCES room_types(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    response_text TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offers and Promotions
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scope VARCHAR(20) NOT NULL, -- 'GLOBAL', 'PROPERTY', 'ROOM'
    property_id UUID REFERENCES properties(id),
    room_type_id UUID REFERENCES room_types(id),
    discount_type VARCHAR(10) NOT NULL, -- 'PERCENT', 'FIXED'
    discount_value DECIMAL(10, 2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    blackout_dates JSONB,
    days_of_week JSONB,
    min_nights INTEGER,
    min_advance_days INTEGER,
    max_advance_days INTEGER,
    long_stay_nights INTEGER,
    usage_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promo Codes
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(10) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    valid_from DATE,
    valid_to DATE,
    usage_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    per_phone_limit INTEGER,
    scope VARCHAR(20) NOT NULL,
    property_id UUID REFERENCES properties(id),
    room_type_id UUID REFERENCES room_types(id),
    min_nights INTEGER,
    is_referral BOOLEAN DEFAULT FALSE,
    referrer_id UUID REFERENCES referrers(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrers
CREATE TABLE referrers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    code VARCHAR(50) UNIQUE NOT NULL,
    reward_type VARCHAR(20),
    reward_value DECIMAL(10, 2),
    max_rewards INTEGER,
    total_attributions INTEGER DEFAULT 0,
    total_confirmed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_date (created_at)
);

-- Settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    data_type VARCHAR(20) DEFAULT 'STRING',
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, key)
);

-- Availability Calendar
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    date DATE NOT NULL,
    available_count INTEGER NOT NULL DEFAULT 1,
    total_count INTEGER NOT NULL DEFAULT 1,
    price_modifier DECIMAL(5, 2) DEFAULT 1.0,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_type_id, date),
    INDEX idx_availability_dates (room_type_id, date)
);

-- Create Indexes for Performance
CREATE INDEX idx_properties_featured ON properties(featured) WHERE featured = TRUE;
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_room_types_property ON room_types(property_id);
CREATE INDEX idx_room_types_capacity ON room_types(capacity);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_dates ON enquiries(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(created_at);
CREATE INDEX idx_reviews_property ON reviews(property_id) WHERE is_public = TRUE;
CREATE INDEX idx_reviews_rating ON reviews(property_id, rating) WHERE is_public = TRUE;
CREATE INDEX idx_offers_active ON offers(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_offers_dates ON offers(valid_from, valid_to);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active, code) WHERE is_active = TRUE;
```

### Option 2: MongoDB with Atlas Search
**Best for**: Rapid development with flexible schema and powerful search capabilities

#### Schema Design
```javascript
// Properties Collection
{
  _id: ObjectId,
  name: String,
  slug: String,
  tagline: String,
  description: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude],
    address: String
  },
  policies: {
    checkIn: String,
    checkOut: String
  },
  media: {
    hero: String,
    gallery: [String]
  },
  amenities: [{
    name: String,
    category: String,
    icon: String
  }],
  featured: Boolean,
  status: String,
  SEO: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdAt: Date,
  updatedAt: Date
}

// Room Types Collection
{
  _id: ObjectId,
  propertyId: ObjectId,
  name: String,
  slug: String,
  description: String,
  capacity: Number,
  size: Number,
  bedConfiguration: String,
  baseRate: Number,
  amenities: [String],
  media: [String],
  status: String,
  availability: [{
    date: Date,
    available: Number,
    price: Number,
    blocked: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}

// Bookings Collection
{
  _id: ObjectId,
  confirmationCode: String,
  propertyId: ObjectId,
  roomTypeId: ObjectId,
  customer: {
    name: String,
    email: String,
    phone: String
  },
  dates: {
    checkIn: Date,
    checkOut: Date,
    nights: Number
  },
  guests: {
    adults: Number,
    children: Number
  },
  pricing: {
    baseRate: Number,
    totalAmount: Number,
    currency: String,
    taxes: Number,
    fees: Number,
    discounts: [{
      type: String,
      amount: Number,
      code: String
    }]
  },
  status: String,
  payments: [{
    amount: Number,
    method: String,
    status: String,
    transactionId: String,
    processedAt: Date
  }],
  reviews: {
    rating: Number,
    comment: String,
    createdAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}

// Users Collection
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  profile: {
    firstName: String,
    lastName: String,
    avatar: String
  },
  role: String,
  permissions: [String],
  isActive: Boolean,
  emailVerified: Boolean,
  lastLogin: Date,
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Option 3: Supabase (PostgreSQL + Real-time)
**Best for**: Quick development with built-in authentication, real-time features, and managed database

#### Schema Design
```sql
-- Similar to PostgreSQL option but with Supabase-specific optimizations
-- Includes RLS (Row Level Security) policies
-- Built-in auth.users table integration
-- Real-time subscriptions enabled
-- Automatic API generation
```

## 🚀 **ENTERPRISE-GRADE CMS IMPLEMENTATION PLAN**

### Implementation Strategy Overview

This implementation plan transforms the resort website from a hardcoded application into an **enterprise-grade Content Management System** with multi-tenancy, advanced content lifecycle management, and sophisticated media handling capabilities.

### Phase 1: Multi-Tenancy & Enterprise Foundation (4-5 weeks)

#### Database Technology Selection (Supabase-Ready)
**Recommendation**: PostgreSQL with Supabase migration path for production

**Development Technology Stack**:
- **Database**: PostgreSQL 15+ locally (Supabase-compatible)
- **Cache**: Redis 7+ for session management and content caching
- **ORM**: Prisma for type-safe, DB-agnostic database operations
- **Migration**: Prisma Migrate + pg_dump/restore for Supabase migration
- **Data Access Layer**: Abstract repository pattern for DB-agnostic code
- **Local Development**: Docker Compose for consistent environment
- **Backup**: pg_dump for development, Supabase automated backups for production

**Production Technology Stack (Supabase)**:
- **Database**: Managed PostgreSQL with Supabase
- **Auth**: Supabase Auth (built-in JWT & user management)
- **Real-time**: Supabase Real-time subscriptions
- **Storage**: Supabase Storage (built-in file storage)
- **Edge Functions**: Supabase Edge Functions for serverless logic
- **API**: Auto-generated REST & GraphQL APIs

#### Development Environment Setup (Docker + PostgreSQL)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: resort_cms
      POSTGRES_USER: cms_user
      POSTGRES_PASSWORD: cms_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-extensions.sql:/docker-entrypoint-initdb.d/init-extensions.sql
    command: postgres -c max_connections=200

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```sql
-- scripts/init-extensions.sql
-- Enable Supabase-compatible extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

#### DB-Agnostic Data Access Layer
```typescript
// lib/database.ts
import { PrismaClient } from '@prisma/client';
import { DatabaseAdapter } from './adapters/database-adapter';

export interface DatabaseConfig {
  type: 'postgresql' | 'supabase';
  url: string;
  options?: any;
}

export class DatabaseService {
  private prisma: PrismaClient;
  private adapter: DatabaseAdapter;

  constructor(config: DatabaseConfig) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.url
        }
      },
      errorFormat: 'pretty'
    });

    // Select appropriate adapter based on database type
    this.adapter = this.createAdapter(config.type);
  }

  private createAdapter(type: string): DatabaseAdapter {
    switch (type) {
      case 'supabase':
        return new SupabaseAdapter(this.prisma);
      case 'postgresql':
      default:
        return new PostgreSQLAdapter(this.prisma);
    }
  }

  // Abstracted methods that work with any database
  async getPage(slug: string, tenantContext: TenantContext) {
    return this.adapter.getPage(slug, tenantContext);
  }

  async createPage(data: any, tenantContext: TenantContext) {
    return this.adapter.createPage(data, tenantContext);
  }

  // ... other abstracted methods
}

// Environment-specific configuration
const config: DatabaseConfig = {
  type: process.env.NODE_ENV === 'production' ? 'supabase' : 'postgresql',
  url: process.env.NODE_ENV === 'production'
    ? process.env.SUPABASE_DB_URL
    : process.env.DATABASE_URL
};

export const db = new DatabaseService(config);
```

#### Enterprise Multi-Tenancy Core Setup
```typescript
// lib/enterprise-cms.ts
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty'
});

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Multi-tenancy context
export interface TenantContext {
  brandId: string;
  siteId?: string;
  userId: string;
  userRole: string;
  permissions: string[];
}

// Enterprise CMS Service Classes
export class EnterpriseCMSService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
    private tenantContext: TenantContext
  ) {}

  // Multi-tenant Content Management
  async getPage(slug: string) {
    const cacheKey = `page:${this.tenantContext.brandId}:${this.tenantContext.siteId || 'default'}:${slug}`;
    let page = await redis.get(cacheKey);

    if (!page) {
      page = await this.prisma.page.findFirst({
        where: {
          slug,
          status: 'PUBLISHED',
          brandId: this.tenantContext.brandId,
          siteId: this.tenantContext.siteId || null
        },
        include: {
          contentBlocks: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          },
          createdBy: { select: { name: true, email: true } }
        }
      });

      if (page) {
        await redis.setex(cacheKey, 3600, JSON.stringify(page));
      }
    }

    return page ? JSON.parse(page) : null;
  }

  // Content Lifecycle Management
  async createPageWithWorkflow(pageData: any, workflowType: string = 'PUBLISH') {
    // Create page with DRAFT status
    const page = await this.prisma.page.create({
      data: {
        ...pageData,
        brandId: this.tenantContext.brandId,
        siteId: this.tenantContext.siteId || null,
        status: 'DRAFT',
        content_lock: crypto.randomUUID(),
        locked_by: this.tenantContext.userId,
        locked_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 min lock
        created_by: this.tenantContext.userId
      }
    });

    // Create initial version
    const version = await this.prisma.contentVersion.create({
      data: {
        brandId: this.tenantContext.brandId,
        siteId: this.tenantContext.siteId || null,
        entityType: 'page',
        entityId: page.id,
        versionNumber: 1,
        content: pageData.content,
        changeType: 'CREATE',
        changeSummary: 'Initial page creation',
        created_by: this.tenantContext.userId
      }
    });

    // Update page with version reference
    await this.prisma.page.update({
      where: { id: page.id },
      data: {
        current_version_id: version.id
      }
    });

    // Create workflow if approval is required
    if (this.requiresApproval(workflowType)) {
      await this.createContentWorkflow(page.id, 'page', workflowType, version.id);
    }

    return { page, version };
  }

  // Advanced Content Version Control with Diff Tracking
  async updateContentWithDiff(entityType: string, entityId: string, updates: any, changeSummary?: string) {
    // Get current version for diff
    const currentVersion = await this.prisma.contentVersion.findFirst({
      where: { entityType, entityId, is_published: true },
      orderBy: { version_number: 'desc' }
    });

    // Calculate diff
    const diff = this.calculateDiff(currentVersion?.content || {}, updates);

    // Create new version
    const newVersion = await this.prisma.contentVersion.create({
      data: {
        brandId: this.tenantContext.brandId,
        siteId: this.tenantContext.siteId || null,
        entityType,
        entityId,
        versionNumber: (currentVersion?.version_number || 0) + 1,
        content: updates,
        previous_version_id: currentVersion?.id,
        changeType: 'UPDATE',
        changeSummary,
        changed_fields: Object.keys(diff),
        content_diff: diff,
        content_size: JSON.stringify(updates).length,
        checksum: this.calculateChecksum(JSON.stringify(updates)),
        created_by: this.tenantContext.userId
      }
    });

    // Update entity with new version reference
    const updatedEntity = await this.updateEntityVersion(entityType, entityId, newVersion.id);

    // Invalidate cache
    await this.invalidateEntityCache(entityType, entityId);

    return { updatedEntity, version: newVersion, diff };
  }

  // Media Management with CDN and Derivatives
  async uploadMediaWithProcessing(file: File, options: any = {}) {
    // Create initial media record
    const media = await this.prisma.mediaFile.create({
      data: {
        brandId: this.tenantContext.brandId,
        siteId: this.tenantContext.siteId || null,
        original_name: file.name,
        file_name: this.generateUniqueFileName(file.name),
        file_size: file.size,
        mime_type: file.type,
        processing_status: 'PENDING',
        uploaded_by: this.tenantContext.userId
      }
    });

    // Upload to storage and create processing jobs
    await this.processMediaFile(media.id, file, options);

    return media;
  }

  // Content Workflow Management
  private async createContentWorkflow(entityId: string, entityType: string, workflowType: string, versionId: string) {
    // Get publishing windows for scheduling
    const publishingWindow = await this.getApprovedPublishingWindow();

    await this.prisma.contentWorkflow.create({
      data: {
        brandId: this.tenantContext.brandId,
        siteId: this.tenantContext.siteId || null,
        entityType,
        entityId,
        versionId,
        workflowType,
        workflow_definition: this.getWorkflowDefinition(workflowType),
        required_approvers: this.getRequiredApprovers(workflowType),
        requested_by: this.tenantContext.userId,
        requested_publish_at: publishingWindow?.start_time || new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
  }

  // Helper Methods
  private calculateDiff(oldContent: any, newContent: any): any {
    // Implement JSON diff algorithm
    const diff: any = {};

    for (const [key, newValue] of Object.entries(newContent)) {
      const oldValue = oldContent[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff[key] = { old: oldValue, new: newValue };
      }
    }

    return diff;
  }

  private calculateChecksum(content: string): string {
    // Generate SHA-256 checksum
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private requiresApproval(workflowType: string): boolean {
    // Check if user role requires approval for this workflow type
    const approvalMatrix = {
      'ADMIN': [],
      'EDITOR': ['PUBLISH', 'DELETE'],
      'AUTHOR': ['PUBLISH', 'UPDATE', 'DELETE'],
      'CONTRIBUTOR': ['PUBLISH', 'UPDATE', 'DELETE']
    };

    return approvalMatrix[this.tenantContext.userRole]?.includes(workflowType) || false;
  }

  private async getApprovedPublishingWindow() {
    return await this.prisma.contentPublishingWindow.findFirst({
      where: {
        brandId: this.tenantContext.brandId,
        siteId: this.tenantContext.siteId || null,
        is_active: true
      },
      orderBy: { start_time: 'asc' }
    });
  }

  // CDN and Media Processing
  private async processMediaFile(mediaId: string, file: File, options: any) {
    // Create processing jobs for different derivative sizes
    const derivativeSizes = [
      { type: 'thumbnail', width: 150, height: 150 },
      { type: 'small', width: 400, height: 300 },
      { type: 'medium', width: 800, height: 600 },
      { type: 'large', width: 1200, height: 900 },
      { type: 'hero', width: 1920, height: 1080 }
    ];

    for (const size of derivativeSizes) {
      await this.prisma.mediaProcessingJob.create({
        data: {
          media_file_id: mediaId,
          job_type: 'generate_derivative',
          parameters: size,
          priority: 5
        }
      });
    }

    // Add metadata extraction job
    await this.prisma.mediaProcessingJob.create({
      data: {
        media_file_id: mediaId,
        job_type: 'extract_metadata',
        priority: 1
      }
    });

    // Add optimization job
    await this.prisma.mediaProcessingJob.create({
      data: {
        media_file_id: mediaId,
        job_type: 'optimize',
        priority: 3
      }
    });
  }
}

export class TenantContextProvider {
  static async getTenantContext(request: Request): Promise<TenantContext> {
    // Extract tenant information from request (subdomain, header, JWT, etc.)
    const brandId = this.extractBrandId(request);
    const siteId = this.extractSiteId(request);
    const user = await this.authenticateUser(request);

    return {
      brandId,
      siteId,
      userId: user.id,
      userRole: user.role,
      permissions: user.permissions
    };
  }
}

export function createEnterpriseCMS(context: TenantContext) {
  return new EnterpriseCMSService(prisma, redis, context);
}
```

#### Infrastructure Setup
```bash
# PostgreSQL Setup Commands
sudo apt update
sudo apt install postgresql-15 postgresql-contrib redis-server

# Database Creation
sudo -u postgres createdb resort_website
sudo -u postgres createuser resort_app

# Redis Configuration
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### Connection Setup
```typescript
// database.ts
import { Pool } from 'pg';
import Redis from 'ioredis';

const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

export { pgPool, redisClient };
```

### Phase 2: CMS Schema & Content Migration (4-5 weeks)

#### Database Schema Implementation
**Step 1: Create CMS Tables**
```sql
-- Create Core CMS Tables
-- Pages, Navigation, UI Text, Media, Theme Settings, etc.
-- (Full schema provided in previous section)
```

**Step 2: Content Migration from Hardcoded Sources**
```typescript
// scripts/contentMigration.ts
import { PrismaClient } from '@prisma/client';

export class ContentMigrationService {
  constructor(private prisma: PrismaClient) {}

  async migrateAllContent(): Promise<void> {
    console.log('Starting content migration...');

    await this.migratePages();
    await this.migrateNavigation();
    await this.migrateUIText();
    await this.migrateBusinessInfo();
    await this.migratePropertyContent();
    await this.migrateThemeSettings();

    console.log('Content migration completed successfully!');
  }

  private async migratePages(): Promise<void> {
    // Create homepage from hardcoded content
    await this.prisma.page.create({
      data: {
        title: 'Home',
        slug: 'home',
        description: 'Wayanad Nature Resorts Homepage',
        content: {
          hero: {
            headline: 'Discover Wayanad\'s Natural Paradise',
            subtitle: 'Experience luxury treehouses, serene lakefront views, and misty mountain retreats',
            cta: { primary: 'Explore Properties', secondary: 'Contact Us' },
            images: ['hero-1.jpg', 'hero-2.jpg', 'hero-3.jpg']
          },
          highlights: {
            title: 'Why Choose Our Resorts',
            subtitle: 'Experience the perfect blend of luxury, nature, and authentic Kerala hospitality',
            items: [
              {
                title: 'Eco-Friendly Stays',
                description: 'Sustainable luxury accommodations harmoniously integrated with nature',
                icon: 'leaf'
              },
              {
                title: 'Unique Experiences',
                description: 'Treehouses, lakefront views, and mountain retreats like nowhere else',
                icon: 'star'
              }
              // ... more highlights
            ]
          },
          featuredProperties: {
            title: 'Our Exclusive Resorts',
            subtitle: 'Choose from our three unique properties, each offering a distinct experience of Wayanad\'s natural beauty'
          }
        },
        meta_title: 'Wayanad Nature Resorts - Luxury Treehouses & Lakefront Retreats',
        meta_description: 'Experience luxury in the lap of nature. Our three unique resorts offer unforgettable experiences amidst the pristine beauty of Wayanad.',
        status: 'PUBLISHED',
        is_homepage: true,
        published_at: new Date()
      }
    });

    // Create properties page
    await this.prisma.page.create({
      data: {
        title: 'Properties',
        slug: 'properties',
        description: 'Browse our luxury resort properties in Wayanad',
        content: {
          hero: {
            headline: 'Our Properties',
            subtitle: 'Discover our unique resorts in Wayanad',
            backgroundImage: 'properties-hero.jpg'
          }
        },
        meta_title: 'Our Properties - Wayanad Nature Resorts',
        meta_description: 'Explore our three unique resort properties in Wayanad, each offering luxury accommodations in stunning natural settings.',
        status: 'PUBLISHED',
        published_at: new Date()
      }
    });
  }

  private async migrateNavigation(): Promise<void> {
    // Create main navigation menu
    const mainMenu = await this.prisma.navigationMenu.create({
      data: {
        name: 'main_menu',
        description: 'Main website navigation',
        created_by: 'system' // Will be updated to actual user ID
      }
    });

    // Add navigation items
    await this.prisma.navigationItem.createMany({
      data: [
        {
          menu_id: mainMenu.id,
          label: 'Home',
          url: '/',
          sort_order: 1
        },
        {
          menu_id: mainMenu.id,
          label: 'Properties',
          url: '/properties',
          sort_order: 2
        },
        {
          menu_id: mainMenu.id,
          label: 'About',
          url: '/about',
          sort_order: 3
        },
        {
          menu_id: mainMenu.id,
          label: 'Contact',
          url: '/contact',
          sort_order: 4
        },
        {
          menu_id: mainMenu.id,
          label: 'Book Now',
          url: '/booking',
          css_classes: 'bg-primary text-white px-6 py-2 rounded-lg',
          sort_order: 5
        }
      ]
    });

    // Create footer navigation
    const footerMenu = await this.prisma.navigationMenu.create({
      data: {
        name: 'footer_menu',
        description: 'Footer navigation links',
        created_by: 'system'
      }
    });

    await this.prisma.navigationItem.createMany({
      data: [
        {
          menu_id: footerMenu.id,
          label: 'Privacy Policy',
          url: '/privacy',
          sort_order: 1
        },
        {
          menu_id: footerMenu.id,
          label: 'Terms of Service',
          url: '/terms',
          sort_order: 2
        },
        {
          menu_id: footerMenu.id,
          label: 'Cancellation Policy',
          url: '/cancellation',
          sort_order: 3
        }
      ]
    });
  }

  private async migrateUIText(): Promise<void> {
    // Migrate all hardcoded UI text
    await this.prisma.uiTextElement.createMany({
      data: [
        // Buttons
        {
          text_key: 'button.book_now',
          category: 'buttons',
          context: 'Primary call-to-action button for bookings',
          default_value: 'Book Now',
          current_value: 'Book Now'
        },
        {
          text_key: 'button.view_details',
          category: 'buttons',
          context: 'View property details button',
          default_value: 'View Details',
          current_value: 'View Details'
        },
        {
          text_key: 'button.contact_us',
          category: 'buttons',
          context: 'Contact page button',
          default_value: 'Contact Us',
          current_value: 'Contact Us'
        },
        {
          text_key: 'button.explore_properties',
          category: 'buttons',
          context: 'Explore properties button',
          default_value: 'Explore Properties',
          current_value: 'Explore Properties'
        },
        // Labels
        {
          text_key: 'label.featured',
          category: 'labels',
          context: 'Featured property badge',
          default_value: 'Featured',
          current_value: 'Featured'
        },
        {
          text_key: 'label.starting_from',
          category: 'labels',
          context: 'Price starting from label',
          default_value: 'Starting from',
          current_value: 'Starting from'
        },
        {
          text_key: 'label.per_night',
          category: 'labels',
          context: 'Per night pricing label',
          default_value: 'per night',
          current_value: 'per night'
        },
        {
          text_key: 'label.guests',
          category: 'labels',
          context: 'Guest count label',
          default_value: 'Guests',
          current_value: 'Guests'
        },
        // Messages
        {
          text_key: 'message.loading',
          category: 'messages',
          context: 'Loading indicator text',
          default_value: 'Loading...',
          current_value: 'Loading...'
        },
        {
          text_key: 'message.no_properties',
          category: 'messages',
          context: 'No properties available message',
          default_value: 'No featured properties available at the moment.',
          current_value: 'No featured properties available at the moment.'
        },
        // Errors
        {
          text_key: 'error.something_went_wrong',
          category: 'errors',
          context: 'General error message',
          default_value: 'Something went wrong',
          current_value: 'Something went wrong'
        },
        {
          text_key: 'error.property_not_found',
          category: 'errors',
          context: 'Property not found error',
          default_value: 'Property Not Found',
          current_value: 'Property Not Found'
        },
        // Navigation
        {
          text_key: 'nav.home',
          category: 'navigation',
          context: 'Home navigation item',
          default_value: 'Home',
          current_value: 'Home'
        },
        {
          text_key: 'nav.properties',
          category: 'navigation',
          context: 'Properties navigation item',
          default_value: 'Properties',
          current_value: 'Properties'
        },
        {
          text_key: 'nav.about',
          category: 'navigation',
          context: 'About navigation item',
          default_value: 'About',
          current_value: 'About'
        },
        {
          text_key: 'nav.contact',
          category: 'navigation',
          context: 'Contact navigation item',
          default_value: 'Contact',
          current_value: 'Contact'
        }
      ]
    });
  }

  private async migrateBusinessInfo(): Promise<void> {
    await this.prisma.businessInformation.create({
      data: {
        company_name: 'Wayanad Nature Resorts',
        tagline: 'Experience luxury in the lap of nature',
        description: 'Our three unique resorts offer unforgettable experiences amidst the pristine beauty of Wayanad.',
        phone: '+91-XXXXXXXXXX',
        email: 'info@wayanadresorts.com',
        address: 'Pozhuthana, Wayanad, Kerala, India',
        city: 'Pozhuthana',
        state: 'Kerala',
        country: 'India',
        postal_code: '673577',
        latitude: 11.6298,
        longitude: 76.0565,
        working_hours: {
          reception: '24/7',
          check_in: '2:00 PM',
          check_out: '11:00 AM'
        },
        social_links: {
          facebook: '#',
          instagram: '#',
          twitter: '#'
        }
      }
    });
  }

  private async migrateThemeSettings(): Promise<void> {
    // Color scheme
    await this.prisma.colorSchemes.create({
      data: {
        name: 'Default',
        primary_color: '#059669',
        secondary_color: '#065f46',
        accent_color: '#f59e0b',
        background_color: '#ffffff',
        text_color: '#111827',
        is_active: true
      }
    });

    // Typography
    await this.prisma.typographySettings.createMany({
      data: [
        {
          element: 'h1',
          font_family: 'Inter, sans-serif',
          font_size: '2.5rem',
          font_weight: '700',
          line_height: '1.2'
        },
        {
          element: 'h2',
          font_family: 'Inter, sans-serif',
          font_size: '2rem',
          font_weight: '600',
          line_height: '1.3'
        },
        {
          element: 'body',
          font_family: 'Inter, sans-serif',
          font_size: '1rem',
          font_weight: '400',
          line_height: '1.6'
        }
      ]
    });
  }
}
```

### Phase 3: Data Migration (2-3 weeks)

#### Data Extraction from IndexedDB
```typescript
// services/dataMigration.ts
export class DataMigrationService {
  async migrateFromIndexedDB(): Promise<void> {
    // Extract existing data
    const indexedDBData = await this.extractIndexedDBData();

    // Transform and validate data
    const transformedData = await this.transformData(indexedDBData);

    // Insert into PostgreSQL
    await this.insertIntoPostgreSQL(transformedData);

    // Verify migration integrity
    await this.verifyMigration();
  }

  private async extractIndexedDBData(): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ResortWebsiteDB');

      request.onsuccess = (event) => {
        const db = request.result;
        const stores = ['properties', 'rooms', 'enquiries', 'media'];
        const data: any = {};

        Promise.all(
          stores.map(store => this.getAllData(db, store))
        ).then(results => {
          stores.forEach((store, index) => {
            data[store] = results[index];
          });
          resolve(data);
        }).catch(reject);
      };
    });
  }
}
```

### Phase 4: API Development (4-5 weeks)

#### RESTful API Design
```typescript
// routes/properties.ts
import express from 'express';
import { PropertyService } from '../services/propertyService';

const router = express.Router();
const propertyService = new PropertyService();

router.get('/properties', async (req, res) => {
  const { featured, limit, offset } = req.query;
  const properties = await propertyService.getProperties({
    featured: featured === 'true',
    limit: parseInt(limit as string) || 10,
    offset: parseInt(offset as string) || 0
  });
  res.json(properties);
});

router.post('/properties', authenticate, authorize('property:create'), async (req, res) => {
  const property = await propertyService.createProperty(req.body);
  res.status(201).json(property);
});
```

### Phase 5: Frontend Integration (3-4 weeks)

#### Service Layer Updates
```typescript
// services/databaseService.ts
export class DatabaseService {
  private apiClient: APIClient;

  constructor() {
    this.apiClient = new APIClient();
  }

  async getProperties(options?: PropertyQueryOptions): Promise<Property[]> {
    return this.apiClient.get('/properties', { params: options });
  }

  async createProperty(property: CreatePropertyDto): Promise<Property> {
    return this.apiClient.post('/properties', property);
  }

  async updateProperty(id: string, updates: UpdatePropertyDto): Promise<Property> {
    return this.apiClient.patch(`/properties/${id}`, updates);
  }
}
```

## Technology Comparison

| Feature | PostgreSQL | MongoDB | Supabase |
|---------|-----------|---------|----------|
| **ACID Compliance** | ✅ Full | ❌ Limited | ✅ Full |
| **Complex Relationships** | ✅ Excellent | ❌ Limited | ✅ Excellent |
| **Scalability** | ✅ Vertical & Horizontal | ✅ Horizontal | ✅ Managed |
| **Performance** | ✅ Excellent | ✅ Good | ✅ Good |
| **Real-time** | ❌ Requires setup | ✅ Built-in | ✅ Built-in |
| **Search** | ✅ Full-text | ✅ Atlas Search | ✅ Built-in |
| **Learning Curve** | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Cost** | 💰💰 | 💰💰 | 💰💰💰 |
| **Maintenance** | 💰💰 | 💰💰 | 💰 |

## Cost Analysis

### Implementation Costs (USD)

| Component | PostgreSQL | MongoDB | Supabase |
|-----------|-----------|---------|----------|
| **Development** | $15,000 | $12,000 | $8,000 |
| **Infrastructure** | $500/month | $400/month | $300/month |
| **Migration** | $5,000 | $4,000 | $2,000 |
| **Training** | $2,000 | $1,500 | $1,000 |
| **Total First Year** | $23,500 | $20,300 | $13,600 |

### Ongoing Costs (Annual)

| Component | PostgreSQL | MongoDB | Supabase |
|-----------|-----------|---------|----------|
| **Hosting** | $6,000 | $4,800 | $3,600 |
| **Maintenance** | $8,000 | $6,000 | $2,400 |
| **Support** | $3,000 | $3,000 | Included |
| **Total** | $17,000 | $13,800 | $6,000 |

## Risk Assessment

### High-Risk Items
1. **Data Loss During Migration** - Mitigate with comprehensive backups
2. **Downtime During Cutover** - Plan for maintenance windows
3. **Performance Regression** - Load testing before production
4. **Security Vulnerabilities** - Security audit and penetration testing

### Medium-Risk Items
1. **Third-Party Dependencies** - Vendor lock-in considerations
2. **Team Training** - Knowledge transfer requirements
3. **Feature Parity** - Ensure all existing features work

### Low-Risk Items
1. **Budget Overruns** - Contingency planning
2. **Timeline Delays** - Agile methodology with buffer time

## Implementation Timeline

### Gantt Chart Overview

```
Phase 1: Foundation Setup     Week 1-3   ██████
Phase 2: Schema Implementation Week 4-7   ████████████
Phase 3: Data Migration      Week 8-10  ████████
Phase 4: API Development     Week 11-15 ████████████████
Phase 5: Frontend Integration Week 16-19 ██████████████
Testing & QA               Week 20-21 ██
Deployment & Go-live       Week 22    ██
```

### Critical Path
1. Database technology selection → Phase 1
2. Schema completion → Phase 2
3. Data migration success → Phase 3
4. API development → Phase 4
5. Frontend integration → Phase 5

## Success Metrics

### Technical Metrics
- **Performance**: Page load time < 2 seconds
- **Availability**: 99.9% uptime
- **Security**: Zero critical vulnerabilities
- **Scalability**: Handle 10x current load

### Business Metrics
- **User Experience**: Improved booking conversion rate
- **Data Integrity**: 100% data accuracy
- **Feature Availability**: All planned features delivered
- **Cost Efficiency**: Within 10% of budget

## Decision Points

### Immediate Decisions (Week 1)
1. **Database Technology Selection** - Choose between PostgreSQL, MongoDB, or Supabase
2. **Budget Approval** - Secure funding for chosen option
3. **Team Assignment** - Allocate development resources

### Phase Gates
1. **After Phase 1** - Infrastructure readiness review
2. **After Phase 2** - Schema validation and approval
3. **After Phase 3** - Data migration verification
4. **After Phase 4** - API functionality testing
5. **After Phase 5** - Integration testing complete

## Final Recommendation: PostgreSQL with Supabase Migration Path ✅

### **Primary Strategy: Local PostgreSQL → Supabase**

**Rationale**: This approach provides the optimal balance of development control and production scalability while preserving the rich relational model and advanced content workflows.

#### **Key Benefits:**
1. **🔄 Zero Migration Risk**: Same database engine ensures 100% compatibility
2. **🛡️ Preserves Complex Workflows**: All approval processes, versioning, and multi-tenancy maintained
3. **🚀 Progressive Enhancement**: Start simple, scale to managed services when needed
4. **💰 Cost Optimization**: No vendor lock-in during development
5. **🔧 Future-Proof Architecture**: DB-agnostic codebase allows provider changes

#### **Migration Strategy:**
```bash
# Development: Full control with local PostgreSQL
docker-compose up -d  # Local development environment
npm run migrate      # Prisma migrations
npm run seed        # Initial data

# Production: Seamless migration to Supabase
pg_dump -h localhost -U cms_user resort_cms > backup.sql
# Upload to Supabase with pg_restore
# Update environment variables to use Supabase
# No code changes required due to DB-agnostic layer
```

#### **Implementation Timeline:**
- **Weeks 1-20**: Local development with PostgreSQL
- **Week 21**: Migration to Supabase (1-2 days)
- **Week 22**: Production deployment with Supabase

### **Why Not Other Options:**

#### ❌ **Direct MongoDB**
- Limited support for complex relational workflows
- No built-in version control for content
- Harder to implement approval workflows
- Loss of ACID compliance for critical booking operations

#### ❌ **Direct Supabase (Skipping Local Development)**
- Reduced development control and debugging capabilities
- Vendor lock-in from day one
- Harder to experiment with schema changes
- Dependency on internet connectivity for development

---

**This PostgreSQL → Supabase strategy provides the ideal foundation for your resort website CMS, ensuring maximum flexibility, minimum risk, and optimal performance for both development and production environments.**

## Key Enhancements Summary

### ✅ **Multi-Tenancy Foundation**
- **Brands & Sites architecture** for future multi-property support
- **Tenant-aware caching** and data isolation
- **No future migrations needed** for scaling to multiple properties
- **Per-brand customization** (colors, domains, settings)

### ✅ **Advanced Content Lifecycle**
- **5-state workflow**: DRAFT → IN_REVIEW → SCHEDULED → PUBLISHED → ARCHIVED
- **Role-based approval matrix** with configurable workflows
- **Content locking** to prevent edit conflicts
- **Publishing windows** for scheduled releases
- **Complete audit trail** with change tracking

### ✅ **Enterprise Version Control**
- **Diff tracking** with before/after comparisons
- **Rollback support** with version history
- **Content integrity** with SHA-256 checksums
- **Change attribution** and approval workflows
- **Size and performance metrics** for all content

### ✅ **Advanced Media Pipeline**
- **Canonical size definitions** (thumbnail, small, medium, large, hero)
- **Automatic derivative generation** on upload
- **EXIF data stripping** for privacy and performance
- **AI-powered alt-text generation** for accessibility
- **CDN integration** with multiple storage providers
- **Content filtering** and copyright management
- **Usage tracking** across all entities

### ✅ **Production Features**
- **Soft deletes** for data recovery
- **Comprehensive indexing** for performance
- **Full-text search** capabilities
- **Cache invalidation** strategies
- **Background job processing** for media optimization
- **Permission-based access control**

## Updated Implementation Timeline

```
Phase 1: Multi-Tenancy & Enterprise Foundation  Week 1-5  ████████████
Phase 2: Advanced Content & Workflow System    Week 6-10 ████████████████
Phase 3: Media Pipeline & CDN Integration     Week 11-14 █████████████
Phase 4: Content Migration & Testing          Week 15-19 ████████████████
Phase 5: Enterprise Admin Interface          Week 20-25 ████████████████████
Staging & UAT                                Week 26-27 ██
Production Deployment                         Week 28    ██
```

## Cost & Resource Updates

### Enhanced Implementation Costs (USD)
| Component | Cost |
|-----------|------|
| **Development** | $28,000 (increased for enterprise features) |
| **Infrastructure** | $800/month (CDN, storage, processing) |
| **Media Pipeline** | $5,000 (image processing, CDN setup) |
| **Multi-tenancy** | $7,000 (tenant isolation, permissions) |
| **Workflow System** | $6,000 (approval processes, versioning) |
| **Testing & QA** | $8,000 (comprehensive testing) |
| **Total First Year** | $59,800 |

## Next Steps

1. **Architecture Review** - Technical review of enterprise schema
2. **Multi-tenancy Planning** - Define brand/site structure
3. **Workflow Definition** - Configure approval processes
4. **Media Pipeline Setup** - Choose CDN and storage providers
5. **Team Assignment** - Allocate specialized resources
6. **Begin Phase 1** - Start enterprise foundation implementation

---

*This enhanced plan provides an enterprise-grade Content Management System with multi-tenancy, advanced content lifecycle management, and sophisticated media handling. The architecture is designed for immediate single-brand deployment while seamlessly supporting future multi-property expansion without requiring schema migrations.*