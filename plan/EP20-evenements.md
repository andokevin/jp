# EP20 — Événements thématiques

> 9 fonctionnalités · vague 1 (conception) / phase 2 (livraison) · module `evenement`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**Un événement est un rendez-vous commercial daté, partagé par plusieurs boutiques, autour d'un thème** : Noël, Pâques, la rentrée, le Nouvel An malgache, un événement Otaku, la Fête des mères.

**Pourquoi c'est une épique et non une fonctionnalité de plus** — c'est le seul mécanisme qui donne à la plateforme une raison d'exister **au-delà de la somme de ses boutiques**. Il crée un pic de trafic que JP peut annoncer, il donne aux petits boutiques une visibilité qu'ils n'achèteraient jamais seuls, et il fabrique un motif de retour daté, plus honnête et moins coûteux qu'une notification de plus *(F17.4)*.

**Pourquoi la livraison est en phase 2** — un événement a besoin de plusieurs boutiques actives et d'un catalogue fourni. Une page d'événement annoncée puis vide est pire que pas d'événement. Mais **une chose doit être faite en phase 1** : le rattachement d'un article à un événement, un simple champ, qui évite une migration lourde le jour où l'événement de Noël sera décidé trois semaines avant Noël.

**Règle de cohérence avec l'épique 14** — un événement n'est pas un thème décoratif. Une page d'événement qui ne mène pas à des articles achetables n'a pas sa place dans le produit.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F20.1 | Événement JP officiel | P2 | S | complet |
| F20.2 | Candidature et acceptation | P2 | S | complet |
| F20.3 | Rattachement d'articles, promos, contenus | P2 | S | complet |
| F20.4 ★ | Page événement publique | P2 | S | complet |
| F20.5 | Mini-événement de boutique | P2 | C | complet |
| F20.6 | Notifications et rappels | P2 | C | complet |
| F20.7 | Badge et bandeau événement | P2 | C | complet |
| F20.8 | Bilan d'événement | P2 | C | complet |
| F20.9 | Calendrier des événements | P2 | C | complet |

---

## F20.1 — Événement JP officiel

`P2 · S · complet` — **Bloque** toute l'épique · **Règles** R-W1, R-W2, R-W12 · **Story** US-EVT-01

### 1. Conception

⚠️ **L'événement de portée JP est supprimé** *(`DP-05`)* : il n'y a plus d'opérateur pour le créer. **Seuls subsistent les événements de boutique**, créés par leur organisateur depuis son studio. Ancienne rédaction : nom, thème, dates, visuel, couleur d'accent, mot-dièse *(F14.12)*, texte de présentation, règles de participation, adresse publique (`slug`).

**Machine à états** *(CDC §4.6)* :

```
BROUILLON ──(annonce, action humaine)──► ANNONCE
                                            │ (date de début)
                                       ┌────▼─────┐
                                       │ EN_COURS │──(date de fin)──► TERMINE
                                       └────┬─────┘                      │
                                            └──────► ANNULE ◄────────────┘
```

**Les dates pilotent les transitions, l'annonce reste humaine** *(R-W1)*. Un événement peut être préparé des semaines à l'avance en `brouillon` sans rien exposer ; l'annonce est une décision éditoriale, la mise en route est mécanique.

**Effet de bord important à la transition `ANNONCE → EN_COURS`** *(R-W4)* : toute candidature restée `candidate` passe automatiquement en `refusee_sans_reponse`, avec notification. Une boutique laissé sans réponse ne recandidate pas — c'est le principal risque de mortalité de la fonctionnalité côté boutique.

**Décision ouverte à trancher avant le premier événement** *(R-W12)* : participation gratuite, payante, ou réservée à un palier d'abonnement boutique — **et surtout qui valide, avec quel délai d'engagement**. Sans validation, la page perd sa valeur éditoriale ; avec une validation lente, les boutiques ne jouent plus le jeu. Recommandation du backlog : gratuit sur les deux premiers événements pour amorcer, puis payant **uniquement** pour les emplacements en tête de page, jamais pour l'accès à l'événement lui-même — sous peine de n'avoir que de grosses boutiques et un catalogue pauvre.

### 2. Structure de code

```
apps/api/src/modules/evenement/
├─ routes.ts        POST /admin/evenements · POST .../annoncer · GET /evenements/:slug
├─ service.ts       creer() · annoncer() · ouvrir() · terminer() · annuler()
├─ machine.ts       transitions, refus automatique des candidatures en attente
├─ repository.ts
├─ slug.ts          génération et unicité
├─ erreurs.ts
└─ *.test.ts
apps/api/src/jobs/evenementsPlanifies.ts     bascules par date, idempotentes
apps/admin/src/pages/evenements/
├─ Liste.tsx · Creation.tsx · Detail.tsx · Candidatures.tsx · Bilan.tsx
```

### 3. Base de données

Migration `..._f20_1_evenement` — table `evenement` (CDC §3.9), plus :

