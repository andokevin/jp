/**
 * Univers — déclaration des routes
 *
 * Validation Zod depuis `@jp/contracts`. **Aucune logique métier ici.**
 */
export const routes = [
  { methode: 'GET', chemin: '/univers', quoi: 'les univers ouverts, triés par rang' },
  { methode: 'GET', chemin: '/univers/:cle', quoi: 'un univers et ses règles' },
  {
    methode: 'GET',
    chemin: '/univers/:cle/regles',
    quoi: 'livraisons, champs, motifs, commission',
  },
  {
    methode: 'PATCH',
    chemin: '/univers/:cle',
    quoi: 'ouvrir, fermer, changer le taux (back-office)',
  },
] as const;
