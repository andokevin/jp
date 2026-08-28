# JP — User stories des évolutions produit

| | |
|---|---|
| **Objet** | Les 30 fonctionnalités nouvelles ou refondues de la vague « auth, vente hors direct, social, fidélisation, promotions, événements » |
| **Public** | Équipe produit et développement |
| **Version** | 1.0 · Août 2026 |
| **Amont** | `JP_BACKLOG.md` (`Fxx.y`) · `JP_CAHIER_DES_CHARGES.md` (règles `R-xx`) · `JP_CDC_TECHNIQUE.md` |

> Chaque story est **testable**. Les critères d'acceptation sont écrits en *Étant donné / Quand / Alors*, et **chaque story porte au moins un cas d'échec** — c'est là que se jouent les vraies décisions de conception, pas dans le chemin heureux.
>
> Les stories reprennent les personas du backlog : **A** acheteuse · **AN** visiteuse non inscrite · **V** vendeur · **VE** employé du vendeur · **C** créatrice · **P** vendeur particulier · **OP** équipe JP · **L** livreur · **PR** point relais.

---

## Correspondance épics → fonctionnalités

| Épic | Stories | Fonctionnalités du backlog | Phase |
|---|---|---|---|
| **1. Auth** | US-AUTH-01 → 08 | F0.1, F0.3, F0.13, F0.14, F0.15, F0.16 | P1 |
| **2. Vente (hors live)** | US-VENTE-01 → 09 | F1.15, F1.16, F1.17, F1.18, F1.19, F1.20, F3.14 | P1 (F1.17, F1.20 selon décisions) |
| **3. Social / Followers** | US-SOCIAL-01 → 05 | F7.1, F7.15, F7.16, F7.17 | P1 · F7.16 en P2 |
| **4. Fidélisation client** | US-FID-01 → 06 | F7.5, F7.6, F7.18, F7.19 | P2 |
| **5. Promotions** | US-PROMO-01 → 08 | F7.8, F7.9, F7.22, F7.23, F7.24, F7.25, F7.26, F3.15 | P1 : F7.22, F7.23, F7.26, F3.15 |
| **6. Événements** | US-EVT-01 → 09 | F20.1 → F20.9 | P2 |

**Ordre de réalisation conseillé** : Auth → Vente hors live → Social → Promotions → Fidélisation → Événements. Les promotions passent avant la fidélisation parce que la promotion générale ne dépend que des abonnements, alors que la promotion ciblée dépend du rang, qui dépend d'un historique d'achats qui n'existe pas encore.

---

# ÉPIC 1 — Authentification par email (OTP)

**Enjeu** : rendre le compte indépendant de la carte SIM et supprimer le coût du SMS à l'inscription. Le SMS n'est plus dépensé qu'à un seul endroit, là où il est irremplaçable : le code de retrait d'un colis.

### US-AUTH-01 · F0.1 · P1 / M — Créer un compte avec un code reçu par email

> **En tant qu'**acheteuse sans compte,
> **je veux** recevoir un code à 6 chiffres sur mon adresse email,
> **afin de** créer mon compte sans avoir à retenir un mot de passe.

**Critères d'acceptation**
1. Étant donné l'écran d'accueil, quand je saisis une adresse email valide et j'appuie sur « Continuer », alors un code à 6 chiffres m'est envoyé et j'arrive sur l'écran de saisie du code.
2. Étant donné l'écran de saisie, quand je saisis le bon code dans les 10 minutes, alors une session est ouverte et je suis redirigée vers le choix de mon prénom puis vers le fil.
3. Étant donné que je possède déjà un compte avec cette adresse, quand je saisis le bon code, alors je suis connectée à mon compte existant — **aucun compte en double n'est créé**.
4. Étant donné un code expiré (au-delà de 10 minutes), quand je le saisis, alors un message m'indique qu'il a expiré et me propose d'en demander un nouveau ; **le code expiré n'ouvre jamais de session**.
5. Étant donné une adresse email syntaxiquement invalide, quand j'appuie sur « Continuer », alors l'erreur est affichée sous le champ **avant** tout appel réseau.
6. **Cas d'échec** : étant donné que je saisis 5 codes faux d'affilée, quand je tente le sixième, alors le code en cours est invalidé et je dois en demander un nouveau.
7. Étant donné un code valide, quand il a déjà servi une fois, alors une seconde utilisation est refusée.

**Dépendances** F0.2 (session) · **Règles** R-C1, R-C4, R-C5, R-C6 · **Écrans** Accueil, Saisie du code, Choix du prénom

---

### US-AUTH-02 · F0.1 · P1 / M — Saisir le code sans effort

> **En tant qu'**acheteuse sur un téléphone d'entrée de gamme,
> **je veux** que la saisie du code demande le moins de gestes possible,
> **afin de** ne pas abandonner entre ma boîte mail et l'application.

**Critères d'acceptation**
1. Étant donné que j'ai copié le code depuis ma boîte mail, quand je revins dans l'application, alors le champ propose le collage automatique du code détecté dans le presse-papier.
2. Étant donné les 6 cases de saisie, quand je saisis le sixième chiffre, alors la vérification part **automatiquement**, sans bouton à appuyer.
3. Étant donné une connexion lente, quand la vérification est en cours, alors un état de chargement explicite est affiché et le bouton ne peut pas être appuyé deux fois.
4. **Cas d'échec** : étant donné que la requête échoue pour cause de réseau, quand l'erreur survient, alors le code saisi **reste affiché** et un bouton « Réessayer » est proposé — je ne dois pas retaper le code.

**Dépendances** US-AUTH-01 · **Règles** R-C5 · **Écrans** Saisie du code

---

### US-AUTH-03 · F0.14 · P1 / M — Renvoyer un code sans se faire bloquer

> **En tant qu'**acheteuse qui n'a pas reçu son code,
> **je veux** pouvoir en redemander un et comprendre ce qui se passe,
> **afin de** ne pas rester coincée à l'entrée de l'application.

**Critères d'acceptation**
1. Étant donné l'écran de saisie du code, quand 30 secondes se sont écoulées, alors le bouton « Renvoyer le code » devient actif avec un décompte visible avant cela.
2. Étant donné que j'ai demandé 2 renvois, quand j'atteins le troisième, alors un message me suggère de vérifier mes spams et me propose de changer d'adresse email.
3. Étant donné que j'ai demandé 5 codes dans l'heure, quand j'en demande un sixième, alors le refus est affiché **avec le délai d'attente restant en clair** (« Réessayez dans 4 minutes »).
4. Étant donné qu'un nouveau code est émis, quand je saisis le code précédent, alors il est refusé : **un seul code est valide à la fois**.
5. **Cas d'échec** : étant donné que le service d'envoi d'email est indisponible, quand je demande un code, alors un message d'erreur distinct de « code invalide » est affiché et l'incident est journalisé côté serveur.

**Dépendances** US-AUTH-01 · **Règles** R-C7, R-C8 · **Écrans** Saisie du code

---

### US-AUTH-04 · F0.14 · P1 / M — Ne pas révéler qui a un compte

> **En tant que** responsable du produit,
> **je veux** que l'écran de connexion ne permette pas de savoir si une adresse a un compte,
> **afin de** ne pas offrir un outil d'énumération des utilisatrices.

**Critères d'acceptation**
1. Étant donné une adresse inconnue et une adresse connue, quand je demande un code pour chacune, alors **la réponse de l'API, le message affiché et le temps de réponse sont indiscernables**.
2. Étant donné une demande de code, quand elle aboutit, alors le message est neutre : « Si un compte existe, un code vient d'être envoyé » — ou un parcours unifié inscription/connexion qui ne distingue pas les deux cas.
3. Étant donné les journaux serveur, quand j'inspecte une demande de code, alors l'adresse email n'apparaît **jamais en clair** dans les journaux applicatifs.
4. **Cas d'échec** : étant donné 50 demandes depuis la même IP en 10 minutes, quand la 51e arrive, alors elle est refusée au niveau de l'IP et l'anomalie est visible dans le back-office.

**Dépendances** US-AUTH-03 · **Règles** R-C9, R-C10, N3.x · **Écrans** Accueil, Back-office → anomalies

---

### US-AUTH-05 · F0.13 · P1 / S — Se connecter avec Google