```sql
CREATE UNIQUE INDEX evenement_slug ON evenement (slug);
CREATE INDEX evenement_a_ouvrir ON evenement (debut_le) WHERE statut = 'annonce';
CREATE INDEX evenement_a_terminer ON evenement (fin_le) WHERE statut = 'en_cours';
ALTER TABLE evenement ADD CONSTRAINT periode_coherente CHECK (fin_le > debut_le);
```

**Le champ à créer dès la phase 1** *(voir l'introduction)* : `evenement_element`, la table de rattachement. Elle est vide jusqu'en phase 2, mais son absence obligerait à migrer `article`, `promotion`, `contenu` et `direct` en urgence au moment où l'événement sera décidé.

### 4. Design

Back-office uniquement pour cette fonctionnalité.

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen — seller studio, "Nouvel événement" (mobile layout — there is no back-office anymore, DP-05).
Two-column form. Left column: field "Nom de l'événement" with value "Noël JP
2026"; field "Thème" with a chip suggestion row "Noël · Pâques · Rentrée ·
Otaku · Fête des mères"; a "Slug public" field showing "/evenements/noel-2026"
with a green "Disponible" check; two date fields "Début 20/12/2026" and "Fin
26/12/2026"; a multiline "Présentation" field; a multiline "Règles de
participation" field.
Right column: a visual upload area with a 16:9 preview showing a festive banner;
an accent color picker with a row of swatches and a selected deep red; a hashtag
field "#noeljp"; a live preview card showing exactly how the event will appear in
the buyer calendar (banner, name, dates, "12 boutiques").
Bottom bar: a status pill "Brouillon", a secondary button "Enregistrer" and a
primary button "Annoncer l'événement" with a small note "L'annonce rend
l'événement visible. L'ouverture se fera automatiquement le 20 décembre."
```

### 5. Backend

| Route | Notes |
|---|---|
| `POST /admin/evenements` | statut `brouillon`, slug unique |
| `PATCH /admin/evenements/:id` | libre en `brouillon`, restreint ensuite |
| `POST /admin/evenements/:id/annoncer` | `brouillon → annonce` |
| `POST /admin/evenements/:id/annuler` | depuis tout statut sauf `termine` |
| `GET /evenements/:slug` | **public, sans authentification** *(F20.4)* |

Travail `evenementsPlanifies` : `annonce → en_cours` à `debut_le` (avec refus automatique des candidatures en attente), `en_cours → termine` à `fin_le` (avec génération du bilan, `F20.8`). **Idempotent** : une double exécution ne rejoue ni les refus ni les notifications.

Toute action est inscrite au journal d'audit avec son auteur *(R-W2)*.

**Tests** : dates incohérentes refusées ; slug unique, y compris sur collision de noms ; transitions valides et invalides ; **à l'ouverture, les candidatures en attente passent en `refusee_sans_reponse` avec notification** ; double exécution du travail → un seul passage, un seul lot de notifications ; audit complet.

### 6. Frontend

Back-office `apps/admin` : liste par statut, création en deux colonnes avec aperçu, détail avec onglets Candidatures / Éléments / Bilan.

```issues
feature: F20.1
titre: Événement JP officiel
epic: "20"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F20.2 — Candidature et acceptation d'une boutique ou d'une créatrice

`P2 · S · complet` — **Dépend de** F20.1, F0.6 · **Règles** R-W3, R-W4 · **Story** US-EVT-02

### 1. Conception

- **V / C** : voit les événements ouverts aux candidatures dans son studio → candidate en choisissant les articles et promotions qu'il engage → attend la décision.
- **L'organisateur** : accepte ou refuse, **avec motif écrit en cas de refus** *(R-W4)*. Il n'y a plus d'arbitre tiers *(`DP-05`)*.

**Pourquoi une validation** *(R-W3)* — sans elle, le premier événement de Noël se remplit de 400 articles hors sujet et la page ne vaut plus rien. **La sélection est ce qui fait la valeur de l'événement**, exactement comme pour « JP Sélect » *(F18.1)*. C'est un travail éditorial, pas une formalité administrative.

**La règle qui protège la fonctionnalité côté boutique** *(R-W4)* : une candidature restée sans réponse à l'ouverture est **refusée automatiquement avec notification**. Le silence est le pire des traitements — il fait perdre la confiance sans même produire un refus assumé.

**Boutique non vérifié** *(US-EVT-02 CA7)* : candidature refusée, **avec l'explication de la condition manquante** et un lien vers `F0.6`. Un refus sans explication de ce qu'il faut faire est un refus définitif de fait.

**Créatrice** : engage sa sélection *(F15.3)* ou ses clips ; ses ventes restent attribuées par affiliation *(F15.4)* — l'événement ne change pas la chaîne de rémunération.

### 2. Structure de code

```
apps/api/src/modules/evenement/
├─ participations.ts    candidater() · decider() · refuserSansReponse()
├─ routes.ts            POST /evenements/:id/participations
│                       GET/POST /admin/evenements/:id/candidatures[/:cid/decision]
└─ participations.test.ts
apps/mobile/src/features/evenements/
├─ ecrans/{EcranEvenementsOuverts,EcranCandidature,EcranMonEngagement}.tsx
apps/admin/src/pages/evenements/Candidatures.tsx
```

### 3. Base de données

Migration `..._f20_2_participation` — table `evenement_participation` (CDC §3.9), unicité `(evenement_id, participant_id)`, index `(evenement_id, statut)`.

Le statut `refusee_sans_reponse` est **distinct** de `refusee` : il ne doit pas être compté comme un refus éditorial dans les statistiques, et il signale à l'équipe un défaut de traitement, pas un choix.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Événements ouverts" (seller studio, mobile).
A list of event cards, each with the event banner as a background strip, the name
"Noël JP 2026", the dates "20 – 26 décembre", a countdown chip "Candidatures
jusqu'au 15 déc.", a participants line "12 boutiques déjà acceptées", and a
primary button "Participer". One card shows an already-submitted state: the
button replaced by an amber chip "Candidature envoyée · en attente". Another
shows a green chip "Acceptée" with a link "Gérer mes articles".

Screen 2 — "Participer à Noël JP" (application form, mobile).
Vertical order: the event banner; a rules card with three bullet lines from the
organiser: "Articles en lien avec le thème", "Remise minimum 15 %", "Expédition
sous 48 h"; a section "Vos articles" with a "Choisir des articles" row showing
"12 sélectionnés" and a horizontal thumbnail strip; a section "Votre promotion"
with two radio rows "Utiliser Promo Noël (-20 %)" and "Créer une promotion pour
l'événement"; a full-width primary button "Envoyer ma candidature" and a muted
line "Réponse sous 48 h".

Screen 3 — refusal state for an unverified seller: a bordered amber card with a
shield icon, title "Vérification requise", body "Seules les boutiques vérifiées
peuvent participer aux événements JP.", a checklist of what is missing ("Photo de
votre CIN", "Numéro Mobile Money"), and a primary button "Vérifier mon identité".

Screen 4 — admin candidatures queue (desktop): a table with columns Boutique,
Vérifiée, Articles engagés (with thumbnails), Promotion, Date de candidature, and
an action column with "Accepter" and "Refuser" buttons; refusing opens a small
modal with a required reason field and three quick-pick reasons "Hors thème",
"Remise insuffisante", "Score de confiance trop bas".
```

### 5. Backend

`POST /evenements/:id/participations` — refus si non vérifié, si candidatures closes, si déjà candidat.
`POST /admin/evenements/:id/candidatures/:cid/decision` `{ decision, motif }` — **motif obligatoire si refus**.

**Tests** : candidature unique par participant ; boutique non vérifiée → refus **avec condition manquante** ; acceptation → articles visibles sur la page à l'ouverture ; refus → motif notifié ; **candidature en attente à l'ouverture → `refusee_sans_reponse` + notification** ; créatrice → attribution d'affiliation préservée sur les ventes de l'événement.

### 6. Frontend

Studio boutique : onglet « Événements » avec les états clairement distincts (ouvert, candidaté, accepté, refusé). Back-office : file avec les vignettes des articles engagés — on ne juge pas une candidature sur un nom de boutique.

```issues
feature: F20.2
titre: Candidature et acceptation à un événement
epic: "20"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F20.1, F0.6]
```

---

## F20.3 — Rattachement d'articles, promotions, contenus et directs

`P2 · S · complet` — **Dépend de** F20.2, F7.22 · **Règles** R-W5 · **Story** US-EVT-03

### 1. Conception

Le participant accepté engage : des articles, une promotion existante ou nouvelle *(F7.22)*, des clips avec le mot-dièse de l'événement, un direct programmé *(F2.1)*.

**Deux règles.**
- Un article **peut** appartenir à plusieurs événements *(R-W5)*, mais **une seule remise s'applique** *(R-U7)*. Deux événements simultanés ne cumulent pas leurs réductions — c'est la règle générale des remises, et elle n'a pas d'exception ici.
- Un article retiré de la vente ou épuisé **disparaît proprement** de la page sans la casser. Épuisé : affiché comme tel avec l'alerte de retour en stock *(F7.4)* plutôt que masqué *(US-EVT-03 CA5)* — la page doit rester crédible, et un article épuisé prouve que l'événement marche.

**Modélisation polymorphe assumée.** `evenement_element` porte `(cible_type, cible_id)` pour quatre types de cibles. L'intégrité référentielle est **applicative**, contrôlée à l'insertion. L'alternative — quatre tables de liaison — donnerait une intégrité en base mais quatre requêtes pour composer la page, sur un réseau lent. Le compromis est assumé et documenté.

### 2. Structure de code

```
apps/api/src/modules/evenement/
├─ elements.ts       rattacher() · detacher() · listerParEvenement()
├─ routes.ts         POST/DELETE /evenements/:id/elements
└─ elements.test.ts
apps/mobile/src/features/evenements/
├─ ecrans/EcranMonEngagement.tsx
└─ composants/{SelecteurArticles,SelecteurPromotion}.tsx
```

### 3. Base de données

Migration `..._f20_3_elements` — table `evenement_element` (CDC §3.9), plus `promotion.evenement_id FK null` (déjà prévu en `F7.22`).

```sql
CREATE INDEX element_par_cible ON evenement_element (cible_type, cible_id);
```

Cet index répond à la question posée à chaque affichage de vignette : « cet article est-il dans un événement en cours ? » *(F20.7)*.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Mon engagement · Noël JP" (seller, accepted participant).
Vertical order: the event banner with a green "Acceptée" chip; a summary row
"12 articles · 1 promotion · 1 direct".
Section "Articles engagés": a two-column grid of small product tiles each with a
remove X in the corner, plus a dashed "+ Ajouter" tile.
Section "Promotion": a card showing "Promo Noël -20 %" with an "Active" chip and
a "Modifier" link; below it a muted warning line "Si un autre événement couvre
ces articles, une seule remise s'appliquera — la plus avantageuse pour la
cliente."
Section "Direct": a card "Vendredi 20 déc. 18 h — Spécial Noël" with a "Modifier"
link, or a dashed "+ Programmer un direct" row.
Section "Clips": a horizontal strip of clip thumbnails with the hashtag "#noeljp"
overlaid, plus a "+ Publier un clip" tile.
Pinned bottom: a muted status line "Vos articles sont visibles sur la page de
l'événement" with a "Voir la page" link.
```

