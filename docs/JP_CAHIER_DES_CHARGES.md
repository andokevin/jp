# JP — Je prends
## Cahier des charges · volet fonctionnel

| | |
|---|---|
| **Projet** | JP — plateforme de vente en direct et de contenu achetable |
| **Périmètre du document** | **Version 1 (phase 1)**, sauf mention contraire |
| **Version** | 1.0 · Août 2026 |
| **Public** | Direction produit, équipe de développement, partenaires, prestataires éventuels |
| **Annexe technique** | `JP_CDC_TECHNIQUE.md` — architecture, modèle de données, interfaces, critères d'acceptation détaillés |
| **Amont** | `JP_EXPRESSION_DE_BESOIN.md` (les besoins `Bx.y`) · `JP_BACKLOG.md` (les fonctionnalités `Fxx.y`) |

**Conventions de lecture**

- **DOIT** — exigence obligatoire, conditionne la recette.
- **DEVRAIT** — exigence forte, un écart doit être justifié et accepté.
- **PEUT** — optionnel.
- ⚠️ — décision produit non tranchée, à arbitrer avant développement de la fonction concernée.
- Les identifiants `Fxx.y` renvoient à `JP_BACKLOG.md`, les `Bx.y` à `JP_EXPRESSION_DE_BESOIN.md`.

---

# 1. Objet et principes

## 1.1 Objet

Spécifier la solution répondant aux besoins exprimés : une application mobile permettant d'acheter et de vendre en direct et par le contenu, avec paiement protégé, dans le vertical mode, beauté et chaussures, à Madagascar.

## 1.2 Les cinq principes de conception

Ils priment sur toute autre considération et arbitrent les cas non prévus par ce document.

| # | Principe | Conséquence pratique |
|---|---|---|
| **P1** | **Le risque est porté par la plateforme, pas par les personnes.** | En cas de doute sur une règle de gestion, on choisit la variante qui protège l'utilisateur, quitte à coûter plus cher à la plateforme. |
| **P2** | **Aucun contenu sans article achetable attaché.** | Le bouton « Publier » DOIT rester inactif tant qu'aucun article n'est attaché. Sans exception, sans dérogation, sans écran de réglage. |
| **P3** | **Toute rareté affichée est réelle.** | Aucun compteur, aucun minuteur, aucune progression ne peut afficher autre chose que l'état réel du système. |
| **P4** | **Le prix total est connu avant l'engagement.** | Les frais de livraison DOIVENT être affichés dès l'écran de choix, jamais découverts au paiement. |
| **P5** | **Le produit fonctionne sur un mauvais réseau et un petit téléphone.** | Une fonctionnalité qui ne tient pas cette contrainte est reconçue ou retirée, pas livrée dégradée. |

---

# 2. Périmètre contractuel de la version 1

## 2.1 Livrables attendus

| # | Livrable | Contenu |
|---|---|---|
| # | Livrable | Contenu |
|---|---|---|
| L1 | **Application mobile Android** | Parcours acheteur, boutique, créatrice, dans une application unique |
| L2 | **Page web de paiement cadeau** | Accessible sans installation, y compris depuis l'étranger |
| L3 | **Tableau de bord interne** | Les quatre mesures fondatrices *(`R-O2`)*. **En lecture seule** — aucune file de travail, aucune action *(`DP-05`)* |
| L4 | **Documentation** | Exploitation et paramétrage |

> **Trois livrables ont disparu** *(`DP-01`, `DP-04`, `DP-05`)* : l'application
> livreur, l'application point relais et le back-office d'exploitation.

⚠️ **iOS** : hors périmètre V1 sauf décision contraire. Le parc malgache est très majoritairement Android. À réévaluer pour la diaspora, qui est une cible iOS non négligeable — une **page web légère** (L5, extensible) est la réponse recommandée plutôt qu'une application iOS complète.

## 2.2 Fonctionnalités incluses

Voir la liste « produit minimum phase 1 » de `JP_BACKLOG.md`. Résumé :

**Commerce** — identité par **code envoyé par courriel** et vérification boutique · catalogue et variantes · stock et réservation temporaire · direct avec « Je prends » · **vente hors direct : achat immédiat, panier catalogue, fiche enrichie, vitrine permanente** · panier multi-boutiques · **paiement mobile money direct à la boutique** *(`DP-07`)* · facture · **suivi de livraison déclaré par la boutique** *(`DP-04`)* · signalement · **abonnement boutique** *(`DP-08`)*.

**Social** — stories et clips shoppables · fil personnalisé · **fil des abonnements incluant les nouveautés catalogue** · unboxing · profil et affiliation créatrice · précommande groupée · panier offert · modération complète.

> **Deux mouvements de périmètre.** L'**abonnement boutique** entre en V1 : il
> n'est plus une option de monétisation mais **le modèle économique lui-même**
> *(`DP-08`)*. Les **avis et le score publics** y entrent aussi : ils étaient un
> confort, ils sont devenus **la seule protection de l'acheteuse** *(`DP-07`)*.

**Commercial** — **promotion de boutique, notification des abonnés, règle de cumul des remises**. Le trio minimal : une promotion, ses abonnés prévenus, et une règle qui empêche les remises absurdes.

## 2.3 Fonctionnalités explicitement exclues de la V1

Replay achetable · enchères et ventes flash · direct à deux · assistant automatique · dressing virtuel · JP Club · espace marque · régie publicitaire · retours pour cause de taille · montage vidéo avancé et catalogue musical commercial · **classement et paliers de fidélité** · **promotions ciblées par palier** · **événements thématiques**.

**Pourquoi fidélisation et événements sont exclus de la V1 alors qu'ils sont spécifiés.** Ce n'est pas un arbitrage de charge, c'est une question de matière première : un moteur de rang n'a rien à classer au premier mois, et une page d'événement sans plusieurs boutiques actives est un désert annoncé. Les deux se nourrissent de données que seul le lancement produit.

**Ce qui DOIT néanmoins être fait en V1**, sous peine de coûter dix fois plus cher ensuite : le **journal des commandes confirmées par couple (boutique, client)** *(R-R11)*, la **table des promotions et la règle de cumul** *(R-U7)* — une remise rétro-appliquée à des factures émises est ingérable — et le **rattachement d'un article à un événement**, un simple champ qui évite une migration lourde le jour où l'événement de Noël sera décidé trois semaines avant Noël.

*Leur exclusion ne doit pas empêcher leur ajout ultérieur : le modèle de données DOIT les anticiper (voir `JP_CDC_TECHNIQUE.md`).*

---

# 3. Rôles et droits

## 3.1 Les types de compte

> **Amont** : [`JP_DECISIONS_PRODUIT.md`](JP_DECISIONS_PRODUIT.md) — `DP-01`, `DP-02`, `DP-03`.

| Type de compte | Peut détenir du stock | Peut encaisser | Vérification requise |
|---|:---:|:---:|---|
| Visiteur | non | non | aucune |
| Acheteur | non | non | **adresse électronique** |
| **Boutique** | **oui** | **oui** | **identité + mobile money** |
| **Créatrice** | non | **oui** *(commissions versées par la boutique)* | **identité + mobile money** |

**Règle fondamentale :** aucun compte ne DOIT pouvoir percevoir d'argent avant
vérification de son identité **et** de la titularité de son compte mobile money
*(B1.2)*.

**Ce qu'elle verrouille a changé.** Elle protégeait un retrait depuis un
portefeuille tenu par JP ; JP ne tenant plus d'argent *(`DP-07`)*, elle verrouille
désormais **la mise en vente** : après la vente, il serait trop tard.

**Un compte a un type, et un seul, choisi à l'inscription. Il n'en change
jamais** *(`DP-02`)*. Il n'existe aucun écran de bascule, aucune montée en grade,
aucune procédure de support pour changer de type.

- Un compte **acheteur** ne peut **jamais** vendre. S'il veut vendre, il crée un
  compte boutique.
- Un compte **boutique** ou **créatrice** peut acheter — **commodité, pas cumul
  de rôles** : parcours acheteur strictement identique, aucun droit
  supplémentaire, et **jamais chez soi-même**.

> **Six rôles ont été retirés** *(`DP-01`)* : vendeur particulier, employé du
> vendeur, livreur, point relais, modérateur JP, opérateur JP.

## 3.2 Matrice des droits

| Action | Visiteur | Acheteur | Boutique | Créatrice |
|---|:---:|:---:|:---:|:---:|
| Consulter contenu et catalogue | ✔ | ✔ | ✔ | ✔ |
| Regarder un direct | ✔ | ✔ | ✔ | ✔ |
| **Ouvrir la liste des articles d'un direct** *(`DP-06`)* | ✔ | ✔ | ✔ | ✔ |
| « Je prends » / commander | — | ✔ | ✔ | ✔ |
| Publier un contenu | — | ✔ ¹ | ✔ | ✔ |
| Créer / modifier un article | — | — | ✔ | — |
| **Modifier un prix** | — | — | ✔ | — |
| Diffuser en direct | — | — | ✔ | — |
| Modérer son propre chat | — | — | ✔ | ✔ |
| Préparer / expédier | — | — | ✔ | — |
| Sélectionner des articles d'autrui | — | — | — | ✔ |
| **Partager un lien d'affiliation** *(`DP-09`)* | — | — | — | ✔ |
| Ouvrir une précommande ⚠️ ² | — | — | ✔ | ✔ |
| Signaler un problème sur une commande | — | ✔ | ✔ | — |
| Suivre une boutique ou une créatrice | — | ✔ | ✔ | ✔ |
| **Voir la liste de ses clientes** | — | — | ✔ | — |
| **Définir des paliers de fidélité** | — | — | ✔ | — |
| **Créer / modifier une promotion** | — | — | ✔ | — |
| **Envoyer un code promotionnel nominatif** | — | — | ✔ | — |
| **Créer un événement de boutique** | — | — | ✔ | ✔ |
| **Candidater à un événement** | — | — | ✔ | ✔ |
| **Valider une candidature à son propre événement** | — | — | ✔ | ✔ |
| **Gérer son abonnement** *(`DP-08`)* | — | — | ✔ | — |

¹ uniquement des contenus portant sur des articles réellement achetés ·
² la faisabilité de la précommande sans séquestre n'est pas tranchée *(`PO-8`)*

> **Neuf droits ont disparu** : déposer une annonce de particulier *(`DP-01`)* ·
> voir le portefeuille et retirer de l'argent *(`DP-07`)* · arbitrer un litige,
> traiter un signalement, vérifier une identité, modifier les paramètres
> économiques, créer un événement JP, valider la candidature d'un tiers
> *(`DP-05`)*.

