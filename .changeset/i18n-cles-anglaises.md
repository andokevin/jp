---
'@jp/i18n': major
'@jp/api': major
'@jp/mobile': patch
'@jp/web': patch
---

**Sprint « code en anglais », étape 1b-③ — clés du catalogue i18n.**

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
