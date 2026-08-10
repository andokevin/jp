/**
 * Module notification — Push, courriel, SMS, plafonds, préférences
 *
 * Règles : R-Q6, R-U4, R-W9 · Dépend de : aucun
 *
 * **Appelé par tous, n’appelle personne.** Il porte **seul** les plafonds
 * *(R-U4, R-W9)* : un plafond appliqué en trois endroits est un plafond
 * contourné. Une acheteuse suivant quinze boutiques ne reçoit pas
 * quinze notifications.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
