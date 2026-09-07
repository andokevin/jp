---
'@jp/mobile': minor
'@jp/identite': minor
'@jp/web': patch
---

**L'écran natif de `JP Auth Flow.dc.html`, et le hook qui cesse d'être web.**

`apps/mobile/src/features/identite/` n'était qu'un `export const DOMAINE`.
Il porte désormais les trois écrans de la maquette native — adresse, code à six
chiffres, prénom — avec les cinq états qu'elle dessine.

**Les deux maquettes ne sont pas la même.** `JP Auth Flow` dessine pour un
pouce, `JP Auth Web` pour un curseur. Ce qui change est consigné dans le
tableau en tête de `apps/mobile/.../theme.ts` : contrôles à 56 au lieu de 52,
cases à 48 × 56 au lieu de 56 × 56, rayon de champ à 16. Deux écarts touchent
la STRUCTURE et pas seulement les nombres — **le bouton est collé en bas**, sous
le pouce, et **il n'y a pas de bascule de langue** : l'appareil en porte déjà
une, deux sélecteurs donneraient deux réponses à la même question.

**Le hook et le client HTTP rejoignent `@jp/identite`.** `react` n'est pas un
moteur de rendu — `react-dom` et `react-native` le sont — donc `useReducer` se
comporte à l'identique des deux côtés. La règle ESLint ajoutée hier bannissait
`react` avec eux : elle est corrigée pour ne viser que les deux moteurs, et
`check-architecture.mjs` vérifie désormais les deux sens (un moteur est refusé,
`react` passe). Le paquet déclare `react` en **peerDependencies** : en
dépendance ordinaire, pnpm en installerait une seconde copie et tous les hooks
lèveraient « Invalid hook call ».

Résultat : les deux adaptateurs d'application font quinze lignes chacun. Ils ne
diffèrent que par l'écoute du réseau — `online`/`offline` côté web, rien côté
natif pour l'instant *(voir la limite ci-dessous)*.

**Le wordmark s'affichait en framboise.** `theme.ts` posait
`IDENTITE = COULEURS.action` là où il fallait `COULEURS.identite` : le violet
de la marque était rendu framboise, et `--jp-identite` n'était qu'un alias de
`--jp-action`. C'est-à-dire que `D-22` était effacé à l'endroit exact où
l'en-tête du fichier le défend. Le test ne l'a pas vu parce qu'il n'assertait
que `contraste(ACTION, IDENTITE) < 1.5` — une assertion que deux jetons
identiques satisfont mieux que deux couleurs distinctes. Il exige maintenant
d'abord qu'elles soient différentes.

**Ce qu'il faut savoir avant d'y toucher.**

- `react-native-svg@15.15.4` est ajouté — la version qu'Expo 57 épingle. Cinq
  des icônes de la maquette portent des arcs ; les simuler avec des `View`
  bordées que l'on fait pivoter tient jusqu'à la première retouche. **C'est une
  dépendance native** : elle demande un `prebuild` avant le prochain build.
- **Pas de détection réseau proactive sur le natif.** Le web écoute
  `online`/`offline`, gratuits dans un navigateur ; l'équivalent React Native
  est `@react-native-community/netinfo`, non installé. Sans lui, la coupure se
  découvre au premier appel qui échoue — le bandeau paraît, la saisie est
  conservée, le comportement est le bon. Ce qu'on perd est le bouton désactivé
  AVANT la tentative. Le point d'accroche existe : `abonnerReseau`.
- **La langue est un paramètre**, pas encore une lecture de l'appareil :
  `expo-localization` n'est pas installé, `langueInitiale` est passée par
  l'appelant et retombe sur le malgache, comme le web.
- Les libellés malgaches restent **à faire relire par un locuteur** — la
  réserve posée par le changeset `malgache-et-identite-web` vaut toujours.
