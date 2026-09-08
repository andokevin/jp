/**
 * Idempotence — S3.5 · **RB10**
 *
 * « Paiement interrompu : ni double prélèvement, ni commande perdue. »
 *
 * Le client fabrique une clé, l'envoie dans `Idempotency-Key`, et la renvoie
 * s'il réessaie. Le serveur reconnaît le rejeu et **rend la réponse d'origine
 * sans réexécuter**.
 *
 * Trois situations, trois réponses différentes — et c'est la distinction qui
 * fait tout le travail :
 *
 *   1. clé inconnue          → on exécute, on enregistre la réponse
 *   2. clé connue, TERMINÉE  → on rend la réponse enregistrée, à l'identique
 *   3. clé connue, EN COURS  → 409 : deux requêtes simultanées, on refuse la
 *                              seconde plutôt que d'exécuter deux fois
 *
 * La quatrième situation est la plus vicieuse : **la même clé pour une requête
 * différente**. Un client bogué recevrait la réponse d'une autre commande.
 * D'où l'empreinte du corps, comparée à chaque rejeu.
 *
 * Écrit ICI et une seule fois. Ajoutée après coup, l'idempotence serait
 * réimplémentée par domaine, avec trois comportements différents.
 */
import { createHash } from 'node:crypto';
import type { PrismaClient } from '../genere/prisma/client.js';
import { erreurs } from './erreurs.js';

/** Durée de conservation d'une clé. Au-delà, un rejeu est traité comme neuf. */
export const CONSERVATION_MS = 24 * 60 * 60 * 1000;

export interface ResultatIdempotent {
  readonly status: number;
  readonly corps: unknown;
}

export function empreinte(corps: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(corps ?? null))
    .digest('hex');
}

/**
 * Exécute `action` au plus une fois pour cette clé.
 *
 * @param cle    la clé fournie par le client
 * @param action ce qu'il faut faire si la requête est neuve
 */
export async function executerUneSeuleFois(
  db: PrismaClient,
  params: {
    readonly cle: string;
    readonly methode: string;
    readonly chemin: string;
    readonly corps: unknown;
    readonly utilisateurId?: string;
  },
  action: () => Promise<ResultatIdempotent>,
): Promise<ResultatIdempotent> {
  const trace = empreinte(params.corps);

  // On tente d'abord de POSER la clé. `create` échoue en 23505 si elle existe
  // déjà — c'est la BASE qui arbitre la course, pas nous. Un `findUnique`
  // suivi d'un `create` laisserait passer deux requêtes simultanées entre les
  // deux appels.
  try {
    await db.cleIdempotence.create({
      data: {
        cle: params.cle,
        methode: params.methode,
        chemin: params.chemin,
        empreinteRequete: trace,
        ...(params.utilisateurId !== undefined ? { utilisateurId: params.utilisateurId } : {}),
        expireLe: new Date(Date.now() + CONSERVATION_MS),
      },
    });
  } catch {
    // La clé existe. Reste à savoir dans quel état.
    const existante = await db.cleIdempotence.findUnique({ where: { cle: params.cle } });
    if (!existante) throw erreurs.conflit();

    if (existante.empreinteRequete !== trace) {
      // Le pire cas : même clé, requête différente. On refuse plutôt que de
      // rendre la réponse d'une autre opération.
      throw erreurs.cleIdempotenceReutilisee();
    }
    if (existante.statut === null) {
      // La première requête n'a pas encore répondu.
      throw erreurs.requeteEnCours();
    }
    return { status: existante.statut, corps: existante.reponse };
  }

  // La clé est à nous : on exécute.
  try {
    const resultat = await action();
    await db.cleIdempotence.update({
      where: { cle: params.cle },
      data: { statut: resultat.status, reponse: resultat.corps as never },
    });
    return resultat;
  } catch (e) {
    // L'action a échoué : on retire la clé pour que le client PUISSE
    // réessayer. La garder marquerait un échec comme définitif, ce qui est
    // le contraire du but.
    await db.cleIdempotence.delete({ where: { cle: params.cle } }).catch(() => undefined);
    throw e;
  }
}

/** Purge les clés expirées. Appelée par un travail quotidien — `S5`. */
export async function purger(db: PrismaClient): Promise<number> {
  const { count } = await db.cleIdempotence.deleteMany({
    where: { expireLe: { lt: new Date() } },
  });
  return count;
}
