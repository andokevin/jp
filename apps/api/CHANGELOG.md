# @jp/api

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
- 5e32c09: fix  json config
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
- 5e32c09: fix erreur de audit et format
- 46ba866: Ajout des routes d'authentification OTP et mot de passe  et service et repository

### Minor Changes

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
- bef1f17: Le schéma gagne huit tables et trois attributs — le sprint « ajout d'attributs ».
  
  **Sur `utilisateur`** : `genre` *(femme · homme · autre, facultatif — `NULL`
  n'est pas `autre`)* et `mot_de_passe_empreinte`. Le mot de passe **s'ajoute** à
  l'OTP au lieu de le remplacer : l'OTP ne survit pas à la perte de la boîte
  courriel et coûte un aller-retour à chaque connexion. La colonne reste nullable
  — un compte ouvert par Google n'a pas de mot de passe.
  
  **Tables nouvelles** : `profil_acheteur` *(trois préférences de vêtements au
  plus, borné par un `CHECK`)*, `boutique` *(avec `logo_url`, et **sans**
  `type_boutique` — `DP-01`)*, `document_identite`, `article`, `variante`,
  `panier`, `ligne_panier`, `extrait_boutique`.
  
  **Les deux points à connaître avant de coder dessus.**
  
  `D7` est **révisé** : une table `panier` existe désormais, mais elle ne détient
  **aucune** vérité sur le stock. Une ligne de panier est une intention d'achat
  qui ne tient rien ; le blocage se fait au passage en caisse, par une
  `reservation`. Supposer l'inverse rouvre le risque de survente que `D7`
  fermait.
  
  `DELETE` est **retiré à `jp_app`** sur `utilisateur`, `boutique`, `article`,
  `variante` et `extrait_boutique` : la suppression y est douce
  *(`supprime_le`, ou `statut = supprime`)*. Une commande passée cite encore
  l'article qu'elle contient.
  
  32 tests éprouvent ces garanties sur un PostgreSQL réel
  *(`apps/api/test/attributs.test.ts`)* — y compris la contre-épreuve qui prouve
  que les `REVOKE` mesurent bien le rôle et non une faute de frappe.
- bef1f17: **Le schéma est entièrement migré** — 96 tables, contre 7 hier.
  
  Les 32 migrations planifiées *(`JP_CONCEPTION_BDD.md` §12)* ont été jouées en
  7 migrations groupées par domaine : identité, catalogue et stock, social et
  direct et événements, commande et paiement et livraison, contenu et confiance
  et modération, créatrices et fidélité et cadeau, monétisation et exploitation.
  
  **Trois écarts avec la documentation ont été tranchés en faveur du
  dictionnaire**, postérieur à la refonte :
  
  - la table `litige` du diagramme ER est devenue **`signalement_commande`**,
    sans `decision_texte` ni `decide_par_id` *(`DP-05`)* — personne n'instruit,
    personne ne tranche. `RB4` s'est déplacé sur `sanction.motif_texte` ;
  - **`bareme_commission`** est rétablie *(`DP-15`)*, historisée : un déclencheur
    n'autorise que la clôture d'une version, jamais la modification d'un taux ;
  - `article.peremption_le` est une colonne **ordinaire** et non générée — Prisma
    ne sait pas déclarer les colonnes générées, et une colonne ajoutée à la main
    ferait dériver le schéma.
  
  **Ce qu'il faut savoir avant de coder dessus.**
  
  `DELETE` est retiré à `jp_app` sur 29 tables : la suppression y est douce.
  `ecriture_financiere`, `mouvement_cagnotte`, `vente_confirmee_journal` et
  `evenement_usage` sont en **ajout seul**, comme `journal_audit`.
  
  Quatre garanties ne vivent que dans le SQL, pas dans le schéma Prisma : le
  déclencheur **différé** de `RB5` *(un contenu publié porte au moins un
  article)*, le `CHECK compteur_coherent` *(un signalement ouvert pèse,
  toujours)*, l'index partiel d'expiration des réservations, et l'unicité
  partielle de l'abonnement actif. Les toucher sans lire leur commentaire de
  migration casse une règle produit, pas une contrainte technique.
  
  52 tests éprouvent tout cela sur un PostgreSQL réel.

### Patch Changes

- 5e32c09: fix audit et test
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
- a657415: Le module `livraison` change de sens : **JP n'opère plus aucune logistique**
  *(`DP-04`)*. La boutique fait parvenir le colis par le moyen de son choix ; le
  module n'enregistre plus que ce qu'elle déclare et ce que l'acheteur confirme.
  
  **Le point à connaître avant de coder dessus** : `EXPEDIEE` est une déclaration
  de la boutique que **personne ne vérifie** *(`R-L9`)*. Aucun tiers neutre ne
  constate la remise — il n'y a ni preuve, ni arbitre, ni argent retenu. C'est un
  invariant que le module ne peut pas garantir, et qu'il ne faut donc pas
  supposer ailleurs.
  
  L'application `@jp/terrain` — livreur et point relais — est supprimée avec la
  logistique. Elle ne peut pas porter son propre changeset, n'existant plus.
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
  - @jp/money@1.0.0

## 0.0.1

### Patch Changes

- 0f9226e: L'intégration continue génère le client Prisma avant de typer. `apps/api/src/genere/` étant un artefact non versionné, le runner ne pouvait pas compiler `@jp/api`.
  
  Mise en place de Changesets pour le versionnement et les journaux de modifications, sans publication.
- @jp/contracts@0.0.1
  - @jp/i18n@0.0.1
  - @jp/money@0.0.1
