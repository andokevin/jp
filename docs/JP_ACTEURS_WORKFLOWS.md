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

## 1. Les acteurs humains

| Code | Acteur | Ce qu'il vient chercher | Application |
|---|---|---|---|
| **AN** | **Visiteur non inscrit** | Regarder sans s'engager, comprendre à qui il a affaire | mobile · web public |
| **A** | **Acheteur** | Ne pas perdre son argent, trouver sa taille | mobile |
| **P** | **Vendeur particulier** | Vendre trois vêtements sans monter un commerce | mobile |
| **V** | **Vendeur professionnel** | Ne plus perdre de ventes, être pris au sérieux | mobile *(studio)* |
| **VE** | **Employé du vendeur** | Voir les commandes à préparer **sans toucher aux finances** | mobile *(studio restreint)* |
| **C** | **Créatrice** | Gagner de l'argent **sans capital et sans stock** | mobile *(studio créatrice)* |
| **D** | **Donateur / diaspora** | Offrir un objet précis, vérifié, livré, **avec une preuve** | **web, sans compte** |
| **L** | **Livreur** | Une tournée claire, une preuve de remise | app terrain |
| **PR** | **Point relais** | Recevoir, stocker, remettre contre code, être payé | app terrain |
| **MO** | **Modérateur JP** | Protéger les créatrices, vite | back-office |
| **OP** | **Opérateur JP** | Traiter vite, avec des preuves | back-office |
| **PM** | **Partenaire marque** | Des campagnes mesurables | back-office *(phase 3)* |

## 2. Les acteurs système

| Code | Acteur | Rôle |
|---|---|---|
| **SYS** | Plateforme JP | Exécute les règles, les minuteurs, les échéances, les calculs |
| **PSP** | Prestataire de paiement | MVola, Orange Money, Airtel Money, agrégateur carte |
| **VID** | Service vidéo | Ingest, transcodage, diffusion, enregistrement |
| **NOT** | Service de notification | Poussée, SMS, courriel |

## 3. Comment les rôles s'enchaînent

```
AN  ──▶  A  ──┬──▶  P  ──▶  V
              ├──▶  C  ──▶  V
              └──▶  D

Personnel JP  ──┬──▶  MO
                └──▶  OP

Terrain  ──┬──▶  L
           └──▶  PR
```

**Les rôles se cumulent sur un même compte** — une même personne peut acheter,
vendre et créer. **Mais les portefeuilles restent séparés** : sinon elle ne sait
plus d'où vient son argent.

---

# PARTIE II — LES RÔLES ET LEURS DROITS

## 4. Ce que chaque rôle peut détenir et encaisser

| Rôle | Détenir du stock | **Encaisser** | Vérification exigée |
|---|:---:|:---:|---|
| Visiteur | non | non | aucune |
| **Acheteur** | non | non | **adresse électronique** |
| **Vendeur particulier** | oui *(pièces uniques)* | **oui** | **aucune pour publier · identité + mobile money pour encaisser** |
| **Vendeur professionnel** | **oui** | **oui** | **identité + mobile money** |
| **Employé de vendeur** | non | **non** | adresse électronique + invitation |
| **Créatrice** | non | **oui** *(commissions)* | **identité + mobile money** |
| **Livreur** | non | espèces uniquement | contrat + identité |
| **Point relais** | non | espèces uniquement | contrat |
| **Modérateur** | — | — | interne |
| **Opérateur** | — | — | interne |

> ### La règle fondamentale
>
> **Aucun rôle ne peut percevoir d'argent avant vérification de son identité
> **et** de la titularité de son compte mobile money.** *(B1.2)*
>
> **Le vendeur particulier ne fait pas exception** : il publie sans
> vérification, **il n'encaisse pas sans elle** *(R-H5, R-H10)*. C'est ce qui
> permet à quelqu'un de vendre trois vêtements en trois minutes, tout en
> rendant impossible de disparaître avec l'argent d'une inconnue.
>
> **Traduction en base** : `profil_vendeur.statut_verification` est le verrou,
> et `profil_vendeur.msisdn_mobile_money` est la **seule** destination possible
> d'un `retrait`.

## 5. La matrice des droits

