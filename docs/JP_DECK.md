# JP — Je prends
## Dossier de présentation · investisseurs & partenaires

> Version texte du deck — 25 slides. Un bloc = une slide. Les **Notes** sont destinées à celui qui présente ; elles sont aussi intégrées dans le volet « Commentaires » de chaque slide du `.pptx`.
>
> **Règle tenue dans tout le document : aucun chiffre n'est présenté comme acquis.** Toute valeur numérique porte la mention « hypothèse à valider ». Les prestataires de paiement sont cités comme rails *visés*, pas comme partenariats signés.

### Fichiers

| Fichier | Usage |
|---|---|
| `JP_Deck.pptx` | **Le deck à présenter et à envoyer.** 25 slides, 16:9, notes de présentation incluses. |
| `JP_Deck.pdf` | Version PDF, pratique à envoyer. Exportée sous Linux : Georgia / Trebuchet MS / Consolas y étant absentes, les polices sont substituées. Pour un PDF fidèle, exporter depuis PowerPoint. |
| `JP_DECK.md` | Le fond, éditable. Modifier ici d'abord. |
| `build_deck.py` | Régénère le `.pptx` : `python build_deck.py JP_Deck.pptx` (requiert `python-pptx`). |

### Dossier complet

| Document | Contenu |
|---|---|
| `JP_POSITIONNEMENT.md` | Ce que nous vendons réellement, et pourquoi. Analyse du marché malgache. |
| `JP_EXPRESSION_DE_BESOIN.md` | Les besoins, indépendamment de la solution. |
| `JP_DESCRIPTION_PROJET.md` | Le projet dans son ensemble : produit, modèle, feuille de route, budget. |
| `JP_BACKLOG.md` | Inventaire des fonctionnalités et parcours par persona. 19 épiques. |
| `JP_CAHIER_DES_CHARGES.md` | Spécification fonctionnelle et critères de recette. |
| `JP_CDC_TECHNIQUE.md` | Architecture, modèle de données, contraintes techniques. |

**Polices** — Georgia (titres), Trebuchet MS (corps), Consolas (repères et chiffres). Présentes d'origine sous Windows et macOS. Sous Linux elles seront substituées ; le repli reste dans la même classe (serif / sans / mono), donc la mise en page ne casse pas.

---

## Slide 1 — Couverture

**MADAGASCAR · MODE · BEAUTÉ · CHAUSSURES**

# JP
## Je prends.

**Le direct devient une boutique.**

Dossier de présentation — investisseurs & partenaires

**Notes.** Ouvrir sur le nom. JP, ce sont les deux mots que les acheteurs écrivent déjà en commentaire : « je prends ». Notre produit est ce geste, transformé en bouton. Ne pas expliquer plus, la slide-pivot le fera.

---

## Slide 2 — Le marché n'est pas à créer

# Il est déjà en direct.

Chaque soir, des boutiques et des boutiques présentent leurs articles en direct sur les réseaux sociaux. Les acheteurs sont là. Ils regardent, ils commentent, ils achètent.

Ce qui manque n'est pas la demande.

**C'est l'outil.** Un réseau social est fait pour faire parler. Pas pour encaisser, facturer, livrer.

**Notes.** Point clé pour l'investisseur : nous ne créons pas un usage, nous outillons un usage existant. Le risque d'adoption est donc faible — les boutiques n'ont pas une nouvelle habitude à prendre, ils ont une corvée à supprimer.

---

## Slide 3 — Problème 1 : personne n'est protégé

**ACTE I · LE PROBLÈME**

# Le risque est porté par les personnes.

**Côté acheteur.** Un paiement envoyé par mobile money vers un numéro personnel. Puis plus de nouvelles. Aucun recours.

**Côté boutique.** Des articles réservés en commentaire, puis jamais payés. Le stock est immobilisé, invendable pendant des jours, pour une commande fantôme.

**Au milieu : rien.** Pas de contrat, pas de trace, pas d'arbitre. Une capture d'écran ne vaut rien.

