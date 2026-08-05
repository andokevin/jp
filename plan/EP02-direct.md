# EP02 — Le direct

> 21 fonctionnalités · vague 2 · modules `direct`, `stock`, `temps-reel`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**Le cœur historique du produit.** Tout tient dans un parcours de moins de 30 secondes : voir, appuyer sur « Je prends », payer.

**Le point d'architecture de cette épique** — le direct **n'a pas son propre chemin d'achat**. Il réutilise `F1.10` (réservation) et la feuille `features/achat/` partagée avec le catalogue *(F1.15)*. Ce qui est propre au direct : la diffusion vidéo, l'article à l'écran, le bandeau temps réel, le chat, le panneau vendeur, le bilan.

**Le risque technique majeur du projet est ici** : la vidéo *(CDC §7)*. Décision J0 — service géré, derrière une **interface interne** dès le premier jour, pour pouvoir internaliser plus tard sans réécrire l'application.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F2.1 | Planifier un direct | P1 | S | moyen |
| F2.2 | Notification aux abonnés | P2 | M | moyen |
| F2.3 | Démarrer / arrêter un direct | P1 | M | complet |
| F2.4 | Article « à l'écran maintenant » | P1 | M | complet |
| F2.5 | Bandeau prix + stock temps réel | P1 | M | complet |
| F2.6 | **Le bouton « Je prends »** | P1 | M | complet |
| F2.7 | File d'ordre d'arrivée | P1 | M | complet |
| F2.8 | Feuille rapide quantité / taille / livraison | P1 | M | complet |
| F2.9 | Minuteur de réservation visible | P1 | M | complet |
| F2.10 | Chat du direct | P1 | S | moyen |
| F2.11 | Modération du chat | P1 | S | moyen |
| F2.12 | Compteur de spectateurs et réactions | P1 | C | cadre |
| F2.13 | Qualité adaptative et reprise après coupure | P1 | M | complet |
| F2.14 | Panneau vendeur en direct | P1 | M | complet |
| F2.15 | Bilan de fin de direct | P1 | S | moyen |
| F2.16 | Replay achetable | P2 | S | moyen |
| F2.17 | Direct à deux | P3 | W | cadre |
| F2.18 | Vente flash à compte à rebours | P3 | W | cadre |
| F2.19 | Enchère en direct | P3 | W | cadre |
| F2.20 | Épingler un message | P1 | C | cadre |
| F2.21 | Rediffusion vers Facebook ⚠️ | P2 | S | cadre |

---

## F2.3 — Démarrer et arrêter un direct

`P1 · M · complet` — **Dépend de** S6, F1.1 · **Bloque** toute l'épique · **Règles** R-D1, R-D2

### 1. Conception
« Passer en direct » → titre → sélection des articles préparés pour la soirée → vérification de la connexion → compte à rebours 3-2-1 → en ligne. Notification aux abonnés *(F2.2)*.

**L'écran de vérification de connexion n'est pas un ornement** : diffuser depuis un réseau insuffisant produit un direct inregardable, et la vendeuse ne le découvre qu'aux commentaires. Mesure du débit montant avant démarrage, avec un avertissement explicite et la possibilité de passer en qualité réduite.

**Interface vidéo interne** *(CDC §7.2)* : `PrestataireVideo` avec `creerIngest()`, `obtenirLectureUrl()`, `arreterIngest()`, `obtenirEnregistrement()`. Aucun appel direct au prestataire ailleurs dans le code.

### 2. Structure de code
```
apps/api/src/modules/direct/
├─ routes.ts · service.ts · repository.ts · machine.ts
├─ video/PrestataireVideo.ts        ← interface, seule dépendance publique
├─ video/prestataireGere.ts         implémentation V1
apps/mobile/src/features/direct-vendeur/
├─ ecrans/{EcranPreparation,EcranVerificationReseau,EcranDiffusion}.tsx
└─ hooks/{useDiffusion,useQualiteReseau}.ts
```

