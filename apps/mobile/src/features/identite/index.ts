/**
 * Mobile — identite
 *
 * Le parcours d'authentification : adresse → code à six chiffres → prénom.
 * L'écran couvre les quatre états du design system — chargement, erreur, hors
 * ligne — le « vide » étant ici l'état de départ.
 *
 * **Les règles du parcours ne sont pas ici**, elles sont dans `@jp/identite`,
 * partagées avec `apps/web`. Ce dossier ne porte que le rendu React Native et
 * les jetons de dimension propres au natif *(voir `theme.ts`)*.
 */
export const DOMAINE = 'identite' as const;

export { EcranConnexion } from './ecrans/EcranConnexion.js';
export { useAuthOtp } from './hooks/useAuthOtp.js';
