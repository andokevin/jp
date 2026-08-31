# EP10 — Monétisation : la boutique choisit son mode

> 5 fonctionnalités · **vague 1** pour `F10.3` · modules `paiement`, `exploitation`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).
> **Amont** : [`JP_DECISIONS_PRODUIT.md`](../docs/JP_DECISIONS_PRODUIT.md) — `DP-08`.

**La boutique choisit à l'inscription, et peut changer** *(`DP-15`)* : **abonnement mensuel** — elle encaisse 100 % — ou **commission** — JP retient un pourcentage avant de reverser.

**C'est l'éclatement qui rend la commission de nouveau possible** *(`DP-16`)* : JP est crédité de sa part **en même temps que le vendeur**, il n'a rien à récupérer après coup. `DP-08` l'écartait pour cette seule raison technique, qui a disparu.

> ### Le choix devient un instrument de mesure
>
> Cette épique posait : *« à partir de quel taux la boutique cherche-t-elle à
> contourner la plateforme ? »* — **une question de survie du modèle**.
>
> `DP-08` l'avait annulée : sans commission, aucun intérêt à conclure ailleurs.
> **`DP-15` la fait revenir, mais seulement pour les boutiques en commission.**
> Celles en abonnement n'ont toujours aucun intérêt à contourner.
>
> **Le taux de contournement se compare donc entre les deux populations** — et
> c'est exactement l'expérience que le pilote devait faire. Ce qui était une
> question ouverte devient **une mesure**.

**Ce qui n'a pas changé** : **aucun montant n'est ajouté au prix affiché** *(`R-B1`)*, dans les deux modes. En commission, JP **retient** sur ce que la boutique reçoit ; il n'ajoute rien à ce que l'acheteuse paie. **On ne facture pas des frais de service à l'acheteur après lui avoir retiré le service** — ce point-là tient toujours.

**Pourquoi l'abonnement tient psychologiquement.** Une commission se ressent à **chaque** vente ; un abonnement, **une fois par mois**. *« Tout ce que je vends est à moi »* est une phrase que personne ne conteste. Côté acheteur, le prix affiché est le prix réel : aucun frais ajouté à l'étape finale, **premier tueur de conversion** *(`R-P2`)*.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| **F10.3** | **Paliers d'abonnement, dont un gratuit** | **P1** | **M** | complet |
| F10.4 | ~~Comptes multi-utilisateurs~~ ❌ *(`DP-01`)* | — | — | — |
| F10.5 | Achat d'une mise en avant | P2 | S | moyen |
| F10.6 | Direct premium | P3 | W | cadre |
| F10.7 | Espace partenaire marque | P3 | W | cadre |
| F10.8 | Insights marché vendus aux marques | P3 | W | cadre |
| F10.1 | ♻️ **Commission créditée par l'éclatement** *(`DP-15`, `DP-16`)* | P1 | M | complet |
| F10.2 | ♻️ **Barème de commission, historisé** ⚠️ *(`DP-15`)* | P1 | M | complet |
| ~~F10.4~~ | ~~Comptes multi-utilisateurs et permissions~~ ❌ *(`DP-01`)* — l'employé n'existe plus | — | — | — |

> ⚠️ **Montants et quotas non arrêtés** *(`PO-6`)*. Ils bloquent l'ouverture des
> inscriptions boutique **et** la migration 20. C'est désormais **la décision
> économique la plus urgente du projet**, puisqu'il n'y a plus de taux de
> commission à trancher.

---

## F10.3 — Paliers d'abonnement boutique

`P2 · S · moyen`

**Conception** — paliers dont **un gratuit**. Le palier gratuit n'est pas une concession commerciale : sans lui, aucun boutique ne commence, et le catalogue reste vide.

**Ce qui peut différencier les paliers**, par ordre de valeur perçue décroissante : commission réduite, mises en avant incluses *(F10.5)*, rediffusion Facebook *(F2.21)*, direct de plus longue durée *(F10.6)*, statistiques avancées.

**Ce qui ne doit jamais être derrière un palier** : la vérification, **le badge**, **l'accès au signalement**, **l'affichage du score**, la participation aux événements *(R-W12)*. **La règle s'est durcie avec `DP-07`** — la protection de l'acheteuse étant désormais la réputation seule, un palier qui la modulerait vendrait le dernier rempart. Tout ce qui relève de la **confiance** reste gratuit, sinon le positionnement du produit s'effondre.

**Base de données** — `abonnement_boutique (boutique_id, palier, debut_le, fin_le, paiement_id)`, `bareme_commission.palier_abonnement` *(F10.2)*.

