import { describe, expect, it } from 'vitest';
import {
  cleIdempotenceSchema,
  decoderCurseur,
  emailSchema,
  encoderCurseur,
  erreurSchema,
  langueSchema,
  paginationSchema,
  TAILLE_PAGE_DEFAUT,
  TAILLE_PAGE_MAX,
  telephoneSchema,
} from './commun.js';

describe('pagination par curseur', () => {
  it('applique une taille par défaut et un plafond', () => {
    expect(paginationSchema.parse({}).taille).toBe(TAILLE_PAGE_DEFAUT);
    expect(paginationSchema.parse({ taille: '5' }).taille).toBe(5); // coerce depuis l'URL
    expect(paginationSchema.safeParse({ taille: 500 }).success).toBe(false);
    expect(paginationSchema.safeParse({ taille: 0 }).success).toBe(false);
  });

  it('plafonne bas — réseau lent et Android d’entrée de gamme', () => {
    expect(TAILLE_PAGE_MAX).toBeLessThanOrEqual(50);
  });

  it('fait l’aller-retour sur un curseur', () => {
    const position = { creeLe: '2026-08-19T10:00:00.000Z', id: 'abc' };
    expect(decoderCurseur(encoderCurseur(position))).toEqual(position);
  });

  it('produit un curseur sûr dans une URL', () => {
    const c = encoderCurseur({ id: 'a/b+c=d', n: 12 });
    expect(c).not.toMatch(/[+/=]/); // base64url, pas base64
    expect(encodeURIComponent(c)).toBe(c);
  });

  it('rend null sur un curseur trafiqué, jamais une exception', () => {
    // Un curseur périmé ou bricolé doit ramener la première page, pas une 500.
    for (const mauvais of ['', 'pas-du-base64!!', 'W10=', encoderCurseur({}).slice(0, 3)]) {
      expect(() => decoderCurseur(mauvais)).not.toThrow();
    }
    expect(decoderCurseur('W10')).toBeNull(); // un tableau n'est pas une position
  });
});

describe('enveloppe d’erreur', () => {
  it('exige un code en MAJUSCULES', () => {
    expect(erreurSchema.safeParse({ code: 'STOCK_INSUFFISANT', message: 'x' }).success).toBe(true);
    expect(erreurSchema.safeParse({ code: 'stock_insuffisant', message: 'x' }).success).toBe(false);
    expect(erreurSchema.safeParse({ code: 'Stock', message: 'x' }).success).toBe(false);
  });

  it('refuse un message vide', () => {
    // Un refus sans motif est un défaut, pas une simplification.
    expect(erreurSchema.safeParse({ code: 'X', message: '' }).success).toBe(false);
  });

  it('accepte le détail par champ et l’action possible', () => {
    const e = erreurSchema.parse({
      code: 'REQUETE_INVALIDE',
      message: 'Une information manque.',
      action: 'Vérifiez la quantité.',
      champs: { quantite: 'Doit être au moins 1.' },
    });
    expect(e.champs?.quantite).toContain('1');
  });
});

describe('identifiants', () => {
  it('normalise une adresse électronique', () => {
    expect(emailSchema.parse('  Miora@JP.MG ')).toBe('miora@jp.mg');
    expect(emailSchema.safeParse('pas-une-adresse').success).toBe(false);
    expect(emailSchema.safeParse('a@b.mg' + 'x'.repeat(250)).success).toBe(false);
  });

  it('accepte un numéro malgache au format international', () => {
    expect(telephoneSchema.safeParse('+261341234567').success).toBe(true);
    expect(telephoneSchema.safeParse('+261201234567').success).toBe(true);
    expect(telephoneSchema.safeParse('0341234567').success).toBe(false);
    expect(telephoneSchema.safeParse('+33612345678').success).toBe(false);
  });

  it('exige une clé d’idempotence assez longue pour être unique', () => {
    expect(cleIdempotenceSchema.safeParse('trop-court').success).toBe(false);
    expect(cleIdempotenceSchema.safeParse(crypto.randomUUID()).success).toBe(true);
  });
});

describe('langue', () => {
  it('n’accepte que les langues de @jp/i18n', () => {
    // Le schéma est construit DEPUIS la liste d'i18n : ajouter une langue
    // là-bas la rend valide ici, sans rien toucher.
    expect(langueSchema.safeParse('fr').success).toBe(true);
    expect(langueSchema.safeParse('en').success).toBe(true);
    expect(langueSchema.safeParse('mg').success).toBe(true);
    expect(langueSchema.safeParse('pt').success).toBe(false);
  });
});