### 5. Backend

`POST /evenements/:id/elements` `{ cibleType, cibleId }` — vérifie que le participant est accepté et que la cible lui appartient. `DELETE /evenements/:id/elements/:type/:cibleId`.

**Tests** : rattachement des quatre types ; cible n'appartenant pas au participant → 403 ; participant non accepté → 403 ; article dans deux événements → **une seule remise appliquée** (test croisé `F7.26`) ; article retiré → disparaît de la page sans erreur ; article épuisé → affiché épuisé avec alerte disponible.

### 6. Frontend

Sélecteur d'articles avec recherche et compteur. L'avertissement sur le non-cumul est affiché **au moment du rattachement**, pas dans une aide.

```issues
feature: F20.3
titre: Rattachement d'articles, promotions, contenus et directs
epic: "20"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F20.2, F7.22]
```

---

## F20.4 — Page événement publique ★

`P2 · S · complet` — **Dépend de** F20.3, F0.10, F8.3 · **Règles** R-W6, R-W7 · **Story** US-EVT-04

### 1. Conception

**C'est une page d'acquisition, pas un écran interne** *(R-W6)*. Elle doit s'ouvrir sans compte, se partager avec un aperçu riche, et se filtrer par taille.

**Ordre de composition, qui n'est pas arbitraire** :
1. bandeau visuel, présentation, **compte à rebours** (« ouvre dans 3 jours » ou « se termine dans 6 h ») ;
2. **directs en cours** liés à l'événement — le contenu le plus périssable d'abord ;
3. **articles en promotion** — ce qu'on vient acheter ;
4. clips et stories du mot-dièse — la preuve sociale ;
5. boutiques participantes — l'exploration.