**Notes.** C'est le problème n° 1 : c'est là qu'est l'argent, et c'est là qu'est l'émotion. Bien montrer que l'arnaque va dans les deux sens — c'est ce qui justifie une plateforme tierce plutôt qu'un simple outil pour boutiques. Une plateforme qui ne protégerait qu'un seul côté ne réglerait pas le problème de confiance.

---

## Slide 4 — Problème 2 : le doute plafonne le panier

**ACTE I · LE PROBLÈME**

# Le plafond n'est pas le pouvoir d'achat. C'est le doute.

Pas de facture. Pas d'historique de commande. Pas de suivi de livraison. Pas d'avis vérifié.

Alors l'acheteur fait la seule chose rationnelle : **il limite son risque.**

- Il commande petit.
- Il commande rarement.
- Et seulement chez la personne qu'une amie lui a recommandée.

**Et le doute n'est pas seulement financier.** Se faire avoir, c'est aussi devoir l'avouer. Beaucoup n'achètent pas pour ne pas avoir à raconter ça — et ceux qui se font avoir ne réclament pas, ils disparaissent.

**Notes.** C'est l'argument économique du problème : le doute est un coût. Insister sur le dernier paragraphe, il est rarement formulé et il est décisif ici : la honte est un frein aussi puissant que la perte d'argent, et elle explique pourquoi le problème est invisible dans les statistiques — les victimes se taisent.

---

## Slide 5 — Problème 3 : l'administration dure la soirée

**ACTE I · LE PROBLÈME**

# Le direct dure une heure. L'administration dure la soirée.

Après le direct, la boutique :

1. relit des centaines de commentaires pour retrouver qui a dit « je prends », et dans quel ordre ;
2. ouvre un message privé par client — la taille, l'adresse, le paiement, la disponibilité ;
3. recopie tout à la main dans un cahier ou un tableur ;
4. relance ceux qui ne répondent plus.

**L'essentiel du travail arrive après la vente.**

**Notes.** C'est la plainte la plus fréquente des boutiques — ce n'est pas leur perte la plus lourde, d'où sa place en troisième position. Le temps gagné est un excellent argument de rétention (au bout de deux semaines, il ne revient plus au cahier) mais un mauvais argument d'acquisition : chez un micro-entrepreneur, la soirée n'a pas de prix de marché. On ne vend pas des heures, on vend de l'argent récupéré.

---

## Slide 6 — Problème 4 : l'audience sans capital

**ACTE I · LE PROBLÈME**

# Elle a une audience. Elle ne vend rien.

Des créatrices filment leurs tenues, cumulent une audience réelle, et font **gratuitement** la promotion de boutiques qui ne les rémunèrent pas.

Ce qui leur manque n'est ni le talent, ni les abonnés.

**C'est le capital.** Pour vendre, il faudrait acheter du stock d'avance — sans savoir s'il partira. Elles n'ont pas cet argent. Alors elles ne vendent pas.

**Une audience réelle reste sans valeur économique pour celle qui la détient.**

**Notes.** Nouveau problème, absent des versions précédentes du dossier. C'est la troisième face du marché, et elle est nombreuse à Madagascar. La retenir permet d'introduire deux fonctions que personne n'offre ici : l'affiliation et la précommande groupée. C'est aussi ce qui transforme le coût d'acquisition en coût variable — voir la slide sur le modèle.

---

## Slide 7 — Le coût de ce désordre

**ACTE I · LE PROBLÈME**

# Ce que nous allons mesurer.

Nous ne publions pas de chiffres que nous n'avons pas mesurés. Voici les quatre indicateurs que le pilote instrumentera dès le premier direct :

| Indicateur | Ce qu'il révèle |
|---|---|
| Commandes annoncées en direct, jamais conclues | Le chiffre d'affaires qui s'évapore entre l'envie et le paiement |
| Temps administratif par heure de direct | Le coût caché du travail après-vente |
| Acheteurs qui renoncent faute de paiement sûr | La demande bloquée par la seule question de la confiance |
| Stock immobilisé par des réservations non honorées | Le capital gelé par l'absence d'engagement |

