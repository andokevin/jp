# EP01 — Catalogue, articles, stock et vente hors direct

> 20 fonctionnalités · vague 1 · modules `catalogue` et `stock`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit de mini-plan détaillé : [EP00-identite.md](EP00-identite.md).

**Ce qui change dans cette épique** — le catalogue devient **vendeur par lui-même** *(R-H1, R-H7)*. Le direct n'est plus la condition d'existence d'une vente, il en est l'accélérateur. Six fonctionnalités nouvelles portent ce basculement : F1.15 à F1.20.

**Et la fonctionnalité la plus critique du produit est ici** : `F1.10`, la réservation temporaire. C'est elle qui rend la survente impossible *(RB1)*. Elle se code une fois, avec ses tests de concurrence, et **tous les canaux de vente l'empruntent** — direct, catalogue, clip, événement. Un second chemin de réservation serait un défaut d'architecture, pas une optimisation.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F1.1 | Créer un article | P1 | M | complet |
| F1.2 | Variantes et stock par variante | P1 | M | complet |
| F1.3 | Création rapide en lot | P1 | S | moyen |
| F1.4 | Catégories et attributs mode | P1 | S | moyen |
| F1.5 | Guide des tailles | P2 | S | moyen |
| F1.6 | Gestion de stock et alerte de rupture | P1 | M | complet |
| F1.7 | États d'un article | P1 | M | complet |
| F1.8 | Duplication d'un article | P1 | C | cadre |
| F1.9 | Prix barré / promotion sur un article | P1 | S | moyen |
| F1.10 | **Réservation temporaire du stock** | P1 | M | complet |
| F1.11 | Vitrine publique 24 h/24 | P1 | M | complet |
| F1.12 | Réorganisation de la vitrine | P2 | C | cadre |
| F1.13 | Import de catalogue | P2 | C | cadre |
| F1.14 | Pièce unique | P1 | S | moyen |
| F1.15 ★ | Achat immédiat depuis la fiche | P1 | M | complet |
| F1.16 ★ | Panier catalogue, réservation longue | P1 | M | complet |
| F1.17 ★ | Dépôt d'annonce par un particulier | P1 | S | complet |
| F1.18 ★ | Fiche enrichie : état, mesures, photos | P1 | M | complet |
| F1.19 ★ | Vitrine « catalogue d'abord » | P1 | M | complet |
| F1.20 ★ | Questions publiques sur une fiche | P2 | S | moyen |

---

## F1.10 — Réservation temporaire du stock

`P1 · M · complet` — **Dépend de** F1.2, S4 · **Bloque** F1.15, F1.16, F2.6, F3.1 · **Règles** R-S1 à R-S8, R-H3 · **Recette RB1** · **Story** US-VENTE-09

### 1. Conception

**Fonctionnel.** L'appui sur « Je prends » réserve la variante pour un utilisateur pendant une durée paramétrable. Un minuteur visible court. Le paiement consomme la réservation ; l'expiration la rend au stock et notifie le suivant de la file.

- **A** : minuteur visible (« Réservé 4:32 »), notification à l'expiration avec bouton « Reprendre ».
- **A (2ᵉ de la file)** : *« Vous êtes 2ᵉ — si la réservation expire, c'est pour vous »*, puis notification à l'expiration *(R-S7)*.
- **V** : voit les réservations en cours et lesquelles se transforment en paiement *(F2.14)*.

**Technique — l'invariant, et une seule façon de le tenir.**

```
disponible(variante) = quantite_stock − quantite_reservee
```

Une réservation n'est acceptée que si `disponible >= quantité demandée`, et l'incrément est **atomique**, dans une transaction PostgreSQL avec `SELECT … FOR UPDATE` sur la ligne de variante *(CDC §5.2)*. La contrainte `quantite_reservee <= quantite_stock` en base est le **dernier filet** : même en cas de bogue applicatif, la survente est refusée par la base.

**Redis n'est jamais autorité.** Il diffuse le compteur pour l'affichage en direct ; il peut diverger. La base tranche, toujours. Un développeur qui « optimise » en décrémentant dans Redis casse RB1.

**Deux durées, un seul moteur** *(R-H3)* : `duree_reservation_direct_s` (hyp. 300) et `duree_reservation_catalogue_s` (hyp. 1800). La durée est choisie **à la création** selon l'origine. Ensuite, un seul chemin de code, un seul moteur d'expiration, une seule série de tests.

**Suspension du minuteur** *(R-S5)* : `suspendu_depuis` est posé à l'entrée en attente opérateur de paiement ou lors d'une coupure vendeur ; à la reprise, `expire_le` est repoussé de la durée écoulée. Une réservation ne se perd jamais sur un incident dont l'acheteuse n'est pas responsable.

**Expiration — deux mécanismes complémentaires** *(CDC §5.3)* :
1. une tâche périodique, toutes les quelques secondes ;
2. une **vérification paresseuse** à chaque lecture de disponibilité, pour ne jamais afficher un stock faux entre deux passages.

### 2. Structure de code

```
apps/api/src/modules/stock/
├─ routes.ts              POST /reservations · DELETE /reservations/:id
├─ service.ts             reserver() · consommer() · annuler() · expirer() · suspendre()
├─ repository.ts          LA transaction FOR UPDATE — le seul endroit du dépôt
├─ file.ts                rang, notification du suivant (R-S7)
├─ diffusion.ts           publication du compteur sur le canal du direct
├─ erreurs.ts             STOCK_INSUFFISANT · RESERVATION_EXPIREE
├─ service.test.ts
└─ concurrence.test.ts    ← RB1 : N transactions parallèles réelles
apps/api/src/jobs/expirationReservations.ts
apps/mobile/src/features/achat/composants/MinuteurReservation.tsx
```

### 3. Base de données

Migration `..._f1_10_reservation` :

```prisma
model Variante {
  id               String @id @default(uuid())
  articleId        String
  taille           String?
  couleur          String?
  sku              String?
  quantiteStock    Int
  quantiteReservee Int    @default(0)
  @@unique([articleId, taille, couleur])
}

model Reservation {
  id             String   @id @default(uuid())
  varianteId     String
  utilisateurId  String?          // null si session invitée (F0.10)
  sessionInviteeId String?
  quantite       Int
  statut         StatutReservation @default(active)
  origine        OrigineVente
  directId       String?
  rang           Int      @default(1)
  creeLe         DateTime @default(now())
  expireLe       DateTime
  suspenduDepuis DateTime?
  @@index([varianteId, statut])
  @@index([expireLe])
}
```

**Contraintes ajoutées en SQL brut** (Prisma ne les exprime pas) :

```sql
ALTER TABLE variante ADD CONSTRAINT reservee_positive
  CHECK (quantite_reservee >= 0);
ALTER TABLE variante ADD CONSTRAINT reservee_sous_stock
  CHECK (quantite_reservee <= quantite_stock);
CREATE INDEX reservation_a_expirer ON reservation (expire_le)
  WHERE statut = 'active';
```

Ces deux `CHECK` sont **la garantie de dernier recours de RB1**. Elles ne sont pas décoratives : un test doit vérifier qu'une écriture fautive est bien rejetée par la base.

### 4. Design

