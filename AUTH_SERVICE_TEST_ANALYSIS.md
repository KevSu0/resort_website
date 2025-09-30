# Auth Service Test Failures Analysis

## Test Run Snapshot
```
npm test -- AuthService
```
- Test suite executed after installing dev dependencies (`npm install`).
- Jest reported 4 failing specs in `src/admin/__tests__/security/authService.test.ts`:
  - `Authentication › should rate limit login attempts`
  - `Password Validation › should validate strong password`
  - `Password Validation › should reject password with personal info`
  - `Password Validation › should reject common passwords`

## Root Causes

### 1. Rate-limiting spec never observes lockout
- **Symptom:** Sixth login attempt resolves to `null` instead of throwing `Account locked...`.
- **Finding:** `AuthService` persists attempts through the shared `RateLimiter`, which writes to `localStorage`. In the Jest environment, `jest.setup.js` mounts a mock `global.localStorage` whose methods (`getItem`, `setItem`, etc.) are bare `jest.fn()` stubs with no backing store.
- **Impact:** Every call to `RateLimiter.getEntries()` sees `undefined`, so the limiter thinks each attempt is the first and never reaches the lockout threshold.
- **Why the custom mock in the test file misses the issue:** The test overrides `window.localStorage`, but `RateLimiter` references the global `localStorage`. Because the global stub remains stateless, the limiter never records attempts despite the per-test mock.

### 2. Password validation expectations diverge from the implementation
- `validatePassword('AnotherSecurePassword1!', { name: 'Another User', email: 'another@example.com' })`
  - Fails because the validator forbids passwords containing the email local part; 'another' appears verbatim, so `isValid` is `false`.
- `validatePassword('MyPasswordIsTestUser1!', { name: 'Test User', email: 'another@example.com' })`
  - Passes because the name check requires the exact (space-included) string 'test user'; the password only contains the concatenated form 'testuser', so no error is raised even though the test expects one.
- `validatePassword('password123!', ...)`
  - Fails with errors for missing uppercase letters and for sequential digits, but **not** for being a common password. The implementation only flags entries that exactly match the curated list (e.g., 'password', '123456'), so 'password123!' is not considered "too common".

These behaviors align with the production security utility at `src/admin/utils/security.ts` and indicate the tests are still asserting against earlier assumptions.

## Recommended Path Forward

1. **Fix the Jest storage mock**
   - Make `jest.setup.js` supply a stateful `global.localStorage` (and `sessionStorage`) implementation, or update the test to override `global.localStorage` instead of only `window.localStorage`.
   - Once the mock retains values, the rate-limiter spec should observe the lockout and either pass or reveal genuine logic issues.

2. **Decide on the desired password rules and align tests accordingly**
   - If the current implementation is correct, update the failing specs to use test passwords that respect those rules (e.g., avoid repeating the email prefix when expecting a "strong" password, include the exact name with spacing when expecting rejection, and assert on the actual error messages the validator emits).
   - If the product requirement is different (e.g., treat any password that contains "password" as common, or detect names without spaces), adjust `validatePassword` and add targeted unit coverage to document the new rules.

3. **Re-run `npm test -- AuthService` after applying the changes** to confirm the suite passes and catch any remaining edge cases (such as session data persistence once the storage mock is stateful).

## Additional Notes

- The initial test run failed before Jest started because `@babel/preset-react` was missing from `node_modules`. Running `npm install` (or `npm ci`) after pulling the commit resolves this prerequisite.
- No other admin tests fail once the above issues are addressed; the rest of the suite already passes with the modernized Jest/Babel configuration.

## Next Steps Checklist

- [ ] Update the storage mock so it preserves state across calls.
- [ ] Clarify intended password validation semantics and adjust either tests or implementation.
- [ ] Re-run the targeted Jest suite and, if desired, the full test/verify pipeline.