> **En tant qu'**acheteuse pressée,
> **je veux** entrer avec mon compte Google,
> **afin de** ne pas attendre un email.

**Critères d'acceptation**
1. Étant donné l'écran d'accueil, quand j'appuie sur « Continuer avec Google » et choisis un compte, alors je suis connectée sans code.
2. Étant donné que l'adresse Google correspond à un compte JP existant, quand je me connecte, alors **les deux identités sont rattachées au même compte** — aucun doublon, mon historique de commandes est intact.
3. Étant donné un compte Google dont l'email n'est pas marqué comme vérifié par le fournisseur, quand je tente la connexion, alors elle est refusée et le parcours par code m'est proposé.
4. **Cas d'échec** : étant donné que j'annule le sélecteur de compte Google, quand je reviens dans l'application, alors je retrouve l'écran d'accueil intact, sans erreur bloquante.
5. Étant donné mon compte connecté par Google, quand je consulte mes réglages, alors je vois quelles méthodes de connexion sont actives et je peux en ajouter une.

**Dépendances** US-AUTH-01 · **Règles** R-C11, R-C12 · **Écrans** Accueil, Réglages → Connexion

---

### US-AUTH-06 · F0.15 · P1 / S — Changer d'adresse email en sécurité

> **En tant que** vendeuse avec de l'argent sur mon portefeuille,
> **je veux** que changer mon email demande une double vérification,
> **afin que** personne ne puisse détourner mon compte et mes retraits.

**Critères d'acceptation**
1. Étant donné mes réglages, quand je demande un changement d'email, alors un code est envoyé à **l'ancienne** adresse pour autoriser l'opération.
2. Étant donné l'ancienne adresse vérifiée, quand je saisis la nouvelle, alors un second code y est envoyé et la bascule n'a lieu qu'après sa validation.
3. Étant donné que la bascule est effectuée, quand elle aboutit, alors un email d'information est envoyé à **l'ancienne** adresse, avec un moyen de signaler un changement non désiré.
4. Étant donné un changement d'email, quand il aboutit, alors l'opération est inscrite au **journal d'audit** avec horodatage et adresse IP.
5. **Cas d'échec** : étant donné que la nouvelle adresse est déjà utilisée par un autre compte, quand je la soumets, alors l'opération est refusée avec un message qui **ne révèle pas** l'existence de l'autre compte.
6. Étant donné que je n'ai plus accès à mon ancienne adresse, quand j'engage le changement, alors je suis orientée vers la récupération assistée (US-AUTH-07).

**Dépendances** US-AUTH-01 · **Règles** R-C13 · **Écrans** Réglages → Mon email

---

### US-AUTH-07 · F0.3 · P1 / S — Récupérer un compte dont j'ai perdu la boîte mail

> **En tant qu'**acheteuse qui n'a plus accès à son adresse email,
> **je veux** prouver autrement que le compte est le mien,
> **afin de** ne pas perdre mon historique, ma cagnotte et mes commandes en cours.

**Critères d'acceptation**
1. Étant donné l'écran de connexion, quand j'indique ne plus avoir accès à mon email, alors un formulaire me demande prénom, dernière commande, montant approximatif et numéro de téléphone de livraison.
2. Étant donné ma demande envoyée, quand elle est enregistrée, alors je reçois un numéro de dossier et l'engagement d'une réponse sous 24 h.
3. Étant donné la file « récupérations », quand **OP** ouvre ma demande, alors il voit l'historique de commandes du compte visé pour comparer, et sa décision est tracée.
4. Étant donné une demande validée, quand OP réattribue le compte, alors la nouvelle adresse est vérifiée par code avant l'ouverture de session.
5. **Cas d'échec** : étant donné une demande refusée, quand OP la classe, alors je reçois un motif écrit, et **le compte reste inchangé**.
6. Étant donné un compte avec un solde vendeur disponible, quand une récupération est demandée, alors les retraits sont **gelés** jusqu'à la décision.

**Dépendances** US-AUTH-01, F0.6 · **Règles** R-C14 · **Écrans** Formulaire de récupération, Back-office → Récupérations

---

### US-AUTH-08 · F0.16 · P1 / S — Donner mon numéro au moment utile

> **En tant qu'**acheteuse,
> **je veux** ne renseigner mon numéro de téléphone qu'au moment de ma première livraison,
> **afin de** ne pas être arrêtée par une vérification SMS dès l'inscription.

**Critères d'acceptation**
1. Étant donné mon inscription, quand elle se termine, alors **aucun numéro de téléphone ne m'a été demandé**.
2. Étant donné ma première commande en livraison à domicile, quand je choisis l'adresse, alors le numéro du destinataire est demandé et vérifié par un code SMS.
3. Étant donné une livraison en point relais, quand je valide ma commande, alors le numéro est demandé car le code de retrait est envoyé par SMS (`F5.4`).
4. Étant donné mon numéro vérifié, quand je passe une commande suivante, alors il est pré-rempli et n'est plus re-vérifié.
5. **Cas d'échec** : étant donné que le SMS de vérification n'arrive pas, quand j'attends plus de 60 s, alors je peux **poursuivre ma commande** avec un numéro non vérifié, signalé comme tel au livreur. Bloquer un paiement sur un SMS non reçu est le pire des compromis.

**Dépendances** US-AUTH-01, F3.3, F5.4 · **Règles** R-C15, R-C16 · **Écrans** Choix de livraison, Vérification du numéro

---

# ÉPIC 2 — Vente hors live (mode Vinted)

**Enjeu** : le vendeur vend 30 jours sur 30, plus seulement les quatre soirs où il passe en direct. Et l'application a une raison d'être ouverte à 10 h du matin.

### US-VENTE-01 · F1.15 · P1 / M — Acheter directement depuis une fiche article

> **En tant qu'**acheteuse qui navigue hors direct,
> **je veux** acheter un article immédiatement depuis sa fiche,
> **afin de** ne pas attendre le prochain direct du vendeur.

**Critères d'acceptation**
1. Étant donné une fiche article en ligne avec du stock disponible, quand j'appuie sur « Je prends », alors la même feuille que le direct s'ouvre (taille, quantité, livraison) et **le total avec frais de livraison est affiché avant le paiement**.
2. Étant donné ma sélection validée, quand j'appuie sur « Payer », alors une réservation est posée, une commande est créée et le parcours de paiement est **identique** à celui du direct.
3. Étant donné une commande née d'une fiche, quand elle est créée, alors son origine est enregistrée (`catalogue`) et elle suit exactement la même machine à états qu'une commande de direct.
4. Étant donné un article `pièce unique`, quand j'appuie sur « Je prends », alors la quantité n'est pas demandée.
5. **Cas d'échec — course au stock** : étant donné que la dernière pièce est prise pendant que je choisis ma taille, quand je valide, alors je reçois immédiatement « Désolé, le dernier vient de partir » et la proposition « Prévenez-moi si ça revient » (`F7.4`). **Aucune survente n'est possible.**
6. Étant donné un article dont le vendeur n'est pas vérifié, quand j'ouvre la fiche, alors l'absence de badge est visible et le paiement reste possible **uniquement si l'encaissement du vendeur est autorisé** (`F0.6`).
7. Étant donné une fiche article, quand je l'ouvre, alors le **délai d'expédition annoncé** est affiché avant le bouton d'achat (`F5.9`).

**Dépendances** F1.1, F1.10, F3.7, F4.1 · **Règles** R-H1, R-H2 · **Écrans** Fiche article, Feuille « Je prends », Paiement

---

### US-VENTE-02 · F1.16 · P1 / M — Remplir un panier au fil de ma navigation

> **En tant qu'**acheteuse,
> **je veux** ajouter au panier depuis le catalogue et payer plus tard en une fois,
> **afin de** grouper mes achats et mes frais de livraison.

