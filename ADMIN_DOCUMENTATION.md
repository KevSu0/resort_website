# Wayanad Nature Resorts - Admin v1 Offline Rebuild

**Status:** Finalized for build. No further blockers.

---

## 0) Goal & Non-Negotiables

**Goal:** Restore and harden the multi-property Admin into a fully offline, stable, and auditable tool that preserves all existing data, with clear UX and a clean migration path.

**Non-negotiables:**
- Offline-only v1 (no network dependency).
- Data preservation via one-time, idempotent migration.
- IST everywhere (UTC+05:30).
- Accessibility (WCAG 2.1 AA) and keyboard-first flows.
- No login for v1; PII appears on trusted devices only (documented).
- Adapter boundary: services designed so a thin backend can be added later with no UI churn.

---

## 1) Scope Matrix (v1)

**In-scope (production-ready):** Dashboard, Content, Media, Offers, Enquiries, Settings, Export/Import.
**Stubbed (non-blocking):** Reports (CSV export only), Analytics (counts only), System Status (light card).
**Out-of-scope (v1):** Authentication/2FA, scheduling publish, complex analytics, map tiles, CDN, email/SMS sends, multi-user concurrency.

---

## 2) Constraints & Operating Conditions

- Browsers: Desktop Chrome/Edge (latest), also Firefox and Safari (must not break).
- Data volume expectations: <= 20 properties, 80 room types, 60 places, 500 enquiries, 400 media items; combined local footprint up to about 200-300 MB.
- Storage truth: IndexedDB is the system of record for entities; LocalStorage for small flags and caches only.
- Snapshots: Ring buffers (<= 20) for rollback safety.
- Time: Reporting day boundary = 00:00 IST.

---

## 3) Architecture Pattern (logic, not stack)

- UI layer <-> Service Ports (Adapters) <-> Local Persistence.
  - Service Ports (logical contracts): Content, Media, Offers, PromoCodes, Enquiries, Settings, ExportImport, Snapshots, SecurityAudit.
  - Each port exposes Create / Read / Update / Delete / Query with deterministic IDs, validation, write-ahead logging, and error semantics (see section 12).

**Data flow (typical mutation):**
1. UI validates (Validation Dictionary).
2. Service Port re-validates and stamps metadata.
3. Write-ahead log.
4. IndexedDB transaction.
5. Update snapshots/ring buffers.
6. Emit activity event for Dashboard timeline.
7. Toaster UX.

---

## 4) Domain Contracts (fields and rules; no code)

### 4.1 Common fields (all entities)

- id (UUID v4, stable across export/import).
- slug (kebab-case, per-type unique; where applicable).
- Timestamps: createdAt, updatedAt (ms since epoch, IST for display).
- status (entity-specific enumerations).
- Version meta for snapshots/exports.

### 4.2 Property (publishable)

**Required to publish:** name, slug, heroMediaId, shortDescription, fullDescription, address, lat, lng, >= 1 amenity, checkInTime, checkOutTime, SEO title, SEO metaDescription, schemaHotel (priceRange, starRating, amenities).

**Rules:**
- Slug: lowercase, a-z0-9-, unique among properties.
- Delete guard: block if any RoomType or Place references the property.
- SEO minimum enforced pre-publish.
- Schema.org block required (Hotel).
- Indexes: slug, featured, updatedAt.

### 4.3 RoomType

**Required:** propertyId, name, slug, capacity (adults/children), rateBands[] (label, min, max, currency), amenities[], gallery[].

**Rules:**
- Tied to a Property; block activation if rateBands missing or invalid.
- Indexes: propertyId, slug, updatedAt.

### 4.4 Place (attraction)

**Required:** propertyId, name, description, category, locationText.
**Optional:** distanceKm, timeMinutes, photoId, featured.
- Indexes: propertyId, featured, updatedAt.

### 4.5 Media (images and short MP4)

**Types:** image (JPG/PNG/WebP/AVIF) or video (MP4).

