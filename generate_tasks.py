
import json

def microtask(task_id, title, agent):
    return {
        "id": task_id,
        "title": title,
        "agent_requirement": agent
    }

def subtask(task_id, title, agent, microtasks):
    return {
        "id": task_id,
        "title": title,
        "agent_requirement": agent,
        "microtasks": microtasks
    }

def task(task_id, title, agent, subtasks):
    return {
        "id": task_id,
        "title": title,
        "agent_requirement": agent,
        "subtasks": subtasks
    }

db_agent = "DB-Specialist-Agent"
backend_agent = "Backend-API-Agent"
integration_agent = "Integration-Agent"
qa_agent = "QA-Agent"
devops_agent = "DevOps-Agent"

phase1_tasks = [
    task(
        "DB-001",
        "Align dashboard metrics persistence",
        db_agent,
        [
            subtask(
                "DB-001-1",
                "Model aggregated KPI query sources",
                db_agent,
                [
                    microtask("DB-001-1a", "Confirm metrics coverage across `properties`, `booking_interests`, `property_views`, `system_health` tables", db_agent),
                    microtask("DB-001-1b", "Define consolidated site-scoped dashboard metrics view", db_agent)
                ]
            ),
            subtask(
                "DB-001-2",
                "Optimize dashboard query indexes",
                db_agent,
                [
                    microtask("DB-001-2a", "Add composite index on `booking_interests (siteId, status, submittedAt)`", db_agent),
                    microtask("DB-001-2b", "Create daily rollup index on `property_views (siteId, viewedAt)`", db_agent),
                    microtask("DB-001-2c", "Enforce unique service key on `system_health` table", db_agent)
                ]
            )
        ]
    ),
    task(
        "DB-002",
        "Finalize property and room schema",
        db_agent,
        [
            subtask(
                "DB-002-1",
                "Validate property, room, availability, and pricing tables",
                db_agent,
                [
                    microtask("DB-002-1a", "Verify `properties` fields match admin scope (type, status, pricing metadata)", db_agent),
                    microtask("DB-002-1b", "Ensure `rooms` include capacity, amenities, media arrays", db_agent),
                    microtask("DB-002-1c", "Align `availability` records with date range and status columns", db_agent)
                ]
            ),
            subtask(
                "DB-002-2",
                "Strengthen relational constraints and indexes",
                db_agent,
                [
                    microtask("DB-002-2a", "Add foreign keys linking rooms, availability, and pricing to properties", db_agent),
                    microtask("DB-002-2b", "Index `properties` by `siteId`, `status`, and `isActive`", db_agent),
                    microtask("DB-002-2c", "Create seasonal pricing index on `pricing (propertyId, season, effectiveFrom)`", db_agent)
                ]
            )
        ]
    ),
    task(
        "DB-003",
        "Implement booking interest lead storage",
        db_agent,
        [
            subtask(
                "DB-003-1",
                "Structure `booking_interests` table",
                db_agent,
                [
                    microtask("DB-003-1a", "Capture customer contact, stay dates, guest counts, and notes fields", db_agent),
                    microtask("DB-003-1b", "Apply unique constraint on `referenceCode` with default `status` value", db_agent)
                ]
            ),
            subtask(
                "DB-003-2",
                "Support follow-up tracking and performance",
                db_agent,
                [
                    microtask("DB-003-2a", "Create `booking_interest_activity` history table", db_agent),
                    microtask("DB-003-2b", "Index `booking_interests` by `(siteId, status)`", db_agent),
                    microtask("DB-003-2c", "Add trigger updating `lastContactedAt` on status change", db_agent)
                ]
            )
        ]
    ),
    task(
        "DB-004",
        "Harden user and role management schema",
        db_agent,
        [
            subtask(
                "DB-004-1",
                "Confirm core authentication tables",
                db_agent,
                [
                    microtask("DB-004-1a", "Ensure `users` table enforces site-scoped unique email and password hash storage", db_agent),
                    microtask("DB-004-1b", "Seed `roles` definitions with ADMIN, EDITOR, and VIEWER baseline permissions", db_agent),
                    microtask("DB-004-1c", "Implement `user_roles` junction table with composite primary key", db_agent)
                ]
            ),
            subtask(
                "DB-004-2",
                "Augment session and audit persistence",
                db_agent,
                [
                    microtask("DB-004-2a", "Review `sessions` and `refresh_tokens` schema for JWT lifecycle support", db_agent),
                    microtask("DB-004-2b", "Index `audit_logs` by `(entityType, entityId, occurredAt)`", db_agent),
                    microtask("DB-004-2c", "Add `user_activity` table capturing authentication events", db_agent)
                ]
            )
        ]
    ),
    task(
        "DB-005",
        "Design CMS content storage",
        db_agent,
        [
            subtask(
                "DB-005-1",
                "Align page, block, and version tables",
                db_agent,
                [
                    microtask("DB-005-1a", "Ensure `cms_pages` capture slug, status, and publish metadata", db_agent),
                    microtask("DB-005-1b", "Link `content_blocks` to pages with ordering and block type metadata", db_agent),
                    microtask("DB-005-1c", "Create `content_versions` history table with diff payload support", db_agent)
                ]
            ),
            subtask(
                "DB-005-2",
                "Optimize CMS data access",
                db_agent,
                [
                    microtask("DB-005-2a", "Index `cms_pages` on `(siteId, status, slug)`", db_agent),
                    microtask("DB-005-2b", "Add GIN index for JSONB content fields", db_agent),
                    microtask("DB-005-2c", "Establish `seo_metadata` table keyed by page identifier", db_agent)
                ]
            )
        ]
    )
]
phase1_tasks += [
    task(
        "DB-006",
        "Prepare media library persistence",
        db_agent,
        [
            subtask(
                "DB-006-1",
                "Confirm media metadata model",
                db_agent,
                [
                    microtask("DB-006-1a", "Store file URI, mime type, size, dimensions, and checksum values", db_agent),
                    microtask("DB-006-1b", "Add `storageProvider`, `siteId`, and `uploadedBy` columns", db_agent)
                ]
            ),
            subtask(
                "DB-006-2",
                "Support library organization",
                db_agent,
                [
                    microtask("DB-006-2a", "Create `media_folders` with parent-child relationship mapping", db_agent),
                    microtask("DB-006-2b", "Add `media_tags` catalog and `media_tag_links` join table", db_agent),
                    microtask("DB-006-2c", "Model `media_thumbnails` referencing source media records", db_agent)
                ]
            ),
            subtask(
                "DB-006-3",
                "Improve media lookup performance",
                db_agent,
                [
                    microtask("DB-006-3a", "Create trigram index on `media.filename` for search support", db_agent),
                    microtask("DB-006-3b", "Index `media` by `(siteId, createdAt)`", db_agent),
                    microtask("DB-006-3c", "Add partial index for `media` on `status = 'ACTIVE'`", db_agent)
                ]
            )
        ]
    ),
    task(
        "DB-007",
        "Enable analytics and reporting storage",
        db_agent,
        [
            subtask(
                "DB-007-1",
                "Create analytics and reporting tables",
                db_agent,
                [
                    microtask("DB-007-1a", "Define `analytics_events` schema with JSONB payload", db_agent),
                    microtask("DB-007-1b", "Add `report_definitions` and `report_runs` tables", db_agent),
                    microtask("DB-007-1c", "Model `report_visualizations` for saved chart configurations", db_agent)
                ]
            ),
            subtask(
                "DB-007-2",
                "Set up performance aids for analytics queries",
                db_agent,
                [
                    microtask("DB-007-2a", "Partition `analytics_events` by month on `occurredAt`", db_agent),
                    microtask("DB-007-2b", "Create materialized `analytics_daily_summary` table", db_agent),
                    microtask("DB-007-2c", "Define `analytics_exports` table storing generated files", db_agent)
                ]
            )
        ]
    ),
    task(
        "DB-008",
        "Set up configuration storage",
        db_agent,
        [
            subtask(
                "DB-008-1",
                "Model site, brand, integration, and security settings tables",
                db_agent,
                [
                    microtask("DB-008-1a", "Use JSONB columns for flexible configuration payloads", db_agent),
                    microtask("DB-008-1b", "Add optimistic lock `version` column to settings tables", db_agent),
                    microtask("DB-008-1c", "Ensure each settings table includes `siteId` foreign keys", db_agent)
                ]
            ),
            subtask(
                "DB-008-2",
                "Provide history and backup tracking",
                db_agent,
                [
                    microtask("DB-008-2a", "Create `settings_snapshots` with backup metadata", db_agent),
                    microtask("DB-008-2b", "Add trigger logging configuration changes into `audit_logs`", db_agent),
                    microtask("DB-008-2c", "Index settings snapshots by `(siteId, createdAt)`", db_agent)
                ]
            )
        ]
    ),
    task(
        "DB-009",
        "Strengthen system maintenance data layer",
        db_agent,
        [
            subtask(
                "DB-009-1",
                "Create health, log, and maintenance tracking tables",
                db_agent,
                [
                    microtask("DB-009-1a", "Implement `system_health` per service status entries", db_agent),
                    microtask("DB-009-1b", "Define `system_logs` storing level, context, and payload", db_agent),
                    microtask("DB-009-1c", "Add `maintenance_jobs` table for backups and optimizations", db_agent)
                ]
            ),
            subtask(
                "DB-009-2",
                "Enforce retention and queryability",
                db_agent,
                [
                    microtask("DB-009-2a", "Set retention policy process for `system_logs`", db_agent),
                    microtask("DB-009-2b", "Index `system_health` on `siteId` and `checkedAt`", db_agent),
                    microtask("DB-009-2c", "Create view summarizing pending maintenance jobs", db_agent)
                ]
            )
        ]
    ),
    task(
        "DB-010",
        "Ensure tenancy and auditing consistency",
        db_agent,
        [
            subtask(
                "DB-010-1",
                "Verify site scoping across tables",
                db_agent,
                [
                    microtask("DB-010-1a", "Audit tables to confirm `siteId` presence and foreign key constraints", db_agent),
                    microtask("DB-010-1b", "Align cascade rules with isolation requirements", db_agent)
                ]
            ),
            subtask(
                "DB-010-2",
                "Standardize audit log schema and coverage",
                db_agent,
                [
                    microtask("DB-010-2a", "Unify `audit_logs` columns for actor, module, and entity references", db_agent),
                    microtask("DB-010-2b", "Index audit logs by `(siteId, module, occurredAt)`", db_agent),
                    microtask("DB-010-2c", "Backfill module identifiers for existing audit records", db_agent)
                ]
            )
        ]
    )
]

