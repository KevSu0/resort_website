# Admin Test Coverage Acceleration Plan

## 1. Purpose
- Deliver and preserve 100% Jest statement/function/branch/line coverage for the admin application while keeping test pass ratio at 100%.
- Align testing work with the offline-first, data-integrity, and accessibility requirements documented in `ADMIN_DOCUMENTATION.md`.

## 2. Context Snapshot
- Platform goal: fully offline admin (no network calls), single trusted operator device, strict WCAG 2.1 AA, IST timezone, and adapter-oriented services.
- Current baseline (`npm run test:coverage`, report captured 27 Sep 2025):
  - Key shells (`src/App.tsx`, `src/admin/components/AdminLayout.tsx`) at 0% due to missing render tests.
  - Admin service/util layers untested (e.g., `src/admin/utils/security.ts`, `src/admin/services/*.ts`).
  - `src/admin/__tests__/security/authService.test.ts` has four failing specs (see `AUTH_SERVICE_TEST_ANALYSIS.md`).
  - Cypress scaffolding present (`cypress/`, `npm run e2e`), but specs are not incorporated in automated pipelines.
- Tooling available: Jest + React Testing Library, comprehensive DOM/environment mocks in `jest.setup.js`, coverage collection via `jest --coverage`, and smoke/migration helpers under `src/admin/testing/*`.

## 3. Guiding Principles
- Tests must respect offline constraints by stubbing network/IndexedDB boundaries and using provided service adapters.
- Every code path documented as business-critical (validation, logging, activity feed, snapshotting, accessibility signals) requires direct assertions.
- Prefer deterministic fixtures and factories to avoid flaky assertions; reset global mocks between tests.
- Maintain parity between documentation and implementation: when business rules change, update specs and docs together.

## 4. Roadmap Overview
| Phase | Focus Area | Exit Criteria |
| --- | --- | --- |
| 0. Triage | Resolve existing Jest failures | `npm test -- AuthService` passes locally and in CI |
| 1. Measurement | Baseline and monitoring | Coverage diff script added; baseline stored in repo wiki or doc |
| 2. Core Logic | Utilities, validators, services | 100% coverage on pure functions and service adapters |
| 3. Hooks & Context | Admin hooks, providers | All hooks/context suites cover success, error, cleanup branches |
| 4. Components | Admin UI & shared widgets | Visual components have variant coverage and axe/snapshot assertions |
| 5. Pages & Routing | Admin/public shells | Page flows (routing, guards, loaders) validated via integration tests |
| 6. E2E & Gating | Cypress + CI | `npm run e2e` stable; CI enforces coverage thresholds and zero failures |
| 7. Sustainment | Processes & documentation | Regression guardrails (pre-push hook, docs, dashboards) in place |

## 5. Detailed Workstreams

### 5.1 Phase 0 - Triage (Day 0)
- Fix localStorage mock scope so `AuthService` rate-limiting spec observes lockout (update global mock or service reference).
- Align password validation expectations with current rules in `src/admin/utils/security.ts`; adjust tests or implementation per product decision.
- Verify `npm test -- AuthService` then `npm run test` both pass.

### 5.2 Phase 1 - Measurement (Day 0-1)
- Add `npm run coverage:report` Node script to surface top 20 under-covered files (based on `coverage/coverage-final.json`).
- Capture baseline metrics (statements/functions/branches) and store them in `ADMIN_TRACKING.json` under a new key `"coverageBaseline"`.
- Decide on exclusions (`src/admin/config/adminConfig.ts`, static color maps) and document rationale; prefer adding micro-tests over exclusions.

### 5.3 Phase 2 - Core Logic (Week 1)
- Author table-driven tests for `src/admin/utils/security.ts` (password rules, rate limiting, sanitization helpers).
- Extend suites for `src/admin/utils/sanitizer.ts`, `performance.ts`, `errorMessages.ts`, and `src/admin/validation/schemas.ts` to cover all branches and error paths.
- Test service adapters (`src/admin/services/*.ts`, `src/services/storage.ts`) by mocking IndexedDB/localStorage boundaries and asserting persistence semantics, error paths, and audit logging.
- Include regression tests for `src/admin/lib` helpers (formatters, migrations) using fixtures in `src/admin/testing`.

