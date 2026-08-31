# JP — Dictionnaire de données

## Les tables, leurs attributs et leur rôle

| | |
|---|---|
| **Objet** | Le catalogue complet des tables : ce que chacune sert à faire, ce qu'elle porte, et ce qui la contraint |
| **Public** | Développement, recette, exploitation |
| **SGBD** | PostgreSQL 16 |
| **Amont** | `JP_CONCEPTION_BDD.md` *(décisions et diagrammes ER)* · `JP_CDC_TECHNIQUE.md` §3 *(colonnes)* · `prisma/schema.prisma` *(implémentation)* |
| **Aval** | `JP_ACTEURS_WORKFLOWS.md` — qui fait quoi, et quelles tables chaque parcours touche |

---

## Comment lire ce document

- **Rôle** — à quoi sert la table, en une phrase. Si on ne sait pas l'écrire, la
  table ne devrait pas exister.
- **Attributs clés** — pas toutes les colonnes : celles qui portent une règle,
  une contrainte ou une décision. Le détail exhaustif est dans
  `JP_CDC_TECHNIQUE.md` §3.
- **État** — ✅ migrée et en base · ⬜ conçue, pas encore migrée.
- Les codes `R-xx`, `RB-x`, `Fxx.y`, `Cx`, `Dx` renvoient au cahier des charges,
  aux critères de recette, au backlog, aux contraintes et aux décisions de
  modélisation.

### Conventions qui valent pour toutes les tables

| Règle | Détail |
|---|---|
| **Clé primaire** | `uuid` v7 — ordonné dans le temps, donc index performant, et non devinable |
| **Montants** | **`int` en Ariary, jamais de flottant** *(D6)*. Aucune décimale, nulle part |
| **Taux** | **en pour mille** — `80` = 8 % *(D6)*. Un entier ne dérive pas |
| **Horodatages** | `timestamptz(6)`, UTC en base, affichés en heure locale |
| **Suppression d'un compte** | `statut = supprime`. **Jamais de `DELETE`** — les traces financières et d'arbitrage survivent au compte |
| **Journaux** | `ecriture_financiere` et `journal_audit` sont **`append only`**, garanti par `REVOKE UPDATE, DELETE` *(D3)* |

---

## Vue d'ensemble

