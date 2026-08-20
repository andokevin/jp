# JP — Backlog produit complet

> Inventaire exhaustif des fonctionnalités, y compris les fonctionnalités mineures et les fonctions support nécessaires pour que les autres fonctionnent.
> Pour chaque fonctionnalité : le **parcours utilisateur de chaque persona concerné**.
>
> **Épiques 0 à 13** — le socle commerce : identité, catalogue, **vente hors direct**, direct, commande, paiement, livraison, confiance, communauté, back-office.
> **Épiques 14 à 19** — la couche sociale : contenu et fil, créatrices et affiliation, cadeau et diaspora, habitude, premium et marques, modération.
> **Épique 20** — les événements thématiques : les rendez-vous commerciaux datés qui font exister la plateforme au-delà de la somme de ses boutiques.
>
> Codes : **P1 / P2 / P3** = phase (slide 20). **M** = indispensable au lancement · **S** = important · **C** = confort · **W** = plus tard.
> Les fonctionnalités marquées ⚠️ sont des **décisions produit ouvertes**, à trancher avec les vendeurs pilotes.

---

## Les personas

| Code | Persona | Description | Ce qu'il vient chercher |
|---|---|---|---|
| **V** | **Miora — la vendeuse en direct** | 28 ans, Antananarivo. Vend des vêtements importés en direct sur Facebook 4 soirs par semaine. Un téléphone Android milieu de gamme, un cahier, un compte MVola personnel. | Ne plus perdre de ventes. Être prise au sérieux. |
| **VE** | **Fara — l'employée du vendeur** | Aide Miora : prépare les colis, répond aux messages, ne gère pas l'argent. | Voir les commandes à préparer sans toucher aux finances. |
| **A** | **Hanta — l'acheteuse fidèle** | 32 ans, salariée. Achète 1 à 2 fois par mois en direct. A déjà été arnaquée une fois. Paie en MVola. | Ne pas reperdre son argent. Trouver sa taille. |
| **AN** | **Tiana — la visiteuse non inscrite** | Tombe sur un direct partagé par une amie sur WhatsApp. N'a pas l'application. | Regarder sans s'engager. Comprendre à qui elle a affaire. |
| **L** | **Rado — le livreur** | Moto, tournée quotidienne, application dédiée. | Une tournée claire, une preuve de remise. |
| **PR** | **Le point relais** | Épicerie, kiosque ou boutique partenaire qui stocke et remet les colis. | Recevoir, stocker, remettre contre code, être payé. |
| **C** | **Ony — la créatrice** | 22 ans, étudiante. 8 000 abonnés sur Facebook et TikTok. Filme ses tenues, sait faire une vidéo. **N'a pas d'argent à immobiliser dans du stock.** Aujourd'hui elle fait de la publicité gratuite à des vendeurs qui ne la paient pas. | Gagner de l'argent avec ce qu'elle fait déjà, **sans capital et sans stock**. |
| **D** | **Naina — le donateur / la diaspora** | Frère de Hanta, vit en France. Envoie de l'argent à sa famille tous les mois, sans savoir ce qui en est fait. Paie par carte. | Offrir **un objet précis**, vérifié, livré, avec une preuve. |
| **MO** | **Le modérateur JP** | Traite les signalements de contenu et de commentaires. Poste distinct de l'arbitrage des litiges. | Protéger les créatrices, vite. |
| **OP** | **L'équipe JP — opérations** | Back-office : vérification, arbitrage, réconciliation, réseau relais. | Traiter vite, avec des preuves. |
| **PM** | **Le partenaire marque** | Marque ou distributeur. Cherche des créatrices et de la visibilité. | Des campagnes mesurables et des données de marché. |

---

# ÉPIQUE 0 — Compte, identité et vérification

Le socle de la confiance. Sans lui, rien du reste n'a de valeur.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F0.1 | **Inscription et connexion par email + code OTP** | P1 | M |
| F0.2 | Connexion, session longue, multi-appareil | P1 | M |
| F0.3 | Récupération de compte (perte de l'email, changement de SIM) | P1 | S |
| F0.4 | Bascule de rôle acheteur ↔ vendeur ↔ **particulier** sur un même compte | P1 | S |
| F0.5 | Profil acheteur (nom, photo, tailles habituelles, morphologie) | P1 | S |
| F0.6 | Vérification vendeur — CIN ou NIF/STAT, selfie, numéro mobile money, adresse | P1 | M |
| F0.7 | Badge « vendeur vérifié » affiché partout | P1 | M |
| F0.8 | Choix de la langue : malgache / français | P1 | S |
| F0.9 | Mode économie de données | P1 | S |
| F0.10 | Consultation en invité, sans compte | P1 | S |
| F0.11 | Suppression et désactivation de compte | P1 | M |
| F0.12 | Blocage d'un utilisateur | P2 | C |
| F0.13 | **Connexion Google (OAuth)** | P1 | S |
| F0.14 | **Renvoi de code, limitation de débit, anti-énumération de comptes** | P1 | M |
| F0.15 | **Changement d'adresse email avec double vérification** | P1 | S |
| F0.16 | Numéro de téléphone en contact de livraison, vérifié à la première commande | P1 | S |

### F0.1 — Inscription et connexion par email + code OTP

**L'email est l'identifiant principal du compte. Le téléphone devient un contact de livraison** (`F0.16`), plus une identité. Ce choix évite le coût et la non-fiabilité du SMS à l'inscription, et il rend le compte indépendant du changement de SIM — première cause de perte de compte sur ce marché.

- **A** : ouvre l'app → saisit son adresse email → reçoit un **code à 6 chiffres** valable 10 minutes → le saisit (collage automatique depuis le presse-papier) → choisit un prénom → arrive sur le fil. **Aucun mot de passe.**
- **A (raccourci)** : bouton « Continuer avec Google » (`F0.13`) — un appui, aucun code à attendre. À placer **avant** le champ email pour les téléphones où la réception mail est lente.
- **V** : même parcours, puis un écran « Vous voulez vendre ? » → bascule vers `F0.6`.
- **AN** : peut parcourir sans compte (`F0.10`) ; l'inscription est déclenchée seulement au moment du « Je prends », et **la réservation est déjà posée pendant l'inscription**.
- **Cas d'échec — mail non reçu** : après 30 s, bouton « Renvoyer » ; après 2 renvois, message explicite *« Vérifiez vos spams »* + proposition de changer d'adresse. Jamais de blocage silencieux.
- **Cas d'échec — code faux** : 5 tentatives par code, puis le code est invalidé et il faut en redemander un (`F0.14`).
- **Règle de confidentialité** : la réponse à une demande de code est **identique** que le compte existe ou non — sinon l'écran de connexion devient un outil d'énumération des comptes (`F0.14`).

### F0.3 — Récupération de compte
- **A (accès perdu à sa boîte mail)** : saisit son ancienne adresse → l'app ne peut plus envoyer de code → formulaire (prénom, dernière commande, montant approximatif, numéro de téléphone de livraison) → **OP** vérifie sous 24 h → réattribution manuelle à la nouvelle adresse.
- **A (email accessible)** : la récupération est intégrée au parcours normal — un code envoyé à son adresse suffit, il n'y a rien à « récupérer ». C'est l'avantage direct de `F0.1`.
- **A (changement de SIM)** : sans impact sur le compte ; elle met simplement à jour son contact de livraison (`F0.16`).
- **OP** : file « récupérations » → compare avec l'historique de commandes → valide ou refuse → trace horodatée dans le journal d'audit.

### F0.4 — Trois rôles sur un même compte
Un même compte peut être acheteur, **vendeur professionnel** (boutique) ou **vendeur particulier** — quelqu'un qui liquide son propre dressing, sans boutique ni stock d'import. Le particulier suit le parcours `F1.17` : dépôt d'annonce simplifié, pièces uniques, vérification allégée jusqu'au premier encaissement.

- **A → particulier** : « Vendre un article que je ne porte plus » → 4 champs → en ligne. **Aucune création de boutique demandée** : exiger un nom de boutique et un KYC complet pour vendre une robe fait abandonner tout le monde.
- **Particulier → vendeur** : dès qu'il dépasse un seuil de ventes ou veut encaisser, bascule vers `F0.6`, expliquée et non subie.

### F0.13 — Connexion Google
- **A** : « Continuer avec Google » → sélecteur de compte Google → connectée. Si l'adresse Google correspond à un compte email existant, **les deux identités sont rattachées au même compte**, jamais dupliquées.
- **Règle** : l'email fourni par Google n'est accepté comme vérifié que si le fournisseur l'indique comme tel.

### F0.14 — Débit, renvoi et anti-abus
- **Limites** : 1 code par adresse toutes les 60 s, 5 par heure, 10 par jour ; 5 tentatives de saisie par code. Au-delà, attente affichée en clair (« Réessayez dans 4 minutes »), jamais une erreur muette.
- **Côté serveur** : le code est stocké **haché**, jamais en clair ; il est invalidé à la première utilisation, à l'expiration, ou à l'émission d'un nouveau code.
- **OP** : voit les adresses en anomalie (nombre de demandes, IP) dans le back-office.

### F0.15 — Changement d'adresse email
- **A** : réglages → « Changer mon email » → code envoyé à **l'ancienne** adresse (autorisation) → puis code envoyé à la **nouvelle** (vérification) → bascule. Notification à l'ancienne adresse *« Votre email a été modifié »*, avec un moyen de contester.
- **Règle** : un vendeur avec un solde disponible ne peut pas changer d'email sans que la modification soit journalisée et notifiée — c'est un vecteur de détournement de compte.

### F0.16 — Téléphone, contact de livraison
- **A** : renseigne son numéro **au moment de sa première livraison à domicile**, pas à l'inscription. Vérifié par code SMS uniquement à ce moment-là : le SMS coûte, autant ne le dépenser que là où il sert.
- **L / PR** : voient le numéro du destinataire sur le bordereau, jamais l'adresse email.

### F0.6 — Vérification vendeur (KYC)
- **V** : « Devenir vendeur » → nom de la boutique → photo recto/verso de la CIN ou permis ou passeport → selfie → numéro mobile money **au même nom que la CIN** → adresse d'enlèvement → soumet → **statut « en cours de vérification » : elle peut déjà créer son catalogue mais pas encaisser.** ou NIF STAT si boutique si il on de NF state, je veux dire entreprise
- **OP** : file d'attente → compare CIN / selfie / titulaire du compte mobile money → valide, refuse, ou demande une pièce → notification à **V**.
- **A** : ne voit rien du processus — elle voit seulement le résultat, le badge (`F0.7`).
- **Règle** : aucun encaissement possible sans vérification validée. C'est le mécanisme central de la slide 11.

### F0.7 — Badge vendeur vérifié
- **A / AN** : voient le badge sur la vignette du direct, dans le fil, sur la fiche produit, dans le panier et sur la facture. Un appui sur le badge ouvre une explication en une phrase : *« Identité et compte mobile money vérifiés par JP. »*  et pour partuculier aussi on voit qu'il sont verifier s'il veut vendre
- **V** : voit son badge sur son profil ; s'il n'est pas vérifié, une bannière permanente lui rappelle ce qui manque.

### F0.9 — Mode économie de données
- **A** : réglages → « Économie de données » → le direct passe en qualité basse par défaut, les images du catalogue se chargent en basse définition, les vidéos ne s'auto-lancent pas dans le fil.
- **Déclenchement automatique** proposé quand le débit détecté est faible : bandeau *« Connexion lente — passer en mode léger ? »*.

### F0.10 — Consultation en invité
- **AN** : ouvre un lien de direct partagé sur WhatsApp → regarde le direct sans compte, voit le prix, le stock et le badge → au moment du « Je prends », inscription en 2 écrans → **sa place dans la file est conservée pendant l'inscription.** Point critique : perdre l'article pendant l'inscription tue la première conversion.

---

# ÉPIQUE 1 — Catalogue, articles et stock

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F1.1 | Créer un article (photos, nom, prix, description) | P1 | M |
| F1.2 | Variantes taille / couleur, stock par variante | P1 | M |
| F1.3 | Création rapide en lot depuis la galerie photo | P1 | S |
| F1.4 | Catégories et attributs mode (matière, marque, coupe) | P1 | S |
| F1.5 | Guide des tailles par marque + repères de mesure | P2 | S |
| F1.6 | Gestion de stock : entrée, sortie, alerte de rupture | P1 | M |
| F1.7 | États d'un article : brouillon, en ligne, masqué, épuisé | P1 | M |
| F1.8 | Duplication d'un article | P1 | C |
| F1.9 | Prix barré / promotion sur un article | P1 | S |
| F1.10 | **Réservation temporaire du stock (minuteur)** | P1 | M |
| F1.11 | Vitrine publique du vendeur, ouverte 24 h/24 | P1 | M |
| F1.12 | Réorganisation de la vitrine (épinglage, ordre) | P2 | C |
| F1.13 | Import d'un catalogue existant (tableur / photos en masse) | P2 | C |
| F1.14 | Pièce unique (stock = 1, comportement spécifique) | P1 | S |
| F1.15 | **Achat immédiat depuis la fiche article, hors direct** | P1 | M |
| F1.16 | **Ajout au panier depuis le catalogue, réservation longue** | P1 | M |
| F1.17 | **Dépôt d'annonce par un particulier** | P1 | S |
| F1.18 | **Fiche enrichie hors live : état, mesures réelles, photos multiples** | P1 | M |
| F1.19 | **Vitrine « catalogue d'abord » — vendre 24 h/24 sans direct** | P1 | M |
| F1.20 | Questions publiques sur une fiche article | P2 | S |

### F1.1 / F1.2 — Créer un article avec variantes
- **V** : « + Article » → prend ou choisit 1 à 5 photos → recadrage carré → nom → prix → catégorie → **grille de variantes** : coche les tailles (S/M/L/XL ou 36→44) et saisit une quantité par taille → couleurs si besoin → « Mettre en ligne ».
- **V (raccourci direct)** : pendant un direct, création express en 3 champs — photo, prix, quantité — le reste se complète après. *Sans ce raccourci, aucune vendeuse ne créera de fiche en plein direct.*
- **VE** : peut créer et modifier des articles, **ne peut pas modifier le prix** (permission séparée, voir `F10.4`).
- **A** : voit la fiche avec les tailles disponibles ; une taille en rupture est barrée, pas cachée — ça permet de demander une alerte (`F7.4`).

### F1.6 — Gestion du stock
- **V** : écran « Stock » → liste triée par quantité croissante → modification en ligne d'une quantité → historique des mouvements (vente, retour, correction manuelle, réservation expirée).
- **Alerte** : notification quand une variante passe sous un seuil défini par la vendeuse.
- **Cohérence** : le stock affiché en direct (`F2.5`) est le stock réel **moins** les réservations en cours.

### F1.10 — Réservation temporaire du stock ⚠️
**La fonctionnalité technique la plus importante de la phase 1.** C'est elle qui empêche la survente pendant un direct où tout part en même temps.

- **A** : appuie sur « Je prends » → l'article est **bloqué pour elle pendant N minutes** → un minuteur visible s'affiche (« Réservé 4:32 ») → si elle paie, la réservation devient une commande ; si le minuteur expire, l'article retourne au stock et elle reçoit une notification *« Votre réservation a expiré »*.
- **V** : voit en temps réel, dans son panneau de direct, les réservations en cours et lesquelles se transforment en paiement.
- **Autre acheteuse** : voit le stock déjà décrémenté — elle ne peut pas prendre un article réservé.
- **⚠️ À trancher au pilote** : la durée N. Trop courte, on perd des acheteuses lentes à payer ; trop longue, on gèle le stock pendant le pic du direct. Hypothèse de départ : 5 minutes en direct, 30 minutes sur le catalogue.

### F1.14 — Pièce unique
- **V** : coche « pièce unique » → l'article ne peut être réservé que par une seule personne, et l'interface l'annonce (« Une seule pièce »).
- **A** : voit le marqueur ; c'est le moteur d'urgence naturel du direct, sans avoir à inventer une fausse rareté (cf. slide 15, point 4).

### F1.11 — Vitrine publique 24 h/24
- **A** : depuis un direct, un article ou une recherche → arrive sur la boutique → onglets « Articles / Directs / Avis / À propos » → badge, score de confiance, délai d'expédition moyen, nombre de ventes.
- **AN** : accède à la vitrine par un lien partagé, sans compte.
- **V** : partage le lien de sa vitrine sur Facebook et WhatsApp — **c'est son canal d'acquisition principal**, il doit être en un appui depuis son tableau de bord.

---

## La vente hors direct — F1.15 à F1.20

> **Le direct n'est plus la seule façon de vendre.** Un vendeur publie une fiche, l'acheteuse achète quand elle veut — comme sur Vinted. Le direct devient un **accélérateur** de ce catalogue, pas la condition d'existence des ventes.
>
> Pourquoi c'est structurant : un vendeur qui ne fait qu'un direct par semaine ne vend que quatre soirs par mois. Avec la vente hors direct, il vend 30 jours sur 30, et la plateforme a une raison d'être ouverte à 10 h du matin. C'est aussi la seule porte d'entrée réaliste pour le **vendeur particulier** (`F1.17`), qui ne se filmera jamais en direct.

### F1.15 — Achat immédiat depuis la fiche article
- **A** : navigue dans le fil, la recherche ou une vitrine → ouvre une fiche → voit photos, prix, tailles disponibles, état, mesures, délai d'expédition, badge du vendeur → **[ JE PRENDS ]** → même feuille que le direct (taille, quantité, livraison, total avec frais) → paie. **Le parcours de paiement, de séquestre, de livraison et de litige est identique au direct** : aucune règle spécifique, aucun code en double (`F3.14`).
- **A (pièce unique)** : sur un article `piece_unique` (`F1.14`), l'achat immédiat est le comportement par défaut — pas de choix de quantité, pas de variante.
- **V** : reçoit une notification « Nouvelle commande » sans être en direct ; l'article apparaît dans « À préparer ». **Point d'attention** : hors direct, le vendeur n'est pas devant son téléphone. Le délai d'acceptation doit donc être plus long qu'en direct, et l'acheteuse doit voir un délai d'expédition annoncé (`F5.9`) avant de payer, sinon elle croit à un abandon.
- **AN** : arrive par un lien partagé sur WhatsApp → voit la fiche complète sans compte → l'inscription se déclenche au « Je prends ».

### F1.16 — Ajout au panier et réservation longue
- **A** : « Ajouter au panier » depuis la fiche → l'article est **réservé pour une durée longue** (hypothèse : 30 minutes, contre 5 en direct — `F1.10`) → elle continue à naviguer, cumule plusieurs vendeurs, paie une fois (`F3.1`).
- **Différence assumée avec le direct** : hors direct il n'y a pas de pic ni de rareté à l'instant ; geler un article 30 minutes ne coûte presque rien et évite de perdre le panier. La durée est un paramètre distinct (`F11.6`), pas la même valeur que celle du direct.
- **A (panier expiré)** : notification unique *« Votre panier a expiré »* avec un bouton « Reprendre » si le stock est encore là (`F17.12` encadre le nombre de rappels).

### F1.17 — Dépôt d'annonce par un particulier
**Le parcours qui ouvre JP aux gens qui n'ont pas de boutique.** Miora importe et revend ; Hanta veut juste vendre trois robes qu'elle ne met plus. Ce ne sont pas les mêmes personnes, et ce n'est pas le même formulaire.

- **A → particulier** : depuis « Moi » ou son dressing (`F17.10`) → « Vendre un article que je ne porte plus » → **4 champs : photos, prix, taille, état** → en ligne en moins d'une minute. Stock à 1 par défaut, pièce unique.
- **Vérification allégée** : il peut publier et recevoir des commandes sans KYC complet ; **la vérification (`F0.6`) est exigée au premier encaissement**, pas avant. Sinon on demande une CIN et un selfie à quelqu'un qui n'est pas sûr de vouloir vendre — et il part.
- **A (acheteuse)** : voit clairement qu'elle achète à un **particulier** et non à une boutique : badge distinct, mention du délai d'expédition, pas de politique de retour commerciale. La protection reste la même (séquestre, litige) — c'est justement ce qui rend l'achat à un inconnu acceptable.
- **⚠️ À trancher** : le seuil de bascule particulier → vendeur (nombre de ventes ou montant cumulé sur 90 jours), et le taux de commission appliqué au particulier, qui n'est pas forcément celui d'une boutique (`F10.2`).

### F1.18 — Fiche enrichie pour la vente hors live
Sans démonstration vidéo, la fiche porte seule la charge de la confiance. Elle doit répondre aux questions qu'on posait au vendeur en direct.

- **V / particulier** : renseigne **l'état** (neuf avec étiquette / très bon / bon / correct), les **mesures réelles** (épaules, poitrine, taille, longueur — les mesures comptent plus que l'étiquette de taille sur des vêtements importés), la matière, la marque, la raison de la vente pour un particulier, et **au moins 5 photos** dont une de l'étiquette et une des défauts éventuels.
- **A** : compare les mesures aux siennes (`F0.5`) → réduit le risque de retour pour cause de taille, première cause de litige (`F5.8`).
- **Règle** : les mesures sont **facultatives mais mises en avant** — un article mesuré est signalé comme tel et remonte dans le tri. On incite, on n'interdit pas.