*Hypothèses à valider — ces quatre mesures sont l'objectif du pilote, pas un résultat.*

**Notes.** Slide de crédibilité. Un investisseur sérieux se méfie d'un deck plein de chiffres inventés. Assumer de dire « nous ne savons pas encore, voici comment nous le saurons » vaut mieux qu'une statistique non sourcée. Préciser que le tableau de bord de ces quatre mesures est une exigence contractuelle du cahier des charges, livrée dès le premier direct.

---

## Slide 8 — La solution

**ACTE II · LA SOLUTION**

~~je prends 😍~~ ~~je prend 2~~ ~~c'est combien ?~~ ~~la taille M dispo ?~~

→ **[ JE PRENDS ]**

# On remplace le commentaire par un bouton.

Une action. Une quantité. Un paiement. Une facture.

**Notes.** Slide-pivot, à laisser respirer. Marquer un silence après « un bouton ». Les commentaires barrés à gauche se rassemblent en un seul geste à droite : c'est tout le produit en une image. Enchaîner immédiatement sur la slide suivante — le bouton est le mécanisme, la confiance est la valeur.

---

## Slide 9 — La confiance par construction

**ACTE II · LA SOLUTION**

# La confiance n'est pas une promesse. C'est un mécanisme.

- **Boutique vérifié** — identité et numéro mobile money contrôlés avant la première vente.
- **L'argent ne circule plus de main à main** — il transite par la plateforme, jamais vers un numéro personnel inconnu.
- **Fonds libérés à la confirmation** — la boutique est payée quand l'acheteur confirme la réception. *Modalités à caler avec le cadre réglementaire et le partenaire de paiement.*
- **Facture horodatée** — émise automatiquement, conservée des deux côtés.
- **Avis vérifiés** — seul un acheteur qui a réellement payé peut noter.
- **Litiges arbitrés** — signalés à JP, jamais en face à face. Décision motivée et tracée.
- **Score de confiance public** — construit sur les ventes honorées, les délais, les litiges.

**Notes.** **C'est la slide centrale du deck.** Chaque puce est l'antidote d'une arnaque décrite en slide 3. Si l'interlocuteur ne retient qu'une chose, c'est celle-ci. Lui donner du temps. Insister sur « litiges signalés à JP, jamais en face à face » : la confrontation directe est socialement coûteuse ici, et c'est pour cela que les gens abandonnent au lieu de réclamer.

---

## Slide 10 — Comment ça marche

**ACTE II · LA SOLUTION**

# Du direct au paiement, sans quitter l'écran.

1. **La boutique passe en direct.** Il présente l'article. Le prix et le stock restant s'affichent à l'écran, en direct.
2. **L'acheteur appuie sur « Je prends ».** Sans écrire un mot, sans quitter le direct.
3. **Il choisit la quantité, la taille et la livraison.** L'article lui est réservé quelques minutes. À domicile ou en point de retrait, au choix.
4. **Il paie par mobile money.** MVola, Orange Money, Airtel Money — ou carte bancaire. *Rails de paiement visés, à contractualiser.*
5. **La facture part automatiquement.** Commande créée, boutique notifié, suivi de livraison ouvert des deux côtés.

*Objectif produit : moins de 30 secondes entre le clic et le paiement confirmé.*

**Notes.** C'est la démonstration. Suivre les cinq étapes avec le doigt sur l'écran. Insister sur l'étape 3 : la réservation temporaire du stock est ce qui empêche la survente pendant un direct où tout part en même temps — c'est le point technique le plus critique du produit, et un critère de recette bloquant. Les 30 secondes sont une exigence technique, pas la promesse commerciale.

---

## Slide 11 — Avant / Après

**ACTE II · LA SOLUTION**

# Le même direct, sans le désordre.

