/**
 * La session sur l'appareil — S8.2
 *
 * Le jeton vit dans le **trousseau du système**, jamais dans le cache. Une
 * fuite du cache ne doit pas donner une session utilisable — et beaucoup de
 * téléphones d'entrée de gamme à Madagascar arrivent déjà rootés.
 *
 * **Ce module ne décide rien** : il range et il relit. C'est le serveur qui dit
 * si une session est valide *(S3.3)* — un jeton non expiré peut avoir été
 * révoqué, et l'appareil ne peut pas le savoir.
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
