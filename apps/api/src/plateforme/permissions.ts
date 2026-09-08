/**
 * Permissions — S3.4 · **les DEUX outils**
 *
 * Une garde de route dit *qui entre*. Elle ne dit pas *ce qu'il voit*.
 *
 * Une employée `VE` a le droit de consulter une commande — mais pas d'y voir
 * la marge du vendeur ni le montant encaissé *(R-R8, matrice §3.2)*. Une garde
 * seule laisse passer la requête entière, marge comprise, et la fuite ne se
 * voit nulle part : la réponse est un JSON de plus.
 *
 * D'où deux outils séparés, dès le premier module :
 *
 *   `garde`     décide qui entre        → lève 403
 *   `projeter`  décide ce qui sort      → retire des champs
 *
 * Séparés maintenant, ou jamais. Le premier module qui n'aura que la garde
 * fixera l'habitude, et les quinze suivants la recopieront.
 */
import { erreurs } from './erreurs.js';

/**
 * Les rôles, tels que la matrice des droits du cahier des charges les nomme.
 * Un compte peut en porter plusieurs — une vendeuse est aussi acheteuse.
 */
export const ROLES = [
  'visiteur',
  'acheteur',
  'vendeur',
  'employe_vendeur',
  'createur',
  'livreur',
  'point_relais',
  'moderateur',
  'operateur',
] as const;

export type Role = (typeof ROLES)[number];

export interface Acteur {
  readonly userId: string;
  readonly roles: readonly Role[];
  /** Le vendeur pour le compte duquel un employé agit. */
  readonly pourVendeurId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Outil 1 — la garde : qui entre
// ═══════════════════════════════════════════════════════════════════════════

export function aRole(acteur: Acteur, ...roles: readonly Role[]): boolean {
  return roles.some((r) => acteur.roles.includes(r));
}

/** Lève 403 si l'acteur n'a aucun des rôles demandés. */
export function garde(acteur: Acteur, ...roles: readonly Role[]): void {
  if (!aRole(acteur, ...roles)) throw erreurs.nonAutorise();
}

/** Lève 403 si l'acteur n'est pas la personne visée, ni un opérateur JP. */
export function gardeSoiMeme(acteur: Acteur, userId: string): void {
  if (acteur.userId !== userId && !aRole(acteur, 'operateur')) {
    throw erreurs.nonAutorise();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Outil 2 — la projection : ce qui sort
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retire des champs d'un objet **avant** qu'il ne parte au client.
 *
 * Retirer plutôt que sélectionner est délibéré : avec une liste blanche, un
 * champ ajouté demain serait absent de toutes les réponses et le défaut se
 * verrait tout de suite. Avec une liste noire, il serait exposé en silence.
 *
 * On a choisi la liste noire parce que les cas de masquage sont rares et
 * nommés — et pour que le manquement soit visible en revue : `projeter` sans
 * argument saute aux yeux, un `select` incomplet non.
 */
export function sansChamps<T extends object, C extends keyof T>(
  objet: T,
  champs: readonly C[],
): Omit<T, C> {
  const copie = { ...objet };
  for (const champ of champs) delete copie[champ];
  return copie;
}

/**
 * **Les champs qu'un employé de vendeur ne voit jamais** *(R-R8)*.
 *
 * Cette liste est le cœur de la règle : elle est ici, en un seul endroit, et
 * chaque module qui renvoie un objet la consulte. Répétée dans quinze
 * modules, elle serait incomplète dans trois d'entre eux.
 */
export const MASQUES_EMPLOYE = [
  'montantTotal',
  'montantNet',
  'commission',
  'marge',
  'prixAchat',
  'montantEncaisse',
] as const;

/**
 * Projette selon l'acteur. **À appeler sur toute réponse qui contient de
 * l'argent** et qu'un employé peut atteindre.
 */
export function projeterCommande<T extends object>(acteur: Acteur, commande: T): Partial<T> {
  if (aRole(acteur, 'employe_vendeur') && !aRole(acteur, 'vendeur', 'operateur')) {
    // Les champs masqués sont nommés par leur chaîne : `T` n'a aucune raison
    // de tous les porter, et on ne veut pas contraindre chaque appelant à
    // déclarer une marge qu'il n'a pas.
    const copie = { ...commande } as Record<string, unknown>;
    for (const champ of MASQUES_EMPLOYE) delete copie[champ];
    return copie as Partial<T>;
  }
  return commande;
}

/** Un acteur sans compte — une visiteuse *(F0.10)*. */
export const VISITEUR: Acteur = { userId: '', roles: ['visiteur'] };
