# @jp/ui

## 1.0.0

### Major Changes

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

### Patch Changes

- Updated dependencies [54238e3]
- Updated dependencies [a1886f6]
- Updated dependencies [46ba866]
- Updated dependencies [7251850]
  - @jp/i18n@1.0.0
  - @jp/money@1.0.0

## 0.0.1

### Patch Changes

- @jp/i18n@0.0.1
  - @jp/money@0.0.1
