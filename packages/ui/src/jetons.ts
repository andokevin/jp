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

  // ── Les deux couleurs de la marque, et leurs deux rôles (`D-22`) ──────────
  //
  // Ce ne sont PAS deux couleurs d'action. C'est une couleur d'action et une
  // couleur d'identité, et la frontière est stricte :
  //
  //   · `action` — framboise. Ce sur quoi on appuie : bouton principal,
  //     « Je prends », pastille « En direct », étiquette de promotion,
  //     élément actif de la navigation.
  //   · `identite` — violet. Ce qui prouve : logotype, badge « Boutique
  //     vérifiée » / « Mpivarotra azo antoka », écrans de paiement, de facture
  //     et de commission, score de confiance.
  //
  // Le violet ne devient jamais un bouton, le framboise ne devient jamais un
  // badge vérifié ni un écran d'argent. `D-22` révise `D-06` : le violet reste,
  // il change de rôle.
  action: '#A31A5B',
  actionPressee: '#821549',

  identite: '#7C2D92',
  /** Fond profond d'identité : carré partageable, en-tête de facture. */
  identiteFoncee: '#5B1D6D',

  succes: '#15803D',
  attention: '#A16207',
  danger: '#B91C1C',

  // L'argent a sa couleur, distincte de l'action : un montant n'est pas un
  // bouton, et le confondre fait toucher là où il ne faut pas.
  montant: '#18181B',
} as const;

/**
 * Les deux couleurs de `D-22`, et la raison d'être de la règle `R-Z1`.
 *
 * Leur rapport de contraste mutuel est de **1,08:1** — c'est-à-dire aucun.
 * Elles se distinguent par la teinte, jamais par la luminance : sur un écran
 * d'entrée de gamme en plein soleil, en petite taille, ou pour une personne
 * daltonienne, elles sont le même gris.
 */
export const COULEURS_D22 = [COULEURS.action, COULEURS.identite] as const;

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

// ═══════════════════════════════════════════════════════════════════════════
// R-Z1 — aucune différence de sens portée par la seule couleur
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ce qui distingue un état d'un autre à l'écran.
 *
 * `couleur` seule ne suffit jamais quand les deux couleurs comparées sont
 * celles de `D-22` : il faut un libellé, une icône ou une forme qui change
 * aussi.
 */
export type SigneDistinctif = {
  readonly couleur?: string;
  readonly libelle?: string;
  readonly icone?: string;
  readonly forme?: string;
};

/**
 * **R-Z1** — vrai si la distinction entre `a` et `b` tient à autre chose qu'au
 * seul couple framboise / violet.
 *
 * ⚠️ **Ce que ce contrôle attrape, et ce qu'il n'attrape pas.** Il vérifie
 * *une paire de descripteurs qu'on lui donne*. Il ne parcourt pas les écrans de
 * `apps/mobile`, `apps/web` ni `apps/admin` : rien, ici, ne peut voir qu'un
 * développeur a peint deux onglets de deux couleurs sans changer le libellé.
 * La vérification exhaustive demanderait une règle de lint sur les feuilles de
 * style des applications, qui n'existe pas — **c'est un manque assumé, pas un
 * oubli**. Tout composant qui expose deux états colorés DOIT appeler cette
 * fonction dans son propre test.
 */
export function respecteRZ1(a: SigneDistinctif, b: SigneDistinctif): boolean {
  const couplesD22 = COULEURS_D22 as readonly string[];
  const distinctionParCouleurD22 =
    a.couleur !== undefined &&
    b.couleur !== undefined &&
    a.couleur !== b.couleur &&
    couplesD22.includes(a.couleur) &&
    couplesD22.includes(b.couleur);

  if (!distinctionParCouleurD22) return true;

  // La couleur les sépare, mais elle ne peut pas le faire seule : il faut
  // qu'autre chose change aussi.
  return a.libelle !== b.libelle || a.icone !== b.icone || a.forme !== b.forme;
}
