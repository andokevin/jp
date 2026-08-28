/**
 * Sessions et garde de route — S3.3 · R-C
 *
 * Le jeton n'est **jamais** stocké en clair : seule son empreinte SHA-256
 * l'est. Une fuite de la base ne donne donc aucune session utilisable — c'est
 * le même raisonnement que pour un mot de passe, appliqué à un jeton.
 *
 * `S3` fournit le mécanisme : vérifier, poser le contexte, garder une route.
 * `F0.1` fournira l'émission — le code à usage unique, l'inscription. Les
 * deux se rencontrent sur la table `session`.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { PrismaClient } from '../genere/prisma/client.js';
import { erreurs } from './erreurs.js';

/** Durée d'une session. Longue à dessein : on ne redemande pas un code tous les jours. */
export const DUREE_SESSION_MS = 90 * 24 * 60 * 60 * 1000;

export interface Identite {
  readonly utilisateurId: string;
  readonly sessionId: string;
}

export function empreinteJeton(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex');
}

/** Un jeton opaque de 32 octets. Assez long pour être hors de portée d'une recherche exhaustive. */
export function nouveauJeton(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Ouvre une session et rend le jeton EN CLAIR — la seule fois où il existe
 * sous cette forme. L'appelant le transmet au client et l'oublie.
 */
export async function ouvrirSession(
  db: PrismaClient,
  params: {
    readonly utilisateurId: string;
    readonly appareil?: string;
    readonly adresseIp?: string;
    /** Rattache à une famille existante lors d'une rotation. */
    readonly famille?: string;
  },
): Promise<{ jeton: string; sessionId: string; famille: string }> {
  const jeton = nouveauJeton();
  const famille = params.famille ?? crypto.randomUUID();
  const session = await db.session.create({
    data: {
      utilisateurId: params.utilisateurId,
      jetonEmpreinte: empreinteJeton(jeton),
      famille,
      ...(params.appareil !== undefined ? { appareil: params.appareil } : {}),
      ...(params.adresseIp !== undefined ? { adresseIp: params.adresseIp } : {}),
      expireLe: new Date(Date.now() + DUREE_SESSION_MS),
    },
  });
  return { jeton, sessionId: session.id, famille };
}

/**
 * Vérifie un jeton et rend l'identité.
 *
 * Rend `null` au lieu de lever : c'est l'appelant qui décide si l'absence
 * d'identité est une erreur. Une route publique consultée par une visiteuse
 * *(F0.10)* n'a pas à traiter une exception.
 */
export async function verifierJeton(db: PrismaClient, jeton: string): Promise<Identite | null> {
  const session = await db.session.findUnique({
    where: { jetonEmpreinte: empreinteJeton(jeton) },
    select: { id: true, utilisateurId: true, expireLe: true, revoqueeLe: true, famille: true },
  });
  if (!session) return null;
  if (session.revoqueeLe !== null) {
    // Un jeton révoqué qui réapparaît est le signe d'un vol : on révoque
    // TOUTE la famille, pas seulement celui-ci (F0.2).
    await revoquerFamille(db, session.famille);
    return null;
  }
  if (session.expireLe.getTime() <= Date.now()) return null;
  return { utilisateurId: session.utilisateurId, sessionId: session.id };
}

export async function revoquerSession(db: PrismaClient, sessionId: string): Promise<void> {
  await db.session.updateMany({
    where: { id: sessionId, revoqueeLe: null },
    data: { revoqueeLe: new Date() },
  });
}

/** Révoque toute une chaîne de rotation — la réaction à une réutilisation de jeton. */
export async function revoquerFamille(db: PrismaClient, famille: string): Promise<number> {
  const { count } = await db.session.updateMany({
    where: { famille, revoqueeLe: null },
    data: { revoqueeLe: new Date() },
  });
  return count;
}

/** Lit un en-tête `Authorization: Bearer …`. */
export function jetonDepuisEnTete(enTete: string | undefined): string | null {
  if (!enTete) return null;
  const [schema, valeur] = enTete.split(' ');
  return schema?.toLowerCase() === 'bearer' && valeur ? valeur : null;
}

/** Exige une identité. À utiliser dans une route qui n'a pas de sens sans compte. */
export function exigerIdentite(identite: Identite | null | undefined): Identite {
  if (!identite) throw erreurs.nonAuthentifie();
  return identite;
}
