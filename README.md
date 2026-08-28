# JP — « Je prends »

Marketplace mode pour Madagascar : **commerce en direct**, **vente hors direct** (catalogue achetable 24 h/24), et une **couche sociale** dont le catalogue est fait de vidéos.

La promesse tient en une phrase : **l'argent de l'acheteuse est gardé par JP jusqu'à ce qu'elle confirme avoir reçu.**

---

## Les documents, dans l'ordre où les lire

| # | Document | Contenu |
|---|---|---|
| 1 | [JP_POSITIONNEMENT.md](docs/JP_POSITIONNEMENT.md) | Pourquoi ce produit, pour qui, contre quoi |
| 2 | [JP_DESCRIPTION_PROJET.md](docs/JP_DESCRIPTION_PROJET.md) | Présentation générale |
| 3 | [JP_EXPRESSION_DE_BESOIN.md](docs/JP_EXPRESSION_DE_BESOIN.md) | Besoins `Bx.y` et exigences non fonctionnelles `Nx.y` |
| 4 | **[JP_BACKLOG.md](docs/JP_BACKLOG.md)** | **266 fonctionnalités** `Fxx.y` · 21 épiques · parcours par persona |
| 5 | **[JP_USER_STORIES.md](docs/JP_USER_STORIES.md)** | **45 user stories** avec critères d'acceptation, dont au moins un cas d'échec chacune |
| 6 | **[JP_CAS_UTILISATION.md](docs/JP_CAS_UTILISATION.md)** | **30 cas d'utilisation**, acteurs, scénarios, **30 diagrammes de séquence** — un par cas |
| 7 | [JP_CAHIER_DES_CHARGES.md](docs/JP_CAHIER_DES_CHARGES.md) | Volet fonctionnel · **180 règles** `R-xx` · matrice des droits · critères de recette `RBx` |
| 8 | [JP_CDC_TECHNIQUE.md](docs/JP_CDC_TECHNIQUE.md) | Volet technique · modèle de données · machines à états · API |
| 9 | **[JP_CONCEPTION_BDD.md](docs/JP_CONCEPTION_BDD.md)** | **113 tables** · 6 diagrammes ER · ordre des migrations · garanties structurelles |
| 10 | **[JP_CONCEPTION_APP.md](docs/JP_CONCEPTION_APP.md)** | Architecture · 16 modules · navigation · design system · stratégie de tests |
| 11 | **[plan/](plan/)** | **Plan de réalisation, fonctionnalité par fonctionnalité** |
| 12 | **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | **L'arborescence du dépôt** · convention de module · les 4 règles de dépendance |
| 13 | **[docs/SOCLE.md](docs/SOCLE.md)** | **Le socle fichier par fichier** — quoi ouvrir, dans quel ordre, et ce qu'il faut y voir |
| 14 | **[JP_DICTIONNAIRE_DONNEES.md](docs/JP_DICTIONNAIRE_DONNEES.md)** | **Les tables, leurs attributs et leur rôle** · 102 tables recensées · machines à états · les 15 garanties structurelles |
| 15 | **[JP_ACTEURS_WORKFLOWS.md](docs/JP_ACTEURS_WORKFLOWS.md)** | **Qui fait quoi** · 12 acteurs · matrice des droits · cas d'utilisation par acteur · **le déroulé des 30 parcours, avec les tables écrites à chaque étape** |
| 16 | **[docs/marque/](docs/marque/)** | **Le dossier de marque** — StoryBrand, Cercle d'Or, Zag, lois de Ries, étude terrain et concurrence, et les 20 décisions de marque |
| — | [vp/](vp/) | Le même modèle en UML, importable dans Visual Paradigm |

---

## Par où commencer, concrètement

Deux fichiers, dans cet ordre, avant tout le reste :