| Action | AN | A | V | VE | C | MO | OP |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Consulter contenu et catalogue | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Regarder un direct | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| « Je prends » / commander | — | ✔ | ✔ | ✔ | ✔ | — | — |
| Publier un contenu | — | ✔ ¹ | ✔ | — | ✔ | — | — |
| Créer / modifier un article | — | — | ✔ | ✔ | — | — | — |
| Déposer une annonce de particulier | — | ✔ ⁴ | ✔ | — | ✔ | — | — |
| **Modifier un prix** | — | — | ✔ | **—** ² | — | — | — |
| Diffuser en direct | — | — | ✔ | ⚙ ² | — | — | — |
| Modérer son propre chat | — | — | ✔ | ✔ | ✔ | — | — |
| Préparer / expédier | — | — | ✔ | ✔ | — | — | — |
| **Voir le portefeuille** | — | — | ✔ | **—** | ✔ | — | ✔ |
| **Retirer de l'argent** | — | — | ✔ | **—** | ✔ | — | — |
| Sélectionner des articles d'autrui | — | — | — | — | ✔ | — | — |
| Ouvrir une précommande | — | — | ✔ | — | ✔ | — | — |
| Ouvrir un litige | — | ✔ | ✔ | — | — | — | — |
| **Arbitrer un litige** | — | — | — | — | — | — | ✔ |
| Traiter un signalement | — | — | — | — | — | ✔ | ✔ |
| **Vérifier une identité** | — | — | — | — | — | — | ✔ |
| **Modifier les paramètres économiques** | — | — | — | — | — | — | ✔ ³ |
| Suivre un vendeur ou une créatrice | — | ✔ | ✔ | ✔ | ✔ | — | — |
| **Voir la liste de ses clients** | — | — | ✔ | ⚙ ² ⁵ | — | — | ✔ |
| **Définir des paliers de fidélité** | — | — | ✔ | **—** | — | — | — |
| **Créer / modifier une promotion** | — | — | ✔ | **—** ⁶ | — | — | — |
| Envoyer un code promotionnel nominatif | — | — | ✔ | **—** | — | — | — |
| Créer un événement JP | — | — | — | — | — | — | ✔ |
| Créer un événement de boutique | — | — | ✔ | **—** | ✔ | — | — |
| Candidater à un événement | — | — | ✔ | — | ✔ | — | — |
| Valider une candidature | — | — | — | — | — | — | ✔ |

¹ uniquement sur des articles réellement achetés · ² selon la permission accordée
par le vendeur *(F10.4)* · ³ **avec double validation et journalisation** ·
⁴ un acheteur peut déposer une annonce **sans devenir vendeur professionnel**
*(R-H5)* · ⁵ **en lecture seule et sans les montants** *(R-R8)* · ⁶ **jamais** :
une promotion engage le prix, donc la marge, exactement comme un prix

> ### Les quatre interdits absolus de l'employé
>
> `membre_equipe.permissions` ne peut **jamais** accorder : **le portefeuille ·
> le retrait · les prix · les promotions.** Ce ne sont pas des permissions
> désactivées par défaut, ce sont des permissions **qui n'existent pas**.

---

# PARTIE III — LES CAS D'UTILISATION, PAR ACTEUR

## 6. Vue par acteur

### AN · Visiteur non inscrit — 4 cas
`UC-01` créer un compte · `UC-12` acheter hors direct *(réservation posée avant
inscription)* · consulter une page publique *(vitrine, article, cadeau,
événement, replay, mur des colis ouverts)* · regarder un direct

### A · Acheteur — 14 cas
`UC-02` se connecter · `UC-03` récupérer son compte · `UC-11` déposer une annonce
· `UC-12` acheter hors direct · `UC-13` remplir un panier · `UC-21` acheter en
direct · `UC-30` payer · `UC-31` confirmer la réception · `UC-50` ouvrir un
litige · `UC-60` suivre une boutique · `UC-61` publier un unboxing · `UC-80`
demander un panier en cadeau · `UC-90` signaler · `UC-92` publier un contenu

### P · Vendeur particulier — 3 cas
`UC-11` déposer une annonce · `UC-40` préparer et expédier · `UC-52` se faire
vérifier *(déclenché **après** la première vente)*

### V · Vendeur professionnel — 11 cas
`UC-10` publier un article · `UC-20` diffuser un direct · `UC-32` retirer son
argent · `UC-40` préparer et expédier · `UC-50` ouvrir un litige · `UC-62`
consulter ses clientes · `UC-70` lancer une promotion · `UC-71` promo VIP ·
`UC-73` participer à un événement · `UC-92` publier un contenu · `UC-52` se faire
vérifier

### VE · Employé — 2 cas
`UC-10` publier un article *(sans toucher au prix)* · `UC-40` préparer et
expédier

### C · Créatrice — 6 cas
`UC-61` publier un unboxing · `UC-73` participer à un événement · `UC-92` publier
un contenu · `UC-90` signaler · `UC-32` retirer ses commissions · ouvrir une
précommande *(F15.8)*

### D · Donateur / diaspora — 1 cas, **sans compte**
`UC-81` offrir un panier depuis l'étranger

### L · Livreur — 1 cas
`UC-41` livrer un colis à domicile

### PR · Point relais — 1 cas
`UC-42` recevoir et remettre un colis

### MO · Modérateur — 1 cas
`UC-91` traiter un signalement

### OP · Opérateur — 4 cas
`UC-51` arbitrer un litige · `UC-52` vérifier une identité · `UC-72` créer un
événement · `UC-03` instruire une récupération de compte

## 7. La matrice complète

