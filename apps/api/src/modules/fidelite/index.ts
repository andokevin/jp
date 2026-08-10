/**
 * Module fidelite — Rang client, paliers, historique par vendeur
 *
 * Règles : R-R · Dépend de : aucun
 *
 * Le rang est **par vendeur, jamais global** *(R-R1)*. La garantie est
 * structurelle : il n'existe aucun index ni aucune vue permettant
 * l’agrégation inter-vendeurs. Un vendeur n’a aucune raison de
 * connaître les dépenses de sa cliente ailleurs.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