**Critères d'acceptation**
1. Étant donné une fiche article, quand j'appuie sur « Ajouter au panier », alors l'article est réservé pour la **durée catalogue** paramétrée (hypothèse 30 min) et un minuteur est visible dans le panier.
2. Étant donné plusieurs articles de vendeurs différents, quand j'ouvre mon panier, alors les lignes sont **regroupées par vendeur** avec les frais de livraison par vendeur et un total général (`F3.1`).
3. Étant donné une réservation catalogue, quand elle expire, alors l'article revient au stock, je reçois **une seule** notification, et un bouton « Reprendre » m'est proposé si le stock est encore disponible.
4. Étant donné un panier contenant un article dont la réservation a expiré, quand j'ouvre le panier, alors la ligne est signalée comme expirée **avant** que je tente de payer.
5. **Cas d'échec** : étant donné que je paie au moment exact où une réservation expire, quand le paiement part, alors soit la réservation est prolongée par le paiement en cours, soit le paiement est refusé avec un message clair — **jamais un paiement encaissé sans stock**.
6. Étant donné la durée de réservation, quand OP la modifie dans les paramètres (`F11.6`), alors la nouvelle valeur s'applique aux réservations suivantes, pas aux réservations en cours.

**Dépendances** US-VENTE-01, F1.10, F3.1, F11.6 · **Règles** R-H3, R-S2 · **Écrans** Fiche article, Panier

---

### US-VENTE-03 · F1.18 · P1 / M — Décrire un article vendu sans démonstration vidéo

> **En tant que** vendeur,
> **je veux** décrire l'état et les mesures réelles de mon article,
> **afin que** l'acheteuse achète sans me poser la question et ne me le retourne pas.

**Critères d'acceptation**
1. Étant donné le formulaire de création d'article, quand je le remplis, alors je peux renseigner **l'état** (neuf avec étiquette / très bon / bon / correct), les **mesures réelles** (épaules, poitrine, taille, longueur) et jusqu'à 8 photos.
2. Étant donné un article destiné à la vente hors direct, quand je le publie avec moins de 3 photos, alors un avertissement non bloquant m'explique l'effet sur les ventes.
3. Étant donné un article avec des mesures renseignées, quand il apparaît dans une liste, alors il porte un marqueur « mesuré » et bénéficie d'un bonus dans le tri par pertinence.
4. Étant donné une fiche avec mesures, quand l'acheteuse l'ouvre et que son profil contient ses tailles (`F0.5`), alors une comparaison lui est proposée (« votre tour de taille : 74 cm »).
5. **Cas d'échec** : étant donné des mesures incohérentes (longueur de 5 cm, tour de poitrine de 300 cm), quand je valide, alors les valeurs hors bornes sont refusées avec un message explicite.
6. Étant donné un article, quand les mesures ne sont pas renseignées, alors la publication reste possible : **on incite, on n'interdit pas**.

**Dépendances** F1.1, F0.5 · **Règles** R-H4 · **Écrans** Création d'article, Fiche article

---

### US-VENTE-04 · F1.17 · P1 / S — Vendre un vêtement quand je ne suis pas une boutique

> **En tant que** particulière qui veut liquider son dressing,
> **je veux** déposer une annonce en quelques champs sans créer de boutique,
> **afin de** vendre trois robes sans monter un commerce.

**Critères d'acceptation**
1. Étant donné mon compte acheteuse, quand j'appuie sur « Vendre un article que je ne porte plus », alors un formulaire de **4 champs** m'est proposé : photos, prix, taille, état.
2. Étant donné le dépôt validé, quand l'annonce est publiée, alors le stock est à 1, l'article est marqué `pièce unique`, et **aucun nom de boutique ni KYC ne m'a été demandé**.
3. Étant donné que je reçois une commande, quand je veux **encaisser**, alors la vérification d'identité (`F0.6`) est exigée à ce moment-là, expliquée par une phrase claire sur la raison.
4. Étant donné une annonce de particulier, quand une acheteuse l'ouvre, alors elle voit un **badge « Particulier »** distinct du badge boutique, et la même protection (séquestre, litige) est annoncée.
5. Étant donné que j'atteins le seuil de bascule (paramètre `F11.6`), quand je dépose une nouvelle annonce, alors je suis invitée à passer en vendeur professionnel, avec l'explication de ce qui change.
6. **Cas d'échec** : étant donné que je refuse la vérification alors qu'une commande est payée, quand le délai s'écoule, alors la commande est **annulée et intégralement remboursée** à l'acheteuse, et mon compte ne peut plus recevoir de commandes tant que la vérification n'est pas faite.
7. Étant donné mon dressing virtuel (`F17.10`), quand j'y sélectionne une pièce, alors je peux la mettre en vente sans re-photographier.

**Dépendances** F0.4, F0.6, F1.14 · **Règles** R-H5, R-H6 · **Écrans** Dépôt d'annonce, Vérification, Fiche article

---

### US-VENTE-05 · F1.19 · P1 / M — Une vitrine qui vend même quand je ne suis pas en direct

> **En tant que** vendeur,
> **je veux** que ma vitrine soit vendeuse en permanence,
> **afin de** ne pas dépendre de mes soirées de direct pour faire du chiffre.

**Critères d'acceptation**
1. Étant donné ma vitrine hors direct, quand une acheteuse l'ouvre, alors elle voit mon catalogue achetable, mes promotions en cours, les événements auxquels je participe et mon prochain rendez-vous.
2. Étant donné que je suis en direct, quand une acheteuse ouvre ma vitrine, alors un bandeau « En direct maintenant » apparaît en tête, sans masquer le catalogue.
3. Étant donné une vitrine, quand elle est ouverte sans compte (`F0.10`), alors tout le catalogue est consultable et l'inscription n'est déclenchée qu'au « Je prends ».
4. Étant donné mon tableau de bord, quand je consulte mes ventes, alors le chiffre d'affaires est ventilé **par origine** (direct / catalogue / clip / événement).
5. **Cas d'échec** : étant donné une vitrine sans aucun article en ligne, quand elle est ouverte, alors un état vide utile est affiché (prochain direct, ou invitation à suivre la boutique) — jamais une page blanche.

**Dépendances** F1.11, F0.10, F9.1 · **Règles** R-H7 · **Écrans** Vitrine vendeur, Tableau de bord vendeur

---

### US-VENTE-06 · F3.14 · P1 / M — Une commande hors direct traitée comme les autres

> **En tant que** vendeur,
> **je veux** retrouver mes commandes de catalogue et de direct dans une seule file,
> **afin de** ne pas gérer deux logistiques.

**Critères d'acceptation**
1. Étant donné mes commandes, quand j'ouvre « À préparer », alors les commandes des deux origines apparaissent dans la même liste, avec un marqueur d'origine.
2. Étant donné une commande de catalogue, quand elle progresse, alors elle emprunte **la même machine à états** que celle du direct : payée → en préparation → expédiée → livrée → confirmée.
3. Étant donné une commande de catalogue, quand un litige est ouvert, alors le parcours de litige est identique (`F6.3`).
4. Étant donné le délai d'acceptation, quand la commande vient du catalogue, alors le délai accordé au vendeur est **plus long** qu'en direct (paramètre distinct) car il n'est pas devant son téléphone.
5. **Cas d'échec** : étant donné que le vendeur ne réagit pas dans le délai, quand celui-ci expire, alors l'acheteuse est notifiée, sa réservation est protégée, et l'absence de réaction pèse sur le score de confiance (`F6.2`).
6. Étant donné le tableau de bord OP, quand je consulte les indicateurs, alors le taux de conversion et le délai d'expédition sont comparables **par origine**.

**Dépendances** US-VENTE-01, F3.7, F6.3, F11.7 · **Règles** R-H1, R-H8 · **Écrans** Commandes vendeur, Back-office → Indicateurs

---

### US-VENTE-07 · F1.20 · P2 / S — Poser une question sous une fiche

> **En tant qu'**acheteuse hésitante,
> **je veux** poser une question publique sur un article,
> **afin de** décider sans passer par Messenger.

**Critères d'acceptation**
1. Étant donné une fiche article, quand j'écris une question, alors elle est publiée sous la fiche et le vendeur est notifié.
2. Étant donné une question, quand le vendeur répond, alors la réponse est **publique** et visible de toutes les acheteuses suivantes.
3. Étant donné une question, quand elle contient un contenu filtré (`F19.1`), alors elle est masquée avant publication.
4. Étant donné une fiche avec des questions, quand je l'ouvre, alors les 3 questions les plus utiles sont visibles sans dépliage.
5. **Cas d'échec** : étant donné une question contenant un numéro de téléphone ou une invitation à sortir de la plateforme, quand elle est soumise, alors elle est bloquée avec un message expliquant pourquoi.

