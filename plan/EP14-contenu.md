# EP14 — Contenu et fil social

> 21 fonctionnalités · vague 2 · module `contenu`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

> **Règle d'or, applicable à toute l'épique : aucun contenu ne peut être publié sans au moins un article achetable attaché** *(R-K1, recette **RB5**)*.
> JP n'est pas un réseau social avec une boutique. C'est **une boutique dont le catalogue est fait de vidéos**. Une fonctionnalité de cette épique qui ne mène pas à un achat n'a pas sa place dans le produit.

**La règle d'or est une contrainte technique, pas une intention éditoriale** : elle est appliquée par transaction **et** par contrainte différée en base *(R-K1)*, et son contournement est un défaut bloquant de recette.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F14.5 | **Attacher 1 à n articles à un contenu** | P1 | M | complet |
| F14.1 | Story 24 h shoppable | P1 | M | complet |
| F14.2 | Clip vertical court | P1 | M | complet |
| F14.3 | Fil « Pour toi » swipable | P1 | M | complet |
| F14.7 | **Unboxing** | P1 | M | complet |
| F14.15 | Réactions, commentaires, partages | P1 | M | complet |
| F14.17 | Statistiques d'un contenu | P1 | M | complet |
| F14.20 | Téléversement depuis la galerie | P1 | M | complet |
| F14.4 | Enregistrement et montage simple | P1 | S | moyen |
| F14.6 | Post photo « look du jour » | P1 | S | moyen |
| F14.12 | Hashtags et pages de hashtag | P1 | S | moyen |
| F14.18 | Fil « Abonnements » séparé | P1 | S | moyen |
| F14.16 | Enregistrer un contenu en favori | P1 | C | cadre |
| F14.8 | Avant / après essayage | P2 | S | moyen |
| F14.9 | Sondage « laquelle je prends ? » | P2 | S | moyen |
| F14.13 | Bibliothèque de sons ⚠️ | P2 | S | cadre |
| F14.21 | Sous-titres automatiques | P2 | S | moyen |
| F14.10 | Duo / réponse vidéo | P2 | C | cadre |
| F14.11 | Lookbook thématique | P2 | C | cadre |
| F14.14 | Brouillons et publication programmée | P2 | C | cadre |
| F14.19 | Contenu épinglé sur le profil | P2 | C | cadre |

---

## F14.5 — Attacher 1 à n articles à un contenu

`P1 · M · complet` — **Bloque toute l'épique** · **Règles** R-K1 · **Recette RB5**

### 1. Conception

**La fonctionnalité qui fait tenir toute la règle d'or.**

- **V** : attache ses propres articles.
- **C** : attache **les articles de n'importe quelle boutique** — c'est ce qui fait d'elle une affiliée *(F15.4)*. L'article attaché porte son identifiant de créatrice, donc la vente lui est rattachée.
- **A** : attache l'article qu'elle a **réellement acheté** (unboxing, look) — vérifié depuis son historique de commandes, donc **impossible d'attacher un article qu'on n'a pas acheté**.

**Trois règles d'autorisation distinctes selon le rôle**, et c'est le cœur de la complexité : la boutique est limité à son catalogue, la créatrice a accès à tout catalogue autorisant l'affiliation *(R-N3)*, l'acheteuse est limitée à ses achats confirmés.

**La contrainte de publication** *(R-K1)* : un contenu publié **doit** avoir au moins une ligne dans `contenu_article`. Appliquée dans la transaction de publication **et** par une contrainte différée en base. Le bouton « Publier » reste inactif côté client, mais **le client n'est pas la garantie** — un appel direct à l'API doit échouer aussi.

### 2. Structure de code

```
apps/api/src/modules/contenu/
├─ articlesAttaches.ts    ← autorisation par rôle, la pièce centrale
├─ publication.ts         transaction : contenu + articles, refus si vide
├─ routes.ts
└─ articlesAttaches.test.ts
apps/mobile/src/features/publication/
├─ composants/SelecteurArticles.tsx      trois modes selon le rôle
└─ composants/PastilleProduit.tsx        superposée au média
```

### 3. Base de données

Migration `..._f14_5_contenu_article` — `contenu`, `contenu_article` (CDC §3.5).

