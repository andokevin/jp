/**
 * L'univers dans l'interface — la décision UX
 *
 * **Le problème posé** : cinq univers, dont deux ouverts, dans une seule
 * application, sur un écran de cinq pouces, pour quelqu'un dont c'est peut-être
 * la première application de commerce.
 *
 * ── Ce que j'écarte, et pourquoi ────────────────────────────────────────────
 *
 * **Des onglets en bas.** Ils sont déjà pris : Accueil, Recherche, Panier,
 * Commandes, Profil. Y ajouter les univers donnerait dix onglets, donc aucun.
 *
 * **Cinq applications séparées.** Cinq installations, cinq comptes, cinq mots
 * de passe. On perdrait exactement ce qui fait la valeur : un compte, une
 * confiance, un séquestre.
 *
 * **Un menu latéral.** Il cache. Un univers caché est un univers mort — la
 * personne ne saura pas que JP Beauté existe.
 *
 * ── Ce que je retiens ───────────────────────────────────────────────────────
 *
 * **Un sélecteur en tête d'écran, et toute l'application se cale dessus.**
 *
 * Le nom de l'univers courant est visible en permanence, se touche pour
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
 *      on ouvre un article invisible dans le contexte courant.
 *   3. **Le panier NE se scinde PAS par univers.** Il se scinde par vendeur et
 *      par mode de livraison, ce qu'il fait déjà. À Madagascar, la même
 *      vendeuse tient souvent le vêtement et le cosmétique : la forcer à faire
 *      payer deux fois serait absurde. Et comme les trois univers partagent la
 *      même livraison, la scission par mode ne se déclenche jamais aujourd'hui.
 *      Elle reste écrite parce que c'est la LIVRAISON qui contraint un panier,
 *      pas l'univers.
 */
import { COULEURS, RAYON, TYPOGRAPHIE, CIBLE_TACTILE_MIN } from './jetons.js';

/**
 * **Une couleur d'accent par univers, et rien de plus.**
 *
 * La tentation serait de donner à chaque univers son thème complet : autres
 * couleurs de fond, autre typographie. Ce serait cinq produits à maintenir, et
 * l'utilisatrice perdrait ses repères en changeant d'étage.
 *
 * On garde donc **un seul design system** et on ne change qu'un accent — assez
 * pour savoir où l'on est, trop peu pour se sentir ailleurs.
 *
 * Les trois accents sont vérifiés à 4,5:1 sur texte blanc, par test.
 */
export const ACCENTS: Record<string, string> = {
  mode: COULEURS.action, // violet — l'accent de la marque
  beaute: '#A31A5B', // framboise
  tech: '#1D4E89', // bleu profond
};

export function accent(cleUnivers: string): string {
  return ACCENTS[cleUnivers] ?? COULEURS.action;
}

/**
 * Le sélecteur d'univers, en tête d'écran.
 *
 * **Il n'apparaît que s'il y a le choix.** Avec un seul univers ouvert, un
 * sélecteur à une entrée n'est pas une aide : c'est du bruit qui occupe
 * 48 dp de la hauteur utile.
 */
export function selecteurUnivers(params: {
  readonly ouverts: readonly { readonly cle: string; readonly onglet: string }[];
  readonly courant: string;
}) {
  return {
    visible: params.ouverts.length > 1,
    position: 'haut',
    hauteur: CIBLE_TACTILE_MIN,
    rayon: RAYON.rond,
    typographie: TYPOGRAPHIE.corps,
    entrees: params.ouverts.map((u) => ({
      cle: u.cle,
      libelle: u.onglet,
      actif: u.cle === params.courant,
      accent: accent(u.cle),
    })),
  };
}

/**
 * L'en-tête d'un univers, montré à la première visite.
 *
 * La signature ne s'affiche qu'une fois : elle dit ce qu'on promet ici. La
 * répéter à chaque ouverture la rendrait invisible.
 */
export function enteteUnivers(params: {
  readonly nom: string;
  readonly signature: string;
  readonly cle: string;
  readonly premiereVisite: boolean;
}) {
  return {
    titre: params.nom,
    signature: params.premiereVisite ? params.signature : null,
    accent: accent(params.cle),
    couleurTexte: COULEURS.texteInverse,
  };
}

/**
 * La pastille d'univers sur une vignette d'article.
 *
 * Elle ne sert que **hors** de l'univers courant : dans une recherche globale,
 * un résultat cadeau, une notification. Dans son propre univers, elle
 * n'apprendrait rien et volerait de la place.
 */
export function pastilleUnivers(params: {
  readonly cle: string;
  readonly onglet: string;
  readonly universCourant: string;
}) {
  return {
    visible: params.cle !== params.universCourant,
    texte: params.onglet,
    fond: accent(params.cle),
    couleurTexte: COULEURS.texteInverse,
    rayon: RAYON.rond,
    typographie: TYPOGRAPHIE.petit,
  };
}
