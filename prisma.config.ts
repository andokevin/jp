import { defineConfig, env } from 'prisma/config';

try {
  process.loadEnvFile();
} catch {
  // Pas de fichier `.env` : les variables viennent alors de l'environnement
  // lui-même — c'est le cas en intégration continue et en production.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',

  datasource: {
    // Le PROPRIÉTAIRE. Migrations et administration uniquement.
    url: env('DATABASE_URL'),
  },

  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.mts',
  },
});
