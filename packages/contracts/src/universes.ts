/**
 * Contrat — les universe
 *
 * **Un universe n'est pas un filtre de catégorie. C'est un jeu de règles.**
 *
 * Entre une robe et un téléphone, ce qui change n'est pas l'étagère : c'est la
 * fiche article, le mode de livraison, les motifs de litige recevables, le
 * taux de commission et la vérification exigée du vendeur. Traiter un universe
 * comme une simple catégorie mènerait à un `JP Tech` vide — 8 % de commission
 * sur un téléphone, c'est toute la marge du revendeur.
 *
 * Ce fichier est la **source unique**. En dérivent : le seed, les écrans, les
 * champs de fiche article, les modes de livraison proposés au paiement, les
 * motifs de litige offerts à l'acheteuse, et le barème de commission.
 *
 * **Trois universe, une seule logistique.** Mode, Beauté et Tech partagent
 * `point_relais` et `domicile`. C'est ce qui rend l'application identique dans
 * les trois : ce qui varie n'est pas le flux, ce sont trois listes — les champs
 * de la fiche, les motifs de litige, le taux de commission.
 *
 * Un universe plus lourd — du mobilier, par exemple — aurait exigé le camion et
 * deux personnes, donc un second modèle de livraison, donc un autre parcours.
 * Il a été écarté pour cette raison.
 */

export const UNIVERSE_DOMAIN = 'universe' as const;

// ═══════════════════════════════════════════════════════════════════════════
// Ce qui peut varier d'un universe à l'autre
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Les modes de livraison.
 *
 * **Les trois universe partagent les deux mêmes** : point relais et domicile.
 * C'est un choix de périmètre, pas une coïncidence — un universe exigeant le
 * camion aurait imposé un second parcours de livraison et un second métier.
 *
 * `retrait_boutique` est déclaré pour la vendeuse qui a un local physique.
 */
export const SHIPPING_MODES = ['point_relais', 'domicile', 'retrait_boutique'] as const;
export type ShippingMode = (typeof SHIPPING_MODES)[number];

/**
 * Les champs de fiche article propres à un universe.
 *
 * `commun` regroupe ce que tout article porte — photos, nom, prix,
 * description. Ces clés-ci sont les champs **en plus**.
 */
export const LISTING_FIELDS = [
  // Mode
  'taille',
  'couleur',
  'mesures',
  'matiere',
  'marque',
  'etat_vetement',
  // Beauté
  'date_peremption',
  'contenance',
  'scelle',
  'type_peau',
  'provenance',
  // Tech
  'imei',
  'stockage',
  'sante_batterie',
  'garantie_mois',
  'etat_appareil',
] as const;
export type ListingField = (typeof LISTING_FIELDS)[number];

/**
 * Les motifs de litige recevables.
 *
 * Ils diffèrent réellement : « pas ma taille » n'a aucun sens pour un
 * téléphone, et « batterie morte » aucun pour une robe. Offrir la liste
 * complète à tout le monde produirait des litiges mal qualifiés — et un litige
 * mal qualifié est un litige mal arbitré *(RB4)*.
 */