---

# 4. Arborescence et écrans

## 4.1 Application acheteur — navigation principale

```
┌─ Accueil ────────── stories en haut · directs en cours · à venir · articles
│                     · événements en cours · promotions des boutiques suivies
├─ Clips ──────────── fil vertical plein écran, balayage
├─ [ + ] ──────────── publier (unboxing, look) — visible si achat confirmé
│
├─ Recherche ──────── texte · filtres taille/prix/couleur/catégorie · vitrines
└─ Moi ───────────── commandes · cagnotte · **mes offres** · **mes avantages**
                      · adresses · abonnements · favoris · réglages
```

**Écrans principaux :** fil d'accueil · fil abonnements · direct · clip plein écran · story · fiche produit · **questions sur une fiche** · vitrine boutique · profil créatrice · feuille « Je prends » · panier · choix de livraison · paiement · confirmation · suivi de commande · unboxing (enregistrement) · signalement · profil · **mes offres** · **page événement** · **calendrier des événements**.

## 4.2 Application boutique — « mon studio »

```
┌─ Tableau de bord ── ventes du jour · à expédier · alertes stock · abonnés (+30 j)
├─ Catalogue ──────── articles · variantes · stock · **promotions**
├─ Direct ─────────── planifier · passer en direct · panneau live · bilan
├─ Contenu ────────── stories · clips · statistiques par contenu
├─ Commandes ─────── à préparer · expédiées · livrées · signalements
│                     (origine direct / catalogue dans une file unique)
├─ **Mes clientes** ── classement · fiche client · paliers · offrir une promo
├─ **Événements** ─── candidatures · mon engagement · mes mini-événements · bilan
├─ **Mon abonnement** ─ palier · quota de ventes · quota de directs · échéance
└─ Ma boutique ───── profil · vérification · créatrices partenaires
                      · **abonnés** · **réglages de fidélité**
```

## 4.3 Application créatrice

```
┌─ Tableau de bord ── vues → clics → ventes → gains
├─ Contenu ────────── publier · mes contenus · statistiques
├─ Ma sélection ──── articles choisis chez les boutiques · thèmes
├─ Précommandes ─── en cours · seuils · échéances
├─ Mes commissions ─ versées automatiquement à chaque vente *(`DP-09`)*
└─ Mon profil ────── vérification · badge · partenariats
```

## 4.4 Tableau de bord interne

**Ce n'est pas un back-office** *(`DP-05`)* : il n'y a ni file de travail, ni
dossier à instruire, ni action possible. **On le lit, on n'y agit pas.**

```
└─ Indicateurs ───── les 4 mesures fondatrices (R-O2) + suivi
                      · **ventes par origine** · **anomalies d'authentification**
                      · **signalements par boutique** · **abonnements actifs**
```

> **Cinq écrans ont disparu** : vérifications, modération, litiges, finance,
> logistique — repris par `SYS` ou sans objet *(`DP-04`, `DP-05`, `DP-07`)*.
> **Les paramètres économiques** restent modifiables, mais par configuration
> d'exploitation, plus par un écran d'acteur produit *(`R-O1`)*.
>
> ⚠️ **Les quatre mesures elles-mêmes sont à redéfinir** : certaines portaient
> sur le séquestre *(`PO-4`)*.

---

# 5. Spécifications fonctionnelles

## 5.1 Compte et vérification

### 5.1.1 Inscription et connexion *(F0.1, F0.13, F0.14, F0.15, F0.16 · B1.2)*

**L'adresse électronique est l'identifiant du compte. Le numéro de téléphone est un contact de livraison.** Ce choix rend le compte indépendant de la carte SIM — première cause de perte de compte sur ce marché — et réserve le budget SMS au seul endroit où il est irremplaçable : le code de retrait d'un colis *(R-L6)*.

**Parcours nominal**
1. L'utilisateur saisit son adresse électronique, ou choisit « Continuer avec Google ».
2. Le système envoie un code à 6 chiffres, valable 10 minutes.
3. L'utilisateur saisit le code ; l'application DOIT proposer le collage automatique depuis le presse-papier, et vérifier dès la saisie du sixième chiffre, sans bouton.
4. L'utilisateur choisit un prénom d'affichage.
5. Le quiz de style (`F17.9`) est proposé — **et passable**.

**Règles — identité et session**
- **R-C1** — Aucun mot de passe. **L'adresse électronique est l'identifiant** ; le numéro de téléphone ne l'est pas.
- **R-C2** — La session DOIT rester ouverte durablement ; une reconnexion fréquente est rédhibitoire sur ce marché.
- **R-C3** — Une adresse électronique ne peut être rattachée qu'à un seul compte actif.
- **R-C4** — Le parcours d'inscription et le parcours de connexion sont **indifférenciés** : la même saisie ouvre le compte existant ou en crée un.

**Règles — code à usage unique** *(F0.1, F0.14)*
- **R-C5** — Le code comporte 6 chiffres et expire au bout de 10 minutes.
- **R-C6** — Le code est stocké **haché**, jamais en clair. Il est invalidé à la première utilisation, à l'expiration, ou à l'émission d'un nouveau code. **Un seul code est valide à la fois par adresse.**
- **R-C7** — Au maximum : 1 code par adresse toutes les 60 s, 5 par heure, 10 par jour. 5 tentatives de saisie par code, puis le code est invalidé.
- **R-C8** — Tout refus pour cause de débit DOIT afficher **le délai d'attente restant en clair**. Aucun blocage muet.
- **R-C9** — **Anti-énumération** : la réponse à une demande de code DOIT être indiscernable — message, code de réponse et temps de réponse — selon que le compte existe ou non. L'écran de connexion ne DOIT jamais permettre de savoir qui possède un compte.
- **R-C10** — L'adresse électronique ne DOIT jamais apparaître en clair dans les journaux applicatifs *(N3.x)*.

**Règles — fournisseur externe** *(F0.13)*
- **R-C11** — La connexion Google est acceptée uniquement si le fournisseur déclare l'adresse comme vérifiée.
- **R-C12** — Si l'adresse correspond à un compte existant, les deux identités sont **rattachées au même compte**. La création d'un doublon est un défaut bloquant.

**Règles — changement d'adresse et récupération** *(F0.15, F0.3)*
- **R-C13** — Un changement d'adresse exige **deux vérifications** : un code envoyé à l'ancienne adresse (autorisation), puis un code envoyé à la nouvelle (vérification). L'ancienne adresse est informée du changement et reçoit un moyen de le contester. L'opération est inscrite au journal d'audit *(N3.4)*.
- **R-C14** — Une demande de récupération sur un compte portant un solde disponible **gèle les retraits** jusqu'à la décision de l'opérateur.

**Règles — numéro de téléphone** *(F0.16)*
- **R-C15** — Le numéro est demandé **à la première livraison**, pas à l'inscription, et vérifié par SMS à ce moment-là.
- **R-C16** — Un SMS de vérification non reçu ne DOIT jamais bloquer un paiement. Au-delà de 60 s, la commande se poursuit avec un numéro non vérifié, signalé comme tel sur le bordereau.

**Cas d'erreur**
| Cas | Comportement attendu |
|---|---|
| Courriel non reçu | « Renvoyer » actif après 30 s ; après 2 renvois, invitation à vérifier les indésirables et à changer d'adresse |
| Code erroné | 5 tentatives, puis invalidation du code — un nouveau doit être demandé |
| Code expiré | Message explicite, jamais d'ouverture de session |
| Adresse déjà utilisée | Parcours indifférencié : l'utilisateur est simplement connecté *(R-C4)* |
| Accès perdu à la boîte mail | Récupération assistée instruite par un opérateur sous 24 h *(F0.3)* |
| Service d'envoi indisponible | Message distinct de « code invalide », incident journalisé |
| Changement de carte SIM | **Sans effet sur le compte.** Mise à jour du contact de livraison uniquement |

### 5.1.2 Vérification boutique et créatrice *(F0.6 · F15.1)*

**Parcours**
1. Nom de la boutique ou nom public.
2. Photographies recto et verso de la pièce d'identité.
3. Photographie du visage.
4. Numéro mobile money **au même nom que la pièce**.
5. Adresse d'enlèvement (boutique uniquement).
6. Soumission → statut *en cours*.

**Règles**
- **R-V1** — En statut *en cours*, l'utilisateur PEUT créer son catalogue et préparer du contenu. Il ne PEUT **ni publier, ni diffuser en direct, ni mettre en vente**. Depuis `DP-07`, c'est **la mise en vente** que la vérification débloque, plus l'encaissement : l'argent partant directement à la boutique, vérifier après la vente n'aurait plus de sens.
- **R-V2** — La concordance entre le nom de la pièce et le titulaire du compte mobile money DOIT être contrôlée. En cas de discordance, refus.
- **R-V3** — Le refus DOIT être motivé et indiquer précisément ce qui manque.
- **R-V4** — Un délai cible de traitement DOIT être affiché à l'utilisateur. ⚠️ Valeur à arrêter. **La vérification est automatisée** *(`DP-05`)* : le délai est celui du prestataire, pas d'une file humaine.
- **R-V7** *(neuve)* — **Un refus n'a plus d'instance de recours** *(`DP-05`)*. Le motif écrit est donc la **seule** voie de correction : il DOIT nommer la pièce ou le point de contrôle en défaut, jamais « document non conforme ».
- **R-V5** — Les pièces d'identité sont chiffrées, à accès restreint et journalisé *(N3.1)*.
- **R-V6** — Un utilisateur de moins de 18 ans ne PEUT être ni boutique, ni créatrice, ni publier de contenu vidéo *(B7.4, exigence bloquante)*.

### 5.1.3 Badge *(F0.7 · F18.4)*

Le badge DOIT apparaître sur : la vignette de direct, la fiche produit, la vitrine, le profil créatrice, le panier, l'écran de paiement et la facture. Un appui affiche : *« Identité et compte mobile money vérifiés par JP. »*

## 5.2 Catalogue et stock

### 5.2.1 Article et variantes *(F1.1, F1.2)*

**Règles**
- **R-A1** — Un article DOIT porter au moins une photographie, un nom, un prix et une catégorie.
- **R-A2** — Le stock est géré **par variante**, jamais globalement.
- **R-A3** — Une variante épuisée est **affichée barrée**, non masquée — cela permet la demande d'alerte de retour en stock.
- **R-A4** — Un raccourci de création en trois champs (photo, prix, quantité) DOIT exister pour l'usage en plein direct. Sans lui, aucune boutique ne créera de fiche pendant un direct.
- **R-A5** — Le prix est en Ariary, entier, sans décimale.