- **Minuteur** — pastille sur la fiche, dans le panier et dans la feuille d'achat. Passe en orange sous 60 s. **Suspendu** : le décompte se figE avec la mention « En attente de votre paiement », jamais un décompte qui continue pendant que l'opérateur réfléchit.
- **File d'attente** — carte « Vous êtes 2ᵉ sur la liste ».
- **Expiration** — notification et écran avec bouton « Reprendre » si le stock est revenu.

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Component sheet — stock reservation timer, four states.
State 1 "Réservé": a rounded pill with a clock icon and text "Réservé 4:32",
neutral background.
State 2 "Urgent": same pill, amber background, text "Réservé 0:48".
State 3 "Suspendu": same pill, muted grey, a pause icon, text "En attente de
votre paiement" — no countdown digits at all.
State 4 "Expirée": a full-width card with a grey clock illustration, title
"Votre réservation a expiré", body "La robe wax bleue est encore disponible",
and a full-width primary button "Reprendre".
Also show a small info card used when the item is already reserved by someone
else: "Vous êtes 2e sur la liste — si la réservation expire, c'est pour vous."
```

### 5. Backend

`POST /reservations` `{ varianteId, quantite, origine, directId? }`, **`Idempotency-Key` requis** → 201 `{ reservationId, expireLe, rang }` · 409 `STOCK_INSUFFISANT { rang, disponible }`.

Cœur de `reserver()` :

```ts
return prisma.$transaction(async (tx) => {
  const [v] = await tx.$queryRaw`
    SELECT quantite_stock, quantite_reservee FROM variante
    WHERE id = ${varianteId} FOR UPDATE`;
  const disponible = v.quantite_stock - v.quantite_reservee;
  if (disponible < quantite) throw new StockInsuffisant(disponible);
  await tx.variante.update({
    where: { id: varianteId },
    data: { quantiteReservee: { increment: quantite } },
  });
  return tx.reservation.create({ data: { /* … expireLe selon origine */ } });
}, { isolationLevel: 'Serializable' });
```

Puis, **hors transaction** : diffusion du compteur sur le canal du direct, planification du travail d'expiration.

**Tests — les plus importants du dépôt.**
- **RB1** : `stock = 1`, 50 transactions parallèles → exactement 1 réservation, 49 `STOCK_INSUFFISANT`.
- **RB1 inter-canaux** *(R-H1)* : un appui `origine=direct` et un appui `origine=catalogue` simultanés sur `stock = 1` → une seule réservation.
- Somme des réservations actives ≤ stock physique, sur un jeu aléatoire de 1 000 opérations concurrentes.
- Écriture fautive volontaire (`quantite_reservee = stock + 1`) → **rejetée par la contrainte de base**.
- Expiration : par tâche, et par vérification paresseuse entre deux passages.
- Suspension puis reprise → `expireLe` repoussé de la durée exacte écoulée.
- Durée : `origine=catalogue` → 30 min ; `origine=direct` → 5 min ; modification du paramètre → n'affecte pas les réservations en cours.
- File : 2ᵉ notifié à l'expiration du 1ᵉʳ ; ordre par horodatage serveur.

### 6. Frontend

`MinuteurReservation` — décompte local **calé sur `expireLe` serveur**, jamais sur une durée locale (l'horloge du téléphone est fausse). Resynchronisation à chaque réponse d'API et à la reconnexion WebSocket : **le client n'extrapole jamais** *(CDC §5.4)*.

État suspendu : figer l'affichage, retirer les chiffres. Un décompte qui continue pendant l'attente opérateur fait paniquer.

```issues
feature: F1.10
titre: Réservation temporaire du stock
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.2]
```

---

## F1.15 — Achat immédiat depuis la fiche article, hors direct ★

`P1 · M · complet` — **Dépend de** F1.10, F1.18, F3.7 · **Règles** R-H1, R-H2, R-H8 · **Stories** US-VENTE-01, US-VENTE-08, US-VENTE-09

### 1. Conception

**Le point de tout ce mini-plan : il n'y a presque rien à écrire de neuf.** Le « Je prends » du direct *(F2.6)* et celui du catalogue partagent la feuille d'achat, la réservation, le paiement, le séquestre, la livraison et le litige. Ce qui diffère se réduit à trois choses :

| Aspect | Direct | Catalogue |
|---|---|---|
| Durée de réservation | 5 min | 30 min *(R-H3)* |
| Délai d'acceptation vendeur | court, il est devant son téléphone | plus long *(R-H8)* |
| Contexte visuel | vidéo qui continue derrière la feuille | fiche article statique |

Tout le reste est mutualisé. Le mini-plan consiste donc surtout à **rendre le parcours d'achat indépendant du direct**, ce qui suppose que la feuille d'achat ne dépende d'aucun état de direct.

- **A** : fiche → « Je prends » → feuille (taille présélectionnée depuis `F0.5`, quantité, livraison, **total avec frais affiché ici**) → payer.
- **A (pièce unique)** : pas de quantité demandée *(F1.14)*.
- **AN** : réservation posée avant l'inscription *(F0.10)*.
- **V** : notification « Nouvelle commande » hors direct ; la commande entre dans « À préparer » avec un marqueur d'origine.

**Cas d'échec dimensionnant** — la dernière pièce part pendant que l'acheteuse choisit sa taille : message immédiat *« Désolé, le dernier vient de partir »* et proposition d'alerte de retour en stock *(F7.4)*. Ce cas doit être traité à l'écran, pas seulement dans l'API.

**Décision.** Le délai d'expiration annoncé *(F5.9)* est affiché **avant** le bouton d'achat. Hors direct, l'acheteuse n'a pas vu le vendeur parler : le délai est la seule information qui lui dit si elle attendra trois jours ou trois semaines.

### 2. Structure de code

```
apps/api/src/modules/catalogue/
└─ routes.ts       + GET /articles/:id  (projection fiche complète)
apps/api/src/modules/commande/
└─ service.ts      délai d'acceptation selon l'origine (R-H8)

