# Supabase Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the Resort Website CMS from PostgreSQL to Supabase. The migration is designed to be seamless with zero downtime and complete data integrity.

## Prerequisites

### Technical Requirements
- Node.js 18+ installed
- PostgreSQL 15+ access with admin privileges
- Supabase account with project created
- Git repository access
- Command line access

### Required Access
- PostgreSQL database admin credentials
- Supabase project admin credentials
- Application deployment access
- DNS management access (if needed)

### Backup Requirements
- Full database backup created
- Application code backed up
- Configuration files backed up
- Rollback plan documented

## Migration Timeline

### Phase 1: Preparation (1-2 days)
- Environment setup
- Configuration validation
- Migration tools testing
- Backup creation

### Phase 2: Migration (1 day)
- Data export from PostgreSQL
- Data import to Supabase
- Verification and validation
- Application configuration update

### Phase 3: Testing (1 day)
- Functional testing
- Performance testing
- Integration testing
- User acceptance testing

### Phase 4: Deployment (1 day)
- Production deployment
- Monitoring setup
- Final validation
- Documentation update

## Step-by-Step Migration Process

### Step 1: Environment Preparation

#### 1.1 Install Required Dependencies

```bash
# Install Supabase client library
npm install @supabase/supabase-js

# Install migration dependencies
npm install commander
```

#### 1.2 Update Environment Configuration

Update `.env` file with Supabase credentials:

```bash
# Database Configuration
DATABASE_TYPE=supabase

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_HOST=db.your-project.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_db_password
```

#### 1.3 Validate Configuration

```bash
# Test configuration loading
npm run dev

# Check database connection
npm run db:health
```

### Step 2: Database Migration

#### 2.1 Create Full Backup

```bash
# Create database backup
npm run db:backup

# Verify backup file
ls -la backups/
```

#### 2.2 Export PostgreSQL Schema and Data

```bash
# Export schema only
npm run db:migrate:export

# Export schema and data
npm run db:migrate:export -- --include-data

# Export with custom options
npm run db:migrate:export -- --include-data --batch-size 500 --exclude-tables "audit_logs,sessions"
```

#### 2.3 Prepare Supabase Database

1. Log in to Supabase Dashboard
2. Navigate to SQL Editor
3. Run the following to prepare the database:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom functions for migration
CREATE OR REPLACE FUNCTION execute_sql(query text, params any[] DEFAULT '{}')
RETURNS TABLE(result json) AS $$
BEGIN
  RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2.4 Import Schema to Supabase

```bash
# Import schema only
npm run db:migrate:import

# Import schema and data
npm run db:migrate:import -- --include-data

# Import with custom options
npm run db:migrate:import -- --include-data --batch-size 500
```

#### 2.5 Verify Migration Integrity

```bash
# Run verification checks
npm run db:migrate:verify

# Check for any issues
npm run db:migrate:verify -- --detailed
```

### Step 3: Application Configuration

#### 3.1 Update Database Configuration

Update `src/lib/database/DatabaseManager.ts` initialization:

```typescript
// In your application initialization
import { databaseManager } from './lib/database/DatabaseManager';

// Initialize with Supabase configuration
await databaseManager.initialize({
  type: 'supabase',
  connection: {
    host: process.env.SUPABASE_DB_HOST,
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
    database: process.env.SUPABASE_DB_NAME,
    username: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
  },
});
```

#### 3.2 Update Repository Factory

Update `src/lib/database/RepositoryFactory.ts` to use the new adapter:

```typescript
// The factory will automatically use the Supabase adapter
// based on the DATABASE_TYPE environment variable
```

#### 3.3 Test Application with Supabase

```bash
# Start development server
npm run dev

# Test database operations
npm run test:db

# Run full test suite
npm run test
```

### Step 4: Production Deployment

#### 4.1 Prepare Production Environment

1. Update production environment variables
2. Create production Supabase project
3. Configure production database settings
4. Set up production backups

#### 4.2 Deploy to Production

```bash
# Build application
npm run build

# Deploy to production
npm run deploy:production

# Verify deployment
npm run health:production
```

#### 4.3 Monitor Production

1. Set up monitoring dashboards
2. Configure error tracking
3. Set up performance alerts
4. Monitor database metrics

## Post-Migration Tasks

### 1. Enable Supabase Features

#### 1.1 Real-time Subscriptions

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Subscribe to page updates
const subscription = supabase
  .channel('pages')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'pages' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe();
