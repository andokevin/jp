# EP17 — Gamification, habitude et dressing

> 13 fonctionnalités · vague 2 · modules `fidelite`, `contenu`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

> **Tous les mécanismes de cette épique sont adossés à un fait vrai.** Pas de faux compteur, pas de faux compte à rebours, pas de progression truquée *(RB9)*. Sur un produit dont l'actif est la confiance, la manipulation détruit plus qu'elle ne rapporte.

**Les deux exceptions assumées, et ce qu'on en fait.** La série de connexion *(F17.1)* et les classements hebdomadaires *(F17.5)* ne sont **pas** adossés au commerce : c'est de l'engagement pour l'engagement. Ils restent en phase 2, priorité basse, et il faut les regarder en face : ce sont les deux fonctionnalités du produit qui se rapprochent le plus d'un mécanisme manipulatoire.

**Recommandation, si l'une des deux doit sauter : la série de connexion.** Récompenser quelqu'un pour avoir ouvert l'application, sans qu'il achète ni ne publie, n'apporte rien au modèle et fragilise le discours sur l'éthique de conception. Le rendez-vous récurrent *(F17.4)* obtient le même résultat de façon plus honnête, et pour moins cher.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F17.4 | Rendez-vous récurrents et drops | P1 | S | complet |
| F17.9 | Quiz de style à l'inscription | P1 | S | complet |
| F17.12 | Rappel de panier abandonné, plafonné | P1 | S | complet |
| F17.13 | Cagnotte créditée par l'unboxing | P1 | S | complet |
| F17.10 | **Dressing virtuel** | P2 | S | complet |
| F17.2 | Badges et accomplissements | P2 | S | moyen |
| F17.3 | Progression visible vers l'avantage suivant | P2 | S | moyen |
| F17.6 | Défis avec hashtag | P2 | S | moyen |
| F17.11 | Composition de looks depuis le dressing | P2 | C | moyen |
| F17.1 | Série de connexion quotidienne ⚠️ | P2 | C | cadre |
| F17.5 | Classements hebdomadaires ⚠️ | P2 | C | cadre |
| F17.7 | Boîte surprise | P3 | C | cadre |
| F17.8 | Jeux pendant le direct | P3 | C | cadre |

---

## F17.10 / F17.11 — Le dressing virtuel

`P2 · S / C · complet` — **le mécanisme de rétention le plus fort côté acheteuse**

### 1. Conception

**Chaque article reçu et confirmé entre automatiquement dans son dressing.** Elle y ajoute ce qu'elle possède déjà (photo), compose des looks en associant les pièces, et publie un look *(F14.6)* **avec les articles JP achetables attachés** *(F14.5)*.

**L'effet business, qui justifie à lui seul la fonctionnalité** : quitter JP, ce n'est plus perdre une application, c'est **perdre sa garde-robe et son historique de style**. Et chaque look publié est du contenu gratuit avec des articles cliquables.

**V** : voit dans quels looks ses articles sont associés — signal de style précieux, et gratuit.

**Le dressing est aussi la porte d'entrée du dépôt d'annonce** *(F1.17)* : une pièce du dressing se met en vente **sans re-photographier**. C'est le raccourci qui rend le vendeur particulier crédible, et il n'existe que grâce au dressing.

**Alimentation automatique** : consommateur de `commande.confirmee` *(PLAN_SOCLE §6)*. L'entrée au dressing ne doit **jamais** bloquer la confirmation — asynchrone et idempotent.

### 2. Structure de code

```
apps/api/src/modules/fidelite/
├─ dressing.ts          entrées automatiques, ajouts manuels
├─ looks.ts             composition, publication
└─ dressing.test.ts
apps/api/src/jobs/entreeDressing.ts        consommateur de commande.confirmee
apps/mobile/src/features/dressing/
├─ ecrans/{EcranDressing,EcranAjoutPiece,EcranCompositionLook}.tsx
├─ composants/{GrillePieces,ToileLook,SelecteurCategorie}.tsx
└─ hooks/useDressing.ts
```

