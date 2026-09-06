/**
 * @jp/identite — le parcours d'authentification, sans écran
 *
 * **Ce paquet ne rend rien.** Il porte les décisions du parcours F0.1 —
 * les transitions, la distribution d'un code collé, les mots des trois
 * écrans — et laisse à chaque application le soin de les afficher :
 * `apps/web` en HTML, `apps/mobile` en React Native.
 *
 * C'est la même frontière que celle de `@jp/ui`, appliquée à un domaine
 * plutôt qu'au design system. La raison est identique : le DOM et React
 * Native n'ont ni les mêmes éléments ni les mêmes styles, mais « hors ligne
 * désactive le bouton » et « un code refusé garde les six chiffres » sont
 * vrais des deux côtés. Réécrire ces règles pour le mobile, c'est signer
 * pour deux comportements qui divergeront — et la divergence tombera sur
 * l'écran de connexion, celui que tout le monde traverse.
 *
 * Aucune dépendance à React, à `document`, ni à une application : tout est
 * pur, donc testable sans navigateur ni simulateur.
 */
export * from './parcours.js';
export * from './code-otp.js';
export * from './libelles.js';
