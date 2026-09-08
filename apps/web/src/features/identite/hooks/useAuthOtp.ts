/**
 * L'adaptateur web du flow — F0.1
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
import { IdentityClient, useAuthOtp as useFlow, type NetworkSubscription } from '@jp/identite';
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
 * et afficherait un bouton actif menant à une error.
 */
const listenBrowser: NetworkSubscription = ({ onOffline, onOnline }) => {
  globalThis.addEventListener('offline', onOffline);
  globalThis.addEventListener('online', onOnline);
  if (globalThis.navigator?.onLine === false) onOffline();
  return () => {
    globalThis.removeEventListener('offline', onOffline);
    globalThis.removeEventListener('online', onOnline);
  };
};

export interface WebFlowOptions {
  readonly base: string;
  readonly language: Language;
  /** Injectable pour les tests et pour un futur rendu serveur. */
  readonly fetch?: typeof fetch;
  /** Appelé une fois la session ouverte ET le prénom connu. */
  readonly onSession?: (session: auth.SessionResponse) => void;
}

export function useAuthOtp(options: WebFlowOptions) {
  const client = useMemo(
    () =>
      new IdentityClient({
        base: options.base,
        language: options.language,
        ...(options.fetch ? { fetch: options.fetch } : {}),
      }),
    [options.base, options.language, options.fetch],
  );

  return useFlow({
    client,
    subscribeNetwork: listenBrowser,
    ...(options.onSession ? { onSession: options.onSession } : {}),
  });
}

export type { Flow, FlowState } from '@jp/identite';
