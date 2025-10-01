# DB-001: Dashboard Metrics Prisma Queries

## Overview
This document provides Prisma client queries for the optimized dashboard metrics views created in DB-001. These queries leverage the new indexes and database views for optimal performance.

## Dashboard Queries

### 1. Site Overview Metrics
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get comprehensive site metrics for dashboard
async function getSiteMetrics(siteId: string) {
  // Using the dashboard_site_metrics view
  const siteMetrics = await prisma.$queryRaw`
    SELECT * FROM dashboard_site_metrics
    WHERE "siteId" = ${siteId}
    LIMIT 1
  `;

  return siteMetrics[0];
}

// Get metrics for all sites (for super admin)
async function getAllSitesMetrics() {
  return await prisma.$queryRaw`
    SELECT * FROM dashboard_site_metrics
    ORDER BY "site_name"
  `;
}
```

### 2. Time-Based Analytics
```typescript
// Get daily metrics for trend analysis (last 30 days)
async function getDailyMetrics(siteId: string, days = 30) {
  return await prisma.$queryRaw`
    SELECT
      metric_date,
      daily_interests,
      new_interests,
      contacted_interests,
      confirmed_interests,
      daily_views,
      unique_properties_viewed,
      unique_sessions,
      unique_visitors,
      daily_conversion_rate_pct
    FROM dashboard_daily_metrics
    WHERE "siteId" = ${siteId}
    AND metric_date >= CURRENT_DATE - INTERVAL '${days} days'
    ORDER BY metric_date DESC
  `;
}

// Get weekly aggregated metrics
async function getWeeklyMetrics(siteId: string, weeks = 12) {
  return await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('week', metric_date) as week_start,
      SUM(daily_interests) as weekly_interests,
      SUM(daily_views) as weekly_views,
      SUM(confirmed_interests) as weekly_confirmed,
      ROUND(AVG(daily_conversion_rate_pct), 2) as avg_conversion_rate,
      SUM(unique_sessions) as weekly_sessions,
      COUNT(DISTINCT metric_date) as days_active
    FROM dashboard_daily_metrics
    WHERE "siteId" = ${siteId}
    AND metric_date >= CURRENT_DATE - INTERVAL '${weeks} weeks'
    GROUP BY DATE_TRUNC('week', metric_date)
    ORDER BY week_start DESC
  `;
}

// Get monthly aggregated metrics
async function getMonthlyMetrics(siteId: string, months = 12) {
  return await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', metric_date) as month_start,
      SUM(daily_interests) as monthly_interests,
      SUM(daily_views) as monthly_views,
      SUM(confirmed_interests) as monthly_confirmed,
      ROUND(AVG(daily_conversion_rate_pct), 2) as avg_conversion_rate,
      SUM(unique_sessions) as monthly_sessions,
      COUNT(DISTINCT metric_date) as days_active
    FROM dashboard_daily_metrics
    WHERE "siteId" = ${siteId}
    AND metric_date >= CURRENT_DATE - INTERVAL '${months} months'
    GROUP BY DATE_TRUNC('month', metric_date)
    ORDER BY month_start DESC
  `;
}
```

### 3. Popular Properties Analytics
```typescript
// Get top performing properties
async function getPopularProperties(siteId: string, limit = 10) {
  return await prisma.$queryRaw`
    SELECT
      "propertyId",
      "property_name",
      "property_type",
      basePrice,
      capacity,
      total_views,
      views_last_7_days,
      views_last_30_days,
      total_interests,
      confirmed_bookings,
      avg_rating,
      total_reviews,
      -- Calculate conversion metrics
      CASE
        WHEN total_views > 0
        THEN ROUND(confirmed_bookings * 100.0 / total_views, 2)
        ELSE 0
      END as view_to_booking_rate,
      CASE
        WHEN total_interests > 0
        THEN ROUND(confirmed_bookings * 100.0 / total_interests, 2)
        ELSE 0
      END as interest_to_booking_rate
    FROM dashboard_popular_properties
    WHERE "siteId" = ${siteId}
    ORDER BY total_views DESC, total_interests DESC
    LIMIT ${limit}
  `;
}

