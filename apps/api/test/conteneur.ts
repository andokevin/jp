/**
 * conteneur.ts — un PostgreSQL réel et jetable pour les tests
 *
 * Pourquoi pas une base en mémoire : SQLite ne reproduit ni les droits
 * PostgreSQL, ni `SELECT … FOR UPDATE`, ni les contraintes différées, ni les
 * types énumérés. C'est-à-dire précisément ce sur quoi reposent nos garanties.
 * Un test qui passe sur un moteur différent de la production ne prouve rien.
 *
 * Le conteneur joue les migrations réelles — celles de `prisma/migrations/` —
 * et non un schéma reconstruit. Le `REVOKE` et les `CHECK` écrits à la main en
 * font partie, donc ils sont testés eux aussi.
 */
import { execFileSync } from 'node:child_process';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';
import { creerClient } from '../src/plateforme/db.js';
import type { PrismaClient } from '../src/genere/prisma/client.js';

const MOT_DE_PASSE_APP = 'test_jp_app';

export interface BaseDeTest {
  /** Client Prisma connecté avec le rôle RESTREINT `jp_app`. */
  readonly prisma: PrismaClient;
  /** Connexion brute en `jp_app` — pour éprouver les droits sans passer par Prisma. */
  readonly appli: pg.Client;
  /** Connexion brute en propriétaire — pour la contre-épreuve. */
  readonly proprietaire: pg.Client;
  readonly arreter: () => Promise<void>;
}

export async function demarrerBase(): Promise<BaseDeTest> {
  const conteneur: StartedPostgreSqlContainer = await new PostgreSqlContainer('postgres:18-alpine')
    .withDatabase('jp')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();

  const urlProprietaire = conteneur.getConnectionUri();

  // Les migrations tournent avec le propriétaire, comme en production.
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: new URL('../../..', import.meta.url).pathname,
    env: { ...process.env, DATABASE_URL: urlProprietaire },
    stdio: 'pipe',
  });

  // La migration crée `jp_app` SANS mot de passe — un secret ne va pas dans un
  // fichier versionné. On en pose un, jetable, comme le fait `pnpm db:role`.
  const admin = new pg.Client({ connectionString: urlProprietaire });
  await admin.connect();
  await admin.query(`ALTER ROLE jp_app WITH LOGIN PASSWORD '${MOT_DE_PASSE_APP}'`);
  await admin.end();

  const urlApp = new URL(urlProprietaire);
  urlApp.username = 'jp_app';
  urlApp.password = MOT_DE_PASSE_APP;

  const prisma = creerClient(urlApp.toString());
  const appli = new pg.Client({ connectionString: urlApp.toString() });
  const proprietaire = new pg.Client({ connectionString: urlProprietaire });
  await appli.connect();
  await proprietaire.connect();

  return {
    prisma,
    appli,
    proprietaire,
    arreter: async () => {
      await prisma.$disconnect();
      await appli.end();
      await proprietaire.end();
      await conteneur.stop();
    },
  };
}