### 3. Base de données
```
direct
  id PK · vendeur_id FK · titre · affiche_url
  statut(planifie|en_cours|en_pause|termine|annule)
  debut_prevu_le · debut_le null · fin_le null
  ingest_ref · lecture_url · enregistrement_url null
  nb_spectateurs_pic int · IDX(statut, debut_prevu_le)

direct_article                     -- articles préparés pour la soirée
  direct_id FK · article_id FK · position · a_lecran_le null
  PK(direct_id, article_id)
```

`a_lecran_le` est la donnée qui rendra le replay achetable **gratuit** *(F2.16)* : les marqueurs à la minute sont produits par l'usage, sans aucune saisie.

### 4. Design
**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :
```
Screen 1 — "Préparer mon direct" (seller).
Vertical order: title; a "Titre du direct" field with value "Arrivage robes wax";
a "Mes articles pour ce soir" section showing a horizontal strip of selected
product thumbnails with remove X marks and a dashed "+ Ajouter" tile, plus a
count "8 articles préparés"; a connection check card with a signal icon, a green
check and the text "Connexion suffisante — 1,2 Mo/s"; a full-width primary
button "Passer en direct".
Produce a second variant of the connection card in amber: a warning icon, text
"Connexion faible — 0,3 Mo/s", a line "La qualité sera réduite" and a small
"Réessayer" link.

Screen 2 — countdown: a full-screen camera preview with a very large centered
"3" and a muted line "Vos 1 240 abonnés vont être prévenus".

Screen 3 — live broadcasting view (seller).
Full-screen camera feed. Top bar: a red "EN DIRECT" pill, a viewer count "312",
a timer "12:04", and a red "Terminer" button. Bottom left: a chat overlay with
three semi-transparent message rows. Bottom right: a vertical column of icon
buttons (articles drawer, mute, camera flip, pin). A bottom sheet handle labelled
"8 articles · 4 vendus · 210 000 Ar" that can be dragged up (this is F2.14).
```

### 5. Backend
`POST /directs` (planifier) · `POST /directs/:id/demarrer` → identifiants d'ingest · `POST /directs/:id/arreter` → bilan *(F2.15)* · `WS /directs/:id/flux`.

**Tests** : machine à états complète ; démarrage sans article préparé autorisé (le vendeur peut créer en direct, `F1.1`) ; arrêt → bilan généré, enregistrement récupéré ; deux démarrages concurrents → un seul direct actif par vendeur ; le prestataire vidéo est **mocké** dans tous les tests, aucun appel réseau.

### 6. Frontend
Mesure du débit montant, sélection d'articles réordonnable, compte à rebours. Reprise d'un direct interrompu *(F2.13)*.

