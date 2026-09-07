/**
 * L'adaptateur natif du parcours — F0.1
 *
 * Le jumeau exact de `apps/web/src/features/identite/hooks/useAuthOtp.ts`, et
 * c'est le but : les deux font une quinzaine de lignes parce que les cent
 * autres — transitions, décompte, auto-vérification au sixième chiffre — sont
 * dans `@jp/identite` et n'existent qu'une fois.
 *
 * **Une différence assumée : pas d'abonnement réseau.** Le web écoute
 * `online`/`offline`, que le navigateur émet gratuitement. React Native
 * demanderait `@react-native-community/netinfo`, une dépendance native de
 * plus, non installée ici. Sans elle, la coupure se découvre au PREMIER appel
 * qui échoue : `ClientIdentite` lève `HorsLigne`, le réducteur bascule, le
 * bandeau paraît et la saisie est conservée. Ce qu'on perd est la détection
 * AVANT le geste — le bouton reste actif jusqu'à la première tentative.
 * `abonnerReseau` est le point d'accroche prévu pour ça.
 */
import { useMemo } from 'react';
import { ClientIdentite, useAuthOtp as useParcours } from '@jp/identite';
import type { Langue } from '@jp/i18n';

export interface OptionsParcoursNatif {
  readonly base: string;
  readonly langue: Langue;
  /** Injectable pour les tests. */
  readonly fetch?: typeof fetch;
  /** Appelé une fois la session ouverte ET le prénom connu. */
  readonly surSession?: (jeton: string) => void;
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
    ...(options.surSession ? { surSession: options.surSession } : {}),
  });
}

export type { Parcours, EtatParcours } from '@jp/identite';
