# @jp/identite

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

### Minor Changes

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
- b735a88: **Le parcours d'authentification quitte `apps/web` pour `@jp/identite`.**
  
  Machine à états, cases du code et libellés mg/fr vivaient dans
  `apps/web/src/features/identite/`. Rien de tout cela n'a besoin du DOM, et
  l'écran mobile de F0.1 en aura besoin à l'identique. Les laisser là, c'était
  signer pour une seconde machine à états — écrite plus tard, sous pression, par
  quelqu'un qui n'aurait pas relu `US-AUTH-02 CA4`. Les deux auraient divergé, et
  la divergence serait tombée sur l'écran de connexion, celui que tout le monde
  traverse.
  
  Ce qui **reste** dans `apps/web` est ce qui est vraiment web : le rendu HTML, le
  client `fetch`, et `theme.ts` — qui produit des variables CSS et importe
  `CSSProperties` de React. La frontière est celle de `@jp/ui`, appliquée à un
  domaine : le paquet porte les décisions, l'application les affiche.
  
  **La condition d'existence du paquet est écrite dans le plan** *(`PLAN_SOCLE`
  §2)*, parce qu'un premier paquet de domaine invite à en faire seize : deux
  applications rendent le même parcours, et ses règles ne tiennent ni au DOM ni à
  React Native. Tant qu'un seul client rend un parcours, il reste dans
  `apps/<client>/src/features/<domaine>/`.
  
  **Deux garde-fous ajoutés.**
  
  - `eslint.config.mjs` interdit `react`, `react-dom` et `react-native` dans
    `packages/**`. `@jp/ui` promettait déjà « aucun composant React » dans son
    en-tête, et rien ne le vérifiait ; une promesse de docstring cède au premier
    « juste un petit hook ». `check-architecture.mjs` prouve que la règle mord —
    huit contrôles au lieu de sept.
  - Les treize tests des règles du parcours suivent le code dans
    `packages/identite/` : le mobile héritera de ces garanties sans qu'on les
    réécrive.
  
  **Un doublon en moins.** `apps/web` testait `etatDepuis` mot pour mot comme
  `packages/ui/src/index.test.ts:201` — et le testait depuis un dossier dont
  aucun écran n'appelle `etatDepuis`. Le test est supprimé, pas la couverture :
  la règle « hors ligne AVANT erreur » reste vérifiée à ses deux vraies adresses,
  dans `@jp/ui` pour l'état d'écran et dans `@jp/identite` pour le réducteur.

### Patch Changes

- 8872277: **Les libellés d'écran n'avaient aucun filet.**
  
  Ils ne sont pas dans `@jp/i18n` — ils n'ont pas d'équivalent anglais, et le test
  de largeur de ce paquet mesure tout contre l'anglais. Ils sont donc arrivés
  dans `@jp/identite` sans qu'aucun test ne les regarde. Vingt-huit en posent un,
  sur les trois choses qu'un test PEUT juger :
  
  - **les deux catalogues portent les mêmes clés.** Une clé d'un seul côté rendrait
    `undefined` dans une langue sans que le typage bronche, les deux objets étant
    typés par la même interface ;
  - **les mêmes jetons `{…}` de part et d'autre.** C'est la moitié fermable de la
    classe de défauts déjà vécue ici : `OTP_INVALIDE` passait `{essais}` à un
    gabarit qui réclamait `{restantes}`, et le nombre n'arrivait jamais ;
  - **les trois titres tiennent dans leurs deux lignes.** La boîte fait 88 dp de
    hauteur FIXE, pour que le malgache et le français aient le même rythme
    vertical. Une troisième ligne ne serait pas coupée, elle serait tronquée en
    silence. Le budget est estimé et l'estimation est dite dans le fichier.
  
  **Ce qu'aucun test ne saura juger** — la justesse du malgache — part en
  relecture chez un locuteur, avec trois doutes déjà argumentés :
  
  1. `ecran2Validite` — le français dit « valide encore 9:42 », une DURÉE qui
     décompte ; le malgache semble dire « jusqu'à l'arrivée de 9:42 », une heure.
     Les deux langues ne décrivent pas la même chose.
  2. `anarana` traduit `prénom` dans trois chaînes. Si le mot se comprend comme le
     nom complet, une commande affichera deux noms là où l'écran est dessiné pour
     un.
  3. `ecran2Envoye` — « Nalefa tany amin'ny » : `tany` devant une adresse e-mail.
  
  **Sept phrases contredisent la maquette au passage.** Elle pose que les boîtes
  sont dimensionnées sur le malgache et que le français s'y glisse sans retouche.
  C'est faux pour sept des vingt-et-une : `attente` va jusqu'à × 1,75
  (« Andrasana... » contre « Veuillez patienter... »). Rien ne casse aujourd'hui,
  les boîtes ayant de la marge — mais la prémisse est fausse, et elle est écrite
  dans la maquette comme si elle tenait.
- Updated dependencies [5b8c4c6]
- Updated dependencies [54238e3]
- Updated dependencies [a1886f6]
- Updated dependencies [d4d5a3b]
- Updated dependencies [5e32c09]
- Updated dependencies [46ba866]
- Updated dependencies [4da725c]
- Updated dependencies [7251850]
  - @jp/contracts@1.0.0
  - @jp/i18n@1.0.0