```sql
-- la contrainte différée qui garantit RB5 même en cas de bogue applicatif
CREATE OR REPLACE FUNCTION verifier_contenu_a_article() RETURNS trigger AS $$
BEGIN
  IF NEW.statut = 'publie' AND NOT EXISTS (
    SELECT 1 FROM contenu_article WHERE contenu_id = NEW.id) THEN
    RAISE EXCEPTION 'CONTENU_SANS_ARTICLE';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER contenu_doit_avoir_article
  AFTER INSERT OR UPDATE ON contenu
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION verifier_contenu_a_article();
```

Le déclencheur est **différé** : il s'évalue à la fin de la transaction, ce qui permet d'insérer le contenu puis ses articles dans le même bloc.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — "Attacher des articles" (three role variants, same layout).
Vertical order: a title, a search field, and a source selector that differs by
role: for a seller, a single tab "Mon catalogue"; for a creator, two tabs
"Toutes les boutiques" and "Ma sélection", each product tile showing the shop name
and a small chip "vous gagnez 5 % — versés au paiement (DP-09)"; for a buyer, a single tab "Mes
achats" with only confirmed purchases and a muted line "Vous ne pouvez attacher
que des articles que vous avez reçus".
Then a two-column product grid with checkboxes, a running count chip "2 articles
attachés", and a pinned bottom primary button "Continuer".
Produce a blocked state: the "Publier" button disabled with an inline red line
"Attachez au moins un article pour publier".

Screen 2 — product tag floating on a clip.
A vertical video frame with a small semi-transparent product pill anchored in the
lower third: tiny thumbnail, product name truncated, price "50 000 Ar", and a
chevron. Show a second frame where the pill is expanded into a compact card with
the seller name, a verified badge, and a "Je prends" button.
```

### 5. Backend

`POST /contenus` `{ type, mediaUrl, articles[], ... }` → **422 `CONTENU_SANS_ARTICLE`** si la liste est vide.
`GET /articles-attachables?role=` — catalogue autorisé selon le rôle de l'appelant.

**Tests — RB5, à faire sur chaque type de contenu :**
- Publication sans article → **422** sur story, clip, photo, unboxing.
- Appel direct à l'API en contournant le client → refusé.
- Insertion en base contournant le service → **rejetée par le déclencheur différé**.
- Boutique attachant l'article d'un autre → 403.
- Créatrice attachant l'article d'une boutique ayant **refusé l'affiliation** *(R-N3)* → 403.
- Acheteuse attachant un article non acheté → 403 ; article acheté mais non confirmé → 403.
- Contenu de créatrice → `contenu_article.createur_id` renseigné, attribution d'affiliation fonctionnelle *(F15.4)*.

### 6. Frontend

Sélecteur à trois modes, une seule implémentation paramétrée par le rôle. Bouton « Publier » inactif tant qu'aucun article n'est attaché, **avec la raison affichée**.

```issues
feature: F14.5
titre: Attacher 1 à n articles à un contenu
epic: "14"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F1.1]
```

---

## F14.7 — L'unboxing

`P1 · M · complet` — **Le geste le plus important de la couche sociale** · **Règles** R-K2 · **⚠️ montant du crédit à calibrer**

### 1. Conception

**Une action, cinq résultats.**

**A** : son colis arrive → notification *« Filmez l'ouverture et gagnez X Ar de crédit »* → elle enregistre → l'article de sa commande est **attaché automatiquement** → elle dit si ça taille bien → publie. Alors :

1. sa **réception est confirmée** → clôt la commande et **alimente le score de la boutique** *(`UC-31`, `DP-07`)*. **Aucun mouvement d'argent** : il n'y a plus de séquestre à libérer ;
2. un **avis vérifié** est créé *(F6.1)* avec la note de taille ;
3. du **contenu** entre dans le fil ;
4. sa **cagnotte** est créditée *(F17.13)* ;
5. et publiquement, **JP vient de prouver qu'il livre pour de vrai**.

**V** : notifiée, voit la vidéo, peut la repartager sur sa vitrine. Un unboxing positif vaut plus que dix photos de catalogue.

**AN** : le fil d'unboxings est **la meilleure page d'accueil possible** pour quelqu'un qui doute de la plateforme. À exposer sans compte *(F0.10)*.

**Le chemin sans vidéo reste toujours disponible** : la confirmation de réception classique *(F4.5)* en un appui. **On n'oblige personne à se filmer** — et cette règle n'est pas négociable, sur un produit qui expose de jeunes femmes.

**⚠️ À calibrer** : le montant du crédit. Trop bas, personne ne filme ; trop haut, on achète du contenu à perte. **Le taux de production d'unboxings est un indicateur du pilote** *(F11.7)*.

**Point technique délicat** : les cinq effets doivent être **atomiques du point de vue de l'utilisatrice** mais **résilients** individuellement. Si la création de l'avis échoue, la confirmation de réception ne doit pas être annulée — sinon un bogue d'avis bloque le paiement de la boutique. Confirmation et crédit dans la transaction ; avis, contenu et notification en asynchrone idempotent.

### 2. Structure de code

```
apps/api/src/modules/contenu/
├─ unboxing.ts         orchestration des cinq effets
├─ unboxing.test.ts    ← chaque effet, et la résilience de chacun
apps/api/src/jobs/effetsUnboxing.ts     avis, contenu, notification boutique
apps/mobile/src/features/unboxing/
├─ ecrans/{EcranInvitation,EcranEnregistrement,EcranNoteTaille,EcranPublication}.tsx
└─ hooks/useUnboxing.ts
```

### 3. Base de données

`contenu.type = 'unboxing'`, `contenu.commande_source_id` **obligatoire** si type unboxing *(R-K2)* :

```sql
ALTER TABLE contenu ADD CONSTRAINT unboxing_a_commande
  CHECK (type <> 'unboxing' OR commande_source_id IS NOT NULL);