```issues
feature: F2.3
titre: Démarrer et arrêter un direct
epic: "02"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F2.4 / F2.5 — Article à l'écran et bandeau temps réel

`P1 · M · complet` — **Règles** R-D4, R-S2 · **Bloque** F2.6, F2.16

### 1. Conception
- **V** : tiroir latéral des articles préparés → appui → l'article devient « à l'écran ». Modification du prix **en un appui** (négociation en direct).
- **A** : bandeau en bas — miniature, nom, **prix**, **taille disponible**, **« il en reste 3 »**, bouton « Je prends ». Le compteur décroît en direct quand d'autres achètent : **c'est le moteur de conversion.**

**Le compteur doit être vrai** *(RB9)*. Il vaut `quantite_stock − quantite_reservee` *(R-S2)*, diffusé par le serveur à chaque changement. **Le client n'extrapole jamais** et resynchronise à la reconnexion *(CDC §5.4)*.

**Modification de prix en direct** : elle crée une nouvelle version de prix, elle **ne change pas** le prix des réservations déjà posées ni des commandes passées *(R-U9)*.

### 2. Structure de code
```
apps/api/src/modules/direct/
├─ articleALecran.ts     bascule, horodatage a_lecran_le
└─ diffusion.ts          publication des événements de canal
apps/api/src/temps-reel/canaux/direct.ts
apps/mobile/src/features/direct-vendeur/composants/TiroirArticles.tsx
apps/mobile/src/features/direct/composants/BandeauArticle.tsx
```

### 3. Base de données
`direct.article_a_lecran_id`, `direct_article.a_lecran_le`. Compteur de stock diffusé depuis Redis, **autorité en base** *(F1.10)*.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — buyer live view with the product banner.
A 9:16 live video fills the screen. Pinned at the bottom, above the safe area, a
product banner card: a small square thumbnail on the left; centered, the product
name "Robe wax bleue" on one line and below it the price "50 000 Ar" in bold
beside a size chip row "M L"; on the right, a stock counter "il en reste 3" in
amber; and under the whole card a full-width primary button "Je prends".
Above the banner, a slim chat overlay of three semi-transparent messages.
Produce a second frame where the counter reads "il en reste 1" in red, and a
third where it reads "Épuisé" with the button replaced by an outline button
"Prévenez-moi".

Screen 2 — seller article drawer, dragged up over the live feed.
A sheet listing the 8 prepared articles as rows: thumbnail, name, price with a
small pencil icon for inline editing, stock "3", and on the right a large
"À l'écran" toggle button; the currently on-screen row is highlighted with an
accent border and its button reads "À l'écran ✓". At the top of the sheet, a
"+ Créer un article" row (F1.1 express). Editing a price opens a tiny inline
numeric pad with a warning line "Les réservations en cours gardent l'ancien prix".
```

### 5. Backend
`POST /directs/:id/article-a-lecran` `{ articleId }` · `PATCH /articles/:id/prix` (autorisé au vendeur seulement). Diffusion sur le canal : `article_a_lecran`, `stock_change`, `prix_change`.

**Tests** : bascule d'article → `a_lecran_le` horodaté ; diffusion reçue par les clients connectés ; compteur = stock − réservé ; modification de prix → réservations en cours inchangées ; employé sans permission → 403.

### 6. Frontend
Bandeau qui ne masque jamais le visage de la vendeuse (marge basse). Compteur animé sobrement. Resynchronisation à la reconnexion WebSocket, **jamais d'extrapolation locale**.

```issues
feature: F2.4
titre: Sélectionner l'article à l'écran maintenant
epic: "02"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F2.3]
```
```issues
feature: F2.5
titre: Bandeau prix et stock restant en temps réel
epic: "02"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F2.4, F1.10]
```

---

## F2.6 / F2.8 / F2.9 — Le geste central : « Je prends »

`P1 · M · complet` — **Dépend de** F1.10, F1.15, F0.5 · **Règles** R-D5, R-S1, R-S4, RB7 · **Le parcours le plus important du produit**

### 1. Conception
**Il doit tenir sous 30 secondes.** Appui → une feuille remonte du bas, **le direct continue à jouer au-dessus** → taille (sa taille habituelle présélectionnée depuis `F0.5`) → quantité → livraison (dernier choix mémorisé) → **total avec frais affiché ici, pas plus tard** *(RB7)* → payer.

**Variante essentielle** — « Ajouter au panier » au lieu de payer : l'article reste réservé, elle continue le direct et paie tout à la fin en un seul paiement *(F3.1)*. **Ce chemin augmente le panier et évite cinq paiements mobile money d'affilée** — sur ce marché, chaque paiement est une friction et un frais.

**AN** : appui → inscription express *(F0.10)* → **la réservation est déjà posée** → reprise au choix de la taille.

**V** : voit la commande tomber dans son panneau avec le prénom de l'acheteuse — elle peut la remercier à voix haute. *Détail mineur, effet énorme sur l'ambiance du direct.*

**Cas d'échec** : l'article part pendant le choix de taille → *« Désolé, le dernier vient de partir »* + « Prévenez-moi si ça revient » *(F7.4)*.

