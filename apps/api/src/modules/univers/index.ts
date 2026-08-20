/**
 * Module univers — JP Mode, JP Beauté, JP Tech, JP Maison, JP Enfant
 *
 * Règles : R-Y1 à R-Y18 · Dépend de : **aucun module**
 *
 * **Un univers n'est pas un filtre de catégorie, c'est un jeu de règles.**
 * Entre une robe et un téléphone, ce qui change n'est pas l'étagère : c'est la
 * fiche article, le mode de livraison, les motifs de litige recevables, le
 * taux de commission et la vérification exigée du vendeur.
 *
 * **Ce module ne dépend de rien et tout le monde le lit.** `catalogue`,
 * `commande` et `litige` l'interrogent ; il n'interroge personne. C'est la même
 * position que `stock` : plus il a peu de raisons de changer, moins il a
 * d'occasions de casser.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne.
 */
export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
