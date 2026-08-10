/**
 * Module contenu — Clips, stories, unboxing, fil social
 *
 * Règles : R-K · Dépend de : catalogue
 *
 * **Aucun contenu sans article attaché** *(RB5)*. Refusé côté client,
 * côté API, **et** par contrainte différée en base. Le client n’est pas
 * la garantie.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
