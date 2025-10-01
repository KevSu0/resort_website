-- PostgreSQL initialization script for Resort CMS
-- This script runs when the PostgreSQL container starts for the first time

-- Create the main database
CREATE DATABASE IF NOT EXISTS resort_cms;

-- Create additional databases for testing if needed
CREATE DATABASE IF NOT EXISTS resort_cms_test;

-- Switch to the main database
\c resort_cms;

-- Install useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types and enums if needed
-- (These will be handled by Prisma migrations)

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE resort_cms TO postgres;
GRANT ALL PRIVILEGES ON DATABASE resort_cms_test TO postgres;

-- Create indexes for common queries
-- (These will be handled by Prisma schema)

-- Performance settings for development
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';