**Dépendances** F19.1, F1.1 · **Règles** R-H9 · **Écrans** Fiche article

---

### US-VENTE-08 · F1.15 · P1 / M — Acheter hors direct sans compte, puis s'inscrire

> **En tant que** visiteuse arrivée par un lien WhatsApp,
> **je veux** pouvoir décider d'acheter avant de créer un compte,
> **afin de** ne pas m'engager pour rien.

**Critères d'acceptation**
1. Étant donné un lien d'article partagé, quand je l'ouvre sans compte, alors je vois photos, prix, tailles, état, mesures, badge du vendeur et frais de livraison estimés.
2. Étant donné que j'appuie sur « Je prends », quand l'inscription se déclenche, alors **la réservation est déjà posée** et conservée pendant l'inscription (US-AUTH-01).
3. Étant donné mon inscription terminée, quand j'y reviens, alors je reprends exactement à l'étape où je m'étais arrêtée, sans re-choisir l'article.
4. **Cas d'échec** : étant donné que l'article part pendant mon inscription malgré la réservation (annulation vendeur, retrait), quand je reviens, alors le motif m'est expliqué et une alternative m'est proposée.

**Dépendances** US-AUTH-01, US-VENTE-01, F0.10 · **Règles** R-H2, R-C4 · **Écrans** Fiche article (invité), Inscription express

---

### US-VENTE-09 · F1.15 · P1 / M — Ne jamais survendre, quel que soit le canal

> **En tant que** responsable produit,
> **je veux** que le stock soit intègre que la vente vienne du direct ou du catalogue,
> **afin que** la survente reste impossible.

**Critères d'acceptation**
1. Étant donné une variante avec 1 pièce disponible, quand deux acheteuses appuient sur « Je prends » à la même milliseconde — une en direct, une sur le catalogue — alors **une seule** réservation est acceptée.
2. Étant donné la seconde acheteuse, quand sa demande est refusée, alors elle est placée en file d'attente (`F2.7`) et notifiée si la première réservation expire.
3. Étant donné une réservation catalogue et une réservation direct sur la même variante, quand on additionne les quantités réservées, alors la somme n'excède **jamais** le stock physique.
4. Étant donné la contrainte en base, quand un bogue applicatif tenterait de dépasser le stock, alors la base **refuse** l'écriture.
5. **Cas d'échec** : étant donné une perte de connexion WebSocket pendant un direct, quand le client se reconnecte, alors il **resynchronise** le stock auprès du serveur et n'extrapole jamais.

**Dépendances** F1.10, F2.7, RB1 · **Règles** R-S1, R-S2, R-H1 · **Écrans** —  (recette technique)

---

# ÉPIC 3 — Social / Followers

**Enjeu** : l'abonnement est l'actif que le vendeur construit. C'est aussi le canal qui rend les promotions et les événements possibles sans acheter de publicité.

### US-SOCIAL-01 · F7.1 · P1 / M — Suivre une boutique en un appui

> **En tant qu'**acheteuse,
> **je veux** suivre une boutique depuis n'importe où,
> **afin de** ne pas rater ses nouveautés et ses directs.

**Critères d'acceptation**
1. Étant donné une vitrine, une fiche article, un direct, un clip ou une story, quand j'appuie sur « Suivre », alors l'abonnement est enregistré **immédiatement**, sans écran de confirmation.
2. Étant donné un abonnement, quand j'appuie de nouveau, alors je me désabonne et le compteur du vendeur décroît.
3. Étant donné que je ne suis pas connectée, quand j'appuie sur « Suivre », alors l'inscription est déclenchée et l'abonnement est posé après connexion.
4. Étant donné une action de suivi, quand le réseau est coupé, alors l'état s'affiche localement et la synchronisation se fait à la reconnexion, sans double abonnement.
5. **Cas d'échec** : étant donné un vendeur suspendu (`F6.8`), quand j'ouvre sa vitrine, alors le bouton « Suivre » est indisponible et l'état est expliqué.

**Dépendances** F0.1 · **Règles** R-Q1 · **Écrans** Vitrine, Fiche, Direct, Clip, Story

---

### US-SOCIAL-02 · F7.15 · P1 / S — Voir et gérer mes abonnements

> **En tant qu'**acheteuse qui suit une quinzaine de boutiques,
> **je veux** une liste de mes abonnements avec un réglage par boutique,
> **afin de** garder mes notifications utiles sans tout couper.

**Critères d'acceptation**
1. Étant donné « Moi → Abonnements », quand j'ouvre l'écran, alors je vois mes boutiques et créatrices suivies, triables par activité récente.
2. Étant donné une ligne d'abonnement, quand je l'ouvre, alors je peux couper **les notifications de promotion** de cette boutique **sans me désabonner**.
3. Étant donné une vitrine, quand je l'ouvre, alors le nombre d'abonnés du vendeur est affiché.
4. Étant donné un compteur d'abonnés, quand un abonnement est créé ou supprimé, alors le compteur affiché est cohérent à la seconde près sans recalcul complet.
5. **Cas d'échec** : étant donné aucun abonnement, quand j'ouvre l'écran, alors un état vide propose des boutiques à découvrir plutôt qu'une liste blanche.

**Dépendances** US-SOCIAL-01 · **Règles** R-Q2, R-Q5 · **Écrans** Moi → Abonnements, Vitrine

---

### US-SOCIAL-03 · F7.15 · P1 / S — Voir mes abonnés côté vendeur

> **En tant que** vendeur,
> **je veux** voir mes abonnés et la progression de leur nombre,
> **afin de** mesurer ce que je construis réellement sur la plateforme.

**Critères d'acceptation**
1. Étant donné mon tableau de bord, quand je l'ouvre, alors je vois mon nombre d'abonnés et sa **progression sur 30 jours**.
2. Étant donné ma liste d'abonnés, quand je l'ouvre, alors je vois prénom, photo et date d'abonnement — **jamais l'email ni le téléphone**.
3. Étant donné un abonné qui est aussi client, quand j'ouvre sa ligne, alors j'accède à sa fiche client (`F7.5`) si la fidélisation est activée.
4. **Cas d'échec** : étant donné qu'un abonné a supprimé son compte, quand j'ouvre ma liste, alors la ligne a disparu et le compteur est à jour.

**Dépendances** US-SOCIAL-01, F7.5 · **Règles** R-Q3, R-Q4 · **Écrans** Tableau de bord vendeur, Mes abonnés

---

### US-SOCIAL-04 · F7.16 · P2 / C — Être prévenu d'un nouvel abonné

> **En tant que** vendeuse ou créatrice,
> **je veux** savoir quand quelqu'un me suit,
> **afin de** mesurer l'effet de ce que je publie.

**Critères d'acceptation**
1. Étant donné un nouvel abonné, quand l'abonnement est créé, alors je reçois une notification « [Prénom] vous suit ».
2. Étant donné plus de 5 nouveaux abonnés dans la journée, quand ils arrivent, alors les notifications sont **regroupées en un seul message quotidien**.
3. Étant donné mes réglages, quand je désactive ces notifications, alors elles cessent sans affecter les notifications de commande.
4. **Cas d'échec** : étant donné un abonnement puis un désabonnement dans la minute, quand cela se produit, alors **aucune notification** n'est envoyée.

**Dépendances** US-SOCIAL-01, F7.3 · **Règles** R-Q4, R-Q6 · **Écrans** Notifications, Réglages

---

### US-SOCIAL-05 · F7.17 · P1 / S — Un fil d'abonnements qui montre aussi le catalogue

> **En tant qu'**acheteuse abonnée à une boutique qui ne fait pas de direct,
> **je veux** voir ses nouveaux articles dans mon fil,
> **afin que** mon abonnement serve à quelque chose.

