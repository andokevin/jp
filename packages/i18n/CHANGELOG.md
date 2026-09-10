# @jp/i18n

## 1.0.0

### Major Changes

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
- 7251850: **Sprint « code en anglais », étape 1a — trois paquets partagés.**
  
  Les identifiants TypeScript des trois paquets fondamentaux passent en anglais.
  Aucune valeur exposée sur le réseau, aucune valeur stockée en base n'est
  touchée à cette étape.
  
  **`@jp/i18n`** — `langues.ts` → `languages.ts`, `pluriel.ts` → `plural.ts`.
  `LANGUES` → `LANGUAGES`, `Langue` → `Language`, `LANGUE_PAR_DEFAUT` →
  `DEFAULT_LANGUAGE`, `langueDepuisEnTete` → `languageFromHeader`,
  `estLangue` → `isLanguage`, `RALLONGEMENT_FRANCAIS` / `RALLONGEMENT_MALGACHE`
  → `FRENCH_EXPANSION` / `MALAGASY_EXPANSION`, `traduire` → `translate`,
  `variablesDe` → `variablesOf`, `CleMessage` → `MessageKey`, `CATALOGUES` →
  `CATALOGS`, `CLES` → `KEYS`, `FUSEAU` → `TIMEZONE`, `dateCourte` → `shortDate`,
  `heure` → `time`, `entier` → `integer`, `duree` → `duration`, `forme` → `form`,
  `accorder` → `agree`, `FormesPluriel` → `PluralForms`.
  
  Les **valeurs** des catalogues (`'erreur.otp_invalide'`, `'etat.chargement'`,
  etc.) et les jetons `{restantes}` restent français pour l'étape 1b — ils sont
  transportés vers l'API et n'appartiennent pas à ce paquet seul.
  
  **`@jp/money`** — `MontantInvalide` → `InvalidAmount`, `PourMille` → `PerMille`,
  `depuisTexte` → `fromText`, `additionner` → `add`, `soustraire` → `subtract`,
  `multiplier` → `multiply`, `minimum` / `maximum` → `min` / `max`, `borner` →
  `clamp`, `commissionSur` / `remiseSur` / `netVendeur` → `commissionOn` /
  `discountOn` / `sellerNet`, `repartir` / `repartirEgalement` → `distribute` /
  `distributeEqually`, `formater` / `formaterNu` / `formaterTaux` → `format` /
  `formatBare` / `formatRate`, `versJSON` / `depuisJSON` → `toJSON` / `fromJSON`.
  
  `Ariary` **reste** — c'est l'unité monétaire malgache, une donnée locale, pas
  un nom de fonction. `pourMille` → `perMille`.
  
  **`@jp/ui`** — `jetons.ts` → `tokens.ts`, `etats.ts` → `states.ts`, `univers.ts`
  → `universes.ts`. `CIBLE_TACTILE_MIN` / `CONTRASTE_MIN` → `MIN_TAP_TARGET` /
  `MIN_CONTRAST`, `COULEURS` / `Couleur` → `COLORS` / `Color`, `ESPACEMENT` →
  `SPACING`, `RAYON` (petit/moyen/grand/rond) → `RADIUS` (small/medium/large/round),
  `TYPOGRAPHIE` (titre/corps/petit) → `TYPOGRAPHY` (heading/body/small),
  `JETONS` → `TOKENS`, `contraste` → `contrast`, `SigneDistinctif` /
  `respecteRZ1` → `DistinctSign` / `respectsRZ1`. `ETATS` → `STATES`, `Etat`
  `etatDepuis` / `messageEtat` / `aQuelqueChoseAMontrer` → `stateFrom` /
  `stateMessage` / `hasSomethingToShow`. `BOUTON_PRINCIPAL` → `PRIMARY_BUTTON`,
  `prixAriary` → `ariaryPrice`, `imageProgressive` → `progressiveImage`,
  `etatVide` → `emptyState`, `minuteurReservation` → `reservationTimer`,
  `TonBadge` (`neutre`/`succes`/`attention`/`danger`) → `BadgeTone`
  (`neutral`/`success`/`warning`/`danger`), `ligneListe` → `listRow`,
  `selecteurUnivers` / `enteteUnivers` / `pastilleUnivers` → `universeSelector` /
  `universeHeader` / `universePill`.
  
  Les **valeurs** de l'union `STATES` (`'chargement'`, `'vide'`, `'erreur'`,
  `'hors-ligne'`, `'charge'`) restent françaises — c'est un enum de type, à
  traiter avec `genre` et les clés d'API à l'étape 1b.
  
  **381 tests toujours au vert.** Chaque paquet a été validé (typecheck + tests)
  avant que ses consommateurs soient rebranchés.

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
- 46ba866: Ajout des routes d'authentification OTP et mot de passe  et service et repository

## 0.0.1