### F1.19 — Vitrine « catalogue d'abord »
- **V** : sa vitrine est vendeuse en permanence. Le bandeau « en direct » n'est qu'un état temporaire ; hors direct, la vitrine présente le catalogue, les promotions en cours (`F7.22`), les événements auxquels elle participe (`F20.2`) et son prochain rendez-vous (`F17.4`).
- **A** : peut acheter à 6 h du matin. **C'est ce qui fait passer JP d'une application d'événements à une application de commerce.**
- **Mesure à suivre** : la part du chiffre d'affaires réalisée hors direct. Si elle reste marginale, la promesse « vendre 24 h/24 » est décorative ; si elle dépasse le direct, le produit a changé de nature et la stratégie de contenu doit suivre.

### F1.20 — Questions publiques sur une fiche
- **A** : pose une question sous la fiche (« ça taille grand ? ») → le vendeur répond → **la réponse est publique** et sert aux acheteuses suivantes.
- **Pourquoi public et pas en message privé** : cela évite de rouvrir la messagerie libre (`F7.14`), et une réponse écrite une fois sert cent fois. Modération identique aux commentaires (`F19.1`).

---

# ÉPIQUE 2 — Le direct

Le cœur du produit. Slides 7, 8, 15.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F2.1 | Planifier un direct (date, heure, titre, affiche) | P1 | S |
| F2.2 | Notification aux abonnés avant et au démarrage | P2 | M |
| F2.3 | Démarrer / arrêter un direct depuis le téléphone | P1 | M |
| F2.4 | Sélectionner l'article « à l'écran maintenant » | P1 | M |
| F2.5 | Bandeau prix + stock restant en temps réel | P1 | M |
| F2.6 | **Le bouton « Je prends »** | P1 | M |
| F2.7 | File d'ordre d'arrivée sur un article | P1 | M |
| F2.8 | Feuille rapide quantité / taille / livraison | P1 | M |
| F2.9 | Minuteur de réservation visible | P1 | M |
| F2.10 | Chat du direct | P1 | S |
| F2.11 | Modération du chat (masquer, bloquer, mots interdits) | P1 | S |
| F2.12 | Compteur de spectateurs et réactions | P1 | C |
| F2.13 | Qualité adaptative et reprise après coupure réseau | P1 | M |
| F2.14 | Panneau vendeur en direct (commandes qui tombent) | P1 | M |
| F2.15 | Bilan de fin de direct | P1 | S |
| F2.16 | **Replay achetable, articles repérés à la minute** | P2 | S |
| F2.17 | Direct à deux (co-animation, catalogue partagé) | P3 | W |
| F2.18 | Vente flash à compte à rebours | P3 | W |
| F2.19 | Enchère en direct | P3 | W |
| F2.20 | Épingler un message dans le chat | P1 | C |
| F2.21 | Rediffusion simultanée vers Facebook ⚠️ | P2 | S |

### F2.3 — Démarrer un direct
- **V** : « Passer en direct » → titre → sélection des articles préparés pour la soirée (une liste de côté) → vérification de la connexion → compte à rebours 3-2-1 → en ligne. Notification envoyée à ses abonnés (`F2.2`).
- **A** : reçoit la notification → un appui → elle est dans le direct.
- **AN** : voit le direct dans le fil public ou par un lien partagé.

### F2.4 / F2.5 — Article à l'écran et bandeau
- **V** : pendant le direct, un tiroir latéral avec ses articles préparés → elle appuie sur celui qu'elle montre → il devient « à l'écran ». Elle peut modifier le prix en un appui (négociation en direct).
- **A** : voit en bas de l'écran un bandeau : photo miniature, nom, **prix**, **taille disponible**, **« il en reste 3 »**, et le bouton « Je prends ». Le compteur décroît en direct quand d'autres achètent — **c'est le moteur de conversion.**

### F2.6 / F2.8 / F2.9 — Le geste central : « Je prends »
Slide 7. Tout le produit tient dans ce parcours ; il doit tenir sous 30 secondes.

- **A** : appuie sur **[ JE PRENDS ]** → une feuille remonte du bas, **le direct continue à jouer au-dessus** → taille (sa taille habituelle est présélectionnée depuis `F0.5`) → quantité → livraison (domicile / point relais, dernier choix mémorisé) → **le total avec frais de livraison est affiché ici, pas plus tard** → « Payer » → `F4.1`.
- **A (variante « je continue à regarder »)** : bouton « Ajouter au panier » au lieu de payer → l'article reste réservé, elle continue le direct et paie tout à la fin en un seul paiement (`F3.1`). **Ce chemin est essentiel : il augmente le panier et évite 5 paiements mobile money d'affilée.**
- **AN** : appuie sur « Je prends » → inscription express (`F0.10`) → **sa réservation est déjà posée pendant l'inscription** → reprend au choix de la taille.
- **V** : voit la commande tomber dans son panneau (`F2.14`), avec le prénom de l'acheteuse — elle peut la remercier à voix haute. *Détail mineur, effet énorme sur l'ambiance du direct.*
- **Cas d'échec** : l'article part pendant qu'elle choisit sa taille → message immédiat *« Désolé, le dernier vient de partir »* + proposition « Prévenez-moi si ça revient » (`F7.4`).

### F2.7 — File d'ordre d'arrivée
- **A** : si deux acheteuses appuient à la même seconde sur la dernière pièce, l'horodatage serveur tranche. La seconde voit *« Vous êtes 2e sur la liste d'attente — si la réservation expire, c'est pour vous. »*
- **A (2e de la file)** : reçoit une notification si la première ne paie pas dans le délai. **C'est la réponse directe au problème du stock gelé (slide 4).**

### F2.10 / F2.11 — Chat et modération
- **A** : écrit dans le chat pour poser une question (matière, longueur, autre couleur).
- **V** : voit le chat ; peut masquer un message, bloquer un utilisateur, épingler une info (`F2.20`). Liste de mots interdits automatique.
- **VE** : peut modérer le chat pendant que la vendeuse parle. Rôle réel dans les directs actuels — à supporter dès la phase 1.
ou dans le directe dans le lateral ou clique sur produit et on vois tout son decription avec de photo
### F2.13 — Reprise après coupure
- **V** : sa connexion tombe → le direct passe en pause avec un message aux spectateurs (*« Connexion en cours de rétablissement »*) → si elle revient sous 2 minutes, le direct reprend **avec les mêmes spectateurs et les mêmes réservations en cours**. Au-delà, le direct est clôturé et un bilan est généré.
- **A** : son minuteur de réservation est **suspendu** pendant la coupure. Sinon elle perd un article pour un problème réseau qui n'est pas le sien.

### F2.14 — Panneau vendeur en direct
- **V** : un tiroir avec, en temps réel : spectateurs, réservations en cours, commandes payées, **chiffre d'affaires de la soirée qui monte**. Le chiffre qui monte est la fonctionnalité de rétention n° 1 côté vendeur.

### F2.15 — Bilan de fin de direct
- **V** : à l'arrêt, un écran récapitulatif : durée, spectateurs, pic d'audience, articles vendus, chiffre d'affaires, taux de conversion, réservations expirées, **articles qui ont eu du chat mais pas de vente** (signal de prix trop haut). Bouton « Partager mon bilan » et « Programmer le prochain direct ».

### F2.16 — Le replay achetable
Slide 15, point 1. Le différenciateur le plus fort de la phase 2.

- **V** : le direct terminé est enregistré ; les articles sont **automatiquement repérés à la minute où elle les a mis à l'écran** (donnée déjà produite par `F2.4` — aucune saisie manuelle). Elle peut corriger un marqueur.
- **A** : ouvre le replay → une frise sous la vidéo montre les articles → appui sur un article → saut à la minute → « Je prends » fonctionne exactement comme en direct, sur le stock restant.
- **AN** : arrive sur un replay partagé plusieurs jours après — **le direct ne meurt plus à minuit.**

