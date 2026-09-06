# JP — Conception de l'application

| | |
|---|---|
| **Objet** | Architecture logicielle, découpage en modules, navigation, écrans, design system |
| **Public** | Équipe de développement |
| **Version** | 1.0 · Août 2026 |
| **Pile** | Node.js 22 + TypeScript + Fastify · PostgreSQL 16 · Redis 7 · React Native (Expo) · React + Vite |
| **Amont** | `JP_CDC_TECHNIQUE.md` · `JP_CAS_UTILISATION.md` · `JP_CONCEPTION_BDD.md` · `plan/PLAN_SOCLE.md` |

---

# 1. Les cinq contraintes qui commandent l'architecture

Toute décision technique se justifie contre cette liste. Elle n'est pas décorative : c'est la grille de lecture de tout ce document.

| # | Contrainte | Conséquence architecturale |
|---|---|---|
| **C1** | Terminal d'entrée de gamme — peu de mémoire, peu de stockage | Application légère, listes recyclées, images dimensionnées serveur, lecteurs vidéo libérés hors écran |
| **C2** | Réseau lent, intermittent, **données payantes** | Charges utiles minimales, pagination par curseur, cache agressif, reprise automatique, file d'actions hors ligne |
| **C3** | **Intégrité du stock absolue** | Décrément atomique en base, jamais côté client. Redis n'est jamais autorité. |
| **C4** | Argent conservé pour compte de tiers | Journal financier inaltérable, idempotence de bout en bout, réconciliation quotidienne |
| **C5** | Pic du soir 18 h – 23 h | Dimensionnement sur le pic. Une indisponibilité à 20 h coûte une soirée de chiffre d'affaires. |

---

# 2. Vue d'ensemble

```mermaid
flowchart TB
    subgraph CLIENTS["Clients"]
        MOB["apps/mobile<br/>React Native · Expo<br/>acheteuse · boutique · créatrice"]
        ADM["apps/admin<br/>React + Vite<br/>tableau de bord interne"]
        WEB["apps/web<br/>React + Vite · SSR<br/>vitrine · cadeau · événement · replay"]
    end

    subgraph PART["packages partagés"]
        CTR["contracts<br/>schémas Zod = contrat unique"]
        UI["ui<br/>design system"]
        MON["money<br/>Ariary en entiers"]
        I18N["i18n<br/>mg · fr"]
    end

    subgraph API["apps/api — service unique modulaire"]
        PLAT["plateforme<br/>auth · idempotence · erreurs<br/>pagination · débit · audit · permissions"]
        MODS["17 modules de domaine"]
        JOBS["jobs BullMQ<br/>expiration · notifications · rang<br/>promotions · événements · réconciliation"]
        RT["temps-réel<br/>WebSocket · canaux · diffusion"]
    end

    subgraph DATA["Données"]
        PG[("PostgreSQL 16<br/>LA vérité")]
        RD[("Redis 7<br/>cache · verrous · compteurs<br/>JAMAIS autorité")]
        OBJ[("Stockage objet + CDN<br/>médias")]
    end

    subgraph EXT["Prestataires"]
        PSP["MVola · Orange · Airtel · carte"]
        VID["Vidéo : ingest · transcodage · diffusion"]
        NOT["Push · SMS · courriel"]
    end

    MOB -->|HTTPS + WS| API
    TER -->|HTTPS| API
    ADM -->|HTTPS| API
    WEB -->|HTTPS| API
    MOB --- PART
    TER --- PART
    ADM --- PART
    WEB --- PART
    API --- CTR
    API --- MON
    PLAT --> MODS
    MODS --> PG
    MODS --> RD
    JOBS --> PG
    RT --> RD
    MODS --> OBJ
    MODS --> PSP
    MODS --> VID
    JOBS --> NOT
```

**Le choix structurant : un service unique modulaire, pas de micro-services.** À cette taille d'équipe, les micro-services coûtent plus qu'ils ne rapportent — et la transaction qui décrémente le stock, crée la commande et écrit au journal financier doit rester **une seule transaction** *(C3, C4)*. La distribuer serait la casser.

