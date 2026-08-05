# EP15 — Créatrices, affiliation et précommande

> 13 fonctionnalités · vague 2 · module `createur`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

> **Ce qu'on vend à la créatrice : un revenu sans capital et sans risque de stock.** Tout le reste de l'épique découle de là.

**La distinction fondatrice** : une créatrice **n'est pas** une vendeuse. Elle ne détient pas de stock, n'expédie pas, ne gère pas de litige. Elle recommande et touche une commission. Une même personne peut cumuler les deux rôles *(F0.4)*, mais **les deux tableaux de bord et les deux portefeuilles restent séparés** — sinon plus personne ne comprend d'où vient son argent.

**Le principe qui gouverne tous les écrans de cette épique** : on ne montre pas des vues à la créatrice, **on lui montre de l'argent**. C'est la différence entre JP et les réseaux sociaux où elle publie déjà gratuitement.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F15.1 | Statut créatrice et vérification | P1 | M | complet |
| F15.2 | Profil créatrice public | P1 | M | complet |
| F15.3 | « Ma sélection » | P1 | M | complet |
| F15.4 | Lien et attribution d'affiliation | P1 | M | complet |
| F15.5 | Commission d'affiliation ⚠️ | P1 | M | complet |
| F15.6 | Tableau de bord créatrice | P1 | M | complet |
| F15.10 | Portefeuille et retrait créatrice | P1 | M | complet |
| F15.8 | **Précommande groupée avec seuil** ⚠️ | P1 | S | complet |
| F15.9 | Mode revendeuse | P1 | S | moyen |
| F15.7 | Paliers de créatrice | P2 | S | moyen |
| F15.11 | Demande de partenariat | P2 | S | moyen |
| F15.12 | Article offert contre contenu | P2 | C | cadre |
| F15.13 | Annuaire de fournisseurs ⚠️ | P3 | W | cadre |

---

## F15.4 / F15.5 — Affiliation : lien, attribution, commission

`P1 · M · complet` — **Règles** R-N1, R-N2, R-N3 · **⚠️ décisions n° 9 et 12**

### 1. Conception

**Chaque article qu'une créatrice attache à un contenu ou met dans sa sélection porte son identifiant** *(F14.5)*. Un lien partageable hors application fonctionne pareil.

**Attribution** *(R-N2)* : la vente est attribuée à **la dernière créatrice cliquée** dans une fenêtre de N jours. ⚠️ N à trancher — hypothèse : **7 jours**.

**⚠️ Qui paie la commission d'affiliation ?** *(décision n° 9)* Trois options : la vendeuse sur sa marge, JP sur sa commission, ou un partage. **Recommandation : prélevée sur la commission JP en V1** — cela ne coûte rien de plus à la vendeuse, elle accepte donc facilement, et JP achète de l'acquisition à un prix connu. À réévaluer une fois le volume établi.

**Le vendeur doit pouvoir refuser l'affiliation sur ses articles** *(R-N3)* — sinon il subit une charge qu'il n'a pas choisie. Réglage `profil_vendeur.affiliation_autorisee`, respecté à l'attachement *(F14.5)*.

**Ce que voit chacun** :
- **C** : chaque vente attribuée, son montant, son gain.
- **V** : sur chaque commande, si elle vient d'une créatrice, et le montant de la commission versée.

**Point technique délicat** : la fenêtre d'attribution suppose de journaliser les clics d'affiliation avec une date d'expiration, puis de résoudre l'attribution **à la création de la commande** — pas à la confirmation, sinon un clic expiré entre-temps ferait perdre la commission à tort.

### 2. Structure de code

```
apps/api/src/modules/createur/
├─ affiliation.ts        enregistrerClic() · resoudreAttribution()
├─ commission.ts         calcul, répartition, écritures
├─ affiliation.test.ts   ← la fenêtre, le dernier clic, les cas limites
apps/api/src/modules/commande/service.ts    appelle resoudreAttribution()
apps/mobile/src/features/createur/composants/BandeauGain.tsx
```

### 3. Base de données

Migration `..._f15_4_affiliation` — `clic_affiliation` (CDC §3.6), `commande.createur_id`, `ligne_commande.commission_createur`.

```sql
CREATE INDEX clic_attribution ON clic_affiliation
  (utilisateur_id, article_id, expire_le DESC);
```

