/**
 * Travail asynchrone — BullMQ
 *
 * Un travail rejoué ne produit **pas deux fois** son effet : idempotence
 * par clé métier, reprises à intervalle croissant, file d’échecs.
 *
 * La réconciliation au démarrage se fait **depuis la base**, jamais depuis
 * Redis — Redis n’est jamais l’autorité.
 */

/** Les files, et ce qu'elles portent. */
export const FILES = {
  'expiration-reservation': 'le travail le plus critique du projet — RB1 côté disponibilité',
  notification: 'push, courriel, SMS, avec les plafonds',
  transcodage: 'clips, stories, replays',
  reconciliation: 'rapprochement quotidien des encaissements',
  'rang-client': 'recalcul du rang à chaque commande confirmée',
  'promotion-programmee': 'ouverture et clôture des promotions et des événements',
} as const satisfies Record<string, string>;

export type NomFile = keyof typeof FILES;
