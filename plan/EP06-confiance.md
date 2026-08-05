# EP06 — Confiance, avis et litiges

> 10 fonctionnalités · vague 2 · module `litige`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**L'antidote au problème que le produit existe pour résoudre.** Le séquestre protège l'argent ; le litige est ce qui se passe quand la protection doit s'exercer.

**Un point culturel qui détermine toute la conception** : le litige se signale **à JP, jamais en face à face avec le vendeur**. Cela évite la confrontation, socialement coûteuse, qui fait que les gens abandonnent au lieu de réclamer. C'est aussi ce qui rend le produit acceptable à quelqu'un qui a déjà été arnaqué et n'a pas envie de se battre.

**Critère de recette bloquant** : `RB4` — **100 % des litiges reçoivent une décision motivée dans le délai**.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F6.3 | Signalement d'un litige | P1 | M | complet |
| F6.4 | Fil de litige avec pièces jointes | P1 | M | complet |
| F6.5 | Arbitrage par l'équipe JP | P1 | M | complet |
| F6.6 | Historique consultable des deux côtés | P1 | M | complet |
| F6.7 | Signalement d'un contenu ou d'un utilisateur | P1 | S | moyen |
| F6.8 | Sanctions vendeur | P1 | S | moyen |
| F6.1 | Avis vérifiés | P2 | M | complet |
| F6.2 | Score de confiance vendeur | P2 | M | complet |
| F6.9 | Réponse publique du vendeur à un avis | P2 | C | cadre |
| F6.10 | Avis avec photo portée et morphologie | P2 | S | moyen |

---

## F6.3 / F6.4 / F6.5 / F6.6 — Le litige, de l'ouverture à la décision

`P1 · M · complet` — **Règles** R-T1 à R-T6 · **Recette RB4** · **Dépend de** F4.4

### 1. Conception

**A** : commande → « Il y a un problème » → motif (non reçu / abîmé / pas conforme / mauvaise taille / autre) → photos → description → envoi. **Les fonds restent bloqués** *(F4.4)*. Elle reçoit un numéro de dossier.

**V** : notifiée, voit le motif et les photos, répond **dans le même fil**, propose une solution (renvoi, remboursement partiel, geste commercial).

**A / V** : si un accord est trouvé dans le fil, **le dossier se clôt sans arbitrage**. C'est le chemin le plus souhaitable : rapide, peu coûteux, et il laisse les deux parties en état de refaire affaire.

**OP** : sans accord sous 48 h → arbitrage. Il voit **l'historique complet des deux côtés** *(F6.6)*, les statuts de livraison, la preuve de remise, les échanges → tranche → **décision écrite, motivée, notifiée aux deux** *(R-T2)* → exécute le remboursement ou la libération des fonds.

**Toutes les décisions sont archivées** et alimentent les scores *(F6.2)*.

**Ce qui rend l'arbitrage possible, ce sont les preuves déjà collectées ailleurs** : événements de livraison horodatés et attribués *(F5.2)*, preuve de remise photo ou code *(F5.5)*, journal financier *(F4.4)*, chat du direct conservé *(F2.10)*. L'épique 6 ne collecte presque rien : elle **assemble**. C'est pourquoi ces preuves doivent être fiables dès la phase 1.

**Le délai est un engagement, pas une intention** *(RB4)* : la file d'arbitrage doit rendre visible l'âge de chaque dossier, et un dossier qui approche du délai doit remonter en tête.

### 2. Structure de code

```
apps/api/src/modules/litige/
├─ routes.ts        POST /commandes/:id/litige · POST /litiges/:id/messages
│                   POST /admin/litiges/:id/decision
├─ service.ts       ouvrir() · repondre() · accorder() · arbitrer()
├─ machine.ts       ouvert → en_discussion → arbitrage → resolu | clos
├─ dossier.ts       ← assemblage des preuves de tous les modules
├─ execution.ts     applique la décision : remboursement ou libération
└─ *.test.ts
apps/api/src/jobs/escaladeLitige.ts        48 h sans accord → arbitrage
apps/mobile/src/features/litige/
├─ ecrans/{EcranOuvertureLitige,EcranFilLitige,EcranDecision}.tsx
└─ composants/{SelecteurMotif,AjoutPhotos,PropositionSolution}.tsx
apps/admin/src/pages/litiges/{File,Dossier,Decision}.tsx
```

