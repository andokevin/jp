# JP — Acteurs, droits et workflows

## Qui fait quoi, et comment chaque parcours se déroule

| | |
|---|---|
| **Objet** | Les utilisateurs et leurs rôles · les cas d'utilisation de chacun · le déroulé textuel de chaque parcours, **avec les tables qu'il touche** |
| **Public** | Produit, développement, recette, exploitation |
| **Amont** | `JP_CAHIER_DES_CHARGES.md` §3 *(rôles et droits)* · `JP_CAS_UTILISATION.md` *(scénarios détaillés et diagrammes de séquence)* |
| **Jumeau** | [`JP_DICTIONNAIRE_DONNEES.md`](JP_DICTIONNAIRE_DONNEES.md) — les tables citées ici y sont définies |

> **Ce que ce document ajoute.** `JP_CAS_UTILISATION.md` donne les scénarios et
> les diagrammes de séquence ; `JP_DICTIONNAIRE_DONNEES.md` donne les tables.
> **Aucun des deux ne dit quelle table chaque étape écrit.** C'est ce lien que
> ce document établit — c'est lui qui permet d'écrire un test d'intégration
> sans deviner.

---

# PARTIE I — LES ACTEURS

> **Amont normatif** : [`JP_DECISIONS_PRODUIT.md`](JP_DECISIONS_PRODUIT.md).
> Six acteurs ont été retirés du produit *(`DP-01`)* : vendeur particulier,
> employé du vendeur, livreur, point relais, modérateur JP, opérateur JP.

## 1. Les acteurs humains

| Code | Acteur | Ce qu'il vient chercher | Application |
|---|---|---|---|
| **AN** | **Visiteur non inscrit** | Regarder sans s'engager, comprendre à qui il a affaire | mobile · web public |
| **A** | **Acheteur** | Savoir à qui il paie, trouver sa taille | mobile |
| **B** | **Boutique** | Ne plus perdre de ventes, être prise au sérieux | mobile *(studio)* |
| **C** | **Créatrice** | Gagner de l'argent **sans capital et sans stock** | mobile *(studio créatrice)* |
| **D** | **Donateur / diaspora** | Offrir un objet précis à quelqu'un de nommé | **web** *(⚠️ `PO-9`)* |
| **PM** | **Partenaire marque** | Des campagnes mesurables | espace partenaire *(phase 3)* |

> **« Boutique » remplace « vendeur »** *(`DP-03`)*. Le mot désigne à la fois
> l'acteur et sa vitrine. Le verbe *vendre* et le nom *vente* sont conservés :
> ce sont des actions, pas des acteurs.

## 2. Les acteurs système

| Code | Acteur | Rôle |
|---|---|---|
| **SYS** | Plateforme JP | Exécute les règles, les minuteurs, les échéances, les calculs — **et depuis `DP-05`, les vérifications, les sanctions et le traitement des signalements** |
| **PSP** | Prestataire de paiement | MVola, Orange Money, Airtel Money, agrégateur carte |
| **VID** | Service vidéo | Ingest, transcodage, diffusion, enregistrement |
| **NOT** | Service de notification | Poussée, SMS, courriel |

> **`SYS` a hérité de deux acteurs humains.** Ce qui était instruit par le
> modérateur et l'opérateur est désormais exécuté par des règles *(`DP-05`)*.
> Ce n'est pas un détail de nommage : cela veut dire qu'**aucune décision de la
> plateforme n'est explicable par un humain**, et que chaque règle automatique
> doit donc être motivée par écrit au moment où elle s'applique.

## 3. Il n'y a pas d'enchaînement de rôles

```
                    ┌──▶  A   Acheteur    ── n'a aucun chemin vers la vente
Inscription ────────┼──▶  B   Boutique    ── peut acheter (commodité, DP-02)
                    └──▶  C   Créatrice   ── peut acheter (commodité, DP-02)

Sans inscription ──────▶  AN  Visiteur
                          D   Donateur
```

**Un compte a un type, et un seul, choisi à l'inscription. Il n'en change
jamais** *(`DP-02`)*. Il n'existe aucun écran de bascule, aucune montée en
grade, **aucune procédure de support** pour changer de type.

**L'ancien modèle est explicitement abandonné.** Ce document affirmait
auparavant que « les rôles se cumulent sur un même compte » et que seuls les
portefeuilles restaient séparés. Cette phrase est fausse depuis `DP-02`.

> ### Pourquoi une boutique peut acheter
>
> Le cas visé est le patron qui veut acheter sur JP sans se créer un second
> compte. **Ce n'est pas un cumul de rôles :** le parcours est exactement le
> parcours acheteur, il n'ouvre aucun droit, et une boutique **ne peut pas
> acheter chez elle-même**. Ventes et achats restent deux historiques distincts.

---

# PARTIE II — LES TYPES DE COMPTE ET LEURS DROITS

## 4. Ce que chaque type peut détenir et encaisser

| Type de compte | Détenir du stock | **Encaisser** | Vérification exigée |
|---|:---:|:---:|---|
| Visiteur | non | non | aucune |
| **Acheteur** | non | non | **adresse électronique** |
| **Boutique** | **oui** | **oui** | **identité + mobile money** |
| **Créatrice** | non | **oui** *(commissions versées par la boutique)* | **identité + mobile money** |

> ### La règle fondamentale — elle survit à `DP-07`
>
> **Aucun compte ne peut percevoir d'argent avant vérification de son identité
> **et** de la titularité de son compte mobile money.** *(B1.2)*
>
> Elle change de portée, pas de nature. Avant, elle protégeait un **retrait**
> depuis un portefeuille tenu par JP. Depuis `DP-07`, **JP ne tient plus
> d'argent** : l'encaissement arrive directement sur le compte mobile money.
> La vérification n'est donc plus un verrou sur la sortie d'argent — **c'est un
> verrou sur la mise en vente**. Une boutique non vérifiée ne peut pas publier,
> parce qu'après la vente il sera trop tard pour vérifier quoi que ce soit.
>
> **Traduction en base** : `boutique.statut_verification` est le verrou, et
> `boutique.msisdn_mobile_money` est la **seule** destination possible d'un
> crédit *(`DP-16`)*.

## 5. La matrice des droits