```

`avis.contenu_id` relie l'avis généré à la vidéo *(R-T7)*.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — unboxing invitation (push-triggered).
Vertical order: a parcel-opening illustration; title "Votre colis est arrivé !";
body "Filmez l'ouverture et recevez 2 000 Ar de crédit"; a three-line benefit list
with icons: "Votre réception est confirmée", "Vous aidez les autres clientes",
"2 000 Ar sur votre prochaine commande"; a full-width primary button "Filmer
l'ouverture (30 s)"; and — equally readable, not hidden — a secondary outline
button "Confirmer sans filmer".
The second button must never look like a lesser option.

Screen 2 — recording: a full-screen camera view with a 30-second ring timer, a
large record button, a small attached-product chip pinned at the top showing the
order's item (automatically attached, not removable), and a hint line "Montrez
l'article, dites si la taille vous va".

Screen 3 — "Comment taille cet article ?": three large option cards "Taille
petit", "Conforme", "Taille grand", then a star rating row, then a primary button
"Publier mon unboxing".

Screen 4 — success: a green check, title "Merci !", then a result list with four
green rows: "Réception confirmée — Miora va être payée", "Votre avis est publié",
"Votre vidéo est dans le fil", "2 000 Ar ajoutés à votre cagnotte"; and a primary
button "Voir ma vidéo".
```

### 5. Backend

`POST /commandes/:id/unboxing` `{ mediaUrl, note, conformiteTaille }` :
- **transaction** : confirmation de réception *(F4.5)*, création du contenu avec l'article attaché, crédit de cagnotte ;
- **asynchrone idempotent** : création de l'avis, notification de la boutique, entrée au dressing *(F17.10)*.

**Tests** : les cinq effets produits ; échec de la création d'avis → **confirmation et crédit conservés**, avis rejoué ; unboxing sans commande source → refusé par la base ; article attaché automatiquement et non modifiable ; chemin sans vidéo → confirmation seule, **pas de crédit** ; crédit versé une seule fois par commande ; contenu visible sans compte.

### 6. Frontend

Enregistrement limité à 30 s (poids, transcodage, et une vidéo courte est plus regardée). Le bouton « Confirmer sans filmer » est **visuellement équivalent**, pas relégué.

```issues
feature: F14.7
titre: Unboxing, le geste central du social
epic: "14"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F14.5, F4.5, F6.1]
```

---

## F14.1 / F14.2 / F14.20 — Stories, clips, téléversement

`P1 · M · complet` — **Règles** R-K3, R-K4 · **⚠️ décision J0 : chaîne vidéo**

### 1. Conception