Cet index est celui qui répond, à chaque création de commande, à la question « cette vente appartient-elle à une créatrice ? ». Il doit être exact et rapide.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — creator's earning indicator on a product she can attach.
A product tile with, in its lower area, a distinct accent chip reading "Vous
gagnez 2 500 Ar" and, below the price, a muted line "Vendu par Miora Boutique".
Produce a second variant for a shop that refuses affiliation: the chip replaced by
a grey "Affiliation non autorisée" chip and the tile slightly dimmed.

Screen 2 — seller's view of an affiliated order.
An order row expanded into a card with a creator attribution block: the creator
avatar and name "Ony", a line "Vente générée par cette créatrice", and the
breakdown "Vente 50 000 Ar · Commission JP 2 500 Ar · dont créatrice 1 500 Ar ·
Vous recevez 47 500 Ar" with the seller's net in bold and a green note "La
commission créatrice est prélevée sur la part de JP — votre net est inchangé."

Screen 3 — seller setting: a toggle row "Autoriser les créatrices à vendre mes
articles" (on), with a helper line "Elles font connaître vos articles et sont
payées sur la commission JP, pas sur votre marge." and a stat line "12 créatrices
ont sélectionné vos articles · 84 ventes générées".
```

### 5. Backend

`POST /affiliation/clic` `{ createurId, articleId }` (appelé à l'ouverture d'une fiche depuis un contenu ou un lien de créatrice) · résolution à `POST /panier/valider` · écritures de commission à `paiement.confirme`.

**Tests** : dernier clic dans la fenêtre → attribué ; clic hors fenêtre → non attribué ; deux créatrices, la plus récente gagne ; article d'un vendeur refusant l'affiliation → **aucune commission**, et l'attachement était déjà refusé *(F14.5)* ; commission prélevée sur la part JP → **net vendeur inchangé** (assertion sur les écritures) ; commande annulée → commission reprise par écriture inverse ; fenêtre paramétrable *(R-O1)*.

### 6. Frontend

Le gain potentiel est affiché **avant** l'attachement : c'est ce qui fait qu'une créatrice choisit un article plutôt qu'un autre.

```issues
feature: F15.4
titre: Lien et attribution d'affiliation traçables
epic: "15"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F14.5, F3.7]
```
```issues
feature: F15.5
titre: Commission d'affiliation sur les ventes générées
epic: "15"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F15.4, F4.4]
```

---

## F15.8 — Précommande groupée avec seuil ⚠️

`P1 · S · complet` — **Recette RB3** · **décision ouverte n° 8, la plus délicate du produit**

### 1. Conception

**La fonctionnalité qui supprime la barrière du capital. Probablement le meilleur argument de recrutement des créatrices.**

- **C** : publie un article en précommande → fixe le **prix**, le **seuil** (ex. 15 commandes), la **date limite** et le **délai de livraison annoncé** → publie un clip.
- **A** : voit **« Précommande — livraison prévue vers le [date] · 9 sur 15 commandes »** → « Je prends » → **elle paie, et l'argent est séquestré** *(F4.4)* → elle voit le compteur monter.
- **Seuil atteint** : les commandes sont confirmées, la créatrice commande chez son fournisseur, expédie à réception.
- **Seuil non atteint à la date limite** : **remboursement automatique et intégral de toutes les acheteuses** *(RB3)*. Aucune intervention, aucune discussion. **C'est ce qui rend la précommande acceptable.**

**⚠️ Trois décisions ouvertes, importantes** :
1. **Quand libérer les fonds à la créatrice ?** Tout garder jusqu'à la livraison la met en incapacité d'acheter le stock, donc la fonctionnalité ne sert à rien ; tout libérer au seuil expose l'acheteuse à exactement l'arnaque que JP prétend supprimer. **Piste : libérer une avance plafonnée** au seuil (par exemple le prix d'achat fournisseur), le solde à la réception confirmée.
2. **Délai maximal** entre l'atteinte du seuil et l'expédition, au-delà duquel le remboursement est automatique. Sans cette limite, la précommande devient une machine à litiges.
3. **Plafond de précommandes simultanées** par créatrice.

**Recommandation de mise en œuvre** : coder l'avance comme un **paramètre** (`precommande_avance_taux`, `precommande_delai_expedition_max_j`, `precommande_plafond_simultane`), pour que le pilote tranche par la mesure. Le remboursement automatique, lui, n'est pas paramétrable : c'est un invariant *(RB3)*.

**État de commande supplémentaire** *(CDC §4.1)* : `EN_ATTENTE_SEUIL` s'insère entre `PAYEE` et `EN_PREPARATION`. Sortie vers `EN_PREPARATION` si le seuil est atteint, vers `REMBOURSEE` **automatiquement** à la date limite sinon.

### 2. Structure de code

```
apps/api/src/modules/createur/
├─ precommande.ts          creer() · engager() · verifierSeuil() · echouer()
├─ avance.ts               libération plafonnée, paramétrée
├─ precommande.test.ts     ← RB3 : le remboursement automatique intégral
apps/api/src/jobs/precommandesEcheances.ts     seuil, date limite, délai d'expédition
apps/mobile/src/features/precommande/
├─ ecrans/{EcranCreation,EcranSuivi}.tsx
└─ composants/{CompteurSeuil,BandeauPrecommande}.tsx
```

### 3. Base de données

Migration `..._f15_8_precommande` — `precommande`, `precommande_engagement` (CDC §3.6), `article.type_vente = 'precommande'`.

```sql
CREATE INDEX precommande_echeance ON precommande (date_limite)
  WHERE statut = 'ouverte';