| Action | AN | A | B | C |
|---|:---:|:---:|:---:|:---:|
| Consulter contenu et catalogue | ✔ | ✔ | ✔ | ✔ |
| Regarder un direct | ✔ | ✔ | ✔ | ✔ |
| Ouvrir la liste des articles d'un direct *(`DP-06`)* | ✔ | ✔ | ✔ | ✔ |
| « Je prends » / commander | — | ✔ | ✔ | ✔ |
| Publier un contenu | — | ✔ ¹ | ✔ | ✔ |
| Créer / modifier un article | — | — | ✔ | — |
| **Modifier un prix** | — | — | ✔ | — |
| Diffuser en direct | — | — | ✔ | — |
| Modérer son propre chat | — | — | ✔ | ✔ |
| Préparer / expédier | — | — | ✔ | — |
| Sélectionner des articles d'autrui | — | — | — | ✔ |
| **Partager un lien d'affiliation** *(`DP-09`)* | — | — | — | ✔ |
| Ouvrir une précommande ⚠️ *(`PO-8`)* | — | — | ✔ | ✔ |
| Signaler un problème sur une commande | — | ✔ | ✔ | — |
| Suivre une boutique ou une créatrice | — | ✔ | ✔ | ✔ |
| **Voir la liste de ses clientes** | — | — | ✔ | — |
| **Définir des paliers de fidélité** | — | — | ✔ | — |
| **Créer / modifier une promotion** | — | — | ✔ | — |
| Envoyer un code promotionnel nominatif | — | — | ✔ | — |
| Créer un événement de boutique | — | — | ✔ | ✔ |
| Candidater à un événement | — | — | ✔ | ✔ |
| Valider une candidature **à son propre événement** | — | — | ✔ | ✔ |
| **Gérer son abonnement** *(`DP-08`)* | — | — | ✔ | — |

¹ uniquement sur des articles réellement achetés

> ### Neuf droits ont disparu de cette matrice
>
> | Droit retiré | Pourquoi |
> |---|---|
> | Déposer une annonce de particulier | `DP-01` — l'acteur `P` n'existe plus |
> | **Voir le portefeuille** · **Retirer de l'argent** | `DP-07` — il n'y a plus de portefeuille ni de retrait |
> | **Arbitrer un litige** · Traiter un signalement | `DP-05` — repris par `SYS` |
> | **Vérifier une identité** | `DP-05` — vérification automatisée |
> | **Modifier les paramètres économiques** | `DP-05` — c'est de l'exploitation interne, plus un droit d'acteur produit |
> | Créer un événement JP | `DP-05` — seuls subsistent les événements de boutique |
> | Valider la candidature d'un tiers | `DP-05` — l'organisateur valide, il n'y a plus d'arbitre |
>
> **Et le bloc « les quatre interdits absolus de l'employé » est supprimé** avec
> l'acteur `VE` *(`DP-01`)*. La table `membre_equipe` et l'attribut
> `membre_equipe.permissions` n'ont plus d'objet.

---

# PARTIE III — LES CAS D'UTILISATION, PAR ACTEUR

## 6. Vue par acteur

### AN · Visiteur non inscrit — 4 cas
`UC-01` créer un compte · `UC-12` acheter hors direct *(réservation posée avant
inscription)* · consulter une page publique *(vitrine, article, cadeau,
événement, replay)* · regarder un direct

### A · Acheteur — 12 cas
`UC-02` se connecter · `UC-03` récupérer son compte · `UC-12` acheter hors direct
· `UC-13` remplir un panier · `UC-21` acheter en direct · `UC-30` payer ·
`UC-31` confirmer la réception · `UC-43` convenir du point de remise · `UC-50`
signaler un problème · `UC-60` suivre une boutique · `UC-80` demander un
article en cadeau · `UC-90` signaler · `UC-92` publier un contenu

### B · Boutique — 13 cas
`UC-10` publier un article · `UC-20` diffuser un direct · `UC-33` gérer son
abonnement · `UC-40` préparer et expédier · `UC-43` convenir du point de remise ·
`UC-50` signaler un problème · `UC-52` se faire vérifier · `UC-62` consulter ses
clientes · `UC-70` lancer une promotion · `UC-71` promo VIP · `UC-72` créer un
événement de boutique · `UC-73` participer à un événement · `UC-92` publier un
contenu

### C · Créatrice — 6 cas
`UC-52` se faire vérifier · `UC-63` partager un lien d'affiliation · `UC-72`
créer un événement · `UC-73` participer à un événement · `UC-90` signaler ·
`UC-92` publier un contenu

### D · Donateur / diaspora — 1 cas
`UC-81` offrir un article à un compte JP nommé *(`DP-10`)*

### PM · Partenaire marque — phase 3
Hors périmètre V1 *(`PO-2`)*.

> ### Sept cas d'utilisation sont supprimés
>
> | Cas | Pourquoi |
> |---|---|
> | `UC-11` Déposer une annonce | `DP-01` — l'acteur `P` n'existe plus |
> | `UC-32` Retirer son argent | `DP-07` — l'argent arrive directement |
> | `UC-41` Livrer à domicile · `UC-42` Remettre au relais | `DP-04` — JP n'opère plus de logistique |
> | `UC-51` Arbitrer un litige | `DP-05` + `DP-07` — plus d'arbitre, plus d'argent à trancher |
> | `UC-91` Traiter un signalement | `DP-05` — exécuté par `SYS` |
> | `UC-61` Publier un unboxing | `DP-17` — le geste filmé est retiré ; la confirmation en un appui *(`UC-31`)* devient le seul chemin |
>
> **Les numéros libérés ne sont pas réattribués.** `UC-11` restera un trou :
> ces codes sont cités dans `JP_CAS_UTILISATION.md`, `JP_BACKLOG.md` et
> `JP_USER_STORIES.md`, et un décalage silencieux y serait indétectable.
>
> **Trois cas sont neufs** : `UC-33` gérer son abonnement *(`DP-08`)*, `UC-43`
> convenir du point de remise *(`DP-10`)*, `UC-63` partager un lien
> d'affiliation *(`DP-09`)*.

## 7. La matrice complète

| UC | Intitulé | AN | A | B | C | D |
|---|---|:-:|:-:|:-:|:-:|:-:|
| UC-01 | Créer un compte | **●** | | | | |
| UC-02 | Se connecter | | **●** | ○ | ○ | |
| UC-03 | Récupérer un compte | | **●** | ○ | ○ | |
| UC-10 | Publier un article | | | **●** | | |
| UC-12 | Acheter hors direct | ○ | **●** | ○ | ○ | |
| UC-13 | Remplir un panier | | **●** | ○ | ○ | |
| UC-20 | Diffuser un direct | | | **●** | | |
| UC-21 | Acheter en direct | ○ | **●** | ○ | ○ | |
| UC-30 | Payer une commande | | **●** | | | ○ |
| UC-31 | Confirmer la réception | | **●** | | | |
| UC-33 | **Gérer son abonnement** | | | **●** | | |
| UC-40 | Préparer et expédier | | | **●** | | |
| UC-43 | **Convenir du point de remise** | | **●** | **●** | | |
| UC-50 | Signaler un problème sur une commande | | **●** | ● | | |
| UC-52 | Se faire vérifier | | | **●** | **●** | |
| UC-60 | Suivre une boutique | | **●** | ○ | ○ | |
| UC-62 | Consulter ses clientes | | | **●** | | |
| UC-63 | **Partager un lien d'affiliation** | | | ○ | **●** | |
| UC-70 | Lancer une promotion | | | **●** | | |
| UC-71 | Promo VIP | | | **●** | | |
| UC-72 | Créer un événement de boutique | | | **●** | ● | |
| UC-73 | Participer à un événement | | | **●** | ● | |
| UC-80 | Demander un article en cadeau | | **●** | | | |
| UC-81 | Offrir un article | | ○ | | | **●** |
| UC-90 | Signaler | | **●** | ● | ● | |
| UC-92 | Publier un contenu | | ● | ● | **●** | |