phase2_tasks = [
    task(
        "BE-001",
        "Implement dashboard analytics API suite",
        backend_agent,
        [
            subtask(
                "BE-001-1",
                "Design dashboard metrics and DTO contracts",
                backend_agent,
                [
                    microtask("BE-001-1a", "Define `DashboardMetrics` and `Activity` interfaces per scope requirements", backend_agent),
                    microtask("BE-001-1b", "Create query parameter validation for time range and site filters", backend_agent)
                ]
            ),
            subtask(
                "BE-001-2",
                "Build DashboardService aggregations",
                backend_agent,
                [
                    microtask("BE-001-2a", "Aggregate property availability, booking statistics, and view counts", backend_agent),
                    microtask("BE-001-2b", "Integrate system health status into metrics responses", backend_agent),
                    microtask("BE-001-2c", "Implement caching hooks for dashboard metrics retrieval", backend_agent)
                ]
            ),
            subtask(
                "BE-001-3",
                "Expose dashboard controller endpoints",
                backend_agent,
                [
                    microtask("BE-001-3a", "Wire GET `/api/v1/admin/dashboard/metrics` with RBAC checks", backend_agent),
                    microtask("BE-001-3b", "Implement `/api/v1/admin/dashboard/recent-activity` with pagination", backend_agent),
                    microtask("BE-001-3c", "Provide `/api/v1/admin/dashboard/export` streaming with audit logging", backend_agent)
                ]
            )
        ]
    ),
    task(
        "BE-002",
        "Develop properties management backend",
        backend_agent,
        [
            subtask(
                "BE-002-1",
                "Define property, room, availability, and pricing DTOs",
                backend_agent,
                [
                    microtask("BE-002-1a", "Create schema validation for property create and update payloads", backend_agent),
                    microtask("BE-002-1b", "Build room DTOs covering capacity, amenities, and media arrays", backend_agent),
                    microtask("BE-002-1c", "Model availability and pricing request payloads with date validation", backend_agent)
                ]
            ),
            subtask(
                "BE-002-2",
                "Implement PropertyService business logic",
                backend_agent,
                [
                    microtask("BE-002-2a", "Handle property CRUD operations with cascade updates", backend_agent),
                    microtask("BE-002-2b", "Manage room lifecycle and amenity synchronization", backend_agent),
                    microtask("BE-002-2c", "Integrate media upload references for property photos", backend_agent)
                ]
            ),
            subtask(
                "BE-002-3",
                "Create property controllers and routes",
                backend_agent,
                [
                    microtask("BE-002-3a", "Register admin property routes with pagination and filters", backend_agent),
                    microtask("BE-002-3b", "Implement availability and pricing endpoints with validation", backend_agent),
                    microtask("BE-002-3c", "Apply permission guards for EDITOR and ADMIN roles", backend_agent)
                ]
            )
        ]
    ),
    task(
        "BE-003",
        "Deliver booking interest management services",
        backend_agent,
        [
            subtask(
                "BE-003-1",
                "Implement public booking submission flow",
                backend_agent,
                [
                    microtask("BE-003-1a", "Validate public booking form inputs and apply rate limiting", backend_agent),
                    microtask("BE-003-1b", "Generate unique reference codes and persist leads", backend_agent),
                    microtask("BE-003-1c", "Log submission events for audit and analytics", backend_agent)
                ]
            ),
            subtask(
                "BE-003-2",
                "Build admin booking interest endpoints",
                backend_agent,
                [
                    microtask("BE-003-2a", "Implement list and detail endpoints with filtering and sorting", backend_agent),
                    microtask("BE-003-2b", "Handle status changes and admin notes updates", backend_agent),
                    microtask("BE-003-2c", "Create CSV and Excel export actions", backend_agent)
                ]
            ),
            subtask(
                "BE-003-3",
                "Integrate availability and follow-up workflow",
                backend_agent,
                [
                    microtask("BE-003-3a", "Connect property availability check API", backend_agent),
                    microtask("BE-003-3b", "Trigger follow-up reminders based on `lastContactedAt`", backend_agent),
                    microtask("BE-003-3c", "Ensure audit events for contact and confirm operations", backend_agent)
                ]
            )
        ]
    ),
    task(
        "BE-004",
        "Implement users and roles backend",
        backend_agent,
        [
            subtask(
                "BE-004-1",
                "Develop user lifecycle services",
                backend_agent,
                [
                    microtask("BE-004-1a", "Create user onboarding flow including invites and password setup", backend_agent),
                    microtask("BE-004-1b", "Implement activate and deactivate endpoints", backend_agent),
                    microtask("BE-004-1c", "Record login activity and enforce password policies", backend_agent)
                ]
            ),
            subtask(
                "BE-004-2",
                "Manage RBAC roles and permissions",
                backend_agent,
                [
                    microtask("BE-004-2a", "Expose role CRUD APIs with default permissions", backend_agent),
                    microtask("BE-004-2b", "Assign and revoke roles via service layer", backend_agent),
                    microtask("BE-004-2c", "Integrate permission checks into authorization middleware", backend_agent)
                ]
            ),
            subtask(
                "BE-004-3",
                "Provide session and security endpoints",
                backend_agent,
                [
                    microtask("BE-004-3a", "List active sessions per user", backend_agent),
                    microtask("BE-004-3b", "Implement session revocation endpoint", backend_agent),
                    microtask("BE-004-3c", "Audit security configuration changes and session events", backend_agent)
                ]
            )
        ]
    ),
    task(
        "BE-005",
        "Build CMS content backend",
        backend_agent,
        [
            subtask(
                "BE-005-1",
                "Define page and block data contracts",
                backend_agent,
                [
                    microtask("BE-005-1a", "Define page create and update payloads with SEO metadata", backend_agent),
                    microtask("BE-005-1b", "Model content block types and ordering schema", backend_agent),
                    microtask("BE-005-1c", "Validate content JSON structures per block type", backend_agent)
                ]
            ),
            subtask(
                "BE-005-2",
                "Implement CMS service and versioning",
                backend_agent,
                [
                    microtask("BE-005-2a", "Implement page CRUD with draft and published states", backend_agent),
                    microtask("BE-005-2b", "Create versioning service capturing content diffs", backend_agent),
                    microtask("BE-005-2c", "Handle publish flow with cache invalidation hooks", backend_agent)
                ]
            ),
            subtask(
                "BE-005-3",
                "Expose CMS route controllers",
                backend_agent,
                [
                    microtask("BE-005-3a", "Register page and block endpoints with RBAC enforcement", backend_agent),
                    microtask("BE-005-3b", "Implement SEO metadata update endpoint", backend_agent),
                    microtask("BE-005-3c", "Add error handling for invalid content states", backend_agent)
                ]
            )
        ]
    ),
    task(
        "BE-006",
        "Implement media management backend",
        backend_agent,
        [
            subtask(
                "BE-006-1",
                "Build upload and processing pipeline",
                backend_agent,
                [
                    microtask("BE-006-1a", "Integrate file storage adapter for uploads", backend_agent),
                    microtask("BE-006-1b", "Generate thumbnails and persist transformation metadata", backend_agent),
                    microtask("BE-006-1c", "Capture media metadata and checksum for duplicate detection", backend_agent)
                ]
            ),
            subtask(
                "BE-006-2",
                "Deliver library organization features",
                backend_agent,
                [
                    microtask("BE-006-2a", "Implement folder CRUD plus move and copy actions", backend_agent),
                    microtask("BE-006-2b", "Add tagging endpoints with search filters", backend_agent),
                    microtask("BE-006-2c", "Provide media stats endpoint for usage analytics", backend_agent)
                ]
            ),
            subtask(
                "BE-006-3",
                "Support optimization and cleanup operations",
                backend_agent,
                [
                    microtask("BE-006-3a", "Implement optimize and transcode endpoints", backend_agent),
                    microtask("BE-006-3b", "Create cleanup job for unused media assets", backend_agent),
                    microtask("BE-006-3c", "Audit all media operations for compliance", backend_agent)
                ]
            )
        ]
    ),
    task(
        "BE-007",
        "Deliver reports and analytics services",
        backend_agent,
        [
            subtask(
                "BE-007-1",
                "Implement analytics data ingestion",
                backend_agent,
                [
                    microtask("BE-007-1a", "Implement `/api/v1/analytics/events` endpoint", backend_agent),
                    microtask("BE-007-1b", "Validate and normalize analytics event payloads", backend_agent),
                    microtask("BE-007-1c", "Apply retention policy for analytics events", backend_agent)
                ]
            ),
            subtask(
                "BE-007-2",
                "Build custom report lifecycle",
                backend_agent,
                [
                    microtask("BE-007-2a", "Create report definition CRUD with filter builders", backend_agent),
                    microtask("BE-007-2b", "Implement report execution and caching", backend_agent),
                    microtask("BE-007-2c", "Support scheduling and notification for reports", backend_agent)
                ]
            ),
            subtask(
                "BE-007-3",
                "Expose visualization and export APIs",
                backend_agent,
                [
                    microtask("BE-007-3a", "Serve chart data for dashboard and analytics pages", backend_agent),
                    microtask("BE-007-3b", "Enable visualization export to PDF or PNG", backend_agent),
                    microtask("BE-007-3c", "Record export actions in audit logs", backend_agent)
                ]
            )
        ]
    ),
    task(
        "BE-008",
        "Implement settings and configuration backend",
        backend_agent,
        [
            subtask(
                "BE-008-1",
                "Deliver site and brand settings APIs",
                backend_agent,
                [
                    microtask("BE-008-1a", "Implement retrieval and update endpoints for site settings", backend_agent),
                    microtask("BE-008-1b", "Add brand asset upload and color palette endpoints", backend_agent),
                    microtask("BE-008-1c", "Support preview endpoint for pending configuration changes", backend_agent)
                ]
            ),
            subtask(
                "BE-008-2",
                "Build integration management workflow",
                backend_agent,
                [
                    microtask("BE-008-2a", "Implement integration CRUD endpoints", backend_agent),
                    microtask("BE-008-2b", "Create connectivity test for integration entries", backend_agent),
                    microtask("BE-008-2c", "Store sanitized integration credentials securely", backend_agent)
                ]
            ),
            subtask(
                "BE-008-3",
                "Expose security configuration endpoints",
                backend_agent,
                [
                    microtask("BE-008-3a", "Expose session listing and revocation APIs", backend_agent),
                    microtask("BE-008-3b", "Add 2FA configuration endpoints", backend_agent),
                    microtask("BE-008-3c", "Validate security policy updates with RBAC checks", backend_agent)
                ]
            )
        ]
    ),
    task(
        "BE-009",
        "Implement system and maintenance backend",
        backend_agent,
        [
            subtask(
                "BE-009-1",
                "Develop system health and logging endpoints",
                backend_agent,
                [
                    microtask("BE-009-1a", "Aggregate service checks for `/api/v1/system/health`", backend_agent),
                    microtask("BE-009-1b", "Provide paginated `/api/v1/system/logs` with filters", backend_agent),
                    microtask("BE-009-1c", "Secure log clear operation with audit trail", backend_agent)
                ]
            ),
            subtask(
                "BE-009-2",
                "Implement backup and restore operations",
                backend_agent,
                [
                    microtask("BE-009-2a", "Implement backup job trigger and metadata storage", backend_agent),
                    microtask("BE-009-2b", "Handle restore endpoint with safety validation", backend_agent),
                    microtask("BE-009-2c", "List and download backup assets", backend_agent)
                ]
            ),
            subtask(
                "BE-009-3",
                "Provide database maintenance commands",
                backend_agent,
                [
                    microtask("BE-009-3a", "Wire database optimize endpoint with job status reporting", backend_agent),
                    microtask("BE-009-3b", "Expose migration trigger with locking safeguards", backend_agent),
                    microtask("BE-009-3c", "Restrict maintenance endpoints to SUPER_ADMIN role", backend_agent)
                ]
            )
        ]
    )
]

