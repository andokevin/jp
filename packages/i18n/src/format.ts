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
import type { Langue } from './langues.js';

/**
 * Le fuseau est FIXÉ à Antananarivo, jamais celui de l'appareil.
 *
 * Une commande passée à 23 h 30 doit apparaître le même jour pour l'acheteuse,
 * pour la vendeuse et dans les statistiques — même si l'une des deux consulte
 * depuis Paris. La base stocke en UTC ; l'affichage convertit ici, une fois.
 */
export const FUSEAU = 'Indian/Antananarivo';

const ETIQUETTES: Record<Langue, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
};

/** « 19 août 2026 » · « 19 August 2026 ». */
export function date(valeur: Date, langue: Langue): string {
  return new Intl.DateTimeFormat(ETIQUETTES[langue], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: FUSEAU,
  }).format(valeur);
}

/** « 19/08/2026 » — pour les tableaux, où la place manque. */
export function dateCourte(valeur: Date, langue: Langue): string {
  return new Intl.DateTimeFormat(ETIQUETTES[langue], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: FUSEAU,
  }).format(valeur);
}

/** « 14:05 ». Toujours sur 24 h — `en-GB` et non `en-US`, pour éviter AM/PM. */
export function heure(valeur: Date, langue: Langue): string {
  return new Intl.DateTimeFormat(ETIQUETTES[langue], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: FUSEAU,
  }).format(valeur);
}

/**
 * Un entier avec ses séparateurs de milliers — un nombre d'articles, un nombre
 * d'abonnés. **Refuse les décimaux** : nous n'en manipulons pas, et un
 * décimal qui arrive ici est le signe qu'un calcul a dérapé ailleurs.
 */
export function entier(valeur: number, langue: Langue): string {
  if (!Number.isInteger(valeur)) {
    throw new TypeError(`Attendu un entier, reçu ${valeur}.`);
  }
  return new Intl.NumberFormat(ETIQUETTES[langue], {
    maximumFractionDigits: 0,
  }).format(valeur);
}

/**
 * Une durée en mots, pour les minuteurs de réservation — qu'on n'écrit jamais
 * en secondes brutes à l'écran. « 30 min », « 1 h 30 », « 2 h ».
 */
export function duree(secondes: number, langue: Langue): string {
  if (!Number.isInteger(secondes) || secondes < 0) {
    throw new TypeError(`Attendu un nombre entier de secondes positif, reçu ${secondes}.`);
  }
  const minutes = Math.round(secondes / 60);
  if (minutes < 60) return `${minutes} min`;

  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  const unite = langue === 'fr' ? 'h' : 'h';
  return reste === 0
    ? `${heures} ${unite}`
    : `${heures} ${unite} ${String(reste).padStart(2, '0')}`;
}