### 3. Base de données

Migration `..._f17_10_dressing` :

```
piece_dressing
  id PK · utilisateur_id FK
  origine(achat_jp|ajout_manuel) · commande_id FK null · article_id FK null
  photo_url · categorie · couleur · taille · marque null
  cree_le · IDX(utilisateur_id, categorie)

look
  id PK · utilisateur_id FK · nom null · contenu_id FK null
  cree_le
look_piece
  look_id FK · piece_id FK · position jsonb
  PK(look_id, piece_id)
```

Une pièce issue d'un achat conserve `article_id` : c'est ce qui rend l'article **achetable** quand le look est publié, et c'est ce qui rattache la vente au vendeur d'origine.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — "Mon dressing".
Vertical order: title "Mon dressing (34 pièces)"; a category chip row "Tout ·
Hauts · Bas · Robes · Chaussures · Accessoires"; a three-column grid of garment
tiles on a clean neutral background, each showing the item photo; tiles from JP
purchases carry a tiny accent JP dot in the corner, manually added ones do not;
a dashed "+ Ajouter une pièce" tile first in the grid. Long-pressing a tile opens
an action sheet with "Composer un look", "Mettre en vente" (with a small price tag
icon), and "Retirer du dressing".
A subtle header line: "Vos achats JP arrivent ici automatiquement."

Screen 2 — look composition canvas.
A neutral canvas occupying the top two-thirds where garment cut-outs can be
dragged and layered — showing a top, a skirt and shoes arranged as an outfit;
the bottom third is a horizontal scroll tray of dressing pieces filtered by
category tabs; a name field "Nom du look" with placeholder "Vendredi soir";
and two buttons: primary "Publier ce look" and secondary "Enregistrer sans
publier". Under the primary button, a muted line "2 articles JP seront
achetables sur votre look."

Screen 3 — published look as seen in the feed: the composed image, the author row,
the caption, and two tappable product pills anchored on the garments, each with
price; plus a "Composer mon look" call-to-action at the bottom.

Screen 4 — seller insight: a card titled "Vos articles dans les looks" showing
three look thumbnails with the line "Votre robe wax est associée 12 fois à des
sandales plates" — a style signal, not a vanity metric.
```

### 5. Backend

`GET /moi/dressing` · `POST /moi/dressing/pieces` (ajout manuel) · `DELETE /moi/dressing/pieces/:id` · `POST /moi/looks` · `POST /moi/looks/:id/publier` (crée un contenu avec articles attachés, `F14.5`).

**Tests** : commande confirmée → pièce ajoutée **automatiquement**, une seule fois (idempotence) ; échec de l'ajout → confirmation de commande **non affectée** ; look publié → contenu avec articles attachés et pastilles positionnées ; pièce ajoutée manuellement → **pas d'article attachable** depuis elle (elle ne vient pas du catalogue) ; look publié avec **seulement** des pièces manuelles → refusé *(RB5)*, avec un message explicite ; mise en vente depuis le dressing → annonce pré-remplie *(F1.17)*.

### 6. Frontend

Toile de composition utilisable au doigt sur un écran de 5 pouces : peu de pièces à la fois, aimantation, pas de rotation libre. Le découpage automatique de l'arrière-plan est **hors périmètre V1** — trop coûteux sur l'appareil de référence, et une photo sur fond neutre suffit.

```issues
feature: F17.10
titre: Dressing virtuel
epic: "17"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.5]
```
```issues
feature: F17.11
titre: Composition et publication de looks depuis le dressing
epic: "17"
phase: P2
prio: C
etapes: [conception, bdd, design, backend, frontend]
depend: [F17.10, F14.6]
```

---

## F17.4 — Rendez-vous récurrents et drops programmés

`P1 · S · complet` — **le mécanisme de rétention le moins coûteux et le moins agressif**

### 1. Conception

**V / C** programme un rendez-vous fixe (« tous les vendredis 18 h »). Ses abonnés le voient sur son profil et reçoivent un rappel.

**A** sait quand revenir. **L'habitude régulière vaut mieux qu'une notification de plus** — et c'est l'argument qui justifie de préférer cette fonctionnalité à la série de connexion *(F17.1)*.

**Le rendez-vous alimente aussi l'état vide du calendrier des événements** *(F20.9, R-W10)* : quand il n'y a pas d'événement JP, ce sont les rendez-vous des comptes suivis qui remplissent l'écran. Une fonctionnalité modeste qui rend un autre écran utile.

**Un seul rappel par rendez-vous**, soumis aux plafonds de notification *(R-U4)*.

### 2. Structure de code
```
apps/api/src/modules/direct/rendezVous.ts
apps/api/src/jobs/rappelsRendezVous.ts
apps/mobile/src/features/vitrine/composants/CarteRendezVous.tsx
apps/mobile/src/features/direct-vendeur/ecrans/EcranRendezVous.tsx
```

### 3. Base de données
```
rendez_vous
  id PK · proprietaire_id FK · type(vendeur|createur)
  jour_semaine int · heure time · fuseau
  titre null · actif bool · cree_le
  UQ(proprietaire_id, jour_semaine, heure)
