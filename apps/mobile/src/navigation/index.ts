/**
 * Navigation et liens profonds — S8.1
 *
 * Les liens profonds portent l'acquisition : une vitrine partagée sur
 * WhatsApp doit ouvrir la bonne page dans l'application, pas l'accueil.
 */
export const LIENS_PROFONDS = {
  vitrine: 'jp://vendeur/:slug',
  article: 'jp://article/:id',
  evenement: 'jp://evenement/:slug',
  cadeau: 'jp://cadeau/:jeton',
  commande: 'jp://commande/:id',
} as const;

export const ONGLETS = [
  { cle: 'accueil', titre: 'Accueil' },
  { cle: 'recherche', titre: 'Recherche' },
  { cle: 'panier', titre: 'Panier' },
  { cle: 'commandes', titre: 'Commandes' },
  { cle: 'profil', titre: 'Profil' },
] as const;

/** Reconnaît un lien profond et en extrait le paramètre. */
export function analyserLien(
  url: string,
): { readonly cible: keyof typeof LIENS_PROFONDS; readonly parametre: string } | null {
  for (const [cible, gabarit] of Object.entries(LIENS_PROFONDS)) {
    const prefixe = gabarit.slice(0, gabarit.lastIndexOf('/') + 1);
    if (url.startsWith(prefixe)) {
      const parametre = url.slice(prefixe.length).split(/[?#]/)[0] ?? '';
      if (parametre) return { cible: cible as keyof typeof LIENS_PROFONDS, parametre };
    }
  }
  return null;
}
