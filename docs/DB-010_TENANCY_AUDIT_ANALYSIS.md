# DB-010: Tenancy and Auditing Consistency Analysis

## Executive Summary

This document analyzes the multi-tenant foundation and audit logging infrastructure of the resort management system, identifying gaps and providing comprehensive solutions for enterprise-grade tenancy isolation and audit consistency.

## Current State Analysis

### Multi-Tenant Foundation Strengths
✅ **Brand/Site Hierarchy**: Well-structured multi-tenant architecture with Brand → Site relationship
✅ **Site Scoping**: Most core business models include proper `siteId` foreign key constraints
✅ **Cascade Delete Rules**: Proper cascading maintains data integrity within tenant boundaries
✅ **User-Role-Site Mapping**: Comprehensive user access control through `SiteUser` junction table

### Critical Gaps Identified

#### 1. **Missing Tenant Isolation (High Priority)**
**Models lacking `siteId` for proper tenant isolation:**

**Core System Models:**
- `Session` - User sessions not tenant-scoped (security risk)
- `ContentVersion` - Content versions not isolated per site
- `Workflow` - Workflow definitions not tenant-scoped
- `WorkflowItem` - Workflow instances not tenant-scoped
- `WorkflowStep` - Workflow steps not tenant-scoped
- `SeoMetadata` - SEO metadata inherits from Page but lacks explicit siteId

**Booking System Models:**
- `Room` - Rooms lack direct siteId (only propertyId)
- `BookingRoom` - Junction table lacks siteId
- `Payment` - Payments lack siteId (payment isolation risk)
- `RefundRequest` - Refunds lack siteId
- `AvailabilityRule` - Property-specific rules lack siteId
- `PricingRule` - Pricing rules lack siteId
- `RoomAvailability` - Room availability lacks siteId
- `BookingNotification` - Notifications lack siteId
- `BookingAuditLog` - Audit logs lack siteId
- `WaitlistEntry` - Waitlist entries lack siteId

**System Monitoring Models:**
- `SystemHealth` - System-wide monitoring not tenant-scoped
- `SystemLog` - System logs not tenant-scoped
- `SystemHealthHistory` - Health history not tenant-scoped
- `HealthAlert` - Alerts not tenant-scoped
- `MaintenanceJob` - Maintenance jobs not tenant-scoped
- `MaintenanceExecution` - Execution history not tenant-scoped
- `MaintenanceApproval` - Approvals not tenant-scoped
- `MaintenanceNotification` - Maintenance notifications not tenant-scoped
- `SystemPerformance` - Performance metrics not tenant-scoped
- `ResortOperationalMetrics` - Partially scoped (has siteId)
- `GuestServiceMetrics` - Partially scoped (has siteId)
- `SystemAnomaly` - Anomalies not tenant-scoped
- `AnalyticsEvent` - Analytics events properly scoped

#### 2. **Audit Log Inconsistencies (High Priority)**

**Current Audit Log Models:**
1. `AuditLog` - Generic system audit logging
2. `ConfigAuditLog` - Configuration-specific audit logging
3. `BookingAuditLog` - Booking-specific audit logging

**Critical Issues:**
- **Inconsistent Schema**: Different field names and structures across audit models
- **Missing Module Identification**: No standardized module/entity categorization
- **Incomplete Site Scoping**: Some audit logs lack siteId
- **Missing Correlation Tracking**: No way to correlate related audit events
- **Limited Indexing**: Performance issues with audit queries
- **No Immutable Trail**: Missing mechanisms for tamper-proof auditing

#### 3. **Cascade Delete Rule Issues (Medium Priority)**

**Inconsistent Cascade Behaviors:**
- Some models use `SetNull` instead of `Cascade` for tenant isolation
- Missing cascade rules could create orphaned records across tenants
- Inconsistent foreign key constraint definitions

## Implementation Plan

### Phase 1: Critical Security Fixes
1. **Add Missing siteId Fields** - Ensure all tenant-specific models have proper site scoping
2. **Fix Audit Log Schema** - Standardize audit log structure across all modules
3. **Implement Comprehensive Indexing** - Optimize for tenant-scoped queries

