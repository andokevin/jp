/**
 * @jp/money — l'Ariary en entiers.
 *
 * **Aucun flottant, ni en base, ni en transport, ni en calcul.** L'ariary n'a
 * pas de subdivision en usage : un montant est un entier, point. Le reste du
 * dépôt n'a pas le droit d'appeler `toFixed` ni `parseFloat` — la règle est
 * appliquée par ESLint, et ce paquet est la seule exception.
 *
 * Deux choix qui méritent d'être lus avant d'être utilisés :
 *
 * 1. **L'arrondi est nommé par son bénéficiaire.** Il n'existe pas de fonction
 *    « appliquer un pourcentage » : il y a `commissionSur` qui arrondit vers le
 *    bas, et `remiseSur` qui arrondit vers le haut. Dans les deux cas, l'ariary
 *    contesté va à l'utilisateur, jamais à JP. Une fonction neutre obligerait
 *    chaque appelant à trancher, et un appelant sur dix trancherait mal.
 *
 * 2. **`repartir` conserve la somme.** Répartir 1 000 Ar en trois donne
 *    334 + 333 + 333, jamais 333 × 3. C'est ce qui empêche un ariary de
 *    disparaître au partage entre la commission et le vendeur.
 *
 * Voir `plan/PLAN_SOCLE.md` §4 et `JP_CDC_TECHNIQUE.md` §6.2.
 */

import type { Langue } from '@jp/i18n';

/** Un montant en ariary. Toujours un entier, jamais un flottant. */
export type Ariary = number & { readonly __ariary: unique symbol };

/** Un taux en pour mille : `25` vaut 2,5 %. Toujours un entier. */
export type PourMille = number & { readonly __pourMille: unique symbol };

export class MontantInvalide extends Error {
  override readonly name = 'MontantInvalide';
  constructor(
    message: string,
    readonly valeur: unknown,
  ) {
    super(message);
  }
}

// ── Construction ────────────────────────────────────────────────────────────

/**
 * Construit un montant. Refuse tout ce qui n'est pas un entier fini.
 *
 * Le refus est volontairement brutal : un montant flottant qui traverse cette
 * frontière ressort en écriture comptable, et une écriture comptable ne se
 * corrige pas — elle s'annule par une écriture inverse.
 */
export function ariary(valeur: number): Ariary {
  if (!Number.isFinite(valeur)) {
    throw new MontantInvalide('Un montant doit être un nombre fini.', valeur);
  }
  if (!Number.isInteger(valeur)) {
    throw new MontantInvalide(
      "Un montant en ariary est un entier. Aucun arrondi implicite n'est fait ici : " +
        'utilisez commissionSur, remiseSur ou repartir.',
      valeur,
    );
  }
  if (!Number.isSafeInteger(valeur)) {
    throw new MontantInvalide('Montant hors des entiers sûrs.', valeur);
  }
  return valeur as Ariary;
}

export function pourMille(valeur: number): PourMille {
  if (!Number.isInteger(valeur) || valeur < 0 || valeur > 1000) {
    throw new MontantInvalide('Un taux en pour mille est un entier de 0 à 1000.', valeur);
  }
  return valeur as PourMille;
}

export const ZERO = ariary(0);

/**
 * Lit un montant saisi par une personne : « 50 000 », « 50.000 », « 50 000 Ar ».
 *
 * Le point et la virgule sont ambigus : séparateur de milliers ici, séparateur
 * décimal ailleurs. On les distingue par ce qui les suit — **un séparateur de
 * milliers est toujours suivi d'exactement trois chiffres**. « 50.000 » vaut
 * donc 50 000, tandis que « 1500,50 » est refusé.
 *
 * Le refus est volontaire : il n'y a pas de centime d'ariary, donc une saisie
 * décimale est une erreur de la personne qui tape, pas une valeur à arrondir en
 * silence. Mieux vaut le lui dire que deviner.
 */
