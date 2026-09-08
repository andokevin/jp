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
 * **Le hook est ici lui aussi, et ce n'est pas une entorse.** `react` n'est
 * pas un moteur de rendu — `react-dom` et `react-native` le sont, et ni l'un
 * ni l'autre n'est importé ici. `useReducer` se comporte à l'identique sous
 * les deux. React est donc déclaré en dépendance de PAIR : le paquet emprunte
 * celui de l'application, il n'en apporte pas un second (voir `package.json`).
 *
 * Aucune dépendance à `document`, à une vue, ni à une application.
 */
export * from './flow.js';
export * from './otp-boxes.js';
export * from './labels.js';
export * from './api.js';
export * from './hook.js';
