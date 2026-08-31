# EP11 — Le compte Admin JP

> 3 fonctionnalités · vague 2 · application `apps/admin`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).
> **Amont** : [`JP_DECISIONS_PRODUIT.md`](../docs/JP_DECISIONS_PRODUIT.md) — `DP-05`.

**Les files de travail humaines sont supprimées** *(`DP-05`)* : vérification, arbitrage, modération et réconciliation sont repris par des règles automatiques, ou n'ont plus d'objet. **Mais un compte d'exploitation subsiste** *(`DP-12`)* — sans lui, personne ne peut fixer un palier d'abonnement ni lire un rapport. **De 11 fonctionnalités, il en reste trois.**

> ### La frontière, en une phrase *(`DP-12`)*
>
> **L'Admin JP règle les règles ; il n'applique pas les règles.** Il fixe le
> seuil qui suspend, il ne suspend pas. Il fixe le palier, il ne facture pas.
>
> C'est ce qui préserve l'essentiel de `DP-05` : **aucune décision individuelle
> n'est prise par un humain**, donc aucune ne peut être arbitraire, négociée ou
> obtenue par relation.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F11.7 | **Tableau de bord des 4 mesures fondatrices** | P1 | M | complet |
| F11.6 | ♻️ **Paramètres — paliers, quotas, seuils** *(`DP-12`)* | P1 | M | complet |
| F11.9 | ♻️ **Journal d'audit consultable** *(`DP-12`)* | P1 | S | moyen |

> ### Dix fonctionnalités supprimées
>
> | | Motif |
> |---|---|
> | `F11.1` | File de vérification — vérification automatisée *(`UC-52`)* |
> | `F11.2` | Modération des contenus — filtre automatique + signalement *(F19.1)* |
> | `F11.3` | Console d'arbitrage — plus d'arbitre, et plus d'argent à trancher *(`DP-07`)* |
> | `F11.4` | Réseau de points relais *(`DP-04`)* |
> | `F11.5` | Réconciliation des espèces *(`DP-04`)* — il n'y a plus d'espèces |
> | ~~`F11.6`~~ | ♻️ **rétablie** *(`DP-12`)* — l'Admin configure les paliers, quotas et seuils |
> | `F11.8` | Recherche utilisateur / commande |
> | ~~`F11.9`~~ | ♻️ **rétablie** *(`DP-12`)* — un humain qui change un seuil doit laisser une trace nominative |
> | `F11.10` | Gestion des livreurs et des tournées *(`DP-04`)* |
> | `F11.11` | Notifications de masse |

> ✅ **Vérification faite** *(`PO-4`)* : **aucune des quatre mesures ne dépend du séquestre.** Elles portent sur la conversion en direct, le temps administratif, l'abandon au paiement et le stock immobilisé — toutes valides telles quelles. Seules **les hypothèses secondaires** changent *(voir §1)*.

---

## F11.7 — Tableau de bord des quatre mesures fondatrices

`P1 · M · complet` — **Règles** R-O2, exigence contractuelle · **À livrer avant le premier direct du pilote**

### 1. Conception

**Ce n'est pas un tableau de bord d'analyse, c'est l'instrument de mesure du projet** *(R-O2)*. Il doit exister **dès le premier direct**, sinon l'objectif de mesure n'est pas atteint et le pilote ne prouve rien.

**Les quatre mesures fondatrices** :

| # | Mesure | Source |
|---|---|---|
| 1 | **Commandes annoncées en direct jamais conclues** | réservations expirées et abandons en direct |
| 2 | **Temps administratif par heure de direct** | temps entre fin de direct et dernière expédition |
| 3 | **Acheteuses ayant abandonné à l'étape paiement** | `paiement_abandonne` + étape *(CDC §11)* |
| 4 | **Stock immobilisé par des réservations expirées** | somme des montants des réservations expirées |

**Plus les hypothèses à valider** : taux de conversion, panier moyen, **taux de signalement** *(`R-T8`)*, **abonnements actifs par palier** *(`DP-08`)*, coût d'acquisition, **part du chiffre d'affaires hors direct** *(R-H2, nouveau)*, **taux de refus au paiement à la livraison** *(F4.3)*, **taux de production d'unboxings** *(F14.7)*.

**Le point de conception** : ces mesures ne se calculent pas après coup. Elles supposent que les **événements d'usage soient instrumentés dès le premier jour** *(CDC §11)*. C'est pourquoi cette fonctionnalité est en tête de l'épique : elle définit ce que les autres modules doivent émettre.

