# EP06 — Confiance, avis et signalements

> 12 fonctionnalités · **vague 1** · module `confiance`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).
> **Amont** : [`JP_DECISIONS_PRODUIT.md`](../docs/JP_DECISIONS_PRODUIT.md) — `DP-05`, `DP-07`.

> ### Cette épique est devenue le cœur du produit
>
> Le séquestre protégeait l'acheteuse ; **il a disparu** *(`DP-07`)*. Il n'y a
> plus non plus d'arbitre humain *(`DP-05`)*, ni de preuve de remise par un tiers
> *(`DP-04`)*. **Ce qui protège l'acheteuse tient désormais entièrement ici** :
> la boutique vérifiée, les avis, le score, et la suspension automatique.
>
> **Conséquence de périmètre, non négociable** : `F6.1` *(avis)* et `F6.2`
> *(score)* passent de **P2 à P1**, et `F6.8` *(sanctions)* de **S à M**. Ils
> étaient un confort de fidélisation ; ils sont devenus le **mécanisme de
> protection lui-même**. L'épique entière passe en **vague 1**.

**Le point culturel qui détermine toute la conception, inchangé** : le problème se signale **à JP, jamais en face à face avec la boutique**. La confrontation directe est socialement coûteuse — c'est ce qui fait que les gens abandonnent au lieu de réclamer, et c'est ce qui rend le produit acceptable à quelqu'un qui a déjà été arnaqué.

**Mais JP ne tranche plus, et ne détient plus l'argent. Le signalement ne rend rien : il compte.**

**Critère de recette bloquant** : `RB4` — **100 % des sanctions automatiques sont écrites, motivées et notifiées aux deux parties** *(`R-T2`)*.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F6.3 | Signalement d'un problème sur une commande | P1 | M | complet |
| F6.4 | Fil de discussion avec pièces jointes | P1 | M | complet |
| F6.6 | Historique consultable des deux côtés | P1 | M | complet |
| **F6.1** | Avis vérifiés | **P1** | M | complet |
| **F6.2** | Score de confiance boutique | **P1** | M | complet |
| **F6.8** | **Sanctions automatiques** | P1 | **M** | complet |
| F6.7 | Signalement d'un contenu ou d'un utilisateur | P1 | S | moyen |
| F6.9 | Réponse publique de la boutique à un avis | P2 | C | cadre |
| F6.10 | Avis avec photo portée et morphologie | P2 | S | moyen |
| F6.11 | Signalement « réaction cutanée », traité en priorité | P1 | M | complet |
| F6.12 | Pas de retour sur un cosmétique entamé | P1 | M | moyen |
| F6.13 | Signalement de contrefaçon | P1 | S | moyen |
| ~~F6.5~~ | ~~Arbitrage par l'équipe JP~~ ❌ *(`DP-05`, `DP-07`)* | — | — | — |

---

## F6.3 / F6.4 / F6.6 — Le signalement, de l'ouverture à la résolution

`P1 · M · complet` — **Règles** R-T1, R-T2, R-T4, R-T8, R-T9 · **Recette RB4** · **Décisions** `DP-05`, `DP-07`

### 1. Conception

**A** : commande → « Il y a un problème » → motif *(non reçu / abîmé / pas conforme / mauvaise taille / autre)* → photos → description → **le dossier est ouvert et inscrit au compteur de la boutique** *(`R-T8`)*.

**B** : notifiée, voit le motif et les photos, répond **dans le même fil**, propose une solution — renvoi, remboursement de sa propre initiative, geste commercial. **`SYS` n'exécute aucun mouvement d'argent** *(`R-T3`)*.

**A / B** : accord trouvé dans le fil → **le dossier se clôt et le compteur est décrémenté**.

**Sans accord** : ⚠️ **il n'y a pas d'escalade, il n'y a plus d'arbitre.** Le dossier **reste ouvert et pèse durablement sur le score**. Au-delà d'un seuil, `SYS` **suspend automatiquement la mise en vente** *(`F6.8`, seuil non arrêté — `PO-12`)*.

