/**
 * Module commande — Panier, commande, lignes, remises appliquées
 *
 * Règles : R-D, R-U7 · Dépend de : stock, promotion, paiement, sequestre
 *
 * **Le carrefour.** C'est le seul endroit du système où l'argent et le
 * stock se rencontrent. Une seule remise par ligne, tracée dans
 * `ligne_commande.promotion_id` — le champ est scalaire, donc le cumul
 * est structurellement impossible *(R-U7)*.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
