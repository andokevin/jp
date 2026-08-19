/**
 * Le travailleur de référence — S5.2
 *
 * Il n'a aucune utilité métier : il **montre la convention** que les six files
 * suivront. Copiez-le quand vous écrivez un vrai travailleur.
 *
 * Trois choses à retenir, dans l'ordre d'importance :
 *
 *   1. **Idempotence par clé métier.** Le travail note ce qu'il a fait dans la
 *      BASE, et commence par vérifier si c'est déjà fait. BullMQ livre *au
 *      moins une fois* — un travailleur tué avant d'accuser réception verra
 *      son travail redistribué.
 *   2. **Redis n'est jamais l'autorité.** L'état vit en base ; la file ne
 *      porte qu'une intention.
 *   3. **Un échec ne s'efface pas.** Il reste dans la file d'échecs, à
 *      comprendre.
 */
import type { Job } from 'bullmq';
import type { PrismaClient } from '../genere/prisma/client.js';
import { journaliser } from '../plateforme/audit.js';

export interface TacheReference {
  readonly cleMetier: string;
  readonly cibleId: string;
}

/**
 * Le traitement. Reçoit la base en paramètre plutôt que de l'importer : c'est
 * ce qui rend le travailleur testable contre une base jetable.
 */
export function traiterReference(db: PrismaClient) {
  return async (job: Job<TacheReference>): Promise<void> => {
    const { cleMetier, cibleId } = job.data;

    // ── 1. A-t-on DÉJÀ fait ce travail ? ─────────────────────────────────
    // La marque est en base, pas en mémoire ni dans Redis : elle doit
    // survivre au redémarrage du travailleur.
    const dejaFait = await db.journalAudit.findFirst({
      where: { action: 'socle.reference.traite', cibleId: cleMetier },
      select: { id: true },
    });
    if (dejaFait) return; // rejeu : on ne refait rien, et on ne se plaint pas

    // ── 2. L'effet ───────────────────────────────────────────────────────
    // Dans un vrai travailleur, la marque et l'effet sont dans la MÊME
    // transaction. Sinon un plantage entre les deux laisse l'effet sans sa
    // marque, et le rejeu le produit une seconde fois.
    await journaliser(db, {
      action: 'socle.reference.traite',
      cibleType: 'reference',
      cibleId: cleMetier,
      apres: { cibleId, essai: job.attemptsMade + 1 },
    });
  };
}

/**
 * Réconciliation au démarrage — S5.3
 *
 * Après un incident, on ne demande pas à Redis ce qui reste à faire : **on le
 * demande à la base**. Redis peut avoir perdu des travaux, ou en porter
 * d'obsolètes ; la base, elle, sait ce qui n'a pas été traité.
 *
 * Cette fonction est un gabarit : chaque domaine écrira la sienne. Celle de
 * `stock` cherchera les réservations expirées sans remise en stock — la plus
 * critique du projet.
 */
export async function reconcilier(
  db: PrismaClient,
  empilerManquant: (cleMetier: string) => Promise<void>,
): Promise<number> {
  // Ici, un vrai domaine ferait : « les lignes dont l'état demande un travail
  // et pour lesquelles aucune marque n'existe ». On empile ce qui manque, en
  // s'appuyant sur la clé métier pour ne pas créer de doublon.
  const enSouffrance = await db.cleIdempotence.findMany({
    where: { statut: null, creeLe: { lt: new Date(Date.now() - 5 * 60_000) } },
    select: { cle: true },
    take: 500,
  });
  for (const { cle } of enSouffrance) await empilerManquant(cle);
  return enSouffrance.length;
}
