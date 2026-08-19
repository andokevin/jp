/**
 * Le client API — S8.3
 *
 * Trois choses que ce fichier fait, et qu'aucun écran ne doit refaire :
 *
 *   1. **poser `Idempotency-Key` automatiquement** sur toute écriture. Un
 *      écran qui l'oublierait ouvrirait un trou dans RB10 — et ça ne se
 *      verrait qu'en production, sur un double prélèvement.
 *   2. **remonter l'enveloppe d'erreur telle quelle**. Le message est déjà
 *      traduit par le serveur : le traduire ici dupliquerait les catalogues.
 *   3. **détecter le hors ligne** et le distinguer d'une panne serveur. Ce
 *      n'est pas la même chose et ça ne se raconte pas pareil.
 */
import { EN_TETES, type Erreur } from '@jp/contracts';
import { LANGUE_PAR_DEFAUT, type Langue } from '@jp/i18n';

export class HorsLigne extends Error {
  override readonly name = 'HorsLigne';
}

export interface EtatSession {
  readonly jeton: string;
  readonly expireLe: number;
}

export interface OptionsClient {
  readonly base: string;
  readonly langue?: Langue;
  readonly economieDonnees?: boolean;
  readonly session?: () => EtatSession | null;
  readonly fetch?: typeof fetch;
  /** Le générateur de clés. Injectable pour rendre les tests déterministes. */
  readonly nouvelleCle?: () => string;
}

const METHODES_ECRITURE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ClientApi {
  private readonly f: typeof fetch;
  private readonly nouvelleCle: () => string;

  constructor(private readonly options: OptionsClient) {
    this.f = options.fetch ?? globalThis.fetch;
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
      [EN_TETES.langue]: this.options.langue ?? LANGUE_PAR_DEFAUT,
    };
    if (this.options.economieDonnees) enTetes[EN_TETES.economieDonnees] = '1';

    const session = this.options.session?.();
    if (session) enTetes['Authorization'] = `Bearer ${session.jeton}`;

    // ── Le point qui compte : la clé, posée ici et nulle part ailleurs ──
    if (METHODES_ECRITURE.has(methode.toUpperCase())) {
      enTetes[EN_TETES.idempotence] = cleIdempotence ?? this.nouvelleCle();
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
    if (!reponse.ok) throw lu as Erreur;
    return lu as T;
  }

  lire<T>(chemin: string): Promise<T> {
    return this.appeler<T>('GET', chemin);
  }

  ecrire<T>(chemin: string, corps: unknown, cle?: string): Promise<T> {
    return this.appeler<T>('POST', chemin, corps, cle);
  }
}