| Domaine | Tables | Rôle du domaine |
|---|---:|---|
| [1. Identité](#1--identité) | **11** | Qui est qui, et qui a le droit de **mettre en vente** *(`DP-07`)* |
| [2. Univers](#2--univers) | 1 | Les jeux de règles Mode / Beauté / Tech |
| [3. Catalogue et stock](#3--catalogue-et-stock) | 7 | Ce qui est à vendre, et combien il en reste |
| [4. Commande](#4--commande) | 3 | L'engagement écrit, figé |
| [5. Paiement et argent](#5--paiement-et-argent) | **2** | L'éclatement et le journal — **JP ne détient aucun fonds** *(`DP-07`, `DP-16`)* |
| [6. Livraison](#6--livraison) | **5** | Ce que la boutique déclare, ce que l'acheteur confirme *(`DP-04`)* |
| [7. Contenu](#7--contenu) | 7 | La boutique dont le catalogue est fait de vidéos |
| [8. Direct](#8--direct) | 4 | La diffusion et son bilan |
| [9. Créatrice](#9--créatrice) | 5 | Vendre sans capital |
| [10. Fidélité et dressing](#10--fidélité-et-dressing) | 9 | Le rang client, la cagnotte, la garde-robe |
| [11. Promotions](#11--promotions) | 3 | Les remises, sans cumul possible |
| [12. Événements](#12--événements) | 5 | Les rendez-vous thématiques |
| [13. Cadeau](#13--cadeau) | 1 | Le panier payé par un tiers |
| [14. Confiance](#14--confiance) | 4 | Signalements, avis, score — **la seule protection de l'acheteuse** |
| [15. Modération](#15--modération) | 5 | La protection des personnes |
| [16. Exploitation](#16--exploitation) | 19 | Paramètres, journaux, mesures, notifications |
| **Total recensé** | **~~102~~ 87** | |

> **15 tables supprimées** par les décisions `DP-01`, `DP-04`, `DP-07` et
> `DP-08` : `membre_equipe` · `sequestre` · `portefeuille` · `retrait` ·
> `remboursement` · `point_relais` · `livreur` · `tournee` · `tournee_point` ·
> `collecte_especes` · `retour` · `bareme_commission` — et **2 renommées**
> *(`colis` → `expedition`, `litige` → `signalement_commande`)*.
>
> **2 tables neuves** : `fil_remise` *(`DP-10`)* et `abonnement_boutique`
> promue au premier plan *(`DP-08`)*.

> **Écart assumé, et il est double.** `JP_CONCEPTION_BDD.md` annonce
> **113 tables**.
>
> - **102 portent un nom** et sont recensées ici.
> - **Parmi ces 102, quatre sont nommées sans aucune définition de colonnes** —
>   elles apparaissent dans l'ordre des migrations ou dans un diagramme de
>   relations, jamais dans un schéma.
> - **Onze ne sont nommées nulle part.** Le compte de 113 vient de la somme des
>   compteurs par domaine de la carte ; les tables correspondantes n'existent
>   dans aucun diagramme.
>
> Ce n'est pas une erreur d'inventaire à corriger dans un tableur : **c'est une
> dette de conception à résorber avant la migration concernée**, sinon le schéma
> sera improvisé au moment de coder. Voir §17.

---
---

# 1 · Identité

> **Rôle du domaine.** Établir qui est qui, et surtout **qui a le droit
> d'encaisser**. La règle fondamentale du produit vit ici : *aucun rôle ne peut
> percevoir d'argent avant vérification de son identité **et** de la titularité
> de son compte mobile money.*

| Table | État | Rôle |
|---|:---:|---|
| **`utilisateur`** | ✅ | Le compte. Un seul par adresse électronique, **et d'un seul type — acheteur, boutique ou créatrice** *(`DP-02`)* |
| **`code_otp`** | ✅ | Le code à 6 chiffres d'entrée. **S'ajoute au mot de passe, ne le remplace plus** |
| **`identite_externe`** | ✅ | Le rattachement à un compte Google |
| **`session`** | ✅ | Une session ouverte sur un appareil |
| **`profil_acheteur`** | ✅ | Tailles, morphologie, budget, styles — ce qui personnalise le fil |
| **`boutique`** | ✅ | La boutique : vérification, **abonnement**, score, abonnés |
| **`profil_createur`** | ✅ | La créatrice : audience, palier, ventes générées |
| **`document_identite`** | ✅ | Les pièces du dossier de vérification, chiffrées au repos |
| **`demande_recuperation`** | ✅ | La récupération d'un compte dont l'adresse est perdue |
| **`demande_changement_email`** | ✅ | Le changement d'identifiant, en deux étapes |
| **`demande_verification`** | ✅ | Le dossier KYC lui-même *(cité en migration 5, schéma à écrire)* |

## `utilisateur` ✅

**Rôle** — le compte. **L'adresse électronique est l'identifiant** *(R-C1)*, pas
le numéro de téléphone : c'est ce qui fait survivre le compte à un changement de
carte SIM, première cause historique de perte de compte.

| Attribut | Type | Rôle |
|---|---|---|
| `id` | `uuid` PK | — |
| `email` | `string` **UK** | **L'identifiant du compte** *(R-C1)*. Jamais réutilisable |
| `email_verifie_le` | `timestamp` | Vérifié par le code à usage unique |
| `telephone` | `string` **NULL** | **Contact de livraison seulement** *(R-C15)*. **Ni unique ni obligatoire** — un foyer partage un numéro, l'unicité casserait des cas réels |
| `telephone_verifie_le` | `timestamp` | — |
| `prenom`, `photo_url` | `string` | Affichage |
| `langue` | `enum` | `mg` \| `fr` *(⚠️ le code déclare `en` \| `fr` — voir §17)* |
| `date_naissance` | `date` | **Requise pour publier une vidéo** *(RB6)*. Vide tant qu'on ne publie pas |
| `statut` | `enum` | `actif` \| `suspendu` \| `supprime`. **Un compte se ferme par ce champ, jamais par `DELETE`** |
| `classements_publics` | `bool` | Consentement à apparaître dans les classements |
| `cree_le`, `maj_le` | `timestamp` | — |

## `code_otp` ✅

**Rôle** — porter le code d'entrée à 6 chiffres, sans jamais le stocker en clair.

| Attribut | Rôle |
|---|---|
| `email` + `expire_le` | Index de recherche |
| **`code_empreinte`** | **HACHÉ** *(R-C6)*. **Une fuite de cette table ne doit pas être une fuite de comptes** |
| `tentatives` | À la 5ᵉ erreur, le code est invalidé *(R-C7)* |
| `expire_le` | 10 minutes |
| `consomme_le` | Usage unique |
| `adresse_ip` | Limitation de débit |

## `session` ✅

**Rôle** — une session ouverte sur un appareil, révocable individuellement.

| Attribut | Rôle |
|---|---|
| `jeton_empreinte` **UK** | **Le jeton n'est jamais stocké en clair.** Une fuite de base ne donne pas de session utilisable |
| **`famille`** | La chaîne de rotation. **Quand un jeton de rafraîchissement déjà consommé réapparaît, c'est un vol : on révoque toute la famille**, pas seulement le jeton présenté *(F0.2)* |
| `appareil`, `adresse_ip` | Affichage « mes appareils » |
| `expire_le`, `revoquee_le` | — |

## `boutique` ✅

**Rôle** — la boutique. **C'est la table qui décide si un article peut être mis
en vente.**

| Attribut | Rôle |
|---|---|
| `nom`, `slug` **UK** | Vitrine publique |
| **`logo_url`** | Le logo. **Facultatif** — une boutique ouvre avant d'avoir une image, et bloquer l'ouverture sur un fichier manquant coûterait des vendeuses. L'affichage retombe sur l'initiale du nom |
| **`statut_verification`** | **Le verrou de la mise en vente** *(`DP-07`)*. Il verrouillait l'encaissement ; l'argent partant désormais directement à la boutique, vérifier **après** la vente n'aurait plus de sens |
| **`msisdn_mobile_money`** | Le numéro vérifié. **Seule destination possible d'un crédit** *(`DP-16`)* |
| `affiliation_autorisee` | La boutique accepte-t-elle les créatrices ? *(R-N3)* |
| **`taux_commission_createur`** | Le taux qu'elle offre aux créatrices, **sur son prix** *(`DP-09`, `R-N4`)*. Connu de la créatrice **avant** qu'elle attache l'article |
| **`vente_gelee`** | Gel automatique au-delà du seuil de signalements *(`R-T8`)*. *(Anciennement `encaissement_gele` — il n'y a plus d'encaissement à geler, `DP-07`)* |
| **`palier_abonnement_id`** | Le forfait en cours *(`DP-08`)* |
| **`ventes_du_mois`, `directs_du_mois`** | **Dénormalisés**, remis à zéro au cycle. Portent les quotas de `R-B4` |
| **`score_confiance`** | Public, calculé sur des faits. **Devenu la seule protection de l'acheteuse** *(`DP-07`)* |
| **`taux_signalement`** | Dénormalisé, public *(`R-E2`)* |
| `delai_expedition_moyen` | **Dénormalisé**, tâche quotidienne — affiché **avant** achat *(F5.9)* |
| `nb_abonnes` | **Dénormalisé** *(abonnés au sens social, §5.12 du CDC — pas l'abonnement payant)* |
| `fidelite_activee` | — |

> **`type_boutique` est supprimé** *(`DP-01`)* : il distinguait `boutique` de
> `particulier`. Il n'y a plus de vendeur particulier.

## `profil_acheteur` ✅

**Rôle** — ce qui personnalise le fil et fiabilise le choix de taille.
`taille_haut`, `taille_bas`, `taille_chaussure`, `morphologie`, `budget_min`,
`budget_max`, `styles` *(json)*, `couleurs` *(json)*.
**PK = `utilisateur_id`** : un acheteur, un profil.

## `profil_createur` ✅

**Rôle** — la créatrice, et **ce qui prouve qu'elle fait vendre**.
`nom_public`, `slug` **UK**, `reseaux` *(json)*, `statut_verification`,
`palier`, `badge_verifie`, `nb_abonnes`, **`nb_ventes_generees`** — *« on ne lui
montre pas des vues, on lui montre ce qu'elle a fait gagner »*.

## ~~`membre_equipe`~~ ❌ **supprimée** *(`DP-01`)*

L'employé du vendeur n'existe plus. La table, son attribut `permissions` et les
« quatre interdits absolus » qu'elle portait disparaissent avec lui.

## `document_identite` ✅

**Rôle** — les pièces du dossier de vérification.
`type` *(`cin_recto` \| `cin_verso` \| `selfie` \| `nif_stat`)* — **`cin_recto`, `cin_verso` et `selfie` forment le dossier attendu ; `nif_stat` est accepté et n'est jamais exigé** : beaucoup de vendeuses réelles n'ont ni NIF ni carte statistique, et l'exiger fermerait la plateforme à celles pour qui elle est faite,
**`url_chiffree`** *(chiffré au repos, R-V5)*, `empreinte`.

## `identite_externe` ✅

**Rôle** — le rattachement Google.
`fournisseur`, **`sujet_externe`** — **UK(fournisseur, sujet)**, l'identifiant
stable du fournisseur, **jamais l'adresse électronique** *(R-C12)* : une adresse
peut changer de propriétaire, un sujet non.

## `demande_recuperation` ✅

**Rôle** — récupérer un compte dont l'adresse n'est plus accessible.
`numero` **UK** *(dicible au téléphone)*, `utilisateur_cible_id`, `email_ancien`,
`email_nouveau`, `statut`, **`motif_decision`**, **`points_concordants`** *(json)*.

> **`decide_par_id` est supprimé** *(`DP-05`)*. C'était « le seul parcours du
> produit où un humain de JP décide » — il n'y en a plus aucun. `SYS` décide sur
> **seuil de concordance**, et `points_concordants` journalise ce qui a été
> comparé.
>
> ⚠️ **C'est ici que `DP-05` coûte le plus cher.** Une usurpation réussie donne
> accès à un compte ; un refus à tort enferme dehors quelqu'un de légitime, **et
> il n'y a personne à qui faire appel**. Le seuil et la liste des points comparés
> DOIVENT être versionnés, pas réglés à la volée.

## `demande_changement_email` ✅

**Rôle** — changer l'identifiant en deux étapes : ancienne adresse vérifiée,
puis nouvelle. `nouvel_email`, `etape`, `expire_le`.

---

# 2 · Univers

## `univers` ✅

**Rôle** — porter **ce qui doit être modifiable sans déploiement** dans le jeu de
règles d'un univers : **son ouverture**. Le reste des
règles *(champs de fiche, motifs de signalement)* vit dans le code
*(`packages/contracts/src/univers.ts`)*, parce que cela change le produit et doit
passer par une revue.

| Attribut | Rôle |
|---|---|
| **`cle`** PK | `mode` \| `beaute` \| `tech`. **Ne change jamais** — il est dans les URL et les lignes de commande |
| `nom`, `signature`, `onglet` | Affichage |
| **`ouvert`** | Un univers fermé garde ses règles et **n'apparaît nulle part**. L'ouvrir est un `UPDATE` |
| ~~`commission_pour_mille`~~ | ❌ **Supprimé** *(`DP-08`)* — si un univers doit coûter plus cher, cela se joue sur **le palier d'abonnement**, plus sur la vente. *(Ancien libellé : `80` = 8 %. 30 pour Tech — un revendeur de téléphones gagne ~5 %, lui en prendre 8 rendrait l'univers vide |
| `rang` | Ordre des onglets |

---

# 3 · Catalogue et stock

> **Rôle du domaine.** Le plus critique du schéma *(RB1)* et le plus isolé : il
> ne dépend de rien. **`variante.quantite_stock` est la seule vérité** ; Redis
> diffuse un compteur d'affichage et **peut diverger** *(D2)*.

| Table | Rôle |
|---|---|
| **`article`** | Ce qui est à vendre |
| **`variante`** | La déclinaison taille × couleur, **et le stock** |
| **`reservation`** | **La table la plus sensible du schéma.** Elle porte `RB1` |
| **`mouvement_stock`** | Le journal de toute variation de stock |
| `categorie` | L'arborescence de classement |
| `question_article` | Les questions publiques sous une fiche |
| `alerte_stock` | « Prévenez-moi quand ça revient » |

## `article` ✅

| Attribut | Rôle |
|---|---|
| `boutique_id` | IDX(`boutique_id`, `statut`) |
| **`univers_cle`** | **Immuable** *(R-Y1)*, garanti par **déclencheur** — une contrainte `CHECK` ne peut pas comparer l'ancienne et la nouvelle valeur. Changer l'univers changerait les règles de litige et la commission **après** une commande |
| `prix_ariary`, `prix_barre_ariary` | **Entiers** *(D6)* |
| `statut` | `brouillon` \| `en_ligne` \| `masque` \| `epuise` |
| `piece_unique` | Un seul exemplaire *(F1.14)*. **Le moteur d'urgence naturel du direct**, sans fausse rareté *(RB9)*. *(La mention « le cas du particulier » est périmée — l'acteur n'existe plus, `DP-01`.)* Garanti par déclencheur : `quantite_stock > 1` est refusé |
| `type_vente` | `stock` \| `precommande` |
| `etat_vetement` | `neuf_etiquette` \| `tres_bon` \| `bon` \| `correct` |
| `mesures` *(json)* | Épaules, poitrine, taille, longueur *(R-H4)*. **Sans essayage, les mesures remplacent le fait de toucher le vêtement** |
| `a_mesures` | **Dénormalisé**, déclencheur — sert le tri par pertinence |
| `achat_direct_actif` | *(R-H1)* |
| `epingle`, `position_vitrine` | Mise en avant par la boutique |
| `peremption_le` | **Colonne générée** + index partiel — JP Beauté. Vérifiée **à la publication et à l'achat**, car un article périme en stock *(R-Y13)* |

## `variante` ✅

| Attribut | Rôle |
|---|---|
| `taille`, `couleur` | **UK(`article_id`, `taille`, `couleur`)** |
| `sku` | Référence boutique |
| **`quantite_stock`** | **LA vérité** *(D2)* |
| **`quantite_reservee`** | `CHECK (>= 0)` et **`CHECK (<= quantite_stock)`** — **le dernier filet contre la survente, même en cas de bogue applicatif** |
| `seuil_alerte` | Alerte stock bas |

> `disponible = quantite_stock − quantite_reservee`

## `reservation` ✅ — *la table la plus sensible*

**Rôle** — tenir un article pendant que l'acheteuse paie. **Une ligne de panier
*est* une réservation active** *(D7)* : il n'existe pas de table `panier`, qui
créerait une seconde source de vérité sur ce qui est réservé.

| Attribut | Rôle |
|---|---|
| `variante_id` | IDX(`variante_id`, `statut`) |
| `utilisateur_id` **NULL** | `NULL` si session invitée |
| `session_invitee_id` | Le visiteur non inscrit peut réserver |
| `statut` | `active` \| `consommee` \| `expiree` \| `annulee` \| `en_file` |
| **`origine`** | `direct` \| `catalogue` \| `clip` \| `story` \| `evenement`. **Un seul moteur de réservation pour tous les canaux** *(R-H1)* : l'origine change `expire_le` à la création *(R-H3)*, **et rien d'autre** |
| `rang` | File d'attente *(R-S7)* |
| **`expire_le`** | **IDX partiel `WHERE statut = active`** — c'est ce qui rend l'expiration bon marché |
| `suspendu_depuis` | Suspension pendant un paiement *(R-S5)* |

**Trois protections** : le verrou `FOR UPDATE` sur `variante` dans la
transaction, les deux `CHECK`, et l'index partiel.

## `mouvement_stock` ✅

**Rôle** — expliquer un écart trois semaines plus tard. **Toute variation de
`quantite_stock` produit une ligne.**
`type` *(`entree` \| `vente` \| `retour` \| `correction` \| `expiration`)*,
`quantite_delta`, `reference`, `auteur_id`.

## `categorie` ✅
Arborescence : `parent_id`, `nom_mg`, `nom_fr`, `position`.

## `question_article` ✅
`texte`, `reponse_texte`, `statut` *(`publiee` \| `masquee`, R-X1)*.

## `alerte_stock` ✅
PK(`variante_id`, `utilisateur_id`), `notifie_le`.

---

# 4 · Commande

> **Rôle du domaine.** Le carrefour : **le seul endroit où l'argent et le stock
> se rencontrent.** Tout y est **figé au moment de la commande** — prix, remise,
> part créatrice, univers. Rien ne rétroagit.

| Table | Rôle |
|---|---|
| **`commande`** | L'engagement écrit |
| **`ligne_commande`** | L'article commandé, à son prix figé |
| **`facture`** | La preuve, inaltérable |

> **`remise_ligne` n'est pas une table.** C'est une **colonne** de
> `ligne_commande` — `int DEFAULT 0` *(`JP_CDC_TECHNIQUE.md` §3.3,
> `plan/EP03-commande.md` §3)*. La migration 17 s'appelle `f7_26_remise_ligne`
> parce qu'elle ajoute un `CHECK` **sur cette colonne**, pas parce qu'elle crée
> une table. Aucune table de liaison n'existe pour les remises, et c'est
> précisément ce qui fait tenir `D4`.

## `commande` ✅

| Attribut | Rôle |
|---|---|
| **`numero`** **UK** | **Lisible et prononçable** — il sera dicté au téléphone |
| `acheteur_id` | IDX(`acheteur_id`, `cree_le`) |
| `createur_id` | **L'attribution d'affiliation** *(R-N1)* |
| `evenement_id`, `direct_id` | Rattachements |
| `donateur_ref` | Commande cadeau *(RB8)* |
| `statut` | Machine à états — voir §18 |
| **`origine`** | IDX(`origine`, `cree_le`). **Une file de commandes unique** *(R-H2)* : deux files signifieraient deux logistiques, et la boutique en oublierait une |
| `mode_livraison` | `domicile` \| `relais` |
| `adresse_id` \| `relais_id` | L'un ou l'autre |
| `code_promo` | **Figé à la commande** *(R-U9)* |
| `sous_total`, `frais_livraison`, `remise`, `remise_livraison`, `credit_cagnotte_utilise`, `total` | Entiers, en Ariary |
| **`univers_cle`** | **Figé** *(R-Y3)* |
| **`taux_commission_pour_mille`** | ♻️ **Rétabli et figé** *(`DP-15`, `R-G3`)* — un changement de taux ne rétroagit jamais |
| **`mode_remuneration`** | 🆕 `abonnement` \| `commission`, **figé à la commande** *(`R-B5`)* — un changement de mode ne rétroagit pas non plus |

## `ligne_commande` ✅

| Attribut | Rôle |
|---|---|
| `variante_id`, `boutique_id`, `quantite` | — |
| **`prix_unitaire`** | **FIGÉ à la commande** |
| `remise_ligne` | `CHECK (<= prix_unitaire * quantite)` |
| **`promotion_id`** | **SCALAIRE, pas une table de liaison** *(D4)*. **Le cumul de remises est impossible par construction**, pas seulement interdit par convention *(R-U7)*. C'est la décision de modélisation la plus importante du domaine commercial |
| **`part_createur`** | La part due à la créatrice si la vente est affiliée *(`DP-09`)*, **figée à la commande**. *(`commission_jp` et `bareme_id` sont supprimés — `DP-08`.)* |

## `facture` ✅
`commande_id` **UK** · `numero` **UK** *(séquence dédiée, continue)* · `url_pdf` ·
**`emise_le` inaltérable** *(R-F1)*.

---

# 5 · Paiement et argent

> **Rôle du domaine.** **JP ne détient aucun fonds** *(`DP-07`)*. Ce domaine ne
> tient plus de soldes : il tient **la trace** de paiements qui vont directement
> d'un acheteur à une boutique. `ecriture_financiere` reste `append only` —
> c'est désormais un **journal de traçabilité**, plus un grand livre de comptes
> détenus.

| Table | Rôle |
|---|---|
| **`paiement`** | **Une ligne par crédit** — boutique, commission JP, créatrice *(`DP-16`)* |
| **`ecriture_financiere`** | Le journal, inaltérable |
| ~~`sequestre`~~ | ❌ **supprimée** *(`DP-07`)* |
| ~~`portefeuille`~~ | ❌ **supprimée** — JP ne tient plus de solde |
| ~~`retrait`~~ | ❌ **supprimée** — il n'y a rien à retirer |
| ~~`remboursement`~~ | ❌ **supprimée** — **JP ne rembourse pas** *(`R-E5`)* |

## `paiement` ✅

**Une ligne par crédit, pas par commande** *(`DP-16`)*. Un débit de l'acheteuse
produit **1 à 3 lignes** : la boutique, la commission JP, la créatrice.

| Attribut | Rôle |
|---|---|
| `commande_id` | IDX(`commande_id`, `rang`) |
| **`rang`** | **`pivot`** \| **`secondaire`**. En **repli** *(N requêtes)*, le pivot est émis en premier ; **son échec annule tout** *(`R-M4`)*. En **éclatement atomique**, le rang n'ordonne rien — il documente |
| **`beneficiaire_type`** | `boutique` \| **`jp`** \| `createur` — **la patte `jp` est la commission** *(`DP-15`)* |
| **`beneficiaire_id`** | Vers **quel compte** va le crédit |
| **`msisdn_destination`** | Figé depuis `boutique.msisdn_mobile_money` — **jamais saisissable** |
| `moyen` | `mvola` \| `orange` \| `airtel` \| `carte` |
| `montant` | `CHECK (> 0)`. **La somme des crédits d'une commande égale le montant débité** — vérifié par test |
| `statut` | `INITIE` → `EN_ATTENTE_OPERATEUR` → `CONFIRME` \| `ECHOUE` \| `EXPIRE` |
| **`nb_rejeux`, `prochain_rejeu_le`** | **IDX partiel `WHERE rang = 'secondaire' AND statut = 'ECHOUE'`** *(`R-M5`)* |
| `reference_externe` | La référence du prestataire |
| **`cle_idempotence`** **UK** | **Porte `RB10`** *(R-M2)*. Un rejeu renvoie le résultat initial sans nouveau prélèvement |
| **`motif_echec`** | **Le motif réel.** « Le paiement a échoué » ne dit pas s'il faut recharger ou réessayer |
| `payeur_utilisateur_id`, `payeur_pays` | **Diaspora** — qui a payé, depuis où |
| `montant_devise_origine`, `devise_origine`, `taux_indicatif` | Paiement par carte depuis l'étranger |

> ### Le nombre de crédits, par situation
>
> | | Crédits |
> |---|---|
> | Boutique en **abonnement**, vente simple | **1** — la boutique |
> | Boutique en **commission**, vente simple | **2** — la boutique, JP |
> | Boutique en **commission**, vente affiliée | **3** — la boutique, JP, la créatrice |

> ### ⚠️ Ce que le modèle ne dit pas encore
>
> **En éclatement atomique** *(le cas nominal, `R-M10`)*, ces lignes sont créées
> **après** la réponse du prestataire : c'est lui qui a réparti. **En repli**,
> elles sont créées **avant**, et `rang` porte l'ordre d'émission.
>
> **Le même schéma sert les deux modes** — c'est ce qui permet de commencer sans
> attendre la réponse à `PO-11`.

## `ecriture_financiere` ✅ — *append only*

| Attribut | Rôle |
|---|---|
| `type`, `reference`, `montant` | — |
| `sens` | `debit` \| `credit` |
| **`compte`** | `boutique` \| `createur` \| `cagnotte` \| `abonnement_jp`. *(Disparus : `sequestre`, `portefeuille_*`, `commission_jp`, `especes` — `DP-04`, `DP-07`, `DP-08`.)* |
| `titulaire_id` | IDX(`titulaire_id`, `compte`, `cree_le`) |

```sql
REVOKE UPDATE, DELETE ON ecriture_financiere FROM app_role;
```

**Toute correction est une écriture inverse, jamais une modification.**

> **Ce que ce journal est devenu.** Il ne décrit plus des mouvements sur des
> comptes que JP détient — il **atteste** que tel montant est parti de tel
> payeur vers tel bénéficiaire, à telle date. C'est exactement la **traçabilité**
> sur laquelle repose la nouvelle promesse *(`DP-07`, §5.5.2 du CDC)** : le seul
> recours de l'acheteuse étant externe, JP doit pouvoir **fournir les pièces**.

---

# 6 · Livraison

> **Rôle du domaine.** **JP n'opère aucune logistique** *(`DP-04`)*. La boutique
> fait parvenir le colis par le moyen de son choix. Ce domaine ne suit plus un
> colis dans un réseau : il **enregistre ce que la boutique déclare** et **ce que
> l'acheteur confirme**. De onze tables, il en reste cinq.

| Table | Rôle |
|---|---|
| **`expedition`** | Ce que la boutique déclare · *(anciennement `colis`)* |
| **`evenement_livraison`** | L'historique partagé, **avec son auteur** |
| **`fil_remise`** | 🆕 Où et quand la remise a lieu — convenu entre les parties |
| `zone_livraison` / `tarif_livraison` | Le prix, **fixé par la boutique** |
| `adresse` | L'adresse enregistrée de l'acheteuse |
| ~~`point_relais`~~ · ~~`livreur`~~ · ~~`tournee`~~ · ~~`tournee_point`~~ | ❌ **supprimées** *(`DP-04`)* |
| ~~`collecte_especes`~~ | ❌ **supprimée** — il n'y a plus d'espèces |
| ~~`retour`~~ | ❌ **supprimée** — un retour se règle entre la boutique et l'acheteur *(`R-T3`)* ; JP n'exécute aucun mouvement d'argent |

## `expedition` ✅ *(anciennement `colis`)*

| Attribut | Rôle |
|---|---|
| `commande_id` | IDX |
| **`statut`** | `EN_PREPARATION` → `EXPEDIEE` → `LIVREE` → `CONFIRMEE` *(`R-L3`)* |
| `moyen_declare` | Texte libre — coursier, transporteur, main propre. **JP n'impose rien et ne vérifie rien** |
| `telephone_verifie` | **Figé à la création** |
| `nb_tentatives`, `motif_echec` | — |

> **Huit attributs ont disparu** *(`DP-04`)* : `livreur_id`, `relais_id`,
> `code_retrait`, `garde_jusqu_au`, `preuve_remise_url`, `montant_a_encaisser`,
> `montant_encaisse`, et les transitions `ENLEVE` / `EN_LIVRAISON`.
>
> ⚠️ **`preuve_remise_url` est la perte la plus lourde.** Aucun tiers neutre ne
> constate la remise *(`R-L9`)*. En cas de désaccord il n'y a **ni preuve, ni
> arbitre, ni argent retenu** : le signalement pèse sur la réputation, et c'est
> tout *(`R-T8`)*.

## `evenement_livraison` ✅

**Rôle** — l'historique visible **des deux côtés**.

| Attribut | Rôle |
|---|---|
| `expedition_id` | IDX(`expedition_id`, `horodatage`) |
| `statut` | La transition |
| **`auteur_id`** | **QUI a fait avancer.** C'était ce qui rendait l'arbitrage possible ; l'arbitrage a disparu *(`DP-05`)*, mais **la trace reste** — c'est elle qu'on fournit quand le recours est externe |
| `horodatage`, `commentaire` | — |

## `fil_remise` ✅ 🆕 *(`DP-04`, `DP-10`)*

**Rôle** — le lieu et le moment de la remise, **convenus entre les parties**, pas
imposés par JP.

| Attribut | Rôle |
|---|---|
| `commande_id` **UK** | Un fil par commande |
| `participants` | L'acheteur *(ou **le bénéficiaire** dans le cas du cadeau)* et la boutique. **Jamais le donateur** *(`RB8`, `R-G1`)* |
| `point_convenu`, `moment_convenu` | Reportés sur le bordereau de préparation |
| **`accord_le`** | **Dans le cas du cadeau, c'est cette date qui débloque le paiement** *(`DP-10`)* |

> **L'invariant `RB8` devient structurel.** Il fallait cacher activement
> l'adresse au donateur ; désormais **il ne la manipule jamais** — elle se
> négocie entre deux personnes dont il ne fait pas partie.
>
> ⚠️ **Conséquence sur la réservation** : le paiement du cadeau venant après
> l'accord, l'article doit être tenu bien plus que 30 minutes *(`PO-10`)*.

## `zone_livraison` ✅ · `tarif_livraison` ✅
`zone_livraison` : `nom`, `quartiers` *(json)*, `delai_transport_j`.
`tarif_livraison` : PK(`boutique_id`, `zone_id`), `montant`. **Le tarif est fixé
par la boutique** *(`DP-04`)* et **affiché dès le direct** — un frais découvert
au paiement est le premier tueur de panier *(`R-P2`)*.

## `adresse` ✅
`libelle`, `quartier`, **`reperes`** — **pas de code postal** *(R-L2)* :
l'adressage postal n'est pas praticable à Madagascar. `telephone_destinataire`.

---

# 7 · Contenu

> **Rôle du domaine.** *« JP n'est pas un réseau social auquel on ajoute une
> boutique. C'est une boutique dont le catalogue est fait de vidéos. »* Cette
> phrase est **une contrainte de base de données**, pas une intention.

| Table | Rôle |
|---|---|
| **`contenu`** | Story, clip, photo, unboxing |
| **`contenu_article`** | **La règle d'or : au moins une ligne, sinon la publication échoue** |
| `statistique_contenu` | L'entonnoir, jusqu'aux gains |
| `interaction` | Vues, réactions, commentaires, partages |
| `abonnement` | Qui suit qui |
| `hashtag` / `contenu_hashtag` | Le rassemblement thématique |

## `contenu` ✅

| Attribut | Rôle |
|---|---|
| `auteur_id` | IDX(`auteur_id`, `publie_le`) |
| `type` | `story` \| `clip` \| `photo` \| `unboxing` |
| `media_url`, `miniature_url`, `duree_s` | — |
| **`commande_source_id`** | `CHECK (type <> 'unboxing' OR commande_source_id IS NOT NULL)` — **pas d'unboxing sans commande réelle** *(R-K2)* |
| **`commentaires_ouverts`** | `tous` \| `abonnes` \| `aucun` *(R-X2)*. **L'autrice restreint elle-même** — le geste de protection appartient à celle qui se filme |
| `expire_le` | Story : +24 h |
| **`empreinte_video`** | **Détection de republication** *(R-X7)*. Le vol de contenu est le premier abus qui apparaîtra ; sans réponse, les créatrices sérieuses partent |
| **`partenariat_id`, `campagne_id`** | **L'étiquette « Sponsorisé » est calculée, jamais saisie** *(F18.8)* — donc **non retirable par l'autrice** |
| **`auteur_majeur`** | `CHECK` — **aucun mineur ne publie de vidéo** *(RB6)* |

## `contenu_article` ✅ — *la règle d'or*

PK(`contenu_id`, `article_id`) · **`createur_id`** *(porte l'affiliation, R-N1)*
· `position`.

```sql
CREATE CONSTRAINT TRIGGER contenu_doit_avoir_article
  AFTER INSERT OR UPDATE ON contenu
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION verifier_contenu_a_article();
```

**Différé**, pour permettre d'insérer le contenu puis ses articles dans le même
bloc transactionnel *(RB5)*.

## `statistique_contenu` ✅
`vues`, `duree_moyenne_s`, `clics_article`, `je_prends`, `ventes`, **`gains`** —
*« le chiffre le plus important »* *(R-K15)*. **Agrégation asynchrone.**

## `interaction` ✅
`type` *(`vue` \| `reaction` \| `commentaire` \| `partage` \| `favori`)*,
`texte`, `statut` *(`publie` \| `masque_auto` \| `masque_autrice`)*.

## `abonnement` ✅
PK(`suiveur_id`, `suivi_id`) · IDX(`suivi_id`, `cree_le`) · `type` ·
**`notifications_promo`** — **réglable boutique par boutique** *(R-Q6)* : couper
une boutique bavard ne doit pas obliger à tout couper.

---

# 8 · Direct

| Table | Rôle |
|---|---|
| **`direct`** | La diffusion |
| **`direct_article`** | Les articles préparés, **et leur minute de passage** |
| `message_direct` | Le chat |
| `direct_bilan` | Ce que la boutique lit après |

## `direct` ✅
`titre`, `affiche_url`, `statut` *(`planifie` \| `en_cours` \| `en_pause` \|
`termine`)*, `debut_prevu_le`, `debut_le`, `ingest_ref`, `lecture_url`,
`enregistrement_url`, **`article_a_lecran_id`** *(ce qui est présenté
maintenant)*, `nb_spectateurs_pic`, `rediffusion_facebook`.

## `direct_article` ✅
PK(`direct_id`, `article_id`) · `position` · **`a_lecran_le`**.

> **`a_lecran_le` rend le replay achetable gratuit** *(F2.16)* : les marqueurs à
> la minute sont **produits par l'usage**, sans aucune saisie manuelle.

## `message_direct` ✅
`texte`, `statut`, `epingle`, `automatique` *(F12.2)*.

## `direct_bilan` ✅
`duree_s`, `spectateurs_uniques`, `pic_audience`, `nb_vendus`, `ca`,
`taux_conversion`, `nb_expirees`, **`articles_sans_vente`** *(json)* — **un
signal de prix trop haut**, pas une statistique décorative.

---

# 9 · Créatrice

> **Rôle du domaine.** Supprimer la seule barrière réelle de la créatrice : **le
> capital**. Elle vend sans acheter de stock.

| Table | Rôle |
|---|---|
| `selection` / `selection_article` | Sa vitrine d'articles d'autrui |
| **`clic_affiliation`** | La fenêtre d'attribution |
| **`precommande`** | Commander seulement ce qui est déjà vendu |
| `precommande_engagement` | Les commandes collectées |

## `clic_affiliation` ✅
`createur_id`, `article_id`, `utilisateur_id`, **`expire_le`** —
IDX(`utilisateur`, `article`, `expire_le`), **la fenêtre d'attribution** *(R-N2)*.

## `precommande` ✅

| Attribut | Rôle |
|---|---|
| `article_id` **UK** | Une précommande par article |
| `organisateur_id` | La créatrice |
| `seuil` | `CHECK (> 0)` |
| **`date_limite`** | **IDX partiel `WHERE ouverte`** |
| `compteur_actuel` | — |
| `statut` | `ouverte` \| `seuil_atteint` \| `expiree` \| `remboursee` \| `livree` |
| `avance_liberee` | Paramétré *(R-N9)* |
| **`date_expedition_max`** | **Porte `RB3`** — le remboursement automatique si le seuil n'est pas atteint. **Sans lui, la précommande reproduirait exactement l'arnaque que JP combat** |

---

# 10 · Fidélité et dressing

| Table | Rôle |
|---|---|
| `palier_fidelite` | Les paliers définis **par boutique** |
| **`rang_client`** | Le classement, **par boutique uniquement** |
| **`vente_confirmee_journal`** | La source du rang — **à créer dès la phase 1** |
| `note_client` | La note privée de la boutique |
| `cagnotte` / `mouvement_cagnotte` | Le crédit d'achat |
| `piece_dressing` / `look` / `look_piece` | La garde-robe et les looks |

## `rang_client` ✅ — *une garantie par absence*

| Attribut | Rôle |
|---|---|
| **UK(`boutique_id`, `utilisateur_id`)** | **Le rang est par boutique** *(R-R1)* |
| `palier_id`, `score` | IDX(`boutique_id`, `score DESC`) |
| `montant_cumule`, `nb_commandes` | — |
| `derniere_commande_le` | IDX — pour « clientes inactives depuis » |
| `nb_signalements`, `nb_annulations` | — |

> **Il n'existe volontairement aucun index sur `utilisateur_id` seul dans
> `vente_confirmee_journal`, et aucune vue agrégeant un client tous boutiques
> confondus** *(D5, R-R1)*.
>
> **Un contrôle d'autorisation se contourne par une nouvelle requête ; l'absence
> de chemin d'accès ne se contourne pas.** Cette absence **doit être documentée
> dans la migration**, sinon quelqu'un ajoutera l'index « pour optimiser ».

## `vente_confirmee_journal` ✅

**Rôle** — la source de vérité du rang client.

> **À migrer dès la phase 1, même si la fidélité n'est activée qu'en phase 2**
> *(R-R11)*. Sans elle, il faudra reconstituer l'historique à la main — ou
> effacer la fidélité des premières clientes, **qui sont précisément les plus
> fidèles**.

`boutique_id`, `utilisateur_id`, **`commande_id` UK** *(rend le rattrapage
idempotent)*, `montant_confirme`, `confirme_le`.

## `cagnotte` ✅ / `mouvement_cagnotte` ✅
`cagnotte.solde` **dérivé des mouvements**.
`mouvement_cagnotte.type` : `credit_unboxing` \| `credit_parrainage` \|
`utilisation` \| `reprise` · `reference` **UK partiel pour `credit_unboxing`**
*(un unboxing ne crédite qu'une fois)*.

## `piece_dressing` ✅ / `look` ✅ / `look_piece` ✅
`piece_dressing.origine` : `achat_jp` \| `ajout_manuel` · **`article_id` — ce qui
rend la pièce achetable dans un look publié**.

---

# 11 · Promotions

## `promotion` ✅

| Attribut | Rôle |
|---|---|
| `type` | `pourcentage` \| `montant` \| `livraison_offerte` |
| `valeur` | `CHECK (> 0)` |
| `perimetre` | `boutique` \| `categorie` \| `selection` |
| `cible` | `tous` \| `abonnes` \| `palier` \| `clients_nommes` |
| `code` **UK** | — |
| `plafond_utilisation`, `utilisations` | — |
| `debut_le`, `fin_le` | `CHECK (fin_le > debut_le)` |
| `statut` | `brouillon` \| `programmee` \| `active` \| `terminee` \| `annulee` |
| **`notifiee_le`** | **Un verrou d'idempotence, pas une donnée d'affichage** *(R-U3)*. Après un incident du planificateur, la promotion démarre en retard mais **ne renotifie jamais** |

## `promotion_article` ✅ · `promotion_beneficiaire` ✅
`promotion_beneficiaire.code_personnel` **UK** — **nominatif et à usage unique**
*(R-U6)*.

---

# 12 · Événements

| Table | Rôle |
|---|---|
| `evenement` | Le rendez-vous thématique |
| `evenement_participation` | La candidature et sa décision |
| **`evenement_element`** | Ce qui est exposé — **polymorphe, et c'est assumé** |
| `evenement_rappel` | Les notifications, **plafonnées** |
| `evenement_bilan` | Le résultat, comparé à une période équivalente |

## `evenement` ✅
**`portee`** : `jp` \| `boutique` *(R-W8)* · `proprietaire_id` *(NULL si portée
JP)* · `nom`, `theme`, `slug` **UK**, `visuel_url`, **`couleur_accent`**
*(appliquée par jeton, jamais par image — le budget de données, R-W7)*,
`hashtag`, `debut_le` *(IDX partiel `WHERE annonce`)*, `fin_le`, `statut`,
`candidatures_ouvertes`.

## `evenement_element` ✅
PK(`evenement_id`, `cible_type`, `cible_id`) — `cible_type` ∈ `article` \|
`promotion` \| `contenu` \| `direct`.

> **Polymorphe, et c'est assumé.** L'alternative — quatre tables de liaison —
> donnerait une intégrité référentielle en base mais **quatre requêtes pour
> composer une page, sur un réseau lent**. L'intégrité est applicative.

## `evenement_rappel` ✅
PK(`evenement_id`, `utilisateur_id`) · **`notifications_envoyees` — plafond 3**
*(R-W9)*.

## `evenement_bilan` ✅
`nb_articles_vendus`, `ca_ariary`, **`ca_reference_ariary`** *(période
équivalente — un chiffre sans comparaison ne dit rien)*, `nouveaux_abonnes`,
`trafic_page`.

---

# 13 · Cadeau

## `panier_cadeau` ✅

**Rôle** — permettre qu'un panier composé par l'une soit payé par un autre, **y
compris depuis l'étranger**. C'est le premier canal qui ne dépend pas du pouvoir
d'achat local.

*Schéma détaillé à écrire — la table est citée en migration 27 sans diagramme.
Voir §17.* Attributs attendus : le panier source, le lien de partage, l'état, le
message, et le rattachement au paiement du donateur *(RB8)*.

---

# 14 · Confiance

> **Rôle du domaine.** **C'est devenu le domaine le plus important du produit.**
> Le séquestre protégeait l'acheteuse ; il a disparu *(`DP-07`)*. Ce qui la
> protège désormais tient **entièrement** dans ces quatre tables.

| Table | Rôle |
|---|---|
| **`signalement_commande`** | Le problème déclaré, et **son effet sur le compteur** · *(anciennement `litige`)* |
| `message_litige` | Le fil de discussion entre les parties |
| **`avis`** | L'avis vérifié |
| **`score_confiance`** | La note publique de la boutique — **la protection elle-même** |

## `signalement_commande` ✅ *(anciennement `litige`)*

| Attribut | Rôle |
|---|---|
| `commande_id` | IDX |
| `ouvert_par_id` | — |
| `motif` | Filtré par univers — *« pas ma taille »* n'a aucun sens pour un téléphone, *« batterie morte »* aucun pour une robe |
| **`statut`** | `ouvert` \| `en_discussion` \| `resolu`. *(`arbitrage` et `clos` disparaissent — `DP-05`.)* |
| **`compte_dans_le_score`** | **`true` tant que `statut <> 'resolu'`.** C'est **toute** la sanction du produit *(`R-T8`)* |
| `resolu_le` | La résolution **décrémente le compteur** |

> **Trois attributs sont supprimés** *(`DP-05`)* : `decision_texte`,
> `decide_par_id` et `affecte_a_id`. **Personne n'instruit, personne ne tranche,
> personne ne s'attribue de dossier.**
>
> **La contrainte `decision_motivee` disparaît avec eux.** Elle traduisait `RB4`
> en base — *« la clôture silencieuse est impossible »*. `RB4` porte désormais
> sur **les sanctions automatiques** *(`R-T2`)*, et la contrainte se déplace sur
> `sanction.motif_texte`.

```sql
-- Ce que le compteur doit garantir : un signalement ouvert pèse, toujours.
ALTER TABLE signalement_commande ADD CONSTRAINT compteur_coherent
  CHECK (compte_dans_le_score = (statut <> 'resolu'));
```

> ⚠️ **Le seuil de suspension n'est pas tranché** *(`PO-12`)*. Trop bas, une
> boutique honnête est coupée par deux clientes mécontentes ; trop haut, la
> protection est décorative. **C'est le paramètre le plus sensible du produit
> depuis `DP-07`.**

## `avis` ✅

| Attribut | Rôle |
|---|---|
| **`commande_id` UK** | **Un seul avis par commande. Seul un acheteur ayant réellement payé peut noter** |
| `note` | `CHECK (1..5)` |
| `conformite_taille` | `conforme` \| `petit` \| `grand` |
| **`morphologie_autrice`** *(json)* | **FIGÉE au moment de l'avis** — sinon un changement de profil réécrirait le sens d'un avis passé *(F6.10)* |
| `contenu_id` | L'unboxing qui a produit l'avis *(R-T7)* |
| `reponse_texte` | La boutique répond **une seule fois** *(F6.9)* |

## `score_confiance` ✅
`score`, `nb_ventes_honorees`, `delai_expedition_reel_h`, `taux_annulation`,
`taux_litige`, **`decomposition`** *(json — la contribution de chaque composante,
R-T10 : un score qu'on ne peut pas expliquer est un score qu'on ne peut pas
contester)*.

---

# 15 · Modération

| Table | Rôle |
|---|---|
| **`signalement`** | Le signalement, **et son niveau d'urgence** |
| **`sanction`** | La sanction, **motivée et contestable** |
| `blocage` | Le blocage entre personnes |
| `mot_bloque_personnel` | Le filtre de mots choisi par l'autrice |
| `republication_suspectee` | Le vol de contenu |

## `signalement` ✅
`cible_type` *(`contenu` \| `commentaire` \| `utilisateur`)*, `cible_id`,
`signale_par_id`, `motif`, **`niveau`** *(`ordinaire` \| `urgence`)*, `statut`,
`affecte_a_id`, `traite_par_id`, `decision`.

> **IDX(`niveau`, `statut`, `cree_le`) met l'urgence en tête de file** *(R-X4)*.
> **Un signalement de menace traité comme le reste est un échec du produit, pas
> un retard.**

## `sanction` ✅
`type` *(`avertissement` \| `retrait` \| `restriction` \| `suspension` \|
`exclusion`)*, **`motif_texte`** *(obligatoire)*, `duree`, `applique_par_id`,
`conteste`, **`resultat_contestation`** — **instruit par une AUTRE personne que
celle qui a sanctionné**.

## `blocage` ✅ · `mot_bloque_personnel` ✅ · `republication_suspectee` ✅
`blocage` : PK(`bloqueur_id`, `bloque_id`), IDX(`bloque_id`).
`republication_suspectee` : `proximite`, IDX(`statut`, `proximite DESC`).

---

# 16 · Exploitation

> **Rôle du domaine.** Transverse : lu et écrit par tous. **Les paramètres sont
> la clé de l'apprentissage du pilote** — si chaque essai demandait un
> déploiement, aucun essai n'aurait lieu.

| Table | État | Rôle | Particularité |
|---|:---:|---|---|
| **`parametre`** | ✅ | Tous les réglages économiques *(R-O1)* | **Modifiable sans déploiement.** Bornes min/max **codées** : une durée de réservation à 0 s doit être impossible à saisir, pas seulement déconseillée |
| **`parametre_modification`** | ✅ | Historique des changements | ⚠️ **La double validation supposait deux opérateurs** *(`R-O1`)* ; il n'y en a plus *(`DP-05`)*. La table reste — **la trace de qui a changé quoi et quand n'a pas disparu avec l'humain** |
| **`journal_audit`** | ✅ | **Les décisions automatiques et les accès aux pièces d'identité** *(`R-V5`)* | **`append only`** *(D3)*. Il ne protège plus des employés de JP — il n'y en a plus — mais reste **la seule preuve de ce que la plateforme a consulté et décidé** |
| **`cle_idempotence`** | ✅ | Le rejeu sûr des écritures | **`statut = NULL` tant que la requête est en cours** — c'est ce qui distingue « rejeu terminé » de « deux requêtes simultanées ». `empreinte_requete` garde contre la même clé sur une requête **différente** |
| `evenement_usage` | ✅ | Événements d'usage bruts | Rétention 90 j, puis agrégés |
| **`agregat_quotidien`** | ✅ | **Les 4 mesures fondatrices** *(F11.7)* | Précalculé. **Disponible dès le premier direct** |
| `agregat_boutique` | ✅ | Statistiques boutique par jour et par origine | Précalculé |
| `notification` | ✅ | Toutes les notifications émises | Rétention 180 j |
| **`notification_compteur`** | ✅ | **Les plafonds** *(R-U4, R-W9)* | PK(utilisateur, émetteur, type, jour) |
| `preference_notification` | ✅ | Réglages par type | **Les critiques ne sont pas désactivables** — commande expédiée, point de remise convenu, signalement |
| `notification_sms` | ✅ | Envois SMS **et leur coût** | Une ligne de dépense à suivre |
| `reconciliation` | ✅ | Rapprochement quotidien *(R-O3)* | **Rapproche désormais les encaissements déclarés par les opérateurs et les commandes créées** — plus d'encours séquestré, de retrait, de commission ni d'espèces |
| `ecart` | ✅ | Les écarts constatés | **Résolus par écriture inverse**, jamais par correction |
| **`bareme_commission`** | ✅ | ♻️ **Rétablie** *(`DP-15`)* — taux en pour mille, **historisé** | **Une commande garde son taux** *(`R-G3`)*. Jamais d'`UPDATE` : une nouvelle version à chaque changement |
| `mise_en_avant` | ✅ | Emplacements payés | **Mention « Sponsorisé » obligatoire**, contraste imposé par le composant |
| **`abonnement_boutique`** | ✅ | **Le modèle économique** *(`DP-08`)* | `palier`, `quota_ventes`, `quota_directs`, `montant`, `debut_le`, `echeance_le`, `statut`. **Le palier gratuit reste fonctionnel** — sans lui la boutique paie avant d'avoir gagné *(`R-B3`)*. ⚠️ Montants et quotas non arrêtés *(`PO-6`)* |
| `adhesion_club` | ✅ | Adhésion acheteuse | ⚠️ **Ne doit jamais porter sur la protection** — voir la décision `D-11` du dossier de marque. **La règle est devenue plus contraignante** : la protection étant maintenant la réputation seule, un club qui la modulerait vendrait le dernier rempart |
| `lien_partage` | ✅ | Liens courts et attribution | **Canal d'acquisition principal** |
| `taux_change` | ✅ | Conversion indicative | **Jamais un taux périmé sans mention** |

---

# 17 · La dette de conception du schéma

## 17.1 — Quatre tables nommées, sans définition de colonnes

Elles sont recensées dans ce dictionnaire *(elles comptent dans les 102)*, mais
elles n'ont **jamais reçu de schéma** — ni diagramme ER, ni liste de colonnes.

| Table | Où elle est citée | Conséquence |
|---|---|---|
| **`panier_cadeau`** | Migration 27 | **Bloque `UC-80` et `UC-81`** — tout le canal diaspora |
| **`demande_verification`** | Migration 5 | **Bloque `UC-52`** — donc l'encaissement de toute boutique |
| `hashtag`, `contenu_hashtag` | Relations du domaine Contenu | Le rassemblement thématique et les événements à mot-dièse |

> ### Une fausse piste, écartée — `remise_ligne`
>
> La ligne 17 de l'ordre des migrations se lit
> `f7_26_remise_ligne | remise_ligne, promotion_id scalaire + CHECK`, ce qui
> donne à croire qu'une **table** `remise_ligne` viendrait s'ajouter à la
> colonne scalaire `promotion_id` — et rouvrirait le cumul que `D4` ferme.
>
> **Ce n'est pas le cas.** Trois sources concordent : `remise_ligne` est une
> **colonne** `int DEFAULT 0` de `ligne_commande`
> *(`JP_CDC_TECHNIQUE.md` §3.3 · `plan/EP03-commande.md` §3 ·
> `plan/EP07-communaute.md`, qui n'y ajoute qu'un `CHECK`)*. La migration porte
> le nom de la colonne qu'elle contraint.
>
> **La garantie n° 5 de la §19 tient donc sans réserve.** La mention est
> conservée ici parce que la formulation de l'ordre des migrations induit
> réellement en erreur : elle gagnerait à préciser
> `colonne remise_ligne + CHECK`.

## 17.2 — Onze tables annoncées, jamais nommées

Le total de 113 vient de la somme des compteurs par domaine de la carte
*(`JP_CONCEPTION_BDD.md` §2)*. Ces compteurs dépassent le nombre de tables
réellement schématisées :

| Domaine | Annoncé | Schématisé | Écart |
|---|---:|---:|---:|
| Fidélité | 15 | 9 | **6** |
| Contenu | 10 | 7 | **3** |
| Créatrice | 7 | 5 | **2** |
| Cadeau | 3 | 1 | **2** |
| Paiement et argent | 8 | 6 | **2** |
| Direct | 5 | 4 | **1** |
| Commande | 4 | 3 | **1** |
| Exploitation | 16 | 19 | −3 |
| Identité | 11 | 12 | −1 |
| Livraison | 10 | 11 | −1 |
| **Univers** | **absent de la carte** | 1 | **−1** |
| Catalogue · Promotions · Événements · Confiance · Modération | 24 | 24 | 0 |
| **Net** | **113** | **102** | **11** |

> La ligne **Univers** est révélatrice : la carte des domaines n'a **jamais été
> mise à jour** après la décision du 20/08/2026 qui a fait de l'univers une
> entité de premier rang *(`D9`)*. La table existe, elle est migrée et en
> production — elle ne figure dans aucun compteur.

**Aucune de ces dix n'existe dans un diagramme.** Deux lectures possibles, et il
faut choisir : soit les compteurs de la carte ont été estimés et le vrai total
est 103, soit dix tables ont été pensées puis perdues. **Dans les deux cas, la
carte des domaines doit être corrigée** — un document qui annonce un chiffre
faux perd sa valeur de référence.

## 17.3 — Ce qu'il faut faire, et quand

| Échéance | Action |
|---|---|
| **Avant la migration 5** | Écrire le schéma de `demande_verification` |
| **Avant la migration 23** | Écrire `hashtag` et `contenu_hashtag` |
| **Avant la migration 27** | Écrire `panier_cadeau` |
| **Maintenant** | Corriger les compteurs de la carte des domaines, ou retrouver les dix tables manquantes |

---

# 18 · Les machines à états

**Toute transition non listée est interdite et lève une erreur.**

### Commande
```
BROUILLON → EN_ATTENTE_PAIEMENT → PAYEE → EN_PREPARATION → EXPEDIEE → LIVREE → CONFIRMEE
                     ↓                ↓            ↓                        ↓
                 ANNULEE       EN_ATTENTE_SEUIL  REMBOURSEE            REMBOURSEE
                                     ↓                                (arbitrage)
                            EN_PREPARATION | REMBOURSEE (date limite, RB3)
```

### Réservation — *la plus sensible*
```
[*] → ACTIVE ─┬→ CONSOMMEE   (paiement confirmé)
              ├→ EXPIREE     (expire_le atteint → remise en stock + notification du suivant)
              ├→ ANNULEE     (annulation utilisateur)
              └→ ACTIVE      (suspension / reprise, R-S5)
```

### Paiement
```
INITIE → EN_ATTENTE_OPERATEUR ─┬→ CONFIRME → REMBOURSE (total ou partiel)
                               ├→ ECHOUE
                               └→ EXPIRE
```

### Colis
```
A_PREPARER → PRET → ENLEVE → EN_LIVRAISON ─┬→ REMIS
                                            ├→ AU_RELAIS ─┬→ REMIS (code de retrait)
                                            │             └→ RETOUR_VENDEUR (garde dépassée)
                                            └→ ECHEC_LIVRAISON ─┬→ EN_LIVRAISON (nouvelle tentative)
                                                                └→ RETOUR_VENDEUR
```

### Promotion · Événement
```
Promotion : BROUILLON → PROGRAMMEE → ACTIVE → TERMINEE   (| ANNULEE)
Événement : BROUILLON → ANNONCE → EN_COURS → TERMINE     (| ANNULE)
```

---

# 19 · Les dix-huit garanties que la base tient toute seule

Indépendantes du code applicatif. **Un test de recette doit les vérifier en
écrivant directement en base.**

| # | Garantie | Mécanisme |
|---|---|---|
| 1 | Pas de survente | `CHECK (quantite_reservee <= quantite_stock)` |
| 2 | Pas de réservation négative | `CHECK (quantite_reservee >= 0)` |
| 3 | Journal financier inaltérable | `REVOKE UPDATE, DELETE` |
| 4 | Journal d'audit inaltérable | `REVOKE UPDATE, DELETE` |
| 5 | Pas de cumul de remises | `promotion_id` **scalaire** |
| 6 | Pas de remise supérieure au prix | `CHECK (remise_ligne <= prix_unitaire * quantite)` |
| 7 | **Pas de signalement qui cesse de peser sans être résolu** | `CHECK compteur_coherent` *(`R-T8`)* — remplace `decision_motivee`, la décision motivée ayant disparu avec l'arbitre *(`DP-05`)* |
| 8 | Pas de contenu publié sans article | **Déclencheur de contrainte différé** |
| 9 | Pas d'unboxing sans commande source | `CHECK` sur `commande_source_id` |
| 10 | Pas de publication vidéo par un mineur | `CHECK` sur `auteur_majeur` |
| 11 | **Pas de rang client global** | **Absence** d'index et de vue inter-boutiques |
| 12 | Pas de double usage d'un code personnel | `UNIQUE(code_personnel)` + contrôle transactionnel |
| 13 | Pas de changement d'univers après coup | **Déclencheur** sur `article.univers_cle` |
| 14 | **Pas de part créatrice rétroactive** | `ligne_commande.part_createur` **figée à la commande** *(`DP-09`)* |
| 15 | Pas de cosmétique périmé vendu | Colonne générée `peremption_le` + index partiel |
| **16** | 🆕 **Pas de crédit vers un numéro non vérifié** | `paiement.msisdn_destination` **figé** depuis `boutique.msisdn_mobile_money`, jamais saisissable *(`DP-16`)* |
| **17** | 🆕 **Pas de patte secondaire sans patte pivot confirmée** | `CHECK` sur `paiement.rang` *(`R-M4`)* — une commission encaissée sur une commande inexistante serait irrattrapable |
| **18** | 🆕 **Pas de commission rétroactive** | `commande.taux_commission_pour_mille` et `mode_remuneration` **figés à la création** *(`R-G3`, `R-B5`)* |

> **La n° 11 est la seule garantie « par absence », et c'est la plus fragile.**
> Elle demande d'être **documentée dans la migration**, sinon quelqu'un ajoutera
> l'index « pour optimiser ».

---

# 20 · État d'avancement

**7 modèles sont migrés** *(4 migrations appliquées : `socle`, `plateforme`,
`langues`, `univers`)* : `utilisateur`, `session`, `parametre`,
`parametre_modification`, `journal_audit`, `cle_idempotence`, `univers`.

**95 restent à migrer**, dans l'ordre des dépendances de clés étrangères
*(`JP_CONCEPTION_BDD.md` §12)*.

> ⚠️ **Un écart à trancher.** `prisma/schema.prisma` déclare
> `enum Langue { en, fr }`, alors que l'exigence **`N4.1` impose le malgache et
> le français**. **L'anglais n'a aucun destinataire à Madagascar** — 83,6 % de
> la population ne parle que malgache, 0,57 % uniquement français. Voir la
> décision `D-04` du dossier de marque.

---

*Suite : [`JP_ACTEURS_WORKFLOWS.md`](JP_ACTEURS_WORKFLOWS.md) — qui fait quoi, et
le déroulé de chaque parcours.*