**F14.1 — story 24 h** : photo ou vidéo de 15 s, **article attaché obligatoire** *(F14.5)*, disparaît après 24 h. **La forme la moins coûteuse à produire** : c'est celle qui remplira le fil au quotidien. L'autrice voit qui a vu et combien ont cliqué sur l'article.

**F14.2 — clip vertical** : vidéo plein écran, balayage vertical, pastille produit, achat **sans quitter le clip** (la feuille remonte, la vidéo continue derrière, comme en direct — même composant `features/achat`).

**F14.20 — téléversement** : depuis la galerie, avec file d'envoi **reprenable**. Sur un réseau intermittent, un envoi de vidéo échoue souvent : sans reprise, la créatrice abandonne.

**Chaîne vidéo** *(CDC §7)* : ingest, transcodage en plusieurs qualités, diffusion, expiration à 24 h pour les stories. **Service géré en V1**, derrière l'interface `PrestataireVideo` *(F2.3)*.

**Mode économie de données** *(F0.9)* : préchargement d'**un seul** clip à l'avance, qualité réduite, pas de lecture automatique hors Wi-Fi.

### 2. Structure de code

```
apps/api/src/modules/contenu/
├─ stories.ts · clips.ts
├─ media.ts          téléversement, transcodage, expiration
apps/api/src/jobs/{transcodage,expirationStories}.ts
apps/mobile/src/features/publication/
├─ ecrans/{EcranCapture,EcranChoixGalerie,EcranPublication}.tsx
├─ noyau/fileEnvoi.ts        ← file reprenable, morcelée
apps/mobile/src/features/clips/
├─ ecrans/EcranClips.tsx     pager vertical, un clip par écran
└─ hooks/usePrechargement.ts
```

### 3. Base de données

`contenu` (CDC §3.5) avec `type`, `duree_s`, `expire_le` (stories : +24 h), `empreinte_video` *(F19.8)*, `statistique_contenu`, `interaction`.

```sql
CREATE INDEX contenu_story_active ON contenu (auteur_id, expire_le)
  WHERE type = 'story' AND statut = 'publie';
CREATE INDEX contenu_fil ON contenu (type, publie_le DESC) WHERE statut = 'publie';
```

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — stories row and story viewer.
Frame A: the top of the home feed showing a horizontal row of story circles —
each a round avatar with an accent ring for unseen ones, a grey ring for seen,
the shop or creator first name underneath, and the first circle being the user's
own with a "+" badge.
Frame B: a full-screen story viewer: segmented progress bars at the top, the
author row with avatar and name and a "Suivre" chip, the photo filling the screen,
a floating product pill in the lower third ("Robe wax bleue · 50 000 Ar" with a
chevron), and a bottom row with a reply field and a share icon. A "Vu par 84"
row appears only for the author.

Screen 2 — vertical clips feed.
A full-screen 9:16 video. Right-side vertical action column: like with a count,
comment with a count, share, and save. Bottom-left: author row, caption with
hashtags "#robelongue #noeljp", and a prominent product pill. Pinned bottom above
the safe area: a full-width primary button "Je prends 50 000 Ar".
Produce a data-saver variant: the video replaced by a sharp static poster frame
with a small play button and a chip "Mode léger — appuyez pour lire".