phase3_tasks = [
    task(
        "IN-001",
        "Implement authentication and tenant middleware stack",
        integration_agent,
        [
            subtask(
                "IN-001-1",
                "Build JWT validation pipeline",
                integration_agent,
                [
                    microtask("IN-001-1a", "Verify access tokens and refresh rotation logic", integration_agent),
                    microtask("IN-001-1b", "Load user context with roles and permissions", integration_agent),
                    microtask("IN-001-1c", "Handle token expiration and standardized error responses", integration_agent)
                ]
            ),
            subtask(
                "IN-001-2",
                "Propagate tenant-aware request context",
                integration_agent,
                [
                    microtask("IN-001-2a", "Attach `siteId` context from tokens to request scope", integration_agent),
                    microtask("IN-001-2b", "Validate site access permissions against role grants", integration_agent),
                    microtask("IN-001-2c", "Ensure database queries receive tenant context", integration_agent)
                ]
            ),
            subtask(
                "IN-001-3",
                "Deliver authorization guard utilities",
                integration_agent,
                [
                    microtask("IN-001-3a", "Implement `requirePermission` middleware", integration_agent),
                    microtask("IN-001-3b", "Provide `requireRole` guard for privileged endpoints", integration_agent),
                    microtask("IN-001-3c", "Integrate guards across route modules", integration_agent)
                ]
            )
        ]
    ),
    task(
        "IN-002",
        "Set up request validation and rate limiting",
        integration_agent,
        [
            subtask(
                "IN-002-1",
                "Establish schema validation framework",
                integration_agent,
                [
                    microtask("IN-002-1a", "Adopt Zod schemas for API payload validation", integration_agent),
                    microtask("IN-002-1b", "Centralize validation error handling responses", integration_agent),
                    microtask("IN-002-1c", "Share DTO schemas across services for consistency", integration_agent)
                ]
            ),
            subtask(
                "IN-002-2",
                "Configure rate limiting strategy",
                integration_agent,
                [
                    microtask("IN-002-2a", "Configure rate limiting for public booking endpoints", integration_agent),
                    microtask("IN-002-2b", "Add abuse protection for sensitive admin routes", integration_agent),
                    microtask("IN-002-2c", "Expose rate limit headers to clients", integration_agent)
                ]
            ),
            subtask(
                "IN-002-3",
                "Normalize error and response handling",
                integration_agent,
                [
                    microtask("IN-002-3a", "Implement error translator matching `APIResponse` shape", integration_agent),
                    microtask("IN-002-3b", "Log validation and throttling incidents", integration_agent),
                    microtask("IN-002-3c", "Document shared error codes and guidance", integration_agent)
                ]
            )
        ]
    ),
    task(
        "IN-003",
        "Configure caching and performance layer",
        integration_agent,
        [
            subtask(
                "IN-003-1",
                "Set up cache infrastructure",
                integration_agent,
                [
                    microtask("IN-003-1a", "Provision Redis client and connection health checks", integration_agent),
                    microtask("IN-003-1b", "Define cache namespaces for dashboard metrics", integration_agent),
                    microtask("IN-003-1c", "Implement cache busting strategy hooks", integration_agent)
                ]
            ),
            subtask(
                "IN-003-2",
                "Apply module-specific caching",
                integration_agent,
                [
                    microtask("IN-003-2a", "Cache property list responses per site filters", integration_agent),
                    microtask("IN-003-2b", "Cache CMS published pages and invalidate on publish events", integration_agent),
                    microtask("IN-003-2c", "Cache media metadata for frequent reads", integration_agent)
                ]
            ),
            subtask(
                "IN-003-3",
                "Instrument performance monitoring",
                integration_agent,
                [
                    microtask("IN-003-3a", "Add query timing metrics for dashboard endpoints", integration_agent),
                    microtask("IN-003-3b", "Instrument cache hit and miss counters", integration_agent),
                    microtask("IN-003-3c", "Alert on cache connectivity failures", integration_agent)
                ]
            )
        ]
    ),
    task(
        "IN-004",
        "Implement audit and event logging pipeline",
        integration_agent,
        [
            subtask(
                "IN-004-1",
                "Standardize audit logging framework",
                integration_agent,
                [
                    microtask("IN-004-1a", "Define audit log payload format and severity levels", integration_agent),
                    microtask("IN-004-1b", "Integrate audit hooks into CRUD services across modules", integration_agent),
                    microtask("IN-004-1c", "Ensure audit entries capture site, user, and module identifiers", integration_agent)
                ]
            ),
            subtask(
                "IN-004-2",
                "Stream analytics events reliably",
                integration_agent,
                [
                    microtask("IN-004-2a", "Persist analytics events into `analytics_events` store", integration_agent),
                    microtask("IN-004-2b", "Support asynchronous queue for heavy analytics events", integration_agent),
                    microtask("IN-004-2c", "Deduplicate repeated analytics submissions", integration_agent)
                ]
            ),
            subtask(
                "IN-004-3",
                "Enhance operational logging",
                integration_agent,
                [
                    microtask("IN-004-3a", "Implement structured logger with correlation identifiers", integration_agent),
                    microtask("IN-004-3b", "Capture request and response metadata for troubleshooting", integration_agent),
                    microtask("IN-004-3c", "Forward critical logs to monitoring pipeline", integration_agent)
                ]
            )
        ]
    ),
    task(
        "IN-005",
        "Integrate external services and background jobs",
        integration_agent,
        [
            subtask(
                "IN-005-1",
                "Abstract media storage adapters",
                integration_agent,
                [
                    microtask("IN-005-1a", "Implement storage provider interface for media uploads", integration_agent),
                    microtask("IN-005-1b", "Configure S3 and local adapters per environment", integration_agent),
                    microtask("IN-005-1c", "Handle signed URL generation for private assets", integration_agent)
                ]
            ),
            subtask(
                "IN-005-2",
                "Support integration connector workflows",
                integration_agent,
                [
                    microtask("IN-005-2a", "Implement integration registry for settings module", integration_agent),
                    microtask("IN-005-2b", "Provide test harness for `/settings/integrations/:id/test` endpoint", integration_agent),
                    microtask("IN-005-2c", "Securely store sanitized credentials via adapter", integration_agent)
                ]
            ),
            subtask(
                "IN-005-3",
                "Coordinate background job scheduling",
                integration_agent,
                [
                    microtask("IN-005-3a", "Set up job queue for media optimization and report generation", integration_agent),
                    microtask("IN-005-3b", "Schedule dashboard summary refresh tasks", integration_agent),
                    microtask("IN-005-3c", "Monitor job execution KPIs and failure alerts", integration_agent)
                ]
            )
        ]
    )
]