> ### Le déplacement de conception à retenir
>
> `dossier.ts` assemblait les preuves **pour un arbitre**. Il les assemble
> désormais **pour les deux parties** *(`R-T1`)* : événements de livraison
> horodatés et attribués, facture, historique des deux côtés. **C'est ce qui rend
> l'accord possible sans tiers** — et c'est aussi ce que JP fournit quand le
> recours de l'acheteuse est externe *(`DP-07`)*.
>
> Le travail d'assemblage ne disparaît donc pas. **Son destinataire change**, et
> avec lui l'écran : plus une console d'instruction, **un fil lisible par deux
> personnes qui ne se font pas confiance**.

### 2. Structure de code

```
apps/api/src/modules/confiance/
├─ routes.ts        POST /commandes/:id/signalement · POST /signalements/:id/messages
├─ service.ts       ouvrir() · repondre() · proposer() · resoudre()
├─ machine.ts       ouvert → en_discussion → resolu
├─ dossier.ts       assemblage des preuves, POUR LES DEUX PARTIES
├─ compteur.ts      effet sur score_confiance et seuil de suspension (R-T8)
└─ *.test.ts
apps/api/src/jobs/evalueSeuilSignalements.ts     suspension automatique
apps/mobile/src/features/signalement/
├─ ecrans/{EcranOuverture,EcranFil}.tsx
└─ composants/{SelecteurMotif,AjoutPhotos,PropositionSolution}.tsx
```

**Trois fichiers disparaissent** *(`DP-05`)* : `execution.ts` *(appliquait la décision : remboursement ou libération)*, `jobs/escaladeLitige.ts` *(48 h → arbitrage)*, et tout `apps/admin/src/pages/litiges/`.

### 3. Base de données

Migration `..._f6_3_signalement` — `signalement_commande`, `message_litige`.

```sql
CREATE INDEX signalement_par_boutique ON signalement_commande (boutique_id, compte_dans_le_score);
CREATE INDEX signalement_par_commande ON signalement_commande (commande_id);
ALTER TABLE signalement_commande ADD CONSTRAINT compteur_coherent
  CHECK (compte_dans_le_score = (statut <> 'resolu'));
```

**`compteur_coherent` remplace `decision_motivee`.** L'ancienne contrainte traduisait `RB4` — *« pas de clôture silencieuse »* — en interdisant un litige résolu sans décision écrite. **Il n'y a plus de décision écrite, il n'y a plus d'arbitre.** Ce que la base garantit désormais, c'est qu'**un signalement non résolu pèse, toujours** : on ne peut pas le faire cesser de compter sans le résoudre.

`RB4` se déplace sur `sanction.motif_texte` *(`F6.8`)*.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — "Il y a un problème" (buyer).
Vertical order: back arrow, title "Que s'est-il passé ?"; an HONEST information
card in neutral grey with an info icon reading "JP ne rembourse pas. Votre
signalement est enregistré et compte dans la note publique de la boutique." —
never a reassurance about held money; five radio rows with icons: "Je n'ai pas
reçu mon colis", "L'article est abîmé", "Ce n'est pas ce que j'ai commandé",
"La taille ne va pas", "Autre"; a photo area with two filled thumbnails and a
dashed "+ Ajouter une photo" tile and a helper "Les photos aident beaucoup";
a multiline description field; a full-width primary button "Envoyer mon
signalement"; a muted footer "Vous n'aurez pas à discuter en face à face."

Screen 2 — signal thread (shared by buyer and shop).
Top: a case header card with "Dossier #S-204", a status chip "En discussion",
the order row, and a line "Ce signalement compte dans la note de la boutique
tant qu'il n'est pas résolu." — no countdown, no arbitration promise.
A message thread: buyer messages left-aligned with photo attachments, shop
messages right-aligned, grey system rows in the middle.
A shop proposal appears as a distinct bordered card: "Proposition de Miora —
Remboursement de 20 000 Ar, envoyé par MVola" with two buttons "C'est réglé"
and "Pas encore". A small muted line under it: "Le remboursement est fait par
la boutique, pas par JP."
Bottom: a compose row with a camera icon.

