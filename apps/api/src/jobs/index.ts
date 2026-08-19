/**
 * Travail asynchrone — S5 · BullMQ sur Redis
 *
 * **La garantie qui compte : un travail rejoué ne produit pas deux fois son
 * effet.** BullMQ garantit une livraison *au moins une fois*, jamais *exactement
 * une fois* — un travailleur tué juste avant d'accuser réception verra son
 * travail redistribué. L'idempotence est donc à notre charge, pas à la sienne.
 *
 * **Redis n'est jamais l'autorité** *(décision D2)*. Il porte la file, pas la
 * vérité. Après un incident, les travaux perdus se retrouvent **depuis la
 * base** — c'est le rôle de `reconcilier()`.
 */
import { Queue, Worker, type ConnectionOptions, type Job, type JobsOptions } from 'bullmq';

/** Les six files, et ce que chacune porte. */
export const FILES = {
  'expiration-reservation':
    'le travail le plus critique du projet — si elle prend du retard, le stock se bloque (RB1)',
  notification: 'push, courriel, SMS — porte les plafonds (R-U4, R-W9)',
  transcodage: 'clips, stories, replays',
  reconciliation: 'rapprochement quotidien des encaissements (R-O3)',
  'rang-client': 'recalcul du rang à chaque commande confirmée (R-R3)',
  'promotion-programmee': 'ouverture et clôture des promotions et des événements',
} as const;

export type NomFile = keyof typeof FILES;

export function connexion(): ConnectionOptions {
  const url = process.env['REDIS_URL'];
  if (!url) throw new Error('REDIS_URL est absent. Copiez .env.example vers .env.');
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    // BullMQ l'exige : sans cela, une commande bloquante abandonne au premier
    // hoquet réseau au lieu de patienter.
    maxRetriesPerRequest: null,
  };
}

/**
 * Les réglages par défaut. Trois choses qui n'ont rien d'évident :
 *
 * · `attempts: 5` avec un recul exponentiel — un prestataire de paiement qui
 *   tousse revient souvent en quelques secondes ; abandonner au premier essai
 *   transformerait un hoquet en incident.
 * · `removeOnComplete` garde les 1 000 derniers succès : assez pour enquêter,
 *   pas assez pour faire grossir Redis indéfiniment.
 * · `removeOnFail: false` — **un échec ne s'efface jamais tout seul**. La file
 *   d'échecs est une liste de choses à comprendre, pas un déchet.
 */
export const OPTIONS_DEFAUT: JobsOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1_000 },
  removeOnComplete: { count: 1_000 },
  removeOnFail: false,
};

const files = new Map<NomFile, Queue>();

export function file(nom: NomFile): Queue {
  let q = files.get(nom);
  if (!q) {
    q = new Queue(nom, { connection: connexion(), defaultJobOptions: OPTIONS_DEFAUT });
    files.set(nom, q);
  }
  return q;
}

/**
 * Empile un travail.
 *
 * **`cleMetier` est le cœur du dispositif.** BullMQ refuse d'empiler deux fois
 * le même identifiant : passer « expiration de la réservation X » comme clé
 * rend l'empilement idempotent, même si l'appelant est rejoué. Sans elle, un
 * incident réseau qui fait réessayer l'appelant crée deux travaux — et deux
 * remises en stock.
 */
export async function empiler<T extends object>(
  nom: NomFile,
  tache: string,
  donnees: T,
  options: JobsOptions & { readonly cleMetier?: string } = {},
): Promise<string | undefined> {
  const { cleMetier, ...reste } = options;
  const job = await file(nom).add(tache, donnees, {
    ...reste,
    ...(cleMetier !== undefined ? { jobId: cleMetier } : {}),
  });
  return job.id;
}

export type Traitement<T> = (job: Job<T>) => Promise<void>;

/**
 * Crée un travailleur.
 *
 * Le traitement DOIT être idempotent : voir l'en-tête de ce fichier. Rien ici
 * ne peut l'imposer — c'est une discipline, et le test de `S5.4` la vérifie
 * sur le travailleur de référence.
 */
export function travailleur<T>(
  nom: NomFile,
  traitement: Traitement<T>,
  options: { readonly concurrence?: number } = {},
): Worker<T> {
  const w = new Worker<T>(nom, traitement, {
    connection: connexion(),
    concurrency: options.concurrence ?? 5,
  });

  w.on('failed', (job, erreur) => {
    console.error(
      `[file:${nom}] échec — tache=${job?.name} id=${job?.id} essai=${job?.attemptsMade}`,
      erreur.message,
    );
  });

  return w;
}

/** Ferme proprement files et travailleurs. Appelé à l'arrêt du serveur. */
export async function fermerFiles(): Promise<void> {
  await Promise.all([...files.values()].map((q) => q.close()));
  files.clear();
}
