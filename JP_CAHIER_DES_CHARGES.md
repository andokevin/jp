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
| L1 | **Application mobile Android** | Parcours acheteur, vendeur, créatrice, dans une application unique |
| L2 | **Application livreur** | Tournée, enlèvement, remise, encaissement |
| L3 | **Application point relais** | Réception, stock, remise contre code |
| L4 | **Back-office d'exploitation** | Vérification, modération, arbitrage, réconciliation, paramétrage, indicateurs |
| L5 | **Page web de paiement cadeau** | Accessible sans compte, y compris depuis l'étranger |
| L6 | **Documentation** | Exploitation, procédures de modération et d'arbitrage |

⚠️ **iOS** : hors périmètre V1 sauf décision contraire. Le parc malgache est très majoritairement Android. À réévaluer pour la diaspora, qui est une cible iOS non négligeable — une **page web légère** (L5, extensible) est la réponse recommandée plutôt qu'une application iOS complète.

## 2.2 Fonctionnalités incluses

Voir la liste « produit minimum phase 1 » de `JP_BACKLOG.md`. Résumé :

**Commerce** — identité par **code envoyé par courriel** et vérification vendeur · catalogue et variantes · stock et réservation temporaire · direct avec « Je prends » · **vente hors direct : achat immédiat, panier catalogue, fiche enrichie, vitrine permanente** · panier multi-vendeurs · paiement mobile money · séquestre · facture · livraison domicile et point relais · litiges · back-office.

**Social** — stories et clips shoppables · fil personnalisé · **fil des abonnements incluant les nouveautés catalogue** · unboxing · profil et affiliation créatrice · précommande groupée · panier offert · modération complète.

**Commercial** — **promotion de boutique, notification des abonnés, règle de cumul des remises**. Le trio minimal : une promotion, ses abonnés prévenus, et une règle qui empêche les remises absurdes.

## 2.3 Fonctionnalités explicitement exclues de la V1

Replay achetable · avis et score publics · enchères et ventes flash · direct à deux · assistant automatique · dressing virtuel · JP Club · espace marque · régie publicitaire · abonnement vendeur · retours pour cause de taille · montage vidéo avancé et catalogue musical commercial · **classement et paliers de fidélité** · **promotions ciblées par palier** · **événements thématiques**.

**Pourquoi fidélisation et événements sont exclus de la V1 alors qu'ils sont spécifiés.** Ce n'est pas un arbitrage de charge, c'est une question de matière première : un moteur de rang n'a rien à classer au premier mois, et une page d'événement sans plusieurs boutiques actives est un désert annoncé. Les deux se nourrissent de données que seul le lancement produit.

**Ce qui DOIT néanmoins être fait en V1**, sous peine de coûter dix fois plus cher ensuite : le **journal des commandes confirmées par couple (vendeur, client)** *(R-R11)*, la **table des promotions et la règle de cumul** *(R-U7)* — une remise rétro-appliquée à des factures émises est ingérable — et le **rattachement d'un article à un événement**, un simple champ qui évite une migration lourde le jour où l'événement de Noël sera décidé trois semaines avant Noël.

*Leur exclusion ne doit pas empêcher leur ajout ultérieur : le modèle de données DOIT les anticiper (voir `JP_CDC_TECHNIQUE.md`).*

---

# 3. Rôles et droits

## 3.1 Les rôles

| Rôle | Peut détenir du stock | Peut encaisser | Vérification requise |
|---|---|---|---|
| Visiteur | non | non | aucune |
| Acheteur | non | non | **adresse électronique** |
| **Vendeur particulier** | oui (pièces uniques) | **oui** | **aucune pour publier · identité + mobile money pour encaisser** |
| Vendeur | **oui** | **oui** | **identité + mobile money** |
| Employé de vendeur | non | **non** | adresse électronique + invitation |
| Créatrice | non | **oui** (commissions) | **identité + mobile money** |
| Livreur | non | espèces uniquement | contrat + identité |
| Point relais | non | espèces uniquement | contrat |
| Modérateur | — | — | interne |
| Opérateur | — | — | interne |

**Règle fondamentale :** aucun rôle ne DOIT pouvoir percevoir d'argent avant vérification de son identité **et** de la titularité de son compte mobile money. *(B1.2)* Le vendeur particulier ne fait pas exception : il publie sans vérification, il n'encaisse pas sans elle *(R-H5, R-H10)*.

Un même compte PEUT cumuler acheteur, vendeur et créatrice. Les tableaux de bord et **les portefeuilles restent séparés** — sinon l'utilisateur ne sait plus d'où vient son argent.

## 3.2 Matrice des droits

| Action | Visiteur | Acheteur | Vendeur | Employé | Créatrice | Modérateur | Opérateur |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Consulter contenu et catalogue | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Regarder un direct | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| « Je prends » / commander | — | ✔ | ✔ | ✔ | ✔ | — | — |
| Publier un contenu | — | ✔ ¹ | ✔ | — | ✔ | — | — |
| Créer / modifier un article | — | — | ✔ | ✔ | — | — | — |
| **Déposer une annonce de particulier** | — | ✔ ⁴ | ✔ | — | ✔ | — | — |
| **Modifier un prix** | — | — | ✔ | **—** ² | — | — | — |
| Diffuser en direct | — | — | ✔ | ⚙ ² | — | — | — |
| Modérer son propre chat | — | — | ✔ | ✔ | ✔ | — | — |
| Préparer / expédier | — | — | ✔ | ✔ | — | — | — |
| **Voir le portefeuille** | — | — | ✔ | **—** | ✔ | — | ✔ |
| **Retirer de l'argent** | — | — | ✔ | **—** | ✔ | — | — |
| Sélectionner des articles d'autrui | — | — | — | — | ✔ | — | — |
| Ouvrir une précommande | — | — | ✔ | — | ✔ | — | — |
| Ouvrir un litige | — | ✔ | ✔ | — | — | — | — |
| Arbitrer un litige | — | — | — | — | — | — | ✔ |
| Traiter un signalement | — | — | — | — | — | ✔ | ✔ |
| Vérifier une identité | — | — | — | — | — | — | ✔ |
| Modifier les paramètres économiques | — | — | — | — | — | — | ✔ ³ |
| Suivre un vendeur ou une créatrice | — | ✔ | ✔ | ✔ | ✔ | — | — |
| **Voir la liste de ses clients** | — | — | ✔ | ⚙ ² ⁵ | — | — | ✔ |
| **Définir des paliers de fidélité** | — | — | ✔ | **—** | — | — | — |
| **Créer / modifier une promotion** | — | — | ✔ | **—** ⁶ | — | — | — |
| **Envoyer un code promotionnel nominatif** | — | — | ✔ | **—** | — | — | — |
| **Créer un événement JP** | — | — | — | — | — | — | ✔ |
| **Créer un événement de boutique** | — | — | ✔ | **—** | ✔ | — | — |
| **Candidater à un événement** | — | — | ✔ | — | ✔ | — | — |
| **Valider une candidature à un événement** | — | — | — | — | — | — | ✔ |