| UC | Intitulé | AN | A | P | V | VE | C | D | L | PR | MO | OP |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| UC-01 | Créer un compte | **●** | | | | | | | | | | |
| UC-02 | Se connecter | | **●** | ○ | ○ | ○ | ○ | | ○ | ○ | ○ | ○ |
| UC-03 | Récupérer un compte | | **●** | | | | | | | | | ○ |
| UC-10 | Publier un article | | | | **●** | ○ | | | | | | |
| UC-11 | Déposer une annonce | | **●** | ● | | | ○ | | | | | |
| UC-12 | Acheter hors direct | ○ | **●** | | | | | | | | | |
| UC-13 | Remplir un panier | | **●** | | | | | | | | | |
| UC-20 | Diffuser un direct | | | | **●** | ⚙ | | | | | | |
| UC-21 | Acheter en direct | ○ | **●** | | | | | | | | | |
| UC-30 | Payer une commande | | **●** | | | | | ○ | | | | |
| UC-31 | Confirmer la réception | | **●** | | | | | | | | | |
| UC-32 | Retirer son argent | | | ○ | **●** | | ● | | | | | |
| UC-40 | Préparer et expédier | | | ● | **●** | ● | | | | | | |
| UC-41 | Livrer à domicile | | | | | | | | **●** | | | |
| UC-42 | Remettre au relais | | ○ | | | | | | ○ | **●** | | |
| UC-50 | Ouvrir un litige | | **●** | | ● | | | | | | | |
| UC-51 | Arbitrer un litige | | | | | | | | | | | **●** |
| UC-52 | Vérifier une identité | | | ○ | ○ | | ○ | | | | | **●** |
| UC-60 | Suivre une boutique | | **●** | | ○ | | ○ | | | | | |
| UC-61 | Publier un unboxing | | **●** | | | | ● | | | | | |
| UC-62 | Consulter ses clientes | | | | **●** | ⚙ | | | | | | ○ |
| UC-70 | Lancer une promotion | | | | **●** | | | | | | | |
| UC-71 | Promo VIP | | | | **●** | | | | | | | |
| UC-72 | Créer un événement | | | | ● | | ● | | | | | **●** |
| UC-73 | Participer à un événement | | | | **●** | | ● | | | | | ○ |
| UC-80 | Demander un panier cadeau | | **●** | | | | | | | | | |
| UC-81 | Offrir un panier | | ○ | | | | | **●** | | | | |
| UC-90 | Signaler | | **●** | | ● | | ● | | | | | |
| UC-91 | Traiter un signalement | | | | | | | | | | **●** | ○ |
| UC-92 | Publier un contenu | | ● | | ● | | **●** | | | | | |

**●** acteur principal · ○ acteur secondaire · ⚙ selon la permission accordée

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
`A` + `OP` · *F0.3 · R-C13, R-C14*

**Le seul parcours du produit où un humain de JP décide.**

1. `A` déclare ne plus avoir accès à son adresse.
2. `SYS` présente un formulaire : prénom, dernière commande, montant
   approximatif, numéro de téléphone de livraison.
3. `SYS` enregistre la demande, attribue **un numéro de dossier dicible au
   téléphone**, et **gèle les retraits** si le compte porte un solde *(R-C14)*.
   → **`demande_recuperation`**, `portefeuille.retraits_geles`
4. `SYS` répond **202 dans tous les cas**, même si l'adresse est inconnue.
5. `OP` ouvre le dossier et **compare les déclarations à l'historique réel** du
   compte visé.
6. `OP` valide ; `SYS` envoie un code à la nouvelle adresse. → `code_otp`
7. `A` vérifie la nouvelle adresse ; `SYS` réattribue le compte, **dégèle les
   retraits**, journalise.
   → `utilisateur.email`, `portefeuille`, **`journal_audit`**

**Postconditions** — le compte a changé d'identifiant, **la décision est tracée
et motivée**.

---

## Paquetage 2 — Catalogue et vente

### UC-10 · Publier un article
`V` *(ou `VE` sans le prix)* · *F1.1 à F1.5 · R-G1, R-H4*

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

### UC-11 · Déposer une annonce de particulier
`A` → `P` · *F1.14, F1.15 · R-H5, R-H10*

> **Le parcours qui rend la vérification acceptable : on ne la demande qu'une
> fois qu'il y a de l'argent à recevoir.**

1. `A` choisit « Vendre un article que je ne porte plus ».
2. `SYS` crée un profil vendeur de type `particulier`, **sans exiger de nom de
   boutique**. → **`profil_vendeur`** *(`type_vendeur = particulier`)*
3. `A` remplit **quatre champs** et publie.
4. `SYS` met l'article en ligne : **stock 1, pièce unique**.
   → `article` *(`piece_unique = true`)*, `variante` *(`quantite_stock = 1`)*
5. Une acheteuse commande et paie. `SYS` **séquestre les fonds**. → `sequestre`
6. `SYS` notifie `P` : *« Vous avez été payée — vérifiez votre identité pour
   recevoir 38 000 Ar. »*