### 2. Structure de code

```
apps/api/src/modules/exploitation/
├─ mesures.ts        les 4 mesures fondatrices, définitions figées
├─ hypotheses.ts     les indicateurs secondaires
├─ evenements.ts     réception et stockage des événements d'usage
├─ routes.ts         GET /admin/indicateurs
└─ mesures.test.ts   ← cas de référence pour chaque mesure
apps/api/src/jobs/agregatsQuotidiens.ts
apps/admin/src/pages/indicateurs/{Fondatrices,Hypotheses,ParOrigine}.tsx
```

`mesures.ts` porte une **définition écrite** de chaque mesure en commentaire. Une mesure dont la définition dérive en cours de pilote ne mesure plus rien.

### 3. Base de données

Migration `..._f11_7_mesures` :

```
evenement_usage
  id PK · type · utilisateur_id null · donnees jsonb · horodatage
  IDX(type, horodatage)
  -- append only, purgé après agrégation (rétention 90 j)

agregat_quotidien
  jour PK · mesure PK · valeur numeric · denominateur numeric null
  PK(jour, mesure)
```

Les mesures sont **agrégées quotidiennement** et non recalculées à chaque affichage : le tableau de bord doit s'ouvrir instantanément, y compris au pic.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen — admin dashboard, "Les quatre mesures" (desktop web, data-dense but calm).
Top: a period selector "7 jours · 30 jours · Depuis le lancement" and a
last-updated line.
A 2x2 grid of four large measure cards, each with: the measure name, a very large
current value, a small sparkline of the last 14 days, a delta chip versus the
previous period (green or red), and a one-line plain-language definition in muted
text. The four cards read:
1. "Ventes annoncées jamais conclues" — "12 %" — "Réservations expirées ou
paiements abandonnés en direct".
2. "Temps administratif par heure de direct" — "38 min" — "Entre la fin du direct
et la dernière expédition".
3. "Abandons à l'étape paiement" — "8 %" — "Ont ouvert le paiement sans le
terminer".
4. "Stock immobilisé" — "340 000 Ar" — "Valeur des réservations expirées en cours".
Below the grid, a secondary section "Hypothèses à valider" as a compact table with
rows: Taux de conversion, Panier moyen, Domicile / Relais, Taux de litige, Part du
CA hors direct, Refus au paiement à la livraison, Production d'unboxings — each
with the current value, the hypothesis stated at launch, and a status chip
"Confirmée / À surveiller / Infirmée".
Use a restrained palette: this screen is read every morning, it must not shout.
```

### 5. Backend

`GET /admin/indicateurs?periode=` — les quatre mesures et les hypothèses. `POST /evenements-usage` (interne, depuis les clients, par lots).

**Tests** : chaque mesure vérifiée sur un **jeu de données de référence** avec le résultat attendu calculé à la main ; agrégation quotidienne idempotente ; les événements d'usage ne bloquent jamais un parcours (envoi asynchrone, échec silencieux côté client) ; purge après 90 jours sans perte d'agrégat.

### 6. Frontend

`apps/admin` : quatre cartes, une définition visible sous chaque chiffre. La définition affichée en permanence est ce qui empêche les interprétations divergentes en réunion.

```issues
feature: F11.7
titre: Tableau de bord des 4 mesures fondatrices
epic: "11"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F11.6 — Paramètres : paliers, quotas, seuils ♻️

`P1 · M · complet` — **Règles** R-O1, R-O4 · **Décisions** `DP-08`, `DP-12` · **Bloque** `F10.3`, `F6.8`

### 1. Conception

**Sans cet écran, personne ne peut ouvrir les inscriptions boutique.** Les paliers d'abonnement, les quotas de ventes et de directs, les seuils de suspension : tout cela est **du réglage, pas du code** *(`R-O1`)*.

| Famille | Paramètres |
|---|---|
| **Abonnement** *(`DP-08`)* | Paliers, prix mensuel, quota de ventes, quota de directs ⚠️ *(`PO-6`)* |
| **Signalement** *(`R-T8`)* | Seuil `N` du niveau 1, motifs par niveau, preuve minimale aux niveaux 2 et 3 ⚠️ *(`PO-12`)* |
| **Réservation** | Durée en direct, durée hors direct, **durée pendant la négociation d'un cadeau** *(`PO-10`)* |
| **Clôture** | Délai de confirmation automatique *(`R-E4`)*, fenêtre d'attribution d'affiliation *(`R-N2`)* |

