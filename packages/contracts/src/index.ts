/**
 * @jp/contracts — la source unique du contrat API
 *
 * Ni le serveur ni les clients ne redéclarent un type de requête ou de
 * réponse. Tout part d’ici.
 */

export * from './commun.js';
export * from './univers.js';
export * as auth from './auth.js';
export * as identite from './identite.js';
export * as catalogue from './catalogue.js';
export * as stock from './stock.js';
export * as commande from './commande.js';
export * as paiement from './paiement.js';
export * as sequestre from './sequestre.js';
export * as livraison from './livraison.js';
export * as contenu from './contenu.js';
export * as createur from './createur.js';
export * as fidelite from './fidelite.js';
export * as promotion from './promotion.js';
export * as evenement from './evenement.js';
export * as litige from './litige.js';
export * as moderation from './moderation.js';
export * as notification from './notification.js';
export * as exploitation from './exploitation.js';
