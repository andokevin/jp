/**
 * @jp/i18n — anglais et français
 *
 * La SEULE définition des langues du projet. `@jp/money` y prend son type,
 * l'API y prend la lecture de l'en-tête `Accept-Language`, les clients y
 * prennent leurs messages.
 *
 * Ce paquet ne dépend de rien et ne connaît aucune application.
 */
export * from './languages.js';
export * from './plural.js';
export * from './format.js';
export * from './messages.js';
