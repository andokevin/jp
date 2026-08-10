/**
 * Le serveur — Fastify, service unique modulaire
 *
 * Un seul service, seize modules. Pas de micro-services : à cette taille
 * d’équipe, le coût de coordination dépasse le gain d’isolation.
 *
 * Rempli par `S3`. Voir `plan/VAGUE0-socle.md`.
 */

import { FILES } from './jobs/index.js';
import { CANAUX } from './temps-reel/index.js';

/** Les seize domaines, dans l'ordre de PLAN_SOCLE §3. */
export const MODULES = [
  'identite',
  'catalogue',
  'stock',
  'commande',
  'paiement',
  'sequestre',
  'livraison',
  'contenu',
  'createur',
  'fidelite',
  'promotion',
  'evenement',
  'litige',
  'moderation',
  'notification',
  'exploitation',
] as const;

export type Module = (typeof MODULES)[number];

export const inventaire = {
  modules: MODULES,
  files: Object.keys(FILES),
  canaux: Object.keys(CANAUX),
} as const;
