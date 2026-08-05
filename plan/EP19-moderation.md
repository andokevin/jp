# EP19 — Modération, sécurité des personnes et signalement

> 12 fonctionnalités · vague 2 · module `moderation`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

> **Ce n'est pas une épique de conformité, c'est une épique de survie.** Le produit expose des jeunes femmes qui se filment. Si JP devient un endroit où l'on se fait humilier en commentaire, le positionnement confiance s'effondre — et d'autant plus vite qu'on avait promis la sécurité.

**Le principe de conception qui gouverne toute l'épique** : les protections sont **disponibles dès la première publication**, pas proposées après le premier incident. Une créatrice qui vit un premier incident ne revient pas — et elle le raconte.

**Toute la liste marquée M de cette épique est dans le périmètre de lancement, sans exception.** C'est une décision de périmètre déjà prise dans le backlog, et elle n'est pas négociable : ouvrir la publication vidéo sans modération, c'est ouvrir un risque qu'on ne peut pas refermer.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F19.1 | Filtrage automatique des commentaires | P1 | M | complet |
| F19.2 | Commentaires restreignables par l'autrice | P1 | M | complet |
| F19.3 | Signalement en un geste | P1 | M | complet |
| F19.12 | Signalement d'urgence | P1 | M | complet |
| F19.4 | Blocage d'un utilisateur | P1 | M | complet |
| F19.5 | Vérification d'âge | P1 | M | complet |
| F19.6 | Retrait de contenu avec notification motivée | P1 | M | complet |
| F19.7 | File de modération dans le back-office | P1 | M | complet |
| F19.8 | Protection contre la republication de contenu volé | P1 | S | complet |
| F19.9 | Sanctions graduées et voie de recours | P1 | S | moyen |
| F19.11 | Filtre de mots personnalisé | P2 | S | moyen |
| F19.10 | Compte privé / audience restreinte | P2 | C | cadre |

---

## F19.1 / F19.2 / F19.11 — Protéger l'autrice avant l'incident

`P1 · M · complet` — **Règles** R-X1, R-X2, R-X3

### 1. Conception

**Trois protections, disponibles à la première publication.**

- **F19.2** : à la publication, l'autrice choisit **qui peut commenter** — tout le monde, ses abonnés, personne.
- **F19.11** : elle définit sa **propre liste de mots bloqués**.
- **F19.1** : le filtrage automatique masque insultes et propos sexuels **avant qu'elle ne les voie**, en malgache et en français.

**« Avant qu'elle ne les voie » est l'exigence, pas « rapidement après »** *(R-X1)*. Un commentaire injurieux masqué au bout de dix minutes a déjà été lu par l'autrice et par son audience. Le filtrage est donc **synchrone, à l'écriture**, et un commentaire filtré n'est jamais diffusé.

**Le malgache est le point difficile.** Les listes de mots et les modèles de détection couvrent mal la langue, et les insultes locales ne se traduisent pas. Conséquence de conception : la liste malgache doit être **constituée avec des locuteurs**, maintenue, et enrichie par les signalements traités *(F19.7)* — c'est un travail continu d'exploitation, pas une livraison unique.