`dossier.ts` est le point intéressant : il lit les autres modules **en lecture seule** pour composer une vue d'instruction complète. C'est le seul endroit du dépôt où un module lit largement chez les autres, et c'est assumé.

### 3. Base de données

Migration `..._f6_3_litige` — `litige`, `message_litige` (CDC §3.10).

```sql
CREATE INDEX litige_file ON litige (statut, cree_le);
CREATE INDEX litige_par_commande ON litige (commande_id);
ALTER TABLE litige ADD CONSTRAINT decision_motivee
  CHECK (statut <> 'resolu' OR (decision_texte IS NOT NULL AND decide_par_id IS NOT NULL));
```

**La contrainte `decision_motivee` est la traduction de RB4 en base** : un litige ne peut pas être marqué résolu sans décision écrite et sans décideur identifié. La base refuse la clôture silencieuse.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — "Il y a un problème" (buyer, dispute opening).
Vertical order: back arrow, title "Que s'est-il passé ?"; a reassurance card in
green with a shield icon reading "Votre argent est toujours bloqué chez JP. Nous
ne payons la vendeuse qu'une fois le problème réglé."; five radio rows with icons:
"Je n'ai pas reçu mon colis", "L'article est abîmé", "Ce n'est pas ce que j'ai
commandé", "La taille ne va pas", "Autre"; a photo area with two filled thumbnails
and a dashed "+ Ajouter une photo" tile and a helper "Les photos aident beaucoup";
a multiline description field with placeholder "Décrivez le problème en quelques
mots"; a full-width primary button "Envoyer mon signalement"; a muted footer
"Vous n'aurez pas à discuter directement avec la vendeuse. JP s'en occupe."

