/**
 * Les sept primitives partagées — S7.2
 *
 * **Ce sont des DESCRIPTIONS, pas des composants.** Elles décrivent le
 * comportement attendu et les valeurs à respecter ; `apps/mobile` les rendra
 * en React Native, `apps/admin` et `apps/web` en HTML. Le comportement, lui,
 * est décidé ici, une fois.
 *
 * Pourquoi pas des composants React partagés : React Native et le DOM n'ont
 * ni les mêmes éléments ni les mêmes styles. Une couche d'abstraction qui
 * prétendrait unifier les deux coûterait plus qu'elle ne rapporte à cette
 * taille de projet. On partage les **décisions**, pas le rendu.
 */
import { formater, type Ariary } from '@jp/money';
import { traduire, type Langue } from '@jp/i18n';
import { CIBLE_TACTILE_MIN, COULEURS, ESPACEMENT, RAYON, TYPOGRAPHIE } from './jetons.js';

// ── 1. Le bouton principal ───────────────────────────────────────────────────

/**
 * **Toujours pleine largeur, toujours ancré en bas.** Une main qui tient un
 * téléphone atteint le bas de l'écran ; le haut demande de changer de prise.
 * Un seul par écran : deux actions principales, c'est aucune.
 */
export const BOUTON_PRINCIPAL = {
  hauteur: CIBLE_TACTILE_MIN,
  largeur: '100%',
  rayon: RAYON.moyen,
  fond: COULEURS.action,
  fondPresse: COULEURS.actionPressee,
  texte: COULEURS.texteInverse,
  typographie: TYPOGRAPHIE.corps,
  ancrage: 'bas',
  /** Empêche le double envoi : le bouton se désactive dès le premier appui. */
  desactiveePendantEnvoi: true,
} as const;

// ── 2. Le prix ───────────────────────────────────────────────────────────────

/**
 * Un montant s'affiche par `@jp/money`, jamais par une concaténation locale.
 * `PrixAriary` porte en plus la règle d'affichage : la couleur du montant
 * n'est **pas** celle de l'action, pour qu'un prix ne se touche pas.
 */
export function prixAriary(montant: Ariary, langue: Langue = 'fr') {
  return {
    texte: formater(montant, langue),
    couleur: COULEURS.montant,
    typographie: TYPOGRAPHIE.corps,
  };
}

// ── 3. L'image progressive ───────────────────────────────────────────────────

/**
 * **Toujours un substitut basse résolution d'abord.** Sur un réseau lent, une
 * grille de vignettes sans substitut donne un écran gris pendant dix secondes,
 * et l'utilisatrice croit que l'application est cassée.
 *
 * En mode économie de données, on ne charge PAS la version pleine : le
 * substitut suffit tant que personne n'a touché l'image.
 */
export function imageProgressive(params: {
  readonly url: string;
  readonly substitut: string;
  readonly economieDonnees: boolean;
}) {
  return {
    afficher: params.economieDonnees ? params.substitut : params.url,
    substitut: params.substitut,
    chargerPleineResolution: !params.economieDonnees,
    fondPendantChargement: COULEURS.fondSecondaire,
  };
}

// ── 4. L'état vide ───────────────────────────────────────────────────────────

/**
 * Un écran vide dit ce qui manque **et ce qu'on peut faire**. « Aucun
 * résultat » tout seul est un cul-de-sac.
 */
export function etatVide(params: {
  readonly langue: Langue;
  readonly action?: { readonly libelle: string; readonly cible: string };
}) {
  return {
    message: traduire('etat.vide', params.langue),
    action: params.action ?? null,
    espacement: ESPACEMENT.xl,
  };
}

// ── 5. Le minuteur de réservation ────────────────────────────────────────────

/**
 * Le compte à rebours d'une réservation.
 *
 * **Il ne ment jamais** *(RB9)*. Il affiche le temps réellement restant,
 * calculé depuis l'échéance rendue par le serveur — jamais une durée décidée
 * côté client, qui dériverait avec l'horloge du téléphone.
 */
export function minuteurReservation(expireLe: Date, maintenant = new Date()) {
  const restantMs = Math.max(0, expireLe.getTime() - maintenant.getTime());
  const restantS = Math.ceil(restantMs / 1000);
  return {
    restantS,
    expire: restantS === 0,
    /** Passe en rouge dans la dernière minute : c'est là que ça compte. */
    couleur: restantS <= 60 ? COULEURS.danger : COULEURS.texteSecondaire,
    libelle: `${Math.floor(restantS / 60)}:${String(restantS % 60).padStart(2, '0')}`,
  };
}

// ── 6. Le badge ──────────────────────────────────────────────────────────────

export type TonBadge = 'neutre' | 'succes' | 'attention' | 'danger';

/** Statut de commande, badge « vendeur vérifié », étiquette d'événement. */
export function badge(ton: TonBadge, texte: string) {
  const fonds: Record<TonBadge, string> = {
    neutre: COULEURS.fondSecondaire,
    succes: COULEURS.succes,
    attention: COULEURS.attention,
    danger: COULEURS.danger,
  };
  return {
    texte,
    fond: fonds[ton],
    couleurTexte: ton === 'neutre' ? COULEURS.texte : COULEURS.texteInverse,
    rayon: RAYON.rond,
    typographie: TYPOGRAPHIE.petit,
  };
}

// ── 7. La ligne de liste ─────────────────────────────────────────────────────

/**
 * Une ligne touchable. **Sa hauteur ne descend jamais sous la cible tactile
 * minimale**, même quand le contenu tiendrait dans moins.
 */
export function ligneListe(params: { readonly touchable: boolean }) {
  return {
    hauteurMin: CIBLE_TACTILE_MIN,
    paddingHorizontal: ESPACEMENT.m,
    paddingVertical: ESPACEMENT.s,
    separateur: COULEURS.bordure,
    touchable: params.touchable,
  };
}

export const PRIMITIVES = [
  'BoutonPrincipal',
  'PrixAriary',
  'ImageProgressive',
  'EtatVide',
  'MinuteurReservation',
  'Badge',
  'LigneListe',
] as const;
