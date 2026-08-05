# EP03 — Panier, commande et remises

> 15 fonctionnalités · vague 1 · module `commande`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**Le module `commande` est le seul endroit où l'argent et le stock se rencontrent.** Il orchestre `stock`, `promotion`, `paiement`, `sequestre`. Aucun autre module ne doit créer de commande, et aucun ne doit décrémenter de stock.

**Ce qui change dans cette épique** — `F3.14` acte que la commande est **indifférente au canal d'origine**, et `F3.15` introduit le calcul des remises dans le panier, avec sa règle de non-cumul *(R-U7)*, à figer avant d'écrire le calcul.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F3.1 | Panier multi-articles et multi-vendeurs | P1 | M | complet |
| F3.2 | Récapitulatif sous-total, livraison, remise, total | P1 | M | complet |
| F3.3 | Carnet d'adresses | P1 | M | complet |
| F3.4 | Choix domicile / point relais | P1 | M | complet |
| F3.5 | Frais de livraison par zone | P1 | M | complet |
| F3.6 | Code promo ou crédit fidélité | P2 | S | moyen |
| F3.7 | Création de commande et numéro | P1 | M | complet |
| F3.8 | Annulation par l'acheteuse | P1 | S | moyen |
| F3.9 | Annulation / refus par le vendeur | P1 | S | moyen |
| F3.10 | Expiration → remise en stock | P1 | M | complet |
| F3.11 | Note au vendeur | P1 | C | cadre |
| F3.12 | Commande cadeau | P2 | C | cadre |
| F3.13 | Panier entre amies | P3 | W | cadre |
| F3.14 ★ | Commande hors direct, parcours identique | P1 | M | complet |
| F3.15 ★ | Promotion et rang client au panier | P1 | M | complet |

---

## F3.15 — Application d'une promotion et d'un rang client au panier ★

`P1 · M · complet` — **Dépend de** F3.2, F7.22, F7.26 · **Bloque** F7.24, F7.9, F3.6 · **Règles** R-U2, R-U5, R-U7 à R-U10 · **Stories** US-PROMO-07, US-PROMO-08

### 1. Conception

**La fonctionnalité à figer avant toute autre du domaine commercial.** Une règle de calcul de remise se change difficilement après l'émission de factures : les commandes passées portent des montants qu'il faut pouvoir réexpliquer trois mois plus tard, en litige.

**L'algorithme, en cinq temps** *(CDC §3.8)* :

1. Rassembler les promotions **éligibles** pour chaque couple (article, acheteur) : période active, périmètre incluant l'article, cible satisfaite (tous / abonné / palier atteint / bénéficiaire nommé), plafond non atteint.
2. Séparer les remises **sur articles** des remises **sur livraison** — les deux seules assiettes autorisées à coexister.
3. Dans chaque assiette, retenir **la plus favorable à l'acheteur**. Jamais d'addition.
4. Écrire `remise_ligne` et `promotion_id` sur la ligne de commande ; le libellé va sur la facture.
5. Le total affiché est le total prélevé *(R-U2, RB7)*.

**Pourquoi une seule remise et non un cumul** *(R-U7)*. Un cumul est indéfendable en trois points : le vendeur ne peut plus prévoir sa marge, le calcul devient inexplicable à l'acheteuse, et l'ordre d'application change le résultat (−20 % puis −5 000 Ar n'est pas −5 000 Ar puis −20 %). Une seule remise, la plus favorable, se dit en une phrase et se vérifie à la main.

**L'exception documentée** : une remise sur les articles **et** une livraison offerte peuvent coexister, parce qu'elles portent sur des assiettes distinctes. C'est la seule, et elle est nommée dans la règle.

**Cas d'échec dimensionnant** *(US-PROMO-08 CA5)* — la promotion expire entre l'affichage du panier et le paiement. Le nouveau total est présenté pour **confirmation explicite**. Jamais un prélèvement supérieur à ce qui a été vu.

**Deuxième cas** *(R-U5)* — l'acheteuse perd son palier entre la réservation et le paiement : la remise est retirée avec un message clair, **sans faire échouer toute la commande**.

