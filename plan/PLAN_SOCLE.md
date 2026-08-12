# PLAN_SOCLE — ce qui ne se répète pas 250 fois

> **À lire une fois, avant tout mini-plan.** Chaque mini-plan de `plan/EPxx-*.md` suppose ce document connu et ne le répète pas : pile, arborescence, conventions, stratégie de tests, design system, préambule Stitch.
>
> Amont : `../docs/JP_CAHIER_DES_CHARGES.md` (règles `R-xx`, recette `RBx`) · `../docs/JP_CDC_TECHNIQUE.md` (modèle de données, machines à états, contraintes `C1`→`C5`) · `../docs/JP_USER_STORIES.md` (`US-*`) · `../docs/JP_BACKLOG.md` (`Fxx.y`).

---

# 1. Pile technique arrêtée

| Couche | Choix | Version |
|---|---|---|
| **Back-end** | Node.js + TypeScript, **Fastify**, service unique modulaire | Node 22 LTS |
| **Base** | **PostgreSQL** — non négociable *(C3, C4)* | 16 |
| **ORM et migrations** | **Prisma** | 5.x |
| **Cache, verrous, temps réel** | **Redis** — accélérateur d'affichage, **jamais autorité** *(CDC §5.2)* | 7 |
| **Asynchrone** | **BullMQ** sur Redis — transcodage, notifications, expirations, réconciliation | — |
| **Temps réel** | **`ws`** (WebSocket brut), repli par sondage long | — |
| **Validation et contrat** | **Zod** dans `packages/contracts`, partagé serveur ↔ clients | — |
| **Mobile** | **React Native + Expo**, TypeScript | SDK courant |
| **Web** | **React + Vite**, TypeScript · rendu serveur là où l'aperçu de lien l'exige | — |
| **Tests** | **Vitest** (unitaire, intégration) · **Supertest** (API) · **Maestro** (parcours mobile) · **Testcontainers** (PostgreSQL réel) | — |
| **Monorepo** | **pnpm workspaces + Turborepo** | — |

**Pourquoi Fastify et non NestJS.** À cette taille d'équipe, l'appareillage de NestJS (modules, injection, décorateurs) coûte plus en cérémonie qu'il ne rapporte en structure. Fastify plus une convention de module tenue fermement donne la même séparation, avec moins d'indirection à traverser quand il faut comprendre pourquoi une réservation n'a pas expiré. Ce choix est révisable ; la convention de module ci-dessous, non.

**Le risque à surveiller.** React Native place le poids de l'APK et l'empreinte mémoire *(C1)* sous moins de contrôle qu'un développement natif. Ce n'est pas une raison de changer d'avis, c'en est une de **mesurer dès la première livraison** : poids de l'APK et mémoire au défilement du fil sont des critères de recette, pas des observations de fin de projet.

---

# 2. Arborescence du dépôt

```
jp/
├─ apps/
│  ├─ api/                     Fastify · service unique modulaire
│  │  ├─ src/
│  │  │  ├─ modules/           un dossier par domaine, voir §3
│  │  │  ├─ plateforme/        transverse : auth, idempotence, erreurs,
│  │  │  │                     pagination, journal, débit, audit
│  │  │  ├─ jobs/              travailleurs BullMQ (expiration, notifications,
│  │  │  │                     rang client, promotions programmées, événements)
│  │  │  ├─ temps-reel/        registre WebSocket, canaux, diffusion
│  │  │  └─ serveur.ts
│  │  └─ test/                 intégration, Testcontainers
│  ├─ mobile/                  React Native · acheteuse, vendeuse, créatrice
│  │  └─ src/
│  │     ├─ features/<domaine>/{ecrans,composants,hooks,api}/
│  │     ├─ navigation/
│  │     ├─ noyau/             client API, session, cache, hors ligne, i18n
│  │     └─ design/            jetons, primitives, états vides
│  ├─ terrain/                 React Native · livreur et point relais
│  ├─ admin/                   React + Vite · back-office JP
│  └─ web/                     React + Vite · vitrines, cadeau, événement, replay
├─ packages/
│  ├─ contracts/               schémas Zod + types = source unique du contrat
│  ├─ ui/                      design system partagé (jetons + primitives)
│  ├─ money/                   Ariary en entiers — aucun flottant, nulle part
│  └─ i18n/                    catalogues mg / fr, formats locaux
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ plan/                       les mini-plans, ce dossier
└─ scripts/                    génération et publication des issues GitHub
```

---

# 3. Convention de module back-end

Un domaine = un dossier, toujours les mêmes fichiers. Aucun module n'importe le dossier d'un autre : les échanges passent par le service exposé ou par un événement.

```
apps/api/src/modules/<domaine>/
├─ routes.ts        déclaration des routes · validation Zod · aucune logique métier
├─ service.ts       la logique métier · transactions · invariants
├─ repository.ts    accès Prisma · les seules requêtes SQL du domaine
├─ events.ts        événements émis et consommés (nommage §6)
├─ erreurs.ts       codes d'erreur stables du domaine
└─ *.test.ts        au plus près du code testé
```

