---
'@jp/contracts': major
'@jp/identite': major
'@jp/api': major
'@jp/mobile': major
'@jp/web': major
---

**Sprint « code en anglais », étape 1b-①  — rupture v2 du contrat API.**

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