**●** acteur principal · ○ acteur secondaire

> **Les colonnes `P`, `VE`, `L`, `PR`, `MO` et `OP` ont disparu** *(`DP-01`)*.
> Les colonnes `○` de `B` et `C` sur les cas d'achat sont nouvelles : elles
> matérialisent `DP-02` — une boutique et une créatrice **peuvent acheter**.

---

# PARTIE IV — LES WORKFLOWS

> **Convention.** Chaque workflow donne son déclencheur, ses préconditions, son
> déroulé numéroté, **les tables écrites**, ses postconditions et ses cas
> d'échec. Les scénarios alternatifs complets et les diagrammes de séquence sont
> dans `JP_CAS_UTILISATION.md`.
>
> **`[T]`** marque une étape qui doit être **une seule transaction**.

---

## Paquetage 1 — Authentification

### UC-01 · Créer un compte
`AN` → session ouverte · *F0.1, F0.13, F0.14 · R-C1 à R-C10*

**Déclencheur** — première ouverture de l'application.
**Préconditions** — aucune. L'acteur a une adresse électronique accessible.

> **La particularité qui gouverne tout ce parcours : inscription et connexion
> sont indifférenciées.** La même saisie ouvre un compte existant ou en crée un
> *(R-C4)*. C'est ce qui interdit de savoir, depuis l'écran d'entrée, **qui
> possède un compte** *(R-C9)*.

1. `AN` saisit son adresse électronique.
2. `SYS` vérifie le débit autorisé pour cette adresse **et** cette adresse IP.
3. `SYS` invalide tout code actif, génère un code à 6 chiffres, **le hache**, et
   l'enregistre avec une expiration à 10 minutes. → **`code_otp`**
4. `SYS` demande l'envoi à `NOT`, **en asynchrone** — la réponse HTTP ne
   l'attend pas, sinon le temps de réponse trahirait l'existence du compte.
5. `SYS` répond **de façon identique** que le compte existe ou non.
6. `AN` saisit le code ; la vérification part **automatiquement au sixième
   chiffre**.
7. **`[T]`** `SYS` compare **à temps constant**, marque le code consommé, crée
   le compte s'il est inconnu, ouvre une session.
   → **`code_otp`**, **`utilisateur`**, **`session`**
8. `AN` choisit un prénom d'affichage. → `utilisateur.prenom`
9. `SYS` propose le quiz de style, **passable**. → `profil_acheteur`

**Postconditions** — un compte existe, une session longue est ouverte,
**aucun mot de passe n'a été créé**.

| Échec | Traitement |
|---|---|
| Courriel non reçu | Renvoi après 30 s ; après deux renvois, suggérer les indésirables |
| Code erroné | Compteur incrémenté ; **à la 5ᵉ, le code est invalidé** |
| Code expiré | Refus, aucune session |
| Débit dépassé | Refus **en affichant le délai restant en clair** |

---

### UC-02 · Se connecter
`A` · *F0.1, F0.2, F0.13 · R-C2, R-C11, R-C12*

Identique à `UC-01` étapes 1 à 7. `SYS` reconnaît l'adresse et ouvre le compte
existant **sans créer de doublon**.

| Variante | Déroulé |
|---|---|
| **Session encore valide** | Rien à saisir. Le jeton de rafraîchissement est renouvelé **par rotation** → `session` |
| **Connexion Google** | `SYS` vérifie le jeton d'identité **côté serveur**, refuse si l'adresse n'est pas déclarée vérifiée *(R-C11)*, et **rattache** l'identité au compte existant si l'adresse correspond *(R-C12)* → `identite_externe` |
| **⚠️ Jeton réutilisé** | `SYS` détecte le rejeu et **révoque toute la famille de jetons**, pas seulement celui présenté — c'est le signe d'un vol → `session.famille` |

---

### UC-03 · Récupérer un compte inaccessible
`A` + `SYS` · *F0.3 · R-C13 · `DP-05`, `DP-07`*

> **Ce parcours était « le seul du produit où un humain de JP décide ».**
> Depuis `DP-05`, il n'y en a plus aucun.

1. `A` déclare ne plus avoir accès à son adresse.
2. `SYS` présente un formulaire : prénom, dernière commande, montant
   approximatif, numéro de téléphone de livraison.
3. `SYS` enregistre la demande et attribue **un numéro de dossier dicible au
   téléphone**. → **`demande_recuperation`**
4. `SYS` répond **202 dans tous les cas**, même si l'adresse est inconnue.
5. **`SYS`** compare les déclarations à l'historique réel du compte visé et
   décide **sur seuil de concordance**, avec **le détail des points concordants
   journalisé**. → **`journal_audit`**
6. Concordance suffisante : `SYS` envoie un code à la nouvelle adresse.
   → `code_otp`
7. `A` vérifie la nouvelle adresse ; `SYS` réattribue le compte et journalise.
   → `utilisateur.email`, **`journal_audit`**

**Postconditions** — le compte a changé d'identifiant, **la décision est tracée
et motivée**.

> **`R-C14` est sans objet** : elle gelait les retraits d'un compte porteur d'un
> solde pendant l'instruction. **Il n'y a plus ni solde ni retrait** *(`DP-07`)*.
>
> ⚠️ **Le risque de `DP-05` est ici à son maximum.** Une usurpation réussie
> donne accès à un compte ; un refus à tort enferme dehors quelqu'un de
> légitime, **et il n'y a personne à qui faire appel**. Le seuil de concordance
> et la liste des points comparés doivent être écrits et versionnés, pas laissés
> à un réglage.

## Paquetage 2 — Catalogue et vente

### UC-10 · Publier un article
`B` · *F1.1 à F1.5 · R-G1, R-H4 · `DP-01`*

1. `V` choisit 1 à 8 photos et les recadre.
2. `V` saisit nom, prix, catégorie. **L'univers est choisi ici, et il sera
   immuable** *(R-Y1)*.
3. `V` renseigne l'état et **les mesures réelles** — facultatif mais **valorisé
   au tri** *(R-H4)* : sans essayage, les mesures remplacent le fait de toucher
   le vêtement.
4. `V` coche les tailles et saisit **une quantité par taille** ; couleurs si
   besoin.
5. `SYS` affiche **la commission simulée avant publication** *(R-G1)* — jamais
   découverte après.
6. **`[T]`** `SYS` crée l'article, ses variantes, et **un mouvement de stock
   d'entrée par variante**.
   → **`article`**, **`variante`**, **`mouvement_stock`**

| Échec | Traitement |
|---|---|
| Champ obligatoire d'univers manquant | Refus **nommant les champs manquants**, jamais un refus générique |
| Cosmétique sans date de péremption | Refus — **obligatoire en JP Beauté** *(R-Y13)* |
| Photo trop lourde | Recompression côté client avant envoi |

