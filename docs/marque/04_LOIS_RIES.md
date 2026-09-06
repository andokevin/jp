# JP — Les 22 lois du branding

## Al & Laura Ries · *The 22 Immutable Laws of Branding*

> **Le principe.** Le branding n'est pas une affaire de goût, c'est une affaire
> de **place occupée dans un esprit**. Un esprit humain retient peu, classe par
> catégories, et n'accorde qu'une case par marque. **La concentration est donc
> la seule stratégie ; l'expansion est la maladie.**
>
> **Comment lire ce document.** Chaque loi est énoncée, confrontée à ce que JP
> fait aujourd'hui, et close par un verdict. Les lois sont classées en trois
> groupes : celles que **nous respectons**, celles qui **commandent une
> décision**, et celles que **nous violons**. Le troisième groupe est le plus
> utile.

---

# PARTIE I — LES TROIS LOIS QUE NOUS VIOLONS

*C'est la partie honnête. La lire d'abord.*

## Loi n° 1 — La loi de l'expansion

> **« Le pouvoir d'une marque est inversement proportionnel à son périmètre. »**

### Ce que JP fait aujourd'hui

| Dimension | État |
|---|---|
| Univers | **3** — Mode, Beauté *(ouverts)*, Tech *(déclaré)* |
| Sources de revenu annoncées | **8** |
| Fonctionnalités au backlog | **266**, en 21 épiques |
| Rôles servis | 4 — acheteuse, boutique, créatrice, donateur |
| Couches produit | Commerce **+** réseau de contenu **+** affiliation **+** précommande **+** cadeau |

**Verdict : violation caractérisée.** Ries écrirait que JP essaie d'être une
place de marché, un réseau social, une plateforme d'affiliation, un service de
cadeau et un tiers de confiance — **et qu'aucun esprit ne retient cinq choses.**

### Ce que la défense vaut

Le dossier a de bons arguments : Mode et Beauté **partagent la même logistique,
la même boutique et le même panier** ; la promesse — la certitude — **est
horizontale par nature** ; **la vérification d'identité** *(`D-21`)* protège un cosmétique aussi bien qu'une
robe.

**Ces arguments sont vrais sur le plan opérationnel. Ils sont hors sujet sur le
plan de la perception.** La loi de l'expansion ne parle pas de logistique, elle
parle de **ce qu'un esprit peut retenir**. « JP, c'est où on achète des habits
en direct sans se faire avoir » est une position. Ajoutez les cosmétiques et
c'est déjà une phrase de plus à retenir.

### La décision `D-10`

> **Séparer le produit de la communication.**
>
> - **Le produit garde ses trois univers.** L'abstraction est construite, elle
>   coûterait des mois à rétrofitter, la décision est bonne.
> - **La communication ne parle que de JP Mode pendant les 90 premiers jours.**
>   Beauté existe dans l'application, elle n'existe pas dans le message.
> - **JP Tech disparaît de toute communication publique** jusqu'à son ouverture.
> - **Le modèle économique se présente avec deux lignes, pas huit** : la
>   commission, et l'affiliation. Le reste est de l'expansion — on le dit
>   seulement si on est interrogé.

C'est le seul moyen de respecter la loi sans détruire un travail d'architecture
déjà fait. **Ce n'est pas un compromis mou : c'est la distinction entre ce qu'on
construit et ce qu'on raconte.**

---

## Loi n° 10 — La loi des extensions & Loi n° 14 — La loi des sous-marques

> **« Le moyen le plus simple de détruire une marque est de mettre son nom sur
> tout. »**
> **« Ce que le branding construit, le sous-branding peut le détruire. »**

### Ce qui est acceptable

**Les univers `JP Mode` / `JP Beauté` / `JP Tech` ne sont pas des sous-marques :
ce sont des rayons.** Ils obéissent déjà à la seule règle qui les rend
inoffensifs, et **le code l'applique littéralement** :