**Backend** — `GET /abonnements/paliers`, `POST /boutique/abonnement`, prélèvement récurrent depuis le portefeuille.

**Design** — Prompt Stitch : *pricing screen with three stacked plan cards (Gratuit, Pro, Boutique+), each listing four included features with check icons and the excluded ones greyed, the monthly price in Ariary, the current plan marked "Votre palier", and a footer line "La vérification, le badge et le signalement sont inclus dans tous les paliers, y compris gratuit."*

**Tests** : **palier gratuit pleinement fonctionnel** *(`R-B3`)* ; **quota atteint → publication et direct refusés, catalogue et commandes en cours intacts** *(`R-B4`)* ; abonnement impayé → même traitement ; **aucun montant n'est ajouté au prix ni déduit du versement** *(`R-B1`)*. *(Ancien test, sans objet : commission réduite appliquée aux nouvelles ventes ; échéance non payée → **retour au palier gratuit**, jamais de suspension de la boutique ; les fonctionnalités de confiance restent accessibles en gratuit.

```issues
feature: F10.3
titre: Paliers d'abonnement boutique, dont un gratuit
epic: "10"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.14]
```

---

## F10.5 — Achat d'une mise en avant

`P2 · S · moyen` — **Voir** F8.6

**Conception** — « Mettre en avant ce direct » ou cet article → budget, durée → paiement **depuis son portefeuille** *(F4.8)* → apparition en haut du fil, **signalée « Sponsorisé »** *(F8.6, F18.8)*.

La mention « Sponsorisé » est **obligatoire** et lisible : elle protège la confiance, qui est l'actif du produit.

**La boutique doit voir ce qu'elle achète** : impressions, clics, et **ventes générées** — pas seulement un budget consommé. Une mise en avant dont on ne mesure pas le retour ne sera pas rachetée.

**Base de données** — `mise_en_avant (id, boutique_id, cible_type, cible_id, budget, budget_consomme, debut_le, fin_le, impressions, clics, ventes, statut)`.

