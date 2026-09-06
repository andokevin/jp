/**
 * La machine à états du parcours — F0.1
 *
 * **Inscription et connexion sont le MÊME parcours.** Une adresse ouvre un
 * compte existant ou en crée un ; l'écran ne le sait pas et ne doit pas le
 * savoir *(R-C9)* — c'est le serveur qui tranche, à la vérification du code.
 *
 * Trois étapes, et une règle qui traverse les trois : **ce qui a été tapé
 * n'est jamais perdu**. Une erreur de code garde les six chiffres à l'écran
 * *(US-AUTH-02 CA4)*, une coupure réseau garde l'adresse. Retaper six chiffres
 * parce que le réseau a hoqueté, c'est le moment où l'on ferme l'onglet.
 *
 * Réducteur pur : aucun appel réseau, aucun React. Les effets vivent dans le
 * hook ; ici on ne décrit que les transitions, et c'est ce qui les rend
 * vérifiables sans navigateur.
 */
import type { auth } from '@jp/contracts';

import { casesVides, effacer, poser, type Cases } from './code-otp.js';

export type Etape = 'email' | 'code' | 'prenom' | 'termine';

export interface Panne {
  readonly code: string;
  /** Déjà traduit par le serveur, dans la langue annoncée à l'envoi. */
  readonly message: string;
}

export interface EtatParcours {
  readonly etape: Etape;
  readonly email: string;
  readonly cases: Cases;
  readonly prenom: string;
  readonly enCours: boolean;
  readonly horsLigne: boolean;
  readonly panne: Panne | null;
  /** Échéance de validité du code, en epoch ms. Vient du serveur, jamais d'un compte à rebours local. */
  readonly expireLe: number | null;
  /** Instant à partir duquel un renvoi est accepté — le débit serveur est d'un code par minute. */
  readonly renvoiPossibleLe: number | null;
  readonly session: auth.ReponseSession | null;
}

/** Le serveur n'accepte qu'un code par minute et par adresse *(R-C7)*. */
export const DELAI_RENVOI_S = 60;

export function etatInitial(): EtatParcours {
  return {
    etape: 'email',
    email: '',
    cases: casesVides(),
    prenom: '',
    enCours: false,
    horsLigne: false,
    panne: null,
    expireLe: null,
    renvoiPossibleLe: null,
    session: null,
  };
}

export type Action =
  | { readonly type: 'saisirEmail'; readonly valeur: string }
  | { readonly type: 'saisirPrenom'; readonly valeur: string }
  | { readonly type: 'poserCode'; readonly index: number; readonly texte: string }
  | { readonly type: 'effacerCase'; readonly index: number }
  | { readonly type: 'envoiCommence' }
  | { readonly type: 'codeDemande'; readonly expireDansS: number; readonly maintenant: number }
  | { readonly type: 'sessionOuverte'; readonly session: auth.ReponseSession }
  | { readonly type: 'echec'; readonly panne: Panne }
  | { readonly type: 'coupure' }
  | { readonly type: 'reseauRevenu' }
  | { readonly type: 'changerEmail' };

export function reduire(etat: EtatParcours, action: Action): EtatParcours {
  switch (action.type) {
    case 'saisirEmail':
      // Toute frappe efface le message d'erreur : il portait sur la valeur
      // précédente, et le laisser affiché accuse la nouvelle à tort.
      return { ...etat, email: action.valeur, panne: null };

    case 'saisirPrenom':
      return { ...etat, prenom: action.valeur, panne: null };

    case 'poserCode':
      return { ...etat, cases: poser(etat.cases, action.index, action.texte), panne: null };

    case 'effacerCase':
      return { ...etat, cases: effacer(etat.cases, action.index), panne: null };

    case 'envoiCommence':
      return { ...etat, enCours: true, panne: null };

    case 'codeDemande':
      return {
        ...etat,
        etape: 'code',
        enCours: false,
        panne: null,
        horsLigne: false,
        expireLe: action.maintenant + action.expireDansS * 1000,
        renvoiPossibleLe: action.maintenant + DELAI_RENVOI_S * 1000,
        // Un renvoi repart de six cases vides : garder les chiffres de
        // l'ancien code ferait échouer la vérification sans que ça se voie.
        cases: casesVides(),
      };

    case 'sessionOuverte':
      return {
        ...etat,
        enCours: false,
        panne: null,
        session: action.session,
        // Le prénom n'est demandé qu'aux comptes qui n'en ont pas. Le
        // redemander à chaque connexion serait un péage sur le retour.
        etape: action.session.utilisateur.prenom === null ? 'prenom' : 'termine',
      };

    case 'echec':
      // Les chiffres restent à l'écran : c'est la règle US-AUTH-02 CA4.
      return { ...etat, enCours: false, panne: action.panne };

    case 'coupure':
      // Hors ligne EFFACE l'erreur : une requête qui n'est jamais partie n'est
      // pas un refus du serveur, et les deux affichés ensemble se contredisent.
      return { ...etat, enCours: false, horsLigne: true, panne: null };

    case 'reseauRevenu':
      return { ...etat, horsLigne: false };

    case 'changerEmail':
      // L'adresse est CONSERVÉE : « Modifier » veut dire corriger une faute de
      // frappe, pas tout retaper.
      return {
        ...etat,
        etape: 'email',
        cases: casesVides(),
        panne: null,
        enCours: false,
        expireLe: null,
        renvoiPossibleLe: null,
      };
  }
}

/** Une adresse plausible — la validation qui fait foi est celle du serveur. */
export function emailPlausible(valeur: string): boolean {
  const v = valeur.trim();
  return v.length > 2 && v.includes('@') && !v.startsWith('@') && !v.endsWith('@');
}

/**
 * Le bouton principal est-il actionnable ?
 *
 * **Hors ligne désactive toujours**, quelle que soit l'étape : envoyer pour
 * échouer après trente secondes d'attente est pire que de ne pas envoyer.
 */
export function peutEnvoyer(etat: EtatParcours): boolean {
  if (etat.enCours || etat.horsLigne) return false;
  switch (etat.etape) {
    case 'email':
      return emailPlausible(etat.email);
    case 'code':
      return etat.cases.join('').length === 6;
    case 'prenom':
      return etat.prenom.trim().length > 0;
    case 'termine':
      return false;
  }
}

/** Le renvoi de code n'est offert qu'une fois le délai de débit écoulé. */
export function peutRenvoyer(etat: EtatParcours, maintenant: number): boolean {
  if (etat.enCours || etat.horsLigne || etat.renvoiPossibleLe === null) return false;
  return maintenant >= etat.renvoiPossibleLe;
}
