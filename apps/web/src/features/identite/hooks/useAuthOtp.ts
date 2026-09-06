/**
 * Le hook du parcours — F0.1
 *
 * Mince par construction : les transitions vivent dans `@jp/identite`, qui est
 * pur et testé sans navigateur. Ce fichier n'ajoute que ce qui a besoin du
 * navigateur — les appels réseau, l'écoute de la connexion, et l'horloge du
 * décompte.
 *
 * L'auto-vérification au sixième chiffre vient d'EP00 §4 : le code est la
 * seule saisie dont on sait qu'elle est finie au caractère près, donc demander
 * un appui de plus est un péage. Le bouton reste néanmoins présent — il porte
 * l'état de chargement, et une personne au clavier doit pouvoir valider
 * elle-même.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Langue } from '@jp/i18n';

import { ClientIdentite, HorsLigne } from '../api/identiteApi.js';
import {
  codeAssemble,
  estComplet,
  etatInitial,
  peutEnvoyer,
  peutRenvoyer,
  reduire,
  type EtatParcours,
  type Panne,
} from '@jp/identite';

/** L'enveloppe d'erreur du serveur, telle qu'elle arrive. */
function panneDepuis(erreur: unknown): Panne {
  const e = erreur as { code?: unknown; message?: unknown };
  return {
    code: typeof e?.code === 'string' ? e.code : 'INDISPONIBLE',
    message: typeof e?.message === 'string' ? e.message : '',
  };
}

export interface OptionsParcours {
  readonly base: string;
  readonly langue: Langue;
  /** Injectable pour les tests et pour un futur rendu serveur. */
  readonly fetch?: typeof fetch;
  /** Appelé une fois la session ouverte ET le prénom connu. */
  readonly surSession?: (jeton: string) => void;
}

export function useAuthOtp(options: OptionsParcours) {
  const [etat, envoyer] = useReducer(reduire, undefined, etatInitial);
  const [maintenant, setMaintenant] = useState(() => Date.now());

  const client = useMemo(
    () =>
      new ClientIdentite({
        base: options.base,
        langue: options.langue,
        ...(options.fetch ? { fetch: options.fetch } : {}),
      }),
    [options.base, options.langue, options.fetch],
  );

  // ── La connexion, écoutée plutôt que devinée ───────────────────────────────
  useEffect(() => {
    const coupe = () => envoyer({ type: 'coupure' });
    const revient = () => envoyer({ type: 'reseauRevenu' });
    globalThis.addEventListener('offline', coupe);
    globalThis.addEventListener('online', revient);
    if (globalThis.navigator?.onLine === false) coupe();
    return () => {
      globalThis.removeEventListener('offline', coupe);
      globalThis.removeEventListener('online', revient);
    };
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
      const r = await client.demanderCode(etat.email.trim());
      envoyer({ type: 'codeDemande', expireDansS: r.expireDansS, maintenant: Date.now() });
    } catch (erreur) {
      if (erreur instanceof HorsLigne) envoyer({ type: 'coupure' });
      else envoyer({ type: 'echec', panne: panneDepuis(erreur) });
    }
  }, [client, etat.email]);

  const verifierCode = useCallback(
    async (prenom?: string) => {
      envoyer({ type: 'envoiCommence' });
      try {
        const session = await client.verifierCode({
          email: etat.email.trim(),
          code: codeAssemble(etat.cases),
          ...(prenom ? { prenom: prenom.trim() } : {}),
        });
        envoyer({ type: 'sessionOuverte', session });
        if (session.utilisateur.prenom !== null) options.surSession?.(session.jeton);
      } catch (erreur) {
        if (erreur instanceof HorsLigne) envoyer({ type: 'coupure' });
        else envoyer({ type: 'echec', panne: panneDepuis(erreur) });
      }
    },
    [client, etat.email, etat.cases, options],
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

  return {
    etat,
    maintenant,
    envoyer,
    soumettre,
    renvoyer,
    peutEnvoyer: peutEnvoyer(etat),
    peutRenvoyer: peutRenvoyer(etat, maintenant),
  } as const;
}

export type Parcours = ReturnType<typeof useAuthOtp>;
export type { EtatParcours };