Le découpage en modules avec des règles de dépendance strictes préserve la possibilité de séparer plus tard, sans en payer le prix maintenant.

---

# 3. Découpage en modules

## 3.1 Les seize modules de domaine

```mermaid
flowchart TB
    STOCK["stock<br/>ne dépend de RIEN"]
    CAT["catalogue"]
    IDENT["identite"]
    CMD["commande<br/>LE carrefour"]
    PAY["paiement"]
    SEQ["sequestre"]
    LIV["livraison"]
    PROMO["promotion"]
    FID["fidelite"]
    EVT["evenement"]
    DIR["direct"]
    CONT["contenu"]
    CREA["createur"]
    LIT["litige"]
    MOD["moderation"]
    NOTIF["notification<br/>appelé par tous,<br/>n'appelle personne"]
    EXPL["exploitation"]

    CAT --> STOCK
    CMD --> STOCK
    CMD --> PROMO
    CMD --> PAY
    CMD --> SEQ
    CMD --> LIV
    PROMO --> FID
    PROMO --> EVT
    EVT --> CAT
    DIR --> CAT
    DIR --> STOCK
    CONT --> CAT
    CREA --> CONT
    CREA --> CMD
    LIT --> SEQ
    LIT --> LIV
    MOD --> CONT
    FID --> CMD
    IDENT --> EXPL

    CMD -.->|événement| NOTIF
    PROMO -.->|événement| NOTIF
    EVT -.->|événement| NOTIF
    LIV -.->|événement| NOTIF
    LIT -.->|événement| NOTIF
```

**Quatre règles de dépendance, à tenir fermement.**

1. **`stock` ne dépend de rien.** C'est le module le plus critique *(RB1)* et le plus isolé. Il ne connaît ni les commandes, ni les prix, ni les promotions.
2. **`commande` orchestre.** C'est **le seul point où l'argent et le stock se rencontrent**. Aucun autre module ne crée de commande ni ne décrémente de stock.
3. **`notification` est appelé par tous et n'appelle personne.** Il porte **seul** les plafonds *(R-U4, R-W9)* : un plafond appliqué en trois endroits est un plafond contourné.
4. **Aucun module n'importe le dossier d'un autre.** Les échanges passent par le service exposé ou par un événement interne.

## 3.2 Convention de module

Un domaine = un dossier, toujours les mêmes fichiers. Cette uniformité est ce qui permet à quelqu'un d'ouvrir un module inconnu et de savoir où chercher.

```
apps/api/src/modules/<domaine>/
├─ routes.ts        déclaration des routes · validation Zod · AUCUNE logique métier
├─ service.ts       la logique métier · transactions · invariants
├─ repository.ts    accès Prisma · les seules requêtes SQL du domaine
├─ events.ts        événements émis et consommés
├─ erreurs.ts       codes d'erreur stables du domaine
└─ *.test.ts        au plus près du code testé
```

**Une exception documentée** : `litige/dossier.ts` lit largement chez les autres modules pour composer la vue d'instruction *(UC-51)*. C'est le seul endroit du dépôt où cela est autorisé, et c'est assumé — l'arbitrage a besoin de tout voir.

## 3.3 La plateforme, écrite une fois

```
apps/api/src/plateforme/
├─ session.ts        jeton court + rafraîchissement rotatif, détection de réutilisation
├─ debit.ts          fenêtre glissante Redis (Lua, atomique) — OTP, publication, signalement
├─ idempotence.ts    en-tête Idempotency-Key, clé conservée 24 h (R-M2)
├─ erreurs.ts        code stable → message mg/fr + action possible
├─ pagination.ts     curseur composite (cree_le, id) — jamais de numéro de page
├─ permissions.ts    garde de route ET filtre de projection (voir 3.4)
├─ chiffrement.ts    documents d'identité au repos
├─ accesDocument.ts  SEULE porte de déchiffrement, journalise avant de rendre
├─ correlation.ts    identifiant traversant API, jobs et WebSocket
├─ journal.ts        journaliseur structuré, champs interdits filtrés
└─ visibilite.ts     filtre de blocage appliqué à TOUTES les projections
```