### 5.2.2 Réservation temporaire du stock *(F1.10 · B1.7, B2.4)*

**Fonction la plus critique du produit. Elle conditionne la recette.**

**Règles**
- **R-S1** — L'appui sur « Je prends » réserve la variante pour l'acheteur pendant une durée paramétrable. ⚠️ Hypothèse : 5 min en direct, 30 min hors direct.
- **R-S2** — Le stock affiché est **le stock réel diminué des réservations en cours**.
- **R-S3** — **La survente DOIT être impossible**, y compris en cas d'appuis strictement simultanés. Critère de recette bloquant.
- **R-S4** — Le minuteur DOIT être visible par l'acheteur.
- **R-S5** — Le minuteur est **suspendu** pendant l'attente de confirmation de l'opérateur de paiement et pendant une coupure réseau côté boutique. Une réservation ne peut être perdue pour un incident dont l'acheteur n'est pas responsable.
- **R-S6** — À expiration, la variante retourne au stock **immédiatement** et l'acheteur est notifié.
- **R-S7** — Une file d'attente ordonnée par horodatage serveur DOIT exister. Le suivant est notifié à l'expiration *(F2.7)*.
- **R-S8** — Le nombre de réservations expirées est un indicateur du pilote *(F11.7)*.

### 5.2.3 Vente hors direct *(F1.15 à F1.20, F3.14)*

**Le direct n'est pas la condition d'existence d'une vente.** Une boutique publie une fiche, l'acheteur achète quand il veut. Le direct devient un accélérateur de ce catalogue.

**Règles — parcours**
- **R-H1** — Une commande née du catalogue suit **exactement** la même machine à états, le même paiement, la même livraison, le même parcours de litige qu'une commande née d'un direct. Toute règle propre à une origine DOIT être explicitement justifiée dans ce document. Deux le sont, et deux seulement : *R-H3* et *R-H8*.
- **R-H2** — L'origine de la commande (`direct`, `catalogue`, `clip`, `story`, `evenement`) est enregistrée. Elle sert aux statistiques et à l'attribution d'affiliation, **jamais aux règles métier**.
- **R-H3** — La durée de réservation hors direct est un **paramètre distinct** de celle du direct. ⚠️ Hypothèse : 30 min contre 5 min. Hors pic, geler un article coûte peu et sauve le panier.
- **R-H8** — Le délai accordé à la boutique pour accepter et préparer une commande de catalogue est **plus long** qu'en direct : il n'est pas devant son téléphone. Le dépassement du délai est notifié à l'acheteur et pèse sur le score de confiance *(F6.2)*.

**Règles — fiche article hors direct**
- **R-H4** — Un article vendu hors direct PEUT porter un **état** (neuf avec étiquette / très bon / bon / correct) et des **mesures réelles**. Les articles mesurés sont signalés comme tels et favorisés au tri. On incite, on n'interdit pas.
- **R-H7** — La vitrine DOIT être boutique en permanence. Le direct est un état temporaire affiché en surimpression, jamais une condition d'accès au catalogue.
- **R-H9** — Les questions posées sur une fiche article sont **publiques**, comme les réponses. La messagerie privée libre reste hors périmètre *(F7.14)*. Le filtrage automatique des commentaires s'y applique *(R-X1)*.

> **Les règles du vendeur particulier sont supprimées** *(`DP-01`)* :
> `R-H5`, `R-H6`, `R-H10` et `R-H11`. Il n'y a plus de dépôt d'annonce sans
> boutique, plus de seuil de bascule, plus de barème dédié. **Qui veut vendre
> crée un compte boutique** *(`DP-02`)*.

## 5.3 Le direct

### 5.3.1 Diffusion *(F2.3, F2.13)*

- **R-D1** — Le direct DOIT pouvoir être diffusé depuis un téléphone d'entrée de gamme, sans matériel additionnel.
- **R-D2** — La qualité DOIT s'adapter automatiquement au débit disponible, des deux côtés.
- **R-D3** — En cas de coupure côté boutique, le direct passe en pause avec un message explicite aux spectateurs. **Reprise possible pendant 2 minutes**, avec conservation des spectateurs et des réservations. Au-delà, clôture et génération du bilan.
- **R-D4** — La latence DOIT rester compatible avec l'interaction : la boutique doit pouvoir réagir à ce qui vient de se produire.

### 5.3.2 Article à l'écran, bandeau et liste des articles *(F2.4, F2.5 · `DP-06`)*

**Le direct est d'abord une vidéo, pas un catalogue.** L'acheteur voit la
boutique en plein écran, comme sur les réseaux sociaux qu'il utilise déjà. Rien
ne recouvre le visage.

- **R-D5** — La boutique PEUT épingler un article ; le bandeau spectateur affiche alors photo, nom, **prix**, **tailles disponibles**, **stock restant** et le bouton « Je prends ».
- **R-D8** *(neuve)* — **Présenter un article est facultatif.** La boutique peut ne rien épingler et simplement parler. **Quand aucun article n'est à l'écran, aucun bandeau ne s'affiche.** L'ancienne spécification supposait qu'un article était toujours présenté : c'est cette hypothèse qui tombe.
- **R-D9** *(neuve)* — Un bouton discret **à trois tirets** *(☰)* ouvre la **liste de tous les articles en vente pendant ce direct**, pas seulement celui qui est présenté.
- **R-D10** *(neuve)* — Depuis la liste comme depuis le bandeau, deux gestes et deux seulement : **« Je prends »**, ou **ouvrir la fiche détaillée**.
- **R-D6** — Le stock affiché décroît en temps réel *(P3 : le compteur reflète l'état réel, jamais une valeur d'incitation)*.
- **R-D7** — La boutique PEUT modifier le prix en direct ; le changement s'applique aux réservations postérieures uniquement.

### 5.3.3 « Je prends » *(F2.6, F2.8, F2.9 · B2.2)*

**Le parcours central du produit. Cible : moins de 30 secondes.**

**Parcours nominal**
1. Appui sur **[ JE PRENDS ]**.
2. Une feuille remonte du bas ; **la vidéo continue de jouer au-dessus**.
3. Taille — la taille habituelle de l'acheteuse est présélectionnée.
4. Quantité.
5. Livraison — dernier choix mémorisé.
6. **Total affiché, frais de livraison compris** *(P4)*.
7. « Payer maintenant » **ou** « Ajouter au panier et continuer ».
8. Paiement → confirmation.

**Règles**
- **R-J1** — Le parcours ne DOIT jamais quitter le direct ni l'interrompre.
- **R-J2** — Le chemin « ajouter au panier » DOIT exister : il évite plusieurs paiements mobile money successifs et augmente le panier. La réservation est maintenue.
- **R-J3** — Un visiteur non inscrit qui appuie sur « Je prends » voit **sa réservation posée avant l'inscription**, et reprend au choix de la taille après inscription *(F0.10)*. Perdre l'article pendant l'inscription est rédhibitoire.
- **R-J4** — La boutique voit la commande apparaître avec le prénom de l'acheteuse.

**Cas d'erreur**
| Cas | Comportement |
|---|---|
| Dernière pièce partie pendant le choix | Message immédiat + position en file d'attente + proposition d'alerte de retour |
| Perte de réseau acheteur | Réservation maintenue, minuteur suspendu, reprise transparente |
| Paiement échoué | Réservation maintenue le temps d'une nouvelle tentative, une seule fois |

## 5.4 Panier, commande et livraison

### 5.4.1 Panier *(F3.1, F3.2 · B5.3)*

- **R-P1** — Le panier accepte plusieurs boutiques ; il DOIT les **regrouper visuellement**, car l'expédition et les frais sont par boutique.
- **R-P2** — Les frais DOIVENT être affichés **par boutique et cumulés**. Un total qui triple à la dernière étape est le premier tueur de conversion.
- **R-P3** — ~~Regroupement au même point relais~~ — **supprimée** *(`DP-04`)* : il n'y a plus de relais.
- **R-P4** — **Un seul paiement pour l'ensemble du panier** *(`DP-16`)*. En éclatement atomique, l'acheteuse confirme **une fois** quel que soit le nombre de boutiques. ⚠️ En repli — N requêtes — elle confirme une fois **par boutique**, et le nombre lui est annoncé avant *(`R-M6`)*.

### 5.4.2 Livraison *(F3.4 · B6.1, B6.2 · `DP-04`)*

**JP n'opère aucune logistique.** La boutique fait parvenir le colis par le moyen
de son choix — son coursier, un transporteur, une remise en main propre. JP
fournit **la frise de statuts, les notifications, et la confirmation de
réception**. Rien d'autre.

- **R-L1** — Un **point de remise** est convenu entre l'acheteur et la boutique, dans un fil de discussion ouvert à la création de la commande.
- **R-L2** — L'adresse se saisit par **quartier et repères**, pas par adressage postal — quand elle est saisie ; la remise en main propre n'en exige aucune.
- **R-L3** — **Statuts partagés, identiques des deux côtés** : `Payée → En préparation → Expédiée → Livrée → Confirmée`. Des statuts internes différents de ceux montrés à l'acheteuse produisent immanquablement des désaccords.
- **R-L4** — Chaque changement de statut est **notifié** à l'acheteur.
- **R-L8** — L'adresse personnelle de l'acheteur ne DOIT jamais être visible par un donateur, une créatrice, ou publiquement *(N3.2)*.
- **R-L9** *(neuve)* — **La déclaration d'expédition n'est vérifiée par personne.** Aucun tiers neutre ne constate la remise. Une boutique qui déclare à tort n'est arrêtée que par le signalement de l'acheteuse et son effet sur la réputation *(`R-T*`)*. Cette absence de preuve DOIT figurer dans les conditions d'utilisation, des deux côtés.

> **Cinq règles sont supprimées** *(`DP-04`)* : le choix domicile / point de
> retrait à la commande *(`R-L1` ancienne)*, l'usage du relais sans adresse
> *(`R-L2` ancienne)*, la notification SMS avec code à 6 chiffres *(`R-L5`)*, la
> remise contre code à usage unique *(`R-L6`)* et le délai de garde *(`R-L7`)*.

## 5.5 Paiement

> **Le séquestre est supprimé** *(`DP-07`)*. L'acheteur paie **directement** la
> boutique ; JP ne détient aucun fonds, à aucun moment.

### 5.5.1 Encaissement et éclatement *(F4.1, F4.14 · B5.1 · `DP-16`)*

**Le client paie, le vendeur reçoit son argent, JP ne récupère que sa
commission.** Un débit, une confirmation, **deux ou trois crédits**.

