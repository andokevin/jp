/**
 * L'adaptateur natif du parcours — F0.1
 *
 * Le jumeau exact de `apps/web/src/features/identite/hooks/useAuthOtp.ts`, et
 * c'est le but : les deux font une vingtaine de lignes parce que les cent
 * autres — transitions, décompte, auto-vérification au sixième chiffre — sont
 * dans `@jp/identite` et n'existent qu'une fois.
 *
 * Ne restent ici que les deux choses proprement natives : le client HTTP
 * construit sur l'URL de base, et l'écoute du réseau par NetInfo.
 */
import { useMemo } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ClientIdentite, useAuthOtp as useParcours, type AbonnementReseau } from '@jp/identite';
import type { Language } from '@jp/i18n';
import type { auth } from '@jp/contracts';

import { estEnLigne } from '../../../noyau/reseau.js';

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
const ecouterNetInfo: AbonnementReseau = ({ surCoupure, surRetour }) => {
  let precedent: boolean | null = null;
  return NetInfo.addEventListener((etat) => {
    const enLigne = estEnLigne(etat);
    if (enLigne === precedent) return;
    precedent = enLigne;
    if (enLigne) surRetour();
    else surCoupure();
  });
};

export interface OptionsParcoursNatif {
  readonly base: string;
  readonly langue: Language;
  /** Injectable pour les tests. */
  readonly fetch?: typeof fetch;
  /** Injectable pour les tests — `undefined` désactive l'écoute. */
  readonly abonnerReseau?: AbonnementReseau;
  /** Appelé une fois la session ouverte ET le prénom connu. */
  readonly surSession?: (session: auth.SessionResponse) => void;
}

export function useAuthOtp(options: OptionsParcoursNatif) {
  const client = useMemo(
    () =>
      new ClientIdentite({
        base: options.base,
        langue: options.langue,
        ...(options.fetch ? { fetch: options.fetch } : {}),
      }),
    [options.base, options.langue, options.fetch],
  );

  return useParcours({
    client,
    abonnerReseau: options.abonnerReseau ?? ecouterNetInfo,
    ...(options.surSession ? { surSession: options.surSession } : {}),
  });
}

export type { Parcours, EtatParcours } from '@jp/identite';
