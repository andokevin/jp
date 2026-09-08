/**
 * @jp/web — les vitrines publiques — S9.2
 *
 * **Décision du 21/08/2026 — ce paquet ne sera JAMAIS un client complet.**
 *
 * L'application native est le client principal : la plupart des acheteuses sont
 * sur mobile, et le hors ligne y est vital — une acheteuse arrivée au point
 * relais sans réseau et sans son code de retrait repart sans son colis.
 *
 * `apps/web` porte donc exactement **cinq pages**, et rien d'autre : celles qui
 * doivent être partageables. Sa seule raison d'être est **l'aperçu de lien** —
 * pas la vitesse, pas un second client.
 *
 * Un lien collé dans une conversation WhatsApp sans titre ni image perd
 * l'essentiel de son intérêt à Madagascar, où le partage passe par là. C'est
 * pour ça, et uniquement pour ça, que ce paquet existe.
 *
 * **Ce qu'il ne fera pas** : panier, paiement, studio vendeur. Tout cela est
 * dans l'application. Une page publique mène à l'installation, ou ouvre
 * l'application si elle est déjà là.
 *
 * **Amendement du 06/09/2026 — l'authentification web, et elle seule.**
 * Le paquet porte désormais le parcours d'identité *(F0.1)*, dans
 * `features/identite`. La raison est la même que celle qui a fait exister ce
 * paquet : les liens partagés. Une page ouverte depuis WhatsApp qui demande
 * d'installer l'application avant même de pouvoir dire qui l'on est perd la
 * personne au premier écran.
 *
 * Cet amendement ne rouvre pas la porte : « compte » sort de la liste des
 * exclusions, panier, paiement et studio y restent. Et les cinq pages
 * partageables restent cinq — l'authentification n'en est pas une, elle ne
 * s'envoie pas dans une conversation.
 */
import { DEFAULT_LANGUAGE, type Language } from '@jp/i18n';

/**
 * La locale Open Graph de chaque langue.
 *
 * **Une table, pas un ternaire.** Un `langue === 'fr' ? 'fr_MG' : 'en_US'`
 * envoie silencieusement toute langue ajoutée plus tard vers l'anglais — et
 * comme il compile, personne ne le voit. Ici, une langue de plus dans
 * `@jp/i18n` casse le typage jusqu'à ce qu'on ait décidé de sa locale.
 */
const LOCALES: Record<Language, string> = {
  en: 'en_US',
  fr: 'fr_MG',
  mg: 'mg_MG',
};

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
  readonly langue: Language;
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
    `<meta property="og:locale" content="${LOCALES[a.langue]}">`,
    // Twitter/X lit ses propres balises, mais retombe sur og:* si `card` est
    // présent. Une ligne pour couvrir un réseau de plus.
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join('\n');
}

export const LANGUE_DEFAUT: Language = DEFAULT_LANGUAGE;