apps/mobile/src/features/achat/            ← partagé direct ET catalogue
├─ composants/FeuilleJePrends.tsx          aucune dépendance à un état de direct
├─ composants/SelecteurTaille.tsx
├─ composants/RecapitulatifTotal.tsx       total avec frais, jamais plus tard
├─ hooks/useReservation.ts
└─ hooks/useFeuilleAchat.ts
apps/mobile/src/features/article/ecrans/EcranFicheArticle.tsx
apps/web/src/pages/article/[id].tsx        aperçu de lien pour le partage
```

**Le point d'architecture** : `features/achat/` est un dossier commun. Si le direct et le catalogue avaient chacun leur feuille, elles divergeraient en trois semaines et les frais de livraison seraient calculés de deux façons.

### 3. Base de données

Migration `..._f1_15_achat_direct` : `article.achat_direct_actif bool` (par défaut vrai), `commande.origine`, `commande.direct_id`, `reservation.origine`.

Paramètres : `delai_acceptation_direct_s`, `delai_acceptation_catalogue_s` *(R-H8)*.

### 4. Design

Fiche article hors direct — ordre vertical : galerie, prix (et prix barré si promotion, `F1.9`), nom, badge vendeur *(F0.7)*, tailles disponibles (**les épuisées barrées, pas cachées**, `R-A3`), état et mesures *(F1.18)*, délai d'expédition, description, questions *(F1.20)*, autres articles du vendeur. Bouton « Je prends » **fixé en bas**, toujours visible.

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — product detail page, outside a live stream.
Vertical order: a square image carousel with 5 dots and a small "1/5" counter;
a row with price "50 000 Ar" in large bold and, beside it, a struck-through
"65 000 Ar" plus a small red "-23%" chip; product title "Robe wax bleue,
coupe droite"; a seller row with a round avatar, "Miora Boutique", a blue
"Boutique vérifiée" badge and a "Suivre" outline button on the right; a size
selector as a horizontal row of square chips "S M L XL" where "S" is struck
through and dimmed and "M" is selected; an info row with two columns:
"État — Très bon" and "Expédié en 2 jours"; a collapsible "Mesures" section
showing four rows (Épaules 38 cm, Poitrine 92 cm, Taille 74 cm, Longueur
108 cm) with a note "Comparé à votre taille : proche"; a description
paragraph; a "Questions (3)" section with the first question and answer
visible; a horizontal strip "Autres articles de Miora".
Pinned at the bottom: a full-width primary button "Je prends".

Screen 2 — the "Je prends" bottom sheet, rising over the product page.
Vertical order inside the sheet: a small drag handle; product thumbnail with
name and "50 000 Ar"; size row with "M" selected; a quantity stepper "1";
two delivery option rows with radio buttons — "À domicile · 12 000 Ar" and
"Point relais · 5 000 Ar · Épicerie Tsara, Analamahitsy" — the relay one
selected; a total block showing "Sous-total 50 000 Ar", "Livraison 5 000 Ar",
"Total 55 000 Ar" with the total in large bold; a full-width primary button
"Payer 55 000 Ar" and a secondary outline button "Ajouter au panier".

Screen 3 — error state: a bottom sheet with a grey illustration, title
"Désolé, le dernier vient de partir", body "Quelqu'un a réservé cet article
pendant que vous choisissiez votre taille.", a full-width primary button
"Prévenez-moi si ça revient" and a text link "Voir des articles similaires".
```

### 5. Backend

- `GET /articles/:id` — projection complète : article, variantes avec disponible, vendeur et badge, promotion applicable *(F7.22)*, délai d'expédition, mesures, nombre de questions. **Une seule requête** : sur réseau lent, trois appels pour une fiche sont trois occasions d'échouer.
- `POST /reservations` avec `origine: 'catalogue'` — réutilisé tel quel *(F1.10)*.
- `POST /panier/valider` puis `POST /commandes/:id/paiement` — inchangés.
- Le délai d'acceptation vendeur est calculé depuis l'origine à la création de commande ; son dépassement émet une notification et alimente le score de confiance *(F6.2)*.

**Tests**
- Achat catalogue de bout en bout : réservation → commande → paiement → séquestre → livraison → confirmation.
- La commande porte `origine = catalogue` et **suit la même machine à états** *(R-H1)*.
- Pièce unique → quantité non demandée, une seule réservation possible.
- Course au stock pendant le choix de taille → `STOCK_INSUFFISANT` et rang de file renvoyé.
- Vendeur non autorisé à encaisser *(F0.6)* → achat refusé avec motif clair.
- Délai d'acceptation catalogue > délai direct, vérifié sur les valeurs de paramètre.

### 6. Frontend

`FeuilleJePrends` partagée : elle reçoit `{ article, variantes, origine }` et **ne connaît pas** l'existence du direct. Test de rendu dans les deux contextes pour garantir qu'aucune dépendance ne se glisse.

Le total avec frais de livraison est affiché **dans la feuille**, avant le bouton de paiement *(RB7)*. Aucun frais ne peut apparaître après.

`apps/web` sert la fiche pour l'aperçu de lien partagé sur WhatsApp et Facebook *(F7.11)* : titre, image, prix, nom du vendeur.

```issues
feature: F1.15
titre: Achat immédiat depuis la fiche article, hors direct
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.10, F1.18, F3.7]
```

---

## F1.16 — Ajout au panier depuis le catalogue, réservation longue ★

`P1 · M · complet` — **Dépend de** F1.10, F1.15, F3.1 · **Règles** R-H3, R-S2 · **Story** US-VENTE-02

### 1. Conception

Même geste que « Je prends », autre issue : l'article est réservé pour la durée catalogue et l'acheteuse continue à naviguer.

**Le raisonnement derrière les 30 minutes.** En direct, geler un article pendant le pic coûte une vente à quelqu'un d'autre : 5 minutes. Hors direct, il n'y a ni pic ni rareté à l'instant ; geler 30 minutes ne coûte presque rien et **sauve le panier**, qui est l'objet le plus fragile du commerce. Les deux valeurs ne s'arbitrent pas avec le même raisonnement, c'est pourquoi elles sont deux paramètres et non un compromis.

**Cas d'échec dimensionnant** *(US-VENTE-02 CA5)* — l'acheteuse paie à la seconde où une réservation expire. Deux issues acceptables : la réservation est prolongée par le paiement en cours *(R-S5, suspension)*, ou le paiement est refusé avec un message clair. **Jamais** un paiement encaissé sans stock. C'est un test, pas une intention.

### 2. Structure de code

```
apps/api/src/modules/commande/
├─ panier.ts        regroupement par vendeur, totaux, frais par vendeur
└─ routes.ts        GET /panier · POST /panier/lignes · DELETE /panier/lignes/:id
apps/mobile/src/features/panier/
├─ ecrans/EcranPanier.tsx
├─ composants/GroupeVendeur.tsx · LignePanier.tsx · PastilleExpiree.tsx
└─ hooks/usePanier.ts
```

### 3. Base de données

Aucune table nouvelle : une ligne de panier **est** une réservation active. Le panier est une vue des réservations actives de l'utilisateur, groupées par vendeur.

**Décision de modélisation.** Une table `panier` séparée créerait deux sources de vérité sur ce qui est réservé, donc un risque de survente. Le panier n'a pas d'existence propre : il est la projection des réservations.

### 4. Design