Screen 2 — dispute thread (shared by buyer and seller).
Top: a case header card with "Dossier #L-204", a status chip "En discussion", the
order row, and a countdown line "Arbitrage JP dans 41 h si aucun accord".
A message thread: buyer messages left-aligned with photo attachments, seller
messages right-aligned, and grey system rows in the middle ("Litige ouvert —
14 août 09 h 12", "JP a été notifié").
A seller proposal appears as a distinct bordered card inside the thread:
"Proposition de Miora — Remboursement partiel de 20 000 Ar" with two buttons
"J'accepte" and "Je refuse".
Bottom: a compose row with a camera icon.

Screen 3 — JP decision (both parties).
A formal card: a scales icon, title "Décision de JP", the outcome in bold
"Remboursement intégral de 55 000 Ar", then a section "Motif" with the written
reasoning in full, then "Preuves examinées" as a checklist ("Photos de
l'acheteuse", "Preuve de remise du livreur", "Historique de livraison",
"Échanges du dossier"), then the date and "Décision rendue par l'équipe JP".
A primary button "Voir mon remboursement".

Screen 4 — admin dispute queue (desktop): a table sorted by age with columns
Dossier, Âge (with a red chip past 40 h), Motif, Montant, Acheteuse, Boutique,
Statut; and a side panel showing the assembled evidence dossier: delivery timeline,
proof-of-delivery photo, financial ledger extract, thread transcript, and the two
parties' history — plus a decision form with a required reasoning field and two
buttons "Rembourser l'acheteuse" and "Libérer les fonds au vendeur".
```

### 5. Backend

| Route | Notes |
|---|---|
| `POST /commandes/:id/litige` | motif, photos, description → fonds bloqués, numéro de dossier |
| `GET /litiges/:id` | fil, visible des deux parties |
| `POST /litiges/:id/messages` | texte + pièces jointes |
| `POST /litiges/:id/proposition` | vendeur propose une solution |
| `POST /litiges/:id/accord` | acheteuse accepte → clôture **sans arbitrage** |
| `GET /admin/litiges` | file par âge, urgents en tête |
| `GET /admin/litiges/:id/dossier` | assemblage des preuves |
| `POST /admin/litiges/:id/decision` | **motif obligatoire**, exécution automatique |

Travail `escaladeLitige` : 48 h sans accord → `arbitrage`, notification aux deux, entrée en file.

**Tests**
- Ouverture → **fonds bloqués**, libération automatique **suspendue** *(F4.6)*.
- Accord dans le fil → clôture sans arbitrage, exécution de la solution convenue.
- 48 h sans accord → escalade automatique, une seule fois.
- Décision sans motif → **refusée par la base** *(contrainte `decision_motivee`)*.
- Décision « rembourser » → remboursement exécuté et écritures cohérentes ; « libérer » → séquestre libéré.
- Dossier d'instruction complet : les cinq sources de preuve présentes.
- Historique identique des deux côtés *(F6.6)* : comparaison des deux réponses.
- **RB4** : sur un jeu de 50 litiges simulés, 100 % ont une décision écrite dans le délai.

### 6. Frontend

Le fil de litige est **le même écran** pour l'acheteuse et le vendeur, avec des messages alignés différemment. Deux écrans distincts divergeraient et produiraient des malentendus sur ce qui a été dit.

La phrase de réassurance sur les fonds bloqués est présente à l'ouverture **et** dans le fil : c'est l'information dont l'acheteuse a besoin pour ne pas paniquer.

```issues
feature: F6.3
titre: Signalement d'un litige sur une commande
epic: "06"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.4]
```
```issues
feature: F6.4
titre: Fil de litige avec pièces jointes
epic: "06"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F6.3]
```
```issues
feature: F6.5
titre: Arbitrage par l'équipe JP, décision tracée
epic: "06"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F6.4]
```
```issues
feature: F6.6
titre: Historique complet consultable des deux côtés
epic: "06"
phase: P1
prio: M
etapes: [conception, backend, frontend]
depend: [F6.5]
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
CREATE INDEX avis_par_vendeur ON avis (vendeur_id, cree_le DESC);
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
`GET /articles/:id/avis?morphologie=proche` · `GET /vendeurs/:id/avis`.
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

## F6.2 — Score de confiance vendeur, public

`P2 · M · complet` — **Règles** R-T9, R-T10

### 1. Conception

**Calculé sur** : ventes honorées, délai d'expédition **réel** contre annoncé *(F5.9)*, taux d'annulation vendeur *(F3.9)*, taux de litige, issue des litiges *(F6.5)*.

- **A** : voit le score sur la vitrine et sur chaque direct. **C'est ce qui remplace la recommandation d'une amie**, donc c'est le mécanisme central de croissance du produit.
- **V** : voit son score, **et surtout ce qui le fait monter ou baisser**, avec des conseils concrets (« expédiez sous 24 h pour gagner 0,2 »).

**Le score doit être un objectif motivant, pas une sanction opaque** *(R-T10)*. Cette phrase a une conséquence de conception directe : le vendeur doit voir la **décomposition** de son score et l'effet chiffré de chaque action. Un score global sans explication produit du ressentiment et aucune amélioration.

**Deux garde-fous.**
- **Volume minimal** avant affichage public : un vendeur à 2 ventes dont une contestée aurait un score catastrophique et statistiquement vide. En dessous du seuil, afficher « Nouveau vendeur » plutôt qu'un score.
- **Fenêtre glissante** : un incident d'il y a un an ne doit pas peser autant qu'un incident de la semaine. Sinon le score devient une condamnation, et le vendeur cesse d'essayer de le remonter.

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
  vendeur_id PK/FK · score numeric(3,1)
  nb_ventes_honorees · delai_expedition_reel_h · taux_annulation
  taux_litige · taux_litige_perdu
  decomposition jsonb          -- contribution de chaque composante
  calcule_le
