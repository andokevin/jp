/**
 * Contexte de requête — S3.1
 *
 * Un identifiant de corrélation qui traverse l'API, les files et le
 * WebSocket. Sans lui, déboguer un incident consiste à recouper des
 * horodatages à la main entre trois journaux.
 *
 * `AsyncLocalStorage` est le mécanisme de Node pour transporter un contexte à
 * travers des appels asynchrones **sans le passer en paramètre partout**. Il
 * survit aux `await`, ce qu'une simple variable globale ne ferait pas : deux
 * requêtes simultanées auraient le même contexte.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { Langue } from '@jp/i18n';

export interface Contexte {
  readonly correlation: string;
  readonly langue: Langue;
  readonly utilisateurId?: string;
  readonly adresseIp?: string;
  readonly economieDonnees: boolean;
}

const stockage = new AsyncLocalStorage<Contexte>();

export function avecContexte<T>(contexte: Contexte, suite: () => T): T {
  return stockage.run(contexte, suite);
}

/**
 * Le contexte courant, ou `undefined` hors requête — dans un travailleur, au
 * démarrage. Les appelants doivent gérer l'absence plutôt que de supposer.
 */
export function contexte(): Contexte | undefined {
  return stockage.getStore();
}

/** L'identifiant de corrélation, ou un neuf si l'on est hors requête. */
export function correlation(): string {
  return stockage.getStore()?.correlation ?? randomUUID();
}

/**
 * Journalise sans jamais laisser passer une donnée personnelle.
 *
 * **L'adresse électronique n'apparaît jamais en clair dans un journal**
 * *(R-C10)* : un journal se copie, s'exporte, s'envoie à un prestataire. Elle
 * est réduite à `mi***@jp.mg`, assez pour reconnaître un compte pendant un
 * incident, pas assez pour constituer un annuaire.
 */
export function masquerEmail(email: string): string {
  const [local, domaine] = email.split('@');
  if (!local || !domaine) return '***';
  return `${local.slice(0, 2)}***@${domaine}`;
}
