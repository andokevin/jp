import { describe, expect, it } from 'vitest';
import {
  add,
  ariary,
  clamp,
  commissionOn,
  fromJSON,
  fromText,
  format,
  formatBare,
  formatRate,
  max,
  min,
  InvalidAmount,
  multiply,
  sellerNet,
  perMille,
  discountOn,
  distribute,
  distributeEqually,
  subtract,
  ZERO,
} from './index.js';

describe('ariary — la frontière', () => {
  it('accepte un entier', () => {
    expect(ariary(50_000)).toBe(50_000);
    expect(ariary(0)).toBe(0);
    expect(ariary(-1_500)).toBe(-1_500);
  });

  it('refuse un flottant, sans arrondir en silence', () => {
    expect(() => ariary(1_500.5)).toThrow(InvalidAmount);
    expect(() => ariary(0.1)).toThrow(InvalidAmount);
  });

  it('refuse NaN et l’infini', () => {
    expect(() => ariary(Number.NaN)).toThrow(InvalidAmount);
    expect(() => ariary(Number.POSITIVE_INFINITY)).toThrow(InvalidAmount);
  });

  it('refuse au-delà des entiers sûrs', () => {
    expect(() => ariary(Number.MAX_SAFE_INTEGER + 2)).toThrow(InvalidAmount);
  });
});

describe('fromText — ce que les gens tapent', () => {
  it.each([
    ['50000', 50_000],
    ['50 000', 50_000],
    ['50 000 Ar', 50_000],
    ['50.000', 50_000],
    ['50,000', 50_000],
    ['1.234.567', 1_234_567],
    ['1 250 000 ar', 1_250_000],
    ['50 000', 50_000], // espace fine insécable, telle que format() la produit
  ])('lit « %s »', (saisie, attendu) => {
    expect(fromText(saisie)).toBe(attendu);
  });

  it('distingue le séparateur de milliers du séparateur décimal', () => {
    // Un séparateur de milliers est suivi d'exactement trois chiffres.
    expect(fromText('50.000')).toBe(50_000);
    expect(() => fromText('1500,50')).toThrow(InvalidAmount);
    expect(() => fromText('1500.75')).toThrow(InvalidAmount);
    expect(() => fromText('12.34')).toThrow(InvalidAmount);
  });

  it('fait l’aller-retour avec format()', () => {
    for (const m of [0, 999, 50_000, 1_250_000]) {
      expect(fromText(format(ariary(m)))).toBe(m);
    }
  });

  it('refuse le vide et l’illisible', () => {
    expect(() => fromText('')).toThrow(InvalidAmount);
    expect(() => fromText('  ')).toThrow(InvalidAmount);
    expect(() => fromText('gratuit')).toThrow(InvalidAmount);
  });
});

describe('arithmétique', () => {
  it('additionne et soustrait', () => {
    expect(add(ariary(1_000), ariary(2_500), ariary(500))).toBe(4_000);
    expect(add()).toBe(0);
    expect(subtract(ariary(5_000), ariary(1_200))).toBe(3_800);
  });

  it('multiplie par une quantité, pas par un taux', () => {
    expect(multiply(ariary(12_500), 3)).toBe(37_500);
    expect(multiply(ariary(12_500), 0)).toBe(0);
    expect(() => multiply(ariary(100), 1.5)).toThrow(InvalidAmount);
    expect(() => multiply(ariary(100), -1)).toThrow(InvalidAmount);
  });

  it('compare et borne', () => {
    expect(min(ariary(300), ariary(500))).toBe(300);
    expect(max(ariary(300), ariary(500))).toBe(500);
    expect(clamp(ariary(900), ZERO, ariary(500))).toBe(500);
    expect(clamp(ariary(-50), ZERO, ariary(500))).toBe(0);
  });
});

describe('commission et remise — qui gagne l’ariary contesté', () => {
  it('la commission arrondit vers le bas : l’ariary reste au vendeur', () => {
    // 2,5 % de 10 001 = 250,025
    expect(commissionOn(ariary(10_001), perMille(25))).toBe(250);
    expect(commissionOn(ariary(1), perMille(25))).toBe(0);
    expect(commissionOn(ariary(40), perMille(25))).toBe(1);
  });

  it('la remise arrondit vers le haut : l’ariary va à l’acheteuse', () => {
    // 2,5 % de 10 001 = 250,025
    expect(discountOn(ariary(10_001), perMille(25))).toBe(251);
    expect(discountOn(ariary(1), perMille(25))).toBe(1);
  });

  it('une remise ne rend jamais un prix négatif', () => {
    expect(discountOn(ariary(1_000), perMille(1000))).toBe(1_000);
  });

  it('les deux arrondis vont dans des sens opposés — c’est délibéré', () => {
    const montant = ariary(333);
    const taux = perMille(15);
    expect(commissionOn(montant, taux)).toBe(4); // 4,995 → 4
    expect(discountOn(montant, taux)).toBe(5); //    4,995 → 5
  });

  it('le net vendeur et la commission se recomposent exactement', () => {
    for (const m of [1, 7, 999, 10_000, 123_457, 9_999_999]) {
      const montant = ariary(m);
      const taux = perMille(25);
      expect(add(sellerNet(montant, taux), commissionOn(montant, taux))).toBe(m);
    }
  });

  it('refuse d’appliquer un taux à un montant négatif', () => {
    expect(() => commissionOn(ariary(-100), perMille(25))).toThrow(InvalidAmount);
  });

  it('refuse un taux hors bornes', () => {
    expect(() => perMille(1001)).toThrow(InvalidAmount);
    expect(() => perMille(-1)).toThrow(InvalidAmount);
    expect(() => perMille(2.5)).toThrow(InvalidAmount);
  });
});

