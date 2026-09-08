/**
 * Le thème de l'authentification native — les jetons, plus les écarts assumés
 *
 * **Les couleurs ne sont pas écrites ici, elles sont LUES depuis `@jp/ui`**,
 * exactement comme du côté web. Ce qui change entre les deux plateformes,
 * ce sont les DIMENSIONS, et la maquette native en donne de différentes :
 * elle dessine pour un pouce, pas pour un curseur.
 *
 * Les écarts avec `apps/web`, tous voulus par `JP Auth Flow.dc.html` :
 *
 *   | | natif | web |
 *   |---|---|---|
 *   | hauteur de contrôle | **56** | 52 |
 *   | rayon de champ | **16** | 14 |
 *   | cases du code | **48 × 56**, écart 8 | 56 × 56, écart 12 |
 *   | bouton principal | **collé en bas** | à la suite du contenu |
 *   | bascule de langue | **absente** | présente |
 *
 * Les deux derniers sont les seuls qui touchent à la STRUCTURE. Le bouton
 * collé en bas met l'action sous le pouce ; sur un écran de cinq pouces, un
 * bouton au fil du contenu se retrouve au milieu, là où la main ne va pas.
 * Et la bascule de langue n'existe pas ici parce que le système en donne
 * déjà une : l'application suit la langue de l'appareil.
 *
 * Les couleurs, elles, restent celles des jetons — pas les hexadécimaux de la
 * maquette. `#6B6B6B` y sert de texte secondaire là où `@jp/ui` donne
 * `#52525B` : plus sombre, donc plus contrasté, et c'est le sens dans lequel
 * on accepte de dévier *(C2)*.
 */
import { accent, MIN_TAP_TARGET, COLORS, SPACING, RADIUS } from '@jp/ui';

/** Le framboise de la maquette — l'accent « beauté » du design system. */
export const ACTION = accent('beaute');

/** Le violet des jetons, réservé au wordmark. Jamais un bouton *(D-22)*. */
export const IDENTITE = COLORS.identity;

/**
 * La hauteur des contrôles : 56, au-dessus des 48 du design system.
 *
 * `Math.max` plutôt que `56` en dur — si la cible minimale du design system
 * montait un jour à 60, cette ligne suivrait au lieu de devenir un mensonge.
 */
export const HAUTEUR_CONTROLE = Math.max(56, MIN_TAP_TARGET);

/** Les six cases : plus étroites que hautes, pour tenir sur 360 dp de large. */
export const CASE = { largeur: 48, hauteur: 56, ecart: SPACING.s } as const;

export const PALETTE = {
  fond: COLORS.background,
  fondBandeau: COLORS.backgroundSecondary,
  bordure: COLORS.border,
  texte: COLORS.text,
  texteSecondaire: COLORS.textSecondary,
  texteInverse: COLORS.textInverse,
  action: ACTION,
  identite: IDENTITE,
  danger: COLORS.danger,
} as const;

export const ESPACE = SPACING;
export const RAYONS = { champ: RADIUS.large, case: 14, pilule: RADIUS.round } as const;

/**
 * La serif éditoriale du wordmark et des titres.
 *
 * `@jp/ui` ne porte aucun jeton de fonte : le design system décrit des
 * couleurs et des espacements, pas des familles. Le repli est explicite —
 * sans Newsreader chargée par `expo-font`, on tombe sur la serif système
 * plutôt que sur la sans, et le rythme de la maquette tient encore.
 */
export const SERIF = 'Newsreader, Georgia, serif';