> ### 🔒 Double validation, et cette fois elle est indispensable
>
> **Proposé par un compte Admin, confirmé par un autre** *(`R-O1`, table
> `parametre_modification`)*.
>
> `DP-05` l'avait retirée faute de deux opérateurs. `DP-12` la rétablit pour une
> raison plus forte qu'avant : **un compte unique pouvant modifier seul le seuil
> de suspension couperait toutes les boutiques du pays d'un seul geste.** C'est
> un point de défaillance unique, et **une cible**.

**Bornes codées, jamais paramétrables** : une durée de réservation à 0 s, un seuil de suspension à 1 signalement de niveau 1, un quota gratuit à 0 vente — tout cela doit être **impossible à saisir**, pas seulement déconseillé.

### 2. Structure de code

```
apps/api/src/modules/exploitation/
├─ parametres.ts          lecture typée, bornes codées
├─ modification.ts        proposition → confirmation par un AUTRE compte
└─ parametres.test.ts
apps/admin/src/pages/parametres/{Liste,Modification}.tsx
```

### 3. Base de données

`parametre` *(clé, valeur, type, borne_min, borne_max)* · `parametre_modification` *(propose_par_id, confirme_par_id, ancienne_valeur, nouvelle_valeur)*.

```sql
ALTER TABLE parametre_modification ADD CONSTRAINT deux_comptes_distincts
  CHECK (confirme_par_id IS NULL OR confirme_par_id <> propose_par_id);
```

**C'est la contrainte qui traduit `R-O1` en base** : on ne peut pas confirmer sa propre proposition.

### 4. Design

```
Screen — parameters (desktop). A table grouped by family (Abonnement,
Signalement, Réservation, Clôture): parameter name, current value, min/max
bounds shown as muted text, last change date and author. Editing opens a panel
showing OLD value beside NEW value, the coded bounds, and a red line "Cette
modification devra être confirmée par un autre compte avant de prendre effet."
Pending changes appear at the top in an amber band with "Proposé par … — en
attente de confirmation" and, for the other admin, two buttons "Confirmer" and
"Refuser".
```

### 5. Backend

`GET /admin/parametres` · `POST /admin/parametres/:cle/proposition` · `POST /admin/parametres/modifications/:id/confirmation`.

**Tests** : une valeur hors bornes → refusée ; **une confirmation par le compte qui a proposé → refusée par la base** ; le paramètre ne change qu'à la confirmation ; toute modification écrit au `journal_audit` avec l'ancienne et la nouvelle valeur.

### 6. Frontend

La valeur en vigueur et la valeur proposée sont **affichées côte à côte**. Un écran qui ne montre que la nouvelle valeur fait confirmer à l'aveugle.

```issues
feature: F11.6
titre: Paramètres — paliers, quotas et seuils, avec double validation
epic: "11"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F11.9 — Journal d'audit consultable ♻️

`P1 · S · moyen` — **Règles** R-O4, R-V5 · **Décision** `DP-12`

**Conception** — la table `journal_audit` existe depuis le socle et est `append only` *(`D3`)*. Ce qui revient, c'est **l'écran qui la lit** : qui a changé quel paramètre, quand, avec l'ancienne et la nouvelle valeur — et **quel accès a été fait aux pièces d'identité** *(`R-V5`)*.

**Ce que le journal ne contient plus** : les décisions d'arbitrage et les instructions de dossier *(`DP-05`)*. Il ne reste que **la configuration et les accès aux données sensibles** — c'est-à-dire exactement les deux choses qu'un humain fait encore.

**Base** — aucune table nouvelle. `REVOKE UPDATE, DELETE ON journal_audit`.

**Backend** — `GET /admin/journal?depuis=&acteur=&type=` avec pagination par curseur.

**Design** — Prompt Stitch : *audit log table with columns Date, Compte, Action, Objet, Ancienne valeur, Nouvelle valeur; rows are never editable and the page states so explicitly: "Ce journal ne peut être ni modifié ni effacé."*

**Tests** : `UPDATE` et `DELETE` **rejetés par la base** ; tout changement de paramètre y figure avec ses deux valeurs ; tout accès à un `document_identite` y figure nominativement.

```issues
feature: F11.9
titre: Journal d'audit consultable, inaltérable
epic: "11"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F11.6]
```

---

