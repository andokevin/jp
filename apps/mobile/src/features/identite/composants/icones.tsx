/**
 * Les cinq icônes du parcours — F0.1
 *
 * **Elles ne sont pas décoratives.** La règle `R-Z1` interdit qu'un état soit
 * porté par la couleur seule : le rouge de l'erreur et le gris du bouton
 * désactivé sont indiscernables en plein soleil sur un écran d'entrée de
 * gamme, et pour une bonne part des daltonismes. Chacune de ces icônes est
 * donc la SECONDE marque d'un état — le cadenas dit « fermé », le triangle
 * dit « faute », sans qu'on ait à distinguer une teinte.
 *
 * Les tracés viennent tels quels de `JP Auth Flow.dc.html` : même boîte
 * 24 × 24, même épaisseur 2,75, mêmes extrémités arrondies. Les redessiner
 * « à peu près » ferait diverger deux dessins censés être un seul.
 *
 * Rendues par `react-native-svg` plutôt que composées de `View` : trois des
 * cinq portent des arcs, et un arc simulé par un carré bordé que l'on fait
 * pivoter est le genre d'astuce qui survit mal à la première retouche.
 */
import { Circle, Path, Rect, Svg } from 'react-native-svg';

/** Les traits communs : c'est ce qui fait que les cinq se ressemblent. */
const TRAIT = { strokeWidth: 2.75, strokeLinecap: 'round', fill: 'none' } as const;

interface ProprietesIcone {
  readonly taille: number;
  readonly couleur: string;
}

export function IconeSansReseau({ taille, couleur }: ProprietesIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path
        {...TRAIT}
        stroke={couleur}
        d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4-2.6M1.4 9.4a15 15 0 0 1 5-3.3M22.6 9.4a15 15 0 0 0-9.3-3.2M12 20h.01"
      />
    </Svg>
  );
}

/** Le triangle qui se pose DANS le champ fautif — il désigne la saisie. */
export function IconeAlerteTriangle({ taille, couleur }: ProprietesIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path
        {...TRAIT}
        stroke={couleur}
        d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
      />
      <Path {...TRAIT} stroke={couleur} d="M12 9v4M12 17h.01" />
    </Svg>
  );
}

/** Le cercle qui précède le MESSAGE d'erreur — il désigne la phrase. */
export function IconeAlerteCercle({ taille, couleur }: ProprietesIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Circle {...TRAIT} stroke={couleur} cx={12} cy={12} r={9.5} />
      <Path {...TRAIT} stroke={couleur} d="M12 7.5v5M12 16.2h.01" />
    </Svg>
  );
}

export function IconeHorloge({ taille, couleur }: ProprietesIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Circle {...TRAIT} stroke={couleur} cx={12} cy={12} r={9.5} />
      <Path {...TRAIT} stroke={couleur} d="M12 7.5V12l3 2" />
    </Svg>
  );
}

/**
 * Le cadenas — la marque non colorée de « pas encore ouvert ».
 *
 * Il paraît deux fois : sur le bouton principal tant que la saisie est
 * incomplète, et sur le renvoi de code tant que la minute de débit n'est pas
 * écoulée *(R-C7)*. Deux verrous de nature différente, une même promesse :
 * ce n'est pas cassé, c'est fermé, et ça s'ouvrira.
 */
export function IconeCadenas({ taille, couleur }: ProprietesIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Rect {...TRAIT} stroke={couleur} x={4} y={10.5} width={16} height={10} rx={2.5} />
      <Path {...TRAIT} stroke={couleur} d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </Svg>
  );
}