**Trois de ces fichiers portent une garantie de sécurité et méritent une règle de lint** :
- `accesDocument.ts` — une règle interdit d'importer `chiffrement.ts` ailleurs ;
- `journal.ts` — filtre les champs sensibles à l'écriture, pour que la protection soit dans l'outil et non dans la discipline de chaque appelant *(R-C10)* ;
- `visibilite.ts` — le filtre de blocage est le point d'oubli le plus probable : une seule projection non filtrée rend le blocage inopérant.

## 3.4 Permissions : filtrer les projections, pas seulement les routes

**La décision la plus facile à rater de toute l'API.** Un montant masqué à l'affichage **reste dans la réponse réseau**. Pour l'employé du vendeur *(R-R8, F9.1, F10.4)*, les champs financiers doivent être **absents de la réponse**.

`plateforme/permissions.ts` expose donc deux outils, et les deux sont obligatoires :

```ts
// 1. garde de route — refuse l'accès
fastify.get('/boutique/clients', { preHandler: exige('voir_commandes') }, ...)

// 2. filtre de projection — retire les champs
const reponse = projeter(clients, permissionsDe(acteur));
// employé sans permission financière → aucune clé `montantCumule` dans l'objet
```

Le test correspondant est une **assertion sur les clés de l'objet**, pas sur les valeurs.

---

# 4. Les quatre applications clientes

## 4.1 `apps/mobile` — acheteuse, boutique, créatrice

Une seule application, **trois rôles qui se cumulent sur un même compte** *(F0.4)*, avec un sélecteur de rôle. Les portefeuilles et tableaux de bord restent visuellement séparés — sinon l'utilisatrice ne sait plus d'où vient son argent.

```
apps/mobile/src/
├─ features/<domaine>/
│  ├─ ecrans/          un fichier par écran
│  ├─ composants/      propres au domaine
│  ├─ hooks/           requêtes, mutations, état local
│  └─ api/             appels typés depuis packages/contracts
├─ navigation/         onglets, piles, liens profonds
├─ noyau/
│  ├─ clientApi.ts     temps d'attente courts, reprises à recul exponentiel
│  ├─ session.ts       jeton en expo-secure-store, JAMAIS AsyncStorage
│  ├─ cache.ts         cache par écran, invalidation ciblée
│  ├─ fileHorsLigne.ts file d'actions persistée, clés d'idempotence locales
│  ├─ etatReseau.ts    détection, bandeau, bascule mode économie
│  ├─ roleActif.ts     sélecteur de rôle, portefeuilles séparés
│  └─ mesure.ts        événements d'usage, par lots, échec silencieux
└─ design/             ré-export de packages/ui + thème
```

**Le dossier partagé qui évite la divergence** : `features/achat/` porte la feuille « Je prends », **utilisée à l'identique par le direct et par le catalogue** *(F1.15, F2.6)*. Elle reçoit `{ article, variantes, origine }` et **ne connaît pas l'existence du direct**. Deux feuilles auraient divergé en trois semaines, et les frais de livraison auraient été calculés de deux façons.

## ~~4.2 `apps/terrain`~~ — ❌ **supprimée** *(`DP-04`)*

**JP n'opère plus aucune logistique.** Le livreur et le point relais ont été
retirés du produit *(`DP-01`)* ; l'application terrain n'a plus d'objet. La
boutique fait avancer elle-même la frise de statuts depuis son studio *(`UC-40`)*.

> **Le dossier `apps/terrain/` existe encore dans le dépôt.** Sa suppression est
> une action sur le code, pas sur la documentation — elle est suivie séparément.

## 4.3 `apps/admin` — tableau de bord interne

> **Ce n'est plus un back-office** *(`DP-05`)* : il n'y a ni file de travail, ni
> dossier à instruire, ni action possible. **On le lit, on n'y agit pas.**

