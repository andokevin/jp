/**
 * Module promotion — Promotions boutique, ciblées, codes, éligibilité
 *
 * Règles : R-U · Dépend de : fidelite, evenement
 *
 * L'éligibilité est vérifiée **côté serveur au calcul du panier**, jamais
 * seulement à l’affichage *(R-U5)*. Un palier perdu entre la
 * réservation et le paiement retire la remise — **sans faire échouer la
 * commande**.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
