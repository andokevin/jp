/**
 * Cache court-terme des demandes OTP — F0.1 étape 5
 *
 * **Pourquoi ce module existe.** Sur réseau malgache lent, une utilisatrice
 * qui redemande un code pour le MÊME email dans la minute paie un aller-retour
 * pour un appel dont l'effet serveur est déjà idempotent — le OTP est
 * régénéré, mais le précédent était encore valide et le rate-limit serveur
 * refuse déjà les rafales. Sauter le round-trip quand on connaît la réponse
 * est une économie de données, cohérente avec l'esprit du sprint.
 *
 * **Pourquoi une classe à horloge injectable.** On veut tester le comportement
 * du TTL sans dormir 60 s. `Date.now` est le défaut ; les tests passent leur
 * propre horloge factice, contrôlent chaque tick au millième de seconde, et
 * peuvent même faire RECULER le temps pour prouver que les entrées expirées
 * sont réellement supprimées de la Map (et pas juste filtrées à la sortie —
 * l'absence de suppression fuirait de la mémoire sur un process long).
 *
 * **Pourquoi un singleton en plus de la classe.** Les consommateurs du hook
 * n'ont pas à plomber le cache à travers l'arbre React. La CLASSE existe pour
 * les tests ; le SINGLETON existe pour la production. Il vit dans le module,
 * donc il survit aux démontages/remontages du hook — c'est ce qui rend utile
 * le scénario « navigation + retour à l'écran dans la minute ».
 *
 * **Ce que le cache ne fait PAS.**
 *   · Il ne remplace pas le rate-limit serveur (deux emails différents → deux
 *     appels).
 *   · Il ne conserve pas l'état du parcours — un remount du hook repart bien
 *     de `initialState()`, seule la première demande sur cet email dans la
 *     minute est court-circuitée.
 *   · Il n'est pas partagé entre utilisateurs. L'appli DOIT appeler
 *     `sharedRequestCache.clear()` au logout pour éviter qu'un email cached
 *     pour Alice ne serve à Bob.
 *
 * **Deux échéances distinctes vivent dans chaque entrée.**
 *   · `otpDeadlineMs` — instant absolu où le code OTP expire côté serveur
 *     (~10 min après la demande). Stocké en absolu pour recalculer le
 *     décompte affiché à la lecture.
 *   · `cacheDeadlineMs` — instant absolu où le cache cesse de servir cette
 *     entrée (~60 s après la demande).
 * Un cache de 60 s sur un code qui n'a plus que 5 s ferait afficher un
 * compte à rebours ridicule ; les deux échéances doivent être vraies pour
 * qu'un hit soit rendu.
 */
import type { auth } from '@jp/contracts';
import { RESEND_DELAY_S } from './flow.js';

interface CacheEntry {
  /**
   * Instant absolu (epoch ms) où le OTP lui-même expire. Stocké en absolu
   * plutôt qu'en `expiresInS` : une valeur lue 55 s après avoir été posée
   * doit refléter que 55 s ont passé, sinon l'UI affiche « 10:00 » au lieu
   * de « 9:05 ».
   */
  readonly otpDeadlineMs: number;
  /** Instant absolu (epoch ms) où l'entrée cesse d'être servie. */
  readonly cacheDeadlineMs: number;
}

export class RequestCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(
    private readonly ttlMs: number,
    private readonly clock: () => number = () => Date.now(),
  ) {}

  /**
   * Rend la dernière réponse cachée pour `email`, avec un `expiresInS`
   * RECALCULÉ depuis la deadline absolue — l'appelant traite le retour
   * comme une réponse serveur fraîche.
   *
   * Rend `null` sur miss OU sur entrée expirée. Dans le second cas,
   * l'entrée est **supprimée de la Map** — sans ça, un process long
   * accumulerait indéfiniment des clés mortes.
   */
  get(email: string): auth.OtpResponse | null {
    const entry = this.entries.get(email);
    if (!entry) return null;
    const now = this.clock();
    if (now >= entry.cacheDeadlineMs) {
      this.entries.delete(email);
      return null;
    }
    // `Math.max(0, …)` est défensif : si le OTP côté serveur a expiré
    // mais que le TTL du cache est plus long (mauvaise config), on ne
    // veut pas rendre un décompte négatif au reducer.
    const expiresInS = Math.max(0, Math.ceil((entry.otpDeadlineMs - now) / 1000));
    return { ok: true, expiresInS };
  }

  set(email: string, response: auth.OtpResponse): void {
    const now = this.clock();
    this.entries.set(email, {
      otpDeadlineMs: now + response.expiresInS * 1000,
      cacheDeadlineMs: now + this.ttlMs,
    });
  }

  clear(): void {
    this.entries.clear();
  }
}

/**
 * L'instance qu'utilise réellement le hook. Partagée par TOUS les mounts de
 * `useAuthOtp` dans le même process JavaScript — c'est le point du design :
 * un remount ne doit pas re-fetch ce qui a été fetché quinze secondes plus
 * tôt.
 *
 * Exportée pour que les applis puissent la vider au logout ou au « changer de
 * compte ». Pas exportée pour les tests — les tests ciblent `RequestCache`
 * directement avec une horloge factice.
 */
export const sharedRequestCache = new RequestCache(RESEND_DELAY_S * 1000);
