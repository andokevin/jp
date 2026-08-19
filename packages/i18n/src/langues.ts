/**
 * Les deux langues du projet
 *
 * **Le français produit des libellés environ 20 % plus longs que l'anglais.**
 * « Confirm » contre « Confirmer la réception ». Ce n'est pas un détail de
 * traduction, c'est une contrainte de maquette : un bouton dessiné à la
 * largeur de l'anglais déborde en français.
 *
 * Le français est la langue PAR DÉFAUT : c'est la langue écrite courante à
 * Madagascar — administration, commerce, réseaux sociaux.
 *
 * Ce fichier est la SEULE définition des langues. `@jp/money` y prend son
 * type au lieu de le redéclarer, et l'API y prend la lecture de l'en-tête
 * `Accept-Language`. Deux définitions du même concept divergent toujours,
 * tôt ou tard.
 */

export const LANGUES = ['en', 'fr'] as const;

export type Langue = (typeof LANGUES)[number];

export const LANGUE_PAR_DEFAUT: Langue = 'fr';

/**
 * Marge de largeur à prévoir sur toute chaîne traduite.
 *
 * Une maquette dessinée en anglais doit réserver 20 % de plus pour le
 * français, sinon le libellé est tronqué ou passe à la ligne. Cette valeur
 * est vérifiée par un test sur les catalogues : un libellé français qui
 * dépasse cette marge fait échouer la construction.
 */
export const RALLONGEMENT_FRANCAIS = 1.2;

export function estLangue(valeur: unknown): valeur is Langue {
  return typeof valeur === 'string' && (LANGUES as readonly string[]).includes(valeur);
}

/**
 * Lit un en-tête HTTP `Accept-Language` et en tire une de nos deux langues.
 *
 * Volontairement simple : ni poids `q=`, ni négociation de variantes
 * régionales au-delà du préfixe. Nous n'avons que deux langues — un analyseur
 * complet serait du code mort à maintenir.
 *
 * Tout ce qui n'est pas reconnu retombe sur le français, jamais sur une
 * erreur : un en-tête absent ou mal formé ne doit pas empêcher quelqu'un
 * d'utiliser l'application.
 */
export function langueDepuisEnTete(enTete: string | undefined | null): Langue {
  if (!enTete) return LANGUE_PAR_DEFAUT;
  for (const morceau of enTete.split(',')) {
    const code = morceau.split(';')[0]?.trim().toLowerCase().slice(0, 2);
    if (estLangue(code)) return code;
  }
  return LANGUE_PAR_DEFAUT;
}
