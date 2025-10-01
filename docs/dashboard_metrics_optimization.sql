-- =============================================================================
-- DB-001: DASHBOARD METRICS PERSISTENCE
-- Resort Management Dashboard KPIs and Performance Optimization
-- =============================================================================

-- Create materialized views for dashboard KPIs
-- These provide fast access to aggregated metrics for the resort dashboard

-- Property Performance Summary View
CREATE MATERIALIZED VIEW property_performance_summary AS
SELECT
    p.siteId,
    p.id as property_id,
    p.name as property_name,
    p.type as property_type,
    p.basePrice,
    p.capacity,
    COUNT(DISTINCT r.id) as total_rooms,
    COUNT(DISTINCT CASE WHEN r.isActive = true THEN r.id END) as active_rooms,
    COUNT(DISTINCT bi.id) as total_booking_interests,
    COUNT(DISTINCT CASE WHEN bi.status = 'CONFIRMED' THEN bi.id END) as confirmed_bookings,
    COUNT(DISTINCT CASE WHEN bi.status = 'NEW' THEN bi.id END) as new_leads,
    COUNT(DISTINCT rev.id) as total_reviews,
    COALESCE(AVG(rev.rating), 0) as average_rating,
    COUNT(DISTINCT pv.id) as total_views,
    COUNT(DISTINCT CASE WHEN pv.viewedAt >= NOW() - INTERVAL '30 days' THEN pv.id END) as views_last_30_days,
    -- Current availability metrics
    COUNT(DISTINCT CASE WHEN a.date = CURRENT_DATE AND a.available = true THEN a.id END) as rooms_available_today,
    COUNT(DISTINCT CASE WHEN a.date = CURRENT_DATE AND a.available = false THEN a.id END) as rooms_unavailable_today,
    -- Pricing analytics
    COALESCE(MIN(pr.amount), p.basePrice) as minimum_price,
    COALESCE(MAX(pr.amount), p.basePrice) as maximum_price,
    COALESCE(AVG(pr.amount), p.basePrice) as average_price,
    p.createdAt as property_created_at,
    p.updatedAt as property_updated_at
FROM properties p
LEFT JOIN rooms r ON p.id = r.propertyId
LEFT JOIN booking_interests bi ON p.id = bi.propertyId
LEFT JOIN reviews rev ON p.id = rev.propertyId
LEFT JOIN property_views pv ON p.id = pv.propertyId
LEFT JOIN availability a ON p.id = a.propertyId
LEFT JOIN pricing pr ON p.id = pr.propertyId AND pr.isActive = true
WHERE p.isActive = true
GROUP BY p.siteId, p.id, p.name, p.type, p.basePrice, p.capacity, p.createdAt, p.updatedAt;

