/**
 * Les quatre états, rendus impossibles à oublier
 *
 * Un écran qui n’a pas ses quatre états n’est pas fini. Le rendre
 * structurel coûte moins cher que de le rappeler en revue 266 fois.
 */

export const ETATS = ['chargement', 'vide', 'erreur', 'hors-ligne'] as const;

export type Etat = (typeof ETATS)[number];
