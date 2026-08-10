/**
 * Module createur — Créatrices, affiliation, précommandes
 *
 * Règles : R-N · Dépend de : contenu, commande
 *
 * Un seuil de précommande non atteint déclenche un remboursement
 * **automatique et intégral**, sans intervention humaine *(RB3)*.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