### 5.4 Phase 3 - Hooks & Context (Week 1-2)
- Use React Testing Library with custom render helpers to exercise `useAuth`, `useSessionTimeout`, `useToast`, `useRBAC`, and `useSanitizedInput`.
- Cover lifecycle behaviors (mount, effect triggers, cleanup) and edge cases (expired tokens, throttled toasts, timeout resets).
- Validate context providers (`AppProviders`, `AuthProvider`, `ToastProvider`, `PermissionGate`) to ensure consumer hooks receive expected values and fallbacks.

### 5.5 Phase 4 - Components (Week 2)
- Build stories/fixtures per component variant and write Jest/RTL suites hitting props, accessibility states, and event handlers (forms, modals, toasts, loading indicators).
- For static UI exports (design tokens, color maps), add smoke tests that assert object shape and key invariants.
- Snapshot test complex layouts (`AdminLayout`, `Dashboard`, `PerformanceMonitor`) with mocked services and ensure error/loading branches render distinct UI.

### 5.6 Phase 5 - Pages & Routing (Week 2-3)
- Create integration tests for admin pages using `MemoryRouter`, seeded services, and verifying redirects, guard rails (RBAC), and data flows.
- Cover public pages (`HomePage`, `PropertyDetailPage`) with data-driven tests ensuring hero/gallery/CTA flows render correctly offline.
- Add top-level `App.tsx` suite that renders both admin and public shells, asserting conditional branches (e.g., initial route, toast mounting) are covered.

### 5.7 Phase 6 - End-to-End & Gating (Week 3)
- Convert `src/admin/testing/smokeTests.ts` and `migrationVerification.ts` scenarios into Cypress specs; ensure repeatable seeds and teardown.
- Expand Cypress to cover admin login (mock since v1 offline), CRUD workflows, media upload simulations, export/import flows, and offline banners.
- Integrate `npm run lint`, `npm run test:coverage`, and `npm run e2e` into CI; block merges on any failure or coverage drop.

### 5.8 Phase 7 - Sustainment (Ongoing)
- Raise Jest `coverageThreshold` to 100 for all metrics once achievable; until then, set thresholds to current coverage minus 5% to ratchet upward.
- Add git pre-push hook invoking `npm run verify`; document bypass procedure for emergencies.
- Publish weekly coverage trend snapshots and flaky-test logs in `ADMIN_TRACKING.json` and project wiki.
- Keep `ADMIN_DOCUMENTATION.md` and this plan updated whenever features/tests shift.

## 6. Deliverables & Owners
| Deliverable | Owner | Due |
| --- | --- | --- |
| Auth service spec fixes | QA + Auth engineer | Day 0 |
| Coverage report script + baseline | Tooling engineer | Day 1 |
| Core logic unit suites | Backend/admin engineer | Week 1 |
| Hooks/providers tests | Frontend engineer | Week 2 |
| Component + page coverage | Frontend squad | Week 2-3 |
| Cypress conversion + CI gating | QA automation | Week 3 |
| Coverage threshold enforcement | Tech lead | Week 3 |

## 7. Verification Workflow
1. `npm install` (if dependencies changed).
2. `npm run lint` - ensure zero lint errors.
3. `npm run test:coverage` - confirm 100% statements/functions/branches/lines.
4. `npm run e2e` - ensure Cypress suite passes offline.
5. Review updated coverage summary script output for any regressions before merge.

## 8. Risk & Mitigation
- **Flaky async specs:** Mitigate by using fake timers, deterministic mocks, and cleanup hooks (`afterEach`).
- **Long-running tests:** Parallelize via Jest projects or targeted `--runInBand` only where required; monitor runtime budgets.
- **Schema drift:** Tie validator tests to fixture builders so schema changes fail loudly.
- **CI environment differences:** Mirror jsdom, node, and storage mocks locally and in CI; add smoke job that runs `npm run test -- --runInBand` on each PR.

## 9. Resources
- `ADMIN_DOCUMENTATION.md` - domain rules, constraints, and UX guarantees.
- `AUTH_SERVICE_TEST_ANALYSIS.md` - detailed failure analysis and remediation notes.
- `jest.config.ts` / `jest.setup.js` - test harness configuration.
- `src/admin/testing/*` - seed data, smoke scenarios, migration verifiers.
- `cypress/` - end-to-end runner scaffolding ready for spec authoring.

