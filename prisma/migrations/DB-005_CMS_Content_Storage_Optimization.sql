-- DB-005: CMS Content Storage Design Migration
-- This migration implements the CMS content storage optimizations for the resort management system

-- DB-005-2b: Add GIN indexes for JSONB content fields
-- These indexes significantly improve performance for JSON content queries

-- ContentBlock JSON content indexes
CREATE INDEX IF NOT EXISTS idx_content_blocks_content_gin
ON content_blocks USING GIN (content);

CREATE INDEX IF NOT EXISTS idx_content_blocks_configuration_gin
ON content_blocks USING GIN (configuration);

-- Page JSON content indexes (for content, layout, and settings fields)
CREATE INDEX IF NOT EXISTS idx_pages_content_gin
ON pages USING GIN (content);

CREATE INDEX IF NOT EXISTS idx_pages_layout_gin
ON pages USING GIN (layout);

CREATE INDEX IF NOT EXISTS idx_pages_settings_gin
ON pages USING GIN (settings);

-- ContentVersion JSON indexes (for data and changes fields)
CREATE INDEX IF NOT EXISTS idx_content_versions_data_gin
ON content_versions USING GIN (data);

CREATE INDEX IF NOT EXISTS idx_content_versions_changes_gin
ON content_versions USING GIN (changes);

-- SeoMetadata JSON indexes (for structured data and custom meta)
CREATE INDEX IF NOT EXISTS idx_seo_metadata_structured_data_gin
ON seo_metadata USING GIN (structured_data);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_custom_meta_gin
ON seo_metadata USING GIN (custom_meta);

-- Additional performance indexes for complex CMS queries

-- Page performance optimizations (complements existing indexes)
CREATE INDEX IF NOT EXISTS idx_pages_site_status_slug_composite
ON pages (siteId, status, slug);

CREATE INDEX IF NOT EXISTS idx_pages_site_status_published_desc
ON pages (siteId, status, publishedAt DESC);

CREATE INDEX IF NOT EXISTS idx_pages_site_visibility_published_desc
ON pages (siteId, visibility, publishedAt DESC);

CREATE INDEX IF NOT EXISTS idx_pages_site_scheduled_status
ON pages (siteId, scheduledFor, status);

-- ContentBlock performance optimizations
CREATE INDEX IF NOT EXISTS idx_content_blocks_site_page_order_asc
ON content_blocks (siteId, pageId, "order" ASC);

CREATE INDEX IF NOT EXISTS idx_content_blocks_site_type_active
ON content_blocks (siteId, type, "isActive");

CREATE INDEX IF NOT EXISTS idx_content_blocks_page_order_asc
ON content_blocks (pageId, "order" ASC);

-- ContentVersion performance optimizations
CREATE INDEX IF NOT EXISTS idx_content_versions_entity_type_version_desc
ON content_versions (entityId, entityType, version DESC);

CREATE INDEX IF NOT EXISTS idx_content_versions_author_created_desc
ON content_versions (authorId, createdAt DESC);

CREATE INDEX IF NOT EXISTS idx_content_versions_type_status_created_desc
ON content_versions (entityType, status, createdAt DESC);

-- SeoMetadata performance optimizations
CREATE INDEX IF NOT EXISTS idx_seo_metadata_review_score_desc
ON seo_metadata (reviewScore DESC);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_last_reviewed_desc
ON seo_metadata (lastReviewed DESC);

-- Comments section for documentation purposes
COMMENT ON INDEX idx_content_blocks_content_gin IS 'DB-005-2b: GIN index for ContentBlock content JSONB field';
COMMENT ON INDEX idx_content_blocks_configuration_gin IS 'DB-005-2b: GIN index for ContentBlock configuration JSONB field';
COMMENT ON INDEX idx_pages_content_gin IS 'DB-005-2b: GIN index for Page content JSONB field';
COMMENT ON INDEX idx_pages_layout_gin IS 'DB-005-2b: GIN index for Page layout JSONB field';
COMMENT ON INDEX idx_pages_settings_gin IS 'DB-005-2b: GIN index for Page settings JSONB field';
COMMENT ON INDEX idx_content_versions_data_gin IS 'DB-005-2b: GIN index for ContentVersion data JSONB field';
COMMENT ON INDEX idx_content_versions_changes_gin IS 'DB-005-2b: GIN index for ContentVersion changes JSONB field';
COMMENT ON INDEX idx_seo_metadata_structured_data_gin IS 'DB-005-2b: GIN index for SeoMetadata structuredData JSONB field';
COMMENT ON INDEX idx_seo_metadata_custom_meta_gin IS 'DB-005-2b: GIN index for SeoMetadata customMeta JSONB field';
COMMENT ON INDEX idx_pages_site_status_slug_composite IS 'DB-005-2a: Composite index for cms_pages (siteId, status, slug)';
COMMENT ON INDEX idx_pages_site_status_published_desc IS 'DB-005-2a: Index for publish workflow queries';
COMMENT ON INDEX idx_pages_site_visibility_published_desc IS 'DB-005-2a: Index for visibility-based queries';
COMMENT ON INDEX idx_pages_site_scheduled_status IS 'DB-005-2a: Index for scheduled content queries';
COMMENT ON TABLE seo_metadata IS 'DB-005-2c: SEO metadata table keyed by page identifier';