¹ uniquement des contenus portant sur des articles qu'il a réellement achetés · ² selon la permission accordée par le vendeur (`F10.4`) · ³ avec double validation et journalisation · ⁴ un acheteur PEUT déposer une annonce de particulier sans devenir vendeur professionnel *(R-H5)* · ⁵ en lecture seule et **sans les montants** *(R-R8)* · ⁶ **jamais** : une promotion engage le prix et donc la marge, comme la modification d'un prix

---

# 4. Arborescence et écrans

## 4.1 Application acheteur — navigation principale

```
┌─ Accueil ────────── stories en haut · directs en cours · à venir · articles
│                     · événements en cours · promotions des boutiques suivies
├─ Clips ──────────── fil vertical plein écran, balayage
├─ [ + ] ──────────── publier (unboxing, look) — visible si achat confirmé
│                     · « Vendre un article que je ne porte plus » (F1.17)
├─ Recherche ──────── texte · filtres taille/prix/couleur/catégorie · vitrines
└─ Moi ───────────── commandes · cagnotte · **mes offres** · **mes avantages**
                      · adresses · abonnements · favoris · réglages
```

**Écrans principaux :** fil d'accueil · fil abonnements · direct · clip plein écran · story · fiche produit · **questions sur une fiche** · vitrine vendeur · profil créatrice · feuille « Je prends » · panier · choix de livraison · paiement · confirmation · suivi de commande · unboxing (enregistrement) · litige · profil · **dépôt d'annonce de particulier** · **mes offres** · **page événement** · **calendrier des événements**.

## 4.2 Application vendeur — « mon studio »

```
┌─ Tableau de bord ── ventes du jour · à expédier · alertes stock · abonnés (+30 j)
├─ Catalogue ──────── articles · variantes · stock · **promotions**
├─ Direct ─────────── planifier · passer en direct · panneau live · bilan
├─ Contenu ────────── stories · clips · statistiques par contenu
├─ Commandes ─────── à préparer · expédiées · livrées · litiges
│                     (origine direct / catalogue dans une file unique)
├─ **Mes clientes** ── classement · fiche client · paliers · offrir une promo
├─ **Événements** ─── candidatures · mon engagement · mes mini-événements · bilan
├─ Mon argent ────── en attente · disponible · retirer · commissions
└─ Ma boutique ───── profil · vérification · équipe · créatrices partenaires
                      · **abonnés** · **réglages de fidélité**
```

## 4.3 Application créatrice

```
┌─ Tableau de bord ── vues → clics → ventes → gains
├─ Contenu ────────── publier · mes contenus · statistiques
├─ Ma sélection ──── articles choisis chez les vendeurs · thèmes
├─ Précommandes ─── en cours · seuils · échéances
├─ Mon argent ────── commissions · retrait
└─ Mon profil ────── vérification · badge · partenariats
```

## 4.4 Back-office

```
┌─ Vérifications ─── file KYC vendeurs et créatrices · **récupérations de compte**
├─ Modération ────── signalements (urgence en tête) · contenus retirés · sanctions
├─ Litiges ───────── file · instruction · décision
├─ Finance ───────── séquestre · retraits · commissions · espèces · réconciliation
├─ Logistique ────── points relais · livreurs · tournées
├─ **Événements** ── créer · annoncer · candidatures · éléments · bilan
├─ Paramètres ────── commissions · frais · durées · seuils
│                     · **durée de réservation catalogue** · **plafonds de notification**
│                     · **seuil de bascule particulier** · **poids du score de rang**
└─ Indicateurs ───── les 4 mesures fondatrices + suivi
                      · **ventes par origine** · **anomalies d'authentification**
```

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

### 5.1.2 Vérification vendeur et créatrice *(F0.6 · F15.1)*

**Parcours**
1. Nom de la boutique ou nom public.
2. Photographies recto et verso de la pièce d'identité.
3. Photographie du visage.
4. Numéro mobile money **au même nom que la pièce**.
5. Adresse d'enlèvement (vendeur uniquement).
6. Soumission → statut *en cours*.

**Règles**
- **R-V1** — En statut *en cours*, l'utilisateur PEUT créer son catalogue et préparer du contenu. Il ne PEUT ni publier, ni diffuser en direct, ni encaisser.
- **R-V2** — La concordance entre le nom de la pièce et le titulaire du compte mobile money DOIT être contrôlée. En cas de discordance, refus.
- **R-V3** — Le refus DOIT être motivé et indiquer précisément ce qui manque.
- **R-V4** — Un délai cible de traitement DOIT être affiché à l'utilisateur. ⚠️ Valeur à arrêter.
- **R-V5** — Les pièces d'identité sont chiffrées, à accès restreint et journalisé *(N3.1)*.
- **R-V6** — Un utilisateur de moins de 18 ans ne PEUT être ni vendeur, ni créatrice, ni publier de contenu vidéo *(B7.4, exigence bloquante)*.

