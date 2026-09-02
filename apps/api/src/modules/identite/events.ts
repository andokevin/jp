// apps/api/src/modules/identite/events.ts

/**
 * Identite — événements
 */

export const EMIS = [
  'identite.compte_cree',
  'identite.compte_connecte',
  'identite.email_verifie',
] as const;

export const CONSOMMES = [] as const;

export type EvenementEmis = (typeof EMIS)[number];
export type EvenementConsomme = (typeof CONSOMMES)[number];