**Mutualisation** : la feuille est **le composant partagé** `features/achat/FeuilleJePrends` *(F1.15 §2)*. Elle ne connaît pas l'existence du direct ; c'est le contexte qui lui passe l'origine.

### 2. Structure de code
Réutilise `apps/mobile/src/features/achat/` en totalité. Ajout propre au direct : maintien de la lecture vidéo derrière la feuille, et suspension du minuteur pendant l'attente opérateur *(F2.9, R-S5)*.

### 3. Base de données
Aucune table nouvelle : `reservation` avec `origine = direct` et `direct_id` *(F1.10)*.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — the "Je prends" sheet rising over a LIVE video (the video must remain
visible and playing above the sheet).
Top 40 % of the screen: the live video still playing, with the red "EN DIRECT"
pill visible.
Bottom 60 %: a rounded sheet. Vertical order inside: a drag handle; a row with
the product thumbnail, "Robe wax bleue" and "50 000 Ar"; a "Taille" chip row
"S M L XL" where M is pre-selected and carries a tiny label "votre taille";
a quantity stepper "1"; a "Livraison" section with two radio rows, "Point relais ·
5 000 Ar · Épicerie Tsara" pre-selected with a small "dernier choix" tag, and
"À domicile · 12 000 Ar"; a totals block "Sous-total 50 000 Ar · Livraison
5 000 Ar · Total 55 000 Ar" with the total bold and larger; a reservation pill
"Réservé 4:32"; then TWO buttons stacked: a full-width primary "Payer 55 000 Ar"
and a full-width outline "Ajouter au panier et continuer".
The outline button must be visually prominent — it is the higher-basket path.
```

### 5. Backend
Aucun endpoint nouveau *(F1.10, F3.7)*. `origine = direct` implique la durée courte *(R-H3)*.

**Tests** : parcours complet sous les budgets de latence *(RP1)* ; « Ajouter au panier » → réservation maintenue, direct poursuivi ; paiement unique de plusieurs articles du même direct ; inscription express au milieu du parcours → réservation conservée ; course au stock → message immédiat.

### 6. Frontend
La vidéo **continue de jouer** derrière la feuille : c'est une exigence, pas un raffinement — interrompre le direct pour acheter fait perdre les deux. Feuille au clavier, un seul écran, aucun défilement nécessaire sur un écran de 5 pouces.

```issues
feature: F2.6
titre: Le bouton Je prends
epic: "02"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F1.10, F1.15]
```
```issues
feature: F2.8
titre: Feuille rapide quantité, taille, livraison
epic: "02"
phase: P1
prio: M
etapes: [conception, design, frontend]
depend: [F2.6, F0.5]
```
```issues
feature: F2.9
titre: Minuteur de réservation visible
epic: "02"
phase: P1
prio: M
etapes: [conception, design, frontend]
depend: [F1.10]
```

---

## F2.7 — File d'ordre d'arrivée

`P1 · M · complet` — **Règles** R-S7 · **Story** US-VENTE-09

### 1. Conception
Deux appuis à la même seconde sur la dernière pièce : **l'horodatage serveur tranche**. La seconde voit *« Vous êtes 2ᵉ sur la liste d'attente — si la réservation expire, c'est pour vous »*, et reçoit une notification si la première ne paie pas dans le délai.

**C'est la réponse directe au problème du stock gelé** : sans file, une réservation expirée libère un article que personne ne sait disponible, et la vente est perdue deux fois.

### 2. Structure de code
`modules/stock/file.ts` *(F1.10)* — attribution du rang, notification du suivant à l'expiration.

### 3. Base de données
`reservation.rang` *(F1.10)*. Le rang est attribué **dans la transaction** de tentative de réservation, sur la base de l'horodatage serveur.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Component — waiting-list state, two frames.
(a) In the buy sheet, replacing the pay button: an info card with a queue icon,
title "Vous êtes 2e sur la liste", body "Si la réservation en cours expire dans
4 minutes, l'article est pour vous.", and an outline button "Rester sur la liste".
(b) A push notification: title "C'est pour vous !", body "La robe wax bleue est
libre — vous avez 5 minutes" with an action chip "Payer maintenant".
```

