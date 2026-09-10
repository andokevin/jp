/**
 * L'adaptateur natif du flow — F0.1
 *
 * Le jumeau exact de `apps/web/src/features/identite/hooks/useAuthOtp.ts`, et
 * c'est le but : les deux font une vingtaine de lignes parce que les cent
 * autres — transitions, décompte, auto-vérification au sixième chiffre — sont
 * dans `@jp/identite` et n'existent qu'une fois.
 *
 * Ne restent ici que les deux choses proprement natives : le client HTTP
 * construit sur l'URL de base, et l'écoute du réseau par NetInfo.
 */
import { useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { IdentityClient, useAuthOtp as useFlow, type NetworkSubscription } from '@jp/identite';
import type { Language } from '@jp/i18n';
import type { auth } from '@jp/contracts';

import { estEnLigne } from '../../../noyau/reseau.js';
import { CLES, type MagasinLecture } from '../../../noyau/magasin.js';

/**
 * L'écoute du réseau, version native.
 *
 * Déclarée au niveau du MODULE, donc stable d'un rendu à l'autre. Écrite en
 * ligne dans l'appel du hook, elle serait un objet neuf à chaque frappe.
 *
 * Deux pièges de NetInfo, tous deux résolus ici :
 *
 *   1. **`isInternetReachable` peut valoir `null`** — « je suis en train de
 *      vérifier ». La règle est dans `noyau/reseau.ts`, sortie d'ici pour
 *      qu'un test la tienne : le doute n'est pas une coupure.
 *   2. **L'abonnement émet aussitôt l'état courant**, puis à chaque
 *      changement. C'est ce qui couvre l'application ouverte alors que le
 *      réseau est DÉJÀ tombé — le cas que le web doit rattraper à la main
 *      avec `navigator.onLine`, parce qu'aucun événement `offline` ne
 *      viendra jamais l'annoncer.
 *
 * La comparaison avec l'état précédent évite de réémettre la même transition
 * à chaque battement de NetInfo : une action `coupure` répétée reconstruirait
 * l'état à l'identique, mais rendrait l'écran pour rien.
 */
const listenNetInfo: NetworkSubscription = ({ onOffline, onOnline }) => {
  let precedent: boolean | null = null;
  return NetInfo.addEventListener((etat) => {
    const enLigne = estEnLigne(etat);
    if (enLigne === precedent) return;
    precedent = enLigne;
    if (enLigne) onOnline();
    else onOffline();
  });
};

export interface NativeFlowOptions {
  readonly base: string;
  readonly language: Language;
  /** Injectable pour les tests. */
  readonly fetch?: typeof fetch;
  /** Injectable pour les tests — `undefined` désactive l'écoute. */
  readonly subscribeNetwork?: NetworkSubscription;
  /** Appelé une fois la session ouverte ET le prénom connu. */
  readonly onSession?: (session: auth.SessionResponse) => void;
  /**
   * Le magasin dans lequel on lit la préférence « économie de données »
   * (`CLES.economieDonnees`). Facultatif : sans magasin, la préférence est
   * considérée à `false` — comportement historique, aucun changement pour
   * les tests qui n'en passent pas.
   *
   * On lit UNIQUEMENT — d'où `MagasinLecture` (Pick<Magasin, 'lire'>).
   * Écrire la préférence est le travail d'un écran de réglages, pas du
   * hook d'authentification.
   */
  readonly magasin?: MagasinLecture;
}

export function useAuthOtp(options: NativeFlowOptions) {
  // ── Lecture asynchrone de la préférence « économie de données » ──────────
  //
  // Le magasin est asynchrone (AsyncStorage). Tant que la lecture n'a pas
  // rendu, on part sur le défaut historique (`false`) — comportement inchangé
  // pour l'utilisatrice qui n'a jamais touché la préférence, et pas plus lent
  // que ce qu'on avait avant l'ajout.
  //
  // AsyncStorage ne stocke que du texte : on compare à la string `'true'`.
  // Toute autre valeur — `null`, `'false'`, une valeur corrompue — retombe
  // sur le défaut. C'est intentionnel : une préférence illisible ne doit
  // pas bloquer l'appli, elle doit reprendre le comportement standard.
  const [dataSaver, setDataSaver] = useState(false);
  useEffect(() => {
    if (!options.magasin) return undefined;
    // Cancel-guard : si le composant est démonté avant que la promesse
    // se résolve, on ne veut pas appeler setDataSaver sur un hook mort
    // (React râlerait avec « Can't perform a React state update on an
    // unmounted component »).
    let cancelled = false;
    void options.magasin.lire(CLES.economieDonnees).then((valeur) => {
      if (cancelled) return;
      setDataSaver(valeur === 'true');
    });
    return () => {
      cancelled = true;
    };
  }, [options.magasin]);

  const client = useMemo(
    () =>
      new IdentityClient({
        base: options.base,
        language: options.language,
        dataSaver,
        ...(options.fetch ? { fetch: options.fetch } : {}),
      }),
    [options.base, options.language, options.fetch, dataSaver],
  );

  return useFlow({
    client,
    subscribeNetwork: options.subscribeNetwork ?? listenNetInfo,
    // Data-saving désactive l'auto-verify au sixième chiffre : un appel de
    // moins par tentative. Le bouton reste, l'utilisatrice valide elle-même.
    autoVerifyOnComplete: !dataSaver,
    ...(options.onSession ? { onSession: options.onSession } : {}),
  });
}

export type { Flow, FlowState } from '@jp/identite';