**Backend** — `POST /boutique/mises-en-avant` **(paiement mobile money — il n'y a plus de portefeuille, `DP-07`)**, injection au fil *(F8.6)*, arrêt à budget épuisé.

**Design** — Prompt Stitch : *promote screen with the target preview (a live or product card), a budget selector with three preset chips "5 000 · 15 000 · 30 000 Ar" and an estimated-reach line "≈ 1 200 à 2 000 personnes", a duration selector, a wallet balance row "Disponible : 347 000 Ar", and a primary button "Mettre en avant"; plus a results screen with four figures (impressions, clics, ventes, CA généré) and a plain verdict line "Vous avez dépensé 15 000 Ar et généré 84 000 Ar de ventes."*

**Tests** : paiement mobile money abouti avant activation ; budget épuisé → arrêt ; mention « Sponsorisé » présente ; ventes attribuées à la mise en avant ; portefeuille insuffisant → refus clair.

```issues
feature: F10.5
titre: Achat d'une mise en avant produit ou direct
epic: "10"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F4.8, F8.6]
```

---

## F10.6 / F10.7 / F10.8 — Direct premium, espace marque, insights

`P3 · W · cadre`

**F10.6 — Direct premium** : durée étendue, meilleure qualité, co-animation *(F2.17)*. Dépend d'abord du coût réel de la diffusion vidéo — c'est le poste le plus incertain du budget *(CDC §7.3)*, et il faut le connaître avant de vendre une option qui l'augmente.

**F10.7 — Espace partenaire marque** : voir `F18.6`. Le mécanisme rentable de la publicité à cette échelle est **la campagne mesurée jusqu'à la vente**, pas l'impression au CPM.

**F10.8 — Insights marché anonymisés vendus aux marques** : quelles tailles, quelles couleurs, quels prix se vendent, par zone. **Le point à trancher avant toute conception** : l'anonymisation doit être réelle et démontrable — des agrégats à faible effectif permettent de réidentifier une boutique ou une acheteuse. Seuil minimal d'effectif par agrégat, et aucune donnée nominative, jamais. Sur un produit dont l'actif est la confiance, vendre de la donnée mal anonymisée serait la faute la plus coûteuse possible.

```issues
feature: F10.6
titre: Direct premium, durée étendue et co-animation
epic: "10"
phase: P3
prio: W
etapes: [conception, backend, frontend]
depend: [F10.3, F2.17]
```
```issues
feature: F10.7
titre: Espace partenaire marque
epic: "10"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F18.6]
```
```issues
feature: F10.8
titre: Insights marché anonymisés vendus aux marques
epic: "10"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F9.1]
```

---

*Épique suivante : [EP12-assistant](EP12-assistant.md).*

## F10.1 / F10.2 — Commission et barème ♻️

`P1 · M · complet` — **Règles** R-G1, R-G3, R-B1, R-B5 · **Décisions** `DP-15`, `DP-16` · **⚠️ décision économique n° 1 : le taux**

### 1. Conception

**En mode commission, JP est crédité de sa part directement, comme une patte de l'éclatement** *(`F4.14`, `DP-16`)*. **Il ne la récupère pas après coup : elle lui est versée en même temps qu'au vendeur.** C'est ce qui la rend gratuite à collecter — et c'est précisément ce qui la rendait impossible sous `DP-08`.

**La boutique voit la commission avant de mettre en ligne, et sur chaque commande, en clair** *(`R-G1`)* :

> *« Vente 50 000 Ar — commission 2 500 Ar — vous recevez 47 500 Ar »*

- **`R-G3`** — le barème est **historisé** et **figé à la commande**. Un changement de taux ne rétroagit **jamais**.
- **`R-B5`** — **un changement de mode ne rétroagit pas non plus.** Les commandes déjà passées gardent le mode et le taux en vigueur à leur création.
- **`R-B1`** — **rien n'est ajouté au prix affiché.** JP retient sur ce que la boutique reçoit ; l'acheteuse paie le prix de la boutique, point.

> ### ⚠️ Le taux redevient la décision économique n° 1
>
> *« À partir de quel taux la boutique cherche-t-elle à contourner la
> plateforme ? »* — la question de survie du modèle, que `DP-08` avait annulée
> et que `DP-15` fait revenir.
>
> **Mais elle revient sous une forme mesurable** : seules les boutiques en
> commission ont un intérêt à contourner. **Le taux de contournement se compare
> entre les deux populations.** Ce qui était une hypothèse à valider devient une
> expérience à conduire, avec son groupe témoin intégré.

### 2. Structure de code

```
apps/api/src/modules/paiement/
├─ partJp.ts           calcul de la patte JP, au taux FIGÉ de la commande
├─ bareme.ts           versions historisées, jamais modifiées en place
└─ retenue.test.ts     ← l'arrondi, et la non-rétroactivité
```

**L'arrondi est nommé par son bénéficiaire** *(`@jp/money`)* : `commissionSur` arrondit **vers le bas**, jamais vers JP. **La somme des pattes égale le débit**, au centime.

### 3. Base de données

`bareme_commission` *(rétablie)* : `taux_pour_mille`, `debut_le`, `fin_le` — **jamais d'`UPDATE`**, une nouvelle version à chaque changement.
`commande` retrouve **`taux_commission_pour_mille`** et **`mode_remuneration`**, **figés à la création**.

```sql
ALTER TABLE commande ADD CONSTRAINT taux_fige
  CHECK (mode_remuneration <> 'commission' OR taux_commission_pour_mille IS NOT NULL);
```

### 4. Design

```
Screen — earnings settings. Two large mutually-exclusive cards: "Abonnement —
vous encaissez 100 %, vous payez un forfait mensuel" and "Commission — rien
d'avance, JP retient X % sur chaque vente". The active one is outlined. Below,
a worked example on a real item from the shop's catalogue: "Robe wax bleue,
50 000 Ar → vous recevez 47 500 Ar" recomputed live when the mode changes.
A muted line under the switch: "Le changement ne s'applique qu'aux commandes
à venir." (R-B5)
```

**L'exemple chiffré sur un article réel de la boutique** est le point de l'écran : un pourcentage abstrait ne se décide pas, un montant en Ariary si.

### 5. Backend

`GET /boutique/remuneration` · `POST /boutique/remuneration` `{ mode }` · le calcul de la patte JP est appelé par `F4.14`, jamais ailleurs.

**Tests** : la commission est calculée au **taux figé de la commande**, pas au taux courant ; un changement de barème ne touche **aucune** commande existante ; un changement de mode non plus *(`R-B5`)* ; l'arrondi va **vers la boutique** ; **en mode abonnement, il n'y a pas de patte JP du tout** — un seul crédit.

### 6. Frontend

La commission est affichée **avant la mise en ligne** et **sur chaque commande**. Une commission découverte après coup est **la première cause de départ d'une boutique** — c'est la règle qui gouverne cette épique, et elle n'a pas changé.

```issues
feature: F10.1
titre: Commission créditée par l'éclatement du paiement
epic: "10"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.14]
```
```issues
feature: F10.2
titre: Barème de commission historisé et figé à la commande
epic: "10"
phase: P1
prio: M
etapes: [conception, bdd, backend, frontend]
depend: [F10.1]
```

---