**Filtres obligatoires** *(R-W6)* : taille, budget, catégorie, la taille **pré-remplie depuis le profil** *(F0.5)*. Une page d'événement sans filtre par taille est inutilisable dans le vestimentaire : 200 articles dont 15 à sa taille, c'est 185 déceptions.

**Deux états à soigner autant que l'état nominal.**
- **Annoncé, pas encore ouvert** : compte à rebours et bouton **« Me prévenir à l'ouverture »** *(F20.6)*.
- **Vide** — tous les articles épuisés ou retirés *(US-EVT-04 CA6)* : boutiques participantes, prochain événement. Jamais une grille vide sous un bandeau festif, qui est la pire impression possible.

**Mode économie de données** *(F0.9)* : bandeau et vignettes en basse définition. Un bandeau festif en pleine résolution est exactement le genre de dépense de données qu'on ne peut pas se permettre.

### 2. Structure de code

```
apps/api/src/modules/evenement/
├─ page.ts       composition de la page en UNE réponse, sections ordonnées
└─ page.test.ts
apps/mobile/src/features/evenements/
├─ ecrans/EcranPageEvenement.tsx
├─ composants/{BandeauEvenement,CompteARebours,SectionDirects,
│              GrilleArticlesEvenement,StripClips,ListeBoutiques}.tsx
└─ hooks/usePageEvenement.ts
apps/web/src/pages/evenements/[slug].tsx    ← rendu serveur, Open Graph (F7.11)
```

### 3. Base de données

Aucune table nouvelle. La composition s'appuie sur `evenement_element` et son index `(cible_type, cible_id)`.

**Point de performance** : la page est publique, partagée, et peut recevoir un pic (un lien Facebook qui prend). Réponse **mise en cache** (Redis, TTL court de 60 s) avec invalidation sur rattachement ou détachement. Le stock affiché reste vérifié à la lecture *(R-S2)* — on ne met jamais en cache une disponibilité.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — public event page, event in progress (mobile).
Vertical order: a full-width festive banner image with the event name "Noël JP
2026" overlaid in large type and a red countdown pill "Se termine dans 2 j 6 h";
a short presentation paragraph; a share icon row.
Section "En direct maintenant": a horizontal carousel of two live cards with red
"EN DIRECT" pills and viewer counts.
A sticky filter bar: chips "Ma taille (M)" pre-selected and highlighted,
"Budget", "Catégorie", and a result count "48 articles".
Section "Les offres": a two-column product grid; each tile shows the image, a
small event-colored corner chip, the price "40 000 Ar", a struck "50 000 Ar",
and the shop name in small text. One tile is dimmed with an "Épuisé" chip and a
small bell icon.
Section "#noeljp": a horizontal strip of vertical clip thumbnails with play icons.
Section "Les boutiques participantes": a horizontal strip of round shop avatars
with names and verified badges.

