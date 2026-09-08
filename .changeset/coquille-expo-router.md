---
'@jp/mobile': minor
'@jp/identite': minor
'@jp/web': patch
---

**Une route mène enfin à l'écran de connexion.**

`apps/mobile` n'avait ni dossier `app/`, ni point d'entrée, ni configuration
Expo utilisable : `app.json` ne contenait qu'une liste de greffons, sans même
la clé `expo`. L'écran natif existait sans que rien ne l'atteigne.

**`app/_layout.tsx` et `app/index.tsx`.** Le cadre porte `SafeAreaProvider` —
un contexte posé deux fois donne deux valeurs, donc il est ici et pas dans les
écrans — et `headerShown: false` : les maquettes ne dessinent aucune barre de
titre, chaque écran porte son propre chrome. Une barre par-dessus mangerait
56 dp de hauteur utile pour répéter le titre.

**`scheme: "jp"`** dans `app.json`. `analyserLien` et `LIENS_PROFONDS` étaient
écrits et testés depuis S8.1, mais aucun schéma n'était déclaré : le système
ne savait à qui remettre un `jp://vendeur/:slug`. Le code marchait, le lien
non.

**`surSession` rend la session ENTIÈRE, plus seulement le jeton.** C'est ce
qui a révélé le défaut : `ouvrirSession` de `noyau/session.ts` réclame
`(jeton, expireLe)`, et l'ancienne signature ne passait pas l'échéance.
L'appelant aurait dû redemander au serveur ce qu'il venait de recevoir, ou
inventer une durée. Personne ne consommait encore ce rappel — des deux côtés —
donc la correction ne casse rien.

**`EXPO_PUBLIC_API_BASE`, sans repli.** `noyau/config.ts` refuse une valeur
absente ou qui n'est pas une URL, plutôt que de replier sur `localhost` : le
repli produirait un APK qui s'installe, s'ouvre, et échoue à la première
requête avec « pas de connexion » — le pire des messages, puisqu'il accuse le
réseau de la personne. La fonction reçoit l'environnement en paramètre, donc
elle est éprouvée. Elle retire aussi la barre oblique finale : `...mg//identite`
renvoie 404 sur certains serveurs et passe en silence sur d'autres.

**`turbo.json` apprend `app/**`.** Les entrées de `build`, `typecheck`, `lint`
et `test` ne listaient que `src/**`. L'arborescence de routes d'expo-router
vivant hors de `src/`, Turborepo aurait rendu un résultat en cache après une
modification de route — un vert qui ne prouve rien. `tsconfig` et le script
`lint` couvrent `app/` pour la même raison.

**Ce que ce changeset n'apporte pas.** Après la connexion, l'écran affiche un
jalon nommé — pas un accueil. La vitrine, le catalogue et le panier sont la
tranche 1 *(F1.x)*. Ce jalon existe parce que l'alternative est pire : sans lui,
`etape: 'termine'` ramène l'écran d'adresse, et une personne qui vient de se
connecter croirait avoir échoué.

`react-native-svg`, `netinfo` et `expo-localization` restent trois dépendances
natives : `expo prebuild` est requis avant le prochain build.