export const DISPUTE_REASONS = [
  // Transverses
  'non_recu',
  'different_de_la_photo',
  'endommage_au_transport',
  'contrefacon',
  // Mode
  'pas_la_bonne_taille',
  'defaut_de_couture',
  // Beauté
  'produit_entame',
  'peremption_depassee',
  'reaction_cutanee',
  // Tech
  'ne_demarre_pas',
  'batterie_hors_service',
  'imei_bloque',
] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export interface UniverseDefinition {
  /** Identifiant technique. Ne change JAMAIS — il est en base et dans les URL. */
  readonly key: string;
  /** Le nom affiché, marque mère comprise. */
  readonly name: string;
  /** La signature : le nom explique, elle donne le caractère. */
  readonly signature: string;
  /** Court, pour un onglet ou une puce. */
  readonly tab: string;
  /**
   * **Ouvert au public ?** Un universe fermé existe en base, garde ses règles,
   * et n'apparaît nulle part. L'ouvrir est une mise à jour d'une ligne.
   */
  readonly open: boolean;
  /** Commission JP en pour mille. 80 = 8 %. */
  readonly commissionPerMille: number;
  readonly shipping: readonly ShippingMode[];
  readonly listingFields: readonly ListingField[];
  /** Ceux de `champsFiche` sans lesquels on ne publie pas. */
  readonly requiredFields: readonly ListingField[];
  readonly disputeReasons: readonly DisputeReason[];
  /** Le vendeur doit-il justifier la provenance de ce qu'il vend ? */
  readonly sourceRequired: boolean;
  /** Pourquoi cet universe existe, en une phrase. Pour le back-office et l'équipe. */
  readonly reason: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Les trois universe
// ═══════════════════════════════════════════════════════════════════════════

const CROSS_CUTTING = [
  'non_recu',
  'different_de_la_photo',
  'endommage_au_transport',
  'contrefacon',
] as const;

export const UNIVERSES = [
  {
    key: 'mode',
    name: 'JP Mode',
    signature: 'Le direct qui habille',
    tab: 'Mode',
    open: true,
    // 8 % — la marge de la friperie et du prêt-à-porter le supporte.
    commissionPerMille: 80,
    shipping: ['point_relais', 'domicile'],
    listingFields: ['taille', 'couleur', 'mesures', 'matiere', 'marque', 'etat_vetement'],
    // Les mesures sont facultatives mais valorisées au tri : sans démonstration
    // vidéo, elles remplacent le fait de toucher le vêtement (R-H4).
    requiredFields: ['taille', 'etat_vetement'],
    disputeReasons: [...CROSS_CUTTING, 'pas_la_bonne_taille', 'defaut_de_couture'],
    sourceRequired: false,
    reason: "Le direct Facebook y est né. C'est le marché de départ et le produit déjà construit.",
  },
  {
    key: 'beaute',
    name: 'JP Beauté',
    signature: 'Vrai produit, prix vrai',
    tab: 'Beauté',
    open: true,
    // 8 % aussi : la marge cosmétique est bonne, et la logistique est la même
    // que la mode — léger, point relais.
    commissionPerMille: 80,
    shipping: ['point_relais', 'domicile'],
    listingFields: ['date_peremption', 'contenance', 'scelle', 'type_peau', 'provenance', 'marque'],
    // La péremption et le scellé sont OBLIGATOIRES. Un cosmétique contrefait
    // ou périmé ne déçoit pas : il blesse. C'est la différence de nature avec
    // la mode, et elle justifie à elle seule un universe séparé.
    requiredFields: ['date_peremption', 'scelle', 'marque'],
    disputeReasons: [...CROSS_CUTTING, 'produit_entame', 'peremption_depassee', 'reaction_cutanee'],
    // Le vendeur déclare d'où vient le produit. La contrefaçon cosmétique est
    // LE sujet de ce marché à Madagascar.
    sourceRequired: true,
    reason:
      "Deuxième marché du direct malgache après la mode. La contrefaçon y est dangereuse, pas seulement décevante — le séquestre y répond mieux qu'ailleurs.",
  },

  // ── Déclarés, pas encore ouverts ───────────────────────────────────────────
  {
    key: 'tech',
    name: 'JP Tech',
    signature: 'Vérifié avant de payer',
    tab: 'Tech',
    open: false,
    // 3 % — et pas plus. Un revendeur de téléphones gagne 5 % sur un appareil ;
    // lui en prendre 8 rendrait l'universe vide.
    commissionPerMille: 30,
    shipping: ['point_relais', 'domicile'],
    listingFields: [
      'imei',
      'stockage',
      'sante_batterie',
      'garantie_mois',
      'etat_appareil',
      'marque',
    ],
    requiredFields: ['imei', 'etat_appareil', 'garantie_mois'],
    disputeReasons: [...CROSS_CUTTING, 'ne_demarre_pas', 'batterie_hors_service', 'imei_bloque'],
    // Le téléphone volé est un vrai problème. L'IMEI et la provenance sont
    // exigés, et un IMEI bloqué est un reason de litige à part entière.
    sourceRequired: true,
    reason:
      "Panier moyen le plus élevé, risque d'arnaque maximal. Le reconditionné est un marché énorme.",
  },
] as const satisfies readonly UniverseDefinition[];

export type UniverseKey = (typeof UNIVERSES)[number]['key'];

// ═══════════════════════════════════════════════════════════════════════════
// Lecture
// ═══════════════════════════════════════════════════════════════════════════

export function universe(key: string): UniverseDefinition | undefined {
  return UNIVERSES.find((u) => u.key === key);
}

/** Ceux que l'application montre. Les autres existent sans se voir. */
export function openUniverses(): readonly UniverseDefinition[] {
  return UNIVERSES.filter((u) => u.open);
}

/**
 * Un mode de livraison est-il permis dans cet universe ?
 *
 * À vérifier **côté serveur** au paiement, pas seulement à l'affichage : une
 * requête forgée pourrait demander un point relais pour un canapé.
 */
export function shippingAllowed(key: string, mode: ShippingMode): boolean {
  return universe(key)?.shipping.includes(mode) ?? false;
}

/** Un reason de litige est-il recevable dans cet universe ? */
export function reasonAcceptable(key: string, reason: DisputeReason): boolean {
  return universe(key)?.disputeReasons.includes(reason) ?? false;
}

/**
 * Les champs manquants pour publier. Rend la liste, pas un booléen : un refus
 * doit dire ce qui manque.
 */
export function missingFields(
  key: string,
  provided: Readonly<Record<string, unknown>>,
): readonly ListingField[] {
  const def = universe(key);
  if (!def) return [];
  return def.requiredFields.filter(
    (c) => provided[c] === undefined || provided[c] === null || provided[c] === '',
  );
}
