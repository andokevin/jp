/**
 * Identite — événements
 *
 * **Les noms ne sont pas réécrits ici, ils sont LUS depuis le catalogue.**
 * Cette liste portait auparavant ses propres chaînes littérales — une
 * troisième copie, après le catalogue et les points d'appel du service. Trois
 * copies d'un nom d'événement, c'est deux occasions de les voir diverger sans
 * qu'aucune compilation ne s'en plaigne.
 *
 * `EVENEMENTS` reste la source ; ce module ne fait que déclarer LESQUELS le
 * domaine `identite` émet.
 */
import { EVENEMENTS } from '../../observabilite/index.js';

export const EMIS = [
  EVENEMENTS.compteCree,
  EVENEMENTS.compteConnecte,
  EVENEMENTS.emailVerifie,
] as const;

export const CONSOMMES = [] as const;

export type EvenementEmis = (typeof EMIS)[number];
export type EvenementConsomme = (typeof CONSOMMES)[number];