```
paiement de l'acheteuse
        │  éclatement
   ┌────┴──────────────┬──────────────┐
   ▼                   ▼              ▼
mobile money       compte JP      mobile money
de la boutique    (commission,    de la créatrice
   (le net)         si mode        (si affiliée)
                  commission)
```

**Parcours**
1. Choix de l'opérateur — celui du numéro de l'acheteur présélectionné.
2. Confirmation du montant.
3. Demande de validation reçue sur le téléphone (canal opérateur).
4. Écran d'attente **explicite**, avec minuteur de réservation suspendu.
5. Confirmation, numéro de commande, facture.

- **R-M1** — L'écran d'attente DOIT indiquer clairement ce qui se passe. Un écran figé pendant 60 secondes fait croire à une perte d'argent — c'est le moment le plus fragile de tout le parcours.
- **R-M2** — Un paiement interrompu ne DOIT jamais prélever deux fois ni perdre la commande *(B5.7)*. Idempotence obligatoire.
- **R-M3** — Aucun secret de paiement ne transite par JP *(N3.3)*.
- **R-M9** *(neuve, `DP-16`)* — **JP ne détient aucun fonds, à aucun moment.** Les crédits vont **directement** sur les comptes des bénéficiaires. Ce qui est enregistré chez JP, c'est **la transaction**, jamais l'argent.
- **R-M10** *(neuve, `DP-16`)* — **L'éclatement atomique est le cas nominal.** Un appel, N crédits, tout ou nulle. Le nombre de bénéficiaires ne DOIT rien changer pour l'acheteuse : **un débit, une confirmation**.

> ### Le repli, si le prestataire n'éclate pas *(`PO-11`)*
>
> Si l'éclatement atomique n'est pas disponible, JP émet **N requêtes ordonnées**.
> **L'architecture doit supporter les deux** — c'est ce qui évite d'attendre la
> réponse des opérateurs pour commencer.
>
> - **R-M4** — **la requête vers la boutique est la requête pivot.** Émise en premier ; **si elle échoue, la commande n'est pas créée et aucune autre n'est émise.** Rien n'a bougé, rien n'est à réparer.
> - **R-M5** — **les requêtes secondaires sont rattrapables, jamais bloquantes.** Commission JP ou part créatrice : un échec **ne remet pas la commande en cause**. La somme due est enregistrée et **rejouée**.
> - **R-M6** — **le nombre de confirmations attendues est annoncé avant l'écran de paiement.** Une deuxième demande de code non annoncée est indiscernable d'une fraude.
> - **R-M7** — 🔒 **on ne rejoue jamais à l'aveugle.** On **interroge d'abord** l'opérateur sur le sort de sa propre référence ; on ne rejoue que si la réponse est explicitement « non effectué ». **Une lecture sans effet de bord vaut mieux qu'une garantie qu'il faut arracher.** La clé d'idempotence reste en seconde ligne.
>
> **Il n'existe pas de « tout ou rien » entre plusieurs transferts mobile money.**
> `R-M4` et `R-M5` ne rétablissent pas l'atomicité : elles organisent l'échec
> partiel pour qu'il tombe **toujours du côté rattrapable**. L'ordre des requêtes
> est **une règle de sécurité**, pas un détail d'implémentation.

> ### ⚠️ `PO-11` — la question la plus importante du projet
>
> *« Un encaissement unique peut-il être réparti automatiquement vers plusieurs
> comptes bénéficiaires, en une seule opération, avec un seul code de
> confirmation pour le payeur ? »*
>
> À poser à **MVola, Orange Money et Airtel**. La réponse décide du nombre de
> confirmations vues par l'acheteuse — et, si elle est **non** dans les deux
> sens, **oblige l'argent à transiter par JP**, avec le risque juridique que
> `DP-07` avait supprimé.

### 5.5.1bis Le mode de rémunération *(`DP-15`)*

**La boutique choisit à l'inscription, et peut changer.**

| Mode | Ce que la boutique paie |
|---|---|
| **Abonnement** | Un forfait mensuel. **Elle encaisse 100 % de ses ventes.** |
| **Commission** | Rien d'avance. **JP retient un pourcentage avant de reverser.** |

- **R-B1** — **Aucun montant n'est ajouté au prix affiché**, dans les deux modes. En commission, JP **retient** sur ce que la boutique reçoit ; il n'ajoute rien à ce que l'acheteuse paie. **On ne facture pas des frais de service à l'acheteur.**
- **R-G1** *(rétablie, `DP-15`)* — La commission DOIT être affichée **avant la mise en vente et sur chaque commande**, en clair : *« Vente X — commission Y — vous recevez Z »*.
- **R-G3** *(rétablie)* — Le barème est **historisé** et **figé à la commande** : un changement de taux ne rétroagit jamais.
- **R-B2** — Les paliers d'abonnement sont mesurés par **quota mensuel de ventes** et **quota de directs**. ⚠️ Montants et quotas réglés côté Admin *(`F11.6`)*.
- **R-B3** — Un **palier gratuit** existe.
- **R-B4** — Quota atteint ou abonnement impayé : **la mise en vente et le lancement d'un direct sont bloqués**. Le compte n'est **jamais** suspendu, le catalogue reste visible, les commandes en cours vont à leur terme.
- **R-B5** *(neuve)* — **Le changement de mode ne rétroagit pas.** Les commandes déjà passées gardent le mode et le taux en vigueur à leur création.

> ### Le choix devient un instrument de mesure
>
> `DP-08` avait un effet de bord : sans commission par vente, la boutique n'a
> **aucun intérêt à conclure ailleurs** — le contournement, **risque n° 1 du
> modèle**, devenait un non-sujet.
>
> Il redevient un sujet, **mais seulement pour les boutiques en commission**.
> **Le taux de contournement se compare donc entre les deux populations** — et
> c'est exactement l'expérience que le pilote devait faire. ⚠️ Le taux de
> commission redevient la décision économique n° 1.

### 5.5.2 Ce qui protège l'acheteur *(`DP-07`)*

**L'assurance ne vient plus de la détention des fonds. Elle vient de trois faits
vérifiables** : la **boutique vérifiée**, la **transaction historisée**, la
**traçabilité**.

- **R-E1** — L'écran de paiement DOIT **décrire ce que l'acheteuse obtient, jamais qui tient l'argent** *(`D-02`, `DP-16`)* : *« Boutique vérifiée — identité et compte Mobile Money contrôlés par JP. Regardez son historique avant d'acheter. »* **« Vous payez directement la boutique » reste exacte** — les fonds vont sur son mobile money, JP ne les touche pas *(`R-M9`)*.

  **Une seule formulation reste interdite** : *« votre argent est gardé par JP »* — exposition juridique *(`D-02`)*, **et désormais fausse** *(`DP-16`)*. *« Vous payez directement la boutique »* **redevient exacte** : les fonds vont sur son mobile money, JP ne les touche pas.
- **R-E2** — L'acheteur DOIT pouvoir consulter **avant de payer** : identité vérifiée, ancienneté, nombre de ventes, avis, taux de signalement de la boutique *(`F6.1`, `F6.2`)*.
- **R-E3** — La **confirmation de réception** est conservée. Elle ne déclenche plus aucun mouvement d'argent : elle **clôt la commande et alimente la réputation**. Deux chemins équivalents : validation simple ou publication d'un unboxing *(`F14.7`)* — **personne n'est obligé de se filmer**.
- **R-E4** — En l'absence de réponse, clôture automatique après un délai. ⚠️ Hypothèse : 3 jours.
- **R-E5** — **JP ne rembourse pas.** Il n'a rien à rendre. Un signalement ne rend pas l'argent : il **compte** contre la réputation de la boutique *(§5.9.1)*.

> ### Le point de comparaison n'est pas le séquestre, c'est le direct Facebook
>
> Aujourd'hui, l'acheteuse envoie de l'argent **à un numéro de téléphone** dont
> elle ne connaît ni le titulaire, ni l'ancienneté, ni les litiges. Aucune trace,
> aucune identité vérifiée. Mesurée contre **cette** référence, une plateforme
> sans séquestre reste massivement plus sûre.
>
> **JP ne se porte plus garant — il rend l'anonymat impossible.** Le recours
> n'est plus interne à la plateforme : il est externe, et JP fournit les pièces.

### 5.5.4 Facture *(F4.11 · B1.3)*

- **R-F1** — Émise automatiquement, horodatée, numérotée, conservée des deux côtés, téléchargeable.
- **R-F2** — Elle porte : articles, prix unitaires, frais de livraison, total, identité de la boutique vérifiée, mention JP.
- **R-F3** *(rétablie, `DP-15`)* — **La boutique voit en plus le détail de sa rémunération** : en commission, *« Vente X — commission Y — vous recevez Z »* ; en abonnement, *« Vente X — vous recevez X »* et l'abonnement facturé séparément.
- **R-F4** — La facture DOIT rester consultable hors connexion une fois chargée *(N1.5)*.

## 5.6 Contenu

### 5.6.1 Règle bloquante *(P2 · B3.2)*

- **R-K1** — **Aucun contenu ne DOIT pouvoir être publié sans au moins un article achetable attaché.** Le bouton « Publier » reste inactif. Critère de recette bloquant.
- **R-K2** — Un acheteur ne PEUT attacher que des articles qu'il a réellement achetés, vérifiés depuis son historique de commandes.
- **R-K3** — Une créatrice PEUT attacher les articles de n'importe quelle boutique ; l'article porte alors son identifiant d'affiliation *(F15.4)*.
- **R-K4** — Une boutique qui a refusé l'affiliation *(R-N3)* voit ses articles inattachables par une créatrice.

### 5.6.2 Stories et clips *(F14.1, F14.2, F14.3)*

- **R-K5** — Story : 15 s maximum, expiration à 24 h, pastille produit flottante cliquable.
- **R-K6** — Clip : vidéo verticale plein écran, défilement par balayage vertical, pastille produit avec prix et bouton « Je prends » permanents.
- **R-K7** — L'achat depuis un clip DOIT suivre exactement le même parcours qu'en direct : feuille remontante, vidéo qui continue derrière.
- **R-K8** — Le fil « Pour toi » DOIT être ordonné selon la taille, le budget, les catégories, les abonnements et l'historique de visionnage. **Une acheteuse en 42 ne doit pas voir défiler du 36** — c'est la première cause d'abandon d'un fil mode.
- **R-K9** — Un fil « Abonnements » distinct DOIT exister.
- **R-K10** — En mode économie de données : un seul contenu préchargé, qualité réduite, pas de lecture automatique.

