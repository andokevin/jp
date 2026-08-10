/**
 * Les deux langues
 *
 * **Le malgache produit des libellés environ 30 % plus longs que le
 * français.** C’est une contrainte de maquette, pas un détail de
 * traduction : un bouton qui tient en français déborde en malgache.
 */

export const LANGUES = ['mg', 'fr'] as const;

export type Langue = (typeof LANGUES)[number];

export const LANGUE_PAR_DEFAUT: Langue = 'mg';

/** Marge de sécurité à prévoir sur toute chaîne traduite. */
export const RALLONGEMENT_MALGACHE = 1.3;
