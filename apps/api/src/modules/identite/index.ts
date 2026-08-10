/**
 * Module identite — Comptes, sessions, vérification d'identité, rôles
 *
 * Règles : R-C, R-V · Dépend de : aucun
 *
 * L'adresse électronique est l'identifiant du compte ; le téléphone n'est
 * qu'un contact de livraison. La réponse d'envoi de code est identique
 * que le compte existe ou non — sinon l'écran d'entrée devient un
 * annuaire des personnes inscrites *(R-C9)*.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