1. **[plan/VAGUE0-socle.md](plan/VAGUE0-socle.md)** — les dix éléments `S1`→`S10` du socle. **Rien ne démarre avant.** Trois à quatre semaines, aucune fonctionnalité visible produite, et c'est normal.
2. **[plan/TRANCHE1.md](plan/TRANCHE1.md)** — **la première vente réelle**. 58 fonctionnalités : le plus court chemin où de l'argent circule vraiment, du compte créé jusqu'aux fonds libérés. Elle met à l'épreuve **RB1, RB2, RB4, RB7 et RB10** — les cinq critères les plus difficiles.

La phase 1 du backlog fait 841 issues. Réalisée d'un bloc, c'est huit à douze mois avant le premier ariary encaissé. La tranche 1 en fait le tiers et permet de vérifier le modèle sur de vraies vendeuses. Les tranches suivantes sont listées en fin de [TRANCHE1.md](plan/TRANCHE1.md#ce-qui-vient-ensuite).

---

## Le plan de réalisation

Commencer par **[plan/PLAN_SOCLE.md](plan/PLAN_SOCLE.md)** — pile, arborescence, conventions, design system, préambule Stitch. Les 21 fichiers d'épique le supposent connu.

Puis **[plan/PLAN_INDEX.md](plan/PLAN_INDEX.md)** — la carte des 266 fonctionnalités, avec leur fichier, leur phase, leur priorité et leur niveau de détail.

Chaque fonctionnalité a un mini-plan à six sections : **conception · structure de code · base de données · design (avec un prompt Stitch prêt à l'emploi) · backend · frontend**.

### Ordre de réalisation

**Vague 0 — socle** *([VAGUE0-socle.md](plan/VAGUE0-socle.md))* — monorepo, plateforme API, Prisma, files, temps réel, design system, coquilles clientes. Rien ne démarre avant.

**Tranche 1** *([TRANCHE1.md](plan/TRANCHE1.md))* — la première vente réelle, à travers les épiques 00, 01, 03, 04, 05, 06, 11 et 13.

**Puis, par épique** — [EP00 identité](plan/EP00-identite.md) · [EP01 catalogue et vente hors direct](plan/EP01-catalogue.md) · [EP02 direct](plan/EP02-direct.md) · [EP03 commande](plan/EP03-commande.md) · [EP04 paiement](plan/EP04-paiement.md) · [EP05 livraison](plan/EP05-livraison.md) · [EP06 confiance](plan/EP06-confiance.md) · [EP07 communauté](plan/EP07-communaute.md) · [EP08](plan/EP08-decouverte.md) · [EP09](plan/EP09-statistiques.md) · [EP10](plan/EP10-monetisation.md) · [EP11 back-office](plan/EP11-backoffice.md) · [EP12](plan/EP12-assistant.md) · [EP13 socle](plan/EP13-socle.md) · [EP14 contenu](plan/EP14-contenu.md) · [EP15 créatrices](plan/EP15-createurs.md) · [EP16 cadeau](plan/EP16-cadeau.md) · [EP17](plan/EP17-habitude.md) · [EP18](plan/EP18-premium.md) · [EP19 modération](plan/EP19-moderation.md) · [EP20 événements](plan/EP20-evenements.md)

---

## Suivi Kanban

Les issues sont générées depuis les blocs ` ```issues ` des fichiers de plan.

```bash
node scripts/gen-issues.mjs      # plan/EP*.md  →  plan/.issues.jsonl
node scripts/push-issues.mjs     # crée les issues sur GitHub, reprenable
```

### Créer le tableau

1. Onglet **Projects** → **New project** → modèle **Board**
2. Champ **Status** : renommer les colonnes en **À faire / En cours / Terminé**
3. **Workflows** → activer *Auto-add to project* sur les issues du dépôt

Avec plus de 1 300 cartes, un board plat est illisible. Quatre vues à créer :

| Vue | Filtre | Groupement |
|---|---|---|
| **Socle** *(la première)* | `label:tranche:0` | — |
| **Tranche 1** | `label:tranche:1` | `epic:` |
| **Par fonctionnalité** | rechercher un ID (`F7.22`) | milestone |
| **Décisions** | `label:decision-ouverte` | — |

Deux milestones portent la progression qui compte : **Vague 0 — le socle** (45 issues) et **Tranche 1 — la première vente réelle** (302 issues). Les autres milestones sont par épique.

### Labels

- `epic:00` … `epic:20` — l'épique
- `step:conception` · `step:squelette` · `step:bdd` · `step:design` · `step:backend` · `step:frontend` — l'étape
- `prio:M` · `prio:S` · `prio:C` · `prio:W` — la priorité MoSCoW
- `phase:P1` · `phase:P2` · `phase:P3` — la phase
- `status:todo` · `status:doing` · `status:done` — la colonne
- `tranche:0` — le socle, bloque tout le reste · `tranche:1` — la première vente réelle
- `decision-ouverte` — bloqué par un arbitrage produit

---

## Le modèle UML

[vp/JP.xmi](vp/JP.xmi) — 98 classes, 16 acteurs, 30 cas d'utilisation, **30 diagrammes de séquence**, en XMI 2.1. À importer dans Visual Paradigm par *File → Import → XMI*. Mode d'emploi et limites du format : [vp/README.md](vp/README.md).

```bash
node scripts/gen-xmi.mjs     # régénère depuis les documents markdown
```

Le modèle est généré depuis [JP_CONCEPTION_BDD.md](docs/JP_CONCEPTION_BDD.md) et [JP_CAS_UTILISATION.md](docs/JP_CAS_UTILISATION.md). Ne le modifiez pas à la main.

---

## Pile technique

| Couche | Choix |
|---|---|
| Back-end | Node.js 22 + TypeScript + **Fastify**, service unique modulaire |
| Base | **PostgreSQL 16** — non négociable *(intégrité du stock, argent de tiers)* |
| Cache, verrous, temps réel | **Redis 7** — accélérateur d'affichage, **jamais autorité** |
| Asynchrone | BullMQ |
| Mobile | **React Native (Expo)** — acheteuse, vendeuse, créatrice, livreur, point relais |
| Web | **React + Vite**, rendu serveur pour les aperçus de lien |
| Contrat API | **Zod** partagé serveur ↔ clients |

---

## Les dix décisions à trancher avant de coder

Deux le sont **avant la première ligne** :

1. **La règle de cumul des remises** *(R-U7)* — on ne modifie pas un calcul après avoir émis des factures.
2. **Le seuil de bascule particulier → professionnel** *(R-H11)* — il conditionne l'écran de vérification.

Les huit autres, et leur ordre d'importance, sont en fin de [JP_BACKLOG.md](docs/JP_BACKLOG.md#les-décisions-ouvertes-par-ordre-dimportance).

---

## Les critères de recette bloquants

Aucune livraison n'est acceptable si l'un échoue. Le plan de recette est en fin de [JP_CAS_UTILISATION.md](docs/JP_CAS_UTILISATION.md#14-cas-dutilisation-et-critères-de-recette-bloquants).

| # | Critère |
|---|---|
| **RB1** | Aucune survente, y compris sur appuis simultanés et **entre canaux** |
| **RB2** | Fonds correctement séquestrés et libérés dans tous les cas |
| **RB3** | Remboursement automatique intégral si un seuil de précommande n'est pas atteint |
| **RB4** | 100 % des litiges reçoivent une décision **motivée** dans le délai |
| **RB5** | Aucun contenu publiable sans article attaché |
| **RB6** | Aucune publication vidéo par un mineur |
| **RB7** | Aucun frais découvert après l'engagement |
| **RB8** | Adresse de l'acheteuse jamais exposée au donateur ni publiquement |
| **RB9** | Aucun affichage de rareté non réel |
| **RB10** | Paiement interrompu : ni double prélèvement, ni commande perdue |

---

*Dépôt privé. Ces documents contiennent la stratégie produit, les taux de commission et les décisions ouvertes du projet.*
