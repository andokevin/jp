/**
 * Contrat — ce que partagent tous les domaines
 *
 * **La source unique du contrat API.** Le serveur valide avec ces schémas,
 * les clients infèrent leurs types depuis eux. Un changement ici doit casser
 * la compilation des clients : c'est la preuve que le contrat est réellement
 * partagé, et non recopié de part et d'autre.
 *
 * Trois choses vivent ici, parce qu'elles traversent tous les domaines :
 * la pagination, l'enveloppe d'erreur, et les en-têtes.
 */
import { z } from 'zod';
import { LANGUAGES } from '@jp/i18n';

// ═══════════════════════════════════════════════════════════════════════════
// En-têtes
// ═══════════════════════════════════════════════════════════════════════════

export const EN_TETES = {
  /** Obligatoire sur toute écriture financière — RB10. */
  idempotence: 'Idempotency-Key',
  /** Suit une requête à travers l'API, les files et le WebSocket. */
  correlation: 'X-Correlation-Id',
  langue: 'Accept-Language',
  /** Le client demande des images dégradées et pas de préchargement vidéo. */
  economieDonnees: 'X-Economie-Donnees',
} as const;

export const langueSchema = z.enum(LANGUAGES);

// ═══════════════════════════════════════════════════════════════════════════
// Pagination par CURSEUR, jamais par numéro de page
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pourquoi pas `?page=3` : sur un jeu de données qui bouge — et un catalogue
 * bouge en permanence — un décalage saute ou répète des lignes. Une acheteuse
 * qui fait défiler pendant qu'un article se vend verrait un doublon ou un
 * trou. Le curseur pointe sur une position stable.
 *
 * Le curseur est OPAQUE : le client le renvoie tel quel sans jamais
 * l'interpréter. Cela nous laisse changer sa composition — clé, horodatage,
 * les deux — sans casser un seul client.
 */
export const TAILLE_PAGE_DEFAUT = 20;

/** Plafond volontairement bas : réseau lent et Android d'entrée de gamme (C1, C2). */
export const TAILLE_PAGE_MAX = 50;

export const paginationSchema = z.object({
  curseur: z.string().min(1).optional(),
  taille: z.coerce.number().int().min(1).max(TAILLE_PAGE_MAX).default(TAILLE_PAGE_DEFAUT),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Une page de résultats. `curseurSuivant` vaut `null` — et non `undefined` —
 * quand il n'y a plus rien : `null` traverse JSON, `undefined` disparaît, et
 * un client ne peut pas distinguer « fin de liste » de « champ oublié ».
 */
export function pageSchema<T extends z.ZodTypeAny>(element: T) {
  return z.object({
    elements: z.array(element),
    curseurSuivant: z.string().nullable(),
  });
}

export type Page<T> = {
  readonly elements: readonly T[];
  readonly curseurSuivant: string | null;
};

/** Encode un curseur opaque. Base64URL : sûr dans une adresse, sans échappement. */
export function encoderCurseur(valeur: Readonly<Record<string, string | number>>): string {
  return Buffer.from(JSON.stringify(valeur), 'utf8').toString('base64url');
}

/**
 * Décode un curseur. Renvoie `null` si le contenu est illisible plutôt que de
 * lever : un curseur trafiqué ou périmé doit rendre la première page, pas une
 * erreur 500.
 */
export function decoderCurseur(curseur: string): Record<string, string | number> | null {
  try {
    const brut: unknown = JSON.parse(Buffer.from(curseur, 'base64url').toString('utf8'));
    if (typeof brut !== 'object' || brut === null || Array.isArray(brut)) return null;
    return brut as Record<string, string | number>;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// L'enveloppe d'erreur
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Toute erreur de l'API a cette forme. Trois champs, et chacun a une raison :
 *
 *   `code`    STABLE, en majuscules. Les clients s'y fient pour décider quoi
 *             faire. Il ne change jamais, même si le message change.
 *   `message` déjà traduit par le serveur, qui connaît la langue. Un client
 *             qui devrait translate des codes d'erreur dupliquerait les
 *             catalogues.
 *   `action`  ce que la personne PEUT faire. C'est ce qui distingue un refus
 *             utile d'un mur. « Code invalide » sans motif ni suite est un
 *             défaut, pas une simplification.
 */
export const erreurSchema = z.object({
  code: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]*$/, 'Un code d’erreur est en MAJUSCULES_AVEC_UNDERSCORES'),
  message: z.string().min(1),
  action: z.string().min(1).optional(),
  /** Détail par champ, pour une erreur de validation. */
  champs: z.record(z.string(), z.string()).optional(),
  /** Renvoyé au client pour qu'il puisse le citer dans un signalement. */
  correlation: z.string().optional(),
});

export type Erreur = z.infer<typeof erreurSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// Identifiants
// ═══════════════════════════════════════════════════════════════════════════

/** UUID v7 : trié par le temps, donc voisin en index. Voir `prisma/schema.prisma`. */
export const idSchema = z.string().uuid();

export const emailSchema = z.string().trim().toLowerCase().email().max(254); // RFC 5321 : longueur maximale d'une adresse

/**
 * Un numéro malgache, sous la forme internationale.
 *
 * Ce n'est PAS un identifiant de compte — c'est un contact de livraison
 * (R-C15). Le compte est identifié par l'adresse électronique.
 */
export const telephoneSchema = z
  .string()
  .trim()
  .regex(/^\+261[23]\d{8}$/, 'Attendu un numéro malgache au format +261XXXXXXXXX');

/** La clé d'idempotence, telle que le client la fabrique — RB10. */
export const cleIdempotenceSchema = z.string().trim().min(16).max(128);
