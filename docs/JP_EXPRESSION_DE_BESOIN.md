# JP — Je prends
## Expression de besoin

| | |
|---|---|
| **Projet** | JP — plateforme de vente en direct et de contenu mode, beauté et chaussures |
| **Marché** | Madagascar |
| **Version** | 1.0 |
| **Date** | Août 2026 |
| **Objet du document** | Décrire **le besoin**, pas la solution. Ce que les utilisateurs doivent pouvoir faire, dans quelles conditions, et à quels critères le résultat sera jugé. |
| **Documents liés** | `JP_POSITIONNEMENT.md` (analyse stratégique) · `JP_BACKLOG.md` (inventaire fonctionnel) · `JP_DESCRIPTION_PROJET.md` · `JP_CAHIER_DES_CHARGES.md` (solution fonctionnelle) · `JP_CDC_TECHNIQUE.md` |

> **Règle tenue dans tout le document : aucun chiffre n'est présenté comme acquis.** Toute valeur numérique porte la mention « hypothèse à valider ». Les prestataires de paiement et de livraison sont cités comme partenaires *visés*, pas comme accords signés.

---

# 1. Contexte

## 1.1 La situation observée

Chaque soir, à Antananarivo et dans les grandes villes de Madagascar, des boutiques et des boutiques présentent leurs articles en direct sur les réseaux sociaux. Les acheteurs regardent, commentent, réservent en écrivant « je prends », puis négocient le reste en message privé.

L'usage existe déjà, il est massif, et il fonctionne malgré l'outil. **Le besoin n'est pas de créer un marché, il est d'équiper un marché existant.**

En parallèle, une seconde population s'est formée : des créatrices de contenu qui filment leurs tenues, cumulent une audience réelle, et font gratuitement la promotion de boutiques qui ne les rémunèrent pas. Elles n'ont pas les moyens d'acheter du stock, donc elles ne vendent pas.

## 1.2 Ce qui manque

Un réseau social est conçu pour faire parler. Il n'est conçu ni pour encaisser, ni pour facturer, ni pour livrer, ni pour arbitrer un désaccord. Il en résulte que **le risque de la transaction est intégralement porté par les personnes**, sans aucun mécanisme de protection.

## 1.3 Périmètre du marché visé

Vertical **mode, beauté et chaussures**, à l'exclusion de toute autre catégorie de produit. Ce choix n'est pas une limitation : il permet des fonctions qu'un généraliste ne développera jamais — tailles par marque, morphologies, teintes adaptées aux carnations, retours pour cause de taille — et il correspond à la catégorie qui domine déjà la vente en direct.

---

# 2. Les problèmes constatés

## 2.1 Problème n° 1 — Personne n'est protégé

**Côté acheteur.** Un paiement envoyé par mobile money vers un numéro personnel, puis plus de nouvelles. Aucun recours, aucune preuve exploitable, aucun arbitre. Une capture d'écran ne vaut rien.

**Côté boutique.** Des articles réservés en commentaire puis jamais payés. Le stock est immobilisé, invendable pendant des jours, pour une commande fantôme.

**Au milieu, rien.** Pas de contrat, pas de trace, pas d'arbitrage.

## 2.2 Problème n° 2 — Le doute plafonne le panier

Sans facture, sans historique, sans suivi de livraison, sans avis vérifié, l'acheteur fait la seule chose rationnelle : **il limite son risque.** Il commande petit, il commande rarement, et seulement chez une personne qu'une amie lui a recommandée.

À cela s'ajoute une dimension sociale rarement formulée : **la honte**. Se faire arnaquer n'est pas seulement perdre de l'argent, c'est devoir l'avouer à son entourage. Beaucoup renoncent à acheter pour ne pas avoir à raconter cela. La conséquence est également que **les victimes ne réclament pas, elles disparaissent** — ce qui rend le problème invisible et non mesuré.

## 2.3 Problème n° 3 — Le travail administratif après la vente

