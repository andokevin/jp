/**
 * F0.1 — /identite/otp/emettre : routes wired through Fastify.
 *
 * These tests inject HTTP requests into the real Fastify app — same hooks,
 * same error handler, same middlewares as production. What they add over
 * the service tests is the outer shell : the Idempotency-Key header
 * handling, the status codes, the way an error becomes an HTTP response.
 *
 * The RB10 invariants themselves are tested exhaustively in
 * plateforme.test.ts against `executerUneSeuleFois` in isolation ; here
 * we only prove the WIRING — that this route actually goes through it.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { creerServeur } from '../src/plateforme/serveur.js';
import { enregistrerRoutes } from '../src/modules/identite/routes.js';
import { demarrerBase, type BaseDeTest } from './conteneur.js';
import { creerUtilisateur, poserOtp, unEmailNeuf as unEmailBrut } from './fixtures.js';

let base: BaseDeTest;
let app: FastifyInstance;

beforeAll(async () => {
  base = await demarrerBase();
  app = await creerServeur({
    db: base.prisma,
    journaux: false, // Silence Fastify request logs — the test output is the signal.
    modules: (fastify, db) => {
      enregistrerRoutes(fastify, db);
    },
  });
  await app.ready();
});

afterAll(async () => {
  await app?.close();
  await base?.arreter();
});

/**
 * A fresh UUID per test call — that's what a real client does. Two calls to
 * this helper produce TWO independent idempotency scopes.
 */
function uneCle(): string {
  return crypto.randomUUID();
}

/** Local alias : keep the `route-` prefix so failing rows are easy to locate. */
function unEmailNeuf(): string {
  return unEmailBrut('route');
}