Panier **groupé par vendeur** *(F3.1)*, frais de livraison par vendeur et cumulés — sinon l'acheteuse découvre à la fin qu'elle paie trois livraisons. Proposition « Regrouper au même point relais et économiser X Ar ». Minuteur par ligne, ligne expirée signalée **avant** toute tentative de paiement.

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Mon panier", grouped by seller.
Vertical order: title "Mon panier (3)"; a seller group card: header row with
avatar, "Miora Boutique", verified badge; two item rows each with a thumbnail,
name, size, price, a quantity stepper and a "Réservé 24:12" pill; a group
footer row "Livraison 5 000 Ar · Point relais"; a second seller group card with
one item row whose pill is red and reads "Réservation expirée" with a
"Reprendre" link, and the row content dimmed; a suggestion card with a truck
icon reading "Regroupez au même point relais et économisez 7 000 Ar" with a
"Regrouper" link; a totals block: "Sous-total 118 000 Ar", "Livraison
17 000 Ar", "Total 135 000 Ar" in large bold; pinned bottom full-width primary
button "Payer 135 000 Ar".
The expired line must be visually obvious before the user reaches the button.
```

### 5. Backend

`POST /panier/lignes` = `POST /reservations` avec `origine: 'catalogue'`.
`GET /panier` — réservations actives groupées par vendeur, frais par vendeur *(F3.5)*, remises applicables *(F3.15)*, lignes expirées **incluses et marquées** plutôt que silencieusement retirées.
`POST /panier/valider` — refuse si une ligne est expirée, avec la liste des lignes concernées.

**Tests** : durée 30 min appliquée ; expiration → une **seule** notification *(F17.12)* ; panier multi-vendeurs correctement groupé, frais par vendeur ; paiement au moment exact de l'expiration → jamais d'encaissement sans stock ; modification du paramètre de durée → n'affecte pas les réservations en cours.

### 6. Frontend

`usePanier` avec resynchronisation à l'ouverture de l'écran et au retour au premier plan — les minuteurs ont pu expirer pendant que l'application était en arrière-plan. Bouton de paiement désactivé avec un motif explicite si une ligne est expirée.

```issues
feature: F1.16
titre: Panier catalogue et réservation longue
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.10, F1.15, F3.1]
```

---

## F1.18 — Fiche enrichie : état, mesures réelles, photos ★

`P1 · M · complet` — **Dépend de** F1.1 · **Règles** R-H4 · **Story** US-VENTE-03

### 1. Conception

Sans démonstration vidéo, **la fiche porte seule la charge de la confiance**. Elle doit répondre aux questions qu'on posait au vendeur en direct : c'est neuf ? ça taille comment ? il y a un défaut ?

- **État** : neuf avec étiquette / très bon / bon / correct. Quatre valeurs, pas douze — un vendeur qui hésite entre sept nuances ne remplit pas le champ.
- **Mesures réelles** : épaules, poitrine, taille, longueur. **Sur des vêtements importés, les mesures comptent plus que l'étiquette de taille** : un « M » de deux fournisseurs n'est pas le même vêtement.
- **Photos** : jusqu'à 8, dont on recommande une de l'étiquette et une des défauts éventuels.

**Décision — on incite, on n'interdit pas** *(R-H4)*. Les mesures sont facultatives ; un article mesuré porte un marqueur et remonte au tri. Rendre les mesures obligatoires ferait abandonner la création de fiche, qui est déjà l'étape la plus coûteuse pour le vendeur.

**Comparaison au profil.** Les mesures de l'acheteuse *(F0.5)* permettent d'afficher « proche de votre taille » / « plus petit que d'habitude ». C'est ce qui réduit les retours pour cause de taille, première cause de litige dans le vestimentaire *(F5.8)*.

### 2. Structure de code

```
apps/api/src/modules/catalogue/
├─ mesures.ts       bornes par catégorie, comparaison au profil acheteur
└─ service.ts       + validation de etat_vetement et mesures
packages/contracts/src/article.ts   schéma Zod des mesures, bornes incluses
apps/mobile/src/features/article/
├─ composants/SelecteurEtat.tsx
├─ composants/SaisieMesures.tsx        avec schéma illustré des points de mesure
├─ composants/BlocMesures.tsx          affichage + comparaison
└─ composants/GalerieArticle.tsx
```

### 3. Base de données

Migration `..._f1_18_fiche_enrichie` : `article.etat_vetement` (énumération, nullable), `article.mesures jsonb`, `article.a_mesures bool` (dénormalisé pour le tri, maintenu par déclencheur).

**Pourquoi `jsonb` et non des colonnes.** Les champs pertinents varient par catégorie : une paire de chaussures n'a pas de tour de poitrine. Des colonnes fixes signifieraient vingt colonnes nulles. Les bornes sont validées applicativement, par catégorie *(R-H4)*.

### 4. Design

Saisie côté vendeur : quatre cartes illustrées pour l'état, schéma des points de mesure avec quatre champs. Affichage côté acheteuse : bloc dépliable avec comparaison au profil.

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — seller form, "Décrivez votre article" (condition and measurements).
Vertical order: section title "État de l'article"; four selectable cards in a
2x2 grid, each with a small illustration and a label: "Neuf avec étiquette",
"Très bon état", "Bon état", "État correct", with "Très bon état" selected and
a short helper line under the grid "Soyez honnête : un défaut annoncé évite un
litige."; section title "Mesures réelles" with a muted chip "Recommandé";
a simple line drawing of a dress with four numbered measurement points; four
numeric fields in a 2x2 grid labelled "Épaules", "Poitrine", "Taille",
"Longueur", each with a "cm" suffix; an amber helper card "Les articles mesurés
sont mieux classés dans les résultats."; full-width primary button "Continuer".

Screen 2 — buyer-facing measurements block, expanded, inside a product page.
A card titled "Mesures" with four rows: label left, value right ("Épaules 38 cm",
"Poitrine 92 cm", "Taille 74 cm", "Longueur 108 cm"); below the rows, a green
comparison strip with a check icon reading "Proche de vos mesures habituelles";
and a small text link "Modifier mes mesures".
Also produce a variant of the comparison strip in amber: "Plus petit que ce que
vous portez d'habitude".
```

### 5. Backend

`POST/PUT /articles` accepte `etatVetement` et `mesures`. Validation des bornes par catégorie (une longueur de 5 cm ou un tour de poitrine de 300 cm sont refusés *(US-VENTE-03 CA5)*). `GET /articles/:id` renvoie les mesures **et** la comparaison au profil de l'appelant si celui-ci a renseigné les siennes.

Avertissement non bloquant à la publication d'un article destiné à la vente hors direct avec moins de 3 photos.

**Tests** : mesures hors bornes refusées ; publication possible sans mesures ; `a_mesures` correct et pris en compte au tri ; comparaison au profil sur trois cas (proche, plus petit, plus grand) ; absence de profil → pas de comparaison, pas d'erreur.

### 6. Frontend

`SaisieMesures` avec schéma illustré : sans le dessin, personne ne sait où mesurer « la taille ». Clavier numérique, unités affichées, valeurs conservées à la duplication d'article *(F1.8)*.

