/**
 * @jp/admin — le back-office JP — S9.1
 *
 * L'outil de l'équipe. **Sans lui, personne ne peut vérifier un vendeur ni
 * arbitrer un litige** — il n'est pas optionnel, il est dans la tranche 1.
 *
 * Coquille : disposition, navigation, tableau paginé réutilisable, et le
 * journal d'audit visible. Les écrans arrivent avec l'épique 11.
 */
import { HEADERS, type ApiError, type Page } from '@jp/contracts';
import { DEFAULT_LANGUAGE, type Language } from '@jp/i18n';

export const ECRANS = [
  { chemin: '/verifications', titre: 'File de vérification des vendeurs', issue: 'F11.1' },
  { chemin: '/litiges', titre: "Console d'arbitrage", issue: 'F11.3' },
  { chemin: '/relais', titre: 'Réseau de points relais', issue: 'F11.4' },
  { chemin: '/reconciliation', titre: 'Réconciliation des paiements', issue: 'F11.5' },
  { chemin: '/parametres', titre: 'Paramètres économiques', issue: 'F11.6' },
  { chemin: '/recherche', titre: 'Recherche', issue: 'F11.8' },
  { chemin: '/audit', titre: "Journal d'audit", issue: 'F11.9' },
  { chemin: '/pilote', titre: 'Tableau de bord du pilote', issue: 'F11.7' },
] as const;

export interface Session {
  readonly jeton: string;
  readonly langue: Language;
}

/**
 * Le client API du back-office.
 *
 * Il pose l'en-tête de corrélation et remonte l'enveloppe d'erreur telle
 * quelle : le message est **déjà traduit par le serveur**, l'interface n'a
 * pas à le refaire.
 */
export class ClientApi {
  constructor(
    private readonly base: string,
    private session: Session | null = null,
  ) {}

  connecter(session: Session): void {
    this.session = session;
  }

  private enTetes(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      [HEADERS.language]: this.session?.langue ?? DEFAULT_LANGUAGE,
    };
    if (this.session) h['Authorization'] = `Bearer ${this.session.jeton}`;
    return h;
  }

  async lire<T>(chemin: string): Promise<T> {
    const r = await fetch(`${this.base}${chemin}`, { headers: this.enTetes() });
    const corps: unknown = await r.json();
    if (!r.ok) throw corps as ApiError;
    return corps as T;
  }

  /** Une page. Le curseur est opaque : on le renvoie tel quel. */
  async page<T>(chemin: string, curseur?: string): Promise<Page<T>> {
    const url = curseur ? `${chemin}?curseur=${encodeURIComponent(curseur)}` : chemin;
    return this.lire<Page<T>>(url);
  }
}

/**
 * Le tableau paginé, décrit et non rendu.
 *
 * **Il ne charge jamais tout.** Un back-office qui affiche « 12 000 lignes »
 * met une minute à s'ouvrir et fait tomber la base à chaque tri.
 */
export interface Colonne<T> {
  readonly cle: string;
  readonly titre: string;
  readonly rendu: (ligne: T) => string;
  /** Un montant s'aligne à droite : on compare les chiffres verticalement. */
  readonly alignement?: 'gauche' | 'droite';
}

export interface TableauPagine<T> {
  readonly colonnes: readonly Colonne<T>[];
  readonly page: Page<T>;
  readonly chargerSuite: () => Promise<void>;
}