**Critères d'acceptation**
1. Étant donné le fil « Abonnements », quand je l'ouvre, alors il contient les directs, **les nouveaux articles**, les promotions en cours et les événements des comptes suivis.
2. Étant donné plusieurs nouveaux articles du même vendeur, quand ils sont publiés le même jour, alors ils sont **regroupés en une carte** « 12 nouveautés chez Miora ».
3. Étant donné le fil, quand je le parcours, alors chaque carte mène directement à un article achetable — aucune carte purement informative.
4. Étant donné le mode économie de données (`F0.9`), quand il est actif, alors les images du fil sont en basse définition et les vidéos ne se lancent pas automatiquement.
5. **Cas d'échec** : étant donné aucune activité de mes abonnements depuis 7 jours, quand j'ouvre le fil, alors des suggestions du fil « Pour toi » comblent l'espace, clairement identifiées comme telles.

**Dépendances** US-SOCIAL-01, F14.18, F8.1 · **Règles** R-Q5, R-K8 · **Écrans** Fil Abonnements

---

# ÉPIC 4 — Fidélisation client

**Enjeu** : donner au vendeur la seule chose qu'il veut savoir — à qui faire un geste. Une liste de noms ordonnée, avec une action à côté de chaque ligne.

### US-FID-01 · F7.18 · P2 / S — Calculer le rang d'une cliente

> **En tant que** vendeur,
> **je veux** que mes clientes soient classées automatiquement,
> **afin de** repérer mes meilleures sans tenir un cahier.

**Critères d'acceptation**
1. Étant donné une commande **confirmée**, quand elle passe à `CONFIRMEE`, alors le score du couple (vendeur, cliente) est recalculé sur quatre composantes : montant cumulé, nombre de commandes, récence, fiabilité.
2. Étant donné une commande payée puis remboursée, quand le remboursement est exécuté, alors elle **ne compte pas** dans le score.
3. Étant donné une cliente sans commande depuis 6 mois, quand le score est recalculé, alors la composante de récence décote son score — un rang ne se garde pas indéfiniment.
4. Étant donné le score d'une cliente chez un vendeur, quand un autre vendeur consulte ses propres clientes, alors il **ne voit rien** de l'activité chez le premier : le rang est **par vendeur**.
5. Étant donné des litiges perdus ou des annulations répétées, quand le score est calculé, alors la composante de fiabilité le pénalise.
6. **Cas d'échec** : étant donné 10 000 commandes confirmées en une soirée de direct, quand les scores sont recalculés, alors le calcul est asynchrone et ne ralentit **jamais** la confirmation de commande.
7. Étant donné un score, quand il est affiché, alors il est accompagné d'une explication en une phrase de ce qui le compose.

**Dépendances** F3.7, F4.5 · **Règles** R-R1, R-R2, R-R3 · **Écrans** — (moteur), Mes clientes

---

### US-FID-02 · F7.6 · P2 / S — Définir mes paliers

> **En tant que** vendeur,
> **je veux** définir mes paliers et leurs avantages,
> **afin d'** avoir un programme de fidélité qui me ressemble.

**Critères d'acceptation**
1. Étant donné mes réglages boutique, quand j'ouvre « Fidélité », alors quatre paliers par défaut me sont proposés (Bronze, Argent, Or, VIP), renommables et supprimables.
2. Étant donné un palier, quand je le configure, alors je saisis un seuil en montant cumulé **et/ou** en nombre de commandes, et un avantage en texte libre.
3. Étant donné des seuils qui se chevauchent ou décroissent, quand je valide, alors l'erreur est signalée avant enregistrement.
4. Étant donné que je désactive la fidélité, quand je le fais, alors les clientes ne voient plus de palier, **la liste de mes clientes reste utilisable**, et les données de score sont conservées.
5. Étant donné une modification de seuil, quand je l'enregistre, alors les rangs sont recalculés et **aucune cliente ne perd un avantage déjà consommé**.
6. **Cas d'échec** : étant donné un palier dont l'avantage promis n'existe pas dans le produit (texte libre non tenu), quand une cliente l'atteint, alors elle voit l'avantage tel qu'écrit par le vendeur, avec la mention qu'il est accordé par la boutique et non par JP.

**Dépendances** US-FID-01 · **Règles** R-R4, R-R5 · **Écrans** Réglages boutique → Fidélité

---

### US-FID-03 · F7.5 · P2 / S — Consulter la liste de mes clientes

> **En tant que** vendeur,
> **je veux** une liste de mes clientes classée et filtrable,
> **afin de** savoir à qui parler.

**Critères d'acceptation**
1. Étant donné « Mes clientes », quand j'ouvre l'écran, alors je vois une liste ordonnée par rang : prénom, photo, palier, montant cumulé, nombre de commandes, dernière commande.
2. Étant donné la liste, quand je filtre, alors je peux trier par montant, fréquence, récence, et filtrer par palier ou par « inactives depuis X ».
3. Étant donné une liste longue, quand je la parcours, alors la pagination est par curseur et la liste reste fluide sur un téléphone d'entrée de gamme.
4. Étant donné moins de 5 clientes, quand j'ouvre l'écran, alors un état de démarrage explique que le classement s'activera quand il y aura de quoi classer — **pas de faux palmarès à 3 lignes**.
5. **Cas d'échec** : étant donné une cliente ayant supprimé son compte, quand j'ouvre la liste, alors sa ligne est anonymisée et son historique agrégé conservé pour ma comptabilité.

**Dépendances** US-FID-01 · **Règles** R-R6 · **Écrans** Mes clientes

---

### US-FID-04 · F7.5 · P2 / S — Ouvrir la fiche d'une cliente et agir

> **En tant que** vendeur,
> **je veux** voir l'historique d'une cliente et lui offrir quelque chose depuis sa fiche,
> **afin que** la liste serve à agir et pas seulement à regarder.

**Critères d'acceptation**
1. Étant donné une ligne de la liste, quand je l'ouvre, alors je vois l'historique des commandes, les tailles achetées, les articles préférés, les litiges éventuels et une note privée éditable.
2. Étant donné une fiche cliente, quand je choisis « Offrir une promo », alors je crée une promotion ciblée (US-PROMO-04) pré-remplie pour cette personne.
3. Étant donné une sélection multiple dans la liste, quand je choisis « Envoyer un code », alors un code est généré pour chaque personne sélectionnée (US-PROMO-05).
4. Étant donné une note privée, quand je l'enregistre, alors elle n'est **jamais visible** par la cliente.
5. **Cas d'échec** : étant donné un employé (`VE`) sans permission financière, quand il ouvre « Mes clientes », alors la liste est en lecture seule et **les montants sont masqués**.

**Dépendances** US-FID-03, F10.4 · **Règles** R-R7, R-R8 · **Écrans** Fiche cliente

---

### US-FID-05 · F7.19 · P2 / S — Voir mon rang et ce qu'il me rapporte

> **En tant qu'**acheteuse fidèle,
> **je veux** voir mon palier chez une boutique et ma progression,
> **afin de** savoir ce que ma fidélité me rapporte réellement.

**Critères d'acceptation**
1. Étant donné une vitrine où j'ai déjà acheté, quand je l'ouvre, alors je vois mon palier (« Vous êtes cliente Or chez Miora ») et l'avantage associé.
2. Étant donné mon palier, quand je consulte ma progression, alors elle est exprimée concrètement (« Encore 2 commandes pour devenir VIP ») et l'avantage du palier suivant est visible.
3. Étant donné un avantage annoncé, quand je passe commande, alors il est **réellement appliqué** au panier (US-PROMO-08) — un palier sans effet est une manipulation.
4. Étant donné mes réglages, quand je refuse d'apparaître dans les classements publics, alors mon rang reste visible du vendeur mais pas des autres acheteuses.
5. **Cas d'échec** : étant donné que je perds un palier par décote de récence, quand cela arrive, alors je suis informée **avant** la bascule, avec le moyen de le conserver.

**Dépendances** US-FID-01, US-FID-02 · **Règles** R-R9, R-R10 · **Écrans** Vitrine, Moi → Mes avantages

---

### US-FID-06 · F7.18 · P2 / S — Préparer la fidélisation dès la phase 1

> **En tant que** développeur,
> **je veux** que l'historique nécessaire au rang soit journalisé dès le lancement,
> **afin de** ne pas avoir à reconstituer les données quand la fidélisation sera activée.