**Arrondis.** Les pourcentages produisent des fractions d'Ariary. L'arrondi se fait **à l'entier inférieur en faveur de l'acheteur**, une fois, sur la ligne. Aucun flottant nulle part *(R-U9, CDC §6.2)*.

### 2. Structure de code

```
apps/api/src/modules/promotion/
├─ eligibilite.ts     quelles promotions s'appliquent à (article, acheteur)
├─ calcul.ts          ← LA fonction de remise, pure, entièrement testable
└─ calcul.test.ts     table de cas, y compris tous les conflits
apps/api/src/modules/commande/
├─ panier.ts          appelle calcul.ts, groupe par vendeur
└─ service.ts         fige remise_ligne et promotion_id à la création
packages/money/src/remise.ts        pourcentage et montant en entiers, arrondi
apps/mobile/src/features/panier/composants/LigneRemise.tsx
```

`calcul.ts` est une **fonction pure** : `(lignes, promotionsEligibles, fraisLivraison) → { lignesRemisees, remiseLivraison, libelles }`. Aucun accès base, aucune horloge. C'est ce qui rend la table de cas de test exhaustive possible.

### 3. Base de données

Migration `..._f3_15_remises_lignes` : `ligne_commande.remise_ligne int DEFAULT 0`, `ligne_commande.promotion_id FK null`, `commande.code_promo null`, `commande.remise_livraison int DEFAULT 0`.

**`promotion_id` est scalaire, et c'est le point de conception le plus important de ce mini-plan** : la structure de la base **interdit physiquement** le cumul. Une table de liaison `ligne_promotion` aurait rendu le cumul possible par erreur ; une colonne unique le rend impossible par construction.

### 4. Design

Ligne de remise **nommée** dans le récapitulatif *(R-U8)* : « Promo Noël −20 % », « Avantage cliente Or : livraison offerte », « Code MERCI10 ». Une remise anonyme (« Remise : −10 000 Ar ») est inquiétante, pas rassurante.

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — cart totals block with named discounts.
A summary card with right-aligned amounts, rows in this order: "Sous-total
118 000 Ar"; a green row with a tag icon "Promo Noël −20 %" showing
"−23 600 Ar"; "Livraison 17 000 Ar"; a green row with a star icon "Avantage
cliente Or : livraison offerte" showing "−17 000 Ar"; a divider; then "Total"
in large bold with "94 400 Ar". Below the card, a muted single line:
"Une seule remise s'applique par article, la plus avantageuse pour vous."
Pinned bottom: full-width primary button "Payer 94 400 Ar".

Screen 2 — promo code field states, three variants stacked as separate frames:
(a) empty field with placeholder "Code promo" and an inactive "Appliquer" button;
(b) success — a green row "Code MERCI10 appliqué · −5 000 Ar" with a small X to
remove it;
(c) error — a red helper line under the field reading "Ce code a expiré le
12 août" (never a generic "code invalide").
Produce a fourth frame with the message "Ce code ne s'applique pas aux articles
de votre panier".

