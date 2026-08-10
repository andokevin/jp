/**
 * Navigation — onglets, piles, liens profonds
 *
 * Les liens profonds portent l’acquisition : une vitrine partagée sur
 * Facebook doit ouvrir la bonne page dans l’application.
 */

export const LIENS_PROFONDS = {
  vitrine: 'jp://vendeur/:slug',
  article: 'jp://article/:id',
  evenement: 'jp://evenement/:slug',
  cadeau: 'jp://cadeau/:jeton',
} as const;
