/**
 * Noyau mobile — client API, session, cache, hors ligne
 *
 * `Idempotency-Key` posée **automatiquement** sur les écritures. Lecture
 * depuis le cache d’abord, file d’écritures en attente, réconciliation au
 * retour du réseau.
 *
 * Les commandes et le **code de retrait** restent consultables sans réseau
 * *(F13.5)* — c’est ce qui évite qu’une acheteuse reparte du point relais
 * sans son colis.
 */

export const CAPACITES_HORS_LIGNE = [
  'mes commandes',
  'le code de retrait',
  'la fiche du point relais',
] as const;