```

#### 1.2 Authentication Integration

```typescript
// Update authentication to use Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

#### 1.3 Storage Integration

```typescript
// Use Supabase Storage for media files
const { data, error } = await supabase.storage
  .from('media')
  .upload('public/image.jpg', file);
```

### 2. Performance Optimization

#### 2.1 Database Optimization

```sql
-- Create optimized indexes for Supabase
CREATE INDEX CONCURRENTLY idx_pages_site_status_published 
ON pages(site_id, status, published_at DESC) 
WHERE status IN ('PUBLISHED', 'SCHEDULED');

-- Enable row-level security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
```

#### 2.2 Caching Strategy

```typescript
// Implement Supabase-specific caching
const cacheKey = `pages:${siteId}`;
const cached = await cache.get(cacheKey);

if (!cached) {
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId);
  
  await cache.set(cacheKey, data, 3600);
}
```

### 3. Monitoring and Maintenance

#### 3.1 Set Up Monitoring

```typescript
// Monitor database performance
const { data } = await supabase
  .rpc('get_database_stats');

// Monitor query performance
const { data } = await supabase
  .rpc('get_slow_queries');
```

#### 3.2 Regular Maintenance

```sql
-- Create maintenance function
CREATE OR REPLACE FUNCTION maintenance_tasks()
RETURNS void AS $$
BEGIN
  -- Update statistics
  ANALYZE;
  
  -- Reindex fragmented indexes
  REINDEX INDEX CONCURRENTLY idx_pages_search;
  
  -- Clean up old data
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule regular maintenance
SELECT cron.schedule('maintenance', '0 2 * * *', 'SELECT maintenance_tasks()');
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Connection Issues

**Problem**: Cannot connect to Supabase database
**Solution**: 
- Verify environment variables
- Check network connectivity
- Validate Supabase project settings

#### 2. Migration Errors

**Problem**: Data migration fails
**Solution**:
- Check PostgreSQL and Supabase versions
- Verify table structures match
- Check for data type compatibility

#### 3. Performance Issues

**Problem**: Slow queries after migration
**Solution**:
- Create appropriate indexes
- Optimize query structure
- Enable query caching

#### 4. Authentication Issues

**Problem**: Users cannot log in after migration
**Solution**:
- Migrate user authentication data
- Update authentication configuration
- Test user login flow

### Error Recovery

#### 1. Rollback Procedure

If migration fails, follow these steps:

```bash
# 1. Stop application
npm run stop

# 2. Restore PostgreSQL database
pg_restore -h localhost -U postgres -d resort_cms backups/backup.sql

# 3. Update configuration
# Set DATABASE_TYPE=postgresql in .env

# 4. Restart application
npm run start
```

#### 2. Partial Recovery

If only some data fails to migrate:

```bash
# 1. Identify failed tables
npm run db:migrate:verify -- --detailed

# 2. Export only failed tables
npm run db:migrate:export -- --include-tables "failed_table1,failed_table2"

# 3. Import failed tables
npm run db:migrate:import -- --include-tables "failed_table1,failed_table2"

# 4. Verify again
npm run db:migrate:verify
```

## Validation Checklist

### Pre-Migration Validation

- [ ] Full database backup created
- [ ] Supabase project configured
- [ ] Environment variables updated
- [ ] Migration tools tested
- [ ] Rollback plan documented

### Post-Migration Validation

- [ ] All data migrated successfully
- [ ] Application functions correctly
- [ ] Performance benchmarks met
- [ ] Security settings configured
- [ ] Monitoring systems active

### Production Validation

- [ ] Production deployment successful
- [ ] All features working correctly
- [ ] User acceptance testing passed
- [ ] Performance metrics acceptable
- [ ] Error rates within limits

## Success Metrics

### Technical Metrics

- **Migration Time**: < 24 hours
- **Downtime**: < 30 minutes
- **Data Integrity**: 100% validation
- **Performance**: Equal or better than PostgreSQL

### Business Metrics

- **Cost Reduction**: 50-67% lower infrastructure costs
- **Feature Availability**: Enhanced capabilities
- **User Experience**: Improved performance
- **Scalability**: 10x current load capacity

## Conclusion

This migration guide provides a comprehensive approach to migrating from PostgreSQL to Supabase while maintaining system integrity and minimizing downtime. Following these steps will ensure a successful migration with enhanced capabilities and improved performance.

Remember to test thoroughly in a staging environment before applying changes to production, and always have a rollback plan ready.