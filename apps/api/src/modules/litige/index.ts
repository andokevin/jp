/**
 * Module litige — Signalement de commande, fil, arbitrage, avis
 *
 * Règles : R-T · Dépend de : sequestre
 *
 * **100 % des litiges reçoivent une décision motivée** dans le délai
 * *(RB4)*. La contrainte est en base : un litige `resolu` sans texte de
 * décision ni décideur est rejeté par PostgreSQL.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
