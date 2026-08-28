/**
 * Contrat — les univers
 *
 * **Un univers n'est pas un filtre de catégorie. C'est un jeu de règles.**
 *
 * Entre une robe et un téléphone, ce qui change n'est pas l'étagère : c'est la
 * fiche article, le mode de livraison, les motifs de litige recevables, le
 * taux de commission et la vérification exigée du vendeur. Traiter un univers
 * comme une simple catégorie mènerait à un `JP Tech` vide — 8 % de commission
 * sur un téléphone, c'est toute la marge du revendeur.
 *
 * Ce fichier est la **source unique**. En dérivent : le seed, les écrans, les
 * champs de fiche article, les modes de livraison proposés au paiement, les
 * motifs de litige offerts à l'acheteuse, et le barème de commission.
 *
 * **Trois univers, une seule logistique.** Mode, Beauté et Tech partagent
 * `point_relais` et `domicile`. C'est ce qui rend l'application identique dans
 * les trois : ce qui varie n'est pas le flux, ce sont trois listes — les champs
 * de la fiche, les motifs de litige, le taux de commission.
 *
 * Un univers plus lourd — du mobilier, par exemple — aurait exigé le camion et
 * deux personnes, donc un second modèle de livraison, donc un autre parcours.
 * Il a été écarté pour cette raison.
 */

export const DOMAINE_UNIVERS = 'univers' as const;

// ═══════════════════════════════════════════════════════════════════════════
// Ce qui peut varier d'un univers à l'autre
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Les modes de livraison.
 *
 * **Les trois univers partagent les deux mêmes** : point relais et domicile.
 * C'est un choix de périmètre, pas une coïncidence — un univers exigeant le
 * camion aurait imposé un second parcours de livraison et un second métier.
 *
 * `retrait_boutique` est déclaré pour la vendeuse qui a un local physique.
 */
export const LIVRAISONS = ['point_relais', 'domicile', 'retrait_boutique'] as const;
export type ModeLivraison = (typeof LIVRAISONS)[number];

/**
 * Les champs de fiche article propres à un univers.
 *
 * `commun` regroupe ce que tout article porte — photos, nom, prix,
 * description. Ces clés-ci sont les champs **en plus**.
 */