---
*Last updated: 2025-09-27*


## 10. Blocker-Level Clarifications (Answered)

### A. Repository & Environment
1. **Branch of truth:** `main` (protected) is the only integration branch; feature work lands via short-lived branches + PR review.
2. **Runtime versions:** Node `22.15.0` and npm `11.1.0` (see local output); CI will pin the same via `.nvmrc` to be added in Phase 1.
3. **React version:** `react@19.1.1` (stable channel); no outstanding incompatibility notes.
4. **Build tooling:** `vite@7.1.7`; Jest uses `babel-jest` with the Babel presets declared in `babel.config.cjs`.
5. **Path aliases:** Jest already maps `@/` to `src/` via `moduleNameMapper` in `jest.config.ts`.
6. **Timezone:** Set `TZ=Asia/Kolkata` for Jest and Cypress (add to npm scripts and CI env) so all date math aligns with the IST contract.

### B. Jest Config & Harness
7. **Config summary:** `testEnvironment: 'jsdom'`, setup file `jest.setup.js`, ESM handled through Babel; `transformIgnorePatterns` allows `bcryptjs`, `jszip`, `uuid`, `@hookform/resolvers`, `react-router-dom`.
8. **Timers:** Default to real timers; suites requiring control should call `jest.useFakeTimers('modern')` explicitly.
9. **Coverage exclusions:** Only `*.d.ts`, `src/main.tsx`, `src/vite-env.d.ts`, and `src/config.ts`; all other files must be exercised.
10. **Console handling:** Console methods are not stubbed globally; tests may spy/assert as needed. Error logging is allowed and should be asserted in ErrorBoundary specs.
11. **Snapshot policy:** Snapshots require human review in PRs; CI will not auto-update.

### C. Storage & Crypto Mocks
12. **IndexedDB shim:** We will load `fake-indexeddb/auto` in `jest.setup.js` (Phase 0 fix) so `databaseService` works under Jest.
13. **In-memory adapter:** Tests will use the real `DatabaseService` backed by fake-indexeddb; no separate mock is required.
14. **Storage mocks:** Stateful global mocks live in `jest.setup.js`; we will consolidate them into `src/admin/testing/storageMock.ts` and import from there to avoid regressions.
15. **Crypto availability:** `global.crypto.randomUUID` and a stubbed `crypto.subtle.digest` already exist in the setup; extend if additional methods are required.
16. **bcryptjs:** Unit tests should mock `bcrypt.hash`/`compare` to deterministic fakes; integration tests may fall back to real hashing if needed.

### D. File/Media & Canvas
17. **Image dimensions:** `global.Image` is stubbed in `jest.setup.js`; add `global.createImageBitmap = jest.fn()` for components relying on it.
18. **JSZip:** Mock at the unit layer (return controlled archives); run a single real round-trip inside integration tests that exercise the sample dataset.
19. **File/Blob:** Node 22 provides `Blob`/`File`; no extra polyfill is required beyond the `createMockFile` helper already defined.
20. **Thumbnails:** Media thumbnail generation should be mocked; unit tests can bypass processing via a `generateThumbnail` mock exported from `fileStorageService`.

### E. Router, Providers & Feature Flags
21. **Router utilities:** Standardize on `MemoryRouter`; we will publish `renderWithRouter` helper in `src/admin/testing/render.tsx`.
22. **Provider helper:** Create `renderWithAdminProviders` (AppProviders + router + toast/loading contexts) in the same helper to avoid drift.
23. **Feature flags:** Source of truth is `ADMIN_CONFIG.FEATURE_FLAGS`; provide a `createFeatureFlagsFixture()` helper exporting the default map for tests.
24. **Env vars:** `src/config.ts` reads `VITE_WHATSAPP_CONTACT_NUMBER` and `VITE_SITE_EMAIL_FROM`; set these in `jest.setup.js` and Cypress via `.env.test`.