### 5.6.3 Unboxing *(F14.7 · B3.4)*

**Le geste central de la couche sociale.**

**Parcours**
1. Livraison constatée → notification proposant de filmer, avec le crédit annoncé.
2. Enregistrement dans l'application.
3. Les articles de la commande sont **attachés automatiquement**.
4. Indication de la conformité à la taille.
5. Publication.

**Effets, simultanés**
- Réception confirmée → **commande clôturée et score de la boutique alimenté** *(R-E3)*. **Aucun mouvement d'argent** *(`DP-07`)*
- Avis vérifié créé, avec la note de taille *(F6.1)*
- Contenu publié dans le fil
- Cagnotte créditée *(F17.13)*

- **R-K11** — Le chemin sans vidéo (confirmation en un appui) DOIT rester disponible et aussi accessible que l'autre.
- **R-K12** — Le fil des unboxings DOIT être consultable sans compte : c'est la meilleure page d'accueil possible pour un visiteur qui doute.
- **R-K13** ⚠️ — Montant du crédit à calibrer.

### 5.6.4 Statistiques de contenu *(F14.17)*

- **R-K14** — Pour l'auteur : vues, durée moyenne, **clics vers l'article, « Je prends », ventes, gains**. L'entonnoir complet.
- **R-K15** — On montre à une créatrice **ce qu'elle a fait gagner**, pas des vues. C'est ce qui distingue JP des réseaux où elle publie déjà gratuitement.

## 5.7 Créatrices, affiliation, précommande

### 5.7.1 Affiliation *(F15.4, F15.5 · B4.1, B4.5, B4.6)*

- **R-N1** — Chaque article attaché ou sélectionné par une créatrice porte son identifiant, y compris via un lien partagé hors application.
- **R-N2** — L'attribution se fait à la **dernière créatrice cliquée** dans une fenêtre glissante. ⚠️ Hypothèse : 7 jours.
- **R-N3** — La boutique DOIT pouvoir refuser l'affiliation sur ses articles. Une charge non choisie serait rejetée.
- **R-N4** — La commission d'affiliation est **payée par la boutique, sur son prix** *(`DP-09`)*. Le taux est fixé par la boutique et **connu de la créatrice avant qu'elle attache l'article**. *(L'ancienne règle la prélevait sur la commission JP, qui n'existe plus — `DP-08`.)*
- **R-N5** — L'acheteur ne voit **aucune complexité supplémentaire** : il achète chez la boutique, qui expédie. L'affiliation est invisible pour lui.
- **R-N6** — La commission est créditée **directement à la créatrice**, comme une patte de l'éclatement *(`DP-16`)*, en même temps que la part de la boutique. **Comme la boutique, la créatrice est payée avant la livraison** : plus personne n'attend la réception pour être payé, et le seul régulateur est la réputation.

### 5.7.2 Précommande groupée ⚠️ *(F15.8 · B4.2, B4.3)*

**La fonctionnalité qui supprime la barrière du capital — et celle qui porte le plus grand risque d'abus.**

**Paramètres à la création :** prix · **seuil de commandes** · **date limite** · **délai de livraison annoncé**.

**Parcours acheteur**
1. Mention explicite **« Précommande — livraison prévue vers le [date] · 9 sur 15 »**.
2. « Je prends » → **engagement enregistré, sans encaissement**.
3. Compteur visible.
4. Seuil atteint → **encaissement de toutes les commandes**, confirmation, notification.
5. Seuil non atteint à la date limite → **les engagements tombent** ; personne n'a été débité, il n'y a rien à rembourser.

> ⚠️ **Piste, non tranchée** *(`PO-8`)*. `R-N8` exigeait un remboursement
> automatique intégral, impossible sans séquestre : JP ne peut rendre ce qu'il
> n'a jamais tenu. **N'encaisser qu'à l'atteinte du seuil** préserve la garantie
> sans détenir de fonds — mais déplace le risque : entre l'engagement et le
> seuil, rien ne garantit que l'acheteuse aura encore la somme sur son compte.

**Règles**
- **R-N7** — La mention « Précommande » et la date prévisionnelle DOIVENT être visibles avant l'engagement, avec le même poids visuel que le prix. Jamais en petits caractères.
- **R-N8** — **Le remboursement en cas de seuil non atteint est automatique, intégral et sans intervention.** Critère de recette bloquant *(B4.3)*.
- **R-N9** — ~~Libération des fonds à la créatrice~~ **sans objet** *(`DP-07`, `DP-09`)* : il n'y a plus de fonds à libérer ni d'avance possible. **La créatrice est payée au paiement**, en même temps que la boutique *(`R-N6`, `R-M5`)*.
- **R-N10** ⚠️ — Délai maximal entre atteinte du seuil et expédition, au-delà duquel remboursement automatique. **Sans cette limite, la précommande devient une machine à litiges** et reproduit exactement l'arnaque que JP combat.
- **R-N11** ⚠️ — Plafond de précommandes simultanées par créatrice.
- **R-N12** — Le back-office DOIT disposer d'une surveillance des précommandes en retard.

### 5.7.3 Ma sélection *(F15.3)*

- **R-N13** — La créatrice compose une vitrine d'articles appartenant à d'autres boutiques, organisable par thème.
- **R-N14** — L'achat depuis une sélection suit le parcours normal ; c'est la boutique d'origine qui expédie et porte la responsabilité.

## 5.8 Cadeau et diaspora *(F16 · B5.4)*

**Parcours**
1. L'acheteur compose son panier → **« Demander en cadeau »** → lien.
2. Il partage le lien (messagerie externe).
3. Le donateur ouvre le lien **éventuellement depuis l'étranger** : articles, photos, total, frais, boutique vérifiée.
4. Il **désigne le compte JP du bénéficiaire** *(`DP-10`)*.
5. **Le bénéficiaire et la boutique conviennent du point de remise** ; le donateur n'y participe pas et n'en voit rien.
6. **L'accord constaté, le donateur confirme le paiement** et joint un message.
7. La commande suit le parcours normal.

**Règles**
- **R-G1** — **L'adresse de livraison n'est jamais visible par le donateur** *(N3.2)*. **L'invariant est devenu structurel** *(`DP-10`)* : il ne la manipule jamais, elle se négocie entre deux personnes dont il ne fait pas partie.
- **R-G5** *(neuve)* — **Le bénéficiaire doit avoir un compte JP.** On n'offre plus à quelqu'un qui n'est pas sur la plateforme — restriction réelle du canal, et levier d'acquisition : recevoir un cadeau devient une raison de s'inscrire.
- **R-G6** *(neuve)* — **La preuve de remise est supprimée** *(`DP-04`)*, ainsi que le suivi de livraison côté donateur. Ce qui survit est l'essentiel : *il choisit l'objet, et il voit la boutique vérifiée.*
- **R-G7** *(neuve)* — ⚠️ Le paiement venant **après** la négociation, l'article doit être tenu bien plus longtemps que les 30 minutes du catalogue *(`PO-10`)*.
- **R-G2** — Depuis l'étranger : détection du pays, **montant converti affiché à titre indicatif**, carte proposée en premier, frais de conversion annoncés à l'avance.
- **R-G3** — Le lien cadeau DOIT expirer et refléter l'état réel du stock : un article devenu indisponible s'affiche comme tel *(P3)*.
- **R-G4** — La page cadeau DOIT fonctionner sur un navigateur, sans installation.

## 5.9 Confiance et litiges

### 5.9.1 Signalement d'un problème sur une commande *(F6.3 à F6.6 · B1.4 · `DP-05`, `DP-07`)*

**Principe culturel structurant : le problème se signale à JP, jamais en face à
face avec la boutique.** La confrontation directe est socialement coûteuse et
conduit les gens à abandonner plutôt qu'à réclamer.

**Mais JP ne tranche plus** *(`DP-05`)* **et ne détient plus l'argent**
*(`DP-07`)*. **Le signalement ne rend rien : il compte.**

**Parcours**
1. Depuis la commande → « Il y a un problème » → motif en liste courte → photographies → description.
2. Numéro de dossier attribué, et **inscription immédiate au compteur de la boutique**.
3. La boutique est notifiée, voit le motif et les pièces, répond dans le même fil, peut proposer une solution.
4. Accord trouvé → clôture, **et le compteur est décrémenté**.
5. Pas d'accord → **le dossier reste ouvert et pèse durablement sur le score**. Il n'y a pas d'escalade : il n'y a plus d'arbitre.

**Règles**
- **R-T1** — Le fil DOIT présenter **l'historique complet aux deux parties** : commande, statuts, échanges, facture. Ce qui était assemblé pour l'arbitre l'est désormais **pour les parties elles-mêmes** — c'est ce qui rend l'accord possible sans tiers.
- **R-T2** — Toute décision automatique — sanction, suspension — DOIT être **écrite, motivée, horodatée et notifiée aux deux parties**. Critère de recette bloquant.
- **R-T3** — ~~La décision déclenche remboursement ou libération~~ — **supprimée** *(`DP-07`)*. **JP n'exécute aucun mouvement d'argent.** Une boutique qui veut rembourser le fait depuis son compte, de sa propre initiative.
- **R-T4** — Les signalements alimentent le score de la boutique, **publiquement** *(`F6.2`)*.
- **R-T8** *(neuve)* — **La suspension automatique ne dépend pas d'un compte, elle dépend d'un niveau de gravité.** Un signalement porte un **niveau**, et **un seul signalement suffit si son niveau est assez haut et sa preuve suffisante**.

| Niveau | Exemple | Preuve attendue | Effet |
|---|---|---|---|
| **1 — ordinaire** | Retard, article non conforme, taille | Description | Compte au score. **N signalements non résolus → suspension** ⚠️ *(`PO-12`)* |
| **2 — grave** | Article jamais expédié, contrefaçon, article dangereux | Photos, échanges du fil | **Suspension immédiate de la mise en vente**, catalogue et commandes en cours préservés |
| **3 — urgence** | Menace, contenu sexuel non consenti, atteinte à une personne, réaction cutanée *(`F6.11`)* | Signalement d'urgence *(`R-X4`)* | **Suspension immédiate et totale**, y compris le direct en cours |