CREATE INDEX precommande_expedition ON precommande (date_expedition_max)
  WHERE statut = 'seuil_atteint';
ALTER TABLE precommande ADD CONSTRAINT seuil_positif CHECK (seuil > 0);
```

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — pre-order product page (buyer).
Vertical order: the image carousel with a distinct accent ribbon "PRÉCOMMANDE";
the price "45 000 Ar"; the product title; a prominent threshold card: a horizontal
progress bar at 60 % with the label "9 sur 15 commandes" and, under it, two lines
"Livraison prévue vers le 12 septembre" and "Il reste 4 jours pour atteindre
l'objectif"; then a green reassurance card with a shield icon: "Si l'objectif
n'est pas atteint, vous êtes remboursée automatiquement et intégralement."
(this card must be as visible as the price); the creator row with avatar, name
"Ony" and a verified badge; the description. Pinned bottom: a full-width primary
button "Je précommande 45 000 Ar".

Screen 2 — the same page after the threshold is reached: the progress bar full and
green, the label replaced by "Objectif atteint ! 17 commandes", and a line
"Expédition prévue avant le 20 septembre".

Screen 3 — buyer's pre-order tracking: a timeline with four steps "Payé et
séquestré", "Objectif atteint", "En cours de fabrication / commande fournisseur",
"Expédié", plus a countdown card "Expédition garantie avant le 20 septembre —
sinon remboursement automatique".

Screen 4 — creator creation form: fields "Prix de vente", "Objectif (nombre de
commandes)", "Date limite", "Délai de livraison annoncé", with a live simulation
card computing "Si l'objectif est atteint : 15 × 45 000 = 675 000 Ar · Avance
disponible immédiatement : 405 000 Ar · Solde à la livraison : 236 250 Ar" and a
warning line "Vous devrez expédier avant le 20 septembre, sinon les clientes
seront remboursées automatiquement."
```

### 5. Backend

`POST /precommandes` · `GET /precommandes/:id` · `POST /precommandes/:id/engagements` (paiement séquestré) · travaux d'échéance.

**Tests — RB3, critère bloquant :**
- Seuil **non atteint** à la date limite → **remboursement automatique et intégral de toutes les engagées, sans intervention humaine**.
- Seuil atteint → commandes confirmées, avance libérée **au taux paramétré**, solde retenu.
- Délai d'expédition dépassé → remboursement automatique.
- Engagement au moment exact de la date limite → tranché par l'horodatage serveur, de façon déterministe.
- Double exécution du travail d'échéance → **un seul remboursement**.
- Plafond de précommandes simultanées par créatrice respecté.
- Écritures financières cohérentes sur les trois chemins (échec, succès complet, dépassement de délai).

### 6. Frontend

La carte de réassurance sur le remboursement automatique est **aussi visible que le prix**. C'est elle qui rend acceptable de payer pour un objet qui n'existe pas encore.

```issues
feature: F15.8
titre: Précommande groupée avec seuil
epic: "15"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.4, F15.1]
```

---

## F15.1 / F15.2 — Statut créatrice, vérification et profil public

`P1 · M · complet` — **Règles** R-N4

### 1. Conception

**« Devenir créatrice » → vérification d'identité identique au vendeur** *(F0.6)* : sans elle, pas de paiement possible et **aucune protection en cas d'usurpation** — argument à présenter dans cet ordre, parce que c'est le vrai bénéfice pour elle.