### 5. Backend
Inclus dans `POST /reservations` : sur `STOCK_INSUFFISANT`, renvoyer le rang proposé et inscrire dans la file si l'utilisateur accepte.

**Tests** : deux appuis simultanés → rangs 1 et 2 déterministes par horodatage serveur ; expiration du rang 1 → notification du rang 2 **et à lui seul** ; rang 2 qui abandonne → rang 3 notifié ; file vidée à l'épuisement définitif.

### 6. Frontend
Carte d'attente dans la feuille, notification actionnable.

```issues
feature: F2.7
titre: File d'ordre d'arrivée sur un article
epic: "02"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.10]
```

---

## F2.13 — Qualité adaptative et reprise après coupure

`P1 · M · complet` — **Règles** R-D3, R-S5 · **Contraintes** C1, C2

### 1. Conception
- **V** : connexion perdue → direct en **pause** avec message aux spectateurs (*« Connexion en cours de rétablissement »*) → retour sous 2 minutes → le direct reprend **avec les mêmes spectateurs et les mêmes réservations en cours**. Au-delà, clôture et bilan.
- **A** : son minuteur de réservation est **suspendu** pendant la coupure *(R-S5)*. Elle ne perd pas un article pour un problème réseau qui n'est pas le sien.

**Qualité adaptative** côté diffusion et côté lecture, avec plancher de qualité utilisable sur réseau faible plutôt qu'un arrêt.

### 2. Structure de code
```
apps/api/src/modules/direct/
├─ reprise.ts        pause, fenêtre de 2 min, reprise ou clôture
└─ machine.ts        + état EN_PAUSE
apps/api/src/modules/stock/service.ts    suspension groupée des réservations
apps/mobile/src/features/direct-vendeur/hooks/useRepriseDiffusion.ts
```

### 3. Base de données
`direct.statut` inclut `en_pause`, `direct.pause_depuis`. `reservation.suspendu_depuis` *(F1.10)*.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — viewer side during a seller outage: the last video frame frozen and
dimmed, a centered card with a spinning connection icon, title "Connexion en
cours de rétablissement", body "Miora revient dans un instant", and a reassurance
line in green with a lock icon "Votre réservation est mise en pause (4:32)".

Screen 2 — seller side: a full-screen amber overlay over the camera preview, a
warning icon, title "Connexion perdue", a countdown "Reprise possible pendant
1:47", body "Vos spectateurs et les réservations sont conservés.", and a
secondary button "Terminer le direct".
```

### 5. Backend
Détection de perte d'ingest → `en_pause`, suspension de **toutes** les réservations actives du direct, diffusion aux spectateurs. Reprise sous 2 min → `en_cours`, `expire_le` repoussé de la durée exacte. Au-delà → `termine` + bilan.

**Tests** : suspension et reprise → `expire_le` repoussé de la durée écoulée, à la seconde ; coupure de plus de 2 min → clôture + bilan ; spectateurs reconnectés retrouvent le même direct ; **aucune réservation perdue** ; suspension groupée sur 200 réservations en une transaction.

### 6. Frontend
Reprise automatique de la diffusion, sans redemander le titre ni les articles. Côté acheteuse, le minuteur affiche son état suspendu *(F1.10 §4)*.

```issues
feature: F2.13
titre: Qualité adaptative et reprise après coupure réseau
epic: "02"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F2.3, F1.10]
```

---

## F2.14 — Panneau vendeur en direct

`P1 · M · complet`

### 1. Conception
Un tiroir avec, en temps réel : spectateurs, réservations en cours, commandes payées, **chiffre d'affaires de la soirée qui monte**.

**Le chiffre qui monte est la fonctionnalité de rétention numéro 1 côté vendeur.** Ce n'est pas de la décoration : c'est ce qui fait revenir la vendeuse le lendemain soir.

### 2. Structure de code
`modules/direct/panneau.ts` (agrégats temps réel) · `apps/mobile/src/features/direct-vendeur/composants/PanneauVendeur.tsx`.

### 3. Base de données
Aucune table : agrégats calculés depuis `reservation` et `commande` du direct, diffusés sur le canal.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — seller live panel, dragged up over the camera feed (bottom sheet at 70 %).
Top of the sheet: a four-stat row of large numbers with small labels —
"312 spectateurs", "4 réservations", "7 payées", and, largest and in accent
color, "210 000 Ar". The amount has a subtle upward animation cue.
Below: a live feed list of events, newest first, each row with a timestamp and an
icon: green "Hanta a payé — Robe wax M — 55 000 Ar", amber "Fara a réservé —
Jupe plissée L — 4:12 restant", grey "Réservation expirée — Robe wax S",
green "Lalao a payé — …". A tab row at the top of the list: "Tout · Payées ·
Réservations · Expirées".
```