---

### UC-12 · Acheter un article hors direct
`A` / `AN` · *F1.16 à F1.20 · R-A3, R-H1, R-H3, RB7*

1. `A` ouvre une fiche article depuis le fil, la recherche, une vitrine ou **un
   lien partagé**.
2. `SYS` affiche : photos, prix, **tailles disponibles — les épuisées barrées,
   pas masquées** *(R-A3)*, état, **mesures comparées à son profil**, **délai
   d'expédition annoncé** *(F5.9)*, badge de la boutique, **et la carte Garantie
   JP**.
   → lit `article`, `variante`, `boutique`, `profil_acheteur`
3. `A` appuie sur **« Je prends »**.
4. `SYS` ouvre la feuille d'achat : taille présélectionnée depuis son profil,
   quantité, livraison au dernier choix mémorisé, **et le total avec frais
   affiché ici** *(RB7)* — jamais découvert au paiement.
5. **`[T]`** `SYS` pose une **réservation atomique** pour la **durée catalogue**
   *(R-H3)* : `SELECT variante FOR UPDATE`, incrément de `quantite_reservee`,
   insertion.
   → **`reservation`**, **`variante.quantite_reservee`**
6. `A` paie *(`UC-30`)*.

> **Un seul moteur de réservation pour tous les canaux** *(R-H1)*. L'`origine`
> change **uniquement** `expire_le`. Un second chemin de réservation serait un
> défaut d'architecture.

| Échec | Traitement |
|---|---|
| Stock épuisé entre l'affichage et l'appui | `409 STOCK_INSUFFISANT` + proposition de **file d'attente** |
| Visiteur non inscrit | **La réservation est posée AVANT l'inscription** — sinon on perd la pièce pendant la saisie du code |

---

### UC-13 · Remplir un panier et le payer en une fois
`A` · *F3.1 à F3.6 · R-U7*

> **Rappel de modélisation : il n'existe pas de table `panier`.** Une ligne de
> panier **est** une réservation active *(D7)*. Le panier est la **projection**
> des réservations de l'utilisateur, groupées par boutique.

1. `A` ajoute plusieurs articles, **de boutiques différentes**.
2. `SYS` **regroupe par boutique** : les frais de livraison et l'expédition sont
   par boutique. **Le panier ne se scinde jamais par univers** *(R-Y7)* — la même
   boutique tient souvent le vêtement et le cosmétique.
3. `SYS` calcule les remises éligibles et **n'en retient qu'une par ligne, la
   plus favorable** *(R-U7)*.
4. `SYS` affiche le récapitulatif : sous-total, **remise nommée**, frais par
   boutique, total.
5. `A` paie — **un seul paiement pour tout le panier** *(`R-P4`, `DP-16`)*, quel
   que soit le nombre de boutiques. JP reverse ensuite à chacune.

---

## Paquetage 3 — Le direct

### UC-20 · Diffuser un direct et vendre
`V` · *F2.1 à F2.5 · R-S2, RB9*

1. `V` saisit un titre et sélectionne ses articles de la soirée.
   → **`direct`**, **`direct_article`**
2. `SYS` **mesure le débit montant** et signale une connexion insuffisante
   **avant** de démarrer.
3. `V` passe en direct ; `SYS` obtient des identifiants d'ingest auprès de `VID`
   et **notifie les abonnés**. → `direct.statut = en_cours`, `notification`
4. `V` sélectionne l'article « à l'écran » ; `SYS` **horodate `a_lecran_le`**.
   → **`direct_article.a_lecran_le`**
5. `SYS` diffuse le bandeau : prix, tailles, **stock restant réel** *(R-S2,
   RB9)* — jamais un compteur gonflé.
6. Les acheteuses achètent *(`UC-21`)* ; `SYS` alimente **le panneà la boutique en
   temps réel** — le chiffre d'affaires qui monte pendant qu'il parle.
7. `V` arrête. `SYS` clôt le direct, **produit le bilan** et récupère
   l'enregistrement. → `direct_bilan`

> **`a_lecran_le` rend le replay achetable gratuit** *(F2.16)* : les marqueurs à
> la minute sont **produits par l'usage**, sans aucune saisie manuelle.
>
> **`direct_bilan.articles_sans_vente` est un signal de prix trop haut**, pas
> une statistique décorative.

---

### UC-21 · Acheter pendant un direct ★
`A` · *F2.6 à F2.9 · R-S1 à R-S7, RB1, RB7*

> **Le parcours le plus important du produit. Il doit tenir sous 30 secondes, et
> la vidéo continue de jouer pendant tout le parcours.**

Identique à `UC-12` étapes 3 à 6, avec **trois différences** :

| | |
|---|---|
| **La vidéo reste visible** au-dessus de la feuille d'achat | On ne quitte jamais le direct |
| **La durée de réservation est courte** *(R-H3)* | L'urgence est réelle, pas simulée |
| **La boutique voit la commande tomber avec le prénom** | C'est ce qui rend le direct vivant |

**Le cas qui décide de tout — deux acheteuses sur la dernière pièce :**

1. Appuis quasi simultanés de Hanta et Fara.
2. **`[T]`** `SYS` ouvre une transaction, `SELECT variante FOR UPDATE` pour
   Hanta → `disponible = 1` → `quantite_reservee = 1`, réservation **rang 1**,
   `COMMIT`.
3. `SYS` diffuse `stock_change {reste: 0}` sur le canal du direct.
4. **`[T]`** Même transaction pour Fara → `disponible = 0` → **`ROLLBACK`** →
   `409 STOCK_INSUFFISANT`, **rang 2 proposé**.
5. Fara accepte la file. → `reservation` *(`statut = en_file`, `rang = 2`)*
6. Si Hanta ne paie pas, sa réservation expire, **le stock revient et Fara est
   notifiée**.

> **L'horodatage serveur tranche** *(R-S7)*. **Aucune survente n'est possible**
> *(RB1)* — garanti par le verrou de ligne **et** par
> `CHECK (quantite_reservee <= quantite_stock)`.

**Chemin essentiel à ne pas manquer** — *« Ajouter au panier »* : la réservation
est maintenue, `A` continue le direct et paie tout à la fin. **Cela augmente le
panier et évite cinq paiements mobile money d'affilée.**

---

## Paquetage 4 — Paiement et argent

### UC-30 · Payer une commande en mobile money ★
`A` + `PSP` · *F4.1, F4.14, F4.10, F4.11 · R-M1 à R-M7, R-M9, R-M10 · RB2, RB10, RB11 · `DP-07`, `DP-15`, `DP-16`*

> **Le client paie, le vendeur reçoit son argent, JP ne récupère que sa
> commission** *(`DP-16`)*. **Un débit, une confirmation, deux ou trois crédits.**
> **JP ne détient aucun fonds** *(`R-M9`)*.

1. `SYS` calcule les parts : **le net de la boutique**, **la commission JP** si
   elle est en mode commission *(`DP-15`)*, **la part créatrice** si la vente est
   affiliée. → lit `commande.mode_remuneration`, `commande.taux_commission_pour_mille`
