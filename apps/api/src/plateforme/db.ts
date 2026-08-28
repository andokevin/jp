/**
 * Accès à la base — avec le rôle RESTREINT, jamais le propriétaire.
 *
 * En PostgreSQL, le propriétaire d'une table contourne ses propres
 * révocations, et un superutilisateur contourne tout. La garantie « ajout
 * seul » de `journal_audit` — et demain celle d'`ecriture_financiere` — ne
 * tient que si l'application se connecte avec `jp_app`.
 *
 * D'où la séparation, structurelle depuis Prisma 7 :
 *
 *   prisma.config.ts   →  DATABASE_URL       propriétaire, migrations
 *   ce fichier         →  DATABASE_URL_APP   jp_app, restreint
 *
 * Le client Prisma 7 EXIGE un adaptateur de pilote. On ne peut donc pas
 * l'instancier « par accident » sur la mauvaise connexion : il faut la nommer.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../genere/prisma/client.js';

function urlApplicative(): string {
  const url = process.env['DATABASE_URL_APP'];
  if (!url) {
    throw new Error(
      'DATABASE_URL_APP est absent. Copiez .env.example vers .env, puis lancez `pnpm db:role`.',
    );
  }
  // Un garde-fou bon marché contre l'erreur qui viderait la garantie de son
  // sens : brancher l'application sur la connexion du propriétaire.
  if (url === process.env['DATABASE_URL']) {
    throw new Error(
      "DATABASE_URL_APP est identique à DATABASE_URL. L'application doit tourner " +
        'avec le rôle restreint, sinon les REVOKE ne protègent rien.',
    );
  }
  return url;
}

/**
 * Construit un client. Exporté pour les tests, qui en veulent un par base
 * jetable ; le reste de l'application utilise `prisma` ci-dessous.
 */
export function creerClient(connectionString: string = urlApplicative()): PrismaClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

/**
 * Le client de l'application. Instancié à la demande : au chargement du
 * module, `.env` n'est pas encore lu dans tous les contextes d'exécution.
 */
let client: PrismaClient | undefined;

export function db(): PrismaClient {
  client ??= creerClient();
  return client;
}

/** Fermeture propre — appelée à l'arrêt du serveur et en fin de test. */
export async function fermerDb(): Promise<void> {
  await client?.$disconnect();
  client = undefined;
}