Screen 2 — announced but not yet open.
The same banner, a large centered countdown "Ouvre dans 3 jours" with days/hours
/minutes blocks, the presentation paragraph, a full-width primary button
"Me prévenir à l'ouverture", and a preview strip titled "Un aperçu" showing four
blurred product tiles with a muted line "Les offres seront visibles le 20 décembre".

Screen 3 — empty state (everything sold out).
The banner with a "Terminé" grey pill, a centered illustration, title "Tout est
parti !", body "Les 48 articles de cet événement ont été vendus.", the
participating shops strip, and a card "Prochain événement : Pâques JP, en avril"
with a "Me prévenir" button.
```

### 5. Backend

`GET /evenements/:slug` — **publique**, une seule réponse contenant l'en-tête, le compte à rebours, les sections ordonnées et la première page d'articles. Pagination par curseur sur la grille.
`GET /evenements/:slug/articles?taille=&prixMax=&categorie=&curseur=`.

**Tests** : accessible sans authentification ; ordre des sections respecté ; filtre par taille pré-rempli depuis le profil de l'appelant ; état annoncé → aperçu flouté sans prix exploitables ; état vide → boutiques et prochain événement ; cache invalidé au rattachement ; **disponibilité jamais servie depuis le cache** ; aperçu Open Graph correct (titre, visuel, dates) ; mode économie → images basse définition.

### 6. Frontend

Barre de filtres **collante** — sur 200 articles, un filtre qu'il faut aller rechercher en haut ne sert pas. Grille recyclée. `apps/web` rend la page côté serveur pour l'aperçu de lien, qui est la moitié de la valeur d'acquisition.

```issues
feature: F20.4
titre: Page événement publique
epic: "20"
phase: P2
prio: S
etapes: [conception, squelette, design, backend, frontend]
depend: [F20.3, F0.10, F8.3]
```

---

## F20.5 — Mini-événement propre à une boutique

`P2 · C · complet` — **Dépend de** F20.1 · **Règles** R-W8 · **Story** US-EVT-05

### 1. Conception

La boutique crée son propre rendez-vous, **sans validation** : « Ma braderie de fin de mois », « Nouvelle collection samedi ». Portée limitée à sa vitrine et à ses abonnés.

**La distinction qui protège la valeur du calendrier** *(R-W8)* : les événements JP sont curés et visibles de tous ; les événements de boutique **n'apparaissent pas** dans le calendrier général *(F20.9)*, seulement sur la vitrine et dans le fil des abonnés *(F7.17)*. Sans cette séparation, le calendrier JP se remplit de 300 braderies et perd toute valeur éditoriale — et l'événement officiel perd ce qui le rendait désirable.

**Garde-fou** *(US-EVT-05 CA4)* : cinq mini-événements dans la semaine → la création reste possible, mais **aucune notification supplémentaire** n'est envoyée. On ne bride pas l'usage, on protège l'attention.

### 2. Structure de code

Réutilise entièrement `modules/evenement`, avec `portee = 'boutique'` et `proprietaire_id` renseigné. Aucun code parallèle : les deux portées partagent la machine à états, la page et les éléments.

```
apps/api/src/modules/evenement/service.ts    + branche portee=boutique, sans validation
apps/mobile/src/features/evenements/ecrans/EcranMesEvenements.tsx
```

### 3. Base de données

Aucune migration : `evenement.portee` et `proprietaire_id` existent depuis `F20.1`. Contrainte applicative — `proprietaire_id` est nul si `portee = 'jp'`, renseigné sinon.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Mes événements" (seller, own mini-events).
Vertical order: title "Mes événements"; an informational card with a lightbulb
icon reading "Vos événements sont visibles sur votre vitrine et par vos abonnés.
Les événements JP, eux, sont visibles par tout le monde." with a link
"Voir les événements JP ouverts"; a list of the seller's own event cards, each
with a small colored strip, name "Braderie de fin de mois", dates, a status chip
("En cours", "Programmé", "Terminé") and a results line for finished ones
("18 ventes · 240 000 Ar"); a dashed "+ Créer un événement" row.
Below the list, a muted quota line: "Vos abonnés reçoivent au maximum une
notification par jour."
```

### 5. Backend

`POST /boutique/evenements` — portée boutique, publication immédiate, sans validation. Le reste des routes est partagé avec `F20.1`.

**Tests** : création sans validation ; **absent du calendrier général** ; présent sur la vitrine et dans le fil des abonnés ; cinquième événement de la semaine → créé mais **non notifié** ; une boutique ne peut pas créer d'événement de portée `jp`.