2. `SYS` annonce **le nombre de confirmations attendues** *(`R-M6`)* — **1** en
   éclatement atomique *(`R-M10`)*.
3. `A` choisit son opérateur — **le sien est présélectionné**.
4. `SYS` crée le paiement avec une **clé d'idempotence** *(R-M2)* et **suspend le
   minuteur de réservation**.
   → **`paiement`** *(1 à 3 lignes)*, `reservation.suspendu_depuis`, `cle_idempotence`
5. `PSP` envoie une demande de validation sur le téléphone de `A`.
6. `SYS` affiche un écran d'attente **animé**, avec le temps écoulé et **la
   mention que la réservation est en pause** — sinon l'acheteuse croit perdre sa
   pièce.
7. `A` saisit son code. `PSP` confirme, **par rappel asynchrone et/ou par réponse
   synchrone** — les deux chemins doivent converger sans double effet.
8. **`[T]`** `SYS`, **en une seule transaction** : consomme la réservation, passe
   la commande en `PAYEE`, journalise chaque crédit.
   → `reservation.statut = consommee` · `variante` · **`commande`** ·
   **`ecriture_financiere`**
9. `SYS` émet la facture, notifie `A` et notifie `B` **avec le net reçu**.
   → **`facture`**, `notification`

**Postconditions** — la commande est `PAYEE`, la facture existe des deux côtés,
**les crédits sont partis directement aux bénéficiaires**. **JP ne détient aucun
fonds.**

**Le nombre de crédits** : **1** *(boutique en abonnement)* · **2** *(boutique en
commission)* · **3** *(commission + vente affiliée)*.

| Échec | Traitement |
|---|---|
| Solde insuffisant | **Le motif réel** — « le paiement a échoué » ne dit pas s'il faut recharger ou réessayer |
| Aucune réponse de `PSP` | Le paiement passe en `EXPIRE` ; **la réservation reprend son minuteur là où il s'était arrêté** |
| **Éclatement atomique refusé** | Tout ou rien : **la commande n'est pas créée**. Rien n'a bougé |
| **En repli — patte pivot échouée** | **La commande n'est pas créée, aucune autre patte n'est émise** *(`R-M4`)* |
| **En repli — patte secondaire échouée** | **L'acheteuse ne voit rien** : elle a payé, la commande existe, l'expédition suit. La patte est **rejouée après interrogation** *(`R-M5`, `R-M7`)* |
| **Rejeu de la même clé** | **Le résultat initial est renvoyé, sans nouveau prélèvement** *(RB10)* |
| Même clé, requête différente | Refus — `empreinte_requete` protège contre le pire cas |

> ### ⚠️ `PO-11` — la question la plus importante du projet
>
> *« Un encaissement unique peut-il être réparti automatiquement vers plusieurs
> comptes bénéficiaires, en une seule opération, avec un seul code de
> confirmation pour le payeur ? »*
>
> Elle décide du nombre de confirmations vues par l'acheteuse. **Et si aucun
> bénéficiaire tiers n'est possible, l'argent devra transiter par JP — avec
> l'exposition juridique que `DP-07` avait supprimée.**

---

### UC-31 · Confirmer la réception ★
`A` · *F4.5, F6.1 · R-R11 · `DP-04`, `DP-07`*

> **La confirmation ne libère plus d'argent** — la boutique a été payée au
> moment du paiement *(`DP-07`)*. Elle **clôt la commande et alimente la
> réputation**, qui est désormais la seule protection de l'acheteuse.

1. `SYS` notifie `A` : *« Avez-vous bien reçu ? »*
2. `A` répond **« Oui, tout va bien »**.
3. **`[T]`** `SYS` clôt la commande et enregistre la réception.
   → `commande.statut = CONFIRMEE` · **`ecriture_financiere`** *(journal)*
4. `SYS` invite `A` à laisser un avis et **fait entrer l'article dans son
   dressing**. → `piece_dressing`
5. `SYS` écrit au **journal des ventes confirmées** *(R-R11)*, qui alimente le
   rang client **et le score de confiance de la boutique** *(`DP-07`)*.
   → **`vente_confirmee_journal`**, `score_confiance`

> **L'étape 5 doit exister dès la phase 1**, même si la fidélité n'est activée
> qu'en phase 2. Sans elle, il faudra reconstituer l'historique à la main — ou
> **effacer la fidélité des premières clientes, qui sont précisément les plus
> fidèles.**

**L'autre chemin de clôture** :

| Motif | Déclencheur |
|---|---|
| `automatique` | Délai écoulé sans réponse ni signalement *(délai à trancher — voir §8)* |

> ### Ce que la confirmation ne fait plus
>
> Elle ne déclenche **aucun mouvement d'argent**. Une commande jamais confirmée
> ne coûte donc rien à personne — **sauf à la réputation de la boutique**, seule
> sanction disponible *(`DP-04`, `DP-05`)*. C'est aussi pourquoi l'étape 5 cesse
> d'être un confort de fidélité pour devenir **le mécanisme de protection
> lui-même**.

## Paquetage 5 — Livraison

### UC-40 · Préparer et expédier une commande
`B` · *F5.1, F5.2 · R-H2 · `DP-04`*

1. `B` ouvre « À préparer » : **une file unique**, triée par échéance, **avec un
   marqueur d'origine** *(R-H2)*.
   → lit `commande`, `ligne_commande`
2. `B` ouvre le bordereau : articles, tailles, destinataire, **point de remise
   convenu** *(`UC-43`)*, note de l'acheteuse.
3. `B` prépare le colis et marque « Expédiée ».
   → **`expedition`** *(`EN_PREPARATION` → `EXPEDIEE`)*, **`evenement_livraison`**
4. `SYS` met le statut à jour **des deux côtés** et notifie `A`.
5. `B` marque « Livrée » à la remise ; `A` confirme *(`UC-31`)*.

> **JP n'opère aucune logistique** *(`DP-04`)*. La boutique choisit son moyen —
> son coursier, un transporteur, une remise en main propre. **JP ne fournit que
> la frise de statuts**, et c'est la boutique qui la fait avancer.
>
> **Une file unique, pas deux.** Deux files — « direct » et « catalogue » —
> signifieraient deux logistiques à tenir, **et la boutique en oublierait une**.
>
> ### Le point faible assumé
>
> **La déclaration d'expédition n'est vérifiée par personne.** Aucun tiers neutre
> ne constate la remise *(`DP-04`)*. Une boutique qui marque « Expédiée » sans
> expédier n'est arrêtée que par le signalement de l'acheteuse *(`UC-50`)* et par
> l'effet de ce signalement sur son score.

---

### UC-43 · Convenir du point de remise
`A` + `B` · *`DP-04`, `DP-10`*

1. `SYS` ouvre un fil entre `A` et `B` à la création de la commande.
2. `A` et `B` conviennent du lieu et du moment de la remise.
   → **`fil_remise`** ⚠️ *(schéma à écrire)*
