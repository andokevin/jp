/**
 * Module evenement — Événements thématiques JP et boutique
 *
 * Règles : R-W · Dépend de : aucun
 *
 * L'annonce est une action humaine et volontaire ; les bascules `en_cours`
 * et `termine` sont pilotées par les dates *(R-W4)*.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
