-- =============================================================================
-- DB-002: PROPERTY AND ROOM SCHEMA OPTIMIZATION
-- Validate relationships, strengthen constraints, and optimize performance
-- =============================================================================

-- Add constraints to ensure data integrity
-- Property constraints
ALTER TABLE properties
ADD CONSTRAINT check_property_base_price_positive
CHECK (basePrice > 0);

ALTER TABLE properties
ADD CONSTRAINT check_property_capacity_positive
CHECK (capacity > 0);

ALTER TABLE properties
ADD CONSTRAINT check_property_min_stay_positive
CHECK (minStay > 0);

ALTER TABLE properties
ADD CONSTRAINT check_property_max_stay_logic
CHECK (maxStay IS NULL OR maxStay >= minStay);

ALTER TABLE properties
ADD CONSTRAINT check_property_coordinates_format
CHECK (
    coordinates IS NULL OR
    (jsonb_typeof(coordinates) = 'object' AND
     (coordinates->>'lat') IS NOT NULL AND
     (coordinates->>'lng') IS NOT NULL)
);

ALTER TABLE properties
ADD CONSTRAINT check_property_address_format
CHECK (
    jsonb_typeof(address) = 'object' AND
    (address->>'street') IS NOT NULL AND
    (address->>'city') IS NOT NULL AND
    (address->>'country') IS NOT NULL
);

-- Room constraints
ALTER TABLE rooms
ADD CONSTRAINT check_room_base_price_positive
CHECK (basePrice > 0);

ALTER TABLE rooms
ADD CONSTRAINT check_room_capacity_positive
CHECK (capacity > 0);

ALTER TABLE rooms
ADD CONSTRAINT check_room_size_positive
CHECK (size IS NULL OR size > 0);

-- Availability constraints
ALTER TABLE availability
ADD CONSTRAINT check_availability_booking_count_logic
CHECK (
    bookedCount >= 0 AND
    maxBookings > 0 AND
    bookedCount <= maxBookings
);

ALTER TABLE availability
ADD CONSTRAINT check_availability_price_override_positive
CHECK (
    priceOverride IS NULL OR priceOverride > 0
);

-- Pricing constraints
ALTER TABLE pricing
ADD CONSTRAINT check_pricing_amount_positive
CHECK (amount > 0);

ALTER TABLE pricing
ADD CONSTRAINT check_pricing_effective_dates_logic
CHECK (
    effectiveTo IS NULL OR effectiveFrom <= effectiveTo
);

ALTER TABLE pricing
ADD CONSTRAINT check_pricing_min_stay_positive
CHECK (
    minStay IS NULL OR minStay > 0
);

ALTER TABLE pricing
ADD CONSTRAINT check_pricing_max_stay_logic
CHECK (
    maxStay IS NULL OR
    minStay IS NULL OR
    maxStay >= minStay
);

ALTER TABLE pricing
ADD CONSTRAINT check_pricing_day_of_week_range
CHECK (
    dayOfWeek IS NULL OR
    (dayOfWeek >= 0 AND dayOfWeek <= 6)
);

-- Add unique constraints where needed
ALTER TABLE properties
ADD CONSTRAINT unique_property_name_per_site
UNIQUE (siteId, name);

ALTER TABLE rooms
ADD CONSTRAINT unique_room_name_per_property
UNIQUE (propertyId, name);

-- Add foreign key constraints with proper actions
-- These should already exist in the schema, but let's ensure they're properly defined

-- Create indexes for optimized property and room queries
-- Property search and filtering indexes
CREATE INDEX idx_properties_site_type_status ON properties(siteId, type, status);
CREATE INDEX idx_properties_site_active_status ON properties(siteId, isActive, status);
CREATE INDEX idx_properties_capacity_range ON properties(capacity) WHERE isActive = true;
CREATE INDEX idx_properties_price_range ON properties(basePrice) WHERE isActive = true;
CREATE INDEX idx_properties_created_at_desc ON properties(createdAt DESC);
CREATE INDEX idx_properties_name_text_search ON properties USING gin(to_tsvector('english', name));
CREATE INDEX idx_properties_description_text_search ON properties USING gin(to_tsvector('english', description));
CREATE INDEX idx_properties_amenities ON properties USING gin(amenities);

-- Room search and filtering indexes
CREATE INDEX idx_rooms_property_active ON rooms(propertyId, isActive);
CREATE INDEX idx_rooms_capacity_range ON rooms(capacity) WHERE isActive = true;
CREATE INDEX idx_rooms_price_range ON rooms(basePrice) WHERE isActive = true;
CREATE INDEX idx_rooms_type_capacity ON rooms(type, capacity);
CREATE INDEX idx_rooms_property_type ON rooms(propertyId, type);
CREATE INDEX idx_rooms_amenities ON rooms USING gin(amenities);
CREATE INDEX idx_rooms_sort_order ON rooms(propertyId, sortOrder DESC, name);