Application web séparée, parce que le métier est différent : lire des séries
temporelles sur un grand écran n'a rien à voir avec vendre depuis un téléphone.

**Un seul écran subsiste** : les **quatre mesures fondatrices du pilote**
*(`F11.7`, `R-O2`)*, exigées comme livrable avant le premier direct.

**Cinq écrans ont disparu** : vérifications, modération, litiges, finance,
logistique — repris par `SYS` ou sans objet *(`DP-04`, `DP-05`, `DP-07`)*.

⚠️ **Les quatre mesures elles-mêmes sont à redéfinir** : certaines portaient sur
le séquestre *(`PO-4`)*.

## 4.4 `apps/web` — pages publiques

Rendu **côté serveur** là où l'aperçu de lien décide de la conversion : article, vitrine, page cadeau, page événement, replay, profil créatrice.

**L'aperçu de lien est la moitié de la valeur d'acquisition** *(F7.11)*. Un lien partagé sur WhatsApp sans image ni titre ne se clique pas. C'est la seule raison pour laquelle ces pages existent en rendu serveur.

Périmètre volontairement restreint : consultation, panier, paiement. **Pas de direct, pas de publication, pas de studio boutique** — le direct en navigateur sur un téléphone d'entrée de gamme est une mauvaise expérience qui abîmerait l'image du produit.

---

# 5. Navigation

## 5.1 Application acheteuse

```mermaid
flowchart TD
    ACC["Accueil<br/>stories · directs · à venir · nouveautés"]
    POUR["Pour toi<br/>fil vertical personnalisé"]
    ABO["Abonnements<br/>directs · nouveautés · promos · événements"]
    CLIPS["Clips<br/>plein écran, balayage"]
    PLUS["( + )<br/>publier · vendre un article"]
    RECH["Recherche<br/>filtres · taille en premier"]
    MOI["Moi"]

    ACC --- POUR --- ABO
    ACC --> FICHE["Fiche article"]
    ACC --> DIRECT["Direct"]
    ACC --> VIT["Vitrine boutique"]
    ACC --> EVT["Page événement"]
    CLIPS --> FICHE
    FICHE --> JEP["Feuille « Je prends »"]
    DIRECT --> JEP
    JEP --> PANIER["Panier"]
    PANIER --> LIVR["Point de remise convenu<br/>(DP-04)"]
    LIVR --> PAIE["Paiement"]
    PAIE --> CONF["Confirmation<br/>+ « boutique vérifiée »<br/>(R-E1, DP-16)"]
    CONF --> SUIVI["Suivi de commande<br/>+ fil de remise"]
    SUIVI --> LITIGE["Signalement"]
    PLUS --> ANNONCE["Dépôt d'annonce (particulier)"]
    MOI --> CMDS["Mes commandes"]
    MOI --> OFFRES["Mes offres"]
    MOI --> AVANT["Mes avantages<br/>rang et progression"]
    MOI --> DRESS["Mon dressing"]
    MOI --> ABOS["Mes abonnements"]
    MOI --> REG["Réglages"]
    VIT --> FICHE
    EVT --> FICHE
```

## 5.2 Studio boutique

```mermaid
flowchart TD
    TB["Tableau de bord<br/>ventes du jour · à expédier · alertes stock · abonnés"]
    CATA["Catalogue<br/>articles · variantes · stock · promotions"]
    DIR["Direct<br/>planifier · diffuser · panneau · bilan"]
    CONT["Contenu<br/>stories · clips · statistiques"]
    CMD["Commandes<br/>file UNIQUE, marqueur d'origine"]
    CLI["Mes clientes<br/>classement · fiche · paliers"]
    EVT["Événements<br/>candidatures · engagement · bilan"]
    ARG["Mon argent<br/>en attente | disponible · retrait"]
    BOU["Ma boutique<br/>profil · vérification · équipe · abonnés"]

    TB --> CMD
    TB --> CATA
    CATA --> PROMO["Créer une promotion<br/>+ aperçu du net boutique"]
    CATA --> ART["Créer un article"]
    CMD --> BORD["Bordereau"]
    CLI --> FICHECLI["Fiche cliente"]
    FICHECLI --> PROMOVIP["Offrir une promo VIP"]
    FICHECLI --> CODE["Envoyer un code"]
    DIR --> PANNEAU["Panneau en direct<br/>CA qui monte"]
    EVT --> ENGAG["Mon engagement"]
    ARG --> RETRAIT["Retirer"]
    BOU --> EQUIPE["Mon équipe<br/>+ ce qu'elle ne pourra JAMAIS faire"]
```

