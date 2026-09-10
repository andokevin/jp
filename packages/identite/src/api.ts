/**
 * Le client d'identité — F0.1
 *
 * Réduit aux deux appels du parcours d'authentification, et **partagé par les
 * deux clients** : il n'utilise que `fetch`, que React Native fournit comme le
 * navigateur. Il a vécu dans `apps/web` le temps d'un sprint ; l'écran natif
 * aurait dû en écrire un jumeau, avec les mêmes trois pièges à retrouver.
 *
 * Trois choses qu'il fait, et qu'aucun écran ne refait :
 *
 *   1. **poser `Idempotency-Key`** sur chaque écriture *(RB10)* ;
 *   2. **annoncer la langue** — le serveur traduit lui-même ses messages, donc
 *      un `Accept-Language: mg` suffit à faire revenir les erreurs en
 *      malgache. Retraduire ici dupliquerait les catalogues ;
 *   3. **distinguer le hors ligne d'une panne serveur** : `fetch` ne rejette
 *      que sur un problème réseau ; une 500 est une réponse. Les deux ne se
 *      racontent pas pareil, et sur un réseau malgache la différence est
 *      quotidienne.
 *
 * `fetch` et le générateur de clés sont injectables — c'est ce qui rend les
 * tests déterministes sans simulacre de module.
 */
import { auth, HEADERS, type ApiError } from '@jp/contracts';
import { DEFAULT_LANGUAGE, type Language } from '@jp/i18n';

/** Levée quand la requête n'est jamais partie. À ne pas confondre avec une erreur du serveur. */
export class Offline extends Error {
  override readonly name = 'Offline';
}

export interface IdentityClientOptions {
  readonly base: string;
  readonly language?: Language;
  readonly fetch?: typeof fetch;
  /** Injectable pour rendre les tests déterministes. */
  readonly newKey?: () => string;
  /**
   * When true, sends `X-Data-Saver: 1` on every request so the server can
   * trim optional payload fields. The signal is opt-in : callers that
   * don't pass this option get the full response, unchanged.
   *
   * Wired from `magasin.lire(CLES.economieDonnees)` on mobile ; the web
   * client leaves it unset for now (there is no OS-level data-saving mode
   * to inherit from).
   */
  readonly dataSaver?: boolean;
}

export class IdentityClient {
  private readonly f: typeof fetch;
  private readonly newKey: () => string;

  constructor(private readonly options: IdentityClientOptions) {
    // `.bind(globalThis)` n'est pas décoratif : dans un navigateur, `fetch`
    // appelé avec un autre `this` que la fenêtre lève « Illegal invocation ».
    // Rangé tel quel dans un champ puis appelé en `this.f(…)`, il échouerait à
    // chaque requête — et comme l'échec est un `TypeError`, il ressemblerait
    // trait pour trait à une coupure réseau. On afficherait « pas de
    // connexion » à quelqu'un de parfaitement connecté.
    this.f = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.newKey = options.newKey ?? (() => crypto.randomUUID());
  }

  /** La langue courante, telle qu'elle part dans `Accept-Language`. */
  get language(): Language {
    return this.options.language ?? DEFAULT_LANGUAGE;
  }

  /**
   * Étape 1 — demande d'un code à six chiffres.
   *
   * **La réponse est la même que le compte existe ou non** *(R-C9)* : l'écran
   * ne doit donc jamais chercher à y lire l'existence d'un compte.
   */
  async requestCode(email: string): Promise<auth.OtpResponse> {
    const brut = await this.post('/identite/otp/emettre', { email });
    return auth.OtpResponseSchema.parse(brut);
  }

  /**
   * Étape 2 — vérification du code, qui ouvre la session et crée le compte si
   * l'adresse est inconnue. `prenom` n'est envoyé qu'à l'inscription.
   */
  async verifyCode(params: {
    readonly email: string;
    readonly code: string;
    readonly prenom?: string;
  }): Promise<auth.SessionResponse> {
    const body: Record<string, unknown> = {
      email: params.email,
      code: params.code,
      langue: this.language,
    };
    if (params.prenom !== undefined) body['prenom'] = params.prenom;

    const brut = await this.post('/identite/otp/verifier', body);
    return auth.SessionResponseSchema.parse(brut);
  }

  private async post(path: string, body: unknown): Promise<unknown> {
    let response: Response;
    try {
      response = await this.f(`${this.options.base}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [HEADERS.language]: this.language,
          // La clé est posée ICI et nulle part ailleurs : un écran qui
          // l'oublierait ouvrirait un trou dans RB10, invisible jusqu'au jour
          // où un renvoi de code compterait double.
          [HEADERS.idempotency]: this.newKey(),
          // The data-saver header is CONDITIONAL. Sending `X-Data-Saver: 0`
          // when disabled would be a lie — the standard reads the mere
          // presence of the header as opt-in, so absence IS the opt-out.
          ...(this.options.dataSaver ? { [HEADERS.dataSaver]: '1' } : {}),
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Offline('pas de connexion');
    }

    const lu: unknown = await response.json().catch(() => null);
    // L'enveloppe est remontée telle quelle : son `message` est déjà traduit
    // par le serveur, dans la langue que nous venons de lui annoncer.
    if (!response.ok) throw lu as ApiError;
    return lu;
  }
}