```issues
feature: F1.18
titre: Fiche enrichie, état, mesures réelles, photos
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F1.19 — Vitrine « catalogue d'abord » ★

`P1 · M · complet` — **Dépend de** F1.11, F0.10 · **Règles** R-H7 · **Story** US-VENTE-05

### 1. Conception

La vitrine est vendeuse en permanence. Le direct est un **état temporaire affiché en surimpression**, jamais une condition d'accès au catalogue *(R-H7)*.

Composition hors direct : bandeau boutique (nom, badge, score, abonnés, délai d'expédition moyen), promotions en cours *(F7.22)*, événements auxquels le vendeur participe *(F20.2)*, prochain rendez-vous *(F17.4)*, puis onglets **Articles / Directs / Avis / À propos**.

En direct : bandeau « En direct maintenant » en tête, **sans masquer le catalogue**.

**La mesure qui compte** — la part du chiffre d'affaires réalisée hors direct, ventilée par origine *(R-H2)*. Si elle reste marginale, la promesse « vendre 24 h/24 » est décorative. Si elle dépasse le direct, le produit a changé de nature et la stratégie de contenu doit suivre. Cette mesure remonte au tableau de bord du pilote *(F11.7)*.

**État vide** *(US-VENTE-05 CA5)* : une vitrine sans article affiche le prochain direct ou une invitation à suivre — jamais une page blanche.

### 2. Structure de code

```
apps/api/src/modules/catalogue/
└─ vitrine.ts     projection complète : boutique, promos, événements, onglets
apps/mobile/src/features/vitrine/
├─ ecrans/EcranVitrine.tsx
├─ composants/{EnteteBoutique,BandeauDirect,BandeauPromo,BandeauEvenement}.tsx
├─ composants/OngletsVitrine.tsx
└─ hooks/useVitrine.ts
apps/web/src/pages/boutique/[slug].tsx    aperçu de lien, partage externe
```

### 3. Base de données

Aucune table nouvelle. `profil_vendeur` gagne `slug UQ` (partage d'un lien lisible) et `delai_expedition_moyen` (calculé, déjà prévu au CDC).

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — seller storefront, not live (catalogue-first).
Vertical order: a cover image with the shop avatar overlapping its bottom edge;
shop name "Miora Boutique" with a blue "Boutique vérifiée" badge; a stats row of
three columns "4,8 ★ (126 avis)", "1 240 abonnés", "Expédie en 2 jours";
a full-width "Suivre" primary button beside a smaller share icon button;
a promotion banner in the accent color reading "-20 % sur toute la boutique
jusqu'à dimanche"; a slim event chip row "Participe à : Noël JP"; a card
"Prochain direct — vendredi 18 h" with a "Me rappeler" link; a tab bar
"Articles · Directs · Avis · À propos" with "Articles" active; a two-column
product grid where each tile shows the image, price "50 000 Ar", a struck-through
old price, and a small "Mesuré" chip on some tiles.

Screen 2 — the same storefront while the seller is live: identical layout, plus a
red "EN DIRECT" pill overlaid on the cover image with a viewer count "312", and
a slim persistent banner under the header "Miora est en direct — 312 personnes"
with a "Rejoindre" button. The product grid stays fully visible underneath.

Screen 3 — empty state: cover, shop header, then a centered illustration with
title "Pas encore d'article en ligne", body "Miora prépare sa prochaine
collection", and two buttons: primary "Suivre la boutique", secondary
"Voir son prochain direct".
```

### 5. Backend

`GET /vendeurs/:idOuSlug/vitrine` — une seule réponse portant tout l'en-tête et la première page d'articles. Pagination par curseur sur les onglets. Route **publique** *(F0.10)*.

`GET /vendeur/tableau-de-bord` renvoie le chiffre d'affaires **ventilé par origine**.

**Tests** : vitrine accessible sans compte ; catalogue visible pendant un direct ; état vide utile ; ventilation par origine correcte ; slug unique et stable.

### 6. Frontend

Onglets avec état conservé, grille recyclée *(C1)*, images en substitut basse définition d'abord. `apps/web` rend la vitrine pour l'aperçu de lien — c'est le canal d'acquisition principal du vendeur *(F7.11)*.

```issues
feature: F1.19
titre: Vitrine catalogue d'abord
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.11, F0.10]
```

---

## F1.17 — Dépôt d'annonce par un particulier ★

`P1 · S · complet` — **Dépend de** F0.4, F0.6, F1.14 · **Règles** R-H5, R-H6, R-H10, R-H11 · **Story** US-VENTE-04

### 1. Conception

**Quatre champs : photos, prix, taille, état.** Rien d'autre. Pas de nom de boutique, pas de catégorie obligatoire, pas de KYC. Stock à 1, pièce unique *(F1.14)*.

La vérification *(F0.6)* est exigée **au premier encaissement**, pas avant *(R-H5)*. Demander une CIN et un selfie à quelqu'un qui n'est pas encore sûr de vouloir vendre une robe, c'est le perdre.

**Ce que voit l'acheteuse** *(R-H6)* : un badge « Particulier » distinct, un délai d'expédition, pas de politique de retour commerciale — et **la même protection** : séquestre, litige, arbitrage. C'est précisément ce qui rend l'achat à un inconnu acceptable.

**Cas d'échec dimensionnant** *(R-H10)* : le particulier refuse la vérification alors qu'une commande est payée → **annulation et remboursement intégral** de l'acheteuse, et le compte ne peut plus recevoir de commandes. Le risque est porté par le vendeur qui a refusé, jamais par l'acheteuse.

**Décision ouverte à trancher avant de coder** *(R-H11)* : le seuil de bascule vers le statut professionnel et le barème de commission du particulier. Ils conditionnent l'écran de vérification, donc la structure du parcours.

### 2. Structure de code

```
apps/api/src/modules/catalogue/annonceParticulier.ts   création en 4 champs
apps/api/src/modules/identite/roles.ts                 bascule, seuil (F0.4)
apps/api/src/modules/paiement/service.ts               + blocage d'encaissement
apps/api/src/jobs/verificationParticulier.ts           relance, annulation (R-H10)
apps/mobile/src/features/annonce/ecrans/{EcranDepot,EcranVerificationRequise}.tsx
```

### 3. Base de données

Réutilise `profil_vendeur.type_vendeur = particulier` *(F0.4)*. `article` : `piece_unique = true` par défaut pour un particulier. `commande` : motif d'annulation `verification_refusee`.

### 4. Design

Un seul écran de dépôt, quatre champs, aucun repli à ouvrir. Écran de vérification requise déclenché **par un paiement reçu**, avec le montant en attente affiché — c'est le meilleur argument pour faire la vérification.

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Vendre un article" (private seller, 4 fields only).
Vertical order: back arrow, title "Vendre un article"; a photo area showing one
filled square thumbnail and three dashed "+" placeholders with a caption
"Ajoutez jusqu'à 5 photos"; a price field with a large "Ar" suffix, placeholder
"25 000"; a size field rendered as a horizontal chip row "XS S M L XL 38 40 42";
an "État" row of four selectable chips "Neuf", "Très bon", "Bon", "Correct";
a muted reassurance card with a shield icon reading "Vous n'avez pas besoin de
créer une boutique. Nous vous demanderons vos papiers seulement quand vous
serez payée."; full-width primary button "Publier".
No shop name field, no category field, no description field.