Screen 3 — shared evidence panel, available to BOTH parties.
An expandable section inside the thread titled "Ce que JP a enregistré": a
delivery timeline with who advanced each step, the invoice, the payment trace,
and both parties' history. A footer line: "Vous pouvez utiliser ces éléments
en dehors de JP."
```

**L'écran 3 est le remplaçant direct de la console d'arbitrage.** Les mêmes preuves, montrées aux parties au lieu d'un agent.

### 5. Backend

| Route | Notes |
|---|---|
| `POST /commandes/:id/signalement` | motif, photos, description → dossier ouvert, **compteur incrémenté** |
| `GET /signalements/:id` | fil, visible des deux parties |
| `POST /signalements/:id/messages` | texte + pièces jointes |
| `POST /signalements/:id/proposition` | la boutique propose une solution |
| `POST /signalements/:id/resoudre` | l'acheteuse confirme → clôture, **compteur décrémenté** |
| `GET /signalements/:id/dossier` | assemblage des preuves, **pour les deux parties** |

Travail `evalueSeuilSignalements` : au-delà du seuil de dossiers non résolus → `boutique.vente_gelee = true`, sanction écrite et notifiée *(`R-T8`, `RB4`)*.

**Tests**
- Ouverture → **compteur incrémenté**, score recalculé. **Aucun fonds bloqué : il n'y en a plus.**
- Résolution → compteur décrémenté, score recalculé.
- **On ne peut pas mettre `compte_dans_le_score = false` sans résoudre** *(contrainte de base)*.
- Seuil atteint → **suspension automatique de la mise en vente**, sanction écrite et motivée.
- **La boutique reste accessible** : catalogue visible, commandes en cours menées à terme *(`R-B4`)*.
- Dossier de preuves : les quatre sources présentes, **et identiques pour les deux parties** *(F6.6)*.
- **RB4** : sur 50 sanctions automatiques simulées, 100 % portent un motif écrit et une notification aux deux parties.
- **Aucun écran ne laisse croire que JP rembourse** *(RB12)*.

### 6. Frontend

Le fil est **le même écran** pour l'acheteuse et la boutique, avec des messages alignés différemment.

**La phrase de réassurance sur les fonds bloqués est supprimée partout.** Elle est remplacée par une phrase honnête : *« JP ne rembourse pas. Votre signalement compte dans la note publique de la boutique. »* Mentir ici — sur le seul sujet où le produit avait promis de ne pas mentir — coûterait plus cher que la vérité.

```issues
feature: F6.3
titre: Signalement d'un problème sur une commande
epic: "06"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.7]
```
```issues
feature: F6.4
titre: Fil de discussion avec pièces jointes
epic: "06"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F6.3]
```
```issues
feature: F6.6
titre: Historique et preuves consultables des deux côtés
epic: "06"
phase: P1
prio: M
etapes: [conception, backend, frontend]
depend: [F6.4]
```

---

## F6.1 / F6.10 — Avis vérifiés et avis par morphologie

`P2 · M / S · complet` — **Règles** R-T7, R-T8 · **Recette** — seul un acheteur ayant payé peut noter

### 1. Conception

**A** : 2 jours après confirmation de réception → notification → note sur 5, commentaire, **photo optionnelle du vêtement porté**, et « Conforme à la taille / taille petit / taille grand ». **Impossible de noter sans avoir payé** *(R-T7)* — c'est ce qui distingue un avis JP d'un commentaire Facebook.

**A (autre acheteuse)** : voit les avis **filtrés par morphologie proche de la sienne** *(F6.10)*. C'est ce qui réduit les retours : « ça taille petit » n'a pas le même sens selon qui l'écrit.

**V** : notifiée, peut répondre publiquement **une fois** *(F6.9)*.

**Un avis peut être généré par un unboxing** *(F14.7, R-T7)* : la vidéo d'ouverture porte déjà la note de taille et vaut confirmation de réception. Un seul geste, cinq résultats — c'est le mécanisme central de la couche sociale.

**Décision — l'avis est attaché à la commande, pas à l'article.** Unicité `(commande_id)`. Cela empêche les avis multiples et permet de prouver l'achat. Conséquence assumée : une acheteuse qui rachète le même article peut laisser un second avis, et c'est légitime.

### 2. Structure de code

```
apps/api/src/modules/litige/
├─ avis.ts          creer() · listerParArticle() · listerParVendeur()
├─ morphologie.ts   proximité morphologique, pondération
└─ avis.test.ts
apps/mobile/src/features/avis/
├─ ecrans/{EcranLaisserAvis,EcranAvisArticle}.tsx
└─ composants/{NoteEtoiles,ConformiteTaille,FiltreMorphologie,CarteAvis}.tsx
```

### 3. Base de données

Migration `..._f6_1_avis` — `avis` (CDC §3.10), unicité `(commande_id)`.

```sql
CREATE INDEX avis_par_boutique ON avis (boutique_id, cree_le DESC);
CREATE INDEX avis_par_article ON avis (article_id, conformite_taille);
ALTER TABLE avis ADD CONSTRAINT note_valide CHECK (note BETWEEN 1 AND 5);
```

L'avis stocke une **copie de la morphologie de l'autrice au moment de l'avis** — sinon un changement de profil réécrirait le sens d'un avis passé.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Votre avis sur cet article" (buyer).
Vertical order: the product row; a large five-star rating row with the stars
generously spaced for thumb use; a "Comment taille cet article ?" three-option
segmented control "Taille petit · Conforme · Taille grand" with "Conforme"
selected; an optional photo area labelled "Une photo portée ? (facultatif)" with
a dashed capture tile and a muted line "Les photos portées aident énormément les
autres clientes"; a multiline comment field; a full-width primary button
"Publier mon avis"; a muted footer "Votre prénom et votre morphologie seront
affichés, jamais vos coordonnées."

Screen 2 — reviews list on a product page, with morphology filtering.
Top: an aggregate row "4,6 ★ · 34 avis" and a size-fit summary bar showing three
segments with percentages "Taille petit 12 % · Conforme 76 % · Taille grand 12 %".
A prominent filter chip, pre-selected and highlighted: "Ma morphologie (M, 1,65 m)"
with a count "8 avis proches de vous".
Then review cards: first name "Hanta R.", a verified-purchase chip "Achat
vérifié", the star row, a morphology line "M · 1,65 m · silhouette en A", the
fit chip "Conforme", the comment text, and a worn photo thumbnail. One card shows
an indented seller reply with the shop avatar and a "Réponse de Miora" label.
```