> *« La tentation serait de donner à chaque univers son thème complet : autres
> couleurs de fond, autre typographie. Ce serait cinq produits à maintenir. On
> garde donc un seul design system et on ne change qu'un accent — assez pour
> savoir où l'on est, trop peu pour se sentir ailleurs. »*
> — [packages/ui/src/univers.ts](../../packages/ui/src/univers.ts)

**Un accent de couleur, et rien d'autre.** Pas de logo propre, pas de
typographie propre, pas d'application propre. C'est exactement ce que la loi
autorise. **À maintenir sans exception**, y compris quand quelqu'un demandera
« un petit logo pour JP Beauté ».

### Ce qui ne l'est pas

> ### ⚠️ **« JP Club » est une vraie sous-marque, et elle est dangereuse.**

Deux raisons, et la seconde est grave :

1. **Elle crée un second nom à faire connaître**, sans bénéfice de notoriété.
2. **Elle risque de faire payer la confiance.** Un abonnement acheteuse qui
   donnerait « plus de protection » détruirait la promesse : si la garantie est
   meilleure en payant, alors la garantie de base est incomplète — **et tout
   l'édifice tombe.**

### La décision `D-11`

> - **La garantie n'est jamais un avantage payant. Jamais, sous aucune forme.**
>   Un abonnement acheteuse ne peut porter que sur **la livraison, l'accès
>   anticipé et la cagnotte** — jamais sur la protection, le délai d'arbitrage
>   ou la priorité de traitement d'un litige.
> - **Renoncer au nom « JP Club ».** Une fonctionnalité n'a pas besoin d'être
>   une marque. Un nom descriptif suffit — *« Livraison offerte »*, *« Mes
>   avantages »* — et l'écran existe déjà sous ce dernier nom dans la
>   navigation.
> - **Arbitrage ouvert, à trancher :** Kaable *(Côte d'Ivoire)* facture la
>   protection acheteur **3 % à part**, ce qui en fait un produit visible plutôt
>   qu'un coût caché. C'est intellectuellement séduisant et **frontalement
>   contraire à la décision ci-dessus.** Notre position : **la protection est
>   incluse, point.** Mais la question mérite d'être posée explicitement plutôt
>   que tranchée par omission.

---

## Loi n° 4 — La loi de la publicité *(et son inverse, la loi n° 3)*

> **« La naissance d'une marque s'obtient par les relations publiques, pas par
> la publicité. La publicité entretient une marque déjà née. »**

### Ce que JP fait aujourd'hui

Le dossier annonce que **« l'acquisition et l'animation »** sont le poste
dominant du budget de lancement, et que **« sans cet argent-là, le produit sort
et ne rencontre personne »**.

**Verdict : c'est la bonne lucidité économique, et la mauvaise séquence de
marque.** Ries : une marque nouvelle qui naît par la publicité n'est pas crue.
**On ne peut pas acheter de la crédibilité avec une bannière** — surtout quand
on vend la confiance.

### La décision `D-14` — l'actif de relations publiques que nous avons déjà

> **Personne ne mesure ce marché.**
>
> Notre étude le confirme sans ambiguïté : aucune mesure de prévalence des
> arnaques à la vente en ligne n'existe à Madagascar. Aucun taux, aucun montant,
> aucun décompte de plaintes. Les statistiques policières disponibles portent
> sur des délits d'expression, pas sur des escroqueries commerciales. Les deux
> chiffres qui circulent sur le e-commerce malgache reposent l'un sur un paywall
> d'extrapolation, l'autre sur une source introuvable.
>
> **Nos quatre mesures fondatrices n'ont jamais été produites par personne :**
> commandes annoncées jamais conclues · temps administratif par heure de direct
> · acheteurs renonçant faute de paiement sûr · stock immobilisé par des
> réservations non honorées.
>
> **Les publier chaque année comme une étude publique nous donne trois choses
> avec un seul actif :**
>
> | Ce que ça produit | Cadre |
> |---|---|
> | **L'autorité** du guide, sans avoir à l'affirmer | StoryBrand |
> | **Les relations publiques** qui font naître une marque | Ries, loi n° 3 |
> | L'amorce de la ligne « insights marché » | Notre modèle économique |
>
> **Nom proposé : *Le Baromètre JP du commerce en direct*.** Publié une fois par
> an, gratuit, sourcé, avec la méthode. C'est le seul document que personne
> d'autre ne peut écrire — et il fait de nous **la source**, pas un annonceur.

**La publicité n'est pas interdite — elle vient après.** Son rôle, selon Ries,
est défensif : entretenir une position déjà acquise.

---

# PARTIE II — LES LOIS QUI COMMANDENT UNE DÉCISION

## Loi n° 5 — La loi du mot

> **« Une marque doit s'efforcer de posséder un mot dans l'esprit du client. »**
> *(Volvo possède « sécurité ». BMW possède « conduite ».)*

### Les candidats, et pourquoi ils tombent

| Mot | Verdict |
|---|---|
| **« confiance »** | ❌ Revendiqué par **Taanavo** *(« Achetez et vendez en toute confiance »)* et par la moitié du marché. Et c'est un mot d'investisseur, trop abstrait pour vendre à Analakely |
| **« sécurisé »** | ❌ **Mort.** Employé par e-varotra, Marche Madagascar, Papi — sans mécanisme derrière |
| **« direct »** | ❌ Appartient au médium, pas à nous. Et Facebook le possède de fait |
| **« gardé »** | ⚠️ Excellent sur le fond — concret, mécanique, personne ne le revendique. **Mais il centre JP** *(« JP garde »)* **et il revendique une détention de fonds juridiquement exposée** *(loi 2016-056, voir `D-02`)* |
| **✅ « reçu »** | **Retenu** |

### La décision `D-12` — JP possède le mot « reçu »

> ## Le mot de JP est **« reçu »**.

**Cinq raisons :**

1. **C'est la moitié de la transaction qui n'arrive jamais aujourd'hui.** On
   dit « je prends », et on ne reçoit rien. Le mot nomme exactement le manque.
2. **Il est déjà dans la signature** — *« Je prends. Je reçois. »* — et dans le
   mécanisme : *« vous savez à qui vous payez »*.
3. **Il porte deux sens en français, et les deux nous servent** : ce qu'on
   reçoit *(le colis)*, et **le reçu** *(la preuve écrite)*. Notre produit
   fabrique les deux.
4. **Il est juridiquement neutre.** Il décrit l'acte de l'acheteuse, jamais la
   détention de fonds par JP.
5. **Il centre la cliente, pas nous.** C'est cohérent avec tout le système
   verbal : le nom, le bouton et le slogan sont dans sa bouche.

**Conséquence opérationnelle** : le mot « reçu » et ses formes — *reçu, recevoir,
réception, avez-vous reçu* — doivent apparaître **à chaque étape visible du
parcours**, et **aucun synonyme ne les remplace** *(« livré », « délivré »,
« remis » sont des mots de logistique, pas des mots de marque)*.

**À valider en malgache :** *azoko* — « je l'ai eu / reçu » — pressenti pour la
signature *« Alaiko. Azoko. »* **À faire arbitrer par un locuteur natif.**

---

## Loi n° 8 — La loi de la catégorie

> **« Une marque leader doit promouvoir la catégorie, pas la marque. »**
> Une marque nouvelle doit **créer une catégorie qu'elle peut dominer** — et
> ensuite faire grandir la catégorie, pas se battre pour des parts.

### Le fait qui rend cette loi décisive

**La catégorie n'existe pas.** Aucune plateforme de commerce en direct dédiée à
Madagascar. Aucune vérification d'identité du vendeur. Le mot « séquestre » n'a **jamais été prononcé**
dans le contexte malgache, en français comme en malgache.

**Nous ne prenons pas des parts de marché. Nous créons la case.**

### La décision `D-15` — nommer la catégorie

> ## La catégorie s'appelle **« le direct protégé »**.

| Critère | Vérification |
|---|---|
| Court, français, adjectival | Deux mots, prononçables, mémorisables |
| Contient les deux moitiés de l'offre | Le **direct** *(le format)* + **protégé** *(la rupture)* |
| Libre | Aucune occurrence à Madagascar ni en Afrique francophone |
| Générique et appropriable à la fois | On peut dire « acheter en direct protégé » sans citer JP — c'est exactement ce que Ries demande |

**Ce que ça change dans la communication :**

| On dit | On ne dit pas |
|---|---|
| *« Le direct protégé arrive à Madagascar. »* | *« JP arrive à Madagascar. »* |
| *« Acheter en direct, protégée. »* | *« Achetez sur JP. »* |
| *« JP est la première plateforme de direct protégé du pays. »* | *« JP est la meilleure plateforme de vente. »* |

> **Corollaire, et il est contre-intuitif : nous devrions souhaiter des
> concurrents.** *(C'est la loi n° 11, la loi de la camaraderie.)* Une catégorie
> à un seul acteur n'est pas une catégorie, c'est une curiosité. Kaable, en Côte
> d'Ivoire, **fait exister la catégorie à nos frais**. C'est une bonne nouvelle
> tant que nous sommes premiers chez nous.

---

## Loi n° 6 — La loi des références

> **« L'ingrédient décisif du succès d'une marque est sa revendication
> d'authenticité. »** Chaque marque doit revendiquer une position de leader.

**Le problème** : nous n'avons ni clients, ni chiffres, ni historique. Toute
revendication de leadership serait fausse — et sur un produit de confiance,
**une revendication fausse est un suicide**.

### La revendication utilisable dès le jour 1

> **« La première plateforme malgache où vous savez à qui vous payez — la
> confirmation de réception de l'acheteuse. »**

| Critère | ✔ |
|---|---|
| **Vraie** | Vérifié : aucune marketplace ni passerelle malgache ne retient les fonds |
| **Vérifiable** | Par quiconque prend dix minutes |
| **Non contestable** | Ce n'est pas « la meilleure », c'est « la première à » — un fait daté |
| **Disponible immédiatement** | Aucun volume requis |

**Et une seconde, plus tard :** *« La seule à publier ce qu'elle mesure »* —
quand le Baromètre existera.

---

## Loi n° 16 — La loi de la forme

> **« Le logotype doit être conçu pour l'œil : horizontal, environ 2,25:1, et
> lisible. Le symbole est surestimé — c'est le mot qui porte le sens. »**

### La décision `D-17`

> - **Le logo de JP est un logotype, pas un symbole.** Ries est catégorique :
>   personne ne reconnaît un symbole abstrait avant des années de matraquage —
>   et nous n'avons ni les années ni le budget.
> - **Format horizontal**, proche du 2,25:1, avec **« Je prends » verrouillé
>   sous « JP »**. Les deux ne se séparent jamais *(règle n° 2 du nom)*.
> - **Un seul détail signifiant, et il doit survivre à 24 dp** : la contreforme
>   du **P** fermée, contenant un point plein — *ce qui est tenu*. À petite
>   taille, cela reste un P. À grande taille, cela veut dire quelque chose.
> - **Lisible en une couleur**, sur fond clair et sur fond violet.

*(Le brief complet et le prompt Stitch sont en `05_PLATEFORME_DE_MARQUE.md`.)*

---

## Loi n° 17 — La loi de la couleur

> **« Une marque doit utiliser une couleur opposée à celle de son principal
> concurrent. »**

### Ce que le relevé montre

| Marque | Couleur | Méthode |
|---|---|---|
| **Yas** *(~50 % du marché)* | `#00377D` bleu marine + `#FFD100` jaune | Relevé dans la feuille de style de yas.mg |
| **MVola** | `#317041` vert + `#FED100` jaune | Relevé sur mvola.mg + logotype SVG |
| **Orange Madagascar** | `#FF7900` | Design system officiel Orange |
| **Airtel** | Rouge | Doctrine de marque explicite |
| **Facebook** | `#1877F2` | — |

### Le verdict `D-06`

> **Le violet `#7C2D92` respecte la loi mieux qu'aucune autre couleur
> disponible :**
>
> - **il est le complémentaire du jaune** que portent **les deux marques
>   d'argent du pays** — c'est littéralement « la couleur opposée au principal
>   concurrent » ;
> - **il est loin du bleu Facebook**, ce qui compte encore plus : nous devons
>   être lus comme une alternative, jamais comme une extension ;
> - **aucun opérateur, aucune banque, aucune fintech malgache ne l'occupe** ;
> - il passe le test de contraste — **7,93:1 sur blanc** ;
> - il n'a **aucune charge funéraire ni institutionnelle** à Madagascar,
>   contrairement au rouge *(lambamena)*, au noir *(deuil)* et au tricolore.

**Une réserve à tenir `[P]`** : violet `#7C2D92` et bleu marine Yas `#00377D`
ont une **luminance très proche** *(1,44:1 entre eux)*. Sur une vignette
dégradée, en petite taille, au soleil, ils peuvent se confondre. → **La couleur
ne doit jamais être notre seul signe de reconnaissance. Le mot et la forme
portent autant qu'elle.**

### Le complément `D-22` — le violet garde la loi, le framboise prend l'action

> **`D-22` ne renverse pas `D-06`, elle la partage en deux.** Le verdict
> ci-dessus reste vrai mot pour mot : c'est bien le violet qui répond à la loi
> n° 17, parce que c'est lui qui porte l'identité — logotype, badge vérifié,
> écrans d'argent. **La loi de la couleur parle de reconnaissance, pas de
> boutons.**
>
> Ce qui change : **le framboise `#A31A5B` devient la couleur d'action** — le
> bouton, « Je prends », « En direct », la promotion, l'onglet actif.

**Pourquoi le framboise, et pas le violet, sur l'action :**

- **L'audience est très majoritairement féminine, sur un vertical mode.** Le
  framboise est lu dans cet univers comme une couleur d'envie et d'achat. Le
  violet y est lu comme une couleur d'institution — ce qui est exactement ce
  qu'on lui demande **ailleurs**, sur la facture et sur le badge, et pas sur le
  bouton.
- **Il sépare deux choses que le produit ne doit jamais confondre** : ce sur
  quoi on appuie, et ce qui prouve. Un badge vérifié qui a la couleur du bouton
  apprend à toucher là où il n'y a rien.
- **Il dégage la réserve de luminance de son endroit le plus coûteux.** La
  confusion violet / bleu Yas ne disparaît pas — mesurée, elle reste du même
  ordre pour le framboise *(1,55:1 contre le bleu Yas, contre 1,44:1 pour le
  violet)*. **Mais elle ne pèse plus sur l'élément le plus fréquent de
  l'écran** : le bouton n'est plus dans la famille disputée, et la réserve se
  concentre là où le mot et la forme la couvrent déjà — le logotype.

> ⚠️ **Une réserve nouvelle, propre à `D-22` `[P]`** : le framboise et le violet
> ont entre eux **1,08:1** — aucune différence de luminance du tout. C'est la
> raison d'être de la règle **`R-Z1`** *(cahier des charges §5.17)* : ces deux
> couleurs ne portent **jamais seules** une différence de sens.

---

## Loi n° 22 — La loi de la singularité

> **« L'aspect le plus important d'une marque est sa mono-idée. »**

**La mono-idée de JP :**

> ## Vous savez à qui vous payez.

**Test de singularité** : chaque fonctionnalité du produit doit pouvoir être
rattachée à cette phrase, ou justifier explicitement pourquoi elle existe quand
même.

| Fonctionnalité | Rattachement |
|---|---|
| Le bouton « Je prends » | Rend l'engagement écrit, donc opposable |
| La réservation de stock | Rend la survente impossible, donc la promesse tenable |
| La confirmation de réception | **Clôt** la commande en un appui, et alimente la preuve publique |
| La facture | La preuve écrite de la transaction |
| Le badge vérifié | Ce qui rend crédible la confirmation à venir |
| Les avis vérifiés | Seul un acheteur ayant payé peut noter |
| Le point de retrait | ⚠️ Économique, pas rattaché — **mais il rend le petit panier viable, donc la fréquence possible.** Justifié |
| Le dressing virtuel | ❌ **Non rattaché.** Rétention pure. Garder, ne jamais communiquer |
| L'assistant IA de la boutique | ❌ **Non rattaché.** → retirer *(`R-2`)* |
| Les enchères | ❌ **Contredit** l'engagement de rareté réelle → réexaminer *(`R-3`)* |

---

# PARTIE III — LES LOIS QUE NOUS RESPECTONS DÉJÀ

*Plus brèves, mais à ne pas relâcher.*

## Loi n° 2 — La loi de la contraction
> *Une marque se renforce en rétrécissant son périmètre.*

**Respectée sur un point majeur, et il faut le porter au crédit du dossier** :
l'écartement d'un quatrième univers *(le mobilier)* parce qu'il aurait exigé le
camion, donc un second parcours de livraison, donc un second métier. **« Ce n'est
pas un renoncement commercial : c'est ce qui garde une seule application au lieu
de deux. »** C'est exactement le raisonnement de la loi.

## Loi n° 7 — La loi de la qualité
> *La qualité compte, mais la perception de la qualité compte davantage.*

Nos signaux de qualité perçue sont **matériels, pas décoratifs** : la facture
horodatée `JP-2026-001042`, le badge vérifié, le code de retrait, la sobriété
graphique. **La sobriété fait plus premium que la surcharge** — et elle coûte
moins cher en données.

## Loi n° 9 — La loi du nom & Loi n° 12 — La loi du générique
> *À long terme, une marque n'est rien de plus qu'un nom.*
> *Un nom générique est l'une des routes les plus rapides vers l'échec.*

**Loi n° 12 : parfaitement respectée.** Nos concurrents s'appellent
`E-varotra` *(e-commerce)*, `Marche Madagascar`, `BonMarche`, `Live Pay Mada`.
**Ce sont des noms génériques — donc, selon la loi, des noms condamnés.** « JP —
Je prends » n'est pas générique : c'est un geste.

**Loi n° 9 : sous condition.** Ries se méfie des sigles, et l'étude confirme que
les noms courts qui gagnent en Afrique sont des mots, pas des initiales. **La
réponse — « JP n'abrège pas une raison sociale, il abrège le geste du client » —
n'est valable que si les trois règles du §10 de `03_ZAG.md` sont tenues.**

## Loi n° 11 — La loi de la camaraderie
> *Pour construire la catégorie, une marque doit accueillir les autres marques.*

**Conséquence contre-intuitive à assumer** : nous ne devons pas chercher à tuer
Live Pay Mada, ni craindre Kaable. **Une catégorie à un seul acteur n'est pas
une catégorie.** Notre communication promeut « le direct protégé », pas « JP
contre les autres ».

## Loi n° 13 — La loi de la compagnie
> *Les marques sont des marques, les entreprises sont des entreprises.*

La société qui édite JP ne doit **jamais** apparaître dans la communication
grand public. **La cliente achète sur JP, pas chez une SARL.**

## Loi n° 15 — La loi des sœurs
> *Il y a un temps et un lieu pour lancer une seconde marque.*

**Ce n'est ni le temps ni le lieu.** Aucune seconde marque avant que JP Mode
n'ait gagné sa case. *(Et « JP Club » n'en est pas une non plus — voir `D-11`.)*

## Loi n° 18 — La loi des frontières
> *Une marque ne doit connaître aucune frontière.*

**Actif à noter, et il est réel :** *« Je prends »* est du français de commerce,
**et il voyage** — Sénégal, Côte d'Ivoire, Cameroun, Congo partagent le même
usage et la même langue de transaction. **Kaable prouve que le marché existe en
Afrique de l'Ouest francophone.** Et notre canal cadeau nous met en relation
avec la France dès le premier jour : **JP est transfrontalier avant même
d'exister.**

## Loi n° 19 — La loi de la cohérence
> *Une marque ne se construit pas en un jour ; le succès se mesure en décennies.*

> **Engagement à prendre maintenant, par écrit : le positionnement de JP ne
> change pas pendant trois ans, même si les ventes stagnent au sixième mois.**
>
> C'est la loi la plus difficile à tenir, parce que la tentation de « changer le
> message » arrive toujours au moment précis où il commençait à s'installer.

## Loi n° 20 — La loi du changement
> *On peut changer une marque, mais rarement et très prudemment.*

Un seul changement est déjà programmé, et il est légitime : **l'entrée de JP
Beauté dans le message**, au 4ᵉ mois. Il est prévu, il est daté, il est petit.

## Loi n° 21 — La loi de la mortalité
> *Aucune marque ne vit éternellement ; l'euthanasie est souvent la meilleure
> solution.*

**Application concrète et utile : JP Tech peut ne jamais ouvrir.** Le contrôle
IMEI et provenance peut se révéler impossible à tenir. **Ce n'est pas un échec —
c'est la loi qui s'applique.** Un univers déclaré et jamais ouvert ne coûte rien
tant qu'il n'a jamais été promis publiquement. *(D'où `R-4`.)*

---

# Le tableau de bord des 22 lois

| # | Loi | Statut | Décision |
|---|---|---|---|
| 1 | Expansion | ❌ **Violée** | `D-10` — Mode seul dans le message, 90 jours |
| 2 | Contraction | ✅ | Tenir l'écartement du 4ᵉ univers |
| 3 | Relations publiques | ⚠️ **À activer** | `D-14` — Le Baromètre JP |
| 4 | Publicité | ❌ **Violée** | La publicité vient **après** les RP |
| 5 | Le mot | ⚠️ **À décider** | `D-12` — JP possède **« reçu »** |
| 6 | Références | ✅ **À revendiquer** | « La première plateforme malgache où… » |
| 7 | Qualité | ✅ | Signaux matériels, sobriété |
| 8 | Catégorie | ⚠️ **À créer** | `D-15` — **« le direct protégé »** |
| 9 | Le nom | ⚠️ **Sous condition** | Les 3 règles du nom, `03` §10 |
| 10 | Extensions | ❌ **Violée** | `D-10`, `D-11` |
| 11 | Camaraderie | ✅ | Promouvoir la catégorie, pas la rivalité |
| 12 | Le générique | ✅ **Avantage net** | Nos concurrents ont tous des noms génériques |
| 13 | La compagnie | ✅ | La société n'apparaît jamais |
| 14 | Sous-marques | ❌ **Violée** | `D-11` — abandonner « JP Club » |
| 15 | Les sœurs | ✅ | Aucune seconde marque |
| 16 | La forme | ⚠️ **À exécuter** | `D-17` — logotype horizontal |
| 17 | La couleur | ✅ **Vérifiée** | `D-06` — violet `#7C2D92`, **révisée par `D-22`** : le violet porte l'identité, le framboise `#A31A5B` porte l'action |
| 18 | Les frontières | ✅ **Actif** | Le nom voyage en Afrique francophone |
| 19 | Cohérence | ⚠️ **Engagement** | Ne rien changer pendant 3 ans |
| 20 | Le changement | ✅ | Un seul changement, prévu et daté |
| 21 | La mortalité | ✅ | JP Tech peut ne jamais ouvrir |
| 22 | Singularité | ⚠️ **À imposer** | Le test de rattachement, sur chaque fonctionnalité |

**Bilan : 3 lois violées, 8 décisions à prendre, 11 respectées.**
Pour un dossier qui n'avait jamais été passé au filtre du branding, c'est
plutôt bon — et les trois violations ont **la même racine** : *on a construit un
produit riche avant d'avoir arrêté un message pauvre.* C'est l'ordre normal des
choses. Il est temps de le corriger.

---

*Suite : `05_PLATEFORME_DE_MARQUE.md` — l'englobement et les décisions.*