describe('POST /identite/otp/emettre', () => {
  it('nominal : returns 202 with { ok, expiresInS }', async () => {
    const email = unEmailNeuf();
    const cle = uneCle();

    const reponse = await app.inject({
      method: 'POST',
      url: '/identite/otp/emettre',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload: { email, purpose: 'signup' },
    });

    expect(reponse.statusCode).toBe(202);
    const corps = reponse.json();
    expect(corps).toEqual({ ok: true, expiresInS: expect.any(Number) });
  });

  it('missing Idempotency-Key : returns 400 CLE_IDEMPOTENCE_MANQUANTE', async () => {
    // The header omission — the exact defect this validation catches.
    const reponse = await app.inject({
      method: 'POST',
      url: '/identite/otp/emettre',
      headers: { 'Content-Type': 'application/json' },
      payload: { email: unEmailNeuf(), purpose: 'signup' },
    });

    expect(reponse.statusCode).toBe(400);
    expect(reponse.json()).toMatchObject({ code: 'CLE_IDEMPOTENCE_MANQUANTE' });
  });

  it('malformed Idempotency-Key : same 400 CLE_IDEMPOTENCE_MANQUANTE', async () => {
    // The Zod schema requires min 16, max 128 chars. "abc" trips the same
    // error as an absent header — from the caller's perspective they're
    // the same defect : "no valid key was supplied".
    const reponse = await app.inject({
      method: 'POST',
      url: '/identite/otp/emettre',
      headers: { 'Idempotency-Key': 'abc', 'Content-Type': 'application/json' },
      payload: { email: unEmailNeuf(), purpose: 'signup' },
    });

    expect(reponse.statusCode).toBe(400);
    expect(reponse.json()).toMatchObject({ code: 'CLE_IDEMPOTENCE_MANQUANTE' });
  });

  it('same key, same body : the second call returns the SAME response WITHOUT re-executing', async () => {
    // The proof that "without re-executing" holds : only ONE OTP row appears
    // in the database. If the service ran twice, we'd see two.
    const email = unEmailNeuf();
    await creerUtilisateur(base.prisma, email); // login branch = OTP created
    const cle = uneCle();
    const body = { email, purpose: 'login' as const };

    const premier = await app.inject({
      method: 'POST',
      url: '/identite/otp/emettre',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload: body,
    });
    const rejeu = await app.inject({
      method: 'POST',
      url: '/identite/otp/emettre',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload: body,
    });

    expect(premier.statusCode).toBe(202);
    expect(rejeu.statusCode).toBe(202);
    expect(rejeu.json()).toEqual(premier.json());

    const codes = await base.prisma.otpCode.findMany({ where: { email } });
    expect(codes).toHaveLength(1);
  });

  it('same key, DIFFERENT body : 422 CLE_IDEMPOTENCE_REUTILISEE', async () => {
    // The nasty case : a buggy client would receive the response for a
    // DIFFERENT operation. Refused rather than served wrong data.
    const cle = uneCle();

    await app.inject({
      method: 'POST',
      url: '/identite/otp/emettre',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload: { email: unEmailNeuf(), purpose: 'signup' },
    });

    const rejeu = await app.inject({
      method: 'POST',
      url: '/identite/otp/emettre',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload: { email: unEmailNeuf(), purpose: 'signup' }, // Different email.
    });

    expect(rejeu.statusCode).toBe(422);
    expect(rejeu.json()).toMatchObject({ code: 'CLE_IDEMPOTENCE_REUTILISEE' });
  });

  it('a legitimate replay does NOT consume rate-limit quota (the reason for placing the limiter inside)', async () => {
    // What we prove : within the idempotency window, the same email can hit
    // the endpoint five times with the SAME key and stay under the quota,
    // because only the first call reaches the limiter.
    //
    // This is what would break if we naively wrapped the whole handler
    // OUTSIDE `executerUneSeuleFois` — a flaky mobile connection retrying
    // twice would eat two of the user's five allowed attempts per window.
    const email = unEmailNeuf();
    await creerUtilisateur(base.prisma, email);
    const cle = uneCle();
    const body = { email, purpose: 'login' as const };

    // Ten replays of the SAME (key, body). All should succeed with 202.
    for (let i = 0; i < 10; i++) {
      const r = await app.inject({
        method: 'POST',
        url: '/identite/otp/emettre',
        headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
        payload: body,
      });
      expect(r.statusCode).toBe(202);
    }

    // Still only ONE OTP row : the service really ran once.
    const codes = await base.prisma.otpCode.findMany({ where: { email } });
    expect(codes).toHaveLength(1);
  });

  // ═══════════════════════════════════════════════════════════════════════════
// POST /identite/otp/verifier
// ═══════════════════════════════════════════════════════════════════════════

describe('POST /identite/otp/verifier', () => {
  it('nominal : returns 200 with a session token for a fresh account', async () => {
    const email = unEmailNeuf();
    const code = '123456';
    await poserOtp(base.prisma, email, code);

    const reponse = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': uneCle(), 'Content-Type': 'application/json' },
      payload: { email, code, firstName: 'Hanta', language: 'fr' },
    });

    expect(reponse.statusCode).toBe(200);
    const corps = reponse.json();
    expect(corps.token).toBeTruthy();
    expect(corps.user).toMatchObject({ email, isNew: true });
  });

  it('missing Idempotency-Key : returns 400 CLE_IDEMPOTENCE_MANQUANTE', async () => {
    const reponse = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Content-Type': 'application/json' },
      payload: { email: unEmailNeuf(), code: '000000', language: 'fr' },
    });

    expect(reponse.statusCode).toBe(400);
    expect(reponse.json()).toMatchObject({ code: 'CLE_IDEMPOTENCE_MANQUANTE' });
  });

  it('same key, same body : the replay returns the SAME token WITHOUT re-consuming the OTP', async () => {
    // The scenario that matters most for THIS route. Without idempotency, a
    // transport replay of a successful verify would see the OTP already
    // consumed and throw OTP_EXPIRE — the user would be told their code
    // failed AFTER it had actually worked.
    const email = unEmailNeuf();
    const code = '234567';
    await poserOtp(base.prisma, email, code);
    const cle = uneCle();
    const payload = { email, code, firstName: 'Miora', language: 'fr' };

    const premier = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload,
    });
    const rejeu = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload,
    });

    expect(premier.statusCode).toBe(200);
    expect(rejeu.statusCode).toBe(200);
    // Same body byte-for-byte — including the same token. That's the point :
    // the caller received one valid session, not two ambiguous ones.
    expect(rejeu.json()).toEqual(premier.json());

    // Exactly ONE user row created — the service ran once.
    const utilisateurs = await base.prisma.user.findMany({ where: { email } });
    expect(utilisateurs).toHaveLength(1);
  });

  it('same key, DIFFERENT body : 422 CLE_IDEMPOTENCE_REUTILISEE', async () => {
    // Two verify attempts with the same key but different codes — the
    // second is refused before it can even try the OTP, because it CANNOT
    // be interpreted as a retry of the first.
    const email = unEmailNeuf();
    await poserOtp(base.prisma, email, '345678');
    const cle = uneCle();

    await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload: { email, code: '345678', language: 'fr' },
    });

    const rejeu = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload: { email, code: '999999', language: 'fr' }, // Different code.
    });

    expect(rejeu.statusCode).toBe(422);
    expect(rejeu.json()).toMatchObject({ code: 'CLE_IDEMPOTENCE_REUTILISEE' });
  });

  it('wrong code : releases the key so the caller can retry with a new key', async () => {
    // The subtlety of executerUneSeuleFois : when the wrapped action throws,
    // the key is DELETED. Otherwise a first wrong-code attempt would poison
    // the key : the user retries (with the same key), the fingerprint of the
    // corrected body differs, we'd return CLE_IDEMPOTENCE_REUTILISEE for
    // what is really a legitimate second attempt.
    //
    // What we prove : a fresh key with the right code after a wrong-code
    // attempt goes through. And, as a bonus, the wrong-code attempt does
    // return OTP_INVALIDE with a proper attempts counter.
    const email = unEmailNeuf();
    await poserOtp(base.prisma, email, '456789');

    const mauvais = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': uneCle(), 'Content-Type': 'application/json' },
      payload: { email, code: '000000', language: 'fr' },
    });
    expect(mauvais.statusCode).toBe(400);
    expect(mauvais.json()).toMatchObject({ code: 'OTP_INVALIDE' });

    // Fresh key, correct code — must succeed. The OTP was NOT consumed by
    // the wrong-code attempt (that's a service-level invariant, tested in
    // identite-service.test.ts), so it's still there for us.
    const bon = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': uneCle(), 'Content-Type': 'application/json' },
      payload: { email, code: '456789', firstName: 'Ony', language: 'fr' },
    });
    expect(bon.statusCode).toBe(200);
    expect(bon.json().user.email).toBe(email);
  });

  it('replay after OTP expiry : still returns the cached success (safer than re-checking)', async () => {
    // A more subtle case : the first request succeeded (OTP consumed, session
    // opened). Days later, the same key is replayed. The OTP is long gone
    // from any active-lookup window, but the RECORDED response is still there
    // (CONSERVATION_MS = 24 h). We must return the cached response, not go
    // hunt for an OTP that no longer exists.
    //
    // This is the whole point of idempotency being a REPLAY of a response,
    // not a REPEAT of the operation.
    const email = unEmailNeuf();
    const code = '567890';
    await poserOtp(base.prisma, email, code);
    const cle = uneCle();
    const payload = { email, code, firstName: 'Naina', language: 'fr' };

    const premier = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload,
    });
    expect(premier.statusCode).toBe(200);

    // Simulate time passing : we EXPLICITLY expire the OTP in the DB.
    // No date-mocking library needed — the DB is our clock.
    await base.prisma.otpCode.updateMany({
      where: { email },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    const rejeu = await app.inject({
      method: 'POST',
      url: '/identite/otp/verifier',
      headers: { 'Idempotency-Key': cle, 'Content-Type': 'application/json' },
      payload,
    });
    expect(rejeu.statusCode).toBe(200);
    expect(rejeu.json()).toEqual(premier.json());
  });
});

});