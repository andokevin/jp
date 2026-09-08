/**
 * Limitation de débit — S3.6 · R-C11
 *
 * Trois compteurs indépendants, et il faut les trois :
 *
 *   · par IDENTITÉ  — empêche un compte de marteler une route
 *   · par ADRESSE   — empêche quelqu'un sans compte de le faire
 *   · par CIBLE     — empêche d'essayer mille adresses différentes depuis
 *                     mille adresses IP différentes (R-C7)
 *
 * Le troisième est le seul qui protège contre l'énumération de comptes : les
 * deux premiers laissent passer une attaque distribuée qui n'essaie chaque
 * adresse qu'une fois.
 *
 * **Le stockage est en mémoire pour l'instant.** Redis prendra le relais à
 * `S5` : le contrat ci-dessous ne changera pas, seul le magasin. Un compteur
 * en mémoire ne tient pas sur plusieurs instances — c'est acceptable tant
 * qu'il n'y en a qu'une, et le noter ici évite de le découvrir en production.
 */

export interface Verdict {
  readonly autorise: boolean;
  /** Secondes avant la prochaine tentative permise. */
  readonly attendreS: number;
  readonly restantes: number;
}

export interface MagasinDebit {
  incrementer(cle: string, fenetreMs: number): Promise<{ compte: number; expireDansMs: number }>;
  reinitialiser(cle: string): Promise<void>;
}

/** Magasin en mémoire. Remplacé par Redis à `S5`. */
export class MagasinMemoire implements MagasinDebit {
  private readonly compteurs = new Map<string, { compte: number; expiresAt: number }>();

  async incrementer(cle: string, fenetreMs: number) {
    const maintenant = Date.now();
    const actuel = this.compteurs.get(cle);
    if (!actuel || actuel.expiresAt <= maintenant) {
      const neuf = { compte: 1, expiresAt: maintenant + fenetreMs };
      this.compteurs.set(cle, neuf);
      return { compte: 1, expireDansMs: fenetreMs };
    }
    actuel.compte += 1;
    return { compte: actuel.compte, expireDansMs: actuel.expiresAt - maintenant };
  }

  async reinitialiser(cle: string) {
    this.compteurs.delete(cle);
  }

  /** Retire les entrées expirées. Sans ça, la carte grossit indéfiniment. */
  nettoyer(): number {
    const maintenant = Date.now();
    let retirees = 0;
    for (const [cle, v] of this.compteurs) {
      if (v.expiresAt <= maintenant) {
        this.compteurs.delete(cle);
        retirees++;
      }
    }
    return retirees;
  }
}

export interface RegleDebit {
  readonly max: number;
  readonly fenetreMs: number;
}

export class Limiteur {
  constructor(private readonly magasin: MagasinDebit = new MagasinMemoire()) {}

  async verifier(cle: string, regle: RegleDebit): Promise<Verdict> {
    const { compte, expireDansMs } = await this.magasin.incrementer(cle, regle.fenetreMs);
    return {
      autorise: compte <= regle.max,
      attendreS: Math.ceil(expireDansMs / 1000),
      restantes: Math.max(0, regle.max - compte),
    };
  }

  /** Après une réussite, on remet le compteur à zéro : la personne est légitime. */
  async reussi(cle: string): Promise<void> {
    await this.magasin.reinitialiser(cle);
  }
}

/**
 * Les règles transverses. Les règles propres à l'authentification viennent des
 * paramètres (`otp_max_par_heure`), pas d'ici : elles doivent être ajustables
 * pendant le pilote sans déploiement *(R-O1)*.
 */
export const REGLES = {
  /** Défaut sur toute route d'écriture. */
  ecriture: { max: 60, fenetreMs: 60_000 },
  /** Défaut sur toute route de lecture. */
  lecture: { max: 300, fenetreMs: 60_000 },
} as const satisfies Record<string, RegleDebit>;