7. `P` effectue la vérification *(`UC-52`)*. `OP` valide.
8. `SYS` débloque l'encaissement ; les fonds suivent le parcours normal
   *(`UC-31`)*. → `profil_vendeur.statut_verification`

**Postconditions** — un particulier a vendu **sans monter un commerce**, et
**personne n'a pu disparaître avec l'argent**.

---

### UC-12 · Acheter un article hors direct
`A` / `AN` · *F1.16 à F1.20 · R-A3, R-H1, R-H3, RB7*

1. `A` ouvre une fiche article depuis le fil, la recherche, une vitrine ou **un
   lien partagé**.
2. `SYS` affiche : photos, prix, **tailles disponibles — les épuisées barrées,
   pas masquées** *(R-A3)*, état, **mesures comparées à son profil**, **délai
   d'expédition annoncé** *(F5.9)*, badge du vendeur, **et la carte Garantie
   JP**.
   → lit `article`, `variante`, `profil_vendeur`, `profil_acheteur`
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
> des réservations de l'utilisateur, groupées par vendeur.

1. `A` ajoute plusieurs articles, **de vendeurs différents**.
2. `SYS` **regroupe par vendeur** : les frais de livraison et l'expédition sont
   par vendeur. **Le panier ne se scinde jamais par univers** *(R-Y7)* — la même
   vendeuse tient souvent le vêtement et le cosmétique.
3. `SYS` calcule les remises éligibles et **n'en retient qu'une par ligne, la
   plus favorable** *(R-U7)*.
4. `SYS` affiche le récapitulatif : sous-total, **remise nommée**, frais par
   vendeur, total.
5. `SYS` propose *« Regrouper au même point relais et économiser X Ar »*.
6. `A` paie **une seule fois** *(`UC-30`)*.

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
6. Les acheteuses achètent *(`UC-21`)* ; `SYS` alimente **le panneau vendeur en
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
| **Le vendeur voit la commande tomber avec le prénom** | C'est ce qui rend le direct vivant |

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
`A` + `PSP` · *F4.1 à F4.11 · R-M2, R-G1, RB2, RB10*

1. `A` choisit son opérateur — **le sien est présélectionné**.
2. `SYS` crée un paiement avec une **clé d'idempotence** *(R-M2)*, **suspend le
   minuteur de réservation**, appelle `PSP`.
   → **`paiement`**, `reservation.suspendu_depuis`, `cle_idempotence`
3. `PSP` envoie une demande de validation sur le téléphone de `A`.
4. `SYS` affiche un écran d'attente **animé**, avec le temps écoulé et **la
   mention que la réservation est en pause** — sinon l'acheteuse croit perdre sa
   pièce.
5. `A` saisit son code sur son téléphone.
6. `PSP` confirme, **par rappel asynchrone et/ou par réponse synchrone** — les
   deux chemins doivent converger sans double effet.
7. **`[T]`** `SYS`, **en une seule transaction** : consomme la réservation,
   passe la commande en `PAYEE`, **crée le séquestre**, écrit les écritures
   financières, prélève la commission.
   → `reservation.statut = consommee` · `variante` · **`commande`** ·
   **`sequestre`** · **`ecriture_financiere`** · `portefeuille.solde_en_attente`
8. `SYS` émet la facture, notifie `A`, et notifie `V` **avec le montant net,
   commission affichée** *(R-G1)*.
   → **`facture`**, `notification`

**Postconditions** — les fonds sont **retenus**, la facture existe des deux
côtés, **le vendeur sait exactement ce qu'il recevra**.

| Échec | Traitement |
|---|---|
| Solde insuffisant | **Le motif réel** — « le paiement a échoué » ne dit pas s'il faut recharger ou réessayer |
| Aucune réponse de `PSP` | Le paiement passe en `EXPIRE` ; **la réservation reprend son minuteur là où il s'était arrêté** |
| **Rejeu de la même clé** | **Le résultat initial est renvoyé, sans nouveau prélèvement** *(RB10)* |
| Même clé, requête différente | Refus — `empreinte_requete` protège contre le pire cas |

---

### UC-31 · Confirmer la réception et libérer les fonds ★
`A` · *F4.5, F6.1 · R-E1, R-E6, R-R11*

> **C'est ici que la promesse du produit se réalise.**

1. `SYS` notifie `A` : *« Avez-vous bien reçu ? »*
2. `A` répond **« Oui, tout va bien »**.
3. **`[T]`** `SYS` libère le séquestre, écrit les écritures inverses, et fait
   passer le montant **du solde « Gardé pour la cliente » au solde « À vous —
   retirable »** *(R-E6)*.
   → **`sequestre`** *(`statut = libere`, `motif_liberation = confirmation`)* ·
   **`ecriture_financiere`** · `portefeuille` · `commande.statut = CONFIRMEE`
4. `SYS` invite `A` à laisser un avis et **fait entrer l'article dans son
   dressing**. → `piece_dressing`
5. `SYS` écrit au **journal des ventes confirmées** *(R-R11)*, qui alimentera le
   rang client. → **`vente_confirmee_journal`**