Elle renseigne ses réseaux existants, son style, ses tailles. Validée par **OP**.

**Profil public** : ses contenus, sa sélection, son badge *(F18.4)*, et **le nombre d'articles vendus grâce à elle** — c'est sa carte de visite auprès des vendeurs comme des acheteuses.

**Le cumul de rôles est possible** *(F0.4)* mais les tableaux de bord et portefeuilles restent séparés.

### 2. Structure de code
```
apps/api/src/modules/createur/{profil,verification}.ts
apps/mobile/src/features/createur/ecrans/{EcranDevenirCreatrice,EcranProfilPublic}.tsx
apps/web/src/pages/createur/[slug].tsx      aperçu de lien (F7.11)
```

### 3. Base de données
`profil_createur` (CDC §3.1) avec `nom_public`, `bio`, `reseaux[]`, `statut_verification`, `palier`, `badge_verifie`, `nb_abonnes`, `slug UQ`, `nb_ventes_generees`.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — "Devenir créatrice" pitch screen.
Vertical order: an illustration of a phone filming clothes; title "Gagnez de
l'argent avec ce que vous faites déjà"; three benefit rows with icons: "Aucun
stock à acheter", "Aucun colis à envoyer", "Vous êtes payée sur chaque vente";
an earnings example card "Une cliente achète une robe à 50 000 Ar → vous recevez
1 500 Ar"; a requirements card "Ce dont nous avons besoin : votre pièce
d'identité, une photo de votre visage, votre numéro Mobile Money" with the
explanatory line "C'est ce qui nous permet de vous payer et de vous protéger si
quelqu'un usurpe votre identité."; a primary button "Commencer".

Screen 2 — public creator profile.
A cover area with the creator avatar overlapping, the public name "Ony", a
verified creator badge, a bio line, a social-links row; a three-stat row
"8 400 abonnés · 128 contenus · 340 articles vendus grâce à elle"; a "Suivre"
primary button and a share icon; tabs "Contenus · Ma sélection · Précommandes";
a three-column media grid under Contenus.
```

### 5. Backend
`POST /moi/roles/createur` · `GET /createurs/:idOuSlug` (public) · réutilise la file de vérification *(F11.1)*.

**Tests** : vérification exigée avant tout paiement ; profil public accessible sans compte ; cumul vendeuse/créatrice → **portefeuilles distincts** (assertion sur les soldes) ; nombre de ventes générées exact.

### 6. Frontend
Argumentaire orienté revenu, pas fonctionnalités. Le profil public est partageable avec aperçu de lien.

```issues
feature: F15.1
titre: Statut créatrice et vérification
epic: "15"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F0.6]
```
```issues
feature: F15.2
titre: Profil créatrice public
epic: "15"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F15.1]
```

---

## F15.3 — « Ma sélection »

`P1 · M · complet`

### 1. Conception
**C** parcourt le catalogue de tous les vendeurs → ajoute des articles à sa sélection → les organise par thème (« mes basiques », « spécial mariage ») → sa sélection est **une vitrine publique**.

**A** achète depuis la sélection d'Ony **comme depuis n'importe quelle vitrine** — c'est le vendeur d'origine qui expédie, Ony touche sa commission. **L'acheteuse ne voit aucune complexité supplémentaire**, et c'est le point de conception : elle ne doit pas avoir à comprendre l'affiliation.

**V** voit quelles créatrices ont sélectionné ses articles et combien elles lui rapportent.

### 2. Structure de code
`modules/createur/selection.ts` · `apps/mobile/src/features/createur/ecrans/{EcranMaSelection,EcranSelectionPublique}.tsx`.

### 3. Base de données
`selection`, `selection_article` (CDC §3.6). Les articles d'un vendeur refusant l'affiliation *(R-N3)* ne peuvent pas y entrer.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — "Ma sélection" (creator, editing view).
Vertical order: title, and a theme tab row "Mes basiques · Spécial mariage ·
+ Nouveau thème"; a two-column grid of selected product tiles, each showing the
image, the price, the shop name in small text, an accent chip "vous gagnez
2 500 Ar", and a remove X; a dashed "+ Ajouter des articles" tile opening the
catalogue browser. A summary bar at the top: "24 articles · 84 ventes générées ·
126 000 Ar gagnés".
Produce the public view of the same selection: identical grid but without the
earning chips and without remove marks, with a header "La sélection d'Ony" and a
"Suivre Ony" button — the buyer must see a normal storefront.
```