```

`decomposition` est stockée parce que l'affichage vendeur en a besoin et que le recalculer à la volée obligerait à dupliquer la formule côté lecture.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — public trust score, shown as a compact component in three placements:
on a shop header ("4,8" with five small stars and "126 ventes"), on a live stream
top bar (a small "4,8 ★" pill), and on a product page seller row. Plus a
"Nouveau vendeur" variant with a neutral chip and no number, and a tap-through
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

`GET /vendeurs/:id/score` (public, avec seuil de volume) · `GET /vendeur/mon-score` (avec décomposition et conseils).

Recalcul quotidien et sur événement (`commande.confirmee`, `litige.resolu`, annulation).

**Tests** : formule exacte sur des cas de référence ; fenêtre glissante appliquée ; sous le seuil de volume → « Nouveau vendeur », **pas de score** ; décomposition dont la somme égale le score ; conseils cohérents avec les composantes les plus faibles ; score public identique au score vendeur (pas deux calculs).

### 6. Frontend

Composant partagé pour l'affichage public. Écran vendeur avec décomposition et actions concrètes — c'est la seule version du score qui fasse changer un comportement.

```issues
feature: F6.2
titre: Score de confiance vendeur, public
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

Distinct du litige : le litige porte sur une **transaction**, le signalement sur un **contenu ou une personne**. Deux files, deux métiers, deux équipes *(MO* et *OP)*.

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

## F6.8 — Sanctions vendeur

`P1 · S · moyen` — **Règles** R-X6

**Conception** — échelle graduée : avertissement, **gel des encaissements**, suspension. Chaque sanction est écrite, motivée, horodatée, et **contestable** *(F19.9)*.

Le gel des encaissements est la sanction la plus utile et la plus délicate : elle protège les acheteuses futures sans priver le vendeur de son argent déjà gagné. À distinguer soigneusement du gel de retrait *(F0.3)*, qui relève d'un doute d'identité.

**Une sanction sans voie de recours est vécue comme arbitraire et fait partir les meilleurs profils** — y compris les vendeurs sérieux sanctionnés par erreur.

**Base de données** — `sanction` (CDC §3.10), `profil_vendeur.encaissement_gele bool`.

**Backend** — `POST /admin/sanctions`, `POST /sanctions/:id/contestation`. Contrôle du gel dans `paiement` **et** `portefeuille`.

**Design** — Prompt Stitch : *seller-facing sanction notice — a bordered amber card with a warning icon, title "Avertissement", the full written reason, the date, the consequence line ("Vos encaissements sont suspendus jusqu'au 20 août"), a "Ce qu'il faut corriger" checklist, and two buttons "J'ai compris" and "Contester cette décision"; plus the admin sanction form with a graduated severity selector and a required reasoning field.*

**Tests** : les cinq niveaux ; gel effectif sur l'encaissement, **pas sur le retrait des fonds déjà disponibles** ; motif obligatoire ; contestation ouvre un dossier ; expiration automatique d'une sanction à durée.

```issues
feature: F6.8
titre: Sanctions vendeur, avertissement, gel, suspension
epic: "06"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F6.5]
```

---

## F6.9 — Réponse publique du vendeur à un avis

`P2 · C · cadre`

**Conception** — le vendeur peut répondre **une seule fois** publiquement à un avis. Une seule réponse évite la dispute publique, qui abîme la vitrine plus que l'avis initial.

**Impact base de données** — `avis.reponse_texte`, `avis.reponse_le`.

**Endpoint** — `POST /avis/:id/reponse` (refusé si une réponse existe).

**Point d'attention** — la réponse passe par le filtrage automatique des commentaires *(R-X1)* : un vendeur en colère est un risque de contenu à modérer.

```issues
feature: F6.9
titre: Réponse publique du vendeur à un avis
epic: "06"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F6.1]
```

---

*Épique suivante : [EP11-backoffice](EP11-backoffice.md).*