> **L'étape 5 doit exister dès la phase 1**, même si la fidélité n'est activée
> qu'en phase 2. Sans elle, il faudra reconstituer l'historique à la main — ou
> **effacer la fidélité des premières clientes, qui sont précisément les plus
> fidèles.**

**Trois autres chemins de libération** — tous tracés par
`sequestre.motif_liberation` :

| Motif | Déclencheur |
|---|---|
| `unboxing` | `A` a filmé l'ouverture *(`UC-61`)* — la confirmation est **implicite** |
| `automatique` | Délai écoulé sans réponse ni litige **(délai à trancher — voir §8)** |
| `arbitrage` | `OP` a tranché *(`UC-51`)* |

---

### UC-32 · Retirer son argent
`V` / `C` · *F4.9, F4.10 · R-E6, R-C14*

1. `V` ouvre « Mon argent » et voit **deux soldes distincts** :
   **« Gardé pour la cliente »** et **« À vous — retirable »** *(R-E6)*.
   → lit `portefeuille`
2. `V` saisit un montant et confirme.
3. `SYS` vérifie **le solde, la destination et l'absence de gel**, puis exécute
   le virement **avec une clé d'idempotence**.
   → **`retrait`**, `profil_vendeur.msisdn_mobile_money`
4. `SYS` écrit les écritures et émet un reçu. → **`ecriture_financiere`**

> **La destination ne peut être que le numéro mobile money vérifié.** Elle n'est
> pas saisissable au moment du retrait.
>
> **La distinction entre les deux soldes doit être limpide** — sinon la vendeuse
> croit qu'on la vole.

---

## Paquetage 5 — Livraison

### UC-40 · Préparer et expédier une commande
`V` / `VE` · *F5.1, F5.2 · R-H2*

1. `V` ouvre « À préparer » : **une file unique**, triée par échéance, **avec un
   marqueur d'origine** *(R-H2)*.
   → lit `commande`, `ligne_commande`
2. `V` ouvre le bordereau : articles, tailles, mode de livraison, destinataire,
   **montant à encaisser si espèces**, note de l'acheteuse.
3. `V` prépare le colis et marque « Prêt ».
   → **`colis`** *(`A_PREPARER` → `PRET`)*, **`evenement_livraison`**
4. `SYS` met le statut à jour **des deux côtés** et notifie `A`.

> **Une file unique, pas deux.** Deux files — « direct » et « catalogue » —
> signifieraient deux logistiques à tenir, **et le vendeur en oublierait une**.

---

### UC-41 · Livrer un colis à domicile ★
`L` · *F5.5, F5.6 · R-L6*

1. `L` ouvre sa tournée : **enlèvements d'abord, puis remises, dans l'ordre**.
   → lit `tournee`, `tournee_point`
2. `L` arrive chez le vendeur et enlève les colis **en une seule validation**
   *(F5.6)* — pas un balayage par colis.
   → `colis.statut = ENLEVE`, `evenement_livraison`
3. `L` arrive chez l'acheteuse et appuie sur « Arrivé ».
4. `L` produit **la preuve de remise** : photo du colis ou code de l'acheteuse.
   → `colis.preuve_remise_url`
5. Si paiement à la livraison, `L` saisit **le montant encaissé**.
   → `colis.montant_encaisse`, `collecte_especes`
6. `SYS` **enregistre localement, puis synchronise** : colis `REMIS`, événement
   **horodaté et attribué**, notification à `A` et à `V`, ouverture de la
   fenêtre de confirmation.
   → `colis`, **`evenement_livraison.auteur_id`**, `notification`

> **L'enregistrement local d'abord n'est pas un confort.** Un livreur sans
> réseau doit pouvoir remettre un colis. La synchronisation vient après.
>
> **`montant_encaisse` est distinct de `montant_a_encaisser` : l'écart est
> signalé, jamais absorbé silencieusement** *(F11.5)*.

---

### UC-42 · Recevoir et remettre un colis au point relais ★
`PR` · *F5.3, F5.4 · R-L6*

1. `PR` reçoit les colis du livreur **en une seule validation**.
   → `colis.statut = AU_RELAIS`, `point_relais.nb_colis_en_stock`
2. `SYS` génère un code à 6 chiffres, **le hache**, et l'envoie à `A` **par
   notification ET par SMS**.
   → **`colis.code_retrait`** *(haché)*, `notification`, `notification_sms`
3. `A` se présente **quand elle veut** et donne le code.
4. `PR` saisit le code ; `SYS` vérifie, **marque le code consommé**, passe le
   colis à `REMIS`.
   → `colis`, `evenement_livraison`
5. `SYS` notifie `A` et `V`, et ouvre la fenêtre de confirmation *(`UC-31`)*.

> **Le SMS est ici non négociable.** Une acheteuse arrivée au relais **sans
> réseau et sans son code repart sans son colis, alors qu'elle a payé.**
>
> **Le code est haché comme un mot de passe.** Les six chiffres ne sont en clair
> que dans la notification et le SMS.

