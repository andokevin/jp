# Chantier `chantier-prisma-en-anglais` — plan de migrations

**Ampleur** : 63 enums (227 valeurs) + 605 colonnes mappées sur 96 tables + 4 migrations historiques déjà appliquées.

**Stratégie** : 8 étapes indépendantes, une par domaine métier. Chaque étape produit :

1. Une modification du `prisma/schema.prisma` (renomme enum, colonnes, mapping).
2. Une migration Prisma générée puis retouchée à la main pour utiliser `ALTER TYPE RENAME VALUE` (non-destructif) plutôt que le `CREATE TYPE ... DROP TYPE` que Prisma génère par défaut.
3. Les adaptations du code applicatif (repository, service, tests).
4. `pnpm exec prisma generate` régénère le client.
5. Le vérifier tourne à la fin de chaque étape.

**Contraintes techniques** :

- `ALTER TYPE ... RENAME VALUE` est non-bloquant en PostgreSQL ≥ 10.
- `ALTER TYPE ... RENAME` (rename du type) prend un `ACCESS EXCLUSIVE LOCK` bref sur les tables qui l'utilisent.
- `ALTER TABLE ... RENAME COLUMN` invalide les vues et fonctions qui référencent la colonne — à traiter au cas par cas si des vues existent.
- Toute migration doit être **réversible** en développement (dump/restore).

---

## Ordre des étapes

