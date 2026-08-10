/**
 * Module livraison — Colis, points relais, tournées, codes de retrait
 *
 * Règles : R-L · Dépend de : aucun
 *
 * Le statut est partagé des deux côtés, toujours *(R-L4)*. L'application
 * de terrain fonctionne hors ligne et se réconcilie : un livreur dans
 * une ruelle sans réseau ne doit pas être empêché de travailler.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