### 5. Backend
Canal WebSocket du direct : `spectateurs`, `reservation_creee`, `commande_payee`, `reservation_expiree`, `ca_soiree`.

**Tests** : agrégats exacts sous 100 événements concurrents ; chiffre d'affaires = somme des commandes payées du direct ; reconnexion → état complet resynchronisé.

### 6. Frontend
Tiroir à trois hauteurs (fermé, poignée, ouvert). Le chiffre d'affaires reste visible **sur la poignée** même tiroir fermé — c'est l'information qu'on ne doit jamais cacher.

```issues
feature: F2.14
titre: Panneau vendeur en direct
epic: "02"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F2.3]
```

---

## F2.15 — Bilan de fin de direct

`P1 · S · moyen`

**Conception** — à l'arrêt : durée, spectateurs, pic d'audience, articles vendus, chiffre d'affaires, taux de conversion, réservations expirées, et **articles qui ont eu du chat mais pas de vente** (signal de prix trop haut). Boutons « Partager mon bilan » et « Programmer le prochain direct ».

Le dernier indicateur est le plus actionnable et le moins évident : il transforme une absence de vente en information exploitable.

**Base de données** — `direct_bilan (direct_id PK, duree_s, spectateurs_uniques, pic_audience, nb_vendus, ca, taux_conversion, nb_expirees, articles_sans_vente jsonb)`, matérialisé à la clôture.

**Backend** — généré par la clôture *(F2.3)*, `GET /directs/:id/bilan`.

**Design** — Prompt Stitch : *end-of-live summary screen with a headline amount "210 000 Ar", a four-stat grid (durée 48 min, spectateurs 312, pic 340, conversion 3,8 %), a "Vos ventes" list of sold items with quantities, an amber insight card titled "À regarder" listing two items with "12 messages, 0 vente — le prix est peut-être trop haut", a grey card "3 réservations expirées", and two buttons "Partager mon bilan" and "Programmer le prochain direct".*

**Tests** : bilan exact ; articles avec chat sans vente correctement identifiés ; bilan produit même sur un direct sans vente.

```issues
feature: F2.15
titre: Bilan de fin de direct
epic: "02"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F2.3]
```

---

## F2.10 / F2.11 / F2.20 — Chat, modération, épinglage

`P1 · S · moyen` — **Règles** R-D6, R-X1

**Conception** — chat pour poser une question (matière, longueur, autre couleur). Le vendeur masque un message, bloque un utilisateur, épingle une info. **Liste de mots interdits automatique** *(R-X1)*.

**L'employé peut modérer le chat pendant que la vendeuse parle** *(F10.4)* — rôle réel dans les directs actuels, à supporter dès la phase 1.

**Base de données** — `message_direct (id, direct_id, auteur_id, texte, statut(publie|masque), epingle bool, cree_le)`, index `(direct_id, cree_le)`. Rétention limitée : le chat d'un direct terminé n'a pas besoin d'être conservé indéfiniment, sauf pièce de litige *(R-X9)*.

