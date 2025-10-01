-- DB-008: Configuration Storage Setup Migration
-- This migration implements comprehensive configuration storage for the resort management system
-- Including settings tables, versioning, snapshots, and audit logging

-- DB-008-1a, 1b: Enhance existing BrandSetting and SiteSetting tables
-- Add versioning, validation, encryption support, and inheritance capabilities

ALTER TABLE brand_settings
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS validation JSONB,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false;

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS validation JSONB,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS inherits_from TEXT,
ADD COLUMN IF NOT EXISTS is_overridden BOOLEAN DEFAULT false;

-- DB-008-2a: Create resort-specific configuration tables

-- Property Management Configuration
CREATE TABLE IF NOT EXISTS property_configs (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    property_id TEXT,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    validation JSONB,
    is_encrypted BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    applies_to TEXT[],
    effective_from TIMESTAMP,
    effective_to TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE(site_id, property_id, category, key)
);

-- Booking System Configuration
CREATE TABLE IF NOT EXISTS booking_configs (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    validation JSONB,
    is_encrypted BOOLEAN DEFAULT false,
    channel TEXT,
    property_type TEXT,
    min_stay INTEGER,
    max_stay INTEGER,
    guest_segment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(site_id, category, key)
);

-- Operational Configuration
CREATE TABLE IF NOT EXISTS operational_configs (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    department TEXT NOT NULL,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    validation JSONB,
    is_encrypted BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    schedule JSONB,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(site_id, department, category, key)
);

-- Guest Experience Configuration
CREATE TABLE IF NOT EXISTS guest_experience_configs (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    validation JSONB,
    is_encrypted BOOLEAN DEFAULT false,
    guest_segment TEXT,
    property_type TEXT,
    season TEXT,
    language TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(site_id, category, key)
);

-- DB-008-2a: Settings snapshots and backup tracking

-- Configuration Snapshots
CREATE TABLE IF NOT EXISTS config_snapshots (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'MANUAL',
    status TEXT DEFAULT 'CREATING',
    version INTEGER DEFAULT 1,
    brand_settings JSONB,
    site_settings JSONB,
    property_configs JSONB,
    booking_configs JSONB,
    operational_configs JSONB,
    guest_experience_configs JSONB,
    created_by TEXT,
    backup_reason TEXT,
    tags TEXT[],
    checksum TEXT,
    compressed_size INTEGER,
    uncompressed_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    restored_at TIMESTAMP,

    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(site_id, name, version)
);

