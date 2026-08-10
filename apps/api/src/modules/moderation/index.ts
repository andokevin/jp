/**
 * Module moderation — Signalements de contenu, sanctions, recours
 *
 * Règles : R-X · Dépend de : aucun
 *
 * Aucune publication vidéo par un mineur *(RB6)*. Un recours est instruit
 * par **une personne différente** de celle qui a sanctionné — sinon ce
 * n'est pas un recours, c'est une confirmation.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