### 5. Backend

`POST /commandes/:id/avis` — refusé si la commande n'est pas `CONFIRMEE`, refusé si un avis existe déjà.
`GET /articles/:id/avis?morphologie=proche` · `GET /boutiques/:id/avis`.
Notification 2 jours après confirmation, **une seule**.

**Tests** : avis impossible sans commande confirmée *(R-T7)* ; un seul avis par commande ; note hors bornes refusée ; filtre par morphologie renvoie les avis proches et **pas les autres** ; agrégat de conformité de taille exact ; avis généré par un unboxing correctement rattaché ; morphologie figée au moment de l'avis.

### 6. Frontend

Le filtre par morphologie est **pré-sélectionné**, pas proposé : c'est le comportement utile par défaut dans le vestimentaire. Un bouton permet de voir tous les avis.

```issues
feature: F6.1
titre: Avis vérifiés, seul un acheteur ayant payé peut noter
epic: "06"
phase: P2
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.5]
```
```issues
feature: F6.10
titre: Avis avec photo portée et morphologie
epic: "06"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F6.1]
```

---

## F6.2 — Score de confiance boutique, public

`P2 · M · complet` — **Règles** R-T9, R-T10

### 1. Conception

**Calculé sur** : ventes honorées, délai d'expédition **réel** contre annoncé *(F5.9)*, taux d'annulation boutique *(F3.9)*, taux de litige, issue des litiges *(F6.5)*.

- **A** : voit le score sur la vitrine et sur chaque direct. **C'est ce qui remplace la recommandation d'une amie**, donc c'est le mécanisme central de croissance du produit.
- **V** : voit son score, **et surtout ce qui le fait monter ou baisser**, avec des conseils concrets (« expédiez sous 24 h pour gagner 0,2 »).

**Le score doit être un objectif motivant, pas une sanction opaque** *(R-T10)*. Cette phrase a une conséquence de conception directe : la boutique doit voir la **décomposition** de son score et l'effet chiffré de chaque action. Un score global sans explication produit du ressentiment et aucune amélioration.