Screen 3 — upload queue sheet: rows per media with a thumbnail, a progress bar,
and states "Envoi 40 %", "Terminé" with a green check, "Échec — Réessayer" with a
link; plus a header line "L'envoi continue en arrière-plan".
```

### 5. Backend

`POST /contenus` (avec articles attachés) · `POST /media/televersement` (URL signée, envoi morcelé) · `GET /contenus/:id` · travail d'expiration des stories à 24 h.

**Tests** : story expirée à 24 h **exactement**, invisible ensuite ; clip publié avec article ; envoi interrompu puis reprisé → **un seul média** ; transcodage en plusieurs qualités ; mode économie → une seule qualité basse préchargée ; publication sans article → 422 *(RB5)*.

### 6. Frontend

Pager vertical avec recyclage et **libération des lecteurs hors écran** *(F13.1)* — première cause de plantage sur un fil de clips. Feuille d'achat par-dessus la vidéo qui continue *(F2.6)*.

```issues
feature: F14.1
titre: Story 24 h shoppable
epic: "14"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F14.5]
```
```issues
feature: F14.2
titre: Clip vertical court, JP Clips
epic: "14"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F14.5]
```
```issues
feature: F14.20
titre: Téléversement depuis la galerie
epic: "14"
phase: P1
prio: M
etapes: [conception, squelette, design, backend, frontend]
depend: [F14.2]
```

---

## F14.3 — Fil « Pour toi » swipable et personnalisé

`P1 · M · complet` — **Règles** R-K8

### 1. Conception

Le fil est ordonné par **sa taille** *(F0.5)*, son budget habituel, ses catégories, ses boutiques suivis, et ce qu'elle a regardé jusqu'au bout.

**Une acheteuse en 42 ne doit pas voir défiler du 36** : c'est **la première cause d'abandon d'un fil mode**, et c'est le seul critère de personnalisation qui compte vraiment au démarrage.

**Ordonnancement V1, volontairement simple et explicable** :
1. **filtre dur** — la taille disponible correspond au profil (élimination, pas pondération) ;
2. **pondération** — catégories et budget du profil, comptes suivis, fraîcheur ;
3. **signal d'usage** — contenus regardés jusqu'au bout de la même catégorie ;
4. **diversité** — pas plus de deux contenus consécutifs du même auteur.

Pas d'apprentissage automatique en V1. Un fil dont on ne peut pas expliquer l'ordre est impossible à corriger quand une boutique se plaint de ne pas être vue.

**Le quiz de style** *(F17.9)* rend le fil pertinent **dès le premier écran** — sans lui, le fil d'un nouveau compte est aléatoire, et le premier écran est celui qui décide.

### 2. Structure de code

```
apps/api/src/modules/contenu/
├─ filPourToi.ts       ordonnancement, les quatre étages
├─ filPourToi.test.ts  ← le filtre dur de taille, testé en premier
apps/mobile/src/features/fil/ecrans/EcranPourToi.tsx
```

### 3. Base de données

Index de `F14.1`. `interaction` de type `vue` avec la durée regardée — c'est le signal d'usage, et il doit être écrit sans coûter cher (par lots, asynchrone).

### 4. Design
*Voir le prompt de fil de clips en [F14.2](#f141--f142--f1420--stories-clips-téléversement).* Variante « Pour toi » : onglet actif, aucune indication de personnalisation à l'écran (elle se ressent, elle ne s'annonce pas).

### 5. Backend

`GET /fil?curseur=&type=` — pagination par curseur, charge utile minimale.

**Tests** : **une acheteuse en 42 ne reçoit aucun contenu dont l'article n'existe qu'en 36** ; pondération par catégorie vérifiée sur un jeu de référence ; pas plus de deux contenus consécutifs du même auteur ; curseur stable sous publication concurrente ; profil vide → fil générique cohérent, pas vide ; performance sur 100 000 contenus.

### 6. Frontend

Balayage vertical fluide, préchargement d'un élément (deux hors mode économie), position conservée au retour.

```issues
feature: F14.3
titre: Fil Pour toi swipable et personnalisé
epic: "14"
phase: P1
prio: M
etapes: [conception, squelette, design, backend, frontend]
depend: [F14.2, F0.5]
```

---

## F14.17 — Statistiques d'un contenu

`P1 · M · complet` — **Règles** R-K15

### 1. Conception

Par contenu : vues, **durée moyenne regardée**, clics vers l'article, « Je prends », ventes, **gains**.

**L'entonnoir complet, pas un compteur de vues** *(R-K15)*. C'est ce qui distingue JP d'un réseau social : ici, une créatrice sait combien elle a fait gagner, pas combien elle a été vue. Un compteur de vues ne se monétise pas et n'aide pas à décider quoi publier ensuite.

### 2. Structure de code
`modules/contenu/statistiques.ts` · `apps/mobile/src/features/contenu/ecrans/EcranStatsContenu.tsx`.

### 3. Base de données
`statistique_contenu` (CDC §3.5), mise à jour par agrégation asynchrone depuis `interaction` et les commandes attribuées — **jamais en synchrone** sur une vue.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — "Statistiques de ce contenu".
Vertical order: a thumbnail row with the clip preview, its caption and publish
date; then a funnel visualisation as five stacked horizontal bars of decreasing
width, each with a label, a number and a conversion percentage from the previous
step: "Vues 12 400", "Regardé en entier 3 100 (25 %)", "Clics sur l'article
820 (26 %)", "Je prends 96 (12 %)", "Ventes confirmées 74 (77 %)";
then a highlighted earnings card in accent color: "Vos gains : 37 000 Ar";
then a two-row comparison "Votre moyenne : 18 000 Ar par clip" and "Meilleur
clip : 62 000 Ar";
then a muted insight line "Vos clips publiés entre 19 h et 21 h convertissent
deux fois mieux."
The earnings figure must be the largest number on the screen — not the views.
```

