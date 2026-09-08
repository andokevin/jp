/**
 * Les quatre états — S7.3
 *
 * **Un écran qui n'a pas ses quatre états n'est pas fini.**
 *
 * Le rendre structurel coûte moins cher que de le rappeler en revue 266 fois.
 * D'où le type `State<T>` : un écran qui l'utilise ne peut PAS oublier un cas,
 * parce que TypeScript refuse un `switch` incomplet.
 *
 * Le quatrième — hors ligne — est celui qu'on oublie partout ailleurs, et
 * celui qui compte le plus ici : le réseau tombe, et il faut montrer ce qu'on
 * avait plutôt qu'une page blanche.
 */
import { translate, type Language } from '@jp/i18n';

export const STATES = ['chargement', 'vide', 'erreur', 'hors-ligne', 'charge'] as const;

export type StateName = (typeof STATES)[number];

export type State<T> =
  | { readonly name: 'chargement' }
  | { readonly name: 'vide' }
  | { readonly name: 'erreur'; readonly code: string; readonly message: string }
  | { readonly name: 'hors-ligne'; readonly keptData?: T }
  | { readonly name: 'charge'; readonly data: T };

/**
 * Déduit l'état à partir d'une réponse. Centralise la règle « une liste vide
 * n'est pas un chargement », qui traîne sinon dans chaque écran.
 */
export function stateFrom<T>(params: {
  readonly pending: boolean;
  readonly offline: boolean;
  readonly error?: { code: string; message: string };
  readonly data?: T;
  readonly isEmpty?: (data: T) => boolean;
}): State<T> {
  // L'ordre compte. Hors ligne AVANT erreur : une requête qui échoue faute de
  // réseau n'est pas une panne du serveur, et ne se raconte pas pareil.
  if (params.offline) {
    return params.data !== undefined
      ? { name: 'hors-ligne', keptData: params.data }
      : { name: 'hors-ligne' };
  }
  if (params.error) return { name: 'erreur', ...params.error };
  if (params.pending) return { name: 'chargement' };
  if (params.data === undefined) return { name: 'chargement' };

  const empty = params.isEmpty
    ? params.isEmpty(params.data)
    : Array.isArray(params.data) && params.data.length === 0;
  return empty ? { name: 'vide' } : { name: 'charge', data: params.data };
}

/** Le message à afficher, traduit. Jamais de texte en dur dans un écran. */
export function stateMessage<T>(state: State<T>, language: Language): string | null {
  switch (state.name) {
    case 'chargement':
      return translate('state.loading', language);
    case 'vide':
      return translate('state.empty', language);
    case 'erreur':
      return state.message;
    case 'hors-ligne':
      return translate('state.offline', language);
    case 'charge':
      return null;
  }
}

/** Vrai si l'écran doit montrer des données, même périmées. */
export function hasSomethingToShow<T>(state: State<T>): boolean {
  return state.name === 'charge' || (state.name === 'hors-ligne' && state.keptData !== undefined);
}
