/**
 * Module catalogue — Articles, variantes, vitrines, questions publiques
 *
 * Règles : R-A, R-H · Dépend de : stock
 *
 * Un article est achetable hors direct par défaut. La fiche enrichie
 * (état, mesures réelles) n'est pas un ornement : sans démonstration
 * vidéo, elle est la seule chose qui remplace le fait de toucher le
 * vêtement *(R-H4)*.
 *
 * **La façade du module.** Les autres modules importent d'ici, jamais un
 * fichier interne. Le dépôt et les routes ne sortent pas.
 */

export { service } from './service.js';
export { routes } from './routes.js';
export { ERREURS } from './erreurs.js';
export type { CodeErreur } from './erreurs.js';
export { EMIS, CONSOMMES } from './events.js';
