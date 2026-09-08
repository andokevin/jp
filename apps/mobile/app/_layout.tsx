/**
 * La racine de l'application — S8.1
 *
 * `expo-router` construit la navigation depuis l'arborescence de ce dossier :
 * `app/index.tsx` est la route « / ». Ce fichier est le cadre commun à toutes
 * les routes, et il ne porte que ce qui vaut pour toutes.
 *
 * **Aucun en-tête de navigation.** Les maquettes n'en dessinent pas : chaque
 * écran porte son propre chrome — le wordmark, le bandeau hors ligne. Une
 * barre de titre par-dessus mangerait 56 dp de hauteur utile pour répéter
 * ce que le titre de l'écran dit déjà.
 *
 * `SafeAreaProvider` est ici et pas dans les écrans : c'est un contexte, et
 * un contexte posé deux fois donne deux valeurs. Les écrans consomment
 * `SafeAreaView`, ils ne le fournissent pas.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Racine() {
  return (
    <SafeAreaProvider>
      {/* Fond clair partout : les icônes système doivent être sombres. */}
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
