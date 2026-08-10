/**
 * Contrat — ce que partagent tous les domaines
 *
 * Pagination par curseur, enveloppe d’erreur, en-têtes. Rempli par `S2`.
 */

export const EN_TETES = {
  idempotence: 'Idempotency-Key',
  correlation: 'X-Correlation-Id',
  langue: 'Accept-Language',
  economieDonnees: 'X-Economie-Donnees',
} as const;