```

Le rendez-vous est **récurrent par nature** : stocker une occurrence par semaine remplirait la table pour rien.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — recurring appointment card on a storefront (buyer view).
A bordered card with a calendar icon, a headline "Tous les vendredis à 18 h",
a subtitle "Arrivage et direct", a countdown line "Prochain rendez-vous dans
2 jours", and an outline button "Me rappeler" that becomes a filled "Rappel
activé" with a check.

Screen 2 — seller setup: a day-of-week chip row "L M M J V S D" with V selected,
a time picker "18:00", an optional title field, a toggle "Prévenir mes abonnés",
a preview line "1 240 abonnés verront ce rendez-vous sur votre vitrine", and a
primary button "Enregistrer mon rendez-vous". A muted line: "Un rappel maximum
par rendez-vous — nous ne surchargeons pas vos abonnés."
```

### 5. Backend
`GET/POST/PATCH /vendeur/rendez-vous` · inclus dans la projection de vitrine *(F1.19)* et dans le calendrier *(F20.9)* · travail de rappel.

**Tests** : rappel envoyé une seule fois par occurrence ; plafonds respectés ; rendez-vous inactif → aucun rappel ; affiché sur la vitrine et dans l'état vide du calendrier ; fuseau correct.

### 6. Frontend
Carte sur la vitrine et sur le profil créatrice. Bouton de rappel avec état persistant.

```issues
feature: F17.4
titre: Rendez-vous récurrents et drops programmés
epic: "17"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F2.1]
```

---

## F17.9 — Quiz de style à l'inscription

`P1 · S · complet` — **Dépend de** F0.1, F0.5

### 1. Conception

Six questions rapides à l'inscription : tailles (haut, bas, chaussures), morphologie, styles préférés, budget habituel, couleurs.

**Double effet** : le fil « Pour toi » est **immédiatement pertinent** *(F14.3)* et les filtres sont pré-remplis *(F8.3)* ; et le temps investi crée un attachement au compte.

**Le quiz est passable** *(CDC §5.1.1)* — obligation de le rendre facultatif. Mais l'ordre compte : le proposer **après** l'inscription et **avant** le premier fil, parce qu'un fil aléatoire au premier écran est la meilleure façon de perdre quelqu'un.

**Le filtre dur de taille du fil** *(F14.3)* dépend de ce quiz. Sans lui, une acheteuse en 42 voit du 36 dès le premier écran, et c'est la première cause d'abandon d'un fil mode.

### 2. Structure de code
```
apps/mobile/src/features/quiz/
├─ ecrans/EcranQuiz.tsx           six pas, un par écran, passable à tout moment
└─ hooks/useQuiz.ts
apps/api/src/modules/identite/routes.ts    PUT /moi/profil (F0.5)
```

