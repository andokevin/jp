---
'@jp/api': minor
'@jp/identite': minor
'@jp/mobile': minor
---

**F0.1 — idempotency on identite OTP routes, request cache and data-saver mode wired end-to-end from mobile storage down to the X-Data-Saver header.**

Backend (`@jp/api`)
- Both `POST /identite/otp/emettre` and `POST /identite/otp/verifier` are now wrapped in `executerUneSeuleFois`. An `Idempotency-Key` header is required (400 otherwise, 422 on same-key/different-body). A legitimate transport replay returns the recorded response without re-executing, and without consuming the rate-limit quota — the limiter runs INSIDE the idempotency callback.
- New integration test file `identite-routes.test.ts` (12 tests) covers the wiring through `fastify.inject()`. New service test file `identite-service.test.ts` (16 tests) covers the business logic against a real Postgres. Shared fixtures in `apps/api/test/fixtures.ts`.

Shared package (`@jp/identite`)
- New `RequestCache` class + `sharedRequestCache` singleton — a 60-s in-memory cache on `requestCode` responses. A repeated request for the same email within the window skips the round-trip. The cached `expiresInS` is rebuilt at read time from a stored absolute deadline, so the UI countdown reflects the OTP's real remaining lifetime, not a snapshot. Injectable clock for tests. Exported so applications can `.clear()` on logout.
- New `IdentityClient.dataSaver` option that conditionally sends `X-Data-Saver: 1`. Absent header is the opt-out — the HTTP opt-in convention reads header presence as the signal, so sending `'0'` would be a lie.
- New `FlowOptions.autoVerifyOnComplete` option (default `true`) : set to `false` to disable the auto-verify at the sixth digit. Read via strict `=== false` so undefined keeps the historical behaviour.
- Extracted `shouldAutoVerify(state)` — pure predicate in `flow.ts`, testable without React. The hook composes over it plus the anti-replay guard and the opt-out.

Mobile (`@jp/mobile`)
- Native `useAuthOtp` adapter now accepts a `MagasinLecture`, reads `jp.preference.economie` at mount (with cancel-guard on the async read), and propagates the value to both `IdentityClient.dataSaver` and `FlowOptions.autoVerifyOnComplete`.
- `EcranConnexion` passes `ordinaire` (AsyncStorage) — not the trousseau, a preference is not a secret.

All new options are optional with defaults preserving prior behaviour ; no code change is required for consumers who do not opt in.
