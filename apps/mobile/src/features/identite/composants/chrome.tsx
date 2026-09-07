/**
 * L'ossature de l'écran — bandeau hors ligne, wordmark, zone de contenu
 *
 * **Le bandeau est au-dessus de tout, y compris du wordmark.** Ce n'est pas
 * une question de goût : hors ligne prime sur erreur *(les quatre états de
 * `@jp/ui`)*, et une information qui prime se lit en premier. Rangé plus bas,
 * il serait découvert après le message d'erreur qu'il est censé remplacer.
 *
 * Le contenu est un `flex: 1` avec un ressort avant le bouton : c'est ce qui
 * colle l'action en bas de l'écran, sous le pouce, quelle que soit la
 * longueur du texte au-dessus. Le malgache est ~30 % plus long que le
 * français — sans ce ressort, le bouton sauterait à chaque bascule de langue.
 */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconeSansReseau } from './icones.js';
import { ESPACE, PALETTE, SERIF } from '../theme.js';

export function PageAuth({
  horsLigne,
  texteHorsLigne,
  children,
}: {
  readonly horsLigne: boolean;
  readonly texteHorsLigne: string;
  readonly children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      {horsLigne ? (
        /*
         * `accessibilityLiveRegion` : le lecteur d'écran annonce l'apparition
         * du bandeau sans qu'on lui vole le focus. Sans cet attribut, une
         * personne aveugle continuerait de remplir un formulaire dont le
         * bouton vient d'être désactivé sous ses doigts.
         */
        <View style={styles.bandeau} accessibilityLiveRegion="polite" accessibilityRole="alert">
          <IconeSansReseau taille={16} couleur={PALETTE.texte} />
          <Text style={styles.bandeauTexte}>{texteHorsLigne}</Text>
        </View>
      ) : null}

      <View style={styles.contenu}>
        <View style={styles.ligneMarque}>
          <Text style={styles.marque}>
            JP<Text style={styles.marqueSuite}> — Je prends</Text>
          </Text>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}

/** Le ressort qui pousse le bouton en bas. Nommé, pour qu'on sache pourquoi. */
export function Ressort() {
  return <View style={styles.ressort} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: PALETTE.fond },
  bandeau: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACE.s,
    height: 38,
    backgroundColor: PALETTE.fondBandeau,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: PALETTE.bordure,
  },
  bandeauTexte: { fontSize: 13.5, fontWeight: '500', color: PALETTE.texte },
  contenu: { flex: 1, paddingHorizontal: ESPACE.m },
  ligneMarque: { height: 52, alignItems: 'center', justifyContent: 'center' },
  marque: { fontFamily: SERIF, fontSize: 17, fontWeight: '600', color: PALETTE.identite },
  marqueSuite: { fontWeight: '400' },
  ressort: { flex: 1, minHeight: ESPACE.m },
});
