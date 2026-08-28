/**
 * Univers — codes d'erreur stables
 *
 * Jamais de message générique : un refus sans motif est un défaut.
 */
export const ERREURS = {
  // Fermé et inconnu donnent le MÊME code : on ne révèle pas qu'un univers
  // existe avant son ouverture.
  UNIVERS_INCONNU: 'erreur.introuvable',
  LIVRAISON_HORS_UNIVERS: 'erreur.requete_invalide',
  MOTIF_HORS_UNIVERS: 'erreur.requete_invalide',
  CHAMPS_MANQUANTS: 'erreur.requete_invalide',
  // L'univers d'un article ne change jamais (R-Y1).
  UNIVERS_IMMUABLE: 'erreur.conflit',
} as const satisfies Record<string, string>;

export type CodeErreur = keyof typeof ERREURS;
