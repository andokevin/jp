/**
 * Journal d'audit — S3.7 · R-O, R-V5, N3.4
 *
 * **Ajout seul.** La garantie n'est pas dans ce fichier : elle est dans la
 * migration `socle`, sous forme de `REVOKE UPDATE, DELETE`. Ce module est la
 * seule porte d'entrée, mais ce n'est pas lui qui verrouille — le code se
 * contourne, un droit retiré non.
 *
 * Toute action de back-office y passe, nominativement. **Y compris la simple
 * consultation d'une pièce d'identité** *(R-V5)* : savoir qui a regardé quoi
 * compte autant que savoir qui a modifié quoi.
 */
import type { PrismaClient } from '../genere/prisma/client.js';
import { contexte } from './contexte.js';

export interface EntreeAudit {
  readonly action: string;
  readonly cibleType: string;
  readonly cibleId?: string;
  readonly avant?: unknown;
  readonly apres?: unknown;
  readonly acteurId?: string;
}

/**
 * Écrit une entrée. Ne lève jamais : un échec de journalisation ne doit pas
 * faire échouer l'action métier qui, elle, a réussi. L'incident est signalé
 * sur la sortie d'erreur pour être vu par l'observabilité.
 *
 * C'est un arbitrage assumé. L'inverse — refuser l'action si le journal
 * échoue — protégerait mieux la traçabilité mais rendrait le back-office
 * inutilisable au premier hoquet de la base.
 */
export async function journaliser(db: PrismaClient, entree: EntreeAudit): Promise<void> {
  const ctx = contexte();
  // Construit champ par champ : avec `exactOptionalPropertyTypes`, un
  // `{ ...(x ? { a: x } : {}) }` produit `a?: string | undefined`, que Prisma
  // refuse. L'objet mutable évite la gymnastique de types.
  const donnees: Record<string, unknown> = {
    action: entree.action,
    cibleType: entree.cibleType,
  };
  const acteurId = entree.acteurId ?? ctx?.userId;
  if (entree.cibleId !== undefined) donnees['cibleId'] = entree.cibleId;
  if (entree.avant !== undefined) donnees['avant'] = entree.avant;
  if (entree.apres !== undefined) donnees['apres'] = entree.apres;
  if (acteurId !== undefined) donnees['acteurId'] = acteurId;
  if (ctx?.ipAddress !== undefined) donnees['adresseIp'] = ctx.ipAddress;

  try {
    await db.journalAudit.create({ data: donnees as never });
  } catch (e) {
    console.error(
      `[audit] échec d'écriture — action=${entree.action} correlation=${ctx?.correlation ?? '—'}`,
      e,
    );
  }
}

/** Les actions transverses. Chaque domaine nomme les siennes. */
export const ACTIONS = {
  parametreModifie: 'exploitation.parametre.modifie',
  documentConsulte: 'identite.document.consulte',
  sessionRevoquee: 'identite.session.revoquee',
} as const;
