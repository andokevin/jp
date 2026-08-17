import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Testcontainers démarre un vrai PostgreSQL : téléchargement de l'image au
    // premier passage, puis quelques secondes d'initialisation du cluster. Le
    // délai par défaut de 5 s ne suffit pas et produirait des échecs
    // intermittents — la pire sorte.
    testTimeout: 120_000,
    hookTimeout: 300_000,
    // Un conteneur par fichier de test coûterait cher. On force l'exécution
    // en série dans un seul processus.
    fileParallelism: false,
  },
});