- **R-T8bis** *(amendée par `DP-13`)* — **La gravité est déterminée par une IA, jamais par l'acheteuse.** Celle-ci **écrit ce qu'elle a vécu** ; l'IA lit le récit et les pièces, attribue un niveau **et motive sa classification** *(`F19.13`)*. On ne demande pas à quelqu'un d'évaluer la gravité de ce qu'il subit — et on ne l'oblige pas non plus à faire entrer son problème dans une liste. **Une classification sans motivation écrite est refusée.**
- **R-T8ter** *(renforcée par `DP-13`)* — **Une suspension de niveau 2 ou 3 exige que la preuve attendue soit présente.** Un signalement de niveau 2 sans photo reste au niveau 1. **C'est devenu la contre-mesure principale, pas un garde-fou secondaire** : une IA se manipule par le texte, et un récit rédigé pour déclencher un niveau 3 serait une arme entre concurrentes. **La preuve, elle, ne se rédige pas.**
- **R-T8quater** *(neuve, `DP-13`)* — **Toute décision automatique est vérifiée a posteriori par l'Admin JP** *(`F19.7`)*. La suspension est immédiate et n'attend personne ; **l'Admin confirme ou infirme après**. Une infirmation **lève la sanction et corrige le score**. **C'est la voie de recours** que `DP-05` avait supprimée — et elle est **systématique**, pas déclenchée par une contestation : la personne sanctionnée n'a rien à demander.
- **R-T8quinquies** *(neuve, `DP-13`)* — **Le délai de vérification est un engagement.** Une classification erronée de niveau 3 coupe une boutique honnête ; le temps qu'elle reste coupée est le préjudice. ⚠️ Délai à arrêter *(`PO-12`)*.
- **R-T8sexies** *(neuve, `DP-13`)* — **Le taux d'infirmation remonte au tableau de bord** *(`F11.7`)*. Au-delà d'un seuil, ce n'est pas l'Admin qui travaille mal : **c'est la classification qui dérive**.
- ⚠️ **Trois valeurs restent à arrêter** *(`PO-12`)* : le seuil `N` du niveau 1, la liste exacte des motifs par niveau, et la preuve minimale exigée aux niveaux 2 et 3.
- **R-T9** *(neuve)* — **L'absence de remboursement par JP DOIT être écrite dans les conditions d'utilisation de l'acheteur**, et l'absence de preuve de remise dans celles de la boutique *(`R-L9`)*.

### 5.9.2 Avis *(F6.1 · B1.6)*

- **R-T5** — Seul un acheteur ayant payé **et confirmé la réception** peut noter.
- **R-T6** — L'avis porte une note, un commentaire, une photographie optionnelle et **une indication de conformité à la taille**.
- **R-T7** — Un unboxing publié génère automatiquement l'avis correspondant.

## 5.10 Modération et protection des personnes *(F19 · B7)*

**Cette section n'est pas de la conformité. Le produit expose des personnes qui se filment ; si l'espace devient hostile, le positionnement confiance s'effondre.**

- **R-X1** — À la publication, l'auteur choisit qui peut commenter : tout le monde, ses abonnés, personne. **Disponible dès la première publication**, pas proposé après le premier incident.
- **R-X2** — Le filtrage automatique DOIT masquer insultes et propos sexuels **avant** que la personne visée ne les voie, en malgache et en français.
- **R-X3** — Le signalement se fait en un geste (appui long → motif → envoi).
- **R-X4** — Deux niveaux : ordinaire, et **urgence** (harcèlement, menace, contenu sexuel non consenti, mineur) traitée en priorité avec un délai d'engagement. ⚠️ Délai à arrêter contractuellement. **Le traitement est automatique** *(`DP-05`)* — filtre, comptage, sanction graduée.
- **R-X5** — Tout retrait de contenu DOIT être notifié et motivé.
- **R-X6** — Les sanctions sont graduées — avertissement, retrait, restriction, suspension, exclusion — écrites, motivées, horodatées. **Deux voies de levée** *(`DP-13`)* : la **vérification systématique par l'Admin** *(`R-T8quater`, `F19.7`)*, qui infirme une classification erronée ; et la **réévaluation automatique**, quand la condition qui a déclenché la sanction cesse. La sanction DOIT donc rester **recalculable**, jamais un état figé. *(`DP-05` avait supprimé toute voie de recours ; `DP-13` la rétablit, et sous une forme meilleure : elle est systématique, la personne sanctionnée n'a rien à demander.)*
- **R-X7** — Une empreinte est calculée sur chaque vidéo publiée pour détecter les republications *(F19.8)*. Reprendre la vidéo d'une autre pour vendre le même article est le premier abus qui apparaîtra.
- **R-X8** — Aucun mineur ne PEUT publier de contenu vidéo *(bloquant)*.
- **R-X9** — Les contenus supprimés par leur auteur DOIVENT être conservés le temps nécessaire à l'instruction d'un litige *(N3.6)*.

## 5.11 Exploitation *(F11)*

