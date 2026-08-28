/**
 * Univers — accès aux données
 *
 * Les seules requêtes SQL du domaine. **Interne au module** : aucun autre
 * module n'a le droit d'importer ce fichier, la règle est appliquée par ESLint.
 */
import type { PrismaClient } from '../../genere/prisma/client.js';

export const depot = {
  /**
   * Ouvre ou ferme un univers *(R-Y2, R-Y12)*.
   *
   * **Fermer ne supprime rien** : les articles restent, les commandes en cours
   * se terminent, les nouvelles publications sont refusées. Une fermeture qui
   * effacerait le catalogue serait irréversible pour un geste réversible.
   */
  async basculerOuverture(db: PrismaClient, cle: string, ouvert: boolean) {
    return db.univers.update({ where: { cle }, data: { ouvert } });
  },

  async changerCommission(db: PrismaClient, cle: string, pourMille: number) {
    return db.univers.update({ where: { cle }, data: { commissionPourMille: pourMille } });
  },
} as const;
