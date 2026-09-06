/**
 * S8 — la coquille mobile
 *
 * Deux tests portent tout : la clé d'idempotence posée automatiquement, et la
 * file hors ligne qui rejoue dans l'ordre avec la clé du GESTE.
 */
import { describe, expect, it } from 'vitest';
import {
  analyserLien,
  ClientApi,
  CONSULTABLE_HORS_LIGNE,
  FileEcritures,
  HorsLigne,
  LIENS_PROFONDS,
  MagasinMemoire,
  ONGLETS,
  resoudreUnivers,
  imposerUnivers,
  estPremiereVisite,
  marquerVu,
  ouvrirSession,
  etatSession,
  fermerSession,
  verifierTailleSecret,
} from './index.js';

function fauxFetch(reponses: (() => Promise<Response>)[]) {
  const appels: { url: string; init: RequestInit }[] = [];
  let i = 0;
  const f = (async (url: string, init: RequestInit) => {
    appels.push({ url, init });
    const suivante = reponses[Math.min(i++, reponses.length - 1)]!;
    return suivante();
  }) as unknown as typeof fetch;
  return { f, appels };
}

const ok =
  (corps: unknown = { ok: true }) =>
  async () =>
    new Response(JSON.stringify(corps), { status: 200 });
const reseauCoupe = () => async () => {
  throw new TypeError('Failed to fetch');
};

describe('S8.3 — la clé d’idempotence, posée automatiquement', () => {
  it('pose la clé sur une ÉCRITURE', async () => {
    // Un écran qui l'oublierait ouvrirait un trou dans RB10, et ça ne se
    // verrait qu'en production sur un double prélèvement.
    const { f, appels } = fauxFetch([ok()]);
    const c = new ClientApi({ base: 'https://api.jp.mg', fetch: f });
    await c.ecrire('/commandes', { article: 'a1' });

    const enTetes = appels[0]!.init.headers as Record<string, string>;
    expect(enTetes['Idempotency-Key']).toBeTruthy();
  });

  it('n’en pose PAS sur une lecture', async () => {
    const { f, appels } = fauxFetch([ok()]);
    const c = new ClientApi({ base: 'https://api.jp.mg', fetch: f });
    await c.lire('/articles');
    expect((appels[0]!.init.headers as Record<string, string>)['Idempotency-Key']).toBeUndefined();
  });

  it('réutilise la clé fournie — c’est ce qui rend un rejeu sûr', async () => {
    const { f, appels } = fauxFetch([ok(), ok()]);
    const c = new ClientApi({ base: 'https://api.jp.mg', fetch: f });
    await c.ecrire('/commandes', { a: 1 }, 'cle-du-geste');
    await c.ecrire('/commandes', { a: 1 }, 'cle-du-geste');
    const cles = appels.map((a) => (a.init.headers as Record<string, string>)['Idempotency-Key']);
    expect(cles[0]).toBe('cle-du-geste');
    expect(cles[1]).toBe('cle-du-geste'); // le serveur reconnaîtra le rejeu
  });

  it('distingue le HORS LIGNE d’une panne serveur', async () => {
    // `fetch` ne lève que sur un problème réseau ; une 500 est une réponse.
    const { f } = fauxFetch([reseauCoupe()]);
    const c = new ClientApi({ base: 'https://api.jp.mg', fetch: f });
    await expect(c.lire('/x')).rejects.toBeInstanceOf(HorsLigne);
  });

  it('remonte l’enveloppe d’erreur SANS la retraduire', async () => {
    // Le message est déjà traduit par le serveur ; le refaire ici
    // dupliquerait les catalogues.
    const { f } = fauxFetch([
      async () =>
        new Response(JSON.stringify({ code: 'STOCK_INSUFFISANT', message: 'Plus de stock.' }), {
          status: 409,
        }),
    ]);
    const c = new ClientApi({ base: 'https://api.jp.mg', fetch: f });
    await expect(c.ecrire('/x', {})).rejects.toMatchObject({ code: 'STOCK_INSUFFISANT' });
  });

  it('transmet la langue et le mode économie de données', async () => {
    const { f, appels } = fauxFetch([ok()]);
    const c = new ClientApi({
      base: 'https://api.jp.mg',
      fetch: f,
      langue: 'en',
      economieDonnees: true,
    });
    await c.lire('/x');
    const h = appels[0]!.init.headers as Record<string, string>;
    expect(h['Accept-Language']).toBe('en');
    expect(h['X-Economie-Donnees']).toBe('1');
  });

  it('appelle `fetch` avec le bon `this` — sinon tout ressemble à une coupure', () => {
    // Le seul chemin que les autres tests n'exercent JAMAIS : ils injectent
    // tous un faux `fetch`, si bien que le `?? globalThis.fetch` du
    // constructeur n'était couvert par rien.
    //
    // Rangé dans un champ puis appelé en `this.f(…)`, le `fetch` d'un
    // navigateur reçoit l'instance comme `this` et lève « Illegal
    // invocation ». Hermes ne s'en émeut pas — c'est un polyfill JS — mais
    // Expo Web, si. Et comme l'échec est un `TypeError`, le `catch` du client
    // le prendrait pour une panne réseau : « pas de connexion » affiché à
    // quelqu'un de connecté, sur chaque requête.
    //
    // Ce faux `fetch` refuse le mauvais `this`, exactement comme le fait un
    // navigateur.
    const vrai = globalThis.fetch;
    let appeleCorrectement = false;
    globalThis.fetch = function (this: unknown) {
      if (this !== globalThis) throw new TypeError('Illegal invocation');
      appeleCorrectement = true;
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
    } as unknown as typeof fetch;

    try {
      const c = new ClientApi({ base: 'https://api.jp.mg' });
      return c.lire('/x').then(() => {
        expect(appeleCorrectement).toBe(true);
      });
    } finally {
      globalThis.fetch = vrai;
    }
  });
});

