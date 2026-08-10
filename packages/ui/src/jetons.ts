/**
 * Jetons du design system
 *
 * Cibles tactiles ≥ 48 dp, contraste ≥ 4,5:1 — **vérifiés par un test**,
 * pas par une relecture. Rempli par `S7`.
 */

export const JETONS = {
  cibleTactileMin: 48,
  contrasteMin: 4.5,
  rayon: { petit: 4, moyen: 8, grand: 16 },
  espacement: { xs: 4, s: 8, m: 16, l: 24, xl: 32 },
} as const;