Screen 2 — "Vérification requise" (triggered by a paid order).
Vertical order: a green money illustration; title "Vous avez été payée !";
a large amount card "38 000 Ar en attente" with a line "Commande #1042 — robe
wax bleue"; body text "Pour recevoir cet argent, nous devons vérifier votre
identité. Cela prend 5 minutes."; a three-line checklist with icons: "Une photo
de votre CIN", "Une photo de votre visage", "Votre numéro Mobile Money";
full-width primary button "Vérifier mon identité"; a small muted line at the
bottom "Sans vérification, la commande sera remboursée à l'acheteuse sous 5 jours."
```

### 5. Backend

`POST /articles/annonce-particulier` — 4 champs, crée le profil particulier si absent *(F0.4)*, stock 1, pièce unique.
Le blocage d'encaissement est contrôlé dans `paiement` **et** `portefeuille`, jamais seulement à l'interface.
Travail périodique : relance, puis annulation et remboursement intégral au terme du délai *(R-H10)*.

**Tests** : publication sans KYC ni nom ; commande reçue → encaissement bloqué ; vérification faite → fonds libérables ; refus au terme du délai → **remboursement intégral** et compte fermé aux nouvelles commandes ; seuil franchi → invitation unique ; badge « Particulier » présent sur toutes les vues d'article.

### 6. Frontend

Formulaire à quatre champs, mise en vente depuis le dressing *(F17.10)* sans re-photographier. Le message de réassurance sur la vérification différée est affiché **avant** la publication, pas après.

```issues
feature: F1.17
titre: Dépôt d'annonce par un particulier
epic: "01"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.4, F0.6, F1.14]
```

---

## F1.1 / F1.2 — Créer un article, variantes et stock par variante

`P1 · M · complet` — **Règles** R-A1 à R-A5 · **Bloque** tout le catalogue

### 1. Conception
1 à 8 photos, recadrage carré, nom, prix, catégorie, puis **grille de variantes** : tailles cochées avec une quantité par taille, couleurs si besoin.

**Le raccourci de création express est obligatoire** *(R-A4)* : trois champs (photo, prix, quantité) utilisables en plein direct, le reste complété après. Sans lui, aucun vendeur ne crée de fiche pendant un direct — et la fiche non créée est une vente perdue.

L'employé peut créer et modifier des articles, **jamais le prix** *(F10.4, matrice §3.2)*.

Stock **par variante, jamais global** *(R-A2)*. Variante épuisée **barrée, pas cachée** *(R-A3)* : c'est ce qui permet de demander une alerte de retour en stock *(F7.4)*.

### 2. Structure de code
```
apps/api/src/modules/catalogue/
├─ routes.ts · service.ts · repository.ts
├─ variantes.ts     grille, cohérence taille × couleur
└─ images.ts        redimensionnement serveur, 3 tailles, stockage objet
apps/mobile/src/features/article/
├─ ecrans/{EcranCreation,EcranCreationExpress,EcranVariantes}.tsx
└─ composants/{GrilleVariantes,SelecteurPhotos,RecadrageCarre}.tsx
```

### 3. Base de données
`article` et `variante` (CDC §3.2), `mouvement_stock`. Unicité `(article_id, taille, couleur)`. Index `(vendeur_id, statut)`.

Images : trois tailles générées côté serveur (vignette, liste, détail). **Jamais d'image pleine résolution dans une liste** *(C1, C2)*.

### 4. Design
Création en pas courts. Grille de variantes en tableau tailles × couleurs avec saisie de quantité. Création express : un écran, trois champs, un bouton.

**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — "Nouvel article", variants grid step.
Vertical order: back arrow, title, a four-segment progress bar; a "Tailles"
chip row where S, M and L are selected; a "Couleurs" chip row where Bleu and
Noir are selected; then a generated table with size rows and color columns,
each cell containing a small numeric quantity input, some filled with 2, 1, 0;
a row of quick actions "Tout à 1", "Tout à 0"; a live summary line "6 variantes
· 9 pièces au total"; full-width primary button "Mettre en ligne" and a
secondary text link "Enregistrer en brouillon".

Screen 2 — "Création express" (used while live streaming).
A very compact screen: a large camera/photo square at the top, one price field
with "Ar" suffix, one quantity stepper, and a single full-width button "Mettre
à l'écran". Nothing else — no category, no description, no variants.
A tiny muted line at the bottom: "Vous compléterez la fiche après le direct."
```

### 5. Backend
`POST /articles`, `PUT /articles/:id`, `POST /articles/:id/variantes`, `POST /articles/express`. Permission de prix vérifiée côté serveur pour l'employé *(matrice §3.2)*.

**Tests** : création avec variantes ; unicité taille × couleur ; employé sans permission de prix → 403 ; création express en 3 champs ; images redimensionnées et jamais servies en pleine résolution dans une liste.

### 6. Frontend
Sélection multiple de photos avec compression **avant** envoi, recadrage carré, file d'attente d'envoi reprenable (réseau intermittent). Grille de variantes utilisable au pouce.

```issues
feature: F1.1
titre: Créer un article
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```
```issues
feature: F1.2
titre: Variantes taille et couleur, stock par variante
epic: "01"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F1.6 — Gestion de stock, entrée, sortie, alerte de rupture

`P1 · M · complet` — **Règles** R-A2, R-S2

**Conception** — écran « Stock » trié par quantité croissante, modification en ligne, **historique des mouvements** (vente, retour, correction manuelle, réservation expirée). Alerte quand une variante passe sous un seuil défini par le vendeur. Le stock affiché en direct est le stock réel **moins les réservations** *(R-S2)*.

**Structure** — `modules/stock/{mouvements,alertes}.ts` · `apps/mobile/src/features/stock/ecrans/EcranStock.tsx`.

**Base de données** — `mouvement_stock (variante_id, type, quantite_delta, reference, auteur_id)`, **jamais de mise à jour de quantité sans mouvement correspondant** : c'est la seule façon d'expliquer un écart. `variante.seuil_alerte`.

**Design** — liste triée, saisie en ligne, historique dépliable par variante. Prompt Stitch : *stock management list, rows showing product thumbnail, variant label "Robe wax · M · Bleu", a large inline numeric stepper, and a red "Rupture" or amber "Bas (2)" chip; rows sorted lowest first; a filter bar "Tout · En rupture · Sous le seuil"; tapping a row expands a movement history list with dated entries "Vente −1", "Réservation expirée +1", "Correction +5".*

**Backend** — `GET /vendeur/stock`, `PATCH /variantes/:id/quantite` (crée un mouvement de type `correction`), `GET /variantes/:id/mouvements`. Alerte émise par un travail asynchrone, pas dans la transaction de vente.

**Tests** : toute variation de quantité produit un mouvement ; somme des mouvements = quantité courante ; alerte au franchissement du seuil, **une seule fois** par franchissement ; disponible = stock − réservé.

```issues
feature: F1.6
titre: Gestion de stock, entrée, sortie, alerte de rupture
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.2]
```

---

## F1.7 — États d'un article

`P1 · M · complet`

**Conception** — `brouillon → en_ligne → masque → epuise`, avec retours possibles. `epuise` est **calculé** (toutes les variantes à 0), pas saisi : un état déclaratif divergerait du stock réel. Un article masqué reste accessible par son URL directe pour les commandes en cours, mais disparaît des listes.

**Base de données** — `article.statut`. Déclencheur ou service qui bascule vers `epuise` et en revient quand du stock rentre.

**Backend** — `PATCH /articles/:id/statut`. Transitions non prévues rejetées *(CDC §13.1)*.

**Design** — sélecteur d'état sur la fiche vendeur, badge d'état dans la liste du catalogue. Prompt Stitch : *seller catalogue list with a status chip on each row — grey "Brouillon", green "En ligne", muted "Masqué", red "Épuisé" — and a bottom sheet to change status showing four rows with radio buttons and a one-line explanation under each.*

**Tests** : transitions valides et invalides ; `epuise` automatique à stock nul et retour automatique ; article masqué absent des listes mais accessible par identifiant.

```issues
feature: F1.7
titre: États d'un article
epic: "01"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F1.11 — Vitrine publique du vendeur

`P1 · M · complet` — **Voir** F1.19 qui en porte la refonte

**Conception** — onglets Articles / Directs / Avis / À propos, badge, score de confiance, délai d'expédition moyen, nombre de ventes. Accessible **sans compte** *(F0.10)* et par lien partagé — c'est le canal d'acquisition principal du vendeur, il doit être atteignable en un appui depuis le tableau de bord.

**Structure, base de données, design, backend, frontend** — mutualisés avec `F1.19`, qui décrit la vitrine dans son état définitif. Ce mini-plan couvre la structure de base (onglets, projections, pagination) ; `F1.19` ajoute le comportement catalogue-first, les promotions, les événements et l'état vide.

