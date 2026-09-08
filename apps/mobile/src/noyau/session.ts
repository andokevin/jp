/**
 * La session sur l'appareil — S8.2
 *
 * Le token vit dans le **trousseau du système**, jamais dans le cache. Une
 * fuite du cache ne doit pas donner une session utilisable — et beaucoup de
 * téléphones d'entrée de gamme à Madagascar arrivent déjà rootés.
 *
 * **Ce module ne décide rien du serveur** : il range et il relit. C'est le
 * serveur qui dit si une session est VALIDE *(S3.3)* — un token non expiré
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
  | { readonly quoi: 'ouverte'; readonly token: string; readonly expiresAt: number };

export async function ouvrirSession(
  token: string,
  expiresAt: number,
  magasin: Magasin,
): Promise<void> {
  verifierTailleSecret(token);
  await magasin.ecrire(CLES.token, token);
  await magasin.ecrire(CLES.tokenExpiresAt, String(expiresAt));
}

export async function etatSession(magasin: Magasin): Promise<EtatSession> {
  const token = await magasin.lire(CLES.token);
  if (!token) return { quoi: 'aucune' };

  const brut = await magasin.lire(CLES.tokenExpiresAt);
  const expiresAt = brut ? Number(brut) : 0;

  // Une échéance illisible est traitée comme périmée : on redemande un code
  // plutôt que de partir avec un token dont on ne sait rien.
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return { quoi: 'perimee' };

  return { quoi: 'ouverte', token, expiresAt };
}

/**
 * Ferme la session **localement**.
 *
 * Elle ne révoque rien côté serveur : c'est un appel séparé, qui peut échouer
 * si le réseau est coupé. On efface d'abord ici — quelqu'un qui se déconnecte
 * dans un cybercafé ne doit pas dépendre du réseau pour que son token
 * disparaisse de l'appareil.
 */
export async function fermerSession(magasin: Magasin): Promise<void> {
  await magasin.effacer(CLES.token);
  await magasin.effacer(CLES.tokenExpiresAt);
}

// ═══════════════════════════════════════════════════════════════════════════
// Ce que l'application fait de cet état, au démarrage
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Où part-on, et pourquoi ?
 *
 * **Le motif porte DEUX conséquences, et c'est pour ça qu'il remplace le
 * drapeau `nettoyer` de la première version.** Une session périmée demande à la
 * fois d'effacer le token mort et de le dire à l'écran ; deux champs séparés
 * auraient dû rester d'accord pour toujours, alors qu'ils décrivent le même
 * fait. Un seul motif, deux comportements qui en dérivent.
 *
 * Le nettoyage n'est pas un détail : une session périmée laisse un token dans
 * le trousseau — inutilisable, mais présent, et présent pour toujours, puisque
 * `etatSession` le refuse à chaque démarrage et que plus rien ne le relit. Un
 * secret mort qui traîne sur un appareil revendu d'occasion n'a aucune raison
 * d'y être.
 */
export type Depart =
  | { readonly quoi: 'login'; readonly motif: 'aucune' | 'perimee' }
  | { readonly quoi: 'accueil'; readonly token: string };

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
      return { quoi: 'accueil', token: session.token };
    case 'perimee':
      return { quoi: 'login', motif: 'perimee' };
    case 'aucune':
      return { quoi: 'login', motif: 'aucune' };
  }
}