| | Aujourd'hui, sur un réseau social | Avec JP |
|---|---|---|
| Prendre la commande | Un commentaire noyé dans le flux | Un bouton, quantité et taille incluses |
| Retrouver l'acheteur | Message privé, un par un | Commande nominative et horodatée |
| Encaisser | Numéro personnel, à la confiance | Paiement encaissé dans la plateforme |
| Preuve d'achat | Une capture d'écran | Une facture, pour les deux parties |
| Travail après le direct | Des heures de saisie | Zéro saisie : tout est déjà enregistré |
| Livraison | Arrangement au cas par cas | À domicile ou point de retrait, suivi partagé |
| En cas de litige | Parole contre parole | Historique consultable des deux côtés |
| Le lendemain | Le direct est mort | Le contenu vend encore |

**Notes.** La slide qui convainc. Ne pas lire les huit lignes : en choisir trois selon l'interlocuteur. Pour un investisseur, « encaisser » et « le lendemain ». Pour une boutique pilote, « prendre la commande » et « travail après le direct ».

---

## Slide 12 — Le contenu

**ACTE II · LA SOLUTION**

# Le direct dure une heure. Il en reste vingt-trois.

Stories, vidéos verticales courtes, looks : un fil que l'on parcourt par balayage, personnalisé selon la taille, le budget et le style.

- **Chaque vidéo est achetable.** L'article est là, avec son prix et son bouton. On achète sans quitter la vidéo, exactement comme en direct.
- **Le catalogue reste ouvert 24 h/24.** Chaque boutique a sa vitrine, même hors direct.
- **La vidéo est une meilleure preuve que la photo.** Une vraie personne, sa morphologie, le tombé du tissu : c'est le signal de taille le plus fiable qui existe.

> **Règle absolue : aucun contenu sans article achetable attaché.**
> JP n'est pas un réseau social avec une boutique. C'est une boutique dont le catalogue est fait de vidéos.

**Notes.** Anticipe deux objections d'un coup. La première : « et si la boutique ne fait pas de direct ce soir ? ». La seconde, celle d'un investisseur averti : « vous devenez un TikTok de plus, sans défendabilité ». La règle en encadré est la réponse, et elle doit être énoncée telle quelle — c'est une contrainte de conception inscrite au cahier des charges, pas une intention. Ajouter que le contenu est **le seul levier qui fasse baisser le coût d'acquisition**, qui est le poste dominant du budget.

---

## ~~Slide 13 — L'unboxing~~ ❌ **supprimée** *(`DP-17`)*

> Le geste filmé est retiré du produit. **Le numéro n'est pas réattribué** : les
> slides suivantes gardent le leur. ⚠️ `scripts/build_deck.py` génère encore
> cette slide — voir les points ouverts.

---

## Slide 14 — La créatrice

**ACTE II · LA SOLUTION**

# Elle n'a pas besoin d'acheter le stock.

**L'affiliation.** Elle ne possède rien. Elle recommande les articles d'autres boutiques, et touche une commission sur ce qui se vend grâce à elle. Zéro capital, zéro stock, zéro logistique. Elle gagne enfin de l'argent avec ce qu'elle fait déjà gratuitement.

**La précommande groupée.** Elle publie un article, collecte les commandes, et **ne commande chez le fournisseur qu'une fois le seuil atteint**. Elle achète avec l'argent des clientes, pas avec le sien.

**Et si le seuil n'est pas atteint, tout le monde est remboursé automatiquement.** Sans discussion, sans intervention. C'est ce qui rend la précommande acceptable.

**On ne lui montre pas des vues. On lui montre ce qu'elle a fait gagner.**

**Notes.** C'est le déblocage le plus concret pour recruter des créatrices : on supprime la seule barrière réelle. Et cela correspond à un usage informel qui existe déjà — les commandes groupées entre amies, faites à la main sur Messenger. Le remboursement automatique est une exigence bloquante du cahier des charges : sans lui, la précommande reproduirait exactement l'arnaque que JP combat.

---

## Slide 15 — Le cadeau et la diaspora

**ACTE II · LA SOLUTION**

# Offrir un objet, pas envoyer de l'argent.

Elle compose son panier. Elle envoie un lien. Quelqu'un d'autre paie — son frère, sa mère, une amie, **ou quelqu'un depuis l'étranger, par carte.**