Après le direct, la boutique relit des centaines de commentaires pour retrouver qui a dit « je prends » et dans quel ordre, ouvre un message privé par client, recopie tout à la main, puis relance ceux qui ne répondent plus. L'essentiel du travail arrive après la vente, et la relance est du travail non payé sur une vente qui n'aura peut-être jamais lieu.

*Ce problème est réel, mais il est classé en troisième position : c'est la plainte la plus fréquente des boutiques, ce n'est pas leur perte la plus lourde. Voir `JP_POSITIONNEMENT.md`, section 2.*

## 2.4 Problème n° 4 — La créatrice sans capital

Une personne qui a une audience mais pas de fonds de roulement ne peut pas vendre. Elle a deux options, mauvaises toutes les deux : acheter du stock d'avance sans savoir s'il partira, ou renoncer et continuer à faire de la promotion gratuite. **Une audience réelle reste sans valeur économique pour celle qui la détient.**

## 2.5 Problème n° 5 — Le direct meurt à minuit

Un direct dure environ une heure. Une fois terminé, tout ce qui y a été montré disparaît. L'audience rassemblée se disperse, et rien ne subsiste qui puisse encore vendre le lendemain.

## 2.6 Problème n° 6 — Le coût de livraison tue le petit panier

Sur un article à faible montant, les frais de livraison à domicile peuvent approcher ou dépasser la marge. À cela s'ajoutent les échecs de livraison quand personne n'est présent, et la réticence à communiquer son adresse personnelle à un inconnu.

## 2.7 Problème n° 7 — L'argent de la diaspora est envoyé à l'aveugle

Les transferts depuis l'étranger vers Madagascar sont un flux considérable, envoyé en argent, sans que l'expéditeur sache ni ce qui en est fait, ni si le bénéficiaire a reçu ce qu'il souhaitait. **Il n'existe aucun moyen simple d'offrir un objet précis, vérifié et livré, depuis l'étranger.**

---

# 3. Ce que le projet doit accomplir

## 3.1 Objectif général

Permettre à une vente qui se conclut aujourd'hui dans un commentaire de se conclure **dans un cadre où chaque partie est protégée**, sans faire perdre à cette vente sa spontanéité, sa rapidité, ni son caractère social.

## 3.2 Objectifs par acteur

| Acteur | Le besoin |
|---|---|
| **Acheteur** | Acheter sans risquer de perdre son argent, chez quelqu'un qu'il ne connaît pas, et pouvoir se retourner si quelque chose ne va pas. |
| **Boutique** | Ne plus perdre les ventes annoncées et jamais payées, ne plus immobiliser de stock pour rien, atteindre des acheteurs qui ne le connaissent pas, et supprimer la saisie manuelle. |
| **Créatrice** | Tirer un revenu de son audience **sans avancer d'argent et sans porter de stock**. |
| **Donateur / diaspora** | Offrir un objet précis à un proche, avec la preuve qu'il a bien été livré. |
| **Livreur et point relais** | Une tournée claire, une preuve de remise, un décompte des espèces encaissées. |
| **Exploitant de la plateforme** | Vérifier les boutiques, arbitrer les litiges avec des preuves, protéger les personnes, et mesurer ce qui se passe réellement. |
| **Marque** | Atteindre une audience mode qualifiée par des campagnes dont l'effet sur les ventes est mesurable. |

## 3.3 Le principe directeur du produit

> **Aucun contenu ne peut exister sans article achetable attaché.**
>
> JP n'est pas un réseau social auquel on ajoute une boutique. C'est **une boutique dont le catalogue est fait de vidéos.**

Ce principe est une exigence de conception, pas une orientation marketing. Toute fonctionnalité qui y contrevient sort du périmètre.

---

# 4. Périmètre

## 4.1 Inclus