-- Booking Interest Trends View (Last 90 days)
CREATE MATERIALIZED VIEW booking_interest_trends AS
SELECT
    bi.siteId,
    DATE_TRUNC('day', bi.submittedAt) as date,
    COUNT(*) as total_interests,
    COUNT(DISTINCT bi.propertyId) as unique_properties,
    COUNT(DISTINCT CASE WHEN bi.status = 'NEW' THEN bi.id END) as new_leads,
    COUNT(DISTINCT CASE WHEN bi.status = 'CONTACTED' THEN bi.id END) as contacted_leads,
    COUNT(DISTINCT CASE WHEN bi.status = 'CONFIRMED' THEN bi.id END) as confirmed_bookings,
    COUNT(DISTINCT CASE WHEN bi.status = 'ARCHIVED' THEN bi.id END) as archived_leads,
    AVG(EXTRACT(DAY FROM (bi.checkOutDate - bi.checkInDate))) as avg_stay_length,
    AVG(bi.numberOfGuests) as avg_guests_per_booking,
    SUM(CASE WHEN bi.status = 'CONFIRMED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as conversion_rate
FROM booking_interests bi
WHERE bi.submittedAt >= NOW() - INTERVAL '90 days'
GROUP BY bi.siteId, DATE_TRUNC('day', bi.submittedAt);

-- Property Analytics Summary View
CREATE MATERIALIZED VIEW property_analytics_summary AS
SELECT
    p.siteId,
    p.id as property_id,
    p.name as property_name,
    -- Booking funnel metrics
    COUNT(DISTINCT pv.id) as total_views,
    COUNT(DISTINCT bi.id) as total_interests,
    COUNT(DISTINCT CASE WHEN bi.status = 'CONFIRMED' THEN bi.id END) as confirmed_bookings,
    -- Conversion rates
    CASE
        WHEN COUNT(DISTINCT pv.id) > 0
        THEN (COUNT(DISTINCT bi.id) * 100.0 / COUNT(DISTINCT pv.id))
        ELSE 0
    END as view_to_interest_rate,
    CASE
        WHEN COUNT(DISTINCT bi.id) > 0
        THEN (COUNT(DISTINCT CASE WHEN bi.status = 'CONFIRMED' THEN bi.id) * 100.0 / COUNT(DISTINCT bi.id))
        ELSE 0
    END as interest_to_booking_rate,
    -- Guest satisfaction
    COUNT(DISTINCT rev.id) as total_reviews,
    COALESCE(AVG(rev.rating), 0) as average_rating,
    COUNT(DISTINCT CASE WHEN rev.rating >= 4 THEN rev.id END) as positive_reviews,
    COUNT(DISTINCT CASE WHEN rev.rating <= 2 THEN rev.id END) as negative_reviews,
    -- Recent activity (last 30 days)
    COUNT(DISTINCT CASE WHEN pv.viewedAt >= NOW() - INTERVAL '30 days' THEN pv.id END) as views_last_30_days,
    COUNT(DISTINCT CASE WHEN bi.submittedAt >= NOW() - INTERVAL '30 days' THEN bi.id END) as interests_last_30_days,
    COUNT(DISTINCT CASE WHEN rev.createdAt >= NOW() - INTERVAL '30 days' THEN rev.id END) as reviews_last_30_days
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.propertyId
LEFT JOIN booking_interests bi ON p.id = bi.propertyId
LEFT JOIN reviews rev ON p.id = rev.propertyId
WHERE p.isActive = true
GROUP BY p.siteId, p.id, p.name;

-- Revenue and Occupancy Forecast View
CREATE MATERIALIZED VIEW revenue_occupancy_forecast AS
WITH date_range AS (
    SELECT generate_series(
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '90 days',
        INTERVAL '1 day'
    )::date as forecast_date
),
property_daily_forecast AS (
    SELECT
        p.siteId,
        p.id as property_id,
        dr.forecast_date,
        p.basePrice as base_rate,
        COALESCE(pr.amount, p.basePrice) as effective_rate,
        COUNT(DISTINCT r.id) as total_rooms,
        COUNT(DISTINCT CASE WHEN a.available = true AND a.date = dr.forecast_date THEN r.id END) as available_rooms,
        COUNT(DISTINCT CASE WHEN a.available = false AND a.date = dr.forecast_date THEN r.id END) as occupied_rooms,
        -- Historical booking patterns for the same day of week
        COALESCE(
            AVG(CASE
                WHEN EXTRACT(DOW FROM bi.checkInDate) = EXTRACT(DOW FROM dr.forecast_date)
                AND bi.submittedAt >= NOW() - INTERVAL '12 weeks'
                THEN 1
                ELSE 0
            END),
            0.1
        ) as historical_booking_probability
    FROM properties p
    CROSS JOIN date_range dr
    LEFT JOIN rooms r ON p.id = r.propertyId AND r.isActive = true
    LEFT JOIN availability a ON p.id = a.propertyId AND a.date = dr.forecast_date
    LEFT JOIN pricing pr ON p.id = pr.propertyId
        AND dr.forecast_date BETWEEN pr.effectiveFrom AND COALESCE(pr.effectiveTo, CURRENT_DATE + INTERVAL '1 year')
        AND pr.isActive = true
    LEFT JOIN booking_interests bi ON p.id = bi.propertyId
    WHERE p.isActive = true
    GROUP BY p.siteId, p.id, dr.forecast_date, p.basePrice, pr.amount
)
SELECT
    siteId,
    property_id,
    forecast_date,
    total_rooms,
    available_rooms,
    occupied_rooms,
    CASE
        WHEN total_rooms > 0
        THEN (occupied_rooms * 100.0 / total_rooms)
        ELSE 0
    END as occupancy_rate,
    effective_rate,
    (effective_rate * occupied_rooms) as projected_daily_revenue,
    historical_booking_probability,
    (effective_rate * available_rooms * historical_booking_probability) as projected_booked_revenue
FROM property_daily_forecast;

-- Create indexes for optimized dashboard queries
-- Property performance indexes
CREATE INDEX idx_properties_site_active ON properties(siteId, isActive);
CREATE INDEX idx_properties_type_status ON properties(type, status);
CREATE INDEX idx_properties_capacity_price ON properties(capacity, basePrice);
CREATE INDEX idx_properties_created_at ON properties(createdAt);

-- Room indexes for availability queries
CREATE INDEX idx_rooms_property_active ON rooms(propertyId, isActive);
CREATE INDEX idx_rooms_capacity ON rooms(capacity);
CREATE INDEX idx_rooms_type ON rooms(type);

-- Booking interest analytics indexes
CREATE INDEX idx_booking_interests_site_status ON booking_interests(siteId, status);
CREATE INDEX idx_booking_interests_property_date ON booking_interests(propertyId, submittedAt);
CREATE INDEX idx_booking_interests_checkin_dates ON booking_interests(checkInDate, checkOutDate);
CREATE INDEX idx_booking_interests_guest_count ON booking_interests(numberOfGuests);

-- Property views analytics indexes
CREATE INDEX idx_property_views_property_date ON property_views(propertyId, viewedAt);
CREATE INDEX idx_property_views_site_date ON property_views(siteId, viewedAt);

-- Review analytics indexes
CREATE INDEX idx_reviews_property_rating ON reviews(propertyId, rating);
CREATE INDEX idx_reviews_approved_public ON reviews(isApproved, isPublic);
CREATE INDEX idx_reviews_created_at ON reviews(createdAt);

-- Availability and pricing analytics indexes
CREATE INDEX idx_availability_property_date_status ON availability(propertyId, date, status);
CREATE INDEX idx_availability_date_available ON availability(date, available);
CREATE INDEX idx_pricing_property_effective ON pricing(propertyId, effectiveFrom, effectiveTo);
CREATE INDEX idx_pricing_type_active ON pricing(type, isActive);

-- Analytics events indexes
CREATE INDEX idx_analytics_events_site_type ON analytics_events(siteId, eventType);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_entity ON analytics_events(entityType, entityId);

-- Create indexes for materialized views refresh performance
CREATE INDEX idx_property_performance_site ON property_performance_summary(siteId);
CREATE INDEX idx_booking_trends_site_date ON booking_interest_trends(siteId, date);
CREATE INDEX idx_analytics_summary_property ON property_analytics_summary(property_id);
CREATE INDEX idx_forecast_site_date ON revenue_occupancy_forecast(siteId, forecast_date);

-- Create functions to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY property_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY booking_interest_trends;
    REFRESH MATERIALIZED VIEW CONCURRENTLY property_analytics_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY revenue_occupancy_forecast;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled refresh function (can be called by cron job)
CREATE OR REPLACE FUNCTION schedule_dashboard_refresh()
RETURNS void AS $$
BEGIN
    PERFORM refresh_dashboard_metrics();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON property_performance_summary TO public;
GRANT SELECT ON booking_interest_trends TO public;
GRANT SELECT ON property_analytics_summary TO public;
GRANT SELECT ON revenue_occupancy_forecast TO public;

-- Create dashboard performance monitoring view
CREATE VIEW dashboard_query_performance AS
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE tablename IN (
    'property_performance_summary',
    'booking_interest_trends',
    'property_analytics_summary',
    'revenue_occupancy_forecast'
)
ORDER BY schemaname, tablename, attname;