**Validations:**
- Hero: <= 1.5 MB, >= 1600x1066, aspect approx 3:2 (tolerance +/-3 percent).
- Gallery: <= 1.0 MB, >= 1200x800.
- Video: MP4 only, <= 20 MB.
- Thumbnails generated client-side (<= 400 px longest edge).

**Rules:**
- Replace preserves ID; references auto-update.
- Block deletion when referenced; show usage list.
- Duration: capture if browser provides; not required.

### 4.6 Offer

**Required:** title, type (percentage | flat | freeNight | package), scope (global | propertyId | roomTypeId), value, validFrom/to, blackoutDates[], usageCap?, status (draft | scheduled | active | expired | archived).

**Rules:**
- No stacking for the same scope/time window.
- Validate blackouts and caps before activation.
- Archived = read-only.

### 4.7 PromoCode

**Required:** code (6-12 uppercase A-Z0-9, case-insensitive unique), offerId, usageCap?, usedCount, status.
- Generation: prefix + random suffix.

### 4.8 Enquiry (PII)

**Required:** ref (ENQ-YYYY-NNNN, monotonic per year, gaps allowed), fullName, phone (E.164, IN default), checkIn, checkOut, adults, source.
**Optional:** email (validate if present), children, budget, notes, propertyId?, roomTypeId?.
- Status pipeline: NEW -> CONTACTED -> FOLLOW_UP -> CONFIRMED -> DECLINED -> CANCELLED.
- Timeline: system appends notes for WhatsApp/Email/Call launches automatically.
- Hard delete: allowed with confirmation + audit log.

### 4.9 Settings

**Editable:** siteName, primaryUrl, contact email/phone/whatsapp, address, timezone (IST), bookingSLA, paymentMethods[], featureFlags (referrals/promos/i18n/analytics/video, mapEmbed), socialLinks, legalUrls.

**SLA defaults (v1):**
- responseTargetHours = 4 (target to first response).
- softAlertHours = 2 (amber warning).
- hardEscalationHours = 6 (dashboard overdue pin).
- dailyDigestHourIST = 09:00.

### 4.10 Snapshots and Exports

- Ring buffers: <= 20 per entity set.
- PII warning flag on export manifest.
- Checksums/hashes for media if included.

---

## 5) Validation Dictionary (single source of truth)

- Slug: required, kebab-case, per-type unique.
- Geo privacy: store full precision; display rounded to 4 decimals by default (approx 11 m).
- Media: enforce size/dimension/type per section 4.5; hero aspect tolerance +/-3 percent.
- Offer conflicts: same (scope, date) intersection is blocked.
- Enquiry SLA: cannot set CONFIRMED without >= 1 timeline contact entry.
- Phone/email: E.164 (IN default); RFC-style email validation.
- Deletion guards: Property (if RoomTypes/Places exist), Media (if referenced).
- Snapshots: max 20; oldest drops first.

---

## 6) Referential Integrity Rules

- RoomType.propertyId -> existing Property (required).
- Place.propertyId -> existing Property.
- Offer.scope: if propertyId or roomTypeId given, target must exist.
- PromoCode.offerId -> existing Offer.
- Media usageRefs[] recorded for every reference from Property/RoomType/Place; maintained on replace/delete.

---

## 7) Feature Flags (v1 defaults)

- ALLOW_MAP_EMBED = false (no online maps; static coordinate UI only).
- ENABLE_I18N = false (English UI; copy prepared for future).
- ENABLE_ANALYTICS = counts-only (stubs).
- ENABLE_VIDEO_UPLOAD = true (<= 20 MB MP4).
- SHOW_DEV_MODE = true (PII and offline warnings).

---

## 8) UX and Acceptance Criteria by Module

### 8.1 Dashboard

- Loads < 3 s on baseline dataset; no mock counts.
- KPI cards: properties, room types, media, enquiries (with status pills).
- SLA widgets: overdue enquiries (hardEscalation), due soon (softAlert), today\'s new enquiries.
- Activity timeline (last 20 events) with filters.
- Empty and error states are explicit and accessible.

### 8.2 Content (Properties, RoomTypes, Places)