Screen 3 — price change confirmation, a modal over the payment screen.
Title "Le prix a changé"; two rows "Avant 94 400 Ar" struck through and
"Maintenant 118 000 Ar" in bold; a body line "La promotion Noël s'est terminée
pendant votre commande."; a full-width primary button "Payer 118 000 Ar" and a
secondary button "Revenir au panier".
```

### 5. Backend

- `GET /panier` — renvoie les lignes avec `remiseLigne`, `promotionLibelle`, et les totaux calculés serveur.
- `POST /panier/code-promo` `{ code }` → applique ou **refuse avec un motif précis** : `PROMO_EXPIREE { finLe }`, `PROMO_NON_APPLICABLE { raison }`, `PROMO_DEJA_UTILISEE`, `PROMO_NON_ELIGIBLE { palierRequis }`. Jamais de message générique *(US-PROMO-08 CA3)*.
- `POST /panier/valider` — recalcule **au moment de la validation** et fige les montants. Si le total diffère de celui présenté, renvoie `409 TOTAL_MODIFIE { ancien, nouveau, motif }` pour confirmation explicite.

**Tests — table de cas de `calcul.ts`** (la plus importante de l'épique) :

| Cas | Attendu |
|---|---|
| Une promo boutique −20 % | appliquée |
| Promo boutique −20 % **et** code −5 000 Ar sur une ligne à 50 000 Ar | **une seule** : −10 000 Ar (la plus favorable) |
| Promo −20 % **et** livraison offerte | **les deux** (assiettes distinctes) |
| Promo palier Or, acheteuse Bronze | non appliquée |
| Promo palier Or, acheteuse VIP | appliquée (palier supérieur éligible) |
| Code nominatif, autre utilisateur | refusé |
| Code à usage unique déjà consommé | refusé, y compris en appels concurrents |
| Promotion au plafond d'utilisation atteint | refusée |
| Pourcentage produisant une fraction | arrondi entier inférieur, en faveur de l'acheteur |
| Remise supérieure au prix | refusée à la création de la promotion *(R-U12)* |

Autres tests : promotion modifiée après commande → la commande **ne change pas** *(R-U9)* ; promotion expirant entre panier et paiement → `409` et confirmation ; perte de palier entre réservation et paiement → remise retirée, **commande maintenue** ; total affiché = total prélevé, sur 50 paniers générés aléatoirement.

### 6. Frontend

`LigneRemise` — libellé, icône selon la source (promotion, palier, code, cagnotte), montant. Le champ de code promo affiche le **motif exact** du refus.

Le modal de changement de prix est **bloquant** : on ne prélève pas sans nouvelle confirmation.

```issues
feature: F3.15
titre: Application d'une promotion et d'un rang client au panier
epic: "03"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.2, F7.22, F7.26]
```

---

## F3.14 — Commande hors direct, parcours complet identique ★

`P1 · M · complet` — **Dépend de** F3.7, F1.15 · **Règles** R-H1, R-H2, R-H8 · **Story** US-VENTE-06

### 1. Conception

**Ce mini-plan consiste surtout à ne rien dupliquer.** Une commande née du catalogue emprunte la même machine à états, le même séquestre, la même livraison, le même litige *(R-H1)*. L'origine est une donnée pour les statistiques et l'affiliation, **jamais une règle métier** *(R-H2)*.

Deux différences seulement, toutes deux documentées et paramétrées :
- la **durée de réservation** *(R-H3, F1.16)* ;
- le **délai d'acceptation vendeur** *(R-H8)* : hors direct, le vendeur n'est pas devant son téléphone.

Le travail de réalisation porte donc sur trois choses : ajouter le champ `origine`, paramétrer le délai d'acceptation, et **garantir par les tests** qu'aucune autre règle ne bifurque.

- **V** : une seule file « À préparer », avec un marqueur d'origine.
- **OP** : conversion et délai d'expédition comparables **par origine** *(F11.7)* — c'est la mesure qui dira si la vente hors direct tient sa promesse.

**Cas d'échec** *(US-VENTE-06 CA5)* — le vendeur ne réagit pas dans le délai : l'acheteuse est notifiée, sa réservation est protégée, et l'absence de réaction pèse sur le score de confiance *(F6.2)*.

### 2. Structure de code

```
apps/api/src/modules/commande/
├─ service.ts        origine, délai d'acceptation dérivé de l'origine
├─ machine.ts        LA machine à états, une seule, partagée
└─ machine.test.ts   toutes les origines empruntent les mêmes transitions
apps/api/src/jobs/delaiAcceptation.ts
apps/mobile/src/features/commandes-vendeur/composants/MarqueurOrigine.tsx
apps/admin/src/pages/indicateurs/ParOrigine.tsx
```

### 3. Base de données

Migration `..._f3_14_origine_commande` : `commande.origine`, `commande.direct_id null`, `commande.evenement_id null`, index `(origine, cree_le)`.

Paramètres : `delai_acceptation_direct_s`, `delai_acceptation_catalogue_s`.

### 4. Design

Marqueur d'origine discret dans la file du vendeur (pastille « Direct » / « Catalogue »). Aucun écran nouveau : c'est une propriété, pas une fonctionnalité visible.

**Prompt Stitch** — préambule commun, puis :

```
Screen — seller "À préparer" order list, single queue, mixed origins.
Each row: a product thumbnail; order number "#1042"; buyer first name "Hanta";
item summary "Robe wax bleue · M"; amount "55 000 Ar"; and a small origin chip —
red "Direct" or neutral "Catalogue". One row shows an amber chip "À accepter
avant 18 h" to convey the acceptance deadline. A filter bar at the top reads
"Tout · Direct · Catalogue" with "Tout" active. Rows are sorted by deadline,
not by origin — the queue is one queue.
```

### 5. Backend

Aucun endpoint nouveau. `POST /panier/valider` propage `origine` depuis les réservations. Travail périodique de dépassement de délai.

**Tests — ce sont eux le livrable** :
- Commande catalogue de bout en bout : payée → préparée → expédiée → livrée → confirmée → séquestre libéré.
- **Test paramétré sur les 5 origines** : la même série de transitions passe pour chacune. Une divergence est un échec.
- Litige sur commande catalogue → parcours identique *(F6.3)*.
- Délai d'acceptation catalogue > direct ; dépassement → notification + effet sur le score.
- Indicateurs par origine corrects.

### 6. Frontend

Une seule file, triée par échéance et non par origine. Le marqueur informe, il ne segmente pas — deux files signifieraient deux logistiques à tenir.

```issues
feature: F3.14
titre: Commande hors direct, parcours complet identique
epic: "03"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F3.7, F1.15]
```

---

## F3.1 / F3.2 — Panier multi-vendeurs et récapitulatif

`P1 · M · complet` — **Règles** R-U8, RB7 · **Voir** F1.16

### 1. Conception
Le panier **regroupe par vendeur**, parce que les frais de livraison et l'expédition sont par vendeur. Un seul paiement pour l'ensemble.

**Point d'attention** : les frais doivent être affichés **par vendeur et cumulés**, sinon l'acheteuse découvre à la fin qu'elle paie trois livraisons — puis abandonne. Proposition active : « Regroupez au même point relais et économisez X Ar ».

Récapitulatif : sous-total, remise nommée *(F3.15)*, frais par vendeur, total. **Aucun frais découvert après l'engagement** *(RB7)*.

### 2. Structure de code
`modules/commande/panier.ts` (groupement, totaux) · `apps/mobile/src/features/panier/` *(détaillé en F1.16)*.

### 3. Base de données
Aucune table : le panier est la projection des réservations actives *(F1.16 §3)*. Une table de panier créerait une seconde vérité sur ce qui est réservé, donc un risque de survente.

### 4. Design
*Prompt Stitch fourni en [F1.16](EP01-catalogue.md#f116--ajout-au-panier-depuis-le-catalogue-réservation-longue-).*

### 5. Backend
`GET /panier` · `DELETE /panier/lignes/:id` · `POST /panier/regrouper-relais`. Totaux **serveur**, en entiers d'Ariary.

**Tests** : groupement correct sur 3 vendeurs ; frais par vendeur et cumulés ; suggestion de regroupement calculant l'économie réelle ; total = somme des lignes moins remises plus frais, vérifié sur paniers aléatoires.

### 6. Frontend
Groupes par vendeur, minuteurs par ligne, resynchronisation au retour au premier plan.

```issues
feature: F3.1
titre: Panier multi-articles et multi-vendeurs
epic: "03"
phase: P1
prio: M
etapes: [conception, squelette, design, backend, frontend]
depend: [F1.10]
```
```issues
feature: F3.2
titre: Récapitulatif sous-total, livraison, remise, total
epic: "03"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F3.1]
```

---

## F3.7 — Création de commande et numéro de commande

`P1 · M · complet` — **Bloque** paiement, livraison, litige, fidélité

### 1. Conception
La validation du panier crée une commande en `EN_ATTENTE_PAIEMENT`, avec un **numéro lisible** (`#1042`), les prix **figés**, les remises figées, les frais figés. Le numéro sert à l'oral : au relais, au téléphone, dans un litige — il doit être court et prononçable, pas un identifiant technique.

