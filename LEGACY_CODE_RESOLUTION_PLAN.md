# Admin Legacy Code Execution Plan (Updated)

## References
- `LEGACY_CODE_ANALYSIS_REPORT.md` – baseline findings on duplicate auth, unused services, and missing harness setup.
- `ADMIN_LEGACY_CODE_SUMMARY.md` – current legacy inventory and remediation status checkpoints.
- `find-legacy-code.js` – legacy scanner entry point; extend rules per Phase 5 guardrails.
- `AUTH_SERVICE_TEST_ANALYSIS.md` – coverage gaps and seam notes for authentication flows.
- Previous `LEGACY_CODE_RESOLUTION_PLAN.md` – retained in git history for audit; superseded by this plan.

## Operating Constraints
- Node 22.15.0 / npm 11.1.0 pinned via `.nvmrc`, lockfile, and CI runners; React 19.1.1; Vite 7.1.7.
- Offline-only runtime; no service worker; network blocked in tests except local static assets.
- `wayanadResortsDB` v1 is the canonical IndexedDB version; auto-repair runs silently without user prompts.
- CI budgets: Jest ≤ 8 min, Cypress ≤ 12 min; timezone fixed to `Asia/Kolkata` across Jest and Cypress.
- Console policy: fail on `console.log/info/warn`; PII redaction must stay active even in tests.
- Error codes restricted to `*_###` values declared in `errorMessages.ts` (e.g., `AUTH_001`).

## Delivery Strategy (Hybrid Angle C)
### Phase 0 — Harness & Tooling Lock
- Create `.nvmrc` (22.15.0) and CI matrix wiring; add preflight script asserting Node/npm versions.
- Extend Jest config to load global setup: fake-indexeddb, storage/crypto/bcrypt mocks, `createImageBitmap`, and TZ shim.
- Enforce console policy via custom Jest environment and Cypress `cy.on('window:before:load')` handler.
- Add shared test utilities (`renderWithAdminProviders({ role })`, `renderWithRouter`, storage reset helper) under `src/admin/testing/`.
- Configure Cypress `e2e:reset` task, global network block, 20 s default timeout (30 s allowance for large IDB fixtures).
- Exit criteria: Jest + Cypress smoke runs green locally, console policy enforced, global timeouts respected.

### Phase 1 — Contracts & Stable Seams
- Centralize SLA constants in `src/admin/constants/sla.ts` and update all service/component imports.
- Extract thumbnail generator into pure util `src/admin/utils/media/thumbnail.ts` with deterministic output.
- Move non-component exports out of component modules to silence fast-refresh warnings and clarify seams.
- Establish feature-flag fixture and env shims; document RBAC defaults (viewer boot, admin opt-in) within helpers.
- Harden error message map to permitted codes; add guard in services rejecting unknown error identifiers.
- Exit criteria: Type-safe exports validated, lint clean on relocated modules, seam helpers documented in `ADMIN_DOCUMENTATION.md`.

### Phase 2 — 100% Coverage: Utils & Services
- Publish deterministic factories under `src/admin/testing/factories/` seeded by canonical fixtures.
- Write Jest suites covering validation/utils: password policy vectors, media dimensions, offer `[start,end)` logic, promo trimming.
- Service suites (Content, Media, Offers, PromoCodes, Enquiries, Settings, ExportImport, Snapshots, SecurityAudit): success, validation failure, quota/conflict, schema drift repair with fake-indexeddb harness.
- Ensure enquiries ID format `ENQ-YYYY-NNNN` rollover and queued timeline flush are deterministic; mock logger for PII redaction and audit entries on unknown import fields.
- Update `find-legacy-code.js` to flag `console.*` (except `error`), `eval`, `Function`, `innerHTML`, `var`, and `@deprecated` markers.
- Exit criteria: Per-file coverage 100% across utils/services folders; factories reused by downstream suites; legacy scanner passes.