**Pourquoi c'est sérieux :**

- Le panier d'un cadeau est **structurellement plus élevé** : on n'offre pas au prix qu'on se paie à soi-même.
- Celui qui paie **n'a pas la contrainte de pouvoir d'achat locale**. Le plafond du doute saute.
- La diaspora envoie aujourd'hui de l'argent **sans jamais savoir ce qui en est fait**. Ici, elle offre un objet précis, chez une boutique vérifiée, avec le suivi de livraison et la preuve de remise.
- Et le remerciement publié devient du contenu, donc de l'acquisition. La boucle se referme.

**C'est le premier canal de JP qui ne dépend pas du pouvoir d'achat local.**

**Notes.** Axe absent des versions précédentes du dossier. Il donne aussi un usage réel au paiement par carte, qui n'en avait aucun. À présenter comme une hypothèse forte à mesurer, pas comme un acquis : si le panier moyen d'une commande-cadeau est nettement supérieur, cela devient un axe stratégique à part entière.

---

## Slide 16 — Trois métiers

**ACTE II · LA SOLUTION**

# Un produit, trois métiers.

**Côté boutique — son studio.**
Passer en direct depuis son téléphone · son catalogue et son stock à jour en temps réel · ses commandes, payées, à expédier, livrées · ses ventes par direct, par article, par période · ses abonnés et ses meilleurs clients.

**Côté acheteuse — sa boutique.**
Le fil des directs et des vidéos · le bouton « Je prends » · le panier multi-boutiques · ses commandes et le suivi de livraison · domicile ou point relais · ses factures, ses avantages fidélité.

**Côté créatrice — son studio à elle.**
Publier · sa sélection d'articles chez plusieurs boutiques · ses précommandes · et un tableau de bord qui va des vues jusqu'aux gains.

**Notes.** Montrer que ce n'est pas une application « avec trois menus », mais trois produits qui ont chacun leur logique. La boutique vient chercher du chiffre. L'acheteuse vient chercher de la confiance. La créatrice vient chercher un revenu sans capital. Trois discours de vente différents — ne jamais les mélanger en rendez-vous.

---

## Slide 17 — La livraison, au choix de l'acheteur

**ACTE II · LA SOLUTION**

# À domicile, ou en point de retrait.

**Livraison à domicile.** L'adresse est enregistrée une fois, réutilisée ensuite. Suivi visible des deux côtés, du départ à la remise.

**Retrait en point relais.** L'acheteur récupère quand il veut, près de chez lui ou de son travail. Moins cher, pas de rendez-vous à tenir, pas de livreur à attendre.

**Pourquoi les deux comptent :**
- **Il rend l'adresse facultative** : celle qui hésite à donner son domicile à un inconnu commande quand même.
- Le point de retrait fait baisser le coût de livraison — le premier frein sur les petits paniers.
- Il supprime l'échec de livraison quand personne n'est là.
- La boutique dépose plusieurs commandes en un seul trajet.

**Notes.** Argument souvent sous-estimé et pourtant décisif : les frais de livraison peuvent dépasser la marge sur un petit article. Le point de retrait est ce qui rend le panier à faible montant économiquement viable — et donc ce qui rend la fréquence d'achat possible. Le premier point, l'adresse facultative, est mis en tête volontairement : c'est un frein de confiance, pas un frein de coût.

---

## Slide 18 — Communauté & fidélité

**ACTE II · LA SOLUTION**

# La boutique ne subit plus son audience. Elle la cultive.

- **Des abonnés, pas des spectateurs.** On suit une boutique comme on suit un créateur.
- **Notification au bon moment.** Quand il passe en direct, quand il lance une promotion, quand une pièce attendue revient en stock.
- **Il connaît ses meilleurs clients.** Nombre d'achats, montant cumulé, ancienneté, régularité — classés.
- **Il récompense qui il veut.** Une remise réservée à un palier de fidélité, un accès en avance à une collection, un cadeau pour ses ambassadeurs.
- **Le rendez-vous plutôt que la notification.** « Tous les vendredis à 18 h » vaut mieux qu'une alerte de plus.