```issues
feature: F1.11
titre: Vitrine publique du vendeur
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.1, F0.10]
```

---

## F1.14 — Pièce unique

`P1 · S · moyen`

**Conception** — stock = 1, comportement spécifique : une seule réservation possible, pas de sélecteur de quantité, marqueur « Une seule pièce » à l'écran. C'est le **moteur d'urgence naturel** du direct, sans avoir à inventer une fausse rareté — et la rareté affichée doit être vraie *(RB9)*.

Comportement par défaut du vendeur particulier *(F1.17)*.

**Base de données** — `article.piece_unique bool`.

**Backend** — `POST /reservations` refuse `quantite > 1` sur pièce unique ; la fiche n'expose pas de sélecteur de quantité.

**Design** — pastille « Une seule pièce » sur la vignette et la fiche. Prompt Stitch : *product tile and product page variants showing a distinctive "Une seule pièce" chip with a diamond icon; in the buy sheet, the quantity stepper is replaced by a static line "1 pièce disponible".*

**Tests** : quantité > 1 refusée ; deux réservations concurrentes → une seule accepte ; pas de sélecteur de quantité rendu.

```issues
feature: F1.14
titre: Pièce unique
epic: "01"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.2, F1.10]
```

---

## F1.9 — Prix barré et promotion sur un article

`P1 · S · moyen`

**Conception** — prix barré + nouveau prix sur la vignette, la fiche, le panier et la facture. **Le prix affiché est le prix payé** *(R-U2, RB7)*. À la fin d'une promotion, retour automatique au prix d'origine *(R-U11)* : un prix barré qui reste barré est un mensonge commercial et détruit l'effet de la promotion suivante.

Cette fonctionnalité est le **rendu** ; la mécanique de promotion est en `F7.22` et la règle de cumul en `F7.26`.

**Base de données** — `article.prix_barre_ariary` pour une remise portée par l'article ; les promotions de boutique passent par `promotion` *(F7.22)* et sont calculées à la lecture, sans réécrire le prix de l'article.

**Backend** — la projection d'article renvoie `{ prix, prixBarre, remise: { libelle, source } }`. Le calcul est **serveur**, en entiers d'Ariary *(R-U9)*.

**Design** — composant de prix partagé, trois variantes (normal, remisé, épuisé). Prompt Stitch : *price component sheet showing three variants inline in a product tile: plain "50 000 Ar"; discounted with struck-through "65 000 Ar" beside "50 000 Ar" and a red "-23%" chip; and sold out with the price dimmed and a "Épuisé" chip.*

**Tests** : retour automatique au prix d'origine à la date de fin ; le prix affiché égale le prix prélevé ; la facture porte le libellé de la remise.

```issues
feature: F1.9
titre: Prix barré et promotion sur un article
epic: "01"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F1.3 — Création rapide en lot depuis la galerie

`P1 · S · moyen`

**Conception** — sélection de N photos → N fiches en brouillon → complétées à la chaîne (prix, taille, état), avec report de la saisie précédente pour aller vite. Usage réel : le vendeur photographie son arrivage de 30 pièces, puis complète le soir.

**Base de données** — aucune table nouvelle : des `article` en `brouillon`.

**Backend** — `POST /articles/lot` (création en masse de brouillons), `PATCH /articles/lot` (complétion). Envoi d'images **reprenable** : 30 photos sur un réseau intermittent, c'est plusieurs interruptions.

**Design** — file de complétion avec progression « 7 sur 30 ». Prompt Stitch : *batch completion screen showing a top progress row "7 sur 30 complétés", a large photo of the current item, compact price/size/condition fields, and two bottom buttons "Suivant" and "Passer"; plus an upload queue sheet listing photos with per-item states uploading, done, failed with a "Réessayer" link.*

**Tests** : lot de 30 ; interruption réseau → reprise sans doublon ; report de la saisie précédente.

```issues
feature: F1.3
titre: Création rapide en lot depuis la galerie
epic: "01"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F1.4 — Catégories et attributs mode

`P1 · S · moyen`

**Conception** — arbre de catégories (femme/homme/enfant → haut/bas/robe/chaussures/accessoire), attributs matière, marque, coupe. Alimente les filtres *(F8.3)*, les bornes de mesures par catégorie *(F1.18)* et le barème de commission par catégorie *(F10.2)*.

**Base de données** — `categorie (id, parent_id, nom_mg, nom_fr, position)`, `article.categorie_id`, attributs en colonnes (`marque`, `matiere`, `coupe`).

**Backend** — `GET /categories` (arbre complet, mis en cache agressivement — il change rarement et il est demandé partout).

**Design** — sélecteur en deux niveaux, recherche dans la liste. Prompt Stitch : *category picker as a two-pane list — parent categories on the left, children on the right with counts — plus a search field at the top and a breadcrumb showing the current selection "Femme › Robes".*

**Tests** : arbre cohérent, bilingue, catégorie obligatoire à la publication sauf en création express.

