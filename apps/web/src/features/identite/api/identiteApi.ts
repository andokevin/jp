/**
 * Le client d'identité — F0.1, côté web
 *
 * Même contrat que `apps/mobile/src/noyau/client-api.ts`, réduit aux deux
 * appels du parcours d'authentification. Trois choses qu'il fait, et qu'aucun
 * écran ne refait :
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
import { auth, EN_TETES, type Erreur } from '@jp/contracts';
import { LANGUE_PAR_DEFAUT, type Langue } from '@jp/i18n';

/** Levée quand la requête n'est jamais partie. À ne pas confondre avec une erreur du serveur. */
export class HorsLigne extends Error {
  override readonly name = 'HorsLigne';
}

export interface OptionsClientIdentite {
  readonly base: string;
  readonly langue?: Langue;
  readonly fetch?: typeof fetch;
  /** Injectable pour rendre les tests déterministes. */
  readonly nouvelleCle?: () => string;
}

export class ClientIdentite {
  private readonly f: typeof fetch;
  private readonly nouvelleCle: () => string;

  constructor(private readonly options: OptionsClientIdentite) {
    // `.bind(globalThis)` n'est pas décoratif : dans un navigateur, `fetch`
    // appelé avec un autre `this` que la fenêtre lève « Illegal invocation ».
    // Rangé tel quel dans un champ puis appelé en `this.f(…)`, il échouerait à
    // chaque requête — et comme l'échec est un `TypeError`, il ressemblerait
    // trait pour trait à une coupure réseau. On afficherait « pas de
    // connexion » à quelqu'un de parfaitement connecté.
    this.f = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.nouvelleCle = options.nouvelleCle ?? (() => crypto.randomUUID());
  }

  /** La langue courante, telle qu'elle part dans `Accept-Language`. */
  get langue(): Langue {
    return this.options.langue ?? LANGUE_PAR_DEFAUT;
  }

  /**
   * Étape 1 — demande d'un code à six chiffres.
   *
   * **La réponse est la même que le compte existe ou non** *(R-C9)* : l'écran
   * ne doit donc jamais chercher à y lire l'existence d'un compte.
   */
  async demanderCode(email: string): Promise<auth.ReponseOtp> {
    const brut = await this.poster('/identite/otp/emettre', { email });
    return auth.ReponseOtpSchema.parse(brut);
  }

  /**
   * Étape 2 — vérification du code, qui ouvre la session et crée le compte si
   * l'adresse est inconnue. `prenom` n'est envoyé qu'à l'inscription.
   */
  async verifierCode(params: {
    readonly email: string;
    readonly code: string;
    readonly prenom?: string;
  }): Promise<auth.ReponseSession> {
    const corps: Record<string, unknown> = {
      email: params.email,
      code: params.code,
      langue: this.langue,
    };
    if (params.prenom !== undefined) corps['prenom'] = params.prenom;

    const brut = await this.poster('/identite/otp/verifier', corps);
    return auth.ReponseSessionSchema.parse(brut);
  }

  private async poster(chemin: string, corps: unknown): Promise<unknown> {
    let reponse: Response;
    try {
      reponse = await this.f(`${this.options.base}${chemin}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [EN_TETES.langue]: this.langue,
          // La clé est posée ICI et nulle part ailleurs : un écran qui
          // l'oublierait ouvrirait un trou dans RB10, invisible jusqu'au jour
          // où un renvoi de code compterait double.
          [EN_TETES.idempotence]: this.nouvelleCle(),
        },
        body: JSON.stringify(corps),
      });
    } catch {
      throw new HorsLigne('pas de connexion');
    }

    const lu: unknown = await reponse.json().catch(() => null);
    // L'enveloppe est remontée telle quelle : son `message` est déjà traduit
    // par le serveur, dans la langue que nous venons de lui annoncer.
    if (!reponse.ok) throw lu as Erreur;
    return lu;
  }
}
