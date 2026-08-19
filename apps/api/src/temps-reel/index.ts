/**
 * Temps réel — S6 · WebSocket
 *
 * **La seule propriété qui compte sur un réseau malgache : une reconnexion ne
 * perd rien.** Une coupure de dix secondes en plein direct fait disparaître
 * des messages et des annonces de stock — et la vendeuse le voit à l'écran,
 * en direct, devant ses clientes.
 *
 * D'où le numéro de séquence : le client annonce le dernier reçu, le serveur
 * renvoie le delta. C'est ce qui distingue un flux temps réel utilisable d'une
 * démonstration qui marche au bureau.
 *
 * Les modules diffusent **par événement**, jamais par appel direct au
 * registre : `contenu` n'a pas à savoir qu'un WebSocket existe.
 */
import { randomUUID } from 'node:crypto';
import type { WebSocket } from 'ws';

export const CANAUX = {
  direct: 'chat, annonces de stock, compte à rebours',
  commande: 'changements de statut',
  utilisateur: 'notifications personnelles',
} as const;

export type TypeCanal = keyof typeof CANAUX;

/** `direct:abc` — le type, puis l'identifiant de la chose suivie. */
export function nomCanal(type: TypeCanal, id: string): string {
  return `${type}:${id}`;
}

export interface Message {
  /** Croissant par canal. C'est lui qui rend la resynchronisation possible. */
  readonly sequence: number;
  readonly type: string;
  readonly donnees: unknown;
  readonly emisLe: number;
}

export interface Connexion {
  readonly id: string;
  readonly socket: WebSocket;
  readonly utilisateurId?: string;
  readonly canaux: Set<string>;
}

/**
 * Le registre.
 *
 * **L'historique est borné** : `TAILLE_HISTORIQUE` messages par canal. Un
 * client absent plus longtemps que ça ne peut pas rattraper — il reçoit alors
 * l'ordre de **recharger entièrement**, ce qui vaut mieux que de lui livrer un
 * état troué en silence.
 */
export const TAILLE_HISTORIQUE = 200;

export class Registre {
  private readonly connexions = new Map<string, Connexion>();
  private readonly parCanal = new Map<string, Set<string>>();
  private readonly historique = new Map<string, Message[]>();
  private readonly sequences = new Map<string, number>();

  ouvrir(socket: WebSocket, utilisateurId?: string): Connexion {
    const connexion: Connexion = {
      id: randomUUID(),
      socket,
      ...(utilisateurId !== undefined ? { utilisateurId } : {}),
      canaux: new Set(),
    };
    this.connexions.set(connexion.id, connexion);
    return connexion;
  }

  fermer(connexionId: string): void {
    const c = this.connexions.get(connexionId);
    if (!c) return;
    for (const canal of c.canaux) this.parCanal.get(canal)?.delete(connexionId);
    this.connexions.delete(connexionId);
  }

  abonner(connexionId: string, canal: string): void {
    const c = this.connexions.get(connexionId);
    if (!c) return;
    c.canaux.add(canal);
    let membres = this.parCanal.get(canal);
    if (!membres) {
      membres = new Set();
      this.parCanal.set(canal, membres);
    }
    membres.add(connexionId);
  }

  desabonner(connexionId: string, canal: string): void {
    this.connexions.get(connexionId)?.canaux.delete(canal);
    this.parCanal.get(canal)?.delete(connexionId);
  }

  /** Diffuse et rend le message, numéroté. */
  diffuser(canal: string, type: string, donnees: unknown): Message {
    const sequence = (this.sequences.get(canal) ?? 0) + 1;
    this.sequences.set(canal, sequence);

    const message: Message = { sequence, type, donnees, emisLe: Date.now() };

    const hist = this.historique.get(canal) ?? [];
    hist.push(message);
    if (hist.length > TAILLE_HISTORIQUE) hist.splice(0, hist.length - TAILLE_HISTORIQUE);
    this.historique.set(canal, hist);

    const charge = JSON.stringify({ canal, ...message });
    for (const id of this.parCanal.get(canal) ?? []) {
      const c = this.connexions.get(id);
      // `readyState === 1` est OPEN. Un envoi sur une socket en fermeture
      // lève, et une exception ici couperait la diffusion pour les autres.
      if (c && c.socket.readyState === 1) {
        try {
          c.socket.send(charge);
        } catch {
          this.fermer(id);
        }
      }
    }
    return message;
  }

  /**
   * Le delta depuis un numéro de séquence — **S6.3**.
   *
   * Rend `null` si le client a trop de retard : l'historique ne remonte pas
   * assez loin. Il doit alors recharger entièrement, ce qui est honnête —
   * livrer un état troué en silence serait pire.
   */
  resynchroniser(canal: string, depuis: number): Message[] | null {
    const hist = this.historique.get(canal) ?? [];
    if (hist.length === 0) return [];

    const premier = hist[0]!.sequence;
    if (depuis + 1 < premier) return null; // trou : rechargement complet exigé
    return hist.filter((m) => m.sequence > depuis);
  }

  sequenceActuelle(canal: string): number {
    return this.sequences.get(canal) ?? 0;
  }

  nbConnexions(canal?: string): number {
    return canal ? (this.parCanal.get(canal)?.size ?? 0) : this.connexions.size;
  }

  /** Les canaux d'une connexion — pour la réabonner après reconnexion. */
  canauxDe(connexionId: string): readonly string[] {
    return [...(this.connexions.get(connexionId)?.canaux ?? [])];
  }
}

/**
 * Le registre du processus. Les modules ne l'utilisent PAS directement : ils
 * émettent un événement, et une passerelle le traduit en diffusion. Sinon
 * `contenu` importerait `ws`, et la règle de dépendance sauterait.
 */
export const registre = new Registre();

// ═══════════════════════════════════════════════════════════════════════════
// La passerelle événement → diffusion
// ═══════════════════════════════════════════════════════════════════════════

export interface EvenementDiffusable {
  readonly canal: string;
  readonly type: string;
  readonly donnees: unknown;
}

type Ecouteur = (e: EvenementDiffusable) => void;
const ecouteurs: Ecouteur[] = [];

/** Un module publie ceci ; il ne sait pas ce qu'il advient ensuite. */
export function publier(evenement: EvenementDiffusable): void {
  for (const e of ecouteurs) e(evenement);
}

export function brancherDiffusion(r: Registre = registre): () => void {
  const ecouteur: Ecouteur = (e) => {
    r.diffuser(e.canal, e.type, e.donnees);
  };
  ecouteurs.push(ecouteur);
  return () => {
    const i = ecouteurs.indexOf(ecouteur);
    if (i >= 0) ecouteurs.splice(i, 1);
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Limitation de débit par connexion — S6.4
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Un client qui envoie mille messages par seconde, par bogue ou par malice,
 * ne doit pas pouvoir saturer le processus. La limite est PAR CONNEXION :
 * couper l'adresse punirait tout un cybercafé.
 */
export class DebitConnexion {
  private readonly compteurs = new Map<string, { compte: number; fenetreLe: number }>();

  constructor(
    private readonly max = 30,
    private readonly fenetreMs = 10_000,
  ) {}

  autorise(connexionId: string): boolean {
    const maintenant = Date.now();
    const c = this.compteurs.get(connexionId);
    if (!c || maintenant - c.fenetreLe > this.fenetreMs) {
      this.compteurs.set(connexionId, { compte: 1, fenetreLe: maintenant });
      return true;
    }
    c.compte += 1;
    return c.compte <= this.max;
  }

  oublier(connexionId: string): void {
    this.compteurs.delete(connexionId);
  }
}