export function depuisTexte(saisie: string): Ariary {
  const nettoye = saisie
    // U+00A0 insécable, U+202F fine insécable — celle que formater() produit.
    // En échappement : littérales, elles sont invisibles à la relecture.
    .replace(/[\s\u00A0\u202F]/g, '')
    .replace(/ar$/i, '')
    .trim();

  if (nettoye === '') throw new MontantInvalide('Montant vide.', saisie);

  // Uniquement des chiffres : rien à interpréter.
  if (/^-?\d+$/.test(nettoye)) return ariary(Number(nettoye));

  // Groupes de trois chiffres : ce sont des séparateurs de milliers.
  if (/^-?\d{1,3}([.,]\d{3})+$/.test(nettoye)) {
    return ariary(Number(nettoye.replace(/[.,]/g, '')));
  }

  if (/[.,]/.test(nettoye)) {
    throw new MontantInvalide("L'ariary n'a pas de décimale. Saisissez un montant entier.", saisie);
  }

  throw new MontantInvalide('Montant illisible.', saisie);
}

// ── Arithmétique ────────────────────────────────────────────────────────────

export function additionner(...montants: readonly Ariary[]): Ariary {
  return ariary(montants.reduce<number>((total, m) => total + m, 0));
}

export function soustraire(a: Ariary, b: Ariary): Ariary {
  return ariary(a - b);
}

/** Multiplie par une quantité entière — un nombre d'articles, jamais un taux. */
export function multiplier(montant: Ariary, quantite: number): Ariary {
  if (!Number.isInteger(quantite) || quantite < 0) {
    throw new MontantInvalide('Une quantité est un entier positif.', quantite);
  }
  return ariary(montant * quantite);
}

/** Le plus petit des deux — la remise la plus favorable, par exemple. */
export function minimum(a: Ariary, b: Ariary): Ariary {
  return a <= b ? a : b;
}

export function maximum(a: Ariary, b: Ariary): Ariary {
  return a >= b ? a : b;
}

/** Borne un montant dans un intervalle. Utile pour les plafonds de remise. */
export function borner(montant: Ariary, bas: Ariary, haut: Ariary): Ariary {
  if (bas > haut) throw new MontantInvalide('Bornes inversées.', { bas, haut });
  return minimum(maximum(montant, bas), haut);
}

// ── Taux ────────────────────────────────────────────────────────────────────

/**
 * La commission prélevée par JP, arrondie **vers le bas**.
 *
 * L'ariary contesté reste au vendeur. C'est un choix économique minuscule et un
 * choix de confiance qui ne l'est pas : un vendeur qui recompte sa commission ne
 * doit jamais trouver un ariary de trop du côté de la plateforme.
 */
export function commissionSur(montant: Ariary, taux: PourMille): Ariary {
  verifierPositif(montant);
  return ariary(Math.floor((montant * taux) / 1000));
}

/**
 * Une remise accordée à l'acheteuse, arrondie **vers le haut**, puis plafonnée
 * au montant lui-même — une remise ne rend jamais un prix négatif.
 */
export function remiseSur(montant: Ariary, taux: PourMille): Ariary {
  verifierPositif(montant);
  return minimum(ariary(Math.ceil((montant * taux) / 1000)), montant);
}

/** Ce qui revient au vendeur, une fois la commission prélevée. */
export function netVendeur(montant: Ariary, taux: PourMille): Ariary {
  return soustraire(montant, commissionSur(montant, taux));
}

// ── Répartition ─────────────────────────────────────────────────────────────

/**
 * Répartit un montant selon des poids entiers, **en conservant la somme**.
 *
 * Méthode du plus fort reste : chaque part reçoit son plancher, puis les ariary
 * restants sont distribués aux parts dont la fraction perdue est la plus
 * grande. À égalité de reste, la part la plus à gauche est servie d'abord — le
 * résultat est donc déterministe, ce qui rend le test reproductible.
 *
 *     repartir(1000, [1, 1, 1])  →  [334, 333, 333]
 *     repartir(100,  [70, 30])   →  [70, 30]
 *
 * `somme(repartir(m, poids)) === m` est un invariant, vérifié par test de
 * propriété. Sans lui, un ariary disparaît une fois sur trois au partage.
 */