**Deux choix de navigation qui ne sont pas neutres.**

**Une file de commandes unique**, avec un marqueur d'origine *(R-H2)*. Deux files — « direct » et « catalogue » — signifieraient deux logistiques à tenir, et la boutique en oublierait une.

**« Mes clientes » est un onglet de premier niveau**, pas un sous-écran des statistiques. Ce n'est pas de l'analyse, c'est une liste d'action *(R-R7)*.

## 5.3 Back-office

```
Indicateurs ───── les 4 mesures fondatrices · hypothèses · ventes par origine
                  · signalements par boutique · abonnements actifs

  ⚠️ EN LECTURE SEULE — aucune file, aucune action (DP-05)

  Sept écrans supprimés : vérifications, modération, litiges,
  finance, logistique, événements JP, paramètres.
```

---

# 6. Contrat d'API

## 6.1 Une source unique

`packages/contracts` porte les schémas **Zod** et les types dérivés. Le serveur valide **avec** ; les clients appellent **avec**. Cela supprime une classe entière de défauts de contrat, et c'est la principale raison d'avoir choisi TypeScript des deux côtés.

```ts
// packages/contracts/src/promotion.ts
export const CreerPromotion = z.object({
  type: z.enum(['pourcentage', 'montant', 'livraison_offerte']),
  valeur: z.number().int().positive(),          // entier, jamais de flottant
  perimetre: z.enum(['boutique', 'categorie', 'selection']),
  cible: z.enum(['tous', 'abonnes', 'palier', 'clients_nommes']),
  debutLe: z.string().datetime(),
  finLe: z.string().datetime(),
  notifierAbonnes: z.boolean(),
});
export type CreerPromotion = z.infer<typeof CreerPromotion>;
```

## 6.2 Règles transversales

| Règle | Exigence |
|---|---|
| **Pagination** | Par **curseur composite** `(cree_le, id)`, jamais par numéro de page *(C2)*. Un curseur sur `cree_le` seul produit doublons ou trous. |
| **Charge utile** | Aucune réponse ne renvoie un champ non utilisé par l'écran appelant. |
| **Images** | Dimensions demandées par le client, redimensionnement serveur. **Jamais de pleine résolution dans une liste** *(C1, C2)*. |
| **Erreurs** | Code stable en majuscules, message traduit mg/fr, **action possible indiquée**. Jamais de message génériqueure. |
| **Idempotence** | Obligatoire sur toute écriture financière. Clé conservée 24 h *(R-M2, RB10)*. |
| **Horodatage** | UTC en base, conversion à l'affichage. |
| **Montants** | Entiers en Ariary. **Aucun flottant nulle part.** |
| **Versionnement** | Préfixe de version, compatibilité ascendante — **le parc ne se met pas à jour vite**. |

## 6.3 Temps réel

WebSocket avec repli par sondage long. Un canal par direct, un canal par utilisateur.

**Le client ne extrapole jamais** *(CDC §5.4)* : à la reconnexion, il **resynchronise** le stock et l'état du direct auprès du serveur. Un compteur extrapolé localement finit par afficher un stock faux, et un stock faux affiché est une survente promise.

```
WS /directs/:id/flux   → stock_change · article_a_lecran · prix_change
                          commande_payee · reservation_expiree · ca_soiree
                          chat_message · spectateurs
WS /moi/flux           → notification · commande_statut · reservation_expire_bientot
```

---

# 7. Travaux asynchrones

BullMQ sur Redis. **Tous les consommateurs sont idempotents** — c'est la règle unique de ce chapitre, et elle est non négociable : une file rejoue.