describe('S8.4 — la file hors ligne', () => {
  it('fabrique la clé au moment du GESTE, pas de l’envoi', async () => {
    // Une clé fabriquée à l'envoi changerait à chaque tentative, et le
    // serveur verrait autant de requêtes différentes.
    const file = new FileEcritures(new MagasinMemoire());
    const e = await file.empiler({ methode: 'POST', chemin: '/commandes', corps: { a: 1 } });
    expect(e.cleIdempotence).toBeTruthy();
    const [gardee] = await file.enAttente();
    expect(gardee!.cleIdempotence).toBe(e.cleIdempotence);
  });

  it('rejoue DANS L’ORDRE', async () => {
    // Une confirmation de réception rejouée avant la commande qu'elle
    // confirme produirait un état incohérent.
    const file = new FileEcritures(new MagasinMemoire());
    for (const n of [1, 2, 3]) {
      await file.empiler({ methode: 'POST', chemin: `/e/${n}`, corps: { n } });
    }
    const vus: string[] = [];
    const r = await file.rejouer(async (e) => {
      vus.push(e.chemin);
    });
    expect(vus).toEqual(['/e/1', '/e/2', '/e/3']);
    expect(r).toEqual({ envoyees: 3, restantes: 0 });
  });

  it('S’ARRÊTE si le réseau est encore coupé, sans perdre la suite', async () => {
    const file = new FileEcritures(new MagasinMemoire());
    for (const n of [1, 2, 3]) {
      await file.empiler({ methode: 'POST', chemin: `/e/${n}`, corps: { n } });
    }
    let envoyees = 0;
    const r = await file.rejouer(async () => {
      if (envoyees >= 1) throw new HorsLigne();
      envoyees++;
    });
    expect(r.envoyees).toBe(1);
    expect(r.restantes).toBe(2); // les deux suivantes attendent leur tour
    expect((await file.enAttente()).map((e) => e.chemin)).toEqual(['/e/2', '/e/3']);
  });

  it('retire une écriture rejetée pour une raison MÉTIER', async () => {
    // Elle ne se réparera pas en réessayant, et bloquerait la file derrière.
    const file = new FileEcritures(new MagasinMemoire());
    await file.empiler({ methode: 'POST', chemin: '/refusee', corps: {} });
    await file.empiler({ methode: 'POST', chemin: '/ok', corps: {} });
    const vus: string[] = [];
    const r = await file.rejouer(async (e) => {
      if (e.chemin === '/refusee') throw { code: 'STOCK_INSUFFISANT' };
      vus.push(e.chemin);
    });
    expect(vus).toEqual(['/ok']);
    expect(r.restantes).toBe(0);
  });

  it('le code de retrait fait partie de ce qui reste consultable', () => {
    // Une acheteuse au point relais sans réseau et sans son code repart
    // sans son colis — et elle a payé (F13.5).
    expect(CONSULTABLE_HORS_LIGNE).toContain('le code de retrait');
  });
});

