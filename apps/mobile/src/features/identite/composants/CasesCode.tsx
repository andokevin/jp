/**
 * Les six cases du code — la version native
 *
 * **La logique n'est pas réécrite** : `chiffresDe`, `caseSuivante` et
 * `NB_CHIFFRES` viennent de `@jp/identite`, les mêmes que le web. Ce fichier
 * n'ajoute que ce qu'un `TextInput` impose — les références pour déplacer le
 * curseur, et le retour arrière sur une case déjà vide.
 *
 * L'affordance change de nature, pas de code. Sur un ordinateur, le code se
 * COLLE depuis la boîte mail ; sur un téléphone, il arrive par SMS et le
 * système le propose au-dessus du clavier. Les deux livrent six caractères
 * d'un coup dans une seule case — et `poser` les répartit déjà. C'est
 * précisément ce que le partage fait gagner : l'autoremplissage marche ici
 * sans qu'on ait écrit une ligne pour lui.
 */
import { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { caseSuivante, chiffresDe, NB_CHIFFRES, type Cases } from '@jp/identite';
import { CASE, PALETTE, RAYONS } from '../theme.js';

export function CasesCode({
  cases,
  label,
  enErreur,
  surPose,
  surEffacement,
}: {
  readonly cases: Cases;
  readonly label: string;
  readonly enErreur: boolean;
  readonly surPose: (index: number, texte: string) => void;
  readonly surEffacement: (index: number) => void;
}) {
  const refs = useRef<(TextInput | null)[]>([]);

  const poser = (index: number, texte: string) => {
    const chiffres = chiffresDe(texte);
    if (chiffres.length === 0) return;
    surPose(index, chiffres);
    refs.current[caseSuivante(index, chiffres)]?.focus();
  };

  const retourArriere = (index: number) => {
    // Sur une case DÉJÀ vide, le retour arrière recule d'une case et efface
    // celle-là. Sans ça, on reste bloqué sur une case vide à marteler la
    // touche sans que rien ne bouge.
    if (cases[index]) surEffacement(index);
    else if (index > 0) {
      surEffacement(index - 1);
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.bloc}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rangee}>
        {cases.map((chiffre, index) => (
          <TextInput
            // L'index comme clé : ici c'est le bon choix, pas un raccourci.
            // Les six cases sont des POSITIONS fixes, jamais réordonnées ni
            // filtrées — la case 3 reste la case 3. Une clé dérivée du chiffre
            // saisi, elle, changerait à chaque frappe et remonterait le champ.
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            style={[styles.case, enErreur && styles.caseFautive]}
            value={chiffre}
            onChangeText={(texte) => poser(index, texte)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') retourArriere(index);
            }}
            keyboardType="number-pad"
            // Les deux autoremplissages du code à usage unique : `sms-otp` sur
            // Android, `oneTimeCode` sur iOS. Posés sur la PREMIÈRE case
            // seulement — le système y verse les six chiffres, que `poser`
            // répartit ensuite.
            {...(index === 0
              ? ({ autoComplete: 'sms-otp', textContentType: 'oneTimeCode' } as const)
              : {})}
            // `maxLength` suit le contrat, il n'est pas écrit ici : la
            // première case doit pouvoir recevoir les six chiffres d'un coup.
            maxLength={index === 0 ? NB_CHIFFRES : 1}
            accessibilityLabel={`${label} — ${index + 1} / ${NB_CHIFFRES}`}
            selectTextOnFocus
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { marginTop: 22 },
  label: {
    marginBottom: 9,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 11 * 0.13,
    color: PALETTE.texteSecondaire,
  },
  rangee: { flexDirection: 'row', gap: CASE.ecart },
  case: {
    width: CASE.largeur,
    height: CASE.hauteur,
    textAlign: 'center',
    borderRadius: RAYONS.case,
    borderWidth: 1.5,
    borderColor: PALETTE.bordure,
    backgroundColor: PALETTE.fond,
    color: PALETTE.texte,
    fontSize: 22,
    fontWeight: '500',
    padding: 0,
  },
  caseFautive: { borderColor: PALETTE.danger },
});