### 5.1.3 Badge *(F0.7 · F18.4)*

Le badge DOIT apparaître sur : la vignette de direct, la fiche produit, la vitrine, le profil créatrice, le panier, l'écran de paiement et la facture. Un appui affiche : *« Identité et compte mobile money vérifiés par JP. »*

## 5.2 Catalogue et stock

### 5.2.1 Article et variantes *(F1.1, F1.2)*

**Règles**
- **R-A1** — Un article DOIT porter au moins une photographie, un nom, un prix et une catégorie.
- **R-A2** — Le stock est géré **par variante**, jamais globalement.
- **R-A3** — Une variante épuisée est **affichée barrée**, non masquée — cela permet la demande d'alerte de retour en stock.
- **R-A4** — Un raccourci de création en trois champs (photo, prix, quantité) DOIT exister pour l'usage en plein direct. Sans lui, aucune vendeuse ne créera de fiche pendant un direct.
- **R-A5** — Le prix est en Ariary, entier, sans décimale.

### 5.2.2 Réservation temporaire du stock *(F1.10 · B1.7, B2.4)*

**Fonction la plus critique du produit. Elle conditionne la recette.**

**Règles**
- **R-S1** — L'appui sur « Je prends » réserve la variante pour l'acheteur pendant une durée paramétrable. ⚠️ Hypothèse : 5 min en direct, 30 min hors direct.
- **R-S2** — Le stock affiché est **le stock réel diminué des réservations en cours**.
- **R-S3** — **La survente DOIT être impossible**, y compris en cas d'appuis strictement simultanés. Critère de recette bloquant.
- **R-S4** — Le minuteur DOIT être visible par l'acheteur.
- **R-S5** — Le minuteur est **suspendu** pendant l'attente de confirmation de l'opérateur de paiement et pendant une coupure réseau côté vendeur. Une réservation ne peut être perdue pour un incident dont l'acheteur n'est pas responsable.
- **R-S6** — À expiration, la variante retourne au stock **immédiatement** et l'acheteur est notifié.
- **R-S7** — Une file d'attente ordonnée par horodatage serveur DOIT exister. Le suivant est notifié à l'expiration *(F2.7)*.
- **R-S8** — Le nombre de réservations expirées est un indicateur du pilote *(F11.7)*.

### 5.2.3 Vente hors direct *(F1.15 à F1.20, F3.14)*

**Le direct n'est pas la condition d'existence d'une vente.** Un vendeur publie une fiche, l'acheteur achète quand il veut. Le direct devient un accélérateur de ce catalogue.

**Règles — parcours**
- **R-H1** — Une commande née du catalogue suit **exactement** la même machine à états, le même séquestre, la même livraison, le même parcours de litige qu'une commande née d'un direct. Toute règle propre à une origine DOIT être explicitement justifiée dans ce document. Deux le sont, et deux seulement : *R-H3* et *R-H8*.
- **R-H2** — L'origine de la commande (`direct`, `catalogue`, `clip`, `story`, `evenement`) est enregistrée. Elle sert aux statistiques et à l'attribution d'affiliation, **jamais aux règles métier**.
- **R-H3** — La durée de réservation hors direct est un **paramètre distinct** de celle du direct. ⚠️ Hypothèse : 30 min contre 5 min. Hors pic, geler un article coûte peu et sauve le panier.
- **R-H8** — Le délai accordé au vendeur pour accepter et préparer une commande de catalogue est **plus long** qu'en direct : il n'est pas devant son téléphone. Le dépassement du délai est notifié à l'acheteur et pèse sur le score de confiance *(F6.2)*.

**Règles — fiche article hors direct**
- **R-H4** — Un article vendu hors direct PEUT porter un **état** (neuf avec étiquette / très bon / bon / correct) et des **mesures réelles**. Les articles mesurés sont signalés comme tels et favorisés au tri. On incite, on n'interdit pas.
- **R-H7** — La vitrine DOIT être vendeuse en permanence. Le direct est un état temporaire affiché en surimpression, jamais une condition d'accès au catalogue.
- **R-H9** — Les questions posées sur une fiche article sont **publiques**, comme les réponses. La messagerie privée libre reste hors périmètre *(F7.14)*. Le filtrage automatique des commentaires s'y applique *(R-X1)*.

**Règles — vendeur particulier** *(F1.17)*
- **R-H5** — Un particulier PEUT publier une annonce sans vérification d'identité et sans création de boutique. **La vérification est exigée au premier encaissement**, jamais avant.
- **R-H6** — L'acheteur DOIT voir clairement qu'il achète à un particulier et non à une boutique. La protection offerte est identique : séquestre, litige, arbitrage.
- **R-H10** — Un particulier qui refuse la vérification alors qu'une commande est payée entraîne l'**annulation et le remboursement intégral** de cette commande, et son compte ne PEUT plus recevoir de commandes tant que la vérification n'est pas faite.
- **R-H11** — ⚠️ Le seuil de bascule particulier → vendeur professionnel et le barème de commission applicable au particulier DOIVENT être arrêtés **avant** l'ouverture du dépôt d'annonce : ils conditionnent l'écran de vérification.

## 5.3 Le direct

### 5.3.1 Diffusion *(F2.3, F2.13)*

- **R-D1** — Le direct DOIT pouvoir être diffusé depuis un téléphone d'entrée de gamme, sans matériel additionnel.
- **R-D2** — La qualité DOIT s'adapter automatiquement au débit disponible, des deux côtés.
- **R-D3** — En cas de coupure côté vendeur, le direct passe en pause avec un message explicite aux spectateurs. **Reprise possible pendant 2 minutes**, avec conservation des spectateurs et des réservations. Au-delà, clôture et génération du bilan.
- **R-D4** — La latence DOIT rester compatible avec l'interaction : le vendeur doit pouvoir réagir à ce qui vient de se produire.

