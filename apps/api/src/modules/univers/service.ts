/**
 * Univers — la logique métier
 *
 * Le service assemble **deux sources** :
 *
 *   · la BASE porte ce qui doit bouger sans déploiement — l'ouverture et le
 *     taux de commission, les deux leviers du pilote ;
 *   · le CODE porte ce qui change le produit — livraisons, champs de fiche,
 *     motifs de litige, provenance exigée. Ceux-là passent par une revue et
 *     un test avant de bouger.
 *
 * Ce partage est la décision de conception du module.
 */
import { universe as registre, openUniverses, type UniverseDefinition } from '@jp/contracts';
import type { PrismaClient } from '../../genere/prisma/client.js';

/** Un univers tel qu'il est vraiment : registre + état en base. */
export interface UniversResolu extends UniverseDefinition {
  /** Le taux EN BASE, qui peut différer de celui du registre. */
  readonly commissionEffective: number;
}

export const service = {
  /**
   * Les univers visibles. Ceux qui sont fermés n'apparaissent pas — ni ici, ni
   * dans la recherche, ni par un lien profond *(R-Y2)*.
   */
  async ouverts(db: PrismaClient): Promise<readonly UniversResolu[]> {
    const enBase = await db.universe.findMany({
      where: { isOpen: true },
      orderBy: { rank: 'asc' },
    });
    return enBase.flatMap((ligne) => {
      const def = registre(ligne.key);
      // Une ligne en base sans définition dans le registre est une incohérence
      // de déploiement : on l'ignore plutôt que de servir un univers sans
      // règles, qui laisserait passer n'importe quel motif de litige.
      return def ? [{ ...def, commissionEffective: ligne.commissionPerMille }] : [];
    });
  },

  /**
   * Un univers, s'il est ouvert. Rend `null` pour un univers fermé **comme
   * pour un inconnu** : on ne révèle pas qu'il existe.
   */
  async ouvert(db: PrismaClient, cle: string): Promise<UniversResolu | null> {
    const def = registre(cle);
    if (!def) return null;
    const ligne = await db.universe.findUnique({ where: { key: cle } });
    if (!ligne || !ligne.isOpen) return null;
    return { ...def, commissionEffective: ligne.commissionPerMille };
  },

  /**
   * Le taux à figer sur une commande *(R-Y3)*.
   *
   * Lu au moment de la création et **recopié dans la commande**. Un changement
   * de taux ne rétroactive jamais : on ne modifie pas un calcul après avoir
   * émis des factures.
   */
  async tauxCommission(db: PrismaClient, cle: string): Promise<number | null> {
    const u = await service.ouvert(db, cle);
    return u?.commissionEffective ?? null;
  },

  /** Les règles structurelles, qui viennent du code. */
  regles(cle: string): UniverseDefinition | undefined {
    return registre(cle);
  },

  /** Utile au back-office et aux tests : tout, ouverts comme fermés. */
  tous(): readonly UniverseDefinition[] {
    return [...openUniverses()];
  },
} as const;