// Get property performance trends
async function getPropertyTrends(propertyId: string, days = 30) {
  return await prisma.$queryRaw`
    SELECT
      DATE(pv.viewedAt) as view_date,
      COUNT(pv.id) as daily_views,
      COUNT(CASE WHEN bi.id IS NOT NULL THEN 1 END) as daily_interests,
      COUNT(CASE WHEN bi.status = 'CONFIRMED' THEN 1 END) as daily_confirmed
    FROM property_views pv
    LEFT JOIN booking_interests bi ON pv.propertyId = bi.propertyId
      AND DATE(bi.submittedAt) = DATE(pv.viewedAt)
    WHERE pv.propertyId = ${propertyId}
    AND pv.viewedAt >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(pv.viewedAt)
    ORDER BY view_date DESC
  `;
}
```

### 4. Booking Conversion Analytics
```typescript
// Get booking funnel metrics
async function getBookingFunnel(siteId: string, period = '7 days') {
  return await prisma.$queryRaw`
    WITH funnel_data AS (
      SELECT
        -- Views (top of funnel)
        COUNT(DISTINCT pv.sessionId) as unique_sessions,
        COUNT(DISTINCT pv.ipAddress) as unique_visitors,
        COUNT(pv.id) as total_views,

        -- Interests (middle of funnel)
        COUNT(DISTINCT bi.id) as total_interests,
        COUNT(DISTINCT CASE WHEN bi.status = 'NEW' THEN bi.id END) as new_interests,
        COUNT(DISTINCT CASE WHEN bi.status = 'CONTACTED' THEN bi.id END) as contacted_interests,

        -- Conversions (bottom of funnel)
        COUNT(DISTINCT CASE WHEN bi.status = 'CONFIRMED' THEN bi.id END) as confirmed_bookings,

        -- Time-based filtering
        COUNT(DISTINCT CASE
          WHEN pv.viewedAt >= CURRENT_TIMESTAMP - INTERVAL '${period}'
          THEN pv.sessionId
        END) as recent_sessions,

        COUNT(DISTINCT CASE
          WHEN bi.submittedAt >= CURRENT_TIMESTAMP - INTERVAL '${period}'
          THEN bi.id
        END) as recent_interests,

        COUNT(DISTINCT CASE
          WHEN bi.confirmedAt >= CURRENT_TIMESTAMP - INTERVAL '${period}'
          THEN bi.id
        END) as recent_confirmed

      FROM sites s
      LEFT JOIN property_views pv ON s.id = pv."siteId"
      LEFT JOIN booking_interests bi ON s.id = bi."siteId"
      WHERE s.id = ${siteId}
    )
    SELECT
      *,
      -- Conversion rates
      CASE
        WHEN total_views > 0
        THEN ROUND(total_interests * 100.0 / total_views, 2)
        ELSE 0
      END as view_to_interest_rate,
      CASE
        WHEN total_interests > 0
        THEN ROUND(confirmed_bookings * 100.0 / total_interests, 2)
        ELSE 0
      END as interest_to_booking_rate,
      CASE
        WHEN total_views > 0
        THEN ROUND(confirmed_bookings * 100.0 / total_views, 2)
        ELSE 0
      END as view_to_booking_rate,

      -- Recent performance
      CASE
        WHEN recent_sessions > 0
        THEN ROUND(recent_interests * 100.0 / recent_sessions, 2)
        ELSE 0
      END as recent_view_to_interest_rate,
      CASE
        WHEN recent_interests > 0
        THEN ROUND(recent_confirmed * 100.0 / recent_interests, 2)
        ELSE 0
      END as recent_interest_to_booking_rate

    FROM funnel_data
  `;
}