| Échec | Traitement |
|---|---|
| Garde dépassée | `RETOUR_VENDEUR` après `point_relais.delai_garde_jours` |
| Relais saturé | `nb_colis_en_stock >= capacite_max` → le relais n'est plus proposé |

---

## Paquetage 6 — Confiance

### UC-50 · Ouvrir un litige ★
`A` *(ou `V`)* · *F6.3 · RB4*

> **On parle à JP, jamais au vendeur en face.** La confrontation directe est
> socialement coûteuse ici — c'est pour cela que les gens abandonnent au lieu de
> réclamer, et c'est ce qui rend le vrai chiffre invisible.

1. `A` ouvre sa commande et choisit **« Il y a un problème »**.
2. `A` choisit un motif — **filtré par univers** *(R-Y…)* — ajoute des photos et
   une description.
3. **`[T]`** `SYS` ouvre le dossier, **bloque les fonds**, **suspend la
   libération automatique**, attribue un numéro.
   → **`litige`**, **`sequestre`** *(la libération est gelée)*
4. `SYS` notifie `V`, qui voit le motif et les photos, et répond **dans le même
   fil**. → `message_litige`
5. `V` propose une solution : renvoi, remboursement partiel, geste commercial.
6. `A` accepte : **le dossier se clôt sans arbitrage** et la solution est
   exécutée. → `litige.statut = clos`, `retour` ou `remboursement`

**Si `A` refuse ou si `V` ne répond pas** → escalade en `arbitrage` *(`UC-51`)*.

---

### UC-51 · Arbitrer un litige ★
`OP` · *F6.4 · RB4*

1. `OP` ouvre la file, **triée par âge, urgences en tête**.
2. `OP` **s'attribue le dossier — affectation exclusive**, pour éviter le double
   traitement. → `litige.affecte_a_id`
3. `SYS` présente le dossier **assemblé** : commande, facture, photos, historique
   de livraison **avec l'auteur de chaque transition**, échanges, historique des
   deux parties.
4. `OP` tranche **et rédige un motif — obligatoire, refusé par la base sinon**.
   → **`litige.decision_texte`** + `decide_par_id`
5. `SYS` exécute : remboursement total, partiel, ou libération des fonds au
   vendeur. → `remboursement` ou `sequestre`, `ecriture_financiere`
6. `SYS` notifie **les deux parties avec la décision écrite**, archive, et met à
   jour les scores. → `notification`, `score_confiance`, `journal_audit`

```sql
CHECK (statut <> 'resolu'
   OR (decision_texte IS NOT NULL AND decide_par_id IS NOT NULL))
```

> **La clôture silencieuse est impossible — par contrainte de base, pas par
> convention d'équipe.**

---

### UC-52 · Vérifier l'identité d'un vendeur
`OP` · *F0.6, F0.7 · R-V2, R-V5, N3.1*

1. `OP` ouvre la file de vérification, **triée par ancienneté, avec le délai
   d'engagement affiché**.
2. `OP` compare **pièce, selfie et titulaire du compte mobile money** *(R-V2)* —
   **chaque point à cocher explicitement**, jamais une validation globale.
   → lit `document_identite` *(déchiffré à la lecture)*
3. `SYS` **journalise l'accès aux documents, nominativement** *(R-V5, N3.1)*.
   → **`journal_audit`**
4. `OP` valide. `SYS` **débloque l'encaissement** et attribue le badge.
   → `profil_vendeur.statut_verification`, `profil_vendeur` badge

> **L'étape 3 n'est pas une formalité.** Consulter la carte d'identité de
> quelqu'un doit laisser une trace nominative — c'est ce qui protège les
> vendeuses de l'équipe elle-même.

**En cas de refus** — motif écrit, et **possibilité de recommencer** avec les
pièces manquantes nommées.

---

## Paquetage 7 — Social et fidélité

### UC-60 · Suivre une boutique
`A` · *F7.1, F7.2 · R-Q1, R-Q2, R-Q5, R-Q6*

1. `A` appuie sur « Suivre » depuis une vitrine, une fiche, un direct, un clip
   ou une story — **un seul appui, aucune confirmation** *(R-Q1)*.
   → **`abonnement`**
2. `SYS` met à jour le compteur public *(dénormalisé, R-Q2)*.
   → `profil_vendeur.nb_abonnes`
3. Le fil « Abonnements » contient désormais **les directs, les nouveautés
   catalogue, les promotions et les événements** de cette boutique *(R-Q5)*.
4. `A` peut **couper les notifications de promotion de cette boutique sans se
   désabonner** *(R-Q6)*. → `abonnement.notifications_promo`

> **L'étape 4 protège les notifications utiles.** Un utilisateur qui coupe tout
> parce qu'un vendeur est bavard nous fait perdre *« colis arrivé »* et *« code
> de retrait »*.

---

### UC-61 · Publier un unboxing ★
`A` / `C` · *F14.x · R-K2, RB5, RB6*

