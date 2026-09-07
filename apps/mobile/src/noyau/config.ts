/**
 * La configuration de compilation — S8
 *
 * **Une seule variable, et elle est obligatoire.** Expo remplace les
 * `EXPO_PUBLIC_*` par leur valeur au moment de la construction du paquet :
 * elles ne sont pas lues à l'exécution, et un `.env` posé sur le téléphone n'y
 * changerait rien. Ce qui est ici est donc gravé dans l'APK.
 *
 * La fonction reçoit l'environnement plutôt que de lire `process.env` :
 * c'est ce qui la rend éprouvable, et ce qui rend visible ce dont elle dépend.
 */

/** Le nom de la variable, écrit une fois. Une faute de frappe est muette. */
export const CLE_BASE_API = 'EXPO_PUBLIC_API_BASE';

/**
 * L'URL de base de l'API.
 *
 * **Aucun repli.** Un défaut sur `http://localhost:3000` produirait un APK qui
 * s'installe, s'ouvre, et échoue à la première requête avec « pas de
 * connexion » — le pire des messages, puisqu'il accuse le réseau de la
 * personne. Mieux vaut que la construction s'arrête ici, sur une phrase qui
 * nomme la variable manquante.
 *
 * La barre oblique finale est retirée : les chemins commencent tous par `/`,
 * et `.../identite//otp/emettre` n'est pas la même URL pour tout le monde —
 * certains serveurs répondent 404, d'autres normalisent en silence.
 */
export function baseApi(env: Record<string, string | undefined>): string {
  const brut = env[CLE_BASE_API]?.trim();
  if (!brut) {
    throw new Error(
      `${CLE_BASE_API} n'est pas définie. Elle est gravée à la construction du paquet : ` +
        `posez-la dans l'environnement de build, pas sur l'appareil.`,
    );
  }
  if (!/^https?:\/\//.test(brut)) {
    throw new Error(`${CLE_BASE_API} doit commencer par http:// ou https:// ; reçu « ${brut} ».`);
  }
  return brut.replace(/\/+$/, '');
}