### 3. Base de données
`profil_acheteur` *(F0.5)*. Aucune table de quiz : le quiz **est** le formulaire de profil, présenté autrement. Une table séparée créerait deux sources de vérité sur les tailles.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — style quiz, step 2 of 6 ("Votre morphologie").
Vertical order: a six-dot progress indicator with step 2 active; a "Passer" text
link in the top right, always visible; the question "Quelle silhouette vous
ressemble le plus ?"; a 2x2 grid of four illustrated cards (simple line drawings,
no photos, no body-shaming labels) captioned "En A", "En H", "En O", "En X",
with the second one selected; a muted helper line "Cela nous aide à vous montrer
des tailles qui vous vont"; a full-width primary button "Continuer".
Produce also step 4 ("Votre budget habituel") as a range slider showing
"10 000 – 80 000 Ar" with two handles and quick-pick chips below, and step 5
("Vos styles") as a multi-select chip cloud "Classique · Moderne · Wax · Sport ·
Soirée · Bureau · Décontracté".
The "Passer" link must be present on every step — the quiz is optional.
```

### 5. Backend
`PUT /moi/profil` — le même point d'entrée que le profil *(F0.5)*.

**Tests** : quiz passable à chaque pas ; profil enregistré au fur et à mesure (un abandon au pas 4 conserve les pas 1 à 3) ; fil personnalisé dès la première ouverture ; filtres pré-remplis ; profil vide → fil générique et non vide.

### 6. Frontend
Six écrans courts, illustrations sobres, **aucun libellé jugeant** sur la morphologie. Enregistrement à chaque pas, pas seulement à la fin.

```issues
feature: F17.9
titre: Quiz de style à l'inscription
epic: "17"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F0.1, F0.5]
```

---

## F17.12 — Rappel de panier abandonné, plafonné

`P1 · S · complet`

### 1. Conception

**Un rappel, un seul**, quelques heures après l'abandon, et **uniquement s'il reste du stock**.

**Pas de relance quotidienne.** Une acheteuse harcelée coupe les notifications, et on perd alors les notifications utiles — colis arrivé, code de retrait — **ce qui coûte beaucoup plus cher** que le panier qu'on essayait de récupérer. C'est le même raisonnement que les plafonds de promotion *(R-U4)*, et il s'applique ici avec la même force.

**Condition de stock** : rappeler un panier dont l'article est parti produit une déception et une notification inutile. Vérification avant envoi, systématique.

### 2. Structure de code
`modules/commande/rappelPanier.ts` · `apps/api/src/jobs/rappelPanier.ts` · plafonds dans `notification/plafonds.ts` *(F7.23)*.

### 3. Base de données
`panier_rappel (utilisateur_id, envoye_le)` — un enregistrement par rappel envoyé, qui **interdit structurellement** le second.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Frame — abandoned cart reminder, a single push notification card:
title "Votre panier vous attend", body "Robe wax bleue, taille M — encore
disponible". Add a caption frame beneath explaining the rule as documentation:
"Un seul rappel, jamais deux. Envoyé uniquement si l'article est encore en stock."
Also produce the in-app cart state after the reservation expired: rows dimmed with
an amber chip "Réservation expirée" and a "Reprendre" link per row, plus a header
line "Les articles sont encore disponibles".
```

### 5. Backend
Travail périodique : paniers abandonnés depuis N heures, stock vérifié, plafond de un, envoi.

**Tests** : un seul rappel par panier, **jamais deux** (y compris après un nouvel abandon du même article) ; aucun rappel si le stock est parti ; plafond partagé avec les autres notifications ; rappel non envoyé si l'acheteuse a coupé ce type.

### 6. Frontend
Rien de spécifique : le rappel mène au panier *(F1.16)*.

```issues
feature: F17.12
titre: Rappel de panier abandonné, plafonné
epic: "17"
phase: P1
prio: S
etapes: [conception, bdd, design, backend]
depend: [F1.16, F7.3]
```

---

## F17.13 — Cagnotte créditée par l'unboxing

`P1 · S · complet` — **⚠️ montant à calibrer** *(décision n° 10)*

### 1. Conception