```issues
feature: F1.4
titre: Catégories et attributs mode
epic: "01"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F1.20 — Questions publiques sur une fiche article ★

`P2 · S · moyen` — **Règles** R-H9 · **Story** US-VENTE-07

**Conception** — question publique sous la fiche, réponse publique du vendeur, visible de toutes les acheteuses suivantes. **Public et non privé pour deux raisons** : cela évite de rouvrir la messagerie libre *(F7.14)*, et une réponse écrite une fois sert cent fois.

Filtrage automatique appliqué *(R-X1)*. **Blocage explicite** des questions contenant un numéro de téléphone ou une invitation à sortir de la plateforme *(US-VENTE-07 CA5)* — c'est le principal usage détourné à prévoir.

**Base de données** — `question_article` (CDC §3.2), index `(article_id, statut, cree_le)`.

**Backend** — `GET/POST /articles/:id/questions`, `POST .../reponse`. Filtrage et détection de coordonnées avant publication.

**Design** — section « Questions (3) » sur la fiche, les 3 plus utiles visibles sans dépliage. Prompt Stitch : *product page questions section titled "Questions (3)", each entry showing the asker's first name and date, the question text, and an indented seller answer with a small verified badge; a "Voir les 3 questions" link; and a compose row at the bottom "Posez votre question" with a send icon; plus an error state under the compose field reading "Les numéros de téléphone ne sont pas autorisés — posez votre question ici, la vendeuse vous répondra publiquement."*

**Tests** : question filtrée masquée ; numéro de téléphone bloqué avec message explicite ; réponse visible publiquement ; notification du vendeur.

```issues
feature: F1.20
titre: Questions publiques sur une fiche article
epic: "01"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.1, F19.1]
```

---

## F1.5 — Guide des tailles par marque

`P2 · S · moyen`

**Conception** — table de correspondance par marque et repères de mesure, pour traduire un « M » d'un fournisseur en centimètres. Complète `F1.18` : les mesures réelles de l'article restent prioritaires sur le guide, qui n'est qu'une aide.

**Base de données** — `guide_taille (marque, categorie, taille, mesures jsonb)`, alimenté par l'équipe et enrichi par les vendeurs.

**Backend** — `GET /guides-tailles?marque=&categorie=`.

**Design** — feuille dépliable depuis le sélecteur de taille. Prompt Stitch : *size guide bottom sheet with a brand name header, a table of sizes as rows and measurements as columns, the buyer's own measurements highlighted in a colored row, and a footer line "Les mesures de l'article sont plus fiables que le guide."*

```issues
feature: F1.5
titre: Guide des tailles par marque
epic: "01"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.18]
```

---

## F1.8 — Duplication d'un article

`P1 · C · cadre`

**Conception** — duplication d'une fiche avec ses variantes, mesures et photos, en brouillon, quantités à zéro. Usage réel : un réassort de la même robe en trois couleurs.

**Impact base de données** — aucun : une insertion dérivée. Les photos sont **référencées**, pas recopiées dans le stockage objet.

**Endpoint** — `POST /articles/:id/dupliquer`.

**Point d'attention** — ne jamais dupliquer le statut `en_ligne` : un article dupliqué part toujours en brouillon, sinon on met en vente un doublon sans stock.

```issues
feature: F1.8
titre: Duplication d'un article
epic: "01"
phase: P1
prio: C
etapes: [conception, backend, frontend]
depend: [F1.1]
```

---

## F1.12 — Réorganisation de la vitrine

`P2 · C · cadre`

**Conception** — épinglage et ordre manuel des articles sur la vitrine. Trois articles épinglés au maximum : au-delà, l'épinglage ne signifie plus rien.

**Impact base de données** — `article.position_vitrine int null`, `article.epingle bool`.

**Endpoint** — `PUT /vendeur/vitrine/ordre`.

```issues
feature: F1.12
titre: Réorganisation de la vitrine
epic: "01"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F1.19]
```

---

## F1.13 — Import d'un catalogue existant

`P2 · C · cadre`

**Conception** — import par tableau (CSV) ou photos en masse, avec correspondance de colonnes et rapport d'erreurs ligne par ligne. Destiné aux vendeurs qui tiennent déjà un fichier.

**Impact base de données** — table `import_catalogue (id, vendeur_id, statut, lignes_total, lignes_ok, rapport jsonb)`.

**Endpoints** — `POST /vendeur/imports`, `GET /vendeur/imports/:id`.

**Point d'attention** — l'import ne doit **jamais** créer d'articles en ligne directement : tout arrive en brouillon, le vendeur valide. Un import raté qui publie 200 fiches fausses coûte plus cher que l'import ne rapporte.

```issues
feature: F1.13
titre: Import d'un catalogue existant
epic: "01"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F1.1]
```

---

*Épique suivante : [EP03-commande](EP03-commande.md) — panier, commande et remises.*

---

# JP Beauté — ce que l'univers cosmétique ajoute au catalogue

**Décision du 20/08/2026.** Ces quatre fonctionnalités étendent le catalogue
plutôt que de créer un domaine : c'est la même table `article`, avec des
attributs et des contrôles propres à l'univers *(voir `EP21-univers.md`)*.

**Le raisonnement de fond.** Un vêtement qui ne va pas déçoit. Un cosmétique
périmé ou contrefait **blesse**. Cette différence de nature justifie des
contrôles bloquants là où la mode se contente d'avertissements.

---

## F1.21 — Fiche beauté : péremption, contenance, scellé, type de peau

`P1 · M · complet` — **Règles** R-Y13, R-Y14, R-Y15 · **Dépend de** F21.3, F1.1

**Conception.** Quatre champs propres à Beauté, dont **deux obligatoires** :
`date_peremption` et `scelle`. Les deux autres — `contenance`, `type_peau` —
sont facultatifs mais valorisés au tri.

`scelle` prend deux valeurs seulement : **scellé** ou **entamé**. Pas de
troisième option floue : c'est l'information qui décide de l'achat, et un
« état moyen » n'aiderait personne.

**Base.** `article.attributs jsonb` + colonne générée `peremption_le date`
indexée. Une colonne générée plutôt qu'un champ dupliqué : elle permet
d'exclure les périmés d'une liste sans parcourir la table.

**Backend.** `champsManquants('beaute', fiche)` — déjà écrit et testé au socle.
Refus `422 CHAMPS_MANQUANTS` **nommant les champs**.

**Frontend.** Le formulaire est construit depuis les règles de l'univers, pas
codé en dur : ouvrir `JP Tech` ne demandera pas un nouvel écran.

**Test** : un article sans péremption est refusé · `scelle` n'accepte que deux
valeurs · la vignette affiche l'état du flacon, pas seulement la fiche.

```issues
feature: F1.21
titre: Fiche beauté — péremption, contenance, scellé, type de peau
epic: "01"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F21.3]
```

---

## F1.22 — Refus de publication d'un produit périmé

`P1 · M · complet` — **Règles** R-Y13 · **Dépend de** F1.21

**Conception.** Le contrôle a lieu **deux fois** : à la publication, et **au
moment de l'achat**. La seconde vérification est la plus importante — un
article peut périmer en stock, et c'est le cas le plus probable, pas le plus
rare.

**Cas d'échec** : une acheteuse ajoute au panier un article qui périme pendant
sa réservation de trente minutes. On refuse le paiement avec un message clair,
et **la réservation est libérée** — garder le stock bloqué sur un article
invendable serait absurde.

**Base.** Un index partiel sur `peremption_le` permet à la fois d'exclure les
périmés des listes et d'alimenter l'alerte de `F1.24`.

**Backend.** `422 PRODUIT_PERIME` à la publication. Au paiement, la
vérification est dans la même transaction que la réservation.

**Test** : publication refusée sur une date passée · achat refusé sur un
article périmé en stock · la réservation est bien libérée · un article qui
périme **demain** reste achetable aujourd'hui.

```issues
feature: F1.22
titre: Refus de publication et d'achat d'un produit périmé
epic: "01"
phase: P1
prio: M
etapes: [conception, bdd, backend, frontend]
depend: [F1.21]
```

---

## F1.23 — Déclaration de provenance

`P1 · S · moyen` — **Règles** R-Y15 · **Dépend de** F1.21

Le vendeur déclare d'où vient le produit. **Texte libre obligatoire, pièce
justificative facultative** mais valorisée au tri.

**Pourquoi pas la facture obligatoire** : une revendeuse qui achète en gros à
Antananarivo n'a souvent aucune facture. L'exiger exclurait la majorité des
vendeuses réelles. La déclaration engage sa responsabilité ; la pièce la
renforce.

**Base.** `attributs->>'provenance'` + `article.provenance_justifiee boolean`
pour le tri.

**Test** : la provenance est exigée en Beauté, pas en Mode · l'article avec
pièce remonte au classement.

```issues
feature: F1.23
titre: Déclaration de provenance en Beauté
epic: "01"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.21]
```

---

## F1.24 — Alerte de péremption au vendeur

`P2 · S · cadre` — **Dépend de** F1.22, S5

Un travail quotidien avertit le vendeur des articles qui périment sous trente
jours. Sans cette alerte, il découvre l'invendable au refus de paiement d'une
cliente — le pire moment.

File `notification`, clé métier `peremption:<article_id>:<mois>` pour ne pas
avertir deux fois le même mois.

```issues
feature: F1.24
titre: Alerte de péremption au vendeur
epic: "01"
phase: P2
prio: S
etapes: [conception, backend, frontend]
depend: [F1.22]
```
