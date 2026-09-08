/**
 * @jp/contracts — la source unique du contrat API
 *
 * Ni le serveur ni les clients ne redéclarent un type de requête ou de
 * réponse. Tout part d’ici.
 */

export * from './common.js';
export * from './universes.js';
export * as auth from './auth.js';
export * as identity from './identity.js';
export * as catalog from './catalog.js';
export * as stock from './stock.js';
export * as order from './order.js';
export * as payment from './payment.js';
export * as escrow from './escrow.js';
export * as shipping from './shipping.js';
export * as content from './content.js';
export * as creator from './creator.js';
export * as loyalty from './loyalty.js';
export * as promotion from './promotion.js';
export * as event from './event.js';
export * as dispute from './dispute.js';
export * as moderation from './moderation.js';
export * as notification from './notification.js';
export * as exploitation from './exploitation.js';