**Deux niveaux de filtrage** : masquage automatique (le message existe mais n'est pas diffusé, et il alimente la file de modération) et blocage à la saisie (numéros de téléphone, invitations à sortir de la plateforme — voir `F1.20`).

### 2. Structure de code

```
apps/api/src/modules/moderation/
├─ filtrage.ts          ← synchrone, appelé AVANT toute diffusion
├─ listes/mg.ts · listes/fr.ts     listes maintenues, versionnées
├─ motsPersonnalises.ts  liste par autrice (F19.11)
├─ restrictions.ts       qui peut commenter (F19.2)
└─ filtrage.test.ts      ← corpus de cas, mg et fr
apps/mobile/src/features/publication/composants/ReglagesCommentaires.tsx
apps/mobile/src/features/reglages/ecrans/EcranMotsBloques.tsx
```

`filtrage.ts` est appelé par **tous** les points d'écriture de texte public : commentaires *(F14.15)*, chat de direct *(F2.10)*, questions d'article *(F1.20)*, réponses de vendeur *(F6.9)*, messages de cadeau *(F16.5)*. Un point d'écriture qui l'oublierait serait une faille — une règle de lint recense les appels.

### 3. Base de données

Migration `..._f19_1_filtrage` :

```
mot_bloque_personnel
  utilisateur_id FK · mot · PK(utilisateur_id, mot)

contenu.commentaires_ouverts(tous|abonnes|aucun)   -- déjà prévu (CDC §3.5)
interaction.statut(publie|masque_auto|masque_autrice|retire)
interaction.motif_masquage null
```

Un commentaire masqué est **conservé** : il est la matière d'un signalement, d'une sanction, et parfois d'une plainte. Il n'est simplement jamais diffusé.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — comment settings at publish time (not buried in settings).
A section inside the publish flow titled "Qui peut commenter ?" with three radio
rows: "Tout le monde", "Mes abonnés seulement", "Personne" — each with a one-line
consequence in muted text. Below, a collapsible row "Mes mots bloqués (4)" with a
chevron. A reassuring line at the bottom: "Les insultes sont masquées
automatiquement, en malgache et en français."
These controls must appear at publication, not after an incident.

Screen 2 — "Mes mots bloqués" (settings).
A list of chips with X marks showing four blocked words (shown as neutral
placeholders "mot1", "mot2" rather than real slurs), an input row "Ajouter un mot"
with an "Ajouter" button, and a muted explanation "Les commentaires contenant ces
mots seront masqués sur toutes vos publications." Plus a line "La liste
automatique de JP s'applique en plus de la vôtre."

Screen 3 — filtered comment placeholders in a comment list, three variants:
(a) a neutral row "Commentaire masqué automatiquement" with a small shield icon and
an "Afficher" link visible ONLY to the author;
(b) "Commentaire masqué par l'autrice";
(c) a restricted comments state: a centered card "L'autrice a limité les
commentaires à ses abonnés" with a "Suivre" button.
```

### 5. Backend

Filtrage appelé dans le service de chaque écriture publique. `GET/PUT /moi/mots-bloques`. `POST /contenus/:id/parametres-commentaires`.

**Tests**
- Commentaire contenant un mot de la liste → **jamais diffusé** (assertion : absent de la réponse de liste, et jamais publié sur le canal WebSocket).
- Corpus de test en **malgache et en français**, insultes et propos sexuels, avec un taux de détection mesuré et documenté.
- Mot personnalisé de l'autrice appliqué **sur toutes** ses publications.
- Commentaires restreints aux abonnés → écriture refusée **côté serveur** pour un non-abonné.
- Commentaires désactivés → écriture refusée côté serveur.
- Les **cinq** points d'écriture de texte public passent par le filtrage (test paramétré sur la liste des points d'entrée).
- Faux positif : un mot légitime contenant une sous-chaîne interdite n'est pas masqué (test de frontières de mots).

### 6. Frontend

Les réglages de commentaires sont **dans le flux de publication**, pas dans un écran de paramètres qu'on ne visite qu'après un problème. L'autrice peut afficher un commentaire masqué si elle le souhaite — c'est son choix, pas celui de la plateforme.

```issues
feature: F19.1
titre: Filtrage automatique des commentaires
epic: "19"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```
```issues
feature: F19.2
titre: Commentaires restreignables par l'autrice
epic: "19"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F19.1]
```
```issues
feature: F19.11
titre: Filtre de mots personnalisé
epic: "19"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F19.1]
```

---

## F19.3 / F19.12 — Signaler, et signaler une urgence

`P1 · M · complet` — **Règles** R-X4, R-X5

### 1. Conception

**Deux niveaux, et c'est la distinction la plus importante de l'épique** *(R-X4)*.

- **Signalement ordinaire** : contenu inapproprié, arnaque, contenu volé → file normale.
- **Signalement d'urgence** : **harcèlement, menace, contenu sexuel non consenti, mineur** → passe **en tête de file** avec un engagement de traitement court.

**Geste** : appui long sur un contenu ou un commentaire → « Signaler » → motif en liste courte → envoyé. Le signalement est **anonyme pour la personne signalée**.

**Pourquoi l'urgence est une catégorie technique et pas une simple étiquette** : elle change l'ordre de la file, déclenche une alerte à l'équipe, et porte un engagement de délai affiché à la personne qui signale. Un signalement de menace traité en 48 h comme le reste est un échec du produit, pas un retard.

**Ce que la personne qui signale doit voir** : un accusé, un numéro, un délai. Signaler dans le vide est décourageant, et quelqu'un qui a signalé sans réponse ne signale plus.

### 2. Structure de code

```
apps/api/src/modules/moderation/
├─ signalements.ts     creer() · classerUrgence() · notifierDecision()
├─ routes.ts           POST /signalements
├─ alertes.ts          alerte équipe sur urgence
└─ signalements.test.ts
packages/ui/src/FeuilleSignalement.tsx      ← un seul composant partout
```

### 3. Base de données

`signalement` (CDC §3.10) avec `niveau(ordinaire|urgence)` et l'index qui met l'urgence en tête :

```sql
CREATE INDEX signalement_file ON signalement (niveau, statut, cree_le);
```

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — report sheet (reached by long-press on content or a comment).
Vertical order: a drag handle and title "Signaler"; a short radio list of reasons,
each with an icon: "Contenu inapproprié", "Arnaque ou faux article", "Contenu
volé", then a visually separated group under a small divider labelled "Urgent" in
red containing "Harcèlement ou menace", "Contenu sexuel non consenti", "Il s'agit
d'un mineur" — each of these three carrying a red chip "Traité en priorité";
an optional detail field; a full-width primary button "Envoyer le signalement";
a muted footer "La personne signalée ne saura pas que vous l'avez signalée."

Screen 2 — confirmation, two variants:
(a) ordinary: a check illustration, "Merci, nous examinons ce signalement",
a case number "#S-1042", and a line "Réponse sous 48 h".
(b) urgent: the same layout with a red accent, "Signalement urgent transmis",
the case number, a line "Traitement sous 2 heures", plus a support card with two
actions "Bloquer cette personne" and "Masquer ses contenus" so the reporter can
protect herself immediately without waiting for the decision.
Frame (b) is the important one: the user must be able to act now.
```