- Lists: search by name/slug; filters (type, featured); grid/list toggle; pagination/virtualization.
- Editors:
  - Property: sections for Basics, Location (rounding toggle), Amenities (catalog + custom), Media (hero/gallery), SEO, Schema.org.
  - Draft autosave; Publish validates all required fields and rules.
  - Version history: view diff and one-click rollback (<= 20).
- Deletion: soft-delete (Archive) for content; hard guards for references.

### 8.3 Media Library

- Drag-drop + file picker; client thumbnails; dimension/size/type validation before persist.
- Show usage list; block deletion when referenced.
- Replace keeps ID and updates thumbnails; references remain valid.
- Filters by type, search by alt/filename; bulk select delete (safe only).
- Safari/Firefox: graceful fallback when drag-drop APIs differ.

### 8.4 Offers and Promo Codes

- Create/edit offers; lifecycle: Draft -> (Scheduled) -> Active -> Expired -> Archived.
- Conflict prevention: no overlap for same scope/time.
- Blackout/cap validation; scheduled optional; Archived read-only.
- Promo codes: uniqueness case-insensitive; generator (prefix + random).
- Export/import support for both.

### 8.5 Enquiries

- List: search (ref/name/phone), filter (status/source/date), CSV export.
- Create: required fields and validations; India phone default.
- Quick actions: WhatsApp/Email/Call open external apps with auto timeline note.
- Status transitions including FOLLOW_UP; hard delete with audit entry.
- Offline event queue ensures timeline appends survive offline and flush later.

### 8.6 Settings

- All fields editable; SLA values shown (read-only defaults acceptable in v1).
- Storage quota UI chip (% used) + warnings at 80% (amber) and 95% (red).
- Integrity checks: index health, store counts.

### 8.7 Export / Import