### F2.21 — Rediffusion vers Facebook ⚠️
- **V** : diffuse simultanément sur JP et sur sa page Facebook, avec le lien JP épinglé en commentaire.
- **⚠️ Décision stratégique** : c'est le pont indispensable au démarrage (l'audience est sur Facebook), mais ça retarde la migration vers JP. Recommandation : l'activer en phase de lancement, mesurer le taux de bascule, le restreindre ensuite aux paliers d'abonnement payants.

---

# ÉPIQUE 3 — Panier et commande

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F3.1 | Panier multi-articles et multi-vendeurs | P1 | M |
| F3.2 | Récapitulatif : sous-total, livraison, remise, total | P1 | M |
| F3.3 | Carnet d'adresses de livraison | P1 | M |
| F3.4 | Choix domicile / point relais | P1 | M |
| F3.5 | Calcul des frais de livraison par zone | P1 | M |
| F3.6 | Application d'un code promo ou d'un crédit fidélité | P2 | S |
| F3.7 | Création de commande et numéro de commande | P1 | M |
| F3.8 | Annulation par l'acheteuse avant expédition | P1 | S |
| F3.9 | Annulation / refus par le vendeur | P1 | S |
| F3.10 | Expiration de réservation → remise en stock automatique | P1 | M |
| F3.11 | Note à l'attention du vendeur | P1 | C |
| F3.12 | Commande cadeau (adresse d'un tiers) | P2 | C |
| F3.13 | Panier entre amies (partage des frais) | P3 | W |
| F3.14 | **Commande hors direct — parcours complet identique** | P1 | M |
| F3.15 | **Application d'une promotion et d'un rang client au panier** | P1 | M |

### F3.1 / F3.2 — Le panier
- **A** : accumule des articles de plusieurs vendeuses pendant la soirée → le panier **regroupe par vendeuse**, car les frais de livraison et l'expédition sont par vendeuse → un seul paiement pour l'ensemble.
- **Point d'attention** : les frais de livraison doivent être affichés **par vendeuse et cumulés**, sinon l'acheteuse découvre à la fin qu'elle paie trois livraisons. Proposer alors : « Regrouper au même point relais et économiser X Ar ».

### F3.4 / F3.5 — Domicile ou point relais
Slide 14.

- **A (domicile)** : choisit une adresse enregistrée, ou en ajoute une (quartier, repère — *pas de code postal, l'adressage se fait par repères*), numéro de téléphone du destinataire. Frais calculés par zone.
- **A (point relais)** : voit une liste triée par proximité, avec horaires et photo de la devanture. Choisit. **Pas d'adresse personnelle demandée.**
- **V** : voit le mode choisi sur le bordereau ; en point relais elle dépose plusieurs colis en un trajet (`F5.6`).
- **PR** : n'intervient pas encore à cette étape.

### F3.10 — Expiration de réservation
- **A** : notification *« Votre réservation de [article] a expiré »* avec un bouton « Reprendre » si le stock est encore là.
- **V** : voit la ligne passer en « expirée » dans son panneau ; l'article revient au stock immédiatement.
- **A (2e de la file)** : notifiée que l'article est disponible (`F2.7`).
- **OP** : le taux de réservations expirées est un des quatre indicateurs de la slide 6 — il doit remonter dans le tableau de bord pilote (`F11.7`).

### F3.9 — Refus par le vendeur
- **V** : cas réel — elle s'est trompée de stock, l'article est abîmé. Elle annule la commande, choisit un motif, **le remboursement est automatique et intégral**. Un taux d'annulation vendeur élevé pèse sur son score de confiance (`F6.2`).
- **A** : notifiée, remboursée, invitée à laisser un avis sur l'incident.

### F3.14 — Commande hors direct
**Rien de nouveau, et c'est le but.** Une commande née d'une fiche article suit exactement la même machine à états qu'une commande née d'un direct : réservation, paiement, séquestre, statuts de livraison, confirmation de réception, litige, avis. Le canal d'origine est une simple donnée (`origine = direct | catalogue | clip | story | evenement`), utile aux statistiques (`F9.2`) et à l'attribution d'affiliation (`F15.4`), jamais aux règles métier.

- **V** : voit dans « À préparer » les commandes des deux origines dans une même file, avec un marqueur d'origine.
- **OP** : suit le taux de conversion et le délai d'expédition **par origine** — c'est ce qui dira si la vente hors direct tient ses promesses.
- **Règle** : toute règle qui ne s'appliquerait qu'à une origine doit être explicitement justifiée. Deux existent aujourd'hui, et deux seulement : la **durée de réservation** (`F1.16`) et le **délai d'acceptation par le vendeur** (`F1.15`).

### F3.15 — Promotion et rang client dans le panier
- **A** : voit dans le récapitulatif (`F3.2`) une ligne de remise nommée : *« Promo Noël −20 % »*, *« Avantage cliente Or : livraison offerte »*, ou *« Code MERCI10 »*. Le calcul est fait **côté serveur**, jamais côté client.
- **Règle de cumul (`R-U`)** : si plusieurs remises sont éligibles sur la même ligne, **une seule s'applique — la plus favorable à l'acheteuse**. Jamais d'addition. La remise retenue est tracée sur la ligne de commande, pour la facture (`F4.11`) et pour le litige.
- **V** : voit sur sa commande le montant de la remise qu'elle a consentie et le net qui lui revient, commission déduite. **Une remise découverte après coup sur le décompte a le même effet destructeur qu'une commission cachée** (`F10.1`).

---

# ÉPIQUE 4 — Paiement et argent

Slide 11. C'est ici que se joue la proposition de valeur.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F4.1 | Paiement MVola / Orange Money / Airtel Money ⚠️ | P1 | M |
| F4.2 | Paiement par carte bancaire (agrégateur) ⚠️ | P1 | S |
| F4.3 | **Paiement à la livraison** ⚠️ | P1 | M |
| F4.4 | Séquestre : les fonds sont retenus par JP | P1 | M |
| F4.5 | Libération à la confirmation de réception | P1 | M |
| F4.6 | Libération automatique après délai sans contestation | P1 | M |
| F4.7 | Remboursement total ou partiel | P1 | M |
| F4.8 | Portefeuille vendeur et retrait vers mobile money | P1 | M |
| F4.9 | Relevé des commissions prélevées | P1 | S |
| F4.10 | Reprise après échec de paiement | P1 | M |
| F4.11 | Facture PDF horodatée, des deux côtés | P1 | M |
| F4.12 | Acompte + solde à la livraison ⚠️ | P2 | S |
| F4.13 | Historique de tous les mouvements | P1 | S |

### F4.1 — Paiement mobile money
- **A** : « Payer » → choisit son opérateur (celui de son numéro est présélectionné) → confirme le montant → **reçoit la demande de validation sur son téléphone (USSD ou notification opérateur)** → saisit son code → retour dans l'app → écran de confirmation avec le numéro de commande.
- **Point critique** : pendant l'attente de confirmation opérateur (jusqu'à 60 s), afficher un écran d'attente explicite avec le minuteur de réservation **suspendu**. Ne jamais laisser un écran figé — c'est là que l'acheteuse croit avoir perdu son argent.
- **V** : notification « Commande payée » avec le montant net (commission déduite, affichée).

### F4.3 — Paiement à la livraison ⚠️
**Non prévu dans le deck. Probablement la fonctionnalité la plus déterminante du lancement.**

- **A** : choisit « Payer à la réception » → la commande est créée sans paiement → elle paie en espèces au livreur ou au point relais.
- **V** : voit le mode de paiement sur le bordereau ; **elle porte le risque du refus à la livraison**, sauf mécanisme de couverture.
- **L / PR** : encaisse les espèces, saisit le montant reçu, remet le colis. Les espèces sont reversées à JP lors de la réconciliation (`F11.5`).
- **⚠️ À trancher** : ce mode annule le séquestre et déplace le risque sur le vendeur et la logistique. Trois options à tester au pilote — (a) le réserver aux acheteuses ayant déjà une commande honorée, (b) le limiter aux points relais uniquement, moins coûteux que le domicile, (c) exiger un acompte mobile money couvrant les frais de livraison (`F4.12`). Sans réponse à cette question, une part importante de la demande reste inaccessible.

### F4.4 / F4.5 / F4.6 — Le séquestre
**C'est le mécanisme qui matérialise la promesse « ton argent n'est pas perdu ».**

- **A** : après paiement, voit clairement *« Votre argent est gardé par JP. [Vendeuse] sera payée quand vous confirmerez avoir reçu. »* Cette phrase doit être visible à l'écran de confirmation, pas enfouie dans les CGU.
- **A (réception)** : reçoit le colis → notification « Avez-vous bien reçu ? » → « Oui, tout va bien » → les fonds sont libérés → invitation à laisser un avis (`F6.1`).
- **A (problème)** : « Il y a un problème » → ouvre un litige (`F6.3`) → **les fonds restent bloqués.**
- **V** : voit dans son portefeuille deux soldes distincts : **« en attente de confirmation »** et **« disponible au retrait »**. La distinction doit être limpide, sinon elle croit qu'on la vole.
- **F4.6** : sans réponse de l'acheteuse après N jours suivant la livraison confirmée, les fonds sont libérés automatiquement. ⚠️ N à caler — hypothèse : 3 jours après remise. Sans cette règle, les vendeuses attendent indéfiniment et quittent la plateforme.
- **OP** : voit l'encours total séquestré — donnée réglementaire sensible, à cadrer avec le partenaire de paiement (slide 11 le mentionne déjà).

### F4.8 — Portefeuille et retrait
- **V** : écran « Mon argent » → solde disponible → « Retirer » → vers son numéro mobile money **vérifié** (`F0.6`) → confirmation → reçu.
- **⚠️ À trancher** : retrait à la demande ou versement automatique hebdomadaire ? Les frais mobile money par transaction plaident pour un regroupement ; la trésorerie de la vendeuse plaide pour l'instantané. Hypothèse : retrait à la demande, gratuit une fois par semaine, payant au-delà.

### F4.11 — Facture
- **A** : facture PDF avec numéro, date, articles, prix unitaires, frais de livraison, total, identité du vendeur vérifié, mention JP. Consultable et téléchargeable depuis la commande.
- **V** : même facture de son côté, plus le détail de la commission. Les factures sont exportables pour sa comptabilité.
- **Note** : la facture n'est pas un document administratif, c'est **une preuve psychologique**. Elle doit être belle et partageable.

---

# ÉPIQUE 5 — Livraison

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F5.1 | Bordereau de préparation / étiquette colis | P1 | M |
| F5.2 | Statuts de livraison partagés des deux côtés | P1 | M |
| F5.3 | Réseau de points relais : carte, horaires, fiche | P1 | M |
| F5.4 | Code de retrait à usage unique | P1 | M |
| F5.5 | Application livreur : tournée, scan, preuve de remise | P1 | S |
| F5.6 | Regroupement des colis d'un même vendeur | P1 | S |
| F5.7 | Échec de livraison et retour | P1 | S |
| F5.8 | Retour produit pour cause de taille | P2 | S |
| F5.9 | Estimation du délai affichée avant l'achat | P1 | S |
| F5.10 | Application point relais : réception, stock, remise | P1 | M |

### F5.2 — Statuts partagés
Statuts communs : `Payée` → `En préparation` → `Remise au transport` → `En cours de livraison` / `Arrivée au point relais` → `Livrée` → `Confirmée`.
- **A** : voit une frise dans sa commande, avec notification à chaque changement. **C'est la réponse directe au « plus de nouvelles » de la slide 4.**
- **V** : fait avancer les statuts qui la concernent ; les autres sont mis à jour par **L** ou **PR**.

### F5.3 / F5.4 / F5.10 — Point relais
- **A** : choisit son relais → à l'arrivée du colis, reçoit une notification **et un SMS** avec un **code à 6 chiffres** → passe quand elle veut → donne le code → repart avec le colis.
- **PR** : app simple → « Réception » : scanne ou saisit le numéro de colis, le colis entre en stock → « Remise » : saisit le code donné par l'acheteuse, confirme, le statut passe à `Livrée` → écran « Colis en attente » avec les délais de garde.
- **L** : dépose plusieurs colis d'un coup au relais, une seule validation.
- **⚠️ Délai de garde** : au-delà de X jours, le colis repart chez le vendeur (`F5.7`). X à caler avec les relais.

### F5.5 — Application livreur
- **L** : se connecte → « Ma tournée du jour » → liste ordonnée : enlèvements chez les vendeurs, puis remises → à chaque point, appuie sur « Arrivé » → à la remise, **photo du colis remis ou code de l'acheteuse** → si paiement à la livraison (`F4.3`), saisit le montant encaissé → passe au suivant.
- **A** : voit le nom et le numéro du livreur quand la course démarre.
- **V** : voit que ses colis ont bien été enlevés.

### F5.8 — Retour pour cause de taille
Slide 15, point 2 : la première cause de litige dans le vestimentaire.
- **A** : dans sa commande livrée → « La taille ne va pas » → choisit : échange contre une autre taille (si dispo) ou remboursement → dépose le colis au point relais → à réception par le vendeur, échange expédié ou remboursement déclenché.
- **V** : accepte ou conteste ; règles définies dans sa politique de retour, affichée sur sa vitrine.
- **⚠️** : qui paie le retour ? À trancher — c'est un coût réel sur des paniers faibles.

---

# ÉPIQUE 6 — Confiance, avis et litiges

Slide 11. L'antidote à la slide 4.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F6.1 | Avis vérifiés (seul un acheteur ayant payé peut noter) | P2 | M |
| F6.2 | Score de confiance vendeur, public | P2 | M |
| F6.3 | Signalement d'un litige sur une commande | P1 | M |
| F6.4 | Fil de litige avec pièces jointes (photos) | P1 | M |
| F6.5 | Arbitrage par l'équipe JP, décision tracée | P1 | M |
| F6.6 | Historique complet consultable des deux côtés | P1 | M |
| F6.7 | Signalement d'un contenu ou d'un utilisateur | P1 | S |
| F6.8 | Sanctions vendeur : avertissement, gel, suspension | P1 | S |
| F6.9 | Réponse publique du vendeur à un avis | P2 | C |
| F6.10 | Avis avec photo portée et morphologie | P2 | S |

### F6.1 / F6.10 — Avis vérifiés
- **A** : 2 jours après confirmation de réception → notification → note sur 5, commentaire, **photo optionnelle du vêtement porté**, et « Conforme à la taille / taille petit / taille grand ». Impossible de noter sans avoir payé.
- **A (autre acheteuse)** : voit les avis filtrés par morphologie proche de la sienne — slide 15, point 2. C'est ce qui réduit les retours.
- **V** : notifiée, peut répondre publiquement une fois (`F6.9`).

### F6.2 — Score de confiance
- Calculé sur : ventes honorées, délai d'expédition réel, taux d'annulation vendeur, taux de litige, issue des litiges.
- **A** : voit le score sur la vitrine et sur chaque direct — **c'est ce qui remplace la recommandation d'une amie**, donc c'est le mécanisme central de croissance.
- **V** : voit son score, **et surtout ce qui le fait monter ou baisser**, avec des conseils concrets (« expédiez sous 24 h pour gagner 0,2 »). Le score doit être un objectif motivant, pas une sanction opaque.

### F6.3 / F6.4 / F6.5 — Litige
Point culturel clé : **le litige se signale à JP, jamais en face à face avec le vendeur.** Cela évite la confrontation, socialement coûteuse, qui fait que les gens abandonnent au lieu de réclamer.

- **A** : commande → « Il y a un problème » → motif (non reçu / abîmé / pas conforme / mauvaise taille / autre) → photos → description → envoi. **Les fonds restent bloqués.** Elle reçoit un numéro de dossier.
- **V** : notifiée, voit le motif et les photos, répond dans le même fil, propose une solution (renvoi, remboursement partiel, geste commercial).
- **A / V** : si un accord est trouvé entre eux dans le fil, le dossier se clôt sans arbitrage.
- **OP** : si pas d'accord sous 48 h → arbitrage. Voit l'historique complet des deux côtés (`F6.6`), les statuts de livraison, la preuve de remise, les échanges → tranche → **décision écrite, motivée, notifiée aux deux** → exécute le remboursement ou la libération des fonds.
- **Toutes les décisions sont archivées** et alimentent les scores (`F6.2`).

---

# ÉPIQUE 7 — Communauté et fidélité

Slide 12. Le moteur de rétention et de défendabilité.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
**Social et abonnements**

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F7.1 | Suivre / ne plus suivre un vendeur ou une créatrice | P1 | M |
| F7.2 | Fil des directs en cours et à venir | P1 | M |
| F7.3 | Notifications : direct, promo, retour en stock | P2 | M |
| F7.4 | Alerte « prévenez-moi quand c'est dispo » | P2 | S |
| F7.15 | **Écrans abonnés / abonnements, compteurs publics** | P1 | S |
| F7.16 | **Notification « nouvel abonné »** | P2 | C |
| F7.17 | **Fil « Abonnements » alimenté aussi par les nouveautés catalogue** | P1 | S |

**Fidélisation et classement clients**

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F7.5 | **Écran « Mes clientes » — CRM léger vendeur** | P2 | S |
| F7.6 | **Paliers de fidélité paramétrables par le vendeur** | P2 | S |
| F7.18 | **Moteur de rang client (score volume · fréquence · récence)** | P2 | S |
| F7.19 | **Rang visible côté acheteuse et progression vers le palier suivant** | P2 | S |
| F7.7 | Cagnotte : % de chaque achat en crédit | P3 | S |
| F7.10 | Accès anticipé à une collection | P2 | C |

**Promotions**

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F7.22 | **Promotion boutique — %, montant, livraison offerte** | P1 | S |
| F7.23 | **Notification automatique des abonnés au lancement d'une promotion** | P1 | S |
| F7.24 | **Promotion ciblée par rang (VIP / Or)** | P2 | S |
| F7.9 | **Code promo individuel envoyé à une cliente nommée** | P2 | C |
| F7.25 | **Centre « Mes offres » côté acheteuse** | P2 | S |
| F7.26 | **Règles de cumul et de priorité des remises** | P1 | M |
| F7.8 | Promotions programmées | P2 | S |

**Croissance**

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F7.11 | **Partage d'un direct / article vers WhatsApp et Facebook** | P1 | M |
| F7.12 | **Parrainage vendeur et parrainage acheteur** | P1 | M |
| F7.13 | Liste d'envies | P2 | C |
| F7.14 | Message privé acheteur ↔ vendeur ⚠️ | P2 | S |

### F7.3 — Notifications
- **A** : reçoit, selon ses réglages : « [Vendeuse] est en direct », « Nouvelle promotion », « L'article que vous attendiez est revenu », « Votre colis est arrivé au relais », « Votre réservation expire dans 2 minutes ».
- **Réglage fin obligatoire** : sinon, une acheteuse qui suit 15 vendeuses désinstalle l'application au bout d'une semaine. Regrouper les notifications de direct en une seule par soirée.
- **Fallback SMS** pour les notifications critiques (colis arrivé, code de retrait) — le push ne suffit pas sur des téléphones bas de gamme et des connexions intermittentes.

### F7.1 / F7.15 / F7.16 / F7.17 — Les abonnements
**L'abonnement est l'actif que le vendeur construit sur JP.** C'est aussi le canal qui rend les promotions (`F7.23`) et les événements (`F20.6`) possibles sans acheter de publicité. Un vendeur sans abonnés doit repartir de zéro à chaque direct.

- **A** : appuie sur « Suivre » depuis une vitrine, une fiche, un direct, un clip ou une story. Un seul appui, jamais de confirmation. Elle retrouve la liste dans « Moi → Abonnements », triable par activité récente.
- **A (F7.15)** : voit sur chaque vitrine le **nombre d'abonnés** — c'est un signal de confiance au même titre que le score (`F6.2`), et il est gratuit à produire.
- **V / C (F7.16)** : notification « [Prénom] vous suit », regroupée par jour au-delà de 5 par jour pour ne pas devenir du bruit. Le compteur d'abonnés est visible sur le tableau de bord, avec sa progression sur 30 jours — **c'est l'indicateur de rétention que le vendeur regarde le plus souvent.**
- **A (F7.17)** : le fil « Abonnements » ne montre pas seulement les directs. Il montre aussi les **nouveaux articles**, les **promotions** et les **événements** des boutiques suivies. Sans ça, une acheteuse qui suit une boutique ne vendant qu'hors direct ne voit jamais rien, et l'abonnement ne sert à rien.
- **Réciprocité** : suivre n'est pas symétrique et ne crée aucune obligation. Il n'y a pas de « demande d'abonnement » à accepter, sauf compte privé (`F19.10`).
- **Ce qui est visible** : le vendeur voit le prénom et la photo de ses abonnés, jamais leur email ni leur téléphone.

### F7.18 / F7.5 / F7.6 / F7.19 — Le classement des clients
**Ce que le vendeur veut savoir : à qui je dois faire un geste.** Pas un tableau de bord analytique — une liste de noms, ordonnée, avec une action possible à côté de chaque ligne.

**F7.18 — le moteur de rang.** Chaque couple (vendeur, cliente) porte un **score recalculé** à chaque commande confirmée, sur quatre composantes :
- **volume** — montant cumulé confirmé chez ce vendeur ;
- **fréquence** — nombre de commandes confirmées ;
- **récence** — date de la dernière commande, avec décote dans le temps : une cliente inactive depuis six mois ne doit pas rester « VIP » indéfiniment ;
- **fiabilité** — pénalité en cas d'annulations à répétition, de litiges perdus ou de retours systématiques.

Règles non négociables :
- Le score est **par vendeur**, jamais global. Une vendeuse n'a aucune raison de connaître ce que sa cliente dépense chez ses concurrentes. C'est une exigence de vie privée, pas un choix technique.
- Seules les commandes **confirmées** comptent. Une commande payée puis remboursée ne fabrique pas un VIP.
- Le calcul est **explicable en une phrase** à la cliente comme au vendeur. Un rang opaque produit le même rejet qu'un score de confiance opaque (`F6.2`).

**F7.6 — les paliers.** Le vendeur définit ses propres paliers (nom, seuil, avantage) : par défaut **Bronze / Argent / Or / VIP**, renommables. Les seuils sont exprimés en montant cumulé **et/ou** en nombre de commandes. Un vendeur qui ne veut pas de paliers n'en a pas : la fonctionnalité est désactivable, et la liste de clientes reste utile sans elle.

**F7.5 — l'écran « Mes clientes ».**
- **V** : liste ordonnée par rang → chaque ligne : prénom, photo, palier, montant cumulé, nombre de commandes, date de la dernière → tri et filtres (palier, inactives depuis X, meilleures du mois) → appui sur une ligne → **fiche client** : historique des commandes, tailles achetées, articles préférés, litiges éventuels, note privée.
- **V (l'action, qui est le point de tout l'écran)** : depuis la fiche ou depuis une sélection multiple → **« Offrir une promo »** (`F7.24`) ou **« Envoyer un code »** (`F7.9`). Une liste qu'on ne peut pas actionner ne sert à rien.
- **VE** : accès en lecture seule si le vendeur l'autorise, **sans les montants** (`F10.4`). L'employée prépare les colis, elle n'a pas à connaître le chiffre d'affaires par cliente.
- **Cas du démarrage** : un vendeur qui a trois clientes n'a pas besoin d'un classement. L'écran affiche alors simplement ses clientes et un message expliquant que les paliers s'activeront quand il y aura de quoi classer.

**F7.19 — côté acheteuse.**
- **A** : voit son palier sur la vitrine de la vendeuse (*« Vous êtes cliente Or chez Miora »*) et **la progression vers le suivant** (*« Encore 2 commandes pour devenir VIP »*), avec l'avantage à la clé.
- **Le statut visible est un levier de rétention plus fort que la remise elle-même** — à condition d'être vrai. Un palier annoncé sans avantage réel derrière est perçu comme une manipulation, et l'épique 17 en pose la règle générale.
- **A** : peut refuser d'apparaître dans les classements publics ; le rang reste visible du vendeur, pas des autres acheteuses (`F17.5` reste une exception assumée).

### F7.22 / F7.8 / F7.26 — La promotion boutique
- **V** : « Catalogue → Promotions → Nouvelle promotion » → **type** (pourcentage, montant fixe, livraison offerte) → **valeur** → **période** (immédiate ou programmée, `F7.8`) → **périmètre** (toute la boutique, une catégorie, une sélection d'articles) → **cible** (tous, mes abonnés, un palier, des clientes nommées) → écran de résumé qui annonce *« Vos 320 abonnés seront notifiés »* avec possibilité de couper la notification → « Lancer ».
- **A** : voit le prix barré et le nouveau prix (`F1.9`) sur la vignette, la fiche, le panier et la facture. **Le prix affiché est toujours le prix payé** — aucune remise « appliquée au paiement » qui apparaîtrait au dernier écran.
- **V (garde-fou)** : avant validation, l'app affiche **le net qui lui restera** sur un article représentatif : *« Robe 50 000 Ar → 40 000 Ar, commission 2 000 Ar, vous recevez 38 000 Ar. »* Une vendeuse qui découvre sa marge après coup n'en refait pas.
- **F7.26 — cumul** : une seule remise s'applique par ligne de commande, **la plus favorable à l'acheteuse**, jamais l'addition de deux. La règle est affichée au vendeur au moment où il crée une promotion susceptible de chevaucher une autre.
- **Fin de promotion** : retour automatique au prix d'origine, sans intervention. Un prix barré qui reste barré indéfiniment est un mensonge commercial, et il détruit l'effet de la promotion suivante.

### F7.23 — La notification aux abonnés
**C'est ce qui donne sa valeur à l'abonnement.** C'est aussi le mécanisme le plus facile à transformer en spam, donc celui qui doit être le plus encadré.

- **A** : reçoit *« Miora lance −20 % sur toute sa boutique jusqu'à dimanche »* → un appui → la vitrine filtrée sur les articles en promotion.
- **Plafonds** : **une notification de promotion par vendeur et par 24 h** ; au-delà de 3 promotions d'abonnements différents dans la même journée, elles sont **regroupées en un seul message** (*« 4 boutiques que vous suivez sont en promotion »*). Réglage fin par vendeur côté acheteuse : couper les promos d'une boutique sans se désabonner.
- **V** : voit le nombre d'abonnés notifiés, le nombre d'ouvertures et **les ventes générées** par la notification. Sans ce retour, il ne sait pas si ça marche et il en abuse.
- **Pourquoi le plafond n'est pas négociable** : une acheteuse qui suit 15 boutiques et reçoit 15 notifications coupe **toutes** les notifications de l'application — y compris « votre colis est arrivé au relais » et le code de retrait, qui sont les seules dont la plateforme a réellement besoin (`F7.3`).

### F7.24 / F7.9 / F7.25 — Les promotions ciblées
- **V (F7.24)** : depuis « Mes clientes » → sélectionne un palier (*« mes clientes Or et VIP »*) → crée une promotion réservée → **seules les clientes éligibles la voient**, et elles la voient nommément : *« Offre réservée aux clientes VIP de Miora »*. Une remise VIP visible de tous n'est plus un privilège.
- **V (F7.9)** : depuis la fiche d'une cliente → « Envoyer un code » → code à usage unique, montant, date d'expiration → notification personnelle. Usage réel : s'excuser d'un retard, remercier une grosse commande, faire revenir une cliente inactive depuis trois mois.
- **A (F7.25)** : écran **« Mes offres »** rassemblant ses codes, ses promotions éligibles par palier, sa cagnotte (`F7.7`) et les promotions en cours de ses boutiques suivies. Chaque offre porte sa date d'expiration et un bouton « Voir les articles ».
- **Éligibilité vérifiée côté serveur** : une promotion réservée à un palier est **refusée au paiement** si la cliente ne l'a plus, avec un message clair et sans faire échouer toute la commande.
- **⚠️ À trancher** : la promotion ciblée est-elle **découvrable** (visible sur la vitrine avec la mention « réservée aux clientes Or ») pour créer l'envie de progresser, ou **strictement privée** pour éviter la frustration ? Recommandation : visible mais grisée, avec la progression associée (`F7.19`) — le palier ne motive que si on sait ce qu'on y gagne.

### F7.11 — Partage externe
**Sous-estimé, et pourtant c'est le canal d'acquisition principal.** L'audience est sur Facebook et WhatsApp ; il faut aller la chercher là où elle est.
- **V** : un appui → « Partager mon direct » → lien avec aperçu (photo, nom, « en direct maintenant ») vers Facebook, WhatsApp, Messenger.
- **A** : partage un article à une amie sur WhatsApp — **c'est la recommandation entre amies, numérisée, et c'est exactement le mécanisme de confiance décrit en slide 5.**
- **AN** : ouvre le lien → voit le contenu sans compte (`F0.10`) → convertit au « Je prends ».

### F7.12 — Parrainage
- **V** : « Inviter une vendeuse » → lien personnel → si la filleule réalise sa première vente, la marraine obtient un avantage (commission réduite un mois, mise en avant offerte).
- **A** : « Inviter une amie » → l'amie obtient une réduction sur sa première commande, la marraine un crédit à la livraison de cette commande.
- **OP** : suit le coût d'acquisition par parrainage contre acquisition payante — c'est une des hypothèses de la slide 18.

### F7.14 — Message privé ⚠️
- **⚠️ Décision** : la messagerie privée est ce que JP est censé remplacer (slide 3). Mais sans elle, les acheteuses retournent sur Messenger et la transaction sort de la plateforme. Recommandation : une messagerie **rattachée à une commande** uniquement, pas une messagerie libre. Les questions avant achat passent par le chat public du direct ou par les questions sur la fiche produit.

---

# ÉPIQUE 8 — Découverte, recherche et navigation

Slide 13.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F8.1 | Fil d'accueil : directs en cours, à venir, replays, articles | P1 | M |
| F8.2 | Recherche texte | P1 | S |
| F8.3 | Filtres : taille, couleur, marque, budget, catégorie | P1 | S |
| F8.4 | Tri : nouveauté, prix, popularité, score vendeur | P1 | C |
| F8.5 | Recommandations « à ma taille » | P2 | S |
| F8.6 | Mise en avant sponsorisée dans le fil et la recherche | P2 | S |
| F8.7 | Navigation par catégories | P1 | S |
| F8.8 | Recherches récentes et suggestions | P1 | C |

### F8.1 — Le fil
- **A** : à l'ouverture — en haut, les directs **en cours** de ses vendeuses suivies ; puis les directs en cours des autres ; puis « ce soir à 20 h » ; puis les replays récents ; puis des articles du catalogue.
- **AN** : même fil sans personnalisation, avec un bandeau expliquant JP en une phrase.

### F8.3 / F8.5 — Filtres et taille
- **A** : filtre par **sa** taille — c'est le filtre le plus utilisé dans le vestimentaire, il doit être en premier et pré-rempli depuis son profil (`F0.5`). Filtrer par budget est le second (afficher des fourchettes en Ariary adaptées au marché, pas des tranches génériques).

---

# ÉPIQUE 9 — Statistiques vendeur

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F9.1 | Tableau de bord : jour, semaine, mois | P1 | S |
| F9.2 | Performance par direct | P1 | S |
| F9.3 | Performance par article | P2 | S |
| F9.4 | Entonnoir spectateurs → « Je prends » → payé | P2 | S |
| F9.5 | Export des ventes (tableur) | P2 | C |
| F9.6 | Comparaison avec la période précédente | P2 | C |
| F9.7 | Heures et jours les plus rentables | P3 | C |

- **V** : ouvre « Mes ventes » → chiffre d'affaires, nombre de commandes, panier moyen, commissions, articles les plus vendus, tailles qui partent en premier. **L'information la plus actionnable : quelles tailles racheter.**
- **VE** : accès en lecture seule, sans les montants, si la vendeuse le décide (`F10.4`).

---

# ÉPIQUE 10 — Monétisation et abonnement vendeur

Slide 17.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F10.1 | Commission prélevée automatiquement au paiement | P1 | M |
| F10.2 | Barème de commission par catégorie / par palier ⚠️ | P1 | M |
| F10.3 | Paliers d'abonnement vendeur (dont un gratuit) | P2 | S |
| F10.4 | Comptes multi-utilisateurs et permissions | P2 | S |
| F10.5 | Achat d'une mise en avant (produit ou direct) | P2 | S |
| F10.6 | Direct premium : durée étendue, meilleure qualité, co-animation | P3 | W |
| F10.7 | Espace partenaire marque | P3 | W |
| F10.8 | Insights marché anonymisés, vendus aux marques | P3 | W |

### F10.1 / F10.2 — Commission
- **V** : voit la commission **avant** de mettre en ligne, et sur chaque commande, en clair : *« Vente 50 000 Ar — commission 2 500 Ar — vous recevez 47 500 Ar. »* Aucune surprise, jamais. Une commission découverte après coup est la première cause de désengagement.
- **⚠️ Slide 18** : le taux, et surtout **à partir de quel taux la vendeuse cherche à contourner la plateforme**, est l'hypothèse la plus importante à mesurer au pilote.

### F10.4 — Multi-utilisateurs
- **V (propriétaire)** : invite Fara par son numéro → choisit ses permissions : voir les commandes, préparer, modérer le chat, créer des articles — **jamais : voir le portefeuille, retirer l'argent, modifier les prix**.
- **VE** : se connecte avec son propre numéro, ne voit que ce qui lui est ouvert. **Sans séparation claire de l'argent, aucune vendeuse ne donnera d'accès à son employée.**

### F10.5 — Mise en avant
- **V** : « Mettre en avant ce direct » → budget, durée → paiement depuis son portefeuille → son direct apparaît en haut du fil, signalé « Sponsorisé ».
- **A** : voit la mention « Sponsorisé » — obligatoire pour ne pas abîmer la confiance, qui est l'actif du produit.

---

# ÉPIQUE 11 — Back-office JP

Non décrit dans le deck, mais toutes les promesses de la slide 11 reposent dessus.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F11.1 | File de vérification des vendeurs | P1 | M |
| F11.2 | Modération des contenus et des directs | P1 | M |
| F11.3 | Console d'arbitrage des litiges | P1 | M |
| F11.4 | Gestion du réseau de points relais | P1 | M |
| F11.5 | Réconciliation des paiements et des encaissements espèces | P1 | M |
| F11.6 | Paramètres : commissions, frais, durée de réservation, délais | P1 | M |
| F11.7 | **Tableau de bord des 4 indicateurs du pilote (slide 6)** | P1 | M |
| F11.8 | Recherche d'un utilisateur, d'une commande, d'un paiement | P1 | M |
| F11.9 | Journal d'audit de toutes les actions du back-office | P1 | S |
| F11.10 | Gestion des livreurs et des tournées | P1 | S |
| F11.11 | Envoi de notifications de masse | P2 | C |

### F11.7 — Le tableau de bord du pilote
Directement issu de la slide 6. Il doit exister **dès le premier direct**, sinon la slide 6 reste une promesse.
- **OP** : voit en continu — (1) commandes annoncées en direct jamais conclues, (2) temps administratif par heure de direct, (3) acheteuses ayant abandonné à l'étape paiement, (4) stock immobilisé par des réservations expirées. Plus les hypothèses de la slide 18 : taux de conversion, panier moyen, répartition domicile/relais, taux de litige, coût d'acquisition.

### F11.5 — Réconciliation
- **OP** : rapproche quotidiennement les paiements opérateurs, l'encours séquestré, les retraits vendeurs, les commissions et les espèces collectées par les livreurs et les relais. Écarts signalés.
- **L / PR** : reversent les espèces selon un rythme défini ; le solde dû est visible dans leur application.

---

# ÉPIQUE 12 — Assistant du vendeur (IA)

Slide 15, point 7. Phase 3.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F12.1 | Fiche produit rédigée depuis une photo | P3 | W |
| F12.2 | Réponses automatiques aux questions récurrentes du chat | P3 | W |
| F12.3 | Bilan de soirée commenté et conseils | P3 | W |
| F12.4 | Suggestion de prix à partir des ventes comparables | P3 | W |
| F12.5 | Insights marché pour les marques | P3 | W |

- **V (F12.1)** : photographie un article → l'assistant propose nom, catégorie, matière, description, tailles probables → elle corrige et valide. **Elle garde toujours le dernier mot** — une fiche publiée sans relecture abîmerait sa réputation.
- **V (F12.2)** : pendant le direct, les questions récurrentes (« c'est combien ? », « taille M dispo ? ») reçoivent une réponse automatique tirée de la fiche produit, signalée comme automatique. Elle garde la main sur le reste.
- **V (F12.3)** : après le direct, un résumé en langage clair : *« Vos robes sont parties en 4 minutes, les tailles L manquaient. Trois personnes ont demandé du 42. »*

---

# ÉPIQUE 13 — Socle technique et non-fonctionnel

Pas des fonctionnalités visibles, mais des conditions de survie sur ce marché.

| ID | Exigence | Phase | Prio |
|---|---|---|---|
| F13.1 | Fonctionnement sur Android bas de gamme, APK léger | P1 | M |
| F13.2 | Tolérance aux connexions lentes et intermittentes | P1 | M |
| F13.3 | Notifications push + **repli SMS** pour les messages critiques | P1 | M |
| F13.4 | Interface bilingue malgache / français, montants en Ariary | P1 | M |
| F13.5 | Consultation hors ligne des commandes et du code de retrait | P1 | S |
| F13.6 | Sécurité : chiffrement des pièces d'identité, accès tracés | P1 | M |
| F13.7 | Conformité à la loi malgache sur les données personnelles | P1 | M |
| F13.8 | Journalisation complète des transactions (preuve en litige) | P1 | M |
| F13.9 | Mesure d'usage et entonnoirs, dès le premier jour | P1 | M |
| F13.10 | Version web légère pour les acheteuses sans place de stockage | P2 | S |

---

# ÉPIQUE 14 — Contenu et fil social

> **Règle d'or, applicable à toute l'épique : aucun contenu ne peut être publié sans au moins un article achetable attaché.**
> JP n'est pas un réseau social avec une boutique. C'est **une boutique dont le catalogue est fait de vidéos**. Une fonctionnalité de cette épique qui ne mène pas à un achat n'a pas sa place dans le produit.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F14.1 | Story 24 h shoppable | P1 | M |
| F14.2 | Clip vertical court (« JP Clips ») | P1 | M |
| F14.3 | Fil « Pour toi » swipable et personnalisé | P1 | M |
| F14.4 | Enregistrement et montage simple dans l'application | P1 | S |
| F14.5 | **Attacher 1 à n articles à un contenu** | P1 | M |
| F14.6 | Post photo « look du jour » | P1 | S |
| F14.7 | **Unboxing — le geste central du social** | P1 | M |
| F14.8 | Avant / après essayage | P2 | S |
| F14.9 | Sondage « laquelle je prends ? » | P2 | S |
| F14.10 | Duo / réponse vidéo | P2 | C |
| F14.11 | Lookbook thématique | P2 | C |
| F14.12 | Hashtags et pages de hashtag | P1 | S |
| F14.13 | Bibliothèque de sons et de musique ⚠️ | P2 | S |
| F14.14 | Brouillons et publication programmée | P2 | C |
| F14.15 | Réactions, commentaires, partages sur un contenu | P1 | M |
| F14.16 | Enregistrer un contenu en favori | P1 | C |
| F14.17 | Statistiques d'un contenu (vues → clics → ventes) | P1 | M |
| F14.18 | Fil « Abonnements » séparé du fil « Pour toi » | P1 | S |
| F14.19 | Contenu épinglé sur le profil | P2 | C |
| F14.20 | Téléversement depuis la galerie | P1 | M |
| F14.21 | Sous-titres automatiques | P2 | S |

### F14.1 — Story 24 h shoppable
- **V / C** : appuie sur « + » → photo ou vidéo de 15 s → **attache un article** (obligatoire, `F14.5`) → publie. Disparaît après 24 h. Les stories sont la forme la moins coûteuse à produire : c'est celle qui remplira le fil au quotidien.
- **A** : voit les cercles des créatrices et vendeuses suivies en haut du fil → appuie → regarde → **une pastille produit flotte sur la story** → un appui ouvre la fiche → « Je prends ».
- **C** : voit qui a vu sa story et combien ont cliqué sur l'article.

### F14.2 / F14.3 — Clips et fil « Pour toi »
- **A** : ouvre l'onglet Clips → vidéos verticales plein écran, une par écran, **swipe vertical** → chaque clip porte en bas la pastille de l'article, le prix et le bouton « Je prends » → elle peut acheter **sans quitter le clip** (la feuille remonte, la vidéo continue derrière, comme en direct `F2.6`).
- **Personnalisation** : le fil est ordonné par sa taille (`F0.5`), son budget habituel, ses catégories, ses vendeuses suivies, et ce qu'elle a regardé jusqu'au bout. Une acheteuse en 42 ne doit pas voir défiler du 36 — c'est la première cause d'abandon d'un fil mode.
- **C / V** : publient un clip depuis « + » → sélection ou enregistrement → articles attachés → légende, hashtags → publier.
- **AN** : accède au fil sans compte (`F0.10`), avec conversion au « Je prends ».
- **Mode économie de données** (`F0.9`) : préchargement d'un seul clip à l'avance, qualité réduite, pas de lecture automatique en Wi-Fi absent.

### F14.5 — Attacher des articles à un contenu
**La fonctionnalité qui fait tenir toute la règle d'or.**
- **V** : attache ses propres articles.
- **C** : attache **les articles de n'importe quelle vendeuse** — c'est ce qui fait d'elle une affiliée (`F15.4`). L'article attaché porte son identifiant de créatrice, donc la vente lui est rattachée.
- **A** : attache l'article qu'elle a réellement acheté (son unboxing, son look) — vérifié depuis son historique de commandes, donc **impossible d'attacher un article qu'on n'a pas acheté**.
- **Règle** : publication impossible sans au moins un article. Le bouton « Publier » reste inactif.

### F14.7 — L'unboxing
**Le geste le plus important de la couche sociale.** Une action, cinq résultats.

- **A** : son colis arrive → notification *« Filmez l'ouverture et gagnez [X] Ar de crédit »* → elle enregistre → l'article de sa commande est **attaché automatiquement** → elle dit si ça taille bien → publie.
  - → sa réception est **confirmée** (déclenche `F4.5`, les fonds partent chez la vendeuse) ;
  - → un **avis vérifié** est créé (`F6.1`) avec la note de taille ;
  - → du **contenu** entre dans le fil ;
  - → sa **cagnotte** est créditée (`F17.13`) ;
  - → et publiquement, **JP vient de prouver qu'il livre pour de vrai.**
- **V** : notifiée, voit la vidéo, peut la repartager sur sa vitrine. Un unboxing positif vaut plus que dix photos de catalogue.
- **AN** : le fil d'unboxings est **la meilleure page d'accueil possible** pour quelqu'un qui doute de la plateforme. À exposer sans compte.
- **⚠️ À calibrer** : le montant du crédit. Trop bas, personne ne filme ; trop haut, on achète du contenu à perte. Le taux de production d'unboxings est un indicateur du pilote.
- **Chemin sans vidéo** : la confirmation de réception classique (`F4.5`) reste toujours possible en un appui. **On n'oblige personne à se filmer.**

### F14.9 — Sondage « laquelle je prends ? »
- **A** : publie deux ou trois articles → ses amies votent → elle achète la gagnante. Produit à la fois de l'engagement, de la preuve sociale, et **une intention d'achat mesurable**.
- **V / C** : voient les résultats agrégés — signal gratuit sur ce qui va se vendre.

### F14.12 — Hashtags
- **A** : appuie sur `#robelongue` → page rassemblant clips, stories et articles. Les hashtags servent aussi de socle aux défis sponsorisés (`F17.6`, `F18.6`).

### F14.13 — Sons et musique ⚠️
- **C** : choisit un son dans une bibliothèque → l'utilise sur son clip → le son devient cliquable et rassemble les clips qui l'utilisent.
- **⚠️ Décision** : les droits musicaux sont un vrai risque juridique. Recommandation V1 : bibliothèque restreinte de sons libres de droits ou sous licence, plus le son d'origine de la vidéo. Pas de catalogue commercial tant qu'il n'y a pas de licence.

### F14.15 — Commentaires et partages
- **A** : commente, réagit, partage vers WhatsApp (`F7.11`).
- **C** : peut **restreindre les commentaires** (`F19.2`) — abonnés uniquement, ou désactivés. À concevoir dès la V1, pas après le premier incident.

### F14.17 — Statistiques d'un contenu
- **C / V** : par contenu — vues, durée moyenne regardée, clics vers l'article, « Je prends », ventes, gains. **L'entonnoir complet, pas un compteur de vues.** C'est ce qui distingue JP d'un réseau social : ici, une créatrice sait combien elle a fait gagner, pas combien elle a été vue.

### F14.21 — Sous-titres automatiques
- **A** : regarde sans le son (transport, bureau, entourage). Sans sous-titres, une part importante du contenu n'est pas consommable. Génération automatique en malgache et en français, corrigeable par l'autrice.

---

# ÉPIQUE 15 — Créatrices, affiliation et précommande

> Ce qu'on vend à la créatrice : **un revenu sans capital et sans risque de stock.** Tout le reste de l'épique découle de là.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F15.1 | Statut créatrice et vérification | P1 | M |
| F15.2 | Profil créatrice public | P1 | M |
| F15.3 | « Ma sélection » — vitrine d'articles d'autres vendeurs | P1 | M |
| F15.4 | Lien et attribution d'affiliation traçables | P1 | M |
| F15.5 | Commission d'affiliation sur les ventes générées | P1 | M |
| F15.6 | Tableau de bord créatrice (vues → clics → ventes → gains) | P1 | M |
| F15.7 | Paliers de créatrice | P2 | S |
| F15.8 | **Précommande groupée avec seuil** ⚠️ | P1 | S |
| F15.9 | Mode revendeuse (achat fournisseur, revente sous son nom) | P1 | S |
| F15.10 | Portefeuille et retrait créatrice | P1 | M |
| F15.11 | Demande de partenariat vendeuse ↔ créatrice | P2 | S |
| F15.12 | Envoi d'un article offert contre contenu | P2 | C |
| F15.13 | Annuaire de fournisseurs / sourcing ⚠️ | P3 | W |

### F15.1 / F15.2 — Devenir créatrice
- **C** : profil → « Devenir créatrice » → **vérification d'identité identique au vendeur** (`F0.6`) : sans elle, pas de paiement possible et aucune protection en cas d'usurpation → renseigne ses réseaux existants, son style, ses tailles → validée par **OP**.
- **Distinction importante** : une créatrice **n'est pas** une vendeuse. Elle ne détient pas de stock, n'expédie pas, ne gère pas de litige. Elle recommande et touche une commission. Une même personne peut cumuler les deux rôles (`F0.4`), mais les deux tableaux de bord et les deux portefeuilles restent séparés — sinon plus personne ne comprend d'où vient son argent.
- **A** : voit sur le profil de la créatrice ses contenus, sa sélection, son badge, et le nombre d'articles vendus grâce à elle.

### F15.3 — « Ma sélection »
- **C** : parcourt le catalogue de toutes les vendeuses → ajoute des articles à sa sélection → les organise par thème (« mes basiques », « spécial mariage ») → sa sélection est une vitrine publique.
- **A** : achète depuis la sélection d'Ony **comme depuis n'importe quelle vitrine** — c'est la vendeuse d'origine qui expédie, Ony touche sa commission. L'acheteuse ne voit aucune complexité supplémentaire.
- **V** : voit quelles créatrices ont sélectionné ses articles et combien elles lui rapportent.

### F15.4 / F15.5 — Affiliation
- **C** : chaque article qu'elle attache à un contenu ou met dans sa sélection porte son identifiant. Un lien partageable hors application fonctionne pareil.
- **Attribution** : la vente est attribuée à la dernière créatrice cliquée dans une fenêtre de N jours. ⚠️ N à trancher — hypothèse : 7 jours.
- **V** : voit sur chaque commande si elle vient d'une créatrice, et le montant de la commission versée. **Elle doit pouvoir refuser l'affiliation sur ses articles** — sinon elle subit une charge qu'elle n'a pas choisie.
- **C** : voit chaque vente attribuée, son montant, et son gain.
- **⚠️ Qui paie la commission d'affiliation ?** Trois options : la vendeuse (sur sa marge), JP (sur sa commission), ou un partage. Recommandation : **prélevée sur la commission JP en V1** — cela ne coûte rien de plus à la vendeuse, elle accepte donc facilement, et JP achète de l'acquisition à un prix connu. À réévaluer une fois le volume établi.

### F15.6 — Tableau de bord créatrice
- **C** : entonnoir complet — contenus publiés, vues, clics vers article, « Je prends », ventes confirmées, **gains**. Par contenu et par période. Plus : ses meilleurs contenus, ses meilleurs articles, ses heures de publication les plus efficaces.
- **Principe** : on ne lui montre pas des vues, on lui montre **de l'argent**. C'est la différence entre JP et les réseaux sociaux où elle publie déjà gratuitement.

### F15.8 — La précommande groupée ⚠️
**La fonctionnalité qui supprime la barrière du capital. Probablement le meilleur argument de recrutement des créatrices.**

- **C** : publie un article en précommande → fixe le **prix**, le **seuil** (ex. 15 commandes), la **date limite** et le **délai de livraison annoncé** → publie un clip.
- **A** : voit clairement **« Précommande — livraison prévue vers le [date] · 9 sur 15 commandes »** → « Je prends » → **elle paie, et l'argent est séquestré** (`F4.4`) → elle voit le compteur monter.
- **Si le seuil est atteint** : les commandes sont confirmées, la créatrice commande chez son fournisseur avec l'argent séquestré libéré **partiellement** (voir décision ci-dessous), expédie à réception.
- **Si le seuil n'est pas atteint à la date limite** : **remboursement automatique et intégral de toutes les acheteuses.** Aucune intervention, aucune discussion. C'est ce qui rend la précommande acceptable.
- **V (variante)** : une vendeuse peut aussi tester un article en précommande avant de l'acheter en volume. Réduit son risque de stock mort.
- **OP** : suit les précommandes en retard — c'est le principal risque d'abus de cette fonctionnalité.
- **⚠️ Décisions ouvertes, importantes** :
  - **Quand libérer les fonds à la créatrice ?** Tout garder jusqu'à livraison la met en incapacité d'acheter le stock. Tout libérer au seuil expose l'acheteuse. Piste : libérer une avance plafonnée au seuil (par exemple le prix d'achat fournisseur), le solde à la réception confirmée.
  - **Délai maximal** entre l'atteinte du seuil et l'expédition, au-delà duquel le remboursement est automatique. Sans cette limite, la précommande devient une machine à litiges.
  - **Plafond de précommandes simultanées** par créatrice non encore établie.

### F15.9 — Mode revendeuse
- **C** : achète réellement du stock chez un fournisseur et le revend sous son nom. **Dans ce cas, elle devient une vendeuse** au sens du produit : vérification vendeur (`F0.6`), stock (`F1.6`), expédition, litiges. Le mode revendeuse n'est donc pas une fonctionnalité séparée, c'est **un parcours de bascule** de créatrice vers vendeuse, à rendre fluide et à expliquer clairement (les responsabilités changent).

### F15.11 / F15.12 — Partenariats vendeuse ↔ créatrice
- **V** : cherche des créatrices par audience, style, taille, région → propose un partenariat (commission majorée, article offert contre contenu).
- **C** : reçoit la proposition, accepte ou refuse, suit ses partenariats en cours.
- **F15.12** : la vendeuse envoie un article gratuitement contre engagement de contenu. Le suivi de l'envoi et la vérification de la publication passent par la plateforme, sinon ces accords se font sur Messenger et JP perd la traçabilité — et la commission.

---

# ÉPIQUE 16 — Cadeau, panier partagé et diaspora

> **Le canal qui ne dépend pas du pouvoir d'achat local.** Il donne enfin un usage réel au paiement par carte (`F4.2`).

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F16.1 | Panier partageable par lien | P1 | S |
| F16.2 | « Demander en cadeau » | P1 | S |
| F16.3 | Paiement d'un panier par un tiers | P1 | S |
| F16.4 | Paiement par carte depuis l'étranger | P1 | S |
| F16.5 | Message joint au cadeau | P1 | C |
| F16.6 | Notification de révélation et remerciement | P1 | C |
| F16.7 | Liste d'envies publique | P2 | S |
| F16.8 | Cagnotte collective à plusieurs contributeurs | P2 | C |
| F16.9 | Offrir directement un article à quelqu'un | P2 | S |
| F16.10 | Affichage de la conversion de devise | P1 | S |

### F16.1 / F16.2 / F16.3 — Le parcours cadeau
- **A** : compose son panier → **« Demander en cadeau »** → un lien → elle l'envoie sur WhatsApp ou Messenger à son frère, son copain, sa mère.
- **D** : ouvre le lien, **sans avoir l'application** → voit les articles, les photos, le prix total, les frais de livraison, **la vendeuse vérifiée** → paie par carte ou mobile money → laisse un message (`F16.5`).
- **A** : notifiée *« Naina vous a offert votre panier »* → la commande suit le parcours normal → à la réception, elle publie son remerciement (`F14.7`) → **le remerciement est du contenu, donc de l'acquisition. La boucle se referme.**
- **D** : suit la livraison depuis son lien, **sans compte**, et voit la preuve de remise. C'est exactement ce qui manque à un transfert d'argent classique : il ne sait jamais ce qui en a été fait.
- **Règle** : l'adresse de livraison n'est **jamais** visible par le donateur. Il paie, il ne voit pas où ça va.

### F16.4 / F16.10 — Depuis l'étranger
- **D** : la page de paiement détecte le pays, affiche le **montant converti à titre indicatif** (« ≈ 12 € »), propose la carte en premier. Frais de conversion annoncés à l'avance.
- **Pourquoi c'est stratégique** : le panier d'un cadeau est structurellement plus élevé que le panier ordinaire, et le donateur n'a pas la contrainte de pouvoir d'achat locale — **le plafond de la slide 5 saute.** À mesurer dès le pilote.

### F16.7 — Liste d'envies publique
- **A** : marque des articles en envie → sa liste est visible sur son profil → un appui sur « Offrir » par n'importe qui déclenche `F16.9`.
- **Effet** : la liste d'envies transforme une intention en déclencheur pour un tiers. C'est un mécanisme de conversion à coût nul.

### F16.8 — Cagnotte collective
- **A** : pour un article cher, plusieurs personnes contribuent → chacune voit le montant restant → à l'atteinte du total, la commande part. Anniversaire, mariage. Usage réel, aujourd'hui fait à la main.

---

# ÉPIQUE 17 — Gamification, habitude et dressing

> Tous les mécanismes de cette épique sont **adossés à un fait vrai**. Pas de faux compteur, pas de faux compte à rebours, pas de progression truquée. Sur un produit dont l'actif est la confiance, la manipulation détruit plus qu'elle ne rapporte.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F17.1 | Série de connexion quotidienne | P2 | C |
| F17.2 | Badges et accomplissements | P2 | S |
| F17.3 | Progression visible vers l'avantage suivant | P2 | S |
| F17.4 | Rendez-vous récurrents et « drops » programmés | P1 | S |
| F17.5 | Classements hebdomadaires (créatrices, clientes) | P2 | C |
| F17.6 | Défis avec hashtag | P2 | S |
| F17.7 | Boîte surprise | P3 | C |
| F17.8 | Jeux pendant le direct (quiz, roue, tirage) | P3 | C |
| F17.9 | Quiz de style à l'inscription | P1 | S |
| F17.10 | **Dressing virtuel** | P2 | S |
| F17.11 | Composition et publication de looks depuis le dressing | P2 | C |
| F17.12 | Rappel de panier abandonné, plafonné | P1 | S |
| F17.13 | Cagnotte créditée par l'unboxing | P1 | S |

### F17.1 et F17.5 — les deux seules exceptions à la règle, assumées
Toutes les autres mécaniques de cette épique sont adossées au commerce : la cagnotte vient d'un achat, les paliers d'un montant cumulé, le dressing d'articles réellement reçus. **La série de connexion (`F17.1`) et les classements hebdomadaires (`F17.5`) ne le sont pas** : ce sont de l'engagement pour l'engagement.

Ils sont maintenus en phase 2 et en priorité basse, mais il faut les regarder en face : ce sont les deux fonctionnalités du produit qui se rapprochent le plus d'un mécanisme manipulatoire. Recommandation — si l'une des deux doit sauter, c'est la série de connexion. Récompenser quelqu'un pour avoir ouvert l'application, sans qu'il achète ni ne publie, n'apporte rien au modèle et fragilise le discours sur l'éthique de conception. Le rendez-vous récurrent (`F17.4`) obtient le même résultat de façon plus honnête.

### F17.4 — Le rendez-vous récurrent
- **V / C** : programme un rendez-vous fixe (« tous les vendredis 18 h »). Ses abonnés le voient sur son profil et reçoivent un rappel.
- **A** : sait quand revenir. **L'habitude régulière vaut mieux qu'une notification de plus** — c'est le mécanisme de rétention le moins coûteux et le moins agressif.

### F17.9 — Quiz de style à l'inscription
- **A** : à l'inscription, 6 questions rapides — tailles (haut, bas, chaussures), morphologie, styles préférés, budget habituel, couleurs. → Le fil « Pour toi » est immédiatement pertinent, et les filtres sont pré-remplis.
- **Double effet** : la personnalisation démarre au premier écran, et le temps investi crée un attachement au compte.

### F17.10 / F17.11 — Le dressing virtuel
**Le mécanisme de rétention le plus fort du produit côté acheteuse.**
- **A** : chaque article reçu et confirmé entre automatiquement dans son dressing → elle y ajoute ce qu'elle possède déjà (photo) → elle compose des looks en associant les pièces → elle publie un look (`F14.6`), **avec les articles JP achetables attachés**.
- **Effet business** : quitter JP, ce n'est plus perdre une application, c'est **perdre sa garde-robe et son historique de style**. Et chaque look publié est du contenu gratuit avec des articles cliquables.
- **V** : voit dans quels looks ses articles sont associés — signal de style précieux.

### F17.12 — Rappel de panier, encadré
- **A** : un rappel, **un seul**, quelques heures après l'abandon, et uniquement s'il reste du stock. Pas de relance quotidienne. Une acheteuse harcelée coupe les notifications, et on perd alors les notifications utiles (colis arrivé, code de retrait) — ce qui coûte beaucoup plus cher.

### F17.13 — Cagnotte par l'unboxing
- **A** : publie son unboxing → crédit immédiat et visible dans sa cagnotte (`F7.7`), utilisable sur sa prochaine commande. **C'est JP qui achète son propre contenu d'acquisition, à un prix maîtrisé et payé en crédit d'achat plutôt qu'en argent.**

---

# ÉPIQUE 18 — Premium, JP Club et marques

> **Premium = statut, pas tarif.** Le luxe de prix n'a pas de marché ici ; le luxe de statut coûte presque rien et fonctionne très bien.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F18.1 | « JP Sélect » — sélection éditoriale de vendeurs et d'articles | P2 | S |
| F18.2 | « Le Journal JP » — éditorial, tendances, lookbooks | P2 | C |
| F18.3 | **JP Club — abonnement acheteuse** | P2 | S |
| F18.4 | Badge créatrice vérifiée | P1 | S |
| F18.5 | Conciergerie / personal shopper | P3 | W |
| F18.6 | Espace marque : campagnes et briefs | P3 | S |
| F18.7 | Place de marché des collaborations marque ↔ créatrice | P3 | S |
| F18.8 | Étiquetage obligatoire du contenu sponsorisé | P2 | M |
| F18.9 | Mesure de campagne pour la marque | P3 | S |
| F18.10 | Régie publicitaire display ⚠️ | P3 | W |

### F18.3 — JP Club
- **A** : abonnement mensuel modeste → livraison offerte au-delà d'un montant, accès anticipé aux directs et aux collections, cagnotte majorée, badge visible.
- **Pourquoi c'est mieux que la publicité** : revenu récurrent, prévisible, sans coût marginal, et qui **renforce** l'expérience au lieu de la dégrader. ⚠️ Prix à caler ; la livraison offerte est le seul avantage qui compte vraiment sur ce marché, les autres sont du statut.

### F18.6 / F18.7 / F18.9 — Les marques
- **PM** : crée une campagne → brief, budget, profil de créatrices recherché, articles concernés → les créatrices candidatent → elle sélectionne → suit les publications, les vues, les clics et **les ventes générées** → paie via la plateforme, **JP prélève sa part**.
- **C** : voit les campagnes ouvertes correspondant à son profil, candidate, produit le contenu, est payée dans son portefeuille (`F15.10`).
- **C'est la forme rentable de la « publicité » à cette échelle** — de la campagne mesurée à la vente, pas de l'impression au CPM.

### F18.8 — Contenu sponsorisé étiqueté
- **A** : voit une mention claire « Partenariat rémunéré » sur tout contenu payé. **Non négociable** : sur un produit dont l'actif est la confiance, un sponsoring caché découvert une fois détruit la crédibilité de tout le fil.

### F18.10 — Régie display ⚠️
- **À ouvrir seulement quand l'audience le justifie**, avec des annonceurs locaux (télécoms, banques, grande consommation), pas de programmatique. Le CPM sur une audience malgache est trop faible pour en faire un pilier : c'est le sixième revenu du modèle, pas le premier. Aucun développement en V1.

---

# ÉPIQUE 19 — Modération, sécurité des personnes et signalement

> **Ce n'est pas une épique de conformité, c'est une épique de survie.** Le produit expose des jeunes femmes qui se filment, sur un marché où le `henatra` coupe dans les deux sens. Si JP devient un endroit où l'on se fait humilier en commentaire, le positionnement confiance s'effondre — et d'autant plus vite qu'on avait promis la sécurité.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F19.1 | Filtrage automatique des commentaires | P1 | M |
| F19.2 | Commentaires restreignables par l'autrice | P1 | M |
| F19.3 | Signalement en un geste | P1 | M |
| F19.4 | Blocage d'un utilisateur | P1 | M |
| F19.5 | Vérification d'âge à l'inscription | P1 | M |
| F19.6 | Retrait de contenu avec notification motivée | P1 | M |
| F19.7 | File de modération dans le back-office | P1 | M |
| F19.8 | Protection contre la republication de contenu volé | P1 | S |
| F19.9 | Sanctions graduées et voie de recours | P1 | S |
| F19.10 | Compte privé / audience restreinte | P2 | C |
| F19.11 | Filtre de mots personnalisé | P2 | S |
| F19.12 | Signalement d'urgence (harcèlement, menace) | P1 | M |

### F19.1 / F19.2 / F19.11 — Protéger l'autrice avant l'incident
- **C** : à la publication, choisit qui peut commenter — tout le monde, ses abonnés, personne. Peut définir sa propre liste de mots bloqués (`F19.11`). Le filtrage automatique masque insultes et propos sexuels **avant** qu'elle ne les voie, en malgache et en français.
- **Principe de conception** : les protections sont **disponibles dès la première publication**, pas proposées après le premier incident. Une créatrice qui vit un premier incident ne revient pas.

### F19.3 / F19.12 — Signaler
- **A / C** : appui long sur un contenu ou un commentaire → « Signaler » → motif en une liste courte → envoyé. **Deux niveaux** : signalement ordinaire (file normale) et **signalement d'urgence** — harcèlement, menace, contenu sexuel non consenti, mineur — qui passe en tête de file avec un engagement de traitement court.
- **MO** : traite la file par priorité → voit le contenu, l'historique de l'auteur, les signalements antérieurs → retire, avertit, suspend, ou classe → **décision motivée notifiée** à l'auteur et au signalant.

### F19.5 — Vérification d'âge
- **A / C** : déclaration d'âge à l'inscription ; pour publier du contenu vidéo, la vérification d'identité (`F0.6` / `F15.1`) donne l'âge réel. **Aucune publication vidéo par un mineur.** Point non négociable, juridiquement et moralement.

### F19.8 — Contenu volé
- **C** : signale qu'un contenu est le sien → **MO** compare, retire le contenu republié, sanctionne le récidiviste. Empreinte automatique sur les vidéos publiées pour détecter les republications.
- **Pourquoi dès la V1** : reprendre la vidéo d'une autre pour vendre le même article est le premier abus qui apparaîtra, et c'est celui qui fait fuir les créatrices sérieuses.

### F19.9 — Sanctions et recours
- **MO** : échelle graduée — avertissement, retrait, restriction de publication, suspension, exclusion. Chaque sanction est écrite, motivée, horodatée.
- **C / V** : peut **contester** une sanction. Une modération sans recours est vécue comme arbitraire et fait partir les meilleurs profils.

---

# ÉPIQUE 20 — Événements thématiques

> **Un événement est un rendez-vous commercial daté, partagé par plusieurs vendeurs, autour d'un thème.** Noël, Pâques, la rentrée, le Nouvel An malgache, un événement Otaku, la Fête des mères, le Black Friday local.
>
> Pourquoi c'est une épique et non une fonctionnalité de plus : un événement est le seul mécanisme qui donne à la plateforme **une raison d'exister au-delà de la somme de ses boutiques**. Il crée un pic de trafic que JP peut annoncer, il donne aux petits vendeurs une visibilité qu'ils n'achèteraient jamais seuls, et il fabrique un motif de retour daté — plus honnête et moins coûteux qu'une notification de plus (`F17.4`).
>
> Règle de cohérence avec l'épique 14 : **un événement n'est pas un thème décoratif.** Une page événement qui ne mène pas à des articles achetables n'a pas sa place dans le produit.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F20.1 | Événement JP officiel — thème, dates, visuel, hashtag, page publique | P2 | S |
| F20.2 | Candidature et acceptation d'un vendeur ou d'une créatrice | P2 | S |
| F20.3 | Rattachement d'articles, promotions, contenus et directs à un événement | P2 | S |
| F20.4 | **Page événement publique, accessible sans compte** | P2 | S |
| F20.5 | Mini-événement propre à une boutique | P2 | C |
| F20.6 | Notifications et rappels d'événement | P2 | C |
| F20.7 | Badge et bandeau événement sur les vignettes et les fiches | P2 | C |
| F20.8 | Bilan d'événement — participation, CA, nouveaux abonnés | P2 | C |
| F20.9 | Calendrier des événements à venir côté acheteuse | P2 | C |

### F20.1 / F20.2 — Créer un événement, y participer
- **OP** : back-office → « Nouvel événement » → nom, thème, **dates de début et de fin**, visuel, couleur d'accent, hashtag associé (`F14.12`), texte de présentation, règles de participation → statut `brouillon` → `annoncé` (visible, pas encore ouvert) → `en cours` → `terminé`. Les transitions de dates sont automatiques ; l'annonce est manuelle.
- **V / C** : voient les événements ouverts dans leur studio → « Participer » → choisissent les articles et promotions qu'ils y engagent (`F20.3`) → **OP valide ou refuse**, avec motif.
- **Pourquoi une validation** : sans elle, le premier événement Noël se remplit de 400 articles hors sujet et la page ne vaut plus rien. La sélection est ce qui fait la valeur de l'événement, exactement comme pour « JP Sélect » (`F18.1`).
- **⚠️ À trancher** : la participation est-elle **gratuite**, payante (une mise en avant, `F10.5`), ou conditionnée à un palier d'abonnement vendeur (`F10.3`) ? Recommandation : gratuite sur les deux premiers événements pour amorcer, puis payante pour les emplacements en tête de page uniquement — jamais pour l'accès à l'événement lui-même, sous peine de n'avoir que des grosses boutiques et un catalogue pauvre.

### F20.3 — Rattacher du contenu et des offres
- **V** : coche des articles, rattache une promotion existante (`F7.22`) ou en crée une propre à l'événement, programme un direct « spécial Noël » (`F2.1`), publie des clips avec le hashtag de l'événement.
- **Règle** : un article peut appartenir à plusieurs événements, mais **une promotion ne s'applique qu'une fois** (`F7.26`). Deux événements simultanés ne cumulent pas leurs remises.
- **C** : rattache sa sélection (`F15.3`) ou ses clips ; ses ventes restent attribuées par affiliation (`F15.4`).

### F20.4 — La page événement
- **A / AN** : ouvre la page → bandeau visuel, texte de présentation, **compte à rebours** (« ouvre dans 3 jours » ou « se termine dans 6 h ») → puis, dans cet ordre : les **directs en cours** liés à l'événement, les **articles en promotion**, les **clips et stories** du hashtag, les **boutiques participantes**.
- **Accessible sans compte** (`F0.10`), avec une URL partageable — c'est une page d'acquisition, pas un écran interne. Un lien d'événement partagé sur Facebook doit s'ouvrir joliment (aperçu, visuel, dates).
- **Filtres** : taille, budget, catégorie, comme dans la recherche (`F8.3`). Une page événement sans filtre par taille est inutilisable dans le vestimentaire.
- **État vide** : si l'événement est annoncé mais pas encore ouvert, la page montre le compte à rebours et un bouton **« Me prévenir à l'ouverture »** (`F20.6`).

### F20.5 — Mini-événement de boutique
- **V** : crée son propre événement, sans validation OP — « Ma braderie de fin de mois », « Nouvelle collection samedi ». Portée limitée à sa boutique et à ses abonnés.
- **Distinction claire** : les événements JP sont curés et visibles de tous ; les événements de boutique n'apparaissent pas dans le calendrier général (`F20.9`), seulement sur la vitrine et dans le fil des abonnés. **Sans cette distinction, le calendrier JP se remplit de 300 braderies et perd toute valeur éditoriale.**

### F20.6 — Notifications d'événement
- **A** : reçoit au maximum **trois messages par événement** — à l'ouverture (si elle a demandé à être prévenue ou si elle suit une boutique participante), au dernier jour, et rien d'autre. Les plafonds de `F7.23` s'appliquent : les notifications d'événement entrent dans le même budget d'attention.
- **V / C** : rappel 48 h avant l'ouverture pour finaliser leur participation.

### F20.7 — Signalisation visuelle
- **A** : voit un bandeau ou une pastille aux couleurs de l'événement sur les vignettes concernées, dans le fil, la recherche et sur les fiches. Un appui mène à la page événement.
- **Contrainte technique** : la pastille est un élément léger, jamais une image supplémentaire à télécharger — le budget de données du fil est déjà contraint (`F0.9`, `F13.2`).

### F20.8 — Bilan d'événement
- **V** : à la clôture — articles vendus, chiffre d'affaires, comparaison avec une période équivalente hors événement, **nouveaux abonnés gagnés**, contenus publiés et leurs conversions. C'est ce qui décide de sa participation au suivant.
- **OP** : participation par vendeur, trafic de la page, conversion, part des ventes de la période attribuable à l'événement, coût de la mise en avant. **Un événement dont le bilan n'est pas mesuré sera reconduit par habitude et non par résultat.**

### F20.9 — Calendrier côté acheteuse
- **A** : « Événements » → les événements en cours puis à venir, avec dates et visuels → « Me prévenir ». Le calendrier est aussi le meilleur écran pour installer une habitude sans notification (`F17.4`).

---

---

# ÉPIQUE 21 — Les univers

**Décision du 20/08/2026.** JP n'est plus une place de marché de mode : c'est une
place de marché **par univers**, dont deux sont ouverts au lancement.

| Univers | Signature | État |
|---|---|---|
| **JP Mode** | *Le direct qui habille* | **ouvert** |
| **JP Beauté** | *Vrai produit, prix vrai* | **ouvert** |
| JP Tech | *Vérifié avant de payer* | déclaré, fermé |
| JP Maison | *Livré, monté, garanti* | déclaré, fermé |
| JP Enfant | *Ce qu'il faut, à son âge* | déclaré, fermé |

**Un univers n'est pas un filtre de catégorie, c'est un jeu de règles.** Entre
une robe et un téléphone, ce qui change n'est pas l'étagère : c'est la fiche
article, le mode de livraison, les motifs de litige recevables, le taux de
commission et la vérification exigée du vendeur.

**Pourquoi trois univers déclarés mais fermés.** L'abstraction se construit
maintenant, l'ouverture devient une ligne de configuration. La rétrofitter
plus tard voudrait dire migrer chaque article, chaque commande et chaque
promotion — des mois de travail sur des données réelles.

**Pourquoi Mode et Beauté ensemble.** Elles partagent la même logistique
— léger, point relais — et souvent la même vendeuse. Un seul modèle de
livraison à roder, deux marchés validés.

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F21.1 | **Sélecteur d'univers en tête d'écran**, univers mémorisé | P1 | M |
| F21.2 | **Règles par univers** : commission, livraisons, champs de fiche, motifs de litige | P1 | M |
| F21.3 | **Fiche article adaptée à l'univers** — champs obligatoires bloquants | P1 | M |
| F21.4 | **Motifs de litige filtrés par univers** | P1 | M |
| F21.5 | **Commission par univers** appliquée au calcul et au récapitulatif | P1 | M |
| F21.6 | Un lien profond impose son univers | P1 | S |
| F21.7 | Pastille d'univers hors du contexte courant | P1 | C |
| F21.8 | Ouverture et fermeture d'un univers depuis le back-office | P1 | S |
| F21.9 | Recherche transverse à tous les univers ouverts | P2 | S |
| F21.10 | Boutique multi-univers — une vendeuse, plusieurs univers | P1 | S |
| F21.11 | **Bilan par univers** dans le tableau de bord du pilote | P1 | S |
| F21.12 | Signature d'univers affichée à la première visite seulement | P1 | C |

## F21.2 — Ce que « jeu de règles » veut dire concrètement

| | JP Mode | JP Beauté | JP Tech *(fermé)* | JP Maison *(fermé)* |
|---|---|---|---|---|
| **Commission** | 8 % | 8 % | **3 %** | 5 % |
| **Livraison** | relais, domicile | relais, domicile | relais, domicile | **camion, retrait** |
| **Champs exigés** | taille, état | **péremption, scellé, marque** | IMEI, état, garantie | dimensions, montage |
| **Provenance exigée** | non | **oui** | **oui** | non |
| **Litiges propres** | pas la bonne taille, défaut de couture | entamé, périmé, **réaction cutanée** | ne démarre pas, batterie, IMEI bloqué | pièce manquante, ne passe pas la porte |

**Le taux de commission est la règle qui décide de tout.** Un revendeur de
téléphones gagne environ 5 % sur un appareil : lui en prendre 8 rendrait
`JP Tech` vide, quel que soit le reste du produit. D'où 3 % — et d'où la
nécessité que le taux soit par univers, pas global.

## Ce que le panier ne fait PAS

**Le panier ne se scinde pas par univers.** Il se scinde par vendeur et par
mode de livraison, ce qu'il fait déjà *(F3.1)*.

À Madagascar, la même vendeuse tient souvent le vêtement et le cosmétique :
la forcer à faire payer deux fois serait absurde. Quand `JP Maison` ouvrira,
le camion se séparera naturellement du point relais — la règle de scission
existe déjà, elle n'a pas besoin de l'univers pour fonctionner.

## Les décisions que cette épique ouvre

- **F21.8 — qui ouvre un univers ?** Un opérateur seul, ou la double
  validation déjà en place pour les paramètres économiques ? Ouvrir un univers
  engage un recrutement de vendeurs et une promesse publique.
- **F21.9 — la recherche est-elle transverse par défaut ?** Chercher « crème »
  depuis JP Mode doit-il proposer des résultats de JP Beauté, ou rester muet ?
  Transverse aide à la découverte, mais brouille le repère d'étage.
- **F21.10 — une boutique multi-univers a-t-elle une vitrine par univers ou une
  seule ?** Une vitrine unique est plus simple, mais mélange des fiches aux
  champs différents.

---

# Les fonctionnalités que JP Beauté ajoute

Elles vivent dans leurs épiques d'origine, parce qu'elles étendent le
catalogue et le litige plutôt que de créer un domaine.

## Épique 1 — Catalogue

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F1.21 | **Fiche beauté** : date de péremption, contenance, scellé ou entamé, type de peau | P1 | M |
| F1.22 | **Refus de publication d'un produit périmé** — contrôle à la publication et à l'achat | P1 | M |
| F1.23 | **Déclaration de provenance** et pièce justificative facultative | P1 | S |
| F1.24 | Alerte au vendeur à l'approche de la péremption d'un article en stock | P2 | S |

**Pourquoi la péremption est obligatoire et pas facultative.** Un cosmétique
périmé ou contrefait ne déçoit pas : **il blesse**. C'est la différence de
nature avec un vêtement qui ne va pas, et elle justifie à elle seule un univers
séparé plutôt qu'une catégorie de plus.

## Épique 6 — Confiance et litiges

| ID | Fonctionnalité | Phase | Prio |
|---|---|---|---|
| F6.11 | **Litige « réaction cutanée »** — traitement prioritaire, comme une urgence | P1 | S |
| F6.12 | **Pas de retour sur un cosmétique entamé**, sauf défaut ou contrefaçon | P1 | M |
| F6.13 | Signalement de contrefaçon avec transmission au vendeur ET à l'équipe | P1 | S |

**F6.11 est une règle de sécurité des personnes, pas de commerce.** Une réaction
cutanée peut relever de l'urgence médicale ; le dossier passe devant, comme les
signalements d'urgence de l'épique 19.

**F6.12 protège le vendeur.** Un cosmétique entamé ne se revend pas : accepter
son retour reviendrait à faire payer au vendeur le changement d'avis de
l'acheteuse. L'exception — défaut ou contrefaçon — reste entière.

---

# Ce qui constitue le produit minimum (Phase 1)

Slide 20 : *« C'est le produit minimum qui règle le problème. »*

Le périmètre a été élargi : **le noyau social est livré dès le lancement**, parce qu'une application de commerce en direct sans contenu n'a aucune raison d'être ouverte 23 heures sur 24, et parce que le contenu est le seul levier qui fasse baisser structurellement le coût d'acquisition (slide 19). Traduit en fonctionnalités, le périmètre incompressible est :

**Le socle commerce**
- **Identité** — F0.1, F0.2, F0.6, F0.7, F0.10, F0.11, **F0.13, F0.14, F0.16**
- **Catalogue** — F1.1, F1.2, F1.6, F1.7, F1.10, F1.11, F1.14
- **Vente hors direct** — **F1.15, F1.16, F1.18, F1.19, F3.14** · et **F1.17** (particulier) dès que le seuil de bascule est tranché
- **Direct** — F2.3, F2.4, F2.5, F2.6, F2.7, F2.8, F2.9, F2.13, F2.14
- **Commande** — F3.1, F3.2, F3.3, F3.4, F3.5, F3.7, F3.10, **F3.15**
- **Paiement** — F4.1, F4.3 ⚠️, F4.4, F4.5, F4.6, F4.7, F4.8, F4.10, F4.11
- **Livraison** — F5.1, F5.2, F5.3, F5.4, F5.10
- **Confiance** — F6.3, F6.4, F6.5, F6.6
- **Croissance** — F7.1, F7.2, F7.11, F7.12, **F7.15, F7.17**
- **Promotions** — **F7.22, F7.23, F7.26** — le trio minimal : une promotion, ses abonnés notifiés, une règle de cumul qui empêche les remises absurdes
- **Back-office** — F11.1, F11.3, F11.5, F11.6, F11.7
- **Socle technique** — F13.1 à F13.4, F13.6 à F13.9

**Le noyau social — nouveau**
- **Contenu** — F14.1 (stories), F14.2 et F14.3 (clips et fil), F14.5 (articles attachés), **F14.7 (unboxing)**, F14.12 (hashtags), F14.15, F14.17, F14.18, F14.20
- **Créatrices** — F15.1, F15.2, F15.3, F15.4, F15.5, F15.6, F15.10 · et F15.8 (précommande) si la décision est tranchée à temps
- **Cadeau** — F16.1, F16.2, F16.3, F16.4, F16.10
- **Habitude** — F17.4, F17.9, F17.12, F17.13
- **Modération** — **toute la liste marquée M de l'épique 19**, sans exception
- **Statut** — F18.4, et F18.8 dès qu'il existe du contenu rémunéré

**Ce qui a été volontairement écarté du lancement** : montage vidéo avancé et musique (F14.13), avant/après et sondages (F14.8, F14.9), duos et lookbooks, dressing virtuel (F17.10), JP Club (F18.3), espace marque (F18.6), boîte surprise et jeux, régie publicitaire, assistant IA (épique 12), enchères et ventes flash, **classement et paliers de fidélité (F7.5, F7.6, F7.18, F7.19), promotions ciblées (F7.24, F7.9), événements thématiques (épique 20 entière)**.

**Pourquoi fidélisation et événements passent en phase 2, alors qu'ils viennent d'être demandés.** Ce n'est pas un désaveu, c'est une question de matière première. Un moteur de rang client a besoin d'un historique de commandes confirmées pour classer quoi que ce soit : au premier mois, toutes les clientes sont Bronze et l'écran est vide. Un événement thématique a besoin de plusieurs boutiques actives et d'un catalogue fourni, sinon la page événement est un désert que l'on aura annoncé. Les deux se construisent sur des données que seul le lancement produit.

En revanche, **trois choses doivent être faites en phase 1 sous peine de coûter dix fois plus cher ensuite** : le journal des commandes confirmées par couple (vendeur, cliente), qui alimentera le rang sans reprise de données ; la **table des promotions et la règle de cumul** (`F7.26`), parce qu'une remise rétro-appliquée à des commandes déjà facturées est un cauchemar comptable ; et le **rattachement d'un article à un événement**, un simple champ, qui évite une migration lourde au moment où l'événement Noël sera décidé trois semaines avant Noël.

> **Avertissement de périmètre, à assumer explicitement.** Ce lot est plus large que celui décrit slide 20. L'horizon d'environ 3 mois annoncé slide 19 devient tendu, notamment à cause de la vidéo (enregistrement, transcodage, diffusion, stockage) et de la modération, qui est autant un coût humain qu'un développement. Deux issues honnêtes : allonger l'horizon, ou livrer le noyau social en deux temps — **stories, clips et unboxing d'abord** (ils portent l'essentiel de la valeur), affiliation et précommande six semaines plus tard. Cet arbitrage doit être posé devant l'investisseur, pas découvert en cours de route.

---

# Les décisions ouvertes, par ordre d'importance

**Sur le commerce**

1. **F4.3 — Le paiement à la livraison.** Sans lui, une part importante de la demande est inaccessible ; avec lui, le séquestre perd son sens et le risque revient au vendeur. À trancher avant de coder le paiement.
2. **F1.10 — La durée de réservation.** Elle arbitre entre conversion et gel du stock. À mesurer dès les premiers directs.
3. **F10.2 — Le taux de commission.** À quel niveau la vendeuse contourne-t-elle la plateforme ?
4. **F4.6 — Le délai de libération automatique des fonds.** Trop long, les vendeuses partent. Trop court, la protection de l'acheteuse est fictive.
5. **F2.21 — La rediffusion vers Facebook.** Pont d'acquisition ou frein à la migration ?
6. **F5.8 — Qui paie le retour ?** Sur des paniers faibles, le coût du retour peut dépasser la marge.
7. **F7.14 — Messagerie privée ou non.** Rouvrir le canal que le produit est censé supprimer.

**Sur la couche sociale**

8. **F15.8 — La précommande groupée : quand libérer les fonds à la créatrice ?** C'est la décision la plus délicate du produit. Tout garder jusqu'à la livraison la met en incapacité d'acheter le stock, donc la fonctionnalité ne sert à rien ; tout libérer au seuil expose l'acheteuse à exactement l'arnaque que JP prétend supprimer. Il faut aussi fixer le délai maximal d'expédition et le plafond de précommandes simultanées.
9. **F15.5 — Qui paie la commission d'affiliation ?** La vendeuse, JP, ou les deux. Recommandation : sur la commission JP en V1, pour lever la résistance des vendeuses et acheter de l'acquisition à un prix connu.
10. **F14.7 — Le montant du crédit d'unboxing.** Trop bas, personne ne filme ; trop haut, on achète du contenu à perte. C'est le réglage qui décide si le moteur d'acquisition gratuite s'amorce.
11. **F14.13 — La musique.** Les droits sont un risque juridique réel. Bibliothèque restreinte sous licence en V1, pas de catalogue commercial.
12. **F15.4 — La fenêtre d'attribution d'affiliation.** Hypothèse de 7 jours, à valider.
13. **Le budget et l'organisation de la modération.** Combien de modérateurs, quels délais d'engagement, quelle couverture horaire. Ce n'est pas une question technique, c'est une ligne de coût d'exploitation permanente.
14. **L'amorçage du contenu.** Combien de créatrices recruter avant l'ouverture, et à quel prix. Un fil vide est pire que pas de fil.

**Sur la vente hors direct, la fidélisation et les événements**

15. **F1.16 — La durée de réservation hors direct.** Hypothèse : 30 minutes contre 5 en direct. Le raisonnement change complètement : hors pic, geler un article coûte peu et sauve le panier. À mesurer sur le taux d'expiration comparé des deux canaux.
16. **F1.17 — Le seuil de bascule particulier → vendeur professionnel**, et le taux de commission appliqué au particulier. Trop bas, on impose un KYC à quelqu'un qui vend deux robes et il abandonne ; trop haut, on héberge des boutiques non vérifiées qui encaissent. À trancher **avant** d'ouvrir le dépôt d'annonce, car cela conditionne l'écran de vérification.
17. **F7.26 — La règle de cumul des remises.** Recommandation : une seule remise par ligne, la plus favorable à l'acheteuse, jamais d'addition. À figer **avant** de coder le calcul du panier — c'est le genre de règle qu'on ne change pas après avoir émis des factures.
18. **F7.23 — Le plafond de notifications de promotion.** Hypothèse : une par vendeur et par 24 h, regroupement au-delà de trois par jour. C'est le réglage qui décide si l'acheteuse garde ses notifications activées, donc si la plateforme peut encore lui dire que son colis est arrivé.
19. **F7.18 — Les critères et les poids du rang client.** Volume, fréquence, récence, fiabilité : la formule doit rester explicable en une phrase. À caler avec les vendeurs pilotes, qui savent déjà, à la main, qui sont leurs bonnes clientes.
20. **F7.24 — Une promotion ciblée est-elle découvrable ou privée ?** Visible et grisée pour créer l'envie de progresser, ou invisible pour éviter la frustration.
21. **F20.2 — La participation à un événement : gratuite, payante, ou réservée à un palier d'abonnement ?** Et surtout : **qui valide** les candidatures, avec quel délai. Sans validation, la page événement perd sa valeur éditoriale ; avec une validation lente, les vendeurs ne jouent plus le jeu.

---

*Positionnement et argumentaire : voir `JP_POSITIONNEMENT.md`.*
