/**
 * L'univers dans l'interface — la décision UX
 *
 * **Le problème posé** : cinq univers, dont deux open, dans une seule
 * application, sur un écran de cinq pouces, pour quelqu'un dont c'est peut-être
 * la première application de commerce.
 *
 * ── Ce que j'écarte, et pourquoi ────────────────────────────────────────────
 *
 * **Des onglets en bottom.** Ils sont déjà pris : Accueil, Recherche, Panier,
 * Commandes, Profil. Y ajouter les univers donnerait dix onglets, donc aucun.
 *
 * **Cinq applications séparées.** Cinq installations, cinq comptes, cinq mots
 * de past. On perdrait exactement ce qui fait la valeur : un compte, une
 * confiance, un séquestre.
 *
 * **Un menu latéral.** Il cache. Un univers caché est un univers mort — la
 * personne ne saura pas que JP Beauté existe.
 *
 * ── Ce que je retiens ───────────────────────────────────────────────────────
 *
 * **Un sélecteur en tête d'écran, et toute l'application se cale dessus.**
 *
 * Le nom de l'univers current est visible en permanence, se touche pour
 * changer, et **tout ce qui est en dessous appartient à cet univers** : le fil,
 * la recherche, les filtres, les vitrines. C'est le modèle du grand magasin :
 * on sait à quel étage on est.
 *
 * Trois conséquences assumées, et la troisième est la plus importante :
 *
 *   1. **L'univers est mémorisé.** Quelqu'un qui vient pour la beauté ne veut
 *      pas rechoisir à chaque ouverture.
 *   2. **Un lien profond impose son univers.** Un lien vers un article de
 *      beauté partagé sur WhatsApp bascule l'application sur JP Beauté — sinon
 *      on ouvre un article invisible dans le contexte current.
 *   3. **Le panier NE se scinde PAS par univers.** Il se scinde par vendeur et
 *      par mode de livraison, ce qu'il fait déjà. À Madagascar, la même
 *      vendeuse tient souvent le vêtement et le cosmétique : la forcer à faire
 *      payer deux fois serait absurde. Et comme les trois univers partagent la
 *      même livraison, la scission par mode ne se déclenche jamais aujourd'hui.
 *      Elle reste écrite parce que c'est la LIVRAISON qui contraint un panier,
 *      pas l'univers.
 */
import { COLORS, RADIUS, TYPOGRAPHY, MIN_TAP_TARGET } from './tokens.js';

/**
 * **Une color d'accent par univers, et rien de plus.**
 *
 * La tentation serait de donner à chaque univers son thème complet : autres
 * couleurs de fond, autre typography. Ce serait cinq produits à maintenir, et
 * l'utilisatrice perdrait ses repères en changeant d'étage.
 *
 * On garde donc **un seul design system** et on ne change qu'un accent — assez
 * pour savoir où l'on est, trop peu pour se sentir ailleurs.
 *
 * Les trois accents sont vérifiés à 4,5:1 sur text blanc, par test.
 */
export const ACCENTS: Record<string, string> = {
  // `D-22` a scindé le jeton d'action et le jeton d'identité. L'accent d'univers
  // reste sur la color d'identité : sa valeur rendue est inchangée, elle a
  // seulement cessé d'emprunter le jeton du bouton.
  mode: COLORS.identity, // violet — l'accent de la marque
  // ⚠️ POINT OUVERT (`D-22`) : le framboise est devenu la color d'action de
  // toute l'application. Il ne peut plus servir d'accent d'univers — un tab
  // « Beauté » de la color du bouton principal apprend à toucher le mauvais
  // élément. **Une color de remplacement est à décider**, elle n'est pas
  // inventée ici. Tant qu'elle ne l'est pas, cette valeur duplique
  // `COLORS.action`.
  beaute: '#A31A5B', // framboise — à remplacer
  tech: '#1D4E89', // bleu profond
};

export function accent(universeKey: string): string {
  return ACCENTS[universeKey] ?? COLORS.identity;
}

/**
 * Le sélecteur d'univers, en tête d'écran.
 *
 * **Il n'apparaît que s'il y a le choix.** Avec un seul univers ouvert, un
 * sélecteur à une entrée n'est pas une aide : c'est du bruit qui occupe
 * 48 dp de la height utile.
 */
export function universeSelector(params: {
  readonly open: readonly { readonly key: string; readonly tab: string }[];
  readonly current: string;
}) {
  return {
    visible: params.open.length > 1,
    position: 'top',
    height: MIN_TAP_TARGET,
    radius: RADIUS.round,
    typography: TYPOGRAPHY.body,
    entrees: params.open.map((u) => ({
      key: u.key,
      label: u.tab,
      active: u.key === params.current,
      accent: accent(u.key),
    })),
  };
}

/**
 * L'en-tête d'un univers, montré à la première visite.
 *
 * La signature ne s'affiche qu'une fois : elle dit ce qu'on promet ici. La
 * répéter à chaque ouverture la rendrait invisible.
 */
export function universeHeader(params: {
  readonly name: string;
  readonly signature: string;
  readonly key: string;
  readonly firstVisit: boolean;
}) {
  return {
    title: params.name,
    signature: params.firstVisit ? params.signature : null,
    accent: accent(params.key),
    textColor: COLORS.textInverse,
  };
}

/**
 * La pastille d'univers sur une vignette d'article.
 *
 * Elle ne sert que **hors** de l'univers current : dans une recherche globale,
 * un résultat cadeau, une notification. Dans son propre univers, elle
 * n'apprendrait rien et volerait de la place.
 */
export function universePill(params: {
  readonly key: string;
  readonly tab: string;
  readonly currentUniverse: string;
}) {
  return {
    visible: params.key !== params.currentUniverse,
    text: params.tab,
    fond: accent(params.key),
    textColor: COLORS.textInverse,
    radius: RADIUS.round,
    typography: TYPOGRAPHY.small,
  };
}
