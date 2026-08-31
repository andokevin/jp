# EP05 — Livraison

> 4 fonctionnalités · vague 2 · module `livraison`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).
> **Amont** : [`JP_DECISIONS_PRODUIT.md`](../docs/JP_DECISIONS_PRODUIT.md) — `DP-04`.

**JP n'opère plus aucune logistique** *(`DP-04`)*. La boutique fait parvenir le colis par le moyen de son choix — son coursier, un transporteur, une remise en main propre. **JP ne fournit que la frise de statuts, les notifications et la confirmation de réception.**

**L'application terrain est supprimée** *(`DP-01`)* : il n'y a plus ni livreur ni point relais.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F5.2 | Statuts de livraison partagés | P1 | M | complet |
| F5.1 | Bordereau de préparation | P1 | M | complet |
| **F5.11** | 🆕 **Fil de remise** *(`DP-10`)* | P1 | M | complet |
| F5.9 | Estimation du délai avant l'achat | P1 | S | moyen |

> ### Six fonctionnalités supprimées
>
> | | Motif |
> |---|---|
> | `F5.3` `F5.4` `F5.10` | Réseau de relais, code de retrait, application relais — `DP-04` |
> | `F5.5` | Application livreur — `DP-04` |
> | `F5.6` | Regroupement des colis — la boutique regroupe si elle veut, JP ne l'organise pas |
> | `F5.7` `F5.8` | Échec de livraison, retour pour cause de taille — se règlent entre la boutique et l'acheteur ; **JP n'exécute aucun mouvement d'argent** *(`DP-07`, `R-T3`)* |

> ### ⚠️ Le point faible assumé
>
> **La déclaration d'expédition n'est vérifiée par personne** *(`R-L9`)*. Aucun tiers neutre ne constate la remise. Une boutique qui marque « Expédiée » sans expédier n'est arrêtée que par le signalement de l'acheteuse et son effet sur le score *(`R-T8`)*. **C'est la perte la plus lourde de la refonte** — l'ancienne `preuve_remise_url` n'a aucun remplaçant.

---

## F5.2 — Statuts de livraison partagés des deux côtés

`P1 · M · complet` — **Règles** R-L3, R-L4, R-L9 · **Décision** `DP-04` · **Bloque** toute l'épique

### 1. Conception

Statuts communs : `Payée → En préparation → Expédiée → Livrée → Confirmée` *(R-L3)*.

- **A** : voit une frise dans sa commande, **avec notification à chaque changement** *(R-L4)*. C'est la réponse directe au « plus de nouvelles » qui fait le procès des ventes Facebook — **et c'est tout ce qui survit du domaine livraison**.
- **B** : **fait avancer tous les statuts elle-même.** Il n'y a plus de `L` ni de `PR` pour les mettre à jour *(`DP-01`)*.

**Le point de conception** : un seul jeu de statuts, **identique des deux côtés**. Des statuts internes différents de ceux montrés à l'acheteuse produisent immanquablement des désaccords (« mais elle dit que c'est expédié »).

**Machine à états de l'expédition** :
```
EN_PREPARATION → EXPEDIEE → LIVREE → CONFIRMEE
```

**Quatre états, une seule branche.** L'ancienne machine en comptait huit avec `AU_RELAIS`, `ECHEC_LIVRAISON` et `RETOUR_VENDEUR` — tous liés à une logistique que JP n'opère plus.

Chaque transition produit un `evenement_livraison` horodaté et attribué. **L'attribution servait à rendre l'arbitrage possible ; l'arbitrage a disparu** *(`DP-05`)* — **la trace reste**, et c'est elle qu'on fournit quand le recours de l'acheteuse est externe *(`DP-07`)*.

> ### ⚠️ Ce que personne ne vérifie
>
> **`EXPEDIEE` est une déclaration de la boutique, contrôlée par personne**
> *(`R-L9`)*. Aucun tiers neutre ne constate la remise. Une boutique qui déclare
> à tort n'est arrêtée que par le signalement de l'acheteuse *(`UC-50`)* et son
> effet sur le score *(`R-T8`)*. **Il n'y a ni preuve, ni arbitre, ni argent
> retenu.** Cette absence doit figurer dans les conditions d'utilisation, des
> deux côtés *(`R-T9`)*.

### 2. Structure de code

```
apps/api/src/modules/livraison/
├─ routes.ts · service.ts · repository.ts
├─ machine.ts          transitions, autorisations par rôle
├─ evenements.ts       journal horodaté, attribué
└─ machine.test.ts
apps/mobile/src/features/commandes/composants/FriseLivraison.tsx
apps/mobile/src/features/studio/composants/AvancerStatut.tsx
```

