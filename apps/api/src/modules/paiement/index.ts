/**
 * Module paiement — Mobile money, carte, reprise après échec
 *
 * Règles : R-M · Dépend de : sequestre
 *
 * Toute écriture porte une clé d’idempotence. **RB10** — ni double
 * prélèvement, ni commande perdue — se joue dans la plateforme, pas
 * ici : ce module en hérite, il ne le réimplémente pas.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
