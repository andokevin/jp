/**
 * La session sur l'appareil — S8.2
 *
 * Le jeton vit dans le **trousseau du système**, jamais dans le cache. Une
 * fuite du cache ne doit pas donner une session utilisable — et beaucoup de
 * téléphones d'entrée de gamme à Madagascar arrivent déjà rootés.
 *
 * **Ce module ne décide rien du serveur** : il range et il relit. C'est le
 * serveur qui dit si une session est VALIDE *(S3.3)* — un jeton non expiré
 * peut avoir été révoqué, et l'appareil ne peut pas le savoir. La seule
 * décision prise ici est locale : vers quel écran partir au lancement, et
 * quel secret mort effacer en chemin *(`departDepuis`, en bas de fichier)*.
 *
 * Le magasin est **injecté**, jamais importé : voir `magasin.ts`.
 */
import { CLES, verifierTailleSecret, type Magasin } from './magasin.js';

/**
 * Trois situations, et elles ne se racontent pas pareil à l'utilisatrice :
 * « connectez-vous », « votre session a expiré », ou rien du tout.
 */
export type EtatSession =
  | { readonly quoi: 'aucune' }
  | { readonly quoi: 'perimee' }
  | { readonly quoi: 'ouverte'; readonly jeton: string; readonly expireLe: number };

export async function ouvrirSession(
  jeton: string,
  expireLe: number,
  magasin: Magasin,
): Promise<void> {
  verifierTailleSecret(jeton);
  await magasin.ecrire(CLES.jeton, jeton);
  await magasin.ecrire(CLES.jetonExpireLe, String(expireLe));
}

export async function etatSession(magasin: Magasin): Promise<EtatSession> {
  const jeton = await magasin.lire(CLES.jeton);
  if (!jeton) return { quoi: 'aucune' };

  const brut = await magasin.lire(CLES.jetonExpireLe);
  const expireLe = brut ? Number(brut) : 0;

  // Une échéance illisible est traitée comme périmée : on redemande un code
  // plutôt que de partir avec un jeton dont on ne sait rien.
  if (!Number.isFinite(expireLe) || expireLe <= Date.now()) return { quoi: 'perimee' };

  return { quoi: 'ouverte', jeton, expireLe };
}

/**
 * Ferme la session **localement**.
 *
 * Elle ne révoque rien côté serveur : c'est un appel séparé, qui peut échouer
 * si le réseau est coupé. On efface d'abord ici — quelqu'un qui se déconnecte
 * dans un cybercafé ne doit pas dépendre du réseau pour que son jeton
 * disparaisse de l'appareil.
 */
export async function fermerSession(magasin: Magasin): Promise<void> {
  await magasin.effacer(CLES.jeton);
  await magasin.effacer(CLES.jetonExpireLe);
}

// ═══════════════════════════════════════════════════════════════════════════
// Ce que l'application fait de cet état, au démarrage
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Où part-on, et pourquoi ?
 *
 * **Le motif porte DEUX conséquences, et c'est pour ça qu'il remplace le
 * drapeau `nettoyer` de la première version.** Une session périmée demande à la
 * fois d'effacer le jeton mort et de le dire à l'écran ; deux champs séparés
 * auraient dû rester d'accord pour toujours, alors qu'ils décrivent le même
 * fait. Un seul motif, deux comportements qui en dérivent.
 *
 * Le nettoyage n'est pas un détail : une session périmée laisse un jeton dans
 * le trousseau — inutilisable, mais présent, et présent pour toujours, puisque
 * `etatSession` le refuse à chaque démarrage et que plus rien ne le relit. Un
 * secret mort qui traîne sur un appareil revendu d'occasion n'a aucune raison
 * d'y être.
 */
export type Depart =
  | { readonly quoi: 'connexion'; readonly motif: 'aucune' | 'perimee' }
  | { readonly quoi: 'accueil'; readonly jeton: string };

/**
 * @remarks « aucune » et « périmée » mènent au même écran mais ne s'y racontent
 * pas pareil : la seconde y remplace la ligne de soutien par « votre session a
 * expiré ». C'est la ligne sous le titre, dont la boîte réserve déjà deux
 * lignes — l'échange ne décale donc rien, et les deux messages ne sont jamais
 * utiles ensemble.
 */
export function departDepuis(session: EtatSession): Depart {
  switch (session.quoi) {
    case 'ouverte':
      return { quoi: 'accueil', jeton: session.jeton };
    case 'perimee':
      return { quoi: 'connexion', motif: 'perimee' };
    case 'aucune':
      return { quoi: 'connexion', motif: 'aucune' };
  }
}