### 5.3.2 Article à l'écran et bandeau *(F2.4, F2.5)*

- **R-D5** — Le vendeur épingle l'article présenté ; le bandeau spectateur affiche photo, nom, **prix**, **tailles disponibles**, **stock restant** et le bouton « Je prends ».
- **R-D6** — Le stock affiché décroît en temps réel *(P3 : le compteur reflète l'état réel, jamais une valeur d'incitation)*.
- **R-D7** — Le vendeur PEUT modifier le prix en direct ; le changement s'applique aux réservations postérieures uniquement.

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
- **R-J4** — Le vendeur voit la commande apparaître avec le prénom de l'acheteuse.

**Cas d'erreur**
| Cas | Comportement |
|---|---|
| Dernière pièce partie pendant le choix | Message immédiat + position en file d'attente + proposition d'alerte de retour |
| Perte de réseau acheteur | Réservation maintenue, minuteur suspendu, reprise transparente |
| Paiement échoué | Réservation maintenue le temps d'une nouvelle tentative, une seule fois |

## 5.4 Panier, commande et livraison

### 5.4.1 Panier *(F3.1, F3.2 · B5.3)*

- **R-P1** — Le panier accepte plusieurs vendeurs ; il DOIT les **regrouper visuellement**, car l'expédition et les frais sont par vendeur.
- **R-P2** — Les frais DOIVENT être affichés **par vendeur et cumulés**. Un total qui triple à la dernière étape est le premier tueur de conversion.
- **R-P3** — Quand plusieurs vendeurs sont présents, le système DEVRAIT proposer le regroupement au même point relais avec l'économie chiffrée.
- **R-P4** — Un seul paiement pour l'ensemble du panier.

### 5.4.2 Livraison *(F3.4, F5.3, F5.4 · B6.1, B6.2)*

- **R-L1** — Deux modes : domicile et point de retrait, choisis à la commande.
- **R-L2** — Le point de retrait DOIT être utilisable **sans saisie d'adresse personnelle**.
- **R-L3** — L'adresse se saisit par **quartier et repères**, pas par adressage postal.
- **R-L4** — Statuts partagés, identiques des deux côtés : `Payée → En préparation → Remise au transport → En livraison / Arrivée au relais → Livrée → Confirmée`.
- **R-L5** — À l'arrivée au relais, l'acheteur reçoit une notification **et un SMS** avec un code à 6 chiffres.
- **R-L6** — La remise s'effectue contre saisie du code par le point relais. Le code est à usage unique.
- **R-L7** — Un délai de garde est appliqué ; au-delà, retour au vendeur. ⚠️ Durée à convenir avec les relais.
- **R-L8** — L'adresse personnelle de l'acheteur ne DOIT jamais être visible par un donateur, une créatrice, ou publiquement *(N3.2)*.

## 5.5 Paiement et séquestre

### 5.5.1 Encaissement *(F4.1 · B5.1)*

**Parcours**
1. Choix de l'opérateur — celui du numéro de l'acheteur présélectionné.
2. Confirmation du montant.
3. Demande de validation reçue sur le téléphone (canal opérateur).
4. Écran d'attente **explicite**, avec minuteur de réservation suspendu.
5. Confirmation, numéro de commande, facture.

- **R-M1** — L'écran d'attente DOIT indiquer clairement ce qui se passe. Un écran figé pendant 60 secondes fait croire à une perte d'argent — c'est le moment le plus fragile de tout le parcours.
- **R-M2** — Un paiement interrompu ne DOIT jamais prélever deux fois ni perdre la commande *(B5.7)*. Idempotence obligatoire, voir `JP_CDC_TECHNIQUE.md`.
- **R-M3** — Aucun secret de paiement ne transite par JP *(N3.3)*.

### 5.5.2 Séquestre *(F4.4, F4.5, F4.6 · B1.1)*

**Le mécanisme qui matérialise toute la proposition de valeur.**

- **R-E1** — Les fonds sont conservés par la plateforme jusqu'à confirmation de réception.
- **R-E2** — L'écran de confirmation DOIT afficher, en clair et non dans les conditions générales : *« Votre argent est gardé par JP. [Vendeur] sera payé quand vous confirmerez avoir reçu. »*
- **R-E3** — La confirmation se fait soit par validation simple, soit par publication d'un unboxing *(F14.7)*. **Les deux chemins sont équivalents ; personne n'est obligé de se filmer.**
- **R-E4** — En l'absence de réponse, libération automatique après un délai suivant la livraison constatée. ⚠️ Hypothèse : 3 jours. Sans cette règle, les vendeurs attendent indéfiniment et quittent la plateforme.
- **R-E5** — L'ouverture d'un litige **bloque** la libération.
- **R-E6** — Le portefeuille vendeur DOIT distinguer visuellement **« en attente de confirmation »** et **« disponible au retrait »**. Une confusion ici est vécue comme un vol.
- **R-E7** — La commission DOIT être affichée avant la mise en vente et sur chaque commande, en clair : *« Vente X — commission Y — vous recevez Z »* *(B5.6)*.

### 5.5.3 Paiement à la livraison ⚠️ *(F4.3 · B5.2)*

**Décision non tranchée. Elle conditionne l'architecture du paiement — à arbitrer avant développement.**

Si retenu :
- **R-E8** — Le mode DOIT être visible sur le bordereau et connu du vendeur avant préparation.
- **R-E9** — Le livreur ou le relais saisit le montant encaissé ; les espèces entrent dans la réconciliation *(F11.5)*.
- **R-E10** — Le risque de refus à la livraison DOIT être explicitement attribué : vendeur, plateforme, ou partagé. Cette attribution DOIT figurer dans les conditions vendeur.
- Pistes d'encadrement à arbitrer : réserver le mode aux acheteurs ayant déjà une commande honorée · le limiter aux points relais · exiger un acompte couvrant les frais de livraison *(F4.12)*.