export const CHAMPS_FICHE = [
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
export type ChampFiche = (typeof CHAMPS_FICHE)[number];

/**
 * Les motifs de litige recevables.
 *
 * Ils diffèrent réellement : « pas ma taille » n'a aucun sens pour un
 * téléphone, et « batterie morte » aucun pour une robe. Offrir la liste
 * complète à tout le monde produirait des litiges mal qualifiés — et un litige
 * mal qualifié est un litige mal arbitré *(RB4)*.
 */
export const MOTIFS_LITIGE = [
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
export type MotifLitige = (typeof MOTIFS_LITIGE)[number];

export interface DefinitionUnivers {
  /** Identifiant technique. Ne change JAMAIS — il est en base et dans les URL. */
  readonly cle: string;
  /** Le nom affiché, marque mère comprise. */
  readonly nom: string;
  /** La signature : le nom explique, elle donne le caractère. */
  readonly signature: string;
  /** Court, pour un onglet ou une puce. */
  readonly onglet: string;
  /**
   * **Ouvert au public ?** Un univers fermé existe en base, garde ses règles,
   * et n'apparaît nulle part. L'ouvrir est une mise à jour d'une ligne.
   */
  readonly ouvert: boolean;
  /** Commission JP en pour mille. 80 = 8 %. */
  readonly commissionPourMille: number;
  readonly livraisons: readonly ModeLivraison[];
  readonly champsFiche: readonly ChampFiche[];
  /** Ceux de `champsFiche` sans lesquels on ne publie pas. */
  readonly champsObligatoires: readonly ChampFiche[];
  readonly motifsLitige: readonly MotifLitige[];
  /** Le vendeur doit-il justifier la provenance de ce qu'il vend ? */
  readonly provenanceExigee: boolean;
  /** Pourquoi cet univers existe, en une phrase. Pour le back-office et l'équipe. */
  readonly raison: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Les trois univers
// ═══════════════════════════════════════════════════════════════════════════

const TRANSVERSES = [
  'non_recu',
  'different_de_la_photo',
  'endommage_au_transport',
  'contrefacon',
] as const;

export const UNIVERS = [
  {
    cle: 'mode',
    nom: 'JP Mode',
    signature: 'Le direct qui habille',
    onglet: 'Mode',
    ouvert: true,
    // 8 % — la marge de la friperie et du prêt-à-porter le supporte.
    commissionPourMille: 80,
    livraisons: ['point_relais', 'domicile'],
    champsFiche: ['taille', 'couleur', 'mesures', 'matiere', 'marque', 'etat_vetement'],
    // Les mesures sont facultatives mais valorisées au tri : sans démonstration
    // vidéo, elles remplacent le fait de toucher le vêtement (R-H4).
    champsObligatoires: ['taille', 'etat_vetement'],
    motifsLitige: [...TRANSVERSES, 'pas_la_bonne_taille', 'defaut_de_couture'],
    provenanceExigee: false,
    raison: "Le direct Facebook y est né. C'est le marché de départ et le produit déjà construit.",
  },
  {
    cle: 'beaute',
    nom: 'JP Beauté',
    signature: 'Vrai produit, prix vrai',
    onglet: 'Beauté',
    ouvert: true,
    // 8 % aussi : la marge cosmétique est bonne, et la logistique est la même
    // que la mode — léger, point relais.
    commissionPourMille: 80,
    livraisons: ['point_relais', 'domicile'],
    champsFiche: ['date_peremption', 'contenance', 'scelle', 'type_peau', 'provenance', 'marque'],
    // La péremption et le scellé sont OBLIGATOIRES. Un cosmétique contrefait
    // ou périmé ne déçoit pas : il blesse. C'est la différence de nature avec
    // la mode, et elle justifie à elle seule un univers séparé.
    champsObligatoires: ['date_peremption', 'scelle', 'marque'],
    motifsLitige: [...TRANSVERSES, 'produit_entame', 'peremption_depassee', 'reaction_cutanee'],
    // Le vendeur déclare d'où vient le produit. La contrefaçon cosmétique est
    // LE sujet de ce marché à Madagascar.
    provenanceExigee: true,
    raison:
      "Deuxième marché du direct malgache après la mode. La contrefaçon y est dangereuse, pas seulement décevante — le séquestre y répond mieux qu'ailleurs.",
  },

  // ── Déclarés, pas encore ouverts ───────────────────────────────────────────
  {
    cle: 'tech',
    nom: 'JP Tech',
    signature: 'Vérifié avant de payer',
    onglet: 'Tech',
    ouvert: false,
    // 3 % — et pas plus. Un revendeur de téléphones gagne 5 % sur un appareil ;
    // lui en prendre 8 rendrait l'univers vide.
    commissionPourMille: 30,
    livraisons: ['point_relais', 'domicile'],
    champsFiche: ['imei', 'stockage', 'sante_batterie', 'garantie_mois', 'etat_appareil', 'marque'],
    champsObligatoires: ['imei', 'etat_appareil', 'garantie_mois'],
    motifsLitige: [...TRANSVERSES, 'ne_demarre_pas', 'batterie_hors_service', 'imei_bloque'],
    // Le téléphone volé est un vrai problème. L'IMEI et la provenance sont
    // exigés, et un IMEI bloqué est un motif de litige à part entière.
    provenanceExigee: true,
    raison:
      "Panier moyen le plus élevé, risque d'arnaque maximal. Le reconditionné est un marché énorme.",
  },
] as const satisfies readonly DefinitionUnivers[];

export type CleUnivers = (typeof UNIVERS)[number]['cle'];

// ═══════════════════════════════════════════════════════════════════════════
// Lecture
// ═══════════════════════════════════════════════════════════════════════════

export function univers(cle: string): DefinitionUnivers | undefined {
  return UNIVERS.find((u) => u.cle === cle);
}

/** Ceux que l'application montre. Les autres existent sans se voir. */
export function universOuverts(): readonly DefinitionUnivers[] {
  return UNIVERS.filter((u) => u.ouvert);
}

/**
 * Un mode de livraison est-il permis dans cet univers ?
 *
 * À vérifier **côté serveur** au paiement, pas seulement à l'affichage : une
 * requête forgée pourrait demander un point relais pour un canapé.
 */
export function livraisonPermise(cle: string, mode: ModeLivraison): boolean {
  return univers(cle)?.livraisons.includes(mode) ?? false;
}

/** Un motif de litige est-il recevable dans cet univers ? */
export function motifRecevable(cle: string, motif: MotifLitige): boolean {
  return univers(cle)?.motifsLitige.includes(motif) ?? false;
}

/**
 * Les champs manquants pour publier. Rend la liste, pas un booléen : un refus
 * doit dire ce qui manque.
 */
export function champsManquants(
  cle: string,
  fournis: Readonly<Record<string, unknown>>,
): readonly ChampFiche[] {
  const def = univers(cle);
  if (!def) return [];
  return def.champsObligatoires.filter(
    (c) => fournis[c] === undefined || fournis[c] === null || fournis[c] === '',
  );
}