describe('S8.1 — navigation et liens profonds', () => {
  it('reconnaît chaque lien et en extrait le paramètre', () => {
    expect(analyserLien('jp://vendeur/miora')).toEqual({ cible: 'vitrine', parametre: 'miora' });
    expect(analyserLien('jp://article/abc-123')).toEqual({
      cible: 'article',
      parametre: 'abc-123',
    });
    expect(analyserLien('jp://cadeau/xyz')).toEqual({ cible: 'cadeau', parametre: 'xyz' });
  });

  it('ignore les paramètres de suivi collés au lien', () => {
    expect(analyserLien('jp://vendeur/miora?utm=whatsapp')).toEqual({
      cible: 'vitrine',
      parametre: 'miora',
    });
  });

  it('rend null sur un lien inconnu ou vide', () => {
    expect(analyserLien('jp://inconnu/x')).toBeNull();
    expect(analyserLien('jp://vendeur/')).toBeNull();
    expect(analyserLien('https://jp.mg')).toBeNull();
  });

  it('déclare les cinq onglets et les cinq liens', () => {
    expect(ONGLETS).toHaveLength(5);
    expect(Object.keys(LIENS_PROFONDS)).toHaveLength(5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// S8.2 et S8.4 — le stockage sur l'appareil
//
// `expo-secure-store` et `AsyncStorage` n'existent pas hors d'un appareil : on
// les remplace par des magasins en mémoire qui respectent le même contrat, y
// compris la limite de 2 048 octets du trousseau.
// ═══════════════════════════════════════════════════════════════════════════

function magasinFactice() {
  const contenu = new Map<string, string>();
  return {
    contenu,
    lire: async (c: string) => contenu.get(c) ?? null,
    ecrire: async (c: string, v: string) => void contenu.set(c, v),
    effacer: async (c: string) => void contenu.delete(c),
  };
}

describe('S8.4 — l’univers courant sur l’appareil', () => {
  const deux = [
    { cle: 'mode', onglet: 'Mode' },
    { cle: 'beaute', onglet: 'Beauté' },
  ];

  it('sans rien de mémorisé, prend le premier ouvert', async () => {
    const m = magasinFactice();
    const r = await resoudreUnivers(deux, m);
    expect(r).toEqual({ cle: 'mode', change: false });
    expect(await m.lire('jp.univers.courant')).toBe('mode');
  });

  it('respecte l’univers mémorisé', async () => {
    const m = magasinFactice();
    await m.ecrire('jp.univers.courant', 'beaute');
    expect(await resoudreUnivers(deux, m)).toEqual({ cle: 'beaute', change: false });
  });

  it('BASCULE ET LE SIGNALE si l’univers mémorisé a été fermé', async () => {
    // Basculer en silence serait déroutant : la personne ouvrirait l'app sur
    // un autre univers sans comprendre pourquoi.
    const m = magasinFactice();
    await m.ecrire('jp.univers.courant', 'tech'); // fermé entre-temps
    const r = await resoudreUnivers(deux, m);
    expect(r).toEqual({ cle: 'mode', change: true, ancien: 'tech' });
  });

  it('refuse de démarrer sans aucun univers ouvert', async () => {
    // C'est une erreur de déploiement, pas un cas d'usage.
    await expect(resoudreUnivers([], magasinFactice())).rejects.toThrow();
  });

  it('un lien profond impose son univers et dit s’il a changé', async () => {
    const m = magasinFactice();
    await m.ecrire('jp.univers.courant', 'mode');
    expect(await imposerUnivers('beaute', m)).toBe(true); // l'écran doit recharger
    expect(await imposerUnivers('beaute', m)).toBe(false); // déjà dessus
  });

  it('la signature ne s’affiche qu’à la première visite', async () => {
    const m = magasinFactice();
    expect(await estPremiereVisite('beaute', m)).toBe(true);
    await marquerVu('beaute', m);
    expect(await estPremiereVisite('beaute', m)).toBe(false);
    expect(await estPremiereVisite('mode', m)).toBe(true); // l'autre reste neuf
  });
});

describe('S8.2 — la session dans le trousseau', () => {
  it('distingue « aucune », « périmée » et « ouverte »', async () => {
    // Trois situations différentes, qui ne se racontent pas pareil.
    const m = magasinFactice();
    expect(await etatSession(m)).toEqual({ quoi: 'aucune' });

    await ouvrirSession('jeton-abc', Date.now() - 1000, m);
    expect(await etatSession(m)).toEqual({ quoi: 'perimee' });

    const dans1h = Date.now() + 3_600_000;
    await ouvrirSession('jeton-abc', dans1h, m);
    expect(await etatSession(m)).toEqual({ quoi: 'ouverte', jeton: 'jeton-abc', expireLe: dans1h });
  });

  it('traite une échéance illisible comme périmée', async () => {
    // On redemande un code plutôt que de partir avec un jeton dont on ne sait
    // rien.
    const m = magasinFactice();
    await m.ecrire('jp.session.jeton', 'abc');
    await m.ecrire('jp.session.expire', 'pas-un-nombre');
    expect(await etatSession(m)).toEqual({ quoi: 'perimee' });
  });

  it('fermer efface le jeton SANS dépendre du réseau', async () => {
    // Quelqu'un qui se déconnecte dans un cybercafé ne doit pas dépendre du
    // réseau pour que son jeton disparaisse de l'appareil.
    const m = magasinFactice();
    await ouvrirSession('abc', Date.now() + 3_600_000, m);
    await fermerSession(m);
    expect(await m.lire('jp.session.jeton')).toBeNull();
    expect(await etatSession(m)).toEqual({ quoi: 'aucune' });
  });

  it('refuse d’écrire un CACHE dans le trousseau', async () => {
    // Le trousseau est limité à 2 048 octets. La contrainte impose le bon
    // usage : ce qui ne tient pas dedans n'est pas un secret.
    expect(() => verifierTailleSecret('x'.repeat(3000))).toThrow(/trousseau/i);
    expect(() => verifierTailleSecret('jeton-court')).not.toThrow();
  });
});