| Travail | Déclencheur | Point d'attention |
|---|---|---|
`expirationReservations` | périodique (secondes) | + **vérification paresseuse** à chaque lecture de disponibilité |
`transcodageVideo` | publication d'un média | reprise après échec, plusieurs qualités |
`expirationStories` | périodique | 24 h exactement |
`notificationPromotion` | promotion activée | **plafonds appliqués par abonné**, verrou `notifiee_le` |
`promotionsProgrammees` | périodique | bascule par date, **jamais deux démarrages** |
`evenementsPlanifies` | périodique | ouverture + **refus automatique des candidatures en attente** |
`recalculRang` | `commande.confirmee` | asynchrone, **ne ralentit jamais la confirmation** |
`liberationAutomatique` | périodique | délai après livraison *(R-E4)* |
`precommandesEcheances` | périodique | **remboursement automatique intégral** *(RB3)* |
`reconciliationQuotidienne` | quotidien | trois rapprochements, alerte sur écart |
`bilanEvenement` / `direct_bilan` | clôture | produit **même si le résultat est mauvais** |
`repliSms` | push non lu | seulement pour les types critiques |
`purgeRetention` | quotidien | applique **réellement** les durées annoncées |
`agregatsQuotidiens` | quotidien | mesures fondatrices, tableau de bord instantané |

**`commande.confirmee` est l'événement le plus écouté du système.** Il ne déclenche **plus aucun mouvement d'argent** *(`DP-07`)* — il alimente **le score de confiance**, le rang client et le dressing. Ancienne rédaction : il déclenche la libération du séquestre, le journal des ventes confirmées, le recalcul de rang, l'invitation à l'avis, l'entrée au dressing. **Aucun consommateur ne doit pouvoir bloquer la confirmation** : un bogue dans le calcul de rang ne peut pas empêcher une boutique d'être payé.

---

# 8. Design system

## 8.1 Le contexte impose la forme

Téléphone Android d'entrée de gamme, écran de 5 pouces, lumière du jour, connexion intermittente et payante, utilisatrice bilingue dont le français n'est pas toujours la première langue.

| Règle | Valeur |
|---|---|
| Cibles tactiles | **48 dp minimum**, 8 dp d'écart |
| Action principale | **Bouton pleine largeur en bas d'écran**, toujours au même endroit |
| Contraste | 4,5:1 minimum sur le texte, **testé en extérieur** |
| Typographie | Deux graisses, trois tailles. Les **montants** sont toujours plus gros que les libellés |
| Montants | `50 000 Ar` — espace insécable, **jamais de décimale** |
| Images | Substitut basse définition d'abord, puis remplacement. **Jamais de saut de mise en page** |
| Animations | Réduites au minimum : elles coûtent en mémoire et en batterie |
| États obligatoires | **vide · chargement · erreur · hors ligne** — sur chaque écran, sans exception |
| Bilingue | Chaque libellé en mg et fr. **Le malgache est 30 % plus long** : prévoir la marge |
| Rareté | Un compteur n'est affiché **que s'il est vrai** *(RB9)* |
| Prix | Le prix affiché est le prix payé. **Aucun frais découvert plus tard** *(RB7)* |

## 8.2 Les composants partagés qui ne doivent jamais être réimplémentés

Sept composants vivent dans `packages/ui` parce qu'ils apparaissent partout et que des variantes divergentes détruiraient la cohérence ou une garantie du produit.

| Composant | Pourquoi partagé |
|---|---|
`BadgeVerifie` | 3 variantes (boutique, particulier, créatrice), 8 emplacements |
`BoutonSuivre` | 5 emplacements · **largeur identique dans les deux états**, sinon la mise en page saute |
`ScoreConfiance` | affichage public identique partout, un seul calcul |
`MinuteurReservation` | calé sur `expireLe` **serveur**, jamais sur une durée locale |
`PastilleEvenement` | **couleur + texte uniquement**, aucune image supplémentaire *(R-W7)* |
`EtiquetteSponsorise` | contraste et taille **imposés par le composant** — une mention illisible équivaut à une absence |
`FeuilleSignalement` | 6 emplacements · le geste de protection doit être identique partout |

