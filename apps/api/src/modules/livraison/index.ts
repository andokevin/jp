/**
 * Module livraison — Expédition, statuts partagés, fil de remise
 *
 * Règles : R-L · Dépend de : aucun
 *
 * **JP n'opère aucune logistique** *(DP-04)*. La boutique fait parvenir le
 * colis par le moyen de son choix ; ce module n'enregistre que ce qu'elle
 * déclare et ce que l'acheteur confirme. Le statut est partagé des deux
 * côtés, toujours *(R-L3)*.
 *
 * ⚠️ `EXPEDIEE` est une déclaration que personne ne vérifie *(R-L9)* :
 * aucun tiers neutre ne constate la remise.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