- **R-O1** — Les paramètres économiques — paliers d'abonnement, quotas, frais, durée de réservation, délais de clôture, **seuils de signalement par niveau** *(`R-T8`)* — DOIVENT être modifiables sans nouvelle livraison logicielle, **avec double validation et journalisation** *(`DP-12`)*. **Proposé par un compte Admin, confirmé par un autre.** Un compte unique pouvant couper toutes les boutiques du pays est un point de défaillance unique et une cible.
- **R-O2** — **Le tableau de bord des quatre mesures fondatrices DOIT être opérationnel dès le premier direct du pilote.** Sans lui, l'objectif de mesure du projet n'est pas atteint.
- **R-O3** — La réconciliation quotidienne DOIT rapprocher **les encaissements déclarés par les opérateurs et les commandes créées**, en signalant les écarts. *(Il n'y a plus ni encours séquestré, ni retrait, ni commission, ni espèces — `DP-04`, `DP-07`, `DP-08`.)*
- **R-O4** — Toute action d'administration est journalisée de façon inaltérable *(N3.4)*.

## 5.12 Abonnés et suivi *(F7.1, F7.15, F7.16, F7.17)*

> **Ne pas confondre.** Ici, « abonné » désigne **quelqu'un qui suit une
> boutique** — gratuit, social. **L'abonnement payant** de la boutique à JP est
> traité en §5.5.3 *(`DP-08`)*. Deux sens du même mot dans un même document : le
> premier se dit **« abonné »** ou **« suivre »**, le second **« abonnement »**.

L'audience est l'actif que la boutique construit sur la plateforme. C'est aussi ce qui rend les promotions et les événements possibles sans achat de publicité.

- **R-Q1** — Suivre s'effectue en **un seul appui**, depuis une vitrine, une fiche, un direct, un clip ou une story. Aucun écran de confirmation. L'action est non symétrique et ne crée aucune obligation.
- **R-Q2** — Le nombre d'abonnés est **public** sur la vitrine et le profil : c'est un signal de confiance au même titre que le score *(F6.2)*, et il ne coûte rien à produire.
- **R-Q3** — La boutique voit le prénom, la photographie et la date d'abonnement de ses abonnés. Elle ne voit **jamais** leur adresse électronique ni leur numéro de téléphone.
- **R-Q4** — Les notifications de nouvel abonné sont regroupées au-delà de 5 par jour. Un abonnement suivi d'un désabonnement dans la minute ne DOIT produire aucune notification.
- **R-Q5** — Le fil « Abonnements » DOIT contenir les directs, **les nouveaux articles**, les promotions et les événements des comptes suivis. Sans les nouveautés catalogue, l'abonnement à une boutique qui ne diffuse pas de direct n'a aucun effet. Les nouveautés d'un même boutique publiées le même jour sont regroupées en une carte.
- **R-Q6** — L'acheteur PEUT couper les notifications de promotion d'une boutique **sans se désabonner**. Ce réglage est par boutique, pas global.

## 5.13 Fidélisation et classement des clients *(F7.5, F7.6, F7.18, F7.19)*

Ce que la boutique veut savoir : à qui faire un geste. Une liste de noms ordonnée, avec une action possible à côté de chaque ligne.

- **R-R1** — Le rang d'un client est calculé **par boutique**, jamais globalement. Une boutique n'a aucune raison de connaître les dépenses de son client chez ses concurrents. Exigence de vie privée, non négociable.
- **R-R2** — Seules les commandes **confirmées** entrent dans le calcul. Une commande payée puis remboursée ne produit pas de client privilégié.
- **R-R3** — Le score porte sur quatre composantes : montant cumulé, nombre de commandes, **récence** (avec décote dans le temps), fiabilité (pénalité en cas d'annulations répétées ou de litiges perdus). Il DOIT être **explicable en une phrase** à la boutique comme au client. Un rang opaque produit le même rejet qu'un score de confiance opaque *(R-T…)*.
- **R-R4** — Les paliers sont définis **par la boutique** : nom, seuil en montant et/ou en nombre de commandes, avantage. Quatre paliers par défaut, renommables. La fidélisation est **désactivable** ; la liste des clients reste utilisable sans elle.
- **R-R5** — Une modification de seuils ne DOIT jamais retirer un avantage déjà consommé.
- **R-R6** — En dessous d'un nombre minimal de clients, l'écran affiche un état de démarrage explicite. **Aucun faux palmarès à trois lignes.**
- **R-R7** — La liste des clients DOIT permettre une action directe : offrir une promotion ciblée, envoyer un code. Une liste non actionnable ne sert à rien.
- **R-R8** — ~~Accès de l'employé en lecture seule~~ — **supprimée** *(`DP-01`)* : l'acteur n'existe plus, la table `membre_equipe` et ses permissions non plus.
- **R-R9** — L'avantage annoncé au titre d'un palier DOIT être **réellement appliqué** au panier. Un palier sans effet est une manipulation, contraire aux principes de conception §1.2.
- **R-R10** — La perte d'un palier par décote de récence DOIT être annoncée **avant** qu'elle survienne, avec le moyen de le conserver.
- **R-R11** — Le journal des commandes confirmées par couple (boutique, client) DOIT exister **dès la phase 1**, même si la fidélisation n'est activée qu'en phase 2 : le calcul de rattrapage doit être possible sans reprise manuelle, et il DOIT être idempotent.

## 5.14 Promotions *(F7.8, F7.9, F7.22 à F7.26, F3.15)*

- **R-U1** — Une promotion porte un type (pourcentage, montant fixe, livraison offerte), une valeur, une période, un périmètre (boutique, catégorie, sélection) et une cible (tous, abonnés, palier, clients nommés).
- **R-U2** — **Le prix affiché est le prix payé.** Aucune remise ne DOIT apparaître pour la première fois au dernier écran de paiement *(RB7)*.
- **R-U3** — Une promotion programmée démarre automatiquement à sa date. Après un incident du planificateur, elle DOIT démarrer une seule fois, et n'envoyer qu'une seule notification.
- **R-U4** — **Plafonds de notification** : au maximum une notification de promotion par boutique et par 24 h ; au-delà de trois promotions d'abonnements différents le même jour, elles sont regroupées en un seul message. Ce plafond est partagé avec les notifications d'événement *(R-W9)*. Une acheteuse noyée coupe **toutes** les notifications, y compris « votre colis est arrivé » et le code de retrait — ce qui coûte beaucoup plus cher.
- **R-U5** — L'éligibilité à une promotion ciblée est vérifiée **côté serveur** au calcul du panier. Une perte de palier entre la réservation et le paiement retire la remise **sans faire échouer la commande**, avec un message clair.
- **R-U6** — Un code personnel est **à usage unique et nominatif**. Une commande annulée après usage d'un code DOIT rendre le code réutilisable ou le remplacer : le client ne peut pas perdre un geste commercial du fait d'une annulation.
- **R-U7** — **Cumul** : une seule remise s'applique par ligne de commande, **la plus favorable à l'acheteur**, jamais l'addition. Seule exception documentée : une remise sur les articles et une livraison offerte, qui portent sur des assiettes distinctes. La remise retenue est enregistrée sur la ligne de commande et nommée sur la facture.
- **R-U8** — La remise est affichée **nommément** dans le récapitulatif du panier et sur la facture (« Promo Noël −20 % », « Avantage client Or : livraison offerte »).
- **R-U9** — Le calcul est effectué **côté serveur**, en entiers d'Ariary. Une commande passée conserve le prix et la remise **figés à l'achat**, quelle que soit l'évolution ultérieure de la promotion.
- **R-U10** — Avant validation, la boutique DOIT voir **le net qui lui restera**, commission déduite, sur un article représentatif. Une remise dont il découvre l'effet après coup produit le même désengagement qu'une commission cachée *(R-G…)*.
- **R-U11** — À la fin de la période, les prix d'origine sont rétablis **automatiquement**. Un prix barré qui reste barré est un mensonge commercial et détruit l'effet de la promotion suivante *(RB9)*.
- **R-U12** — Une valeur qui rendrait le prix nul ou négatif est refusée. Au-delà d'un seuil de remise élevé, une confirmation explicite est demandée.

## 5.15 Événements thématiques *(F20)*

- **R-W1** — Un événement porte un nom, un thème, des dates de début et de fin, un visuel, un mot-dièse, un texte de présentation et une adresse publique partageable. Ses transitions de statut suivent ses dates ; l'annonce reste manuelle.
- **R-W2** — Toute action sur un événement est journalisée avec son auteur *(N3.4)*.
- **R-W3** — La participation à un événement JP est soumise à **validation**. Sans elle, la page se remplit d'articles hors sujet et perd la valeur éditoriale qui la justifie *(F18.1)*.
- **R-W4** — Un refus est **motivé**. Une candidature restée sans réponse à l'ouverture de l'événement est **refusée automatiquement avec notification** : une boutique laissé sans réponse ne candidate plus.
- **R-W5** — Un article PEUT appartenir à plusieurs événements ; **une seule remise s'applique** *(R-U7)*. Deux événements simultanés ne cumulent pas leurs réductions.
- **R-W6** — La page d'événement est **accessible sans compte**, filtrable par taille, budget et catégorie, et DOIT présenter un état utile lorsqu'elle est vide ou pas encore ouverte. C'est une page d'acquisition, pas un écran interne.
- **R-W7** — La signalisation visuelle d'un événement ne DOIT entraîner **aucun téléchargement d'image supplémentaire** dans les listes : le budget de données du fil est déjà contraint *(N…, F0.9)*. Un article rattaché à deux événements n'affiche qu'une seule pastille, celle dont la fin est la plus proche.
- **R-W8** — Un événement de boutique est publié sans validation, avec une portée limitée à la vitrine et aux abonnés de la boutique. Il **n'apparaît pas** dans le calendrier général : sinon le calendrier se remplit de braderies et perd toute valeur.
- **R-W9** — Au maximum **trois notifications par événement et par utilisateur**, plafond partagé avec les promotions *(R-U4)*. Un utilisateur qui n'a rien demandé et ne suit aucun participant ne reçoit rien.
- **R-W10** — Le calendrier des événements est accessible côté acheteur et propose, à défaut d'événement annoncé, les rendez-vous récurrents des comptes suivis *(F17.4)*.
- **R-W11** — Un bilan est produit à la clôture, y compris lorsqu'il est mauvais. **Un événement dont le bilan n'est pas mesuré sera reconduit par habitude et non par résultat.**
- **R-W12** — ⚠️ Le modèle de participation — gratuite, payante, ou réservée à un palier d'abonnement boutique — et **l'identité du valideur avec son délai d'engagement** DOIVENT être arrêtés avant l'ouverture du premier événement.

---

## 5.16 Les univers *(F21 · F1.21 à F1.24 · F6.11 à F6.13)*

**Décision du 20/08/2026.** JP est une place de marché **par univers**. Il y en
a **trois, et pas d'autre** : `JP Mode`, `JP Beauté`, `JP Tech`. Les deux
premiers sont ouverts au lancement ; `JP Tech` est déclaré et fermé.

**Les trois partagent la même logistique** — la boutique livre, JP suit
*(`DP-04`)*. C'est ce qui rend **l'application identique dans les trois
univers** : ce qui varie n'est pas le flux, ce sont deux listes — les champs de
la fiche et les motifs de signalement recevables. *(Le taux de commission a
disparu de cette liste : il n'y a plus de commission — `DP-08`. Si un univers
doit coûter plus cher qu'un autre, cela se joue désormais sur **le palier
d'abonnement**, pas sur la vente.)*

Un univers plus lourd — du mobilier — aurait exigé le camion et deux personnes,
donc un second parcours de livraison et un second métier. Il a été écarté pour
cette raison, et non par manque d'intérêt commercial.

**Un univers n'est pas un filtre de catégorie, c'est un jeu de règles.** Ce
principe est la raison d'être de toute cette section.

| Règle | Énoncé |
|---|---|
| **R-Y1** | Tout article appartient à **exactement un** univers, choisi à la création et **jamais modifiable ensuite**. Changer l'univers d'un article changerait ses règles de litige et sa commission après qu'une commande a été passée. |
| **R-Y2** | Un univers **fermé** existe en base, garde ses règles, et n'apparaît nulle part : ni onglet, ni recherche, ni lien profond. Son ouverture est un `UPDATE`, pas un déploiement. |
| **R-Y3** | Le **taux de commission** est propre à l'univers. Il est figé sur la commande à sa création *(comme le barème historisé, `R-G3`)* : un changement de taux ne rétroagit jamais sur une commande existante. |
| **R-Y4** | Les **modes de livraison** proposés au paiement sont ceux de l'univers, et la vérification se fait **côté serveur**. Les trois univers partagent aujourd'hui les mêmes modes ; la vérification existe malgré tout, pour que l'ouverture d'un univers plus lourd n'ait rien à changer. |
| **R-Y5** | Les **champs obligatoires** de la fiche article sont ceux de l'univers. Le refus de publication **nomme les champs manquants**, jamais « fiche incomplète ». |
| **R-Y6** | Les **motifs de litige** offerts à l'acheteuse sont ceux de l'univers, plus quatre motifs transverses : non reçu, différent de la photo, endommagé au transport, contrefaçon. Un motif hors univers est refusé côté serveur. |
| **R-Y7** | Le **panier ne se scinde pas par univers**. Il se scinde par boutique et par mode de livraison *(R-D2)*. La même boutique tient souvent le vêtement et le cosmétique. |
| **R-Y8** | Un **lien profond impose son univers** : ouvrir un lien d'article de `JP Beauté` bascule l'application sur cet univers. Sans quoi on afficherait un article invisible dans le contexte courant. |
| **R-Y9** | L'univers courant est **mémorisé** entre deux ouvertures de l'application. |
| **R-Y10** | Le **sélecteur d'univers n'apparaît que s'il y a le choix**. Avec un seul univers ouvert, il n'est pas une aide : il occupe de la hauteur utile pour rien. |
| **R-Y11** | Une boutique peut vendre dans **plusieurs univers**. Sa vérification boutique est unique ; les exigences de **provenance**, elles, sont par univers. |
| **R-Y19** | Une boutique **choisit** les univers où elle est visible. Par défaut, elle n'est visible que dans **un seul** — celui de son premier article. |
| **R-Y20** | Ajouter un univers à sa boutique déclenche un **avertissement explicite** : *« Être visible partout vous rend spécialiste de rien. »* La plateforme n'interdit pas — elle informe, et laisse décider. |
| **R-Y12** | Ouvrir ou fermer un univers **passe au journal d'audit**, nominativement. C'est une décision qui engage un recrutement de boutiques et une promesse publique. |

### Ce que JP Beauté ajoute — et pourquoi c'est un univers, pas une catégorie

| Règle | Énoncé |
|---|---|
| **R-Y13** | La **date de péremption** est obligatoire sur tout article de `JP Beauté`. Un article périmé ne peut être ni publié, ni acheté — le contrôle est fait **à la publication et au moment de l'achat**, parce qu'un article peut périmer en stock. |
| **R-Y14** | L'état **scellé ou entamé** est obligatoire et affiché sur la vignette, pas seulement sur la fiche. C'est l'information qui décide de l'achat. |
| **R-Y15** | La **provenance** est déclarée par la boutique. Une pièce justificative est facultative mais valorisée au tri. |
| **R-Y16** | Le motif de litige **« réaction cutanée »** est traité **en priorité**, comme un signalement d'urgence *(R-X5)*. Ce n'est pas un litige de commerce : c'est possiblement une urgence médicale. |
| **R-Y17** | **Un cosmétique entamé ne se retourne pas**, sauf défaut ou contrefaçon. Accepter le retour reviendrait à faire payer à la boutique le changement d'avis de l'acheteuse — un produit entamé ne se revend pas. |
| **R-Y18** | Un signalement de **contrefaçon** est transmis à la boutique **et** à l'équipe JP. Sur un cosmétique, la contrefaçon n'est pas un préjudice commercial : c'est un risque pour les personnes. |

**Le raisonnement de fond.** Un vêtement qui ne va pas déçoit. Un cosmétique
contrefait ou périmé **blesse**. Cette différence de nature — et non de
catégorie — est ce qui justifie que `JP Beauté` ait ses propres règles de
publication, de litige et de retour.

### Pourquoi la plateforme met en garde au lieu d'interdire *(R-Y19, R-Y20)*

Une boutique peut être visible dans les trois univers. Rien ne l'en empêche, et
il serait paternaliste de l'en empêcher : c'est son commerce.

Mais **« la boutique qui vend de tout » est un positionnement plus faible que
« la spécialiste du téléphone »**. Une acheteuse qui cherche un cosmétique fait
plus confiance à une boutique qui ne vend que ça. C'est un fait de marché, pas
une préférence esthétique.

D'où le compromis : **visible dans un seul univers par défaut**, celui de son
premier article. Ajouter un univers est possible, en un geste, avec un
avertissement qui dit ce que ça coûte. La plateforme informe ; la boutique
décide.

---

# 6. Exigences non fonctionnelles applicables

Reprises de `JP_EXPRESSION_DE_BESOIN.md` section 7, avec les valeurs contractuelles.

| Domaine | Exigence | Valeur |
|---|---|---|
| Terminal | Fonctionnement sur Android d'entrée de gamme | ⚠️ Version minimale et appareil de référence à arrêter |
| Poids | Taille de l'application installée | ⚠️ Plafond à fixer, à tenir comme un budget |
| Réseau | Utilisable en connexion lente, reprise automatique | Obligatoire |
| Données | Mode économie disponible et proposé automatiquement | Obligatoire |
| Hors ligne | Commande, code de retrait, facture consultables | Obligatoire |
| Performance | « Je prends » → paiement confirmé | < 30 s en cas nominal *(hypothèse)* |
| Intégrité | Survente | **Zéro cas — bloquant** |
| Disponibilité | Plage 18 h – 23 h | Priorité maximale |
| Notifications | Repli SMS pour colis arrivé, code de retrait, expiration | Obligatoire |
| Langue | Malgache et français, intégralement | Obligatoire |
| Monnaie | Ariary, format local, sans décimale | Obligatoire |
| Sécurité | Chiffrement des pièces d'identité, accès tracé | Obligatoire |
| Données personnelles | Conformité au cadre malgache, suppression de compte possible | Obligatoire |
| Éthique | Rareté réelle, prix total en amont, sponsoring étiqueté | **Bloquant** |

---

# 7. Jalons et livraisons

| Jalon | Contenu | Sortie attendue |
|---|---|---|
| **J0 — Sécurisation** | Accords paiement · **`PO-11` : idempotence honorée par les opérateurs** · **arbitrage des 14 décisions ⚠️** | *Préalable absolu au développement* |
| **J1 — Conception** | Maquettes des parcours critiques · modèle de données · choix d'infrastructure vidéo · protocole de test terrain | Spécifications validées |
| **J2 — Socle commerce** | Compte **(courriel + code, Google)**, vérification, catalogue, stock, direct, « Je prends », **vente hors direct**, panier, **paiement direct à la boutique**, facture, suivi de livraison, signalement, promotions, **abonnement boutique** | Version testable en interne |
| **J3 — Noyau social** | Stories, clips, fil, unboxing, créatrices, affiliation, précommande, cadeau, **modération complète** | Version testable |
| **J4 — Pilote fermé** | Boutiques et créatrices sélectionnés, directs réels, **argent réel** | Les quatre mesures fondatrices |
| **J5 — Corrections** | Sur la base des mesures | Version d'ouverture |
| **J6 — Ouverture** | Lancement public | — |

> **Avertissement de délai.** Ce périmètre est plus large que le produit minimum initialement décrit, et l'horizon d'environ 3 mois devient tendu — principalement à cause de la vidéo et de la modération. Deux issues à arbitrer explicitement en J0 : allonger l'horizon, ou scinder J3 en deux (stories, clips et unboxing d'abord ; affiliation et précommande ensuite).

---

# 8. Recette

## 8.1 Critères bloquants

**Aucune livraison ne peut être acceptée si l'un de ces critères échoue.**

| # | Critère | Vérification |
|---|---|---|
| **RB1** | **Aucune survente**, y compris sur appuis simultanés sur la dernière pièce | Test de charge avec appuis concurrents sur stock = 1 |
| **RB2** | **Chaque crédit atteint le bon compte, sans double versement, et aucun ne reste en souffrance** — boutique, commission JP, créatrice | Éclatement atomique **et** repli en N requêtes *(`R-M4`, `R-M5`, `R-M7`)*, réconciliation à 100 % |
| **RB3** | ⚠️ **Précommande — non tranché.** `R-N8` exigeait un remboursement automatique intégral ; sans séquestre, JP ne peut rendre ce qu'il n'a pas tenu *(`PO-8`)* | Le critère est **suspendu** jusqu'à l'arbitrage |
| **RB4** | **100 % des sanctions automatiques** sont écrites, motivées et notifiées aux deux parties *(`R-T2`)* | Revue des dossiers du pilote |
| **RB5** | **Aucun contenu publiable sans article attaché** | Tentative de publication sur chaque type de contenu |
| **RB6** | **Aucune publication vidéo par un mineur** | Test sur compte déclaré mineur et sur compte vérifié |
| **RB7** | **Aucun frais découvert après l'engagement** | Revue de tous les parcours d'achat |
| **RB8** | **Adresse de l'acheteur jamais exposée** au donateur, à la créatrice, ni publiquement | Revue des écrans et des interfaces |
| **RB11** | **Le nombre de confirmations est annoncé avant l'écran de paiement**, et il vaut 1 en éclatement atomique *(`R-M6`, `R-M10`)* | Panier mono-boutique, multi-boutiques, vente affiliée, dans les deux modes |
| **RB12** | **Aucun écran ne laisse croire que JP garde l'argent ou rembourse** *(`R-E1`, `R-E5`)* | Revue de tous les écrans de paiement, de commande et de signalement |
| **RB9** | **Aucun affichage de rareté non réel** | Revue de tous les compteurs et minuteurs |
| **RB10** | **Paiement interrompu : ni double prélèvement, ni commande perdue** | Coupure provoquée à chaque étape |

## 8.2 Critères de performance

| # | Critère | Seuil |
|---|---|---|
| RP1 | « Je prends » → paiement confirmé, cas nominal | < 30 s *(hypothèse)* |
| RP2 | Ouverture de l'application, connexion moyenne | ⚠️ à fixer |
| RP3 | Défilement du fil sur l'appareil de référence | Sans saccade perceptible |
| RP4 | Mise à jour du stock affiché en direct | Quasi-temps réel |
| RP5 | Reprise après coupure côté boutique | Sous 2 min, spectateurs et réservations conservés |

## 8.3 Recette terrain — obligatoire

**Le produit ne peut être accepté sur la seule base de tests en laboratoire.**

| # | Condition |
|---|---|
| RT1 | Validé sur **un appareil d'entrée de gamme réel**, pas un émulateur |
| RT2 | Validé sur **une connexion mobile réelle**, en heure de pointe |
| RT3 | Au moins **un direct complet réel**, avec de vrais acheteurs et de l'argent réel |
| RT4 | Au moins **une livraison menée à son terme**, du point de remise convenu jusqu'à la confirmation de réception |
| RT5 | Au moins **un signalement de bout en bout** : dépôt, réponse de la boutique, accord, décrémentation du compteur |
| RT6 | ⚠️ **Suspendu** — dépend de l'arbitrage de la précommande *(`PO-8`)* |
| RT10 | Au moins **une vente affiliée** avec les deux encaissements aboutis, et **une** dont la part créatrice échoue puis est rejouée *(`R-M5`)* |
| RT11 | Au moins **un cycle d'abonnement** : palier gratuit, quota atteint, blocage de la mise en vente, paiement, déblocage |
| RT7 | Au moins **un signalement d'urgence** traité dans le délai d'engagement |
| RT8 | Parcours complet vérifié **en malgache** comme en français |
| RT9 | **Un paiement cadeau depuis l'étranger** mené à son terme |

## 8.4 Documentation attendue

**Grille des sanctions automatiques** *(seuils, effets, conditions de levée)* · **procédure de paramétrage économique** *(`R-O1`)* · **conditions d'utilisation** portant explicitement l'absence de remboursement côté acheteur *(`R-E5`)* et l'absence de preuve de remise côté boutique *(`R-L9`)* · guide de démarrage boutique et créatrice, en malgache et en français.

---

# 9. Décisions à arbitrer avant développement

Récapitulatif des points marqués ⚠️. **Tous relèvent du commanditaire, aucun ne
peut être tranché par l'équipe technique.** Les codes `PO-x` renvoient à
[`JP_DECISIONS_PRODUIT.md`](JP_DECISIONS_PRODUIT.md), où ils sont tenus à jour.

| # | Décision | Bloque | |
|---|---|---|---|
| 1 | **Montants et quotas des paliers d'abonnement** | Le modèle économique entier | `PO-6` |
| 2 | **Seuil de signalements qui suspend une boutique** | La seule sanction du produit | `PO-12` |
| 3 | **Le prestataire honore-t-il une clé d'idempotence sur une requête rejouée ?** | Le rejeu des parts créatrice *(`R-M5`)* | `PO-11` |
| 4 | **La précommande est-elle encore possible sans séquestre ?** | `F15.8`, `RB3`, `RT6` | `PO-8` |
| 5 | Durée de réservation du stock, en direct et hors direct | Le cœur du direct | — |
| 6 | **Durée de tenue de l'article pendant la négociation du point de remise** | Le cadeau *(`R-G7`)* | `PO-10` |
| 7 | Délai de clôture automatique après livraison | La confirmation de réception *(`R-E4`)* | — |
| 8 | Fenêtre d'attribution d'affiliation | L'affiliation *(`R-N2`)* | — |
| 9 | Montant du crédit d'unboxing | L'unboxing — **enjeu monté d'un cran** : il alimente la réputation, devenue la seule protection | — |
| 10 | Délai d'engagement sur les signalements d'urgence | La modération | — |
| 11 | **Le donateur a-t-il un compte, ou un lien signé ?** | Le cadeau *(`R-G5`)* | `PO-9` |
| 12 | **Les quatre mesures fondatrices, redéfinies sans le séquestre** | Le tableau de bord du pilote *(`R-O2`)* | `PO-4` |
| 13 | Appareil de référence, version Android minimale, plafond de poids | Tous les choix techniques | — |
| 14 | iOS et page web : périmètre exact | Les livrables | — |

> **Quatre décisions ont disparu** : le paiement à la livraison *(`DP-04`)*, le
> barème de commission et qui supporte la commission d'affiliation *(`DP-08`,
> `DP-09`)*, et le délai de garde en point relais *(`DP-04`)*.

---

*Volet technique : `JP_CDC_TECHNIQUE.md`. Détail des parcours par persona : `JP_BACKLOG.md`. Justification des choix : `JP_POSITIONNEMENT.md`.*
