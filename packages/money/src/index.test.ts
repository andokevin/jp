import { describe, expect, it } from 'vitest';
import {
  additionner,
  ariary,
  borner,
  commissionSur,
  depuisJSON,
  depuisTexte,
  formater,
  formaterNu,
  formaterTaux,
  maximum,
  minimum,
  MontantInvalide,
  multiplier,
  netVendeur,
  pourMille,
  remiseSur,
  repartir,
  repartirEgalement,
  soustraire,
  ZERO,
} from './index.js';

describe('ariary — la frontière', () => {
  it('accepte un entier', () => {
    expect(ariary(50_000)).toBe(50_000);
    expect(ariary(0)).toBe(0);
    expect(ariary(-1_500)).toBe(-1_500);
  });

  it('refuse un flottant, sans arrondir en silence', () => {
    expect(() => ariary(1_500.5)).toThrow(MontantInvalide);
    expect(() => ariary(0.1)).toThrow(MontantInvalide);
  });

  it('refuse NaN et l’infini', () => {
    expect(() => ariary(Number.NaN)).toThrow(MontantInvalide);
    expect(() => ariary(Number.POSITIVE_INFINITY)).toThrow(MontantInvalide);
  });

  it('refuse au-delà des entiers sûrs', () => {
    expect(() => ariary(Number.MAX_SAFE_INTEGER + 2)).toThrow(MontantInvalide);
  });
});

describe('depuisTexte — ce que les gens tapent', () => {
  it.each([
    ['50000', 50_000],
    ['50 000', 50_000],
    ['50 000 Ar', 50_000],
    ['50.000', 50_000],
    ['50,000', 50_000],
    ['1.234.567', 1_234_567],
    ['1 250 000 ar', 1_250_000],
    ['50 000', 50_000], // espace fine insécable, telle que formater() la produit
  ])('lit « %s »', (saisie, attendu) => {
    expect(depuisTexte(saisie)).toBe(attendu);
  });

  it('distingue le séparateur de milliers du séparateur décimal', () => {
    // Un séparateur de milliers est suivi d'exactement trois chiffres.
    expect(depuisTexte('50.000')).toBe(50_000);
    expect(() => depuisTexte('1500,50')).toThrow(MontantInvalide);
    expect(() => depuisTexte('1500.75')).toThrow(MontantInvalide);
    expect(() => depuisTexte('12.34')).toThrow(MontantInvalide);
  });

  it('fait l’aller-retour avec formater()', () => {
    for (const m of [0, 999, 50_000, 1_250_000]) {
      expect(depuisTexte(formater(ariary(m)))).toBe(m);
    }
  });

  it('refuse le vide et l’illisible', () => {
    expect(() => depuisTexte('')).toThrow(MontantInvalide);
    expect(() => depuisTexte('  ')).toThrow(MontantInvalide);
    expect(() => depuisTexte('gratuit')).toThrow(MontantInvalide);
  });
});

describe('arithmétique', () => {
  it('additionne et soustrait', () => {
    expect(additionner(ariary(1_000), ariary(2_500), ariary(500))).toBe(4_000);
    expect(additionner()).toBe(0);
    expect(soustraire(ariary(5_000), ariary(1_200))).toBe(3_800);
  });

  it('multiplie par une quantité, pas par un taux', () => {
    expect(multiplier(ariary(12_500), 3)).toBe(37_500);
    expect(multiplier(ariary(12_500), 0)).toBe(0);
    expect(() => multiplier(ariary(100), 1.5)).toThrow(MontantInvalide);
    expect(() => multiplier(ariary(100), -1)).toThrow(MontantInvalide);
  });

  it('compare et borne', () => {
    expect(minimum(ariary(300), ariary(500))).toBe(300);
    expect(maximum(ariary(300), ariary(500))).toBe(500);
    expect(borner(ariary(900), ZERO, ariary(500))).toBe(500);
    expect(borner(ariary(-50), ZERO, ariary(500))).toBe(0);
  });
});