### Phase 2: Audit Enhancement
1. **Unified Audit Trail** - Create single, comprehensive audit model
2. **Correlation Tracking** - Add ability to track related events
3. **Immutable Audit** - Implement tamper-proof mechanisms

### Phase 3: Performance Optimization
1. **Query Optimization** - Optimize tenant-scoped queries
2. **Index Strategy** - Comprehensive indexing for performance
3. **Archive Strategy** - Implement audit log retention policies

## Detailed Findings

### Models Requiring Immediate Attention

#### Security-Critical Missing siteId:
1. **Session** - User sessions MUST be tenant-scoped for security
2. **Payment** - Payment data MUST be isolated per tenant
3. **BookingAuditLog** - Audit logs MUST be tenant-scoped

#### Business-Critical Missing siteId:
1. **Room** - Room data should be directly tenant-scoped
2. **BookingNotification** - Notifications should be tenant-scoped
3. **Workflow*** - All workflow models need tenant scoping

### Audit Log Standardization Requirements

#### Required Standard Fields:
```typescript
interface UnifiedAuditLog {
  id: string
  siteId: string           // Tenant identification
  moduleId: string         // Module/category (BOOKING, CMS, CONFIG, etc.)
  entityId: string         // Entity being audited
  entityType: string       // Type of entity
  action: string           // Action performed (CREATE, UPDATE, DELETE, etc.)
  userId?: string          // User who performed action
  oldValue?: Json          // Previous state
  newValue?: Json          // New state
  changedFields?: string[] // List of changed fields
  reason?: string          // Reason for change
  correlationId?: string   // Correlate related events
  ipAddress?: string       // Client IP
  userAgent?: string       // Client user agent
  requestId?: string       // Request ID for tracing
  batchId?: string         // Batch operation ID
  occurredAt: DateTime      // When the event occurred
  createdAt: DateTime       // When audit record was created
}
```

### Performance Indexing Strategy

#### Essential Indexes for Tenant Isolation:
1. **Primary Tenant Index**: `(siteId, createdAt DESC)` - Default tenant queries
2. **Module-Specific**: `(siteId, moduleId, occurredAt DESC)` - Module-specific queries
3. **Entity-Specific**: `(siteId, entityId, entityType, occurredAt DESC)` - Entity history
4. **User Actions**: `(siteId, userId, occurredAt DESC)` - User activity tracking
5. **Correlation**: `(correlationId, occurredAt ASC)` - Event reconstruction

## Recommendations

### Immediate Actions (Critical)
1. **Add siteId to Session model** - Security vulnerability
2. **Standardize audit log schemas** - Compliance requirement
3. **Add siteId to Payment model** - Data isolation requirement
4. **Implement comprehensive indexing** - Performance requirement

### Short-term Actions (High Priority)
1. **Migrate existing audit logs** to unified schema
2. **Add siteId to remaining business models**
3. **Implement audit correlation tracking**
4. **Add comprehensive tenant isolation tests**

### Long-term Actions (Medium Priority)
1. **Implement immutable audit trail**
2. **Add audit log archiving**
3. **Implement real-time audit monitoring**
4. **Add compliance reporting features**

## Security Implications

### Current Risks:
1. **Data Leakage**: Sessions not tenant-scoped could allow cross-tenant access
2. **Privacy Violations**: Payment data not properly isolated
3. **Compliance Issues**: Inconsistent audit trails may violate regulations

### Mitigation Strategies:
1. **Immediate siteId addition** to critical models
2. **Row-level security** implementation
3. **Comprehensive audit testing**
4. **Regular security audits**

## Conclusion

The resort management system has a solid multi-tenant foundation but requires critical security and compliance improvements. The missing tenant isolation in several key models represents a significant security risk that must be addressed immediately. The audit log inconsistencies pose compliance risks that should be resolved through standardization.

Implementing the recommended changes will provide enterprise-grade tenant isolation and audit capabilities suitable for multi-resort operations with strict regulatory requirements.