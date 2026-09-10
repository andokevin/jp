/**
 * Shared test fixtures for the identite module.
 *
 * Two test files (identite-service.test.ts and identite-routes.test.ts)
 * need the same primitives : a fresh email per test, the SHA-256 hash the
 * service uses internally, a minimal user creation helper, and a way to
 * drop an OTP straight into the database without going through
 * service.demanderCode (see the discussion in identite-service.test.ts).
 *
 * These helpers live here rather than in `src/` because they belong to the
 * TEST contract of the service — the shape of `codeHash`, the format of
 * the OTP row — not to the service itself. A future migration to Argon2id
 * would break these tests intentionally.
 */
import { createHash } from 'node:crypto';
import type { PrismaClient } from '../src/genere/prisma/client.js';

/**
 * A fresh email per call. Tests share one database across the whole file,
 * so they must not collide on unique constraints ; UUIDs give a global-
 * per-run guarantee. The `prefix` argument helps read tests output — a
 * failing test in `identite-service` shows `svc-…@jp.test`, in `identite-
 * routes` shows `route-…@jp.test`, so you can tell them apart at a glance.
 */
export function unEmailNeuf(prefix = 'test'): string {
  return `${prefix}-${crypto.randomUUID()}@jp.test`;
}

/**
 * Reproduce the service's private SHA-256. Intentionally duplicated : if
 * the service migrates to Argon2id, these tests SHOULD break — because
 * anyone who prepared their own hashes (bulk import scripts, admin tools)
 * would break too. That break is the test doing its job.
 */
export function hashOtp(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

/**
 * Minimal user row — no password, no profile. Enough for `demanderCode`
 * and `verifierCode` to branch on "exists / does not exist".
 */
export async function creerUtilisateur(prisma: PrismaClient, email: string): Promise<void> {
  await prisma.user.create({ data: { email } });
}

/**
 * Insert a ready-to-verify OTP directly. Returns the row id so callers
 * that need to mutate the row further (e.g. pre-set `attempts` for a
 * ceiling test) can address it precisely. Callers that don't need the id
 * simply ignore the returned value.
 *
 * `expiresAt` defaults to +5 minutes ; callers that want to simulate an
 * expired OTP pass a date in the past.
 */
export async function poserOtp(
  prisma: PrismaClient,
  email: string,
  code: string,
  expiresAt: Date = new Date(Date.now() + 5 * 60_000),
): Promise<string> {
  const otp = await prisma.otpCode.create({
    data: { email, codeHash: hashOtp(code), expiresAt },
  });
  return otp.id;
}