> **Un geste, cinq résultats. Le pendant social exact du bouton « Je prends ».**

1. `SYS` notifie `A` à l'arrivée du colis : *« Filmez l'ouverture et gagnez X Ar
   de crédit. »*
2. `A` enregistre une vidéo de 30 s ; **l'article de sa commande est attaché
   automatiquement** *(R-K2)* — elle n'a rien à sélectionner.
3. `A` indique **si l'article taille bien** et met une note.
4. **`[T]`** `SYS`, **en une transaction** : confirme la réception *(donc
   **libère le séquestre**)*, crée le contenu **avec l'article attaché**,
   crédite la cagnotte.
   → **`sequestre`** *(`motif_liberation = unboxing`)* · **`contenu`** ·
   **`contenu_article`** · **`mouvement_cagnotte`**
5. `SYS`, **en asynchrone idempotent** : crée l'avis vérifié, notifie le
   vendeur, fait entrer l'article au dressing.
   → `avis`, `notification`, `piece_dressing`

**Les cinq résultats d'un seul geste :**

| Ce qu'elle fait | Ce que ça produit |
|---|---|
| Elle filme | Du contenu gratuit pour le fil |
| Elle publie | **La preuve publique que JP livre pour de vrai** |
| Elle valide la réception | **Les fonds sont libérés vers la vendeuse** |
| Elle dit si ça taille | Un avis vérifié |
| Elle poste | Du crédit dans sa cagnotte |

> **Personne n'est obligé de se filmer.** La confirmation en un appui reste
> toujours disponible *(`UC-31`)*. **C'est une possibilité récompensée, jamais
> une condition.**
>
> **Deux contraintes de base gardent ce parcours** : pas d'unboxing sans
> `commande_source_id`, et **aucun mineur ne publie de vidéo** *(RB6)*.
>
> **`mouvement_cagnotte.reference` porte un UK partiel** : un unboxing ne
> crédite **qu'une fois**, même si l'asynchrone est rejoué.

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
> **Le rang est par vendeur, et rien ne permet de le contourner** *(R-R1, D5)*.
>
> Il n'existe **volontairement aucun** index sur `utilisateur_id` seul dans
> `vente_confirmee_journal`, et **aucune vue** agrégeant une cliente tous
> vendeurs confondus. **Un contrôle d'autorisation se contourne par une nouvelle
> requête ; l'absence de chemin d'accès ne se contourne pas.**
>
> **Cette absence doit être documentée dans la migration**, sinon quelqu'un
> ajoutera l'index « pour optimiser ».

**`VE` peut voir cet écran si le vendeur l'y autorise — en lecture seule et
sans les montants** *(R-R8)*.

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
3. `SYS` affiche **le net qui restera au vendeur** sur un article représentatif,
   **commission déduite** *(R-U10)*.
4. `SYS` annonce **le nombre d'abonnés qui seront notifiés**, avec un
   interrupteur pour ne pas notifier.
5. `V` lance. `SYS` active la promotion, applique les prix barrés, déclenche le
   fan-out. → **`promotion`**, `promotion_article`
6. `NOT` applique, **pour chaque abonné** : réglage individuel, **plafond par
   vendeur et par 24 h**, seuil de regroupement *(R-U4)*.
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
`OP` *(portée JP)* ou `V` / `C` *(portée boutique)* · *F20.x · R-W4, R-W6 à R-W9*

1. `OP` renseigne nom, thème, dates, visuel, **couleur d'accent**, mot-dièse,
   présentation, règles de participation.
2. `SYS` génère un `slug` unique et enregistre en `brouillon`. → **`evenement`**
3. `OP` **annonce** l'événement — **action humaine, volontairement**.
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
3. `OP` examine et accepte. → `evenement_participation` *(`acceptee`)*
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

### UC-81 · Offrir un panier depuis l'étranger ★
`D` — **sans compte, sans application** · *F16.x · RB7, RB8*

> **Le premier canal de JP qui ne dépend pas du pouvoir d'achat local.**

1. `D` ouvre le lien **dans son navigateur, sans installer l'application**.
2. `SYS` détecte le pays, affiche le montant **en Ariary et une conversion
   indicative**, propose **la carte en premier**, et **annonce les frais de
   conversion à l'avance** *(RB7)*. → lit `taux_change`
3. `SYS` affiche les articles, le total, les frais, **le badge de vendeur
   vérifié**, et le mode de livraison **agrégé — sans quartier, sans repère,
   sans nom de relais, sans téléphone** *(RB8)*.
4. `D` laisse un message et paie.
   → **`paiement`** *(`payeur_utilisateur_id`, `payeur_pays`,
   `montant_devise_origine`)*
5. `SYS` crée la commande, **séquestre les fonds**, notifie `A` : *« Naina vous
   a offert votre panier »* avec le message.
   → `commande.donateur_ref`, **`sequestre`**
6. La commande suit **le parcours normal** *(`UC-40` à `UC-42`)*.
7. `D` suit la livraison **depuis son lien, sans compte**, et **voit la preuve de
   remise**.
