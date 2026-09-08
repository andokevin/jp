/**
 * Le point de montage — S9.2
 *
 * `apps/web` n'en avait aucun : le paquet ne servait jusqu'ici qu'à fabriquer
 * des balises d'aperçu de lien. Il porte désormais aussi le parcours
 * d'authentification web *(F0.1)*.
 *
 * L'adresse de l'API vient de l'environnement de compilation. Le repli vise le
 * serveur local pour que `pnpm --filter @jp/web dev` marche sans configurer
 * quoi que ce soit.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { LoginScreen } from './features/identite/index.js';

const BASE_API = import.meta.env['VITE_API_BASE'] ?? 'http://127.0.0.1:3000';

const racine = document.getElementById('racine');
if (!racine) throw new Error('élément #racine introuvable');

createRoot(racine).render(
  <StrictMode>
    <LoginScreen base={BASE_API} initialLanguage="mg" />
  </StrictMode>,
);