3. `B` enregistre le point convenu ; il apparaît sur le bordereau *(`UC-40`)*.

> **Dans le cas du cadeau** *(`UC-81`)*, l'échange a lieu entre **la boutique et
> le bénéficiaire** — jamais le donateur, qui ne voit jamais l'adresse *(RB8)*.
>
> **Et c'est ce fil qui retient l'article** : le paiement du cadeau n'a lieu
> qu'après l'accord *(`DP-10`)*, donc la réservation doit tenir **bien plus de
> 30 minutes** ⚠️ *(`PO-10`)*.

## Paquetage 6 — Confiance

### UC-50 · Signaler un problème sur une commande ★
`A` *(ou `B`)* · *F6.3 · `DP-05`, `DP-07`*

> **On parle à JP, jamais à la boutique en face.** La confrontation directe est
> socialement coûteuse ici — c'est pour cela que les gens abandonnent au lieu de
> réclamer, et c'est ce qui rend le vrai chiffre invisible.
>
> **Mais JP ne tranche plus** *(`DP-05`)* **et ne détient plus l'argent**
> *(`DP-07`)*. Le signalement ne rend rien : **il compte.**

1. `A` ouvre sa commande et choisit **« Il y a un problème »**.
2. `A` choisit un motif — **filtré par univers** *(R-Y…)* — ajoute des photos et
   une description.
3. **`[T]`** `SYS` ouvre le dossier, attribue un numéro, et **l'inscrit
   immédiatement au compteur de la boutique**.
   → **`signalement_commande`**, `score_confiance`
4. `SYS` notifie `B`, qui voit le motif et les photos et répond **dans le même
   fil**. → `message_litige`
5. `B` propose une solution : renvoi, remboursement de sa propre initiative,
   geste commercial. **`SYS` n'exécute aucun mouvement d'argent** — c'est la
   boutique qui rembourse, depuis son compte, si elle le décide.
6. `A` confirme que c'est réglé : le dossier se clôt et **le compteur est
   décrémenté**. → `signalement_commande.statut = resolu`

**Si le dossier reste ouvert**, il **pèse durablement sur le score de la
boutique**, et au-delà d'un seuil `SYS` **suspend automatiquement sa mise en
vente** *(`DP-05`, F6.8)*. **Il n'y a pas d'escalade vers un arbitre : il n'y en
a plus.**

> ### Ce que l'acheteuse doit savoir avant de payer
>
> **JP ne rembourse pas.** Cette phrase doit être lisible à l'écran de paiement,
> exactement là où figurait l'ancienne phrase de séquestre *(`DP-07`)*. La
> protection est **en amont** — boutique vérifiée, historique visible, avis —
> **jamais en aval.**

### UC-52 · Se faire vérifier
`B` / `C` + `PSP` · *F0.6, F0.7 · R-V2, R-V5, N3.1 · `DP-05`*

> **Il n'y a plus de file humaine** *(`DP-05`)*. La vérification est exécutée par
> `SYS` et le prestataire.

1. `B` dépose sa pièce d'identité et son selfie.
   → **`document_identite`** *(chiffré)*
2. `SYS` transmet au prestataire, qui compare **pièce, selfie et titulaire du
   compte mobile money** *(R-V2)* — **les trois points séparément**, jamais une
   validation globale.
3. `SYS` **journalise tout accès aux documents** *(R-V5, N3.1)*.
   → **`journal_audit`**
4. `SYS` décide, **motif écrit obligatoire**, et débloque **la mise en vente**.
   → `boutique.statut_verification`, badge

**En cas de refus** — motif écrit, **pièces manquantes nommées**, possibilité de
recommencer.

> **Ce que la vérification débloque a changé.** Elle ouvrait l'encaissement ;
> elle ouvre désormais **la mise en vente** *(`DP-07`)*. Puisque l'argent part
> directement chez la boutique au moment du paiement, il serait trop tard pour
> vérifier quoi que ce soit après la vente.
>
> **La journalisation reste obligatoire même sans lecteur humain.** Elle ne
> protège plus des employés de JP — il n'y en a plus — mais elle reste la seule
> preuve de ce que la plateforme a consulté, et quand.
>
> ⚠️ **`DP-05` a un coût ici.** Une vérification refusée à tort n'a plus personne
> à qui être contestée. Le motif écrit devient la **seule** voie de correction :
> il doit être actionnable, jamais « document non conforme ».

## Paquetage 7 — Social et fidélité

### UC-60 · Suivre une boutique
`A` · *F7.1, F7.2 · R-Q1, R-Q2, R-Q5, R-Q6*

1. `A` appuie sur « Suivre » depuis une vitrine, une fiche, un direct, un clip
   ou une story — **un seul appui, aucune confirmation** *(R-Q1)*.
   → **`abonnement`**
2. `SYS` met à jour le compteur public *(dénormalisé, R-Q2)*.
   → `boutique.nb_abonnes`
3. Le fil « Abonnements » contient désormais **les directs, les nouveautés
   catalogue, les promotions et les événements** de cette boutique *(R-Q5)*.
4. `A` peut **couper les notifications de promotion de cette boutique sans se
   désabonner** *(R-Q6)*. → `abonnement.notifications_promo`

> **L'étape 4 protège les notifications utiles.** Un utilisateur qui coupe tout
> parce qu'une boutique est bavard nous fait perdre *« colis arrivé »* et *« code
> de retrait »*.

---

### UC-62 · Consulter ses clientes et leur rang
`V` · *F7.18, F7.19 · R-R1, R-R3, R-R8, R-R11*

1. `SYS` recalcule le rang **à chaque commande confirmée, en asynchrone**, sur
   quatre composantes : **montant cumulé, fréquence, récence avec décote,
   fiabilité** *(R-R3)*.
   → lit **`vente_confirmee_journal`** → écrit **`rang_client`**
2. `V` ouvre « Mes clientes » : liste ordonnée par rang, **filtrable par palier
   et par inactivité**.
3. `V` ouvre une fiche : historique, tailles achetées, articles préférés,
   litiges, **note privée jamais visible de la cliente**. → `note_client`
4. `V` agit : « Offrir une promo » *(`UC-71`)* ou « Envoyer un code ».

> ### La garantie la plus fragile du produit
>
> **Le rang est par boutique, et rien ne permet de le contourner** *(R-R1, D5)*.
>
> Il n'existe **volontairement aucun** index sur `utilisateur_id` seul dans
> `vente_confirmee_journal`, et **aucune vue** agrégeant une cliente tous
> boutiques confondues. **Un contrôle d'autorisation se contourne par une nouvelle
> requête ; l'absence de chemin d'accès ne se contourne pas.**
>
> **Cette absence doit être documentée dans la migration**, sinon quelqu'un
> ajoutera l'index « pour optimiser ».

> **`R-R8` est supprimée** avec l'acteur `VE` *(`DP-01`)* : il n'y a plus de
> délégation d'accès à cet écran.

---