- Export ZIP contains:
  - manifest.json (version, counts, includesMedia, piiWarning, hashes).
  - content/*.json (properties, roomTypes, places, offers, promoCodes, enquiries, settings).
  - snapshots/*.json (per entity set).
  - media/manifest.json + media/files/* (when included).
- Import flow: Dry-run diff -> review (create/update/delete counts with examples) -> auto-backup -> Apply (replace semantics) -> one-click rollback to pre-apply backup.
- Amenity de-duplication on import via normalizer; prevent duplicate entries.

### 8.8 Reports (stub) and Analytics (stub)

- Reports: CSV export for enquiries by status/source over time, content inventory.
- Analytics: counts only; date selector present (no network).

### 8.9 System Status (light)

- Card shows: schema version, last migration timestamp, storage used %, last export time.

---

## 9) Migration Plan (idempotent)

1. Pre-flight CTA: "Backup now" (Export) before upgrade; explain risks and PII care.
2. Schema registry check: compare expected stores/indexes with actual; re-create missing stores, build indexes.
3. Key normalization:
   - Ensure UUIDs on all entities; generate if missing.
   - Normalize slugs; resolve collisions per type.
   - Rebuild media usageRefs by scanning entities.
   - Amenity normalization: lower-case, trim, collapse spaces/hyphens; de-dup sets.
4. Write-ahead log and idempotent steps so re-runs are safe.
5. Verification report: counts by entity; sample diffs; errors list (if any).
6. Rollback safety: keep pre-migration snapshot; one-click restore.

---

## 10) Privacy, Security and Compliance (v1)

- PII visible (no login) on trusted devices only; show dev banner and reminder.
- Hard delete for enquiries and promo codes; content -> archive (soft).
- Audit log (local): mutation events include timestamp, entity, action, before/after meta, "Local Admin" actor.
- Export warning when PII present; no encryption in v1.
- Geo privacy: display lat/lng rounded to 4 decimals by default; "Show precise" toggle.

---

## 11) Performance and Resilience

- Budgets: initial load < 3 s; save feedback < 500 ms (optimistic UI allowed).
- Virtualization for large lists; lazy-load thumbnails; chunked export/import with progress UI.
- Quota handling: estimate remaining bytes; warn at 80%; block risky writes at 95% with guidance.

---

## 12) Error Taxonomy and Fallbacks

- VAL-001 Validation failed -> show field list; prevent write.
- REF-404 Missing reference (for example propertyId) -> block mutation; offer navigation to fix.
- CONFLICT-409 Offer scope/time overlap -> block activate; show conflicting item.
- MEDIA-INUSE-423 Prevent delete; show usage table + "Go unlink".
- STORE-DRIFT-500 Schema/index mismatch -> attempt self-repair; if fails, show "Repair DB" CTA.
- QUOTA-507 Storage quota near/exceeded -> block heavy writes; suggest cleanup/export.
- IMPORT-DIFF-WARN Dry-run mismatches -> show detailed diff; allow abort.
- SNAPSHOT-LIMIT Oldest snapshot dropped when adding (ring buffer).

All errors must present: short title, plain explanation, next action, and a copyable tech code.

---

## 13) Observability (offline)

- Local telemetry panel (dev only): errors by route, validation failures, storage %, snapshot health.
- Activity timeline: emitted on every significant mutation for Dashboard.

---

## 14) Testing Strategy

### 14.1 Unit (logic)

- Slug rules; amenity normalizer; enquiry ref generator (ENQ-YYYY-NNNN monotonic).
- Media validation (size/dimensions/aspect); offer conflict detection; phone/email validators.

### 14.2 Integration (ports)

- CRUD per entity; publish + rollback; media replace (ID preserved, references updated); import dry-run/apply/rollback; amenity de-dup; enquiry timeline queue (offline -> flush).

### 14.3 E2E Golden Paths

1. Property: Create -> Publish -> Edit -> Rollback (snapshot).
2. Media: Upload hero -> Use in property -> Replace -> Verify propagation; block delete while referenced.
3. Enquiry: Create -> Quick WhatsApp -> Auto timeline note -> Status to CONFIRMED -> CSV export.
4. Offer: Create Active with blackout/cap -> Attempt conflicting active (blocked).
5. Export with media (about 200-300 MB) -> Import dry-run -> Apply -> Verify counts and sample entities.

### 14.4 Regression and Accessibility

- Keyboard traversal of all forms/lists; ARIA roles on dialogs; reduced-motion respected.
- Safari/Firefox drag-drop fallback scenario.

**Exit criteria:** All Golden Paths pass; no red routes; budgets met on representative dataset.

---

## 15) Release and RACI

**Phases:**
- P0 Stabilize and Migrate (schema, validation, media, enquiries timeline).
- P1 Export/Import hardening (dry-run, rollback, amenity de-dup).
- P2 UX polish and Accessibility (AA compliance, quotas, error copy).

**Gates:**
- Gate A (Smoke and Migration) -> QA (Meera).
- Gate B (Golden Paths) -> Product (Anita) + QA (Meera).
- Gate C (Performance/Quota) -> CTO (Rahul).

**RACI:**
- Responsible: Dev Agent (this spec).
- Accountable: Rahul (architecture/export).
- Consulted: Anita (content/enquiries), Meera (QA).
- Informed: Operations/Marketing (for exports and offers).

---

## 16) Success Metrics (measure locally)

- Crash-free sessions >= 99% (7-day).
- Critical path success >= 98% (content publish; media replace; enquiry update; export/import round-trip).
- P95 page interactive <= 3 s; save feedback <= 500 ms.
- Import dry-run false-positive <= 1%; rollback success 100% in tests.
- PII hard-delete execution <= 10 s with audit entry.

---

## 17) Known Issues -> Fix Plans

1. IndexedDB schema drift -> Schema registry + self-repair; idempotent migration.
2. Safari media drag-drop crash -> Input fallback; avoid non-portable DataTransfer APIs; pre-check dimensions async.
3. Enquiry timeline offline append -> Local queue + retry on availability; transactional append.
4. Amenity duplicates on import -> Normalize keys; merge sets; prevent duplicate creation.

---

## 18) Final Decisions Locked (from clarifications)

1. Amenities source of truth: `src/admin/reference/amenities.ts`.
   - Exports: AMENITY_CATALOG, normalizeAmenityKey, findAmenityByKey.
   - Delegation: propertyService.getAmenities() imports from this file (no internal copies elsewhere).
   - Implication: Import/Export and editors normalize via normalizeAmenityKey(); import deduping uses this catalog.

2. Sample export snapshot (canonical v1 layout): `/<repo-root>/resort-website/data/sample-export-v1/`.
   - manifest.json.
   - content/properties.json.
   - content/roomTypes.json.
   - content/places.json.
   - content/offers.json.
   - content/promoCodes.json.
   - content/enquiries.json.
   - content/settings.json.
   - snapshots/properties.snapshots.json.
   - snapshots/roomTypes.snapshots.json.
   - snapshots/places.snapshots.json.
   - snapshots/offers.snapshots.json.
   - media/manifest.json (only when media included).
   - media/files/<sha256>.<ext> (binary payloads; filenames = hash + original extension).
   - Compatibility: Import also accepts legacy names (for example rooms.json) via alias map during dry-run.

3. Booking SLA semantics (validation + reminders): hours-based SLA, 24x7 clock (IST).
   - responseTargetHours = 4 -> target to first response.
   - softAlertHours = 2 -> amber warning (time left).
   - hardEscalationHours = 6 -> red overdue pin on Dashboard.
   - dailyDigestHourIST = 09:00 -> morning summary card.
   - Validation: Enquiry cannot be marked CONFIRMED without at least one contact/timeline entry.

4. Latitude/Longitude privacy and map embedding.
   - Storage: keep full-precision lat/lng in DB and exports.
   - Display (UI and CSV): round to 4 decimals by default; "Show precise" toggle reveals full value.
   - Map embedding: Off by default for v1 to avoid network calls; allowed only when FEATURE_FLAGS.ALLOW_MAP_EMBED = true and a tile source is configured. Editor shows a static coordinate preview otherwise.

5. Video validation.
   - Decision: Not required for v1. Enforce type + size only (MP4, <= 20 MB).
   - If the browser yields duration cheaply, record it as metadata for UX but do not block on it.

**Next steps (immediate, no code):**
- Create amenities.ts with catalog + normalizer and refactor service call sites to import it.
- Restructure /resort-website/data/ to the canonical sample-export-v1 layout above (add a brief README.md there).
- Add the four SLA numbers to Settings -> General (read-only defaults for v1).
- Gate map component behind FEATURE_FLAGS.ALLOW_MAP_EMBED; default to static preview.
- Update Media validation spec to state "video duration optional; record-if-available".

---

## 19) Developer Checklists

### 19.1 Before You Start

- Read this spec end-to-end; note budgets and guards.
- Ensure a local dataset exists or use /data/sample-export-v1/.

### 19.2 During Build

- Never let UI touch storage directly; go through ports.
- Bind all forms to the Validation Dictionary.
- Emit activity events for Dashboard on each meaningful mutation.
- Keep snapshot ring buffers updated (<= 20).
- Respect feature flags; no network fetches in v1.

### 19.3 Before Hand-off

- Run the 5 E2E Golden Paths.
- Export -> Import (dry-run then apply) with media on 200-300 MB dataset; verify counts and random spot-checks.
- Confirm Safari drag-drop fallback; Firefox list virtualization; keyboard accessibility.
- Confirm quota warnings at 80%/95% thresholds.

---

## 20) Glossary (quick)

- Port/Adapter: Logical service boundary that hides persistence details.
- Snapshot: Immutable, versioned capture of an entity set, used for rollback.
- Dry-run: Non-destructive import preview showing planned changes.
- PII: Personally identifiable information (names, phone, email).
- SLA: Service level aim for first response to enquiries.

---

This document is ready to be handed to the AI development agent. It states the what and the rules. Implementations must respect the ports, validation, guards, and budgets, and must not introduce network dependencies in v1. If any ambiguity arises, default to the Validation Dictionary and Non-negotiables above.