### 5. Backend

`POST /signalements` `{ cibleType, cibleId, motif, niveau, details? }` → 201 `{ numero, delaiEngagementH }`.

Urgence → alerte à l'équipe de modération *(canal dédié)* et entrée en tête de file.

**Tests** : les deux niveaux ; urgence **en tête de file** quelle que soit l'ancienneté des autres ; alerte déclenchée sur urgence ; anonymat pour la personne signalée (aucune réponse ne révèle l'identité du signalant) ; signalements multiples sur la même cible **regroupés** dans la file ; le signalant est notifié de la décision *(R-X6)* ; les actions de protection immédiate fonctionnent sans attendre la décision.

### 6. Frontend

`FeuilleSignalement` est un composant partagé, présent sur : contenu, commentaire, message de chat, question d'article, profil, message de litige. Les actions de protection immédiate (bloquer, masquer) sont proposées **dans l'écran de confirmation d'urgence**.

```issues
feature: F19.3
titre: Signalement en un geste
epic: "19"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```
```issues
feature: F19.12
titre: Signalement d'urgence, harcèlement, menace
epic: "19"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F19.3]
```

---

## F19.7 — File de modération dans le back-office

`P1 · M · complet` — **Règles** R-X4, R-X6 · **⚠️ décision n° 13 : budget et organisation**

### 1. Conception

**MO** traite la file **par priorité** → voit le contenu, l'historique de l'auteur, les signalements antérieurs → retire, avertit, suspend, ou classe → **décision motivée notifiée** à l'auteur **et au signalant** *(R-X6)*.

**Ce qui rend la file utilisable** : l'urgence en tête, l'âge visible, l'engagement de délai affiché, le regroupement des signalements portant sur la même cible, et l'historique de l'auteur à côté du contenu. Un modérateur qui doit naviguer pour savoir si l'auteur a déjà été signalé traite trois fois moins de dossiers.

**Action spécifique aux directs** *(F11.2)* : couper une diffusion en cours, disponible en quelques secondes. C'est la seule action du back-office qui doit être quasi instantanée.