**Le socle commerce**
- Inscription et authentification par téléphone, en français et en malgache
- Vérification d'identité des boutiques et des créatrices avant toute perception d'argent
- Catalogue avec variantes de taille et de couleur, et stock par variante
- Diffusion en direct depuis un téléphone, avec prise de commande intégrée
- Réservation temporaire du stock pendant le paiement
- Panier multi-articles et multi-boutiques
- Paiement mobile money et carte, avec conservation des fonds jusqu'à confirmation de réception
- Facturation automatique
- Livraison à domicile et retrait en point relais, avec suivi partagé
- Signalement et arbitrage des litiges
- Avis vérifiés et score de confiance public

**La couche sociale**
- Stories et vidéos courtes verticales, chacune rattachée à des articles achetables
- Fil personnalisé selon la taille, le budget et le style
- Publication d'unboxing valant confirmation de réception et avis vérifié
- Statut de créatrice, sélection d'articles, affiliation et commission sur ventes générées
- Précommande groupée avec seuil et remboursement automatique si le seuil n'est pas atteint
- Panier offert par un tiers, y compris depuis l'étranger
- Modération, protection des personnes et signalement

**L'exploitation**
- Back-office de vérification, de modération, d'arbitrage et de réconciliation
- Mesure continue des indicateurs de pilotage

## 4.2 Exclu de la version 1