## 8.3 Palette

**Deux couleurs de marque, et deux rôles qui ne se croisent jamais** *(`D-22`)* — plus un vert de confirmation, un rouge d'alerte, quatre gris. Les événements introduisent une **couleur d'accent temporaire** *(R-W7)*, appliquée **par jeton** et non par image, pour ne pas peser sur le budget de données.

| Jeton | Couleur | Rôle | Où |
|---|---|---|---|
| `COULEURS.action` | **`#A31A5B` framboise** *(7,35:1)* | **L'action** — ce sur quoi on appuie | Bouton principal · « Je prends » · indicateur « En direct » · étiquette de promotion · élément actif de la navigation |
| `COULEURS.identite` | **`#7C2D92` violet** *(7,93:1)* | **L'identité et la preuve** | Logotype · `BadgeVerifie` · écrans de paiement, de facture et de commission · `ScoreConfiance` |

**Un bouton n'est jamais violet, un badge vérifié n'est jamais framboise, un écran d'argent n'est jamais framboise.** La frontière est la raison d'être des deux jetons : les confondre revient à apprendre à l'utilisatrice à toucher ce qui ne se touche pas.

> **`R-Z1`** *(cahier des charges §5.17)* — **le framboise et le violet ne portent jamais seuls une différence de sens.** Toute distinction qu'ils portent est doublée par une icône, un libellé ou un changement de forme. **Justification : 1,08:1 de contraste entre les deux** — ils se distinguent par la teinte, jamais par la luminance, donc pas du tout sur un écran délavé par le soleil ni pour un œil daltonien. La règle est outillée côté code par `respecteRZ1()` dans `packages/ui/src/jetons.ts`, qui vérifie **une paire de descripteurs** — il ne parcourt pas les écrans : chaque composant à deux états colorés doit l'appeler dans son propre test.

---

# 9. Stratégie de tests

| Niveau | Portée | Outil |
|---|---|---|
| Unitaire | Calculs purs : remise, score de rang, éligibilité, frais, commission | Vitest |
| Intégration | Un module avec **PostgreSQL réel** | Vitest + Testcontainers |
| API | Route de bout en bout, authentification et permissions comprises | Supertest |
| **Concurrence** | **`stock = 1`, N appuis simultanés, inter-canaux** | transactions parallèles réelles |
| Parcours mobile | « Je prends » → paiement → confirmation · inscription par code | Maestro |
| Terrain | Appareil d'entrée de gamme, réseau réel en heure de pointe | manuel, RT1→RT9 |

## 9.1 Les fonctions pures, et pourquoi elles comptent

Cinq calculs sont écrits comme des **fonctions pures** — sans accès base, sans horloge, la date de référence étant un paramètre. C'est ce qui rend leurs tables de cas exhaustives et vérifiables à la main :

`promotion/calcul.ts` (remise) · `fidelite/score.ts` (rang client) · `litige/score.ts` (confiance) · `paiement/commission.ts` · `livraison/tarifs.ts`

## 9.2 Les six familles de tests non négociables

Elles couvrent les critères bloquants, et une seule qui manque rend la livraison inacceptable.