**⚠️ La décision qui conditionne tout** *(n° 13)* : **le budget et l'organisation de la modération** — combien de modérateurs, quels délais d'engagement, quelle couverture horaire. Ce n'est pas une question technique, c'est **une ligne de coût d'exploitation permanente**. Un engagement de 2 h sur les urgences suppose une couverture horaire réelle, y compris le samedi soir, qui est précisément le moment des directs.

**Conséquence de conception** : les délais d'engagement sont **paramétrables** *(R-O1)* et affichés dans l'application. On n'annonce pas 2 h si l'organisation en permet 12.

### 2. Structure de code

```
apps/api/src/modules/moderation/
├─ file.ts              ordre, regroupement, affectation exclusive
├─ decisions.ts         retrait, avertissement, sanction, classement
├─ dossierAuteur.ts     historique, signalements antérieurs, sanctions
└─ file.test.ts
apps/admin/src/pages/moderation/{File,Dossier,Historique}.tsx
```

### 3. Base de données

`signalement` avec `traite_par_id`, `decision`, `traite_le`. Affectation exclusive pour éviter le double traitement :

```sql
ALTER TABLE signalement ADD COLUMN affecte_a_id uuid NULL;
ALTER TABLE signalement ADD COLUMN affecte_le timestamptz NULL;
CREATE INDEX signalement_affectation ON signalement (affecte_a_id)
  WHERE statut = 'en_cours';
```

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen — admin moderation queue and review panel (desktop, dense).
Left: the queue. A pinned red section header "Urgences (2)" with rows showing the
reason, the elapsed time with a red chip "il y a 8 min · engagement 2 h", a content
thumbnail, and a report count chip "3 signalements" when grouped; then a neutral
section "File normale (47)" sorted by age. Each row shows an assignment avatar when
someone is already handling it.
Right: the review panel for the selected report. Top: the reported media or comment
displayed in full, with the report reason and the reporter's optional details in a
quoted block. Middle: an author dossier card — avatar, name, account age, "3
signalements antérieurs · 1 avertissement", a small history list, and the author's
verification status. Bottom: an action bar with four buttons — neutral "Classer
sans suite", amber "Retirer le contenu", orange "Avertir l'auteur", red
"Suspendre le compte" — each opening a required reasoning field with quick-pick
motives; plus a distinct red button "Couper le direct" that appears only for live
content, with a confirmation modal.
A footer line on every decision form: "Votre décision sera notifiée à l'auteur et
à la personne qui a signalé."
```

### 5. Backend

`GET /admin/signalements?niveau=&statut=` · `POST /admin/signalements/:id/affectation` · `POST /admin/signalements/:id/decision` `{ decision, motif }` — **motif obligatoire** · `POST /admin/directs/:id/couper`.

**Tests** : urgence en tête ; affectation **exclusive** (un second modérateur reçoit un conflit) ; signalements groupés par cible ; décision sans motif refusée ; **notification à l'auteur et au signalant** ; coupure d'un direct effective en moins de 5 s ; historique de l'auteur complet ; délai d'engagement lu depuis les paramètres.

### 6. Frontend

Dossier de l'auteur **à côté** du contenu, pas dans un autre écran. Actions avec motif obligatoire et motifs pré-remplis — un modérateur qui traite 80 dossiers par jour ne rédige pas 80 textes libres.

```issues
feature: F19.7
titre: File de modération dans le back-office
epic: "19"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F19.3]
```

---

## F19.5 — Vérification d'âge à l'inscription

`P1 · M · complet` — **Règles** R-V6 · **Recette RB6** · **point non négociable**

### 1. Conception

Déclaration d'âge à l'inscription ; pour **publier du contenu vidéo**, la vérification d'identité *(F0.6, F15.1)* donne l'âge réel.

**Aucune publication vidéo par un mineur** *(RB6)*. Point non négociable, juridiquement et moralement.

**Distinction à tenir** : un mineur **peut acheter** (avec l'accord implicite de ses parents, comme dans n'importe quel commerce), il ne peut **pas se filmer publiquement** ni devenir vendeur ou créatrice. Interdire l'achat serait excessif et inapplicable ; autoriser la publication serait grave.

**La déclaration d'âge est déclarative, la vérification est documentaire.** Le contrôle bloquant s'appuie sur la pièce d'identité, jamais sur la déclaration — c'est la seule façon de tenir `RB6`.

### 2. Structure de code
```
apps/api/src/modules/identite/age.ts       calcul, contrôle, blocage
apps/api/src/modules/contenu/publication.ts   contrôle avant publication
apps/mobile/src/features/auth/ecrans/EcranAge.tsx
```

### 3. Base de données
`utilisateur.date_naissance` *(CDC §3.1)*, renseigné à l'inscription, **écrasé par la valeur de la pièce d'identité** à la vérification.

```sql
-- garde-fou applicatif doublé en base sur la publication vidéo
ALTER TABLE contenu ADD CONSTRAINT publication_video_majeur
  CHECK (type NOT IN ('clip','story','unboxing') OR auteur_majeur = true);
