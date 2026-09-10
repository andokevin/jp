# @jp/mobile

## 1.0.0

### Major Changes

- 5b8c4c6: **Sprint « code en anglais », étape 1b-①  — rupture v2 du contrat API.**
  
  Les CLÉS JSON du contrat d'authentification passent en anglais. C'est une
  rupture, pas une v2 parallèle : aucun client externe n'existe encore
  (pré-production, PR #1479 en cours).
  
  **Clés renommées**, dans les schémas Zod et partout où elles voyagent :
  
  | Ancien (v1) | Nouveau (v2) |
  |---|---|
  | `finalite: 'inscription'\|'connexion'` | `purpose: 'signup'\|'login'` |
  | `prenom` | `firstName` |
  | `nom` | `lastName` |
  | `genre` | `gender` |
  | `langue` | `language` |
  | `dateNaissance` | `birthDate` |
  | `telephone` | `phone` |
  | `motDePasse` | `password` |
  | `preferencesVetement` | `clothingPreferences` |
  | `jeton` | `token` |
  | `expireLe` | `expiresAt` |
  | `utilisateur` | `user` |
  | `expireDansS` | `expiresInS` |
  
  **En-tête HTTP** : `X-Economie-Donnees` → `X-Data-Saver`.
  
  **Ce qui reste français** — délibérément, jusqu'aux migrations Prisma :
  
  - Les VALEURS d'enum stockées en base (`genre: 'femme'|'homme'|'autre'`) — le
    contrat parle `gender: 'femme'|'homme'|'autre'`. Les valeurs traduites
    (`female`/`male`/`other`) exigent une migration `ALTER TYPE` sur l'enum
    `Genre`. À faire à l'étape 2.
  - Les CLÉS et COLONNES Prisma (`utilisateur`, `session.expireLe`,
    `codeOtp.consommeLe`, `motDePasseEmpreinte`, `jetonEmpreinte`, etc.). Le
    repository fait maintenant le MAPPING v2↔Prisma explicitement dans
    `apps/api/src/modules/identite/repository.ts`.
  - Le catalogue `@jp/i18n` et son token `{restantes}` — étape 3.
  
  **Nettoyage journal** : `phone` s'ajoute à `motDePasse`/`password`/`jeton`/
  `token`/`telephone` dans la liste des clés à retirer d'un journal
  (`apps/api/src/observabilite/index.ts`). Sans ça, un numéro de téléphone
  transmis par le nouveau contrat aurait fuité en clair.
  
  **381 tests toujours au vert.**

### Minor Changes

- 062f44b: **Les deux lectures d'appareil que l'écran natif attendait.**
  
  Le changeset précédent livrait l'écran avec deux manques nommés : pas de
  détection réseau proactive, et la langue passée en paramètre plutôt que lue.
  Les deux sont comblés.
  
  **Le réseau — `@react-native-community/netinfo@12.0.1`** *(version épinglée par
  Expo 57)*. Le bouton se désactive maintenant AVANT la tentative, et le bandeau
  paraît à l'ouverture d'une application lancée alors que le réseau est déjà
  tombé — cas que le web doit rattraper à la main avec `navigator.onLine`, parce
  qu'aucun événement `offline` ne viendra jamais l'annoncer.
  
  La règle d'interprétation est sortie du module natif dans `noyau/reseau.ts`,
  et c'est le point qui compte : **le doute n'est pas une coupure**.
  `isInternetReachable` vaut `null` pendant que NetInfo vérifie — au lancement, et
  à chaque changement de réseau. Le lire comme un « non » ferait clignoter « pas
  de connexion » sur un téléphone parfaitement connecté et désactiverait le bouton
  sous le doigt de quelqu'un qui vient de le viser. D'où `!== false` : on
  n'exige pas la preuve que ça marche, on exige la preuve que ça ne marche pas.
  `isConnected` est lu strictement, lui — il répond sur l'interface, pas sur
  Internet.
  
  Sortie du natif, la règle est vérifiable : `vitest` ne sait pas charger NetInfo,
  et une décision enfermée dedans n'aurait jamais été mise à l'épreuve.
  
  **La langue — `expo-localization@~57.0.1`.** L'écran lit les locales de
  l'appareil dans leur ordre de préférence. `langueInitiale` reste, pour forcer
  en test ou depuis un futur réglage.
  
  **Aucun analyseur n'a été écrit.** Une liste de locales ordonnée a exactement la
  forme d'un `Accept-Language` — « la première que tu connais gagne » — et
  `langueDepuisEnTete` de `@jp/i18n` sait déjà le faire. `noyau/langue.ts` joint
  les étiquettes par des virgules et lui passe la main. Un second analyseur, ce
  serait deux réponses possibles à « quelle langue ? » : une côté serveur, une
  côté appareil.
  
  **Un changement de comportement à connaître.** L'écran affichait le malgache par
  défaut ; il affiche désormais la langue de l'appareil, donc **le français pour
  la plupart des téléphones à Madagascar**. C'est voulu : le malgache est la
  langue d'AUTORITÉ de la maquette — celle sur laquelle les boîtes sont
  dimensionnées — pas un défaut imposé à quelqu'un qui a choisi autre chose. Une
  personne dont l'appareil est en anglais lit le français, comme le prévoit
  `libelles.ts`.
  
  **Deux dépendances natives de plus** : `prebuild` requis avant le prochain
  build, au même titre que `react-native-svg`.
- aeb0241: **« Votre session a expiré » se dit enfin.**
  
  `session.ts` distinguait « aucune » de « périmée » depuis S8.2 en expliquant que
  les deux ne se racontent pas pareil — mais rien ne les racontait. L'écran
  s'ouvrait à l'identique dans les deux cas.
  
  **L'avis prend la place de la ligne de soutien**, il ne s'y ajoute pas. Elle est
  sous le titre, sa boîte réserve déjà deux lignes, donc l'échange ne décale rien
  et n'ajoute aucun élément à une maquette qui n'en prévoyait pas. Les deux
  messages ne sont jamais utiles ensemble : « nous vous enverrons un code » dit ce
  qui va se passer, « votre session a expiré » dit pourquoi vous êtes là — et
  sous-entend la même suite.
  
  **`departDepuis` rend un motif, plus un drapeau `nettoyer`.** Le motif porte
  maintenant deux conséquences — effacer le jeton mort, et le dire à l'écran — et
  deux champs séparés auraient dû rester d'accord pour toujours en décrivant le
  même fait. Un seul motif, deux comportements qui en dérivent.
  
  **Le motif est une union fermée, pas une chaîne libre.** L'écran rend des motifs
  qu'il CONNAÎT, donc dans la langue courante. Un texte passé par l'appelant
  arriverait dans la langue de l'appelant — c'est-à-dire en français, quoi
  qu'affiche le reste de l'écran.
  
  **La chaîne malgache n'est pas certifiée**, au même titre que les vingt-et-une
  autres : « Lany daty ny fidiranao. Ampidiro indray ny mailakao. » Elle est
  marquée comme telle dans `libelles.ts` et ajoutée à la fiche de relecture, pour
  que le même locuteur la traite dans la même passe. Le français y est plus long
  que le malgache (× 1,08), ce qui la range parmi les huit phrases qui contredisent
  la prémisse de la maquette.
- 51bc945: **Une route mène enfin à l'écran de connexion.**
  
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
- 945781f: **L'écran natif de `JP Auth Flow.dc.html`, et le hook qui cesse d'être web.**
  
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
- a155cc7: **F0.1 — idempotency on identite OTP routes, request cache and data-saver mode wired end-to-end from mobile storage down to the X-Data-Saver header.**
  
  Backend (`@jp/api`)
  - Both `POST /identite/otp/emettre` and `POST /identite/otp/verifier` are now wrapped in `executerUneSeuleFois`. An `Idempotency-Key` header is required (400 otherwise, 422 on same-key/different-body). A legitimate transport replay returns the recorded response without re-executing, and without consuming the rate-limit quota — the limiter runs INSIDE the idempotency callback.
  - New integration test file `identite-routes.test.ts` (12 tests) covers the wiring through `fastify.inject()`. New service test file `identite-service.test.ts` (16 tests) covers the business logic against a real Postgres. Shared fixtures in `apps/api/test/fixtures.ts`.
  
  Shared package (`@jp/identite`)
  - New `RequestCache` class + `sharedRequestCache` singleton — a 60-s in-memory cache on `requestCode` responses. A repeated request for the same email within the window skips the round-trip. The cached `expiresInS` is rebuilt at read time from a stored absolute deadline, so the UI countdown reflects the OTP's real remaining lifetime, not a snapshot. Injectable clock for tests. Exported so applications can `.clear()` on logout.
  - New `IdentityClient.dataSaver` option that conditionally sends `X-Data-Saver: 1`. Absent header is the opt-out — the HTTP opt-in convention reads header presence as the signal, so sending `'0'` would be a lie.
  - New `FlowOptions.autoVerifyOnComplete` option (default `true`) : set to `false` to disable the auto-verify at the sixth digit. Read via strict `=== false` so undefined keeps the historical behaviour.
  - Extracted `shouldAutoVerify(state)` — pure predicate in `flow.ts`, testable without React. The hook composes over it plus the anti-replay guard and the opt-out.
  
  Mobile (`@jp/mobile`)
  - Native `useAuthOtp` adapter now accepts a `MagasinLecture`, reads `jp.preference.economie` at mount (with cancel-guard on the async read), and propagates the value to both `IdentityClient.dataSaver` and `FlowOptions.autoVerifyOnComplete`.
  - `EcranConnexion` passes `ordinaire` (AsyncStorage) — not the trousseau, a preference is not a secret.
  
  All new options are optional with defaults preserving prior behaviour ; no code change is required for consumers who do not opt in.
- 4375dd9: **On ne redemande plus un code à quelqu'un qui a déjà une session.**
  
  La route lit le trousseau au montage. Une session valide mène directement à la
  suite ; une session absente mène au parcours d'authentification. C'était la
  dernière pièce manquante entre `etatSession` — écrit et testé depuis S8.2 — et
  une application qui s'en sert.
  
  **Un jeton mort ne reste plus dans le trousseau.** Une session périmée et une
  session absente mènent au même écran, mais pas au même ménage :
  `etatSession` refuse le jeton périmé à chaque démarrage, donc plus rien ne le
  relit — et il resterait là pour la vie de l'appareil, revente d'occasion sur un
  marché comprise. `departDepuis` porte cette obligation dans le TYPE plutôt que
  dans un commentaire : on ne peut pas lire `quoi` sans voir `nettoyer` à côté.
  Quatre tests la tiennent, dont un bout à bout qui vérifie que le trousseau est
  bien vide après.
  
  **Un quatrième état pour le démarrage : « on lit ».** Il ne porte aucun
  tourniquet — la lecture dure quelques millisecondes, une animation n'aurait pas
  le temps de faire un tour et ne produirait qu'un clignotement. Elle affiche le
  wordmark, rien d'autre. Montrer l'écran d'adresse pour le retirer un instant
  plus tard à quelqu'un qui a déjà une session est exactement le défaut que ce
  changeset supprime.
  
  **Ce qui n'est PAS fait, et pourquoi.** `session.ts` distingue « aucune » de
  « périmée » parce que les deux ne se racontent pas pareil — « connectez-vous »
  contre « votre session a expiré ». **L'écran ne fait pas cette distinction.**
  La maquette `JP Auth Flow` ne dessine aucun emplacement pour un tel avis, et en
  inventer un serait décider seul d'un écran. La différence est conservée dans le
  type, prête à être affichée le jour où la maquette dira où — c'est une question
  de conception, pas de code.

### Patch Changes

- 54238e3: **Sprint « code en anglais », étape 1b-③ — clés du catalogue i18n.**
  
  Les 26 clés du catalogue de messages passent en anglais, ainsi que les tokens
  d'interpolation.
  
  **Clés renommées** :
  
  | Ancien | Nouveau |
  |---|---|
  | `erreur.requete_invalide` | `error.invalid_request` |
  | `erreur.non_authentifie` | `error.unauthenticated` |
  | `erreur.non_autorise` | `error.unauthorized` |
  | `erreur.introuvable` | `error.not_found` |
  | `erreur.conflit` | `error.conflict` |
  | `erreur.debit_depasse` | `error.rate_limited` |
  | `erreur.hors_ligne` | `error.offline` |
  | `erreur.indisponible` | `error.unavailable` |
  | `erreur.cle_idempotence_manquante` | `error.idempotency_key_missing` |
  | `erreur.cle_idempotence_reutilisee` | `error.idempotency_key_reused` |
  | `erreur.otp_invalide` | `error.otp_invalid` |
  | `erreur.otp_expire` | `error.otp_expired` |
  | `erreur.otp_tentatives_depassees` | `error.otp_attempts_exhausted` |
  | `erreur.otp_debit_depasse` | `error.otp_rate_limited` |
  | `erreur.email_deja_utilise` | `error.email_already_used` |
  | `erreur.identifiants_incorrects` | `error.invalid_credentials` |
  | `erreur.token_externe_invalide` | `error.invalid_external_token` |
  | `erreur.email_non_verifie` | `error.email_unverified` |
  | `otp.envoye` | `otp.sent` |
  | `otp.expire` | `otp.expired` |
  | `otp.invalide` | `otp.invalid` |
  | `otp.epuise` | `otp.exhausted` |
  | `etat.chargement` | `state.loading` |
  | `etat.vide` | `state.empty` |
  | `etat.erreur` | `state.error` |
  | `etat.hors_ligne` | `state.offline` |
  
  **Tokens d'interpolation** :
  - `{duree}` → `{duration}`
  - `{restantes}` → `{remaining}`
  - `{email}` reste (déjà anglais)
  
  Le paramètre `duree` de `debitDepasse()` et `OTP_DEBIT_DEPASSE()` devient
  `duration`. La variable `restantes` passée à `OTP_INVALIDE()` devient
  `remaining`. Le catalogue et ses appelants sont désormais alignés :
  `error.otp_invalid` avec `{remaining}` des deux côtés.
  
  **381 tests toujours au vert.**
  
  ---
  
  **L'étape 1b est ainsi terminée à 2/3.** L'étape 1b-② (migrations Prisma —
  159 `@@map`, 60 enums, colonnes historiques) reste à faire, dans une PR
  indépendante — elle touche à des tables présentes sur master et exige des
  migrations SQL coordonnées (voir mon message de synthèse).
- 60c366d: **Deux défauts que le typage ne pouvait pas voir.**
  
  `OTP_INVALIDE` passait `variables: { essais }` à un gabarit qui réclame
  `{restantes}`. `traduire` ne substitue que par nom et laisse le jeton visible
  sinon — délibérément, pour qu'un trou se remarque en recette. Encore
  faut-il que quelqu'un regarde : l'écran affichait « Ce code est incorrect.
  {restantes} essais restants. », et le nombre qui dit s'il reste une chance ou
  quatre n'arrivait jamais. Le serveur traduisant lui-même ses messages, aucun
  client ne pouvait rattraper le coup.
  
  Rien ne mesurait cet écart. Les tests d'i18n comparent les catalogues **entre
  eux** — et les trois langues étaient parfaitement d'accord sur `{restantes}`.
  Le désaccord était entre le catalogue et son appelant, et `variables` étant un
  `Record<string, …>`, TypeScript acceptait n'importe quelle clé.
  `apps/api/test/identite-erreurs.test.ts` ferme la classe entière : il construit
  les dix-sept erreurs du dépôt, les met en forme dans les trois langues, et
  refuse qu'un seul jeton `{nom}` survive. Une erreur ajoutée demain avec un nom
  approximatif y tombera sans que personne ait à y penser.
  
  **Le client API mobile lie enfin `fetch`.** Rangé dans un champ puis appelé en
  `this.f(…)`, `fetch` reçoit l'instance comme `this`, ce qu'un navigateur
  refuse — « Illegal invocation ». Hermes ne s'en émeut pas, son `fetch` étant un
  polyfill JS ordinaire ; Expo Web, si. Et comme l'échec est un `TypeError`, le
  `catch` du client le prenait pour une coupure : « pas de connexion » affiché à
  quelqu'un de parfaitement connecté, sur chaque requête. Le défaut est le même
  que celui corrigé côté web ; les deux fichiers sont jumeaux, seul l'un des deux
  avait été soigné.
  
  Le chemin `?? globalThis.fetch` n'était couvert par aucun test — tous injectent
  un faux `fetch`. Il l'est désormais, par un double qui refuse le mauvais `this`
  comme le ferait un navigateur.
- e345d0e: **`expo prebuild` passe, et il a signalé deux défauts de configuration.**
  
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
- 5b0ccf3: **Sprint « code en anglais », étape 1a — fin : `@jp/identite`.**
  
  Le paquet passe tous ses identifiants TypeScript en anglais, y compris les
  **discriminants d'union** de son réducteur (`'saisirEmail'` → `'setEmail'`,
  etc.) et les **valeurs de l'énum `Step`** (`'prenom'` → `'firstName'`,
  `'termine'` → `'done'`), qui ne sont pas exposés hors du paquet.
  
  **Les valeurs restent françaises** partout où le contrat le veut :
  - clé JSON `langue` dans le corps de `verifyCode` (transport HTTP),
  - `SessionResponse.utilisateur.prenom` (clé JSON du serveur),
  - token `{restantes}` dans les catalogues `@jp/i18n` (partagé serveur/client).
  
  Le token `{temps}` de `screen2Validity` **est traduit en `{time}`** — il est
  purement local au paquet et n'apparaît qu'ici.
  
  **Fichiers renommés** : `parcours.ts` → `flow.ts`, `code-otp.ts` →
  `otp-boxes.ts`, `libelles.ts` → `labels.ts`, `identite.test.ts` →
  `flow.test.ts`, `libelles.test.ts` → `labels.test.ts`.
  
  **Table de renommage** (extrait) :
  
  | Ancien | Nouveau |
  |---|---|
  | `EtatParcours` / `Etape` / `Panne` | `FlowState` / `Step` / `Failure` |
  | `reduire` / `etatInitial` | `reduce` / `initialState` |
  | `peutEnvoyer` / `peutRenvoyer` | `canSubmit` / `canResend` |
  | `emailPlausible` | `plausibleEmail` |
  | `DELAI_RENVOI_S` | `RESEND_DELAY_S` |
  | `NB_CHIFFRES` / `Cases` | `DIGIT_COUNT` / `Boxes` |
  | `casesVides` / `chiffresDe` / `poser` / `effacer` | `emptyBoxes` / `digitsOf` / `setBox` / `clearBox` |
  | `caseSuivante` / `codeAssemble` / `estComplet` | `nextBox` / `assembledCode` / `isComplete` |
  | `LIBELLES` / `Libelles` / `LangueEcran` / `langueEcran` | `LABELS` / `Labels` / `ScreenLanguage` / `screenLanguage` |
  | `LANGUES_ECRAN` / `avecTemps` | `SCREEN_LANGUAGES` / `withTime` |
  | `ClientIdentite` / `HorsLigne` / `demanderCode` / `verifierCode` | `IdentityClient` / `Offline` / `requestCode` / `verifyCode` |
  | `AbonnementReseau` / `OptionsParcours` / `Parcours` | `NetworkSubscription` / `FlowOptions` / `Flow` |
  | `panneDepuis` / `surSession` / `abonnerReseau` | `failureFrom` / `onSession` / `subscribeNetwork` |
  | `surCoupure` / `surRetour` | `onOffline` / `onOnline` |
  
  **Champs de `FlowState`** : `etape`/`cases`/`prenom`/`enCours`/`horsLigne`/
  `panne`/`expireLe`/`renvoiPossibleLe` → `step`/`boxes`/`firstName`/`pending`/
  `offline`/`failure`/`expiresAt`/`resendAllowedAt`.
  
  **Champs de `Labels`** : `marqueSuite`/`ecran1Titre`/`ecran1Soutien`/… →
  `brandTail`/`screen1Title`/`screen1Support`/… (18 champs traduits).
  
  **Discriminants d'action** (11) : `saisirEmail`/`saisirPrenom`/`poserCode`/
  `effacerCase`/`envoiCommence`/`codeDemande`/`sessionOuverte`/`echec`/`coupure`/
  `reseauRevenu`/`changerEmail` → `setEmail`/`setFirstName`/`setCodeBox`/
  `clearCodeBox`/`submitStarted`/`codeRequested`/`sessionOpened`/`failed`/
  `wentOffline`/`cameOnline`/`changeEmail`.
  
  **7 fichiers consommateurs** dans `apps/web` et `apps/mobile` mis à jour —
  écrans (`LoginScreen`, `EcranConnexion`), adaptateurs (`useAuthOtp` × 2),
  composants (`chrome`, `OtpInputForm`, `CasesCode`), le point d'entrée mobile
  (`app/index.tsx`) et le point de montage web (`main.tsx`).
  
  **381 tests toujours au vert**, format et lint ✓, 9 contrôles d'architecture ✓.
  
  **Étape 1a complète.** Le TypeScript privé du dépôt entier est désormais en
  anglais. Reste 1b (les valeurs d'API et d'énum stockées en base), qui exige
  une v2 d'API et une série de migrations Postgres — un chantier à part.
- Updated dependencies [5b8c4c6]
- Updated dependencies [aeb0241]
- Updated dependencies [51bc945]
- Updated dependencies [945781f]
- Updated dependencies [a155cc7]
- Updated dependencies [8872277]
- Updated dependencies [54238e3]
- Updated dependencies [a1886f6]
- Updated dependencies [b735a88]
- Updated dependencies [d4d5a3b]
- Updated dependencies [5e32c09]
- Updated dependencies [46ba866]
- Updated dependencies [4da725c]
- Updated dependencies [7251850]
- Updated dependencies [5b0ccf3]
  - @jp/contracts@1.0.0
  - @jp/identite@1.0.0
  - @jp/i18n@1.0.0
  - @jp/money@1.0.0
  - @jp/ui@1.0.0

## 0.0.1

### Patch Changes

- @jp/contracts@0.0.1
  - @jp/i18n@0.0.1
  - @jp/money@0.0.1
  - @jp/ui@0.0.1
