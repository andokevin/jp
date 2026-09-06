/**
 * F0.1 — le parcours d'authentification web
 *
 * Ce qui est vérifié ici n'est pas « le composant s'affiche » mais les règles
 * que la maquette et EP00 imposent, et qu'un rendu ne prouverait pas : la
 * distribution d'un code collé, la conservation de ce qui a été tapé, et la
 * préséance du hors ligne sur l'erreur.
 */
import { describe, expect, it } from 'vitest';
import { etatDepuis } from '@jp/ui';

import { ClientIdentite, HorsLigne } from './api/identiteApi.js';
import { casesVides, chiffresDe, codeAssemble, caseSuivante, poser } from './code-otp.js';
import { etatInitial, peutEnvoyer, peutRenvoyer, reduire, type EtatParcours } from './parcours.js';

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

describe('F0.1 — les six cases du code', () => {
  it('COLLE six chiffres dans la première case et remplit les six', () => {
    // L'affordance proprement web : sur un ordinateur, le code se copie depuis
    // la boîte mail. Sans distribution, la personne colle, voit un seul
    // chiffre, et retape tout à la main.
    expect(codeAssemble(poser(casesVides(), 0, '482153'))).toBe('482153');
  });

  it('accepte un collage sale — espaces, préfixe, retour à la ligne', () => {
    expect(chiffresDe('Code : 482 153\n')).toBe('482153');
    expect(codeAssemble(poser(casesVides(), 0, 'Code : 482 153\n'))).toBe('482153');
  });

  it('ne déborde jamais au-delà de six chiffres', () => {
    expect(chiffresDe('4821534821')).toBe('482153');
    // Collé sur l'avant-dernière case, il ne reste que deux places : les
    // chiffres en trop sont abandonnés, pas repliés sur le début.
    expect(codeAssemble(poser(casesVides(), 4, '482153'))).toBe('48');
  });

  it('avance le curseur d’une case à la frappe, jusqu’à la dernière au collage', () => {
    expect(caseSuivante(0, '4')).toBe(1);
    expect(caseSuivante(0, '482153')).toBe(5);
    expect(caseSuivante(5, '3')).toBe(5);
  });
});

describe('F0.1 — ce qui a été tapé n’est jamais perdu', () => {
  const avecCode = (): EtatParcours => {
    let e = reduire(etatInitial(), { type: 'saisirEmail', valeur: 'hanta.r@gmail.com' });
    e = reduire(e, { type: 'codeDemande', expireDansS: 600, maintenant: 0 });
    return reduire(e, { type: 'poserCode', index: 0, texte: '482153' });
  };

  it('GARDE les six chiffres après un code refusé (US-AUTH-02 CA4)', () => {
    const apres = reduire(avecCode(), {
      type: 'echec',
      panne: { code: 'OTP_INVALIDE', message: 'Diso ny kaody. Andramo indray.' },
    });
    expect(codeAssemble(apres.cases)).toBe('482153');
    expect(apres.enCours).toBe(false);
  });

  it('GARDE les six chiffres quand le réseau tombe', () => {
    const apres = reduire(avecCode(), { type: 'coupure' });
    expect(codeAssemble(apres.cases)).toBe('482153');
  });

  it('GARDE l’adresse quand on revient la corriger', () => {
    // « Modifier » sert à réparer une faute de frappe. Vider le champ
    // obligerait à tout retaper pour un caractère.
    const apres = reduire(avecCode(), { type: 'changerEmail' });
    expect(apres.email).toBe('hanta.r@gmail.com');
    expect(apres.etape).toBe('email');
    expect(codeAssemble(apres.cases)).toBe('');
  });
});

describe('F0.1 — hors ligne passe AVANT erreur', () => {
  it('une coupure efface le message d’erreur du serveur', () => {
    // Les deux affichés ensemble se contredisent : « code incorrect » accuse
    // la personne d'une faute alors que la requête n'est jamais partie.
    let e = reduire(etatInitial(), {
      type: 'echec',
      panne: { code: 'OTP_INVALIDE', message: 'Code incorrect. Réessayez.' },
    });
    e = reduire(e, { type: 'coupure' });
    expect(e.horsLigne).toBe(true);
    expect(e.panne).toBeNull();
  });

  it('l’état d’écran suit la préséance du design system', () => {
    // `etatDepuis` de @jp/ui porte déjà la règle « hors ligne AVANT erreur ».
    // La réécrire ici la ferait diverger le jour où elle changerait.
    const etat = etatDepuis({
      enCours: false,
      horsLigne: true,
      erreur: { code: 'OTP_INVALIDE', message: 'Code incorrect.' },
    });
    expect(etat.nom).toBe('hors-ligne');
  });

  it('DÉSACTIVE le bouton hors ligne, même avec une saisie valide', () => {
    let e = reduire(etatInitial(), { type: 'saisirEmail', valeur: 'hanta.r@gmail.com' });
    expect(peutEnvoyer(e)).toBe(true);
    e = reduire(e, { type: 'coupure' });
    expect(peutEnvoyer(e)).toBe(false);
    // …et la valeur reste visible : c'est ce que l'état « hors ligne » exige.
    expect(e.email).toBe('hanta.r@gmail.com');
  });
});

describe('F0.1 — le renvoi de code', () => {
  it('reste fermé une minute, puis s’ouvre', () => {
    // Le serveur n'accepte qu'un code par minute : proposer le renvoi plus tôt
    // ne produirait qu'un 429 et une explication à donner.
    const e = reduire(etatInitial(), { type: 'codeDemande', expireDansS: 600, maintenant: 0 });
    expect(peutRenvoyer(e, 59_000)).toBe(false);
    expect(peutRenvoyer(e, 60_000)).toBe(true);
  });

  it('remet six cases vides — sinon l’ancien code ferait échouer le nouveau', () => {
    let e = reduire(etatInitial(), { type: 'codeDemande', expireDansS: 600, maintenant: 0 });
    e = reduire(e, { type: 'poserCode', index: 0, texte: '111111' });
    e = reduire(e, { type: 'codeDemande', expireDansS: 600, maintenant: 90_000 });
    expect(codeAssemble(e.cases)).toBe('');
  });
});

describe('F0.1 — l’écran prénom ne s’ouvre que pour un compte sans prénom', () => {
  it('un compte tout juste créé passe par le prénom', () => {
    const e = reduire(etatInitial(), { type: 'sessionOuverte', session: SESSION_NOUVELLE });
    expect(e.etape).toBe('prenom');
  });

  it('un retour d’une personne déjà connue va droit au but', () => {
    const connue = {
      ...SESSION_NOUVELLE,
      utilisateur: { ...SESSION_NOUVELLE.utilisateur, prenom: 'Hanta', isNew: false },
    };
    const e = reduire(etatInitial(), { type: 'sessionOuverte', session: connue });
    expect(e.etape).toBe('termine');
  });
});

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
