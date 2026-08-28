/**
 * Les quatre états — S7.3
 *
 * **Un écran qui n'a pas ses quatre états n'est pas fini.**
 *
 * Le rendre structurel coûte moins cher que de le rappeler en revue 266 fois.
 * D'où le type `Etat<T>` : un écran qui l'utilise ne peut PAS oublier un cas,
 * parce que TypeScript refuse un `switch` incomplet.
 *
 * Le quatrième — hors ligne — est celui qu'on oublie partout ailleurs, et
 * celui qui compte le plus ici : le réseau tombe, et il faut montrer ce qu'on
 * avait plutôt qu'une page blanche.
 */
import { traduire, type Langue } from '@jp/i18n';

export const ETATS = ['chargement', 'vide', 'erreur', 'hors-ligne', 'charge'] as const;

export type NomEtat = (typeof ETATS)[number];

export type Etat<T> =
  | { readonly nom: 'chargement' }
  | { readonly nom: 'vide' }
  | { readonly nom: 'erreur'; readonly code: string; readonly message: string }
  | { readonly nom: 'hors-ligne'; readonly donneesGardees?: T }
  | { readonly nom: 'charge'; readonly donnees: T };

/**
 * Déduit l'état à partir d'une réponse. Centralise la règle « une liste vide
 * n'est pas un chargement », qui traîne sinon dans chaque écran.
 */
export function etatDepuis<T>(params: {
  readonly enCours: boolean;
  readonly horsLigne: boolean;
  readonly erreur?: { code: string; message: string };
  readonly donnees?: T;
  readonly estVide?: (donnees: T) => boolean;
}): Etat<T> {
  // L'ordre compte. Hors ligne AVANT erreur : une requête qui échoue faute de
  // réseau n'est pas une panne du serveur, et ne se raconte pas pareil.
  if (params.horsLigne) {
    return params.donnees !== undefined
      ? { nom: 'hors-ligne', donneesGardees: params.donnees }
      : { nom: 'hors-ligne' };
  }
  if (params.erreur) return { nom: 'erreur', ...params.erreur };
  if (params.enCours) return { nom: 'chargement' };
  if (params.donnees === undefined) return { nom: 'chargement' };

  const vide = params.estVide
    ? params.estVide(params.donnees)
    : Array.isArray(params.donnees) && params.donnees.length === 0;
  return vide ? { nom: 'vide' } : { nom: 'charge', donnees: params.donnees };
}

/** Le message à afficher, traduit. Jamais de texte en dur dans un écran. */
export function messageEtat<T>(etat: Etat<T>, langue: Langue): string | null {
  switch (etat.nom) {
    case 'chargement':
      return traduire('etat.chargement', langue);
    case 'vide':
      return traduire('etat.vide', langue);
    case 'erreur':
      return etat.message;
    case 'hors-ligne':
      return traduire('etat.hors_ligne', langue);
    case 'charge':
      return null;
  }
}

/** Vrai si l'écran doit montrer des données, même périmées. */
export function aQuelqueChoseAMontrer<T>(etat: Etat<T>): boolean {
  return etat.nom === 'charge' || (etat.nom === 'hors-ligne' && etat.donneesGardees !== undefined);
}
