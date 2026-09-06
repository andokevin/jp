/**
 * Les trois langues du projet
 *
 * **Le français produit des libellés environ 20 % plus longs que l'anglais.**
 * « Confirm » contre « Confirmer la réception ». Ce n'est pas un détail de
 * traduction, c'est une contrainte de maquette : un bouton dessiné à la
 * largeur de l'anglais déborde en français.
 *
 * Le français est la langue PAR DÉFAUT : c'est la langue écrite courante à
 * Madagascar — administration, commerce, réseaux sociaux. Le malgache est la
 * langue PARLÉE, et celle que les écrans proposent en premier ; il reste second
 * ici parce qu'un en-tête `Accept-Language` illisible doit retomber sur ce que
 * le serveur sait rendre partout.
 *
 * Ce fichier est la SEULE définition des langues. `@jp/money` y prend son
 * type au lieu de le redéclarer, et l'API y prend la lecture de l'en-tête
 * `Accept-Language`. Deux définitions du même concept divergent toujours,
 * tôt ou tard.
 */

export const LANGUES = ['en', 'fr', 'mg'] as const;

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

/**
 * Même marge, pour le malgache : **30 %**.
 *
 * « Continue » contre « Tohizana », mais surtout « Enter your code » contre
 * « Ampidiro ny kaody ». L'écart est plus fort qu'en français, et c'est lui qui
 * décide de la largeur des boutons : une maquette dessinée à la longueur
 * malgache tient en français, l'inverse tronque *(EP00 §6)*.
 */
export const RALLONGEMENT_MALGACHE = 1.3;

export function estLangue(valeur: unknown): valeur is Langue {
  return typeof valeur === 'string' && (LANGUES as readonly string[]).includes(valeur);
}

/**
 * Lit un en-tête HTTP `Accept-Language` et en tire une de nos trois langues.
 *
 * Volontairement simple : ni poids `q=`, ni négociation de variantes
 * régionales au-delà du préfixe. Nous n'avons que trois langues — un analyseur
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
