# JP — Journal des décisions produit

## Ce qui a été tranché, quand, et ce que ça supprime

| | |
|---|---|
| **Objet** | Les décisions de périmètre qui **retirent** ou **redéfinissent** quelque chose · leur portée exacte · les documents qu'elles obligent à réécrire |
| **Public** | Produit, développement, recette |
| **Amont** | Aucun — ce document est l'amont de tous les autres |
| **Aval** | `JP_ACTEURS_WORKFLOWS.md` · `JP_CAHIER_DES_CHARGES.md` · `JP_CAS_UTILISATION.md` · `plan/` · `docs/marque/` |

> **Règle d'usage.** Toute suppression faite dans un autre document cite ici son
> code `DP-xx`. Sans ce lien, une règle supprimée réapparaît trois semaines plus
> tard, parce que personne ne se souvient qu'elle avait été tuée volontairement.

> **Espace de noms.** Les décisions portent le préfixe **`DP-`** *(décision
> produit)* et les points ouverts **`PO-`**. Le préfixe `D-` seul était déjà pris
> par `docs/marque/`, où il numérote les décisions de marque : deux séries
> homonymes dans un même dépôt rendraient toute recherche inutilisable.

---

# DP-01 — Six acteurs sont retirés du produit

**Date** : 2026-08-31 · **Portée** : tout le dépôt

| Acteur retiré | Code | Ce qui disparaît avec lui |
|---|:---:|---|
| Vendeur particulier | `P` | Dépôt d'annonce sans boutique, seuil de bascule vers le professionnel, barème dédié |
| Employé du vendeur | `VE` | Studio restreint, matrice de permissions déléguées, accès en lecture seule aux clients |
| Livreur | `L` | Application terrain, tournées, encaissement d'espèces à la remise |
| Point relais | `PR` | Réseau de relais, code de retrait, délai de garde, remise contre code |
| Modérateur JP | `MO` | File de modération humaine, instruction des signalements |
| Opérateur JP | `OP` | Vérification manuelle d'identité, console d'arbitrage, réconciliation quotidienne |

**Les acteurs qui restent** :

| Code | Acteur | Application |
|:---:|---|---|
| `AN` | Visiteur non inscrit | mobile · web public |
| `A` | Acheteur | mobile |
| `B` | **Boutique** *(anciennement vendeur professionnel)* | mobile *(studio)* |
| `C` | Créatrice | mobile *(studio créatrice)* |
| `D` | Donateur / diaspora | web, sans compte |
| `PM` | Partenaire marque | espace partenaire *(phase 3)* |

Les acteurs système sont inchangés : `SYS`, `PSP`, `VID`, `NOT`.

> ### ⚠️ Le piège du renommage automatique
>
> **« Opérateur » a deux sens dans ce dépôt.** L'**Opérateur JP** (`OP`) est
> supprimé ; l'**opérateur mobile money** — MVola, Orange Money, Airtel Money,
> c'est-à-dire le `PSP` — est conservé et cité partout dans le paiement.
>
> Aucune suppression de « opérateur » ne peut être faite globalement. Chaque
> occurrence se lit avant d'être touchée. Même prudence pour « point de
> retrait » : le mode de livraison disparaît *(DP-04)*, mais « retrait » désigne
> aussi le **retrait d'argent** du portefeuille — lequel disparaît de son côté,
> mais pour une autre raison *(DP-07)*.

---

# DP-02 — Les types de compte ne se cumulent pas et ne basculent pas

**Date** : 2026-08-31 · **Remplace** : « les rôles se cumulent sur un même compte »

L'ancien modèle laissait une même personne être acheteur, puis vendeur, puis
créatrice, sur un seul compte, avec des portefeuilles séparés. **Ce modèle est
abandonné.**

**Un compte a un type, et un seul, choisi à l'inscription. Il n'en change
jamais.** Il n'existe aucun écran de bascule entre types de compte.

| Type de compte | Peut acheter | Peut vendre |
|---|:---:|:---:|
| **Acheteur** | oui | **non — jamais** |
| **Boutique** | **oui** *(voir ci-dessous)* | oui |
| **Créatrice** | **oui** *(voir ci-dessous)* | oui *(par commission de la boutique, sans stock)* |

> ### Pourquoi une boutique peut acheter
>
> **Ce n'est pas une porte vers le cumul de rôles, c'est une commodité.** Le cas
> visé est celui du patron d'une boutique qui veut acheter quelque chose sur JP
> et qui n'a pas envie de se créer un second compte pour ça.
>
> Conséquences à tenir dans toute la conception :
> - l'achat depuis un compte boutique suit **exactement** le parcours acheteur ;
>   rien n'est allégé, rien n'est ajouté ;
> - il n'ouvre **aucun** droit supplémentaire, et ne transforme pas le compte ;
> - une boutique **ne peut pas acheter chez elle-même** ;
> - les ventes et les achats restent **deux historiques distincts**, jamais
>   compensés l'un par l'autre.
>
> **La réciproque est fermée et le reste.** Un compte acheteur n'a aucun chemin,
> aucun bouton, aucune procédure de support pour vendre. S'il veut vendre, il
> crée un compte boutique.

---

# DP-03 — « Boutique » remplace « vendeur »

**Date** : 2026-08-31 · **Portée** : vocabulaire produit, interface, identifiants

Le mot **vendeur** est retiré du vocabulaire du produit. On dit **boutique**.

| Avant | Après |
|---|---|
| le vendeur, la vendeuse | **la boutique** |
| vendeur professionnel | **boutique** |
| profil vendeur | **boutique** |
| studio vendeur | **le studio** |
| vérification vendeur | **vérification de la boutique** |

**Ce qui n'est pas renommé** : le verbe *vendre*, la *vente*, le *prix de
vente*, la *mise en vente*. Ce sont des actions, pas des acteurs.

**Ambiguïté à surveiller** : « boutique » désignait déjà **la page vitrine** du
vendeur. Les deux sens fusionnent volontairement — la boutique est à la fois
l'acteur et sa vitrine — mais les phrases du type « la boutique de la boutique »
doivent être réécrites, pas laissées telles quelles.

**Identifiants** : le dépôt nomme ses tables en français (`profil_vendeur`,
`direct_article`). Le renommage suit donc jusqu'en base — `profil_vendeur`
devient `boutique`. Aucune migration n'est concernée à ce jour : le socle `S4`
n'a pas encore créé ces tables.

---

# DP-04 — La boutique livre, JP suit

**Date** : 2026-08-31 · **Découle de** DP-01 *(retrait de `L` et `PR`)*

**JP n'opère plus aucune logistique.** La boutique se débrouille pour faire
parvenir le colis — son propre coursier, un transporteur, une remise en main
propre. JP ne fournit ni application terrain, ni réseau, ni tournée.

