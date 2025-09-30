# Admin Stability and Issue Resolution Plan

## Current State Snapshot
- **Admin shell restored:** `src/admin/components/AdminLayout.tsx` now passes page content via `{children ?? <Outlet />}` so dashboard/media/etc. render again.
- **Auth/session model:** Pure client-side auth backed by `localStorage` (`authService`, `fileStorageService`). Sessions expire after 15 minutes unless extended.
- **Data layer:** Draft/published content, media metadata, enquiries, and settings are persisted to `localStorage`. No server synchronization exists yet.
- **Testing coverage:** No automated admin regression tests; stability depends on manual QA.

## Immediate Verification Checklist
Run these steps after pulling latest changes or deploying.
1. `npm install` (ensures dependencies are intact).
2. `npm run dev` and manually verify:
   - `/admin/login` first-run wizard appears only when no admin user exists.
   - Login works with the seeded credentials or a newly created admin.
   - `/admin`, `/admin/media`, `/admin/enquiries`, `/admin/settings` render inside the admin chrome.
   - Logout clears the session and redirects to the login page.
3. Open DevTools -> Application -> Local Storage and confirm content/settings snapshots are created as you interact with editors.
4. Clear `localStorage` and repeat to ensure the first-run setup path still works.

## Hardening Actions (Prioritized)
1. **Authentication resilience**
   - Seed a default admin user if the user list is empty to avoid lockouts.
   - Add username/email uniqueness validation during registration.
   - Persist session renewal errors and surface user-friendly notifications.
2. **State persistence safeguards**
   - Wrap all `localStorage` mutations (e.g., `fileStorageService.saveDraft`) with `try/catch` and surface toast notifications through a shared error handler.
   - Introduce a lightweight integrity check (e.g., JSON schema validation) before reading stored drafts/media to catch corrupted data early.
   - Add periodic export prompts or an auto-backup (JSON download) so editors can recover from browser data loss.
3. **Media workflow reliability**
   - Implement client-side size/dimension validation prior to `FileReader` usage.
   - Store thumbnails in memory-efficient formats (WebP) and handle `FileReader` errors gracefully.
   - Track usage of each media asset; block deletion if linked to published content.
4. **Content editors**
   - Ensure every editor initializes with defaults by calling `fileStorageService.initializeWithDefaults()` once on app boot.
   - Add optimistic validation before saving to drafts (required fields, URL formats, price ranges, etc.).
   - Provide dirty-state warnings to prevent accidental navigation loss.
5. **Testing & Tooling**
   - Add component tests for auth (`useAuth`, `Login`) and routing guards using React Testing Library + Vitest.
   - Create E2E smoke tests (Playwright/Cypress) covering login, navigation, draft save, publish, logout.
   - Add `npm run lint` and `npm run test` to CI to stop regressions from merging.
6. **Performance & UX**
   - Lazy-load heavy editors and media modules via code-splitting to keep the dashboard responsive.
   - Cache expensive derived data (e.g., snapshot comparisons) with memoization.
7. **Documentation & Ops**
   - Keep `ADMIN_IMPLEMENTATION_STATUS.md` aligned with feature progress.
   - Document recovery steps (clearing storage, re-running setup) for non-technical operators.

## Roadmap for Stability Improvements
| Milestone | Focus | Expected Outcome |
|-----------|-------|------------------|
| M1 | Auth + session hardening, tests for login/logout | Prevents blank admin screens and regressions in guards |
| M2 | Storage validation, media safeguards | Protects against data corruption and broken assets |
| M3 | Editor validation & UX polish | Reduces content errors before publish |
| M4 | Automated smoke/E2E suite | Confident deploys with single command |
| M5 | Optional backend adapter | Path to migrate from `localStorage` to API without rewriting UI |

## Deployment Guardrails
- Always run `npm run build` prior to deployment; investigate any Vite warnings (often signal TypeScript or asset issues).
- Bundle the admin alongside the public site; verify `dist` contains admin routes (Vite should output hashed assets reused by both).
- In production, enforce HTTPS and disable browser `localStorage` access via content security policies only after moving to a real backend.

## Incident Recovery Playbook
1. **Blank Admin Page**
   - Check console for `localStorage` quota or JSON parse errors.
   - Clear `localStorage` keys with prefix `data/` and `admin_*`, then re-run setup.
2. **Login Loop**
   - Inspect `SESSION_KEY` value; confirm `expiresAt` is in the future.
   - If bcrypt hashes mismatch, reset by deleting `admin_users` key and re-registering.
3. **Missing Media**
   - Validate entries in `data/media-manifest.json` vs. actual `assets/images/<id>.<ext>` keys.
   - Re-import from latest export if manifest corruption is detected.

## Suggested Monitoring Hooks
- Wrap `authService` and `fileStorageService` methods to emit events (e.g., `console.warn`, log aggregation) during development.
- Collect anonymous telemetry (when permitted) on failed logins, publish errors, and storage exceptions to target future improvements.

Keeping this checklist updated after every significant admin change will ensure the CMS stays stable even as new editors and workflows are added.