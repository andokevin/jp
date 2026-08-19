/**
 * @jp/web — les vitrines publiques — S9.2
 *
 * **Rendu serveur sur tout ce qui se partage.** Une vitrine collée dans une
 * conversation WhatsApp sans titre ni image perd l'essentiel de son intérêt à
 * Madagascar, où le partage passe par là.
 *
 * C'est la seule raison d'être du rendu serveur ici : pas la vitesse, les
 * aperçus de lien.
 */
import { LANGUE_PAR_DEFAUT, type Langue } from '@jp/i18n';

export const PAGES_PARTAGEABLES = [
  { chemin: '/v/:slug', quoi: 'vitrine vendeur', issue: 'F1.11' },
  { chemin: '/a/:id', quoi: 'fiche article', issue: 'F1.1' },
  { chemin: '/cadeau/:jeton', quoi: 'page cadeau', issue: 'F16.1' },
  { chemin: '/e/:slug', quoi: 'page événement', issue: 'F20.4' },
  { chemin: '/replay/:id', quoi: 'replay de direct', issue: 'F2.12' },
] as const;

/**
 * Les métadonnées d'aperçu de lien — S9.2.
 *
 * Facebook, WhatsApp et Messenger lisent `og:*`. Sans elles, un lien partagé
 * n'affiche qu'une URL nue, et personne ne clique.
 */
export interface Apercu {
  readonly titre: string;
  readonly description: string;
  readonly image: string;
  readonly url: string;
  readonly type: 'website' | 'product' | 'video.other';
  readonly langue: Langue;
}

/**
 * Rend les balises. **Échappe systématiquement** : un nom de boutique
 * contenant un guillemet casserait la page, et pourrait y injecter du
 * balisage.
 */
export function balisesApercu(a: Apercu): string {
  const e = (s: string) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');

  return [
    `<title>${e(a.titre)}</title>`,
    `<meta name="description" content="${e(a.description)}">`,
    `<meta property="og:title" content="${e(a.titre)}">`,
    `<meta property="og:description" content="${e(a.description)}">`,
    `<meta property="og:image" content="${e(a.image)}">`,
    `<meta property="og:url" content="${e(a.url)}">`,
    `<meta property="og:type" content="${a.type}">`,
    `<meta property="og:locale" content="${a.langue === 'fr' ? 'fr_MG' : 'en_US'}">`,
    // Twitter/X lit ses propres balises, mais retombe sur og:* si `card` est
    // présent. Une ligne pour couvrir un réseau de plus.
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join('\n');
}

export const LANGUE_DEFAUT: Langue = LANGUE_PAR_DEFAUT;
