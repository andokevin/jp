/**
 * Dates, heures, nombres et durées
 *
 * Les **montants ne sont pas ici** : ils appartiennent à `@jp/money`, seul
 * endroit du dépôt autorisé à toucher un ariary. Ce fichier formate ce qui
 * reste.
 *
 * Tout passe par `Intl`, fourni par la plateforme — aucune table de mois à
 * maintenir, et un rendu correct sur un Android d'entrée de gamme comme dans
 * un navigateur.
 */
import type { Language } from './languages.js';

/**
 * Le fuseau est FIXÉ à Antananarivo, jamais celui de l'appareil.
 *
 * Une commande passée à 23 h 30 doit apparaître le même jour pour l'acheteuse,
 * pour la vendeuse et dans les statistiques — même si l'une des deux consulte
 * depuis Paris. La base stocke en UTC ; l'affichage convertit ici, une fois.
 */
export const TIMEZONE = 'Indian/Antananarivo';

/**
 * Le malgache est rendu avec la locale FRANÇAISE, volontairement.
 *
 * `Intl` s'appuie sur les données ICU de la plateforme, et `mg` n'y est pas
 * garanti — ni sur un Android d'entrée de gamme, ni sur un Node compilé en
 * `small-icu`. Une étiquette inconnue ne lève pas d'erreur : elle retombe en
 * silence sur la locale du système, donc une date malgache s'afficherait en
 * anglais américain à Antananarivo et personne ne le verrait avant la
 * production. Un repli EXPLICITE vaut mieux qu'un repli invisible — et la date
 * écrite à Madagascar est de toute façon celle du français.
 */
const TAGS: Record<Language, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  mg: 'fr-FR',
};

/** « 19 août 2026 » · « 19 August 2026 ». */
export function date(value: Date, language: Language): string {
  return new Intl.DateTimeFormat(TAGS[language], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  }).format(value);
}

/** « 19/08/2026 » — pour les tableaux, où la place manque. */
export function shortDate(value: Date, language: Language): string {
  return new Intl.DateTimeFormat(TAGS[language], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TIMEZONE,
  }).format(value);
}

/** « 14:05 ». Toujours sur 24 h — `en-GB` et non `en-US`, pour éviter AM/PM. */
export function time(value: Date, language: Language): string {
  return new Intl.DateTimeFormat(TAGS[language], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIMEZONE,
  }).format(value);
}

/**
 * Un entier avec ses séparateurs de milliers — un nombre d'articles, un nombre
 * d'abonnés. **Refuse les décimaux** : nous n'en manipulons pas, et un
 * décimal qui arrive ici est le signe qu'un calcul a dérapé ailleurs.
 */
export function integer(value: number, language: Language): string {
  if (!Number.isInteger(value)) {
    throw new TypeError(`Attendu un entier, reçu ${value}.`);
  }
  return new Intl.NumberFormat(TAGS[language], {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Une durée en mots, pour les minuteurs de réservation — qu'on n'écrit jamais
 * en secondes brutes à l'écran. « 30 min », « 1 h 30 », « 2 h ».
 */
export function duration(seconds: number, language: Language): string {
  if (!Number.isInteger(seconds) || seconds < 0) {
    throw new TypeError(`Attendu un nombre entier de secondes positif, reçu ${seconds}.`);
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const unit = language === 'fr' ? 'h' : 'h';
  return rest === 0 ? `${hours} ${unit}` : `${hours} ${unit} ${String(rest).padStart(2, '0')}`;
}