**Ce que JP garde** :

- une **frise de statuts** visible par l'acheteur, que la boutique fait avancer ;
- une **notification** à chaque changement de statut ;
- la **confirmation de réception par l'acheteur**, qui clôt la commande et
  alimente la réputation de la boutique *(elle ne déclenche plus aucun paiement
  — voir `DP-07`)*.

**Statuts retenus** : `Payée → En préparation → Expédiée → Livrée → Confirmée`.

**Ce qui disparaît** : le mode « point de retrait » au choix de la commande, le
code à 6 chiffres, la remise contre code, le délai de garde, le regroupement de
colis au même relais, l'encaissement d'espèces par un tiers, la réconciliation
des espèces, la gestion du réseau de relais et des tournées.

> **Le risque assumé.** La preuve de remise n'est plus produite par un tiers
> neutre : c'est la boutique qui déclare avoir expédié, et l'acheteur qui
> déclare avoir reçu. En cas de désaccord, il n'y a **ni arbitre humain**
> *(DP-05)* **ni argent retenu** *(DP-07)*. Le désaccord ne se tranche donc pas :
> **il se compte.** Un signalement non résolu pèse sur la réputation de la
> boutique et, au-delà d'un seuil, la suspend automatiquement. C'est la seule
> sanction disponible. Elle doit figurer dans les conditions d'utilisation de la
> boutique — et l'absence de remboursement, dans celles de l'acheteur.

---

# DP-05 — Aucun back-office humain

**Date** : 2026-08-31 · **Découle de** DP-01 *(retrait de `MO` et `OP`)*

Aucun agent JP n'instruit de dossier. Ce que faisaient le modérateur et
l'opérateur est repris par des règles automatiques, ou n'est plus fait.

| Ce qui était humain | Ce qui le remplace |
|---|---|
| Vérification d'identité | **Vérification automatisée** — contrôle du document et du titulaire du compte mobile money par le prestataire, sans lecture humaine |
| Arbitrage des litiges | **Supprimé** — il n'y a plus rien à arbitrer *(DP-07)* ; le signalement alimente la réputation |
| File de modération | **Filtre automatique** *(F19.1)* + **signalement** + protections tenues par l'autrice elle-même : restriction des commentaires, blocage, filtre de mots |
| Réconciliation des espèces | **Supprimée** — il n'y a plus d'espèces *(DP-04)* |
| Recours contre une sanction | **Supprimé** — les sanctions automatiques sont réversibles sur nouvelle évaluation, il n'y a personne à qui écrire |

**L'épique EP11 (back-office) est supprimée**, à une exception près :

> ### L'exception : le tableau de bord des quatre mesures
>
> `F11.7` n'est pas un écran d'exploitation, c'est **l'instrument de mesure du
> pilote**, exigé par `R-O2` comme livrable avant le premier direct. Il est
> conservé sous forme réduite : **un tableau de bord interne consulté par
> l'équipe JP**, sans acteur produit associé, sans file de travail, sans action
> possible dessus. On le lit, on n'y agit pas. Les quatre mesures elles-mêmes
> sont à revoir : certaines portaient sur le séquestre *(PO-4)*.

---

# DP-06 — L'écran du direct côté acheteur

**Date** : 2026-08-31 · **Réécrit** : `F2.4`, `F2.5` · **Ajoute** : une fonctionnalité

**Le direct est d'abord une vidéo, pas un catalogue.** L'acheteur qui ouvre un
direct voit la boutique en plein écran, comme sur Facebook. Rien ne recouvre le
visage.

1. **La vidéo occupe l'écran.** 9:16, plein cadre. C'est l'état par défaut et
   l'état le plus fréquent.

2. **Présenter un article est facultatif.** La boutique peut mettre un article
   « à l'écran » et parler dessus, comme aujourd'hui — ou ne rien présenter du
   tout et simplement discuter. **Quand aucun article n'est à l'écran, aucun
   bandeau ne s'affiche.** L'ancienne spécification supposait qu'un article
   était toujours présenté : c'est cette hypothèse qui tombe.

3. **Un bouton à trois tirets** *(☰)*, discret, sur le côté. Il ouvre la
   **liste des articles en vente pendant ce direct** — tous, pas seulement celui
   qui est présenté.

4. **Depuis la liste comme depuis le bandeau**, l'acheteur a deux gestes :
   **« Je prends »**, ou **ouvrir la fiche détaillée** de l'article.

---

# DP-07 — Le séquestre est supprimé : l'acheteur paie la boutique directement

**Date** : 2026-08-31 · **Portée** : 216 occurrences, 29 fichiers · **Invalide** : `R-E1` à `R-E6`, `R-N6`, `R-O3`

**L'argent ne transite plus par JP.** L'acheteur paie, la somme arrive sur le
compte mobile money de la boutique. Il n'y a ni compte de cantonnement, ni
libération, ni portefeuille à deux poches, ni retrait.

**Ce qui disparaît**

- la conservation des fonds jusqu'à confirmation *(`R-E1`)* ;
- la phrase de séquestre à l'écran de paiement *(`R-E2`)* ;
- la libération automatique après délai *(`R-E4`)* et son blocage par un litige
  *(`R-E5`)* ;
- le portefeuille « en attente » / « disponible » et le retrait *(`R-E6`)* ;
- l'arbitrage et le remboursement — **JP ne rembourse pas**, il n'a rien à
  rendre ;
- le paiement à la livraison *(§5.5.3)*, déjà sans objet depuis `DP-04`.

**Ce qui reste**

- la **confirmation de réception** par l'acheteur : elle ne débloque plus
  d'argent, elle clôt la commande et **alimente la réputation** ;
- la **facture**, émise comme avant ;
- le **litige au sens de signalement** : l'acheteur signale, JP enregistre,
  la réputation encaisse. Personne n'instruit *(DP-05)*.

## Ce qui protège l'acheteur désormais : la réputation, et rien d'autre

| Levier | Fonctionnalité |
|---|---|
| Boutique vérifiée, badge visible | `F0.6`, `F0.7` |
| Avis vérifiés — seuls les acheteurs réels notent | `F6.1` |
| Score de confiance, explicable en une phrase | `F6.2` |
| Historique visible **avant** l'achat : ancienneté, ventes, taux de litige | `F6.2`, `F6.6` |
| Signalement en un geste | `F6.3`, `F6.7` |
| **Suspension automatique** au-delà d'un seuil de signalements | `F6.8` |

## Le vrai point de comparaison : Facebook, pas le séquestre

**Personne n'achetait avec un séquestre avant JP.** Aujourd'hui, à Madagascar,
l'acheteuse qui suit un direct Facebook **envoie de l'argent par mobile money à
un numéro de téléphone** — un numéro dont elle ne connaît ni le titulaire, ni
l'ancienneté, ni les ventes passées, ni les litiges. Aucune trace exploitable,
aucune identité vérifiée, aucun historique.

