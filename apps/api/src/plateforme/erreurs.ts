/**
 * Erreurs à code stable et enveloppe de réponse
 *
 * Une erreur porte un code en majuscules, un message traduit, et l’action
 * possible. Le code est **stable** : les clients s’y fient.
 */

export class ErreurMetier extends Error {
  override readonly name = 'ErreurMetier';
  constructor(
    readonly code: string,
    readonly statut: number,
    message: string,
  ) {
    super(message);
  }
}
