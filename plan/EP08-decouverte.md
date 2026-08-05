# EP08 — Découverte, recherche et navigation

> 8 fonctionnalités · vague 3 · modules `catalogue`, `contenu`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**Le filtre par taille est la fonctionnalité de cette épique.** Tout le reste est de la navigation ordinaire ; le filtre par taille est ce qui rend le catalogue utilisable dans le vestimentaire — et sa version pré-remplie depuis le profil *(F0.5)* est le seul réglage qui change vraiment l'expérience.

**Recherche en V1** : PostgreSQL avec index adaptés, **pas de moteur dédié** *(CDC §2.2)*. Ne pas introduire un moteur de recherche tant que le volume ne le justifie pas — c'est un composant de plus à exploiter, sauvegarder et resynchroniser.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F8.1 | Fil d'accueil | P1 | M | complet |
| F8.3 | Filtres taille, couleur, marque, budget | P1 | S | complet |
| F8.2 | Recherche texte | P1 | S | moyen |
| F8.7 | Navigation par catégories | P1 | S | moyen |
| F8.4 | Tri nouveauté, prix, popularité, score | P1 | C | cadre |
| F8.8 | Recherches récentes et suggestions | P1 | C | cadre |
| F8.5 | Recommandations « à ma taille » | P2 | S | moyen |
| F8.6 | Mise en avant sponsorisée | P2 | S | moyen |

---

## F8.1 — Fil d'accueil

`P1 · M · complet` — **Voir** F7.2, F14.3, F7.17

### 1. Conception

Ordre, à l'ouverture : **directs en cours des comptes suivis**, puis directs en cours des autres, puis « ce soir à 20 h », puis replays récents, puis articles du catalogue *(F1.19)*, puis contenus du fil « Pour toi » *(F14.3)*.

**AN** : même fil sans personnalisation, avec un bandeau expliquant JP en une phrase.

**La composition est la fonctionnalité** : le fil assemble des sources déjà construites ailleurs (directs, contenus, articles, promotions, événements). Ce mini-plan porte l'**ordonnancement** et la pagination mixte, pas les sources.

**Décision** : trois onglets — « Accueil », « Pour toi » *(F14.3)*, « Abonnements » *(F7.17, F14.18)*. « Accueil » est l'écran d'entrée générique, les deux autres sont personnalisés. Un fil unique tentant de tout faire serait ininterprétable pour l'utilisatrice comme pour l'équipe.

### 2. Structure de code
```
apps/api/src/modules/contenu/filAccueil.ts     ordonnancement multi-sources
apps/mobile/src/features/fil/ecrans/EcranAccueil.tsx
apps/mobile/src/features/fil/composants/OngletsFil.tsx
```

### 3. Base de données
Aucune table : agrégation à la lecture, avec les index déjà créés *(F7.17 §3, F14.1 §3)*. Pagination par curseur composite `(cree_le, id)`.

### 4. Design
**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :
```
Screen — home feed, first screen after opening the app.
Vertical order: a top bar with the JP wordmark, a search icon and a notification
bell with a count badge; a horizontal stories row (F14.1); a tab row "Accueil ·
Pour toi · Abonnements" with "Accueil" active; then sections in this order —
"En direct maintenant" as a horizontal carousel of live cards with red pills and
viewer counts; "Ce soir" as two compact rows with times and "Me rappeler" buttons;
"Nouveautés" as a two-column product grid; and a promotion banner inserted between
sections.
Produce a guest variant: identical but with a slim dismissible top banner reading
"Achetez en confiance : votre argent est gardé par JP jusqu'à la livraison" and a
"Créer mon compte" link.
```

### 5. Backend
`GET /fil/accueil?curseur=` — sections ordonnées, charge utile minimale *(C2)*.

**Tests** : ordre respecté ; direct terminé absent ; pagination stable sous publication concurrente ; fil invité cohérent sans personnalisation ; performance sur un utilisateur suivant 200 comptes.

### 6. Frontend
Listes recyclées, images en substitut basse définition, préchargement limité en mode économie *(F0.9)*.

```issues
feature: F8.1
titre: Fil d'accueil, directs, à venir, replays, articles
epic: "08"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F7.2, F14.3]
```

---

## F8.3 — Filtres taille, couleur, marque, budget, catégorie

`P1 · S · complet` — **Règles** R-J1, R-J2

### 1. Conception

