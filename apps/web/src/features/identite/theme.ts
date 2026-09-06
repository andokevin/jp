/**
 * Le thème de l'authentification web — les jetons, plus les écarts assumés
 *
 * **Les couleurs ne sont pas écrites ici, elles sont LUES depuis `@jp/ui`.**
 * Une valeur recopiée diverge le jour où le design system bouge, et personne
 * ne s'en aperçoit avant qu'un écran ne jure avec les autres.
 *
 * Trois écarts avec les jetons, voulus par la maquette et documentés ici
 * plutôt que dispersés dans les composants :
 *
 *   1. **La couleur d'action est le framboise, pas le violet.** Sur ces écrans
 *      le violet appartient au seul wordmark : c'est l'identité, pas une
 *      action. Le framboise vient de `accent('beaute')` — déjà couvert par le
 *      test de contraste de `@jp/ui`, donc jamais un hexadécimal en l'air.
 *   2. **Les titres sont en serif.** `@jp/ui` ne porte aucun jeton de fonte ;
 *      la maquette demande une serif éditoriale, avec repli sur Georgia.
 *   3. **La bordure de carte est plus claire que `COULEURS.bordure`** — une
 *      carte posée sur du blanc n'a pas besoin du même trait qu'un séparateur
 *      de liste.
 *
 * Les variables partent dans le `style` de l'élément racine ; la feuille de
 * style ne connaît que `var(--jp-*)`. Un test vérifie qu'aucune variable
 * utilisée par le CSS ne manque à l'appel.
 */
import type { CSSProperties } from 'react';
import { accent, CIBLE_TACTILE_MIN, COULEURS, ESPACEMENT, RAYON } from '@jp/ui';

/** Le framboise de la maquette — l'accent « beauté » du design system. */
export const ACTION = accent('beaute');

/** Le violet des jetons, réservé au wordmark sur ces écrans. */
export const IDENTITE = COULEURS.action;

export const VARIABLES_CSS = {
  '--jp-fond': COULEURS.fond,
  '--jp-fond-2': COULEURS.fondSecondaire,
  '--jp-bordure': COULEURS.bordure,
  '--jp-bordure-carte': '#E5E5E5',
  '--jp-texte': COULEURS.texte,
  '--jp-texte-2': COULEURS.texteSecondaire,
  '--jp-texte-inverse': COULEURS.texteInverse,
  '--jp-action': ACTION,
  '--jp-identite': IDENTITE,
  '--jp-danger': COULEURS.danger,
  '--jp-espace-s': `${ESPACEMENT.s}px`,
  '--jp-espace-m': `${ESPACEMENT.m}px`,
  '--jp-espace-l': `${ESPACEMENT.l}px`,
  '--jp-espace-xl': `${ESPACEMENT.xl}px`,
  '--jp-rayon': `${RAYON.grand}px`,
  '--jp-rayon-champ': `${RAYON.moyen + 6}px`,
  '--jp-rayon-pilule': `${RAYON.rond}px`,
  /** Jamais sous la cible tactile du design system — 48, plus strict que les 44 de la maquette. */
  '--jp-cible': `${CIBLE_TACTILE_MIN}px`,
  '--jp-hauteur-controle': `${Math.max(52, CIBLE_TACTILE_MIN)}px`,
  '--jp-serif': 'Newsreader, Georgia, "Times New Roman", serif',
  '--jp-sans': 'Roboto, system-ui, -apple-system, "Helvetica Neue", sans-serif',
} as const satisfies Record<string, string>;

/** À poser sur l'élément racine : c'est ce qui alimente la feuille de style. */
export function styleRacine(): CSSProperties {
  return VARIABLES_CSS as unknown as CSSProperties;
}