**Machine à états** *(CDC §4.1)* : `BROUILLON → EN_ATTENTE_PAIEMENT → PAYEE → EN_PREPARATION → EXPEDIEE → LIVREE → CONFIRMEE`, avec `ANNULEE` et `REMBOURSEE`. **Toute transition non listée lève une erreur.**

`commande.confirmee` est **l'événement le plus écouté du système** *(PLAN_SOCLE §6)* : libération du séquestre, journal des ventes confirmées *(R-R11)*, recalcul de rang, invitation à l'avis, entrée au dressing. Tout consommateur est idempotent et **ne bloque jamais** la confirmation.

### 2. Structure de code
`modules/commande/{service,machine,numero,repository}.ts` · `modules/commande/machine.test.ts`.

### 3. Base de données
`commande`, `ligne_commande` (CDC §3.3). Numéro par séquence dédiée, pas par comptage. Index `(acheteur_id, cree_le)`, `(statut)`, `(origine, cree_le)`.

### 4. Design
Écran de confirmation avec numéro en grand, phrase de séquestre *(R-E1)* : *« Votre argent est gardé par JP. Miora sera payée quand vous confirmerez avoir reçu. »* — **à l'écran, pas dans les conditions générales.**

**Prompt Stitch** — préambule commun, puis :
```
Screen — order confirmation.
Vertical order: a large green check illustration; title "Commande confirmée";
the order number "#1042" in very large bold, with a small copy icon beside it;
a prominent bordered card with a shield icon reading "Votre argent est gardé par
JP. Miora sera payée quand vous confirmerez avoir reçu votre colis."; a summary
card with the item row, "Total payé 55 000 Ar", and "Livraison estimée : 12 août";
a full-width primary button "Suivre ma commande" and a secondary text link
"Voir ma facture".
```