**Le filtre par taille est le plus utilisé du vestimentaire.** Il doit être **en premier et pré-rempli depuis le profil** *(F0.5, R-J1)*. Filtrer par budget est le second : afficher des fourchettes **en Ariary adaptées au marché**, pas des tranches génériques.

**Un filtre par taille doit filtrer sur la disponibilité réelle** : un article dont la taille M est épuisée ne doit pas apparaître dans un filtre « M », sinon le filtre ne sert à rien. Il s'appuie donc sur `disponible = stock − réservé` *(R-S2)*.

**Correspondance de tailles** : « 38 » et « M » doivent filtrer pareil quand ils désignent la même taille *(F0.5 §backend)*. Table de correspondance dans `packages/contracts`, sinon l'acheteuse doit deviner la convention de chaque vendeur.

### 2. Structure de code
```
apps/api/src/modules/catalogue/
├─ recherche.ts        filtres, tri, pagination
├─ tailles.ts          correspondance des conventions
└─ recherche.test.ts
apps/mobile/src/features/recherche/composants/{BarreFiltres,FeuilleFiltres}.tsx
```

### 3. Base de données
```sql
CREATE INDEX variante_disponible ON variante (taille, article_id)
  WHERE quantite_stock > quantite_reservee;
CREATE INDEX article_recherche ON article (categorie_id, prix_ariary)
  WHERE statut = 'en_ligne';
```

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — filter bar and filter sheet.
Frame A: a sticky filter bar above a product grid with chips in this order —
"Ma taille (M)" pre-selected and highlighted in the accent color, "Budget",
"Catégorie", "Couleur", "Marque" — followed by a result count "128 articles".
Frame B: the filter sheet opened on "Budget": a range slider with two handles
showing "10 000 – 80 000 Ar", plus quick-pick rows adapted to the local market
("Moins de 20 000 Ar", "20 000 – 50 000 Ar", "50 000 – 100 000 Ar", "Plus de
100 000 Ar"), each with a result count; a "Réinitialiser" text link and a
full-width primary button "Voir 128 articles".
Frame C: the size filter sheet showing two chip rows, "Lettres" (XS S M L XL) and
"Chiffres" (36 38 40 42 44), with a muted line "Nous montrons les deux : les
tailles se correspondent."
```

### 5. Backend
`GET /recherche?q=&taille=&prixMin=&prixMax=&categorie=&couleur=&marque=&tri=&curseur=`.

**Tests** : filtre par taille pré-rempli depuis le profil ; **article dont la taille filtrée est épuisée exclu** ; correspondance lettres/chiffres ; compteurs de résultats exacts par facette ; combinaison de cinq filtres ; pagination stable.

### 6. Frontend
Barre collante, taille en premier, compteur de résultats visible avant validation.

```issues
feature: F8.3
titre: Filtres taille, couleur, marque, budget, catégorie
epic: "08"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F0.5, F1.4]
```

---

## F8.2 — Recherche texte

`P1 · S · moyen`

**Conception** — recherche sur nom, description, marque, nom de boutique. **PostgreSQL en V1** : `tsvector` avec configuration `french`, plus une recherche par trigrammes (`pg_trgm`) pour tolérer les fautes de frappe — fréquentes sur un clavier de téléphone.

**Le malgache n'a pas de configuration `tsvector` native** : les termes malgaches sont indexés par trigrammes, ce qui suffit à cette échelle.

**Base de données** :
```sql
CREATE INDEX article_texte ON article USING gin (
  to_tsvector('french', nom || ' ' || coalesce(description,'') || ' ' || coalesce(marque,'')));
CREATE INDEX article_trigramme ON article USING gin (nom gin_trgm_ops);
```

**Backend** — `GET /recherche?q=` combinant les deux index, résultats groupés (articles, boutiques, créatrices, hashtags).

**Design** — Prompt Stitch : *search screen with a focused field, results grouped in sections "Articles", "Boutiques", "Créatrices", "Hashtags", each row compact with a thumbnail and a secondary line; plus a no-result state suggesting corrected spellings ("Vouliez-vous dire : robe wax ?") and popular categories.*

**Tests** : recherche exacte, avec faute de frappe, en malgache ; résultats groupés ; article masqué ou épuisé traité selon la règle ; performance sur 100 000 articles.

```issues
feature: F8.2
titre: Recherche texte
epic: "08"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F8.7 — Navigation par catégories

