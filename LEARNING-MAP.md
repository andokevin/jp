# Learning Map

> **Fichier généré.** `pnpm avancement` le réécrit depuis l'état réel des
> issues GitHub. Ne le modifiez pas à la main — un tableau d'avancement tenu
> à la main ment au bout de trois jours.
>
> Dernière génération : 2026-08-19

## Projet en cours

**JP** — marketplace mode pour Madagascar. Commerce en direct, vente hors
direct, couche sociale. La promesse : **l'argent de l'acheteuse est gardé par
JP jusqu'à ce qu'elle confirme avoir reçu.**

## Objectif

Terminer la **vague 0 — le socle** (`S1` → `S10`), qui ne livre aucune
fonctionnalité visible mais que les 266 fonctionnalités supposent en place.
Ensuite seulement, la **tranche 1** : la première vente réelle.

## Le socle

| | Élément | | État | Issues |
|---|---|---|---|---|
| `S1` | Monorepo, TypeScript strict, intégration continue | `●●●●` | **fait** | #1280–#1283 |
| `S2` | Paquets fondamentaux — money, i18n, contracts | `●●●●` | **fait** | #1284–#1287 |
| `S3` | Plateforme API — le transverse écrit une fois | `●●●●●●●` | **fait** | #1288–#1294 |
| `S4` | Base de données — Prisma, migrations, Testcontainers | `●●●●●` | **fait** | #1295–#1299 |
| `S5` | Travail asynchrone — BullMQ, files, reprise | `●●●●` | **fait** | #1300–#1303 |
| `S6` | Temps réel — WebSocket, canaux, resynchronisation | `●●●●` | **fait** | #1304–#1307 |
| `S7` | Design system — jetons, primitives, les quatre états | `●●●●●` | **fait** | #1308–#1312 |
| `S8` | Coquille Expo — navigation, session, hors ligne | `●●●●○` | 4/5 | #1313–#1317 |
| `S9` | Coquilles Vite — back-office et pages publiques | `●●●` | **fait** | #1318–#1320 |
| `S10` | Observabilité — journaux, métriques, alertes | `●●●●` | **fait** | #1321–#1324 |

**44 / 45** issues de socle fermées.

## La suite

| | |
|---|---|
| Tranche 1 — première vente réelle | 0 / 302 |
| Prochaine issue | **#1317** — S8.5 Mesure du poids de l'APK et de la mémoire en intégration continue |

## Ce que le dépôt contient

| | |
|---|---|
| Fichiers TypeScript écrits | 176 |
| Tests | 180 |
| Migrations appliquées | 3 |

## Notions pratiquées

- **Union littérale et `as const`** — une liste écrite une fois, le type en découle
- **Prédicat de type** (`valeur is Langue`) — informer le compilateur, pas seulement répondre
- **`noUncheckedIndexedAccess`** — pourquoi `tableau[0]` peut être `undefined`
- **Droits PostgreSQL** — `REVOKE` ne vaut que si l'application n'est pas propriétaire
- **`ALTER TYPE … RENAME VALUE`** — renommer sans réécrire les lignes
- **`ON DELETE RESTRICT` contre `SET NULL`** — un `SET NULL` sur un journal en
  ajout seul serait une porte dérobée
- **Migration corrective** — une migration appliquée ne se réécrit jamais
- **Dépendances fantômes** — pnpm exige qu'on déclare ce qu'on importe
- **Pagination par curseur** — un décalage saute des lignes sur un jeu qui bouge
- **Tests dans les deux sens** — sans les cas qui doivent passer, une règle trop
  large paraît correcte

## Points de vigilance connus

- **`ALTER DEFAULT PRIVILEGES`** accorde `UPDATE`/`DELETE` aux tables futures.
  `ecriture_financiere` *(migration n° 12)* devra porter son propre `REVOKE`.
- **L'intégration continue n'a jamais tourné** sur GitHub. À confirmer à la
  première pull request.
- **Deux décisions produit ouvertes**, semées avec une valeur provisoire :
  `taux_commission_defaut = 80` *(8 %)* et
  `duree_reservation_catalogue_s = 1800` *(30 min)*.
- **Le réseau de développement est lent** — environ 18 s par requête au registre
  npm. Les installations lourdes (`S7`, `S8`) doivent être lancées en tâche de
  fond très en amont.

## Commandes

```bash
pnpm verifier      # typage · style · tests · architecture · contrat
pnpm db:reset      # reconstruit la base en ~22 s
pnpm avancement    # régénère ce fichier
pnpm couverture    # le plan couvre-t-il encore le backlog ?
```
