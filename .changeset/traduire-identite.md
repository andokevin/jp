---
'@jp/identite': major
'@jp/mobile': patch
'@jp/web': patch
---

**Sprint « code en anglais », étape 1a — fin : `@jp/identite`.**

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
