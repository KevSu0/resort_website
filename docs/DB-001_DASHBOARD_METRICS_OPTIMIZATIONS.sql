-- =============================================================================
-- DB-001: DASHBOARD METRICS PERSISTENCE OPTIMIZATIONS
-- =============================================================================

-- =============================================================================
-- DB-001-2a: Add composite index on booking_interests (siteId, status, submittedAt)
-- =============================================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_interests_dashboard_metrics
ON booking_interests (siteId, status, submittedAt DESC);

-- Additional supporting indexes for booking analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_interests_site_date
ON booking_interests (siteId, submittedAt DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_interests_property_status
ON booking_interests (propertyId, status, submittedAt DESC);

-- =============================================================================
-- DB-001-2b: Create daily rollup index on property_views (siteId, viewedAt)
-- =============================================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_views_daily_rollup
ON property_views (siteId, date_trunc('day', viewedAt) DESC, viewedAt DESC);

-- Additional indexes for property analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_views_property_daily
ON property_views (propertyId, date_trunc('day', viewedAt) DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_views_site_property
ON property_views (siteId, propertyId, viewedAt DESC);

-- =============================================================================
-- DB-001-2c: Enforce unique service key on system_health table
-- =============================================================================
-- Note: The unique constraint already exists on 'service' field
-- Adding site-specific unique constraint for multi-tenant scenarios
ALTER TABLE system_health
DROP CONSTRAINT IF EXISTS system_health_service_key;

ALTER TABLE system_health
ADD CONSTRAINT system_health_service_site_key
UNIQUE (service, COALESCE(siteId, 'global'));

-- Supporting index for health queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_health_site_service_status
ON system_health (COALESCE(siteId, 'global'), service, status, lastChecked DESC);

-- =============================================================================
-- DB-001-1b: Consolidated Site-Scoped Dashboard Metrics Views
-- =============================================================================

-- Main Dashboard KPI View - Site scoped metrics
CREATE OR REPLACE VIEW dashboard_site_metrics AS
WITH
property_metrics AS (
  SELECT
    siteId,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN isActive = true THEN 1 END) as active_properties,
    COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published_properties,
    COUNT(CASE WHEN status = 'MAINTENANCE' THEN 1 END) as maintenance_properties,
    SUM(capacity) as total_capacity,
    AVG(basePrice) as avg_base_price,
    MIN(basePrice) as min_price,
    MAX(basePrice) as max_price,
    COUNT(DISTINCT type) as property_types_count
  FROM properties
  GROUP BY siteId
),
booking_metrics AS (
  SELECT
    siteId,
    COUNT(*) as total_interests,
    COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_interests,
    COUNT(CASE WHEN status = 'CONTACTED' THEN 1 END) as contacted_interests,
    COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_interests,
    COUNT(CASE WHEN status = 'ARCHIVED' THEN 1 END) as archived_interests,
    COUNT(CASE WHEN submittedAt >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as interests_last_7_days,
    COUNT(CASE WHEN submittedAt >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as interests_last_30_days,
    COUNT(CASE WHEN confirmedAt IS NOT NULL THEN 1 END) as total_confirmed,
    ROUND(
      COUNT(CASE WHEN confirmedAt IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0),
      2
    ) as conversion_rate_pct
  FROM booking_interests
  GROUP BY siteId
),
view_metrics AS (
  SELECT
    siteId,
    COUNT(*) as total_views,
    COUNT(CASE WHEN viewedAt >= CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as views_today,
    COUNT(CASE WHEN viewedAt >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
    COUNT(CASE WHEN viewedAt >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
    COUNT(DISTINCT propertyId) as unique_properties_viewed,
    COUNT(DISTINCT sessionId) as unique_sessions,
    COUNT(DISTINCT ipAddress) as unique_visitors
  FROM property_views
  GROUP BY siteId
),
health_metrics AS (
  SELECT
    COALESCE(siteId, 'global') as siteId,
    COUNT(*) as total_services,
    COUNT(CASE WHEN status = 'HEALTHY' THEN 1 END) as healthy_services,
    COUNT(CASE WHEN status = 'DEGRADED' THEN 1 END) as degraded_services,
    COUNT(CASE WHEN status = 'UNHEALTHY' THEN 1 END) as unhealthy_services,
    COUNT(CASE WHEN status = 'DOWN' THEN 1 END) as down_services,
    ROUND(AVG(responseTime), 2) as avg_response_time_ms,
    MAX(lastChecked) as last_health_check
  FROM system_health
  GROUP BY COALESCE(siteId, 'global')
)
SELECT
  s.id as siteId,
  s.name as site_name,
  s.brandId,

  -- Property Metrics
  COALESCE(pm.total_properties, 0) as total_properties,
  COALESCE(pm.active_properties, 0) as active_properties,
  COALESCE(pm.published_properties, 0) as published_properties,
  COALESCE(pm.maintenance_properties, 0) as maintenance_properties,
  COALESCE(pm.total_capacity, 0) as total_capacity,
  COALESCE(pm.avg_base_price, 0) as avg_base_price,
  COALESCE(pm.min_price, 0) as min_price,
  COALESCE(pm.max_price, 0) as max_price,
  COALESCE(pm.property_types_count, 0) as property_types_count,

  -- Booking Metrics
  COALESCE(bm.total_interests, 0) as total_interests,
  COALESCE(bm.new_interests, 0) as new_interests,
  COALESCE(bm.contacted_interests, 0) as contacted_interests,
  COALESCE(bm.confirmed_interests, 0) as confirmed_interests,
  COALESCE(bm.archived_interests, 0) as archived_interests,
  COALESCE(bm.interests_last_7_days, 0) as interests_last_7_days,
  COALESCE(bm.interests_last_30_days, 0) as interests_last_30_days,
  COALESCE(bm.total_confirmed, 0) as total_confirmed,
  COALESCE(bm.conversion_rate_pct, 0) as conversion_rate_pct,

  -- View Metrics
  COALESCE(vm.total_views, 0) as total_views,
  COALESCE(vm.views_today, 0) as views_today,
  COALESCE(vm.views_last_7_days, 0) as views_last_7_days,
  COALESCE(vm.views_last_30_days, 0) as views_last_30_days,
  COALESCE(vm.unique_properties_viewed, 0) as unique_properties_viewed,
  COALESCE(vm.unique_sessions, 0) as unique_sessions,
  COALESCE(vm.unique_visitors, 0) as unique_visitors,

  -- Health Metrics
  COALESCE(hm.total_services, 0) as total_services,
  COALESCE(hm.healthy_services, 0) as healthy_services,
  COALESCE(hm.degraded_services, 0) as degraded_services,
  COALESCE(hm.unhealthy_services, 0) as unhealthy_services,
  COALESCE(hm.down_services, 0) as down_services,
  COALESCE(hm.avg_response_time_ms, 0) as avg_response_time_ms,
  hm.last_health_check,

  -- Calculated KPIs
  CASE
    WHEN COALESCE(vm.total_views, 0) > 0
    THEN ROUND(COALESCE(bm.total_confirmed, 0) * 100.0 / vm.total_views, 2)
    ELSE 0
  END as view_to_booking_conversion_pct,

  CASE
    WHEN COALESCE(bm.total_interests, 0) > 0
    THEN ROUND(COALESCE(bm.confirmed_interests, 0) * 100.0 / bm.total_interests, 2)
    ELSE 0
  END as interest_confirmation_rate_pct,

  CURRENT_TIMESTAMP as last_updated
FROM sites s
LEFT JOIN property_metrics pm ON s.id = pm.siteId
LEFT JOIN booking_metrics bm ON s.id = bm.siteId
LEFT JOIN view_metrics vm ON s.id = vm.siteId
LEFT JOIN health_metrics hm ON s.id = hm.siteId
WHERE s.isActive = true;

-- =============================================================================
-- Additional Dashboard Views for Time-Based Analytics
-- =============================================================================

-- Daily metrics rollup for trend analysis
CREATE OR REPLACE VIEW dashboard_daily_metrics AS
WITH
daily_booking_metrics AS (
  SELECT
    siteId,
    DATE(submittedAt) as metric_date,
    COUNT(*) as daily_interests,
    COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_interests,
    COUNT(CASE WHEN status = 'CONTACTED' THEN 1 END) as contacted_interests,
    COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_interests
  FROM booking_interests
  WHERE submittedAt >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY siteId, DATE(submittedAt)
),
daily_view_metrics AS (
  SELECT
    siteId,
    DATE(viewedAt) as metric_date,
    COUNT(*) as daily_views,
    COUNT(DISTINCT propertyId) as unique_properties_viewed,
    COUNT(DISTINCT sessionId) as unique_sessions,
    COUNT(DISTINCT ipAddress) as unique_visitors
  FROM property_views
  WHERE viewedAt >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY siteId, DATE(viewedAt)
)
SELECT
  COALESCE(bm.siteId, vm.siteId) as siteId,
  COALESCE(bm.metric_date, vm.metric_date) as metric_date,
  COALESCE(bm.daily_interests, 0) as daily_interests,
  COALESCE(bm.new_interests, 0) as new_interests,
  COALESCE(bm.contacted_interests, 0) as contacted_interests,
  COALESCE(bm.confirmed_interests, 0) as confirmed_interests,
  COALESCE(vm.daily_views, 0) as daily_views,
  COALESCE(vm.unique_properties_viewed, 0) as unique_properties_viewed,
  COALESCE(vm.unique_sessions, 0) as unique_sessions,
  COALESCE(vm.unique_visitors, 0) as unique_visitors,
  CASE
    WHEN COALESCE(vm.daily_views, 0) > 0
    THEN ROUND(COALESCE(bm.confirmed_interests, 0) * 100.0 / vm.daily_views, 2)
    ELSE 0
  END as daily_conversion_rate_pct
FROM daily_booking_metrics bm
FULL OUTER JOIN daily_view_metrics vm
  ON bm.siteId = vm.siteId AND bm.metric_date = vm.metric_date
ORDER BY siteId, metric_date DESC;

-- Popular properties view
CREATE OR REPLACE VIEW dashboard_popular_properties AS
SELECT
  p.siteId,
  p.id as propertyId,
  p.name as property_name,
  p.type as property_type,
  p.basePrice,
  p.capacity,
  COUNT(pv.id) as total_views,
  COUNT(CASE WHEN pv.viewedAt >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
  COUNT(CASE WHEN pv.viewedAt >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
  COUNT(bi.id) as total_interests,
  COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) as confirmed_bookings,
  AVG(r.rating) as avg_rating,
  COUNT(r.id) as total_reviews
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.propertyId
LEFT JOIN booking_interests bi ON p.id = bi.propertyId
LEFT JOIN reviews r ON p.id = r.propertyId AND r.isApproved = true AND r.isPublic = true
WHERE p.isActive = true AND p.status = 'PUBLISHED'
GROUP BY p.siteId, p.id, p.name, p.type, p.basePrice, p.capacity
HAVING COUNT(pv.id) > 0 OR COUNT(bi.id) > 0
ORDER BY total_views DESC, total_interests DESC;

-- Recent activity summary view
CREATE OR REPLACE VIEW dashboard_recent_activity AS
SELECT
  s.id as siteId,
  s.name as site_name,

  -- Recent booking interests
  (SELECT COUNT(*)
   FROM booking_interests bi
   WHERE bi.siteId = s.id
   AND bi.submittedAt >= CURRENT_TIMESTAMP - INTERVAL '24 hours') as recent_interests,

  -- Recent property views
  (SELECT COUNT(*)
   FROM property_views pv
   WHERE pv.siteId = s.id
   AND pv.viewedAt >= CURRENT_TIMESTAMP - INTERVAL '24 hours') as recent_views,

  -- Latest confirmed booking
  (SELECT json_build_object(
     'id', bi.id,
     'referenceCode', bi.referenceCode,
     'customerName', bi.customerName,
     'property', p.name,
     'confirmedAt', bi.confirmedAt
   )
   FROM booking_interests bi
   JOIN properties p ON bi.propertyId = p.id
   WHERE bi.siteId = s.id
   AND bi.status = 'CONFIRMED'
   AND bi.confirmedAt IS NOT NULL
   ORDER BY bi.confirmedAt DESC
   LIMIT 1) as latest_confirmation,

  -- System health status
  (SELECT json_build_object(
     'healthy', COUNT(CASE WHEN sh.status = 'HEALTHY' THEN 1 END),
     'degraded', COUNT(CASE WHEN sh.status = 'DEGRADED' THEN 1 END),
     'unhealthy', COUNT(CASE WHEN sh.status = 'UNHEALTHY' THEN 1 END),
     'down', COUNT(CASE WHEN sh.status = 'DOWN' THEN 1 END),
     'avgResponseTime', ROUND(AVG(sh.responseTime), 2)
   )
   FROM system_health sh
   WHERE COALESCE(sh.siteId, 'global') = s.id OR sh.siteId IS NULL) as health_summary

FROM sites s
WHERE s.isActive = true;

-- =============================================================================
-- Performance Optimization Summary
-- =============================================================================

-- Created indexes:
-- 1. idx_booking_interests_dashboard_metrics: (siteId, status, submittedAt DESC)
-- 2. idx_booking_interests_site_date: (siteId, submittedAt DESC)
-- 3. idx_booking_interests_property_status: (propertyId, status, submittedAt DESC)
-- 4. idx_property_views_daily_rollup: (siteId, date_trunc('day', viewedAt) DESC, viewedAt DESC)
-- 5. idx_property_views_property_daily: (propertyId, date_trunc('day', viewedAt) DESC)
-- 6. idx_property_views_site_property: (siteId, propertyId, viewedAt DESC)
-- 7. idx_system_health_site_service_status: (COALESCE(siteId, 'global'), service, status, lastChecked DESC)

-- Created views:
-- 1. dashboard_site_metrics: Comprehensive site-scoped KPIs
-- 2. dashboard_daily_metrics: Daily rollup for trend analysis (90 days)
-- 3. dashboard_popular_properties: Property performance ranking
-- 4. dashboard_recent_activity: Last 24 hours activity summary

-- These optimizations will provide:
-- - Fast dashboard loading with pre-aggregated metrics
-- - Efficient time-based queries for charts and trends
-- - Popular property analytics for business insights
-- - Real-time activity monitoring
-- - Multi-tenant isolation with site-scoped metrics
-- - Conversion rate calculations across the booking funnel