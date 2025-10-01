-- DB-003: Booking Interest Lead Storage Enhancement Migration
-- This migration implements comprehensive lead management and follow-up tracking features

-- Step 1: Add new columns to booking_interests table
ALTER TABLE booking_interests
ADD COLUMN customer_first_name VARCHAR(255),
ADD COLUMN customer_last_name VARCHAR(255),
ADD COLUMN customer_nationality VARCHAR(100),
ADD COLUMN customer_country VARCHAR(100),
ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN adults INTEGER DEFAULT 0,
ADD COLUMN children INTEGER DEFAULT 0,
ADD COLUMN infants INTEGER DEFAULT 0,
ADD COLUMN total_guests INTEGER,
ADD COLUMN budget DECIMAL(10, 2),
ADD COLUMN currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
ADD COLUMN source VARCHAR(50) DEFAULT 'DIRECT' CHECK (source IN ('DIRECT', 'WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'SOCIAL_MEDIA', 'SEARCH_ENGINE', 'PAID_ADVERTISING', 'PARTNER', 'EVENT', 'WALK_IN')),
ADD COLUMN campaign VARCHAR(255),
ADD COLUMN assigned_to VARCHAR(255),
ADD COLUMN follow_up_scheduled TIMESTAMP,
ADD COLUMN expires_at TIMESTAMP,
ADD COLUMN lost_reason TEXT,
ADD COLUMN estimated_value DECIMAL(10, 2),
ADD COLUMN ip_address VARCHAR(45),
ADD COLUMN user_agent TEXT,
ADD COLUMN referrer TEXT,
ADD COLUMN utm_source VARCHAR(255),
ADD COLUMN utm_medium VARCHAR(255),
ADD COLUMN utm_campaign VARCHAR(255);

-- Step 2: Migrate existing customer_name to first_name and last_name
UPDATE booking_interests
SET
    customer_first_name = SPLIT_PART(customer_name, ' ', 1),
    customer_last_name = CASE
        WHEN POSITION(' ' IN customer_name) > 0
        THEN SUBSTRING(customer_name FROM POSITION(' ' IN customer_name) + 1)
        ELSE ''
    END
WHERE customer_name IS NOT NULL AND customer_name != '';

-- Step 3: Migrate existing number_of_guests to new guest structure
UPDATE booking_interests
SET
    total_guests = COALESCE(number_of_guests, 0),
    adults = COALESCE(number_of_guests, 0)
WHERE number_of_guests IS NOT NULL;

-- Step 4: Add new columns to booking_interest_activities table
ALTER TABLE booking_interest_activities
ADD COLUMN type VARCHAR(50) DEFAULT 'NOTE' CHECK (type IN ('NOTE', 'PHONE_CALL', 'EMAIL', 'SMS', 'MEETING', 'QUOTE_SENT', 'FOLLOW_UP', 'REMINDER', 'STATUS_CHANGE', 'ASSIGNMENT')),
ADD COLUMN duration INTEGER,
ADD COLUMN outcome VARCHAR(50) CHECK (outcome IN ('SUCCESS', 'FAILED', 'PENDING', 'NO_ANSWER', 'LEFT_MESSAGE', 'CALLBACK_REQUESTED', 'NOT_INTERESTED', 'QUOTE_REQUESTED', 'BOOKING_CONFIRMED')),
ADD COLUMN next_action TEXT,
ADD COLUMN next_action_at TIMESTAMP;

-- Step 5: Update existing activities to have proper type defaults
UPDATE booking_interest_activities
SET type = CASE
    WHEN action ILIKE '%call%' OR action ILIKE '%phone%' THEN 'PHONE_CALL'
    WHEN action ILIKE '%email%' THEN 'EMAIL'
    WHEN action ILIKE '%sms%' OR action ILIKE '%text%' THEN 'SMS'
    WHEN action ILIKE '%meet%' OR action ILIKE '%appointment%' THEN 'MEETING'
    WHEN action ILIKE '%quote%' OR action ILIKE '%price%' THEN 'QUOTE_SENT'
    WHEN action ILIKE '%follow%' OR action ILIKE '%contact%' THEN 'FOLLOW_UP'
    WHEN action ILIKE '%status%' OR action ILIKE '%change%' THEN 'STATUS_CHANGE'
    WHEN action ILIKE '%assign%' THEN 'ASSIGNMENT'
    ELSE 'NOTE'
END;

-- Step 6: Create new indexes for performance optimization

-- Core lead management indexes
CREATE INDEX idx_booking_interests_site_status_priority_submitted
ON booking_interests (site_id, status, priority, submitted_at DESC);

CREATE INDEX idx_booking_interests_assigned_status_followup
ON booking_interests (assigned_to, status, follow_up_scheduled ASC)
WHERE assigned_to IS NOT NULL;

CREATE INDEX idx_booking_interests_expires_status
ON booking_interests (expires_at, status)
WHERE expires_at IS NOT NULL;

CREATE INDEX idx_booking_interests_email_site
ON booking_interests (customer_email, site_id);

CREATE INDEX idx_booking_interests_phone_site
ON booking_interests (customer_phone, site_id);

CREATE INDEX idx_booking_interests_dates_status
ON booking_interests (check_in_date, check_out_date, status, submitted_at DESC);

-- Additional single-column indexes
CREATE INDEX idx_booking_interests_priority ON booking_interests (priority);
CREATE INDEX idx_booking_interests_source ON booking_interests (source);
CREATE INDEX idx_booking_interests_last_contacted_at ON booking_interests (last_contacted_at);
CREATE INDEX idx_booking_interests_follow_up_scheduled ON booking_interests (follow_up_scheduled);
CREATE INDEX idx_booking_interests_expires_at ON booking_interests (expires_at);

-- Activity performance indexes
CREATE INDEX idx_booking_activities_lead_type_time
ON booking_interest_activities (booking_interest_id, type, performed_at DESC);

CREATE INDEX idx_booking_activities_user_outcome_time
ON booking_interest_activities (performed_by, outcome, performed_at DESC)
WHERE performed_by IS NOT NULL;

CREATE INDEX idx_booking_activities_type_performed_at
ON booking_interest_activities (type, performed_at DESC);

CREATE INDEX idx_booking_activities_outcome_performed_at
ON booking_interest_activities (outcome, performed_at DESC);

-- Step 7: Add data integrity constraints

-- Valid date ranges
ALTER TABLE booking_interests
ADD CONSTRAINT chk_valid_date_range
CHECK (check_out_date > check_in_date);

-- Non-negative guest counts
ALTER TABLE booking_interests
ADD CONSTRAINT chk_non_negative_guests
CHECK (adults >= 0 AND children >= 0 AND infants >= 0 AND total_guests >= 0);

-- Guest count consistency
ALTER TABLE booking_interests
ADD CONSTRAINT chk_guest_count_consistency
CHECK (total_guests = adults + children + infants);

-- Positive budget validation
ALTER TABLE booking_interests
ADD CONSTRAINT chk_positive_budget
CHECK (budget IS NULL OR budget > 0);

-- Positive activity duration
ALTER TABLE booking_interest_activities
ADD CONSTRAINT chk_positive_duration
CHECK (duration IS NULL OR duration > 0);

-- Step 8: Create triggers for automatic updates

-- Function to update last_contacted_at when status changes
CREATE OR REPLACE FUNCTION update_last_contacted_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Update lastContactedAt when status changes to CONTACTED
    IF NEW.status = 'CONTACTED' AND OLD.status != 'CONTACTED' THEN
        NEW.last_contacted_at = NOW();
    END IF;

    -- Set confirmedAt when status changes to CONFIRMED
    IF NEW.status = 'CONFIRMED' AND OLD.status != 'CONFIRMED' THEN
        NEW.confirmed_at = NOW();
    END IF;

    -- Set archivedAt when status changes to ARCHIVED
    IF NEW.status = 'ARCHIVED' AND OLD.status != 'ARCHIVED' THEN
        NEW.archived_at = NOW();
    END IF;

    -- Calculate totalGuests if not set or inconsistent
    IF NEW.total_guests IS NULL OR NEW.total_guests != NEW.adults + NEW.children + NEW.infants THEN
        NEW.total_guests = COALESCE(NEW.adults, 0) + COALESCE(NEW.children, 0) + COALESCE(NEW.infants, 0);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking_interests table
DROP TRIGGER IF EXISTS trigger_update_last_contacted_at ON booking_interests;
CREATE TRIGGER trigger_update_last_contacted_at
    BEFORE UPDATE ON booking_interests
    FOR EACH ROW
    EXECUTE FUNCTION update_last_contacted_at();

-- Function to set lead expiration and reference code
CREATE OR REPLACE FUNCTION set_lead_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiration date for new leads if not already set
    IF NEW.expires_at IS NULL AND NEW.status IN ('NEW', 'CONTACTED', 'HOT', 'WARM') THEN
        NEW.expires_at = NOW() + INTERVAL '7 days';
    END IF;

    -- Generate reference code if not set
    IF NEW.reference_code IS NULL OR NEW.reference_code = '' THEN
        NEW.reference_code = 'LDG' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(EXTRACT(MICROSECONDS FROM NOW())::text, 6, '0');
    END IF;

    -- Set default values for guest counts if not provided
    IF NEW.total_guests IS NULL OR NEW.total_guests = 0 THEN
        NEW.total_guests = COALESCE(NEW.adults, 0) + COALESCE(NEW.children, 0) + COALESCE(NEW.infants, 0);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new booking interests
DROP TRIGGER IF EXISTS trigger_set_lead_expiration ON booking_interests;
CREATE TRIGGER trigger_set_lead_expiration
    BEFORE INSERT ON booking_interests
    FOR EACH ROW
    EXECUTE FUNCTION set_lead_expiration();

-- Step 9: Create performance views

-- Lead pipeline dashboard view
CREATE OR REPLACE VIEW v_lead_pipeline AS
SELECT
    bi.site_id,
    bi.status,
    bi.priority,
    bi.source,
    bi.assigned_to,
    bi.property_id,
    p.name as property_name,
    COUNT(*) as lead_count,
    COUNT(DISTINCT bi.customer_email) as unique_customers,
    AVG(EXTRACT(EPOCH FROM (bi.last_contacted_at - bi.submitted_at))/3600) as avg_response_hours,
    COUNT(CASE WHEN bi.last_contacted_at IS NOT NULL THEN 1 END) as contacted_count,
    COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) as confirmed_count,
    COUNT(CASE WHEN bi.status = 'LOST' THEN 1 END) as lost_count,
    COUNT(CASE WHEN bi.expires_at < NOW() AND bi.status NOT IN ('CONFIRMED', 'ARCHIVED', 'LOST') THEN 1 END) as expired_count,
    SUM(bi.estimated_value) as total_estimated_value,
    AVG(bi.estimated_value) as avg_estimated_value,
    MIN(bi.submitted_at) as earliest_lead,
    MAX(bi.submitted_at) as latest_lead
FROM booking_interests bi
LEFT JOIN properties p ON bi.property_id = p.id
GROUP BY bi.site_id, bi.status, bi.priority, bi.source, bi.assigned_to, bi.property_id, p.name;

-- Lead aging analysis view
CREATE OR REPLACE VIEW v_lead_aging AS
SELECT
    bi.site_id,
    bi.status,
    bi.priority,
    bi.assigned_to,
    bi.property_id,
    CASE
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 1 THEN '0-1 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 3 THEN '2-3 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 7 THEN '4-7 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 14 THEN '8-14 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 30 THEN '15-30 days'
        ELSE '30+ days'
    END as age_bucket,
    COUNT(*) as lead_count,
    AVG(EXTRACT(EPOCH FROM (NOW() - bi.submitted_at))/3600) as avg_age_hours,
    MIN(bi.submitted_at) as oldest_lead,
    MAX(bi.submitted_at) as newest_lead
FROM booking_interests bi
WHERE bi.status NOT IN ('CONFIRMED', 'ARCHIVED')
GROUP BY bi.site_id, bi.status, bi.priority, bi.assigned_to, bi.property_id,
    CASE
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 1 THEN '0-1 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 3 THEN '2-3 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 7 THEN '4-7 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 14 THEN '8-14 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submitted_at) <= 30 THEN '15-30 days'
        ELSE '30+ days'
    END;

