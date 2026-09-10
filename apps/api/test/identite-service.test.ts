/**
 * F0.1 — service.demanderCode : what comes out, what gets written, and what
 * DOESN'T.
 *
 * This file does NOT test the OTP mechanism in general (hash algorithm, code
 * length contract) — those bricks are tested elsewhere. It tests ONE service
 * against ONE rule : R-C9 — "the response is identical whether the account
 * exists or not". Without these tests, a refactor could quietly remove the
 * silent branch and turn the entry screen into a directory of registered
 * addresses, with no compiler or linter noticing.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { auth } from '@jp/contracts';
import { service } from '../src/modules/identite/service.js';
import { demarrerBase, type BaseDeTest } from './conteneur.js';
import { creerUtilisateur, poserOtp, unEmailNeuf as unEmailBrut } from './fixtures.js';

let base: BaseDeTest;

// One database per test file — starting Postgres via testcontainers takes
// several seconds, so we amortize it across the whole describe block.
beforeAll(async () => {
  base = await demarrerBase();
});
afterAll(async () => {
  await base?.arreter();
});

/** Local alias : keep the `svc-` prefix so failing rows are easy to locate. */
function unEmailNeuf(): string {
  return unEmailBrut('svc');
}

describe('service.demanderCode', () => {
  it('signup + unknown email : stores an OTP and returns the TTL', async () => {
    const email = unEmailNeuf();

    const reponse = await service.demanderCode(base.prisma, { email, purpose: 'signup' });

    expect(reponse).toEqual({ ok: true, expiresInS: auth.OTP_TTL_SECONDS });

    // The database is the oracle : we don't trust the return value alone,
    // because R-C9 requires the SAME return in the "did nothing" case below.
    const codes = await base.prisma.otpCode.findMany({ where: { email } });
    expect(codes).toHaveLength(1);
  });

  it('signup + existing account : returns the same shape but writes NOTHING (R-C9)', async () => {
    const email = unEmailNeuf();
    await creerUtilisateur(base.prisma, email);

    const reponse = await service.demanderCode(base.prisma, { email, purpose: 'signup' });

    // Response identical to the "unknown email" case — that IS the invariant.
    expect(reponse).toEqual({ ok: true, expiresInS: auth.OTP_TTL_SECONDS });

    // No OTP row must exist : the whole point is to avoid signalling
    // "this address is already known" through side effects.
    const codes = await base.prisma.otpCode.findMany({ where: { email } });
    expect(codes).toHaveLength(0);
  });

  it('login + unknown email : returns the same shape but writes NOTHING (R-C9)', async () => {
    const email = unEmailNeuf();

    const reponse = await service.demanderCode(base.prisma, { email, purpose: 'login' });

    expect(reponse).toEqual({ ok: true, expiresInS: auth.OTP_TTL_SECONDS });

    const codes = await base.prisma.otpCode.findMany({ where: { email } });
    expect(codes).toHaveLength(0);
  });

  it('login + existing account : stores an OTP', async () => {
    const email = unEmailNeuf();
    await creerUtilisateur(base.prisma, email);

    const reponse = await service.demanderCode(base.prisma, { email, purpose: 'login' });

    expect(reponse).toEqual({ ok: true, expiresInS: auth.OTP_TTL_SECONDS });

    const codes = await base.prisma.otpCode.findMany({ where: { email } });
    expect(codes).toHaveLength(1);
  });

  it('omitting purpose defaults to signup', async () => {
    // We drop `purpose` entirely — the service must treat this as signup, so
    // an UNKNOWN email must get an OTP (the signup branch).
    const email = unEmailNeuf();

    await service.demanderCode(base.prisma, { email });

    const codes = await base.prisma.otpCode.findMany({ where: { email } });
    expect(codes).toHaveLength(1);
  });

  it('email is normalised to lowercase before lookup AND storage', async () => {
    // Direction 1 — the LOOKUP lowercases. Create the user in lowercase, ask
    // in mixed case : the service must recognise them as the same person and
    // take the signup-with-existing-account branch (= no OTP).
    const email = unEmailNeuf();
    await creerUtilisateur(base.prisma, email);
    await service.demanderCode(base.prisma, {
      email: email.toUpperCase(),
      purpose: 'signup',
    });
    expect(await base.prisma.otpCode.findMany({ where: { email } })).toHaveLength(0);

    // Direction 2 — STORAGE lowercases. On a genuinely new mixed-case address,
    // the OTP row must land under the lowercase form — otherwise the verifier
    // (which lowercases too) will never find it.
    const neuf = unEmailNeuf();
    await service.demanderCode(base.prisma, { email: neuf.toUpperCase(), purpose: 'signup' });
    expect(await base.prisma.otpCode.findMany({ where: { email: neuf } })).toHaveLength(1);
    expect(
      await base.prisma.otpCode.findMany({ where: { email: neuf.toUpperCase() } }),
    ).toHaveLength(0);
  });

  it('the stored codeHash is a SHA-256 hex string, never the plaintext code', async () => {
    const email = unEmailNeuf();
    await service.demanderCode(base.prisma, { email, purpose: 'signup' });

    const [otp] = await base.prisma.otpCode.findMany({ where: { email } });
    expect(otp).toBeDefined();
    // 64 hex chars — hashes have a fixed shape ; a 6-digit plaintext would
    // trivially fail both these assertions.
    expect(otp!.codeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(otp!.codeHash).not.toMatch(/^\d{6}$/);
  });

  it('expiresAt is set OTP_TTL_SECONDS seconds after the call, within tolerance', async () => {
    const email = unEmailNeuf();

    const avant = Date.now();
    await service.demanderCode(base.prisma, { email, purpose: 'signup' });
    const apres = Date.now();

    const [otp] = await base.prisma.otpCode.findMany({ where: { email } });
    const attenduBas = avant + auth.OTP_TTL_SECONDS * 1000;
    const attenduHaut = apres + auth.OTP_TTL_SECONDS * 1000;

    // Bracket check — the exact millisecond depends on when Date.now() was
    // read INSIDE the service, which we can't observe. This interval is tight
    // enough to catch a unit mistake (seconds vs ms) or a wrong constant.
    const stored = otp!.expiresAt.getTime();
    expect(stored).toBeGreaterThanOrEqual(attenduBas);
    expect(stored).toBeLessThanOrEqual(attenduHaut);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// service.verifierCode
// ═══════════════════════════════════════════════════════════════════════════

describe('service.verifierCode', () => {
  it('correct code + unknown account : creates the user AND opens a session (isNew=true)', async () => {
    const email = unEmailNeuf();
    const code = '123456';
    await poserOtp(base.prisma, email, code);

    const reponse = await service.verifierCode(base.prisma, {
      email,
      code,
      firstName: 'Hanta',
      language: 'fr',
    });

    // The response — the surface the caller sees.
    expect(reponse.user.isNew).toBe(true);
    expect(reponse.user.email).toBe(email);
    expect(reponse.user.firstName).toBe('Hanta');
    expect(reponse.token).toBeTruthy();
    expect(reponse.expiresAt).toBeGreaterThan(Date.now());

    // The database — the effects the caller can't see.
    const utilisateur = await base.prisma.user.findUnique({ where: { email } });
    expect(utilisateur).not.toBeNull();
    expect(utilisateur!.firstName).toBe('Hanta');

    // OTP consumed — a leaked code cannot be replayed.
    const otp = await base.prisma.otpCode.findFirst({ where: { email } });
    expect(otp!.consumedAt).not.toBeNull();
  });

  it('correct code + existing account : no new user, session opened (isNew=false)', async () => {
    const email = unEmailNeuf();
    await creerUtilisateur(base.prisma, email);
    const code = '234567';
    await poserOtp(base.prisma, email, code);

    const reponse = await service.verifierCode(base.prisma, { email, code, language: 'fr' });

    expect(reponse.user.isNew).toBe(false);
    expect(reponse.token).toBeTruthy();

    // Only ONE user row — no accidental duplicate.
    const utilisateurs = await base.prisma.user.findMany({ where: { email } });
    expect(utilisateurs).toHaveLength(1);
  });

  it('correct code + existing passwordless account + password provided : sets the password', async () => {
    const email = unEmailNeuf();
    await creerUtilisateur(base.prisma, email); // No password on this user.
    const code = '345678';
    await poserOtp(base.prisma, email, code);

    await service.verifierCode(base.prisma, {
      email,
      code,
      password: 'mon-mot-de-passe',
      language: 'fr',
    });

    const utilisateur = await base.prisma.user.findUnique({ where: { email } });
    expect(utilisateur!.passwordFingerprint).not.toBeNull();
    // We DON'T check the exact hash value — that would freeze the algorithm
    // choice (SHA-256 today, Argon2id tomorrow per the service's own TODO).
    // "Non-null" is what the invariant asks : the password was recorded.
  });

  it('correct code + clothingPreferences provided : creates the buyer profile', async () => {
    const email = unEmailNeuf();
    const code = '456789';
    await poserOtp(base.prisma, email, code);

    await service.verifierCode(base.prisma, {
      email,
      code,
      clothingPreferences: ['streetwear', 'vintage'],
      language: 'fr',
    });

    const utilisateur = await base.prisma.user.findUnique({
      where: { email },
      include: { buyerProfile: true },
    });
    expect(utilisateur!.buyerProfile).not.toBeNull();
    expect(utilisateur!.buyerProfile!.clothingPreferences).toEqual(['streetwear', 'vintage']);
  });

  it('wrong code : throws OTP_INVALIDE with remaining attempts, does NOT consume the OTP', async () => {
    const email = unEmailNeuf();
    const otpId = await poserOtp(base.prisma, email, '111111');

    await expect(
      service.verifierCode(base.prisma, { email, code: '999999', language: 'fr' }),
    ).rejects.toMatchObject({
      code: 'OTP_INVALIDE',
      // 5 max attempts - 0 previous - 1 (the one that just failed) = 4 remaining.
      options: { variables: { remaining: auth.OTP_MAX_ATTEMPTS - 1 } },
    });

    // The OTP survives — the caller must be able to try again.
    const otp = await base.prisma.otpCode.findUnique({ where: { id: otpId } });
    expect(otp!.consumedAt).toBeNull();
    expect(otp!.attempts).toBe(1);
  });

  it('after OTP_MAX_ATTEMPTS failures : throws OTP_TENTATIVES_DEPASSEES, OTP still not consumed', async () => {
    // We simulate a caller who has burned all their tries. The invariant :
    // no more comparisons happen (guarding against brute-force), and the OTP
    // is neither consumed (so a legitimate later request can regenerate) nor
    // reset (so the attacker can't try again by re-triggering demanderCode).
    const email = unEmailNeuf();
    const otpId = await poserOtp(base.prisma, email, '222222');
    // Pre-set the counter — faster and clearer than calling verify 5 times.
    await base.prisma.otpCode.update({
      where: { id: otpId },
      data: { attempts: auth.OTP_MAX_ATTEMPTS },
    });

    await expect(
      // Even with the CORRECT code, once the ceiling is reached, refused.
      service.verifierCode(base.prisma, { email, code: '222222', language: 'fr' }),
    ).rejects.toMatchObject({ code: 'OTP_TENTATIVES_DEPASSEES' });

    const otp = await base.prisma.otpCode.findUnique({ where: { id: otpId } });
    expect(otp!.consumedAt).toBeNull();
  });

  it('no OTP recorded for this email : throws OTP_EXPIRE', async () => {
    // No poserOtp() call — the service's "there is no active OTP" branch.
    const email = unEmailNeuf();

    await expect(
      service.verifierCode(base.prisma, { email, code: '000000', language: 'fr' }),
    ).rejects.toMatchObject({ code: 'OTP_EXPIRE' });
  });

  it('OTP whose expiresAt is in the past : throws OTP_EXPIRE (same branch, different cause)', async () => {
    const email = unEmailNeuf();
    // Ten minutes in the past — the repository's trouverDernierOtp filter
    // (`expiresAt: { gt: new Date() }`) excludes it, and the service takes
    // the same "no OTP" branch as if none had been created.
    await poserOtp(base.prisma, email, '333333', new Date(Date.now() - 10 * 60_000));

    await expect(
      service.verifierCode(base.prisma, { email, code: '333333', language: 'fr' }),
    ).rejects.toMatchObject({ code: 'OTP_EXPIRE' });
  });
});