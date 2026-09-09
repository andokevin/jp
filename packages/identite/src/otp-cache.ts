/**
 * Cache 60 s des demandes OTP — F0.1
 *
 * L'écran laisse l'utilisatrice retaper le même email dans la minute (retour
 * arrière puis re-soumission, onglet ré-ouvert, modal refermé et rouvert).
 * Sans ce cache, chaque appui déclenche un `POST /identite/otp/emettre` de
 * plus — sans effet visible côté écran (le serveur rate-limite déjà), mais un
 * aller-retour perdu de plus sur un réseau qui n'en a pas à revendre.
 *
 * **Ce que le cache ne fait PAS.**
 *   · Il ne remplace pas le rate-limit serveur (deux emails différents → deux
 *     appels).
 *   · Il ne persiste pas au démontage du hook (une nouvelle instance repart
 *     avec une Map vide).
 *   · Il ne conserve pas l'état du parcours (le hook redémarre bien à
 *     `initialState`).
 *
 * **Deux horloges se croisent ici.**
 *   · Le TTL local (60 s) borne la validité du cache.
 *   · L'échéance serveur (~600 s) borne la validité du code lui-même.
 * Une entrée n'est utile que si **les deux** sont encore vraies — un cache de
 * 60 s sur un code qui n'a plus que 5 s ferait afficher un compte à rebours
 * ridicule et donnerait à l'utilisatrice l'impression que le code est mort à
 * l'écran alors qu'il l'est vraiment côté serveur.
 *
 * **Le décompte affiché reste vrai.** On stocke la réponse serveur telle
 * qu'elle est arrivée, plus l'instant du dépôt. Au hit, on recalcule
 * `expiresInS` par soustraction. Sans ça, un email demandé il y a 30 s
 * rejouerait « 10:00 » au retour, alors qu'il reste 9:30.
 */
import type { auth } from '@jp/contracts';

/** Durée de conservation d'une entrée. Au-delà, un rejeu refait un vrai appel. */
export const CACHE_TTL_MS = 60_000;

export interface CacheEntry {
  /** Réponse d'origine du serveur — le hook la rejoue au réducteur. */
  readonly response: auth.OtpResponse;
  /** Instant du premier appel réseau, en epoch ms. */
  readonly storedAtMs: number;
}

/**
 * Rend l'entrée de cache SI elle est encore utile — dans le TTL local ET
 * avant l'expiration côté serveur. Sinon `null`.
 *
 * La Map est déclarée `ReadonlyMap` : la fonction ne mute rien. Le hook, lui,
 * fait le `.set()` quand il pose une nouvelle entrée après un vrai appel.
 */
export function readCache(
  cache: ReadonlyMap<string, CacheEntry>,
  email: string,
  nowMs: number,
): CacheEntry | null {
  const entry = cache.get(email);
  if (!entry) return null;
  const ageMs = nowMs - entry.storedAtMs;
  if (ageMs >= CACHE_TTL_MS) return null;
  // Le code serveur expire aussi. Si le TTL restant est nul, inutile de
  // rejouer — on refera un vrai appel qui rendra un code frais.
  const remainingS = entry.response.expiresInS - Math.floor(ageMs / 1000);
  if (remainingS <= 0) return null;
  return entry;
}

/**
 * Nouvelle entrée à poser dans le cache. Encapsule le couple
 * `(réponse, instant du dépôt)` pour que le hook ne s'en préoccupe pas.
 */
export function newEntry(response: auth.OtpResponse, nowMs: number): CacheEntry {
  return { response, storedAtMs: nowMs };
}

/**
 * `expiresInS` restant sur une entrée à un instant donné — ce qu'on donne au
 * réducteur pour que l'échéance affichée reste vraie.
 *
 * Jamais négatif : si l'appelant nous demande la valeur alors que le code est
 * déjà mort côté serveur, `readCache` aurait dû rendre `null` en amont ; par
 * précaution on rend `0` plutôt qu'un nombre absurde.
 */
export function remainingExpiresInS(entry: CacheEntry, nowMs: number): number {
  const elapsedS = Math.floor((nowMs - entry.storedAtMs) / 1000);
  return Math.max(0, entry.response.expiresInS - elapsedS);
}