**Deux garde-fous.**
- **Volume minimal** avant affichage public : une boutique à 2 ventes dont une contestée aurait un score catastrophique et statistiquement vide. En dessous du seuil, afficher « Nouveau boutique » plutôt qu'un score.
- **Fenêtre glissante** : un incident d'il y a un an ne doit pas peser autant qu'un incident de la semaine. Sinon le score devient une condamnation, et la boutique cesse d'essayer de le remonter.

### 2. Structure de code

```
apps/api/src/modules/litige/
├─ score.ts          ← fonction pure : (métriques, params) → score + décomposition
├─ score.test.ts
apps/api/src/jobs/recalculScore.ts     quotidien + sur événement
packages/ui/src/ScoreConfiance.tsx     affichage partagé
apps/mobile/src/features/tableau-bord/ecrans/EcranMonScore.tsx
```

### 3. Base de données

Migration `..._f6_2_score` :

```
score_confiance
  boutique_id PK/FK · score numeric(3,1)
  nb_ventes_honorees · delai_expedition_reel_h · taux_annulation
  taux_litige · taux_litige_perdu
  decomposition jsonb          -- contribution de chaque composante
  calcule_le
```

`decomposition` est stockée parce que l'affichage boutique en a besoin et que le recalculer à la volée obligerait à dupliquer la formule côté lecture.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — public trust score, shown as a compact component in three placements:
on a shop header ("4,8" with five small stars and "126 ventes"), on a live stream
top bar (a small "4,8 ★" pill), and on a product page seller row. Plus a
"Nouveau boutique" variant with a neutral chip and no number, and a tap-through
sheet explaining what the score measures in four plain lines.