**Critères d'acceptation**
1. Étant donné une commande confirmée en phase 1, quand elle est enregistrée, alors le couple (vendeur, acheteuse), le montant confirmé et la date sont disponibles pour un calcul ultérieur.
2. Étant donné l'activation de la fidélisation en phase 2, quand le moteur démarre, alors les rangs sont calculés **sur l'historique existant**, sans reprise manuelle.
3. Étant donné le calcul de rattrapage sur plusieurs mois de commandes, quand il s'exécute, alors il est idempotent et relançable sans doubler les scores.
4. **Cas d'échec** : étant donné des commandes antérieures à la mise en place du journal, quand le rattrapage s'exécute, alors les commandes non journalisées sont comptées à partir des données de commande, et l'écart éventuel est signalé au vendeur plutôt que silencieux.

**Dépendances** F3.7 · **Règles** R-R2 · **Écrans** — (technique)

---

# ÉPIC 5 — Promotions

**Enjeu** : donner au vendeur un levier commercial, et à l'abonnement sa raison d'être. Le risque miroir : transformer les notifications en spam et faire couper toutes les alertes, y compris celles dont la logistique dépend.

### US-PROMO-01 · F7.22 · P1 / S — Lancer une promotion sur ma boutique

> **En tant que** vendeur,
> **je veux** créer une promotion en quelques appuis,
> **afin de** relancer mes ventes sans attendre un direct.

**Critères d'acceptation**
1. Étant donné « Catalogue → Promotions », quand je crée une promotion, alors je choisis un **type** (pourcentage, montant fixe, livraison offerte), une **valeur**, une **période**, un **périmètre** (boutique / catégorie / sélection) et une **cible** (tous / abonnés / palier / clientes nommées).
2. Étant donné une promotion active, quand une acheteuse voit un article concerné, alors le prix barré et le nouveau prix apparaissent sur la vignette, la fiche, le panier et la facture, **et le prix affiché est le prix payé**.
3. Étant donné l'écran de résumé, quand je valide, alors je vois le **net qui me restera** sur un article représentatif, commission déduite.
4. Étant donné une promotion en pourcentage supérieure à un seuil de sécurité (par exemple 70 %), quand je valide, alors une confirmation explicite est demandée.
5. Étant donné une promotion terminée, quand la date de fin passe, alors les prix d'origine sont rétablis **automatiquement**, sans intervention.
6. **Cas d'échec** : étant donné une valeur qui rendrait le prix nul ou négatif, quand je valide, alors la promotion est refusée avec un message clair.
7. Étant donné un employé (`VE`), quand il ouvre le catalogue, alors il **ne peut pas** créer ni modifier une promotion.

**Dépendances** F1.9, F10.1, F10.4 · **Règles** R-U1, R-U2, R-U7 · **Écrans** Promotions, Création de promotion

---

### US-PROMO-02 · F7.8 · P2 / S — Programmer une promotion à l'avance

> **En tant que** vendeur,
> **je veux** programmer ma promotion pour une date future,
> **afin de** préparer mes opérations commerciales tranquillement.

**Critères d'acceptation**
1. Étant donné la création d'une promotion, quand je choisis une date de début future, alors elle est enregistrée en statut `programmée` et n'affecte aucun prix.
2. Étant donné une promotion programmée, quand sa date de début arrive, alors elle passe `active` automatiquement et la notification aux abonnés est envoyée (US-PROMO-03).
3. Étant donné une promotion programmée, quand je la modifie ou l'annule avant son début, alors aucune notification n'a été envoyée.
4. **Cas d'échec** : étant donné une panne du planificateur, quand elle est résolue, alors les promotions dont la date est passée démarrent avec un retard journalisé, **sans jamais démarrer deux fois** ni envoyer deux notifications.

**Dépendances** US-PROMO-01 · **Règles** R-U3 · **Écrans** Promotions

---

### US-PROMO-03 · F7.23 · P1 / S — Prévenir mes abonnés, sans les noyer

> **En tant que** vendeur,
> **je veux** que mes abonnés soient prévenus quand je lance une promotion,
> **afin de** créer du trafic sans acheter de publicité.

**Critères d'acceptation**
1. Étant donné une promotion ciblant tous les clients ou mes abonnés, quand elle devient active, alors mes abonnés reçoivent une notification menant à ma vitrine filtrée sur les articles en promotion.
2. Étant donné l'écran de création, quand j'arrive au résumé, alors le nombre d'abonnés qui seront notifiés est affiché, avec un interrupteur pour **ne pas** notifier.
3. Étant donné une notification déjà envoyée pour ma boutique dans les 24 h, quand je lance une seconde promotion, alors **aucune seconde notification** n'est envoyée et je suis averti avant de valider.
4. Étant donné une acheteuse concernée par plus de 3 promotions d'abonnements différents le même jour, quand elles arrivent, alors elles sont **regroupées** en un seul message.
5. Étant donné mes statistiques de promotion, quand je les consulte, alors je vois abonnés notifiés, ouvertures et **ventes générées**.
6. Étant donné une acheteuse ayant coupé mes notifications de promotion (US-SOCIAL-02), quand je lance une promotion, alors elle n'en reçoit pas et reste abonnée.
7. **Cas d'échec** : étant donné l'échec de l'envoi push, quand il se produit, alors la notification n'est **pas** rejouée en boucle et l'échec est journalisé — un renvoi automatique agressif est pire que l'absence de notification.

**Dépendances** US-PROMO-01, US-SOCIAL-01, F7.3 · **Règles** R-U4, R-Q6 · **Écrans** Création de promotion, Notifications

---

### US-PROMO-04 · F7.24 · P2 / S — Réserver une offre à mes meilleures clientes

> **En tant que** vendeur,
> **je veux** offrir une remise réservée à mes clientes Or et VIP,
> **afin de** récompenser celles qui font mon chiffre d'affaires.

**Critères d'acceptation**
1. Étant donné « Mes clientes », quand je sélectionne un palier et crée une promotion, alors seules les clientes de ce palier ou au-dessus la voient et peuvent l'utiliser.
2. Étant donné une promotion réservée, quand une cliente éligible l'ouvre, alors elle est présentée comme un privilège nommé (« Offre réservée aux clientes VIP de Miora »).
3. Étant donné une cliente non éligible, quand elle consulte la vitrine, alors la promotion est **visible mais grisée**, avec la progression nécessaire pour y accéder (décision `F7.24`).
4. Étant donné une cliente qui perd son palier entre la réservation et le paiement, quand elle paie, alors la remise est refusée avec un message clair **sans faire échouer toute la commande**.
5. Étant donné l'éligibilité, quand elle est évaluée, alors elle est vérifiée **côté serveur** au moment du calcul du panier — jamais côté client.
6. **Cas d'échec** : étant donné une tentative d'utiliser l'identifiant d'une promotion réservée sans y avoir droit, quand la requête arrive, alors elle est refusée et l'anomalie est journalisée.

**Dépendances** US-FID-01, US-FID-02, US-PROMO-01 · **Règles** R-U5, R-R9 · **Écrans** Mes clientes, Création de promotion, Vitrine

---

### US-PROMO-05 · F7.9 · P2 / C — Envoyer un code à une cliente précise

> **En tant que** vendeur,
> **je veux** envoyer un code personnel à une cliente,
> **afin de** m'excuser d'un retard ou faire revenir quelqu'un.

**Critères d'acceptation**
1. Étant donné la fiche d'une cliente, quand je choisis « Envoyer un code », alors je définis un montant ou un pourcentage et une date d'expiration, et elle reçoit une notification personnelle.
2. Étant donné un code personnel, quand une autre personne tente de l'utiliser, alors il est refusé.
3. Étant donné un code à usage unique, quand il a servi, alors une seconde utilisation est refusée, y compris en cas d'appels simultanés.
4. Étant donné un code expiré, quand la cliente l'applique, alors le refus explique la date d'expiration.
5. **Cas d'échec** : étant donné une commande annulée après utilisation d'un code, quand le remboursement est exécuté, alors le code est **rendu utilisable** ou remplacé — sinon la cliente perd le geste commercial du fait de l'annulation.

**Dépendances** US-FID-04, US-PROMO-01 · **Règles** R-U6 · **Écrans** Fiche cliente, Mes offres

---

### US-PROMO-06 · F7.25 · P2 / S — Retrouver toutes mes offres au même endroit