**Notes.** C'est le moteur de rétention, et donc l'argument de défendabilité. Une boutique qui a construit sa base d'abonnés et son programme de fidélité sur JP ne repart pas ailleurs. Ses clients non plus. Le dernier point est important : nous refusons la surenchère de notifications, parce qu'un utilisateur qui coupe tout nous fait perdre les notifications utiles — colis arrivé, code de retrait.

---

## Slide 19 — Ce que personne ne fait

**ACTE II · LA SOLUTION**

# Huit choses que personne ne fait sur ce marché.

1. **Le bouton à la place du commentaire.** Une action au lieu d'une négociation en message privé.
2. **L'argent tenu jusqu'à la réception.** La protection est un mécanisme, pas une promesse.
3. **Le mur d'avis vérifiés, public et sans compte.** Chaque avis adossé à un achat réel, consultable avant même de s'inscrire.
4. **La créatrice sans capital.** Affiliation et précommande groupée.
5. **Le cadeau depuis l'étranger.** Offrir un objet précis, pas envoyer de l'argent.
6. **Le point de retrait sans adresse.** Ce qui rend le petit panier viable.
7. **Le replay qui vend.** Le direct terminé reste achetable, chaque article repéré à sa minute. *(phase 2)*
8. **Bien à sa taille.** Guide par marque, avis d'acheteuses de la même morphologie, vidéos portées. *(phase 2)*

**Notes.** Ne pas dérouler les huit. En présenter deux, selon l'interlocuteur : pour un investisseur, le mur d'avis vérifiés (point 3) et la créatrice sans capital (point 4), parce que ce sont les deux qui font baisser le coût d'acquisition. Les autres montrent la profondeur de la feuille de route.

---

## Slide 20 — Pourquoi la mode et la beauté

**ACTE II · LA SOLUTION**

# Un vertical, pas une marketplace de plus.

- **L'achat est visuel et émotionnel.** Une matière, un tombé, une teinte sur une peau : cela se montre, cela ne se décrit pas. Le direct et la vidéo sont les formats naturels de ce produit.
- **Le panier se renouvelle.** On rachète une saison après l'autre. La fréquence est structurellement plus élevée que sur la plupart des catégories.
- **Le vertical permet ce qu'un généraliste ne fera jamais.** Tailles par marque, matières, teintes adaptées aux carnations, looks complets, retours pour cause de taille.
- **Les boutiques sont déjà là.** Le vestimentaire domine déjà la vente en direct. Nous n'avons pas à déplacer un usage, seulement à l'équiper.

**Notes.** Le vertical est une force, pas une limite. C'est ce qui permet de battre un généraliste sur l'expérience, et de recruter les boutiques par le bouche-à-oreille dans une communauté déjà connectée entre elle.

---

## Slide 21 — Modèle économique

**ACTE III · LE MODÈLE**

# Nous gagnons quand la boutique vend.

1. **Commission sur chaque vente** — le cœur du modèle. Prélevée au paiement, sans facturation à relancer.
2. **Commission d'affiliation** — sur les ventes générées par une créatrice. Adossée à une transaction réelle.
3. **Mise en avant** — produit, direct ou contenu sponsorisé, payé en Ariary par la boutique.
4. **Abonnement boutique** — par paliers : vitrine simple, puis outils avancés, statistiques, plusieurs utilisateurs.
5. **JP Club** — abonnement acheteuse : livraison offerte au-delà d'un montant, accès anticipé. Récurrent, sans coût marginal.
6. **Campagnes de marque** — la marque finance une campagne avec des créatrices, JP prend une part. Mesurée jusqu'à la vente.
7. **Insights marché** — tendances de tailles, de couleurs, de prix. Agrégés et anonymisés.

**La boutique ne paie rien tant qu'elle ne vend pas.**