Screen 2 — "Mon score" (seller), the motivating version.
Vertical order: a large circular gauge showing "4,8" out of 5 with a green
"+0,1 ce mois" delta; a breakdown list where each row has a label, a horizontal
bar, a value and a contribution ("Ventes honorées · 98 % · +2,0", "Délai
d'expédition · 2,4 j · +1,4", "Annulations · 3 % · +0,9", "Litiges · 1 % · +0,5");
then a highlighted "Comment gagner des points" card with two concrete actions:
"Expédiez sous 24 h → +0,2" and "Réduisez vos annulations sous 2 % → +0,1", each
with a small "Voir comment" link; at the bottom a muted line "Les incidents
récents comptent plus que les anciens."
The tone must be coaching, never punitive.
```

### 5. Backend

`GET /boutiques/:id/score` (public, avec seuil de volume) · `GET /boutique/mon-score` (avec décomposition et conseils).

Recalcul quotidien et sur événement (`commande.confirmee`, `litige.resolu`, annulation).

**Tests** : formule exacte sur des cas de référence ; fenêtre glissante appliquée ; sous le seuil de volume → « Nouveau boutique », **pas de score** ; décomposition dont la somme égale le score ; conseils cohérents avec les composantes les plus faibles ; score public identique au score boutique (pas deux calculs).

### 6. Frontend

Composant partagé pour l'affichage public. Écran boutique avec décomposition et actions concrètes — c'est la seule version du score qui fasse changer un comportement.

```issues
feature: F6.2
titre: Score de confiance boutique, public
epic: "06"
phase: P2
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F6.1, F6.5]
```

---

## F6.7 — Signalement d'un contenu ou d'un utilisateur

`P1 · S · moyen` — **Voir** EP19 qui porte la modération complète

**Conception** — appui long → « Signaler » → motif en liste courte → envoyé. **Deux niveaux** *(R-X4)* : ordinaire (file normale) et **urgence** — harcèlement, menace, contenu sexuel non consenti, mineur — qui passe en tête de file avec un engagement de traitement court.

Distinct du signalement de commande *(`F6.3`)* : celui-ci porte sur une **transaction**, celui-là sur un **contenu ou une personne**. Deux tables, deux métiers, deux équipes *(MO* et *OP)*.

**Base de données** — `signalement` (CDC §3.10), index `(niveau, statut, cree_le)` pour l'urgence en tête.

**Backend** — `POST /signalements`. Détail du traitement en `F19.7`.

**Design** — Prompt Stitch : *long-press action sheet on a piece of content with options "Signaler", "Ne plus voir", "Bloquer"; then a report sheet with a short radio list "Contenu inapproprié · Arnaque · Contenu volé · Harcèlement ou menace · Autre", where the harassment option carries a red urgency chip "Traité en priorité", plus an optional detail field and a primary button "Envoyer le signalement"; then a confirmation sheet "Merci — nous examinons ce signalement" with a case number and, for urgent reports, a line "Traitement sous 2 heures".*

**Tests** : signalement ordinaire et urgent ; urgence en tête de file ; signalant notifié de la décision *(R-X6)* ; signalement anonyme pour l'auteur signalé.

```issues
feature: F6.7
titre: Signalement d'un contenu ou d'un utilisateur
epic: "06"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: []
```

---

## F6.8 — Sanctions boutique

`P1 · S · moyen` — **Règles** R-X6

**Conception** — échelle graduée, **appliquée par `SYS`** *(`DP-05`)* : avertissement, **gel de la mise en vente**, suspension. Chaque sanction est **écrite, motivée, horodatée et notifiée aux deux parties** *(`R-T2`, `RB4`)*.

**Le gel porte désormais sur la mise en vente, plus sur l'encaissement** *(`DP-07`)* : l'argent partant directement à la boutique au moment du paiement, il n'y a plus rien à geler côté argent. **Geler la vente protège les acheteuses futures sans toucher aux commandes en cours**, qui vont à leur terme *(`R-B4`)*.

**Le déclencheur principal est le compteur de signalements non résolus** *(`R-T8`, `F6.3`)*. ⚠️ **Le seuil n'est pas arrêté** *(`PO-12`)* — et c'est **le paramètre le plus sensible du produit** depuis `DP-07` : trop bas, une boutique honnête est coupée par deux clientes mécontentes ; trop haut, la protection est décorative.

> ### ⚠️ La voie de recours disparaît avec l'instructeur
>
> Le texte de cette fonctionnalité disait : *« une sanction sans voie de recours
> est vécue comme arbitraire et fait partir les meilleurs profils »*. **C'est
> toujours vrai, et il n'y a plus de parade** *(`DP-05`)* : il n'existe personne
> à qui écrire.
>
> **La seule atténuation possible** : une sanction automatique ne peut être levée
> que par **une nouvelle évaluation automatique**. Elle doit donc être
> **recalculable**, jamais un état figé — un signalement résolu décrémente le
> compteur, et la suspension tombe d'elle-même au prochain passage du travail
> `evalueSeuilSignalements`. **C'est le recours : réparer, pas plaider.**

**Base de données** — `sanction` *(`motif_texte` obligatoire)*, `boutique.vente_gelee bool`.

```sql
ALTER TABLE sanction ADD CONSTRAINT sanction_motivee
  CHECK (motif_texte IS NOT NULL AND length(motif_texte) > 0);
