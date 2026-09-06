/**
 * Web — identite
 *
 * Le parcours d'authentification : adresse → code à six chiffres → prénom.
 * Chaque écran couvre les états que le design system impose — chargement,
 * erreur, hors ligne — le « vide » étant ici l'état de départ.
 *
 * **Les règles du parcours ne sont plus ici.** Machine à états, cases du code
 * et libellés vivent dans `@jp/identite` : rien de tout cela n'a besoin du
 * DOM, et l'application mobile en aura besoin à l'identique. Ce dossier ne
 * garde que ce qui est web — le rendu HTML, le client `fetch`, le thème CSS.
 * Qui a besoin de `LIBELLES` ou de `reduire` les prend au paquet ; les
 * réexporter ici n'ajouterait qu'un chemin de plus vers la même chose.
 */
export const DOMAINE = 'identite' as const;

export { LoginScreen } from './screens/LoginScreen.js';
export { useAuthOtp } from './hooks/useAuthOtp.js';
export { ClientIdentite, HorsLigne } from './api/identiteApi.js';