-- Step 10: Create materialized view for daily analytics
CREATE MATERIALIZED VIEW mv_daily_lead_metrics AS
SELECT
    DATE(bi.submitted_at) as lead_date,
    bi.site_id,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN bi.status = 'NEW' THEN 1 END) as new_leads,
    COUNT(CASE WHEN bi.status = 'CONTACTED' THEN 1 END) as contacted_leads,
    COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) as confirmed_leads,
    COUNT(CASE WHEN bi.status = 'LOST' THEN 1 END) as lost_leads,
    COUNT(DISTINCT bi.customer_email) as unique_customers,
    SUM(bi.estimated_value) as total_estimated_value,
    AVG(bi.estimated_value) as avg_estimated_value,
    COUNT(CASE WHEN bi.source = 'DIRECT' THEN 1 END) as direct_leads,
    COUNT(CASE WHEN bi.source = 'WEBSITE' THEN 1 END) as website_leads,
    COUNT(CASE WHEN bi.source = 'PHONE' THEN 1 END) as phone_leads,
    COUNT(CASE WHEN bi.source = 'EMAIL' THEN 1 END) as email_leads
FROM booking_interests bi
GROUP BY DATE(bi.submitted_at), bi.site_id;

CREATE UNIQUE INDEX idx_mv_daily_lead_metrics_unique
ON mv_daily_lead_metrics (lead_date, site_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_lead_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_lead_metrics;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Add comments for documentation
COMMENT ON TABLE booking_interests IS 'Enhanced lead management system for resort booking inquiries with follow-up tracking and performance analytics';
COMMENT ON COLUMN booking_interests.customer_first_name IS 'Customer first name for personalized communication';
COMMENT ON COLUMN booking_interests.customer_last_name IS 'Customer last name for personalized communication';
COMMENT ON COLUMN booking_interests.priority IS 'Lead priority level: LOW, MEDIUM, HIGH, URGENT';
COMMENT ON COLUMN booking_interests.source IS 'Lead source channel: DIRECT, WEBSITE, PHONE, EMAIL, REFERRAL, etc.';
COMMENT ON COLUMN booking_interests.estimated_value IS 'Estimated booking value in specified currency for revenue forecasting';
COMMENT ON COLUMN booking_interests.expires_at IS 'Lead expiration date for follow-up urgency (default: 7 days from submission)';
COMMENT ON COLUMN booking_interests.follow_up_scheduled IS 'Scheduled date/time for next follow-up action';
COMMENT ON COLUMN booking_interests.assigned_to IS 'User ID assigned to manage this lead for follow-up';

COMMENT ON TABLE booking_interest_activities IS 'Detailed activity log for lead follow-up tracking and performance analysis';
COMMENT ON COLUMN booking_interest_activities.type IS 'Activity type: NOTE, PHONE_CALL, EMAIL, SMS, MEETING, QUOTE_SENT, etc.';
COMMENT ON COLUMN booking_interest_activities.outcome IS 'Activity outcome: SUCCESS, FAILED, PENDING, NO_ANSWER, etc.';
COMMENT ON COLUMN booking_interest_activities.duration IS 'Duration in minutes for calls and meetings';
COMMENT ON COLUMN booking_interest_activities.next_action_at IS 'Scheduled date/time for next follow-up action based on this activity';

-- Step 12: Update existing data to set missing fields
UPDATE booking_interests
SET
    expires_at = CASE
        WHEN expires_at IS NULL AND status IN ('NEW', 'CONTACTED', 'HOT', 'WARM')
        THEN submitted_at + INTERVAL '7 days'
        ELSE expires_at
    END,
    total_guests = COALESCE(adults, 0) + COALESCE(children, 0) + COALESCE(infants, 0)
WHERE expires_at IS NULL OR total_guests IS NULL OR total_guests = 0;

-- Step 13: Clean up old columns if they exist (optional - can be done in a separate migration)
-- Note: Keeping customer_name for backward compatibility during transition
-- ALTER TABLE booking_interests DROP COLUMN customer_name;
-- ALTER TABLE booking_interests DROP COLUMN number_of_guests;