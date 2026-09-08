/**
 * Erreurs à code stable — S3.2
 *
 * Une erreur de l'API porte trois choses, et chacune a sa raison :
 *
 *   `code`     STABLE, en MAJUSCULES. Les clients s'y fient pour décider quoi
 *              faire. Il ne change jamais, même si le message change.
 *   `message`  DÉJÀ TRADUIT par le serveur, qui connaît la langue. Un client
 *              qui traduirait des codes dupliquerait les catalogues.
 *   `action`   ce que la personne PEUT faire. C'est ce qui distingue un refus
 *              utile d'un mur.
 *
 * « Code invalide » sans motif ni suite est un défaut, pas une simplification.
 */
import { translate, type MessageKey, type Language } from '@jp/i18n';
import type { ApiError } from '@jp/contracts';

/**
 * Une erreur attendue, qui décrit une situation prévue du domaine.
 *
 * À distinguer d'une exception non prévue : celle-ci se traduit en réponse
 * HTTP soignée, l'autre en 500 avec un identifiant de corrélation à citer.
 */
export class ErreurMetier extends Error {
  override readonly name = 'ErreurMetier';

  constructor(
    readonly code: string,
    readonly statut: number,
    readonly cleMessage: MessageKey,
    readonly options: {
      readonly variables?: Readonly<Record<string, string | number>>;
      readonly champs?: Readonly<Record<string, string>>;
      readonly action?: string;
    } = {},
  ) {
    super(`${code} (${statut})`);
  }

  /** Met l'erreur en forme pour la réponse, dans la langue de l'appelant. */
  versReponse(langue: Language, correlation?: string): ApiError {
    const enveloppe: ApiError = {
      code: this.code,
      message: translate(this.cleMessage, langue, this.options.variables),
    };
    if (this.options.action !== undefined) enveloppe.action = this.options.action;
    if (this.options.champs !== undefined) enveloppe.champs = { ...this.options.champs };
    if (correlation !== undefined) enveloppe.correlation = correlation;
    return enveloppe;
  }
}

/**
 * Les erreurs transverses. Chaque domaine ajoutera les siennes dans son
 * propre `erreurs.ts` — celles-ci ne concernent aucun domaine en particulier.
 */
export const erreurs = {
  requeteInvalide: (champs?: Readonly<Record<string, string>>) =>
    new ErreurMetier('REQUETE_INVALIDE', 400, 'error.invalid_request', {
      ...(champs ? { champs } : {}),
    }),

  nonAuthentifie: () => new ErreurMetier('NON_AUTHENTIFIE', 401, 'error.unauthenticated'),

  nonAutorise: () => new ErreurMetier('NON_AUTORISE', 403, 'error.unauthorized'),

  introuvable: () => new ErreurMetier('INTROUVABLE', 404, 'error.not_found'),

  conflit: () => new ErreurMetier('CONFLIT', 409, 'error.conflict'),

  debitDepasse: (duration: string) =>
    new ErreurMetier('DEBIT_DEPASSE', 429, 'error.rate_limited', { variables: { duration } }),

  cleIdempotenceManquante: () =>
    new ErreurMetier('CLE_IDEMPOTENCE_MANQUANTE', 400, 'error.idempotency_key_missing'),

  cleIdempotenceReutilisee: () =>
    new ErreurMetier('CLE_IDEMPOTENCE_REUTILISEE', 422, 'error.idempotency_key_reused'),

  /**
   * Deux requêtes simultanées portent la même clé. La première n'a pas encore
   * répondu — on ne peut ni rejouer sa réponse, ni exécuter deux fois.
   */
  requeteEnCours: () => new ErreurMetier('REQUETE_EN_COURS', 409, 'error.conflict'),
} as const;

/** Une erreur inattendue : on ne divulgue rien de son contenu au client. */
export function erreurInterne(correlation: string, langue: Language): ApiError {
  return {
    code: 'ERREUR_INTERNE',
    message: translate('error.unavailable', langue),
    correlation,
  };
}