> **En tant qu'**acheteuse,
> **je veux** un écran qui rassemble mes codes et mes offres,
> **afin de** ne pas les oublier.

**Critères d'acceptation**
1. Étant donné « Moi → Mes offres », quand je l'ouvre, alors je vois mes codes personnels, les promotions éligibles selon mon palier, ma cagnotte et les promotions en cours de mes boutiques suivies.
2. Étant donné une offre, quand je l'ouvre, alors sa date d'expiration est visible et un bouton « Voir les articles » mène au catalogue filtré.
3. Étant donné une offre expirée, quand j'ouvre l'écran, alors elle est archivée et non mélangée aux offres actives.
4. Étant donné une offre à moins de 48 h de son expiration, quand j'ouvre l'écran, alors elle est signalée — **une seule** notification de rappel est autorisée.
5. **Cas d'échec** : étant donné aucune offre, quand j'ouvre l'écran, alors un état vide explique comment en obtenir plutôt qu'une page vide.

**Dépendances** US-PROMO-04, US-PROMO-05 · **Règles** R-U6, R-U8 · **Écrans** Moi → Mes offres

---

### US-PROMO-07 · F7.26 · P1 / M — Ne jamais cumuler deux remises par accident

> **En tant que** responsable produit,
> **je veux** qu'une seule remise s'applique par ligne de commande,
> **afin de** ne pas vendre à perte et de pouvoir expliquer chaque facture.

**Critères d'acceptation**
1. Étant donné plusieurs remises éligibles sur une même ligne, quand le panier est calculé, alors **une seule** s'applique : **la plus favorable à l'acheteuse**.
2. Étant donné la remise retenue, quand la commande est créée, alors son identifiant est enregistré sur la ligne de commande, et il apparaît nommément sur la facture.
3. Étant donné le calcul, quand il est effectué, alors il l'est **côté serveur**, en entiers d'Ariary, sans aucun flottant.
4. Étant donné une promotion créée qui chevauche une promotion existante, quand je valide, alors je suis averti du chevauchement et de la règle appliquée.
5. Étant donné une commande passée, quand une promotion est modifiée ou supprimée ensuite, alors la commande **conserve** le prix et la remise figés à l'achat.
6. **Cas d'échec** : étant donné une livraison offerte cumulée avec un pourcentage sur les articles, quand le panier est calculé, alors les deux remises **portant sur des assiettes différentes** (articles vs livraison) sont autorisées et explicitement documentées comme la seule exception — tout autre cumul est refusé.

**Dépendances** US-PROMO-01, F3.2, F4.11 · **Règles** R-U7, R-U9 · **Écrans** Panier, Facture, Création de promotion

---

### US-PROMO-08 · F3.15 · P1 / M — Voir ma remise dans le panier

> **En tant qu'**acheteuse,
> **je veux** voir clairement quelle remise s'applique et pourquoi,
> **afin de** payer en confiance.

**Critères d'acceptation**
1. Étant donné mon panier, quand une remise s'applique, alors une ligne nommée l'indique : « Promo Noël −20 % », « Avantage cliente Or : livraison offerte », « Code MERCI10 ».
2. Étant donné le récapitulatif, quand je le consulte, alors sous-total, remise, frais de livraison par vendeur et total sont détaillés (`F3.2`).
3. Étant donné un code saisi manuellement, quand il est invalide, expiré ou non applicable à mon panier, alors le motif exact est affiché — jamais un « code invalide » générique.
4. Étant donné une remise appliquée, quand je paie, alors le montant prélevé correspond **exactement** au total affiché.
5. **Cas d'échec** : étant donné qu'une promotion expire entre l'affichage du panier et le paiement, quand je paie, alors le nouveau total m'est présenté pour **confirmation explicite** — jamais un prélèvement supérieur à ce que j'ai vu.

**Dépendances** US-PROMO-07, F3.2, F4.1 · **Règles** R-U8, R-U9 · **Écrans** Panier, Paiement, Facture

---

# ÉPIC 6 — Événements thématiques

**Enjeu** : donner à la plateforme une raison d'exister au-delà de la somme de ses boutiques, et fabriquer un motif de retour daté — plus honnête et moins coûteux qu'une notification de plus.

### US-EVT-01 · F20.1 · P2 / S — Créer un événement JP

> **En tant qu'**équipe JP,
> **je veux** créer un événement thématique daté,
> **afin de** fédérer plusieurs boutiques autour d'un rendez-vous commercial.

**Critères d'acceptation**
1. Étant donné le back-office, quand je crée un événement, alors je renseigne nom, thème, dates de début et de fin, visuel, couleur d'accent, hashtag, texte de présentation et règles de participation.
2. Étant donné un événement en `brouillon`, quand je l'annonce, alors il devient visible dans le calendrier (US-EVT-08) sans être encore ouvert aux achats groupés.
3. Étant donné les dates, quand la date de début arrive, alors le statut passe `en cours` automatiquement ; à la date de fin, `terminé`.
4. Étant donné un événement, quand je l'enregistre, alors son `slug` public est unique et l'URL est partageable.
5. **Cas d'échec** : étant donné une date de fin antérieure à la date de début, quand je valide, alors l'erreur est signalée avant enregistrement.
6. Étant donné toute action sur un événement, quand elle est effectuée, alors elle est inscrite au journal d'audit avec son auteur.

**Dépendances** F11.6 · **Règles** R-W1, R-W2 · **Écrans** Back-office → Événements

---

### US-EVT-02 · F20.2 · P2 / S — Candidater à un événement

> **En tant que** vendeur,
> **je veux** demander à participer à un événement JP,
> **afin de** bénéficier de son trafic.

**Critères d'acceptation**
1. Étant donné mon studio, quand j'ouvre « Événements », alors je vois les événements ouverts aux candidatures avec leurs dates et leurs règles.
2. Étant donné un événement, quand je candidate, alors je choisis les articles et promotions que j'y engage et ma candidature passe en `candidate`.
3. Étant donné ma candidature, quand **OP** l'accepte ou la refuse, alors je suis notifié, avec un **motif écrit en cas de refus**.
4. Étant donné une candidature acceptée, quand l'événement s'ouvre, alors mes articles apparaissent sur la page événement.
5. Étant donné une créatrice, quand elle candidate, alors elle engage sa sélection (`F15.3`) ou ses clips, et ses ventes restent attribuées par affiliation.
6. **Cas d'échec** : étant donné une candidature laissée sans réponse jusqu'à l'ouverture de l'événement, quand celle-ci arrive, alors la candidature est **automatiquement refusée** avec notification — un vendeur qui attend sans réponse ne recandidate pas.
7. Étant donné un vendeur non vérifié (`F0.6`), quand il candidate, alors la candidature est refusée avec l'explication de la condition manquante.

**Dépendances** US-EVT-01, F0.6, F15.3 · **Règles** R-W3, R-W4 · **Écrans** Studio → Événements, Back-office → Candidatures

---

### US-EVT-03 · F20.3 · P2 / S — Rattacher mes articles et mes promos à un événement

> **En tant que** vendeur participant,
> **je veux** engager des articles, une promotion et un direct dans l'événement,
> **afin d'** y être visible avec une vraie offre.

**Critères d'acceptation**
1. Étant donné ma participation acceptée, quand je gère mon engagement, alors je peux rattacher des articles, une promotion existante ou nouvelle, des clips et un direct programmé.
2. Étant donné un article, quand il est rattaché à plusieurs événements simultanés, alors c'est autorisé, mais **une seule remise s'applique** (US-PROMO-07).
3. Étant donné un article retiré de la vente, quand l'événement est en cours, alors il disparaît de la page événement sans casser la page.
4. Étant donné un direct rattaché, quand il démarre, alors il apparaît en tête de la page événement.
5. **Cas d'échec** : étant donné un article rattaché puis épuisé, quand une acheteuse ouvre la page, alors il est affiché comme épuisé avec l'alerte de retour en stock (`F7.4`), plutôt que masqué — la page doit rester crédible.

**Dépendances** US-EVT-02, US-PROMO-01, F2.1 · **Règles** R-W5, R-U7 · **Écrans** Studio → Mon événement

---

### US-EVT-04 · F20.4 · P2 / S — Ouvrir la page d'un événement

