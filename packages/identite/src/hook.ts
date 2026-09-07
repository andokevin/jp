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

import { HorsLigne, type ClientIdentite } from './api.js';
import { codeAssemble, estComplet } from './code-otp.js';
import {
  etatInitial,
  peutEnvoyer,
  peutRenvoyer,
  reduire,
  type EtatParcours,
  type Panne,
} from './parcours.js';

/** L'enveloppe d'erreur du serveur, telle qu'elle arrive. */
function panneDepuis(erreur: unknown): Panne {
  const e = erreur as { code?: unknown; message?: unknown };
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
 * au premier appel qui échoue, le client lève `HorsLigne` et le réducteur
 * bascule pareil. On perd la détection AVANT le geste, pas la bascule.
 */
export type AbonnementReseau = (evenements: {
  readonly surCoupure: () => void;
  readonly surRetour: () => void;
}) => () => void;

export interface OptionsParcours {
  /** Construit par l'application — c'est elle qui connaît l'URL de base. */
  readonly client: Pick<ClientIdentite, 'demanderCode' | 'verifierCode'>;
  readonly abonnerReseau?: AbonnementReseau;
  /**
   * Appelé une fois la session ouverte ET le prénom connu.
   *
   * Reçoit la réponse ENTIÈRE, pas le seul jeton : `expireLe` en fait partie,
   * et sans lui l'appareil ne peut pas ranger la session — `ouvrirSession`
   * de `noyau/session.ts` réclame les deux. Une signature qui ne passait que
   * le jeton obligeait l'appelant à redemander au serveur ce qu'il venait de
   * recevoir, ou à inventer une échéance.
   */
  readonly surSession?: (session: auth.ReponseSession) => void;
}

export function useAuthOtp(options: OptionsParcours) {
  const [etat, envoyer] = useReducer(reduire, undefined, etatInitial);
  const [maintenant, setMaintenant] = useState(() => Date.now());

  /**
   * Les options sont lues à TRAVERS une référence, jamais mises en dépendance.
   *
   * Un appelant qui écrit `useAuthOtp({ client, abonnerReseau: (e) => … })`
   * fabrique un objet neuf à chaque rendu. En dépendance d'effet, cet objet
   * réabonnerait le réseau à chaque frappe — et l'effet de nettoyage
   * désabonnerait juste après. Le piège est classique et silencieux : ça
   * marche, ça fuit.
   */
  const ref = useRef(options);
  ref.current = options;

  // ── La connexion, écoutée plutôt que devinée ───────────────────────────────
  useEffect(() => {
    const abonner = ref.current.abonnerReseau;
    if (!abonner) return undefined;
    return abonner({
      surCoupure: () => envoyer({ type: 'coupure' }),
      surRetour: () => envoyer({ type: 'reseauRevenu' }),
    });
  }, []);

  // ── L'horloge du décompte — une seconde, et seulement quand elle sert ──────
  useEffect(() => {
    if (etat.etape !== 'code') return undefined;
    // Recalage IMMÉDIAT : sans lui, l'affichage garde jusqu'à la première
    // seconde la valeur figée au montage du hook, et un code de dix minutes
    // s'annonce « 10:01 » — un minuteur qui se trompe d'un cran fait douter
    // du reste.
    setMaintenant(Date.now());
    const t = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(t);
  }, [etat.etape]);

  const demanderCode = useCallback(async () => {
    envoyer({ type: 'envoiCommence' });
    try {
      const r = await ref.current.client.demanderCode(etat.email.trim());
      envoyer({ type: 'codeDemande', expireDansS: r.expireDansS, maintenant: Date.now() });
    } catch (erreur) {
      if (erreur instanceof HorsLigne) envoyer({ type: 'coupure' });
      else envoyer({ type: 'echec', panne: panneDepuis(erreur) });
    }
  }, [etat.email]);

  const verifierCode = useCallback(
    async (prenom?: string) => {
      envoyer({ type: 'envoiCommence' });
      try {
        const session = await ref.current.client.verifierCode({
          email: etat.email.trim(),
          code: codeAssemble(etat.cases),
          ...(prenom ? { prenom: prenom.trim() } : {}),
        });
        envoyer({ type: 'sessionOuverte', session });
        if (session.utilisateur.prenom !== null) ref.current.surSession?.(session);
      } catch (erreur) {
        if (erreur instanceof HorsLigne) envoyer({ type: 'coupure' });
        else envoyer({ type: 'echec', panne: panneDepuis(erreur) });
      }
    },
    [etat.email, etat.cases],
  );

  // ── Auto-vérification au sixième chiffre (EP00 §4) ────────────────────────
  // Le garde-fou est le code lui-même : tant qu'il n'a pas changé, on ne
  // renvoie pas. Sans lui, un code refusé serait renvoyé en boucle.
  const dernierEnvoye = useRef<string>('');
  useEffect(() => {
    const code = codeAssemble(etat.cases);
    if (etat.etape !== 'code') return;
    if (!estComplet(etat.cases) || etat.enCours || etat.horsLigne) return;
    if (code === dernierEnvoye.current) return;
    dernierEnvoye.current = code;
    void verifierCode();
  }, [etat.cases, etat.etape, etat.enCours, etat.horsLigne, verifierCode]);

  const soumettre = useCallback(() => {
    if (!peutEnvoyer(etat)) return;
    if (etat.etape === 'email') void demanderCode();
    else if (etat.etape === 'code') void verifierCode();
    else if (etat.etape === 'prenom') void verifierCode(etat.prenom);
  }, [etat, demanderCode, verifierCode]);

  const renvoyer = useCallback(() => {
    if (!peutRenvoyer(etat, Date.now())) return;
    dernierEnvoye.current = '';
    void demanderCode();
  }, [etat, demanderCode]);

  return useMemo(
    () =>
      ({
        etat,
        maintenant,
        envoyer,
        soumettre,
        renvoyer,
        peutEnvoyer: peutEnvoyer(etat),
        peutRenvoyer: peutRenvoyer(etat, maintenant),
      }) as const,
    [etat, maintenant, soumettre, renvoyer],
  );
}

export type Parcours = ReturnType<typeof useAuthOtp>;
export type { EtatParcours };