L'acheteuse publie son unboxing *(F14.7)* → **crédit immédiat et visible** dans sa cagnotte *(F7.7)*, utilisable sur sa prochaine commande.

**C'est JP qui achète son propre contenu d'acquisition**, à un prix maîtrisé et payé **en crédit d'achat plutôt qu'en argent** — donc à un coût réel inférieur au montant nominal, et avec un effet de rétention en prime.

**⚠️ Le montant est le réglage qui décide si le moteur d'acquisition gratuite s'amorce.** Trop bas, personne ne filme ; trop haut, on achète du contenu à perte. Paramétrable *(`credit_unboxing_ariary`)*, et **le taux de production d'unboxings est un indicateur du pilote** *(F11.7)*.

**Garde-fou anti-abus** : un crédit par commande, une commande confirmée par unboxing, et un contrôle de contenu minimal — une vidéo de 2 secondes ou un écran noir ne déclenche pas le crédit. La modération *(F19.7)* peut reprendre un crédit obtenu frauduleusement, par écriture inverse.

### 2. Structure de code
`modules/fidelite/cagnotte.ts` · `modules/contenu/unboxing.ts` *(F14.7)*.

### 3. Base de données
`cagnotte`, `mouvement_cagnotte` *(F7.7)*. Unicité du crédit par commande :

```sql
CREATE UNIQUE INDEX credit_unboxing_unique ON mouvement_cagnotte (reference)
  WHERE type = 'credit_unboxing';
```

### 4. Design
*Voir l'écran de succès en [F14.7](EP14-contenu.md#f147--lunboxing) (écran 4), qui annonce le crédit parmi les cinq résultats.*

Ajout : la carte de cagnotte *(F7.7)* montre l'origine de chaque crédit — « Vidéo unboxing #1042 » plutôt que « Crédit ».

### 5. Backend
Crédit dans la transaction de l'unboxing *(F14.7)*, montant lu depuis les paramètres.

**Tests** : un seul crédit par commande, y compris en cas de republication ; montant paramétrable pris en compte immédiatement ; unboxing supprimé par la modération → **crédit reprisé par écriture inverse** ; solde de cagnotte jamais négatif après reprise ; crédit utilisable au panier *(F3.6)*.

### 6. Frontend
Le crédit apparaît **immédiatement** à l'écran de succès. Un crédit annoncé mais visible seulement le lendemain perd tout son effet.

```issues
feature: F17.13
titre: Cagnotte créditée par l'unboxing
epic: "17"
phase: P1
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F14.7, F7.7]
```

---

## F17.2 / F17.3 — Badges et progression visible

`P2 · S · moyen`

**Conception** — badges adossés à des **faits vrais** : première commande, première vidéo, 10 achats, cliente d'une boutique depuis un an, créatrice ayant généré 100 ventes. **Aucun badge de simple présence.**

**F17.3 — progression visible vers l'avantage suivant** : réutilise la barre de progression de `F7.19`, avec la même règle — la progression est exprimée en **actions concrètes** (« 2 commandes »), jamais en points abstraits.

**Base de données** — `badge (code, libelle_mg, libelle_fr, critere jsonb)`, `badge_obtenu (utilisateur_id, badge_code, obtenu_le)`.

**Backend** — attribution par consommation d'événements métier ; jamais de badge attribué à la main.

**Design** — Prompt Stitch : *badges screen with a grid of earned badges in color and unearned ones greyed with their criterion written underneath ("10 achats — il vous en reste 4"), and a detail sheet per badge showing the exact fact it certifies and its date.*

**Tests** : chaque badge correspond à un fait vérifiable en base ; aucun badge de présence ; attribution idempotente.

```issues
feature: F17.2
titre: Badges et accomplissements
epic: "17"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F3.7]
```
```issues
feature: F17.3
titre: Progression visible vers l'avantage suivant
epic: "17"
phase: P2
prio: S
etapes: [conception, design, backend, frontend]
depend: [F7.19]
```

---

## F17.6 — Défis avec hashtag

`P2 · S · moyen`