C'est **cela** que JP remplace. Mesurée contre cette référence, une plateforme
sans séquestre reste massivement plus sûre :

| | Direct Facebook | **JP sans séquestre** |
|---|---|---|
| À qui je paie | un numéro de téléphone | une **boutique vérifiée** — identité et titularité du compte mobile money contrôlées *(`F0.6`)* |
| Ce que je sais d'elle avant de payer | rien | ancienneté, nombre de ventes, avis vérifiés, taux de litige *(`F6.1`, `F6.2`)* |
| Ce qu'il reste de l'achat | une capture d'écran | une **commande historisée** et une **facture** *(`F4.11`)* |
| Si ça tourne mal | rien | **signalement**, effet sur la réputation, **suspension automatique** *(`F6.3`, `F6.8`)* |
| Preuve en cas de recours externe | aucune | la trace complète : identité de la boutique, montant, date, échanges |

> ### La formulation de la promesse
>
> **L'assurance ne vient plus de la détention des fonds, elle vient de trois
> choses :** la **boutique vérifiée**, la **transaction historisée**, la
> **traçabilité**. Ce sont trois faits vérifiables, pas trois engagements — ce
> qui est précisément ce que le produit peut encore tenir.
>
> Ce que ça change dans la nature de la promesse : JP ne se porte plus garant,
> **il rend l'anonymat impossible**. Le recours n'est plus interne à la
> plateforme — il est externe, et JP fournit les pièces. C'est une protection
> plus faible qu'un séquestre, et **beaucoup plus forte qu'un numéro de
> téléphone.**

> ### Ce que JP doit cesser de dire
>
> **`R-E2` imposait d'afficher : « Votre argent est gardé par JP. »** Cette
> phrase devient un mensonge, et un mensonge sur le seul sujet où le produit
> avait promis de ne pas mentir. Elle est remplacée par une phrase honnête, à
> arrêter avec le copywriting, du type : *« Vous payez directement la boutique.
> Regardez son historique avant d'acheter. »*
>
> **Tout le discours de marque est concerné** — `docs/marque/` porte 45
> occurrences du séquestre, dont l'atout `A-4` (« le reçu de séquestre
> partageable ») et la ligne de `05_PLATEFORME_DE_MARQUE.md` : *« Notre promesse
> est institutionnelle. Nous tenons l'argent et nous arbitrons. »* Ce n'est plus
> vrai. Le positionnement doit être reconstruit sur autre chose.

> ### Le risque que cette décision supprime
>
> `docs/marque/05_PLATEFORME_DE_MARQUE.md` désigne comme **« principal risque du
> projet »** *(action `A-03`)* le régime juridique d'un tiers non agréé
> conservant des fonds d'acheteurs — **loi malgache 2016-056, art. 79-80** — et
> ouvre une consultation d'avocat à ce sujet.
>
> **JP ne conservant plus aucun fonds, cette exposition disparaît.** La
> consultation `A-03` devient sans objet. C'est la contrepartie réelle de la
> perte de la promesse, et elle mérite d'être écrite : le produit devient
> juridiquement beaucoup plus simple à exploiter.

---

# DP-08 — Abonnement mensuel, pas de commission par vente

**Date** : 2026-08-31 · **Découle de** DP-07 · **Remplace** : `R-G1` à `R-G4`, `R-E7`, `R-Y3`

**JP ne prélève rien sur les ventes. La boutique paie un abonnement mensuel.**

| | |
|---|---|
| **La boutique fixe son prix** | L'acheteur paie ce prix. Rien n'est ajouté, rien n'est déduit. |
| **La boutique encaisse 100 %** | L'argent va sur son compte, directement *(DP-07)*. |
| **JP est payé une fois par mois** | Un seul virement mobile money, de la boutique vers JP. |

## Pourquoi pas la commission

**La commission par vente contredit `DP-07`.** Si l'argent va directement à la
boutique, JP doit récupérer ensuite une part qu'il n'a jamais tenue : soit le
prestataire éclate l'encaissement — non confirmé, et facturé — soit la boutique
la reverse, ce qui recrée le transfert et ajoute l'impayé. **Le frais de
transfert que `DP-07` voulait supprimer revient.**

L'ajout de la commission au prix affiché, plutôt que sa déduction, se heurte à
la même contrainte, et à une seconde : **on ne facture pas des frais de service
à l'acheteur après lui avoir retiré le service** *(DP-07)*.

## Pourquoi l'abonnement tient psychologiquement

- **Côté boutique** — une commission se ressent à **chaque** vente ; un
  abonnement, **une fois par mois**. *« Tout ce que je vends est à moi »* est une
  phrase que personne ne conteste.
- **Côté acheteur** — le prix affiché est le prix réel. Aucun frais ajouté à
  l'étape finale, qui est le premier tueur de conversion *(`R-P2`)*.
- **Barrière à l'entrée** — réglée par un **palier gratuit à quota** : la
  boutique essaie sans payer, et paie quand ça marche.

## Les paliers

Mesurés par **quota mensuel de ventes** et **quota de directs**.

| Palier | Ventes / mois | Directs / mois | Prix |
|---|:---:|:---:|:---:|
| Découverte | ⚠️ à arrêter | ⚠️ à arrêter | **gratuit** |
| Boutique | ⚠️ | ⚠️ | ⚠️ |
| Boutique + | ⚠️ | ⚠️ | ⚠️ |

**Quota atteint** : la mise en vente et le lancement d'un direct sont bloqués
jusqu'au mois suivant ou jusqu'au changement de palier. Le compte n'est pas
suspendu, le catalogue existant reste visible, les commandes en cours se
terminent.

**Abonnement impayé** : même traitement. On bloque la mise en vente, jamais
l'accès aux commandes en cours ni à l'historique.

> ### L'effet de bord qui vaut la décision
>
> `EP10-monetisation.md` désigne le risque n° 1 du modèle : *« à partir de quel
> taux la vendeuse cherche-t-elle à contourner la plateforme ? »* — mesuré par le
> taux de transactions engagées sur JP puis conclues ailleurs.
>
> **Sans commission par vente, la boutique n'a plus aucun intérêt à conclure
> ailleurs.** Le contournement cesse d'être un risque et devient un non-sujet.
> C'est le gain le plus important de `DP-08`, et il n'était pas recherché.

---

# DP-09 — L'affiliation : la créatrice partage un lien, sa commission part automatiquement

**Date** : 2026-08-31 · **Ferme** `PO-3` · **Invalide** `R-N4`, `R-N6` · **Mise en œuvre** `DP-11`

