/**
 * Temps réel — registre WebSocket
 *
 * La seule propriété qui compte sur un réseau malgache : **une reconnexion
 * ne perd rien**. Le client annonce son dernier numéro de séquence, le
 * serveur renvoie le delta.
 *
 * Les modules diffusent **par événement**, jamais par appel direct au
 * registre.
 */

export const CANAUX = {
  direct: 'direct:<id> — chat, annonces de stock, compte à rebours',
  commande: 'commande:<id> — changements de statut',
  utilisateur: 'utilisateur:<id> — notifications personnelles',
} as const satisfies Record<string, string>;

export type Canal = keyof typeof CANAUX;