### 5.5.4 Facture *(F4.11 · B1.3)*

- **R-F1** — Émise automatiquement, horodatée, numérotée, conservée des deux côtés, téléchargeable.
- **R-F2** — Elle porte : articles, prix unitaires, frais de livraison, total, identité du vendeur vérifié, mode de livraison, mention JP.
- **R-F3** — Le vendeur voit en plus le détail de la commission.
- **R-F4** — La facture DOIT rester consultable hors connexion une fois chargée *(N1.5)*.

## 5.6 Contenu

### 5.6.1 Règle bloquante *(P2 · B3.2)*

- **R-K1** — **Aucun contenu ne DOIT pouvoir être publié sans au moins un article achetable attaché.** Le bouton « Publier » reste inactif. Critère de recette bloquant.
- **R-K2** — Un acheteur ne PEUT attacher que des articles qu'il a réellement achetés, vérifiés depuis son historique de commandes.
- **R-K3** — Une créatrice PEUT attacher les articles de n'importe quel vendeur ; l'article porte alors son identifiant d'affiliation *(F15.4)*.
- **R-K4** — Un vendeur qui a refusé l'affiliation *(R-N3)* voit ses articles inattachables par une créatrice.

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
- Réception confirmée → libération des fonds *(R-E1)*
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
- **R-N3** — Le vendeur DOIT pouvoir refuser l'affiliation sur ses articles. Une charge non choisie serait rejetée.
- **R-N4** ⚠️ — La commission d'affiliation est prélevée sur la commission JP en V1 (recommandation), ce qui ne change rien pour le vendeur. À réévaluer au volume.
- **R-N5** — L'acheteur ne voit **aucune complexité supplémentaire** : il achète chez le vendeur, qui expédie. L'affiliation est invisible pour lui.
- **R-N6** — La commission n'est acquise à la créatrice **qu'après confirmation de réception**, comme le paiement du vendeur.

### 5.7.2 Précommande groupée ⚠️ *(F15.8 · B4.2, B4.3)*

**La fonctionnalité qui supprime la barrière du capital — et celle qui porte le plus grand risque d'abus.**

**Paramètres à la création :** prix · **seuil de commandes** · **date limite** · **délai de livraison annoncé**.

**Parcours acheteur**
1. Mention explicite **« Précommande — livraison prévue vers le [date] · 9 sur 15 »**.
2. « Je prends » → paiement → **fonds séquestrés**.
3. Compteur visible.
4. Seuil atteint → commandes confirmées, notification.
5. Seuil non atteint à la date limite → **remboursement automatique et intégral**.

**Règles**
- **R-N7** — La mention « Précommande » et la date prévisionnelle DOIVENT être visibles avant l'engagement, avec le même poids visuel que le prix. Jamais en petits caractères.
- **R-N8** — **Le remboursement en cas de seuil non atteint est automatique, intégral et sans intervention.** Critère de recette bloquant *(B4.3)*.
- **R-N9** ⚠️ — Libération des fonds à la créatrice : décision ouverte. Piste — avance plafonnée à l'atteinte du seuil, solde à la réception confirmée.
- **R-N10** ⚠️ — Délai maximal entre atteinte du seuil et expédition, au-delà duquel remboursement automatique. **Sans cette limite, la précommande devient une machine à litiges** et reproduit exactement l'arnaque que JP combat.
- **R-N11** ⚠️ — Plafond de précommandes simultanées par créatrice.
- **R-N12** — Le back-office DOIT disposer d'une surveillance des précommandes en retard.

### 5.7.3 Ma sélection *(F15.3)*

- **R-N13** — La créatrice compose une vitrine d'articles appartenant à d'autres vendeurs, organisable par thème.
- **R-N14** — L'achat depuis une sélection suit le parcours normal ; c'est le vendeur d'origine qui expédie et porte la responsabilité.

## 5.8 Cadeau et diaspora *(F16 · B5.4)*

**Parcours**
1. L'acheteur compose son panier → **« Demander en cadeau »** → lien.
2. Il partage le lien (messagerie externe).
3. Le donateur ouvre le lien **sans compte, éventuellement depuis l'étranger** : articles, photos, total, frais, vendeur vérifié.
4. Il paie (carte ou mobile money) et joint un message.
5. Le bénéficiaire est notifié ; la commande suit le parcours normal.
6. Le donateur suit la livraison depuis son lien, **sans compte**, et voit la preuve de remise.

**Règles**
- **R-G1** — **L'adresse de livraison n'est jamais visible par le donateur** *(N3.2)*. Il paie, il ne voit pas où cela va.
- **R-G2** — Depuis l'étranger : détection du pays, **montant converti affiché à titre indicatif**, carte proposée en premier, frais de conversion annoncés à l'avance.
- **R-G3** — Le lien cadeau DOIT expirer et refléter l'état réel du stock : un article devenu indisponible s'affiche comme tel *(P3)*.
- **R-G4** — La page cadeau DOIT fonctionner sur un navigateur, sans installation.

## 5.9 Confiance et litiges

### 5.9.1 Litige *(F6.3 à F6.6 · B1.4)*

**Principe culturel structurant : le litige se signale à JP, jamais en face à face avec le vendeur.** La confrontation directe est socialement coûteuse et conduit les gens à abandonner plutôt qu'à réclamer.

**Parcours**
1. Depuis la commande → « Il y a un problème » → motif en liste courte → photographies → description.
2. **Les fonds restent bloqués.** Numéro de dossier attribué.
3. Le vendeur est notifié, voit le motif et les pièces, répond dans le même fil, peut proposer une solution.
4. Accord trouvé → clôture sans arbitrage.
5. Pas d'accord sous 48 h → arbitrage par un opérateur.