// Get booking status distribution
async function getBookingStatusDistribution(siteId: string) {
  return await prisma.bookingInterest.groupBy({
    by: ['status'],
    where: {
      siteId: siteId,
      submittedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  });
}
```

### 5. System Health Monitoring
```typescript
// Get current system health status
async function getSystemHealth(siteId?: string) {
  const whereClause = siteId
    ? prisma.$queryRaw`SELECT * FROM dashboard_recent_activity WHERE "siteId" = ${siteId} LIMIT 1`
    : prisma.$queryRaw`SELECT * FROM dashboard_recent_activity`;

  const activity = await whereClause;
  return activity[0]?.health_summary;
}

// Get detailed health metrics
async function getDetailedHealthMetrics(siteId?: string) {
  const siteFilter = siteId ? `WHERE "siteId" = ${siteId} OR "siteId" IS NULL` : '';

  return await prisma.$queryRaw`
    SELECT
      service,
      status,
      responseTime,
      "lastChecked",
      "errorMessage",
      CASE
        WHEN status = 'HEALTHY' THEN 'success'
        WHEN status = 'DEGRADED' THEN 'warning'
        WHEN status = 'UNHEALTHY' THEN 'error'
        WHEN status = 'DOWN' THEN 'critical'
        ELSE 'unknown'
      END as status_level
    FROM system_health
    ${siteFilter}
    ORDER BY
      CASE status
        WHEN 'DOWN' THEN 1
        WHEN 'UNHEALTHY' THEN 2
        WHEN 'DEGRADED' THEN 3
        WHEN 'HEALTHY' THEN 4
      END,
      service
  `;
}
```

### 6. Real-time Activity Monitoring
```typescript
// Get recent activity for live dashboard
async function getRecentActivity(siteId: string) {
  return await prisma.$queryRaw`
    SELECT * FROM dashboard_recent_activity
    WHERE "siteId" = ${siteId}
    LIMIT 1
  `;
}

// Get live booking interests (last hour)
async function getLiveBookingInterests(siteId: string) {
  return await prisma.bookingInterest.findMany({
    where: {
      siteId: siteId,
      submittedAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      }
    },
    include: {
      property: {
        select: {
          name: true,
          type: true,
          basePrice: true
        }
      }
    },
    orderBy: {
      submittedAt: 'desc'
    },
    take: 10
  });
}

// Get live property views (last hour)
async function getLivePropertyViews(siteId: string) {
  return await prisma.propertyView.findMany({
    where: {
      siteId: siteId,
      viewedAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      }
    },
    include: {
      property: {
        select: {
          name: true,
          type: true
        }
      }
    },
    orderBy: {
      viewedAt: 'desc'
    },
    take: 20
  });
}
```

## Performance Optimization Notes

### Index Utilization
- The queries are optimized to use the newly created indexes:
  - `idx_booking_interests_dashboard_metrics` for booking analytics
  - `idx_property_views_daily_rollup` for view analytics
  - `idx_system_health_site_service_status` for health monitoring

### Query Patterns
1. **Site-scoped queries** leverage composite indexes for multi-tenant isolation
2. **Time-based queries** use date truncation for efficient rollups
3. **Conversion funnels** aggregate across multiple tables with proper joins
4. **Real-time monitoring** uses recent data windows to minimize scan scope

### Caching Strategy
- Dashboard metrics should be cached with 5-15 minute TTL
- Daily metrics can be cached for 1-4 hours
- Historical metrics (weekly/monthly) can be cached for 24 hours
- Real-time activity should have minimal caching (1-2 minutes max)

## Implementation Example
```typescript
// Dashboard API endpoint example
export async function getDashboardData(siteId: string) {
  const [
    siteMetrics,
    dailyMetrics,
    popularProperties,
    bookingFunnel,
    systemHealth,
    recentActivity
  ] = await Promise.all([
    getSiteMetrics(siteId),
    getDailyMetrics(siteId, 30),
    getPopularProperties(siteId, 5),
    getBookingFunnel(siteId, '7 days'),
    getSystemHealth(siteId),
    getRecentActivity(siteId)
  ]);

  return {
    overview: siteMetrics,
    trends: dailyMetrics,
    properties: popularProperties,
    conversion: bookingFunnel,
    health: systemHealth,
    activity: recentActivity
  };
}
```

## Usage Notes
- All queries are optimized for PostgreSQL
- Date intervals use PostgreSQL syntax
- Consider implementing connection pooling for dashboard queries
- Monitor query performance and adjust indexes as needed
- Use Prisma query logging for optimization opportunities