### F. Security, Validation & RBAC
25. **RBAC assertions:** Even with auth disabled, tests must verify `PermissionGate` for both `ADMIN` (full access) and `VIEWER` (read-only) using `roleDefinitions` in `src/admin/auth/rbac/roles.ts`.
26. **Password policy:** Use `SECURITY_CONFIG.PASSWORD` in `src/admin/utils/security.ts` -- min length 12, special char/upper/lower/number, personal info & common list checks.
27. **Sanitization scope:** `src/admin/utils/sanitizer.ts` strips scripts, dangerous attributes, and normalizes whitespace; reuse its exported `SANITIZATION_PATTERNS` for fixture coverage including `<script>`, `onerror`, `javascript:` URLs, and zero-width characters.

### G. Export/Import & Snapshots
28. **Sample export:** Located at `data/sample-export-v1` (manifest + content/media/snapshots); use as the canonical integration fixture.
29. **Archive size in tests:** Cap ZIP fixtures at <= 5 MB in Jest/Cypress to keep CI fast; large 200-300 MB scenarios remain manual/offline.
30. **Import diff policy:** Dry-run must produce zero unknown fields; any difference outside the allow-listed metadata fails the test.
31. **Snapshot ring buffer:** Fixed at 20 (enforced in `fileStorageService.saveSnapshot`); encode as an assertion in tests.

### H. Enquiries & SLA
32. **Timers:** Freeze time with `jest.useFakeTimers('modern')` + `jest.setSystemTime` to assert SLA thresholds.
33. **Reference codes:** Format `ENQ-YYYY-NNNN`; sequence resets each calendar year and may have gaps if entries are deleted -- tests should accept gaps.
34. **Offline queue flush:** Call `OfflineQueueService.getInstance().processQueue()` directly in tests; production also flushes when `navigator.onLine` flips true.

### I. Offers & Promo Codes
35. **Conflict cases:** Block when (a) a new ACTIVE offer overlaps date range with another ACTIVE offer on the same scope, or (b) codes collide (`CODE_CONFLICT`). Adjacent ranges (end date equals next start date minus one day) are allowed.
36. **Promo uniqueness:** Codes are case-sensitive (`ABC123` != `abc123`); treat normalized equality only when trimming whitespace.

### J. Accessibility & A11y Testing
37. **axe-core:** Run `@axe-core/react` smoke checks on major pages/components; suppress `color-contrast` rule only for known brand palettes tracked in `ADMIN_DOCUMENTATION.md`.
38. **Reduced motion:** Force `prefers-reduced-motion` to match media query `(prefers-reduced-motion: reduce)` in tests to stabilize framer-motion.
39. **Tab order:** Admin forms follow DOM order; document exceptions (e.g., date-range pickers) in test fixtures and assert using keyboard simulations.

### K. UI/UX Timing & Animations
40. **Toast timing:** Default auto-dismiss is 5 s; no throttling is implemented, so tests should assert queue growth and manual dismissal behavior.
41. **Performance monitor:** Guarded by `showInDevOnly`; test via prop override (`showInDevOnly={false}`) while keeping production default unchanged.

### L. Cypress & E2E
42. **Browser target:** Run Cypress in headed Chromium on CI; local dev may use Chrome.
43. **Offline mode:** Enable Cypress network stubbing to block outbound requests and assert no unexpected fetches occur.
44. **State reset:** Provide `npm run e2e:reset` (Phase 1 task) that wipes IndexedDB/localStorage between specs via Cypress task.
45. **Uploads in CI:** Keep individual test files <= 20 MB (per admin spec) and limit total upload time to < 10 s by using pre-encoded fixtures.

### M. CI & Gating
46. **CI platform:** Target GitHub Actions (runner: ubuntu-latest, 4 vCPU/16 GB); workflow to be added in Phase 6.
47. **Runtime budgets:** Aim for <= 8 min for Jest (sharded via projects) and <= 12 min for Cypress (split specs); flag if exceeded.
48. **Coverage thresholds:** Ratchet immediately to statements/branches/functions/lines ≥ 95% in Phase 2, raise to 100% once suites land (Phase 5 gate).
49. **Pre-push hooks:** None yet; introduce Husky hook running `npm run verify` in Phase 7.
50. **Coverage diff reporting:** Yes -- add `coverage-summary.json` parsing GitHub Action comment summarizing deltas per PR.

