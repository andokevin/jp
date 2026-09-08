/**
 * La langue de l'appareil — S8
 *
 * **Une seule fonction, et elle ne lit pas l'appareil.** Elle reçoit la liste
 * d'étiquettes de locale et rend une de nos trois langues. La lecture native
 * (`expo-localization`) est faite par l'appelant : c'est ce qui rend cette
 * décision testable sans simulateur, et ce qui garde `vitest` à l'écart d'un
 * module natif qu'il ne saurait pas charger.
 *
 * **Aucun analyseur n'est écrit ici.** Une liste de locales ordonnée par
 * préférence a exactement la forme d'un `Accept-Language` — « la première que
 * tu connais gagne » — et `languageFromHeader` de `@jp/i18n` sait déjà le
 * faire, poids `q=` ignorés compris. Le seul travail est de joindre les
 * étiquettes par des virgules. Écrire un second analyseur pour la même
 * décision, c'est signer pour deux réponses différentes à
 * « quelle langue ? » : une côté serveur, une côté appareil.
 */
import { languageFromHeader, DEFAULT_LANGUAGE, type Language } from '@jp/i18n';

/**
 * @param etiquettes les locales de l'appareil, **dans l'ordre de préférence** —
 *        `['mg-MG', 'fr-FR']` tel que `Localization.getLocales()` les rend.
 */
export function langueDepuisEtiquettes(etiquettes: readonly string[]): Language {
  if (etiquettes.length === 0) return DEFAULT_LANGUAGE;
  return languageFromHeader(etiquettes.join(','));
}
