/**
 * @jp/money — l'Ariary en entiers.
 *
 * **Aucun flottant, ni en base, ni en transport, ni en calcul.** L'ariary n'a
 * pas de subdivision en usage : un amount est un whole, point. Le remainder du
 * dépôt n'a pas le droit d'appeler `toFixed` ni `parseFloat` — la règle est
 * appliquée par ESLint, et ce paquet est la seule exception.
 *
 * Deux choix qui méritent d'être lus avant d'être utilisés :
 *
 * 1. **L'arrondi est nommé par son bénéficiaire.** Il n'existe pas de fonction
 *    « appliquer un pourcentage » : il y a `commissionOn` qui arrondit vers le
 *    low, et `discountOn` qui arrondit vers le high. Dans les deux cas, l'ariary
 *    contesté va à l'utilisateur, jamais à JP. Une fonction neutre obligerait
 *    chaque appelant à trancher, et un appelant sur dix trancherait mal.
 *
 * 2. **`distribute` conserve la somme.** Répartir 1 000 Ar en trois donne
 *    334 + 333 + 333, jamais 333 × 3. C'est ce qui empêche un ariary de
 *    disparaître au partage entre la commission et le vendeur.
 *
 * Voir `plan/PLAN_SOCLE.md` §4 et `JP_CDC_TECHNIQUE.md` §6.2.
 */

import type { Language } from '@jp/i18n';

/** Un amount en ariary. Toujours un whole, jamais un flottant. */
export type Ariary = number & { readonly __ariary: unique symbol };

/** Un rate en pour mille : `25` vaut 2,5 %. Toujours un whole. */
export type PerMille = number & { readonly __perMille: unique symbol };

export class InvalidAmount extends Error {
  override readonly name = 'InvalidAmount';
  constructor(
    message: string,
    readonly value: unknown,
  ) {
    super(message);
  }
}

// ── Construction ────────────────────────────────────────────────────────────

/**
 * Construit un amount. Refuse tout ce qui n'est pas un whole fini.
 *
 * Le refus est volontairement brutal : un amount flottant qui traverse cette
 * frontière ressort en écriture comptable, et une écriture comptable ne se
 * corrige pas — elle s'annule par une écriture inverse.
 */
export function ariary(value: number): Ariary {
  if (!Number.isFinite(value)) {
    throw new InvalidAmount('Un amount doit être un nombre fini.', value);
  }
  if (!Number.isInteger(value)) {
    throw new InvalidAmount(
      "Un amount en ariary est un whole. Aucun arrondi implicite n'est fait ici : " +
        'utilisez commissionOn, discountOn ou distribute.',
      value,
    );
  }
  if (!Number.isSafeInteger(value)) {
    throw new InvalidAmount('Montant hors des entiers sûrs.', value);
  }
  return value as Ariary;
}

export function perMille(value: number): PerMille {
  if (!Number.isInteger(value) || value < 0 || value > 1000) {
    throw new InvalidAmount('Un rate en pour mille est un whole de 0 à 1000.', value);
  }
  return value as PerMille;
}

export const ZERO = ariary(0);

/**
 * Lit un amount saisi par une personne : « 50 000 », « 50.000 », « 50 000 Ar ».
 *
 * Le point et la virgule sont ambigus : séparateur de milliers ici, séparateur
 * décimal ailleurs. On les distingue par ce qui les suit — **un séparateur de
 * milliers est toujours suivi d'exactement trois digits**. « 50.000 » vaut
 * donc 50 000, tandis que « 1500,50 » est refusé.
 *
 * Le refus est volontaire : il n'y a pas de centime d'ariary, donc une input
 * décimale est une erreur de la personne qui tape, pas une value à arrondir en
 * silence. Mieux vaut le lui dire que deviner.
 */