> **En tant que** visiteuse,
> **je veux** une page d'événement qui donne envie et permette d'acheter,
> **afin de** profiter du rendez-vous sans chercher.

**Critères d'acceptation**
1. Étant donné une page événement, quand je l'ouvre, alors je vois le bandeau visuel, la présentation, un **compte à rebours** (ouverture ou fin), puis dans cet ordre : directs en cours, articles en promotion, clips et stories du hashtag, boutiques participantes.
2. Étant donné la page, quand je l'ouvre **sans compte**, alors tout est consultable et l'inscription n'est déclenchée qu'au « Je prends ».
3. Étant donné la page, quand je filtre, alors je peux filtrer par taille, budget et catégorie, la taille étant pré-remplie depuis mon profil.
4. Étant donné un lien d'événement partagé sur Facebook ou WhatsApp, quand il est ouvert, alors l'aperçu montre le visuel, le nom et les dates.
5. Étant donné un événement `annoncé` non encore ouvert, quand je l'ouvre, alors je vois le compte à rebours et un bouton « Me prévenir à l'ouverture ».
6. **Cas d'échec** : étant donné un événement dont tous les articles sont épuisés ou retirés, quand je l'ouvre, alors un état utile est affiché (boutiques participantes, prochain événement) plutôt qu'une grille vide.
7. Étant donné le mode économie de données, quand il est actif, alors le bandeau et les vignettes sont servis en basse définition.

**Dépendances** US-EVT-03, F0.10, F8.3, F0.9 · **Règles** R-W6, R-W7 · **Écrans** Page événement (mobile et web)

---

### US-EVT-05 · F20.5 · P2 / C — Créer un mini-événement de boutique

> **En tant que** vendeur,
> **je veux** créer mon propre rendez-vous,
> **afin d'** animer ma boutique sans dépendre du calendrier JP.

**Critères d'acceptation**
1. Étant donné mon studio, quand je crée un événement de boutique, alors il est publié **sans validation OP**, avec une portée limitée à ma vitrine et à mes abonnés.
2. Étant donné un événement de boutique, quand il est publié, alors il **n'apparaît pas** dans le calendrier général des événements JP.
3. Étant donné mes abonnés, quand l'événement démarre, alors ils sont notifiés dans la limite des plafonds de notification (US-PROMO-03).
4. **Cas d'échec** : étant donné que je crée cinq mini-événements dans la même semaine, quand je crée le suivant, alors la création reste possible mais **aucune notification supplémentaire** n'est envoyée.

**Dépendances** US-EVT-01, US-PROMO-03 · **Règles** R-W8 · **Écrans** Studio → Mes événements

---

### US-EVT-06 · F20.6 · P2 / C — Être prévenue d'un événement, trois fois maximum

> **En tant qu'**acheteuse,
> **je veux** être prévenue à l'ouverture et au dernier jour d'un événement,
> **afin de** ne pas le rater sans être harcelée.

**Critères d'acceptation**
1. Étant donné un événement dont j'ai demandé à être prévenue, quand il s'ouvre, alors je reçois une notification.
2. Étant donné un événement en cours, quand il entre dans son dernier jour, alors je reçois **au plus une** notification de rappel.
3. Étant donné un événement, quand toutes les notifications ont été envoyées, alors leur nombre total ne dépasse **jamais trois** pour cet événement.
4. Étant donné les plafonds de `F7.23`, quand des notifications d'événement et de promotion coïncident, alors elles partagent le même budget d'attention et sont regroupées.
5. **Cas d'échec** : étant donné que je n'ai pas demandé à être prévenue et que je ne suis aucune boutique participante, quand l'événement s'ouvre, alors je **ne reçois rien**.

**Dépendances** US-EVT-01, US-PROMO-03, F7.3 · **Règles** R-W9, R-U4 · **Écrans** Notifications

---

### US-EVT-07 · F20.7 · P2 / C — Reconnaître un article d'un événement

> **En tant qu'**acheteuse,
> **je veux** repérer visuellement les articles d'un événement,
> **afin de** faire le lien où que je les croise.

**Critères d'acceptation**
1. Étant donné un article rattaché à un événement en cours, quand il apparaît dans le fil, la recherche ou une vitrine, alors une pastille aux couleurs de l'événement est affichée.
2. Étant donné la pastille, quand je l'appuie, alors j'arrive sur la page événement.
3. Étant donné la pastille, quand elle est rendue, alors elle n'entraîne **aucun téléchargement d'image supplémentaire** (élément vectoriel ou couleur + texte).
4. **Cas d'échec** : étant donné un article rattaché à deux événements en cours, quand il est affiché, alors **une seule** pastille apparaît, celle de l'événement le plus proche de sa fin.

**Dépendances** US-EVT-03, F0.9 · **Règles** R-W7 · **Écrans** Fil, Recherche, Vitrine, Fiche

---

### US-EVT-08 · F20.9 · P2 / C — Consulter le calendrier des événements

> **En tant qu'**acheteuse,
> **je veux** voir les événements en cours et à venir,
> **afin de** savoir quand revenir.

**Critères d'acceptation**
1. Étant donné l'écran « Événements », quand je l'ouvre, alors je vois les événements en cours puis à venir, avec dates, visuels et compte à rebours.
2. Étant donné un événement à venir, quand j'appuie sur « Me prévenir », alors je serai notifiée à son ouverture (US-EVT-06).
3. Étant donné le calendrier, quand je le consulte, alors les événements de boutique n'y figurent pas (US-EVT-05).
4. **Cas d'échec** : étant donné aucun événement annoncé, quand j'ouvre l'écran, alors les rendez-vous récurrents de mes boutiques suivies (`F17.4`) sont proposés à la place.

**Dépendances** US-EVT-01, F17.4 · **Règles** R-W10 · **Écrans** Événements

---

### US-EVT-09 · F20.8 · P2 / C — Mesurer un événement

> **En tant que** vendeur participant et en tant qu'équipe JP,
> **je veux** un bilan chiffré de l'événement,
> **afin de** décider s'il vaut la peine d'être reconduit.

**Critères d'acceptation**
1. Étant donné un événement terminé, quand j'ouvre son bilan côté vendeur, alors je vois articles vendus, chiffre d'affaires, comparaison avec une période équivalente hors événement, **nouveaux abonnés gagnés**, contenus publiés et leurs conversions.
2. Étant donné le back-office, quand OP ouvre le bilan, alors il voit la participation par vendeur, le trafic de la page, la conversion, la part des ventes attribuable à l'événement et le coût des mises en avant.
3. Étant donné les ventes d'un vendeur pendant l'événement, quand elles sont attribuées, alors la règle d'attribution (origine `evenement`) est documentée et cohérente avec l'attribution d'affiliation (`F15.4`).
4. **Cas d'échec** : étant donné un événement sans aucune vente, quand le bilan est généré, alors il est produit malgré tout, avec les chiffres réels — **un bilan absent est un événement qui sera reconduit par habitude et non par résultat**.

**Dépendances** US-EVT-04, F9.1, F11.7 · **Règles** R-W11 · **Écrans** Studio → Bilan d'événement, Back-office → Indicateurs

---

## Décisions produit à trancher avant réalisation

Reprises de `JP_BACKLOG.md` §« Les décisions ouvertes », points 15 à 21. Elles bloquent les stories indiquées.

| # | Décision | Bloque |
|---|---|---|
| 15 | Durée de réservation hors direct (hyp. 30 min) | US-VENTE-02 |
| 16 | Seuil de bascule particulier → professionnel, et commission du particulier | US-VENTE-04 |
| 17 | Règle de cumul des remises — **à figer avant de coder le panier** | US-PROMO-07, US-PROMO-08 |
| 18 | Plafond de notifications de promotion | US-PROMO-03, US-EVT-06 |
| 19 | Critères et poids du rang client | US-FID-01 |
| 20 | Promotion ciblée : découvrable ou privée | US-PROMO-04 |
| 21 | Participation à un événement : gratuite, payante, ou par palier · et qui valide | US-EVT-02 |

---

*Backlog complet : `JP_BACKLOG.md` · Règles fonctionnelles : `JP_CAHIER_DES_CHARGES.md` · Modèle de données et API : `JP_CDC_TECHNIQUE.md` · Plans de réalisation : `plan/`.*