### 5. Backend
`GET/POST /createur/selection` · `GET /createurs/:id/selection` (public) · `GET /vendeur/createurs` (qui a sélectionné mes articles).

**Tests** : ajout, retrait, thèmes ; article d'un vendeur refusant l'affiliation → refusé ; achat depuis la sélection → commande normale, vendeur d'origine expédie, commission attribuée ; vue publique **sans** information de commission.

### 6. Frontend
La vue publique doit être indistinguable d'une vitrine ordinaire côté acheteuse.

```issues
feature: F15.3
titre: Ma sélection, vitrine d'articles d'autres vendeurs
epic: "15"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F15.4]
```

---

## F15.6 / F15.10 — Tableau de bord et portefeuille créatrice

`P1 · M · complet` — **Règles** R-N5

### 1. Conception

**Entonnoir complet** : contenus publiés, vues, clics vers article, « Je prends », ventes confirmées, **gains**. Par contenu et par période. Plus : ses meilleurs contenus, ses meilleurs articles, ses heures de publication les plus efficaces.

**On ne lui montre pas des vues, on lui montre de l'argent** *(R-N5)*. C'est la différence entre JP et les réseaux sociaux où elle publie déjà gratuitement — et c'est ce qui la fait rester.

**Portefeuille séparé** de celui de vendeuse *(F0.4)*, avec les mêmes règles de retrait *(F4.8)* : vers le numéro mobile money vérifié uniquement.

### 2. Structure de code
`modules/createur/tableauDeBord.ts` · `modules/portefeuille/service.ts` (type `createur`) · `apps/mobile/src/features/createur/ecrans/{EcranTableauBord,EcranMonArgent}.tsx`.