export function repartir(montant: Ariary, poids: readonly number[]): Ariary[] {
  if (poids.length === 0) throw new MontantInvalide('Aucune part à servir.', poids);
  if (poids.some((p) => !Number.isInteger(p) || p < 0)) {
    throw new MontantInvalide('Les poids sont des entiers positifs.', poids);
  }

  const total = poids.reduce((a, b) => a + b, 0);
  if (total === 0) throw new MontantInvalide('La somme des poids est nulle.', poids);

  const negatif = montant < 0;
  const absolu = Math.abs(montant);

  const planchers = poids.map((p) => Math.floor((absolu * p) / total));
  let reste = absolu - planchers.reduce((a, b) => a + b, 0);

  const ordre = poids
    .map((p, i) => ({ i, fraction: (absolu * p) % total }))
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);

  for (const { i } of ordre) {
    if (reste <= 0) break;
    planchers[i] = (planchers[i] ?? 0) + 1;
    reste--;
  }

  return planchers.map((v) => ariary(negatif ? -v : v));
}

/** Répartit à parts égales. Le surplus va aux premières parts. */
export function repartirEgalement(montant: Ariary, parts: number): Ariary[] {
  if (!Number.isInteger(parts) || parts <= 0) {
    throw new MontantInvalide('Le nombre de parts est un entier strictement positif.', parts);
  }
  return repartir(
    montant,
    Array.from({ length: parts }, () => 1),
  );
}

// ── Affichage ───────────────────────────────────────────────────────────────

/**
 * L'espace fine insécable sépare les milliers. Insécable, parce qu'un montant
 * coupé en fin de ligne — « 50 » puis « 000 Ar » — se lit de travers sur un
 * écran de cinq pouces.
 */
const SEPARATEUR = ' ';

/**
 * « 50 000 Ar ». Identique en malgache et en français : le séparateur est le
 * même, et l'abréviation de l'ariary ne se traduit pas.
 *
 * Le paramètre de langue existe pour le signe négatif et les libellés qui
 * viendront, pas pour le nombre lui-même.
 */
export function formater(montant: Ariary, _langue: Langue = 'fr'): string {
  const negatif = montant < 0;
  const chiffres = Math.abs(montant)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, SEPARATEUR);
  return `${negatif ? '−' : ''}${chiffres}${SEPARATEUR}Ar`;
}

/** Sans l'unité : pour les colonnes de tableau où « Ar » est déjà en en-tête. */
export function formaterNu(montant: Ariary): string {
  return Math.abs(montant)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, SEPARATEUR);
}

/**
 * Le taux, tel qu'on le montre à un vendeur : `25` → « 2,5 % ».
 *
 * La virgule décimale est la même en anglais britannique et en français —
 * d'où l'absence de branchement sur la langue. Le paramètre reste dans la
 * signature parce que l'anglais américain, s'il arrivait, utiliserait un
 * point ; le supprimer obligerait alors à modifier tous les appelants.
 */
export function formaterTaux(taux: PourMille, _langue: Langue = 'fr'): string {
  const entier = Math.floor(taux / 10);
  const decimale = taux % 10;
  return decimale === 0 ? `${entier} %` : `${entier},${decimale} %`;
}

// ── Sérialisation ───────────────────────────────────────────────────────────

/**
 * Un montant traverse le réseau en entier JSON, jamais en chaîne ni en
 * flottant. `depuisJSON` refuse tout le reste — c'est la frontière où une
 * erreur de type se détecte encore à peu de frais.
 */
export function versJSON(montant: Ariary): number {
  return montant;
}

export function depuisJSON(valeur: unknown): Ariary {
  if (typeof valeur !== 'number') {
    throw new MontantInvalide('Un montant transporté est un entier JSON.', valeur);
  }
  return ariary(valeur);
}

// ── Interne ─────────────────────────────────────────────────────────────────

function verifierPositif(montant: Ariary): void {
  if (montant < 0) {
    throw new MontantInvalide("Un taux ne s'applique pas à un montant négatif.", montant);
  }
}