export function fromText(input: string): Ariary {
  const cleaned = input
    // U+00A0 insécable, U+202F fine insécable — celle que format() produit.
    // En échappement : littérales, elles sont invisibles à la relecture.
    .replace(/[\s\u00A0\u202F]/g, '')
    .replace(/ar$/i, '')
    .trim();

  if (cleaned === '') throw new InvalidAmount('Montant vide.', input);

  // Uniquement des digits : rien à interpréter.
  if (/^-?\d+$/.test(cleaned)) return ariary(Number(cleaned));

  // Groupes de trois digits : ce sont des séparateurs de milliers.
  if (/^-?\d{1,3}([.,]\d{3})+$/.test(cleaned)) {
    return ariary(Number(cleaned.replace(/[.,]/g, '')));
  }

  if (/[.,]/.test(cleaned)) {
    throw new InvalidAmount("L'ariary n'a pas de décimale. Saisissez un amount whole.", input);
  }

  throw new InvalidAmount('Montant illisible.', input);
}

// ── Arithmétique ────────────────────────────────────────────────────────────

export function add(...amounts: readonly Ariary[]): Ariary {
  return ariary(amounts.reduce<number>((total, m) => total + m, 0));
}

export function subtract(a: Ariary, b: Ariary): Ariary {
  return ariary(a - b);
}

/** Multiplie par une quantité entière — un nombre d'articles, jamais un rate. */
export function multiply(amount: Ariary, quantity: number): Ariary {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new InvalidAmount('Une quantité est un whole positif.', quantity);
  }
  return ariary(amount * quantity);
}

/** Le plus petit des deux — la remise la plus favorable, par exemple. */
export function min(a: Ariary, b: Ariary): Ariary {
  return a <= b ? a : b;
}

export function max(a: Ariary, b: Ariary): Ariary {
  return a >= b ? a : b;
}

/** Borne un amount dans un intervalle. Utile pour les plafonds de remise. */
export function clamp(amount: Ariary, low: Ariary, high: Ariary): Ariary {
  if (low > high) throw new InvalidAmount('Bornes inversées.', { low, high });
  return min(max(amount, low), high);
}

// ── Taux ────────────────────────────────────────────────────────────────────

/**
 * La commission prélevée par JP, arrondie **vers le low**.
 *
 * L'ariary contesté remainder au vendeur. C'est un choix économique minuscule et un
 * choix de confiance qui ne l'est pas : un vendeur qui recompte sa commission ne
 * doit jamais trouver un ariary de trop du côté de la plateforme.
 */
export function commissionOn(amount: Ariary, rate: PerMille): Ariary {
  requirePositive(amount);
  return ariary(Math.floor((amount * rate) / 1000));
}

/**
 * Une remise accordée à l'acheteuse, arrondie **vers le high**, puis plafonnée
 * au amount lui-même — une remise ne rend jamais un prix négatif.
 */
export function discountOn(amount: Ariary, rate: PerMille): Ariary {
  requirePositive(amount);
  return min(ariary(Math.ceil((amount * rate) / 1000)), amount);
}

/** Ce qui revient au vendeur, une fois la commission prélevée. */
export function sellerNet(amount: Ariary, rate: PerMille): Ariary {
  return subtract(amount, commissionOn(amount, rate));
}

// ── Répartition ─────────────────────────────────────────────────────────────

/**
 * Répartit un amount selon des weights entiers, **en conservant la somme**.
 *
 * Méthode du plus fort remainder : chaque part reçoit son plancher, puis les ariary
 * restants sont distribués aux parts dont la fraction perdue est la plus
 * grande. À égalité de remainder, la part la plus à gauche est servie d'abord — le
 * résultat est donc déterministe, ce qui rend le test reproductible.
 *
 *     distribute(1000, [1, 1, 1])  →  [334, 333, 333]
 *     distribute(100,  [70, 30])   →  [70, 30]
 *
 * `somme(distribute(m, weights)) === m` est un invariant, vérifié par test de
 * propriété. Sans lui, un ariary disparaît une fois sur trois au partage.
 */