### 3. Base de données
`portefeuille.type = 'createur'`, agrégats depuis `statistique_contenu` *(F14.17)* et les commissions.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — creator dashboard.
Vertical order: a period selector "7 jours · 30 jours · Tout"; a hero earnings
card in accent color with the largest number on the screen: "126 000 Ar gagnés"
and a green delta "+18 % vs mois dernier"; then the funnel as five compact rows
with numbers and conversion percentages: "Contenus publiés 12", "Vues 42 000",
"Clics article 3 100 (7 %)", "Je prends 210 (7 %)", "Ventes confirmées 168 (80 %)";
then a "Vos meilleurs contenus" list of three rows, each with a thumbnail, views
and, in bold, the earnings; then "Vos meilleurs articles" with three product rows
and their generated revenue; then an insight card "Vos clips publiés entre 19 h et
21 h rapportent deux fois plus"; then a wallet summary row "Disponible : 84 000 Ar"
with a "Retirer" button.
Views must never be the largest figure on this screen.
```

### 5. Backend
`GET /createur/tableau-de-bord?periode=` · `GET /createur/portefeuille` · `POST /createur/portefeuille/retrait`.

**Tests** : entonnoir cohérent ; gains = somme des commissions confirmées ; portefeuille créatrice **distinct** du portefeuille vendeuse pour un compte cumulant les deux ; retrait vers numéro vérifié seulement ; insight horaire calculé sur données réelles.

### 6. Frontend
Le montant gagné est le premier et le plus gros élément. Les vues sont une ligne parmi d'autres.

```issues
feature: F15.6
titre: Tableau de bord créatrice, vues vers gains
epic: "15"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F15.4, F14.17]
```
```issues
feature: F15.10
titre: Portefeuille et retrait créatrice
epic: "15"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F15.5, F4.8]
```

---

## F15.9 — Mode revendeuse

`P1 · S · moyen`

**Conception** — une créatrice qui achète réellement du stock chez un fournisseur et le revend sous son nom **devient une vendeuse** au sens du produit : vérification vendeur *(F0.6)*, stock *(F1.6)*, expédition, litiges.

**Ce n'est donc pas une fonctionnalité séparée, c'est un parcours de bascule** créatrice → vendeuse, à rendre fluide et à **expliquer clairement** : les responsabilités changent, et elle doit le comprendre avant, pas au premier litige.

**Structure** — réutilise `F0.4` (bascule de rôle). Écran d'explication propre.

**Design** — Prompt Stitch : *role transition screen "Devenir vendeuse" with two side-by-side comparison columns "Créatrice (aujourd'hui)" and "Vendeuse (après)", each listing four rows: stock (aucun / à votre charge), expédition (par la boutique / par vous), litiges (jamais / vous répondez), revenus (commission / marge complète); a primary button "Je comprends, devenir vendeuse" and a secondary "Rester créatrice".*

**Tests** : bascule conservant contenus, abonnés et sélection ; portefeuille créatrice conservé et distinct ; écran d'explication non contournable.

```issues
feature: F15.9
titre: Mode revendeuse, bascule créatrice vers vendeuse
epic: "15"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F0.4, F15.1]
```

---

## F15.7 — Paliers de créatrice

`P2 · S · moyen`

**Conception** — paliers fondés sur les **ventes générées** (pas sur l'audience) : commission majorée, accès anticipé aux nouveautés, mise en avant. Réutilise le mécanisme de paliers de `F7.6` avec un score différent.

**Le critère est le chiffre généré, pas le nombre d'abonnés.** Une créatrice à 2 000 abonnés très engagés vaut mieux qu'une à 20 000 qui ne vend rien, et le produit doit récompenser la vente.

**Base de données** — `profil_createur.palier`, `palier_createur (rang, seuil_ventes, taux_commission, avantages)` — global, défini par JP, contrairement aux paliers vendeur qui sont par boutique.

**Design** — Prompt Stitch : *creator tier screen with a medal for the current tier, a progress bar toward the next one labelled "Encore 42 ventes pour passer Or", a table of the four tiers showing their commission rates and perks, and a highlighted row for the current tier.*

**Tests** : palier calculé sur les ventes confirmées ; taux de commission majoré appliqué aux nouvelles ventes ; passage de palier notifié.

```issues
feature: F15.7
titre: Paliers de créatrice
epic: "15"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F15.5]
```

---

## F15.11 — Demande de partenariat vendeuse ↔ créatrice

`P2 · S · moyen`

**Conception** — **V** cherche des créatrices par audience, style, taille, région → propose un partenariat (commission majorée, article offert contre contenu). **C** reçoit, accepte ou refuse, suit ses partenariats.

Sans cette fonctionnalité, ces accords se font sur Messenger et **JP perd la traçabilité — et la commission**.

**Base de données** — `partenariat (id, vendeur_id, createur_id, type, conditions jsonb, statut, cree_le)`.

**Backend** — `GET /vendeur/createurs/recherche?audience=&style=&region=`, `POST /partenariats`, `POST /partenariats/:id/decision`.

**Design** — Prompt Stitch : *creator discovery screen for sellers with filter chips (audience size, style, size range, region), creator cards showing avatar, name, follower count, generated sales, average conversion and a "Proposer un partenariat" button; plus a proposal form with commission rate, optional free-product offer, a message field and expected deliverables.*

**Tests** : recherche filtrée ; proposition, acceptation, refus ; commission majorée appliquée aux ventes du partenariat.

```issues
feature: F15.11
titre: Demande de partenariat vendeuse et créatrice
epic: "15"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F15.5]
```

---

## F15.12 — Envoi d'un article offert contre contenu

`P2 · C · cadre`

**Conception** — le vendeur envoie un article gratuitement contre engagement de contenu. **Le suivi de l'envoi et la vérification de la publication passent par la plateforme**, sinon ces accords se font ailleurs et JP perd la traçabilité.

**Impact base de données** — `partenariat_envoi (partenariat_id, colis_id, contenu_attendu, contenu_publie_id, echeance)`.

**Point d'attention** — que se passe-t-il si le contenu n'est jamais publié ? À définir : rien (le vendeur assume), ou une pénalité de palier *(F15.7)*. Ne pas laisser ce cas implicite.

```issues
feature: F15.12
titre: Envoi d'un article offert contre contenu
epic: "15"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F15.11]
```

---

## F15.13 — Annuaire de fournisseurs et sourcing ⚠️

`P3 · W · cadre`

**Conception** — annuaire de fournisseurs pour les créatrices en précommande *(F15.8)* et les revendeuses *(F15.9)*.

**⚠️ Pourquoi c'est délicat** : JP se placerait en intermédiaire d'une relation qu'il ne contrôle pas, avec un risque de responsabilité si un fournisseur référencé fait défaut — et un risque de désintermédiation, puisque les vendeurs pourraient contourner la plateforme en s'organisant directement. À n'ouvrir qu'avec un cadre clair, ou pas du tout.

```issues
feature: F15.13
titre: Annuaire de fournisseurs et sourcing
epic: "15"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F15.8]
```

---

*Épique suivante : [EP16-cadeau](EP16-cadeau.md).*
