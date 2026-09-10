/**
 * F0.1 — le client d'identité
 *
 * Ces tests ont vécu dans `apps/web`. Ils suivent le client, qui est partagé
 * depuis qu'on sait qu'il n'utilise que `fetch` : l'écran natif hérite donc
 * des trois garanties vérifiées ici — l'en-tête de langue, la clé
 * d'idempotence, et la distinction entre une coupure et un refus du serveur.
 */
import { describe, expect, it } from 'vitest';

import { IdentityClient, Offline } from './api.js';

// ── Un faux `fetch`, injecté plutôt que simulé ───────────────────────────────
function fauxFetch(reponses: readonly { statut: number; body: unknown }[]) {
  const appels: { url: string; headers: Record<string, string>; body: unknown }[] = [];
  let i = 0;
  const f = (async (url: string | URL, init?: RequestInit) => {
    appels.push({
      url: String(url),
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: JSON.parse(String(init?.body ?? 'null')),
    });
    const r = reponses[Math.min(i++, reponses.length - 1)] as { statut: number; body: unknown };
    return {
      ok: r.statut >= 200 && r.statut < 300,
      status: r.statut,
      json: async () => r.body,
    } as Response;
  }) as unknown as typeof fetch;
  return { f, appels };
}

const SESSION_NOUVELLE = {
  token: 'sess_9f2c',
  expiresAt: 1_800_000_000_000,
  user: {
    id: '0b8f4c1e-7c3a-4b1d-9f61-2a5e8c7d0a11',
    email: 'hanta.r@gmail.com',
    firstName: null,
    hasPassword: false,
    isNew: true,
  },
};

describe('F0.1 — le client d’identité', () => {
  it('annonce la langue et pose une clé d’idempotence', async () => {
    const { f, appels } = fauxFetch([{ statut: 202, body: { ok: true, expiresInS: 600 } }]);
    const client = new IdentityClient({
      base: 'https://api.jp.mg',
      language: 'mg',
      fetch: f,
      newKey: () => 'cle-fixe',
    });

    const r = await client.requestCode('hanta.r@gmail.com');

    expect(r.expiresInS).toBe(600);
    const appel = appels[0] as (typeof appels)[number];
    expect(appel.url).toBe('https://api.jp.mg/identite/otp/emettre');
    // Le serveur traduit lui-même ses messages : c'est cet en-tête, et lui
    // seul, qui fait revenir les erreurs en malgache.
    expect(appel.headers['Accept-Language']).toBe('mg');
    expect(appel.headers['Idempotency-Key']).toBe('cle-fixe');
  });

  it('appelle `fetch` avec le bon `this` — sinon tout ressemble à une coupure', async () => {
    // Régression vécue : `this.f = globalThis.fetch` puis `this.f(…)` lève
    // « Illegal invocation » dans un navigateur. Comme c'est un TypeError, le
    // client l'aurait pris pour une panne réseau et affiché le bandeau hors
    // ligne à quelqu'un de connecté. Ce faux `fetch` refuse le mauvais `this`,
    // exactement comme le fait la plateforme.
    const vrai = globalThis.fetch;
    let appeleCorrectement = false;
    globalThis.fetch = function (this: unknown) {
      if (this !== globalThis) throw new TypeError('Illegal invocation');
      appeleCorrectement = true;
      return Promise.resolve({
        ok: true,
        status: 202,
        json: async () => ({ ok: true, expiresInS: 600 }),
      } as Response);
    } as unknown as typeof fetch;

    try {
      const client = new IdentityClient({ base: 'https://api.jp.mg' });
      await expect(client.requestCode('hanta.r@gmail.com')).resolves.toMatchObject({ ok: true });
      expect(appeleCorrectement).toBe(true);
    } finally {
      globalThis.fetch = vrai;
    }
  });

  it('DISTINGUE une coupure réseau d’un refus du serveur', async () => {
    const coupe = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    const client = new IdentityClient({ base: 'https://api.jp.mg', fetch: coupe });

    await expect(client.requestCode('hanta.r@gmail.com')).rejects.toBeInstanceOf(Offline);
  });

  it('remonte l’enveloppe d’erreur telle quelle, déjà traduite', async () => {
    const { f } = fauxFetch([
      { statut: 400, body: { code: 'OTP_INVALIDE', message: 'Diso ny kaody.' } },
    ]);
    const client = new IdentityClient({ base: 'https://api.jp.mg', language: 'mg', fetch: f });

    await expect(
      client.verifyCode({ email: 'hanta.r@gmail.com', code: '482153' }),
    ).rejects.toMatchObject({ code: 'OTP_INVALIDE' });
  });

  it('n’envoie le prénom que quand il y en a un', async () => {
    const { f, appels } = fauxFetch([{ statut: 200, body: SESSION_NOUVELLE }]);
    const client = new IdentityClient({ base: 'https://api.jp.mg', fetch: f });

    await client.verifyCode({ email: 'hanta.r@gmail.com', code: '482153' });
    expect(appels[0]?.body).toEqual({
      email: 'hanta.r@gmail.com',
      code: '482153',
      langue: 'fr',
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// F0.1 · data-saver header — the opt-in signal
// ─────────────────────────────────────────────────────────────────────────────

describe('IdentityClient — data-saver header', () => {
  it('when dataSaver:true, sends X-Data-Saver:1 on requestCode', async () => {
    const { f, appels } = fauxFetch([{ statut: 202, body: { ok: true, expiresInS: 600 } }]);
    const client = new IdentityClient({
      base: 'https://api.jp.mg',
      fetch: f,
      newKey: () => 'k',
      dataSaver: true,
    });

    await client.requestCode('hanta.r@gmail.com');

    expect(appels[0]?.headers['X-Data-Saver']).toBe('1');
  });

  it('when dataSaver:false, the header is ABSENT (not `0`, not empty)', async () => {
    // The absence itself is the signal — a server that reads any header
    // presence as "enable" would be tricked by `X-Data-Saver: 0`. We assert
    // the property does not exist on the sent headers.
    const { f, appels } = fauxFetch([{ statut: 202, body: { ok: true, expiresInS: 600 } }]);
    const client = new IdentityClient({
      base: 'https://api.jp.mg',
      fetch: f,
      newKey: () => 'k',
      dataSaver: false,
    });

    await client.requestCode('hanta.r@gmail.com');

    expect(appels[0]?.headers).not.toHaveProperty('X-Data-Saver');
  });

  it('when dataSaver is omitted, the header is ABSENT (default is off)', async () => {
    // The other tests in this file don't pass `dataSaver` and would break
    // if the default were `true`. This test locks that default explicitly.
    const { f, appels } = fauxFetch([{ statut: 202, body: { ok: true, expiresInS: 600 } }]);
    const client = new IdentityClient({ base: 'https://api.jp.mg', fetch: f, newKey: () => 'k' });

    await client.requestCode('hanta.r@gmail.com');

    expect(appels[0]?.headers).not.toHaveProperty('X-Data-Saver');
  });

  it('the header applies to verifyCode too (it lives in the shared post())', async () => {
    // Proves the option is set at the client level, not per-method. If a
    // future refactor split post() into two, this test would break — which
    // is what we want, because splitting would need to preserve the parity.
    const { f, appels } = fauxFetch([{ statut: 200, body: SESSION_NOUVELLE }]);
    const client = new IdentityClient({
      base: 'https://api.jp.mg',
      fetch: f,
      newKey: () => 'k',
      dataSaver: true,
    });

    await client.verifyCode({ email: 'hanta.r@gmail.com', code: '482153' });

    expect(appels[0]?.headers['X-Data-Saver']).toBe('1');
  });
});