### 3. Base de données

Migration `..._f5_2_expedition` — `expedition`, `evenement_livraison`, **`fil_remise`** *(`DP-04`, `DP-10`)*.

```sql
CREATE INDEX expedition_par_commande ON expedition (commande_id);
CREATE INDEX expedition_a_expedier ON expedition (boutique_id, statut)
  WHERE statut IN ('en_preparation','expediee');
CREATE INDEX evenement_par_expedition ON evenement_livraison (expedition_id, horodatage);
```

**Trois index supprimés** avec la logistique : `colis_a_livrer`, `colis_au_relais`, et l'index par livreur.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen — order tracking timeline (buyer).
Vertical order: the order number "#1042" and a status headline "Expédiée";
a vertical timeline with FIVE steps, completed ones with filled green dots and
timestamps, the current one with a pulsing accent dot, future ones grey:
"Payée — 12 août 19 h 42", "En préparation — 13 août 08 h 10",
"Expédiée — 13 août 14 h 30" (current), "Livrée", "Confirmée";
each completed step shows who did it in small muted text ("par Miora").
Under the timeline, a neutral card showing the agreed handover point:
"Point de remise convenu" with "Analamahitsy, devant la pharmacie · samedi 15 h",
and a small link "Ouvrir la discussion".
At the bottom, two buttons: primary "J'ai reçu mon colis" and secondary outline
"Il y a un problème".
Produce a second frame where a muted banner reads "JP ne garde pas votre argent.
Boutique vérifiée par JP." — never a claim about who holds the money (DP-16).
```

**Ce qui a disparu de l'écran** : la carte de code de retrait à six chiffres, les
coordonnées du relais, la date limite de garde, et la mention du livreur.

### 5. Backend

`GET /commandes/:id` inclut l'expédition et sa frise. `POST /expeditions/:id/statut` `{ statut, moyen_declare? }` — **seule la boutique propriétaire est autorisée**.

**Tests** : toutes les transitions valides et invalides ; **une boutique ne peut pas faire avancer l'expédition d'une autre** ; notification à chaque transition ; la frise est identique des deux côtés.

### 6. Frontend

Frise avec l'auteur de chaque étape. Consultable **hors ligne** une fois chargée. **Aucune formulation ne doit laisser croire que JP garantit la livraison ou détient l'argent** *(`R-E1`, `RB12`)*.

```issues
feature: F5.2
titre: Statuts de livraison partagés des deux côtés
epic: "05"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.7]
```

---

## F5.11 — Fil de remise 🆕

`P1 · M · complet` — **Règles** R-L1, R-G1, R-G7 · **Décisions** `DP-04`, `DP-10` · **Bloque** `F16.x`

### 1. Conception

**Où et quand a lieu la remise se négocie entre les parties, pas par JP.**

- **A + B** : un fil s'ouvre à la création de la commande. Ils conviennent du lieu et du moment ; le point convenu remonte sur le bordereau *(`F5.1`)*.
- **Cadeau** *(`DP-10`)* : l'échange a lieu entre **la boutique et le bénéficiaire**. **Le donateur n'y participe pas et ne voit jamais l'adresse** *(`RB8`, `R-G1`)*.

**Le point de conception** : `RB8` était une précaution d'affichage — il fallait *cacher* l'adresse au donateur. **Il devient structurel** : le donateur ne la manipule jamais, elle se négocie entre deux personnes dont il ne fait pas partie.

> ### ⚠️ La conséquence sur la réservation
>
> Dans le parcours cadeau, **le paiement vient après l'accord** : c'est
> `fil_remise.accord_le` qui le débloque. L'article doit donc être tenu pendant
> tout l'échange — **30 minutes ne suffisent pas entre deux fuseaux horaires**
> *(`F1.10`, `PO-10`)*. La durée reste à arrêter.

### 2. Structure de code

```
apps/api/src/modules/livraison/
├─ filRemise.ts        ouverture, participants, accord
└─ filRemise.test.ts
apps/mobile/src/features/commandes/ecrans/FilRemise.tsx
```

### 3. Base de données

`fil_remise` : `commande_id` **UK**, `participants` *(json)*, `point_convenu`, `moment_convenu`, **`accord_le`**.

```sql
CREATE UNIQUE INDEX fil_remise_par_commande ON fil_remise (commande_id);
```

### 4. Design

```
Screen — handover thread.
A simple two-party chat: the shop's avatar and name at top with its verified
badge; message bubbles; and pinned at the very top a summary card "Point de
remise" with two editable fields, "Lieu" and "Quand", plus a single primary
button "Nous sommes d'accord". Once tapped, the card locks, turns muted green,
and shows "Convenu le 13 août".
For the gift variant, add a muted banner at the top: "Naina a offert cette
commande. Il ne voit pas cette discussion." — the donor NEVER appears in the
participant list.
```

### 5. Backend

`POST /commandes/:id/fil-remise` · `PATCH /fil-remise/:id` `{ point_convenu, moment_convenu }` · `POST /fil-remise/:id/accord`.

**Tests** : le donateur n'est jamais dans `participants` ; il reçoit `403` sur toute lecture du fil *(`RB8`)* ; l'accord horodate `accord_le` ; **dans le parcours cadeau, le paiement est refusé tant que `accord_le` est nul**.

### 6. Frontend

Fil hors ligne en lecture. **Le champ « Lieu » ne propose aucune autocomplétion d'adresse** : l'adressage postal n'est pas praticable, on écrit un quartier et des repères *(`R-L2`)*.

```issues
feature: F5.11
titre: Fil de remise, point convenu entre l'acheteur et la boutique
epic: "05"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.7]
```

---

## F5.1 — Bordereau de préparation et étiquette colis

`P1 · M · complet`

**Conception** — bordereau imprimable ou lisible à l'écran : numéro de commande, articles avec tailles, **point de remise convenu** *(`F5.11`)*, destinataire, note de l'acheteuse. *(Ancienne rédaction : mode de livraison, relais ou repère d'adresse, **numéro du destinataire**, montant à encaisser si espèces *(F4.3)*, note de l'acheteuse *(F3.11)*.

**Beaucoup de boutiques n'ont pas d'imprimante.** Le bordereau doit donc être **utilisable à l'écran** et l'étiquette recopiable à la main sans ambiguïté : numéro court, gros caractères, aucune information superflue.

**L'adresse complète n'apparaît que sur le bordereau de la boutique** *(R-L8, RB8)*, jamais dans une vue partageable.

**Base de données** — aucune table : projection de `commande` + `expedition` + `fil_remise`.

**Backend** — `GET /boutique/expeditions/:id/bordereau` (JSON et PDF).

**Design** — Prompt Stitch : *packing slip screen (seller, screen-first) with a very large order number "#1042" at the top, the agreed handover point, the item list with sizes, and the buyer's note. No carrier label, no pickup code, no cash amount (DP-04).*

**Tests** : bordereau complet ; **le donateur ne voit jamais le bordereau d'une commande-cadeau** *(`RB8`)*. *(L'ancien test « montant à encaisser » est supprimé — plus d'espèces, `DP-04`.)* Ancienne rédaction : montant à encaisser présent seulement en mode espèces.

```issues
feature: F5.1
titre: Bordereau de préparation et étiquette colis
epic: "05"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F3.7]
```

---

## F5.9 — Estimation du délai affichée avant l'achat

`P1 · S · moyen` — **Recette RB7**

**Conception** — « Expédié en 2 jours · Livré vers le 16 août » affiché **avant** le bouton d'achat *(F1.15)*. Calculé à partir du délai d'expédition **réel** de la boutique (moyenne mobile de ses expéditions passées) et du délai de transport de la zone.

**Hors direct, c'est l'information la plus importante après le prix** : l'acheteuse n'a pas vu la boutique parler, elle n'a que ce chiffre pour juger.

**Un délai annoncé et non tenu est plus grave qu'un délai long** : il alimente le score de confiance *(F6.2)*.

**Base de données** — `boutique.delai_expedition_moyen` (calculé), `zone_livraison.delai_transport_j`.

> **Le rôle de cette fonctionnalité a grandi** *(`DP-07`)*. Un délai annoncé et non tenu alimente le score de confiance *(F6.2)* — **devenu la seule protection de l'acheteuse**. Ce n'est plus un confort d'affichage, c'est une entrée du mécanisme de réputation.

**Backend** — inclus dans la projection d'article et le panier. Recalcul du délai boutique par travail quotidien.

**Design** — Prompt Stitch : *delivery estimate row on a product page: a truck icon, "Livré vers le 16 août", a secondary line "Miora expédie en 2 jours en moyenne", and a small "Voir les délais" link opening a sheet that breaks it down into "Préparation 2 j" + "Transport 1 j" with a note "Basé sur les 30 dernières expéditions de cette boutique".*

**Tests** : délai calculé sur données réelles ; nouveau boutique sans historique → délai déclaré, marqué comme tel ; affiché avant le paiement *(RB7)* ; écart délai annoncé / réel remonté au score.

```issues
feature: F5.9
titre: Estimation du délai affichée avant l'achat
epic: "05"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F5.2]
```

---