-- Availability optimization indexes
CREATE INDEX idx_availability_property_date_available ON availability(propertyId, date, available);
CREATE INDEX idx_availability_room_date ON availability(roomId, date);
CREATE INDEX idx_availability_date_status ON availability(date, status);
CREATE INDEX idx_availability_available_date ON availability(available, date) WHERE available = true;
CREATE INDEX idx_availability_property_available_dates ON availability(propertyId, date) WHERE available = true;

-- Pricing optimization indexes
CREATE INDEX idx_pricing_property_effective_dates ON pricing(propertyId, effectiveFrom, effectiveTo);
CREATE INDEX idx_pricing_room_effective_dates ON pricing(roomId, effectiveFrom, effectiveTo);
CREATE INDEX idx_pricing_type_active_dates ON pricing(type, isActive, effectiveFrom);
CREATE INDEX idx_pricing_seasonal ON pricing(season, effectiveFrom, effectiveTo) WHERE season IS NOT NULL;
CREATE INDEX idx_pricing_day_of_week ON pricing(dayOfWeek, effectiveFrom, effectiveTo) WHERE dayOfWeek IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX idx_properties_site_capacity_price ON properties(siteId, capacity, basePrice) WHERE isActive = true;
CREATE INDEX idx_rooms_property_capacity_price ON rooms(propertyId, capacity, basePrice) WHERE isActive = true;
CREATE INDEX idx_availability_property_date_status ON availability(propertyId, date, status);

-- Create triggers for maintaining data consistency
-- Property name normalization trigger
CREATE OR REPLACE FUNCTION normalize_property_name()
RETURNS trigger AS $$
BEGIN
    NEW.name = TRIM(NEW.name);
    NEW.name = REGEXP_REPLACE(NEW.name, '\s+', ' ', 'g');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_normalize_property_name
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION normalize_property_name();

-- Room name normalization trigger
CREATE OR REPLACE FUNCTION normalize_room_name()
RETURNS trigger AS $$
BEGIN
    NEW.name = TRIM(NEW.name);
    NEW.name = REGEXP_REPLACE(NEW.name, '\s+', ' ', 'g');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_normalize_room_name
    BEFORE INSERT OR UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION normalize_room_name();

-- Property statistics update trigger
CREATE OR REPLACE FUNCTION update_property_stats()
RETURNS trigger AS $$
BEGIN
    -- Update property statistics when rooms change
    IF TG_TABLE_NAME = 'rooms' THEN
        UPDATE properties
        SET
            updatedAt = NOW()
        WHERE id = NEW.propertyId;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_stats_on_room_change
    AFTER INSERT OR UPDATE OR DELETE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_property_stats();