-- Snapshot Restore Tracking
CREATE TABLE IF NOT EXISTS snapshot_restores (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL,
    site_id TEXT NOT NULL,
    restored_by TEXT,
    restore_type TEXT DEFAULT 'FULL',
    selected_configs JSONB,
    conflict_strategy TEXT DEFAULT 'SNAPSHOT_WINS',
    dry_run BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'IN_PROGRESS',
    items_restored INTEGER DEFAULT 0,
    items_skipped INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    errors JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    FOREIGN KEY (snapshot_id) REFERENCES config_snapshots(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (restored_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Configuration Templates
CREATE TABLE IF NOT EXISTS config_templates (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    config_data JSONB NOT NULL,
    variables JSONB,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    tags TEXT[],
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(site_id, name, version)
);

-- Template Usage Tracking
CREATE TABLE IF NOT EXISTS config_template_usage (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    site_id TEXT NOT NULL,
    applied_by TEXT,
    variables JSONB,
    config_type TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (template_id) REFERENCES config_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (applied_by) REFERENCES users(id) ON DELETE SET NULL
);

-- DB-008-2b: Configuration-specific audit logging
CREATE TABLE IF NOT EXISTS config_audit_logs (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    config_type TEXT NOT NULL,
    config_id TEXT NOT NULL,
    config_key TEXT NOT NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_fields JSONB,
    version INTEGER,
    new_version INTEGER,
    user_id TEXT,
    session_id TEXT,
    reason TEXT,
    source TEXT,
    batch_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    request_id TEXT,
    snapshot_id TEXT,
    template_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (snapshot_id) REFERENCES config_snapshots(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES config_templates(id) ON DELETE SET NULL
);

-- DB-008-4: Performance indexes for efficient settings retrieval and caching

-- Enhanced settings tables indexes
CREATE INDEX IF NOT EXISTS idx_brand_settings_category ON brand_settings(category);
CREATE INDEX IF NOT EXISTS idx_brand_settings_version ON brand_settings(version);

CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_version ON site_settings(version);
CREATE INDEX IF NOT EXISTS idx_site_settings_inherits_from ON site_settings(inherits_from);

-- Property configuration indexes
CREATE INDEX IF NOT EXISTS idx_property_configs_site_id ON property_configs(site_id);
CREATE INDEX IF NOT EXISTS idx_property_configs_property_id ON property_configs(property_id);
CREATE INDEX IF NOT EXISTS idx_property_configs_category ON property_configs(category);
CREATE INDEX IF NOT EXISTS idx_property_configs_key ON property_configs(key);
CREATE INDEX IF NOT EXISTS idx_property_configs_version ON property_configs(version);
CREATE INDEX IF NOT EXISTS idx_property_configs_is_active ON property_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_property_configs_priority ON property_configs(priority);
CREATE INDEX IF NOT EXISTS idx_property_configs_effective_dates ON property_configs(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_property_configs_site_category_active ON property_configs(site_id, category, is_active);

-- Booking configuration indexes
CREATE INDEX IF NOT EXISTS idx_booking_configs_site_id ON booking_configs(site_id);
CREATE INDEX IF NOT EXISTS idx_booking_configs_category ON booking_configs(category);
CREATE INDEX IF NOT EXISTS idx_booking_configs_key ON booking_configs(key);
CREATE INDEX IF NOT EXISTS idx_booking_configs_version ON booking_configs(version);
CREATE INDEX IF NOT EXISTS idx_booking_configs_is_active ON booking_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_booking_configs_channel ON booking_configs(channel);
CREATE INDEX IF NOT EXISTS idx_booking_configs_property_type ON booking_configs(property_type);
CREATE INDEX IF NOT EXISTS idx_booking_configs_guest_segment ON booking_configs(guest_segment);
CREATE INDEX IF NOT EXISTS idx_booking_configs_site_category_active ON booking_configs(site_id, category, is_active);

-- Operational configuration indexes
CREATE INDEX IF NOT EXISTS idx_operational_configs_site_id ON operational_configs(site_id);
CREATE INDEX IF NOT EXISTS idx_operational_configs_department ON operational_configs(department);
CREATE INDEX IF NOT EXISTS idx_operational_configs_category ON operational_configs(category);
CREATE INDEX IF NOT EXISTS idx_operational_configs_key ON operational_configs(key);
CREATE INDEX IF NOT EXISTS idx_operational_configs_version ON operational_configs(version);
CREATE INDEX IF NOT EXISTS idx_operational_configs_is_active ON operational_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_operational_configs_priority ON operational_configs(priority);
CREATE INDEX IF NOT EXISTS idx_operational_configs_location ON operational_configs(location);
CREATE INDEX IF NOT EXISTS idx_operational_configs_site_department_active ON operational_configs(site_id, department, is_active);

-- Guest experience configuration indexes
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_site_id ON guest_experience_configs(site_id);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_category ON guest_experience_configs(category);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_key ON guest_experience_configs(key);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_version ON guest_experience_configs(version);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_is_active ON guest_experience_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_guest_segment ON guest_experience_configs(guest_segment);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_property_type ON guest_experience_configs(property_type);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_season ON guest_experience_configs(season);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_language ON guest_experience_configs(language);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_site_category_active ON guest_experience_configs(site_id, category, is_active);

-- DB-008-2c: Settings snapshots indexes
CREATE INDEX IF NOT EXISTS idx_config_snapshots_site_id ON config_snapshots(site_id);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_type ON config_snapshots(type);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_status ON config_snapshots(status);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_created_by ON config_snapshots(created_by);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_created_at ON config_snapshots(created_at);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_expires_at ON config_snapshots(expires_at);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_site_created_desc ON config_snapshots(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_site_type_status ON config_snapshots(site_id, type, status);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_checksum ON config_snapshots(checksum);

-- Snapshot restore indexes
CREATE INDEX IF NOT EXISTS idx_snapshot_restores_snapshot_id ON snapshot_restores(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_restores_site_id ON snapshot_restores(site_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_restores_restored_by ON snapshot_restores(restored_by);
CREATE INDEX IF NOT EXISTS idx_snapshot_restores_status ON snapshot_restores(status);
CREATE INDEX IF NOT EXISTS idx_snapshot_restores_started_at ON snapshot_restores(started_at);
CREATE INDEX IF NOT EXISTS idx_snapshot_restores_completed_at ON snapshot_restores(completed_at);

-- Configuration template indexes
CREATE INDEX IF NOT EXISTS idx_config_templates_site_id ON config_templates(site_id);
CREATE INDEX IF NOT EXISTS idx_config_templates_category ON config_templates(category);
CREATE INDEX IF NOT EXISTS idx_config_templates_is_public ON config_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_config_templates_is_active ON config_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_config_templates_usage_count ON config_templates(usage_count);
CREATE INDEX IF NOT EXISTS idx_config_templates_created_at ON config_templates(created_at);

-- Template usage indexes
CREATE INDEX IF NOT EXISTS idx_config_template_usage_template_id ON config_template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_config_template_usage_site_id ON config_template_usage(site_id);
CREATE INDEX IF NOT EXISTS idx_config_template_usage_applied_by ON config_template_usage(applied_by);
CREATE INDEX IF NOT EXISTS idx_config_template_usage_applied_at ON config_template_usage(applied_at);

-- Configuration audit log indexes
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_site_id ON config_audit_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_config_type ON config_audit_logs(config_type);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_config_id ON config_audit_logs(config_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_config_key ON config_audit_logs(config_key);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_action ON config_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_user_id ON config_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_created_at ON config_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_batch_id ON config_audit_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_snapshot_id ON config_audit_logs(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_template_id ON config_audit_logs(template_id);

-- Performance indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_site_type_created_desc ON config_audit_logs(site_id, config_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_config_id_created_desc ON config_audit_logs(config_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_user_id_created_desc ON config_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_audit_logs_action_created_desc ON config_audit_logs(action, created_at DESC);

-- DB-008-4: GIN indexes for JSONB configuration fields
CREATE INDEX IF NOT EXISTS idx_property_configs_value_gin ON property_configs USING GIN (value);
CREATE INDEX IF NOT EXISTS idx_property_configs_validation_gin ON property_configs USING GIN (validation);
CREATE INDEX IF NOT EXISTS idx_property_configs_applies_to_gin ON property_configs USING GIN (applies_to);

CREATE INDEX IF NOT EXISTS idx_booking_configs_value_gin ON booking_configs USING GIN (value);
CREATE INDEX IF NOT EXISTS idx_booking_configs_validation_gin ON booking_configs USING GIN (validation);

CREATE INDEX IF NOT EXISTS idx_operational_configs_value_gin ON operational_configs USING GIN (value);
CREATE INDEX IF NOT EXISTS idx_operational_configs_validation_gin ON operational_configs USING GIN (validation);
CREATE INDEX IF NOT EXISTS idx_operational_configs_schedule_gin ON operational_configs USING GIN (schedule);

CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_value_gin ON guest_experience_configs USING GIN (value);
CREATE INDEX IF NOT EXISTS idx_guest_experience_configs_validation_gin ON guest_experience_configs USING GIN (validation);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_brand_settings_updated_at ON brand_settings;
CREATE TRIGGER update_brand_settings_updated_at BEFORE UPDATE ON brand_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_configs_updated_at ON property_configs;
CREATE TRIGGER update_property_configs_updated_at BEFORE UPDATE ON property_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_configs_updated_at ON booking_configs;
CREATE TRIGGER update_booking_configs_updated_at BEFORE UPDATE ON booking_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_operational_configs_updated_at ON operational_configs;
CREATE TRIGGER update_operational_configs_updated_at BEFORE UPDATE ON operational_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guest_experience_configs_updated_at ON guest_experience_configs;
CREATE TRIGGER update_guest_experience_configs_updated_at BEFORE UPDATE ON guest_experience_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_config_templates_updated_at ON config_templates;
CREATE TRIGGER update_config_templates_updated_at BEFORE UPDATE ON config_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();