### UC-92 · Publier un contenu avec articles attachés
`A` / `V` / `C` · *F14.5 · RB5*

1. L'acteur choisit un média et rédige une légende.
2. L'acteur attache **un ou plusieurs articles**, selon le catalogue autorisé
   pour son rôle : `V` son catalogue · `C` sa sélection *(articles d'autrui)* ·
   `A` **uniquement des articles qu'il a réellement achetés**.
3. **`SYS` refuse la publication si aucun article n'est attaché — côté client,
   côté API, ET par contrainte différée en base** *(RB5)*.
4. `SYS` publie ; le contenu porte l'identifiant de la créatrice le cas échéant,
   **ce qui rattache la vente**.
   → **`contenu`**, **`contenu_article.createur_id`**

> **La règle d'or, et elle est en base :**
> *« Aucun contenu ne peut exister sans article achetable attaché. »*
> **JP n'est pas un réseau social auquel on ajoute une boutique. C'est une
> boutique dont le catalogue est fait de vidéos.**
>
> Le déclencheur est **différé**, ce qui permet d'insérer le contenu puis ses
> articles dans le même bloc transactionnel.

---

## Paquetage 8 — Promotions et événements

### UC-70 · Lancer une promotion et notifier ses abonnés ★
`V` · *F7.22 à F7.26 · R-U3, R-U4, R-U7, R-U10, R-U11*

1. `V` choisit type, valeur, période, périmètre et cible.
2. `SYS` détecte un éventuel **chevauchement** avec une promotion existante et
   rappelle **la règle de non-cumul** *(R-U7)*.
3. `SYS` affiche **le net qui restera à la boutique** sur un article représentatif,
   **commission déduite** *(R-U10)*.
4. `SYS` annonce **le nombre d'abonnés qui seront notifiés**, avec un
   interrupteur pour ne pas notifier.
5. `V` lance. `SYS` active la promotion, applique les prix barrés, déclenche le
   fan-out. → **`promotion`**, `promotion_article`
6. `NOT` applique, **pour chaque abonné** : réglage individuel, **plafond par
   boutique et par 24 h**, seuil de regroupement *(R-U4)*.
   → `notification`, **`notification_compteur`**
7. `SYS` marque **`notifiee_le` — verrou d'idempotence** : après un incident du
   planificateur, la promotion démarre en retard mais **ne renotifie jamais**
   *(R-U3)*.
8. À la date de fin, `SYS` **rétablit automatiquement** les prix d'origine
   *(R-U11)*.

> **Le non-cumul n'est pas un contrôle applicatif, c'est une structure.**
> `ligne_commande.promotion_id` est **une colonne scalaire, pas une table de
> liaison** *(D4)* : le cumul est **impossible par construction**.

---

### UC-71 · Offrir une promotion réservée aux clientes VIP
`V` · *F7.9 · R-U5, R-U6*

1. `V` sélectionne un palier depuis « Mes clientes » *(`UC-62`)*.
2. `V` crée une promotion réservée **à ce palier et aux paliers supérieurs**.
   → `promotion` *(`cible = palier`)*
3. Les clientes éligibles la voient **nommément** : *« Offre réservée aux
   clientes VIP de Miora »*.
4. `SYS` vérifie l'éligibilité **côté serveur au calcul du panier** *(R-U5)* —
   jamais seulement à l'affichage.
   → `promotion_beneficiaire.code_personnel` *(**nominatif et à usage unique**,
   R-U6)*

---

### UC-72 · Créer un événement thématique
`B` / `C` · *F20.x · R-W4, R-W6 à R-W9 · `DP-05`*

> **L'événement de portée JP disparaît** avec l'opérateur *(`DP-05`)*. Il ne
> reste que les événements de boutique, créés par leur organisateur.

1. `B` renseigne nom, thème, dates, visuel, **couleur d'accent**, mot-dièse,
   présentation, règles de participation.
2. `SYS` génère un `slug` unique et enregistre en `brouillon`. → **`evenement`**
3. `B` **annonce** l'événement — **action humaine, volontairement**.
4. `SYS` le rend visible dans le calendrier avec un compte à rebours et un
   bouton « Me prévenir ». → `evenement_rappel`
5. À la date de début, `SYS` passe en `en_cours` **et refuse automatiquement les
   candidatures restées en attente, avec notification** *(R-W4)*.
   → `evenement_participation` *(`refusee_sans_reponse`)*
6. À la date de fin, `SYS` clôt et **produit le bilan**, comparé à une période
   équivalente. → `evenement_bilan`

> **Le passage `brouillon → annonce` est humain, les autres transitions sont
> automatiques.** On ne veut pas qu'un événement s'annonce tout seul.
>
> **La couleur d'accent est appliquée par jeton, jamais par image** *(R-W7)* —
> le budget de données de l'acheteuse n'est pas une variable d'ajustement.

---

### UC-73 · Participer à un événement ★
`V` / `C` · *F20.x · R-W6, R-W7*

1. `V` voit les événements ouverts dans son studio.
2. `V` candidate en choisissant **les articles et la promotion qu'il engage**.
   → **`evenement_participation`** *(`candidate`)*
3. **L'organisateur** examine et accepte. → `evenement_participation` *(`acceptee`)*
4. `V` rattache ses éléments : articles, promotion, clips avec le mot-dièse,
   direct programmé. → **`evenement_element`** *(polymorphe)*
5. À l'ouverture, les éléments apparaissent sur **la page publique, accessible
   sans compte** *(R-W6)*.
6. Les vignettes portent **une pastille aux couleurs de l'événement — couleur et
   texte uniquement, aucune image supplémentaire** *(R-W7)*.

---

## Paquetage 9 — Le cadeau et la diaspora

### UC-80 · Demander un panier en cadeau
`A` · *F16.1 · RB8*

1. `A` compose son panier et choisit « Demander en cadeau ».
2. `SYS` **fige le panier** et génère **un jeton opaque à durée limitée**.
   → `panier_cadeau` ⚠️ *(schéma à écrire — voir `JP_DICTIONNAIRE_DONNEES.md`
   §17.1)*
3. `SYS` présente **un aperçu de ce que verra le destinataire**, et rappelle que
   **son adresse ne sera jamais visible** *(RB8)*.
4. `A` partage le lien sur WhatsApp ou Messenger. → `lien_partage`

---

### UC-81 · Offrir un article à un compte JP nommé ★
`D` · *F16.x · RB7, RB8 · `DP-10`*

> **Le premier canal de JP qui ne dépend pas du pouvoir d'achat local.**

1. `D` ouvre le lien **dans son navigateur**.
2. `SYS` détecte le pays, affiche le montant **en Ariary et une conversion
   indicative**, propose **la carte en premier**, et **annonce les frais de
   conversion à l'avance** *(RB7)*. → lit `taux_change`
3. `D` **désigne le compte JP du bénéficiaire** *(`DP-10`)*.
4. `SYS` affiche les articles, le total, les frais et **le badge de boutique
   vérifiée** — **aucune information de livraison, d'aucune sorte** *(RB8)*.
5. **Le bénéficiaire et la boutique conviennent du point de remise** *(`UC-43`)*.
   `D` n'y participe pas et n'en voit rien.
6. **L'accord constaté, `D` confirme le paiement.** L'argent va directement à la
   boutique — directement sur son mobile money *(`DP-07`, `DP-16`)*.
   → **`paiement`** *(`payeur_utilisateur_id`, `payeur_pays`,
   `montant_devise_origine`)*, `commande.donateur_ref`
7. La commande suit le parcours normal *(`UC-40`)*.
8. À la réception, le bénéficiaire **confirme avoir reçu** *(`UC-31`)*, en un
   appui. `D` en est notifié.

> **L'invariant `RB8` est devenu structurel.** Il fallait auparavant cacher
> activement l'adresse au donateur ; désormais **il ne la manipule jamais** —
> elle se négocie entre deux personnes dont il ne fait pas partie *(`DP-10`)*.
>
> **Deux choses ont disparu** : la **preuve de remise** *(`DP-04`)* et le suivi
> de livraison côté donateur. Ce qui reste est l'essentiel, et c'est la moitié
> qui portait la valeur : *« envoyer de l'argent à Madagascar est déjà gratuit et
> instantané — nous ne vendons ni le prix ni la vitesse, nous vendons de savoir
> ce que l'argent devient. »* Il choisit l'objet, et il voit la boutique vérifiée.
>
> ⚠️ **Le bénéficiaire doit avoir un compte JP** *(`DP-10`)*, et `D` doit pouvoir
> revenir confirmer après l'accord — ce qui suppose une session *(`PO-9`)*.

## Paquetage 10 — Modération

### UC-90 · Signaler un contenu ou une personne
`A` / `C` / `V` · *F19.x · R-X4*

1. L'acteur fait **un appui long** et choisit « Signaler ».
2. L'acteur choisit un motif **dans une liste courte**.
3. `SYS` enregistre, attribue un numéro et **affiche le délai d'engagement**.
   → **`signalement`** *(avec `niveau = ordinaire | urgence`)*

> **Le geste doit être identique partout** — c'est pourquoi `FeuilleSignalement`
> est un composant partagé, présent à six emplacements.

> ### Qui traite, désormais
>
> **`SYS`**, et personne d'autre *(`DP-05`)* : filtre automatique *(F19.1)*,
> comptage, sanction graduée automatique *(F6.8, F19.9)*. Le parcours `UC-91`
> — la file de modération humaine — **est supprimé**.
>
> ⚠️ **La contestation disparaît avec l'instructeur.** L'ancienne règle voulait
> qu'une sanction soit instruite en recours *« par une autre personne que celle
> qui a sanctionné »*. Il n'y a plus de personne. Une sanction automatique ne
> peut donc être levée que par **une nouvelle évaluation automatique** — ce qui
> impose que chaque sanction soit **recalculable**, jamais un état figé.

---

# 8. Ce que ces workflows laissent ouvert

Les décisions que le déroulé des parcours ne suffit pas à trancher, et qui
doivent l'être **avant** le développement du parcours concerné.

> **Amont** : [`JP_DECISIONS_PRODUIT.md`](JP_DECISIONS_PRODUIT.md). Les points
> `PO-x` cités ici y sont tenus à jour — c'est là qu'ils se ferment, pas ici.

| # | Question | Parcours bloqué | Élément de décision |
|---|---|---|---|
| **1** | **Quel délai de confirmation automatique ?** | `UC-31` | La question survit à `DP-07`, mais elle a changé d'enjeu : elle ne libère plus d'argent, elle **clôt la commande et fige le score**. Un délai trop court efface les problèmes tardifs ; trop long, il laisse des commandes en suspens pour toujours |
| **2** | ~~Le paiement à la livraison~~ | — | **Sans objet** *(`DP-04`)* — il n'y a plus ni livreur ni relais pour encaisser des espèces |
| **3** | **Quelle durée de réservation, par origine ?** | `UC-12`, `UC-21`, **`UC-43`** | Paramétrable *(`parametre`)*, avec **bornes min/max codées**. ⚠️ **Le cadeau ajoute un cas extrême** : l'article doit tenir pendant la négociation du point de remise, entre deux fuseaux horaires *(`PO-10`)* |
| **4** | 🔴 **La précommande groupée est-elle encore possible ?** | `F15.8` | `R-N8` exige un **remboursement automatique et intégral** si le seuil n'est pas atteint — **critère de recette bloquant `B4.3`**. Sans séquestre, JP ne peut rembourser un argent qu'il n'a jamais tenu *(`PO-8`)*. Piste retenue à trancher : **n'encaisser qu'à l'atteinte du seuil** |
| **5** | **Le libellé de la migration 17** — *une clarification, pas une décision* | `UC-13`, `UC-70` | Son intitulé se lit comme la création d'une **table** `remise_ligne`. C'est une **colonne** `int DEFAULT 0` de `ligne_commande`. **La garantie de non-cumul tient sans réserve** |
| **6** | ~~Qui supporte la commission d'affiliation ?~~ | — | **Tranché** *(`DP-09`)* — **la boutique**, sur son prix, taux connu de la créatrice avant qu'elle attache l'article. `R-N4` est morte avec la commission JP *(`DP-08`)* |
| **7** | **Que devient la cagnotte, maintenant qu'il n'y a plus de geste filmé à récompenser ?** | `UC-31` | 🔴 **Point ouvert** *(`DP-17` §5)* : le geste récompensé a disparu avec l'unboxing. Deux issues — retirer la cagnotte du périmètre V1, ou la rattacher à la confirmation de réception. **À trancher par le produit**, pas par la documentation |
| **8** | **Trois schémas de tables cités sans colonnes** | `UC-80`, `UC-81`, `UC-52`, **`UC-43`** | `panier_cadeau` · `demande_verification` · **`fil_remise`** *(neuf, `DP-10`)* |
| **9** | 🔴 **Le prestataire honore-t-il une clé d'idempotence sur une requête rejouée ?** | `UC-30` | `R-M5` **rejoue délibérément** les requêtes secondaires échouées. Sans idempotence honorée par l'opérateur, une relance paie la créatrice deux fois *(`PO-11`)* |
| **10** | **Quel seuil de signalements suspend une boutique ?** | `UC-50` | C'est désormais **la seule sanction du produit** *(`DP-04`, `DP-05`)*. Trop bas, une boutique honnête est coupée par deux clientes mécontentes ; trop haut, la protection est décorative |

---

*Documents liés : [`JP_DICTIONNAIRE_DONNEES.md`](JP_DICTIONNAIRE_DONNEES.md) —
les tables · [`JP_CAS_UTILISATION.md`](JP_CAS_UTILISATION.md) — les scénarios
alternatifs et les 30 diagrammes de séquence ·
[`JP_CAHIER_DES_CHARGES.md`](JP_CAHIER_DES_CHARGES.md) — les 180 règles `R-xx`*
