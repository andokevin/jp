# EP09 — Statistiques vendeur

> 7 fonctionnalités · vague 3 · module `exploitation`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**Le principe de l'épique** : on ne montre pas au vendeur ce qu'il a fait, on lui montre **ce qu'il doit décider**. L'information la plus actionnable, et la plus demandée par les vendeurs réels : **quelles tailles racheter**.

**Ce qui différencie ces écrans d'un tableau de bord ordinaire** : chaque chiffre est accompagné de l'action qu'il suggère. Un chiffre d'affaires sans comparaison ni suite n'est qu'un compteur.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F9.1 | Tableau de bord jour, semaine, mois | P1 | S | complet |
| F9.2 | Performance par direct | P1 | S | moyen |
| F9.3 | Performance par article | P2 | S | moyen |
| F9.4 | Entonnoir spectateurs → payé | P2 | S | moyen |
| F9.5 | Export des ventes | P2 | C | cadre |
| F9.6 | Comparaison avec la période précédente | P2 | C | cadre |
| F9.7 | Heures et jours les plus rentables | P3 | C | cadre |

---

## F9.1 — Tableau de bord jour, semaine, mois

`P1 · S · complet` — **Dépend de** F3.7, F4.9

### 1. Conception

Chiffre d'affaires, nombre de commandes, panier moyen, commissions, articles les plus vendus, **tailles qui partent en premier**, ventilation **par origine** *(R-H2)*.

**L'information la plus actionnable, et il faut qu'elle soit la plus visible** : quelles tailles racheter. Un vendeur qui importe des vêtements décide chaque mois de son assortiment ; c'est la seule décision où le produit peut lui faire gagner de l'argent directement.

**L'employé** *(VE)* : accès en lecture seule, **sans les montants**, si le vendeur le décide *(F10.4, R-R8)*. Même règle que pour la liste de clientes : la projection **omet** les champs de montant, elle ne les masque pas.

**Ventilation par origine** : elle répond à la question stratégique du produit — la vente hors direct tient-elle sa promesse ? *(F1.19, F11.7)*

### 2. Structure de code
```
apps/api/src/modules/exploitation/
├─ statistiquesVendeur.ts     agrégats par période, par origine, par taille
└─ statistiquesVendeur.test.ts
apps/api/src/jobs/agregatsVendeur.ts        agrégation quotidienne
apps/mobile/src/features/tableau-bord/
├─ ecrans/EcranTableauBord.tsx
└─ composants/{CarteChiffre,GraphePeriode,TopTailles,VentilationOrigine}.tsx
```

### 3. Base de données
```
agregat_vendeur
  vendeur_id FK · jour · origine
  ca int · nb_commandes int · panier_moyen int · commissions int
  PK(vendeur_id, jour, origine)
```
Agrégats **quotidiens précalculés** : sur un pic de direct, recalculer à chaque ouverture du tableau de bord serait coûteux et inutile.

### 4. Design
**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :
```
Screen — "Mes ventes" (seller dashboard).
Vertical order: a period selector "Aujourd'hui · 7 jours · 30 jours" with
"7 jours" active; a hero card with the largest figure on the screen "1 240 000 Ar"
labelled "Chiffre d'affaires" and a green delta "+18 % vs semaine précédente";
a three-stat row "24 commandes · panier moyen 51 600 Ar · commissions 62 000 Ar";
a simple bar chart of the seven days; then a highlighted, bordered card titled
"À racheter en priorité" — the most important block of the screen — listing three
rows with a garment thumbnail, the size in bold, and the fact: "Robe wax · taille
M · partie en 4 min", "Jupe plissée · taille L · 6 demandes sans stock",
"Chemisier · taille 40 · rupture depuis 3 jours", each with a "Réapprovisionner"
link; then a split card "Vos ventes viennent de" with two rows and percentages
"En direct 62 % · Catalogue 38 %".
Produce an employee variant where every amount is replaced by a grey padlock chip
"Masqué", the hero card shows the order count instead of the revenue, and the
"À racheter" card remains fully visible — the employee needs it to prepare stock.
```

### 5. Backend
`GET /vendeur/statistiques?periode=` — projection **selon la permission** de l'appelant.

**Tests** : agrégats exacts sur un jeu de référence ; ventilation par origine correcte ; tailles les plus demandées incluant les **demandes sans stock** *(F7.4)* ; **employé → aucun champ de montant dans la réponse** (assertion sur les clés) ; agrégation quotidienne idempotente.

### 6. Frontend
Le bloc « À racheter en priorité » est **visuellement au-dessus** du graphique. C'est un choix : le graphique se regarde, la liste s'utilise.

```issues
feature: F9.1
titre: Tableau de bord jour, semaine, mois
epic: "09"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F3.7, F4.9]
```

---

## F9.2 — Performance par direct

`P1 · S · moyen` — **Voir** F2.15

