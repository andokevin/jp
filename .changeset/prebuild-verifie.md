---
'@jp/mobile': patch
---

**`expo prebuild` passe, et il a signalé deux défauts de configuration.**

Les quatre dépendances natives accumulées — `react-native-svg`, `netinfo`,
`expo-localization`, `expo-secure-store` — génèrent les deux projets natifs
sans erreur. La vérification a aussi confirmé, dans le manifeste Android
généré, que `<data android:scheme="jp"/>` y est : `analyserLien` était testé
depuis S8.1, mais rien ne prouvait que le système lui remettrait les liens.
Maintenant si.

**Deux corrections dans `app.json`.**

- `edgeToEdgeEnabled` est retiré : Android 16 rend le bord-à-bord obligatoire,
  la clé n'a plus d'effet et prebuild la signale.
- `userInterfaceStyle: "light"` n'avait **aucun effet** sans `expo-system-ui`.
  Le module est installé plutôt que la clé retirée, et le choix compte :
  `@jp/ui` n'a aucune palette sombre — `COULEURS.fond` vaut `#FFFFFF`. Sans
  épinglage, un téléphone en mode sombre afficherait un chrome système noir
  contre une application blanche.

**`android/` et `ios/` sont ignorés par git.** Ils sont GÉNÉRÉS depuis
`app.json`, qui en est la source. Les committer figerait la configuration :
`prebuild` ne réécrit pas un dossier existant sans `--clean`, et les greffons
d'`app.json` deviendraient décoratifs — on modifierait la configuration sans
que rien ne change, ce qui est le pire des deux mondes.

**La conséquence pratique** : après toute modification d'`app.json` ou de la
liste des dépendances natives, `pnpm exec expo prebuild --clean` — sans
`--clean`, la modification est ignorée en silence.