**Conception** — un défi (« montrez votre look de fête ») rassemblé par un hashtag *(F14.12)*, avec une récompense annoncée. Socle des défis sponsorisés par les marques *(F18.6)*.

**Règle d'or maintenue** : les contenus du défi portent des articles achetables *(F14.5)*. Un défi qui produit du contenu non marchand n'a pas sa place.

**Base de données** — `defi (id, hashtag_id, titre, recompense, debut_le, fin_le, sponsor_id null)`.

**Backend** — `GET /defis`, participation par publication avec le hashtag.

**Design** — Prompt Stitch : *challenge page with a banner, the challenge title, a countdown, a reward card "3 gagnantes recevront 50 000 Ar de crédit", a "Participer" button opening the publish flow with the hashtag pre-filled, and a grid of participating clips with vote or view counts.*

**Tests** : participation détectée par hashtag ; contenus sans article exclus ; récompense versée en crédit *(F7.7)*.

```issues
feature: F17.6
titre: Défis avec hashtag
epic: "17"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F14.12]
```

---

## F17.1 — Série de connexion quotidienne ⚠️

`P2 · C · cadre` — **la fonctionnalité à couper si l'une doit l'être**

**Conception** — récompense pour des ouvertures consécutives de l'application.

**Pourquoi elle est signalée** *(introduction de l'épique)* : c'est le seul mécanisme du produit qui récompense une action **sans valeur commerciale ni éditoriale**. Elle fragilise le discours sur l'éthique de conception, et le rendez-vous récurrent *(F17.4)* obtient un meilleur résultat honnêtement.

**Recommandation : ne pas la développer.** Si elle est développée malgré tout, alors : récompense en crédit d'achat et non en badge creux, plafond hebdomadaire, et **aucune notification de rappel de série** — la notification de série est précisément la forme la plus agressive du mécanisme.

**Impact base de données** — `serie_connexion (utilisateur_id, jours_consecutifs, dernier_jour)`.

```issues
feature: F17.1
titre: Série de connexion quotidienne
epic: "17"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: []
```

---

## F17.5 — Classements hebdomadaires ⚠️

`P2 · C · cadre`

**Conception** — classements de créatrices et de clientes. **Seconde exception assumée** à la règle d'adossement au commerce.

**Deux garde-fous si elle est développée** : le classement des créatrices porte sur les **ventes générées** (fait commercial, donc acceptable), et les acheteuses peuvent **refuser d'y figurer** *(F7.19, US-FID-05 CA4)*. Un classement public de dépenses est intrusif ; un classement de ventes générées est un palmarès professionnel.

**Impact base de données** — `classement_hebdo (semaine, type, utilisateur_id, rang, valeur)`.

```issues
feature: F17.5
titre: Classements hebdomadaires
epic: "17"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F15.6]
```

---

## F17.7 / F17.8 — Boîte surprise et jeux pendant le direct

`P3 · C · cadre`

**F17.7 — Boîte surprise** : lot d'articles à prix fixe, contenu inconnu. **Point à trancher avant de coder** : que se passe-t-il en cas de litige sur une boîte surprise ? « Ce n'est pas ce que j'attendais » n'est pas un motif recevable si le contenu est aléatoire par nature, mais l'acheteuse le vivra comme tel. Il faut donc une règle de litige spécifique, écrite avant l'ouverture — ou ne pas ouvrir.

**F17.8 — Jeux pendant le direct** (quiz, roue, tirage) : engagement en direct. **La roue et le tirage doivent être vérifiablement équitables** *(RB9)* : un tirage dont le résultat est décidé côté client, ou pondéré en secret, est exactement le type de manipulation que le produit s'interdit. Cela suppose un tirage côté serveur, journalisé.

```issues
feature: F17.7
titre: Boîte surprise
epic: "17"
phase: P3
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F1.1]
```
```issues
feature: F17.8
titre: Jeux pendant le direct, quiz, roue, tirage
epic: "17"
phase: P3
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F2.10]
```

---

*Épique suivante : [EP19-moderation](EP19-moderation.md).*
