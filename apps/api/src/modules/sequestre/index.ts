/**
 * Module sequestre — Retenue des fonds, libération, remboursement, portefeuille
 *
 * Règles : R-E, R-G · Dépend de : aucun
 *
 * La promesse du produit tient dans ce module. `ecriture_financiere` est
 * en **ajout seul**, imposé par la base : une correction est une
 * écriture inverse, jamais une modification. Les soldes sont **dérivés**
 * du journal, jamais stockés comme vérité *(RB2)*.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