phase4_tasks = [
    task(
        "QA-001",
        "Build unit test suites per service",
        qa_agent,
        [
            subtask(
                "QA-001-1",
                "Cover dashboard and analytics services",
                qa_agent,
                [
                    microtask("QA-001-1a", "Test DashboardService aggregations with seeded data", qa_agent),
                    microtask("QA-001-1b", "Mock cache integration to verify fallback behavior", qa_agent)
                ]
            ),
            subtask(
                "QA-001-2",
                "Test property and booking services",
                qa_agent,
                [
                    microtask("QA-001-2a", "Cover property CRUD validation rules", qa_agent),
                    microtask("QA-001-2b", "Test booking interest status transitions", qa_agent),
                    microtask("QA-001-2c", "Validate availability checks with fixtures", qa_agent)
                ]
            ),
            subtask(
                "QA-001-3",
                "Exercise CMS, media, and settings services",
                qa_agent,
                [
                    microtask("QA-001-3a", "Unit test CMS versioning rollback logic", qa_agent),
                    microtask("QA-001-3b", "Test media processing pipeline with sample files", qa_agent),
                    microtask("QA-001-3c", "Verify settings service diff and preview functionality", qa_agent)
                ]
            )
        ]
    ),
    task(
        "QA-002",
        "Implement integration test scenarios",
        qa_agent,
        [
            subtask(
                "QA-002-1",
                "Validate end-to-end property lifecycle",
                qa_agent,
                [
                    microtask("QA-002-1a", "Scenario: create property, add room, publish availability", qa_agent),
                    microtask("QA-002-1b", "Scenario: delete property and ensure cascading cleanup", qa_agent)
                ]
            ),
            subtask(
                "QA-002-2",
                "Cover booking interest flows",
                qa_agent,
                [
                    microtask("QA-002-2a", "Scenario: public submission through admin confirmation", qa_agent),
                    microtask("QA-002-2b", "Scenario: rate limit behavior for repeated submissions", qa_agent),
                    microtask("QA-002-2c", "Scenario: booking export file validation", qa_agent)
                ]
            ),
            subtask(
                "QA-002-3",
                "Test CMS publish and caching integration",
                qa_agent,
                [
                    microtask("QA-002-3a", "Scenario: create page, publish, verify cache invalidation", qa_agent),
                    microtask("QA-002-3b", "Scenario: revert to previous content version", qa_agent),
                    microtask("QA-002-3c", "Scenario: unauthorized page update is rejected", qa_agent)
                ]
            )
        ]
    ),
    task(
        "QA-003",
        "Establish API contract testing and mocks",
        qa_agent,
        [
            subtask(
                "QA-003-1",
                "Generate and maintain OpenAPI specifications",
                qa_agent,
                [
                    microtask("QA-003-1a", "Document endpoints across admin and public APIs", qa_agent),
                    microtask("QA-003-1b", "Automate OpenAPI generation in CI workflow", qa_agent)
                ]
            ),
            subtask(
                "QA-003-2",
                "Provide mock services for integration partners",
                qa_agent,
                [
                    microtask("QA-003-2a", "Create mock server for public booking endpoints", qa_agent),
                    microtask("QA-003-2b", "Mock external integration connectors for testing", qa_agent),
                    microtask("QA-003-2c", "Validate contract tests against mocks and live endpoints", qa_agent)
                ]
            ),
            subtask(
                "QA-003-3",
                "Execute performance and load smoke tests",
                qa_agent,
                [
                    microtask("QA-003-3a", "Set up load tests for dashboard metrics endpoints", qa_agent),
                    microtask("QA-003-3b", "Run concurrency tests on booking interest APIs", qa_agent),
                    microtask("QA-003-3c", "Track performance metrics against SLA targets", qa_agent)
                ]
            )
        ]
    ),
    task(
        "QA-004",
        "Configure CI pipeline and quality gates",
        qa_agent,
        [
            subtask(
                "QA-004-1",
                "Set up continuous integration workflows",
                qa_agent,
                [
                    microtask("QA-004-1a", "Configure pipeline to run lint, unit, and integration suites", qa_agent),
                    microtask("QA-004-1b", "Enforce coverage thresholds per module", qa_agent),
                    microtask("QA-004-1c", "Publish test reports and artifacts from CI", qa_agent)
                ]
            ),
            subtask(
                "QA-004-2",
                "Add static analysis and security checks",
                qa_agent,
                [
                    microtask("QA-004-2a", "Integrate TypeScript strict mode and ESLint rules", qa_agent),
                    microtask("QA-004-2b", "Add dependency vulnerability scanning", qa_agent),
                    microtask("QA-004-2c", "Set up Prisma schema migration linting", qa_agent)
                ]
            ),
            subtask(
                "QA-004-3",
                "Automate release readiness validation",
                qa_agent,
                [
                    microtask("QA-004-3a", "Automate regression suite before deployment approvals", qa_agent),
                    microtask("QA-004-3b", "Create checklist workflow for manual QA sign-off", qa_agent),
                    microtask("QA-004-3c", "Archive test evidence for compliance tracking", qa_agent)
                ]
            )
        ]
    )
]

