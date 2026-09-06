/**
 * Web — identite
 *
 * Le parcours d'authentification : adresse → code à six chiffres → prénom.
 * Chaque écran couvre les états que le design system impose — chargement,
 * erreur, hors ligne — le « vide » étant ici l'état de départ.
 */
export const DOMAINE = 'identite' as const;

export { LoginScreen } from './screens/LoginScreen.js';
export { useAuthOtp } from './hooks/useAuthOtp.js';
export { ClientIdentite, HorsLigne } from './api/identiteApi.js';
export { LANGUES_ECRAN, langueEcran, type LangueEcran } from './libelles.js';
