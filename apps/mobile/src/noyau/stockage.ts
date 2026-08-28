/**
 * Les deux magasins de l'appareil — S8.2 et S8.4
 *
 * **Ce fichier importe React Native. Il n'est donc PAS réexporté par
 * `src/index.ts`**, et aucun test ne le charge : les paquets Expo ne se
 * chargent pas hors d'un appareil. Seule l'application l'importe, pour câbler
 * les fonctions de `session.ts` et `univers.ts` — qui reçoivent leur magasin
 * en paramètre.
 *
 * **Deux magasins, et le choix entre eux n'est pas une préférence :**
 *
 *   `secret`    → le trousseau du système, chiffré par l'appareil. Le jeton de
 *                 session y va, et rien d'autre.
 *   `ordinaire` → rapide, NON chiffré. Cache, univers courant, file d'écritures.
 *
 * Mettre un jeton dans le magasin ordinaire serait le laisser en clair dans un
 * fichier lisible par toute application privilégiée sur un téléphone rooté —
 * et beaucoup de téléphones d'entrée de gamme arrivent déjà rootés.
 */
import * as Trousseau from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifierTailleSecret, type Magasin } from './magasin.js';

/**
 * Le trousseau. Pour le jeton de session, et pour lui seul.
 *
 * Chaque méthode avale ses erreurs : sur un appareil sans verrouillage
 * d'écran, certaines versions d'Android refusent le trousseau. **Mieux vaut
 * redemander un code que faire planter l'application au démarrage.**
 */
export const secret: Magasin = {
  async lire(cle) {
    try {
      return await Trousseau.getItemAsync(cle);
    } catch {
      return null;
    }
  },
  async ecrire(cle, valeur) {
    verifierTailleSecret(valeur);
    try {
      await Trousseau.setItemAsync(cle, valeur);
    } catch {
      // Trousseau indisponible. On ne garde RIEN plutôt que de basculer en
      // clair : la session sera simplement à rouvrir.
    }
  },
  async effacer(cle) {
    try {
      await Trousseau.deleteItemAsync(cle);
    } catch {
      /* rien à faire */
    }
  },
};

/** Le magasin ordinaire. Cache, préférences, file hors ligne. */
export const ordinaire: Magasin = {
  async lire(cle) {
    try {
      return await AsyncStorage.getItem(cle);
    } catch {
      return null;
    }
  },
  async ecrire(cle, valeur) {
    try {
      await AsyncStorage.setItem(cle, valeur);
    } catch {
      // Disque plein. On perd du cache, pas des données : elles sont au
      // serveur. Faire échouer l'action métier serait disproportionné.
    }
  },
  async effacer(cle) {
    try {
      await AsyncStorage.removeItem(cle);
    } catch {
      /* rien à faire */
    }
  },
};
