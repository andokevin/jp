/**
 * L'adaptateur web du parcours — F0.1
 *
 * Le hook lui-même vit dans `@jp/identite` et ne connaît ni le DOM ni React
 * Native. Ce fichier ne fournit que les deux choses qui sont propres au
 * navigateur : le client HTTP construit sur l'URL de base, et l'écoute des
 * événements `online`/`offline` de la fenêtre.
 *
 * L'écran natif écrira le même fichier, de la même taille, avec NetInfo à la
 * place — et pas une ligne de la machine à états.
 */
import { useMemo } from 'react';
import { ClientIdentite, useAuthOtp as useParcours, type AbonnementReseau } from '@jp/identite';
import type { Language } from '@jp/i18n';
import type { auth } from '@jp/contracts';

/**
 * L'écoute du navigateur.
 *
 * Déclarée au niveau du MODULE, donc stable d'un rendu à l'autre. Écrite en
 * ligne dans l'appel du hook, elle serait un objet neuf à chaque frappe.
 *
 * `navigator.onLine` est consulté une fois au montage : un onglet ouvert alors
 * que la connexion est déjà tombée ne recevra jamais d'événement `offline`,
 * et afficherait un bouton actif menant à une erreur.
 */
const ecouterNavigateur: AbonnementReseau = ({ surCoupure, surRetour }) => {
  globalThis.addEventListener('offline', surCoupure);
  globalThis.addEventListener('online', surRetour);
  if (globalThis.navigator?.onLine === false) surCoupure();
  return () => {
    globalThis.removeEventListener('offline', surCoupure);
    globalThis.removeEventListener('online', surRetour);
  };
};

export interface OptionsParcoursWeb {
  readonly base: string;
  readonly langue: Language;
  /** Injectable pour les tests et pour un futur rendu serveur. */
  readonly fetch?: typeof fetch;
  /** Appelé une fois la session ouverte ET le prénom connu. */
  readonly surSession?: (session: auth.ReponseSession) => void;
}

export function useAuthOtp(options: OptionsParcoursWeb) {
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
    abonnerReseau: ecouterNavigateur,
    ...(options.surSession ? { surSession: options.surSession } : {}),
  });
}

export type { Parcours, EtatParcours } from '@jp/identite';