### 5. Backend
`POST /panier/valider` → commande figée · `GET /commandes/:id` · `GET /commandes`. Transitions via `machine.ts` uniquement.

**Tests** : prix figés (modification d'article ensuite → commande inchangée) ; numéro unique sous concurrence ; **toutes** les transitions invalides rejetées ; `commande.confirmee` consommé par tous les auditeurs, un auditeur en échec ne bloque pas la confirmation.

### 6. Frontend
Écran de confirmation, suivi de commande, historique. Le numéro est copiable en un appui.

```issues
feature: F3.7
titre: Création de commande et numéro de commande
epic: "03"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.1]
```

---

## F3.3 / F3.4 / F3.5 — Adresses, domicile ou relais, frais par zone

`P1 · M · complet` — **Règles** R-L3, R-L8, RB8

### 1. Conception
**L'adressage se fait par repères, pas par code postal** *(R-L3)* : quartier, repère (« près de l'épicerie Tsara »), numéro du destinataire. Un champ « code postal » sur ce marché est un champ vide.

- **Domicile** : adresse enregistrée ou nouvelle, frais par zone.
- **Point relais** : liste triée par proximité, horaires, photo de la devanture. **Aucune adresse personnelle demandée** — c'est aussi une fonctionnalité de discrétion.
- L'adresse n'est **jamais** exposée hors du couple acheteur/transporteur *(R-L8, RB8)*.

### 2. Structure de code
`modules/livraison/{adresses,zones,tarifs,relais}.ts` · `apps/mobile/src/features/livraison/`.

### 3. Base de données
`adresse` (sans code postal), `point_relais`, `zone_livraison (id, nom, polygone|quartiers[])`, `tarif_livraison (zone_id, mode, montant)`.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — "Ajouter une adresse".
Fields in order: "Quartier" as a searchable dropdown showing "Analamahitsy";
"Repère" as a multiline field with placeholder "Près de l'épicerie Tsara, portail
bleu" and a helper line "Décrivez comment vous trouver — c'est ce que le livreur
lira"; "Numéro du destinataire" with a phone mask; a "Nom de cette adresse" chip
row "Maison · Travail · Autre". No postal code field anywhere.
Full-width primary button "Enregistrer".