```
*(`auteur_majeur` est renseigné à l'insertion depuis le profil — dénormalisation assumée pour rendre la contrainte vérifiable en base.)*

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — age declaration during sign-up: a date-of-birth field with three
dropdowns (jour, mois, année), a title "Quelle est votre date de naissance ?", and
a muted line "Nécessaire pour respecter la loi sur la publication de contenu";
a primary "Continuer".

Screen 2 — blocked publication for a minor: a bordered neutral card (not
punitive), a shield icon, title "La publication de vidéos est réservée aux
majeurs", body "Vous pouvez continuer à acheter et à suivre des boutiques
normalement.", and a single button "J'ai compris". No shaming, no error red.
```

### 5. Backend
Contrôle à la publication de tout contenu vidéo et au passage en rôle vendeur ou créatrice.

**Tests — RB6** : compte déclaré mineur → publication vidéo **refusée** sur les trois types ; compte vérifié dont la pièce indique un mineur → publication refusée **même si la déclaration disait majeur** ; achat autorisé pour un mineur ; passage en vendeur ou créatrice refusé ; contrainte de base rejetant une insertion fautive.

### 6. Frontend
Message **non punitif** : le mineur n'a rien fait de mal, il utilise l'application autrement.

```issues
feature: F19.5
titre: Vérification d'âge à l'inscription
epic: "19"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F0.1, F0.6]
```

---

## F19.4 — Blocage d'un utilisateur

`P1 · M · complet` — **Voir aussi** F0.12

### 1. Conception

Bloquer quelqu'un : plus de commentaires, plus de questions, plus de messages de chat, plus de visibilité mutuelle des contenus.

**Ce que le blocage ne fait pas, et il faut le dire clairement** : il n'annule pas une transaction en cours, et il n'empêche pas un litige d'être instruit *(F6.5)*. Mélanger la protection sociale et l'exécution commerciale créerait un moyen d'échapper à une obligation en bloquant l'autre partie.

**Disponible immédiatement depuis l'écran de confirmation d'un signalement d'urgence** *(F19.12)* : la personne qui vient de signaler doit pouvoir se protéger sans attendre la décision.

### 2. Structure de code
```
apps/api/src/modules/moderation/blocages.ts
apps/api/src/plateforme/visibilite.ts      ← filtre appliqué aux projections
packages/ui/src/ActionBloquer.tsx
```

`visibilite.ts` applique le filtre de blocage dans **toutes** les projections de contenu, commentaire, chat, liste d'abonnés et fil. C'est le point d'oubli le plus probable : une seule projection non filtrée rend le blocage inopérant.