> **Une mise au point sur la publicité.** Le CPM sur une audience malgache est dérisoire : il faudrait des dizaines de millions d'impressions pour un revenu significatif. À ce niveau d'audience, la commission rapporte déjà bien davantage. **La couche sociale se monétise par le commerce qu'elle déclenche, pas par l'attention qu'elle capte.** La régie publicitaire viendra après, si l'audience la justifie.

**Notes.** Ordonner par certitude : la commission est le modèle, le reste est de l'expansion. Assumer l'encadré plutôt que de le taire — un investisseur qui connaît le marché africain sait que la publicité display n'y finance rien avant très longtemps ; le dire nous-mêmes est un signe de sérieux. L'affiliation en position 2 est importante : elle transforme le coût d'acquisition en coût variable, payé uniquement sur une vente réalisée.

---

## Slide 22 — Ce qui rend le projet défendable

**ACTE III · LE MODÈLE**

# Ni le code, ni la vitesse.

Trois actifs, qui s'accumulent au lieu de se copier :

- **L'infrastructure de confiance.** Identités vérifiées, historique de transactions, scores construits sur des faits. Un concurrent peut copier l'interface en trois mois ; il ne peut pas copier deux ans d'historique.
- **Le graphe des relations.** Abonnés, créatrices, meilleures clientes, paliers de fidélité. Une boutique qui a construit sa base ici ne repart pas. Ses clientes non plus.
- **La donnée verticale.** Nous serons les seuls à savoir ce qui se vend réellement dans le vestimentaire à Madagascar — taille par taille, couleur par couleur, prix par prix.

Et côté acheteuse, un coût de sortie qui monte tout seul : historique, factures, cagnotte, avis publiés, contenus.

**Notes.** Slide à sortir quand l'objection « qu'est-ce qui empêche quelqu'un de vous copier ? » arrive — elle arrive toujours. La bonne réponse n'est jamais « notre technologie ». Elle est : ce qui s'accumule. Le troisième point est le plus fort à long terme, et c'est aussi ce qui fonde la ligne « insights marché » du modèle économique.

---

## Slide 23 — Hypothèses à valider

**ACTE III · LE MODÈLE**

# Ce que nous supposons, et comment nous le vérifierons.

| Levier | Hypothèse de départ | À mesurer pendant le pilote |
|---|---|---|
| Commission par vente | Fourchette selon la catégorie | À partir de quel taux la boutique contourne la plateforme |
| Prépaiement | Une part des acheteurs le refusera | Écart de conversion entre prépaiement et paiement à la réception |
| Panier moyen | À établir sur le segment vestimentaire | Effet du paiement intégré sur le montant commandé |
| Conversion en direct | À établir | Spectateurs → « Je prends » → paiement confirmé |
| Conversion du contenu | Inconnue | Ce que convertit un clip, comparé à un direct |
| Production de contenu | Inconnue | Contenus publiés par acheteuse et par créatrice active |
| Acquisition par créatrice | Moins chère que la publicité | Coût d'une cliente amenée par une créatrice |
| Commande-cadeau | Panier plus élevé | Écart avec le panier ordinaire, part payée depuis l'étranger |
| Mode de livraison | Point de retrait majoritaire sur les petits paniers | Répartition, et effet sur le taux d'abandon |
| Budget de lancement | Acquisition = poste dominant | Coût réel d'un premier acheteur, d'un premier boutique |

> **Aucun chiffre de ce dossier n'est présenté comme acquis.** Les fourchettes se trancheront avec les premiers boutiques et les premières créatrices, pas dans une feuille de calcul.

**Notes.** Assumer cette slide plutôt que la cacher : elle montre que nous savons quelles sont les questions ouvertes, ce qu'un investisseur cherche précisément à savoir avant de financer une phase de validation. Si l'on ne doit en citer qu'une : le prépaiement. C'est la mesure qui conditionne le plus lourdement l'architecture du produit.

---

## Slide 24 — Le point bloquant : le lancement

**ACTE III · LE MODÈLE**

# Construire le produit n'est pas le problème. Le lancer, oui.