**Conception** — reprend le bilan de fin de direct *(F2.15)* et l'inscrit dans une **série** : comparaison entre directs, évolution du taux de conversion, du pic d'audience, du panier moyen.

**Le chiffre le plus utile n'est pas le chiffre d'affaires du soir, c'est sa tendance** : un vendeur qui voit ses cinq derniers directs alignés comprend ce qui marche.

**Base de données** — `direct_bilan` *(F2.15)*, requêtes par série.

**Backend** — `GET /vendeur/directs/performance?periode=`.

**Design** — Prompt Stitch : *a list of past lives, each row showing the date, duration, viewers, revenue and a conversion chip, with a small sparkline at the top showing the revenue trend across the last 10 lives, and a "Comparer" mode allowing two lives to be shown side by side with their key figures.*

**Tests** : série correcte ; direct sans vente inclus ; comparaison de deux directs.

```issues
feature: F9.2
titre: Performance par direct
epic: "09"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F2.15]
```

---

## F9.3 — Performance par article

`P2 · S · moyen`

**Conception** — par article : vues, ajouts au panier, ventes, taux de conversion, **réservations expirées**, et **chat sans vente** *(F2.15)* — signal de prix trop haut.

**Les deux derniers indicateurs sont les plus intéressants** parce qu'ils expliquent une absence de vente, ce qu'aucun compteur de ventes ne fait.

**Base de données** — `statistique_article (article_id, jour, vues, paniers, ventes, expirees, messages)`.

**Backend** — `GET /vendeur/articles/:id/performance`.

**Design** — Prompt Stitch : *per-article performance sheet with a funnel (vues → paniers → ventes) as three bars with conversion rates, then two diagnostic cards: an amber one "12 messages, 0 vente — votre prix est peut-être trop haut" with a "Modifier le prix" link, and a grey one "5 réservations expirées — vos clientes n'ont pas fini de payer".*

**Tests** : entonnoir cohérent ; diagnostic déclenché sur les bons seuils.

```issues
feature: F9.3
titre: Performance par article
epic: "09"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F9.1]
```

---

## F9.4 — Entonnoir spectateurs → « Je prends » → payé

`P2 · S · moyen`

**Conception** — l'entonnoir du direct, aligné sur les mesures fondatrices *(F11.7)* : spectateurs → feuille ouverte → « Je prends » → paiement lancé → paiement confirmé. Chaque étage nomme la **perte** et non seulement le passage.

**Le chiffre qui compte pour le vendeur** : où il perd des acheteuses. Un entonnoir qui n'indique pas la marche la plus haute ne sert à rien.

**Base de données** — depuis `evenement_usage` *(F11.7)*.

**Backend** — `GET /vendeur/entonnoir?periode=&directId=`.

**Design** — Prompt Stitch : *funnel visualisation with five decreasing bars, each labelled with a count and, in red under the bar, the loss ("−72 % ici") ; the largest drop-off step is highlighted with a bordered callout card naming a likely cause and an action, e.g. "La plupart abandonnent au paiement — proposez le paiement à la réception".*

**Tests** : entonnoir cohérent avec les mesures fondatrices ; identification correcte de la plus grande perte.

```issues
feature: F9.4
titre: Entonnoir spectateurs vers Je prends vers payé
epic: "09"
phase: P2
prio: S
etapes: [conception, design, backend, frontend]
depend: [F11.7]
```

---

## F9.5 / F9.6 / F9.7 — Export, comparaison, heures rentables

`P2 · C` / `P3 · C` · `cadre`

**F9.5 — Export des ventes** : tableur (CSV) par période, avec commissions et remises, pour la comptabilité du vendeur. À rapprocher de l'export de factures *(F4.11)* : un seul point d'export plutôt que deux.

**F9.6 — Comparaison avec la période précédente** : déjà présente sur les cartes de `F9.1` ; cette fonctionnalité l'étend à tous les écrans de statistiques. **Une comparaison sans période équivalente comparable est trompeuse** — un mois avec un événement *(F20.8)* ne se compare pas à un mois ordinaire, et il faut le signaler.

**F9.7 — Heures et jours les plus rentables** : agrégation par créneau. Utile surtout pour choisir l'heure d'un direct ou d'un rendez-vous récurrent *(F17.4)* — c'est là que l'information devient une action.

```issues
feature: F9.5
titre: Export des ventes en tableur
epic: "09"
phase: P2
prio: C
etapes: [conception, backend, frontend]
depend: [F9.1]
```
```issues
feature: F9.6
titre: Comparaison avec la période précédente
epic: "09"
phase: P2
prio: C
etapes: [conception, backend, frontend]
depend: [F9.1]
```
```issues
feature: F9.7
titre: Heures et jours les plus rentables
epic: "09"
phase: P3
prio: C
etapes: [conception, backend, frontend]
depend: [F9.1]
```

---

*Épique suivante : [EP10-monetisation](EP10-monetisation.md).*