**Les modules**, alignés sur les domaines du CDC technique :

`identite` · `catalogue` · `stock` · `commande` · `paiement` · `sequestre` · `livraison` · `contenu` · `createur` · `fidelite` · `promotion` · `evenement` · `litige` · `moderation` · `notification` · `exploitation`

**Règles de dépendance**
- `stock` ne dépend de rien. C'est le module le plus critique *(RB1)* et le plus isolé.
- `promotion` lit `fidelite` (éligibilité par palier) et `evenement` (rattachement), et rien de plus.
- `commande` orchestre : elle appelle `stock`, `promotion`, `paiement`, `sequestre`. **Elle est le seul point où l'argent et le stock se rencontrent.**
- `notification` est appelé par tous et n'appelle personne. Il porte **seul** les plafonds *(R-U4, R-W9)* : un plafond appliqué en trois endroits est un plafond contourné.

---

# 4. Conventions transverses

**Nommage** — français pour le domaine (`reservation`, `remise_ligne`, `palier_fidelite`), anglais pour la technique (`repository`, `service`, `handler`). Le vocabulaire métier des documents amont est repris **tel quel** : `reservation` et non `booking`, `sequestre` et non `escrow`. Un développeur qui lit `R-S6` doit retrouver le mot dans le code.

**Montants** — `packages/money` uniquement. Entiers en Ariary. **Aucun flottant, ni en base, ni en transport, ni en calcul** *(CDC §6.2)*. Un pourcentage de remise est un entier et le calcul arrondit explicitement, à l'entier inférieur en faveur de l'acheteur.

**Erreurs** — code stable en majuscules (`STOCK_INSUFFISANT`, `OTP_EXPIRE`, `PROMOTION_NON_ELIGIBLE`), message traduit mg/fr, action possible indiquée. Jamais de message générique : *« code invalide »* sans motif est un défaut, pas une simplification *(US-PROMO-08 CA3)*.

**Idempotence** — en-tête `Idempotency-Key` obligatoire sur toute écriture financière, clé conservée 24 h, rejeu renvoyant le résultat initial *(R-M2, RB10)*. Implémenté une fois dans `plateforme/idempotence.ts`, jamais par domaine.

**Pagination** — par curseur, jamais par numéro de page. Taille de page réduite par défaut *(C2)*.

**Charges utiles** — aucune réponse ne renvoie un champ non utilisé par l'écran appelant. Les images sont dimensionnées côté serveur, jamais en pleine résolution dans une liste *(C1, C2)*.

**Horodatages** — UTC en base, conversion à l'affichage.

**Journalisation** — identifiant de corrélation traversant API, travailleurs et WebSocket. **L'adresse électronique n'apparaît jamais en clair dans un journal applicatif** *(R-C10)*.

**Migrations** — une migration par fonctionnalité, nommée `<horodatage>_<fxx_y>_<intitule>`. Réversible. Jouée automatiquement au déploiement. Jamais de migration destructive sans période de double écriture.

**Drapeaux de fonctionnalité** — tout ce qui est P2/P3 livré en avance est derrière un drapeau lu depuis `parametre` *(R-O1)*, modifiable sans déploiement.

---

# 5. Stratégie de tests

| Niveau | Portée | Outil |
|---|---|---|
| Unitaire | Calculs purs : remise, score de rang, éligibilité, frais de livraison | Vitest |
| Intégration | Un module avec **PostgreSQL réel** | Vitest + Testcontainers |
| API | Route de bout en bout, authentification et permissions comprises | Supertest |
| **Concurrence** | **`stock = 1`, N appuis simultanés, inter-canaux** *(RB1)* | Vitest, transactions parallèles réelles |
| Parcours mobile | « Je prends » → paiement → confirmation · inscription par code | Maestro |
| Terrain | Appareil d'entrée de gamme, réseau réel en heure de pointe | Manuel, RT1→RT9 |

**Les quatre familles de tests qui ne sont pas négociables**, parce qu'elles couvrent les critères bloquants : concurrence de stock *(RB1)*, chemins du séquestre *(RB2)*, absence de cumul de remises *(R-U7)*, indiscernabilité des réponses d'authentification *(R-C9)*.

**Un test de charge de référence** rejoué avant chaque mise en production : plusieurs directs simultanés, pic de « Je prends » sur un même article, chat actif, navigation catalogue en parallèle *(C5)*.

---

# 6. Événements internes

