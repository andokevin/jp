/**
 * Les six cases du code — la logique, sans le DOM
 *
 * Le collage est la seule affordance vraiment WEB de ce parcours : sur mobile,
 * le code arrive par notification et se tape ; sur un ordinateur, il se copie
 * depuis la boîte mail et se colle. **Coller six chiffres dans la première
 * case doit remplir les six**, sinon la personne colle, ne voit qu'un chiffre,
 * et recommence à la main.
 *
 * Tout est pur : aucun `document`, aucun état React. C'est ce qui rend ces
 * règles testables sans navigateur.
 */
import { auth } from '@jp/contracts';

/**
 * La longueur vient du CONTRAT, elle n'est plus recopiée ici.
 *
 * `auth.otpCode` et ces cases dérivent de la même constante : elles ne peuvent
 * plus diverger. Un commentaire qui dit « six, comme le contrat » ne protège
 * de rien — il documente la duplication au lieu de l'éviter.
 */
export const DIGIT_COUNT = auth.OTP_LENGTH;

export type Boxes = readonly string[];

/** Six cases vides. */
export function emptyBoxes(): Boxes {
  return Array.from({ length: DIGIT_COUNT }, () => '');
}

/**
 * Ne garde que les chiffres d'un texte collé, et pas plus que six.
 *
 * Une boîte mail rend rarement « 482153 » tout nu : on récupère « 482 153 »,
 * « Code : 482153 » ou un retour à la ligne. Filtrer plutôt que refuser évite
 * de renvoyer la personne à sa souris.
 */
export function digitsOf(text: string): string {
  return [...text]
    .filter((c) => c >= '0' && c <= '9')
    .join('')
    .slice(0, DIGIT_COUNT);
}

/**
 * Écrit un texte à partir d'une case donnée, en débordant sur les suivantes.
 *
 * Sert aux deux gestes : une frappe (un caractère) et un collage (six). Le
 * même chemin de code pour les deux, donc pas de divergence entre eux.
 */
export function setBox(boxes: Boxes, index: number, text: string): Boxes {
  const digits = digitsOf(text);
  const result = [...boxes];
  for (let i = 0; i < digits.length && index + i < DIGIT_COUNT; i += 1) {
    result[index + i] = digits[i] as string;
  }
  return result;
}

/** Vide une case. Le retour arrière ne doit pas décaler les autres. */
export function clearBox(boxes: Boxes, index: number): Boxes {
  const result = [...boxes];
  result[index] = '';
  return result;
}

/** La case qui doit recevoir le curseur après une saisie à `index`. */
export function nextBox(index: number, text: string): number {
  const step = Math.max(1, digitsOf(text).length);
  return Math.min(index + step, DIGIT_COUNT - 1);
}

/** Le code tel qu'il part au serveur — vide tant qu'il n'est pas complet. */
export function assembledCode(boxes: Boxes): string {
  return boxes.join('');
}

export function isComplete(boxes: Boxes): boolean {
  return assembledCode(boxes).length === DIGIT_COUNT;
}