**La créatrice ne vend pas, elle apporte.** Elle partage un article — sur son
profil JP, ou **hors JP, sur son compte Facebook où son audience est déjà**. Le
lien renvoie vers la fiche article. L'acheteur voit le détail, achète
normalement. **Il ne voit aucune complexité supplémentaire** *(`R-N5`, conservé)*.

| | |
|---|---|
| **Qui paie la commission** | **La boutique**, sur son prix. *(Avant : elle était prélevée sur la commission JP — `R-N4` — qui n'existe plus, `DP-08`.)* |
| **Qui fixe le taux** | La boutique, connu de la créatrice **avant** qu'elle attache l'article |
| **Quand elle est versée** | **Au paiement**, automatiquement. L'encaissement est éclaté : part boutique, part créatrice |
| **Qui expédie et répond** | **La boutique**, toujours *(`R-N14`, conservé)* |

**Ce qui est conservé** : l'identifiant de créatrice porté par le lien y compris
hors application *(`R-N1`)* · l'attribution à la dernière créatrice cliquée dans
une fenêtre glissante *(`R-N2`, ⚠️ 7 jours)* · le droit de la boutique de refuser
l'affiliation *(`R-N3`, `R-K4`)* · la vitrine « Ma sélection » *(`R-N13`)*.

**Ce qui disparaît** : `R-N4` *(prélèvement sur la commission JP)* · `R-N6` *(la
commission acquise seulement après confirmation de réception)* · `F15.10`
*(portefeuille et retrait créatrice — l'argent arrive sur son mobile money, JP
n'a pas de portefeuille à lui montrer)*.

> ### La cohérence du risque
>
> La créatrice est payée **au paiement**, comme la boutique *(DP-07)*. Si la
> boutique n'expédie jamais, la créatrice a déjà touché. C'est incohérent avec
> l'ancien modèle, **et parfaitement cohérent avec le nouveau** : plus personne
> n'attend la livraison pour être payé, et le seul régulateur est la réputation.
> Une créatrice qui recommande des boutiques qui n'expédient pas perd son
> audience — c'est là que la sanction se produit.

> ### Comment « automatiquement » est mis en œuvre
>
> Pas par le prestataire : **par notre backend** *(DP-11)*. Il calcule les parts
> avant d'émettre le paiement, puis envoie **une requête d'encaissement par
> bénéficiaire** — une vers la boutique, une vers la créatrice. Aucune
> fonctionnalité d'éclatement n'est demandée à l'opérateur.
>
> Coût pour l'acheteuse : **une confirmation supplémentaire** sur son téléphone
> quand la vente est affiliée. C'est le prix de l'affiliation, et il doit être
> annoncé avant l'écran de paiement, jamais découvert dessus.

---

# DP-10 — Le cadeau : le donateur paie, le bénéficiaire et la boutique s'arrangent

**Date** : 2026-08-31 · **Ferme** `PO-5` · **Réécrit** le parcours principal d'`EP16`

**La preuve de remise est supprimée.** Elle n'existe plus nulle part *(DP-04)*.
Le parcours du cadeau est réécrit autour de ce manque.

**Le nouveau parcours**

1. Le donateur choisit l'article et **désigne le compte JP du bénéficiaire**.
2. **Le bénéficiaire et la boutique conviennent entre eux du point de remise**,
   dans un fil de discussion. Le donateur n'y participe pas.
3. **Une fois l'accord constaté, le donateur confirme le paiement.** L'argent
   part directement à la boutique *(DP-07)*, la commande est créée.

> ### L'invariant est conservé — et renforcé
>
> `RB8` / `R-L8` imposaient que **l'adresse de livraison ne soit jamais visible
> du donateur**. Dans l'ancien parcours il fallait la lui cacher activement.
> Dans le nouveau, **il ne la manipule jamais** : elle se négocie entre deux
> personnes dont il ne fait pas partie. L'invariant n'est plus une précaution,
> il est structurel.

**Ce qui disparaît** : la preuve de remise · la notification de révélation
adossée à cette preuve · le suivi de livraison côté donateur.

**Ce qui survit — et c'est l'essentiel** : *« celui qui envoie de l'argent à sa
famille ne sait jamais ce qui en est fait ; ici, il choisit l'objet et il voit la
boutique vérifiée. »* La première moitié de la proposition de valeur d'`EP16`
tient entièrement. C'est la seconde — *« il suit la livraison et obtient une
preuve »* — qui tombe.

**Deux conséquences à traiter**

- **Le bénéficiaire doit avoir un compte JP.** On n'offre plus à quelqu'un qui
  n'est pas sur la plateforme. C'est une restriction réelle du canal — et un
  levier d'acquisition, puisque recevoir un cadeau devient une raison de
  s'inscrire.
- **Le paiement vient après la négociation**, donc l'article doit être tenu
  pendant l'échange. La réservation de 30 minutes *(`F1.10`)* est très
  insuffisante pour un échange entre deux fuseaux horaires *(`PO-10`)*.

---

# DP-11 — L'éclatement du paiement *(complétée par `DP-16`)*

> ✅ **Active.** Un temps annulée par `DP-14`, elle est **rétablie et complétée
> par `DP-16`**, qui lui ajoute la patte manquante : **la commission JP**.

**Date** : 2026-08-31 · **Ferme** `PO-7` · **Sert** `DP-07`, `DP-09` · **Étend** `R-M1`, `R-M2`

**On ne demande au prestataire que ce qu'il sait faire : encaisser.** Quand une
vente doit alimenter plusieurs comptes, **le backend calcule les parts avant de
payer**, puis émet **une requête d'encaissement par bénéficiaire**.

```
                    ┌─ calcul des parts (backend, avant tout appel)
commande validée ───┤
                    └─ N requêtes d'encaissement, une par bénéficiaire
                         ├── requête 1 → compte de la boutique      (pivot)
                         └── requête 2 → compte de la créatrice     (secondaire)
```

**Aucune dépendance à une fonctionnalité d'éclatement du prestataire.** Ce qui
ferme `PO-7` : la question ne se pose plus.

## Le cas courant est à une seule requête

| Situation | Requêtes | Confirmations pour l'acheteuse |
|---|:---:|:---:|
| **Achat ordinaire** | **1** | **1** |
| Achat via une créatrice *(DP-09)* | 2 | 2 |
| Panier contenant deux boutiques | 2 | 2 |

**C'est `DP-08` qui garantit la première ligne.** Sans commission JP par vente,
un achat ordinaire n'a qu'un bénéficiaire. Le séquestre en demandait **deux**
opérations *(un encaissement, puis un décaissement)* : le cas courant devient
donc **moins coûteux qu'avant**, et pas seulement moins complexe.

## Les trois règles que ce choix impose

- **R-M4 — La requête vers la boutique est la requête pivot.** Elle est émise en
  premier. **Si elle échoue, la commande n'est pas créée et aucune autre requête
  n'est émise.** Rien n'a bougé, rien n'est à réparer.

- **R-M5 — Les requêtes secondaires sont rattrapables, jamais bloquantes.** Si la
  part de la créatrice échoue, **la commande existe, la boutique est payée,
  l'expédition suit.** La part due est enregistrée comme dette et rejouée
  automatiquement. Elle ne bloque ni la commande, ni le stock, ni la livraison.

- **R-M6 — Le nombre de confirmations attendues est annoncé avant l'écran de
  paiement.** *« Vous allez recevoir 2 demandes de confirmation. »* Une deuxième
  demande de code non annoncée est indiscernable d'une tentative de fraude —
  l'acheteuse abandonne, et elle a raison d'abandonner.

> ### Ce qu'on ne peut pas faire, et qu'il faut assumer
>
> **Il n'existe pas de « tout ou rien » entre plusieurs transferts mobile
> money.** Aucune validation commune, aucune annulation d'un transfert déjà
> passé. `R-M4` et `R-M5` ne rétablissent pas l'atomicité : elles organisent
> l'échec partiel de façon à ce qu'il tombe **toujours du côté rattrapable**.
>
> L'ordre des requêtes n'est donc pas un détail d'implémentation, **c'est la
> règle de sécurité du paiement**. Inverser l'ordre — créatrice d'abord —
> produirait des créatrices payées sur des commandes qui n'existent pas.

> ### L'idempotence n'est plus une bonne pratique, c'est une condition
>
> `R-M2` exigeait déjà qu'un paiement interrompu ne prélève jamais deux fois.
> Avec `R-M5`, on **rejoue délibérément** des requêtes échouées : sans clé
> d'idempotence portée par la requête et honorée par le prestataire, une relance
> paie la créatrice deux fois. À vérifier auprès de chaque opérateur *(`PO-11`)*.

---

# DP-12 — Il existe un compte Admin JP, qui configure et qui lit

**Date** : 2026-08-31 · **Amende** `DP-05` · **Rétablit** `F11.6`, `F11.9`

`DP-05` a supprimé le back-office en bloc. **C'était trop large.** Ce qui devait
disparaître, ce sont les **files de travail humaines** ; ce qui doit exister,
c'est **un compte d'exploitation** — sans lui, personne ne peut fixer un palier
d'abonnement ni lire un rapport.

## Ce que l'Admin JP fait

| | Fonctionnalité |
|---|---|
| **Configurer les paramètres économiques** | Paliers d'abonnement, quotas de ventes et de directs, **seuils de signalement par niveau** *(`R-T8`)*, durées de réservation, délais de clôture — `F11.6`, `R-O1` |
| **Lire tous les rapports** | Les quatre mesures du pilote, ventes par origine, signalements par boutique, abonnements actifs — `F11.7` |
| **Consulter le journal d'audit** | Qui a changé quel paramètre, quand, et l'ancienne valeur — `F11.9`, `R-O4` |

## Ce que l'Admin JP ne fait pas — `DP-05` tient sur ce point

| | Pourquoi |
|---|---|
| ❌ **Arbitrer un litige** | Il n'y a plus d'argent à trancher *(`DP-07`)*. Le signalement compte, il ne se plaide pas |
| ❌ **Vérifier une identité à la main** | Automatisée par le prestataire *(`UC-52`)* |
| ❌ **Instruire une file de modération** | Filtre automatique et gravité déclarée par le motif *(`R-T8bis`)* |
| ❌ **Décider d'une suspension au cas par cas** | La suspension est **calculée**, jamais choisie. L'Admin règle le **seuil**, pas le **cas** |

> ### La frontière, en une phrase
>
> **L'Admin JP règle les règles ; il n'applique pas les règles.** Il fixe le
> seuil qui suspend, il ne suspend pas. Il fixe le palier, il ne facture pas.
>
> C'est ce qui préserve l'essentiel de `DP-05` : **aucune décision individuelle
> n'est prise par un humain**, donc aucune ne peut être arbitraire, négociée, ou
> obtenue par relation. Sur un produit dont l'actif est la confiance, c'est une
> propriété qu'il vaut mieux garder.

## Ce que ça restaure

| | Statut |
|---|---|
| `F11.6` **Paramètres** | ♻️ **Rétabli** — mais son contenu change : plus de commissions ni de frais de séquestre, **des paliers, des quotas et des seuils** |
| `F11.9` **Journal d'audit** | ♻️ **Rétabli** — un humain qui change un seuil doit laisser une trace nominative |
| `F11.7` **Tableau de bord** | Déjà conservé, **il gagne un lecteur identifié** |
| `F11.1` `F11.2` `F11.3` `F11.4` `F11.5` `F11.8` `F11.10` `F11.11` | ❌ **Restent supprimées** — ce sont des files de travail, pas de la configuration |

> ⚠️ **`R-O1` perd puis retrouve sa double validation.** `DP-05` l'avait retirée
> faute de deux opérateurs. **Avec un compte Admin, la question se repose** : un
> seul compte qui peut modifier seul le seuil de suspension de toutes les
> boutiques est un point de défaillance unique. **À trancher** *(`PO-13`)* :
> un seul compte Admin, ou deux avec validation croisée sur les paramètres
> sensibles ?

---

# DP-13 — L'IA classe le signalement, l'Admin vérifie après

**Date** : 2026-08-31 · **Amende** `DP-05`, `R-T8bis` · **Rétablit** `F19.7` · **Ajoute** `F19.13`

## Le mécanisme

```
signalement (texte libre + photos)
      │
      ▼
  ① IA — classe en niveau 1, 2 ou 3, et motive sa classification
      │
      ▼
  ② SYS — applique immédiatement l'effet du niveau (R-T8)
      │        suspension immédiate aux niveaux 2 et 3
      ▼
  ③ Admin — vérifie A POSTERIORI, confirme ou infirme
             une infirmation lève la sanction et corrige le score
```

**L'acheteuse écrit ce qu'elle a vécu**, elle ne choisit plus dans une liste. `R-T8bis` est amendée : la gravité n'est plus déclarée par un motif présélectionné, elle est **déduite du récit et des pièces**.

> ### La distinction qui préserve `DP-05`
>
> **L'IA agit, l'Admin vérifie après.** La suspension est immédiate — elle
> n'attend aucune file, aucun horaire de bureau, aucune disponibilité.
>
> **L'Admin peut l'infirmer, il ne la prononce pas.** Il n'y a toujours **aucune
> décision individuelle prise par un humain en première instance** : ni
> arbitrage, ni négociation, ni passe-droit. Ce qui revient est **un contrôle**,
> pas un pouvoir.

## Ce que ça restaure — et c'était le trou le plus grave de `DP-05`

`R-X6` notait, et le constat tenait : *« une modération sans recours est vécue
comme arbitraire et fait partir les meilleurs profils »*. `DP-05` l'avait
supprimée faute d'instructeur, et je n'avais pu proposer que *« réparer, pas
plaider »*.

**La vérification de l'Admin est cette voie de recours.** Elle est meilleure que
l'ancienne à un titre : elle est **systématique**, pas déclenchée par une
contestation. La personne sanctionnée n'a rien à demander.

| | Avant `DP-05` | Après `DP-05` | Avec `DP-13` |
|---|---|---|---|
| Qui décide | un humain | `SYS` | **l'IA** |
| Quand | après instruction | immédiat | **immédiat** |
| Recours | contestation, instruite par un autre humain | ❌ aucun | ✅ **vérification systématique par l'Admin** |

## Les deux fonctionnalités

| | |
|---|---|
| **`F19.13`** 🆕 | **Classification automatique du signalement.** L'IA lit le texte et les pièces, attribue un niveau, **et écrit sa motivation**. Une classification sans motivation est refusée. |
| **`F19.7`** ♻️ | **Vérification a posteriori des décisions automatiques.** Rétablie, mais réécrite : ce n'est plus une file de modération où l'on décide, c'est **une file de contrôle où l'on confirme ou l'on infirme**. |

> ### ⚠️ Trois risques que l'IA introduit, et qui doivent être écrits
>
> - **L'IA se trompe dans les deux sens.** Un faux niveau 3 coupe une boutique
>   honnête pendant des heures ; un faux niveau 1 laisse passer une menace. **Le
>   délai de vérification devient donc un engagement**, pas une intention.
> - **L'IA peut être manipulée par le texte du signalement.** Un récit rédigé
>   pour déclencher un niveau 3 est une arme entre concurrentes. `R-T8ter` — la
>   preuve exigée aux niveaux 2 et 3 — **devient la contre-mesure principale**,
>   pas un garde-fou secondaire.
> - **Le taux d'infirmation est un indicateur, pas un incident.** S'il dépasse
>   un seuil, ce n'est pas l'Admin qui travaille mal : c'est la classification
>   qui dérive. Il doit remonter au tableau de bord *(`F11.7`)*.

---

# ~~DP-14~~ — L'argent transite par le compte marchand JP ❌ **ANNULÉE par `DP-16`**

> **Fondée sur une lecture erronée.** L'argent **ne transite pas** par le compte
> JP : il va **directement sur le mobile money du vendeur**. Ce qui est enregistré
> chez JP, c'est **la transaction**, pas les fonds. `DP-16` rétablit `DP-07` et
> `DP-11` en entier — **l'exposition juridique reste supprimée**.
>
> *Analyse d'origine conservée ci-dessous.*

**Date** : 2026-08-31 · ~~Amende `DP-07`~~ · ~~Annule `DP-11`~~ · ~~Rouvre `A-03`~~

**L'acheteuse paie sur le compte marchand JP.** JP **reverse immédiatement** à la
boutique — dans la minute, pas dans la journée.

## Ce que `DP-07` gardait, et qui tient toujours

| | |
|---|---|
| ✅ **JP ne conserve pas l'argent** | Il transite. Aucune rétention, aucune libération, aucun portefeuille |
| ✅ **La confirmation de réception ne déclenche rien financièrement** | Elle clôt la commande et alimente la réputation |
| ✅ **JP ne rembourse pas** | Il n'a rien à rendre : l'argent est déjà chez la boutique |
| ✅ **Pas d'arbitrage** | Il n'y a toujours rien à trancher |

**La promesse ne bouge pas** : *« vous savez à qui vous payez »* *(`D-21`)*.

## Ce qui change

### 1. `DP-11` est annulée — et c'est un gain

Plus d'éclatement au moment du paiement. **L'acheteuse fait un seul paiement,
une seule confirmation.** JP reverse ensuite à qui de droit.

| Règle | Sort |
|---|---|
| `R-M4` *(requête pivot)* | ❌ **supprimée** — il n'y a qu'une requête |
| `R-M6` *(annoncer N confirmations)* | ❌ **supprimée** — il y en a toujours une |
| `R-M5` *(rejeu des secondaires)* | ♻️ **déplacée** — elle porte désormais sur **les reversements**, pas sur les encaissements |
| `R-M7` *(vérifier avant de rejouer)* | ✅ **inchangée, et plus importante encore** : un reversement perdu est de l'argent que JP détient et que la boutique attend |

**Le parcours d'achat redevient simple**, et il est **meilleur pour l'acheteuse**
qu'avec `DP-11` : un code, une fois.

### 2. `A-03` revient

**JP reçoit des fonds d'acheteurs pour le compte de vendeurs.** C'est le
périmètre que `docs/marque/` désigne comme **« principal risque du projet »** —
loi 2016-056, art. 79-80.

> ### La différence, et il faut la faire qualifier
>
> **Transiter n'est pas détenir.** Un montant reçu et reversé dans la minute ne
> constitue pas le même fait qu'un montant retenu jusqu'à confirmation. **Mais
> ce n'est pas à nous de le dire** : la question `A-03` — *« le régime d'un tiers
> non agréé recevant des fonds d'acheteurs »* — **doit être posée à un juriste
> malgache**, avec cette précision-là.
>
> **Ce qui a changé en notre faveur** : il n'y a plus de **délai de rétention** à
> justifier. C'était le point le plus exposé, et il a disparu.

### 3. La phrase de paiement redevient fausse

*« Vous payez directement la boutique »* n'est plus exact. **Ni « votre argent
est gardé par JP »**, qui était déjà interdit *(`D-02`)*.

**Formulation retenue** — elle dit ce que l'acheteuse gagne, sans décrire qui
détient quoi :

> ## « Boutique vérifiée — identité et compte Mobile Money contrôlés par JP. »

⚠️ **Le copywriting exact reste à valider avec le juriste** *(`A-03`)*. La règle
tient en une ligne : **on décrit ce que l'acheteuse obtient, jamais qui tient
l'argent.** C'est la recommandation de `D-02`, et elle n'a pas changé.

---

# DP-15 — La boutique choisit : abonnement ou commission

**Date** : 2026-08-31 · **Inverse** `DP-08` · **Rendue possible par** `DP-14`

**La boutique choisit son mode à l'inscription, et peut en changer.**

| Mode | Ce que la boutique paie |
|---|---|
| **Abonnement** | Un forfait mensuel. **Elle encaisse 100 % de ses ventes.** |
| **Commission** | Rien d'avance. **JP retient un pourcentage avant de reverser.** |

## Pourquoi c'était impossible avec `DP-07`, et pourquoi ça l'est maintenant

`DP-08` écartait la commission pour une raison technique : *« si l'argent va
directement à la boutique, JP doit récupérer ensuite une part qu'il n'a jamais
tenue »* — soit un éclatement chez le prestataire, soit un transfert retour.

**`DP-14` supprime cette contrainte.** L'argent transite par JP : **retenir une
commission avant de reverser ne coûte rien de plus.** C'est une soustraction,
pas un transfert.

## Ce qui revient

| | |
|---|---|
| `F10.1` | ♻️ **Commission prélevée automatiquement** — au reversement, plus au paiement |
| `F10.2` | ♻️ **Barème de commission**, historisé, figé à la commande *(`R-G3`)* |
| `F4.9` | ♻️ **Relevé des commissions** pour la boutique |
| `bareme_commission` | ♻️ Table rétablie |
| `commande.taux_commission_pour_mille` | ♻️ Colonne rétablie, **figée à la commande** — un changement de taux ne rétroagit jamais |

## Ce qui ne revient pas

**`DP-08` avait un effet de bord qu'il faut regarder en face** : sans commission
par vente, *« la boutique n'a plus aucun intérêt à conclure ailleurs »*. Le
contournement de la plateforme — **risque n° 1 du modèle économique** — était
devenu un non-sujet.

**Il redevient un sujet, mais seulement pour les boutiques en commission.**
Celles en abonnement n'ont toujours aucun intérêt à contourner. **Le choix
devient donc un instrument de mesure** : le taux de contournement se compare
entre les deux populations, et c'est exactement l'expérience que le pilote
devait faire.

> ### La règle qui ne change pas
>
> **Aucun montant n'est ajouté au prix affiché** *(`R-B1`)*. En commission, JP
> **retient** sur ce que la boutique reçoit ; il n'ajoute rien à ce que
> l'acheteuse paie. **On ne facture pas des frais de service à l'acheteur après
> lui avoir retiré le service** *(`DP-07`)* — ce point-là tient toujours.

⚠️ **Deux valeurs à régler côté Admin** *(`F11.6`)* : le barème de commission et
les paliers d'abonnement. **Le taux de commission redevient la décision
économique n° 1** — *à partir de quel taux la boutique cherche-t-elle à
contourner ?*

---

# DP-16 — Un débit, une confirmation, deux ou trois crédits éclatés

**Date** : 2026-08-31 · **Annule** `DP-14` · **Rétablit et complète** `DP-11` · **Confirme** `DP-07`

**On fait comme tout le commerce en ligne : le client paie, le vendeur reçoit son
argent. JP ne récupère que sa commission.**

```
Hanta paie 50 000 Ar          ← UN débit, UNE confirmation pour elle
        │
        │  le prestataire éclate en 2 ou 3 crédits
        ▼
   ┌────┴─────────────────────────────┐
   ▼                ▼                 ▼
MVola Miora     Compte JP         MVola Ony
 47 500 Ar       2 500 Ar          (si vente affiliée)
   le net       la commission       la part créatrice
```

## Les quatre propriétés, et pourquoi elles tiennent ensemble

| | |
|---|---|
| **L'acheteuse ne voit qu'une confirmation** | Un débit, un code. C'était le gain de `DP-14`, il est conservé |
| **JP ne détient aucun fonds** | L'argent va sur le mobile money du vendeur. C'était le gain de `DP-07`, il est conservé |
| **La commission est une patte de l'éclatement** | Plus besoin de la récupérer après coup — **c'est ce qui la rendait impossible sous `DP-08`** |
| **JP est le marchand de référence** | Il déclenche, et **toute la transaction est enregistrée chez lui**. C'est ça, la traçabilité *(`D-21`)* |

## Ce que ça règle définitivement

> ### L'exposition juridique reste supprimée
>
> `DP-14` rouvrait `A-03` — le régime d'un tiers non agréé recevant des fonds
> d'acheteurs, **« principal risque du projet »**. **Cette lecture était fausse** :
> les fonds ne passent pas par JP. **`A-03` redevient sans objet.**

> ### La commission redevient gratuite à collecter
>
> `DP-08` écartait la commission parce que *« JP devrait récupérer une part qu'il
> n'a jamais tenue »*. **Avec l'éclatement, il ne la récupère pas : elle lui est
> créditée directement**, comme au vendeur. `DP-15` — le choix abonnement ou
> commission — tient sans contorsion.

## Ce dont tout cela dépend, et c'est une seule question

> **Un encaissement unique peut-il être réparti automatiquement vers plusieurs
> comptes bénéficiaires, en une seule opération, avec un seul code de
> confirmation pour le payeur ?**

**C'est `PO-11`, et c'est la question la plus importante du projet.**

**Deux réponses possibles, et le produit doit tenir dans les deux :**

| Réponse | Conception |
|---|---|
| ✅ **Éclatement atomique** *(un appel, N crédits)* | **Le cas nominal.** Une confirmation, tout ou rien. `R-M4` et `R-M5` deviennent inutiles |
| ⚠️ **N requêtes séparées** | **Le repli.** L'ordre devient une règle de sécurité *(`R-M4`)* : la patte vendeur d'abord, son échec annule tout ; les autres sont rattrapables *(`R-M5`)*. **Et l'acheteuse confirme N fois** — il faut l'annoncer *(`R-M6`)* |
| ❌ **Aucun bénéficiaire tiers possible** | L'argent passe par JP, on revient à `DP-14`, **et le risque juridique avec** |

**On code le repli, on préfère le nominal.** L'architecture doit supporter les
deux — c'est ce qui évite d'attendre la réponse pour commencer.

---

# La carte du chantier — ✅ terminée

**53 fichiers modifiés · 3 fichiers supprimés · 3 864 insertions · 5 002 suppressions.**

| | Lot | État |
|:---:|---|---|
| 1 | `docs/` — 12 documents *(acteurs, CDC, cas d'utilisation, backlog, stories, dictionnaire, conception BDD, 4 techniques, README)* | ✅ |
| 2 | **Vocabulaire `DP-03`** — 50 fichiers, 1 837 occurrences de « boutique » | ✅ |
| 3 | `plan/` — 22 fichiers · **295 → 255 fonctionnalités** · 34 barrées, 3 neuves | ✅ |
| 4 | `docs/marque/` — 8 fichiers · **`D-21`** : la promesse change de preuve, pas de nature | ✅ |
| 5 | `apps/terrain/` — **supprimée** *(`DP-04`)*, `pnpm verifier` passe | ✅ |
| 6 | Issues GitHub — **172 fermées**, 210 modifiées, 16 créées | ✅ |

**Les contrôles automatiques du dépôt passent** :

```bash
pnpm verifier      # typage · style · tests · architecture · contrat   → code 0
pnpm couverture    # le plan couvre-t-il le backlog ?                  → 255 = 255
```

> ### Ce que la refonte a retiré, en une ligne
>
> **13 tables** · **34 fonctionnalités** · **6 acteurs** · **6 cas d'utilisation** ·
> **2 applications** *(terrain, back-office)* · **l'exposition juridique désignée
> comme principal risque du projet**.
>
> ### Ce qu'elle a ajouté
>
> **3 fonctionnalités** *(`F2.22` liste du direct, `F4.14` éclatement du paiement,
> `F5.11` fil de remise)* · **2 tables** *(`fil_remise`, `abonnement_boutique`)* ·
> **17 règles** · **2 garanties de base** · et **un modèle économique où le
> contournement de la plateforme n'a plus d'intérêt**.

---

# La dette de relecture assumée

Certaines phrases étaient **plus longues que ce que j'ai pu lire d'un coup** —
lignes de 300 caractères, tableaux à six colonnes, prompts de design en anglais.
Les remplacer entièrement aurait risqué d'écraser une fin de phrase jamais vue.

**La parade employée** : ancrer sur le début, insérer la correction, et recoller
l'ancien texte derrière un marqueur explicite.

```
… **la nouvelle formulation, correcte** … Ancienne rédaction : … l'ancien texte …
```

**40 marqueurs, dans 22 fichiers.** Ils se recensent en une commande :

```bash
grep -rn "Ancienne rédaction\|Ancienne position\|Ancienne analyse\|Ancien libellé" docs plan
```

**Ce n'est pas une faute, c'est un compromis** : le document est **exact** —
aucune phrase fausse ne subsiste — mais **verbeux** à ces 40 endroits. Le
nettoyage est une passe de relecture humaine, pas un travail d'outil : il faut
décider, phrase par phrase, si l'ancienne rédaction éclaire la décision ou
l'encombre.

**Les fichiers les plus chargés** : `plan/EP00-identite.md` *(5)*,
`docs/marque/05_PLATEFORME_DE_MARQUE.md` *(4)*, `plan/EP15-createurs.md` *(3)*,
`plan/EP03-commande.md` *(3)*, `docs/marque/07_CONCURRENCE.md` *(3)*.

---

# Points laissés ouverts

| | Question | Position |
|:---:|---|---|
| **PO-1** | La **créatrice** est-elle un troisième type de compte, ou une boutique sans stock ? | Troisième type de compte, exclusif *(DP-02)*. À confirmer. |
| **PO-2** | Le **partenaire marque** consultait ses campagnes dans le back-office, qui disparaît *(DP-05)*. | Espace partenaire distinct, phase 3, hors V1. |
| ~~PO-3~~ | ~~Comment la créatrice est-elle payée ?~~ | ✅ **Fermé par `DP-09`** |
| **PO-4** | Les **quatre mesures fondatrices** du pilote *(`F11.7`, `R-O2`)* portaient-elles sur le séquestre ? | ✅ **Largement levé.** Vérification faite dans `plan/EP11` : les quatre mesures sont *(1)* commandes annoncées en direct jamais conclues, *(2)* temps administratif par heure de direct, *(3)* abandons à l'étape paiement, *(4)* stock immobilisé par réservations expirées. **Aucune ne dépend du séquestre.** Seules les **hypothèses secondaires** changent : « répartition domicile/relais » *(`DP-04`)* et « taux de litige » deviennent **taux de signalement** *(`R-T8`)* et **abonnements actifs par palier** *(`DP-08`)*. |
| ~~PO-5~~ | ~~La proposition de valeur du donateur est vidée.~~ | ✅ **Fermé par `DP-10`** |
| ~~PO-6~~ | ~~Montants et quotas des paliers d'abonnement~~ | ✅ **Tranché : ce n'est pas une décision de conception, c'est un réglage.** Les valeurs sont **configurées par l'Admin JP** *(`F11.6`, `DP-12`)* une fois le produit terminé. **Le code n'est plus bloqué** — il lui faut le mécanisme de paramétrage, pas les valeurs. ⚠️ Reste bloquant pour **l'ouverture des inscriptions boutique**, pas pour le développement. |
| ~~PO-7~~ | ~~Le prestataire sait-il éclater un encaissement ?~~ | ✅ **Fermé par `DP-11`** — la question ne se pose plus, l'éclatement est calculé chez nous |
| ~~PO-8~~ | ~~La précommande survit-elle sans séquestre ?~~ | ✅ **Tranché : on la garde**, avec l'encaissement **différé à l'atteinte du seuil**. Personne n'est débité avant ; si le seuil tombe, **il n'y a rien à rembourser** — `R-N8` est satisfaite sans détenir de fonds. ⚠️ **Risque résiduel assumé** : un mobile money **ne se pré-autorise pas**. Entre l'engagement et le débit, une part des acheteuses n'aura plus la somme, **et le seuil « atteint » ne le sera plus tout à fait**. Le traitement de ces échecs est une décision d'implémentation *(`F15.8`)*, plus de périmètre. |
| **PO-9** | Le donateur `D` était défini comme **« web, sans compte »**. Désigner un compte bénéficiaire puis revenir confirmer après négociation suppose une session. | À trancher : compte léger, ou lien signé envoyé par courriel. |
| **PO-10** | **Durée de tenue de l'article** pendant la négociation du point de remise *(DP-10)*. 30 minutes *(`F1.10`)* ne suffisent pas entre deux fuseaux horaires. | ⚠️ Durée à arrêter. |
| **PO-11** | **Chaque opérateur expose-t-il une interrogation de statut par notre référence ?** *(`R-M7`)* | ✅ **Stratégie tranchée** : **on ne rejoue jamais à l'aveugle** *(`R-M7`)* — on interroge d'abord, on ne rejoue que si la réponse est explicitement « non effectuée ». La clé d'idempotence *(`R-M2`)* reste en seconde ligne. ⚠️ **Reste à vérifier auprès de MVola, Orange Money et Airtel** : l'existence et la fiabilité de cette interrogation. **Exigence plus faible et plus courante** qu'une garantie d'idempotence. |
| **PO-12** | **Les valeurs de la suspension automatique** *(`R-T8` à `R-T8sexies`)* | ⚠️ **Réglages, plus décisions de conception** *(`DP-13`)* — la classification est faite par l'IA, la liste de motifs a disparu. **Configurés par l'Admin** *(`F11.6`)* : le seuil `N` du niveau 1 · la **preuve minimale** aux niveaux 2 et 3 · **le délai de vérification** *(`R-T8quinquies`, c'est un engagement)* · le **seuil d'alerte du taux d'infirmation** *(`R-T8sexies`)*. |
| ~~PO-13~~ | ~~Un seul compte Admin JP, ou deux ?~~ | ✅ **Tranché : deux, avec validation croisée** sur les paramètres sensibles — seuils de suspension, paliers d'abonnement, durées. **Proposé par l'un, confirmé par l'autre** *(`R-O1`, table `parametre_modification`)*. Un compte unique pouvant couper toutes les boutiques du pays est un point de défaillance unique **et une cible**. |
