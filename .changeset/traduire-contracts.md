---
'@jp/contracts': major
---

**Sprint « code en anglais », étape 1a — le contrat.**

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