phase5_tasks = [
    task(
        "DV-001",
        "Implement containerization and runtime setup",
        devops_agent,
        [
            subtask(
                "DV-001-1",
                "Create Docker build workflow",
                devops_agent,
                [
                    microtask("DV-001-1a", "Create multi-stage Dockerfile for Node.js and Prisma", devops_agent),
                    microtask("DV-001-1b", "Bake Prisma migration execution into image entrypoint", devops_agent),
                    microtask("DV-001-1c", "Publish base container image to registry", devops_agent)
                ]
            ),
            subtask(
                "DV-001-2",
                "Define Docker Compose orchestration",
                devops_agent,
                [
                    microtask("DV-001-2a", "Compose services for API, PostgreSQL, and Redis", devops_agent),
                    microtask("DV-001-2b", "Provide local development override configuration", devops_agent),
                    microtask("DV-001-2c", "Document start and teardown scripts", devops_agent)
                ]
            ),
            subtask(
                "DV-001-3",
                "Harden runtime containers",
                devops_agent,
                [
                    microtask("DV-001-3a", "Set resource limits and container health checks", devops_agent),
                    microtask("DV-001-3b", "Enable read-only root filesystem in production images", devops_agent),
                    microtask("DV-001-3c", "Configure container logging drivers and rotation", devops_agent)
                ]
            )
        ]
    ),
    task(
        "DV-002",
        "Establish configuration and secret management",
        devops_agent,
        [
            subtask(
                "DV-002-1",
                "Prepare environment configuration templates",
                devops_agent,
                [
                    microtask("DV-002-1a", "Produce `.env.example` covering required variables", devops_agent),
                    microtask("DV-002-1b", "Automate config injection per environment stage", devops_agent),
                    microtask("DV-002-1c", "Validate configuration at service startup", devops_agent)
                ]
            ),
            subtask(
                "DV-002-2",
                "Integrate secure secret storage",
                devops_agent,
                [
                    microtask("DV-002-2a", "Integrate cloud secret manager for sensitive values", devops_agent),
                    microtask("DV-002-2b", "Refactor services to read secrets from manager at runtime", devops_agent),
                    microtask("DV-002-2c", "Document secret rotation procedure", devops_agent)
                ]
            ),
            subtask(
                "DV-002-3",
                "Implement configuration deployment workflows",
                devops_agent,
                [
                    microtask("DV-002-3a", "Implement promotion pipeline for settings changes", devops_agent),
                    microtask("DV-002-3b", "Create rollback strategy for configuration errors", devops_agent),
                    microtask("DV-002-3c", "Track configuration versions per release", devops_agent)
                ]
            )
        ]
    ),
    task(
        "DV-003",
        "Deploy observability and scaling foundations",
        devops_agent,
        [
            subtask(
                "DV-003-1",
                "Set up logging and tracing",
                devops_agent,
                [
                    microtask("DV-003-1a", "Integrate structured logging with correlation IDs", devops_agent),
                    microtask("DV-003-1b", "Export logs to centralized observability stack", devops_agent),
                    microtask("DV-003-1c", "Enable distributed tracing for key API flows", devops_agent)
                ]
            ),
            subtask(
                "DV-003-2",
                "Define metrics and alerting",
                devops_agent,
                [
                    microtask("DV-003-2a", "Expose Prometheus metrics for API and database performance", devops_agent),
                    microtask("DV-003-2b", "Define alerts for SLA breaches and error spikes", devops_agent),
                    microtask("DV-003-2c", "Monitor cache and database connection pools", devops_agent)
                ]
            ),
            subtask(
                "DV-003-3",
                "Plan scaling and resilience",
                devops_agent,
                [
                    microtask("DV-003-3a", "Configure horizontal scaling policies for API containers", devops_agent),
                    microtask("DV-003-3b", "Test auto-scaling behavior under load", devops_agent),
                    microtask("DV-003-3c", "Implement graceful shutdown and health probes", devops_agent)
                ]
            )
        ]
    ),
    task(
        "DV-004",
        "Automate releases and operational readiness",
        devops_agent,
        [
            subtask(
                "DV-004-1",
                "Establish CI/CD deployment pipeline",
                devops_agent,
                [
                    microtask("DV-004-1a", "Set up automated deployments to staging and production", devops_agent),
                    microtask("DV-004-1b", "Include database migration gating step in pipeline", devops_agent),
                    microtask("DV-004-1c", "Implement canary or blue-green deployment toggle", devops_agent)
                ]
            ),
            subtask(
                "DV-004-2",
                "Implement post-deploy verification",
                devops_agent,
                [
                    microtask("DV-004-2a", "Automate smoke tests immediately after deployment", devops_agent),
                    microtask("DV-004-2b", "Collect system health snapshots post-release", devops_agent),
                    microtask("DV-004-2c", "Log deployment metadata into audit system", devops_agent)
                ]
            ),
            subtask(
                "DV-004-3",
                "Produce operational documentation",
                devops_agent,
                [
                    microtask("DV-004-3a", "Compile runbook for incident response", devops_agent),
                    microtask("DV-004-3b", "Document backup and restore procedures", devops_agent),
                    microtask("DV-004-3c", "Publish maintenance schedule guidelines", devops_agent)
                ]
            )
        ]
    )
]

phases = [
    {"phase": "Phase 1 - Database Updates", "tasks": phase1_tasks},
    {"phase": "Phase 2 - Backend Development per Page", "tasks": phase2_tasks},
    {"phase": "Phase 3 - Integration Layer", "tasks": phase3_tasks},
    {"phase": "Phase 4 - Testing & QA", "tasks": phase4_tasks},
    {"phase": "Phase 5 - Deployment & Optimization", "tasks": phase5_tasks}
]

data = {"phases": phases}

with open("tasks.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