```

**C'est ici que `RB4` atterrit** après avoir quitté `litige.decision_motivee` *(`F6.3`)*.

**Backend** — le travail `evalueSeuilSignalements` écrit les sanctions ; contrôle de `vente_gelee` dans la **publication d'article** et le **démarrage de direct** *(plus dans `paiement` — `DP-07`)*.

**Tests** : sanction sans motif → **refusée par la base** ; gel → publication et direct refusés, **commandes en cours et catalogue intacts** ; résolution d'un signalement → compteur décrémenté → **levée automatique au passage suivant** ; notification aux deux parties.

```issues
feature: F6.8
titre: Sanctions automatiques, gel de la mise en vente, suspension
epic: "06"
phase: P1
prio: M
etapes: [conception, bdd, backend, frontend]
depend: [F6.3, F6.2]
```

---

## F6.9 — Réponse publique de la boutique à un avis

`P2 · C · cadre`

**Conception** — la boutique peut répondre **une seule fois** publiquement à un avis. Une seule réponse évite la dispute publique, qui abîme la vitrine plus que l'avis initial.

**Impact base de données** — `avis.reponse_texte`, `avis.reponse_le`.

**Endpoint** — `POST /avis/:id/reponse` (refusé si une réponse existe).

**Point d'attention** — la réponse passe par le filtrage automatique des commentaires *(R-X1)* : une boutique en colère est un risque de contenu à modérer.

```issues
feature: F6.9
titre: Réponse publique de la boutique à un avis
epic: "06"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F6.1]
```

---

*Épique suivante : [EP11-backoffice](EP11-backoffice.md).*

---

# JP Beauté — ce que l'univers cosmétique change au litige

**Deux de ces trois règles ne sont pas commerciales.** Sur un cosmétique, la
contrefaçon et la réaction cutanée touchent la santé des personnes, pas leur
porte-monnaie. Elles se traitent donc comme des urgences, pas comme des
désaccords de vente.

---

## F6.11 — Litige « réaction cutanée », traité en priorité

`P1 · S · complet` — **Règles** R-Y16 · **Recette RB4** · **Dépend de** F21.4, F6.3

**Conception.** Le motif `reaction_cutanee` place le dossier **en tête de
file**, avec le même traitement que les signalements d'urgence de l'épique 19.

**Ce n'est pas un litige de commerce.** Une réaction cutanée peut relever de
l'urgence médicale. Le délai d'engagement affiché est court, et l'écran propose
immédiatement — **sans attendre quoi que ce soit** — de retirer l'article de
la vente. Il n'y a plus d'instruction ni d'arbitrage *(`DP-05`)* : **le retrait
est automatique dès le premier signalement de ce motif.** Protéger les suivantes
prime sur le préjudice commercial de la boutique.

**Base.** `signalement_commande.prioritaire boolean` + index partiel
`(prioritaire DESC, ouvert_le) WHERE statut <> 'resolu'`.

**Backend.** `POST /litiges` marque `prioritaire = true` sur ce motif, et
publie un événement que la modération écoute.

**Test** : le dossier passe devant un litige ordinaire plus ancien · l'article
est retirable immédiatement · la décision reste **motivée** *(RB4)*.

```issues
feature: F6.11
titre: Litige « réaction cutanée » traité en priorité
epic: "06"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F21.4]
```

---

## F6.12 — Pas de retour sur un cosmétique entamé

`P1 · M · complet` — **Règles** R-Y17 · **Dépend de** F21.4

**Conception.** Un cosmétique entamé **ne se retourne pas**, sauf défaut ou
contrefaçon.

**Pourquoi cette règle protège la boutique.** Un produit entamé ne se revend
pas : accepter son retour ferait payer à la boutique le changement d'avis de
l'acheteuse. C'est une des rares règles du produit qui penche du côté du
boutique, et elle est légitime — l'hygiène n'est pas négociable.

**Les exceptions restent entières** : défaut du produit, contrefaçon,
péremption dépassée, réaction cutanée. Dans ces quatre cas, le retour et le
remboursement s'appliquent normalement.

**Frontend.** L'écran l'annonce **avant l'achat**, sur la fiche : « Produit
entamé — non retournable sauf défaut ». Le découvrir au moment du litige serait
un frais caché déguisé *(RB7)*.

**Test** : un retour sur entamé sans défaut est refusé, avec le motif · un
retour sur entamé **avec** contrefaçon est accepté · la mention figure sur la
fiche avant paiement.

```issues
feature: F6.12
titre: Pas de retour sur un cosmétique entamé, sauf défaut
epic: "06"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F21.4]
```

---

## F6.13 — Signalement de contrefaçon

`P1 · S · moyen` — **Règles** R-Y18 · **Dépend de** F21.4, F6.7

Un signalement de contrefaçon est transmis **à la boutique et à l'équipe JP**.

Sur un cosmétique, la contrefaçon n'est pas un préjudice commercial : c'est un
risque pour les personnes. La boutique est avertie — elle peut être de bonne foi et
avoir été trompé par son grossiste — et l'équipe instruit en parallèle.

**Base.** Réutilise `signalement` de l'épique 19 avec `motif = contrefacon` et
`univers_cle`.

**Test** : les deux destinataires sont notifiés · un signalement de
contrefaçon en Beauté est prioritaire, en Mode il suit la file normale.

```issues
feature: F6.13
titre: Signalement de contrefaçon
epic: "06"
phase: P1
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F21.4]
```