**Règles**
- **R-T1** — L'opérateur DOIT voir l'historique complet : commande, statuts de livraison, preuve de remise, échanges, historique des deux parties.
- **R-T2** — **Toute décision DOIT être écrite, motivée, horodatée et notifiée aux deux parties.** Critère de recette bloquant *(100 % des litiges)*.
- **R-T3** — La décision déclenche automatiquement le remboursement ou la libération des fonds.
- **R-T4** — Les décisions sont archivées et alimentent le score du vendeur.

### 5.9.2 Avis *(F6.1 · B1.6)*

- **R-T5** — Seul un acheteur ayant payé **et confirmé la réception** peut noter.
- **R-T6** — L'avis porte une note, un commentaire, une photographie optionnelle et **une indication de conformité à la taille**.
- **R-T7** — Un unboxing publié génère automatiquement l'avis correspondant.

## 5.10 Modération et protection des personnes *(F19 · B7)*

**Cette section n'est pas de la conformité. Le produit expose des personnes qui se filment ; si l'espace devient hostile, le positionnement confiance s'effondre.**

- **R-X1** — À la publication, l'auteur choisit qui peut commenter : tout le monde, ses abonnés, personne. **Disponible dès la première publication**, pas proposé après le premier incident.
- **R-X2** — Le filtrage automatique DOIT masquer insultes et propos sexuels **avant** que la personne visée ne les voie, en malgache et en français.
- **R-X3** — Le signalement se fait en un geste (appui long → motif → envoi).
- **R-X4** — Deux niveaux : ordinaire, et **urgence** (harcèlement, menace, contenu sexuel non consenti, mineur) traitée en priorité avec un délai d'engagement. ⚠️ Délai à arrêter contractuellement.
- **R-X5** — Tout retrait de contenu DOIT être notifié et motivé.
- **R-X6** — Les sanctions sont graduées — avertissement, retrait, restriction, suspension, exclusion — écrites, motivées, horodatées, et **contestables**. Une modération sans recours fait fuir les meilleurs profils.
- **R-X7** — Une empreinte est calculée sur chaque vidéo publiée pour détecter les republications *(F19.8)*. Reprendre la vidéo d'une autre pour vendre le même article est le premier abus qui apparaîtra.
- **R-X8** — Aucun mineur ne PEUT publier de contenu vidéo *(bloquant)*.
- **R-X9** — Les contenus supprimés par leur auteur DOIVENT être conservés le temps nécessaire à l'instruction d'un litige *(N3.6)*.

## 5.11 Exploitation *(F11)*

- **R-O1** — Les paramètres économiques — commissions, frais, durée de réservation, délais de libération, seuils — DOIVENT être modifiables sans nouvelle livraison logicielle, avec double validation et journalisation.
- **R-O2** — **Le tableau de bord des quatre mesures fondatrices DOIT être opérationnel dès le premier direct du pilote.** Sans lui, l'objectif de mesure du projet n'est pas atteint.
- **R-O3** — La réconciliation quotidienne DOIT rapprocher paiements opérateurs, encours séquestré, retraits, commissions et espèces collectées, en signalant les écarts.
- **R-O4** — Toute action d'administration est journalisée de façon inaltérable *(N3.4)*.

## 5.12 Abonnements *(F7.1, F7.15, F7.16, F7.17)*

L'abonnement est l'actif que le vendeur construit sur la plateforme. C'est aussi ce qui rend les promotions et les événements possibles sans achat de publicité.

- **R-Q1** — Suivre s'effectue en **un seul appui**, depuis une vitrine, une fiche, un direct, un clip ou une story. Aucun écran de confirmation. L'action est non symétrique et ne crée aucune obligation.
- **R-Q2** — Le nombre d'abonnés est **public** sur la vitrine et le profil : c'est un signal de confiance au même titre que le score *(F6.2)*, et il ne coûte rien à produire.
- **R-Q3** — Le vendeur voit le prénom, la photographie et la date d'abonnement de ses abonnés. Il ne voit **jamais** leur adresse électronique ni leur numéro de téléphone.
- **R-Q4** — Les notifications de nouvel abonné sont regroupées au-delà de 5 par jour. Un abonnement suivi d'un désabonnement dans la minute ne DOIT produire aucune notification.
- **R-Q5** — Le fil « Abonnements » DOIT contenir les directs, **les nouveaux articles**, les promotions et les événements des comptes suivis. Sans les nouveautés catalogue, l'abonnement à une boutique qui ne diffuse pas de direct n'a aucun effet. Les nouveautés d'un même vendeur publiées le même jour sont regroupées en une carte.
- **R-Q6** — L'acheteur PEUT couper les notifications de promotion d'une boutique **sans se désabonner**. Ce réglage est par vendeur, pas global.

## 5.13 Fidélisation et classement des clients *(F7.5, F7.6, F7.18, F7.19)*

Ce que le vendeur veut savoir : à qui faire un geste. Une liste de noms ordonnée, avec une action possible à côté de chaque ligne.

