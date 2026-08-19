/**
 * Les jetons du design system — S7.1
 *
 * Les valeurs brutes dont tout le reste dérive. Aucun composant n'écrit un
 * `#RRGGBB` ni un `16` en dur : il prend un jeton. C'est ce qui permet de
 * changer une couleur en un endroit plutôt qu'en trois cents.
 *
 * Deux contraintes portent tout le reste, et elles viennent du terrain, pas
 * du goût *(C1, C2)* :
 *
 *   · **48 dp minimum** pour toute cible tactile. En dessous, un doigt sur un
 *     écran de cinq pouces rate une fois sur trois.
 *   · **4,5:1 minimum** de contraste. Un téléphone d'entrée de gamme en plein
 *     soleil d'Antananarivo, ce n'est pas un écran de bureau.
 *
 * Les deux sont vérifiées par un TEST, pas par une relecture.
 */

export const CIBLE_TACTILE_MIN = 48;
export const CONTRASTE_MIN = 4.5;

export const COULEURS = {
  // Le fond est clair : on lit mieux en extérieur, et un fond sombre coûte
  // moins de batterie seulement sur OLED — que peu de nos téléphones ont.
  fond: '#FFFFFF',
  fondSecondaire: '#F4F4F5',
  bordure: '#D4D4D8',

  texte: '#18181B',
  texteSecondaire: '#52525B',
  texteInverse: '#FFFFFF',

  // Une seule couleur d'action. Deux couleurs d'action, c'est zéro couleur
  // d'action : plus rien ne ressort.
  action: '#7C2D92',
  actionPressee: '#5B1D6D',

  succes: '#15803D',
  attention: '#A16207',
  danger: '#B91C1C',

  // L'argent a sa couleur, distincte de l'action : un montant n'est pas un
  // bouton, et le confondre fait toucher là où il ne faut pas.
  montant: '#18181B',
} as const;

export type Couleur = keyof typeof COULEURS;

/** Échelle de 4 en 4 : assez fine pour composer, assez large pour rester nette. */
export const ESPACEMENT = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 } as const;

export const RAYON = { petit: 4, moyen: 8, grand: 16, rond: 9999 } as const;

/**
 * Trois tailles de texte, pas huit. Un design system qui en propose huit
 * finit avec quatorze.
 */
export const TYPOGRAPHIE = {
  titre: { taille: 22, hauteurLigne: 28, graisse: '700' },
  corps: { taille: 16, hauteurLigne: 24, graisse: '400' },
  petit: { taille: 13, hauteurLigne: 18, graisse: '400' },
} as const;

export const JETONS = {
  cibleTactileMin: CIBLE_TACTILE_MIN,
  contrasteMin: CONTRASTE_MIN,
  couleurs: COULEURS,
  espacement: ESPACEMENT,
  rayon: RAYON,
  typographie: TYPOGRAPHIE,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Le calcul de contraste — pour que le test puisse vérifier
// ═══════════════════════════════════════════════════════════════════════════

function canal(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luminance relative, telle que la définit WCAG 2. */
export function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const r = Number.parseInt(n.slice(0, 2), 16);
  const v = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return 0.2126 * canal(r) + 0.7152 * canal(v) + 0.0722 * canal(b);
}

/** Le rapport de contraste entre deux couleurs. De 1 (identiques) à 21. */
export function contraste(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [clair, sombre] = la > lb ? [la, lb] : [lb, la];
  return (clair + 0.05) / (sombre + 0.05);
}
