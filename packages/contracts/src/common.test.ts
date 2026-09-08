import { describe, expect, it } from 'vitest';
import {
  idempotencyKeySchema,
  decodeCursor,
  emailSchema,
  encodeCursor,
  errorSchema,
  languageSchema,
  paginationSchema,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  phoneSchema,
} from './common.js';

describe('pagination par curseur', () => {
  it('applique une taille par défaut et un plafond', () => {
    expect(paginationSchema.parse({}).taille).toBe(DEFAULT_PAGE_SIZE);
    expect(paginationSchema.parse({ taille: '5' }).taille).toBe(5); // coerce depuis l'URL
    expect(paginationSchema.safeParse({ taille: 500 }).success).toBe(false);
    expect(paginationSchema.safeParse({ taille: 0 }).success).toBe(false);
  });

  it('plafonne bas — réseau lent et Android d’entrée de gamme', () => {
    expect(MAX_PAGE_SIZE).toBeLessThanOrEqual(50);
  });

  it('fait l’aller-retour sur un curseur', () => {
    const position = { creeLe: '2026-08-19T10:00:00.000Z', id: 'abc' };
    expect(decodeCursor(encodeCursor(position))).toEqual(position);
  });

  it('produit un curseur sûr dans une URL', () => {
    const c = encodeCursor({ id: 'a/b+c=d', n: 12 });
    expect(c).not.toMatch(/[+/=]/); // base64url, pas base64
    expect(encodeURIComponent(c)).toBe(c);
  });

  it('rend null sur un curseur trafiqué, jamais une exception', () => {
    // Un curseur périmé ou bricolé doit ramener la première page, pas une 500.
    for (const mauvais of ['', 'pas-du-base64!!', 'W10=', encodeCursor({}).slice(0, 3)]) {
      expect(() => decodeCursor(mauvais)).not.toThrow();
    }
    expect(decodeCursor('W10')).toBeNull(); // un tableau n'est pas une position
  });
});

describe('enveloppe d’erreur', () => {
  it('exige un code en MAJUSCULES', () => {
    expect(errorSchema.safeParse({ code: 'STOCK_INSUFFISANT', message: 'x' }).success).toBe(true);
    expect(errorSchema.safeParse({ code: 'stock_insuffisant', message: 'x' }).success).toBe(false);
    expect(errorSchema.safeParse({ code: 'Stock', message: 'x' }).success).toBe(false);
  });

  it('refuse un message vide', () => {
    // Un refus sans motif est un défaut, pas une simplification.
    expect(errorSchema.safeParse({ code: 'X', message: '' }).success).toBe(false);
  });

  it('accepte le détail par champ et l’action possible', () => {
    const e = errorSchema.parse({
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
    expect(phoneSchema.safeParse('+261341234567').success).toBe(true);
    expect(phoneSchema.safeParse('+261201234567').success).toBe(true);
    expect(phoneSchema.safeParse('0341234567').success).toBe(false);
    expect(phoneSchema.safeParse('+33612345678').success).toBe(false);
  });

  it('exige une clé d’idempotence assez longue pour être unique', () => {
    expect(idempotencyKeySchema.safeParse('trop-court').success).toBe(false);
    expect(idempotencyKeySchema.safeParse(crypto.randomUUID()).success).toBe(true);
  });
});

describe('langue', () => {
  it('n’accepte que les langues de @jp/i18n', () => {
    // Le schéma est construit DEPUIS la liste d'i18n : ajouter une langue
    // là-bas la rend valide ici, sans rien toucher.
    expect(languageSchema.safeParse('fr').success).toBe(true);
    expect(languageSchema.safeParse('en').success).toBe(true);
    expect(languageSchema.safeParse('mg').success).toBe(true);
    expect(languageSchema.safeParse('pt').success).toBe(false);
  });
});
