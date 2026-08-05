# JP — « Je prends »

Marketplace mode pour Madagascar : **commerce en direct**, **vente hors direct** (catalogue achetable 24 h/24), et une **couche sociale** dont le catalogue est fait de vidéos.

La promesse tient en une phrase : **l'argent de l'acheteuse est gardé par JP jusqu'à ce qu'elle confirme avoir reçu.**

---

## Les documents, dans l'ordre où les lire

| # | Document | Contenu |
|---|---|---|
| 1 | [JP_POSITIONNEMENT.md](JP_POSITIONNEMENT.md) | Pourquoi ce produit, pour qui, contre quoi |
| 2 | [JP_DESCRIPTION_PROJET.md](JP_DESCRIPTION_PROJET.md) | Présentation générale |
| 3 | [JP_EXPRESSION_DE_BESOIN.md](JP_EXPRESSION_DE_BESOIN.md) | Besoins `Bx.y` et exigences non fonctionnelles `Nx.y` |
| 4 | **[JP_BACKLOG.md](JP_BACKLOG.md)** | **266 fonctionnalités** `Fxx.y` · 21 épiques · parcours par persona |
| 5 | **[JP_USER_STORIES.md](JP_USER_STORIES.md)** | **45 user stories** avec critères d'acceptation, dont au moins un cas d'échec chacune |
| 6 | **[JP_CAS_UTILISATION.md](JP_CAS_UTILISATION.md)** | **30 cas d'utilisation**, acteurs, scénarios, **12 diagrammes de séquence** |
| 7 | [JP_CAHIER_DES_CHARGES.md](JP_CAHIER_DES_CHARGES.md) | Volet fonctionnel · **180 règles** `R-xx` · matrice des droits · critères de recette `RBx` |
| 8 | [JP_CDC_TECHNIQUE.md](JP_CDC_TECHNIQUE.md) | Volet technique · modèle de données · machines à états · API |
| 9 | **[JP_CONCEPTION_BDD.md](JP_CONCEPTION_BDD.md)** | **113 tables** · 6 diagrammes ER · ordre des migrations · garanties structurelles |
| 10 | **[JP_CONCEPTION_APP.md](JP_CONCEPTION_APP.md)** | Architecture · 16 modules · navigation · design system · stratégie de tests |
| 11 | **[plan/](plan/)** | **Plan de réalisation, fonctionnalité par fonctionnalité** |

---

## Le plan de réalisation

Commencer par **[plan/PLAN_SOCLE.md](plan/PLAN_SOCLE.md)** — pile, arborescence, conventions, design system, préambule Stitch. Les 21 fichiers d'épique le supposent connu.

Puis **[plan/PLAN_INDEX.md](plan/PLAN_INDEX.md)** — la carte des 266 fonctionnalités, avec leur fichier, leur phase, leur priorité et leur niveau de détail.

Chaque fonctionnalité a un mini-plan à six sections : **conception · structure de code · base de données · design (avec un prompt Stitch prêt à l'emploi) · backend · frontend**.

### Ordre de réalisation

**Vague 0 — socle** *(PLAN_SOCLE §9)* — monorepo, plateforme API, Prisma, files, temps réel, design system, coquilles clientes. Rien ne démarre avant.

**Vague 1** — [EP00 identité](plan/EP00-identite.md) → [EP01 catalogue et vente hors direct](plan/EP01-catalogue.md) + [EP03 commande](plan/EP03-commande.md) → [EP07 abonnements, promotions, fidélisation](plan/EP07-communaute.md) → [EP20 événements](plan/EP20-evenements.md)

**Vague 2** — [EP02](plan/EP02-direct.md) · [EP04](plan/EP04-paiement.md) · [EP05](plan/EP05-livraison.md) · [EP06](plan/EP06-confiance.md) · [EP11](plan/EP11-backoffice.md) · [EP13](plan/EP13-socle.md) · [EP14](plan/EP14-contenu.md) · [EP15](plan/EP15-createurs.md) · [EP16](plan/EP16-cadeau.md) · [EP17](plan/EP17-habitude.md) · [EP19](plan/EP19-moderation.md)

**Vague 3** — [EP08](plan/EP08-decouverte.md) · [EP09](plan/EP09-statistiques.md) · [EP10](plan/EP10-monetisation.md) · [EP12](plan/EP12-assistant.md) · [EP18](plan/EP18-premium.md)

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

Avec plus de 1 000 cartes, un board plat est illisible. Trois vues à créer :

| Vue | Filtre | Groupement |
|---|---|---|
| **Sprint** | `label:phase:P1 label:step:backend,step:frontend` | milestone |
| **Par fonctionnalité** | rechercher un ID (`F7.22`) | milestone |
| **Décisions** | `label:decision-ouverte` | — |

### Labels

- `epic:00` … `epic:20` — l'épique
- `step:conception` · `step:squelette` · `step:bdd` · `step:design` · `step:backend` · `step:frontend` — l'étape
- `prio:M` · `prio:S` · `prio:C` · `prio:W` — la priorité MoSCoW
- `phase:P1` · `phase:P2` · `phase:P3` — la phase
- `status:todo` · `status:doing` · `status:done` — la colonne
- `decision-ouverte` — bloqué par un arbitrage produit

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

Les huit autres, et leur ordre d'importance, sont en fin de [JP_BACKLOG.md](JP_BACKLOG.md#les-décisions-ouvertes-par-ordre-dimportance).

---

## Les critères de recette bloquants

Aucune livraison n'est acceptable si l'un échoue. Le plan de recette est en fin de [JP_CAS_UTILISATION.md](JP_CAS_UTILISATION.md#14-cas-dutilisation-et-critères-de-recette-bloquants).

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