### N. Flakiness & Known Failures
51. **Current flakies:** `src/admin/__tests__/security/authService.test.ts` (storage mock issue, password expectations) is the only known failing suite.
52. **Global state leaks:** `OfflineQueueService` singleton and `performanceMonitor` caches persist -- reset via exported `reset()` helpers we will add.
53. **Random generators:** `Math.random()` usage in IDs/toasts/queues -- seed tests by stubbing `Math.random` where deterministic output is needed.

### O. Data Fixtures & Factories
54. **Factories:** None yet; create builders under `src/admin/testing/factories/` for Property, RoomType, Place, Offer, PromoCode, Enquiry, Media during Phase 2.
55. **Amenities catalog:** Located at `src/admin/reference/amenities.ts`; tests should consume `AMENITY_CATALOG` / `normalizeAmenityKey`.
56. **Golden dataset:** Use `data/sample-export-v1` (properties.json + media manifest + snapshots) as the shared integration fixture.

### P. Error Handling & Taxonomy
57. **Error codes:** `ValidationDictionaryService` defines canonical codes (e.g., `VAL-001`); treat strings as stable contract.
58. **ErrorBoundary behavior:** Expect recovery UI to render in place while preserving `AdminLayout` chrome when wrapped; assert `logError` invocation.

### Q. Safari/Firefox Quirks
59. **Safari drag-drop crash:** Reproduces on Media Uploader when dragging large JPEG/PNG; tests should assert the fallback file input path and async dimension pre-check (Jest) plus Cypress drag-drop fallback.
60. **Firefox quirks:** Virtualized lists require `scrollIntoView` polyfill; add Cypress coverage ensuring pointer events on file inputs work.

### R. Linting & Formatting
61. **Lint blockers:** Follow `eslint.config.js`; snapshots should strip incidental whitespace manually. Auto-fix is allowed locally but must pass CI lint.
62. **Rule exceptions:** Only allowance is console logging in services (`logger.ts`); do not disable lint elsewhere without review.

### S. Ownership & Sign-off
63. **Test plan changes:** Rahul (CTO) approves scope changes; Anita (Product) and Meera (QA) must be consulted for feature-impacting adjustments.
64. **Ambiguity tie-breaker:** Product behavior disputes escalate to Anita; security/data concerns go to Rahul; QA workflows go through Meera.

### T. Final Contract Items
65. **Integration tests:** Allowed -- place under `src/admin/__tests__/integration/` and use fake-indexeddb-backed services.
66. **Refactors for testability:** Permitted if behavior/contract remains unchanged; document changes in PR description.
67. **Hidden side effects:** Services write to localStorage / IndexedDB and emit console logs -- tests must preserve these side effects unless documented otherwise.

_Last synchronized: 2025-09-27_







## 11. Execution Specification (Hybrid Contract Approach)

### 11.1 Objectives & Guardrails
- Achieve and lock 100% Jest statements/branches/functions/lines and stable Cypress golden paths under GitHub Actions (ubuntu-latest) with Node 22.15.0.
- Keep Jest wall-clock <= 8 minutes and Cypress <= 12 minutes by sharding and fixture discipline.
- Enforce offline-first guarantees (no live network), IST timezone, WCAG 2.1 AA accessibility checks, and zero-import unknowns during dry-run verification.

### 11.2 Assumptions & Dependencies (Authoritative)
- Toolchain: React 19.1.1, Vite 7.1.7, Jest + React Testing Library with babel-jest, fake-indexeddb, Cypress (headed Chromium).
- Data fixtures: `data/sample-export-v1` (canonical dataset), `AMENITY_CATALOG` in `src/admin/reference/amenities.ts` (normalizer source), snapshot ring buffer fixed at 20.
- Governance: Rahul (architecture/export), Anita (product), Meera (QA) must sign off on plan changes; `main` branch is protected; snapshots require manual review.

### 11.3 Role Matrix
| Role | Core Responsibilities |
| --- | --- |
| Tech Lead | Coverage policy, CI gating, final approvals |
| Tooling Engineer | Scripts, coverage reporter, CI workflow, Husky hook |
| Admin Service Engineer | Service adapters, validation dictionary, storage/migration contracts |
| Frontend Engineer | Hooks, providers, components, pages, render helpers |
| QA Automation | Cypress conversion, flake triage, offline verification |