1. **Concurrence de stock** *(RB1)* — 50 transactions parallèles sur `stock = 1`, **et inter-canaux** : un appui en direct et un appui sur catalogue.
2. **Éclatement du paiement** *(RB2, `DP-16`)* — 1 à 3 crédits ; mode atomique *(tout ou rien)*, mode repli *(échec du pivot → rien ne se crée ; échec d'un secondaire → commande intacte, rejeu après interrogation)*, réconciliation à 100 % sur 1 000 commandes.
3. **Idempotence du paiement** *(RB10)* — rejeu, webhook doublé, webhook précoce, coupure à chaque étape.
4. **Absence de cumul de remises** *(R-U7)* — table de cas complète, plus une propriété vérifiée sur 1 000 paniers générés.
5. **Indiscernabilité de l'authentification** *(R-C9)* — corps, code **et écart de temps** sur 100 appels.
6. **Étanchéité des projections** — pour l'employé et pour le donateur, assertion **sur les clés** de la réponse, récursive : un champ absent ne peut pas fuir.

## 9.3 Le test de charge de référence

Rejoué avant chaque mise en production *(C5)* : plusieurs directs simultanés, pic de « Je prends » sur un même article, chat actif, navigation catalogue en parallèle.

---

# 10. Ce qui est construit avant tout mini-plan de domaine

Le socle *(`plan/PLAN_SOCLE.md` §9)*. Ces éléments sont référencés partout et ne sont replanifiés nulle part.

| # | Élément |
|---|---|
| S1 | Monorepo pnpm + Turborepo, TypeScript strict, ESLint, intégration continue |
| S2 | `packages/money`, `packages/i18n`, `packages/contracts` |
| S3 | Serveur Fastify, convention de module, plateforme complète |
| S4 | Prisma, base de développement, Testcontainers, migrations 1 à 2 |
| S5 | BullMQ, files, travailleur de référence, reprise sur incident |
| S6 | Registre WebSocket, canaux, diffusion, resynchronisation |
| S7 | `packages/ui` : jetons, primitives, les quatre états |
| S8 | Coquille Expo : navigation, session, client API, cache hors ligne, mode économie |
| S9 | Coquilles Vite pour `admin` et `web` |
| S10 | Observabilité : journaux corrélés, métriques, événements de mesure |

---

# 11. Environnements et livraison

| Environnement | Usage | Paiement |
|---|---|---|
| Développement | local | prestataires simulés |
| Recette | intégration | **bacs à sable des prestataires** — à obtenir en J0 |
| Pilote | boutiques pilotes, **argent réel** | production, volume limité |
| Production | ouverture publique | production |

**Exigences.** Migrations versionnées, réversibles, jouées automatiquement · déploiement sans interruption, **jamais entre 18 h et 23 h** *(C5)* · sauvegardes quotidiennes avec **restauration testée**, pas seulement configurée · drapeaux de fonctionnalité pour livrer sans exposer · paramètres économiques modifiables **sans déploiement** *(R-O1)*.

---

# 12. Les risques techniques, nommés

| Risque | Pourquoi il est réel | Ce qui le contient |
|---|---|---|
| **Poids et mémoire de React Native** *(C1)* | moins de maîtrise qu'en natif ; le parc est bas de gamme | mesure de l'APK **en intégration continue**, profilage sur l'appareil de référence, seuil **bloquant** |
| **Coût et fiabilité de la vidéo** *(CDC §7)* | poste le plus incertain du budget | service géré en V1, **derrière une interface interne** dès le premier jour |
| **Survente** *(RB1)* | perte de confiance immédiate et irréparable | transaction `FOR UPDATE` + deux `CHECK` en base + tests de concurrence inter-canaux |
| **Écart de réconciliation** *(C4)* | argent d'autrui, risque réglementaire | journal `append only`, rapprochement quotidien, alerte au-delà de 48 h |
| **Saturation des notifications** | fait couper **toutes** les notifications, y compris le code de retrait | plafonds dans un **seul** module, `notification_coupee` suivi comme signal d'alerte |
| **Filtrage en malgache** *(R-X1)* | les modèles couvrent mal la langue | listes constituées avec des locuteurs, enrichies par les signalements traités — **travail continu**, pas une livraison |
| **File de modération sous-dimensionnée** *(décision n° 13)* | ligne de coût d'exploitation permanente | délais d'engagement **paramétrés** et affichés : on n'annonce pas 2 h si l'organisation en permet 12 |

---

*Cas d'utilisation : `JP_CAS_UTILISATION.md` · Conception BDD : `JP_CONCEPTION_BDD.md` · Socle de réalisation : `plan/PLAN_SOCLE.md` · Mini-plans : `plan/PLAN_INDEX.md`.*
