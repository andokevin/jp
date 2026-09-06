/**
 * F0.1 — le client HTTP d'identité
 *
 * Les règles du parcours vivent dans `@jp/identite` et y sont testées. Il ne
 * reste ici que la seule chose qui soit vraiment web : le client `fetch`, avec
 * ses en-têtes, sa clé d'idempotence et sa distinction entre une coupure
 * réseau et un refus du serveur.
 *
 * Ce fichier portait aussi un test de `etatDepuis` — mot pour mot celui de
 * `packages/ui/src/index.test.ts:201`. Un doublon, et un doublon qui ne
 * prouvait rien d'ici : aucun écran de ce dossier n'appelle `etatDepuis`. La
 * règle « hors ligne AVANT erreur » est vérifiée deux fois désormais, à ses
 * deux vraies adresses — dans `@jp/ui` pour l'état d'écran, dans
 * `@jp/identite` pour le réducteur.
 */
import { describe, expect, it } from 'vitest';

import { ClientIdentite, HorsLigne } from './api/identiteApi.js';

// ── Un faux `fetch`, injecté plutôt que simulé ───────────────────────────────
function fauxFetch(reponses: readonly { statut: number; corps: unknown }[]) {
  const appels: { url: string; enTetes: Record<string, string>; corps: unknown }[] = [];
  let i = 0;
  const f = (async (url: string | URL, init?: RequestInit) => {
    appels.push({
      url: String(url),
      enTetes: (init?.headers ?? {}) as Record<string, string>,
      corps: JSON.parse(String(init?.body ?? 'null')),
    });
    const r = reponses[Math.min(i++, reponses.length - 1)] as { statut: number; corps: unknown };
    return {
      ok: r.statut >= 200 && r.statut < 300,
      status: r.statut,
      json: async () => r.corps,
    } as Response;
  }) as unknown as typeof fetch;
  return { f, appels };
}

const SESSION_NOUVELLE = {
  jeton: 'sess_9f2c',
  expireLe: 1_800_000_000_000,
  utilisateur: {
    id: '0b8f4c1e-7c3a-4b1d-9f61-2a5e8c7d0a11',
    email: 'hanta.r@gmail.com',
    prenom: null,
    hasPassword: false,
    isNew: true,
  },
};

describe('F0.1 — le client d’identité', () => {
  it('annonce la langue et pose une clé d’idempotence', async () => {
    const { f, appels } = fauxFetch([{ statut: 202, corps: { ok: true, expireDansS: 600 } }]);
    const client = new ClientIdentite({
      base: 'https://api.jp.mg',
      langue: 'mg',
      fetch: f,
      nouvelleCle: () => 'cle-fixe',
    });

    const r = await client.demanderCode('hanta.r@gmail.com');

    expect(r.expireDansS).toBe(600);
    const appel = appels[0] as (typeof appels)[number];
    expect(appel.url).toBe('https://api.jp.mg/identite/otp/emettre');
    // Le serveur traduit lui-même ses messages : c'est cet en-tête, et lui
    // seul, qui fait revenir les erreurs en malgache.
    expect(appel.enTetes['Accept-Language']).toBe('mg');
    expect(appel.enTetes['Idempotency-Key']).toBe('cle-fixe');
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
        json: async () => ({ ok: true, expireDansS: 600 }),
      } as Response);
    } as unknown as typeof fetch;

    try {
      const client = new ClientIdentite({ base: 'https://api.jp.mg' });
      await expect(client.demanderCode('hanta.r@gmail.com')).resolves.toMatchObject({ ok: true });
      expect(appeleCorrectement).toBe(true);
    } finally {
      globalThis.fetch = vrai;
    }
  });

  it('DISTINGUE une coupure réseau d’un refus du serveur', async () => {
    const coupe = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    const client = new ClientIdentite({ base: 'https://api.jp.mg', fetch: coupe });

    await expect(client.demanderCode('hanta.r@gmail.com')).rejects.toBeInstanceOf(HorsLigne);
  });

  it('remonte l’enveloppe d’erreur telle quelle, déjà traduite', async () => {
    const { f } = fauxFetch([
      { statut: 400, corps: { code: 'OTP_INVALIDE', message: 'Diso ny kaody.' } },
    ]);
    const client = new ClientIdentite({ base: 'https://api.jp.mg', langue: 'mg', fetch: f });

    await expect(
      client.verifierCode({ email: 'hanta.r@gmail.com', code: '482153' }),
    ).rejects.toMatchObject({ code: 'OTP_INVALIDE' });
  });

  it('n’envoie le prénom que quand il y en a un', async () => {
    const { f, appels } = fauxFetch([{ statut: 200, corps: SESSION_NOUVELLE }]);
    const client = new ClientIdentite({ base: 'https://api.jp.mg', fetch: f });

    await client.verifierCode({ email: 'hanta.r@gmail.com', code: '482153' });
    expect(appels[0]?.corps).toEqual({
      email: 'hanta.r@gmail.com',
      code: '482153',
      langue: 'fr',
    });
  });
});
