/**
 * Module stock — Quantités, réservations, mouvements
 *
 * Règles : R-S · Dépend de : aucun
 *
 * **Le module le plus critique et le plus isolé.** Il ne dépend de rien,
 * délibérément. `disponible = quantite_stock − quantite_reservee`, sous
 * `SELECT … FOR UPDATE`, avec deux `CHECK` en dernier recours. **RB1**
 * se joue ici, et nulle part ailleurs — y compris entre canaux : deux
 * acheteuses, une en direct et une au catalogue, sur la dernière pièce.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
