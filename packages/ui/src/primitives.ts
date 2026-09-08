/**
 * Les sept primitives partagées — S7.2
 *
 * **Ce sont des DESCRIPTIONS, pas des composants.** Elles décrivent le
 * comportement attendu et les valeurs à respecter ; `apps/mobile` les rendra
 * en React Native, `apps/admin` et `apps/web` en HTML. Le comportement, lui,
 * est décidé ici, une fois.
 *
 * Pourquoi pas des composants React partagés : React Native et le DOM n'ont
 * ni les mêmes éléments ni les mêmes styles. Une couche d'abstraction qui
 * prétendrait unifier les deux coûterait plus qu'elle ne rapporte à cette
 * taille de projet. On partage les **décisions**, pas le rendu.
 */
import { format, type Ariary } from '@jp/money';
import { translate, type Language } from '@jp/i18n';
import { MIN_TAP_TARGET, COLORS, SPACING, RADIUS, TYPOGRAPHY } from './tokens.js';

// ── 1. Le bouton principal ───────────────────────────────────────────────────

/**
 * **Toujours pleine width, toujours ancré en bottom.** Une main qui tient un
 * téléphone atteint le bottom de l'écran ; le top demande de changer de prise.
 * Un seul par écran : deux actions principales, c'est aucune.
 */
export const PRIMARY_BUTTON = {
  height: MIN_TAP_TARGET,
  width: '100%',
  radius: RADIUS.medium,
  background: COLORS.action,
  backgroundPressed: COLORS.actionPressed,
  text: COLORS.textInverse,
  typography: TYPOGRAPHY.body,
  anchor: 'bottom',
  /** Empêche le double envoi : le bouton se désactive dès le premier appui. */
  disabledWhileSubmitting: true,
} as const;

// ── 2. Le prix ───────────────────────────────────────────────────────────────

/**
 * Un amount s'affiche par `@jp/money`, jamais par une concaténation locale.
 * `PrixAriary` porte en plus la règle d'affichage : la color du amount
 * n'est **pas** celle de l'action, pour qu'un prix ne se touche pas.
 */
export function ariaryPrice(amount: Ariary, language: Language = 'fr') {
  return {
    text: format(amount, language),
    color: COLORS.amount,
    typography: TYPOGRAPHY.body,
  };
}

// ── 3. L'image progressive ───────────────────────────────────────────────────

/**
 * **Toujours un placeholder basse résolution d'abord.** Sur un réseau lent, une
 * grille de vignettes sans placeholder donne un écran gris pendant dix secondes,
 * et l'utilisatrice croit que l'application est cassée.
 *
 * En mode économie de données, on ne charge PAS la version pleine : le
 * placeholder suffit tant que personne n'a touché l'image.
 */
export function progressiveImage(params: {
  readonly url: string;
  readonly placeholder: string;
  readonly dataSaver: boolean;
}) {
  return {
    show: params.dataSaver ? params.placeholder : params.url,
    placeholder: params.placeholder,
    loadFullResolution: !params.dataSaver,
    backgroundWhileLoading: COLORS.backgroundSecondary,
  };
}

// ── 4. L'état vide ───────────────────────────────────────────────────────────

/**
 * Un écran vide dit ce qui manque **et ce qu'on peut faire**. « Aucun
 * résultat » tout seul est un cul-de-sac.
 */
export function emptyState(params: {
  readonly language: Language;
  readonly action?: { readonly label: string; readonly target: string };
}) {
  return {
    message: translate('etat.vide', params.language),
    action: params.action ?? null,
    spacing: SPACING.xl,
  };
}

// ── 5. Le minuteur de réservation ────────────────────────────────────────────

/**
 * Le compte à rebours d'une réservation.
 *
 * **Il ne ment jamais** *(RB9)*. Il affiche le temps réellement restant,
 * calculé depuis l'échéance rendue par le serveur — jamais une durée décidée
 * côté client, qui dériverait avec l'horloge du téléphone.
 */
export function reservationTimer(expiresAt: Date, now = new Date()) {
  const remainingMs = Math.max(0, expiresAt.getTime() - now.getTime());
  const remainingS = Math.ceil(remainingMs / 1000);
  return {
    remainingS,
    expired: remainingS === 0,
    /** Passe en rouge dans la dernière minute : c'est là que ça compte. */
    color: remainingS <= 60 ? COLORS.danger : COLORS.textSecondary,
    label: `${Math.floor(remainingS / 60)}:${String(remainingS % 60).padStart(2, '0')}`,
  };
}

// ── 6. Le badge ──────────────────────────────────────────────────────────────

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

/** Statut de commande, badge « vendeur vérifié », étiquette d'événement. */
export function badge(tone: BadgeTone, text: string) {
  const backgrounds: Record<BadgeTone, string> = {
    neutral: COLORS.backgroundSecondary,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
  };
  return {
    text,
    background: backgrounds[tone],
    textColor: tone === 'neutral' ? COLORS.text : COLORS.textInverse,
    radius: RADIUS.round,
    typography: TYPOGRAPHY.small,
  };
}

// ── 7. La ligne de liste ─────────────────────────────────────────────────────

/**
 * Une ligne touchable. **Sa height ne descend jamais sous la target tactile
 * minimale**, même quand le contenu tiendrait dans moins.
 */
export function listRow(params: { readonly touchable: boolean }) {
  return {
    minHeight: MIN_TAP_TARGET,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    separator: COLORS.border,
    touchable: params.touchable,
  };
}

export const PRIMITIVES = [
  'PrimaryButton',
  'AriaryPrice',
  'ProgressiveImage',
  'EmptyState',
  'ReservationTimer',
  'Badge',
  'ListRow',
] as const;
