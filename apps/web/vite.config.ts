import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 127.0.0.1 et non 0.0.0.0 : un serveur de développement n'a rien à
    // faire sur le réseau local.
    host: '127.0.0.1',
  },
  build: {
    // On veut savoir quand un paquet grossit, pas le découvrir sur un
    // téléphone d'entrée de gamme (C1).
    chunkSizeWarningLimit: 300,
  },
});