### 3. Base de données
```
blocage
  bloqueur_id FK · bloque_id FK · cree_le
  PK(bloqueur_id, bloque_id)
  IDX(bloque_id)
```

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — block confirmation sheet.
Title "Bloquer Rakoto ?"; a consequence list with check icons: "Il ne pourra plus
commenter vos publications", "Il ne pourra plus vous écrire dans les directs",
"Vous ne verrez plus ses contenus"; then a separated muted note with an
information icon: "Vos commandes et litiges en cours ne sont pas affectés.";
a red primary button "Bloquer" and a secondary "Annuler".
Plus a "Comptes bloqués (2)" settings list with names and "Débloquer" links.
```

### 5. Backend
`POST /blocages` · `DELETE /blocages/:id` · `GET /moi/blocages`.

**Tests** : commentaire d'une personne bloquée absent des projections ; chat de direct filtré ; contenu mutuellement invisible ; **litige en cours instruit normalement** ; commande en cours livrée normalement ; test paramétré vérifiant que **toutes** les projections listées appliquent le filtre.

### 6. Frontend
Action disponible depuis un profil, un commentaire, un message de chat, et l'écran de confirmation d'urgence.

```issues
feature: F19.4
titre: Blocage d'un utilisateur
epic: "19"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F19.3]
```

---

## F19.6 — Retrait de contenu avec notification motivée

`P1 · M · complet` — **Règles** R-X6

**Conception** — un contenu retiré fait l'objet d'une **notification écrite et motivée** à son auteur, indiquant la règle enfreinte et la voie de recours *(F19.9)*.

**Pourquoi c'est marqué M et pas C** : un retrait silencieux est ce qui produit le sentiment d'arbitraire. L'autrice constate la disparition, ne comprend pas, et raconte que JP censure sans raison. Le coût d'un retrait mal expliqué est supérieur au coût du contenu retiré.

Le retrait **conserve** le contenu en base (`statut = retire`) : il est la pièce d'un recours, et parfois d'une plainte.

**Effets en cascade à traiter** : un contenu retiré qui avait déclenché un crédit d'unboxing *(F17.13)* → crédit repris par écriture inverse ; un contenu retiré qui portait un avis *(F6.1)* → l'avis est-il retiré aussi ? **Décision : non**, l'avis reste s'il est fondé sur un achat réel ; seul le média est retiré.

**Backend** — `POST /admin/contenus/:id/retrait` `{ motif, regle }`, notification, reprise de crédit si applicable.

**Design** — Prompt Stitch : *author notification for a removed content — a card with a neutral shield icon, title "Votre vidéo a été retirée", a quoted rule line "Règle enfreinte : contenu sans article attaché", the moderator's written reason, the content thumbnail dimmed, and two buttons "J'ai compris" and "Contester cette décision"; plus a muted line "Votre crédit de 2 000 Ar a été retiré" when applicable.*

**Tests** : notification motivée envoyée ; contenu conservé en base ; crédit d'unboxing repris par écriture inverse ; avis conservé ; recours ouvrable *(F19.9)*.

```issues
feature: F19.6
titre: Retrait de contenu avec notification motivée
epic: "19"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F19.7]
```

---

## F19.8 — Protection contre la republication de contenu volé

`P1 · S · complet` — **Règles** R-X7

### 1. Conception

**C** signale qu'un contenu est le sien → **MO** compare, retire le contenu republié, sanctionne le récidiviste. **Empreinte automatique** sur les vidéos publiées pour détecter les republications.

**Pourquoi dès la V1** : reprendre la vidéo d'une autre pour vendre le même article est **le premier abus qui apparaîtra**, et c'est celui qui fait fuir les créatrices sérieuses. Une créatrice dont le travail est repris sans recours ne produit plus.

**Mise en œuvre réaliste en V1** : empreinte perceptuelle calculée au transcodage *(F14.2)*, comparaison aux empreintes existantes à la publication, et **signalement au modérateur en cas de proximité forte** — pas de blocage automatique. Un blocage automatique produirait des faux positifs sur des vidéos légitimement similaires (même article, même fond), et bloquer à tort une créatrice est aussi grave que ne pas bloquer un voleur.

### 2. Structure de code
```
apps/api/src/modules/moderation/
├─ empreinte.ts        calcul, comparaison, seuil de proximité
└─ empreinte.test.ts
apps/api/src/jobs/detectionRepublication.ts     après transcodage
```

### 3. Base de données
`contenu.empreinte_video` *(CDC §3.5)* plus :
```
republication_suspectee
  id PK · contenu_id FK · contenu_origine_id FK · proximite numeric
  statut(a_examiner|confirmee|ecartee) · examine_par_id null
  IDX(statut, proximite DESC)