### 6. Frontend

Écran distinct des candidatures aux événements JP — la confusion entre « mon événement » et « l'événement JP auquel je participe » serait immédiate sans cette séparation visuelle.

```issues
feature: F20.5
titre: Mini-événement propre à une boutique
epic: "20"
phase: P2
prio: C
etapes: [conception, design, backend, frontend]
depend: [F20.1]
```

---

## F20.6 — Notifications et rappels d'événement

`P2 · C · complet` — **Dépend de** F20.1, F7.23 · **Règles** R-W9, R-U4 · **Story** US-EVT-06

### 1. Conception

**Trois messages maximum par événement et par utilisateur** *(R-W9)* : à l'ouverture (si l'utilisatrice a demandé à être prévenue ou si elle suit une boutique participante), au dernier jour, et rien d'autre.

**Le budget d'attention est partagé** avec les promotions *(R-U4)*. Une promotion et un événement le même jour ne produisent pas deux notifications pleines — c'est le module `notification` qui arbitre, et lui seul *(PLAN_SOCLE §3)*.

**Qui ne reçoit rien** *(US-EVT-06 CA5)* : celle qui n'a rien demandé et ne suit aucun participant. Un événement JP n'est pas une raison de notifier toute la base — c'est précisément ce qui fait désinstaller.

**V / C** : rappel 48 h avant l'ouverture pour finaliser leur participation. C'est le rappel le plus utile de la fonctionnalité : il évite les candidatures acceptées mais vides.

### 2. Structure de code

```
apps/api/src/modules/evenement/rappels.ts       demanderRappel(), fan-out
apps/api/src/modules/notification/plafonds.ts   + type evenement, budget partagé
apps/api/src/jobs/notificationsEvenement.ts
```

### 3. Base de données

Migration `..._f20_6_rappels` — table `evenement_rappel` (CDC §3.9), avec `notifications_envoyees int` plafonné à 3.