8. À la réception, `A` publie son remerciement *(`UC-61`)* — **du contenu, donc
   de l'acquisition. La boucle se referme.**

> **L'étape 3 est la règle la plus importante de ce parcours.** Le donateur paie,
> il ne surveille pas. **Il ne doit jamais voir où habite la destinataire.**
>
> **Et l'étape 2 doit tenir une discipline** : envoyer de l'argent à Madagascar
> est **déjà gratuit et instantané** *(Taptap Send, 0 €, dépôt MVola en moins de
> 5 minutes)*. **Nous ne vendons ni le prix ni la vitesse — nous vendons de
> savoir ce que l'argent devient.**

---

## Paquetage 10 — Modération

### UC-90 · Signaler un contenu ou une personne
`A` / `C` / `V` · *F19.x · R-X4*

1. L'acteur fait **un appui long** et choisit « Signaler ».
2. L'acteur choisit un motif **dans une liste courte**.
3. `SYS` enregistre, attribue un numéro et **affiche le délai d'engagement**.
   → **`signalement`** *(avec `niveau = ordinaire | urgence`)*

> **Le geste doit être identique partout** — c'est pourquoi `FeuilleSignalement`
> est un composant partagé, présent à six emplacements.

---

### UC-91 · Traiter un signalement
`MO` · *F19.x · R-X4*

1. `MO` traite la file **par priorité, urgences en tête**.
   → IDX(`niveau`, `statut`, `cree_le`)
2. `MO` **s'attribue le dossier — affectation exclusive**.
3. `SYS` présente le contenu, **l'historique de l'auteur et ses signalements
   antérieurs, côte à côte** — un incident isolé et un comportement répété ne se
   traitent pas pareil.
4. `MO` retire, avertit, suspend ou classe — **avec un motif obligatoire**.
   → **`sanction`** *(`motif_texte` obligatoire)*, `contenu.statut`
5. `SYS` notifie **les deux parties** avec la décision écrite.

> **Un signalement de menace traité comme le reste est un échec du produit, pas
> un retard.**
>
> **Toute sanction est contestable, et la contestation est instruite par une
> autre personne que celle qui a sanctionné.**
> → `sanction.resultat_contestation`

---

# 8. Ce que ces workflows laissent ouvert

Les décisions que le déroulé des parcours ne suffit pas à trancher, et qui
doivent l'être **avant** le développement du parcours concerné.

| # | Question | Parcours bloqué | Élément de décision |
|---|---|---|---|
| **1** | **Quel délai de libération automatique des fonds ?** | `UC-31` | Deux précédents : **Poshmark libère à J+3** après livraison sans litige ; **Shopee garde une fenêtre de litige de 15 jours**. Les deux ne sont pas contradictoires |
| **2** | **Le paiement à la livraison est-il ouvert, et à quelles conditions ?** | `UC-30`, `UC-41` | **Sans séquestre, la protection du vendeur disparaît.** À mesurer dès le premier jour : le taux de refus à la livraison décidera du maintien de l'option |
| **3** | **Quelle durée de réservation, par origine ?** | `UC-12`, `UC-21` | Paramétrable *(`parametre`)*, avec **bornes min/max codées** — une durée à 0 s doit être impossible à saisir |
| **4** | **Quand les fonds d'une précommande sont-ils libérés à la créatrice ?** | `F15.8` | `precommande.avance_liberee`. **Le remboursement automatique si le seuil n'est pas atteint est non négociable** *(RB3)* : sans lui, la précommande reproduirait l'arnaque que JP combat |
| **5** | **`remise_ligne` : table ou colonne scalaire ?** | `UC-13`, `UC-70` | ⚠️ **Contradiction ouverte entre `D4` et la migration 17.** **En l'état, la garantie de non-cumul n'est pas démontrable** — voir `JP_DICTIONNAIRE_DONNEES.md` §17.1 |
| **6** | **Qui supporte la commission d'affiliation ?** | `UC-92`, `F15.5` | Le vendeur, JP, ou partagée — change le calcul de `ligne_commande.commission_createur` |
| **7** | **Quel crédit pour un unboxing ?** | `UC-61` | `mouvement_cagnotte`. Trop bas : personne ne filme. Trop haut : on achète du contenu plus cher que de la publicité |
| **8** | **Le schéma de `panier_cadeau` et de `demande_verification`** | `UC-80`, `UC-81`, `UC-52` | **Deux tables citées dans les migrations sans définition de colonnes** |

---

*Documents liés : [`JP_DICTIONNAIRE_DONNEES.md`](JP_DICTIONNAIRE_DONNEES.md) —
les tables · [`JP_CAS_UTILISATION.md`](JP_CAS_UTILISATION.md) — les scénarios
alternatifs et les 30 diagrammes de séquence ·
[`JP_CAHIER_DES_CHARGES.md`](JP_CAHIER_DES_CHARGES.md) — les 180 règles `R-xx`*