- **R-R1** — Le rang d'un client est calculé **par vendeur**, jamais globalement. Un vendeur n'a aucune raison de connaître les dépenses de son client chez ses concurrents. Exigence de vie privée, non négociable.
- **R-R2** — Seules les commandes **confirmées** entrent dans le calcul. Une commande payée puis remboursée ne produit pas de client privilégié.
- **R-R3** — Le score porte sur quatre composantes : montant cumulé, nombre de commandes, **récence** (avec décote dans le temps), fiabilité (pénalité en cas d'annulations répétées ou de litiges perdus). Il DOIT être **explicable en une phrase** au vendeur comme au client. Un rang opaque produit le même rejet qu'un score de confiance opaque *(R-T…)*.
- **R-R4** — Les paliers sont définis **par le vendeur** : nom, seuil en montant et/ou en nombre de commandes, avantage. Quatre paliers par défaut, renommables. La fidélisation est **désactivable** ; la liste des clients reste utilisable sans elle.
- **R-R5** — Une modification de seuils ne DOIT jamais retirer un avantage déjà consommé.
- **R-R6** — En dessous d'un nombre minimal de clients, l'écran affiche un état de démarrage explicite. **Aucun faux palmarès à trois lignes.**
- **R-R7** — La liste des clients DOIT permettre une action directe : offrir une promotion ciblée, envoyer un code. Une liste non actionnable ne sert à rien.
- **R-R8** — L'employé du vendeur y accède en lecture seule et **sans les montants**, si le vendeur l'y autorise *(F10.4)*.
- **R-R9** — L'avantage annoncé au titre d'un palier DOIT être **réellement appliqué** au panier. Un palier sans effet est une manipulation, contraire aux principes de conception §1.2.
- **R-R10** — La perte d'un palier par décote de récence DOIT être annoncée **avant** qu'elle survienne, avec le moyen de le conserver.
- **R-R11** — Le journal des commandes confirmées par couple (vendeur, client) DOIT exister **dès la phase 1**, même si la fidélisation n'est activée qu'en phase 2 : le calcul de rattrapage doit être possible sans reprise manuelle, et il DOIT être idempotent.

## 5.14 Promotions *(F7.8, F7.9, F7.22 à F7.26, F3.15)*

- **R-U1** — Une promotion porte un type (pourcentage, montant fixe, livraison offerte), une valeur, une période, un périmètre (boutique, catégorie, sélection) et une cible (tous, abonnés, palier, clients nommés).
- **R-U2** — **Le prix affiché est le prix payé.** Aucune remise ne DOIT apparaître pour la première fois au dernier écran de paiement *(RB7)*.
- **R-U3** — Une promotion programmée démarre automatiquement à sa date. Après un incident du planificateur, elle DOIT démarrer une seule fois, et n'envoyer qu'une seule notification.
- **R-U4** — **Plafonds de notification** : au maximum une notification de promotion par vendeur et par 24 h ; au-delà de trois promotions d'abonnements différents le même jour, elles sont regroupées en un seul message. Ce plafond est partagé avec les notifications d'événement *(R-W9)*. Une acheteuse noyée coupe **toutes** les notifications, y compris « votre colis est arrivé » et le code de retrait — ce qui coûte beaucoup plus cher.
- **R-U5** — L'éligibilité à une promotion ciblée est vérifiée **côté serveur** au calcul du panier. Une perte de palier entre la réservation et le paiement retire la remise **sans faire échouer la commande**, avec un message clair.
- **R-U6** — Un code personnel est **à usage unique et nominatif**. Une commande annulée après usage d'un code DOIT rendre le code réutilisable ou le remplacer : le client ne peut pas perdre un geste commercial du fait d'une annulation.
- **R-U7** — **Cumul** : une seule remise s'applique par ligne de commande, **la plus favorable à l'acheteur**, jamais l'addition. Seule exception documentée : une remise sur les articles et une livraison offerte, qui portent sur des assiettes distinctes. La remise retenue est enregistrée sur la ligne de commande et nommée sur la facture.
- **R-U8** — La remise est affichée **nommément** dans le récapitulatif du panier et sur la facture (« Promo Noël −20 % », « Avantage client Or : livraison offerte »).
- **R-U9** — Le calcul est effectué **côté serveur**, en entiers d'Ariary. Une commande passée conserve le prix et la remise **figés à l'achat**, quelle que soit l'évolution ultérieure de la promotion.
- **R-U10** — Avant validation, le vendeur DOIT voir **le net qui lui restera**, commission déduite, sur un article représentatif. Une remise dont il découvre l'effet après coup produit le même désengagement qu'une commission cachée *(R-G…)*.
- **R-U11** — À la fin de la période, les prix d'origine sont rétablis **automatiquement**. Un prix barré qui reste barré est un mensonge commercial et détruit l'effet de la promotion suivante *(RB9)*.
- **R-U12** — Une valeur qui rendrait le prix nul ou négatif est refusée. Au-delà d'un seuil de remise élevé, une confirmation explicite est demandée.

## 5.15 Événements thématiques *(F20)*

- **R-W1** — Un événement porte un nom, un thème, des dates de début et de fin, un visuel, un mot-dièse, un texte de présentation et une adresse publique partageable. Ses transitions de statut suivent ses dates ; l'annonce reste manuelle.
- **R-W2** — Toute action sur un événement est journalisée avec son auteur *(N3.4)*.
- **R-W3** — La participation à un événement JP est soumise à **validation**. Sans elle, la page se remplit d'articles hors sujet et perd la valeur éditoriale qui la justifie *(F18.1)*.
- **R-W4** — Un refus est **motivé**. Une candidature restée sans réponse à l'ouverture de l'événement est **refusée automatiquement avec notification** : un vendeur laissé sans réponse ne candidate plus.
- **R-W5** — Un article PEUT appartenir à plusieurs événements ; **une seule remise s'applique** *(R-U7)*. Deux événements simultanés ne cumulent pas leurs réductions.
- **R-W6** — La page d'événement est **accessible sans compte**, filtrable par taille, budget et catégorie, et DOIT présenter un état utile lorsqu'elle est vide ou pas encore ouverte. C'est une page d'acquisition, pas un écran interne.
- **R-W7** — La signalisation visuelle d'un événement ne DOIT entraîner **aucun téléchargement d'image supplémentaire** dans les listes : le budget de données du fil est déjà contraint *(N…, F0.9)*. Un article rattaché à deux événements n'affiche qu'une seule pastille, celle dont la fin est la plus proche.
- **R-W8** — Un événement de boutique est publié sans validation, avec une portée limitée à la vitrine et aux abonnés du vendeur. Il **n'apparaît pas** dans le calendrier général : sinon le calendrier se remplit de braderies et perd toute valeur.
- **R-W9** — Au maximum **trois notifications par événement et par utilisateur**, plafond partagé avec les promotions *(R-U4)*. Un utilisateur qui n'a rien demandé et ne suit aucun participant ne reçoit rien.
- **R-W10** — Le calendrier des événements est accessible côté acheteur et propose, à défaut d'événement annoncé, les rendez-vous récurrents des comptes suivis *(F17.4)*.
- **R-W11** — Un bilan est produit à la clôture, y compris lorsqu'il est mauvais. **Un événement dont le bilan n'est pas mesuré sera reconduit par habitude et non par résultat.**
- **R-W12** — ⚠️ Le modèle de participation — gratuite, payante, ou réservée à un palier d'abonnement vendeur — et **l'identité du valideur avec son délai d'engagement** DOIVENT être arrêtés avant l'ouverture du premier événement.

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
| **J0 — Sécurisation** | Accords paiement et livraison · cadrage juridique du séquestre · **arbitrage des 10 décisions ⚠️** | *Préalable absolu au développement* |
| **J1 — Conception** | Maquettes des parcours critiques · modèle de données · choix d'infrastructure vidéo · protocole de test terrain | Spécifications validées |
| **J2 — Socle commerce** | Compte **(courriel + code, Google)**, vérification, catalogue, stock, direct, « Je prends », **vente hors direct**, panier, paiement, séquestre, facture, livraison, litiges, **promotions et abonnements**, back-office | Version testable en interne |
| **J3 — Noyau social** | Stories, clips, fil, unboxing, créatrices, affiliation, précommande, cadeau, **modération complète** | Version testable |
| **J4 — Pilote fermé** | Vendeurs et créatrices sélectionnés, directs réels, **argent réel** | Les quatre mesures fondatrices |
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
| **RB2** | **Fonds correctement séquestrés et libérés** dans tous les cas | Jeu de scénarios complet, réconciliation à 100 % |
| **RB3** | **Remboursement automatique intégral** si un seuil de précommande n'est pas atteint | Scénario de bout en bout, sans intervention humaine |
| **RB4** | **100 % des litiges** reçoivent une décision motivée dans le délai | Revue des dossiers du pilote |
| **RB5** | **Aucun contenu publiable sans article attaché** | Tentative de publication sur chaque type de contenu |
| **RB6** | **Aucune publication vidéo par un mineur** | Test sur compte déclaré mineur et sur compte vérifié |
| **RB7** | **Aucun frais découvert après l'engagement** | Revue de tous les parcours d'achat |
| **RB8** | **Adresse de l'acheteur jamais exposée** au donateur, à la créatrice, ni publiquement | Revue des écrans et des interfaces |
| **RB9** | **Aucun affichage de rareté non réel** | Revue de tous les compteurs et minuteurs |
| **RB10** | **Paiement interrompu : ni double prélèvement, ni commande perdue** | Coupure provoquée à chaque étape |

## 8.2 Critères de performance

| # | Critère | Seuil |
|---|---|---|
| RP1 | « Je prends » → paiement confirmé, cas nominal | < 30 s *(hypothèse)* |
| RP2 | Ouverture de l'application, connexion moyenne | ⚠️ à fixer |
| RP3 | Défilement du fil sur l'appareil de référence | Sans saccade perceptible |
| RP4 | Mise à jour du stock affiché en direct | Quasi-temps réel |
| RP5 | Reprise après coupure côté vendeur | Sous 2 min, spectateurs et réservations conservés |

## 8.3 Recette terrain — obligatoire

**Le produit ne peut être accepté sur la seule base de tests en laboratoire.**

| # | Condition |
|---|---|
| RT1 | Validé sur **un appareil d'entrée de gamme réel**, pas un émulateur |
| RT2 | Validé sur **une connexion mobile réelle**, en heure de pointe |
| RT3 | Au moins **un direct complet réel**, avec de vrais acheteurs et de l'argent réel |
| RT4 | Au moins **une livraison à domicile et une remise en point relais** menées à leur terme |
| RT5 | Au moins **un litige instruit et arbitré** de bout en bout |
| RT6 | Au moins **une précommande atteignant son seuil** et **une n'y parvenant pas**, avec remboursement automatique constaté |
| RT7 | Au moins **un signalement d'urgence** traité dans le délai d'engagement |
| RT8 | Parcours complet vérifié **en malgache** comme en français |
| RT9 | **Un paiement cadeau depuis l'étranger** mené à son terme |

## 8.4 Documentation attendue

Manuel d'exploitation du back-office · procédure de vérification d'identité · **procédure de modération, avec la grille de sanctions** · procédure d'arbitrage des litiges · procédure de réconciliation financière · guide de démarrage vendeur et créatrice, en malgache et en français.

---

# 9. Décisions à arbitrer avant développement

Récapitulatif des points marqués ⚠️. **Tous relèvent du commanditaire, aucun ne peut être tranché par l'équipe technique.**

| # | Décision | Bloque |
|---|---|---|
| 1 | Paiement à la livraison : ouvert ou non, et à quelles conditions | L'architecture du paiement |
| 2 | Précommande : libération des fonds, délai maximal d'expédition, plafond | La fonction précommande |
| 3 | Durée de réservation du stock, en direct et hors direct | Le cœur du direct |
| 4 | Délai de libération automatique des fonds après livraison | Le séquestre |
| 5 | Barème de commission | Le paiement et l'affichage vendeur |
| 6 | Qui supporte la commission d'affiliation | L'affiliation |
| 7 | Fenêtre d'attribution d'affiliation | L'affiliation |
| 8 | Montant du crédit d'unboxing | L'unboxing |
| 9 | Délai d'engagement sur les signalements d'urgence, et moyens de modération | La modération |
| 10 | Appareil de référence, version Android minimale, plafond de poids | Tous les choix techniques |
| 11 | iOS et page web : périmètre exact | Les livrables |
| 12 | Délai de garde en point relais | La logistique |

---

*Volet technique : `JP_CDC_TECHNIQUE.md`. Détail des parcours par persona : `JP_BACKLOG.md`. Justification des choix : `JP_POSITIONNEMENT.md`.*