### 5. Backend
`GET /contenus/:id/statistiques` · `GET /createur/statistiques?periode=`.

**Tests** : entonnoir cohérent (chaque étage ≤ le précédent) ; gains égaux à la somme des commissions des ventes attribuées ; agrégation asynchrone n'impactant pas la latence de lecture d'un contenu ; attribution correcte via `contenu_article.createur_id`.

### 6. Frontend
Le montant des gains est **le plus gros chiffre de l'écran**. C'est une décision de conception, pas de mise en page : c'est la promesse faite à la créatrice.

```issues
feature: F14.17
titre: Statistiques d'un contenu, vues vers ventes
epic: "14"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F14.5, F15.4]
```

---

## F14.15 — Réactions, commentaires, partages

`P1 · M · complet` — **Règles** R-K13, R-X1, R-X2

**Conception** — réactions, commentaires, partage vers WhatsApp *(F7.11)*. **La restriction des commentaires est disponible dès la première publication** *(F19.2, R-X2)* — abonnés seulement, ou désactivés. À concevoir dès la V1, **pas après le premier incident** : une créatrice qui vit un premier incident ne revient pas.

Filtrage automatique **avant** affichage *(R-X1)*, en malgache et en français.

**Base de données** — `interaction` (CDC §3.5), `contenu.commentaires_ouverts(tous|abonnes|aucun)`.

**Backend** — `POST /contenus/:id/interactions`, `POST /contenus/:id/parametres-commentaires`. Compteurs dénormalisés sur `statistique_contenu`.

**Design** — Prompt Stitch : *comments sheet over a clip, with the author's own comment pinned at top, comment rows with avatar, first name, text and a like count, a "Réponse de l'autrice" indented row, and a compose field; plus a restricted state showing a centered muted card "L'autrice a limité les commentaires à ses abonnés" with a "Suivre" button; plus a disabled state "Les commentaires sont désactivés"; plus a filtered-comment placeholder "Message masqué automatiquement".*

**Tests** : filtrage avant affichage ; restriction par abonnés respectée ; commentaires désactivés → écriture refusée côté serveur ; compteurs exacts ; blocage *(F0.12)* filtre les commentaires.

```issues
feature: F14.15
titre: Réactions, commentaires, partages sur un contenu
epic: "14"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F14.2, F19.1, F19.2]
```

---

## F14.12 — Hashtags et pages de hashtag

`P1 · S · moyen`

**Conception** — appui sur `#robelongue` → page rassemblant clips, stories et articles. Les hashtags servent aussi de socle aux **événements** *(F20.3)* et aux défis sponsorisés *(F17.6, F18.6)*.

**Base de données** — `hashtag (id, libelle UQ, nb_contenus)`, `contenu_hashtag (contenu_id, hashtag_id)`.

**Backend** — `GET /hashtags/:libelle`, extraction à la publication, normalisation (minuscules, sans accent).

**Design** — Prompt Stitch : *hashtag page with a header "#noeljp · 128 contenus", an optional event banner when the hashtag belongs to an event, tabs "Populaires · Récents · Articles", and a three-column media grid with play icons and view counts.*

**Tests** : extraction et normalisation ; page mêlant contenus et articles ; hashtag d'événement affichant la bannière *(F20.7)*.

```issues
feature: F14.12
titre: Hashtags et pages de hashtag
epic: "14"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F14.2]
```

---

## F14.18 — Fil « Abonnements » séparé du fil « Pour toi »

