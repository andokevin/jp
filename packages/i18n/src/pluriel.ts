/**
 * Le pluriel, en anglais et en français
 *
 * Les deux langues accordent en nombre, mais **pas au même seuil**. Le
 * français écrit « 0 article » au SINGULIER, l'anglais « 0 articles » au
 * pluriel. C'est le genre de détail qui trahit une traduction faite à la
 * hâte, et il ne coûte qu'une condition.
 *
 * Une bibliothèque de pluralisation généraliste apporterait ici des règles
 * pour quarante langues dont nous n'en parlons que deux. Deux fonctions
 * suffisent.
 */
import type { Langue } from './langues.js';

export type FormesPluriel = {
  readonly un: string;
  readonly plusieurs: string;
};

/**
 * Choisit la forme, **sans insérer le nombre** — l'appelant décide de la mise
 * en page, qui n'est pas la même dans une liste et dans une phrase.
 *
 * Français : singulier pour 0 et 1. Anglais : singulier pour 1 seulement.
 */
export function forme(langue: Langue, nombre: number, formes: FormesPluriel): string {
  const n = Math.abs(nombre);
  if (langue === 'fr') return n < 2 ? formes.un : formes.plusieurs;
  return n === 1 ? formes.un : formes.plusieurs;
}

/** « 2 articles » · « 1 article » · « 0 article » — et « 0 items » en anglais. */
export function accorder(langue: Langue, nombre: number, formes: FormesPluriel): string {
  return `${nombre} ${forme(langue, nombre, formes)}`;
}
