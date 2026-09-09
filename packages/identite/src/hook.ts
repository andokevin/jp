/**
 * Le hook du parcours — F0.1
 *
 * **Il n'est ni web ni natif.** `useReducer`, `useEffect` et `useRef` viennent
 * de `react`, qui n'est pas un moteur de rendu : `react-dom` et `react-native`
 * le sont. Le même hook pilote donc les deux écrans, et les trois pièges
 * ci-dessous ne sont résolus qu'une fois.
 *
 * Mince par construction : les transitions vivent dans `parcours.ts`, pur et
 * testé sans navigateur. Ce fichier n'ajoute que ce qui a besoin du temps qui
 * passe et du réseau — l'horloge du décompte, les appels, l'écoute de la
 * connexion.
 *
 * L'auto-vérification au sixième chiffre vient d'EP00 §4 : le code est la
 * seule saisie dont on sait qu'elle est finie au caractère près, donc demander
 * un appui de plus est un péage. Le bouton reste néanmoins présent — il porte
 * l'état de chargement, et une personne au clavier doit pouvoir valider
 * elle-même.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { auth } from '@jp/contracts';

import { Offline, type IdentityClient } from './api.js';
import { assembledCode, isComplete } from './otp-boxes.js';
import {
  initialState,
  canSubmit,
  canResend,
  reduce,
  type FlowState,
  type Failure,
} from './flow.js';

/** L'enveloppe d'error du serveur, telle qu'elle arrive. */
function failureFrom(error: unknown): Failure {
  const e = error as { code?: unknown; message?: unknown };
  return {
    code: typeof e?.code === 'string' ? e.code : 'INDISPONIBLE',
    message: typeof e?.message === 'string' ? e.message : '',
  };
}

/**
 * La seule chose que le hook ne sait pas faire seul : savoir que le réseau
 * vient de tomber **sans avoir rien demandé**.
 *
 * Le web écoute les événements `online`/`offline` de la fenêtre ; React Native
 * passerait NetInfo. Rien de tout cela n'existe des deux côtés, donc c'est
 * injecté. Omettre l'abonnement reste correct : une coupure se découvre alors
 * au premier appel qui échoue, le client lève `Offline` et le réducteur
 * bascule pareil. On perd la détection AVANT le geste, pas la bascule.
 */
export type NetworkSubscription = (evenements: {
  readonly onOffline: () => void;
  readonly onOnline: () => void;
}) => () => void;

export interface FlowOptions {
  /** Construit par l'application — c'est elle qui connaît l'URL de base. */
  readonly client: Pick<IdentityClient, 'requestCode' | 'verifyCode'>;
  readonly subscribeNetwork?: NetworkSubscription;
  /**
   * Appelé une fois la session ouverte ET le prénom connu.
   *
   * Reçoit la réponse ENTIÈRE, pas le seul jeton : `expireLe` en fait partie,
   * et sans lui l'appareil ne peut pas ranger la session — `ouvrirSession`
   * de `noyau/session.ts` réclame les deux. Une signature qui ne passait que
   * le jeton obligeait l'appelant à redemander au serveur ce qu'il venait de
   * recevoir, ou à inventer une échéance.
   */
  readonly onSession?: (session: auth.SessionResponse) => void;
}

export function useAuthOtp(options: FlowOptions) {
  const [state, dispatch] = useReducer(reduce, undefined, initialState);
  const [now, setMaintenant] = useState(() => Date.now());

  /**
   * Les options sont lues à TRAVERS une référence, jamais mises en dépendance.
   *
   * Un appelant qui écrit `useAuthOtp({ client, subscribeNetwork: (e) => … })`
   * fabrique un objet neuf à chaque rendu. En dépendance d'effet, cet objet
   * réabonnerait le réseau à chaque frappe — et l'effet de nettoyage
   * désabonnerait juste après. Le piège est classique et silencieux : ça
   * marche, ça fuit.
   */
  const ref = useRef(options);
  ref.current = options;

  // ── La connexion, écoutée plutôt que devinée ───────────────────────────────
  useEffect(() => {
    const abonner = ref.current.subscribeNetwork;
    if (!abonner) return undefined;
    return abonner({
      onOffline: () => dispatch({ type: 'wentOffline' }),
      onOnline: () => dispatch({ type: 'cameOnline' }),
    });
  }, []);

  // ── L'horloge du décompte — une seconde, et seulement quand elle sert ──────
  useEffect(() => {
    if (state.step !== 'code') return undefined;
    // Recalage IMMÉDIAT : sans lui, l'affichage garde jusqu'à la première
    // seconde la valeur figée au montage du hook, et un code de dix minutes
    // s'annonce « 10:01 » — un minuteur qui se trompe d'un cran fait douter
    // du reste.
    setMaintenant(Date.now());
    const t = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.step]);

  const requestCode = useCallback(async () => {
    dispatch({ type: 'submitStarted' });
    try {
      const r = await ref.current.client.requestCode(state.email.trim());
      dispatch({ type: 'codeRequested', expiresInS: r.expiresInS, now: Date.now() });
    } catch (error) {
      if (error instanceof Offline) dispatch({ type: 'wentOffline' });
      else dispatch({ type: 'failed', failure: failureFrom(error) });
    }
  }, [state.email]);

  const verifyCode = useCallback(
    async (prenom?: string) => {
      dispatch({ type: 'submitStarted' });
      try {
        const session = await ref.current.client.verifyCode({
          email: state.email.trim(),
          code: assembledCode(state.boxes),
          ...(prenom ? { firstName: prenom.trim() } : {}),
        });
        dispatch({ type: 'sessionOpened', session });
        if (session.user.firstName !== null) ref.current.onSession?.(session);
      } catch (error) {
        if (error instanceof Offline) dispatch({ type: 'wentOffline' });
        else dispatch({ type: 'failed', failure: failureFrom(error) });
      }
    },
    [state.email, state.boxes],
  );

  // ── Auto-vérification au sixième chiffre (EP00 §4) ────────────────────────
  // Le garde-fou est le code lui-même : tant qu'il n'a pas changé, on ne
  // renvoie pas. Sans lui, un code refusé serait renvoyé en boucle.
  const lastSent = useRef<string>('');
  useEffect(() => {
    const code = assembledCode(state.boxes);
    if (state.step !== 'code') return;
    if (!isComplete(state.boxes) || state.pending || state.offline) return;
    if (code === lastSent.current) return;
    lastSent.current = code;
    void verifyCode();
  }, [state.boxes, state.step, state.pending, state.offline, verifyCode]);

  const submit = useCallback(() => {
    if (!canSubmit(state)) return;
    if (state.step === 'email') void requestCode();
    else if (state.step === 'code') void verifyCode();
    else if (state.step === 'firstName') void verifyCode(state.firstName);
  }, [state, requestCode, verifyCode]);

  const resend = useCallback(() => {
    if (!canResend(state, Date.now())) return;
    lastSent.current = '';
    void requestCode();
  }, [state, requestCode]);

  return useMemo(
    () =>
      ({
        state,
        now,
        dispatch,
        submit,
        resend,
        canSubmit: canSubmit(state),
        canResend: canResend(state, now),
      }) as const,
    [state, now, submit, resend],
  );
}

export type Flow = ReturnType<typeof useAuthOtp>;
export type { FlowState };