### 11.4 First 48 Hours (Blocker Removal + Baseline)
1. Add `.nvmrc` (22.15.0) and wire `TZ=Asia/Kolkata` into Jest (`package.json` scripts) and GitHub Actions env.
2. Update `jest.setup.js` to require `fake-indexeddb/auto`; extract reusable storage/crypto/bcrypt mocks into `src/admin/testing/storageMock.ts` with reset helper.
3. Publish `src/admin/testing/render.tsx` exposing `renderWithAdminProviders` and `renderWithRouter` (MemoryRouter + AppProviders + toast/loading contexts + feature flags).
4. Ship `createFeatureFlagsFixture()` mirroring `ADMIN_CONFIG.FEATURE_FLAGS` for deterministic tests.
5. Stub `global.createImageBitmap`, mock `JSZip` at unit level, retain one integration round-trip using `data/sample-export-v1`.
6. Fix `src/admin/__tests__/security/authService.test.ts` (password vectors align with `SECURITY_CONFIG`, global storage mock used) and rerun targeted suite then full Jest run.
7. Author `npm run coverage:report` script that parses `coverage/coverage-final.json`, prints top 20 uncovered files, and persists `coverageBaseline` in `ADMIN_TRACKING.json`.

Deliverable: Jest green >=95% coverage, AuthService suite stable, coverage reporter available.

### 11.5 Phase Plan (Hybrid Contract Strategy)

#### Phase 0 – Triage (Day 0)
- Lock mocks (indexedDB, storage, crypto, bcrypt) per Section 11.4.
- Document AuthService fixes and policy clarifications in `AUTH_SERVICE_TEST_ANALYSIS.md`.
- Success: `npm test -- AuthService` and `npm run test` pass.

#### Phase 1 – Measurement (Day 0-1)
- Check in coverage reporter and baseline snapshot; update PR template to require coverage diff paste.
- Enforce coverage exclusions limited to `*.d.ts`, `src/main.tsx`, `src/vite-env.d.ts`, `src/config.ts`.
- Success: baseline recorded in `ADMIN_TRACKING.json`, automated diff visible.

#### Phase 2 – Core Logic & Service Contracts (Week 1)
- Reach 100% coverage for `src/admin/utils/*`, `src/admin/validation/*`, `src/admin/reference/amenities.ts`, `src/admin/services/*.ts`, `src/services/storage.ts`, migration utilities, and `src/admin/testing/*`.
- Implement factory builders under `src/admin/testing/factories/` (Property, RoomType, Place, Media, Offer, PromoCode, Enquiry, Settings) with valid defaults and invalid variants.
- For each service port (Content, Media, Offers, PromoCodes, Enquiries, Settings, ExportImport, Snapshots, SecurityAudit) write contract tests covering success, validation (`VAL-001`), reference (`REF-404`), conflict (`CONFLICT-409`), media in use (`MEDIA-INUSE-423`), quota (`QUOTA-507`), schema drift (`STORE-DRIFT-500`), import diff warning, snapshot limit.
- Verify offline queue deterministic flush (`OfflineQueueService.reset/processQueue`) and snapshot ring buffer enforcement (max 20).
- Success: Jest thresholds temporarily ratcheted to 95% (all metrics) with no uncovered service logic; factories published.

#### Phase 3 – Hooks & Context (Week 1-2)
- Cover `useAuth`, `useSessionTimeout`, `useToast`, `useRBAC`, `useSanitizedInput` including mount → effects → cleanup, timeout churn, toast queue limits, permission denials, sanitized payloads.
- Validate providers (`AppProviders`, `AuthProvider`, `ToastProvider`, `PermissionGate`) deliver expected values/guards via `renderWithAdminProviders`.
- Success: Hooks/providers at 100% coverage with deterministic timers and keyboard shortcuts.

#### Phase 4 – Components & Accessibility (Week 2)
- Expand suites across admin components (forms, lists, dialogs, monitor widgets) hitting loading, empty, error, success, and accessibility states.
- Integrate `@axe-core/react` smoke checks (silence only `color-contrast`) for AdminLayout, Dashboard, Media grid, Offers, Enquiries, Settings.
- Snapshot complex layouts with canonical fixtures (Properties/Offers dashboards) to guard regressions.
- Success: `src/admin/components/**` at 100% coverage; axe results clean; snapshots stable in PR review.