describe('commission et remise — qui gagne l’ariary contesté', () => {
  it('la commission arrondit vers le bas : l’ariary reste au vendeur', () => {
    // 2,5 % de 10 001 = 250,025
    expect(commissionSur(ariary(10_001), pourMille(25))).toBe(250);
    expect(commissionSur(ariary(1), pourMille(25))).toBe(0);
    expect(commissionSur(ariary(40), pourMille(25))).toBe(1);
  });

  it('la remise arrondit vers le haut : l’ariary va à l’acheteuse', () => {
    // 2,5 % de 10 001 = 250,025
    expect(remiseSur(ariary(10_001), pourMille(25))).toBe(251);
    expect(remiseSur(ariary(1), pourMille(25))).toBe(1);
  });

  it('une remise ne rend jamais un prix négatif', () => {
    expect(remiseSur(ariary(1_000), pourMille(1000))).toBe(1_000);
  });

  it('les deux arrondis vont dans des sens opposés — c’est délibéré', () => {
    const montant = ariary(333);
    const taux = pourMille(15);
    expect(commissionSur(montant, taux)).toBe(4); // 4,995 → 4
    expect(remiseSur(montant, taux)).toBe(5); //    4,995 → 5
  });

  it('le net vendeur et la commission se recomposent exactement', () => {
    for (const m of [1, 7, 999, 10_000, 123_457, 9_999_999]) {
      const montant = ariary(m);
      const taux = pourMille(25);
      expect(additionner(netVendeur(montant, taux), commissionSur(montant, taux))).toBe(m);
    }
  });

  it('refuse d’appliquer un taux à un montant négatif', () => {
    expect(() => commissionSur(ariary(-100), pourMille(25))).toThrow(MontantInvalide);
  });

  it('refuse un taux hors bornes', () => {
    expect(() => pourMille(1001)).toThrow(MontantInvalide);
    expect(() => pourMille(-1)).toThrow(MontantInvalide);
    expect(() => pourMille(2.5)).toThrow(MontantInvalide);
  });
});

describe('repartir — aucun ariary ne disparaît', () => {
  it('répartit à parts égales en conservant la somme', () => {
    expect(repartir(ariary(1_000), [1, 1, 1])).toEqual([334, 333, 333]);
    expect(repartir(ariary(10), [1, 1, 1])).toEqual([4, 3, 3]);
  });

  it('respecte les poids', () => {
    expect(repartir(ariary(100), [70, 30])).toEqual([70, 30]);
    expect(repartir(ariary(1_000), [1, 3])).toEqual([250, 750]);
  });

  it('sert les plus forts restes d’abord, à gauche en cas d’égalité', () => {
    expect(repartir(ariary(7), [1, 1, 1])).toEqual([3, 2, 2]);
  });

  it('accepte un poids nul', () => {
    expect(repartir(ariary(100), [1, 0, 1])).toEqual([50, 0, 50]);
  });

  it('gère les montants négatifs — un remboursement se répartit aussi', () => {
    expect(repartir(ariary(-1_000), [1, 1, 1])).toEqual([-334, -333, -333]);
  });

  it('refuse ce qui n’a pas de sens', () => {
    expect(() => repartir(ariary(100), [])).toThrow(MontantInvalide);
    expect(() => repartir(ariary(100), [0, 0])).toThrow(MontantInvalide);
    expect(() => repartir(ariary(100), [1, -1])).toThrow(MontantInvalide);
    expect(() => repartir(ariary(100), [1.5, 1])).toThrow(MontantInvalide);
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
        const parts = repartir(ariary(montant), poids);
        expect(additionner(...parts)).toBe(montant);
        expect(parts).toHaveLength(poids.length);
        verifies++;
      }
    }
    expect(verifies).toBe(2_500);
  });

  it('repartirEgalement délègue et conserve la somme', () => {
    expect(repartirEgalement(ariary(100), 3)).toEqual([34, 33, 33]);
    expect(() => repartirEgalement(ariary(100), 0)).toThrow(MontantInvalide);
  });
});

describe('formater', () => {
  it('sépare les milliers par une espace fine insécable', () => {
    expect(formater(ariary(50_000))).toBe('50 000 Ar');
    expect(formater(ariary(0))).toBe('0 Ar');
    expect(formater(ariary(999))).toBe('999 Ar');
    expect(formater(ariary(1_250_000))).toBe('1 250 000 Ar');
  });

  it('utilise le signe moins typographique, pas le trait d’union', () => {
    expect(formater(ariary(-1_500))).toBe('−1 500 Ar');
  });

  it('donne le même résultat en malgache et en français', () => {
    expect(formater(ariary(50_000), 'mg')).toBe(formater(ariary(50_000), 'fr'));
  });

  it('formaterNu omet l’unité', () => {
    expect(formaterNu(ariary(50_000))).toBe('50 000');
  });

  it('formate un taux en pour mille comme un pourcentage', () => {
    expect(formaterTaux(pourMille(25))).toBe('2,5 %');
    expect(formaterTaux(pourMille(100))).toBe('10 %');
    expect(formaterTaux(pourMille(0))).toBe('0 %');
    expect(formaterTaux(pourMille(5))).toBe('0,5 %');
  });
});

describe('sérialisation', () => {
  it('transporte un entier, et rien d’autre', () => {
    expect(depuisJSON(50_000)).toBe(50_000);
    expect(() => depuisJSON('50000')).toThrow(MontantInvalide);
    expect(() => depuisJSON(null)).toThrow(MontantInvalide);
    expect(() => depuisJSON(1_500.5)).toThrow(MontantInvalide);
    expect(() => depuisJSON(undefined)).toThrow(MontantInvalide);
  });

  it('fait un aller-retour sans perte', () => {
    const montant = ariary(1_234_567);
    expect(depuisJSON(JSON.parse(JSON.stringify(montant)))).toBe(montant);
  });
});