Screen 2 — delivery mode choice.
Two large cards: "À domicile" with a house icon, the selected address summary and
"12 000 Ar"; "Point relais" with a shop icon, "5 000 Ar" and a green line
"Économisez 7 000 Ar". Below, when relay is selected, a list of relay cards each
with a storefront photo, name "Épicerie Tsara", distance "800 m", opening hours
"7 h – 20 h, tous les jours", and a radio button.
```

### 5. Backend
`GET/POST /moi/adresses` · `GET /points-relais?lat=&lon=` · `POST /panier/livraison`. Frais calculés serveur.

**Tests** : frais corrects par zone et par mode ; l'adresse n'apparaît dans aucune réponse destinée au donateur ou à la créatrice *(RB8)* ; relais triés par distance réelle ; économie affichée exacte.

### 6. Frontend
Dernier choix mémorisé *(F2.8)*. Liste de relais utilisable hors ligne une fois chargée *(CDC §10.3)*.

```issues
feature: F3.3
titre: Carnet d'adresses de livraison
epic: "03"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: []
```
```issues
feature: F3.4
titre: Choix domicile ou point relais
epic: "03"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F3.3]
```
```issues
feature: F3.5
titre: Calcul des frais de livraison par zone
epic: "03"
phase: P1
prio: M
etapes: [conception, bdd, backend, frontend]
depend: [F3.4]
```

---

## F3.10 — Expiration de réservation, remise en stock automatique

`P1 · M · complet` — **Règles** R-S6, R-S7 · **Voir** F1.10

**Conception** — à l'expiration : décrément de `quantite_reservee`, écriture d'un `mouvement_stock`, notification de l'acheteuse avec bouton « Reprendre », **notification du suivant en file** *(R-S7)*, ligne passée en « expirée » dans le panneau vendeur. Le taux de réservations expirées est l'une des quatre mesures fondatrices *(F11.7)*.

**Structure, base de données, tests** — mutualisés avec `F1.10`. Ce mini-plan couvre les **effets** de l'expiration ; `F1.10` couvre le moteur.

**Design** — notification + écran de reprise *(prompt Stitch en [F1.10](EP01-catalogue.md#f110--réservation-temporaire-du-stock))*.

**Tests spécifiques** : une **seule** notification par expiration *(F17.12)* ; le suivant en file est notifié ; le mouvement de stock est écrit ; le compteur de la mesure fondatrice s'incrémente.

```issues
feature: F3.10
titre: Expiration de réservation et remise en stock
epic: "03"
phase: P1
prio: M
etapes: [conception, backend, frontend]
depend: [F1.10]
```

---

## F3.8 — Annulation par l'acheteuse avant expédition

`P1 · S · moyen`

**Conception** — annulation possible tant que la commande n'est pas `EXPEDIEE`. Remboursement intégral automatique, stock rendu, séquestre remboursé *(R-E…)*. Motif demandé mais non obligatoire — un motif obligatoire produit des motifs faux.

**Base de données** — `commande.motif_annulation`, transition vers `ANNULEE` puis `REMBOURSEE`.

**Backend** — `POST /commandes/:id/annuler`. Refus si déjà expédiée, avec orientation vers le retour *(F5.8)*.

**Design** — bouton dans le suivi de commande, confirmation avec conséquences. Prompt Stitch : *cancel confirmation sheet, title "Annuler cette commande ?", a card listing "Vous serez remboursée de 55 000 Ar sous 48 h" and "L'article retournera en vente", an optional reason chip row "Je n'en ai plus besoin · Erreur de taille · Trop long · Autre", a red primary button "Annuler ma commande" and a secondary "Garder ma commande".*

**Tests** : annulation avant expédition → remboursement intégral + stock rendu ; après expédition → refus avec orientation ; annulation concurrente au passage en expédition → un seul gagnant, état cohérent.

```issues
feature: F3.8
titre: Annulation par l'acheteuse avant expédition
epic: "03"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F3.7]
```

---

## F3.9 — Annulation ou refus par le vendeur

`P1 · S · moyen`

**Conception** — cas réel : erreur de stock, article abîmé. Le vendeur annule avec un motif, **le remboursement est automatique et intégral**. Un taux d'annulation vendeur élevé pèse sur son score de confiance *(F6.2)* — c'est ce qui empêche l'annulation de devenir une habitude commode.

L'acheteuse est notifiée, remboursée, invitée à laisser un avis sur l'incident.

**Base de données** — `commande.motif_annulation`, compteur d'annulations dans `profil_vendeur` (alimente `F6.2` et la composante fiabilité du rang client, `R-R3`).

**Backend** — `POST /commandes/:id/refuser` `{ motif }`, motif **obligatoire** ici (contrairement à `F3.8` : le vendeur doit se justifier, il est en position de force).

**Design** — motifs en liste courte. Prompt Stitch : *seller cancel sheet with an amber warning card "Les annulations répétées font baisser votre score de confiance", a required reason radio list "Stock épuisé · Article abîmé · Erreur de prix · Autre", a text field appearing for "Autre", and a red primary button "Annuler et rembourser 55 000 Ar".*

**Tests** : remboursement intégral automatique ; motif obligatoire ; compteur d'annulation incrémenté ; effet sur le score de confiance.

```issues
feature: F3.9
titre: Annulation ou refus par le vendeur
epic: "03"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F3.7]
```

---

## F3.6 — Code promo ou crédit fidélité au panier

`P2 · S · moyen` — **Voir** F3.15 qui porte le calcul

**Conception** — saisie manuelle d'un code, application de la cagnotte *(F7.7)*. La cagnotte est un **crédit**, pas une remise : elle ne concourt pas à la règle du non-cumul et s'applique après, sur le total.

**Distinction à tenir** : une remise réduit le prix (et donc la commission et la marge du vendeur) ; un crédit de cagnotte est payé par JP. Les deux ne se traitent pas au même endroit du calcul, ni dans la même écriture financière.

**Base de données** — `cagnotte (utilisateur_id, solde)`, `mouvement_cagnotte`. `commande.credit_cagnotte_utilise`.

**Backend** — `POST /panier/code-promo` *(F3.15)*, `POST /panier/cagnotte`.

**Tests** : cagnotte appliquée après remise ; solde insuffisant → application partielle ; commande annulée → cagnotte **restituée**.

```issues
feature: F3.6
titre: Code promo ou crédit fidélité au panier
epic: "03"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F3.15]
```

---

## F3.11 — Note à l'attention du vendeur

`P1 · C · cadre`

**Conception** — champ libre court sur la commande (« sonnez fort », « c'est un cadeau »). Visible du vendeur et sur le bordereau, jamais public.

**Impact base de données** — `commande.note_acheteur text null`, limité en longueur.

**Endpoint** — inclus dans `POST /panier/valider`.

```issues
feature: F3.11
titre: Note à l'attention du vendeur
epic: "03"
phase: P1
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F3.7]
```

---

## F3.12 — Commande cadeau, adresse d'un tiers

`P2 · C · cadre` — **Voir** EP16

**Conception** — livraison à l'adresse d'un tiers. **L'adresse de livraison n'est jamais visible du donateur** *(RB8)* : il paie, il ne voit pas où ça va. Le parcours complet est en épique 16.

**Impact base de données** — `commande.donateur_ref`, `commande.est_cadeau bool`.

```issues
feature: F3.12
titre: Commande cadeau, adresse d'un tiers
epic: "03"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F3.7]
```

---

## F3.13 — Panier entre amies, partage des frais

`P3 · W · cadre`

**Conception** — plusieurs personnes contribuent à un même panier, les frais de livraison sont partagés. Recoupe la cagnotte collective *(F16.8)* : à concevoir avec elle, pas séparément, sous peine d'avoir deux mécanismes de paiement partagé.

**Impact base de données** — `panier_partage`, `contribution`.

**Point d'attention** — un paiement partiel ne doit jamais déclencher une commande. Le seuil de complétion est un invariant financier.

```issues
feature: F3.13
titre: Panier entre amies, partage des frais
epic: "03"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F16.8]
```

---

*Épique suivante : [EP07-communaute](EP07-communaute.md) — abonnements, promotions, fidélisation.*