#### Phase 5 – Pages & Routing Integration (Week 2-3)
- Build integration tests for `App.tsx`, admin pages, and public pages using MemoryRouter + seeded services + feature flags, asserting redirects, guard rails, offline banner, dev mode indicators, import/export flows.
- Raise Jest coverage thresholds to 100/100/100/100 once suites land.
- Success: 100% Jest coverage enforced; routing/pages verified offline.

#### Phase 6 – Cypress Golden Paths & CI (Week 3)
- Convert five golden paths into Cypress specs (Property lifecycle, Media lifecycle, Enquiry timeline, Offer conflict, Export/Import dry-run) running offline with IndexedDB reset via `npm run e2e:reset` task.
- Configure GitHub Actions workflow: lint → jest-coverage → cypress (headed Chromium) with TZ set, network disallowed, coverage report artifact and PR comment.
- Success: Cypress suite stable, CI gates fail on coverage drop or import unknowns.

#### Phase 7 – Sustainment (Ongoing)
- Add Husky pre-push hook calling `npm run verify` (lint + test + typecheck); document bypass policy.
- Append weekly coverage and flake stats to `ADMIN_TRACKING.json`; include guidance in `ADMIN_DOCUMENTATION.md`.
- Maintain policy: no merges with coverage regressions or untested logic; update docs concurrently with code.

### 11.6 Coverage & Quality Metrics
- Leading: % of files with >=1 test, flake count (rolling 7-day), open regression bugs.
- Lagging: Jest 100% across metrics, Cypress golden paths 100%, CI runtime budgets met, zero import unknowns, zero live network traces.

### 11.7 Test Utility Deliverables
- `src/admin/testing/factories/index.ts`: exports all builders with `buildValid`, `buildInvalid`, and composition helpers.
- `src/admin/testing/render.tsx`: unified RTL render utilities with feature flag overrides and env var stubs.
- `src/admin/testing/storageMock.ts`: stateful storage/crypto/bcrypt mocks + `resetStorage()`.
- `src/admin/testing/offlineQueue.ts`: re-export `OfflineQueueService.reset/processQueue` helpers.
- `coverage-report.mjs`: Node script powering `npm run coverage:report` (top laggards, baseline persistence, optional failure on < target).

### 11.8 CI Gate Criteria
- Jobs: `lint`, `jest-coverage`, `cypress` (split for parallelism if needed).
- Environment: Node 22.15.0 via `.nvmrc`, TZ Asia/Kolkata, Chromium headed, network blocked except localhost.
- Fail on: any test failure, coverage < threshold (Phase 2: 95%, Phase 5+: 100%), import dry-run unknown fields, snapshot mismatch without approval.
- PR comment summarises coverage diff per folder and flags regressions.

### 11.9 Risk Log & Mitigations
| Risk | Mitigation |
| --- | --- |
| Timer/animation flakes | Use fake timers, reduced-motion media query, explicit toast dismissals |
| IndexedDB schema drift | Contract tests hit repair path; assert post-repair state |
| Slow CI | Shard Jest by project, cap fixtures <= 5 MB, parallelize Cypress specs |
| Snapshot churn | Deterministic factories, manual review, forbid CI auto-update |
| Environment mismatch | `.nvmrc`, mirrored jsdom/polyfills, Cypress network block |

### 11.10 Definition of Done
- Jest and Cypress suites green locally and on CI for `main`.
- Jest thresholds at 100% with no additional exclusions; coverage report shows no targeted file below 100%.
- Cypress golden paths pass with zero external network calls.
- `ADMIN_TRACKING.json` contains new coverage baseline and weekly log cadence; PR template enforces coverage diff.
- Documentation refreshed (`ADMIN_DOCUMENTATION.md`, coverage plan, harness README).
- Snapshots steady across consecutive runs; no flaky tests quarantined.
- Stakeholder sign-off (Rahul, Anita, Meera) recorded for final gate.

_Last synchronized: 2025-09-27_
