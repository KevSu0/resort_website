-- DB-003: Database Triggers and Views for Booking Interest Lead Management
-- This file contains PostgreSQL-specific triggers and optimized views for lead follow-up tracking

-- =============================================================================
-- DB-003-2c: Triggers for Automatic Timestamp Updates
-- =============================================================================

-- Trigger to update lastContactedAt when status changes to CONTACTED
CREATE OR REPLACE FUNCTION update_last_contacted_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Update lastContactedAt when status changes to CONTACTED
    IF NEW.status = 'CONTACTED' AND OLD.status != 'CONTACTED' THEN
        NEW.lastContactedAt = NOW();
    END IF;

    -- Set confirmedAt when status changes to CONFIRMED
    IF NEW.status = 'CONFIRMED' AND OLD.status != 'CONFIRMED' THEN
        NEW.confirmedAt = NOW();
    END IF;

    -- Set archivedAt when status changes to ARCHIVED
    IF NEW.status = 'ARCHIVED' AND OLD.status != 'ARCHIVED' THEN
        NEW.archivedAt = NOW();
    END IF;

    -- Calculate totalGuests if not set
    IF NEW.totalGuests IS NULL OR NEW.totalGuests = 0 THEN
        NEW.totalGuests = COALESCE(NEW.adults, 0) + COALESCE(NEW.children, 0) + COALESCE(NEW.infants, 0);
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

-- Trigger to automatically set lead expiration (7 days from submission if not set)
CREATE OR REPLACE FUNCTION set_lead_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiration date for new leads if not already set
    IF NEW.expiresAt IS NULL AND NEW.status IN ('NEW', 'CONTACTED', 'HOT', 'WARM') THEN
        NEW.expiresAt = NOW() + INTERVAL '7 days';
    END IF;

    -- Generate reference code if not set
    IF NEW.referenceCode IS NULL OR NEW.referenceCode = '' THEN
        NEW.referenceCode = 'LDG' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(EXTRACT(MICROSECONDS FROM NOW())::text, 6, '0');
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

-- =============================================================================
-- DB-003: Optimized Views for Lead Pipeline Reporting
-- =============================================================================

-- View for lead pipeline dashboard with performance metrics
CREATE OR REPLACE VIEW v_lead_pipeline AS
SELECT
    bi.siteId,
    bi.status,
    bi.priority,
    bi.source,
    bi.assignedTo,
    bi.propertyId,
    p.name as propertyName,
    COUNT(*) as leadCount,
    COUNT(DISTINCT bi.customerEmail) as uniqueCustomers,
    AVG(EXTRACT(EPOCH FROM (bi.lastContactedAt - bi.submittedAt))/3600) as avgResponseHours,
    COUNT(CASE WHEN bi.lastContactedAt IS NOT NULL THEN 1 END) as contactedCount,
    COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) as confirmedCount,
    COUNT(CASE WHEN bi.status = 'LOST' THEN 1 END) as lostCount,
    COUNT(CASE WHEN bi.expiresAt < NOW() AND bi.status NOT IN ('CONFIRMED', 'ARCHIVED', 'LOST') THEN 1 END) as expiredCount,
    SUM(bi.estimatedValue) as totalEstimatedValue,
    AVG(bi.estimatedValue) as avgEstimatedValue,
    MIN(bi.submittedAt) as earliestLead,
    MAX(bi.submittedAt) as latestLead
FROM booking_interests bi
LEFT JOIN properties p ON bi.propertyId = p.id
GROUP BY bi.siteId, bi.status, bi.priority, bi.source, bi.assignedTo, bi.propertyId, p.name;

-- View for lead aging analysis (how long leads sit in each status)
CREATE OR REPLACE VIEW v_lead_aging AS
SELECT
    bi.siteId,
    bi.status,
    bi.priority,
    bi.assignedTo,
    bi.propertyId,
    CASE
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 1 THEN '0-1 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 3 THEN '2-3 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 7 THEN '4-7 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 14 THEN '8-14 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 30 THEN '15-30 days'
        ELSE '30+ days'
    END as ageBucket,
    COUNT(*) as leadCount,
    AVG(EXTRACT(EPOCH FROM (NOW() - bi.submittedAt))/3600) as avgAgeHours,
    MIN(bi.submittedAt) as oldestLead,
    MAX(bi.submittedAt) as newestLead
FROM booking_interests bi
WHERE bi.status NOT IN ('CONFIRMED', 'ARCHIVED')
GROUP BY bi.siteId, bi.status, bi.priority, bi.assignedTo, bi.propertyId,
    CASE
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 1 THEN '0-1 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 3 THEN '2-3 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 7 THEN '4-7 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 14 THEN '8-14 days'
        WHEN EXTRACT(DAYS FROM NOW() - bi.submittedAt) <= 30 THEN '15-30 days'
        ELSE '30+ days'
    END;

