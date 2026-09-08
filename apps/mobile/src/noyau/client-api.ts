/**
 * Le client API — S8.3
 *
 * Trois choses que ce fichier fait, et qu'aucun écran ne doit refaire :
 *
 *   1. **poser `Idempotency-Key` automatiquement** sur toute écriture. Un
 *      écran qui l'oublierait ouvrirait un trou dans RB10 — et ça ne se
 *      verrait qu'en production, sur un double prélèvement.
 *   2. **remonter l'enveloppe d'erreur telle quelle**. Le message est déjà
 *      traduit par le serveur : le translate ici dupliquerait les catalogues.
 *   3. **détecter le hors ligne** et le distinguer d'une panne serveur. Ce
 *      n'est pas la même chose et ça ne se raconte pas pareil.
 */
import { HEADERS, type ApiError } from '@jp/contracts';
import { DEFAULT_LANGUAGE, type Language } from '@jp/i18n';

export class HorsLigne extends Error {
  override readonly name = 'HorsLigne';
}

/**
 * Le jeton en cours d'usage, tel que le client API en a besoin.
 *
 * À ne pas confondre avec `EtatSession` de `session.ts`, qui distingue
 * « aucune », « périmée » et « ouverte » : ici, on n'a que le cas ouvert —
 * le client n'appelle pas l'API sans jeton.
 */
export interface JetonEnCours {
  readonly token: string;
  readonly expiresAt: number;
}

export interface OptionsClient {
  readonly base: string;
  readonly langue?: Language;
  readonly economieDonnees?: boolean;
  readonly session?: () => JetonEnCours | null;
  readonly fetch?: typeof fetch;
  /** Le générateur de clés. Injectable pour rendre les tests déterministes. */
  readonly nouvelleCle?: () => string;
}

const METHODES_ECRITURE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ClientApi {
  private readonly f: typeof fetch;
  private readonly nouvelleCle: () => string;

  constructor(private readonly options: OptionsClient) {
    // `.bind(globalThis)` n'est pas décoratif. Rangé dans un champ puis appelé
    // en `this.f(…)`, `fetch` reçoit l'instance comme `this` — ce que le
    // `fetch` d'un NAVIGATEUR refuse : « Illegal invocation ». Sur Hermes, le
    // `fetch` de React Native est un polyfill JS ordinaire et ne s'en émeut
    // pas ; sur Expo Web, c'est le vrai `fetch` du navigateur et chaque
    // requête échouerait. Comme l'échec est un `TypeError`, le `catch`
    // ci-dessous le prendrait pour une coupure : on annoncerait « pas de
    // connexion » à quelqu'un de parfaitement connecté.
    this.f = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.nouvelleCle = options.nouvelleCle ?? (() => crypto.randomUUID());
  }

  /**
   * @param cleIdempotence à fournir SEULEMENT pour rejouer une requête
   *        précise — par exemple depuis la file hors ligne. Sinon une clé
   *        neuve est fabriquée.
   */
  async appeler<T>(
    methode: string,
    chemin: string,
    corps?: unknown,
    cleIdempotence?: string,
  ): Promise<T> {
    const enTetes: Record<string, string> = {
      'Content-Type': 'application/json',
      [HEADERS.language]: this.options.langue ?? DEFAULT_LANGUAGE,
    };
    if (this.options.economieDonnees) enTetes[HEADERS.dataSaver] = '1';

    const session = this.options.session?.();
    if (session) enTetes['Authorization'] = `Bearer ${session.token}`;

    // ── Le point qui compte : la clé, posée ici et nulle part ailleurs ──
    if (METHODES_ECRITURE.has(methode.toUpperCase())) {
      enTetes[HEADERS.idempotency] = cleIdempotence ?? this.nouvelleCle();
    }

    let reponse: Response;
    try {
      reponse = await this.f(`${this.options.base}${chemin}`, {
        method: methode,
        headers: enTetes,
        ...(corps !== undefined ? { body: JSON.stringify(corps) } : {}),
      });
    } catch {
      // `fetch` ne lève que sur un problème RÉSEAU. Une 500 est une réponse.
      throw new HorsLigne('pas de connexion');
    }

    const lu: unknown = await reponse.json().catch(() => null);
    if (!reponse.ok) throw lu as ApiError;
    return lu as T;
  }

  lire<T>(chemin: string): Promise<T> {
    return this.appeler<T>('GET', chemin);
  }

  ecrire<T>(chemin: string, corps: unknown, cle?: string): Promise<T> {
    return this.appeler<T>('POST', chemin, corps, cle);
  }
}