- Enchères et ventes flash en direct
- Assistant automatique de rédaction et de réponse
- Publicité display et régie publicitaire
- Espace marque et place de marché des collaborations
- Abonnement acheteur
- Dressing virtuel et composition de looks
- Montage vidéo avancé et catalogue musical commercial
- Toute catégorie de produit hors mode, beauté et chaussures
- Vente transfrontalière sortante (les articles sont vendus et livrés à Madagascar ; seul **le paiement** peut venir de l'étranger)

## 4.3 Hors périmètre du projet

- L'approvisionnement des boutiques
- Le transport longue distance et l'import
- L'émission de monnaie électronique — JP s'appuie sur des prestataires agréés et ne devient pas établissement de paiement

---

# 5. Les acteurs

| Acteur | Rôle | Interne / externe |
|---|---|---|
| Acheteur | Consulte, commande, paie, reçoit, note, publie | Utilisateur |
| Boutique | Détient le stock, diffuse en direct, expédie | Utilisateur |
| Employé du vendeur | Prépare et modère, **sans accès à l'argent** | Utilisateur |
| Créatrice | Produit du contenu, recommande, ne détient pas de stock | Utilisateur |
| Donateur | Paie le panier d'un tiers, éventuellement depuis l'étranger | Utilisateur, souvent sans compte |
| Livreur | Enlève, livre, encaisse le cas échéant | Partenaire |
| Point relais | Réceptionne, garde, remet contre code | Partenaire |
| Modérateur | Traite les signalements de contenu | Exploitant |
| Opérateur | Vérifie, arbitre, réconcilie, administre | Exploitant |
| Prestataire de paiement | Encaissement mobile money et carte | Partenaire **à contractualiser** |
| Marque | Campagnes et collaborations | Client, phase ultérieure |

---

# 6. Exigences fonctionnelles

Exprimées en besoins. La traduction en fonctionnalités figure dans `JP_BACKLOG.md` (identifiants `Fxx.y`) et la conception dans `JP_CAHIER_DES_CHARGES.md`.

## 6.1 Confiance et protection — *priorité absolue*

| Réf. | Besoin | Fonctionnalités |
|---|---|---|
| **B1.1** | Un acheteur doit pouvoir acheter chez une boutique qu'il ne connaît pas sans risquer de perdre son argent. | F4.4, F4.5, F4.6 |
| **B1.2** | Aucun boutique ne doit pouvoir percevoir d'argent avant que son identité et son compte mobile money n'aient été vérifiés. | F0.6, F0.7 |
| **B1.3** | Chaque transaction doit produire une preuve datée, conservée et consultable par les deux parties. | F4.11, F6.6 |
| **B1.4** | Un acheteur mécontent doit pouvoir signaler un problème **sans avoir à affronter directement la boutique**, et obtenir une décision motivée. | F6.3, F6.4, F6.5 |
| **B1.5** | Le comportement passé d'une boutique doit être visible avant l'achat. | F6.1, F6.2 |
| **B1.6** | Seule une personne ayant réellement payé peut noter. | F6.1 |
| **B1.7** | Une boutique ne doit plus immobiliser de stock pour une commande non payée. | F1.10, F3.10, F2.7 |

## 6.2 Vente en direct

| Réf. | Besoin | Fonctionnalités |
|---|---|---|
| **B2.1** | Une boutique doit pouvoir diffuser en direct depuis son téléphone, sans matériel ni compétence particulière. | F2.3, F2.13 |
| **B2.2** | Un acheteur doit pouvoir commander pendant le direct **sans écrire un mot et sans quitter la vidéo**. | F2.6, F2.8 |
| **B2.3** | Le prix et le stock restant doivent être visibles à l'écran et à jour en temps réel. | F2.5 |
| **B2.4** | Deux acheteurs ne doivent jamais pouvoir acheter le même dernier article. | F1.10, F2.7 |
| **B2.5** | Une coupure de réseau ne doit faire perdre ni le direct, ni une réservation en cours. | F2.13 |
| **B2.6** | La boutique doit voir ses ventes tomber en temps réel pendant qu'elle présente. | F2.14, F2.15 |
| **B2.7** | Un direct terminé doit rester achetable. | F2.16 *(phase 2)* |

## 6.3 Contenu et découverte

| Réf. | Besoin | Fonctionnalités |
|---|---|---|
| **B3.1** | Un utilisateur doit trouver, à toute heure, du contenu nouveau qui l'intéresse. | F14.1, F14.2, F14.3 |
| **B3.2** | Tout contenu doit permettre d'acheter en un geste ce qui y est montré. | F14.5, **exigence bloquante** |
| **B3.3** | Le contenu proposé doit correspondre à la taille, au budget et au style de la personne. | F14.3, F17.9, F0.5 |
| **B3.4** | Un acheteur doit pouvoir montrer publiquement ce qu'il a reçu, et ce geste doit valoir confirmation de réception et avis. | **F14.7** |
| **B3.5** | Un utilisateur doit pouvoir consommer du contenu **sans le son**. | F14.21 |
| **B3.6** | La consultation doit rester possible sur une connexion lente et un forfait limité. | F0.9, F13.1, F13.2 |
| **B3.7** | Un visiteur doit pouvoir regarder sans compte, et créer un compte sans perdre ce qu'il était en train de faire. | F0.10 |

## 6.4 Créatrices et revenu sans capital

| Réf. | Besoin | Fonctionnalités |
|---|---|---|
| **B4.1** | Une personne ayant une audience doit pouvoir gagner de l'argent **sans acheter de stock**. | F15.3, F15.4, F15.5 |
| **B4.2** | Une créatrice doit pouvoir vendre un article **avant** de l'avoir acheté, sans faire peser ce risque sur l'acheteur. | **F15.8** |
| **B4.3** | Si une précommande n'atteint pas son seuil, tous les acheteurs doivent être remboursés automatiquement et intégralement. | F15.8, **exigence bloquante** |
| **B4.4** | Une créatrice doit connaître non pas ses vues, mais **ce qu'elle a fait gagner**. | F15.6 |
| **B4.5** | Une boutique doit pouvoir refuser que ses articles soient affiliés. | F15.4 |
| **B4.6** | Une vente doit être attribuée sans ambiguïté à la créatrice qui l'a générée. | F15.4 |

## 6.5 Paiement et argent

| Réf. | Besoin | Fonctionnalités |
|---|---|---|
| **B5.1** | Payer avec les moyens réellement utilisés à Madagascar : MVola, Orange Money, Airtel Money. | F4.1 |
| **B5.2** | Une part de la demande refusant le prépaiement doit rester accessible. | F4.3 ⚠️ |
| **B5.3** | Le montant total, frais de livraison compris, doit être connu **avant** l'engagement, jamais découvert à la fin. | F2.8, F3.2 |
| **B5.4** | Un tiers doit pouvoir payer le panier d'une autre personne, y compris depuis l'étranger et sans compte. | F16.1 à F16.4 |
| **B5.5** | La boutique doit voir clairement ce qui lui est dû, ce qui est encore retenu, et pouvoir retirer ce qui est disponible. | F4.8 |
| **B5.6** | Une commission doit être connue avant la vente, jamais découverte après. | F10.1 |
| **B5.7** | Un paiement interrompu ne doit ni prélever deux fois, ni perdre la commande. | F4.10 |

## 6.6 Livraison

| Réf. | Besoin | Fonctionnalités |
|---|---|---|
| **B6.1** | L'acheteur doit pouvoir choisir entre domicile et point de retrait. | F3.4, F5.3 |
| **B6.2** | Le retrait en point relais doit être possible **sans communiquer d'adresse personnelle**. | F5.3, F5.4 |
| **B6.3** | Les deux parties doivent suivre l'acheminement avec la même information. | F5.2 |
| **B6.4** | La remise doit produire une preuve opposable. | F5.4, F5.5 |
| **B6.5** | Une boutique doit pouvoir remettre plusieurs commandes en un seul trajet. | F5.6 |
| **B6.6** | Un article qui ne va pas à la taille doit pouvoir être échangé ou retourné. | F5.8 *(phase 2)* |

## 6.7 Protection des personnes

| Réf. | Besoin | Fonctionnalités |
|---|---|---|
| **B7.1** | Une personne qui publie doit pouvoir décider **à l'avance** qui peut lui écrire. | F19.2, F19.11 |
| **B7.2** | Les propos insultants doivent être filtrés **avant** que la personne visée ne les lise. | F19.1 |
| **B7.3** | Un signalement doit se faire en un geste, et l'urgence doit être traitée en priorité. | F19.3, F19.12 |
| **B7.4** | Aucun mineur ne doit pouvoir publier de contenu vidéo. | F19.5, **exigence bloquante** |
| **B7.5** | Une créatrice doit pouvoir faire retirer un contenu qui lui a été volé. | F19.8 |
| **B7.6** | Toute sanction doit être motivée et contestable. | F19.9 |

## 6.8 Exploitation

| Réf. | Besoin | Fonctionnalités |
|---|---|---|
| **B8.1** | L'exploitant doit pouvoir vérifier une boutique, arbitrer un litige et modérer un contenu depuis un outil dédié. | F11.1, F11.3, F19.7 |
| **B8.2** | Les flux financiers doivent être rapprochés quotidiennement, y compris les espèces. | F11.5 |
| **B8.3** | Les paramètres économiques doivent être modifiables sans nouvelle livraison logicielle. | F11.6 |
| **B8.4** | Les indicateurs du pilote doivent être mesurés **dès le premier direct**. | **F11.7** |
| **B8.5** | Toute action d'administration doit être tracée. | F11.9 |

---

# 7. Exigences non fonctionnelles

## 7.1 Accessibilité technique — *contrainte structurante*

| Réf. | Exigence |
|---|---|
| **N1.1** | L'application doit fonctionner sur un téléphone Android d'entrée de gamme (mémoire et stockage limités). Version Android minimale à arrêter selon le parc réel. |
| **N1.2** | Le fichier d'installation doit rester le plus léger possible ; une version web légère doit exister pour ceux qui ne peuvent pas installer. |
| **N1.3** | Le produit doit rester utilisable sur une connexion lente et instable, et se rétablir seul après une coupure. |
| **N1.4** | La consommation de données doit être maîtrisée et un mode économie doit être disponible et proposé automatiquement en cas de débit faible. |
| **N1.5** | Les informations critiques déjà chargées — commande, code de retrait, facture — doivent rester consultables hors connexion. |

## 7.2 Performance

| Réf. | Exigence |
|---|---|
| **N2.1** | Du clic sur « Je prends » au paiement confirmé : **moins de 30 secondes** dans le cas nominal. *Objectif produit, à valider.* |
| **N2.2** | Le stock affiché en direct doit refléter la réalité en quasi-temps réel ; **la survente doit être impossible**, y compris en cas d'appuis simultanés. |
| **N2.3** | La latence du direct doit rester compatible avec une interaction : la boutique doit pouvoir répondre à ce qui vient de se passer. |
| **N2.4** | Le fil doit rester fluide pendant le défilement, y compris sur un appareil modeste. |
| **N2.5** | Le système doit absorber les pics de charge du soir, quand plusieurs directs ont lieu simultanément. |

## 7.3 Sécurité et données personnelles

| Réf. | Exigence |
|---|---|
| **N3.1** | Les pièces d'identité doivent être chiffrées, à accès restreint et tracé, et conservées pour une durée définie. |
| **N3.2** | L'adresse personnelle d'un acheteur ne doit jamais être exposée à un donateur, ni à une créatrice, ni publiquement. |
| **N3.3** | Aucun secret de paiement ne transite ni n'est stocké par JP : l'encaissement passe par des prestataires agréés. |
| **N3.4** | Toute opération financière et toute décision d'arbitrage doivent être journalisées de façon inaltérable. |
| **N3.5** | Le traitement des données personnelles doit être conforme au cadre légal malgache. Un utilisateur doit pouvoir obtenir la suppression de son compte. |
| **N3.6** | Les contenus vidéo publiés doivent être conservés le temps nécessaire à l'instruction d'un litige, même après suppression par l'auteur. |

## 7.4 Langue et localisation

| Réf. | Exigence |
|---|---|
| **N4.1** | Interface intégralement disponible en **malgache et en français**, choisissable et modifiable. |
| **N4.2** | Montants en **Ariary**, formatés selon l'usage local. |
| **N4.3** | Les adresses doivent se saisir par **quartier et repères**, l'adressage postal n'étant pas praticable. |
| **N4.4** | Le vocabulaire de l'interface doit reprendre les mots réellement employés par les utilisateurs, pas un vocabulaire de commerce électronique importé. |

## 7.5 Disponibilité et exploitation

| Réf. | Exigence |
|---|---|
| **N5.1** | La plateforme doit être disponible en priorité sur la plage 18 h – 23 h, période des directs. Une indisponibilité à cette heure est bien plus grave qu'à toute autre. |
| **N5.2** | Les notifications critiques — colis arrivé, code de retrait, expiration de réservation — doivent disposer d'un **repli SMS**. |
| **N5.3** | Les signalements d'urgence doivent être traités dans un délai court, à engager contractuellement. |
| **N5.4** | Sauvegardes régulières, restauration testée. |

## 7.6 Éthique de conception — *exigence, pas intention*

| Réf. | Exigence |
|---|---|
| **N6.1** | **Toute rareté affichée doit être réelle.** Aucun faux compte à rebours, aucun stock artificiellement minoré, aucun compteur d'audience gonflé. |
| **N6.2** | Aucun frais ne doit apparaître après l'engagement d'achat. |
| **N6.3** | Tout contenu rémunéré doit être identifié comme tel. |
| **N6.4** | Les notifications doivent être regroupées et paramétrables finement ; aucune notification sans contenu réel. |
| **N6.5** | Aucun mécanisme d'engagement ne doit s'appliquer à un mineur. |

*Justification : sur un produit dont l'actif unique est la confiance, une manipulation découverte détruit davantage de valeur qu'elle n'en produit. Ces exigences sont des exigences économiques.*

---

# 8. Contraintes

| Domaine | Contrainte |
|---|---|
| **Paiement** | Dépendance à des prestataires mobile money et à un agrégateur carte. **Aucun accord n'est signé à ce jour.** Les délais, les frais et les modalités de conservation des fonds conditionnent une part importante de la conception. |
| **Réglementation** | La conservation de fonds pour compte de tiers doit être cadrée avec le partenaire de paiement et le régulateur. JP ne doit pas se retrouver en position d'établissement de paiement de fait. |
| **Logistique** | Réseau de points relais **à constituer**. Adressage non normalisé. Coût de livraison élevé au regard du panier. |
| **Réseau et parc** | Connexions lentes et intermittentes, forfaits limités, terminaux modestes, coût de la recharge électrique. |
| **Concurrence d'usage** | Facebook est gratuit, déjà installé, et détient l'audience. JP ne peut pas gagner sur le terrain du confort seul. |
| **Ressources** | Équipe restreinte, horizon de lancement d'environ 3 mois annoncé — **tendu au regard du périmètre incluant la vidéo**. Voir l'avertissement de périmètre dans `JP_BACKLOG.md`. |
| **Modération** | Coût humain permanent, non compressible, à budgéter dès le lancement. |
| **Contenu** | Un fil vide est pire que pas de fil : l'ouverture suppose un amorçage préalable de créatrices. |

---

# 9. Critères de succès

## 9.1 Les quatre mesures fondatrices

Ces indicateurs n'ont jamais été mesurés sur ce marché. **Les instrumenter est un objectif du projet en soi**, et ils doivent être disponibles dès le premier direct.

| Indicateur | Ce qu'il révèle |
|---|---|
| Commandes annoncées en direct, jamais conclues | Le chiffre d'affaires qui s'évapore entre l'envie et le paiement |
| Temps administratif par heure de direct | Le coût caché du travail après-vente |
| Acheteurs renonçant faute de paiement sûr | La demande bloquée par la seule question de la confiance |
| Stock immobilisé par des réservations non honorées | Le capital gelé par l'absence d'engagement |

## 9.2 Critères d'acceptation du produit

| Critère | Seuil |
|---|---|
| Aucune survente | **Zéro cas**, y compris en charge simultanée. Critère bloquant. |
| Aucun litige sans issue | **100 %** des litiges reçoivent une décision motivée dans le délai annoncé. Critère bloquant. |
| Fonds correctement séquestrés et libérés | **100 %** de concordance à la réconciliation. Critère bloquant. |
| Aucune publication de contenu par un mineur | **Zéro cas**. Critère bloquant. |
| Aucun contenu sans article achetable | **Zéro cas**. Critère bloquant. |
| Durée « Je prends » → paiement confirmé | Sous 30 s dans le cas nominal. *Hypothèse à valider.* |
| Utilisable sur le terminal de référence | Validé sur un appareil d'entrée de gamme réel, pas sur émulateur. |

## 9.3 Ce que le pilote doit valider

Toutes les valeurs ci-dessous sont **des questions ouvertes, pas des objectifs chiffrés**.

| Question | Pourquoi elle est déterminante |
|---|---|
| Quelle part d'acheteurs refuse le prépaiement ? | Conditionne la décision sur le paiement à la livraison, la plus lourde du projet |
| À partir de quel taux de commission une boutique cherche-t-elle à contourner la plateforme ? | Conditionne tout le modèle économique |
| Quelle durée de réservation optimise conversion et rotation du stock ? | Conditionne le cœur technique du direct |
| Quelle proportion d'acheteurs publie un unboxing ? | Détermine si le moteur d'acquisition gratuite s'amorce |
| Que convertit un clip, comparé à un direct ? | Détermine si le contenu vend ou s'il ne fait que divertir |
| Combien coûte une cliente amenée par une créatrice, comparé à la publicité payante ? | Justifie ou invalide l'investissement dans la couche sociale |
| Le panier d'une commande-cadeau est-il significativement plus élevé ? | Détermine si la diaspora est un axe stratégique ou une fonctionnalité |
| Quelle est la répartition domicile / point relais, et son effet sur l'abandon ? | Conditionne l'économie du petit panier |
| Une boutique vérifiée inconnue convertit-elle autant qu'une boutique recommandée par une amie ? | **Valide ou invalide la thèse centrale du projet** |

---

# 10. Hypothèses et risques

## 10.1 Hypothèses de départ

| Hypothèse | Si elle est fausse |
|---|---|
| Les boutiques adopteront un outil qui supprime une corvée existante plutôt que d'en créer une nouvelle | L'acquisition de boutiques devient le poste dominant, bien au-delà du prévu |
| La protection de l'argent suffit à faire acheter chez un inconnu | Le panier reste plafonné et la croissance dépend uniquement du bouche-à-oreille |
| Des créatrices accepteront d'être rémunérées à la commission | La couche sociale reste vide et l'acquisition redevient payante |
| Le point relais fera baisser assez le coût pour rendre le petit panier viable | Le modèle ne fonctionne que sur les paniers élevés, marché beaucoup plus étroit |
| Des partenaires paiement et livraison accepteront de contractualiser | **Le projet ne peut pas exister.** Risque le plus critique du dossier. |

## 10.2 Risques principaux

| Risque | Portée | Traitement |
|---|---|---|
| **Aucun accord de paiement signé** | Bloquant | À sécuriser avant tout engagement de développement |
| **Contournement de la plateforme** — la vente se conclut sur JP puis le paiement se fait hors plateforme | Élevé | Le séquestre et la facture doivent apporter assez de valeur pour que contourner soit perdant. À mesurer. |
| **Harcèlement des créatrices** | Élevé — détruirait le positionnement | Épique 19 livrée intégralement dès le lancement, modération dotée en moyens |
| **Fil vide au lancement** | Élevé | Amorçage rémunéré de créatrices avant l'ouverture |
| **Dérive vers le réseau social généraliste** | Élevé — perte du positionnement | Principe directeur : aucun contenu sans article |
| **Précommande détournée** — collecte sans livraison | Élevé — reproduirait l'arnaque que JP combat | Remboursement automatique, délai maximal, plafonnement, libération de fonds encadrée |
| **Périmètre supérieur au délai annoncé** | Moyen | Arbitrage à poser explicitement : allonger le délai, ou livrer le noyau social en deux temps |
| **Coût de la vidéo** (transcodage, stockage, diffusion) | Moyen | À chiffrer tôt ; c'est le poste technique le plus imprévisible |
| **Droits musicaux** | Moyen | Bibliothèque restreinte sous licence en V1 |
| **Dépendance à Facebook pour l'audience initiale** | Moyen | Mesurer le taux de bascule vers JP et prévoir la sortie de cette dépendance |

---

# 11. Ce qui reste à trancher avant le développement

Ces points ne peuvent pas être décidés par l'équipe technique. Ils doivent l'être par le commanditaire, avec les boutiques pilotes et les partenaires.

1. **Le paiement à la livraison est-il ouvert, et à quelles conditions ?**
2. **La précommande : quand les fonds sont-ils libérés à la créatrice, et sous quel délai maximal d'expédition ?**
3. **Qui supporte la commission d'affiliation ?**
4. **Quelle durée de réservation du stock ?**
5. **Quel délai de libération automatique des fonds après livraison ?**
6. **Quel barème de commission ?**
7. **Qui paie un retour pour cause de taille ?**
8. **Quel montant de crédit pour un unboxing ?**
9. **Quels moyens et quels délais d'engagement pour la modération ?**
10. **Combien de créatrices amorcer avant l'ouverture, et à quel coût ?**

---

*Document établi à partir de `JP_DECK.md` et de l'analyse de positionnement. La solution correspondante est décrite dans `JP_CAHIER_DES_CHARGES.md` et `JP_CDC_TECHNIQUE.md`.*