### Phase 3 — 100% Coverage: Hooks, Providers, React Surfaces
- Add tests for `useAuth`, `useRBAC`, `useSessionTimeout` (fake timers), `useToast`, `useSanitizedInput`, and provider fallbacks.
- Component/page coverage: Properties, RoomTypes, Places editors; Media uploader grid; Offers/Promo flows; Enquiries list/detail; Settings; Export/Import wizard; ErrorBoundary recoveries.
- Run `axe-core` smoke checks for major pages; verify focus trap escape/return/tab cycles and keyboard affordances.
- Validate RBAC guards: viewer restricted routes redirect; admin access succeeds; 404 fallback preserves layout chrome.
- Exit criteria: React components/pages/hooks directories reach 100% coverage; no flakes under repeated `jest --watch` runs.

### Phase 4 — Stable Cypress E2E Suite
- Implement five deterministic offline paths using `data/sample-export-v1-small/` fixtures:
  1. Property create → publish → edit → rollback (snapshot ring size 20).
  2. Media upload → hero assign → replace (ID preserved) → ensure delete blocked while referenced.
  3. Enquiry create → WhatsApp action auto-note → status `CONFIRMED` → CSV export.
  4. Offer lifecycle with blackout/cap → conflicting offer rejection per `[start,end)` rule.
  5. Export ≤5 MB → import dry-run (warn on unknown fields) → apply → counts + amenity normalization.
- Add Cypress support commands for IndexedDB/localStorage reset, RBAC role switch, feature flags, and console enforcement.
- Block external network via Chromium `chrome.webRequest` stub; whitelist only local `public/` assets.
- Exit criteria: Suite runs ≤12 min headed Chromium with zero retries; artifacts (screenshots/logs) redact PII; flakes triaged within 24 h.

### Phase 5 — CI Gates & Legacy Guardrails
- Update GitHub Actions: `lint` (non-blocking until <50 errors), `jest-coverage` (TZ env, console fail, 95% → 100% ratchet), `cypress-e2e`, `legacy-scanner`, final `gate` requiring all green.
- Enforce per-file coverage targets in Jest config (target folders: `src/admin/{services,utils,validation,hooks,components,pages}`) and publish coverage diff comment.
- Integrate updated `find-legacy-code.js` into CI; fail on banned patterns and surface offending files with remediation tips.
- Refresh PR template and reviewer checklist: coverage gates, lint status, legacy scanner, snapshot diffs, Cypress artifacts.
- Exit criteria: CI deterministically fails on coverage/legacy regressions; PR comments show coverage deltas; documentation updated in `ADMIN_COVERAGE_PLAN.md` and `ADMIN_DOCUMENTATION.md`.

## Test Data & Fixture Management
- Maintain canonical `data/sample-export-v1/` and lightweight `data/sample-export-v1-small/` fixtures; cap CI imports ≤5 MB.
- Provide golden dataset loader ensuring amenity normalization and promo code trimming; share helpers across Jest and Cypress.
- Export OfflineQueue reset/process helpers for tests; cover failure recovery and replay semantics.

## Communication & Governance
- Role ownership: Tech Lead (coverage policy, CI), QA Automation (Cypress flakes, fixtures), FE Engineer (React surface coverage), Services Engineer (adapters, IndexedDB repair tests), Tooling Engineer (scanner, reporters, Node pinning).
- Cadence: daily sync on coverage delta; CI dashboard monitored; flakes escalated within one business day.
- PR review policy: verify coverage per file, lint status, legacy scanner output, snapshot diffs, console policy compliance.

## Exit Checklist
- Target directories report 100% coverage for lines/branches/functions/statements.
- Cypress suite green across three consecutive local + CI runs with artifacts reviewed.
- `find-legacy-code.js` passes and blocks forbidden patterns in CI.
- Console policy and PII redaction enforced by automated tests and logging mocks.
- Documentation updated (`ADMIN_DOCUMENTATION.md`, `ADMIN_COVERAGE_PLAN.md`, `ADMIN_LEGACY_CODE_SUMMARY.md`) and retro notes appended to `LEGACY_CODE_ANALYSIS_REPORT.md`.