```

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — creator report "Ce contenu est le mien": a form with the suspected clip
thumbnail, a field to link or select her original content, an optional explanation,
and a primary button "Signaler un vol"; plus a reassurance line "Nous comparons les
deux vidéos et nous vous répondons sous 48 h."

Screen 2 — moderator comparison panel (desktop): two video players side by side
labelled "Contenu signalé" and "Contenu d'origine", a similarity score chip
"Proximité 94 %", the two publication dates, the two authors with their account
ages, and three action buttons "Retirer le contenu signalé", "Écarter — vidéos
différentes", "Sanctionner l'auteur (récidive)".
```

### 5. Backend
`POST /contenus/:id/vol` (signalement par l'autrice) · détection automatique après transcodage · `GET /admin/republications`.

**Tests** : empreinte calculée sur toute vidéo publiée ; republication exacte détectée avec une proximité élevée ; vidéo différente du même article → proximité faible, **non signalée** ; aucun retrait automatique ; récidive détectée sur l'historique de l'auteur.

### 6. Frontend
Signalement de vol depuis le contenu suspecté, en un geste. Panneau de comparaison côte à côte pour le modérateur — juger sur deux miniatures est impossible.

```issues
feature: F19.8
titre: Protection contre la republication de contenu volé
epic: "19"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F14.2, F19.7]
```

---

## F19.9 — Sanctions graduées et voie de recours

`P1 · S · moyen` — **Règles** R-X6

**Conception** — échelle graduée : **avertissement, retrait, restriction de publication, suspension, exclusion**. Chaque sanction est écrite, motivée, horodatée.

**C / V peut contester.** **Une modération sans recours est vécue comme arbitraire et fait partir les meilleurs profils** — y compris ceux sanctionnés par erreur, qui sont précisément ceux qu'on ne veut pas perdre.

**Le recours doit être instruit par une personne différente** de celle qui a sanctionné. Sinon ce n'est pas un recours, c'est une confirmation.

**Base de données** — `sanction` (CDC §3.10) avec `conteste bool` et `resultat_contestation`.

**Backend** — `POST /admin/sanctions`, `POST /sanctions/:id/contestation`, `POST /admin/contestations/:id/decision` (avec contrôle que le décideur diffère du sanctionnant).

**Design** — Prompt Stitch : *sanction notice to the author with the graduated scale shown as five steps and the current one highlighted, the written reason, the duration, and a "Contester" button; plus the appeal form with a text field and a line "Votre recours sera examiné par une autre personne que celle qui a pris la décision."; plus the admin appeals queue.*

**Tests** : les cinq niveaux ; recours ouvrable une fois ; **décideur du recours différent du sanctionnant** (refus sinon) ; sanction levée → effets annulés ; sanction à durée → expiration automatique ; historique complet.

```issues
feature: F19.9
titre: Sanctions graduées et voie de recours
epic: "19"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F19.7]
```

---

## F19.10 — Compte privé et audience restreinte

`P2 · C · cadre`

**Conception** — compte privé : les contenus ne sont visibles que des abonnés acceptés. Introduit une **demande d'abonnement à accepter**, ce qui est l'exception à la règle d'abonnement en un appui *(R-Q1)*.

**Impact base de données** — `utilisateur.compte_prive bool`, `abonnement.statut(accepte|en_attente)`.

**Point d'attention, et c'est pourquoi c'est en phase 2** : un compte privé est incompatible avec la vente. Un vendeur ou une créatrice ne peut pas être privé — sinon son catalogue n'est pas découvrable et la règle d'or de l'épique 14 s'effondre. La fonctionnalité ne concerne donc que les **comptes acheteurs** qui publient des unboxings et des looks, et ce cas doit être explicite avant de coder.

```issues
feature: F19.10
titre: Compte privé et audience restreinte
epic: "19"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F7.1]
```

---

*Vague 2 terminée. Vague 3 : [EP08-decouverte](EP08-decouverte.md) · [EP09-statistiques](EP09-statistiques.md) · [EP10-monetisation](EP10-monetisation.md) · [EP12-assistant](EP12-assistant.md) · [EP18-premium](EP18-premium.md).*