**Backend** — `WS /directs/:id/flux` (envoi et réception) · `POST /directs/:id/messages/:mid/masquer` · `POST .../epingler`. Filtrage **avant** diffusion, jamais après.

**Design** — Prompt Stitch : *live chat overlay with semi-transparent message rows (avatar, first name, message), a pinned message bar at the top of the chat area with a pin icon and accent border reading "Robe wax : 50 000 Ar, tailles M et L", and a compose row at the bottom; plus a long-press action sheet on a message with options "Masquer", "Épingler", "Bloquer cette personne"; plus a masked message placeholder reading "Message masqué".*

**Tests** : mot interdit filtré avant diffusion ; masquage propagé à tous les clients ; un seul message épinglé à la fois ; employé avec permission peut modérer, sans permission → 403 ; utilisateur bloqué ne peut plus écrire.

```issues
feature: F2.10
titre: Chat du direct
epic: "02"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F2.3]
```
```issues
feature: F2.11
titre: Modération du chat
epic: "02"
phase: P1
prio: S
etapes: [conception, backend, frontend]
depend: [F2.10, F19.1]
```
```issues
feature: F2.20
titre: Épingler un message dans le chat
epic: "02"
phase: P1
prio: C
etapes: [conception, backend, frontend]
depend: [F2.10]
```

---

## F2.1 / F2.2 — Planifier un direct et prévenir les abonnés

`P1 · S` / `P2 · M` — `moyen`

**Conception** — planification (date, heure, titre, affiche), notification aux abonnés **avant** et **au démarrage**. Les notifications de direct sont **regroupées en une par soirée** *(F7.3)* : une acheteuse suivant cinq vendeuses qui diffusent le même soir reçoit un message, pas cinq.

**Base de données** — `direct.debut_prevu_le`, `direct.affiche_url`, `direct.notifie_le`.

**Backend** — `POST /directs` (planification), travail de notification à J-1 et au démarrage, avec plafonds *(R-U4)*.

**Design** — Prompt Stitch : *schedule-live form with date and time pickers, a title field, a poster upload area with a 4:5 preview, an audience card "1 240 abonnés seront prévenus" with a toggle, and a primary button "Programmer"; plus a grouped push notification "3 directs ce soir" body "Miora à 18 h, Fara à 20 h, Lalao à 21 h".*

**Tests** : notification à J-1 et au démarrage ; regroupement par soirée ; plafonds partagés avec les promotions ; direct annulé → notification d'annulation, une seule.

```issues
feature: F2.1
titre: Planifier un direct
epic: "02"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F2.3]
```
```issues
feature: F2.2
titre: Notification aux abonnés avant et au démarrage
epic: "02"
phase: P2
prio: M
etapes: [conception, backend, frontend]
depend: [F2.1, F7.23]
```

---

## F2.16 — Replay achetable, articles repérés à la minute

`P2 · S · moyen` — **le différenciateur le plus fort de la phase 2**

**Conception** — le direct terminé est enregistré ; les articles sont **automatiquement repérés à la minute** où ils ont été mis à l'écran — donnée déjà produite par `F2.4`, **aucune saisie manuelle**. Le vendeur peut corriger un marqueur.

- **A** : frise sous la vidéo → appui sur un article → saut à la minute → « Je prends » fonctionne exactement comme en direct, sur le stock restant.
- **AN** : arrive sur un replay partagé plusieurs jours après — **le direct ne meurt plus à minuit.**

**Base de données** — `direct.enregistrement_url`, `direct_article.a_lecran_le` (déjà là), `direct_marqueur (direct_id, article_id, position_s, corrige_le)`.

**Backend** — génération des marqueurs à la clôture depuis `a_lecran_le`, `GET /directs/:id/replay`, `PATCH /directs/:id/marqueurs`.

