# @jp/contracts

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
- d4d5a3b: Ajout des schémas Zod pour l'authentification OTP (F0.1)
- 5e32c09: fix erreur de audit et format
- 46ba866: Ajout des routes d'authentification OTP et mot de passe  et service et repository
- 4da725c: **Sprint « code en anglais », étape 1a — le contrat.**
  
  Le paquet `@jp/contracts` passe ses identifiants TypeScript en anglais. Les
  **valeurs de chaînes exposées à l'API et à la base restent françaises** — elles
  appartiennent au contrat public, et leur bascule (rupture d'API v2) est
  réservée à l'étape 1b.
  
  **Fichiers renommés.** `commun.ts` → `common.ts`, `univers.ts` → `universes.ts`.
  Et les 11 modules-souches par domaine : `catalogue`/`commande`/`contenu`/
  `createur`/`evenement`/`fidelite`/`identite`/`litige`/`livraison`/`paiement`/
  `sequestre` → `catalog`/`order`/`content`/`creator`/`event`/`loyalty`/
  `identity`/`dispute`/`shipping`/`payment`/`escrow`. `moderation`, `notification`,
  `promotion`, `stock` restent (mêmes en anglais).
  
  Le baril `index.ts` réexporte ces modules sous leurs nouveaux noms de
  namespace : `catalog.*`, `order.*`, `identity.*`, etc. Les consommateurs qui
  faisaient `import { catalogue } from '@jp/contracts'` doivent écrire
  `import { catalog }`.
  
  **`common.ts`.** `EN_TETES` → `HEADERS` (et ses clés `idempotence`/`langue`/
  `economieDonnees` → `idempotency`/`language`/`dataSaver`), `TAILLE_PAGE_DEFAUT`
  / `TAILLE_PAGE_MAX` → `DEFAULT_PAGE_SIZE` / `MAX_PAGE_SIZE`, `encoderCurseur` /
  `decoderCurseur` → `encodeCursor` / `decodeCursor`, `erreurSchema` →
  `errorSchema`, `telephoneSchema` → `phoneSchema`, `cleIdempotenceSchema` →
  `idempotencyKeySchema`, `langueSchema` → `languageSchema`. **`Erreur` →
  `ApiError`** — l'ancien nom entrait en collision avec `Error` du prélude JS.
  
  **`auth.ts`.** `OTP_LONGUEUR` → `OTP_LENGTH`, et tous les schémas et types :
  `codeOtp` → `otpCode`, `motDePasse` → `password`, `prenom` → `firstName`,
  `nom` → `lastName`, `genre` → `gender`, `telephone` → `phone`,
  `dateDeNaissance` → `birthDate`, `preferencesVetement` → `clothingPreferences`,
  `demanderCodeOptSchema` → `requestOtpSchema`, `verifierCodeOptSchema` →
  `verifyOtpSchema`, `connexionEmailSchema` → `emailLoginSchema`,
  `ConnexionExterneSchema` → `ExternalLoginSchema`, `ReponseSessionSchema` →
  `SessionResponseSchema`, `ReponseOtpSchema` → `OtpResponseSchema`,
  `ReponseErreurSchema` → `ErrorResponseSchema` (avec leurs types associés).
  
  **Les CLÉS JSON des schémas d'objet restent françaises** — `finalite`,
  `motDePasse`, `prenom`, `nom`, `genre`, `langue`, `dateNaissance`, `telephone`,
  `preferencesVetement`, `jeton`, `expireLe`, `utilisateur`, `expireDansS`. Elles
  voyagent en HTTP et sont vues par les clients. Une bascule sera une v2 d'API,
  étape 1b.
  
  **`universes.ts`.** `LIVRAISONS` / `ModeLivraison` → `SHIPPING_MODES` /
  `ShippingMode`, `CHAMPS_FICHE` / `ChampFiche` → `LISTING_FIELDS` /
  `ListingField`, `MOTIFS_LITIGE` / `MotifLitige` → `DISPUTE_REASONS` /
  `DisputeReason`, `DefinitionUnivers` → `UniverseDefinition`, `UNIVERS` →
  `UNIVERSES`, `CleUnivers` → `UniverseKey`. Fonctions `univers` → `universe`,
  `universOuverts` → `openUniverses`, `livraisonPermise` → `shippingAllowed`,
  `motifRecevable` → `reasonAcceptable`, `champsManquants` → `missingFields`.
  Champs de `UniverseDefinition` traduits (`cle` → `key`, `nom` → `name`,
  `onglet` → `tab`, `ouvert` → `open`, `commissionPourMille` → `commissionPerMille`,
  `livraisons` → `shipping`, `champsFiche` → `listingFields`, etc.). Les VALEURS
  d'énum (`'mode'`, `'beaute'`, `'point_relais'`, `'imei'`…) restent — elles vont
  en base.
  
  **`exploitation.ts`.** `TypeParametre` / `DefinitionParametre` → `ParameterType`
  / `ParameterDefinition`, `PARAMETRES` → `PARAMETERS`, `valider` → `validate`.
  Champs `cle` / `defaut` → `key` / `default`.
  
  **Consommateurs mis à jour** — 15 fichiers dans `apps/api`, `apps/mobile`,
  `apps/web`, `packages/identite`, ainsi que `prisma/seed.mts`.
  
  **381 tests toujours au vert.**
  
  **Ce qui reste pour terminer 1a.** `@jp/identite` — ses propres identifiants
  internes (`parcours.ts`, `hook.ts`, `code-otp.ts`, `libelles.ts`, `EtatParcours`,
  `Panne`, `reduire`, `casesVides`…) n'ont pas encore été traduits. Le paquet
  compile parce que ses seules dépendances externes (`@jp/i18n`, `@jp/contracts`)
  sont à jour. C'est le morceau qui touchera le plus profondément aux écrans web
  et natif — mieux vaut le traiter isolément.

### Minor Changes

- a1886f6: **Le malgache revient, et `apps/web` porte l'authentification.**
  
  `LANGUES` passe de deux à trois valeurs : `en`, `fr`, `mg`. La décision du
  19/08/2026 qui l'avait retiré est annulée — `EP00 §6` n'avait jamais cessé de
  prévoir « mg et fr », et les écrans d'identité sont écrits en malgache d'abord.
  Le français reste la langue PAR DÉFAUT : c'est le repli d'un `Accept-Language`
  illisible, et il doit tomber sur ce que le serveur sait rendre partout.
  
  **Ce qu'il faut savoir avant d'y toucher.**
  
  - Les 26 chaînes du catalogue malgache sont **à faire relire par un locuteur**.
    Elles sont proposées, pas certifiées.
  - Le test de largeur mesure désormais chaque langue contre l'anglais, avec sa
    propre marge : 20 % pour le français, **30 % pour le malgache**
    (`RALLONGEMENT_MALGACHE`). Il échouait déjà sur `master` — trois libellés
    français ajoutés pour F0.1 dépassaient la marge ; ils sont raccourcis.
  - `Intl` ne connaît pas forcément `mg` : `format.ts` mappe la langue malgache
    sur la locale `fr-FR`, explicitement, plutôt que de laisser un repli
    silencieux sur la locale du système.
  - `balisesApercu` choisissait sa locale Open Graph par un ternaire, qui aurait
    envoyé le malgache sur `en_US` sans que rien ne casse. C'est une table.
  
  **Les schémas de réponse de `contracts/auth.ts` décrivent enfin le serveur.**
  `ReponseSessionSchema` annonçait `{ token, user, expiresAt }` là où l'API rend
  `{ jeton, expireLe, utilisateur }` ; `ReponseOtpSchema` annonçait
  `{ message, resendAfter }` pour `{ ok, expireDansS }`. Aucun client ne pouvait
  lire une réponse réelle avec ces schémas — ils n'étaient consommés nulle part,
  ce qui explique que la divergence ait tenu. `genre` et `langue` en sortent : le
  serveur ne les renvoie pas.
  
  **`apps/web` gagne un point de montage** — il n'en avait aucun — et le parcours
  d'identité : adresse, code à six chiffres, prénom. Inscription et connexion
  sont le même parcours. La charte du paquet est amendée en conséquence : le
  compte quitte la liste des exclusions, panier, paiement et studio y restent, et
  les cinq pages partageables restent cinq.

### Patch Changes

- Updated dependencies [54238e3]
- Updated dependencies [a1886f6]
- Updated dependencies [46ba866]
- Updated dependencies [7251850]
  - @jp/i18n@1.0.0

## 0.0.1

### Patch Changes

- @jp/i18n@0.0.1
