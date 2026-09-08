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
 *      test de contrast de `@jp/ui`, donc jamais un hexadécimal en l'air.
 *   2. **Les titres sont en serif.** `@jp/ui` ne porte aucun jeton de fonte ;
 *      la maquette demande une serif éditoriale, avec repli sur Georgia.
 *   3. **La bordure de carte est plus claire que `COLORS.border`** — une
 *      carte posée sur du blanc n'a pas besoin du même trait qu'un séparateur
 *      de liste.
 *
 * Les variables partent dans le `style` de l'élément racine ; la feuille de
 * style ne connaît que `var(--jp-*)`. Un test vérifie qu'aucune variable
 * utilisée par le CSS ne manque à l'appel.
 */
import type { CSSProperties } from 'react';
import { accent, MIN_TAP_TARGET, COLORS, SPACING, RADIUS } from '@jp/ui';

/** Le framboise de la maquette — l'accent « beauté » du design system. */
export const ACTION = accent('beaute');

/**
 * Le violet des jetons, réservé au wordmark sur ces écrans.
 *
 * `COLORS.identity`, pas `COLORS.action` : ce sont deux jetons distincts,
 * et le second est le framboise. La confusion rendait le wordmark framboise et
 * faisait de `--jp-identite` un alias de `--jp-action` — c'est-à-dire qu'elle
 * effaçait `D-22` à l'endroit précis où l'en-tête ci-dessus le défend.
 */
export const IDENTITE = COLORS.identity;

export const VARIABLES_CSS = {
  '--jp-fond': COLORS.background,
  '--jp-fond-2': COLORS.backgroundSecondary,
  '--jp-bordure': COLORS.border,
  '--jp-bordure-carte': '#E5E5E5',
  '--jp-texte': COLORS.text,
  '--jp-texte-2': COLORS.textSecondary,
  '--jp-texte-inverse': COLORS.textInverse,
  '--jp-action': ACTION,
  '--jp-identite': IDENTITE,
  '--jp-danger': COLORS.danger,
  '--jp-espace-s': `${SPACING.s}px`,
  '--jp-espace-m': `${SPACING.m}px`,
  '--jp-espace-l': `${SPACING.l}px`,
  '--jp-espace-xl': `${SPACING.xl}px`,
  '--jp-rayon': `${RADIUS.large}px`,
  '--jp-rayon-champ': `${RADIUS.medium + 6}px`,
  '--jp-rayon-pilule': `${RADIUS.round}px`,
  /** Jamais sous la cible tactile du design system — 48, plus strict que les 44 de la maquette. */
  '--jp-cible': `${MIN_TAP_TARGET}px`,
  '--jp-hauteur-controle': `${Math.max(52, MIN_TAP_TARGET)}px`,
  '--jp-serif': 'Newsreader, Georgia, "Times New Roman", serif',
  '--jp-sans': 'Roboto, system-ui, -apple-system, "Helvetica Neue", sans-serif',
} as const satisfies Record<string, string>;

/** À poser sur l'élément racine : c'est ce qui alimente la feuille de style. */
export function styleRacine(): CSSProperties {
  return VARIABLES_CSS as unknown as CSSProperties;
}