**Design** — Prompt Stitch : *replay player screen with a 16:9 video, a scrubber, and beneath it a horizontal filmstrip of product markers — each a small thumbnail with a timestamp "04:12" and a price, the current one highlighted; tapping a marker jumps the video; below, the same product banner and "Je prends" button as in live; a "Épuisé" state on one marker.*

**Tests** : marqueurs générés sans saisie ; saut à la bonne position ; achat depuis un replay → même parcours, stock réel ; article épuisé depuis → marqueur affiché épuisé ; replay accessible sans compte.

```issues
feature: F2.16
titre: Replay achetable, articles repérés à la minute
epic: "02"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F2.4, F2.3]
```

---

## F2.12 — Compteur de spectateurs et réactions

`P1 · C · cadre`

**Conception** — nombre de spectateurs et réactions légères (cœurs). Le compteur doit être **réel** *(RB9)* : pas de gonflement, pas de « spectateurs simulés ».

**Impact base de données** — compteur en Redis, pic conservé dans `direct.nb_spectateurs_pic`.

**Point d'attention** — les réactions sont le contenu le moins coûteux à produire et le plus coûteux à diffuser (une réaction par spectateur par seconde × 300 spectateurs). Agrégation par fenêtre d'une seconde avant diffusion.

```issues
feature: F2.12
titre: Compteur de spectateurs et réactions
epic: "02"
phase: P1
prio: C
etapes: [conception, backend, frontend]
depend: [F2.3]
```

---

## F2.21 — Rediffusion simultanée vers Facebook ⚠️

`P2 · S · cadre` — **décision ouverte n° 5**

**La décision avant la conception.** C'est le pont indispensable au démarrage — l'audience est sur Facebook — mais ça retarde la migration vers JP.

**Recommandation du backlog** : l'activer en phase de lancement, **mesurer le taux de bascule**, puis le restreindre aux paliers d'abonnement payants *(F10.3)*. La mesure est la partie non négociable : sans elle, la décision de le couper ne se prendra jamais.

**Impact technique** — diffusion vers deux destinations depuis un téléphone d'entrée de gamme double le débit montant nécessaire. Sur les réseaux visés, c'est souvent impossible : la rediffusion doit se faire **côté serveur** (le téléphone envoie une fois, le serveur relaie), ce qui suppose un prestataire vidéo qui le permette — critère à intégrer au choix J0 *(CDC §7)*.

**Impact base de données** — `direct.rediffusion_facebook bool`, `direct.rediffusion_ref`.

```issues
feature: F2.21
titre: Rediffusion simultanée vers Facebook
epic: "02"
phase: P2
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F2.3]
```

---

## F2.17 / F2.18 / F2.19 — Direct à deux, vente flash, enchère

`P3 · W · cadre`

**F2.17 — Direct à deux** : co-animation, catalogue partagé. Suppose un ingest à deux sources et une répartition des ventes entre deux portefeuilles. **La répartition est la vraie difficulté**, pas la vidéo : qui encaisse, qui expédie, qui porte le litige.

**F2.18 — Vente flash à compte à rebours** : prix réduit pendant N minutes. Se ramène à une promotion *(F7.22)* à fenêtre très courte. **Le compte à rebours doit être vrai** *(RB9)* — un minuteur qui redémarre est exactement le genre de manipulation que le produit s'interdit.

**F2.19 — Enchère en direct** : la plus lourde des trois. Suppose un mécanisme d'engagement de paiement avant attribution, sinon l'enchère gagnée non payée devient la norme. À ne pas ouvrir sans réponse à cette question.

```issues
feature: F2.17
titre: Direct à deux, co-animation
epic: "02"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F2.3]
```
```issues
feature: F2.18
titre: Vente flash à compte à rebours
epic: "02"
phase: P3
prio: W
etapes: [conception, backend, frontend]
depend: [F7.22]
```
```issues
feature: F2.19
titre: Enchère en direct
epic: "02"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F2.3, F4.1]
```

---

*Épique suivante : [EP04-paiement](EP04-paiement.md).*