L'ordre respecte les dépendances de foreign keys : on rebaptise d'abord les **tables aval** (celles pointées par d'autres), puis les **tables amont**. Les enums peuvent se faire dans n'importe quel ordre — ils sont indépendants.

| # | Domaine | Tables | Enums |
|---|---|---|---|
| 1 | **Identité** (`utilisateur`, `session`, `code_otp`…) | 5 | 8 |
| 2 | **Univers / catalogue / stock** | 4 | 7 |
| 3 | **Commande / paiement / livraison / séquestre** | 5 | 10 |
| 4 | **Contenu / créateur** | 4 | 5 |
| 5 | **Événement / promotion / précommande / fidélité** | 14 | 11 |
| 6 | **Litige / modération / signalement** | 4 | 7 |
| 7 | **Notification / direct / abonnement** | 11 | 7 |
| 8 | **Exploitation / cagnotte / cadeau / dressing / écart** | 6+ | 8 |

**43 autres tables** (boutique, panier, extrait_boutique, adresse, journal_audit…) sans domaine explicite — à répartir dans un lot 9 ou à traiter au fil.

---

## Étape 1 — Identité

### Enums

| Nom SQL actuel | Nouveau nom |
|---|---|
| `langue` | `language` |
| `genre` | `gender` |
| `fournisseur_externe` | `external_provider` |
| `etape_changement_email` | `email_change_step` |
| `role_equipe` | `team_role` |
| `statut_utilisateur` | `user_status` |
| `type_document_identite` | `identity_document_type` |
| `statut_verification` | `verification_status` |

### Valeurs à renommer (échantillon)

- `genre` : `femme` → `female`, `homme` → `male`, `autre` → `other`
- `langue` : `en`/`fr`/`mg` inchangés (déjà anglais)
- `statut_utilisateur` : `actif` → `active`, `suspendu` → `suspended`, etc.

### Tables

| Nom SQL actuel | Nouveau nom |
|---|---|
| `utilisateur` | `user` |
| `session` | `session` (inchangé) |
| `code_otp` | `otp_code` |
| `profil_acheteur` | `buyer_profile` |
| `profil_createur` | `creator_profile` |

### Colonnes principales (échantillon `utilisateur`)

- `email_verifie_le` → `email_verified_at`
- `telephone` → `phone`, `telephone_verifie_le` → `phone_verified_at`
- `prenom` → `first_name`, `nom` → `last_name`
- `date_naissance` → `birth_date`
- `mot_de_passe_empreinte` → `password_hash`
- `mot_de_passe_maj_le` → `password_updated_at`
- `photo_url` inchangé
- `classements_publics` → `public_rankings`
- `cree_le` → `created_at`, `maj_le` → `updated_at`

### Migration SQL (extrait, à générer par `prisma migrate diff` puis retoucher)

```sql
BEGIN;

-- Enums
ALTER TYPE genre RENAME VALUE 'femme' TO 'female';
ALTER TYPE genre RENAME VALUE 'homme' TO 'male';
ALTER TYPE genre RENAME VALUE 'autre' TO 'other';
ALTER TYPE genre RENAME TO gender;

ALTER TYPE langue RENAME TO language;

ALTER TYPE fournisseur_externe RENAME TO external_provider;

-- Tables
ALTER TABLE utilisateur RENAME TO "user";
ALTER TABLE code_otp     RENAME TO otp_code;
ALTER TABLE profil_acheteur RENAME TO buyer_profile;
ALTER TABLE profil_createur RENAME TO creator_profile;

-- Colonnes utilisateur (échantillon)
ALTER TABLE "user" RENAME COLUMN email_verifie_le TO email_verified_at;
ALTER TABLE "user" RENAME COLUMN telephone TO phone;
ALTER TABLE "user" RENAME COLUMN telephone_verifie_le TO phone_verified_at;
ALTER TABLE "user" RENAME COLUMN prenom TO first_name;
ALTER TABLE "user" RENAME COLUMN nom TO last_name;
ALTER TABLE "user" RENAME COLUMN date_naissance TO birth_date;
ALTER TABLE "user" RENAME COLUMN mot_de_passe_empreinte TO password_hash;
ALTER TABLE "user" RENAME COLUMN mot_de_passe_maj_le TO password_updated_at;
ALTER TABLE "user" RENAME COLUMN classements_publics TO public_rankings;
ALTER TABLE "user" RENAME COLUMN cree_le TO created_at;
ALTER TABLE "user" RENAME COLUMN maj_le TO updated_at;

-- (colonnes des autres tables similaires — 39 colonnes au total pour cette étape)

COMMIT;
```

### Code applicatif touché

- `apps/api/src/modules/identite/repository.ts` — enlever le mapping v2↔Prisma introduit à l'étape 1b-①, tout parle anglais désormais
- `apps/api/src/modules/identite/service.ts` — remplacer `utilisateur.prenom` → `user.firstName` (et similaires)
- `apps/api/src/plateforme/auth.ts` — `db.session.create({ data: { jetonEmpreinte, expireLe } })` → `{ tokenHash, expiresAt }`
- `apps/api/test/*.test.ts` — payloads SQL et accès Prisma
- `prisma/seed.mts` — les CLES de config `utilisateur_id` etc.
- Renommer le dossier `apps/api/src/modules/identite/` → `identity/` (cohérence architecture)

---

## Étapes 2 à 8 — pattern identique

Chaque étape suit la même recette :

1. Modifier `schema.prisma` (enum names + values + table + columns)
2. `pnpm exec prisma migrate dev --name renommage_<domaine>_en_anglais --create-only`
3. Éditer la migration générée pour utiliser `ALTER TYPE RENAME VALUE` et `ALTER TABLE RENAME` (Prisma génère par défaut du DROP+CREATE, ce qui perd les données)
4. `pnpm exec prisma migrate dev` pour appliquer
5. `pnpm exec prisma generate`
6. Mettre à jour le code applicatif (repository, service, tests, seed)
7. `pnpm verifier` doit passer avant le commit

### Domaines et pattern

- **Étape 2** — `article`, `stock`, `reservation`, `variante`, `attribut` + 7 enums
- **Étape 3** — `commande`, `paiement`, `livraison`, `expedition`, `sequestre`, `ecriture`, `compte` + 10 enums
- **Étape 4** — `contenu`, `interaction`, `contenu_article`, `contenu_hashtag` + 5 enums
- **Étape 5** — `evenement`, `promotion`, `precommande`, `engagement`, `cagnotte`, `fidelite`, `palier` … + 11 enums
- **Étape 6** — `litige`, `signalement`, `sanction`, `republication_suspectee` + 7 enums
- **Étape 7** — `notification`, `direct`, `message`, `abonnement_boutique`, `mise_en_avant` + 7 enums
- **Étape 8** — `parametre`, `cle_idempotence`, `journal_audit`, `ecart`, `question` + 8 enums
- **Étape 9** (facultative) — 43 tables restantes (`boutique`, `panier`, `adresse`, etc.)

---

## Pièges à connaître

**Prisma génère un DROP + CREATE pour un rename d'enum.** Il faut éditer la migration à la main.

**Les foreign keys ne bougent pas automatiquement.** `session.utilisateur_id` reste `utilisateur_id` même après `ALTER TABLE utilisateur RENAME`. Il faut ajouter `ALTER TABLE session RENAME COLUMN utilisateur_id TO user_id;`.

**Les index et contraintes portent parfois le nom de la table.** `code_otp_email_key` reste ainsi après le rename de la table. À renommer explicitement ou à supprimer et recréer.

**Le seed.mts référence des noms de tables** via Prisma Client. `pnpm exec prisma generate` doit être fait AVANT toute exécution du seed sinon le client est décalé.

**Les fichiers Prisma générés dans `apps/api/src/genere/prisma/`** sont gitignorés et regénérés à chaque `prisma generate`. Ne pas essayer de les éditer à la main.

---

## Plan de test après chaque étape

```bash
pnpm exec prisma migrate reset --skip-seed --force  # partir d'une base propre
pnpm exec prisma migrate deploy                     # rejouer toutes les migrations
pnpm db:role                                        # remettre les grants
pnpm db:seed                                        # charger les données
pnpm verifier                                       # 27 tâches, tests + archi
```

Si `pnpm verifier` passe, la migration est validée pour l'étape.

---

## État initial

Cette branche `chantier-prisma-en-anglais` part de `master` à `2e473a0` (merge de la PR #1480 le 2026-09-08), sans aucun changement encore.