`P1 · S · moyen` — **Voir** [F7.17](EP07-communaute.md#f717--fil-abonnements-alimenté-aussi-par-les-nouveautés-catalogue-)

**Conception** — deux onglets distincts. Le fil « Abonnements » est enrichi des **nouveautés catalogue, promotions et événements** *(F7.17, R-Q5)* — sans quoi l'abonnement à une boutique qui ne diffuse pas de direct ne sert à rien.

Ce mini-plan couvre la **structure à deux onglets** et la conservation de l'état de défilement ; `F7.17` couvre l'agrégation multi-sources.

**Tests** : bascule d'onglet conservant la position ; fil abonnements vide → suggestions marquées comme telles.

```issues
feature: F14.18
titre: Fil Abonnements séparé du fil Pour toi
epic: "14"
phase: P1
prio: S
etapes: [conception, design, frontend]
depend: [F7.17]
```

---

## F14.4 — Enregistrement et montage simple dans l'application

`P1 · S · moyen`

**Conception** — enregistrement, découpe, recadrage vertical, réglage de vitesse. **Rien de plus en V1** : le montage avancé est explicitement écarté du lancement, et il est très coûteux en performance sur un appareil d'entrée de gamme.

**Backend** — transcodage côté serveur *(F14.2)*. Le montage côté client se limite à des opérations que l'appareil supporte.

**Design** — Prompt Stitch : *simple in-app editor with a timeline strip of frames, trim handles at both ends showing the resulting duration "0:22", a speed chip row "0,5× · 1× · 2×", a "Recadrer" toggle, and a primary button "Suivant"; deliberately minimal, no layers, no effects.*

**Tests** : découpe et recadrage sur l'appareil de référence sans dépassement mémoire ; vidéo produite conforme aux contraintes de durée et de poids.

```issues
feature: F14.4
titre: Enregistrement et montage simple dans l'application
epic: "14"
phase: P1
prio: S
etapes: [conception, design, frontend]
depend: [F14.2]
```

---

## F14.6 — Post photo « look du jour »

`P1 · S · moyen`

**Conception** — publication photo avec articles attachés, sans vidéo. Forme la plus accessible pour qui ne veut pas se filmer — et il y a beaucoup de gens dans ce cas. Alimenté aussi par le dressing *(F17.11)*.

**Base de données** — `contenu.type = 'photo'`.

**Design** — Prompt Stitch : *photo post composer with a square image, a caption field, an attached-products strip with two thumbnails, a hashtag suggestion row, and a primary "Publier"; plus the published post as it appears in the feed with tappable product pills placed on the image.*

**Tests** : publication avec article ; sans article → 422 *(RB5)* ; pastilles positionnables sur l'image.

```issues
feature: F14.6
titre: Post photo look du jour
epic: "14"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F14.5]
```

---

## F14.21 — Sous-titres automatiques

`P2 · S · moyen`

**Conception** — génération automatique en **malgache et en français**, corrigeable par l'autrice.

**Sans sous-titres, une part importante du contenu n'est pas consommable** : on regarde dans les transports, au bureau, avec de l'entourage. C'est une fonctionnalité d'audience, pas d'accessibilité seulement.

**Base de données** — `contenu_soustitre (contenu_id, langue, contenu_vtt, genere_le, corrige_le)`.

**Backend** — travail de transcription après transcodage. **Le malgache est mal couvert par les services de transcription** : à vérifier en J0, et prévoir la saisie manuelle comme repli acceptable plutôt qu'une transcription fausse.

**Design** — Prompt Stitch : *subtitle editor with the video on top, a scrollable list of timed caption rows each editable inline, a language tab row "Malagasy · Français", and a primary "Enregistrer"; plus the player with captions displayed in a readable band at the lower third.*

**Tests** : génération dans les deux langues ; correction sauvegardée ; affichage lisible sur petit écran ; contenu sans transcription possible → publication non bloquée.

```issues
feature: F14.21
titre: Sous-titres automatiques
epic: "14"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F14.2]
```

---

## F14.8 — Avant / après essayage

`P2 · S · moyen`

**Conception** — deux médias comparés dans un même contenu, avec un curseur. Usage réel : montrer un vêtement porté contre la photo de catalogue — c'est exactement l'information qui manque à l'acheteuse.

**Base de données** — `contenu.media_secondaire_url`.

**Design** — Prompt Stitch : *before/after content with a vertical draggable divider over two stacked images, labels "Photo de la boutique" and "Sur moi", and the attached product pill below.*

```issues
feature: F14.8
titre: Avant / après essayage
epic: "14"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F14.6]
```

---

## F14.9 — Sondage « laquelle je prends ? »

`P2 · S · moyen`

**Conception** — deux ou trois articles proposés, les amies votent, l'autrice achète la gagnante. Produit à la fois de l'engagement, de la preuve sociale, et **une intention d'achat mesurable** — les boutiques voient les résultats agrégés, signal gratuit sur ce qui va se vendre.

**Base de données** — `sondage (contenu_id, options jsonb)`, `sondage_vote (sondage_id, utilisateur_id, option_index)`.

**Design** — Prompt Stitch : *poll content showing two or three product cards side by side with vote buttons and, after voting, horizontal result bars with percentages and a "Vous avez voté" chip; plus the author's view with a "Acheter la gagnante" button.*

**Tests** : un vote par personne ; résultats agrégés visibles de la boutique sans identités.

```issues
feature: F14.9
titre: Sondage laquelle je prends
epic: "14"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F14.6]
```

---

## F14.16 — Enregistrer un contenu en favori

`P1 · C · cadre`

**Conception** — favoris personnels, distincts de la liste d'envies *(F7.13)* qui porte des articles. Un favori porte un **contenu** ; l'article reste accessible depuis lui.

**Impact base de données** — `interaction` de type `favori`.

```issues
feature: F14.16
titre: Enregistrer un contenu en favori
epic: "14"
phase: P1
prio: C
etapes: [conception, backend, frontend]
depend: [F14.15]
```

---

## F14.13 — Bibliothèque de sons et de musique ⚠️

`P2 · S · cadre` — **décision ouverte n° 11**

**La décision avant la conception.** Les droits musicaux sont un **risque juridique réel**, pas une contrainte de confort.

**Recommandation V1** : bibliothèque restreinte de sons libres de droits ou sous licence, plus le son d'origine de la vidéo. **Pas de catalogue commercial tant qu'il n'y a pas de licence.**

**Impact base de données** — `son (id, titre, auteur, licence, url, nb_utilisations)`, `contenu.son_id`.

**Point d'attention** — un son devient cliquable et rassemble les clips qui l'utilisent, ce qui en fait un mécanisme de découverte. Attrayant, mais à ne pas ouvrir avant d'avoir la licence : retirer un son déjà utilisé par 200 clips signifie casser 200 contenus.

```issues
feature: F14.13
titre: Bibliothèque de sons et de musique
epic: "14"
phase: P2
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F14.2]
```

---

## F14.10 / F14.11 / F14.14 / F14.19 — Duo, lookbook, brouillons, épinglage

`P2 · C · cadre`

**F14.10 — Duo / réponse vidéo** : répondre à un clip par un clip. Mécanisme d'engagement fort, mais **risque de harcèlement** : la réponse vidéo non consentie est un vecteur connu. À n'ouvrir qu'avec un réglage d'autorisation par l'autrice *(F19.2)*, dès la conception.

**F14.11 — Lookbook thématique** : collection éditoriale de contenus et d'articles. Se rapproche de « Ma sélection » *(F15.3)* et de « JP Sélect » *(F18.1)* — à concevoir avec eux pour ne pas produire trois mécanismes de collection.

**F14.14 — Brouillons et publication programmée** : `contenu.statut = 'brouillon'` et `publie_le` futur. Utile aux créatrices régulières ; se combine avec le rendez-vous récurrent *(F17.4)*.

**F14.19 — Contenu épinglé sur le profil** : trois contenus au maximum en tête de profil. Au-delà, l'épinglage ne signifie plus rien.

```issues
feature: F14.10
titre: Duo et réponse vidéo
epic: "14"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F14.2, F19.2]
```
```issues
feature: F14.11
titre: Lookbook thématique
epic: "14"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F15.3]
```
```issues
feature: F14.14
titre: Brouillons et publication programmée
epic: "14"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F14.2]
```
```issues
feature: F14.19
titre: Contenu épinglé sur le profil
epic: "14"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F14.2]
```

---

*Épique suivante : [EP15-createurs](EP15-createurs.md).*