Le compteur est **sur la ligne de rappel** et non seulement dans `notification_compteur` : il doit survivre à la purge des notifications et rester lisible pour le débogage (« pourquoi n'a-t-elle pas reçu le rappel du dernier jour ? »).

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen — three event notifications and the reminder button, as separate frames.
(a) Opening notification on an Android lock screen: app icon, title "Noël JP est
ouvert", body "48 articles en promotion chez 12 boutiques".
(b) Last-day notification: title "Dernier jour — Noël JP", body "Les offres se
terminent ce soir à minuit".
(c) Seller reminder: title "Noël JP ouvre dans 2 jours", body "Vous avez 0
article engagé — ajoutez vos articles maintenant" with an action chip
"Gérer mes articles".
(d) The "Me prévenir" button in two states inside an announced event page:
outlined "Me prévenir à l'ouverture", and after tapping, a filled state with a
check reading "Vous serez prévenue" plus a muted line "3 messages maximum pour
cet événement."
```

### 5. Backend

`POST /evenements/:id/rappel` → inscription. Fan-out à l'ouverture et au dernier jour, par lots, en passant par `notification.envoyer()` qui applique les plafonds.

**Tests** : maximum 3 notifications par événement et par utilisateur ; celle qui n'a rien demandé et ne suit aucun participant → **rien** ; budget partagé avec les promotions vérifié sur un scénario promotion + événement le même jour ; rappel boutique à 48 h, **une seule fois** ; double exécution du travail → pas de doublon.

### 6. Frontend

Bouton « Me prévenir » avec état persistant et **la mention du plafond** — annoncer « 3 messages maximum » est ce qui rend l'inscription acceptable.

```issues
feature: F20.6
titre: Notifications et rappels d'événement
epic: "20"
phase: P2
prio: C
etapes: [conception, bdd, design, backend, frontend]
depend: [F20.1, F7.23]
```

---

## F20.7 — Badge et bandeau événement sur les vignettes

`P2 · C · complet` — **Dépend de** F20.3 · **Règles** R-W7 · **Story** US-EVT-07

### 1. Conception

Un article rattaché à un événement en cours porte une pastille aux couleurs de l'événement, dans le fil, la recherche, la vitrine et sur sa fiche. Un appui mène à la page de l'événement.

**Contrainte technique dimensionnante** *(R-W7)* : la pastille ne doit entraîner **aucun téléchargement d'image supplémentaire**. Le budget de données du fil est déjà contraint *(C1, C2, F0.9)*. La pastille est donc **couleur + texte**, éventuellement un pictogramme vectoriel déjà embarqué — jamais l'image du bandeau miniaturisée.

**Cas à trancher** *(US-EVT-07 CA4)* : article dans deux événements en cours → **une seule** pastille, celle de l'événement dont la fin est la plus proche. Deux pastilles sur une vignette de 160 pixels, c'est illisible, et l'urgence est le critère le plus utile.

### 2. Structure de code

```
packages/ui/src/PastilleEvenement.tsx     couleur + texte, aucun média
apps/api/src/modules/evenement/pastille.ts   résolution de l'événement à afficher
```

La résolution se fait **côté serveur**, dans la projection d'article : le client ne doit pas avoir à interroger les événements pour afficher une vignette.

### 3. Base de données

Aucune table nouvelle. La projection d'article inclut `evenementPastille: { nom, couleur, slug } | null`, résolu via l'index `element_par_cible` *(F20.3)*.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Component sheet — event chip on product surfaces, no additional images.
Row 1: the chip alone in three sizes, rendered as a solid colored corner ribbon
with short text "Noël" — small (feed tile), medium (search row), large (product
page header strip).
Row 2: the chip in context — on a two-column feed tile in the top-left corner
over the product photo; inline in a search result row next to the price; as a
full-width strip under a product page's image carousel reading "Cet article fait
partie de Noël JP" with a right chevron.
Row 3: a note frame stating "The chip must be color + text only — never a
scaled-down banner image", plus an example of the WRONG version (a tiny banner
thumbnail) marked with a red X.
```

### 5. Backend

Inclusion dans les projections de : fil, recherche, vitrine, fiche article, page d'événement. Résolution de l'événement le plus proche de sa fin en cas de multiplicité.

**Tests** : pastille présente sur les quatre surfaces ; article dans deux événements → **une seule**, celle qui finit le plus tôt ; événement terminé → pastille absente ; **aucune requête d'image supplémentaire** dans le rendu du fil (assertion sur les URL de la réponse).

### 6. Frontend

Composant partagé dans `packages/ui`. Test de non-régression sur le budget de données du fil : le nombre d'images demandées pour un écran de fil ne change pas avec ou sans événement en cours.

```issues
feature: F20.7
titre: Badge et bandeau événement sur les vignettes
epic: "20"
phase: P2
prio: C
etapes: [conception, design, backend, frontend]
depend: [F20.3]
```

---

## F20.8 — Bilan d'événement

`P2 · C · complet` — **Dépend de** F20.4, F9.1, F11.7 · **Règles** R-W11 · **Story** US-EVT-09

### 1. Conception

**Côté boutique** — articles vendus, chiffre d'affaires, comparaison avec une période équivalente hors événement, **nouveaux abonnés gagnés**, contenus publiés et leurs conversions. C'est ce qui décide de sa participation au suivant.

**Côté tableau de bord** *(`F11.7`)* — participation par boutique, trafic de la page, conversion, part des ventes de la période attribuable à l'événement, coût des mises en avant.

**La règle qui donne son sens à la fonctionnalité** *(R-W11)* : le bilan est produit **y compris lorsqu'il est mauvais**. Un événement dont le bilan n'est pas mesuré sera reconduit par habitude et non par résultat — et l'équipe passera six mois à organiser des événements qui ne vendent rien.

**La comparaison est le chiffre le plus important**, et le plus délicat : « 320 000 Ar pendant l'événement » ne veut rien dire sans « contre 180 000 Ar sur une période équivalente ». Période de référence : les 7 jours précédant l'événement, même jour de semaine, hors autre événement.

**Attribution** *(US-EVT-09 CA3)* : `commande.origine = 'evenement'` et `commande.evenement_id`, posés lorsque la commande naît de la page de l'événement. Cohérent avec l'attribution d'affiliation *(F15.4)* : une vente peut être attribuée à un événement **et** à une créatrice, ce sont deux dimensions distinctes.

### 2. Structure de code

```
apps/api/src/modules/evenement/
├─ bilan.ts        agrégats boutique et global, période de référence
└─ bilan.test.ts
apps/api/src/jobs/bilanEvenement.ts     généré à la clôture
apps/mobile/src/features/evenements/ecrans/EcranBilanEvenement.tsx
apps/admin/src/pages/evenements/Bilan.tsx
```

### 3. Base de données

Migration `..._f20_8_bilan` :

```
evenement_bilan
  evenement_id FK · participant_id FK null      -- null = bilan global
  nb_articles_vendus · ca_ariary · nb_commandes
  ca_reference_ariary                            -- période équivalente
  nouveaux_abonnes · nb_contenus · conversions_contenus
  trafic_page · taux_conversion
  genere_le
  PK(evenement_id, participant_id)
```

Bilan **matérialisé à la clôture** et non recalculé à chaque consultation : les données sources (commandes, abonnements) bougent, et un bilan qui change à chaque ouverture n'est pas un bilan.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Bilan · Noël JP" (seller, mobile).
Vertical order: the event banner with a grey "Terminé" chip; a headline card with
a large amount "320 000 Ar" labelled "Chiffre d'affaires de l'événement" and,
directly beneath, a green comparison row with an up arrow "+78 % vs une semaine
normale (180 000 Ar)"; a three-stat row "18 ventes · panier moyen 17 800 Ar ·
12 articles engagés"; a highlighted card with a people icon "+43 nouveaux
abonnés" and a line "Ils resteront après l'événement"; a "Vos contenus" section
with two clip rows each showing views, clicks and sales; a "Ce qui a marché"
section listing the three best-selling items with their quantities; a bottom
card "Prochain événement : Pâques JP en avril" with a primary button
"Participer".
Also produce a poor-result variant: the comparison row in red with a down arrow
"-12 % vs une semaine normale", and an honest neutral card reading "Cet événement
a moins vendu que d'habitude. Vos articles engagés étaient peut-être hors thème."

Screen 2 — admin global report (desktop): a KPI row (page views, unique visitors,
conversion rate, total GMV, discount granted), a participants table sorted by GMV
with columns Boutique, Articles engagés, Ventes, CA, Nouveaux abonnés, and a
footer row of totals; plus a small "Coût des mises en avant" card.
```

### 5. Backend

`GET /evenements/:id/bilan` — boutique : son bilan ; opérateur : le bilan global. Généré par le travail de clôture, relançable.

**Tests** : bilan produit même à zéro vente ; période de référence correcte (7 jours, même jour de semaine, hors événement) ; nouveaux abonnés comptés sur la fenêtre de l'événement ; attribution `origine = evenement` correcte ; une vente attribuée à la fois à un événement et à une créatrice apparaît dans les deux bilans **sans double comptage du chiffre d'affaires global** ; régénération idempotente.

### 6. Frontend

Le bilan est **honnête** : un mauvais résultat est affiché comme tel, avec une hypothèse d'explication. Un bilan qui n'affiche que les bonnes nouvelles ne sert pas à décider.

```issues
feature: F20.8
titre: Bilan d'événement
epic: "20"
phase: P2
prio: C
etapes: [conception, bdd, design, backend, frontend]
depend: [F20.4, F9.1]
```

---

## F20.9 — Calendrier des événements à venir

`P2 · C · complet` — **Dépend de** F20.1, F17.4 · **Règles** R-W10 · **Story** US-EVT-08

### 1. Conception

Écran « Événements » côté acheteuse : événements en cours puis à venir, avec dates, visuels et compte à rebours. Bouton « Me prévenir » *(F20.6)*.

**Ne contient que les événements JP** *(R-W8)*, jamais les mini-événements de boutique. C'est ce qui préserve la valeur du calendrier.

**État vide** *(US-EVT-08 CA4)* — aucun événement annoncé : afficher les **rendez-vous récurrents des boutiques suivies** *(F17.4)*. Le calendrier est alors le meilleur écran pour installer une habitude **sans notification**, ce qui est le mécanisme de rétention le moins coûteux et le moins agressif du produit.

### 2. Structure de code

```
apps/api/src/modules/evenement/calendrier.ts
apps/mobile/src/features/evenements/ecrans/EcranCalendrier.tsx
apps/web/src/pages/evenements/index.tsx
```

### 3. Base de données

Aucune table nouvelle. Index `(statut, debut_le)` sur `evenement` *(F20.1)*.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Événements" calendar (buyer).
Vertical order: title "Événements"; a section "En cours" with one large event card
(banner, name "Noël JP 2026", a red countdown "Se termine dans 2 j", "12
boutiques · 48 articles", primary button "Découvrir"); a section "À venir" with
two smaller cards, each with a muted banner, name, dates "Pâques JP · 5 – 12
avril", and an outline button "Me prévenir" (one of them already shows a filled
"Vous serez prévenue" state); a section "Passés" collapsed with a count "(3)".
Only JP events appear here — no shop mini-events.

Screen 2 — empty state.
Title "Événements", then a centered illustration and title "Aucun événement pour
le moment", body "Voici les rendez-vous de vos boutiques", followed by a list of
recurring appointment rows: shop avatar, "Miora Boutique", "Tous les vendredis
18 h", and a "Me rappeler" outline button.
```

### 5. Backend

`GET /evenements?statut=` — en cours, à venir, passés. **Publique** *(F0.10)*. Repli sur les rendez-vous récurrents des comptes suivis si aucun événement annoncé.

**Tests** : mini-événements de boutique **absents** ; ordre en cours → à venir → passés ; état vide → rendez-vous récurrents ; accessible sans compte ; « Me prévenir » inscrit bien le rappel.

### 6. Frontend

Cartes avec compte à rebours calé sur l'heure serveur. Écran accessible depuis le fil d'accueil et depuis « Moi ».

```issues
feature: F20.9
titre: Calendrier des événements à venir
epic: "20"
phase: P2
prio: C
etapes: [conception, design, backend, frontend]
depend: [F20.1, F17.4]
```

---

## Récapitulatif de l'épique

**Ordre de réalisation** : F20.1 (socle et machine à états) → F20.2 (candidatures) → F20.3 (rattachement) → F20.4 (page publique) → F20.7 (pastilles) → F20.6 (notifications) → F20.9 (calendrier) → F20.5 (mini-événements) → F20.8 (bilan).

**Ce qui doit être fait en phase 1, avant tout le reste** : la table `evenement_element` et le champ `commande.evenement_id`. Deux migrations triviales aujourd'hui, une reprise de données pénible plus tard.

**La décision à trancher avant de commencer** *(R-W12)* : modèle de participation et responsable de la validation, avec son délai d'engagement.

---

*Vague 1 terminée. Épiques suivantes : [PLAN_INDEX](PLAN_INDEX.md) → vague 2.*