-- Create functions for common property operations
-- Function to check property availability for a date range
CREATE OR REPLACE FUNCTION check_property_availability(
    p_property_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_guest_count INTEGER DEFAULT 1
)
RETURNS TABLE(
    available_date DATE,
    available_rooms BIGINT,
    total_capacity BIGINT,
    min_price DECIMAL,
    max_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.date,
        COUNT(*) FILTER (WHERE a.available = true) as available_rooms,
        SUM(r.capacity) FILTER (WHERE a.available = true) as total_capacity,
        MIN(COALESCE(a.priceOverride, r.basePrice)) as min_price,
        MAX(COALESCE(a.priceOverride, r.basePrice)) as max_price
    FROM generate_series(p_start_date, p_end_date, INTERVAL '1 day') a_date(date)
    LEFT JOIN availability a ON a.propertyId = p_property_id AND a.date = a_date.date
    LEFT JOIN rooms r ON r.propertyId = p_property_id AND r.isActive = true
    GROUP BY a.date
    ORDER BY a.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get property pricing for a date range
CREATE OR REPLACE FUNCTION get_property_pricing(
    p_property_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    date DATE,
    base_price DECIMAL,
    effective_price DECIMAL,
    pricing_type VARCHAR,
    pricing_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dates.date,
        p.basePrice,
        COALESCE(pr.amount, p.basePrice) as effective_price,
        COALESCE(pr.type, 'STANDARD') as pricing_type,
        COALESCE(pr.name, 'Standard Rate') as pricing_name
    FROM generate_series(p_start_date, p_end_date, INTERVAL '1 day') dates(date)
    LEFT JOIN properties p ON p.id = p_property_id
    LEFT JOIN pricing pr ON pr.propertyId = p_property_id
        AND dates.date BETWEEN pr.effectiveFrom AND COALESCE(pr.effectiveTo, dates.date)
        AND pr.isActive = true
    ORDER BY dates.date;
END;
$$ LANGUAGE plpgsql;

-- Function to search properties with filters
CREATE OR REPLACE FUNCTION search_properties(
    p_site_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_guest_count INTEGER DEFAULT 1,
    p_property_type VARCHAR DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_amenities TEXT[] DEFAULT NULL
)
RETURNS TABLE(
    property_id UUID,
    property_name VARCHAR,
    property_type VARCHAR,
    base_price DECIMAL,
    capacity INTEGER,
    available BOOLEAN,
    total_reviews BIGINT,
    average_rating DECIMAL,
    amenities TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.id,
        p.name,
        p.type,
        p.basePrice,
        p.capacity,
        -- Check availability for the entire date range
        NOT EXISTS (
            SELECT 1 FROM availability a
            WHERE a.propertyId = p.id
            AND a.date BETWEEN p_check_in AND p_check_out - INTERVAL '1 day'
            AND (a.available = false OR a.bookedCount >= a.maxBookings)
        ) as available,
        COALESCE(review_stats.total_reviews, 0) as total_reviews,
        COALESCE(review_stats.average_rating, 0) as average_rating,
        p.amenities
    FROM properties p
    LEFT JOIN (
        SELECT
            propertyId,
            COUNT(*) as total_reviews,
            AVG(rating) as average_rating
        FROM reviews
        WHERE isApproved = true AND isPublic = true
        GROUP BY propertyId
    ) review_stats ON review_stats.propertyId = p.id
    WHERE p.siteId = p_site_id
    AND p.isActive = true
    AND p.status = 'PUBLISHED'
    AND p.capacity >= p_guest_count
    AND (p_property_type IS NULL OR p.type = p_property_type)
    AND (p_min_price IS NULL OR p.basePrice >= p_min_price)
    AND (p_max_price IS NULL OR p.basePrice <= p_max_price)
    AND (p_amenities IS NULL OR p.amenities && p_amenities)
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Create views for common property queries
-- Property summary view with key metrics
CREATE VIEW property_summary AS
SELECT
    p.*,
    COUNT(DISTINCT r.id) as total_rooms,
    COUNT(DISTINCT CASE WHEN r.isActive = true THEN r.id END) as active_rooms,
    COUNT(DISTINCT bi.id) as total_booking_interests,
    COUNT(DISTINCT CASE WHEN bi.status = 'CONFIRMED' THEN bi.id END) as confirmed_bookings,
    COUNT(DISTINCT rev.id) as total_reviews,
    COALESCE(AVG(rev.rating), 0) as average_rating,
    COUNT(DISTINCT pv.id) as total_views,
    MIN(r.basePrice) as min_room_price,
    MAX(r.basePrice) as max_room_price,
    AVG(r.basePrice) as avg_room_price
FROM properties p
LEFT JOIN rooms r ON p.id = r.propertyId
LEFT JOIN booking_interests bi ON p.id = bi.propertyId
LEFT JOIN reviews rev ON p.id = rev.propertyId AND rev.isApproved = true
LEFT JOIN property_views pv ON p.id = pv.propertyId
WHERE p.isActive = true
GROUP BY p.id;

-- Room availability view
CREATE VIEW room_availability_summary AS
SELECT
    r.*,
    p.name as property_name,
    p.type as property_type,
    COUNT(DISTINCT a.id) as total_availability_records,
    COUNT(DISTINCT CASE WHEN a.available = true AND a.date >= CURRENT_DATE THEN a.id END) as future_available_dates,
    MIN(COALESCE(a.priceOverride, r.basePrice)) as min_price,
    MAX(COALESCE(a.priceOverride, r.basePrice)) as max_price
FROM rooms r
JOIN properties p ON r.propertyId = p.id
LEFT JOIN availability a ON r.id = a.roomId
WHERE r.isActive = true AND p.isActive = true
GROUP BY r.id, p.name, p.type;

-- Property pricing summary view
CREATE VIEW property_pricing_summary AS
SELECT
    p.id as property_id,
    p.name as property_name,
    p.basePrice as standard_rate,
    MIN(pr.amount) as min_seasonal_rate,
    MAX(pr.amount) as max_seasonal_rate,
    COUNT(DISTINCT pr.type) as pricing_types_count,
    COUNT(DISTINCT pr.season) as seasons_count,
    ARRAY_AGG(DISTINCT pr.type) as available_pricing_types
FROM properties p
LEFT JOIN pricing pr ON p.id = pr.propertyId AND pr.isActive = true
WHERE p.isActive = true
GROUP BY p.id, p.name, p.basePrice;

-- Add comments for documentation
COMMENT ON TABLE properties IS 'Core resort property definitions with full multi-tenant support';
COMMENT ON TABLE rooms IS 'Individual rooms within properties with capacity and pricing';
COMMENT ON TABLE availability IS 'Daily availability tracking for properties and rooms';
COMMENT ON TABLE pricing IS 'Dynamic pricing rules for properties and rooms';

COMMENT ON FUNCTION check_property_availability IS 'Check availability for a property across a date range';
COMMENT ON FUNCTION get_property_pricing IS 'Get pricing breakdown for a property across dates';
COMMENT ON FUNCTION search_properties IS 'Search properties with comprehensive filtering';

COMMENT ON VIEW property_summary IS 'Property overview with key metrics and statistics';
COMMENT ON VIEW room_availability_summary IS 'Room availability and pricing summary';
COMMENT ON VIEW property_pricing_summary IS 'Property pricing analysis and rate overview';