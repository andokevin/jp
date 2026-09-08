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
import type { Language } from './languages.js';

export type PluralForms = {
  readonly one: string;
  readonly many: string;
};

/**
 * Choisit la forme, **sans insérer le nombre** — l'appelant décide de la mise
 * en page, qui n'est pas la même dans une liste et dans une phrase.
 *
 * Français : singulier pour 0 et 1. Anglais : singulier pour 1 seulement.
 */
export function form(language: Language, count: number, forms: PluralForms): string {
  const n = Math.abs(count);
  if (language === 'fr') return n < 2 ? forms.one : forms.many;
  return n === 1 ? forms.one : forms.many;
}

/** « 2 articles » · « 1 article » · « 0 article » — et « 0 items » en anglais. */
export function agree(language: Language, count: number, forms: PluralForms): string {
  return `${count} ${form(language, count, forms)}`;
}
