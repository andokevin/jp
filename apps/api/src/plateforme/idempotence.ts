/**
 * Rejeu sans second effet
 *
 * En-tête `Idempotency-Key` obligatoire sur toute écriture financière, clé
 * conservée 24 h, rejeu renvoyant le résultat initial *(R-M2)*.
 *
 * **RB10 se joue ici**, pas dans le module paiement. Ajoutée après coup,
 * l’idempotence serait réimplémentée par domaine, avec trois comportements
 * différents.
 */

export const idempotence = {} as const;
