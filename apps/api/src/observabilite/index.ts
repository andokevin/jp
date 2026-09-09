/**
 * Observabilité — S10
 *
 * **Savoir ce qui se passe AVANT d'en avoir besoin.** Un entonnoir instrumenté
 * après le lancement du pilote ne dit rien du lancement du pilote — et c'est
 * précisément ce qu'on cherche à mesurer.
 */
import { contexte, masquerEmail } from '../plateforme/contexte.js';

// ═══════════════════════════════════════════════════════════════════════════
// S10.1 — journaux corrélés, sans donnée personnelle
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Les clés dont la valeur ne doit **jamais** paraître en clair dans un
 * journal. Un journal se copie, s'exporte, part chez un prestataire
 * d'observabilité — il ne bénéficie pas des protections de la base.
 *
 * `email` est masqué plutôt que supprimé : `mi***@jp.mg` suffit à reconnaître
 * un compte pendant un incident, sans constituer un annuaire *(R-C10)*.
 */
const A_MASQUER = new Set(['email', 'courriel']);
const A_SUPPRIMER = new Set([
  'motDePasse',
  'password',
  'jeton',
  'token',
  'authorization',
  'code',
  'codeOtp',
  'cin',
  'nif',
  'stat',
  'msisdn',
  'telephone',
  'phone',
  'adresse',
  'jetonEmpreinte',
]);

/**
 * Nettoie un objet avant journalisation. Récursif : une donnée sensible
 * enfouie à trois niveaux est aussi dangereuse qu'en surface.
 */
export function nettoyer(valeur: unknown, profondeur = 0): unknown {
  if (profondeur > 6) return '[trop profond]';
  if (valeur === null || typeof valeur !== 'object') return valeur;
  if (Array.isArray(valeur)) return valeur.map((v) => nettoyer(v, profondeur + 1));

  const sortie: Record<string, unknown> = {};
  for (const [cle, v] of Object.entries(valeur as Record<string, unknown>)) {
    if (A_SUPPRIMER.has(cle)) sortie[cle] = '[retiré]';
    else if (A_MASQUER.has(cle) && typeof v === 'string') sortie[cle] = masquerEmail(v);
    else sortie[cle] = nettoyer(v, profondeur + 1);
  }
  return sortie;
}

export type Niveau = 'debug' | 'info' | 'warn' | 'error';

/**
 * Journalise avec l'identifiant de corrélation du contexte courant. C'est lui
 * qui permet de suivre une requête de l'application mobile jusqu'à la file
 * asynchrone qu'elle a déclenchée.
 */
export function journal(niveau: Niveau, message: string, donnees: unknown = {}): void {
  const ctx = contexte();
  const ligne = JSON.stringify({
    niveau,
    message,
    correlation: ctx?.correlation ?? null,
    userId: ctx?.userId ?? null,
    horodatage: new Date().toISOString(),
    ...(nettoyer(donnees) as object),
  });
  if (niveau === 'error') console.error(ligne);
  else if (niveau === 'warn') console.warn(ligne);
  else console.warn(ligne);
}

// ═══════════════════════════════════════════════════════════════════════════
// S10.2 — métriques
// ═══════════════════════════════════════════════════════════════════════════

export interface Mesures {
  readonly compteurs: Readonly<Record<string, number>>;
  readonly histogrammes: Readonly<Record<string, { n: number; somme: number; max: number }>>;
  readonly jauges: Readonly<Record<string, number>>;
}

/**
 * Un collecteur en mémoire, exposé sur `/metriques`.
 *
 * Pas de dépendance à Prometheus : la sortie est du JSON, qu'un agent lira.
 * Ajouter une bibliothèque de métriques maintenant, c'est choisir un format
 * d'export avant de savoir qui le consommera.
 */
export class Collecteur {
  private readonly compteurs = new Map<string, number>();
  private readonly histogrammes = new Map<string, { n: number; somme: number; max: number }>();
  private readonly jauges = new Map<string, () => number>();

  compter(nom: string, de = 1): void {
    this.compteurs.set(nom, (this.compteurs.get(nom) ?? 0) + de);
  }

  /** Une durée, une taille — tout ce dont la moyenne et le pic comptent. */
  observer(nom: string, valeur: number): void {
    const h = this.histogrammes.get(nom) ?? { n: 0, somme: 0, max: 0 };
    h.n += 1;
    h.somme += valeur;
    h.max = Math.max(h.max, valeur);
    this.histogrammes.set(nom, h);
  }

  /** Une valeur lue à la demande : profondeur de file, connexions ouvertes. */
  jauge(nom: string, lire: () => number): void {
    this.jauges.set(nom, lire);
  }

  instantane(): Mesures {
    const jauges: Record<string, number> = {};
    for (const [nom, lire] of this.jauges) {
      try {
        jauges[nom] = lire();
      } catch {
        jauges[nom] = -1; // une jauge cassée ne casse pas la page de métriques
      }
    }
    return {
      compteurs: Object.fromEntries(this.compteurs),
      histogrammes: Object.fromEntries(this.histogrammes),
      jauges,
    };
  }

