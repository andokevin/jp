/**
 * Le contrat de stockage — **sans aucune dépendance à l'appareil**
 *
 * Ce fichier ne connaît ni `expo-secure-store` ni `AsyncStorage`. C'est
 * délibéré, et pour deux raisons :
 *
 *   1. **Il est éprouvable hors appareil.** Les paquets React Native ne se
 *      chargent pas dans un test Node ; une logique qui les importe n'est
 *      testable que manuellement, sur un téléphone.
 *   2. **Il rend la dépendance visible.** Une fonction qui reçoit son magasin
 *      en paramètre dit ce dont elle a besoin. Une fonction qui l'importe le
 *      cache.
 *
 * Les implémentations réelles sont dans `stockage.ts`, que **seule
 * l'application** importe.
 */

export interface Magasin {
  lire(cle: string): Promise<string | null>;
  ecrire(cle: string, valeur: string): Promise<void>;
  effacer(cle: string): Promise<void>;
}

/** Ce dont une fonction a besoin, réduit au minimum. */
export type MagasinLecture = Pick<Magasin, 'lire'>;
export type MagasinEcriture = Pick<Magasin, 'lire' | 'ecrire'>;

/** Les clés, nommées une fois. Une faute de frappe perdrait une session. */
export const CLES = {
  token: 'jp.session.token',
  tokenExpiresAt: 'jp.session.expire',
  universCourant: 'jp.univers.courant',
  universVus: 'jp.univers.vus',
  fileEcritures: 'jp.hors-ligne.file',
  economieDonnees: 'jp.preference.economie',
} as const;

/**
 * La limite du trousseau du système : **2 048 octets par entrée**.
 *
 * Largement assez pour un jeton de 32 octets encodé, et beaucoup trop peu pour
 * un cache. **La contrainte impose donc le bon usage** : ce qui ne tient pas
 * dans le trousseau n'est pas un secret.
 */
export const TAILLE_MAX_SECRET = 2_000;

export function verifierTailleSecret(valeur: string): void {
  if (valeur.length > TAILLE_MAX_SECRET) {
    throw new Error(
      `Le trousseau est limité à 2 048 octets ; reçu ${valeur.length} caractères. ` +
        "Ce n'est pas un secret, c'est du cache : utilisez le magasin ordinaire.",
    );
  }
}