describe('distribute — aucun ariary ne disparaît', () => {
  it('répartit à parts égales en conservant la somme', () => {
    expect(distribute(ariary(1_000), [1, 1, 1])).toEqual([334, 333, 333]);
    expect(distribute(ariary(10), [1, 1, 1])).toEqual([4, 3, 3]);
  });

  it('respecte les poids', () => {
    expect(distribute(ariary(100), [70, 30])).toEqual([70, 30]);
    expect(distribute(ariary(1_000), [1, 3])).toEqual([250, 750]);
  });

  it('sert les plus forts restes d’abord, à gauche en cas d’égalité', () => {
    expect(distribute(ariary(7), [1, 1, 1])).toEqual([3, 2, 2]);
  });

  it('accepte un poids nul', () => {
    expect(distribute(ariary(100), [1, 0, 1])).toEqual([50, 0, 50]);
  });

  it('gère les montants négatifs — un remboursement se répartit aussi', () => {
    expect(distribute(ariary(-1_000), [1, 1, 1])).toEqual([-334, -333, -333]);
  });

  it('refuse ce qui n’a pas de sens', () => {
    expect(() => distribute(ariary(100), [])).toThrow(InvalidAmount);
    expect(() => distribute(ariary(100), [0, 0])).toThrow(InvalidAmount);
    expect(() => distribute(ariary(100), [1, -1])).toThrow(InvalidAmount);
    expect(() => distribute(ariary(100), [1.5, 1])).toThrow(InvalidAmount);
  });

  it('conserve la somme — invariant, sur 2 000 cas', () => {
    // Le test qui compte. Sans lui, la perte d'un ariary passe inaperçue
    // jusqu'à la première réconciliation, où elle devient un écart à justifier.
    let verifies = 0;
    for (let montant = 0; montant < 500; montant++) {
      for (const poids of [
        [1, 1],
        [1, 2],
        [1, 1, 1],
        [7, 3],
        [1, 1, 1, 1, 1],
      ]) {
        const parts = distribute(ariary(montant), poids);
        expect(add(...parts)).toBe(montant);
        expect(parts).toHaveLength(poids.length);
        verifies++;
      }
    }
    expect(verifies).toBe(2_500);
  });

  it('distributeEqually délègue et conserve la somme', () => {
    expect(distributeEqually(ariary(100), 3)).toEqual([34, 33, 33]);
    expect(() => distributeEqually(ariary(100), 0)).toThrow(InvalidAmount);
  });
});

describe('format', () => {
  it('sépare les milliers par une espace fine insécable', () => {
    expect(format(ariary(50_000))).toBe('50 000 Ar');
    expect(format(ariary(0))).toBe('0 Ar');
    expect(format(ariary(999))).toBe('999 Ar');
    expect(format(ariary(1_250_000))).toBe('1 250 000 Ar');
  });

  it('utilise le signe moins typographique, pas le trait d’union', () => {
    expect(format(ariary(-1_500))).toBe('−1 500 Ar');
  });

  it('donne le même résultat en anglais et en français', () => {
    // Le séparateur de milliers et l'abréviation « Ar » ne se traduisent pas.
    // Le paramètre de langue existe pour l'avenir, pas pour changer le rendu.
    expect(format(ariary(50_000), 'en')).toBe(format(ariary(50_000), 'fr'));
  });

  it('formatBare omet l’unité', () => {
    expect(formatBare(ariary(50_000))).toBe('50 000');
  });

  it('formate un taux en pour mille comme un pourcentage', () => {
    expect(formatRate(perMille(25))).toBe('2,5 %');
    expect(formatRate(perMille(100))).toBe('10 %');
    expect(formatRate(perMille(0))).toBe('0 %');
    expect(formatRate(perMille(5))).toBe('0,5 %');
  });
});

describe('sérialisation', () => {
  it('transporte un entier, et rien d’autre', () => {
    expect(fromJSON(50_000)).toBe(50_000);
    expect(() => fromJSON('50000')).toThrow(InvalidAmount);
    expect(() => fromJSON(null)).toThrow(InvalidAmount);
    expect(() => fromJSON(1_500.5)).toThrow(InvalidAmount);
    expect(() => fromJSON(undefined)).toThrow(InvalidAmount);
  });

  it('fait un aller-retour sans perte', () => {
    const montant = ariary(1_234_567);
    expect(fromJSON(JSON.parse(JSON.stringify(montant)))).toBe(montant);
  });
});