`P1 · S · moyen`

**Conception** — parcours de l'arbre de catégories *(F1.4)*, avec compteurs. Chemin d'entrée pour qui ne sait pas quoi chercher — c'est-à-dire la majorité.

**Backend** — `GET /categories` (arbre en cache), `GET /categories/:id/articles`.

**Design** — Prompt Stitch : *category browse screen with large illustrated tiles for top-level categories ("Femme", "Homme", "Enfant", "Chaussures", "Accessoires") each with an item count, then a drill-down list view with subcategory rows and counts, and a breadcrumb "Femme › Robes".*

**Tests** : arbre bilingue ; compteurs exacts ; catégorie vide → état utile.

```issues
feature: F8.7
titre: Navigation par catégories
epic: "08"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F1.4]
```

---

## F8.5 — Recommandations « à ma taille »

`P2 · S · moyen`

**Conception** — sélection d'articles **disponibles dans sa taille**, dans son budget, dans ses catégories. Réutilise l'ordonnancement de `F14.3` appliqué aux articles plutôt qu'aux contenus.

**Pas d'apprentissage automatique** : le filtre dur sur la taille disponible plus une pondération explicable suffisent, et restent corrigeables quand un vendeur se plaint.

**Backend** — `GET /recommandations/articles`.

**Design** — Prompt Stitch : *a home feed section titled "À votre taille" with a two-column grid, each tile carrying a small green chip "Disponible en M", and a header link "Modifier mes tailles".*

**Tests** : aucun article indisponible dans la taille du profil ; profil vide → section absente plutôt que vide.

```issues
feature: F8.5
titre: Recommandations à ma taille
epic: "08"
phase: P2
prio: S
etapes: [conception, design, backend, frontend]
depend: [F8.3, F14.3]
```

---

## F8.6 — Mise en avant sponsorisée dans le fil et la recherche

`P2 · S · moyen` — **Voir** F10.5

**Conception** — un direct ou un article payé apparaît en tête du fil ou des résultats, **signalé « Sponsorisé »**.

**La mention est obligatoire** *(F18.8, principes de conception)* : sur un produit dont l'actif est la confiance, une mise en avant non signalée découverte une fois abîme la crédibilité de tout le fil. C'est une contrainte, pas une option de configuration.

**Plafond de densité** : au maximum un élément sponsorisé toutes N positions. Un fil saturé de sponsorisé cesse d'être consulté, et la valeur de l'emplacement s'effondre avec lui.

**Base de données** — `mise_en_avant (id, cible_type, cible_id, budget, debut_le, fin_le, impressions, clics, statut)` *(F10.5)*.

**Backend** — injection dans `GET /fil/*` et `GET /recherche`, avec plafond de densité et comptage des impressions.

**Design** — Prompt Stitch : *a feed card identical to an organic one except for a small, clearly legible "Sponsorisé" label above the shop name — not hidden, not greyed into invisibility; plus a search results list with one sponsored row at the top carrying the same label.*

**Tests** : mention présente sur **tous** les emplacements sponsorisés ; plafond de densité respecté ; impressions et clics comptés ; budget épuisé → arrêt de la diffusion.

```issues
feature: F8.6
titre: Mise en avant sponsorisée dans le fil et la recherche
epic: "08"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F10.5]
```

---

## F8.4 / F8.8 — Tri et recherches récentes

`P1 · C · cadre`

**F8.4 — Tri** : nouveauté, prix croissant et décroissant, popularité, score vendeur *(F6.2)*. Le tri par défaut est la **pertinence** (filtre taille + fraîcheur + score), pas la nouveauté seule.

**F8.8 — Recherches récentes et suggestions** : historique local, suggestions au fil de la saisie depuis les termes fréquents.

**Impact base de données** — `recherche_frequente (terme, occurrences)` alimentée par agrégation ; historique **local**, pas serveur (donnée personnelle sans valeur d'exploitation).

```issues
feature: F8.4
titre: Tri nouveauté, prix, popularité, score vendeur
epic: "08"
phase: P1
prio: C
etapes: [conception, backend, frontend]
depend: [F8.3]
```
```issues
feature: F8.8
titre: Recherches récentes et suggestions
epic: "08"
phase: P1
prio: C
etapes: [conception, backend, frontend]
depend: [F8.2]
```

---

*Épique suivante : [EP09-statistiques](EP09-statistiques.md).*