  reinitialiser(): void {
    this.compteurs.clear();
    this.histogrammes.clear();
  }
}

export const mesures = new Collecteur();

// ═══════════════════════════════════════════════════════════════════════════
// S10.3 — les événements de mesure du CDC §11
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Les événements d'usage, posés **dès le premier jour**.
 *
 * Ils dessinent les entonnoirs du pilote. Ajoutés après le lancement, ils ne
 * diraient rien du lancement — et c'est le lancement qu'on veut comprendre.
 */
export const EVENEMENTS = {
  vendeurVerifie: 'vendeur.verifie',
  articlePublie: 'article.publie',
  vitrineVue: 'vitrine.vue',
  articleVu: 'article.vu',
  reservationPrise: 'reservation.prise',
  reservationExpiree: 'reservation.expiree',
  commandeCreee: 'commande.creee',
  paiementTente: 'paiement.tente',
  paiementReussi: 'paiement.reussi',
  paiementEchoue: 'paiement.echoue',
  colisRemis: 'colis.remis',
  receptionConfirmee: 'reception.confirmee',
  fondsLiberes: 'fonds.liberes',
  litigeOuvert: 'litige.ouvert',
  // `<chose>.<action>`, comme les quatorze au-dessus. Le sprint F0.1 les avait
  // préfixées `identite.` — quatre entrées contre quatorze, et l'entonnoir du
  // pilote y perdait `compte.cree`, son premier palier.
  compteCree: 'compte.cree',
  compteConnecte: 'compte.connecte',
  codeOtpEnvoye: 'code_otp.envoye',
  emailVerifie: 'email.verifie',
} as const;

export type NomEvenement = (typeof EVENEMENTS)[keyof typeof EVENEMENTS];

/**
 * Note un événement d'usage.
 *
 * **Ne contient jamais d'identifiant nominatif en clair** : l'entonnoir se
 * mesure sur des comptes, pas sur des personnes nommées.
 */
export function mesurer(evenement: NomEvenement, donnees: Record<string, unknown> = {}): void {
  mesures.compter(`usage.${evenement}`);
  journal('info', `usage:${evenement}`, donnees);
}

// ═══════════════════════════════════════════════════════════════════════════
// S10.4 — les quatre alertes qui doivent réveiller quelqu'un
// ═══════════════════════════════════════════════════════════════════════════

export interface Alerte {
  readonly nom: string;
  readonly pourquoi: string;
  readonly seuil: string;
  /** Rend `true` quand la situation est anormale. */
  readonly declenchee: (m: Mesures) => boolean;
}

/**
 * Quatre, et seulement quatre. Une alerte qu'on ignore parce qu'elle sonne
 * tous les jours ne protège plus rien.
 */
export const ALERTES: readonly Alerte[] = [
  {
    nom: 'file-expiration-en-retard',
    pourquoi:
      "Si l'expiration de réservation prend du retard, le stock reste bloqué et RB1 tombe côté disponibilité — des articles disponibles paraissent épuisés.",
    seuil: 'plus de 100 travaux en attente, ou le plus ancien a plus de 5 minutes',
    declenchee: (m) =>
      (m.jauges['file.expiration-reservation.attente'] ?? 0) > 100 ||
      (m.jauges['file.expiration-reservation.age_ms'] ?? 0) > 300_000,
  },
  {
    nom: 'ecriture-financiere-echouee',
    pourquoi:
      "Une écriture financière qui échoue laisse de l'argent dans un état indéterminé. Aucun seuil de tolérance : une seule suffit.",
    seuil: 'au moins une',
    declenchee: (m) => (m.compteurs['finance.ecriture.echec'] ?? 0) > 0,
  },
  {
    nom: 'taux-echec-paiement',
    pourquoi:
      'Un prestataire mobile money qui tombe se voit ici avant de se voir dans les plaintes.',
    seuil: 'plus de 20 % des tentatives sur les 100 dernières',
    declenchee: (m) => {
      const tentes = m.compteurs['usage.paiement.tente'] ?? 0;
      const echoues = m.compteurs['usage.paiement.echoue'] ?? 0;
      return tentes >= 20 && echoues / tentes > 0.2;
    },
  },
  {
    nom: 'base-saturee',
    pourquoi:
      "Le pool de connexions plein signifie que des requêtes attendent. C'est le symptôme qui précède l'indisponibilité complète.",
    seuil: 'plus de 90 % des connexions occupées',
    declenchee: (m) => (m.jauges['db.connexions.ratio'] ?? 0) > 0.9,
  },
];

/** Les alertes actuellement déclenchées. */
export function alertesActives(m: Mesures = mesures.instantane()): readonly Alerte[] {
  return ALERTES.filter((a) => a.declenchee(m));
}
