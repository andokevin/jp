/**
 * Les jetons du design system — S7.1
 *
 * Les valeurs brutes dont tout le reste dérive. Aucun composant n'écrit un
 * `#RRGGBB` ni un `16` en dur : il prend un jeton. C'est ce qui permet de
 * changer une color en un endroit plutôt qu'en trois cents.
 *
 * Deux contraintes portent tout le reste, et elles viennent du terrain, pas
 * du goût *(C1, C2)* :
 *
 *   · **48 dp minimum** pour toute cible tactile. En dessous, un doigt sur un
 *     écran de cinq pouces rate une fois sur trois.
 *   · **4,5:1 minimum** de contrast. Un téléphone d'entrée de gamme en plein
 *     soleil d'Antananarivo, ce n'est pas un écran de bureau.
 *
 * Les deux sont vérifiées par un TEST, pas par une relecture.
 */

export const MIN_TAP_TARGET = 48;
export const MIN_CONTRAST = 4.5;

export const COLORS = {
  // Le background est light : on lit mieux en extérieur, et un background dark coûte
  // moins de batterie seulement sur OLED — que peu de nos téléphones ont.
  background: '#FFFFFF',
  backgroundSecondary: '#F4F4F5',
  border: '#D4D4D8',

  text: '#18181B',
  textSecondary: '#52525B',
  textInverse: '#FFFFFF',

  // ── Les deux colors de la marque, et leurs deux rôles (`D-22`) ──────────
  //
  // Ce ne sont PAS deux colors d'action. C'est une color d'action et une
  // color d'identité, et la frontière est stricte :
  //
  //   · `action` — framboise. Ce sur quoi on appuie : bouton principal,
  //     « Je prends », pastille « En direct », étiquette de promotion,
  //     élément actif de la navigation.
  //   · `identity` — violet. Ce qui prouve : logotype, badge « Boutique
  //     vérifiée » / « Mpivarotra azo antoka », écrans de paiement, de facture
  //     et de commission, score de confiance.
  //
  // Le violet ne devient jamais un bouton, le framboise ne devient jamais un
  // badge vérifié ni un écran d'argent. `D-22` révise `D-06` : le violet reste,
  // il change de rôle.
  action: '#A31A5B',
  actionPressed: '#821549',

  identity: '#7C2D92',
  /** Fond profond d'identité : carré partageable, en-tête de facture. */
  identityDeep: '#5B1D6D',

  success: '#15803D',
  warning: '#A16207',
  danger: '#B91C1C',

  // L'argent a sa color, distincte de l'action : un amount n'est pas un
  // bouton, et le confondre fait toucher là où il ne faut pas.
  amount: '#18181B',
} as const;

/**
 * Les deux colors de `D-22`, et la raison d'être de la règle `R-Z1`.
 *
 * Leur rapport de contrast mutuel est de **1,08:1** — c'est-à-dire aucun.
 * Elles se distinguent par la teinte, jamais par la luminance : sur un écran
 * d'entrée de gamme en plein soleil, en petite size, ou pour une personne
 * daltonienne, elles sont le même gris.
 */
export const COLORS_D22 = [COLORS.action, COLORS.identity] as const;

export type Color = keyof typeof COLORS;

/** Échelle de 4 en 4 : assez fine pour composer, assez large pour rester nette. */
export const SPACING = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 } as const;

export const RADIUS = { small: 4, medium: 8, large: 16, round: 9999 } as const;

/**
 * Trois tailles de text, pas huit. Un design system qui en propose huit
 * finit avec quatorze.
 */
export const TYPOGRAPHY = {
  heading: { size: 22, lineHeight: 28, weight: '700' },
  body: { size: 16, lineHeight: 24, weight: '400' },
  small: { size: 13, lineHeight: 18, weight: '400' },
} as const;

export const TOKENS = {
  minTapTarget: MIN_TAP_TARGET,
  minContrast: MIN_CONTRAST,
  colors: COLORS,
  spacing: SPACING,
  radius: RADIUS,
  typography: TYPOGRAPHY,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Le calcul de contrast — pour que le test puisse vérifier
// ═══════════════════════════════════════════════════════════════════════════

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luminance relative, telle que la définit WCAG 2. */
export function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const r = Number.parseInt(n.slice(0, 2), 16);
  const v = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(v) + 0.0722 * channel(b);
}

/** Le rapport de contrast entre deux colors. De 1 (identiques) à 21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

// ═══════════════════════════════════════════════════════════════════════════
// R-Z1 — aucune différence de sens portée par la seule color
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ce qui distingue un état d'un autre à l'écran.
 *
 * `color` seule ne suffit jamais quand les deux colors comparées sont
 * celles de `D-22` : il faut un libellé, une icône ou une shape qui change
 * aussi.
 */
export type DistinctSign = {
  readonly color?: string;
  readonly label?: string;
  readonly icon?: string;
  readonly shape?: string;
};

/**
 * **R-Z1** — vrai si la distinction entre `a` et `b` tient à autre chose qu'au
 * seul couple framboise / violet.
 *
 * ⚠️ **Ce que ce contrôle attrape, et ce qu'il n'attrape pas.** Il vérifie
 * *une paire de descripteurs qu'on lui donne*. Il ne parcourt pas les écrans de
 * `apps/mobile`, `apps/web` ni `apps/admin` : rien, ici, ne peut voir qu'un
 * développeur a peint deux onglets de deux colors sans changer le libellé.
 * La vérification exhaustive demanderait une règle de lint sur les feuilles de
 * style des applications, qui n'existe pas — **c'est un manque assumé, pas un
 * oubli**. Tout composant qui expose deux états colorés DOIT appeler cette
 * fonction dans son propre test.
 */
export function respectsRZ1(a: DistinctSign, b: DistinctSign): boolean {
  const pairsD22 = COLORS_D22 as readonly string[];
  const distinguishedByD22Color =
    a.color !== undefined &&
    b.color !== undefined &&
    a.color !== b.color &&
    pairsD22.includes(a.color) &&
    pairsD22.includes(b.color);

  if (!distinguishedByD22Color) return true;

  // La color les sépare, mais elle ne peut pas le faire seule : il faut
  // qu'autre chose change aussi.
  return a.label !== b.label || a.icon !== b.icon || a.shape !== b.shape;
}
