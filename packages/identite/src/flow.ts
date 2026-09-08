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

import { emptyBoxes, clearBox, isComplete, setBox, type Boxes } from './otp-boxes.js';

export type Step = 'email' | 'code' | 'firstName' | 'done';

export interface Failure {
  readonly code: string;
  /** Déjà traduit par le serveur, dans la langue annoncée à l'envoi. */
  readonly message: string;
}

export interface FlowState {
  readonly step: Step;
  readonly email: string;
  readonly boxes: Boxes;
  readonly firstName: string;
  readonly pending: boolean;
  readonly offline: boolean;
  readonly failure: Failure | null;
  /** Échéance de validité du code, en epoch ms. Vient du serveur, jamais d'un compte à rebours local. */
  readonly expiresAt: number | null;
  /** Instant à partir duquel un renvoi est accepté — le débit serveur est d'un code par minute. */
  readonly resendAllowedAt: number | null;
  readonly session: auth.SessionResponse | null;
}

/** Le serveur n'accepte qu'un code par minute et par adresse *(R-C7)*. */
export const RESEND_DELAY_S = 60;

export function initialState(): FlowState {
  return {
    step: 'email',
    email: '',
    boxes: emptyBoxes(),
    firstName: '',
    pending: false,
    offline: false,
    failure: null,
    expiresAt: null,
    resendAllowedAt: null,
    session: null,
  };
}

export type Action =
  | { readonly type: 'setEmail'; readonly value: string }
  | { readonly type: 'setFirstName'; readonly value: string }
  | { readonly type: 'setCodeBox'; readonly index: number; readonly text: string }
  | { readonly type: 'clearCodeBox'; readonly index: number }
  | { readonly type: 'submitStarted' }
  | { readonly type: 'codeRequested'; readonly expiresInS: number; readonly now: number }
  | { readonly type: 'sessionOpened'; readonly session: auth.SessionResponse }
  | { readonly type: 'failed'; readonly failure: Failure }
  | { readonly type: 'wentOffline' }
  | { readonly type: 'cameOnline' }
  | { readonly type: 'changeEmail' };

export function reduce(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case 'setEmail':
      // Toute frappe efface le message d'erreur : il portait sur la valeur
      // précédente, et le laisser affiché accuse la nouvelle à tort.
      return { ...state, email: action.value, failure: null };

    case 'setFirstName':
      return { ...state, firstName: action.value, failure: null };

    case 'setCodeBox':
      return { ...state, boxes: setBox(state.boxes, action.index, action.text), failure: null };

    case 'clearCodeBox':
      return { ...state, boxes: clearBox(state.boxes, action.index), failure: null };

    case 'submitStarted':
      return { ...state, pending: true, failure: null };

    case 'codeRequested':
      return {
        ...state,
        step: 'code',
        pending: false,
        failure: null,
        offline: false,
        expiresAt: action.now + action.expiresInS * 1000,
        resendAllowedAt: action.now + RESEND_DELAY_S * 1000,
        // Un renvoi repart de six cases vides : garder les chiffres de
        // l'ancien code ferait échouer la vérification sans que ça se voie.
        boxes: emptyBoxes(),
      };

    case 'sessionOpened':
      return {
        ...state,
        pending: false,
        failure: null,
        session: action.session,
        // Le prénom n'est demandé qu'aux comptes qui n'en ont pas. Le
        // redemander à chaque connexion serait un péage sur le retour.
        step: action.session.user.firstName === null ? 'firstName' : 'done',
      };

    case 'failed':
      // Les chiffres restent à l'écran : c'est la règle US-AUTH-02 CA4.
      return { ...state, pending: false, failure: action.failure };

    case 'wentOffline':
      // Hors ligne EFFACE l'erreur : une requête qui n'est jamais partie n'est
      // pas un refus du serveur, et les deux affichés ensemble se contredisent.
      return { ...state, pending: false, offline: true, failure: null };

    case 'cameOnline':
      return { ...state, offline: false };

    case 'changeEmail':
      // L'adresse est CONSERVÉE : « Modifier » veut dire corriger une faute de
      // frappe, pas tout retaper.
      return {
        ...state,
        step: 'email',
        boxes: emptyBoxes(),
        failure: null,
        pending: false,
        expiresAt: null,
        resendAllowedAt: null,
      };
  }
}

/** Une adresse plausible — la validation qui fait foi est celle du serveur. */
export function plausibleEmail(value: string): boolean {
  const v = value.trim();
  return v.length > 2 && v.includes('@') && !v.startsWith('@') && !v.endsWith('@');
}

/**
 * Le bouton principal est-il actionnable ?
 *
 * **Hors ligne désactive toujours**, quelle que soit l'étape : envoyer pour
 * échouer après trente secondes d'attente est pire que de ne pas envoyer.
 */
export function canSubmit(state: FlowState): boolean {
  if (state.pending || state.offline) return false;
  switch (state.step) {
    case 'email':
      return plausibleEmail(state.email);
    case 'code':
      return isComplete(state.boxes);
    case 'firstName':
      return state.firstName.trim().length > 0;
    case 'done':
      return false;
  }
}

/** Le renvoi de code n'est offert qu'une fois le délai de débit écoulé. */
export function canResend(state: FlowState, now: number): boolean {
  if (state.pending || state.offline || state.resendAllowedAt === null) return false;
  return now >= state.resendAllowedAt;
}