Nommage `<domaine>.<fait_au_passe>`, charge utile minimale (identifiants, pas d'objets complets), consommateurs idempotents.

```
identite.compte_cree · identite.email_change
stock.reservation_creee · stock.reservation_expiree · stock.stock_epuise
commande.creee · commande.payee · commande.confirmee · commande.annulee
paiement.confirme · paiement.echoue
sequestre.libere · sequestre.rembourse
abonnement.cree · abonnement.supprime
promotion.activee · promotion.terminee
fidelite.rang_recalcule · fidelite.palier_franchi
evenement.annonce · evenement.ouvert · evenement.termine
contenu.publie · moderation.contenu_retire
```

**`commande.confirmee` est l'événement le plus écouté du système** : il déclenche la libération du séquestre, l'écriture au journal des ventes confirmées *(R-R11)*, le recalcul du rang, l'invitation à l'avis, l'entrée au dressing. Tout consommateur doit être idempotent et **ne jamais bloquer** la confirmation.

---

# 7. Design system

**Le contexte impose la forme.** Téléphone Android d'entrée de gamme, écran de 5 pouces, lumière du jour, connexion intermittente et payante, utilisatrice bilingue dont le français n'est pas toujours la première langue.

| Règle | Valeur |
|---|---|
| Cibles tactiles | 48 dp minimum, 8 dp d'écart |
| Action principale | **Bouton pleine largeur en bas d'écran**, toujours au même endroit |
| Contraste | 4,5:1 minimum sur le texte, testé en extérieur |
| Typographie | Deux graisses, trois tailles. Montants **toujours** plus gros que les libellés |
| Montants | `50 000 Ar` — espace insécable comme séparateur, jamais de décimale |
| Images | Substitut basse définition d'abord, puis remplacement. Jamais de saut de mise en page |
| Animations | Réduites au minimum : elles coûtent en mémoire et en batterie |
| États obligatoires | **vide · chargement · erreur · hors ligne** — pour chaque écran, sans exception |
| Bilingue | Chaque libellé en mg et en fr. Le malgache est **plus long** : prévoir 30 % de marge |
| Rareté | Un compteur n'est affiché que s'il est **vrai** *(RB9)* |
| Prix | Le prix affiché est le prix payé. Aucun frais découvert plus tard *(RB7)* |

**Palette** — une couleur d'accent unique pour l'action, un vert de confirmation, un rouge d'alerte, quatre gris. Les événements introduisent une **couleur d'accent temporaire** *(R-W7)*, appliquée par jeton et non par image, pour ne pas peser sur le budget de données.

---

# 8. Préambule Stitch commun

Tous les prompts Stitch des mini-plans commencent par ce bloc. **Ne pas le réécrire à chaque fois** : le copier, puis ajouter le corps propre à l'écran.

```
Mobile app screen for an Android e-commerce app used in Madagascar.
Language: French. Currency: Malagasy Ariary, displayed as "50 000 Ar"
(space separator, never decimals).

Design system:
- Clean, functional commerce UI. Trust over decoration.
- Low-end Android phone, 5-inch screen, one-hand use.
- Generous touch targets (minimum 48dp), 8dp spacing between actions.
- High contrast, readable in daylight. No heavy gradients, no glassmorphism.
- Single accent color for the primary action. Green for confirmation,
  red for alerts, neutral grays elsewhere.
- Images always show a low-resolution placeholder state first.
- The primary action is ALWAYS a full-width button pinned to the bottom.
- Amounts are typographically larger than their labels.
- Two font weights, three sizes maximum.

Always show these states as separate frames: default, loading, empty, error.
—
```

**Trois règles pour le corps du prompt**, apprises du fait que Stitch invente ce qu'on ne dit pas :
1. **Nommer les libellés en français, entre guillemets.** Sans ça, l'écran revient en anglais.
2. **Décrire les composants dans l'ordre vertical** où ils apparaissent, et nommer le type (segmented control, radio rows, date range picker).
3. **Donner un exemple de donnée réaliste** — « Robe wax 50 000 Ar », « Miora Boutique », « il en reste 3 ». Un écran maquetté avec « Lorem » ne se relit pas.

---

# 9. Ce qui est fait une fois pour tout le projet

À construire **avant** le premier mini-plan de domaine. Ces éléments sont référencés partout et ne sont replanifiés nulle part.

| # | Élément | Où |
|---|---|---|
| S1 | Monorepo, Turborepo, TypeScript strict, ESLint, intégration continue | racine |
| S2 | `packages/money`, `packages/i18n`, `packages/contracts` (socle) | `packages/` |
| S3 | Serveur Fastify, convention de module, plateforme (erreurs, pagination, idempotence, débit, audit) | `apps/api/src/plateforme/` |
| S4 | Prisma, base de développement, Testcontainers, premières migrations | `prisma/` |
| S5 | BullMQ, files, travailleur de référence, reprise sur incident | `apps/api/src/jobs/` |
| S6 | Registre WebSocket, canaux, diffusion, resynchronisation à la reconnexion | `apps/api/src/temps-reel/` |
| S7 | Design system `packages/ui` : jetons, primitives, les quatre états | `packages/ui/` |
| S8 | Coquille Expo : navigation, session, client API, cache hors ligne, mode économie de données | `apps/mobile/` |
| S9 | Coquille Vite pour `admin` et `web` | `apps/admin/`, `apps/web/` |
| S10 | Observabilité : journaux corrélés, métriques, les événements de mesure du CDC §11 | transverse |

---

*Index des mini-plans : `PLAN_INDEX.md`.*