-- View for follow-up performance tracking
CREATE OR REPLACE VIEW v_follow_up_performance AS
SELECT
    bi.siteId,
    bi.assignedTo,
    u.firstName || ' ' || u.lastName as assignedUserName,
    COUNT(*) as totalLeads,
    COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) as convertedLeads,
    COUNT(CASE WHEN bi.status = 'LOST' THEN 1 END) as lostLeads,
    ROUND(COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as conversionRate,
    COUNT(bia.id) as totalActivities,
    COUNT(CASE WHEN bia.type = 'PHONE_CALL' THEN 1 END) as phoneCalls,
    COUNT(CASE WHEN bia.type = 'EMAIL' THEN 1 END) as emails,
    COUNT(CASE WHEN bia.type = 'MEETING' THEN 1 END) as meetings,
    COUNT(CASE WHEN bia.outcome = 'SUCCESS' THEN 1 END) as successfulActivities,
    AVG(EXTRACT(EPOCH FROM (bi.lastContactedAt - bi.submittedAt))/3600) as avgResponseHours,
    AVG(bia.duration) as avgActivityDuration,
    SUM(bi.estimatedValue) as totalEstimatedValue,
    SUM(CASE WHEN bi.status = 'CONFIRMED' THEN bi.estimatedValue ELSE 0 END) as convertedValue
FROM booking_interests bi
LEFT JOIN users u ON bi.assignedTo = u.id
LEFT JOIN booking_interest_activities bia ON bi.id = bia.bookingInterestId
WHERE bi.assignedTo IS NOT NULL
GROUP BY bi.siteId, bi.assignedTo, u.firstName, u.lastName;

-- View for lead source performance analysis
CREATE OR REPLACE VIEW v_lead_source_performance AS
SELECT
    bi.siteId,
    bi.source,
    bi.campaign,
    COUNT(*) as leadCount,
    COUNT(DISTINCT bi.customerEmail) as uniqueCustomers,
    COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) as confirmedLeads,
    COUNT(CASE WHEN bi.status = 'LOST' THEN 1 END) as lostLeads,
    ROUND(COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as conversionRate,
    SUM(bi.estimatedValue) as totalEstimatedValue,
    AVG(bi.estimatedValue) as avgEstimatedValue,
    SUM(CASE WHEN bi.status = 'CONFIRMED' THEN bi.estimatedValue ELSE 0 END) as convertedValue,
    AVG(EXTRACT(EPOCH FROM (bi.lastContactedAt - bi.submittedAt))/3600) as avgResponseHours,
    MIN(bi.submittedAt) as earliestLead,
    MAX(bi.submittedAt) as latestLead
FROM booking_interests bi
GROUP BY bi.siteId, bi.source, bi.campaign;

-- View for upcoming follow-ups (next 24 hours, 3 days, 7 days)
CREATE OR REPLACE VIEW v_upcoming_followups AS
SELECT
    bi.id,
    bi.referenceCode,
    bi.siteId,
    bi.customerFirstName || ' ' || bi.customerLastName as customerName,
    bi.customerEmail,
    bi.customerPhone,
    bi.propertyId,
    p.name as propertyName,
    bi.status,
    bi.priority,
    bi.followUpScheduled,
    bi.assignedTo,
    u.firstName || ' ' || u.lastName as assignedUserName,
    bi.lastContactedAt,
    CASE
        WHEN bi.followUpScheduled <= NOW() + INTERVAL '24 hours' THEN 'Overdue/Next 24h'
        WHEN bi.followUpScheduled <= NOW() + INTERVAL '3 days' THEN 'Next 3 days'
        WHEN bi.followUpScheduled <= NOW() + INTERVAL '7 days' THEN 'Next 7 days'
        ELSE 'Beyond 7 days'
    END as urgencyLevel,
    EXTRACT(EPOCH FROM (bi.followUpScheduled - NOW()))/3600 as hoursUntilFollowup
FROM booking_interests bi
LEFT JOIN properties p ON bi.propertyId = p.id
LEFT JOIN users u ON bi.assignedTo = u.id
WHERE bi.followUpScheduled IS NOT NULL
    AND bi.status NOT IN ('CONFIRMED', 'ARCHIVED', 'LOST')
    AND bi.followUpScheduled >= NOW()
ORDER BY bi.followUpScheduled ASC;

-- =============================================================================
-- DB-003: Indexes for Additional Performance Optimization
-- =============================================================================

-- Additional composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_booking_interests_site_status_priority_submitted
ON booking_interests (siteId, status, priority, submittedAt DESC);

CREATE INDEX IF NOT EXISTS idx_booking_interests_assigned_status_followup
ON booking_interests (assignedTo, status, followUpScheduled ASC)
WHERE assignedTo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_booking_interests_expires_status
ON booking_interests (expiresAt, status)
WHERE expiresAt IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_booking_interests_email_site
ON booking_interests (customerEmail, siteId);

CREATE INDEX IF NOT EXISTS idx_booking_interests_phone_site
ON booking_interests (customerPhone, siteId);

CREATE INDEX IF NOT EXISTS idx_booking_interests_dates_status
ON booking_interests (checkInDate, checkOutDate, status, submittedAt DESC);

-- Activity table performance indexes
CREATE INDEX IF NOT EXISTS idx_booking_activities_lead_type_time
ON booking_interest_activities (bookingInterestId, type, performedAt DESC);

CREATE INDEX IF NOT EXISTS idx_booking_activities_user_outcome_time
ON booking_interest_activities (performedBy, outcome, performedAt DESC)
WHERE performedBy IS NOT NULL;

-- =============================================================================
-- DB-003: Data Integrity Constraints
-- =============================================================================

-- Constraint to ensure valid date ranges
ALTER TABLE booking_interests
ADD CONSTRAINT chk_valid_date_range
CHECK (checkOutDate > checkInDate);

-- Constraint to ensure guest counts are non-negative
ALTER TABLE booking_interests
ADD CONSTRAINT chk_non_negative_guests
CHECK (adults >= 0 AND children >= 0 AND infants >= 0 AND totalGuests >= 0);

-- Constraint to ensure totalGuests matches sum of individual guest counts
ALTER TABLE booking_interests
ADD CONSTRAINT chk_guest_count_consistency
CHECK (totalGuests = adults + children + infants);

-- Constraint to ensure budget is positive if provided
ALTER TABLE booking_interests
ADD CONSTRAINT chk_positive_budget
CHECK (budget IS NULL OR budget > 0);

-- Constraint to ensure activity duration is positive if provided
ALTER TABLE booking_interest_activities
ADD CONSTRAINT chk_positive_duration
CHECK (duration IS NULL OR duration > 0);

-- =============================================================================
-- DB-003: Materialized Views for Heavy Analytics (Refresh as needed)
-- =============================================================================

-- Materialized view for daily lead metrics (refresh hourly/daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_lead_metrics AS
SELECT
    DATE(bi.submittedAt) as leadDate,
    bi.siteId,
    COUNT(*) as totalLeads,
    COUNT(CASE WHEN bi.status = 'NEW' THEN 1 END) as newLeads,
    COUNT(CASE WHEN bi.status = 'CONTACTED' THEN 1 END) as contactedLeads,
    COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) as confirmedLeads,
    COUNT(CASE WHEN bi.status = 'LOST' THEN 1 END) as lostLeads,
    COUNT(DISTINCT bi.customerEmail) as uniqueCustomers,
    SUM(bi.estimatedValue) as totalEstimatedValue,
    AVG(bi.estimatedValue) as avgEstimatedValue,
    COUNT(CASE WHEN bi.source = 'DIRECT' THEN 1 END) as directLeads,
    COUNT(CASE WHEN bi.source = 'WEBSITE' THEN 1 END) as websiteLeads,
    COUNT(CASE WHEN bi.source = 'PHONE' THEN 1 END) as phoneLeads,
    COUNT(CASE WHEN bi.source = 'EMAIL' THEN 1 END) as emailLeads
FROM booking_interests bi
GROUP BY DATE(bi.submittedAt), bi.siteId;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_lead_metrics_unique
ON mv_daily_lead_metrics (leadDate, siteId);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_lead_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_lead_metrics;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DB-003: Comments and Documentation
-- =============================================================================

COMMENT ON TABLE booking_interests IS 'Enhanced lead management system for resort booking inquiries with follow-up tracking and performance analytics';
COMMENT ON COLUMN booking_interests.referenceCode IS 'Unique reference code for lead identification (format: LDGYYMMDDXXXXXX)';
COMMENT ON COLUMN booking_interests.priority IS 'Lead priority level: LOW, MEDIUM, HIGH, URGENT';
COMMENT ON COLUMN booking_interests.source IS 'Lead source channel: DIRECT, WEBSITE, PHONE, EMAIL, REFERRAL, etc.';
COMMENT ON COLUMN booking_interests.estimatedValue IS 'Estimated booking value in specified currency for revenue forecasting';
COMMENT ON COLUMN booking_interests.expiresAt IS 'Lead expiration date for follow-up urgency (default: 7 days from submission)';
COMMENT ON COLUMN booking_interests.followUpScheduled IS 'Scheduled date/time for next follow-up action';
COMMENT ON COLUMN booking_interests.assignedTo IS 'User ID assigned to manage this lead for follow-up';

COMMENT ON TABLE booking_interest_activities IS 'Detailed activity log for lead follow-up tracking and performance analysis';
COMMENT ON COLUMN booking_interest_activities.type IS 'Activity type: NOTE, PHONE_CALL, EMAIL, SMS, MEETING, QUOTE_SENT, etc.';
COMMENT ON COLUMN booking_interest_activities.outcome IS 'Activity outcome: SUCCESS, FAILED, PENDING, NO_ANSWER, etc.';
COMMENT ON COLUMN booking_interest_activities.duration IS 'Duration in minutes for calls and meetings';
COMMENT ON COLUMN booking_interest_activities.nextActionAt IS 'Scheduled date/time for next follow-up action based on this activity';