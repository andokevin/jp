/**
 * Univers — codes d'erreur stables
 *
 * Jamais de message générique : un refus sans motif est un défaut.
 */
export const ERREURS = {
  // Fermé et inconnu donnent le MÊME code : on ne révèle pas qu'un univers
  // existe avant son ouverture.
  UNIVERS_INCONNU: 'error.not_found',
  LIVRAISON_HORS_UNIVERS: 'error.invalid_request',
  MOTIF_HORS_UNIVERS: 'error.invalid_request',
  CHAMPS_MANQUANTS: 'error.invalid_request',
  // L'univers d'un article ne change jamais (R-Y1).
  UNIVERS_IMMUABLE: 'error.conflict',
} as const satisfies Record<string, string>;

export type CodeErreur = keyof typeof ERREURS;