**Ce qui n'est pas bloquant.** La plateforme est un travail de développement identifié et cadré. Le seul poste techniquement incertain est la vidéo.

**Ce qui est bloquant.** Le lancement. Réunir au même moment les premiers boutiques, leurs abonnés, les premières créatrices, les partenaires paiement et livraison — et faire savoir que JP existe. Sans cet argent-là, le produit sort et ne rencontre personne.

**Les postes, par ordre de poids :** acquisition et animation · **amorçage du contenu** (un fil vide est pire que pas de fil : les premières créatrices doivent être recrutées et rémunérées avant l'ouverture) · développement · **modération** (coût humain permanent, dès le premier jour) · infrastructure vidéo · frais de paiement · logistique · juridique.

**Horizon envisagé : environ 3 mois**, test produit inclus. *Cet horizon est tendu au regard du périmètre — la vidéo et la modération pèsent. Deux issues honnêtes : allonger le délai, ou livrer le contenu en deux temps. C'est un arbitrage à poser maintenant, pas à découvrir en route.*

> **Nous demandons un budget de lancement, pas un budget de développement.** Le montant se cale avec le plan retenu — une ville, ou une ouverture plus large. C'est la discussion que nous voulons avoir.

**Notes.** Slide la plus importante pour l'investisseur : dire clairement où va l'argent et où est le risque. Ne pas annoncer un montant tant que le plan de lancement n'est pas arrêté — proposer plutôt de construire ensemble deux scénarios et de les chiffrer. Assumer que l'acquisition est le poste dominant est un signe de lucidité : un déploiement de marketplace se gagne sur l'acquisition, pas sur le code. Et assumer le paragraphe en italique : annoncer soi-même la tension de délai vaut infiniment mieux que de la faire découvrir au troisième mois.

---

## Slide 25 — Feuille de route & prochaines étapes

**ACTE III · LE MODÈLE**

# Trois phases. Une seule à financer aujourd'hui.

**Phase 1 — Le geste et la preuve.** Direct et bouton « Je prends », paiement mobile money, fonds tenus jusqu'à réception, facture automatique, suivi de commande, boutiques vérifiées — et le noyau de contenu : stories, clips achetables, créatrices et affiliation, précommande, cadeau, modération. *C'est le produit minimum qui règle le problème.*

**Phase 2 — La communauté.** Replay achetable, avis vérifiés et score public, abonnés et notifications, promotions programmées, paliers de fidélité et cagnotte, guide des tailles, retours, JP Club.

**Phase 3 — L'échelle.** Enchères et ventes flash, direct à deux, assistant de la boutique, espace marque, insights marché.

**Ce que nous cherchons.**
- Un **budget de lancement** — l'essentiel en acquisition et en amorçage de contenu. Montant à caler avec le plan retenu.
- Des **partenaires** paiement, livraison et points de retrait.
- Des **boutiques pilotes** déjà actifs en direct sur le vestimentaire.
- Des **créatrices pilotes** prêtes à tester l'affiliation et la précommande.

**JP — Je prends.** *Le direct devient une boutique.*

Contact : à compléter.

**Notes.** Terminer sur une demande précise. « Une seule phase à financer aujourd'hui » désamorce la crainte d'un projet tentaculaire. Et fermer la boucle sur le nom : JP, c'est le geste de l'acheteur — tout le produit tient dans ces deux mots.

---

## À compléter avant tout envoi

- [ ] Coordonnées de contact (slide 25)
- [ ] Arrêter les deux scénarios de lancement (une ville / ouverture large) et les chiffrer, pour la discussion de la slide 24
- [ ] Confirmer le nom exact du prestataire de paiement par carte (le brief mentionnait « paoi.mg » ; l'agrégateur malgache identifié est **papi.mg** — à vérifier)
- [ ] Trancher les fourchettes de la slide 21 après les premiers entretiens boutiques
- [ ] Trancher l'arbitrage de délai de la slide 24 : allonger l'horizon, ou scinder la livraison du contenu
- [ ] Ajouter, si disponibles, des captures d'écran ou maquettes de l'application