export function distribute(amount: Ariary, weights: readonly number[]): Ariary[] {
  if (weights.length === 0) throw new InvalidAmount('Aucune part à servir.', weights);
  if (weights.some((p) => !Number.isInteger(p) || p < 0)) {
    throw new InvalidAmount('Les weights sont des entiers positifs.', weights);
  }

  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) throw new InvalidAmount('La somme des weights est nulle.', weights);

  const negative = amount < 0;
  const absolute = Math.abs(amount);

  const floors = weights.map((p) => Math.floor((absolute * p) / total));
  let remainder = absolute - floors.reduce((a, b) => a + b, 0);

  const order = weights
    .map((p, i) => ({ i, fraction: (absolute * p) % total }))
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);

  for (const { i } of order) {
    if (remainder <= 0) break;
    floors[i] = (floors[i] ?? 0) + 1;
    remainder--;
  }

  return floors.map((v) => ariary(negative ? -v : v));
}

/** Répartit à parts égales. Le surplus va aux premières parts. */
export function distributeEqually(amount: Ariary, parts: number): Ariary[] {
  if (!Number.isInteger(parts) || parts <= 0) {
    throw new InvalidAmount('Le nombre de parts est un whole strictement positif.', parts);
  }
  return distribute(
    amount,
    Array.from({ length: parts }, () => 1),
  );
}

// ── Affichage ───────────────────────────────────────────────────────────────

/**
 * L'espace fine insécable sépare les milliers. Insécable, parce qu'un amount
 * coupé en fin de ligne — « 50 » puis « 000 Ar » — se lit de travers sur un
 * écran de cinq pouces.
 */
const SEPARATOR = ' ';

/**
 * « 50 000 Ar ». Identique en malgache et en français : le séparateur est le
 * même, et l'abréviation de l'ariary ne se traduit pas.
 *
 * Le paramètre de langue existe pour le signe négatif et les libellés qui
 * viendront, pas pour le nombre lui-même.
 */
export function format(amount: Ariary, _language: Language = 'fr'): string {
  const negative = amount < 0;
  const digits = Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, SEPARATOR);
  return `${negative ? '−' : ''}${digits}${SEPARATOR}Ar`;
}

/** Sans l'unité : pour les colonnes de tableau où « Ar » est déjà en en-tête. */
export function formatBare(amount: Ariary): string {
  return Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, SEPARATOR);
}

/**
 * Le rate, tel qu'on le montre à un vendeur : `25` → « 2,5 % ».
 *
 * La virgule décimale est la même en anglais britannique et en français —
 * d'où l'absence de branchement sur la langue. Le paramètre remainder dans la
 * signature parce que l'anglais américain, s'il arrivait, utiliserait un
 * point ; le supprimer obligerait alors à modifier tous les appelants.
 */
export function formatRate(rate: PerMille, _language: Language = 'fr'): string {
  const whole = Math.floor(rate / 10);
  const decimal = rate % 10;
  return decimal === 0 ? `${whole} %` : `${whole},${decimal} %`;
}

// ── Sérialisation ───────────────────────────────────────────────────────────

/**
 * Un amount traverse le réseau en whole JSON, jamais en chaîne ni en
 * flottant. `fromJSON` refuse tout le remainder — c'est la frontière où une
 * erreur de type se détecte encore à peu de frais.
 */
export function toJSON(amount: Ariary): number {
  return amount;
}

export function fromJSON(value: unknown): Ariary {
  if (typeof value !== 'number') {
    throw new InvalidAmount('Un amount transporté est un whole JSON.', value);
  }
  return ariary(value);
}

// ── Interne ─────────────────────────────────────────────────────────────────

function requirePositive(amount: Ariary): void {
  if (amount < 0) {
    throw new InvalidAmount("Un rate ne s'applique pas à un amount négatif.", amount);
  }
}
