/**
 * Les pièces de formulaire — titre, champ, erreur, bouton
 *
 * Chacune porte une règle du design system, et aucune n'en invente :
 *
 *   · le titre occupe une hauteur FIXE de deux lignes, pour que le malgache
 *     et le français aient le même rythme vertical ;
 *   · l'erreur se dit par une BORDURE, une ICÔNE et un texte — jamais par la
 *     couleur seule *(R-Z1)* ;
 *   · le bouton désactivé devient un contour vide avec un cadenas, pas un
 *     aplat grisé : en plein soleil, un gris et un framboise se ressemblent.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { IconeAlerteCercle, IconeAlerteTriangle, IconeCadenas } from './icones.js';
import { CASE, ESPACE, HAUTEUR_CONTROLE, PALETTE, RAYONS, SERIF } from '../theme.js';

export function Titre({ texte }: { readonly texte: string }) {
  return (
    <View style={styles.boiteTitre}>
      <Text style={styles.titre} accessibilityRole="header">
        {texte}
      </Text>
    </View>
  );
}

export function Soutien({ children }: { readonly children: React.ReactNode }) {
  return <Text style={styles.soutien}>{children}</Text>;
}

export function Aide({ texte }: { readonly texte: string }) {
  return <Text style={styles.aide}>{texte}</Text>;
}

export function ChampTexte({
  label,
  valeur,
  exemple,
  enErreur,
  surSaisie,
  ...reste
}: {
  readonly label: string;
  readonly valeur: string;
  readonly exemple: string;
  readonly enErreur: boolean;
  readonly surSaisie: (valeur: string) => void;
} & Pick<
  TextInputProps,
  'keyboardType' | 'autoCapitalize' | 'autoComplete' | 'textContentType' | 'onSubmitEditing'
>) {
  return (
    <View style={styles.bloc}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.boite, enErreur && styles.boiteFautive]}>
        <TextInput
          {...reste}
          style={styles.saisie}
          value={valeur}
          onChangeText={surSaisie}
          placeholder={exemple}
          placeholderTextColor={PALETTE.texteSecondaire}
          accessibilityLabel={label}
          // Le lecteur d'écran doit dire « incorrect » lui aussi : la bordure
          // rouge et le triangle ne lui parviennent pas.
          accessibilityState={{ disabled: false }}
          aria-invalid={enErreur}
          returnKeyType="go"
        />
        {enErreur ? <IconeAlerteTriangle taille={20} couleur={PALETTE.danger} /> : null}
      </View>
    </View>
  );
}

export function MessageErreur({ texte }: { readonly texte: string }) {
  return (
    <View style={styles.ligneErreur} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <IconeAlerteCercle taille={17} couleur={PALETTE.danger} />
      <Text style={styles.texteErreur}>{texte}</Text>
    </View>
  );
}

/**
 * Le bouton principal — trois apparences pour trois états.
 *
 * `ActivityIndicator` plutôt que l'anneau dessiné de la maquette : c'est le
 * tourniquet du système, il suit les réglages d'accessibilité de l'appareil
 * (animations réduites comprises), qu'une animation maison ignorerait.
 */
export function BoutonPrincipal({
  libelle,
  libelleAttente,
  enCours,
  actif,
  surAppui,
}: {
  readonly libelle: string;
  readonly libelleAttente: string;
  readonly enCours: boolean;
  readonly actif: boolean;
  readonly surAppui: () => void;
}) {
  const eteint = !actif;
  return (
    <Pressable
      onPress={surAppui}
      disabled={eteint}
      accessibilityRole="button"
      accessibilityState={{ disabled: eteint, busy: enCours }}
      style={({ pressed }) => [
        styles.bouton,
        eteint ? styles.boutonEteint : styles.boutonActif,
        pressed && !eteint && styles.boutonPresse,
      ]}
    >
      {eteint ? <IconeCadenas taille={17} couleur={PALETTE.texteSecondaire} /> : null}
      {enCours ? <ActivityIndicator size="small" color={PALETTE.texteInverse} /> : null}
      <Text style={[styles.libelle, eteint ? styles.libelleEteint : styles.libelleActif]}>
        {enCours ? libelleAttente : libelle}
      </Text>
    </Pressable>
  );
}

/** Le renvoi de code : cadenas tant que la minute de débit court *(R-C7)*. */
export function LienRenvoi({
  texte,
  ouvert,
  surAppui,
}: {
  readonly texte: string;
  readonly ouvert: boolean;
  readonly surAppui: () => void;
}) {
  return (
    <Pressable
      onPress={surAppui}
      disabled={!ouvert}
      accessibilityRole="button"
      accessibilityState={{ disabled: !ouvert }}
      style={styles.renvoi}
    >
      {ouvert ? null : <IconeCadenas taille={15} couleur={PALETTE.texteSecondaire} />}
      <Text style={[styles.texteRenvoi, ouvert && styles.texteRenvoiOuvert]}>{texte}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Deux lignes réservées : le malgache est ~30 % plus long que le français,
  // et sans cette hauteur fixe les deux versions n'auraient pas le même
  // rythme vertical — le titre pousserait tout le reste d'une ligne.
  boiteTitre: { height: 88, justifyContent: 'flex-end' },
  titre: {
    fontFamily: SERIF,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '500',
    color: PALETTE.texte,
  },

  soutien: {
    minHeight: 42,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: PALETTE.texteSecondaire,
  },
  aide: { marginTop: 12, fontSize: 12.5, lineHeight: 18, color: PALETTE.texteSecondaire },

  bloc: { marginTop: 22 },
  // `letterSpacing` se compte en points sur React Native, pas en `em` : les
  // .13em de la maquette valent 11 × 0,13 à cette taille.
  label: {
    marginBottom: 9,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 11 * 0.13,
    color: PALETTE.texteSecondaire,
  },
  boite: {
    height: HAUTEUR_CONTROLE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    borderRadius: RAYONS.champ,
    borderWidth: 1.5,
    borderColor: PALETTE.bordure,
    backgroundColor: PALETTE.fond,
  },
  boiteFautive: { borderColor: PALETTE.danger },
  saisie: { flex: 1, fontSize: 16, color: PALETTE.texte, padding: 0 },

  ligneErreur: { flexDirection: 'row', alignItems: 'flex-start', gap: ESPACE.s, marginTop: 12 },
  texteErreur: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
    color: PALETTE.danger,
  },

  bouton: {
    height: HAUTEUR_CONTROLE,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: RAYONS.pilule,
    borderWidth: 1.5,
  },
  boutonActif: { backgroundColor: PALETTE.action, borderColor: PALETTE.action },
  boutonPresse: { opacity: 0.88 },
  // Un CONTOUR vide, pas un aplat grisé : la différence se voit sans couleur.
  boutonEteint: { backgroundColor: PALETTE.fond, borderColor: PALETTE.texteSecondaire },
  libelle: { fontSize: 16, fontWeight: '500' },
  libelleActif: { color: PALETTE.texteInverse },
  libelleEteint: { color: PALETTE.texteSecondaire },

  renvoi: {
    minHeight: CASE.hauteur - ESPACE.s,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  texteRenvoi: { fontSize: 14, fontWeight: '500', color: PALETTE.texteSecondaire },
  // Ouvert, il gagne un SOULIGNEMENT en plus de sa couleur.
  texteRenvoiOuvert: { color: PALETTE.action, textDecorationLine: 'underline' },
});
